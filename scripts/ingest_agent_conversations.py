#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ingest Agent Conversations to Knowledge Lake

Parses Claude and Fred conversation JSON files, classifies complexity,
runs multi-pass extraction on complex conversations, and ingests to Knowledge Lake.
"""

import os
import sys
import io
import json
import argparse
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import requests
import subprocess

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Knowledge Lake API configuration
KNOWLEDGE_LAKE_API = "https://knowledge-lake-api-production.up.railway.app"

# File paths
CLAUDE_CONVERSATIONS = Path("agent-conversations/claude/conversations.json")
CLAUDE_MEMORIES = Path("agent-conversations/claude/memories.json")
CLAUDE_PROJECTS = Path("agent-conversations/claude/projects.json")
FRED_CONVERSATIONS = Path("agent-conversations/fred/fredconversations.json")


class AgentConversationIngester:
    """Ingest agent conversations with multi-pass extraction"""

    def __init__(self, api_url: str = KNOWLEDGE_LAKE_API):
        self.api_url = api_url

    def parse_claude_conversation(self, conv: Dict) -> Dict:
        """Parse a Claude conversation object into standardized format"""
        # Extract messages
        messages = []
        for msg in conv.get('chat_messages', []):
            role = 'user' if msg.get('sender') == 'human' else 'assistant'
            text = msg.get('text', '')

            # Also extract content from content array if available
            if msg.get('content'):
                for content_block in msg['content']:
                    if content_block.get('type') == 'text' and content_block.get('text'):
                        text = content_block['text']
                        break

            messages.append({'role': role, 'content': text})

        # Build conversation text
        conversation_text = f"# {conv.get('name', 'Untitled')}\n\n"
        conversation_text += f"**Summary:** {conv.get('summary', '')}\n\n"
        conversation_text += "---\n\n"

        for msg in messages:
            role_label = "User" if msg['role'] == 'user' else "Claude"
            conversation_text += f"**{role_label}:** {msg['content']}\n\n"

        return {
            'topic': conv.get('name', 'Untitled'),
            'content': conversation_text,
            'date': conv.get('created_at', datetime.now().isoformat()).split('T')[0],
            'metadata': {
                'agent': 'Claude GUI',
                'uuid': conv.get('uuid'),
                'created_at': conv.get('created_at'),
                'updated_at': conv.get('updated_at'),
                'businessArea': 'AAE Development',
                'processingAgent': 'Claude Code'
            },
            'word_count': len(conversation_text.split())
        }

    def parse_fred_conversation(self, conv: Dict) -> Dict:
        """Parse a Fred conversation object into standardized format"""
        # Fred conversations have a different structure
        messages = []

        # Check if it's the standard ChatGPT export format
        if 'mapping' in conv:
            # ChatGPT export format with mapping
            for msg_id, msg_data in conv.get('mapping', {}).items():
                if not msg_data or 'message' not in msg_data:
                    continue

                message = msg_data['message']
                if not message or 'content' not in message:
                    continue

                role = message.get('author', {}).get('role', 'unknown')
                content_parts = message.get('content', {}).get('parts', [])

                if content_parts and isinstance(content_parts, list):
                    content = '\n'.join(str(part) for part in content_parts if part)
                    if content:
                        messages.append({'role': role, 'content': content})
        else:
            # Fallback format
            for msg in conv.get('messages', []):
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                if content:
                    messages.append({'role': role, 'content': content})

        # Build conversation text
        title = conv.get('title', 'Untitled Fred Conversation')
        conversation_text = f"# {title}\n\n"

        if conv.get('create_time'):
            date_str = datetime.fromtimestamp(conv['create_time']).strftime('%Y-%m-%d')
            conversation_text += f"**Date:** {date_str}\n\n"

        conversation_text += "---\n\n"

        for msg in messages:
            role_label = msg['role'].title()
            conversation_text += f"**{role_label}:** {msg['content']}\n\n"

        return {
            'topic': title,
            'content': conversation_text,
            'date': datetime.fromtimestamp(conv.get('create_time', 0)).strftime('%Y-%m-%d') if conv.get('create_time') else datetime.now().strftime('%Y-%m-%d'),
            'metadata': {
                'agent': 'Fred (ChatGPT)',
                'conversation_id': conv.get('id'),
                'create_time': conv.get('create_time'),
                'update_time': conv.get('update_time'),
                'businessArea': 'AAE Development',
                'processingAgent': 'Claude Code'
            },
            'word_count': len(conversation_text.split())
        }

    def classify_conversation(self, conversation: Dict) -> Dict:
        """Classify conversation complexity"""
        word_count = conversation['word_count']

        # Simple heuristic - can be improved
        if word_count >= 5000:
            return {
                'classification': 'complex',
                'requires_multipass': True,
                'complexity_score': min(100, (word_count / 100))
            }
        elif word_count >= 2000:
            return {
                'classification': 'complex',
                'requires_multipass': True,
                'complexity_score': min(100, (word_count / 150))
            }
        else:
            return {
                'classification': 'simple',
                'requires_multipass': False,
                'complexity_score': (word_count / 200)
            }

    def run_multipass_extraction(self, conversation: Dict, output_dir: Path) -> Optional[Dict]:
        """Run multi-pass extraction on a conversation"""
        print(f"\n  🔄 Running multi-pass extraction on: {conversation['topic'][:60]}")

        # Create temp file for conversation
        temp_file = output_dir / f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(conversation['content'])

        # Run multipass extraction
        output_file = output_dir / f"{conversation['date']}_{conversation['topic'][:50].replace(' ', '_')}_extraction.md"

        try:
            result = subprocess.run([
                'python', 'scripts/multipass_extract.py',
                str(temp_file),
                '--output', str(output_file)
            ], capture_output=True, text=True, timeout=300)

            if result.returncode == 0:
                print(f"  ✅ Extraction complete: {output_file.name}")

                # Read extraction results
                json_file = output_file.with_suffix('.json')
                if json_file.exists():
                    with open(json_file, 'r', encoding='utf-8') as f:
                        extraction_data = json.load(f)

                    return {
                        'thread_count': len(extraction_data.get('threads', [])),
                        'connection_count': len(extraction_data.get('connections', [])),
                        'learning_count': len(extraction_data.get('learnings', [])),
                        'insight_count': len(extraction_data.get('cross_thread_insights', []))
                    }
            else:
                print(f"  ⚠️  Extraction failed: {result.stderr[:200]}")
        except subprocess.TimeoutExpired:
            print(f"  ⚠️  Extraction timed out (5 min limit)")
        except Exception as e:
            print(f"  ⚠️  Extraction error: {e}")
        finally:
            # Clean up temp file
            if temp_file.exists():
                temp_file.unlink()

        return None

    def ingest_to_knowledge_lake(self, conversation: Dict, classification: Dict, max_retries: int = 5) -> bool:
        """Ingest conversation to Knowledge Lake API with retry logic"""
        # Prepare metadata with classification
        metadata = conversation['metadata'].copy()
        metadata.update({
            'complexity_classification': classification['classification'],
            'complexity_score': classification['complexity_score'],
            'requires_multipass': classification['requires_multipass'],
            'word_count': conversation['word_count']
        })

        payload = {
            'userId': 1,
            'agent': conversation['metadata'].get('agent', 'Unknown'),
            'date': conversation['date'],
            'topic': conversation['topic'],
            'content': conversation['content'],
            'entities': [],
            'relationships': [],
            'metadata': metadata
        }

        # Retry loop with exponential backoff
        for attempt in range(max_retries):
            try:
                # Add rate limiting delay (increasing with retries)
                if attempt > 0:
                    delay = min(3 ** attempt, 30)  # Exponential backoff: 3s, 9s, 27s, 30s...
                    print(f"  ⏳ Retry {attempt}/{max_retries} after {delay}s delay...")
                    time.sleep(delay)
                else:
                    # Small delay on first attempt to avoid overwhelming API
                    time.sleep(0.3)

                response = requests.post(
                    f"{self.api_url}/api/conversations/ingest",
                    json=payload,
                    timeout=60  # Increased timeout for retries
                )
                response.raise_for_status()

                print(f"  ✅ Ingested to Knowledge Lake: {conversation['topic'][:60]}")
                return True

            except requests.exceptions.HTTPError as e:
                error_detail = e.response.text if hasattr(e, 'response') else str(e)

                # Check if it's a retryable error (500 server errors)
                is_retryable = e.response.status_code >= 500 if hasattr(e, 'response') else False

                if is_retryable and attempt < max_retries - 1:
                    print(f"  ⚠️  Server error (attempt {attempt + 1}/{max_retries}): {error_detail[:100]}")
                    continue  # Retry
                else:
                    print(f"  ❌ Ingestion failed after {attempt + 1} attempts: {e}")
                    print(f"     API Response: {error_detail[:200]}")
                    return False

            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    print(f"  ⚠️  Timeout (attempt {attempt + 1}/{max_retries})")
                    continue  # Retry
                else:
                    print(f"  ❌ Ingestion failed: Timeout after {max_retries} attempts")
                    return False

            except Exception as e:
                print(f"  ❌ Ingestion failed: {e}")
                return False

        return False

    def process_file(self, file_path: Path, parser_func, agent_name: str, dry_run: bool = False) -> Dict:
        """Process a conversation file"""
        print(f"\n{'='*80}")
        print(f"Processing: {file_path.name} ({agent_name})")
        print(f"{'='*80}")

        if not file_path.exists():
            print(f"⚠️  File not found: {file_path}")
            return {'total': 0, 'ingested': 0, 'extracted': 0, 'failed': 0}

        # Load file
        print(f"📂 Loading {file_path.name}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            conversations = json.load(f)

        if not isinstance(conversations, list):
            conversations = [conversations]

        print(f"✅ Loaded {len(conversations)} conversations")

        stats = {'total': len(conversations), 'ingested': 0, 'extracted': 0, 'failed': 0, 'skipped': 0}

        # Create output directory for extractions
        extraction_dir = Path('extractions/agent-conversations')
        extraction_dir.mkdir(parents=True, exist_ok=True)

        for i, conv in enumerate(conversations, 1):
            print(f"\n[{i}/{len(conversations)}] Processing conversation...")

            # Parse conversation
            try:
                parsed = parser_func(conv)
            except Exception as e:
                print(f"  ❌ Parse error: {e}")
                stats['failed'] += 1
                continue

            print(f"  📝 Topic: {parsed['topic'][:60]}")
            print(f"  📊 Word count: {parsed['word_count']:,}")

            # Classify
            classification = self.classify_conversation(parsed)
            print(f"  🏷️  Classification: {classification['classification']} (score: {classification['complexity_score']:.1f})")

            if dry_run:
                print(f"  🏃 [DRY RUN] Would ingest to Knowledge Lake")
                if classification['requires_multipass']:
                    print(f"  🏃 [DRY RUN] Would run multi-pass extraction")
                stats['skipped'] += 1
                continue

            # Ingest to Knowledge Lake
            success = self.ingest_to_knowledge_lake(parsed, classification)
            if success:
                stats['ingested'] += 1
            else:
                stats['failed'] += 1
                continue

            # Run multi-pass extraction if needed
            if classification['requires_multipass']:
                extraction_results = self.run_multipass_extraction(parsed, extraction_dir)
                if extraction_results:
                    stats['extracted'] += 1

        return stats

    def process_all(self, dry_run: bool = False):
        """Process all agent conversation files"""
        print("\n" + "="*80)
        print("AGENT CONVERSATIONS INGESTION")
        print("="*80)
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE INGESTION'}")
        print("="*80)

        all_stats = {}

        # Process Claude conversations
        if CLAUDE_CONVERSATIONS.exists():
            all_stats['claude_conversations'] = self.process_file(
                CLAUDE_CONVERSATIONS,
                self.parse_claude_conversation,
                'Claude GUI',
                dry_run
            )

        # Process Fred conversations
        if FRED_CONVERSATIONS.exists():
            all_stats['fred_conversations'] = self.process_file(
                FRED_CONVERSATIONS,
                self.parse_fred_conversation,
                'Fred (ChatGPT)',
                dry_run
            )

        # Print summary
        print("\n" + "="*80)
        print("INGESTION SUMMARY")
        print("="*80)

        for file_name, stats in all_stats.items():
            print(f"\n{file_name}:")
            print(f"  Total conversations: {stats['total']}")
            print(f"  Ingested: {stats['ingested']}")
            print(f"  Multi-pass extracted: {stats['extracted']}")
            print(f"  Failed: {stats['failed']}")
            print(f"  Skipped (dry run): {stats['skipped']}")

        total_ingested = sum(s['ingested'] for s in all_stats.values())
        total_extracted = sum(s['extracted'] for s in all_stats.values())

        print(f"\n{'='*80}")
        print(f"Total ingested: {total_ingested}")
        print(f"Total multi-pass extracted: {total_extracted}")
        print(f"{'='*80}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Ingest agent conversations to Knowledge Lake with multi-pass extraction'
    )
    parser.add_argument('--dry-run', action='store_true', help='Preview without ingesting')
    parser.add_argument('--limit', type=int, help='Limit number of conversations to process per file')

    args = parser.parse_args()

    try:
        ingester = AgentConversationIngester()
        ingester.process_all(dry_run=args.dry_run)

        return 0

    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

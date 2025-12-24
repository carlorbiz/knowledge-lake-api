#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch Conversation Ingestion Tool
Scans directories for existing conversations and ingests them to Knowledge Lake
"""

import os
import sys
import json
import asyncio
import io
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import re

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add Knowledge Lake MCP to path
sys.path.insert(0, str(Path(__file__).parent.parent / "agent-conversations" / "claude" / "claude-knowledge-lake-mcp" / "claude-knowledge-lake-mcp"))

from knowledge_lake import KnowledgeLakeClient
from classify_conversation import classify_conversation


class ConversationFile:
    """Represents a conversation file to be ingested"""

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content: str = ""
        self.topic: str = ""
        self.date: str = ""
        self.agent: str = "claude_code"
        self.metadata: Dict = {}

    def read(self) -> bool:
        """Read and parse the conversation file"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.content = f.read()

            # Extract metadata from filename
            filename = self.file_path.stem

            # Try to extract date from filename (YYYY-MM-DD format)
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
            if date_match:
                self.date = date_match.group(1)
            else:
                # Use file modification time
                mtime = os.path.getmtime(self.file_path)
                self.date = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')

            # Extract topic from filename or first heading
            self.topic = self._extract_topic()

            # Determine agent from content or path
            self.agent = self._determine_agent()

            return True

        except Exception as e:
            print(f"  ❌ Error reading {self.file_path.name}: {e}")
            return False

    def _extract_topic(self) -> str:
        """Extract conversation topic from filename or content"""
        # First try filename (without date)
        filename = self.file_path.stem
        # Remove date pattern
        topic = re.sub(r'\d{4}-\d{2}-\d{2}[-_]?', '', filename)
        # Clean up
        topic = topic.replace('-', ' ').replace('_', ' ').strip()

        if topic and len(topic) > 3:
            return topic.title()

        # Try to find first heading in content
        lines = self.content.split('\n')
        for line in lines[:20]:
            line = line.strip()
            if line.startswith('#'):
                heading = line.lstrip('#').strip()
                if len(heading) > 3:
                    return heading

        # Fallback: use first substantive line
        for line in lines[:10]:
            line = line.strip()
            if len(line.split()) >= 3 and not line.startswith(('```', '---', '===')):
                return line[:80]

        return "Conversation from " + self.date

    def _determine_agent(self) -> str:
        """Determine which agent this conversation is from"""
        path_str = str(self.file_path).lower()
        content_lower = self.content[:500].lower()

        # Check path
        if 'claude-code' in path_str or '/cc/' in path_str:
            return "claude_code"
        elif 'claude-gui' in path_str or 'claude_gui' in path_str:
            return "claude_gui"
        elif 'fred' in path_str:
            return "fred"
        elif 'jan' in path_str or 'genspark' in path_str:
            return "jan"
        elif 'manus' in path_str:
            return "manus"

        # Check content
        if 'claude code' in content_lower or 'cc:' in content_lower:
            return "claude_code"
        elif 'fred:' in content_lower:
            return "fred"

        # Default to claude_code (most common)
        return "claude_code"


class BatchIngester:
    """Batch ingest conversations to Knowledge Lake"""

    def __init__(self):
        self.client = KnowledgeLakeClient()
        self.stats = {
            'scanned': 0,
            'skipped': 0,
            'ingested': 0,
            'failed': 0,
            'complex': 0,
            'simple': 0
        }

    def scan_directory(self, directory: Path, pattern: str = "*.md") -> List[ConversationFile]:
        """Scan directory for conversation files"""
        print(f"\n📂 Scanning: {directory}")
        print(f"   Pattern: {pattern}")

        files = []
        for file_path in directory.rglob(pattern):
            # Skip certain directories
            skip_dirs = ['.git', 'node_modules', '__pycache__', 'venv', '.venv', 'archive']
            if any(skip_dir in file_path.parts for skip_dir in skip_dirs):
                continue

            # Skip certain files
            skip_files = ['README.md', 'CHANGELOG.md', 'LICENSE.md', 'CLAUDE.md']
            if file_path.name in skip_files:
                continue

            files.append(ConversationFile(file_path))
            self.stats['scanned'] += 1

        print(f"   Found: {len(files)} conversation files")
        return files

    async def check_already_ingested(self, topic: str, date: str) -> bool:
        """Check if conversation is already in Knowledge Lake"""
        try:
            # Query for exact topic match
            results = await self.client.query_conversations(
                query=topic,
                limit=5
            )

            # Check if any result matches topic and date
            for result in results:
                if result.get('topic') == topic and result.get('date') == date:
                    return True

            return False

        except Exception as e:
            print(f"  ⚠️  Could not check for duplicates: {e}")
            return False

    async def ingest_conversation(self, conv: ConversationFile,
                                  skip_duplicates: bool = True,
                                  classify: bool = True) -> bool:
        """Ingest a single conversation"""

        # Check for duplicates
        if skip_duplicates:
            already_exists = await self.check_already_ingested(conv.topic, conv.date)
            if already_exists:
                print(f"  ⏭️  Skipped: {conv.topic} (already in Knowledge Lake)")
                self.stats['skipped'] += 1
                return False

        try:
            # Classify conversation
            classification_result = None
            if classify:
                classification_result = classify_conversation(conv.content)
                conv.metadata['complexity_classification'] = classification_result.classification
                conv.metadata['complexity_score'] = classification_result.complexity_score
                conv.metadata['requires_multipass'] = (classification_result.classification == 'complex')
                conv.metadata['word_count'] = classification_result.word_count
                conv.metadata['topic_shift_count'] = classification_result.topic_shift_count

                if classification_result.classification == 'complex':
                    self.stats['complex'] += 1
                else:
                    self.stats['simple'] += 1

            # Add metadata
            conv.metadata['agent'] = conv.agent
            conv.metadata['source'] = 'batch_import'
            conv.metadata['imported_at'] = datetime.now().isoformat()

            # Ingest to Knowledge Lake
            result = await self.client.ingest_conversation(
                topic=conv.topic,
                content=conv.content,
                conversation_date=conv.date,
                entities=[],
                relationships=[],
                metadata=conv.metadata
            )

            # Success
            status = "🟢 COMPLEX" if conv.metadata.get('requires_multipass') else "🔵 SIMPLE"
            print(f"  {status} {conv.topic[:60]}... ({conv.metadata.get('word_count', 0):,} words)")
            self.stats['ingested'] += 1
            return True

        except Exception as e:
            print(f"  ❌ Failed: {conv.topic} - {e}")
            self.stats['failed'] += 1
            return False

    async def batch_ingest(self, conversations: List[ConversationFile],
                           skip_duplicates: bool = True,
                           classify: bool = True) -> Dict:
        """Ingest multiple conversations"""

        print("\n" + "=" * 80)
        print("BATCH CONVERSATION INGESTION")
        print("=" * 80)
        print(f"Conversations to process: {len(conversations)}")
        print(f"Skip duplicates: {skip_duplicates}")
        print(f"Classify conversations: {classify}")
        print()

        for i, conv in enumerate(conversations, 1):
            print(f"\n[{i}/{len(conversations)}] Processing: {conv.file_path.name}")

            # Read conversation
            if not conv.read():
                self.stats['failed'] += 1
                continue

            # Ingest
            await self.ingest_conversation(conv, skip_duplicates, classify)

        return self.stats

    def print_summary(self):
        """Print ingestion summary"""
        print("\n" + "=" * 80)
        print("INGESTION SUMMARY")
        print("=" * 80)
        print(f"Files scanned:     {self.stats['scanned']}")
        print(f"Already ingested:  {self.stats['skipped']}")
        print(f"Successfully added: {self.stats['ingested']}")
        print(f"  - Simple:        {self.stats['simple']}")
        print(f"  - Complex:       {self.stats['complex']} (flagged for multi-pass)")
        print(f"Failed:            {self.stats['failed']}")
        print()

        if self.stats['complex'] > 0:
            print(f"⚠️  {self.stats['complex']} complex conversations detected")
            print("   These should be processed with multi-pass extraction tool:")
            print("   python scripts/multipass_extract.py <conversation.md>")

        print("\n" + "=" * 80)


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Batch ingest conversations to Knowledge Lake')
    parser.add_argument('directories', nargs='+', help='Directories to scan for conversations')
    parser.add_argument('--pattern', default='*.md', help='File pattern to match (default: *.md)')
    parser.add_argument('--no-skip-duplicates', action='store_true',
                       help='Ingest even if conversation already exists')
    parser.add_argument('--no-classify', action='store_true',
                       help='Skip classification (faster but no multi-pass detection)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Scan and show what would be ingested, but don\'t actually ingest')
    parser.add_argument('--yes', '-y', action='store_true',
                       help='Skip confirmation prompt and proceed with ingestion')

    args = parser.parse_args()

    # Initialize ingester
    ingester = BatchIngester()

    # Scan directories
    all_conversations = []
    for directory in args.directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            print(f"❌ Directory not found: {directory}")
            continue

        conversations = ingester.scan_directory(dir_path, args.pattern)
        all_conversations.extend(conversations)

    if not all_conversations:
        print("\n❌ No conversations found")
        return

    print(f"\n📊 Total conversations found: {len(all_conversations)}")

    if args.dry_run:
        print("\n🔍 DRY RUN MODE - Showing what would be ingested:")
        for i, conv in enumerate(all_conversations[:10], 1):
            if conv.read():
                print(f"{i}. {conv.file_path.name}")
                print(f"   Topic: {conv.topic}")
                print(f"   Date: {conv.date}")
                print(f"   Agent: {conv.agent}")

        if len(all_conversations) > 10:
            print(f"\n... and {len(all_conversations) - 10} more")

        print("\nTo actually ingest, run without --dry-run flag")
        return

    # Confirm before ingesting
    if not args.yes:
        print("\n⚠️  This will ingest conversations to Knowledge Lake.")
        confirm = input("Continue? (yes/no): ").strip().lower()

        if confirm not in ['yes', 'y']:
            print("Cancelled")
            return
    else:
        print("\n✓ Auto-confirmed (--yes flag)")
        print("Starting ingestion...")

    # Batch ingest
    await ingester.batch_ingest(
        all_conversations,
        skip_duplicates=not args.no_skip_duplicates,
        classify=not args.no_classify
    )

    # Print summary
    ingester.print_summary()


if __name__ == "__main__":
    asyncio.run(main())

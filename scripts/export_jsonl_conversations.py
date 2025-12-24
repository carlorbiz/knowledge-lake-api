#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSONL Conversation Exporter
Parses Claude Code's local JSONL conversation files and exports to markdown
"""

import os
import sys
import json
import io
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import argparse

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class ConversationExporter:
    """Export JSONL conversations to markdown"""

    def __init__(self, jsonl_dir: Path, output_dir: Path):
        self.jsonl_dir = jsonl_dir
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_jsonl_file(self, jsonl_path: Path) -> Optional[Dict]:
        """Parse a JSONL conversation file"""
        try:
            conversation = {
                'session_id': jsonl_path.stem,
                'summary': '',
                'messages': [],
                'start_time': None,
                'end_time': None,
                'git_branch': '',
                'word_count': 0
            }

            with open(jsonl_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        entry = json.loads(line.strip())
                        entry_type = entry.get('type')

                        # Extract summary
                        if entry_type == 'summary':
                            if not conversation['summary']:
                                conversation['summary'] = entry.get('summary', '')

                        # Extract user messages
                        elif entry_type == 'user':
                            msg = entry.get('message', {})
                            content = msg.get('content', '')

                            # Handle string content or list of content blocks
                            if isinstance(content, str):
                                text = content
                            elif isinstance(content, list):
                                # Extract text from content blocks (skip tool results)
                                text_parts = []
                                for block in content:
                                    if isinstance(block, dict) and block.get('type') == 'text':
                                        text_parts.append(block.get('text', ''))
                                text = '\n'.join(text_parts)
                            else:
                                continue

                            if text.strip():
                                conversation['messages'].append({
                                    'role': 'user',
                                    'content': text,
                                    'timestamp': entry.get('timestamp')
                                })
                                conversation['word_count'] += len(text.split())

                        # Extract assistant messages
                        elif entry_type == 'assistant':
                            msg = entry.get('message', {})
                            content = msg.get('content', [])

                            # Extract text blocks (skip tool uses)
                            text_parts = []
                            if isinstance(content, list):
                                for block in content:
                                    if isinstance(block, dict) and block.get('type') == 'text':
                                        text_parts.append(block.get('text', ''))

                            text = '\n'.join(text_parts)
                            if text.strip():
                                conversation['messages'].append({
                                    'role': 'assistant',
                                    'content': text,
                                    'timestamp': entry.get('timestamp')
                                })
                                conversation['word_count'] += len(text.split())

                        # Extract metadata
                        if 'timestamp' in entry and conversation['messages']:
                            ts = entry['timestamp']
                            if not conversation['start_time']:
                                conversation['start_time'] = ts
                            conversation['end_time'] = ts

                        if 'gitBranch' in entry:
                            conversation['git_branch'] = entry['gitBranch']

                    except json.JSONDecodeError as e:
                        print(f"  ⚠️  Line {line_num}: JSON decode error - {e}")
                        continue

            # Skip empty conversations
            if not conversation['messages']:
                return None

            return conversation

        except Exception as e:
            print(f"  ❌ Error parsing {jsonl_path.name}: {e}")
            return None

    def conversation_to_markdown(self, conv: Dict) -> str:
        """Convert conversation dict to markdown"""
        md_lines = []

        # Header
        md_lines.append(f"# {conv['summary'] or 'Conversation ' + conv['session_id']}")
        md_lines.append("")

        # Metadata
        md_lines.append("## Metadata")
        md_lines.append("")
        md_lines.append(f"- **Session ID:** {conv['session_id']}")
        md_lines.append(f"- **Summary:** {conv['summary']}")

        if conv['start_time']:
            start_date = conv['start_time'][:10]
            md_lines.append(f"- **Date:** {start_date}")

        md_lines.append(f"- **Git Branch:** {conv['git_branch'] or 'N/A'}")
        md_lines.append(f"- **Word Count:** {conv['word_count']:,}")
        md_lines.append(f"- **Messages:** {len(conv['messages'])}")
        md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

        # Conversation
        md_lines.append("## Conversation")
        md_lines.append("")

        for msg in conv['messages']:
            role = msg['role'].upper()
            content = msg['content']

            md_lines.append(f"### {role}")
            md_lines.append("")
            md_lines.append(content)
            md_lines.append("")

        return '\n'.join(md_lines)

    def export_conversation(self, jsonl_path: Path) -> Optional[Path]:
        """Export a single JSONL conversation to markdown"""

        # Parse JSONL
        conv = self.parse_jsonl_file(jsonl_path)
        if not conv:
            return None

        # Generate filename
        date_prefix = conv['start_time'][:10] if conv['start_time'] else 'unknown'
        summary_slug = conv['summary'][:40].replace(' ', '-').lower() if conv['summary'] else 'conversation'
        summary_slug = ''.join(c for c in summary_slug if c.isalnum() or c == '-')

        output_filename = f"{date_prefix}-{summary_slug}-{conv['session_id'][:8]}.md"
        output_path = self.output_dir / output_filename

        # Convert to markdown
        markdown = self.conversation_to_markdown(conv)

        # Write file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown)

        return output_path

    def export_all(self, min_words: int = 100, skip_empty: bool = True) -> Dict:
        """Export all JSONL conversations"""

        stats = {
            'scanned': 0,
            'exported': 0,
            'skipped': 0,
            'failed': 0
        }

        print("\n" + "=" * 80)
        print("JSONL CONVERSATION EXPORT")
        print("=" * 80)
        print(f"Source: {self.jsonl_dir}")
        print(f"Output: {self.output_dir}")
        print(f"Min words: {min_words}")
        print()

        # Find all JSONL files (exclude agent files)
        jsonl_files = sorted(
            [f for f in self.jsonl_dir.glob("*.jsonl")
             if not f.name.startswith('agent-') and f.stat().st_size > 0]
        )

        stats['scanned'] = len(jsonl_files)
        print(f"Found {len(jsonl_files)} non-empty JSONL files (excluding agent files)")
        print()

        for i, jsonl_path in enumerate(jsonl_files, 1):
            print(f"[{i}/{len(jsonl_files)}] Processing: {jsonl_path.name}")

            # Parse conversation
            conv = self.parse_jsonl_file(jsonl_path)

            if not conv:
                print(f"  ⏭️  Skipped: Empty or invalid")
                stats['skipped'] += 1
                continue

            # Check word count threshold
            if conv['word_count'] < min_words:
                print(f"  ⏭️  Skipped: Too short ({conv['word_count']} words < {min_words} min)")
                stats['skipped'] += 1
                continue

            # Export to markdown
            try:
                output_path = self.export_conversation(jsonl_path)
                if output_path:
                    print(f"  ✅ Exported: {output_path.name} ({conv['word_count']:,} words)")
                    stats['exported'] += 1
                else:
                    stats['skipped'] += 1

            except Exception as e:
                print(f"  ❌ Failed: {e}")
                stats['failed'] += 1

        return stats

    def print_summary(self, stats: Dict):
        """Print export summary"""
        print("\n" + "=" * 80)
        print("EXPORT SUMMARY")
        print("=" * 80)
        print(f"Files scanned:     {stats['scanned']}")
        print(f"Exported:          {stats['exported']}")
        print(f"Skipped:           {stats['skipped']}")
        print(f"Failed:            {stats['failed']}")
        print()
        print(f"📂 Output directory: {self.output_dir}")
        print("\n" + "=" * 80)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Export Claude Code JSONL conversations to markdown'
    )
    parser.add_argument(
        '--jsonl-dir',
        type=Path,
        default=Path.home() / '.claude' / 'projects' / 'C--Users-carlo-Development-mem0-sync-mem0',
        help='Directory containing JSONL conversation files'
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path('conversations/exports/jsonl-exports'),
        help='Output directory for markdown files'
    )
    parser.add_argument(
        '--min-words',
        type=int,
        default=100,
        help='Minimum word count to export (default: 100)'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Export all conversations including very short ones'
    )

    args = parser.parse_args()

    # Validate input directory
    if not args.jsonl_dir.exists():
        print(f"❌ Directory not found: {args.jsonl_dir}")
        return 1

    # Create exporter
    exporter = ConversationExporter(args.jsonl_dir, args.output_dir)

    # Export all conversations
    min_words = 0 if args.all else args.min_words
    stats = exporter.export_all(min_words=min_words)

    # Print summary
    exporter.print_summary(stats)

    # Next steps
    if stats['exported'] > 0:
        print("\nNext Steps:")
        print(f"1. Review exported conversations in: {args.output_dir}")
        print(f"2. Batch ingest to Knowledge Lake:")
        print(f"   python scripts/batch_ingest_conversations.py {args.output_dir} --yes")
        print()


if __name__ == "__main__":
    sys.exit(main())

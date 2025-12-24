#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion Multi-Pass Queue Manager

Manages the Notion Multi-Pass Extraction Queue database:
- Populates queue with complex conversations from Knowledge Lake
- Updates extraction status
- Syncs bidirectionally with Knowledge Lake API
"""

import os
import sys
import io
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import requests

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Knowledge Lake API configuration
KNOWLEDGE_LAKE_API = "https://knowledge-lake-api-production.up.railway.app"

# Notion API configuration
NOTION_API_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1"

# Environment variables for configuration
NOTION_API_TOKEN = os.getenv("NOTION_API_TOKEN")
MULTIPASS_QUEUE_DB_ID = os.getenv("MULTIPASS_QUEUE_DB_ID")


class NotionQueueManager:
    """Manage Notion Multi-Pass Extraction Queue"""

    def __init__(self, notion_token: str = None, database_id: str = None):
        self.notion_token = notion_token or NOTION_API_TOKEN
        self.database_id = database_id or MULTIPASS_QUEUE_DB_ID

        if not self.notion_token:
            raise ValueError("NOTION_API_TOKEN environment variable not set")
        if not self.database_id:
            raise ValueError("MULTIPASS_QUEUE_DB_ID environment variable not set")

        self.notion_headers = {
            "Authorization": f"Bearer {self.notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_API_VERSION
        }

    def fetch_complex_conversations(self) -> List[Dict]:
        """Fetch complex conversations from Knowledge Lake API"""
        print("\n🔍 Fetching complex conversations from Knowledge Lake...")

        try:
            response = requests.post(
                f"{KNOWLEDGE_LAKE_API}/api/query",
                json={
                    "userId": 1,
                    "query": "",  # Empty query returns all
                    "limit": 200
                },
                timeout=30
            )
            response.raise_for_status()

            conversations = response.json().get('results', [])

            # Filter for complex conversations not yet extracted
            complex_pending = [
                conv for conv in conversations
                if conv.get('complexity_classification') == 'complex'
                and conv.get('requires_multipass') is True
                and conv.get('multipass_extracted') is False
            ]

            print(f"✅ Found {len(conversations)} total conversations")
            print(f"🔵 {len(complex_pending)} complex conversations pending extraction")

            return complex_pending

        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching from Knowledge Lake: {e}")
            return []

    def calculate_priority(self, complexity_score: float) -> str:
        """Calculate priority based on complexity score"""
        if complexity_score >= 80:
            return "High"
        elif complexity_score >= 60:
            return "Medium"
        else:
            return "Low"

    def create_notion_page(self, conversation: Dict) -> Optional[str]:
        """Create a Notion page in the Multi-Pass Queue database"""
        try:
            # Build page properties
            properties = {
                "Conversation Topic": {
                    "title": [{"text": {"content": conversation.get('topic', 'Untitled')[:2000]}}]
                },
                "Conversation ID": {
                    "number": conversation.get('id')
                },
                "Date": {
                    "date": {"start": conversation.get('date', datetime.now().strftime('%Y-%m-%d'))}
                },
                "Classification": {
                    "select": {"name": "Complex"}
                },
                "Complexity Score": {
                    "number": conversation.get('complexity_score', 0)
                },
                "Word Count": {
                    "number": conversation.get('word_count', 0)
                },
                "Status": {
                    "select": {"name": "Pending"}
                },
                "Priority": {
                    "select": {"name": self.calculate_priority(conversation.get('complexity_score', 0))}
                },
                "Assigned Agent": {
                    "select": {"name": "Auto"}
                },
                "Extracted": {
                    "checkbox": False
                }
            }

            # Add optional properties if available
            if conversation.get('topic_shift_count') is not None:
                properties["Topic Shift Count"] = {"number": conversation['topic_shift_count']}

            if conversation.get('breakthrough_moment_count') is not None:
                properties["Breakthrough Moments"] = {"number": conversation['breakthrough_moment_count']}

            # Create page
            response = requests.post(
                f"{NOTION_BASE_URL}/pages",
                headers=self.notion_headers,
                json={
                    "parent": {"database_id": self.database_id},
                    "properties": properties
                },
                timeout=30
            )
            response.raise_for_status()

            page_data = response.json()
            page_id = page_data.get('id')

            print(f"  ✅ Created: {conversation.get('topic', 'Untitled')[:60]}")
            return page_id

        except requests.exceptions.RequestException as e:
            print(f"  ❌ Error creating page: {e}")
            if hasattr(e.response, 'text'):
                print(f"     Response: {e.response.text}")
            return None

    def populate_queue(self, dry_run: bool = False) -> Dict:
        """Populate Notion queue with complex conversations"""
        print("\n" + "=" * 80)
        print("NOTION MULTI-PASS QUEUE POPULATION")
        print("=" * 80)

        # Fetch complex conversations
        conversations = self.fetch_complex_conversations()

        if not conversations:
            print("\n⚠️  No complex conversations found to add to queue")
            return {"total": 0, "created": 0, "skipped": 0, "failed": 0}

        print(f"\n📋 Found {len(conversations)} conversations to add to queue")

        if dry_run:
            print("\n🏃 DRY RUN MODE - No pages will be created")
            for conv in conversations:
                print(f"  Would create: {conv.get('topic', 'Untitled')[:60]} (Complexity: {conv.get('complexity_score', 0):.1f})")
            return {"total": len(conversations), "created": 0, "skipped": len(conversations), "failed": 0}

        # Create pages
        stats = {"total": len(conversations), "created": 0, "skipped": 0, "failed": 0}

        print("\n📝 Creating Notion pages...")
        for i, conv in enumerate(conversations, 1):
            print(f"\n[{i}/{len(conversations)}] Processing: {conv.get('topic', 'Untitled')[:60]}")
            print(f"  ID: {conv.get('id')}, Complexity: {conv.get('complexity_score', 0):.1f}, Words: {conv.get('word_count', 0):,}")

            page_id = self.create_notion_page(conv)

            if page_id:
                stats["created"] += 1
            else:
                stats["failed"] += 1

        return stats

    def update_extraction_complete(
        self,
        page_id: str,
        extraction_results: Dict,
        md_report_url: str = None,
        json_report_url: str = None,
        google_drive_url: str = None
    ) -> bool:
        """Update Notion page when extraction is complete"""
        try:
            properties = {
                "Status": {"select": {"name": "Completed"}},
                "Extracted": {"checkbox": True},
                "Extraction Completed": {"date": {"start": datetime.now().isoformat()}}
            }

            # Add extraction metrics
            if extraction_results.get('thread_count') is not None:
                properties["Thread Count"] = {"number": extraction_results['thread_count']}

            if extraction_results.get('connection_count') is not None:
                properties["Connection Count"] = {"number": extraction_results['connection_count']}

            if extraction_results.get('learning_count') is not None:
                properties["Learning Count"] = {"number": extraction_results['learning_count']}

            if extraction_results.get('insight_count') is not None:
                properties["Insight Count"] = {"number": extraction_results['insight_count']}

            # Add file URLs
            if md_report_url:
                properties["Extraction Report (MD)"] = {"url": md_report_url}

            if json_report_url:
                properties["Extraction Report (JSON)"] = {"url": json_report_url}

            if google_drive_url:
                properties["Google Drive Link"] = {"url": google_drive_url}

            # Update page
            response = requests.patch(
                f"{NOTION_BASE_URL}/pages/{page_id}",
                headers=self.notion_headers,
                json={"properties": properties},
                timeout=30
            )
            response.raise_for_status()

            print(f"✅ Updated Notion page: {page_id}")
            return True

        except requests.exceptions.RequestException as e:
            print(f"❌ Error updating page: {e}")
            return False

    def find_page_by_conversation_id(self, conversation_id: int) -> Optional[str]:
        """Find Notion page by Knowledge Lake conversation ID"""
        try:
            response = requests.post(
                f"{NOTION_BASE_URL}/databases/{self.database_id}/query",
                headers=self.notion_headers,
                json={
                    "filter": {
                        "property": "Conversation ID",
                        "number": {
                            "equals": conversation_id
                        }
                    }
                },
                timeout=30
            )
            response.raise_for_status()

            results = response.json().get('results', [])
            if results:
                return results[0]['id']

            return None

        except requests.exceptions.RequestException as e:
            print(f"❌ Error finding page: {e}")
            return None

    def print_summary(self, stats: Dict):
        """Print population summary"""
        print("\n" + "=" * 80)
        print("POPULATION SUMMARY")
        print("=" * 80)
        print(f"Total conversations:   {stats['total']}")
        print(f"Pages created:         {stats['created']}")
        print(f"Skipped:               {stats['skipped']}")
        print(f"Failed:                {stats['failed']}")
        print("\n" + "=" * 80)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Manage Notion Multi-Pass Extraction Queue'
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # Populate command
    populate_parser = subparsers.add_parser('populate', help='Populate queue with complex conversations')
    populate_parser.add_argument('--dry-run', action='store_true', help='Preview without creating pages')
    populate_parser.add_argument('--token', help='Notion API token (or set NOTION_API_TOKEN env var)')
    populate_parser.add_argument('--database-id', help='Notion database ID (or set MULTIPASS_QUEUE_DB_ID env var)')

    # Update command
    update_parser = subparsers.add_parser('update', help='Update extraction status')
    update_parser.add_argument('conversation_id', type=int, help='Knowledge Lake conversation ID')
    update_parser.add_argument('--threads', type=int, help='Number of threads')
    update_parser.add_argument('--connections', type=int, help='Number of connections')
    update_parser.add_argument('--learnings', type=int, help='Number of learnings')
    update_parser.add_argument('--insights', type=int, help='Number of insights')
    update_parser.add_argument('--md-url', help='Markdown report URL')
    update_parser.add_argument('--json-url', help='JSON report URL')
    update_parser.add_argument('--drive-url', help='Google Drive URL')
    update_parser.add_argument('--token', help='Notion API token')
    update_parser.add_argument('--database-id', help='Notion database ID')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    try:
        # Initialize manager
        manager = NotionQueueManager(
            notion_token=args.token,
            database_id=args.database_id
        )

        if args.command == 'populate':
            # Populate queue
            stats = manager.populate_queue(dry_run=args.dry_run)
            manager.print_summary(stats)

            if stats['created'] > 0:
                print(f"\n✅ Successfully created {stats['created']} queue items")
                print(f"\n📋 View queue: https://notion.so/{manager.database_id.replace('-', '')}")

        elif args.command == 'update':
            # Find page by conversation ID
            page_id = manager.find_page_by_conversation_id(args.conversation_id)

            if not page_id:
                print(f"❌ No queue item found for conversation ID {args.conversation_id}")
                return 1

            # Update extraction results
            extraction_results = {
                'thread_count': args.threads,
                'connection_count': args.connections,
                'learning_count': args.learnings,
                'insight_count': args.insights
            }

            success = manager.update_extraction_complete(
                page_id=page_id,
                extraction_results=extraction_results,
                md_report_url=args.md_url,
                json_report_url=args.json_url,
                google_drive_url=args.drive_url
            )

            if success:
                print(f"\n✅ Updated queue item for conversation {args.conversation_id}")
            else:
                print(f"\n❌ Failed to update queue item")
                return 1

        return 0

    except ValueError as e:
        print(f"\n❌ Configuration error: {e}")
        print("\nPlease set environment variables:")
        print("  export NOTION_API_TOKEN='your-token'")
        print("  export MULTIPASS_QUEUE_DB_ID='your-database-id'")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

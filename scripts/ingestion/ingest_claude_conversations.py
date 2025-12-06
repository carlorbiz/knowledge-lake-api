#!/usr/bin/env python3
"""
Ingest Claude (claude.ai) conversations from AAE Exports to Knowledge Lake API
Claude exports are simpler - direct JSON array with messages
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List
import requests
from datetime import datetime

# Configuration
AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Claude/conversations.json")
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"
USER_ID = 1  # Carla's user ID

# Stats tracking
stats = {
    "total": 0,
    "success": 0,
    "failed": 0,
    "mem0_indexed": 0,
    "errors": []
}

def extract_conversation_content(conversation: Dict[str, Any]) -> str:
    """Extract text content from Claude conversation"""
    content_parts = []

    # Add conversation header
    title = conversation.get('name', 'Untitled Conversation')
    content_parts.append(f"# {title}\n")

    # Add messages
    messages = conversation.get('chat_messages', [])
    for msg in messages:
        sender = msg.get('sender', 'unknown')
        text = msg.get('text', '')

        # Determine display name
        display_name = "Carla" if sender == 'human' else "Claude"

        content_parts.append(f"\n## {display_name}:\n{text}\n")

    return "\n".join(content_parts)

def transform_conversation(conversation: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Claude conversation to Knowledge Lake format"""
    # Convert ISO timestamp to date
    created_at = conversation.get('created_at', '')
    date_str = created_at[:10] if created_at else datetime.now().strftime('%Y-%m-%d')

    # Extract full conversation content
    content = extract_conversation_content(conversation)

    # Build Knowledge Lake payload
    payload = {
        'userId': USER_ID,
        'agent': 'Claude',
        'date': date_str,
        'topic': conversation.get('name', 'Untitled Conversation'),
        'content': content,
        'metadata': {
            'uuid': conversation.get('uuid'),
            'updated_at': conversation.get('updated_at'),
            'message_count': len(conversation.get('chat_messages', []))
        }
    }

    return payload

def ingest_conversation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Ingest single conversation to Knowledge Lake API"""
    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            json=payload,
            timeout=120  # Increased from 30s to 120s for mem0 indexing
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")

def main():
    print("=" * 70)
    print("CLAUDE CONVERSATION INGESTION TO KNOWLEDGE LAKE")
    print("=" * 70)

    if not AAE_EXPORTS_PATH.exists():
        print(f"ERROR: Conversations file not found: {AAE_EXPORTS_PATH}")
        sys.exit(1)

    print(f"\nLoading conversations from: {AAE_EXPORTS_PATH.name}")
    with open(AAE_EXPORTS_PATH, 'r', encoding='utf-8') as f:
        conversations = json.load(f)

    stats['total'] = len(conversations)
    print(f"Found {stats['total']} conversations")

    # Sort by creation time (oldest first)
    conversations.sort(key=lambda c: c.get('created_at', ''))

    # Process each conversation
    print(f"\n{'-' * 70}")
    print("Starting ingestion...")
    print(f"{'-' * 70}\n")

    for idx, conv in enumerate(conversations, 1):
        conv_title = conv.get('name', 'Untitled')[:50]  # Truncate long titles
        conv_date = conv.get('created_at', '')[:10] if conv.get('created_at') else 'Unknown'

        print(f"[{idx}/{stats['total']}] {conv_date} - {conv_title}...", end=" ", flush=True)

        try:
            # Transform to Knowledge Lake format
            payload = transform_conversation(conv)

            # Ingest to API
            result = ingest_conversation(payload)

            # Track success
            stats['success'] += 1
            if result.get('mem0Indexed'):
                stats['mem0_indexed'] += 1

            # Show result
            conv_id = result.get('conversation', {}).get('id', 'N/A')
            mem0_status = "mem0OK" if result.get('mem0Indexed') else "mem0SKIP"
            print(f"OK (ID:{conv_id}, {mem0_status})")

        except Exception as e:
            stats['failed'] += 1
            error_msg = str(e)[:100]  # Truncate long errors
            stats['errors'].append({
                'conversation': conv_title,
                'date': conv_date,
                'error': error_msg
            })
            print(f"FAILED - {error_msg}")

    # Print summary
    print(f"\n{'=' * 70}")
    print("INGESTION SUMMARY")
    print(f"{'=' * 70}")
    print(f"Total conversations:  {stats['total']}")
    print(f"Successfully ingested: {stats['success']}")
    print(f"Failed:               {stats['failed']}")
    print(f"mem0 indexed:         {stats['mem0_indexed']}")
    print(f"{'=' * 70}")

    if stats['errors']:
        print(f"\nErrors ({len(stats['errors'])}):")
        for err in stats['errors'][:10]:  # Show first 10 errors
            print(f"  - {err['date']} {err['conversation']}: {err['error']}")
        if len(stats['errors']) > 10:
            print(f"  ... and {len(stats['errors']) - 10} more")

    # Save detailed log
    log_file = Path("C:/Users/carlo/claude_ingestion_log.json")
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'stats': stats
        }, f, indent=2)
    print(f"\nDetailed log saved to: {log_file}")

    # Exit code
    sys.exit(0 if stats['failed'] == 0 else 1)

if __name__ == "__main__":
    main()

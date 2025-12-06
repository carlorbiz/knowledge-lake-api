#!/usr/bin/env python3
"""
Ingest Fred (Google AI Studio) conversations from AAE Exports to Knowledge Lake API
Fred exports are in ChatGPT format with hierarchical message trees
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List
import requests
from datetime import datetime

# Configuration
AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Fred")
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

def extract_message_tree(mapping: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract linear message sequence from hierarchical tree"""
    messages = []

    # Find root node (no parent)
    root_id = None
    for node_id, node in mapping.items():
        if node.get('parent') is None:
            root_id = node_id
            break

    if not root_id:
        return messages

    # Traverse tree depth-first following children
    def traverse(node_id):
        node = mapping.get(node_id)
        if not node:
            return

        # Extract message if present
        msg = node.get('message')
        if msg and msg.get('content'):
            author = msg.get('author', {})
            role = author.get('role', 'unknown')

            # Skip system messages
            if role in ['user', 'assistant']:
                content_obj = msg.get('content', {})
                parts = content_obj.get('parts', [])

                # Extract text from parts (skip images for now)
                text_parts = []
                for part in parts:
                    if isinstance(part, str):
                        text_parts.append(part)
                    elif isinstance(part, dict) and part.get('content_type') == 'text':
                        text_parts.append(str(part))

                if text_parts:
                    messages.append({
                        'role': role,
                        'content': ' '.join(text_parts),
                        'create_time': msg.get('create_time')
                    })

        # Traverse children (take first child for linear path)
        children = node.get('children', [])
        for child_id in children:
            traverse(child_id)

    traverse(root_id)
    return messages

def extract_conversation_content(conversation: Dict[str, Any]) -> str:
    """Extract text content from Fred conversation"""
    content_parts = []

    # Add conversation header
    title = conversation.get('title', 'Untitled Conversation')
    content_parts.append(f"# {title}\n")

    # Extract messages from tree
    mapping = conversation.get('mapping', {})
    messages = extract_message_tree(mapping)

    # Format messages
    for msg in messages:
        role = msg['role']
        sender = "Carla" if role == 'user' else "Fred"
        text = msg['content']

        content_parts.append(f"\n## {sender}:\n{text}\n")

    return "\n".join(content_parts)

def transform_conversation(conversation: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Fred conversation to Knowledge Lake format"""
    # Convert Unix timestamp to ISO date
    create_time = conversation.get('create_time', 0)
    date_str = datetime.fromtimestamp(create_time).strftime('%Y-%m-%d') if create_time else datetime.now().strftime('%Y-%m-%d')

    # Extract full conversation content
    content = extract_conversation_content(conversation)

    # Build Knowledge Lake payload
    payload = {
        'userId': USER_ID,
        'agent': 'Fred',
        'date': date_str,
        'topic': conversation.get('title', 'Untitled Conversation'),
        'content': content,
        'metadata': {
            'create_time': create_time,
            'update_time': conversation.get('update_time'),
            'message_count': len(conversation.get('mapping', {}))
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
    print("FRED CONVERSATION INGESTION TO KNOWLEDGE LAKE")
    print("=" * 70)

    # Find Fred conversation folders
    folders = [f for f in AAE_EXPORTS_PATH.iterdir() if f.is_dir()]

    if not folders:
        print("ERROR: No Fred conversation folders found")
        sys.exit(1)

    print(f"\nFound {len(folders)} Fred export folder(s)")

    # Process first folder (main export)
    first_folder = folders[0]
    conversations_file = first_folder / "conversations.json"

    if not conversations_file.exists():
        print(f"ERROR: Conversations file not found: {conversations_file}")
        sys.exit(1)

    print(f"Loading conversations from: {conversations_file.name}")
    with open(conversations_file, 'r', encoding='utf-8') as f:
        conversations = json.load(f)

    stats['total'] = len(conversations)
    print(f"Found {stats['total']} conversations")

    # Sort by creation time (oldest first)
    conversations.sort(key=lambda c: c.get('create_time', 0))

    # Process each conversation
    print(f"\n{'-' * 70}")
    print("Starting ingestion...")
    print(f"{'-' * 70}\n")

    for idx, conv in enumerate(conversations, 1):
        conv_title = conv.get('title', 'Untitled')[:50]  # Truncate long titles
        conv_time = conv.get('create_time', 0)
        conv_date = datetime.fromtimestamp(conv_time).strftime('%Y-%m-%d') if conv_time else 'Unknown'

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
    log_file = Path("C:/Users/carlo/fred_ingestion_log.json")
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

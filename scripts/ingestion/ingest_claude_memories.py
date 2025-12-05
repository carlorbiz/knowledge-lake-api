#!/usr/bin/env python3
"""
Ingest Claude memories to Knowledge Lake API
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any
import requests
from datetime import datetime

# Configuration
AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Claude")
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"
USER_ID = 1  # Carla's user ID

def extract_memories_content(memories: Dict[str, Any]) -> str:
    """Extract all memory content from Claude memories export"""
    content_parts = []

    # Add header
    content_parts.append("# Claude AI Memories - Comprehensive Context\n")

    # Add conversations memory (general context)
    conv_memory = memories.get('conversations_memory', '')
    if conv_memory:
        content_parts.append("## General Context (Conversations Memory)\n")
        content_parts.append(conv_memory)
        content_parts.append("\n")

    # Add project-specific memories
    project_memories = memories.get('project_memories', {})
    if project_memories:
        content_parts.append(f"\n## Project-Specific Memories ({len(project_memories)} projects)\n")

        for project_uuid, memory_text in project_memories.items():
            content_parts.append(f"\n### Project: {project_uuid}\n")
            content_parts.append(f"{memory_text}\n")

    return "\n".join(content_parts)

def ingest_memories() -> Dict[str, str]:
    """Ingest Claude memories to Knowledge Lake API"""
    print("=" * 70)
    print("CLAUDE MEMORIES INGESTION TO KNOWLEDGE LAKE")
    print("=" * 70)

    # Load memories.json
    memories_file = AAE_EXPORTS_PATH / "memories.json"

    if not memories_file.exists():
        print(f"ERROR: Memories file not found: {memories_file}")
        sys.exit(1)

    print(f"\nLoading memories from: {memories_file}")
    with open(memories_file, 'r', encoding='utf-8') as f:
        memories_data = json.load(f)

    # Extract first (and likely only) memories object
    if not memories_data or len(memories_data) == 0:
        print("ERROR: No memories found in file")
        sys.exit(1)

    memories = memories_data[0]

    # Count memory items
    conv_memory_len = len(memories.get('conversations_memory', ''))
    project_memory_count = len(memories.get('project_memories', {}))

    print(f"Conversations memory: {conv_memory_len} characters")
    print(f"Project memories: {project_memory_count} projects")

    # Extract full memory content
    content = extract_memories_content(memories)

    # Build Knowledge Lake payload
    payload = {
        'userId': USER_ID,
        'agent': 'Claude',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'topic': '[MEMORIES] Claude AI Context Snapshot',
        'content': content,
        'metadata': {
            'account_uuid': memories.get('account_uuid'),
            'conversations_memory_length': conv_memory_len,
            'project_memories_count': project_memory_count,
            'type': 'claude_memories',
            'export_date': datetime.now().isoformat()
        }
    }

    # Ingest to API
    print(f"\n{'-' * 70}")
    print("Ingesting memories to Knowledge Lake...")
    print(f"{'-' * 70}\n")

    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            json=payload,
            timeout=120  # Increased from 30s to 120s for mem0 indexing
        )
        response.raise_for_status()
        result = response.json()

        # Show result
        conv_id = result.get('conversation', {}).get('id', 'N/A')
        mem0_status = "mem0OK" if result.get('mem0Indexed') else "mem0SKIP"

        print(f"SUCCESS - Memories ingested (ID:{conv_id}, {mem0_status})")

        # Print summary
        print(f"\n{'=' * 70}")
        print("INGESTION SUMMARY")
        print(f"{'=' * 70}")
        print(f"Conversations memory: {conv_memory_len} chars")
        print(f"Project memories:     {project_memory_count} projects")
        print(f"Knowledge Lake ID:    {conv_id}")
        print(f"mem0 indexed:         {'Yes' if result.get('mem0Indexed') else 'No'}")
        print(f"{'=' * 70}")

        # Save detailed log
        log_file = Path("C:/Users/carlo/claude_memories_ingestion_log.json")
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'result': result,
                'stats': {
                    'conversations_memory_length': conv_memory_len,
                    'project_memories_count': project_memory_count
                }
            }, f, indent=2)
        print(f"\nDetailed log saved to: {log_file}")

        sys.exit(0)

    except Exception as e:
        print(f"FAILED - {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    ingest_memories()

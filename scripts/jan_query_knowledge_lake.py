#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jan's Knowledge Lake Query Script
Simple script for Jan (Genspark) to query the AAE Knowledge Lake
"""

import requests
import json
import sys
import io
from datetime import datetime

# Ensure UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Knowledge Lake API endpoint
BASE_URL = "https://knowledge-lake-api-production.up.railway.app"

def query_knowledge_lake(search_query: str, limit: int = 10):
    """
    Query the Knowledge Lake for relevant conversations

    Args:
        search_query: What to search for
        limit: Maximum number of results (default 10)

    Returns:
        List of matching conversations with metadata
    """

    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json={
                "userId": 1,
                "query": search_query,
                "limit": limit
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        if not data.get("success", False):
            print(f"Error: {data.get('error', 'Unknown error')}")
            return None

        return data.get("results", [])

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Knowledge Lake: {e}")
        return None

def get_stats():
    """Get Knowledge Lake statistics"""
    try:
        response = requests.get(f"{BASE_URL}/api/stats", timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting stats: {e}")
        return None

def display_results(results, query):
    """Display search results in a readable format"""

    if not results:
        print(f"\nNo results found for: '{query}'")
        return

    print(f"\n{'=' * 80}")
    print(f"Knowledge Lake Search Results")
    print(f"Query: '{query}'")
    print(f"Found: {len(results)} conversation(s)")
    print(f"{'=' * 80}\n")

    for i, conv in enumerate(results, 1):
        print(f"\n[{i}] Conversation #{conv.get('id', 'unknown')}")
        print(f"    Topic: {conv.get('topic', 'Untitled')}")
        print(f"    Agent: {conv.get('agent', 'Unknown')}")
        print(f"    Date: {conv.get('date', 'Unknown')}")

        # Show snippet of content
        content = conv.get('content', '')
        if len(content) > 200:
            snippet = content[:200] + "..."
        else:
            snippet = content

        print(f"\n    Preview:")
        for line in snippet.split('\n')[:5]:
            if line.strip():
                print(f"    {line[:75]}")

        print(f"\n    {'-' * 76}")

    print(f"\n{'=' * 80}\n")

def main():
    """Main entry point"""

    print("\n" + "=" * 80)
    print("Jan's Knowledge Lake Query Tool")
    print("AAE Council - Shared Memory System")
    print("=" * 80 + "\n")

    # Get stats first
    print("Connecting to Knowledge Lake...")
    stats = get_stats()

    if stats:
        print(f"[CONNECTED] Knowledge Lake Status:")
        print(f"  - Total Conversations: {stats.get('totalConversations', 0)}")
        print(f"  - Total Entities: {stats.get('totalEntities', 0)}")
        print(f"  - Database: PostgreSQL on Railway")
        print()

    # Get query from command line or prompt
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = input("Enter search query (or 'quit' to exit): ").strip()

    if query.lower() in ['quit', 'exit', 'q']:
        print("\nExiting...\n")
        return

    # Search Knowledge Lake
    print(f"\nSearching for: '{query}'...")
    results = query_knowledge_lake(query, limit=10)

    # Display results
    if results is not None:
        display_results(results, query)

if __name__ == "__main__":
    main()

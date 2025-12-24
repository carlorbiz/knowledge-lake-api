#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CC Context Sync Script
Ensures Claude Code maintains context across sessions via Knowledge Lake

Usage:
    python cc-context-sync.py start              # Run at session start
    python cc-context-sync.py end "summary"      # Run before ending session
    python cc-context-sync.py status             # Check Knowledge Lake stats
"""

import sys
import json
import requests
from datetime import datetime
import io

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"


def print_divider():
    print("-" * 60)


def start_session():
    """Run at the start of every CC session to retrieve context."""
    print_divider()
    print("🔄 CC Context Sync - Session Start")
    print_divider()
    print()
    
    # Health check
    print("📡 Checking Knowledge Lake connection...")
    try:
        response = requests.get(f"{KNOWLEDGE_LAKE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Knowledge Lake is online")
        else:
            print(f"⚠️  Knowledge Lake returned status {response.status_code}")
    except requests.RequestException as e:
        print(f"❌ Knowledge Lake unreachable - check Railway deployment")
        print(f"   URL: {KNOWLEDGE_LAKE_URL}")
        print(f"   Error: {e}")
        return
    
    print()
    
    # Fetch recent CC sessions
    print("🔍 Fetching recent CC sessions...")
    print()
    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/query",
            headers={"Content-Type": "application/json"},
            json={"userId": 1, "query": "Claude Code CC session", "limit": 5},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            if results:
                for conv in results:
                    print(f"📄 {conv.get('topic', 'No topic')}")
                    print(f"   Date: {conv.get('date', 'Unknown')}")
                    content = conv.get('content', '')
                    if content:
                        print(f"   Content: {content[:200]}...")
                    print()
            else:
                print("No recent CC sessions found")
        else:
            print(f"Search returned status {response.status_code}")
    except requests.RequestException as e:
        print(f"Error fetching sessions: {e}")
    
    print()
    
    # Reminders
    print_divider()
    print("📋 Critical Reminders:")
    print_divider()
    print(f"✅ Railway URL: {KNOWLEDGE_LAKE_URL}")
    print("❌ NOT: mem0-production-api (WRONG URL)")
    print("📁 API Code: mem0/api_server.py")
    print("🔧 API Version: 2.1.0_database_persistence")
    print()
    print("⚠️  If Railway returns 404 on /health → check build logs for CVE failures")
    print_divider()


def end_session(summary: str = None):
    """Run before ending a CC session to ingest context."""
    if not summary:
        summary = "CC session completed - no summary provided"
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    print_divider()
    print("📤 CC Context Sync - Session End")
    print_divider()
    print()
    print("📝 Ingesting session summary to Knowledge Lake...")
    print(f"   Topic: CC Session: {summary}")
    print(f"   Date: {today}")
    print()
    
    try:
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            headers={"Content-Type": "application/json"},
            json={
                "topic": f"CC Session: {summary}",
                "content": summary,
                "agent": "Claude Code",
                "userId": "carla",
                "date": today,
                "metadata": {
                    "businessArea": "AAE Development",
                    "processingAgent": "Claude Code"
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("conversation_id"):
                print("✅ Session ingested successfully")
                print(json.dumps(data, indent=2))
            else:
                print("⚠️  Response received but no conversation_id:")
                print(json.dumps(data, indent=2))
        else:
            print(f"❌ Ingestion failed with status {response.status_code}")
            print(response.text)
    except requests.RequestException as e:
        print(f"❌ Ingestion failed: {e}")
    
    print()
    print_divider()


def show_status():
    """Show Knowledge Lake statistics."""
    print("📊 Knowledge Lake Status")
    print()
    
    try:
        response = requests.get(f"{KNOWLEDGE_LAKE_URL}/api/stats", timeout=10)
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Status check returned {response.status_code}")
    except requests.RequestException as e:
        print(f"Error fetching status: {e}")


def show_help():
    """Display usage information."""
    print("CC Context Sync Script")
    print()
    print("Usage:")
    print('  python cc-context-sync.py start              # Run at session start')
    print('  python cc-context-sync.py end "summary"      # Run before ending session')
    print('  python cc-context-sync.py status             # Check Knowledge Lake stats')
    print()
    print("Examples:")
    print("  python cc-context-sync.py start")
    print('  python cc-context-sync.py end "Fixed Railway CVE issues, deployed successfully"')
    print("  python cc-context-sync.py status")


def main():
    if len(sys.argv) < 2:
        show_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == "start":
        start_session()
    elif command == "end":
        summary = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        end_session(summary)
    elif command == "status":
        show_status()
    else:
        show_help()


if __name__ == "__main__":
    main()
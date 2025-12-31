#!/usr/bin/env python3
"""
Ingest 9 consolidated Jan conversations from complete_chat_history_consolidated.md

This script parses a single markdown file containing 9 separate conversation
sessions and ingests each one individually into Knowledge Lake.
"""

import re
import requests
from datetime import datetime
from typing import List, Dict

# Configuration
KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"
AGENT_NAME = "Jan (Genspark)"
USER_ID = 1

# Path to consolidated file
CONSOLIDATED_FILE = "complete_chat_history_consolidated.md"


def parse_consolidated_file(filepath: str) -> List[Dict]:
    """Parse the consolidated markdown file into individual sessions"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by --- dividers first
    sections = content.split('\n---\n')

    sessions = []

    for section in sections:
        # Look for session headers
        session_match = re.search(r'## Session \d+: (.+?)\n', section)
        if not session_match:
            continue

        title = session_match.group(1).strip()

        # Extract created date
        created_match = re.search(r'\*\*Created:\*\* (.+?)\n', section)
        created_date = created_match.group(1).strip() if created_match else ''

        # Extract session ID
        id_match = re.search(r'\*\*ID:\*\* (.+?)\n', section)
        session_id = id_match.group(1).strip() if id_match else ''

        # Extract content (everything after the ID line)
        content_match = re.search(r'\*\*ID:\*\* .+?\n\n(.+?)$', section, re.DOTALL)
        session_content = content_match.group(1).strip() if content_match else ''

        # Parse date
        try:
            # Format: 2025-12-30T09:37:20.138161
            date_obj = datetime.fromisoformat(created_date.strip())
            date_str = date_obj.strftime('%Y-%m-%d')
        except:
            date_str = datetime.now().strftime('%Y-%m-%d')

        # Determine business area from content
        business_area = "AAE Development"  # Default
        content_lower = session_content.lower()

        if any(word in content_lower for word in ['rwav', 'rural health', 'workforce agency']):
            business_area = "MTMOT - Rural Health"
        elif any(word in content_lower for word in ['gpsa', 'gp supervisor', 'resignation']):
            business_area = "GPSA"
        elif any(word in content_lower for word in ['service as product', 'book series', 'blog post']):
            business_area = "MTMOT - Content Creation"
        elif any(word in content_lower for word in ['first nations', 'aboriginal']):
            business_area = "MTMOT - First Nations"
        elif any(word in content_lower for word in ['export', 'scraper', 'json', 'hub']):
            business_area = "AAE Development"

        # Extract key topics
        key_topics = []
        if 'export' in content_lower and 'json' in content_lower:
            key_topics.append('Conversation Archival')
        if 'strategic plan' in content_lower:
            key_topics.append('Strategic Planning')
        if 'service' in content_lower and 'product' in content_lower:
            key_topics.append('Service Excellence')
        if 'python' in content_lower or 'playwright' in content_lower:
            key_topics.append('Technical Setup')
        if 'resignation' in content_lower:
            key_topics.append('Professional Communications')
        if not key_topics:
            key_topics = ['General Discussion']

        sessions.append({
            'title': title.strip(),
            'created_date': created_date.strip(),
            'session_id': session_id.strip(),
            'content': session_content.strip(),
            'date': date_str,
            'business_area': business_area,
            'key_topics': key_topics
        })

    return sessions


def ingest_session(session: Dict, session_number: int) -> bool:
    """Ingest a single session to Knowledge Lake"""

    print(f"\n{'='*70}")
    print(f"Session {session_number}/9: {session['title'][:50]}")
    print(f"{'='*70}")

    # Create full content with header
    full_content = f"""# {session['title']} - Jan & Carla

**Original Session ID:** {session['session_id']}
**Created:** {session['created_date']}
**Date:** {session['date']}
**Business Area:** {session['business_area']}

---

{session['content']}
"""

    # Create payload
    payload = {
        "topic": session['title'],
        "content": full_content,
        "agent": AGENT_NAME,
        "userId": USER_ID,
        "date": session['date'],
        "metadata": {
            "businessArea": session['business_area'],
            "processingAgent": "Claude Code",
            "source": "Jan Genspark Hub Export - Consolidated",
            "originalSessionId": session['session_id'],
            "originalCreatedDate": session['created_date'],
            "keyTopics": session['key_topics'],
            "consolidatedExport": True,
            "exportDate": datetime.now().isoformat()
        }
    }

    # Show summary
    print(f"\n[SUMMARY]")
    print(f"   Title: {session['title'][:60]}")
    print(f"   Date: {session['date']}")
    print(f"   Business Area: {session['business_area']}")
    print(f"   Key Topics: {', '.join(session['key_topics'])}")
    print(f"   Content Length: {len(session['content'])} chars")

    # Ingest
    try:
        print(f"\n[INGEST] Sending to Knowledge Lake...")
        response = requests.post(
            f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()

        conv_id = result.get('conversationId', 'N/A')
        print(f"\n[OK] SUCCESS!")
        print(f"   Conversation ID: {conv_id}")

        return True

    except requests.exceptions.RequestException as e:
        print(f"\n[FAIL] FAILED!")
        print(f"   Error: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"   Response: {e.response.text}")
        return False


def main():
    """Main ingestion process"""

    print("\n" + "="*70)
    print("CONSOLIDATED CONVERSATION INGESTION")
    print("="*70)
    print(f"\nSource File: {CONSOLIDATED_FILE}")
    print(f"Target: {KNOWLEDGE_LAKE_URL}")

    # Parse file
    print(f"\n[PARSE] Parsing consolidated file...")
    try:
        sessions = parse_consolidated_file(CONSOLIDATED_FILE)
    except FileNotFoundError:
        print(f"\n[FAIL] Error: File not found: {CONSOLIDATED_FILE}")
        print("Make sure you're running this from the agent-conversations/jan/ directory")
        return
    except Exception as e:
        print(f"\n[FAIL] Error parsing file: {str(e)}")
        return

    print(f"[OK] Found {len(sessions)} sessions")

    # Show session list
    print(f"\n[LIST] Sessions to ingest:")
    for i, session in enumerate(sessions, 1):
        print(f"   {i}. {session['title']} ({session['date']})")

    # Confirm
    response = input(f"\nProceed with ingestion of {len(sessions)} sessions? (y/n): ")
    if response.lower() != 'y':
        print("\n[CANCEL] Ingestion cancelled by user")
        return

    # Ingest each session
    success_count = 0
    fail_count = 0

    for i, session in enumerate(sessions, 1):
        if ingest_session(session, i):
            success_count += 1
        else:
            fail_count += 1

    # Final summary
    print(f"\n{'='*70}")
    print("INGESTION COMPLETE")
    print(f"{'='*70}")
    print(f"\n[OK] Successful: {success_count}")
    print(f"[FAIL] Failed: {fail_count}")
    print(f"[TOTAL] Total: {len(sessions)}")

    if success_count > 0:
        print(f"\n[DONE] {success_count} Jan Hub sessions are now in Knowledge Lake!")
        print("   Ready for learning extraction and search")

    print()


if __name__ == "__main__":
    main()

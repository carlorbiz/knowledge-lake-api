#!/usr/bin/env python3
"""
CC Inbox Checker
Queries Notion CC Inbox database for items with Wake CC flag set to true.
Returns the count and details of pending items.
"""

import os
import sys
import json
from datetime import datetime

# Configuration - UPDATE THESE!
CC_INBOX_DB_ID = "29094405-56f7-8060-af28-eee401918ced"  # CC Inbox database under Carla's HQ
NOTION_API_KEY = os.environ.get("NOTION_API_KEY", "")  # Or set directly

def check_inbox():
    """
    Check Notion CC Inbox for items with Wake CC = true
    Returns: List of inbox items needing processing
    """

    if not NOTION_API_KEY:
        print("ERROR: NOTION_API_KEY not set")
        print("Set it in environment or update check-inbox.py")
        sys.exit(1)

    try:
        import requests
    except ImportError:
        print("ERROR: requests library not installed")
        print("Run: pip install requests")
        sys.exit(1)

    # Query Notion database
    url = f"https://api.notion.com/v1/databases/{CC_INBOX_DB_ID}/query"
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }

    # Filter for Wake CC = true
    query_body = {
        "filter": {
            "property": "Wake CC",
            "checkbox": {
                "equals": True
            }
        },
        "sorts": [
            {
                "property": "Priority",
                "direction": "descending"
            },
            {
                "property": "Created Time",
                "direction": "ascending"
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=query_body)
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])

        if not results:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No pending inbox items.")
            return []

        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Found {len(results)} inbox item(s):")
        print("-" * 80)

        inbox_items = []
        for idx, item in enumerate(results, 1):
            props = item.get("properties", {})

            # Extract properties
            name = props.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", "Untitled")
            status = props.get("Status", {}).get("select", {}).get("name", "Unknown")
            priority = props.get("Priority", {}).get("select", {}).get("name", "Medium")
            source = props.get("Source", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "Unknown")
            slack_channel = props.get("Slack Channel ID", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "")
            slack_ts = props.get("Slack Message TS", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "")

            inbox_item = {
                "id": item.get("id"),
                "name": name,
                "status": status,
                "priority": priority,
                "source": source,
                "slack_channel": slack_channel,
                "slack_ts": slack_ts,
                "url": item.get("url")
            }

            inbox_items.append(inbox_item)

            print(f"{idx}. [{priority}] {name}")
            print(f"   Status: {status}")
            print(f"   Source: {source}")
            print(f"   Slack: {slack_channel} / {slack_ts}")
            print(f"   URL: {inbox_item['url']}")
            print()

        print("-" * 80)
        return inbox_items

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to query Notion: {e}")
        sys.exit(1)

def main():
    """Main entry point"""
    print("=" * 80)
    print("CC INBOX CHECKER")
    print("=" * 80)
    print()

    items = check_inbox()

    if items:
        print(f"\n✅ Ready to process {len(items)} item(s)")
        print("\nNext step: Launch Claude Code to process these items")
        print("Command: cc code --command 'process CC inbox'")
    else:
        print("\n✅ Inbox clear - no items to process")

    print()
    print("=" * 80)

    # Return exit code based on whether items exist
    # 0 = items found (wake CC)
    # 1 = no items (don't wake CC)
    sys.exit(0 if items else 1)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Analyze AAE Exports conversation formats from Claude and Fred
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List

AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native")

def analyze_claude_exports():
    """Analyze Claude conversation export format"""
    claude_path = AAE_EXPORTS_PATH / "Claude"

    print("=" * 70)
    print("CLAUDE CONVERSATION EXPORTS ANALYSIS")
    print("=" * 70)

    # Check available files
    files = list(claude_path.glob("*.json"))
    print(f"\nFound {len(files)} JSON files:")
    for f in files:
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"  - {f.name}: {size_mb:.2f} MB")

    # Analyze conversations.json structure (read first conversation)
    conversations_file = claude_path / "conversations.json"
    if conversations_file.exists():
        print(f"\nAnalyzing conversations.json structure...")
        with open(conversations_file, 'r', encoding='utf-8') as f:
            # Read first 1000 characters to get structure
            content = f.read(10000)
            # Find first conversation object
            if content.startswith('['):
                # Parse first conversation
                bracket_count = 0
                first_conv_end = 0
                for i, char in enumerate(content):
                    if char == '{':
                        bracket_count += 1
                    elif char == '}':
                        bracket_count -= 1
                        if bracket_count == 0:
                            first_conv_end = i + 1
                            break

                if first_conv_end > 0:
                    first_conv = json.loads(content[1:first_conv_end])
                    print(f"\nFirst conversation structure:")
                    print(f"  UUID: {first_conv.get('uuid', 'N/A')}")
                    print(f"  Name: {first_conv.get('name', 'N/A')}")
                    print(f"  Created: {first_conv.get('created_at', 'N/A')}")
                    print(f"  Messages: {len(first_conv.get('chat_messages', []))}")

                    if first_conv.get('chat_messages'):
                        msg = first_conv['chat_messages'][0]
                        print(f"\nFirst message structure:")
                        print(f"  Keys: {list(msg.keys())}")
                        print(f"  Sender: {msg.get('sender', 'N/A')}")
                        print(f"  Text (first 100 chars): {msg.get('text', '')[:100]}")

        # Count total conversations
        with open(conversations_file, 'r', encoding='utf-8') as f2:
            conversations = json.load(f2)
        print(f"\nTotal conversations: {len(conversations)}")

        # Date range
        dates = [c.get('created_at', '')[:10] for c in conversations if c.get('created_at')]
        if dates:
            print(f"  Date range: {min(dates)} to {max(dates)}")

def analyze_fred_exports():
    """Analyze Fred (Google AI Studio) conversation export format"""
    fred_path = AAE_EXPORTS_PATH / "Fred"

    print("\n" + "=" * 70)
    print("FRED (GOOGLE AI STUDIO) CONVERSATION EXPORTS ANALYSIS")
    print("=" * 70)

    # List conversation folders
    folders = [f for f in fred_path.iterdir() if f.is_dir()]
    print(f"\nFound {len(folders)} conversation folders")

    if folders:
        # Analyze first folder
        first_folder = folders[0]
        print(f"\nAnalyzing first conversation: {first_folder.name}")

        files = list(first_folder.glob("*"))
        print(f"\nFiles in conversation folder:")
        for f in files:
            if f.is_file():
                size = f.stat().st_size
                if size < 1024:
                    size_str = f"{size} B"
                elif size < 1024 * 1024:
                    size_str = f"{size / 1024:.2f} KB"
                else:
                    size_str = f"{size / (1024 * 1024):.2f} MB"
                print(f"  - {f.name}: {size_str}")

        # Read conversations.json if exists
        conversations_file = first_folder / "conversations.json"
        if conversations_file.exists():
            print(f"\nAnalyzing conversations.json structure...")
            with open(conversations_file, 'r', encoding='utf-8') as f:
                conv_data = json.load(f)
                print(f"  Keys: {list(conv_data.keys()) if isinstance(conv_data, dict) else 'Array'}")

                if isinstance(conv_data, dict):
                    # Show first few keys and their types
                    for key, value in list(conv_data.items())[:5]:
                        value_type = type(value).__name__
                        if isinstance(value, (list, dict)):
                            length = len(value)
                            print(f"  - {key}: {value_type} (length: {length})")
                        else:
                            print(f"  - {key}: {value_type} = {str(value)[:50]}")

        # Check chat.html
        html_file = first_folder / "chat.html"
        if html_file.exists():
            size_mb = html_file.stat().st_size / (1024 * 1024)
            print(f"\nOK: chat.html exists ({size_mb:.2f} MB)")

def main():
    print("\nAAE EXPORTS CONVERSATION FORMAT ANALYSIS\n")

    if not AAE_EXPORTS_PATH.exists():
        print(f"ERROR: AAE Exports path not found: {AAE_EXPORTS_PATH}")
        return

    analyze_claude_exports()
    analyze_fred_exports()

    print("\n" + "=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("1. Create ingestion scripts for Claude and Fred")
    print("2. Ingest conversations to Knowledge Lake API")
    print("3. Verify mem0 semantic indexing")

if __name__ == "__main__":
    main()

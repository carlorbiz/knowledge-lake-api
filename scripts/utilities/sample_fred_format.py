#!/usr/bin/env python3
"""
Sample Fred conversation format to understand structure
"""

import json
from pathlib import Path

AAE_EXPORTS_PATH = Path("C:/Users/carlo/Development/mem0-sync/mem0/aae-exports/JSON-Native/Fred")

# Find first conversation folder
folders = [f for f in AAE_EXPORTS_PATH.iterdir() if f.is_dir()]

if not folders:
    print("No Fred conversation folders found")
    exit(1)

first_folder = folders[0]
conversations_file = first_folder / "conversations.json"

print(f"Sampling Fred conversation from: {conversations_file.name}\n")

# Read first 10000 characters to sample structure
with open(conversations_file, 'r', encoding='utf-8') as f:
    sample = f.read(10000)

# Try to parse as much as possible
try:
    # Check if it's an array or object
    if sample.strip().startswith('['):
        # Find first complete object
        bracket_count = 0
        for i, char in enumerate(sample):
            if char == '{':
                bracket_count += 1
            elif char == '}':
                bracket_count -= 1
                if bracket_count == 0:
                    first_obj = json.loads(sample[1:i+1])
                    print("Format: Array of objects")
                    print(f"First object keys: {list(first_obj.keys())}")
                    print(f"\nFirst object sample:")
                    print(json.dumps(first_obj, indent=2)[:2000])
                    break
    else:
        # Try parsing as object
        data = json.loads(sample)
        print("Format: Single object")
        print(f"Top-level keys: {list(data.keys())}")
        print(f"\nSample:")
        print(json.dumps(data, indent=2)[:2000])
except Exception as e:
    print(f"Could not parse JSON: {e}")
    print(f"\nRaw sample (first 1000 chars):")
    print(sample[:1000])

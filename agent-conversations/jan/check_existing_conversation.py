#!/usr/bin/env python3
"""Check existing conversation format"""

import requests
import json

KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"

# Search for an existing conversation
payload = {"query": "Claude Code", "limit": 1}

response = requests.post(
    f"{KNOWLEDGE_LAKE_URL}/api/conversations/search",
    json=payload,
    headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
    results = response.json()
    if results.get('conversations'):
        conv = results['conversations'][0]
        print("Sample conversation structure:")
        print(json.dumps(conv, indent=2))
    else:
        print("No conversations found")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

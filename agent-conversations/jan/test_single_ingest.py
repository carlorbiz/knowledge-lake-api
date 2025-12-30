#!/usr/bin/env python3
"""Test single conversation ingestion with detailed error output"""

import requests
import json

KNOWLEDGE_LAKE_URL = "https://knowledge-lake-api-production.up.railway.app"

# Test payload
payload = {
    "topic": "Test Jan Conversation",
    "content": "This is a test conversation from Jan to debug the 500 error",
    "agent": "Jan (Genspark)",
    "userId": "carla",
    "date": "2024-12-30",
    "metadata": {
        "businessArea": "AAE Development",
        "processingAgent": "Claude Code"
    }
}

print("Testing conversation ingestion...")
print(f"URL: {KNOWLEDGE_LAKE_URL}/api/conversations/ingest")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("-" * 80)

try:
    response = requests.post(
        f"{KNOWLEDGE_LAKE_URL}/api/conversations/ingest",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")

    if response.status_code == 200:
        print("\n[SUCCESS] Conversation ingested!")
        result = response.json()
        print(f"Conversation ID: {result.get('conversationId')}")
    else:
        print(f"\n[ERROR] Failed with status {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error JSON: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw error: {response.text}")

except Exception as e:
    print(f"\n[EXCEPTION] {type(e).__name__}: {str(e)}")

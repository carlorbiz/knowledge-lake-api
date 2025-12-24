"""Quick test for Knowledge Lake API ingestion and learning extraction"""
import requests
import json

API_URL = "https://knowledge-lake-api-production.up.railway.app"

# Test 1: Ingest a conversation with learning content
print("=" * 70)
print("TEST 1: Ingesting sample conversation")
print("=" * 70)

conversation = {
    "userId": 1,
    "agent": "Claude",
    "date": "2025-12-11",
    "topic": "Knowledge Lake Learning Extraction Implementation",
    "content": """
We implemented a comprehensive learning extraction system with 7 dimensions:
1. Methodology Evolution - Using OpenAI for automated pattern analysis
2. Decision Patterns - Chose GPT-4o-mini for cost-effectiveness
3. Correction Patterns - Switched from manual to auto-schema-creation
4. Insight Moments - Railway deployments can be fully self-initializing
5. Value Signals - Automation and cost-efficiency are priorities
6. Prompting Patterns - Structured 7-dimension framework works well
7. Teaching Potential - This approach could teach others about AI memory systems

Key technical decisions:
- Used Learning:* entity types for categorization
- Process conversations in batches for efficiency
- Auto-create database schema on first connection

Critical correction: Initially tried manual schema setup via run_schema.py
but it failed with postgres.railway.internal hostname. Solution was to add
ensure_schema() method to database module for automatic table creation.

Breakthrough insight: By making the database self-initializing, we eliminated
deployment friction and made the system production-ready.
    """,
    "entities": [
        {"name": "Learning Extraction", "entityType": "Feature", "confidence": 0.95},
        {"name": "OpenAI GPT-4o-mini", "entityType": "Technology", "confidence": 0.90},
        {"name": "Auto-Schema-Creation", "entityType": "Feature", "confidence": 0.95},
        {"name": "Railway", "entityType": "Platform", "confidence": 0.90}
    ],
    "relationships": [
        {"from": "Learning Extraction", "to": "OpenAI GPT-4o-mini", "relationshipType": "uses"},
        {"from": "Auto-Schema-Creation", "to": "Railway", "relationshipType": "enables"}
    ]
}

response = requests.post(f"{API_URL}/api/conversations/ingest", json=conversation)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

# Test 2: Check stats
print("\n" + "=" * 70)
print("TEST 2: Checking database statistics")
print("=" * 70)

response = requests.get(f"{API_URL}/api/stats?userId=1")
print(json.dumps(response.json(), indent=2))

# Test 3: Extract learnings
print("\n" + "=" * 70)
print("TEST 3: Extracting learnings from conversation")
print("=" * 70)

extraction_request = {
    "userId": 1
}

response = requests.post(f"{API_URL}/api/conversations/extract-learning", json=extraction_request)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

# Test 4: Final stats with learnings
print("\n" + "=" * 70)
print("TEST 4: Final statistics after learning extraction")
print("=" * 70)

response = requests.get(f"{API_URL}/api/stats?userId=1")
result = response.json()
print(json.dumps(result, indent=2))

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"✅ Conversations: {result.get('userConversations', 0)}")
print(f"✅ Entities: {result.get('userEntities', 0)}")
print(f"✅ Relationships: {result.get('totalRelationships', 0)}")
if result.get('entityTypeDistribution'):
    print(f"✅ Learning entities extracted:")
    for entity_type, count in result['entityTypeDistribution'].items():
        if 'Learning:' in entity_type:
            print(f"   - {entity_type}: {count}")

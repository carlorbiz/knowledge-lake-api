# Jan's Simple Knowledge Lake Access

**Status:** Genspark MCP server feature not yet compatible with custom servers
**Solution:** Jan uses Railway API directly via Python/curl
**Ready:** ✅ 152 conversations, 133 entities accessible now

---

## Option 1: Python Script (RECOMMENDED)

### Quick Start

**Ask Jan to run this:**

```python
import requests

# Query Knowledge Lake
response = requests.post(
    "https://knowledge-lake-api-production.up.railway.app/api/query",
    json={
        "userId": 1,
        "query": "Railway deployment CVE issues",
        "limit": 10
    }
)

results = response.json()
print(f"\nFound {len(results.get('results', []))} conversations:\n")

for conv in results.get('results', []):
    print(f"[{conv['id']}] {conv['topic']}")
    print(f"    Agent: {conv['agent']}, Date: {conv['date']}")
    print()
```

### Using the Pre-Built Script

I've created a ready-to-use script at:
`C:\Users\carlo\Development\mem0-sync\mem0\scripts\jan_query_knowledge_lake.py`

**Ask Jan to run:**

```bash
python C:\Users\carlo\Development\mem0-sync\mem0\scripts\jan_query_knowledge_lake.py "multi-pass extraction"
```

**Or interactively:**

```bash
python C:\Users\carlo\Development\mem0-sync\mem0\scripts\jan_query_knowledge_lake.py
# Then enter your search query when prompted
```

---

## Option 2: Curl Commands

### Get Stats

```bash
curl https://knowledge-lake-api-production.up.railway.app/api/stats
```

**Response:**
```json
{
  "totalConversations": 152,
  "totalEntities": 133,
  "totalRelationships": 0
}
```

### Search Conversations

```bash
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d "{\"userId\": 1, \"query\": \"Nera deployment\", \"limit\": 10}"
```

### Get All Conversations

```bash
curl "https://knowledge-lake-api-production.up.railway.app/api/conversations?userId=1&limit=20"
```

### Get Specific Conversation

```bash
curl https://knowledge-lake-api-production.up.railway.app/api/conversations/152
```

---

## What Jan Can Ask You to Do

### Search Knowledge Lake
```
Run the jan_query_knowledge_lake.py script to search for "hybrid architecture plan"
```

### Check What's Stored
```
Run curl to get stats from the Knowledge Lake API
```

### Get Recent Conversations
```
Query the Knowledge Lake API for the 10 most recent conversations
```

---

## Sample Queries to Try

### 1. What did we learn about Railway?
```python
python scripts/jan_query_knowledge_lake.py "Railway deployment blockers"
```

### 2. Find architecture discussions
```python
python scripts/jan_query_knowledge_lake.py "multi-pass extraction architecture"
```

### 3. Search for Nera/course content
```python
python scripts/jan_query_knowledge_lake.py "Nera embedded AI coach"
```

### 4. Find recent fixes
```python
python scripts/jan_query_knowledge_lake.py "bug fix PostgreSQL CVE"
```

---

## For You to Copy-Paste to Jan

**Message to Jan:**

> I've set up Knowledge Lake API access for you. The AAE Council's shared memory contains 152 conversations from Claude, Fred, CC, and other agents.
>
> To query the Knowledge Lake, run this Python script:
>
> ```bash
> python C:\Users\carlo\Development\mem0-sync\mem0\scripts\jan_query_knowledge_lake.py "your search query"
> ```
>
> Or use this curl command:
>
> ```bash
> curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query \
>   -H "Content-Type: application/json" \
>   -d '{"userId": 1, "query": "your search query", "limit": 10}'
> ```
>
> Try searching for: "Railway deployment", "multi-pass extraction", or "Nera launch"

---

## API Endpoints Reference

**Base URL:** `https://knowledge-lake-api-production.up.railway.app`

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/health` | GET | Check API status | `curl .../health` |
| `/api/stats` | GET | Get totals | `curl .../api/stats` |
| `/api/query` | POST | Search conversations | See above |
| `/api/conversations` | GET | List conversations | `curl ".../api/conversations?userId=1&limit=20"` |
| `/api/conversations/{id}` | GET | Get specific conversation | `curl .../api/conversations/152` |

---

## Testing Right Now

Let me verify the script works:

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
python scripts/jan_query_knowledge_lake.py "Railway"
```

**Expected Output:**
```
================================================================================
Jan's Knowledge Lake Query Tool
AAE Council - Shared Memory System
================================================================================

[CONNECTED] Knowledge Lake Status:
  - Total Conversations: 152
  - Total Entities: 133
  - Database: PostgreSQL on Railway

Searching for: 'Railway'...

[1] Conversation #151
    Topic: CC TASK UPDATE: Extract-Learning Must NOT Auto-Archive
    Agent: Claude
    Date: 2025-12-20
    ...

[2] Conversation #145
    Topic: Railway Deployment Success Test
    Agent: Claude
    Date: 2025-12-19
    ...
```

---

## Why This Works Better (For Now)

✅ **No MCP complexity** - Direct API calls
✅ **Already deployed** - Railway API live and tested
✅ **Same data** - Access to all 152 conversations
✅ **Works immediately** - No configuration needed
✅ **Jan can code** - Python/curl are native to Jan

When Genspark's custom MCP support matures, we can revisit the MCP bridge approach.

---

*Updated: 2025-12-23*
*Status: Railway API operational, ready for Jan to use*

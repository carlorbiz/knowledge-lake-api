# Jan Direct API Connection to Knowledge Lake

**Simpler than MCP** - Connect Jan directly to the Railway Knowledge Lake API

---

## Configuration for Genspark/Jan

Since the MCP SSE endpoint requires full MCP protocol implementation, let's use the **direct API approach** instead:

### Option 1: Use Railway Knowledge Lake API Directly

**In Genspark, use the custom REST API feature instead of MCP:**

1. Go to Genspark Settings → Data Sources → **Custom API**
2. Configure:

**API Name:** `Knowledge Lake`

**Base URL:** `https://knowledge-lake-api-production.up.railway.app`

**Endpoints to configure:**

**1. Query Endpoint**
- Method: `POST`
- Path: `/api/query`
- Headers: `{"Content-Type": "application/json"}`
- Body:
```json
{
  "userId": 1,
  "query": "{{user_query}}",
  "limit": 20
}
```

**2. Get Conversations**
- Method: `GET`
- Path: `/api/conversations?userId=1&limit=50`
- Headers: `{"Content-Type": "application/json"}`

**3. Get Stats**
- Method: `GET`
- Path: `/api/stats`
- Headers: `{"Content-Type": "application/json"}`

---

## Test Jan's Connection

Ask Jan:
```
Call the Knowledge Lake API stats endpoint to see how many conversations are stored
```

Or:
```
Query the Knowledge Lake for conversations about "Railway deployment" or "multi-pass extraction"
```

---

## If Genspark Doesn't Have Custom API Feature

Use Jan as a **coding assistant** to make API calls:

Ask Jan:
```
Make a POST request to https://knowledge-lake-api-production.up.railway.app/api/query

Use this JSON body:
{
  "userId": 1,
  "query": "Railway deployment CVE issues",
  "limit": 10
}

Show me the results.
```

Jan can execute Python/curl commands to query the Knowledge Lake directly!

---

## Available API Endpoints

All accessible at `https://knowledge-lake-api-production.up.railway.app`:

**Health Check**
```
GET /health
```

**Query (Semantic Search)**
```
POST /api/query
{
  "userId": 1,
  "query": "your search query",
  "limit": 20
}
```

**Get All Conversations**
```
GET /api/conversations?userId=1&limit=50
```

**Get Specific Conversation**
```
GET /api/conversations/{id}
```

**Get Statistics**
```
GET /api/stats
```

**Ingest New Conversation**
```
POST /api/conversations
{
  "userId": 1,
  "agent": "jan",
  "date": "2025-12-22",
  "topic": "Your conversation topic",
  "content": "Full conversation content",
  "entities": [],
  "relationships": [],
  "metadata": {}
}
```

---

## Why This Works Better Than MCP (For Now)

✅ **No localhost dependency** - Works from anywhere
✅ **Already deployed** - Railway API is live
✅ **Simpler setup** - Just configure API endpoints
✅ **Same data** - Access to all 150+ conversations
✅ **No bridge needed** - Direct connection

---

## Example: Jan Queries Knowledge Lake via Python

```python
import requests

# Query the Knowledge Lake
response = requests.post(
    "https://knowledge-lake-api-production.up.railway.app/api/query",
    json={
        "userId": 1,
        "query": "How did we fix the Railway deployment blocker?",
        "limit": 10
    }
)

results = response.json()
print(f"Found {len(results.get('conversations', []))} conversations")

for conv in results.get('conversations', []):
    print(f"\n{conv['topic']} ({conv['date']})")
    print(f"Agent: {conv['agent']}")
```

Ask Jan to run this code and it will query the Knowledge Lake!

---

*This approach bypasses the MCP complexity and gets Jan connected to the Knowledge Lake immediately.*

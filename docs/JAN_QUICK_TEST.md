# Jan - Test Knowledge Lake Access (30 seconds)

## Copy-Paste This to Jan

Ask Jan to run this **exact command**:

### Python Version (RECOMMENDED)
```bash
python C:\Users\carlo\Development\mem0-sync\mem0\scripts\jan_query_knowledge_lake.py "Railway deployment"
```

**Expected:** Jan will see 152 conversations in database and search results about Railway.

---

### Curl Version (Alternative)
```bash
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query -H "Content-Type: application/json" -d "{\"userId\": 1, \"query\": \"Railway\", \"limit\": 5}"
```

**Expected:** JSON response with 5 conversations about Railway deployment.

---

## What This Proves

✅ Jan can access Knowledge Lake API
✅ Jan can query 152 conversations from AAE Council
✅ Jan can search for topics (Railway, Nera, multi-pass, etc.)
✅ No MCP needed - direct API works perfectly

---

## Sample Queries for Jan

```bash
# Search for Nera launch info
python scripts/jan_query_knowledge_lake.py "Nera embedded AI"

# Find multi-pass extraction conversations
python scripts/jan_query_knowledge_lake.py "multi-pass learning extraction"

# Get recent architecture discussions
python scripts/jan_query_knowledge_lake.py "hybrid architecture plan"

# Check database stats
curl https://knowledge-lake-api-production.up.railway.app/api/stats
```

---

## Jan is Now Part of AAE Council

Jan can now:
1. **Query** - Search all conversations from Claude, Fred, CC, Manus
2. **Learn** - See what other agents discussed about any topic
3. **Context** - Get full conversation history for decision-making

**Next:** When Jan completes work, you can ingest his conversations to Knowledge Lake so other agents can learn from Jan's insights.

---

*Test completed: 2025-12-23*
*Status: ✅ Jan has full Knowledge Lake access via Railway API*

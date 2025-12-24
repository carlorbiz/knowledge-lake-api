# Integrating Jan (Genspark) with Knowledge Lake

## Overview

Jan (Genspark) can access the Knowledge Lake through **3 different methods**:

1. **MCP Server Integration** (via HTTP bridge) - RECOMMENDED
2. **Direct Supabase Database Access** (if you migrate to Supabase)
3. **Railway PostgreSQL Direct Access** (requires Supabase connector)

---

## Option 1: MCP Server Integration (RECOMMENDED)

### Why This Option?
- ✅ Works with current PostgreSQL on Railway (no migration needed)
- ✅ Same API as Claude, Fred, and other council members
- ✅ Secure - goes through Knowledge Lake API layer
- ✅ Works NOW - ready in 5 minutes

### Setup Steps

#### Step 1: Start MCP HTTP Bridge

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
pip install flask flask-cors
python scripts/mcp_http_bridge.py
```

You'll see:
```
Knowledge Lake MCP HTTP Bridge
Starting server on http://localhost:5001

Endpoints:
  GET  /health                - Health check
  POST /mcp/ingest            - Ingest conversation
  POST /mcp/query             - Query Knowledge Lake
  POST /mcp/extract-learning  - Extract learning patterns
  POST /mcp/archive           - Archive conversations
  GET  /mcp/sse               - Server-Sent Events stream
```

#### Step 2: Configure Jan/Genspark

In the Genspark "Add new MCP server" dialog (the screenshot you showed):

**Server Name:** `Knowledge Lake`

**Server Type:** ☑ **SSE** (Server-Sent Events)

**Server URL:** `http://localhost:5001/mcp/sse`

**Description:**
```
AAE Knowledge Lake - Shared memory across all council members.
Query conversations, ingest new knowledge, extract learnings.
```

**Request Header:** (leave as default or add auth if needed)
```json
{"Content-Type": "application/json"}
```

Click **"Add Server"**

#### Step 3: Test Jan's Connection

In Jan/Genspark, ask:

```
Query the Knowledge Lake for "Railway deployment CVE issues"
```

Jan should be able to:
- Search conversations in Knowledge Lake
- Retrieve context from past discussions
- See what other council members (Claude, Fred, etc.) discussed

### Available Commands for Jan

Once connected, Jan can use these operations:

**1. Query Knowledge Lake**
```json
POST /mcp/query
{
  "query": "How did we fix the Railway deployment blocker?",
  "limit": 20
}
```

**2. Ingest Conversations**
```json
POST /mcp/ingest
{
  "topic": "Jan conversation about X",
  "content": "Full conversation content...",
  "metadata": {
    "agent": "jan",
    "session_id": "jan-2025-12-22"
  }
}
```

**3. Extract Learning Patterns**
```json
POST /mcp/extract-learning
{
  "conversationIds": [152],
  "dimensions": ["insights", "methodology"]
}
```

---

## Option 2: Direct Supabase Database Access

### If You Migrate Knowledge Lake to Supabase

**Why Supabase?**
- Jan has native Supabase connector
- Real-time subscriptions (conversations update live)
- Better for multi-agent collaboration
- Same PostgreSQL underneath (migration is easy)

### Migration Steps (If You Choose This)

#### 1. Create Supabase Project
1. Go to supabase.com
2. Create new project: "knowledge-lake"
3. Note your connection strings

#### 2. Export Railway PostgreSQL
```bash
railway run pg_dump DATABASE_URL > knowledge_lake_backup.sql
```

#### 3. Import to Supabase
```bash
psql "postgresql://postgres:[password]@[supabase-ref].supabase.co:5432/postgres" < knowledge_lake_backup.sql
```

#### 4. Update Knowledge Lake API Config
```python
# In api_server.py or .env
DATABASE_URL=postgresql://postgres:[password]@[supabase-ref].supabase.co:5432/postgres
```

#### 5. Configure Jan's Supabase Connector

In Genspark Data Sources → Supabase:
- **Project URL:** `https://[your-ref].supabase.co`
- **API Key:** (from Supabase project settings)
- **Database:** `knowledge_lake`

Jan can then directly query:
```sql
SELECT * FROM conversations WHERE topic ILIKE '%Railway%';
SELECT * FROM entities WHERE entityType = 'insight';
```

### Pros/Cons of Supabase Migration

**Pros:**
- ✅ Jan gets native database access
- ✅ Real-time updates across all agents
- ✅ Free tier generous (500MB database)
- ✅ Built-in auth, storage, edge functions

**Cons:**
- ⏱️ Requires migration (30 min work)
- 💰 May exceed free tier with heavy usage
- 🔄 Need to update all connection strings

**Recommendation:** Stick with Railway + MCP HTTP bridge for now. Migrate to Supabase later if Jan's integration becomes critical.

---

## Option 3: Railway PostgreSQL Direct Access

### If You Want Jan to Query Railway Directly

**Issue:** Genspark's Supabase connector won't work with Railway PostgreSQL (different API)

**Solution:** Expose Railway PostgreSQL publicly and use generic SQL connector

#### Warning
⚠️ **Security Risk** - Exposing PostgreSQL publicly requires:
- Firewall rules (IP whitelist)
- Strong passwords
- SSL/TLS encryption
- Monitoring for unusual queries

**Not Recommended** - Use MCP HTTP bridge (Option 1) instead for security.

---

## Comparison Table

| Method | Setup Time | Security | Features | Maintenance |
|--------|-----------|----------|----------|-------------|
| **MCP HTTP Bridge** | 5 min | ✅ Secure (API layer) | ✅ Full API access | ⚠️ Run bridge server |
| **Supabase Migration** | 30 min | ✅ Secure (built-in) | ✅✅ Real-time + native | ✅ Managed service |
| **Direct PostgreSQL** | 15 min | ❌ Risk (public DB) | ⚠️ SQL only | ⚠️ Manual security |

---

## Recommended Setup: MCP HTTP Bridge + Auto-Start

### Make MCP Bridge Always Available

Create a startup script:

**File:** `C:\Users\carlo\startup\start_kl_bridge.bat`
```batch
@echo off
cd C:\Users\carlo\Development\mem0-sync\mem0
python scripts/mcp_http_bridge.py
```

**Add to Windows Startup:**
1. Press `Win + R`
2. Type `shell:startup`
3. Create shortcut to `start_kl_bridge.bat`

Now the bridge runs on boot, and Jan can always connect to Knowledge Lake!

---

## Testing Jan's Integration

### Test 1: Query Knowledge Lake
Ask Jan:
```
Query the Knowledge Lake for conversations about "multi-pass extraction architecture"
```

Expected: Jan returns Conversation #152 and related discussions

### Test 2: Ingest Jan Conversation
After talking with Jan, ask:
```
Ingest this conversation to the Knowledge Lake so other council members can learn from it
```

Expected: Jan creates new conversation entry in Knowledge Lake

### Test 3: Council Collaboration
1. Ask Claude GUI: "What did Jan discover about X?"
2. Claude queries Knowledge Lake
3. Claude sees Jan's ingested conversations
4. Council members can now collaborate asynchronously!

---

## AAE Council with Jan

Once Jan is connected, the full council becomes:

| Agent | Access Method | Specialization |
|-------|--------------|----------------|
| **Claude GUI** | Knowledge Lake MCP (Python stdio) | Strategic planning, architecture |
| **Claude Code (CC)** | Knowledge Lake MCP (Python stdio) | Technical implementation, coding |
| **Fred** | Unified MCP (TypeScript) | Content generation, analysis |
| **Gemini** | (Pending integration) | Multi-modal, visual analysis |
| **Jan (Genspark)** | **MCP HTTP Bridge (SSE)** | Research, deep analysis, Supabase |
| **Manus** | Manus Task Manager MCP | Async task execution |
| **Penny, Pete, Colin, Grok, etc.** | (Pending) | Various specializations |

Jan brings **unique capabilities:**
- Web search integration
- Supabase connectors (if we migrate)
- Real-time collaboration
- Research-focused workflows

---

## Next Steps

1. **Start MCP HTTP Bridge** - Run `python scripts/mcp_http_bridge.py`
2. **Configure Jan** - Add MCP server using settings above
3. **Test Connection** - Ask Jan to query Knowledge Lake
4. **Ingest Jan Conversations** - Enable knowledge sharing across council
5. **Optional: Migrate to Supabase** - If Jan's integration becomes critical

---

## Troubleshooting

### Jan Can't Connect to MCP Bridge
**Check:**
- Is `mcp_http_bridge.py` running? (Should see "Starting server on http://localhost:5001")
- Firewall blocking port 5001?
- Try health check: `curl http://localhost:5001/health`

### Jan Queries Return Empty Results
**Check:**
- Is Knowledge Lake populated? (Should have 150+ conversations)
- Test query directly: `curl -X POST http://localhost:5001/mcp/query -H "Content-Type: application/json" -d '{"query": "test"}'`

### MCP Bridge Crashes
**Check:**
- Python dependencies installed? (`pip install flask flask-cors`)
- Knowledge Lake MCP path correct? (Check line 16 in `mcp_http_bridge.py`)

---

*Integration guide created: 2025-12-22*
*For questions: Check with Claude GUI or CC*

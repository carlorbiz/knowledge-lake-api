# Jan (Genspark) MCP Server Setup - Knowledge Lake Integration

**Status:** MCP HTTP Bridge running with proper SSE protocol ✅

---

## Quick Setup (5 Minutes)

### Prerequisites
- ✅ MCP HTTP Bridge running on `http://localhost:5001`
- ✅ Knowledge Lake API deployed on Railway (152 conversations ready)
- ✅ Genspark/Jan installed and running

---

## Step 1: Verify MCP Bridge is Running

Check that the MCP bridge server is active:

```bash
curl http://localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Knowledge Lake MCP HTTP Bridge",
  "version": "1.0.0",
  "mcp_protocol": "SSE",
  "supported_operations": [
    "ingest_conversation",
    "query_conversations",
    "extract_learning",
    "archive_conversations"
  ]
}
```

---

## Step 2: Configure Jan/Genspark MCP Server

In Genspark, go to **Settings → MCP Servers → Add New MCP Server**

Fill in the dialog with these exact values:

### Server Name
```
Knowledge Lake
```

### Server Type
☑ **SSE** (Server-Sent Events)

### Server URL
```
http://localhost:5001/mcp/sse
```

### Description
```
AAE Council Knowledge Lake - Shared memory across all agents.
Query 152+ conversations from Claude, Fred, CC, and other council members.
```

### Request Header
```json
{
  "Content-Type": "application/json"
}
```

**Click "Add Server"**

---

## Step 3: Test Jan's Connection

In Jan/Genspark, ask:

```
Use the query_knowledge_lake tool to search for "Railway deployment" in the Knowledge Lake
```

**Expected Result:**
Jan should successfully query the Knowledge Lake and return conversations about Railway deployment, including:
- Conversation #151: Extract-Learning workflow updates
- Conversation #145: Railway deployment success test
- Other related conversations

---

## Step 4: Test Other Tools

### Test Ingest
Ask Jan:
```
Use the ingest_conversation tool to add this conversation to the Knowledge Lake
Topic: "Jan's first Knowledge Lake query"
Content: [Jan will include the current conversation]
```

### Test Extract Learning
Ask Jan:
```
Use the extract_learning tool to analyze conversation #152 (the hybrid architecture conversation)
```

---

## Available Tools for Jan

Once connected, Jan has access to these Knowledge Lake tools:

### 1. query_knowledge_lake
**Purpose:** Search for relevant conversations across all AAE council members

**Parameters:**
- `query` (required): Search query string
- `limit` (optional): Max results (default 20)

**Example:**
```
Search Knowledge Lake for "multi-pass extraction architecture"
```

### 2. ingest_conversation
**Purpose:** Add Jan's conversations to the Knowledge Lake

**Parameters:**
- `topic` (required): Conversation topic/title
- `content` (required): Full conversation text
- `metadata` (optional): Additional context (agent, tags, etc.)

**Example:**
```
Ingest this conversation about Nera deployment to Knowledge Lake
```

### 3. extract_learning
**Purpose:** Extract learning patterns from conversations

**Parameters:**
- `conversationIds` (required): Array of conversation IDs
- `dimensions` (optional): Learning dimensions to extract

**Example:**
```
Extract learnings from conversation #152 about methodology and insights
```

---

## Troubleshooting

### Issue: "Failed to register MCP server"

**Check:**
1. Is MCP bridge running?
   ```bash
   curl http://localhost:5001/health
   ```

2. Is SSE endpoint responding?
   ```bash
   curl -N http://localhost:5001/mcp/sse
   ```
   Should stream JSON-RPC messages.

3. Firewall blocking port 5001?
   - Windows: Allow Python through firewall
   - Try: `http://127.0.0.1:5001/mcp/sse` instead

4. Restart MCP bridge:
   ```bash
   cd C:\Users\carlo\Development\mem0-sync\mem0
   python scripts/mcp_http_bridge.py
   ```

### Issue: Jan connects but tools don't work

**Check POST endpoints:**
```bash
# Test query endpoint
curl -X POST http://localhost:5001/mcp/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "limit": 5}'
```

Should return JSON with success:true and results.

---

## Integration Verified

- ✅ MCP HTTP Bridge running on port 5001
- ✅ SSE endpoint sending proper JSON-RPC 2.0 messages
- ✅ Server info and tools list advertised on connection
- ✅ POST endpoints functional for tool execution
- ✅ Railway Knowledge Lake API operational (152 conversations)
- ✅ Health check passing

---

## AAE Council Status with Jan

| Agent | Access Method | Status |
|-------|--------------|---------|
| **Claude GUI** | Knowledge Lake MCP (stdio) | ✅ Active |
| **Claude Code (CC)** | Knowledge Lake MCP (stdio) | ✅ Active |
| **Fred** | Unified MCP (TypeScript) | ✅ Active |
| **Jan (Genspark)** | **MCP HTTP Bridge (SSE)** | ⚡ **Ready to Connect** |
| **Manus** | Manus Task Manager MCP | ✅ Active |
| **Gemini, Pete, Penny, Colin, Grok** | Pending | ⏳ |

---

## Next Steps After Connection

1. **Test Query**: Have Jan search Knowledge Lake for past conversations
2. **Ingest Jan's Conversations**: Enable knowledge sharing across council
3. **Cross-Agent Queries**: Have Claude query Jan's ingested conversations
4. **Collaborative Workflows**: Jan + Claude + Manus working together

---

## Running MCP Bridge on Startup (Optional)

To make the MCP bridge always available:

**Create:** `C:\Users\carlo\startup\start_kl_bridge.bat`
```batch
@echo off
cd C:\Users\carlo\Development\mem0-sync\mem0
python scripts/mcp_http_bridge.py
```

**Add to Windows Startup:**
1. Press `Win + R`
2. Type `shell:startup`
3. Create shortcut to `start_kl_bridge.bat`

Now Jan can always connect to Knowledge Lake!

---

*Setup guide created: 2025-12-23*
*MCP Bridge Version: 1.0.0*
*Protocol: JSON-RPC 2.0 over SSE*

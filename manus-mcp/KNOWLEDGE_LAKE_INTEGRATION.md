# Manus MCP - Knowledge Lake Integration

**Date:** December 24, 2025
**Purpose:** Enable Manus MCP server to query and manage Knowledge Lake conversations
**Integration:** Production Knowledge Lake API on Railway

---

## Overview

The Manus MCP server now includes Knowledge Lake API integration, allowing it to:
- Query conversations from Knowledge Lake
- Retrieve complex conversations needing multi-pass extraction
- Check Knowledge Lake health status
- Get database statistics and classification breakdowns

---

## New Files Added

### 1. `knowledge_lake_client.py` (176 lines)

**Purpose:** Python client for Knowledge Lake API

**Key Classes:**
- `KnowledgeLakeClient` - Main API client with methods for:
  - `health_check()` - Verify API connectivity
  - `query_conversations()` - Search conversations
  - `get_complex_conversations()` - Get conversations needing extraction
  - `get_conversation()` - Get specific conversation by ID
  - `update_conversation_extracted()` - Mark conversation as extracted
  - `get_stats()` - Get database statistics

**Configuration:**
- API URL: `https://knowledge-lake-api-production.up.railway.app`
- Timeout: 30 seconds
- User ID: 1 (default)

---

## New MCP Tools

### 1. query_knowledge_lake
**Purpose:** Search for conversations in Knowledge Lake

**Parameters:**
- `query` (str): Search terms (empty = all conversations)
- `limit` (int): Max results (default: 10)

**Returns:**
```json
{
  "success": true,
  "count": 10,
  "query": "hybrid architecture",
  "conversations": [...]
}
```

**Example:**
```python
await query_knowledge_lake(query="hybrid architecture", limit=5)
```

### 2. get_complex_conversations
**Purpose:** Get conversations flagged for multi-pass extraction

**Parameters:**
- `only_pending` (bool): Filter to unextracted only (default: True)
- `limit` (int): Max results (default: 50)

**Returns:**
```json
{
  "success": true,
  "count": 7,
  "only_pending": true,
  "total_words": 313265,
  "avg_complexity_score": 78.5,
  "conversations": [
    {
      "id": 165,
      "topic": "2025-12-06 Hybrid Architecture",
      "complexity_classification": "complex",
      "complexity_score": 95.0,
      "word_count": 184304,
      "requires_multipass": true,
      "multipass_extracted": true
    },
    ...
  ]
}
```

**Example:**
```python
await get_complex_conversations(only_pending=True, limit=10)
```

### 3. get_knowledge_lake_stats
**Purpose:** Get overall database statistics

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "stats": {
    "total_conversations": 169,
    "total_entities": 133,
    "total_relationships": 0
  },
  "classification_breakdown": {
    "simple": 162,
    "complex": 7
  },
  "pending_multipass": 0
}
```

**Example:**
```python
await get_knowledge_lake_stats()
```

### 4. check_knowledge_lake_health
**Purpose:** Verify API connectivity

**Parameters:** None

**Returns:**
```json
{
  "success": true,
  "api_url": "https://knowledge-lake-api-production.up.railway.app",
  "healthy": true,
  "message": "Knowledge Lake API is healthy"
}
```

**Example:**
```python
await check_knowledge_lake_health()
```

---

## Usage Examples

### Scenario 1: Find Conversations to Extract

```python
# Check what needs extraction
result = await get_complex_conversations(only_pending=True, limit=10)

# Result shows 7 conversations with 313,265 total words
# Avg complexity score: 78.5

# Assign extraction tasks for each pending conversation
for conv in result['conversations']:
    await assign_task(
        description=f"Extract learnings from {conv['topic']}",
        context=f"Conversation ID: {conv['id']}, {conv['word_count']} words",
        priority="high" if conv['complexity_score'] > 80 else "medium"
    )
```

### Scenario 2: Search for Specific Topics

```python
# Find conversations about specific topics
result = await query_knowledge_lake(
    query="hybrid architecture multi-pass",
    limit=5
)

# Returns conversations matching search terms
print(f"Found {result['count']} conversations")
```

### Scenario 3: Monitor Knowledge Lake Status

```python
# Check API health before batch operations
health = await check_knowledge_lake_health()

if health['healthy']:
    # Get current stats
    stats = await get_knowledge_lake_stats()
    print(f"Total conversations: {stats['stats']['total_conversations']}")
    print(f"Pending extractions: {stats['pending_multipass']}")
```

---

## Integration with Task Delegation

### Automated Workflow

1. **Claude Code detects complex conversation**
   - Context threshold exceeded (25%)
   - Word count > 5,000
   - Topic shifts > 3

2. **Assigns task to Manus**
   ```python
   await assign_task(
       description="Multi-pass extraction for conversation XYZ",
       context="Conversation ID: 165, 184,304 words",
       priority="high"
   )
   ```

3. **Manus polls for pending tasks**
   - Checks task queue every 60 seconds
   - Retrieves conversation details from Knowledge Lake
   - Runs `multipass_extract.py`

4. **Updates Knowledge Lake after extraction**
   ```python
   client = get_knowledge_lake_client()
   client.update_conversation_extracted(
       conversation_id=165,
       extraction_results={
           'thread_count': 74,
           'connection_count': 2301,
           'learning_count': 123,
           'insight_count': 59
       }
   )
   ```

---

## Current Status

### Implemented ✅

- [x] Knowledge Lake client library
- [x] MCP tools for querying conversations
- [x] MCP tools for getting complex conversations
- [x] MCP tools for stats and health checks
- [x] Integration with Manus task manager

### Pending 🚧

- [ ] `update_conversation_extracted` endpoint in Knowledge Lake API
- [ ] Manus polling worker for automated task execution
- [ ] Automatic task assignment triggers
- [ ] Results webhook for Notion/Google Drive sync

---

## API Endpoint Coverage

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/health` | GET | Health check | ✅ Implemented |
| `/api/stats` | GET | Database stats | ✅ Implemented |
| `/api/query` | POST | Search conversations | ✅ Implemented |
| `/api/conversations/{id}` | GET | Get conversation | ⚠️ Derived from query |
| `/api/conversations/{id}` | PATCH | Update conversation | 🚧 Not yet implemented |

---

## Testing

### Test Knowledge Lake Connection

```bash
# Start Manus MCP server (requires VS Code reload)
# In Claude Code conversation:

"Check if Knowledge Lake is healthy"
# Uses: check_knowledge_lake_health()

"Get Knowledge Lake statistics"
# Uses: get_knowledge_lake_stats()
```

### Test Conversation Queries

```bash
# In Claude Code conversation:

"Find all complex conversations needing extraction"
# Uses: get_complex_conversations(only_pending=True)

"Search for conversations about 'multi-pass extraction'"
# Uses: query_knowledge_lake(query="multi-pass extraction", limit=5)
```

---

## Error Handling

All MCP tools return structured JSON with `success` flag:

**Success Response:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

**Common Errors:**
- API timeout (30s limit)
- Network connectivity issues
- Invalid conversation IDs
- Missing endpoints (PATCH not implemented yet)

---

## Future Enhancements

### Phase 1 (Day 4)
- [ ] Implement `PATCH /api/conversations/{id}` in Knowledge Lake API
- [ ] Add automated task execution worker
- [ ] Build delegation triggers based on context usage

### Phase 2 (Week 2)
- [ ] Bidirectional sync with Notion queue
- [ ] Google Drive archival automation
- [ ] Agent workload balancing

### Phase 3 (Future)
- [ ] Real-time conversation classification
- [ ] Automatic priority calculation
- [ ] Multi-agent coordination for large extractions

---

## Related Documentation

- [Manus MCP Server README](../manus-mcp/README.md)
- [Knowledge Lake API Status](../docs/KNOWLEDGE_LAKE_API_STATUS.md)
- [Multi-Pass Extraction Tool](../scripts/multipass_extract.py)
- [GUI Delegation Test Plan](../docs/GUI_DELEGATION_TEST.md)

---

*Integration Complete: 2025-12-24*
*MCP Tools Added: 4 (query, get_complex, stats, health)*
*Knowledge Lake API: Production (Railway)*
*Status: Ready for testing*

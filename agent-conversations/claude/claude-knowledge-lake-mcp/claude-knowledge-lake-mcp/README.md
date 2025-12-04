# Claude Knowledge Lake MCP Server

**Part of Carla's AI Automation Ecosystem (AAE)**

This MCP server enables Claude to directly interact with the Knowledge Lake, providing:

1. **Real-time ingestion** - Push valuable conversations to Knowledge Lake during active sessions
2. **Cross-council queries** - Search for context from conversations with other AI council members
3. **Statistics & health** - Monitor Knowledge Lake status and content distribution

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Knowledge Lake API running (locally or on Railway)
- MCP-compatible client (Claude Desktop, etc.)

### Installation

```bash
# Clone/download the project
cd claude-knowledge-lake-mcp

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

1. Copy `.env.example` to `.env` (or edit `config.py` directly):

```bash
# .env
KNOWLEDGE_LAKE_BASE_URL=http://localhost:5002
```

2. For Railway deployment, update the URL:

```bash
KNOWLEDGE_LAKE_BASE_URL=https://your-knowledge-lake.up.railway.app
```

### Running the Server

**Local (stdio transport):**
```bash
python server.py
```

**Remote (HTTP transport):**
```bash
python server.py --http --port 8080
```

## 🛠️ Tools Available

### 1. `knowledge_lake_ingest`

Push a conversation or insight to the Knowledge Lake.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | ✅ | Brief topic/title |
| `content` | string | ✅ | Full content to store |
| `conversation_date` | string | ❌ | YYYY-MM-DD format |
| `entities` | array | ❌ | Extracted entities |
| `relationships` | array | ❌ | Entity relationships |
| `metadata` | object | ❌ | Additional metadata |
| `response_format` | string | ❌ | "markdown" or "json" |

**Example:**
```json
{
  "topic": "AAE Dashboard Architecture Discussion",
  "content": "Discussed the architecture for the AAE dashboard...",
  "entities": [
    {
      "name": "AAE Dashboard",
      "entityType": "Technology",
      "confidence": 0.95,
      "description": "Central control panel for AI automation",
      "sourceContext": "Main topic of discussion"
    }
  ],
  "metadata": {
    "businessArea": "AAE Development",
    "qualityRating": "High"
  }
}
```

### 2. `knowledge_lake_query`

Search the Knowledge Lake for relevant conversations and entities.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | Search query |
| `agent_filter` | string | ❌ | Filter by agent (e.g., "Manus") |
| `entity_type_filter` | string | ❌ | Filter by entity type |
| `limit` | integer | ❌ | Max results (default 20) |
| `response_format` | string | ❌ | "markdown" or "json" |

**Example:**
```json
{
  "query": "n8n workflow automation",
  "agent_filter": "Fred",
  "limit": 10
}
```

### 3. `knowledge_lake_stats`

Get statistics and verify API connectivity.

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `response_format` | string | ❌ | "markdown" or "json" |

## 📊 Entity Types

| Type | Use For |
|------|---------|
| `Agents` | AI assistants (Claude, Manus, Fred) |
| `Technology` | Tools, platforms (Notion, GitHub, n8n) |
| `ExecutiveAI` | AI strategy, governance |
| `Content` | Documents, courses |
| `Consulting` | Business processes |
| `ClientIntelligence` | Client insights |

## 🔗 Relationship Types

| Type | Meaning |
|------|---------|
| `uses` | One entity utilises another |
| `integrates_with` | Technical integration |
| `requires` | Dependency |
| `discusses` | Mentioned together |
| `approves` | Authorisation |
| `implements` | Implementation |

## 🧪 Testing

### Test API Connectivity

```bash
curl http://localhost:5002/health
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector python server.py
```

### Manual Test (Python)

```python
import asyncio
from knowledge_lake import KnowledgeLakeClient

async def test():
    client = KnowledgeLakeClient()
    
    # Check health
    health = await client.check_health()
    print(f"Health: {health}")
    
    # Test ingestion
    result = await client.ingest_conversation(
        topic="Test Conversation",
        content="This is a test from the MCP server."
    )
    print(f"Ingestion: {result}")

asyncio.run(test())
```

## 📁 Project Structure

```
claude-knowledge-lake-mcp/
├── server.py           # Main MCP server
├── knowledge_lake.py   # API client
├── models.py           # Pydantic models
├── config.py           # Configuration
├── requirements.txt    # Dependencies
└── README.md           # This file
```

## 🔧 Troubleshooting

### "Could not connect to Knowledge Lake"

1. Verify the API is running: `curl http://localhost:5002/health`
2. Check the URL in `config.py` or `.env`
3. For Railway, ensure the deployment is active

### "Request timed out"

1. The Knowledge Lake may be under heavy load
2. Increase `REQUEST_TIMEOUT` in `config.py`
3. Check Railway logs for errors

### Entity validation errors

Ensure entity types match exactly:
- `Agents`, `Technology`, `ExecutiveAI`, `Content`, `Consulting`, `ClientIntelligence`

## 🔄 Integration with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "knowledge-lake": {
      "command": "python",
      "args": ["/path/to/claude-knowledge-lake-mcp/server.py"],
      "env": {
        "KNOWLEDGE_LAKE_BASE_URL": "http://localhost:5002"
      }
    }
  }
}
```

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-30 | Initial release |

---

**Questions?** Check the main AAE documentation or raise an issue.

*Built for Carla's AI Automation Ecosystem* 🤖

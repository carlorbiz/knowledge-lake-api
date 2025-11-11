# VibeSDK N8N API Integration Guide

## 🚀 Overview

Your VibeSDK deployment at **https://vibe.mtmot.com** now has a complete REST API that you can use with N8N, Zapier, and other automation platforms for:

- **Cross-agent memory sharing** via Mem0
- **AI Brain context retrieval** via Knowledge Lake
- **Code generation** and app creation
- **Platform monitoring** and metrics

---

## 🔑 Authentication

All API requests require authentication. Use one of these methods:

### Method 1: API Key (Recommended for N8N)
```http
Authorization: Bearer YOUR_API_KEY
```

### Method 2: Session Cookie
Use the session cookie from your browser login.

---

## 📡 Memory & Knowledge Lake API Endpoints

### Base URL
```
https://vibe.mtmot.com/api/memory
```

### 1. Add Memory
Store a memory entry for cross-agent sharing.

**Endpoint:** `POST /api/memory/add`

**Request Body:**
```json
{
  "content": "User prefers concise responses with code examples",
  "metadata": {
    "source": "chat",
    "category": "preference",
    "tags": ["communication", "style"]
  },
  "userId": "carla@carlorbiz.com.au",
  "agentId": "manus-agent-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mem_abc123",
    "content": "User prefers concise responses with code examples",
    "created_at": "2025-11-08T08:00:00Z"
  }
}
```

**N8N HTTP Request Node Configuration:**
- **Method:** POST
- **URL:** `https://vibe.mtmot.com/api/memory/add`
- **Authentication:** Bearer Token
- **Body:** JSON (see above)

---

### 2. Search Memories
Search for relevant memories by query.

**Endpoint:** `POST /api/memory/search`

**Request Body:**
```json
{
  "query": "user communication preferences",
  "userId": "carla@carlorbiz.com.au",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "user communication preferences",
    "count": 3,
    "memories": [
      {
        "id": "mem_abc123",
        "content": "User prefers concise responses",
        "score": 0.95,
        "metadata": {...}
      }
    ]
  }
}
```

**N8N Use Case:**
Before responding to a user, search memories to personalize the response.

---

### 3. Get User Memories
Retrieve all memories for a specific user.

**Endpoint:** `GET /api/memory/user/:userId`

**Example:**
```
GET https://vibe.mtmot.com/api/memory/user/carla@carlorbiz.com.au
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "carla@carlorbiz.com.au",
    "count": 15,
    "memories": [...]
  }
}
```

---

### 4. Query Knowledge Lake
Search your AI Brain for context and information.

**Endpoint:** `POST /api/memory/knowledge/query`

**Request Body:**
```json
{
  "query": "AAE dashboard architecture",
  "userId": "carla@carlorbiz.com.au",
  "limit": 5,
  "filters": {
    "category": "technical",
    "project": "aae-ecosystem"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "AAE Dashboard uses React + TypeScript...",
        "source": "documentation",
        "relevance": 0.92
      }
    ]
  }
}
```

**N8N Use Case:**
Query your knowledge base before generating code or answering questions.

---

### 5. Get Agent Context
Get combined context from both Mem0 and Knowledge Lake.

**Endpoint:** `POST /api/memory/context`

**Request Body:**
```json
{
  "agentId": "fred-chatgpt",
  "query": "How should I respond to Carla?",
  "userId": "carla@carlorbiz.com.au"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "fred-chatgpt",
    "query": "How should I respond to Carla?",
    "memories": [...],
    "knowledge": {...}
  }
}
```

**N8N Use Case:**
Get full context before an agent responds to ensure consistency.

---

### 6. Delete Memory
Remove a specific memory by ID.

**Endpoint:** `DELETE /api/memory/:memoryId`

**Example:**
```
DELETE https://vibe.mtmot.com/api/memory/mem_abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memoryId": "mem_abc123",
    "deleted": true
  }
}
```

---

## 🤖 Code Generation API

### Create App
Generate a complete application from a prompt.

**Endpoint:** `POST /api/agent/create`

**Request Body:**
```json
{
  "query": "Create a todo list app with dark mode",
  "agentMode": "deterministic",
  "userId": "carla@carlorbiz.com.au"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "chat_xyz789",
    "status": "generating",
    "url": "https://vibe.mtmot.com/chat/chat_xyz789"
  }
}
```

---

## 📊 Example N8N Workflows

### Workflow 1: Cross-Agent Memory Sync
```
1. Webhook Trigger (from Manus/Claude/Fred)
2. HTTP Request: POST /api/memory/add
3. Store conversation context
4. Send confirmation to Slack
```

### Workflow 2: Context-Aware Response
```
1. Slack Message Trigger
2. HTTP Request: POST /api/memory/search (get user preferences)
3. HTTP Request: POST /api/memory/knowledge/query (get relevant info)
4. OpenAI Node (with context from steps 2-3)
5. Reply to Slack with personalized response
```

### Workflow 3: Knowledge Lake Query
```
1. Schedule Trigger (daily)
2. HTTP Request: POST /api/memory/knowledge/query
3. Summarize new information
4. Email summary to user
```

---

## 🔗 N8N HTTP Request Node Template

### Generic Template
```json
{
  "method": "POST",
  "url": "https://vibe.mtmot.com/api/memory/add",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "httpHeaderAuth": {
    "name": "Authorization",
    "value": "Bearer YOUR_API_KEY"
  },
  "sendBody": true,
  "bodyContentType": "json",
  "body": {
    "content": "={{ $json.content }}",
    "userId": "carla@carlorbiz.com.au",
    "agentId": "={{ $json.agentId }}"
  }
}
```

---

## 🌐 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/memory/add` | POST | Add new memory |
| `/api/memory/search` | POST | Search memories |
| `/api/memory/user/:userId` | GET | Get user memories |
| `/api/memory/:memoryId` | DELETE | Delete memory |
| `/api/memory/knowledge/query` | POST | Query Knowledge Lake |
| `/api/memory/context` | POST | Get combined context |
| `/api/agent/create` | POST | Create new app |
| `/api/agent/chat` | POST | Chat with agent |
| `/api/apps` | GET | List all apps |
| `/api/secrets` | GET/POST | Manage API keys |

---

## 🎯 Real-World Use Cases

### 1. **Multi-Agent Coordination**
- Fred (ChatGPT) stores task status in Mem0
- Manus queries the status before starting work
- Claude accesses shared context for code review

### 2. **Personalized Responses**
- Store user preferences in Mem0
- Query preferences before each response
- Maintain consistent communication style across agents

### 3. **Knowledge Base Integration**
- Query Knowledge Lake for project documentation
- Retrieve relevant context for code generation
- Access historical decisions and patterns

### 4. **Automated Workflows**
- N8N triggers on Slack message
- Queries Mem0 for user context
- Generates code via VibeSDK API
- Deploys to Cloudflare Workers

---

## 🔐 Security Best Practices

1. **Use API Keys:** Store in N8N credentials vault
2. **Rate Limiting:** Respect API rate limits
3. **Error Handling:** Always check `success` field in responses
4. **Data Privacy:** Don't store sensitive data in memories without encryption

---

## 📝 Environment Variables

Add these to your VibeSDK deployment (already configured):

```bash
MEM0_API_URL=https://web-production-e3e44.up.railway.app
MEM0_API_KEY=carla_mem0_2025
KNOWLEDGE_LAKE_API_URL=https://knowledge-lake-api-production.up.railway.app
```

---

## 🚀 Next Steps

1. **Test the APIs** using Postman or curl
2. **Create your first N8N workflow** with memory integration
3. **Set up cross-agent coordination** between Manus, Fred, and Claude
4. **Monitor usage** via the AAE Dashboard at `/aae-dashboard`

---

## 📞 Support

- **Documentation:** https://vibe.mtmot.com/docs
- **API Status:** https://vibe.mtmot.com/api/health
- **Dashboard:** https://vibe.mtmot.com/aae-dashboard

---

**Your AAE coordination platform is now fully operational! 🎉**

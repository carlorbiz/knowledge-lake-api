# Railway Deployment Guide - Knowledge Lake API

**Date**: November 30, 2025
**Purpose**: Deploy Knowledge Lake API to Railway for production access
**Why**: Enable remote access for Manus MCP, n8n workflows, and Aurelia avatar

---

## 🎯 Overview

This guide walks you through deploying the Knowledge Lake API to Railway, making it accessible to:
- ✅ **Manus MCP** (running in remote sandbox)
- ✅ **n8n workflows** (automation orchestration)
- ✅ **Aurelia avatar** (HeyGen middleware)
- ✅ **AAE Dashboard** (local and cloud ingestion)

---

## 📋 Prerequisites

1. **Railway account** - Sign up at [railway.app](https://railway.app)
2. **GitHub repository** - Your `mem0` repo must be on GitHub
3. **OpenAI API key** (optional) - For AI-enhanced entity extraction

---

## 🚀 Deployment Steps

### Step 1: Create New Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `mem0` repository
4. Railway will auto-detect Python and create the project

### Step 2: Configure Environment Variables

In Railway project settings → **Variables**, add:

```bash
# Required for mem0 functionality
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Railway sets PORT automatically, but you can override
# PORT=5002

# Environment identifier (Railway sets this automatically)
# RAILWAY_ENVIRONMENT=production
```

**Important**: Railway automatically sets the `PORT` environment variable. Your `start_knowledge_lake.py` already handles this.

### Step 3: Configure Build Settings

Railway should auto-detect these from your files:
- **Build Command**: Automatically uses `requirements.txt`
- **Start Command**: Uses `Procfile` → `web: python start_knowledge_lake.py`
- **Python Version**: Uses `runtime.txt` if present (otherwise latest)

### Step 4: Deploy

1. Click **"Deploy"** in Railway dashboard
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a public URL: `https://your-app-name.up.railway.app`

### Step 5: Verify Deployment

Test the health endpoint:

```bash
curl https://your-app-name.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "mem0_knowledge_lake",
  "version": "2.0_enhanced",
  "endpoints": {
    "legacy": ["/knowledge/search", "/knowledge/add", "/knowledge/context"],
    "conversations": ["/api/conversations/ingest", "/api/conversations"],
    "entities": ["/api/entities", "/api/relationships"],
    "aurelia": ["/api/aurelia/query", "/api/aurelia/context"]
  }
}
```

---

## 🔧 Post-Deployment Configuration

### Update AAE Dashboard Scripts

Update the Knowledge Lake URL in your environment:

```bash
# Windows PowerShell
$env:KNOWLEDGE_LAKE_URL="https://your-app-name.up.railway.app"

# Or create a .env file in aae-dashboard/
echo KNOWLEDGE_LAKE_URL=https://your-app-name.up.railway.app >> .env
```

### Update Manus MCP Configuration

Provide Manus with your Railway URL:

```python
# In Manus's knowledge_lake_client.py
knowledge_lake = KnowledgeLakeClient(
    base_url="https://your-app-name.up.railway.app"
)
```

### Update n8n Workflows

Update the Knowledge Lake API URL in your n8n HTTP Request nodes:

**Old**: `http://localhost:5002/api/conversations/ingest`
**New**: `https://your-app-name.up.railway.app/api/conversations/ingest`

---

## 📊 Testing the Deployment

### Test 1: Stats Endpoint

```bash
curl "https://your-app-name.up.railway.app/api/stats?userId=1"
```

### Test 2: Ingest Conversation

```bash
curl -X POST "https://your-app-name.up.railway.app/api/conversations/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "agent": "Claude",
    "date": "2024-11-30",
    "topic": "Test Deployment",
    "content": "Testing Railway deployment of Knowledge Lake API",
    "entities": [],
    "relationships": [],
    "metadata": {
      "source": "Railway deployment test"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "conversation": {
    "id": 1,
    "agent": "Claude",
    "topic": "Test Deployment"
  },
  "entitiesCreated": 0,
  "relationshipsCreated": 0,
  "timestamp": "2024-11-30T12:00:00.000000"
}
```

### Test 3: AAE Dashboard Dual-Write

From your AAE Dashboard directory:

```bash
cd github-projects/aae-dashboard
set KNOWLEDGE_LAKE_URL=https://your-app-name.up.railway.app
npx tsx scripts/ingest-conversation.ts test-conversation.md
```

You should see:
```
✅ DUAL-WRITE COMPLETE: Data synced to both D1 and Knowledge Lake
```

---

## 🌊 Data Persistence

**Important**: Railway uses **ephemeral storage** by default.

### Current Setup (In-Memory)
- All data stored in Python lists (`conversations_db`, `entities_db`, `relationships_db`)
- **Data is lost** when the Railway instance restarts
- mem0 uses qdrant vector store (also ephemeral by default)

### Recommended: Add PostgreSQL Persistence

To make data persistent across restarts:

1. **Add PostgreSQL to Railway**:
   - Railway Dashboard → **New** → **Database** → **PostgreSQL**
   - Railway will provide `DATABASE_URL` environment variable

2. **Update `api_server.py`** to use PostgreSQL instead of in-memory lists:
   - Replace Python lists with SQLAlchemy models
   - Store entities, relationships, conversations in PostgreSQL
   - Keep mem0 for semantic search (it has its own persistence)

3. **Migration Path**:
   - Phase 1: Deploy with in-memory storage (current state)
   - Phase 2: Add PostgreSQL and migrate to persistent storage
   - Phase 3: Add Supabase for advanced features

---

## 🔍 Monitoring and Logs

### View Railway Logs

Railway Dashboard → **Deployments** → **Latest** → **View Logs**

Look for startup message:
```
🚀 Starting Knowledge Lake API - Railway (Production)
📍 Port: $PORT
```

### Health Check Monitoring

Set up a cron job or uptime monitor to ping:
```
https://your-app-name.up.railway.app/health
```

Recommended services:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Better Uptime](https://betteruptime.com) (free tier)

---

## 🚨 Troubleshooting

### Issue: "Application failed to respond"

**Cause**: Railway couldn't start the server
**Fix**:
1. Check Railway logs for errors
2. Verify `requirements.txt` has all dependencies
3. Ensure `Procfile` points to correct file

### Issue: "Port already in use"

**Cause**: Hardcoded port in `api_server.py`
**Fix**: Ensure using `os.environ.get('PORT', 5002)` in `start_knowledge_lake.py`

### Issue: "mem0 initialization failed"

**Cause**: Missing OpenAI API key
**Fix**: Add `OPENAI_API_KEY` to Railway environment variables

### Issue: "Data disappears after restart"

**Expected Behavior**: In-memory storage is ephemeral
**Fix**: Implement PostgreSQL persistence (see above)

---

## 📈 Scaling Considerations

### Current Limits (Hobby Plan)
- 1 vCPU
- 512 MB RAM
- 1 GB storage (ephemeral)
- 100,000 requests/month

### When to Upgrade
- If you hit rate limits
- If you need more than 512 MB RAM for mem0 vectors
- If you add PostgreSQL (requires additional resources)

---

## 🔗 Integration URLs

Once deployed, update these configurations:

### AAE Dashboard
```bash
# .env file
KNOWLEDGE_LAKE_URL=https://your-app-name.up.railway.app
```

### Manus MCP
```python
# manus_knowledge_lake_client.py
KNOWLEDGE_LAKE_URL = "https://your-app-name.up.railway.app"
```

### n8n Workflows
- Update HTTP Request nodes
- Update webhook URLs if applicable

### Aurelia HeyGen Middleware
```javascript
// middleware/aurelia_knowledge.js
const KNOWLEDGE_LAKE_URL = "https://your-app-name.up.railway.app";
```

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Push latest code to GitHub
- [ ] Add `OPENAI_API_KEY` to Railway environment variables
- [ ] Verify `Procfile` exists and points to `start_knowledge_lake.py`
- [ ] Verify `requirements.txt` includes all dependencies
- [ ] Verify `railway.json` configuration

After deploying:
- [ ] Test `/health` endpoint
- [ ] Test `/api/stats?userId=1`
- [ ] Test conversation ingestion
- [ ] Test dual-write from AAE Dashboard
- [ ] Provide Railway URL to Manus
- [ ] Update n8n workflows
- [ ] Update environment variables in local `.env`

---

## 🎯 Next Steps After Deployment

1. **Ingest Historical Conversations**:
   ```bash
   cd github-projects/aae-dashboard
   set KNOWLEDGE_LAKE_URL=https://your-app-name.up.railway.app
   npx tsx scripts/batch-ingest.ts
   ```

2. **Configure Manus MCP**:
   - Share Railway URL with Manus
   - Test email workflow integration

3. **Update n8n Workflows**:
   - Replace localhost URLs
   - Test automated conversation ingestion

4. **Connect Aurelia Avatar**:
   - Update HeyGen middleware
   - Test real-time queries

5. **Monitor Usage**:
   - Set up uptime monitoring
   - Check Railway metrics dashboard

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Python Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [PostgreSQL Setup](https://docs.railway.app/databases/postgresql)

---

**🌊 Knowledge Lake API is now accessible to your entire AI ecosystem! 🧠✨**

*Last updated: November 30, 2025*

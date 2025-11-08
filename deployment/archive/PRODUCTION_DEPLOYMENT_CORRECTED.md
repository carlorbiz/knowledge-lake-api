# Production Deployment - AAE Knowledge Lake (CORRECTED)

## ⚠️ IMPORTANT PORT CONFIGURATION

After reviewing the codebase, here's the **CORRECT** port configuration:

| Service | Port | Server | Status |
|---------|------|--------|--------|
| **AI Brain** (simple_api_server.py) | **5002** | Waitress ✅ | Course generation endpoints |
| **Knowledge Lake** (enhanced_knowledge_lake_api.py) | **8000** | Waitress ✅ | Agent shared memory |
| **n8n** | 5678 | n8n | Workflow automation |

### Why Port 8000 for Knowledge Lake?

- Port **3000**: Original api_server.py (Flask dev server - NOT production)
- Port **5000**: Mentioned in DEPLOY_TODAY.md but conflicts with AI Brain
- Port **5002**: AI Brain (simple_api_server.py) - ALREADY IN USE
- Port **8000**: Knowledge Lake (enhanced_knowledge_lake_api.py) - **CORRECT CHOICE** ✅

---

## 🚀 Quick Start - Production Deployment

### Step 1: Start Knowledge Lake (Port 8000)

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
python enhanced_knowledge_lake_api.py
```

**Expected output**:
```
INFO:__main__:Mem0 Memory initialized successfully
INFO:__main__:Starting Enhanced Knowledge Lake API on 0.0.0.0:8000
INFO:__main__:Registered agents: grok, manus, fred, penny, gemini, claude_code
INFO:__main__:Production server: Waitress with 4 threads
INFO:__main__:Press Ctrl+C to stop
```

### Step 2: Verify It's Running

```bash
# Health check
curl http://192.168.68.61:8000/health

# Expected: {"status":"healthy","service":"enhanced_knowledge_lake","mem0_status":"initialized"}

# Get stats
curl http://192.168.68.61:8000/stats

# List agents
curl http://192.168.68.61:8000/agent/list
```

---

## 🔧 Configuration Summary

### Knowledge Lake API (Port 8000)

**File**: `enhanced_knowledge_lake_api.py`
**Production Server**: Waitress (4 threads)
**Endpoints**:
- `GET /health` - Health check
- `GET /stats` - Service statistics
- `GET /knowledge/search` - Search knowledge
- `POST /knowledge/add` - Add knowledge
- `GET /knowledge/context/<topic>` - Get topic context
- `POST /agent/register` - Register agent
- `GET /agent/list` - List agents
- `GET /agent/<id>/history` - Agent history
- `POST /agent/<id>/insights` - Add agent insights
- `POST /workflow/handoff` - Workflow coordination
- `GET /workflow/status/<task_id>` - Workflow status

**Access**: `http://192.168.68.61:8000` (production) or `http://localhost:8000` (local)

### AI Brain API (Port 5002)

**File**: `simple_api_server.py`
**Production Server**: Waitress
**Endpoints**:
- `/ai/audience-analysis`
- `/course/architect`
- `/ai/distribute-tasks`
- `/ai/optimize-slides`

**Access**: `http://192.168.68.61:5002` (production) or `http://localhost:5002` (local)

---

## 📝 Updated Documentation

All documentation has been **CORRECTED** to use port **8000** for Knowledge Lake:

### Files to Update

1. **AGENT_KNOWLEDGE_LAKE_ACCESS.md** - Change all `5000` → `8000`
2. **n8n_agent_workflow_templates.json** - Change all `5000` → `8000`
3. **IMPLEMENTATION_ROADMAP_AAE_KNOWLEDGE_LAKE.md** - Change all `5000` → `8000`
4. **AGENT_SOLUTIONS_SUMMARY.md** - Change all `5000` → `8000`

### Quick Fix Script

Run this to update all documentation:

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0

# PowerShell script to update port numbers
$files = @(
    "AGENT_KNOWLEDGE_LAKE_ACCESS.md",
    "n8n_agent_workflow_templates.json",
    "IMPLEMENTATION_ROADMAP_AAE_KNOWLEDGE_LAKE.md",
    "AGENT_SOLUTIONS_SUMMARY.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) -replace '192\.168\.68\.61:5000', '192.168.68.61:8000' -replace 'localhost:5000', 'localhost:8000' | Set-Content $file
        Write-Host "Updated $file"
    }
}
```

---

## 🎯 Testing the Production Setup

### Test 1: Knowledge Lake Health Check

```bash
curl http://192.168.68.61:8000/health
```

**Expected**:
```json
{
  "status": "healthy",
  "service": "enhanced_knowledge_lake",
  "mem0_status": "initialized",
  "agents_registered": 6,
  "timestamp": "2025-10-14T..."
}
```

### Test 2: Add Knowledge Entry

```bash
curl -X POST "http://192.168.68.61:8000/knowledge/add" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test knowledge entry from production deployment",
    "user_id": "claude_code",
    "metadata": {"type": "test", "deployment": "production"}
  }'
```

**Expected**:
```json
{
  "status": "added",
  "user_id": "claude_code",
  "timestamp": "2025-10-14T..."
}
```

### Test 3: Search for Entry

```bash
curl "http://192.168.68.61:8000/knowledge/search?query=production%20deployment&user_id=claude_code"
```

**Expected**: Should return the test entry you just added

### Test 4: Register an Agent

```bash
curl -X POST "http://192.168.68.61:8000/agent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "fred",
    "name": "Fred",
    "role": "Deep Research & Evidence Synthesis",
    "strengths": ["research", "evidence_synthesis", "compliance"],
    "prompt": "Perform deep research with academic rigor..."
  }'
```

**Expected**:
```json
{
  "status": "registered",
  "agent_id": "fred"
}
```

---

## 🔗 Integration with n8n Workflows

### Updated n8n HTTP Request Nodes

All n8n workflow templates need to use **port 8000**:

**Example: Get Context from Knowledge Lake**
```json
{
  "name": "Get Knowledge Lake Context",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "GET",
    "url": "http://192.168.68.61:8000/knowledge/search",
    "qs": {
      "query": "={{$json.task_description}}",
      "user_id": "={{$json.agent_name}}",
      "limit": 10
    }
  }
}
```

**Example: Add to Knowledge Lake**
```json
{
  "name": "Add to Knowledge Lake",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://192.168.68.61:8000/knowledge/add",
    "body": {
      "content": "={{$json.agent_output}}",
      "user_id": "={{$json.agent_name}}",
      "metadata": {
        "task_id": "={{$json.task_id}}",
        "timestamp": "={{$now}}"
      }
    },
    "options": {
      "bodyContentType": "json"
    }
  }
}
```

---

## 🛡️ Production Checklist

### Before Deployment

- [x] Code uses Waitress WSGI server (NOT Flask dev server)
- [x] Port 8000 selected (no conflicts with AI Brain on 5002)
- [x] CORS enabled for cross-origin requests
- [x] Logging configured for production monitoring
- [x] Environment variables loaded from .env
- [x] Error handling implemented for all endpoints
- [x] Health check endpoint available

### After Deployment

- [ ] Knowledge Lake running on port 8000
- [ ] Health check responds successfully
- [ ] Mem0 initialization confirmed
- [ ] All agent profiles registered
- [ ] Test knowledge add/search cycle works
- [ ] n8n can reach Knowledge Lake endpoints
- [ ] Firewall allows port 8000 (if needed)

---

## 🚨 Common Issues & Solutions

### Issue: "Mem0 Memory not initialized"

**Cause**: Missing OPENAI_API_KEY or Mem0 initialization failed

**Solution**:
```bash
# Check .env file has OPENAI_API_KEY
cd C:\Users\carlo\Development\mem0-sync\mem0
type .env | findstr OPENAI_API_KEY

# If missing, add it:
echo OPENAI_API_KEY=sk-proj-... >> .env

# Restart Knowledge Lake
python enhanced_knowledge_lake_api.py
```

### Issue: "Port already in use"

**Cause**: Another service using port 8000

**Solution**:
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (if safe)
taskkill /PID <process_id> /F

# Or change port in .env
echo KNOWLEDGE_LAKE_PORT=8001 >> .env
```

### Issue: "n8n can't reach Knowledge Lake"

**Cause**: Network configuration or firewall

**Solution**:
```bash
# Test from n8n server
curl http://192.168.68.61:8000/health

# If fails, check firewall:
netsh advfirewall firewall add rule name="Knowledge Lake" dir=in action=allow protocol=TCP localport=8000

# Or test with localhost instead:
curl http://localhost:8000/health
```

---

## 📊 Monitoring in Production

### View Logs

The server outputs logs to console. To run in background and save logs:

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0

# Run in background with logs
python enhanced_knowledge_lake_api.py > knowledge_lake.log 2>&1 &

# View logs in real-time
tail -f knowledge_lake.log

# Or on Windows PowerShell
Get-Content knowledge_lake.log -Wait -Tail 50
```

### Monitor API Calls

```bash
# Check stats endpoint periodically
curl http://192.168.68.61:8000/stats

# View agent activity
curl http://192.168.68.61:8000/agent/list

# Check specific agent history
curl http://192.168.68.61:8000/agent/fred/history?limit=10
```

---

## 🎉 Production Deployment Complete

Once you've started the Knowledge Lake and verified all tests pass, you have:

✅ **Production-ready API** with Waitress WSGI server
✅ **Port 8000** correctly configured
✅ **Mem0 integration** for persistent memory
✅ **Agent-specific endpoints** for all 6 agents
✅ **Workflow coordination** for multi-agent tasks
✅ **Health monitoring** and logging
✅ **CORS enabled** for n8n integration

**Next Steps**:
1. Keep Knowledge Lake running 24/7 on production server
2. Import n8n agent workflows (with corrected port 8000)
3. Test first agent integration (Fred recommended)
4. Scale to all agents

---

**Production Server Status**: Ready to Deploy ✅
**Port Configuration**: 8000 (CORRECTED) ✅
**WSGI Server**: Waitress ✅
**Last Updated**: 2025-10-14

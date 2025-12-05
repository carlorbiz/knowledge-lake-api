# Railway Deployment Debug Guide

## Problem
Railway deployed twice but still showing old `api_server.py` code (missing enhanced endpoints).

## GitHub Status ✅
- Latest commit: `79a58b4a1d8cfa67c9a596b9514f276b8d568b6c`
- Contains: Enhanced `api_server.py` with version `2.0.1_enhanced`
- Procfile: Correct (`web: python start_knowledge_lake.py`)
- Files pushed: ✅ Verified on GitHub

## Expected vs Actual

### Expected (from GitHub commit 79a58b4a)
```json
{
  "status": "healthy",
  "service": "mem0_knowledge_lake",
  "version": "2.0.1_enhanced",
  "endpoints": {
    "legacy": ["/knowledge/search", "/knowledge/add", "/knowledge/context"],
    "conversations": ["/api/conversations/ingest", "/api/conversations"],
    "entities": ["/api/entities", "/api/relationships"],
    "aurelia": ["/api/aurelia/query", "/api/aurelia/context"]
  }
}
```

### Actual (from Railway production)
```json
{
  "service": "mem0_knowledge_lake",
  "status": "healthy"
}
```

## Troubleshooting Checklist

### 1. Verify Branch in Railway
- [ ] Go to Railway dashboard: https://railway.app/
- [ ] Select your `knowledge-lake-api-production` project
- [ ] Click **Settings** → **Source** (or **GitHub**)
- [ ] Verify branch is `main` (not `master` or other)
- [ ] If wrong, change to `main` and redeploy

### 2. Verify Repository
- [ ] Confirm Railway shows: `carlorbiz/mem0`
- [ ] If wrong repo, disconnect and reconnect GitHub integration

### 3. Check Deployment Logs
- [ ] Go to **Deployments** tab
- [ ] Click most recent deployment
- [ ] Look for commit hash in build logs
- [ ] Should see: `79a58b4a` or `a23c6cdf`
- [ ] If older commit, Railway isn't pulling latest code

### 4. Force Fresh Build (Nuclear Option)
- [ ] **Settings** → **Service** → **Disconnect GitHub**
- [ ] **Reconnect** → Select `carlorbiz/mem0`
- [ ] Choose `main` branch
- [ ] Enable **Auto Deploy on Push**
- [ ] Manually trigger **Deploy**

### 5. Check Build Command (Railway should auto-detect)
In Railway **Settings** → **Build**:
- Build Command: (should be auto-detected from requirements.txt)
- Start Command: `python start_knowledge_lake.py` (from Procfile)

### 6. Check Environment Variables
- [ ] `OPENAI_API_KEY` is set
- [ ] `PORT` is NOT hardcoded (Railway sets this automatically)
- [ ] `RAILWAY_ENVIRONMENT` should be set by Railway

## Test After Deployment
```bash
# Test health endpoint (should show version 2.0.1_enhanced)
curl https://knowledge-lake-api-production.up.railway.app/health

# Test new ingest endpoint (should NOT return 404)
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/ingest \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "agent": "Test", "date": "2025-11-30", "topic": "Test", "content": "Test"}'
```

## If Still Not Working
Check if Railway is using a different deployment file:
- [ ] Check for `.railway` directory in repo
- [ ] Check for `nixpacks.toml` that might override settings
- [ ] Verify `railway.json` is being read (should use NIXPACKS builder)

## Contact Railway Support
If all else fails:
- Railway Discord: https://discord.gg/railway
- Ask: "Why is my deployment not picking up latest GitHub commit?"
- Provide:
  - Project ID
  - Latest GitHub commit hash: `79a58b4a`
  - What Railway is deploying (from logs)

## Last Resort: Delete and Recreate Service
1. Export environment variables first
2. Delete the Railway service
3. Create new Railway project from GitHub
4. Select `carlorbiz/mem0` → `main`
5. Re-add environment variables
6. Deploy

---

**Last Updated:** November 30, 2025
**Current Issue:** Railway deploying old code despite GitHub having correct commits
**Next Step:** Check Railway Settings → Source → Branch configuration

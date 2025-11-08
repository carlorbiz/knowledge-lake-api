# Deploy Knowledge Lake API to Railway

## Quick Deploy (15 minutes)

### Prerequisites
- ✅ Railway account: https://railway.app
- ✅ GitHub account (for code deployment)
- ✅ Knowledge Lake API running locally (confirmed: http://localhost:5002/health works!)

---

## Option A: Deploy from GitHub (Recommended)

### Step 1: Push Code to GitHub (5 min)

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0

# If not already a git repo:
git init
git add api_server.py start_knowledge_lake.py Procfile requirements-api.txt
git commit -m "Add Knowledge Lake API for Railway deployment"

# Create GitHub repo at: https://github.com/new
# Name it: knowledge-lake-api

# Push to GitHub:
git remote add origin https://github.com/YOUR-USERNAME/knowledge-lake-api.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway (5 min)

1. Go to: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your `knowledge-lake-api` repository
5. Railway will auto-detect Python and deploy!

### Step 3: Add Environment Variables (2 min)

In Railway project settings → Variables, add:

```
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
PERPLEXITY_API_KEY=your-key-here
```

*(Copy from your local `.env` file)*

### Step 4: Get Your Public URL (1 min)

1. Railway will generate a public URL like: `https://knowledge-lake-api-production.up.railway.app`
2. Click **"Generate Domain"** in Settings if needed
3. Test it: `https://your-app.up.railway.app/health`

---

## Option B: Deploy via Railway CLI (Alternative)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login & Deploy

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0

railway login
railway init
railway up
```

---

## Verify Deployment

Test your deployed API:

```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status": "healthy", "service": "mem0_knowledge_lake"}
```

---

## Update n8n to Use Cloud URL

In your Railway n8n workflows, replace:
```
OLD: http://host.docker.internal:5002/knowledge/add
NEW: https://your-app.up.railway.app/knowledge/add
```

---

## Troubleshooting

### Issue: "Module 'mem0' not found"

If Railway can't find mem0, we need to install it. Add to `requirements-api.txt`:
```
mem0==0.1.21
```

Then redeploy:
```bash
git add requirements-api.txt
git commit -m "Add mem0 dependency"
git push
```

### Issue: Port Configuration

Railway automatically sets the PORT environment variable. If needed, update `start_knowledge_lake.py`:

```python
import os
port = int(os.environ.get('PORT', 5002))
serve(app, host='0.0.0.0', port=port, threads=4)
```

### Issue: Build Fails

Check Railway logs:
1. Go to Railway dashboard
2. Click your project
3. View "Deployments" tab
4. Click latest deployment → View logs

---

## Cost

Railway Free Tier includes:
- ✅ $5 credit per month
- ✅ Plenty for Knowledge Lake API
- ✅ Automatic HTTPS
- ✅ Zero DevOps

Estimated usage: **~$2-3/month** (well within free tier)

---

## Security

Railway provides:
- ✅ Automatic HTTPS
- ✅ Environment variable encryption
- ✅ DDoS protection
- ✅ Private networking (if needed)

**Recommended:** Add API authentication later (e.g., API key header)

---

## Next Steps After Deployment

Once deployed, you can:
1. ✅ Access Knowledge Lake from Railway n8n
2. ✅ Access from Slack workflows
3. ✅ Access from anywhere on the internet
4. ✅ Build the `/ai` command system!

---

**Time to deploy:** ~15 minutes
**Monthly cost:** Free (within $5 credit)
**Uptime:** 99.9%+ 🚀

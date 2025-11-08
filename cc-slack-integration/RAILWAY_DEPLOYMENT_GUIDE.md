# Railway Deployment Guide - CC Slack Integration
## Get from $0 to Production in 2 Hours

---

## 🎯 What We're Building

```
Slack (#cc-test channel)
    ↓
Railway n8n (polls every minute)
    ↓
Notion CC Inbox (creates task)
    ↓
Your laptop CC (processes via Task Scheduler)
    ↓
Railway n8n (posts response to Slack)
```

**Total Cost:** $0 (free tier) → $5/mo if you scale

---

## Part 1: Railway Account Setup (5 minutes)

### Step 1: Sign Up

**Go to:** https://railway.app

**Click:** "Start a New Project"

**Sign up with GitHub** (recommended - auto-integrates repos)

### Step 2: Add Payment Method

⚠️ **Required for free tier** (but won't charge unless you exceed limits)

- Go to Account Settings
- Add credit/debit card
- Free tier: $5 credit/month (plenty for our needs!)

### Step 3: Install Railway CLI (Optional but Recommended)

**Windows:**
```powershell
npm install -g @railway/cli
```

**Login:**
```powershell
railway login
```

✅ Railway account ready!

---

## Part 2: Deploy n8n (15 minutes)

### Step 1: Create n8n Project

**In Railway Dashboard:**
1. Click **"New Project"**
2. Select **"Deploy from Template"**
3. Search for **"n8n"**
4. Click the official n8n template

**OR use this link:**
https://railway.app/template/n8n

### Step 2: Configure n8n

Railway will prompt you to configure:

**Required Environment Variables:**
```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[create-strong-password]
N8N_HOST=n8n-production-XXXX.up.railway.app
N8N_PROTOCOL=https
N8N_PORT=5678
WEBHOOK_URL=https://n8n-production-XXXX.up.railway.app/
```

**Click "Deploy"**

Railway will:
- ✅ Create Docker container
- ✅ Set up PostgreSQL database (FREE!)
- ✅ Generate public URL with SSL
- ✅ Deploy n8n

**Wait ~2-3 minutes for deployment**

### Step 3: Access Your n8n

Railway will show you the URL:
```
https://n8n-production-XXXX.up.railway.app
```

**Open it → Login with:**
- Username: `admin`
- Password: `[your-password]`

✅ n8n running on Railway!

---

## Part 3: Add Custom Domain (10 minutes)

### Step 1: Configure Domain in Railway

**In Railway Dashboard:**
1. Click your n8n service
2. Go to **"Settings"**
3. Scroll to **"Domains"**
4. Click **"Generate Domain"** (gets you a railway.app subdomain)
5. OR click **"Custom Domain"** → Enter `n8n.carlorbiz.com`

### Step 2: Update DNS

Railway will show you DNS settings:

**In Cloudflare (or your DNS provider):**
```
Type: CNAME
Name: n8n
Content: [railway-provided-domain].up.railway.app
Proxy: On (orange cloud)
```

**Save and wait ~5 minutes for DNS propagation**

### Step 3: Test

Visit: `https://n8n.carlorbiz.com`

Should see n8n login page!

✅ Custom domain working!

---

## Part 4: Configure n8n Credentials (10 minutes)

### Step 1: Add Slack Credentials

**In n8n:**
1. Click profile icon → **"Credentials"**
2. **"+ Add Credential"**
3. Search **"Slack API"**
4. **Credential Name:** `Slack - CC Bot`
5. **Access Token:** `xoxb-[your-bot-token]`
6. **Save**

### Step 2: Add Notion Credentials

**In n8n:**
1. **"+ Add Credential"**
2. Search **"Notion API"**
3. **Credential Name:** `Notion - CC Inbox`
4. **API Key:** `secret_[your-notion-token]`
5. **Save**

✅ Credentials configured!

---

## Part 5: Create Polling Workflow (20 minutes)

### The Workflow

Since we're using local n8n (not webhooks yet), we'll use a **polling workflow**:

**Workflow Steps:**
1. **Schedule Trigger** - runs every 1 minute
2. **Slack: Get Channel History** - check #cc-test for new messages
3. **Filter** - only messages with "CC —"
4. **Function** - extract request text
5. **Notion: Create Page** - create CC Inbox item
6. **Slack: Send Message** - confirm receipt

### Import the Workflow

I'll create the workflow JSON for you...

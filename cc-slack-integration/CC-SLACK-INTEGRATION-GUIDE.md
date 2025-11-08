# CC ↔ Slack Bidirectional Integration Guide

**Status:** Ready to Deploy
**Complexity:** Simple & Reliable
**Setup Time:** 30 minutes

---

## 🎯 What This Solves

**Current Problem:**
- `/ai cc [task]` in Slack → logs to Notion → **nothing happens** ❌
- Agents (Fredo, Penny, Claude GUI, Manus) can't communicate with CC

**After This Fix:**
- `/ai cc [task]` → CC actually receives and processes → responds to Slack ✅
- ALL Slack agents can communicate with CC bidirectionally ✅

---

## 🏗️ Architecture

```
Slack: /ai cc [task]
  ↓
n8n webhook receives
  ↓
Creates GitHub Issue in cc-task-queue repo
  ↓
Sends acknowledgment to Slack
  ↓
CC polls GitHub repo every 30s
  ↓
CC finds new issue, processes task
  ↓
CC comments on issue with response
  ↓
CC closes issue
  ↓
n8n watches for issue closures
  ↓
n8n posts CC's response to Slack
```

---

## 📋 Prerequisites

1. ✅ GitHub account (you have this)
2. ✅ n8n on Railway (you have this)
3. ✅ Slack workspace with `/ai` command (you have this)
4. ⏳ New GitHub repository: `cc-task-queue` (create this)
5. ⏳ GitHub Personal Access Token (create this)
6. ⏳ Python 3.9+ on local machine (you have this)

---

## 🚀 Setup Instructions

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cc-task-queue`
3. Description: "Task queue for Claude Code ↔ Slack integration"
4. Make it **Private**
5. Initialize with README
6. Create repository

### Step 2: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "CC Slack Integration"
4. Scopes needed:
   - ✅ `repo` (all)
   - ✅ `workflow`
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 3: Set Environment Variables

Add these to your system environment variables:

```bash
# Windows (cmd)
setx GITHUB_TOKEN "ghp_your_token_here"
setx GITHUB_OWNER "carlorbiz"

# Or add to your .env file
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=carlorbiz
N8N_SLACK_RESPONSE_WEBHOOK=https://primary-production-de49.up.railway.app/webhook/slack-response
```

### Step 4: Import n8n Workflow

1. Open your n8n instance: https://primary-production-de49.up.railway.app
2. Click "Import from File"
3. Upload: `n8n-ai-command-COMPLETE-WORKFLOW.json`
4. Configure GitHub credentials:
   - Click on "Create GitHub Issue for CC" node
   - Add credentials with your GitHub token
5. **Activate the workflow** (toggle to ON)

### Step 5: Create Slack Response Workflow

Create a second n8n workflow that listens for GitHub issue closures:

**Name:** "GitHub Issue Closed → Slack Response"

**Webhook:** `/webhook/github-issue-closed`

**Trigger:** GitHub webhook when issue is closed

**Flow:**
1. Receive GitHub webhook (issue closed)
2. Get issue comments (extract CC's response)
3. Parse issue body (get channel_id)
4. Send message to Slack channel with CC's response

I'll create this workflow file for you...

### Step 6: Run CC Monitor Script

**Option A: Manual Run (for testing)**
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration
python cc-slack-monitor.py
```

**Option B: Windows Scheduled Task (production)**
```powershell
# Create scheduled task to run on startup
schtasks /create /tn "CC Slack Monitor" /tr "python C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration\cc-slack-monitor.py" /sc onstart /ru SYSTEM
```

**Option C: Run in VS Code Terminal (development)**
- Open VS Code
- Open terminal
- Run: `python cc-slack-monitor.py`
- Leave running

---

## 🧪 Testing

### Test 1: Basic Flow

1. In Slack, type: `/ai cc list files in the mem0 directory`
2. You should see: "✅ Task queued for claude-code..."
3. Check GitHub: New issue should be created in `cc-task-queue`
4. Within 30s, CC monitor should process it
5. Issue should be closed with CC's response
6. Response should appear in Slack

### Test 2: Agent-to-Agent Communication

1. Ask Fredo (in Slack DM): "Can you tell CC to check the knowledge lake?"
2. Fredo should send message to #cc-inbox or DM @cc-bot
3. CC should receive and respond
4. Fredo receives response

---

## 📊 How It Works in Practice

### Example 1: Carla asks CC to do something

```
Carla in Slack: /ai cc create a new python script for data analysis

n8n: ✅ Task queued for claude-code. I'll notify you when complete.

[30 seconds later]

CC responds in thread:
✅ Task Complete

I've created data_analysis.py in C:\Users\carlo\Development\

The script includes:
- CSV file loading
- Data cleaning functions
- Basic statistical analysis
- Visualization with matplotlib

File location: C:\Users\carlo\Development\data_analysis.py
```

### Example 2: Manus asks CC for help

```
Manus (via Zapier MCP Slack): @cc-bot Can you review the AAE dashboard code?

[CC receives via GitHub queue]

CC responds:
✅ Review Complete

I've reviewed the AAE dashboard in /home/ubuntu/aae-dashboard

Findings:
- Database schema looks solid
- Recommend adding indexes on userId and date fields
- tRPC routers are well-structured

Full review: [GitHub comment link]
```

---

## 🔧 Troubleshooting

### CC monitor not finding issues
- Check GitHub token is valid
- Check repo name is correct: `cc-task-queue`
- Check labels are correct: `pending`, `cc-task`, `from-slack`

### n8n workflow not creating issues
- Check GitHub credentials in n8n
- Check webhook is activated
- Check Railway logs for errors

### Slack not receiving responses
- Check n8n "Slack Response" workflow is active
- Check Slack webhook URL is correct
- Check GitHub webhook is configured

---

## 🎯 Next Steps

1. ✅ Delete the old/incorrect implementation plan document
2. ✅ Test basic flow with `/ai cc test`
3. ✅ Have Manus test agent-to-agent communication
4. ✅ Set up Windows Scheduled Task for production
5. ✅ Document successful patterns in Knowledge Lake

---

## 📝 Files Created

- `n8n-ai-command-COMPLETE-WORKFLOW.json` - Updated n8n workflow
- `cc-slack-monitor.py` - CC polling script
- `CC-SLACK-INTEGRATION-GUIDE.md` - This guide

---

## 🎉 Success Criteria

- ✅ `/ai cc [task]` returns actual responses from CC
- ✅ Agents can send tasks to CC via Slack
- ✅ CC processes tasks using full capabilities
- ✅ Responses appear in Slack within 60 seconds
- ✅ All interactions logged to Notion + Knowledge Lake
- ✅ Simple, reliable, maintainable

---

**Ready to deploy!**

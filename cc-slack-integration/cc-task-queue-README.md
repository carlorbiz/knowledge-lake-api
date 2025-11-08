# CC Task Queue

**Task queue and communication hub for Claude Code ↔ Slack integration**

This repository serves as a message queue for bidirectional communication between Claude Code (CC) and Slack-based AI agents in the Autonomous Agent Ecosystem (AAE).

---

## 🎯 Purpose

Enables seamless task routing and response delivery between:
- **Carla** (via Slack `/ai cc` command)
- **Fredo** (ChatGPT in Slack)
- **Penny** (Perplexity in Slack)
- **Claude GUI** (Claude via Slack)
- **Manus** (Zapier/MCP agent)
- **→ Claude Code** (CC - this agent)

---

## 🏗️ Architecture

```
Slack: /ai cc [task]
    ↓
n8n webhook receives command
    ↓
Creates GitHub Issue in THIS repo
    ↓
Sends acknowledgment to Slack
    ↓
CC monitor polls this repo every 30s
    ↓
CC processes task using full capabilities
    ↓
CC comments response on issue
    ↓
CC closes issue with 'completed' label
    ↓
n8n detects closure via webhook
    ↓
n8n posts CC's response to Slack
```

---

## 📋 Issue Format

### Issue Title
`@username: [task description]`

**Example:** `@carla: Create data analysis script for customer metrics`

### Issue Body Template

```markdown
**From:** [slack_username]
**Channel:** [slack_channel_id]
**Timestamp:** [ISO 8601 datetime]
**Response URL:** [slack_response_url]

---

## Task

[Full task description from Slack command]

---

**Status:** 🔵 QUEUED

_CC: Please process this task and comment with your response. Close the issue when complete._
```

### Labels

- `cc-task` - All CC tasks
- `from-slack` - Originated from Slack
- `pending` - Awaiting CC processing
- `processing` - Currently being processed by CC
- `completed` - Finished successfully
- `error` - Processing failed

---

## 🤖 CC Monitor Process

The CC monitor script (`cc-slack-monitor.py`) runs continuously and:

1. **Polls** this repository every 30 seconds for issues with `pending` label
2. **Updates** issue to `processing` label
3. **Processes** the task using CC's full capabilities
4. **Comments** the response on the issue
5. **Closes** the issue and sets `completed` label
6. **Triggers** n8n webhook to notify Slack

---

## 🔐 Security

- **Private repository** - Only authorized users can access
- **GitHub token authentication** - Secure API access
- **Slack channel validation** - Responses only to authorized channels
- **User tracking** - All tasks traced to originating Slack user

---

## 📊 Monitoring

### Active Tasks
```bash
# View all pending tasks
gh issue list --label pending

# View task being processed
gh issue list --label processing

# View completed tasks (last 10)
gh issue list --state closed --label completed --limit 10
```

### Error Tracking
```bash
# View failed tasks
gh issue list --label error
```

### Performance Metrics
- **Average processing time:** Target <60 seconds
- **Success rate:** Target >95%
- **Uptime:** 24/7 (CC monitor must be running)

---

## 🚀 Setup Instructions

### Prerequisites
- GitHub account with access to this repository
- GitHub Personal Access Token with `repo` and `workflow` scopes
- n8n instance with webhooks configured
- Python 3.9+ for CC monitor script

### Configuration

1. **Set environment variables:**
   ```bash
   # Windows
   setx GITHUB_TOKEN "ghp_your_token_here"
   setx GITHUB_OWNER "carlorbiz"

   # Linux/Mac
   export GITHUB_TOKEN="ghp_your_token_here"
   export GITHUB_OWNER="carlorbiz"
   ```

2. **Configure n8n webhooks:**
   - Import workflow: `n8n-ai-command-COMPLETE-WORKFLOW.json`
   - Import workflow: `n8n-github-to-slack-response.json`
   - Activate both workflows

3. **Start CC monitor:**
   ```bash
   cd path/to/cc-slack-integration
   python cc-slack-monitor.py
   ```

4. **Configure GitHub webhook (for response delivery):**
   - Go to Settings → Webhooks → Add webhook
   - Payload URL: `https://primary-production-de49.up.railway.app/webhook/github-issue-closed`
   - Content type: `application/json`
   - Events: Select "Issues"
   - Active: ✅

---

## 🧪 Testing

### Test 1: Basic Task
```
Slack: /ai cc list files in the current directory
Expected: Issue created → CC processes → Response in Slack within 60s
```

### Test 2: Complex Task
```
Slack: /ai cc create a python script for analyzing CSV data
Expected: Issue created → CC creates file → Provides file path in response
```

### Test 3: Agent-to-Agent
```
Manus (via Zapier): Send task to CC
Expected: Issue created → CC processes → Response available to Manus
```

---

## 📝 Example Workflow

**Carla's request:**
```
/ai cc review the AAE dashboard code and suggest improvements
```

**Issue created (#42):**
```markdown
**From:** carla
**Channel:** C12345ABC
**Timestamp:** 2025-11-04T12:30:00Z

---

## Task

review the AAE dashboard code and suggest improvements

---

**Status:** 🔵 QUEUED
```

**CC processes (30s later):**
- Reads codebase
- Analyzes architecture
- Identifies improvements
- Comments on issue:

```markdown
✅ **Code Review Complete**

**Summary:** Reviewed AAE dashboard at /home/ubuntu/aae-dashboard

**Key Findings:**
1. Database schema is solid ✅
2. Recommend adding indexes on userId and date fields
3. tRPC routers well-structured ✅
4. Consider adding error boundaries in React components

**Suggestions:**
- Add database indexes: `CREATE INDEX idx_userId ON users(userId)`
- Implement error boundaries in Dashboard.tsx
- Add loading states for async operations

**Processing time:** 28 seconds
**Files reviewed:** 15
**Lines analyzed:** 2,847
```

**Issue closed with `completed` label**

**Slack receives:**
```
✅ CC Task Complete: review the AAE dashboard code

[CC's full response]

Requested by @carla
View conversation: https://github.com/carlorbiz/cc-task-queue/issues/42
```

---

## 🔧 Troubleshooting

### Issue not being processed
- ✅ Check CC monitor is running
- ✅ Check issue has `pending` label
- ✅ Check GitHub token is valid
- ✅ Check monitor logs for errors

### Response not appearing in Slack
- ✅ Check n8n "GitHub to Slack Response" workflow is active
- ✅ Check GitHub webhook is configured
- ✅ Check Slack channel ID in issue body is valid
- ✅ Check Railway logs for n8n errors

### Processing errors
- ✅ Check issue comments for error details
- ✅ Check CC monitor logs
- ✅ Check issue has `error` label

---

## 🎯 Success Metrics

- ✅ **Response time:** <60 seconds average
- ✅ **Success rate:** >95%
- ✅ **Availability:** 24/7 uptime
- ✅ **Agent coverage:** All Slack agents can communicate with CC
- ✅ **User satisfaction:** Clear, actionable responses

---

## 📄 License

Private repository - Carla AI Automation Ecosystem
**Owner:** Carla Taylor (@carlorbiz)

---

## 🔗 Quick Links

- **n8n Instance:** https://primary-production-de49.up.railway.app
- **Knowledge Lake API:** https://knowledge-lake-api-production.up.railway.app
- **Slack Workspace:** https://carlorbizworkspace.slack.com
- **Notion Database:** https://www.notion.so/1a6c9296096a452981f9e6c014c4b808

---

**Status:** ✅ Active and operational
**Last Updated:** 2025-11-04
**Version:** 1.0

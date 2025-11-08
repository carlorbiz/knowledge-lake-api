# Claude Code Webhook for n8n Integration

This webhook server allows n8n workflows to trigger Claude Code tasks remotely while keeping Docker Desktop and Claude Code running locally on your PC.

## Architecture

```
n8n Workflow → Webhook (port 3001) → Claude Code CLI → Response
                    ↓
              Logs to webhook-log.txt
```

## Setup

### 1. Install Dependencies

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration
npm install express
```

### 2. Configure Environment

```bash
# Copy the example env file
copy .env.webhook .env

# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with your secret
```

### 3. Start the Webhook Server

**Option A: Run directly**
```bash
node claude-code-webhook.js
```

**Option B: Run with PM2 (recommended for always-on)**
```bash
npm install -g pm2
pm2 start claude-code-webhook.js --name claude-webhook
pm2 save
pm2 startup  # Follow the instructions to auto-start on boot
```

**Option C: Run as Windows Scheduled Task**
Create a batch file `start-claude-webhook.bat`:
```batch
@echo off
cd /d C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration
node claude-code-webhook.js
```

Then create a Windows Scheduled Task to run on startup.

### 4. Test the Webhook

```bash
# Health check
curl http://localhost:3001/health

# Test Claude Code task
curl -X POST http://localhost:3001/webhook/claude-code \
  -H "Content-Type: application/json" \
  -d "{\"task\":\"test\",\"prompt\":\"What is 2+2?\"}"
```

## n8n Integration

### Webhook Node Configuration

**URL:** `http://localhost:3001/webhook/claude-code`
**Method:** POST
**Authentication:** None (runs locally)

**Request Body (JSON):**
```json
{
  "task": "analyze-code",
  "prompt": "Analyze this code for bugs: {{ $json.code }}",
  "project_path": "C:\\Users\\carlo\\Development\\mem0-sync\\mem0",
  "model": "sonnet"
}
```

**Optional: Signature Verification**

Add header: `X-Signature: <HMAC-SHA256 of JSON body>`

Calculate signature in n8n:
```javascript
const crypto = require('crypto');
const secret = 'your-webhook-secret';
const payload = JSON.stringify($json);
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
return { signature };
```

### Example n8n Workflows

#### 1. Slack Command → Claude Code

```
Slack Trigger
  ↓
Extract command and text
  ↓
HTTP Request (Claude Webhook)
  ↓
Format response
  ↓
Slack Response
```

**HTTP Request Node:**
- URL: `http://localhost:3001/webhook/claude-code`
- Method: POST
- Body:
```json
{
  "task": "{{ $json.command }}",
  "prompt": "{{ $json.text }}"
}
```

#### 2. GitHub Issue → Claude Code Analysis

```
GitHub Trigger (new issue)
  ↓
HTTP Request (Claude Webhook)
  ↓
Parse analysis
  ↓
GitHub Comment (add analysis to issue)
```

**HTTP Request Node:**
- URL: `http://localhost:3001/webhook/github-issue`
- Method: POST
- Body:
```json
{
  "issue_number": "{{ $json.issue.number }}",
  "issue_title": "{{ $json.issue.title }}",
  "issue_body": "{{ $json.issue.body }}",
  "repository": "{{ $json.repository.full_name }}"
}
```

#### 3. Scheduled Task → Claude Code Report

```
Cron Trigger (daily)
  ↓
HTTP Request (Claude Webhook)
  ↓
Email Node (send report)
```

## Endpoints

### `POST /webhook/claude-code`
Execute a Claude Code task with custom prompt.

**Request:**
```json
{
  "task": "string (required) - Task identifier",
  "prompt": "string (required) - Prompt for Claude",
  "project_path": "string (optional) - Working directory",
  "model": "string (optional) - Claude model (sonnet/opus/haiku)"
}
```

**Response:**
```json
{
  "success": true,
  "task": "analyze-code",
  "output": "Claude's response...",
  "timestamp": "2025-11-07T..."
}
```

### `POST /webhook/github-issue`
Specialized endpoint for GitHub issue analysis.

**Request:**
```json
{
  "issue_number": "number (required)",
  "issue_title": "string",
  "issue_body": "string",
  "repository": "string (required) - owner/repo"
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "Claude Code Webhook",
  "timestamp": "2025-11-07T..."
}
```

## Security

### Local Network Only
This webhook should **only** be accessible on localhost. Do NOT expose it to the internet without:
1. Proper authentication
2. HTTPS/TLS encryption
3. Rate limiting
4. Input validation

### Signature Verification
Enable signature verification by:
1. Setting `CLAUDE_WEBHOOK_SECRET` in `.env`
2. Sending `X-Signature` header with HMAC-SHA256 hash

### Monitoring
Check logs at: `webhook-log.txt`

```bash
# View logs in real-time
tail -f webhook-log.txt
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <pid> /F
```

### Claude Code not found
Make sure Claude Code is in your PATH or use full path in webhook.

### Timeout errors
Increase timeout in webhook code (default: 5 minutes).

## Integration with AAE (AI Automation Ecosystem)

This webhook completes your architecture:

- **Claude Desktop** → Zapier MCP → LLM Coordination (Fred, Penny, Manus, etc.)
- **Claude Code** → Docker MCP → Local Development
- **n8n** → Webhook → Claude Code CLI → Automated Tasks

All running locally when your PC is on, with Docker Desktop as the secure MCP gateway!

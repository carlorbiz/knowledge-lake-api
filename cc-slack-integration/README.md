# CC Slack Integration - Remote Command System

## Overview

This system allows you to send commands to Claude Code (CC) from anywhere via Slack, and have CC automatically process them when your laptop is on.

## Architecture

```
You (Phone/Any Device)
    ↓
Slack message: "CC — [your request]"
    ↓
n8n workflow detects message
    ↓
Creates Notion CC Inbox item with Wake CC flag = ✅
    ↓
Sends Slack confirmation: "✅ Got it! I'll process this when CC wakes up."
    ↓
Windows Task Scheduler (every 5 min) → cc-wake-check.ps1
    ↓
Launches Claude Code with inbox check command
    ↓
CC queries Notion for Wake CC = ✅ items
    ↓
CC processes each request → responds to Slack → updates Notion
```

## Components

### 1. Notion Database: CC Inbox
- **Purpose**: Queue for incoming requests
- **Key Properties**:
  - `Name`: The request/message
  - `Wake CC`: Checkbox to trigger processing
  - `Status`: Pending → Processing → Completed
  - `Slack Channel ID`: Where to respond
  - `Slack Message TS`: Thread to respond in

### 2. n8n Workflow: Slack → Notion
- **File**: `n8n-workflow-slack-to-notion-cc-inbox.json`
- **Trigger**: Slack message containing "CC —"
- **Actions**:
  1. Extract request text
  2. Create Notion CC Inbox item
  3. Set Wake CC = ✅
  4. Send Slack confirmation

### 3. PowerShell Wake Check
- **File**: `cc-wake-check.ps1`
- **Frequency**: Every 5 minutes (via Task Scheduler)
- **Actions**:
  1. Check for wake flags
  2. Launch Claude Code if flags found
  3. Log activity

### 4. Task Scheduler Setup
- **File**: `setup-task-scheduler.ps1`
- **Run once**: As Administrator
- **Creates**: Recurring task every 5 minutes

## Setup Instructions

### Step 1: Create Notion Database

Create a database called **CC Inbox** with these properties:

| Property | Type | Options |
|----------|------|---------|
| Name | Title | - |
| Status | Select | Pending, Processing, Completed |
| Wake CC | Checkbox | - |
| Priority | Select | Low, Medium, High, Urgent |
| Source | Text | - |
| Slack Thread Link | URL | - |
| Slack Channel ID | Text | - |
| Slack Message TS | Text | - |
| Created Time | Created time | - |
| Processed Time | Last edited time | - |
| Response | Text | - |
| Project Key | Text | - |

**Get the database ID** from the URL and update `check-inbox.py`

### Step 2: Configure Slack in Zapier MCP

1. Go to https://mcp.zapier.com/mcp/servers/[YOUR_ID]/config
2. Add these Slack actions:
   - Send Channel Message
   - Send Direct Message
   - Get Channel Messages
   - Add Reaction to Message

### Step 3: Import n8n Workflow

1. Open n8n (http://localhost:5678)
2. Import `n8n-workflow-slack-to-notion-cc-inbox.json`
3. Update credentials:
   - Slack API credentials
   - Notion API credentials
4. Update database ID in "Create CC Inbox Item" node
5. Activate workflow

### Step 4: Setup Task Scheduler

Run as Administrator:
```powershell
.\setup-task-scheduler.ps1
```

This creates a task that runs `cc-wake-check.ps1` every 5 minutes.

### Step 5: Test the System

1. Send Slack message: "CC — test the system"
2. Check Notion CC Inbox for new item
3. Wait up to 5 minutes for CC to process
4. Check Slack for CC's response
5. Verify Notion shows Completed status

## CC Inbox Processing Workflow

When CC is woken up, it follows this workflow:

### 1. Query Notion
```
Find all items where:
- Wake CC = true
- Status = Pending
```

### 2. For Each Item:

**A. Update Status**
- Set Status = "Processing"

**B. Process Request**
- Read the request in Name field
- Execute the requested task
- Generate response

**C. Respond to Slack**
- Use Slack Channel ID + Message TS to thread response
- Post CC's response

**D. Update Notion**
- Set Status = "Completed"
- Uncheck Wake CC
- Fill Response field with what was posted to Slack

### 3. Exit
- Log completion
- Close session

## Usage Patterns

### From Slack (Any Device)

**Basic request:**
```
CC — summarize the latest course generation workflow
```

**Urgent request:**
```
CC — URGENT review the API logs for errors
```

**With project context:**
```
CC — [PROJECT: AAE] update the Notion sync status
```

### Manual Processing (Terminal)

If you're already at your laptop:
```bash
# Check inbox manually
python check-inbox.py

# Or just tell CC directly in terminal
# No need to go through Slack
```

## File Structure

```
cc-slack-integration/
├── README.md                           # This file
├── n8n-workflow-slack-to-notion-cc-inbox.json  # n8n workflow
├── cc-wake-check.ps1                   # PowerShell wake checker
├── setup-task-scheduler.ps1            # Task Scheduler setup
├── check-inbox.py                      # Python helper to query Notion
├── cc-wake-log.txt                     # Activity log (auto-generated)
└── cc-inbox-command.txt                # Temp command file (auto-generated)
```

## Troubleshooting

### CC Not Responding

1. Check Task Scheduler is running:
   ```powershell
   Get-ScheduledTask -TaskName "CC Wake Check"
   ```

2. Check logs:
   ```powershell
   Get-Content cc-wake-log.txt -Tail 20
   ```

3. Manually trigger:
   ```powershell
   Start-ScheduledTask -TaskName "CC Wake Check"
   ```

### Notion Items Not Creating

1. Check n8n workflow is active
2. Verify Slack credentials in n8n
3. Verify Notion credentials in n8n
4. Check n8n execution logs

### Slack Not Receiving Responses

1. Verify Slack tools added to Zapier MCP
2. Check Slack Channel ID is correct in Notion
3. Verify Slack Message TS format

## Configuration

### Polling Interval

Default: 5 minutes

To change:
```powershell
# Unregister existing task
Unregister-ScheduledTask -TaskName "CC Wake Check" -Confirm:$false

# Edit setup-task-scheduler.ps1
# Change: -RepetitionInterval (New-TimeSpan -Minutes 5)
# To:     -RepetitionInterval (New-TimeSpan -Minutes X)

# Re-run setup
.\setup-task-scheduler.ps1
```

### Notion Database ID

Update in:
1. `n8n-workflow-slack-to-notion-cc-inbox.json` (node: "Create CC Inbox Item")
2. `check-inbox.py` (variable: `CC_INBOX_DB_ID`)

## Security Notes

- Task runs under your Windows user account
- Notion API credentials stored in n8n
- Slack API credentials stored in Zapier MCP
- Logs stored locally in `cc-wake-log.txt`

## Future Enhancements

- [ ] Priority-based processing (Urgent first)
- [ ] Retry failed items
- [ ] Email notifications on completion
- [ ] Response approval workflow
- [ ] Multi-turn conversations
- [ ] Voice message support via Slack
- [ ] Integration with other chat platforms

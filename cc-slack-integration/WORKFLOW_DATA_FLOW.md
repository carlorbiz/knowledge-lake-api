# Workflow Data Flow - AI Command Router

## Visual Flow Diagram

```
┌─────────────────┐
│  Slack /ai cmd  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Webhook                        │
│  Receives Slack POST            │
└────────┬────────────────────────┘
         │
         │ json.body = {user_id, user_name, text, channel_id, response_url}
         │
         ↓
┌─────────────────────────────────┐
│  Parse Slack Command            │
│  - Cleans text                  │
│  - Extracts metadata            │
│  - Determines if needs document │
│  - Creates Notion-ready fields  │
└────────┬────────────────────────┘
         │
         │ Output:
         │ {
         │   user_id, user_name,
         │   command_text (cleaned),
         │   channel_id, response_url,
         │   priority, category, agent,
         │   needs_document (bool),
         │   notion_title, etc.
         │ }
         │
         ↓
┌─────────────────────────────────┐
│  Check if needs document        │
│  IF: needs_document === true    │
└────┬────────────────────────┬───┘
     │                        │
     │ TRUE                   │ FALSE
     │ (>= 1800 chars)        │ (< 1800 chars)
     │                        │
     ↓                        ↓
┌────────────────┐    ┌─────────────────────┐
│  Manus Call    │    │ Query Knowledge Lake│
│  POST to Manus │    │ (context search)    │
│  API           │    └──────────┬──────────┘
└────────┬───────┘               │
         │                       │
         │ Response:             │ Response:
         │ {                     │ {results: [...]}
         │   documentUrl,        │
         │   template_used,      │
         │   reasoning           │
         │ }                     │
         │                       │
         ↓                       │
┌─────────────────────┐          │
│ Format Manus        │          │
│ Response            │          │
│ - Extracts doc URL  │          │
│ - Passes through    │          │
│   all original data │          │
│ - Marks as Manus    │          │
└────────┬────────────┘          │
         │                       │
         │ Output:               │
         │ {                     │
         │   ...all original,    │
         │   documentUrl,        │
         │   template_used,      │
         │   manus_reasoning,    │
         │   processed_by_manus: │
         │     true              │
         │ }                     │
         │                       │
         ↓                       │
┌─────────────────────┐          │
│ Query Knowledge Lake│          │
│ (same as right)     │          │
└────────┬────────────┘          │
         │                       │
         └───────┬───────────────┘
                 │
                 │ Both paths merge here
                 │
                 ↓
┌───────────────────────────────────┐
│  Format for Github                │
│  - Checks processed_by_manus      │
│  - Creates appropriate body:      │
│    * Manus: Include doc link      │
│    * Standard: CC task format     │
│  - Passes all data forward        │
└────────┬──────────────────────────┘
         │
         │ Output:
         │ {
         │   title, body,
         │   user_name, channel_id,
         │   agent, category, priority,
         │   documentUrl (if Manus),
         │   processed_by_manus,
         │   original_command
         │ }
         │
         ↓
┌───────────────────────────────────┐
│  Create Github Issue for CC       │
│  - Creates issue with body        │
│  - Adds labels                    │
└────────┬──────────────────────────┘
         │
         │ Output:
         │ {
         │   ...all previous,
         │   number (issue #),
         │   html_url,
         │   id
         │ }
         │
         ↓
┌───────────────────────────────────┐
│  Send a message (Slack)           │
│  - If Manus: Show doc link        │
│  - If Standard: Show queued msg   │
└────────┬──────────────────────────┘
         │
         ↓
┌───────────────────────────────────┐
│  Create Notion Entry              │
│  - Title from original command    │
│  - Agent name                     │
│  - Document URL (if Manus)        │
│  - Status, Tags, Date             │
└────────┬──────────────────────────┘
         │
         │ Output:
         │ {
         │   ...all previous,
         │   id (Notion page ID),
         │   url (Notion page URL)
         │ }
         │
         ↓
┌───────────────────────────────────┐
│  Log to Knowledge Lake            │
│  - Stores conversation            │
│  - Includes all metadata          │
│  - Links to Notion & GitHub       │
└───────────────────────────────────┘
```

---

## Data Transformations by Node

### 1. Webhook
**Input**: Slack POST request

**Output**:
```json
{
  "body": {
    "user_id": "U123ABC",
    "user_name": "carla",
    "text": "cc please check system status",
    "channel_id": "C09PP5GSAS3",
    "response_url": "https://hooks.slack.com/..."
  }
}
```

---

### 2. Parse Slack Command
**Input**: Webhook output

**Processing**:
- Cleans fluff words from text
- Determines priority, category, agent
- Checks if length >= 1800 (needs_document)
- Creates Notion-ready title

**Output**:
```json
{
  "user_id": "U123ABC",
  "user_name": "carla",
  "command_text": "check system status",
  "original_text": "cc please check system status",
  "channel_id": "C09PP5GSAS3",
  "response_url": "https://hooks.slack.com/...",
  "priority": "normal",
  "category": "testing",
  "agent": "claude-code",
  "timestamp": "2025-11-06T12:30:00.000Z",
  "needs_document": false,
  "document_type": "standard",
  "content_length": 19,
  "notion_title": "testing: check system status",
  "notion_status": "Queued",
  "route_to_manus": false,
  "original_command": "check system status"
}
```

---

### 3a. Manus Call (if needs_document = true)
**Input**: Parse Slack Command output

**API Call**:
```json
POST https://api.manus.ai/v1/tasks
{
  "prompt": "check system status",
  "taskMode": "agent"
}
```

**Output from Manus**:
```json
{
  "documentUrl": "https://docs.google.com/document/d/abc123...",
  "template_used": "AAE_Status_Update",
  "reasoning": "Selected Status Update template for system status request"
}
```

---

### 3b. Format Manus Response
**Input**: Manus Call output + Parse Slack Command output

**Processing**:
- Merges data from both nodes
- Extracts documentUrl
- Marks as processed_by_manus = true

**Output**:
```json
{
  "user_id": "U123ABC",
  "user_name": "carla",
  "command_text": "[original 2000+ char text]",
  "original_text": "[original text]",
  "channel_id": "C09PP5GSAS3",
  "response_url": "https://hooks.slack.com/...",
  "priority": "normal",
  "category": "documentation",
  "agent": "manus",
  "timestamp": "2025-11-06T12:30:00.000Z",
  "documentUrl": "https://docs.google.com/document/d/abc123...",
  "template_used": "AAE_Status_Update",
  "manus_reasoning": "Selected Status Update template...",
  "notion_title": "documentation: [summary]",
  "notion_status": "Processed by Manus",
  "notion_agent": "Manus",
  "processed_by_manus": true,
  "original_command": "[original text]"
}
```

---

### 4. Query Knowledge Lake
**Input**: Previous node output (either Format Manus Response OR Parse Slack Command)

**API Call**:
```
GET https://knowledge-lake-api-production.up.railway.app/knowledge/search?query=[command_text]&user_id=[user_name]
```

**Output**:
```json
{
  ...all previous data,
  "results": [
    {
      "memory": "Previous context...",
      "score": 0.85
    }
  ]
}
```

---

### 5. Format for Github
**Input**: Query Knowledge Lake output

**Processing**:
- Checks if `processed_by_manus` is true
- Creates appropriate GitHub issue body
- Passes all data forward

**Output (Manus path)**:
```json
{
  "title": "carla: [summary]",
  "body": "## 📄 Document Generated by Manus\n\n**Google Doc**: https://docs.google.com/...\n\n[rest of body]",
  "user_name": "carla",
  "channel_id": "C09PP5GSAS3",
  "response_url": "https://hooks.slack.com/...",
  "agent": "manus",
  "category": "documentation",
  "priority": "normal",
  "documentUrl": "https://docs.google.com/...",
  "processed_by_manus": true,
  "original_command": "[original text]"
}
```

**Output (Standard path)**:
```json
{
  "title": "carla: check system status",
  "body": "## Task\n\ncheck system status\n\n[rest of body]",
  "user_name": "carla",
  "channel_id": "C09PP5GSAS3",
  "response_url": "https://hooks.slack.com/...",
  "agent": "claude-code",
  "category": "testing",
  "priority": "normal",
  "documentUrl": "",
  "processed_by_manus": false,
  "original_command": "check system status"
}
```

---

### 6. Create Github Issue
**Input**: Format for Github output

**Output**:
```json
{
  ...all previous data,
  "number": 42,
  "html_url": "https://github.com/carlorbiz/cc-task-queue/issues/42",
  "id": 123456789
}
```

---

### 7. Send a message (Slack)
**Input**: Create Github Issue output

**Message (Manus path)**:
```
🧠 Manus created your document!

📄 View: https://docs.google.com/document/d/abc123...

Logged to Notion and GitHub for reference.
```

**Message (Standard path)**:
```
✅ Task queued for claude-code. I will notify you when complete.
```

---

### 8. Create Notion Entry
**Input**: Send a message output

**Notion Properties**:
```
Title: [original_command]
Primary AI Agent: Manus / Claude Code / etc.
Source Link: https://carlorbizworkspace.slack.com
Document URL: https://docs.google.com/... (if Manus)
Instructions: [reasoning or doc URL]
Status: 📥 Captured
Tags: automation
Conversation Date: [now]
```

**Output**:
```json
{
  ...all previous data,
  "id": "abc123-notion-page-id",
  "url": "https://notion.so/abc123..."
}
```

---

### 9. Log to Knowledge Lake
**Input**: Create Notion Entry output

**API Call**:
```json
POST https://knowledge-lake-api-production.up.railway.app/knowledge/add
{
  "content": "Slack /ai command from carla: [command]. Processed by Manus. Document: [url]",
  "user_id": "carla",
  "metadata": {
    "source": "slack_ai_command",
    "agent": "manus",
    "timestamp": "2025-11-06T12:30:00.000Z",
    "notion_page_id": "abc123-notion-page-id",
    "github_issue": 42,
    "processed_by_manus": true,
    "documentUrl": "https://docs.google.com/...",
    "category": "documentation",
    "priority": "normal"
  }
}
```

---

## Key Data Fields Throughout Workflow

### Fields Present in ALL Nodes (after Parse Slack Command):
- `user_id`
- `user_name`
- `command_text`
- `channel_id`
- `response_url`
- `timestamp`
- `agent`
- `category`
- `priority`
- `original_command`

### Fields Added by Manus Path:
- `documentUrl`
- `template_used`
- `manus_reasoning`
- `processed_by_manus: true`

### Fields Added by GitHub Node:
- `number` (issue number)
- `html_url`
- `id` (GitHub issue ID)

### Fields Added by Notion Node:
- `id` (Notion page ID)
- `url` (Notion page URL)

---

## Data Flow Summary

**Short Content** (< 1800 chars):
```
Slack → Parse → Query KL → Format → GitHub → Slack → Notion → Log KL
```

**Long Content** (>= 1800 chars):
```
Slack → Parse → Manus → Format Manus → Query KL → Format → GitHub → Slack → Notion → Log KL
```

**Key Insight**: Both paths merge at "Query Knowledge Lake", so from that point forward, the workflow is identical except for the data content (Manus path has `documentUrl` and `processed_by_manus: true`).

---

## Troubleshooting Data Flow

### If GitHub issue body is wrong:
**Check**: Format for Github node output - does it have the correct fields?

### If Notion entry is missing data:
**Check**: Does Format for Github pass through all needed fields?

### If Slack message is wrong:
**Check**: Does "Send a message" node have access to `processed_by_manus` and `documentUrl`?

### If Knowledge Lake log is incomplete:
**Check**: Are all fields available in Create Notion Entry output?

---

**Understanding this flow helps debug issues!** 🔍

# n8n Visual Workflow Guide - MCP Integration

## Current State: You Have ✅

- ✅ Railway MCP servers deployed and tested
- ✅ n8n custom auth: `n8n Railway DocsAutomator-Manus`
- ✅ n8n custom auth: `n8n Railway Gamma-Manus`
- ✅ All 5 template docIds from Manus
- ✅ Existing workflow: Parse Slack Command → GitHub flow

---

## What to Add: 3 New Branches

### Branch 1: Manus Intelligent Document (Recommended)
### Branch 2: Direct DocsAutomator (Simple Fallback)
### Branch 3: Gamma Presentation (For Slide Decks)

---

## Branch 1: Manus Intelligent Document 🧠

### Visual Flow:
```
Parse Slack Command
    ↓
[NEW] Should Route to Manus? (IF)
    ↓ (true)
[NEW] Call Manus Webhook (HTTP)
    ↓
[NEW] Log to Notion (Notion)
    ↓
[NEW] Reply to Slack (HTTP)
```

### Nodes to Add:

#### 1️⃣ IF Node: "Should Route to Manus?"

**Position**: After "Parse Slack Command"

**Condition**:
```javascript
{{
  $json.command_text.length >= 1800 ||
  $json.command_text.toLowerCase().includes('document') ||
  $json.command_text.toLowerCase().includes('delegate') ||
  $json.command_text.toLowerCase().includes('research')
}}
```

**Connect**:
- `true` output → Next node (Call Manus)
- `false` output → Your existing GitHub flow

---

#### 2️⃣ HTTP Request: "Call Manus - Intelligent Router"

**Position**: After "Should Route to Manus?" (true branch)

**Settings**:
- **Authentication**: None (webhook URL is the secret)
- **Method**: POST
- **URL**: `[Manus will provide]`
- **Body**:
```json
{
  "action": "intelligent_document_generation",
  "content": "{{$node['Parse Slack Command'].json.command_text}}",
  "metadata": {
    "user": "{{$node['Parse Slack Command'].json.user_name}}",
    "user_id": "{{$node['Parse Slack Command'].json.user_id}}",
    "channel": "{{$node['Parse Slack Command'].json.channel_id}}",
    "title": "{{$node['Parse Slack Command'].json.notion_title}}",
    "timestamp": "{{$now.toISO()}}"
  }
}
```

**What You'll Get Back**:
```json
{
  "googleDocUrl": "https://docs.google.com/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "template_used": "AAE_Research_Summary",
  "reasoning": "Selected because..."
}
```

---

#### 3️⃣ Notion: "Log to Notion (Manus Doc)"

**Position**: After "Call Manus"

**Settings**:
- **Database**: AI Agent Universal Conversations
- **Properties**:
  - Title: `{{$node['Parse Slack Command'].json.notion_title}}`
  - Document URL: `{{$json.googleDocUrl}}`
  - PDF URL: `{{$json.pdfUrl}}`
  - Template: `{{$json.template_used}}`
  - Agent: `Manus`
  - Reasoning: `{{$json.reasoning}}`

---

#### 4️⃣ HTTP Request: "Reply to Slack (Manus Doc)"

**Position**: After "Log to Notion"

**Settings**:
- **Method**: POST
- **URL**: `{{$node['Parse Slack Command'].json.response_url}}`
- **Body**:
```json
{
  "response_type": "in_channel",
  "text": ":brain: Manus created your document!",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":page_facing_up: <{{$node['Call Manus - Intelligent Router'].json.googleDocUrl}}|View Doc> | :page_with_curl: <{{$node['Call Manus - Intelligent Router'].json.pdfUrl}}|PDF>\n\n:bulb: *{{$node['Call Manus - Intelligent Router'].json.template_used}}*"
      }
    }
  ]
}
```

---

## Branch 2: Direct DocsAutomator (Simple) 📄

Use this if you want to bypass Manus and create docs directly.

### Visual Flow:
```
Parse Slack Command
    ↓
[NEW] Is Long Content? (IF)
    ↓ (true)
[NEW] Call DocsAutomator MCP (HTTP)
    ↓
[NEW] Log to Notion (Notion)
    ↓
[NEW] Reply to Slack (HTTP)
```

### Nodes to Add:

#### 1️⃣ IF Node: "Is Long Content?"

**Condition**:
```javascript
{{$json.command_text.length >= 1800}}
```

---

#### 2️⃣ HTTP Request: "Call DocsAutomator MCP"

**Settings**:
- **Authentication**: `n8n Railway DocsAutomator-Manus`
- **Method**: POST
- **URL**: `https://web-production-14aec.up.railway.app/create_document`
- **Body**:
```json
{
  "docId": "690b41a53756bfff1462734e",
  "documentName": "{{$node['Parse Slack Command'].json.user_name}} - {{$now.format('yyyy-MM-dd HH:mm')}}",
  "data": {
    "document_title": "{{$node['Parse Slack Command'].json.notion_title}}",
    "generation_date": "{{$now.format('MMMM d, yyyy')}}",
    "main_content": "{{$node['Parse Slack Command'].json.command_text}}"
  }
}
```

**Response**:
```json
{
  "googleDocUrl": "https://docs.google.com/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/..."
}
```

---

## Branch 3: Gamma Presentation 🎨

Use this for presentation/slide deck requests.

### Visual Flow:
```
Parse Slack Command
    ↓
[NEW] Is Presentation Request? (IF)
    ↓ (true)
[NEW] Call Gamma MCP - Generate (HTTP)
    ↓
[NEW] Wait 10 Seconds (Wait)
    ↓
[NEW] Call Gamma MCP - Check Status (HTTP)
    ↓
[NEW] Log to Notion (Notion)
    ↓
[NEW] Reply to Slack (HTTP)
```

### Nodes to Add:

#### 1️⃣ IF Node: "Is Presentation Request?"

**Condition**:
```javascript
{{
  $json.command_text.toLowerCase().includes('presentation') ||
  $json.command_text.toLowerCase().includes('slides') ||
  $json.command_text.toLowerCase().includes('deck')
}}
```

---

#### 2️⃣ HTTP Request: "Call Gamma MCP - Generate"

**Settings**:
- **Authentication**: `n8n Railway Gamma-Manus`
- **Method**: POST
- **URL**: `https://web-production-b4cb0.up.railway.app/generate`
- **Body**:
```json
{
  "inputText": "{{$node['Parse Slack Command'].json.command_text}}",
  "format": "presentation",
  "numCards": 12
}
```

**Response**:
```json
{
  "generationId": "abc123xyz"
}
```

---

#### 3️⃣ Wait Node: "Wait 10 Seconds"

**Settings**:
- **Resume**: After Time Interval
- **Amount**: 10
- **Unit**: Seconds

---

#### 4️⃣ HTTP Request: "Call Gamma MCP - Check Status"

**Settings**:
- **Authentication**: `n8n Railway Gamma-Manus`
- **Method**: GET
- **URL**: `https://web-production-b4cb0.up.railway.app/generations/{{$node['Call Gamma MCP - Generate'].json.generationId}}`

**Response**:
```json
{
  "status": "completed",
  "gammaUrl": "https://gamma.app/docs/..."
}
```

---

## Complete Workflow Overview

```
                    Parse Slack Command
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Should Route          Is Long          Is Presentation
   to Manus?            Content?           Request?
        │                   │                   │
        ↓                   ↓                   ↓
   Call Manus          DocsAutomator       Gamma Generate
   Webhook                 MCP                  │
        │                   │                  Wait 10s
        │                   │                   │
        │                   │              Gamma Status
        │                   │                   │
        └──────────┬────────┴───────────────────┘
                   │
            Log to Notion
                   │
            Reply to Slack
```

---

## Recommended Approach: Start with Branch 1 (Manus)

### Why?
- ✅ Most intelligent (5 templates)
- ✅ Manus handles complexity
- ✅ Easy to expand
- ✅ Provides reasoning

### What You Need:
1. ⏳ Manus's webhook URL
2. ⏳ Test with real content

### Once Working:
- Branch 2 & 3 are optional enhancements
- Can add later if needed

---

## Quick Test Plan

### Test 1: Simple Test Workflow

Before adding to main workflow, create standalone test:

1. **Create new workflow**: "Test Railway MCPs"
2. **Add nodes**:
   - Manual Trigger
   - HTTP Request (DocsAutomator)
   - Display result
3. **Execute**
4. **Verify**: Get back Google Doc URL

### Test 2: Gamma Test

1. **Create workflow**: "Test Gamma MCP"
2. **Add nodes**:
   - Manual Trigger
   - HTTP Request (Gamma Generate)
   - Wait 10 seconds
   - HTTP Request (Gamma Status)
   - Display result
3. **Execute**
4. **Verify**: Get back Gamma URL

### Test 3: Manus Integration

1. **Wait for**: Manus webhook URL
2. **Add**: Branch 1 nodes to main workflow
3. **Test with**: `/ai cc research AI automation trends`
4. **Verify**: Document created with right template

---

## Priority Order

1. ✅ **DONE**: Railway MCPs deployed
2. ✅ **DONE**: n8n auth credentials created
3. ⏳ **NEXT**: Create test workflows for MCPs
4. ⏳ **WAIT**: Manus webhook URL
5. ⏳ **THEN**: Add Branch 1 to main workflow
6. ⏳ **OPTIONAL**: Add Branches 2 & 3

---

## Summary

You have everything ready except:
- ⏳ Manus's webhook URL

Once you have that, you can add the 4 nodes for Branch 1 and start testing!

**Next Step**: Either wait for Manus, OR create test workflows to verify the Railway MCPs work from n8n. 🚀

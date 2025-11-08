# n8n → Manus Intelligent Document Routing

## Overview

Instead of using a simple length check, we route ALL long-form content to **Manus** who intelligently:
1. Analyzes the content
2. Selects the appropriate template from 5 options
3. Calls DocsAutomator MCP with correct docId
4. Returns the Google Doc URL

This is much more powerful than a simple IF node!

---

## Manus's 5 Templates

| Template Name | Use Case | docId (Pending) |
|--------------|----------|-----------------|
| `AAE_DeepDive_Analysis` | Comprehensive analysis, multi-section | TBD |
| `AAE_MultiAgent_Coordination` | Multi-agent delegation with status tracking | TBD |
| `AAE_Status_Update` | System health checks, quick status | TBD |
| `AAE_Research_Summary` | Research findings with sources | TBD |
| `AAE_Quick_Note` | Quick notes, flexible formatting | TBD |

### Manus's Decision Tree:

```
1. Contains "Delegate to" AND "Status Report"?
   → AAE_MultiAgent_Coordination

2. Contains "Status Report" OR "System Status" (no delegation)?
   → AAE_Status_Update

3. Contains "Investigate" OR "Research" OR "Analyze"?
   → AAE_Research_Summary

4. Comprehensive multi-section task?
   → AAE_DeepDive_Analysis

5. Default (everything else):
   → AAE_Quick_Note
```

---

## n8n Workflow Architecture

### Simplified Flow:

```
Parse Slack Command
    ↓
Should Route to Manus? (IF Node)
    ↓
    ├─ No → GitHub/CC (existing flow)
    │
    └─ Yes → Call Manus API
                  ↓
              (Manus analyzes & generates doc)
                  ↓
              Get Google Doc URL
                  ↓
              Store URL in Notion
                  ↓
              Reply to Slack
```

---

## Step 1: Add "Should Route to Manus?" Node

**After**: "Parse Slack Command" node
**Node Type**: IF Node
**Node Name**: "Should Route to Manus?"

### Configuration:

**Condition**: Route to Manus if ANY of these are true:

```javascript
{{
  // Long content
  $json.command_text.length >= 1800 ||

  // Keywords indicating structured content
  $json.command_text.toLowerCase().includes('delegate') ||
  $json.command_text.toLowerCase().includes('status report') ||
  $json.command_text.toLowerCase().includes('research') ||
  $json.command_text.toLowerCase().includes('investigate') ||
  $json.command_text.toLowerCase().includes('analyze') ||

  // Explicit request for document
  $json.command_text.toLowerCase().includes('create document') ||
  $json.command_text.toLowerCase().includes('generate doc')
}}
```

**Outputs:**
- `true` → Route to Manus
- `false` → Use existing GitHub/CC flow

---

## Step 2: Call Manus API (Option A: Direct to Manus)

**After**: "Should Route to Manus?" node (connect to `true` output)
**Node Type**: HTTP Request
**Node Name**: "Call Manus - Intelligent Routing"

### Configuration:

**Method**: POST

**URL**: `[Manus's webhook URL for intelligent document generation]`

**Authentication**: [As required by Manus]

**Body Content Type**: JSON

**Body**:
```json
{
  "task": "{{$node['Parse Slack Command'].json.command_text}}",
  "user": "{{$node['Parse Slack Command'].json.user_name}}",
  "source": "slack",
  "channel": "{{$node['Parse Slack Command'].json.channel_id}}",
  "context": {
    "title": "{{$node['Parse Slack Command'].json.notion_title}}",
    "priority": "{{$node['Parse Slack Command'].json.priority}}",
    "category": "{{$node['Parse Slack Command'].json.category}}"
  }
}
```

### Expected Response from Manus:

```json
{
  "template_used": "AAE_DeepDive_Analysis",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "docId": "...",
  "reasoning": "Selected AAE_DeepDive_Analysis because content requires comprehensive multi-section analysis"
}
```

---

## Step 2 Alternative: Call Manus via Zapier MCP

If Manus is using the Zapier MCP integration:

**Node Type**: HTTP Request
**Node Name**: "Call Manus via Zapier MCP"

**Method**: POST

**URL**: `[Your Zapier webhook URL that triggers Manus]`

**Body**:
```json
{
  "action": "intelligent_document_generation",
  "content": "{{$node['Parse Slack Command'].json.command_text}}",
  "metadata": {
    "user": "{{$node['Parse Slack Command'].json.user_name}}",
    "source": "slack",
    "channel": "{{$node['Parse Slack Command'].json.channel_id}}"
  }
}
```

---

## Step 3: Store in Notion

**After**: "Call Manus" node
**Node Type**: Notion
**Node Name**: "Log to Notion (Manus Document)"

### Configuration:

**Resource**: Database Page
**Operation**: Create
**Database ID**: [Your AI Agent Universal Conversations Database ID]

**Properties**:

| Property | Type | Value |
|----------|------|-------|
| **Title** | Title | `{{$node['Parse Slack Command'].json.notion_title}}` |
| **Document URL** | URL | `{{$json.googleDocUrl}}` |
| **PDF URL** | URL | `{{$json.pdfUrl}}` |
| **Template Used** | Select | `{{$json.template_used}}` |
| **User** | Text/Select | `{{$node['Parse Slack Command'].json.user_name}}` |
| **Channel** | Text | `{{$node['Parse Slack Command'].json.channel_id}}` |
| **Content Type** | Select | `Document - AI Generated` |
| **Agent** | Select | `Manus` |
| **Created Date** | Date | `{{$now}}` |
| **Source** | Select | `Slack` |

**Optional - Add Reasoning Field**:
- **AI Reasoning** (Text): `{{$json.reasoning}}`

This helps you understand why Manus chose that template!

---

## Step 4: Reply to Slack

**After**: "Log to Notion (Manus Document)" node
**Node Type**: HTTP Request
**Node Name**: "Send Slack Response (Manus Document)"

### Configuration:

**Method**: POST
**URL**: `{{$node['Parse Slack Command'].json.response_url}}`

**Body**:
```json
{
  "response_type": "in_channel",
  "text": ":brain: Manus generated your document!",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Task*: {{$node['Parse Slack Command'].json.notion_title}}\n*From*: <@{{$node['Parse Slack Command'].json.user_id}}>"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":page_facing_up: *Google Doc*: <{{$node['Call Manus - Intelligent Routing'].json.googleDocUrl}}|View Document>\n:page_with_curl: *PDF*: <{{$node['Call Manus - Intelligent Routing'].json.pdfUrl}}|Download PDF>\n\n:bulb: *Template*: `{{$node['Call Manus - Intelligent Routing'].json.template_used}}`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Generated by Manus AI | {{$node['Call Manus - Intelligent Routing'].json.reasoning}}"
        }
      ]
    }
  ]
}
```

---

## Complete Node Sequence (Manus Branch)

```
Parse Slack Command
    ↓
Should Route to Manus? (IF)
    ↓ (true)
Call Manus - Intelligent Routing (HTTP)
    ↓
Log to Notion (Manus Document) (Notion)
    ↓
Send Slack Response (Manus Document) (HTTP)
```

---

## What Happens Behind the Scenes (Manus's Job)

When Manus receives the request:

1. **Analyzes Content**: Looks for keywords and patterns
2. **Selects Template**: Uses decision tree to pick from 5 templates
3. **Formats Data**: Structures content according to template placeholders
4. **Calls DocsAutomator MCP**:
   ```bash
   POST https://web-production-14aec.up.railway.app/create_document
   {
     "docId": "[selected template's docId]",
     "documentName": "...",
     "data": { [formatted according to template] }
   }
   ```
5. **Returns Response**: Sends back Google Doc URL + metadata

---

## Why This is Better Than IF Nodes

### Old Approach (Simple Length Check):
```
IF content.length >= 1800:
  → Create generic document
ELSE:
  → Use GitHub flow
```
**Problem**: One-size-fits-all document, no intelligence

### New Approach (Manus Intelligence):
```
Analyze content semantically
→ Determine content type
→ Select appropriate template
→ Format data correctly
→ Generate structured document
```
**Benefits**:
- ✅ 5 specialized templates instead of 1 generic
- ✅ Intelligent keyword detection
- ✅ Proper formatting per template
- ✅ Reasoning provided for transparency
- ✅ Scales to more templates easily

---

## Setting Up Manus's Side

### What Manus Needs:

1. **All 5 Template docIds** (from DocsAutomator)
2. **Webhook/API Endpoint** to receive n8n requests
3. **Access to DocsAutomator MCP** (`https://web-production-14aec.up.railway.app`)
4. **Decision Tree Logic** (already documented)

### Manus's Response Format:

```json
{
  "success": true,
  "template_used": "AAE_Research_Summary",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "docId": "...",
  "reasoning": "Selected AAE_Research_Summary because content contains 'investigate' and 'analyze' keywords",
  "metadata": {
    "processing_time_ms": 2340,
    "content_length": 2847,
    "template_confidence": 0.95
  }
}
```

---

## Testing Strategy

### Test Case 1: Multi-Agent Delegation
```
/ai cc Delegate to Fred for user research, Penny for content writing, and Gemini for visual design. Status Report required by Friday.
```
**Expected**: Manus selects `AAE_MultiAgent_Coordination`

### Test Case 2: Status Update
```
/ai cc System Status: All services operational. Database at 73% capacity. No issues detected.
```
**Expected**: Manus selects `AAE_Status_Update`

### Test Case 3: Research Task
```
/ai cc Investigate the best practices for AI agent coordination in enterprise environments. Analyze current market solutions and provide recommendations.
```
**Expected**: Manus selects `AAE_Research_Summary`

### Test Case 4: Deep Analysis
```
/ai cc [Long, multi-paragraph complex analysis request with multiple sections]
```
**Expected**: Manus selects `AAE_DeepDive_Analysis`

### Test Case 5: Quick Note
```
/ai cc Remember to update the Notion database with new agent configurations tomorrow.
```
**Expected**: Manus selects `AAE_Quick_Note`

### Test Case 6: Short Task (No Manus)
```
/ai cc check system status
```
**Expected**: Routes to GitHub/CC flow (bypasses Manus entirely)

---

## Next Steps

### For You:
1. ✅ Upload all 5 templates to DocsAutomator
2. ✅ Get the 5 docIds
3. ✅ Share docIds with Manus
4. ⏳ Set up Manus's webhook/API endpoint

### For Manus:
1. ⏳ Create webhook to receive n8n requests
2. ⏳ Implement decision tree logic
3. ⏳ Store docId mapping
4. ⏳ Test with DocsAutomator MCP
5. ⏳ Return structured response to n8n

### For Claude Code (Me):
1. ✅ Document the architecture
2. ⏳ Help configure n8n nodes once Manus is ready
3. ⏳ Test end-to-end workflow
4. ⏳ Monitor and debug

---

## Cost Analysis

### With Manus + MCP Architecture:
- **Manus**: $0 (uses your existing Zapier allowance for coordination)
- **DocsAutomator MCP**: ~$1/month (Railway)
- **Gamma MCP**: ~$1/month (Railway)
- **Total**: ~$2/month

### Previous Zapier-Heavy Approach:
- **Zapier Tasks**: 100-500 tasks/month = $20-100/month

### Savings: $18-98/month (90-98% reduction) 💰

---

## Summary

This architecture:
- ✅ Uses Manus's intelligence to select the right template
- ✅ Maintains 5 specialized templates instead of 1 generic
- ✅ Eliminates complex IF node logic in n8n
- ✅ Provides transparency (reasoning field)
- ✅ Scales easily to more templates
- ✅ Saves $18-98/month vs pure Zapier approach

**The intelligence lives with Manus, not in n8n IF nodes!** 🧠

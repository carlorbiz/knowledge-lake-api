# n8n → Manus Complete Integration Guide

## 🎉 All Templates Ready!

Manus has configured all 5 DocsAutomator templates with their docIds:

| Template | Use Case | docId |
|----------|----------|-------|
| `AAE_DeepDive_Analysis` | Comprehensive multi-section analysis | `69088da6d852c9556cec26af` |
| `AAE_MultiAgent_Coordination` | Multi-agent delegation + status tracking | `690b3d3f3756bfff14626684` |
| `AAE_Status_Update` | System health checks, quick status | `690b3f973756bfff14626a7a` |
| `AAE_Research_Summary` | Research findings with sources | `690b3ffa3756bfff14626c17` |
| `AAE_Quick_Note` | Quick notes, flexible formatting | `690b41a53756bfff1462734e` |

---

## Architecture Decision: Which Path?

There are **2 ways** to call DocsAutomator:

### Option A: Manus → Zapier MCP → DocsAutomator API
```
n8n → Manus (via webhook)
        ↓
      Zapier MCP (docsautomator_create_document)
        ↓
      DocsAutomator API
```
**Pros**: Manus already has this set up
**Cons**: Uses Zapier tasks ($$$)

### Option B: Manus → Railway MCP → DocsAutomator API
```
n8n → Manus (via webhook)
        ↓
      DocsAutomator Railway MCP (direct HTTP)
        ↓
      DocsAutomator API
```
**Pros**: Zero Zapier cost, faster
**Cons**: Requires Manus to call Railway MCP directly

---

## ⚠️ RECOMMENDATION: Use Option B (Railway MCP)

Since you want to **minimize Zapier costs**, Manus should call the **Railway MCP directly** instead of using Zapier MCP.

### For Manus to Implement:

Instead of:
```python
# Via Zapier MCP
zapier.docsautomator_create_document(docId=selected_docId, data=formatted_data)
```

Use:
```python
# Direct to Railway MCP
import requests

response = requests.post(
    'https://web-production-14aec.up.railway.app/create_document',
    json={
        'docId': selected_docId,
        'documentName': f"{user_name} - {timestamp}",
        'data': formatted_data
    }
)
doc_url = response.json()['googleDocUrl']
```

**This eliminates Zapier tasks entirely for document generation!** 🎯

---

## n8n Workflow Configuration

### Node 1: "Should Route to Manus?"

**Type**: IF Node
**After**: "Parse Slack Command"

**Condition**:
```javascript
{{
  // Long content
  $json.command_text.length >= 1800 ||

  // Keywords for structured content
  $json.command_text.toLowerCase().includes('delegate') ||
  $json.command_text.toLowerCase().includes('status report') ||
  $json.command_text.toLowerCase().includes('research') ||
  $json.command_text.toLowerCase().includes('investigate') ||
  $json.command_text.toLowerCase().includes('analyze') ||
  $json.command_text.toLowerCase().includes('create document')
}}
```

---

### Node 2: "Call Manus for Document"

**Type**: HTTP Request
**After**: "Should Route to Manus?" (true output)

**Method**: POST

**URL**: `[Manus's webhook URL]`

**Body**:
```json
{
  "action": "intelligent_document_generation",
  "content": "{{$node['Parse Slack Command'].json.command_text}}",
  "metadata": {
    "user": "{{$node['Parse Slack Command'].json.user_name}}",
    "user_id": "{{$node['Parse Slack Command'].json.user_id}}",
    "source": "slack",
    "channel": "{{$node['Parse Slack Command'].json.channel_id}}",
    "title": "{{$node['Parse Slack Command'].json.notion_title}}",
    "priority": "{{$node['Parse Slack Command'].json.priority}}",
    "timestamp": "{{$now}}"
  }
}
```

**Expected Response from Manus**:
```json
{
  "success": true,
  "template_used": "AAE_Research_Summary",
  "docId": "690b3ffa3756bfff14626c17",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "reasoning": "Selected AAE_Research_Summary because content contains 'investigate' and 'analyze' keywords",
  "processing_time_ms": 2340
}
```

---

### Node 3: "Log to Notion (Manus Document)"

**Type**: Notion
**After**: "Call Manus for Document"

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
| **Agent** | Select | `Manus` |
| **User** | Text/Select | `{{$node['Parse Slack Command'].json.user_name}}` |
| **Channel** | Text | `{{$node['Parse Slack Command'].json.channel_id}}` |
| **Content Type** | Select | `AI Generated Document` |
| **AI Reasoning** | Text | `{{$json.reasoning}}` |
| **Created Date** | Date | `{{$now}}` |
| **Source** | Select | `Slack` |
| **Processing Time (ms)** | Number | `{{$json.processing_time_ms}}` |

---

### Node 4: "Send Slack Response (Manus Document)"

**Type**: HTTP Request
**After**: "Log to Notion (Manus Document)"

**Method**: POST
**URL**: `{{$node['Parse Slack Command'].json.response_url}}`

**Body**:
```json
{
  "response_type": "in_channel",
  "text": ":brain: Manus generated your document intelligently!",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Task*: {{$node['Parse Slack Command'].json.notion_title}}\n*From*: <@{{$node['Parse Slack Command'].json.user_id}}>\n*Template*: `{{$node['Call Manus for Document'].json.template_used}}`"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":page_facing_up: *Google Doc*: <{{$node['Call Manus for Document'].json.googleDocUrl}}|View Document>\n:page_with_curl: *PDF*: <{{$node['Call Manus for Document'].json.pdfUrl}}|Download PDF>"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":bulb: {{$node['Call Manus for Document'].json.reasoning}} | Generated in {{$node['Call Manus for Document'].json.processing_time_ms}}ms"
        }
      ]
    }
  ]
}
```

---

## What Manus Needs to Implement

### 1. Webhook Endpoint

Create a webhook that receives the POST request from n8n:

```python
@app.post("/webhook/intelligent-document")
async def intelligent_document(request: Request):
    data = await request.json()

    content = data['content']
    metadata = data['metadata']

    # Step 1: Analyze and select template
    template_info = select_template(content)

    # Step 2: Format data for template
    formatted_data = format_for_template(content, metadata, template_info)

    # Step 3: Call Railway MCP (NOT Zapier!)
    doc_response = call_docsautomator_mcp(
        docId=template_info['docId'],
        documentName=f"{metadata['user']} - {metadata['timestamp']}",
        data=formatted_data
    )

    # Step 4: Return to n8n
    return {
        "success": True,
        "template_used": template_info['name'],
        "docId": template_info['docId'],
        "googleDocUrl": doc_response['googleDocUrl'],
        "pdfUrl": doc_response['pdfUrl'],
        "reasoning": template_info['reasoning'],
        "processing_time_ms": processing_time
    }
```

### 2. Template Selection Logic

```python
def select_template(content: str) -> dict:
    content_lower = content.lower()

    # Decision tree
    if 'delegate' in content_lower and 'status report' in content_lower:
        return {
            'name': 'AAE_MultiAgent_Coordination',
            'docId': '690b3d3f3756bfff14626684',
            'reasoning': 'Content requires multi-agent delegation with status tracking'
        }

    if 'status report' in content_lower or 'system status' in content_lower:
        return {
            'name': 'AAE_Status_Update',
            'docId': '690b3f973756bfff14626a7a',
            'reasoning': 'Content is a status update or system health check'
        }

    if any(kw in content_lower for kw in ['investigate', 'research', 'analyze']):
        return {
            'name': 'AAE_Research_Summary',
            'docId': '690b3ffa3756bfff14626c17',
            'reasoning': 'Content requires research analysis and source citations'
        }

    # Check for comprehensive multi-section content
    if len(content) > 2000 or content.count('\n\n') > 5:
        return {
            'name': 'AAE_DeepDive_Analysis',
            'docId': '69088da6d852c9556cec26af',
            'reasoning': 'Content requires comprehensive multi-section analysis'
        }

    # Default
    return {
        'name': 'AAE_Quick_Note',
        'docId': '690b41a53756bfff1462734e',
        'reasoning': 'Using flexible quick note template'
    }
```

### 3. Call Railway MCP (NOT Zapier)

```python
import requests

def call_docsautomator_mcp(docId: str, documentName: str, data: dict) -> dict:
    response = requests.post(
        'https://web-production-14aec.up.railway.app/create_document',
        json={
            'docId': docId,
            'documentName': documentName,
            'data': data
        },
        timeout=30
    )
    response.raise_for_status()
    return response.json()
```

**This eliminates Zapier costs!** 💰

---

## Complete Workflow Sequence

```
Slack Command (/ai cc [content])
    ↓
Parse Slack Command
    ↓
Should Route to Manus? (IF)
    ↓
    ├─ false → GitHub/CC (existing flow)
    │
    └─ true → Call Manus for Document (HTTP)
                  ↓
              (Manus analyzes → selects template → calls Railway MCP)
                  ↓
              Log to Notion (Manus Document)
                  ↓
              Send Slack Response (Manus Document)
```

---

## Testing the Complete Integration

### Test 1: Multi-Agent Coordination
```
/ai cc Delegate to Fred for user research, Penny for content writing, and Gemini for visual design. Status Report required by Friday. Track progress in Notion.
```

**Expected**:
- Template: `AAE_MultiAgent_Coordination`
- docId: `690b3d3f3756bfff14626684`
- Reasoning: "Content requires multi-agent delegation with status tracking"

### Test 2: Status Update
```
/ai cc System Status: All services operational. Database at 73% capacity. API response time: 150ms. No issues detected. Next check scheduled for tomorrow.
```

**Expected**:
- Template: `AAE_Status_Update`
- docId: `690b3f973756bfff14626a7a`
- Reasoning: "Content is a status update or system health check"

### Test 3: Research Summary
```
/ai cc Investigate the best practices for AI agent coordination in enterprise environments. Analyze current market solutions including CrewAI, AutoGPT, and LangChain. Provide recommendations based on cost, scalability, and ease of integration.
```

**Expected**:
- Template: `AAE_Research_Summary`
- docId: `690b3ffa3756bfff14626c17`
- Reasoning: "Content requires research analysis and source citations"

### Test 4: Deep Dive Analysis
```
/ai cc [3000+ character comprehensive analysis request with multiple sections, technical requirements, implementation details, and cross-agent coordination needs]
```

**Expected**:
- Template: `AAE_DeepDive_Analysis`
- docId: `69088da6d852c9556cec26af`
- Reasoning: "Content requires comprehensive multi-section analysis"

### Test 5: Quick Note
```
/ai cc Remember to update the Notion database with new agent configurations tomorrow morning before the team meeting.
```

**Expected**:
- Template: `AAE_Quick_Note`
- docId: `690b41a53756bfff1462734e`
- Reasoning: "Using flexible quick note template"

---

## Cost Analysis

### Current Setup (All on Railway MCP):
- **n8n**: $5/month (Railway)
- **DocsAutomator MCP**: ~$1/month (Railway)
- **Gamma MCP**: ~$1/month (Railway)
- **Zapier**: $0 for document generation (saving $20-100/month!)
- **Total**: ~$7/month

### If Using Zapier MCP Instead:
- Everything above PLUS
- **Zapier Tasks**: 100-500 tasks/month = $20-100/month
- **Total**: ~$27-107/month

### Savings by Using Railway MCP: $20-100/month! 💰

---

## Next Steps

1. ✅ All 5 templates configured with docIds
2. ⏳ Manus implements webhook endpoint
3. ⏳ Manus switches from Zapier MCP to Railway MCP (for cost savings)
4. ⏳ Add nodes to n8n workflow
5. ⏳ Test each template with real content
6. ⏳ Monitor and refine

---

## Summary

This architecture:
- ✅ Uses Manus's intelligence (5 specialized templates)
- ✅ Eliminates Zapier costs for document generation ($20-100/month savings)
- ✅ Maintains full automation
- ✅ Provides transparency (reasoning field)
- ✅ Scales to unlimited templates
- ✅ Keeps workflow simple (just 1 HTTP call to Manus)

**The secret: Manus calls Railway MCP directly, not through Zapier!** 🎯

# n8n Railway MCP Node Configuration

## ✅ Custom Auth Credentials Created

You've added these custom auth credentials in n8n:
- `n8n Railway DocsAutomator-Manus`
- `n8n Railway Gamma-Manus`

These can now be used in HTTP Request nodes!

---

## DocsAutomator MCP Node Configuration

### Node: "Call DocsAutomator MCP"
**Type**: HTTP Request
**When to Use**: When content needs to be converted to a professional Google Doc

### Configuration:

**Authentication**:
- Select "Existing Credentials"
- Choose: `n8n Railway DocsAutomator-Manus`

**Method**: POST

**URL**: `https://web-production-14aec.up.railway.app/create_document`

**Send Body**: Yes

**Body Content Type**: JSON

**Body**:
```json
{
  "docId": "{{$json.docId || '690b41a53756bfff1462734e'}}",
  "documentName": "{{$json.user_name}} - {{$now.format('yyyy-MM-dd HH:mm')}}",
  "data": {
    "document_title": "{{$json.title || $json.notion_title}}",
    "generation_date": "{{$now.format('MMMM d, yyyy')}}",
    "main_content": "{{$json.content || $json.command_text}}"
  }
}
```

**Response Format**: JSON

### Input Data Expected:
```json
{
  "docId": "690b41a53756bfff1462734e",  // Template to use
  "user_name": "carla",
  "title": "Document Title",
  "content": "Full document content here..."
}
```

### Output Data Returned:
```json
{
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "savePdfGoogleDriveFolderId": "..."
}
```

---

## Gamma MCP Node Configuration

### Node: "Call Gamma MCP - Generate"
**Type**: HTTP Request
**When to Use**: When creating presentations, slide decks, or visual content

### Configuration:

**Authentication**:
- Select "Existing Credentials"
- Choose: `n8n Railway Gamma-Manus`

**Method**: POST

**URL**: `https://web-production-b4cb0.up.railway.app/generate`

**Send Body**: Yes

**Body Content Type**: JSON

**Body**:
```json
{
  "inputText": "{{$json.content || $json.command_text}}",
  "format": "{{$json.format || 'presentation'}}",
  "numCards": {{$json.numCards || 12}},
  "additionalInstructions": "{{$json.additionalInstructions || 'Create a professional presentation with clear structure and engaging visuals'}}"
}
```

**Response Format**: JSON

### Input Data Expected:
```json
{
  "content": "Create a presentation about AI automation in healthcare...",
  "format": "presentation",  // or "document" or "social"
  "numCards": 12,
  "additionalInstructions": "Use a professional tone"
}
```

### Output Data Returned:
```json
{
  "generationId": "abc123xyz"
}
```

---

## Gamma MCP Node - Check Status

### Node: "Call Gamma MCP - Check Status"
**Type**: HTTP Request
**When to Use**: After creating a presentation, wait ~10 seconds then check status

### Configuration:

**Authentication**:
- Select "Existing Credentials"
- Choose: `n8n Railway Gamma-Manus`

**Method**: GET

**URL**: `https://web-production-b4cb0.up.railway.app/generations/{{$json.generationId}}`

**Response Format**: JSON

### Input Data Expected:
```json
{
  "generationId": "abc123xyz"  // From previous "Generate" call
}
```

### Output Data Returned:
```json
{
  "generationId": "abc123xyz",
  "status": "completed",
  "gammaUrl": "https://gamma.app/docs/...",
  "pdfUrl": "https://...",  // If exportAs: "pdf" was requested
  "credits": {
    "deducted": 150,
    "remaining": 6095
  }
}
```

---

## Manus Intelligent Router Node

### Node: "Call Manus - Intelligent Document Router"
**Type**: HTTP Request
**When to Use**: When you want Manus to analyze content and pick the right template

### Configuration:

**Authentication**:
- [Depends on how Manus exposes his webhook - may not need auth if webhook URL is secret]
- If Manus is using Zapier webhooks: No auth needed (URL is the secret)
- If Manus creates custom endpoint: May need custom auth

**Method**: POST

**URL**: `[Manus will provide his webhook URL]`

**Send Body**: Yes

**Body Content Type**: JSON

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
    "timestamp": "{{$now.toISO()}}"
  }
}
```

**What Manus Will Do**:
1. Analyze content
2. Select template (1 of 5 docIds)
3. Call DocsAutomator Railway MCP directly
4. Return Google Doc URL

**Expected Response from Manus**:
```json
{
  "success": true,
  "template_used": "AAE_Research_Summary",
  "docId": "690b3ffa3756bfff14626c17",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "reasoning": "Selected AAE_Research_Summary because content contains 'investigate' and 'analyze' keywords"
}
```

---

## Complete Workflow Example: Manus Intelligent Routing

### Flow:
```
Parse Slack Command
    ↓
Should Route to Manus? (IF)
    ↓ (true)
Call Manus - Intelligent Document Router
    ↓
Log to Notion (with URL)
    ↓
Send Slack Response
```

### Node Sequence:

#### 1. IF Node: "Should Route to Manus?"

**Condition**:
```javascript
{{
  $json.command_text.length >= 1800 ||
  $json.command_text.toLowerCase().includes('delegate') ||
  $json.command_text.toLowerCase().includes('status report') ||
  $json.command_text.toLowerCase().includes('research') ||
  $json.command_text.toLowerCase().includes('investigate') ||
  $json.command_text.toLowerCase().includes('document')
}}
```

#### 2. HTTP Request: "Call Manus - Intelligent Document Router"

See configuration above ↑

#### 3. Notion Node: "Log to Notion (Manus Document)"

**Properties**:
- **Title**: `{{$node['Parse Slack Command'].json.notion_title}}`
- **Document URL**: `{{$json.googleDocUrl}}`
- **PDF URL**: `{{$json.pdfUrl}}`
- **Template Used**: `{{$json.template_used}}`
- **Agent**: `Manus`
- **AI Reasoning**: `{{$json.reasoning}}`

#### 4. HTTP Request: "Send Slack Response"

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
        "text": ":page_facing_up: *<{{$node['Call Manus - Intelligent Document Router'].json.googleDocUrl}}|View Google Doc>*\n:page_with_curl: *<{{$node['Call Manus - Intelligent Document Router'].json.pdfUrl}}|Download PDF>*\n\n:bulb: Template: `{{$node['Call Manus - Intelligent Document Router'].json.template_used}}`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "{{$node['Call Manus - Intelligent Document Router'].json.reasoning}}"
        }
      ]
    }
  ]
}
```

---

## Alternative: Direct DocsAutomator MCP (No Manus)

If you want to bypass Manus and call DocsAutomator directly (for simple cases):

### Flow:
```
Parse Slack Command
    ↓
Should Create Document? (IF)
    ↓ (true)
Call DocsAutomator MCP
    ↓
Log to Notion
    ↓
Send Slack Response
```

### Key Difference:
- **No intelligence**: Always uses same template (e.g., `AAE_Quick_Note`)
- **Faster**: One less HTTP hop
- **Simpler**: No need to wait for Manus

### When to Use:
- Simple content that doesn't need template selection
- Emergency fallback if Manus is down
- Testing DocsAutomator MCP directly

---

## Testing Your Custom Auth

### Test DocsAutomator MCP:

Create a simple test workflow:
1. Add "Manual Trigger" node
2. Add "HTTP Request" node:
   - Auth: `n8n Railway DocsAutomator-Manus`
   - Method: POST
   - URL: `https://web-production-14aec.up.railway.app/create_document`
   - Body:
   ```json
   {
     "docId": "690b41a53756bfff1462734e",
     "documentName": "Test Document",
     "data": {
       "document_title": "Auth Test",
       "generation_date": "November 5, 2025",
       "main_content": "Testing n8n Railway auth credentials!"
     }
   }
   ```
3. Execute workflow
4. Check if you get back `googleDocUrl` and `pdfUrl`

### Test Gamma MCP:

Create another test workflow:
1. Add "Manual Trigger" node
2. Add "HTTP Request" node:
   - Auth: `n8n Railway Gamma-Manus`
   - Method: POST
   - URL: `https://web-production-b4cb0.up.railway.app/generate`
   - Body:
   ```json
   {
     "inputText": "Test: Benefits of AI automation",
     "format": "presentation",
     "numCards": 3
   }
   ```
3. Execute workflow
4. Check if you get back `generationId`

---

## Credential Types Reference

In case you need to modify the credentials:

### For DocsAutomator MCP:
- **Type**: Custom Auth (or None if no auth required)
- **URL**: `https://web-production-14aec.up.railway.app`
- **Note**: The Railway MCP doesn't require auth - API key is in server environment

### For Gamma MCP:
- **Type**: Custom Auth (or None if no auth required)
- **URL**: `https://web-production-b4cb0.up.railway.app`
- **Note**: The Railway MCP doesn't require auth - API key is in server environment

**Important**: Since the API keys are stored in Railway environment variables, your n8n doesn't need to send any auth headers. The custom auth credentials you created may just be for organizational purposes (to track which nodes connect to which services).

---

## Next Steps

1. ✅ Custom auth credentials created
2. ⏳ Add "Call Manus" HTTP Request node to workflow
3. ⏳ Manus provides webhook URL
4. ⏳ Test with real Slack content
5. ⏳ Verify documents are created correctly

---

## Summary

Your n8n is now configured to:
- ✅ Call DocsAutomator Railway MCP directly (no Zapier!)
- ✅ Call Gamma Railway MCP directly (no Zapier!)
- ✅ Use custom auth credentials for organization
- ⏳ Route through Manus for intelligent template selection

**Cost**: Still just ~$7/month (Railway hosting)
**Zapier Tasks Used**: 0 for document generation! 💰

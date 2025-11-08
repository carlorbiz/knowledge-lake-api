# Fred + Knowledge Lake - Manual n8n Setup Guide

## 🎯 Problem: JSON Import Not Working

Docker n8n has different node structure than web version. Here's how to build Fred's workflow manually.

---

## 📝 Manual Workflow Setup (15 minutes)

### Step 1: Create New Workflow

1. Open n8n: http://localhost:5678
2. Click **"Add workflow"** (top right)
3. Name it: **"Fred Research Auto"**

---

### Step 2: Add Webhook Trigger

1. Click **"+"** to add first node
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **Webhook Path**: `fred-research-auto`
   - **Method**: `POST`
   - **Response Mode**: `When Last Node Finishes`

5. Click **"Execute Node"** to get your webhook URL
   - Should be: `http://localhost:5678/webhook/fred-research-auto`

---

### Step 3: Search Knowledge Lake (HTTP Request #1)

1. Click **"+"** after Webhook
2. Search for **"HTTP Request"**
3. Configure:
   - **Method**: `GET`
   - **URL**: `http://192.168.68.61:8000/knowledge/search`

4. Click **"Add Parameter"** in Query Parameters:
   - **Name**: `query`
   - **Value**: `{{ $json.research_topic }}`

5. Add another parameter:
   - **Name**: `user_id`
   - **Value**: `fred`

6. Add another parameter:
   - **Name**: `limit`
   - **Value**: `10`

---

### Step 4: Prepare Prompt (Code Node)

1. Click **"+"** after HTTP Request
2. Search for **"Code"**
3. Select **"Code"** node
4. Paste this code:

```javascript
// Get inputs
const topic = $input.first().json.research_topic;
const existingKnowledge = $('HTTP Request').first().json.results || [];
const userContext = $input.first().json.context || '';

// Build context summary
let contextSummary = '';
if (existingKnowledge.length > 0) {
  contextSummary = '\n\nEXISTING KNOWLEDGE FROM PREVIOUS RESEARCH:\n' +
    existingKnowledge.map((item, i) =>
      `${i+1}. ${item.memory || item.content || 'N/A'}`
    ).join('\n');
}

// Build full prompt
const fullPrompt = `You are Fred, an academic research specialist.

RESEARCH TOPIC: ${topic}

USER CONTEXT: ${userContext}
${contextSummary}

TASK: Perform deep research on this topic with academic rigor. Synthesize:
1) Latest peer-reviewed research (2023-2025)
2) Industry best practices and standards
3) Regulatory compliance requirements (AHPRA/NMBA if healthcare-related)
4) Emerging trends and future directions

Provide comprehensive citations, compare methodologies, identify knowledge gaps, deliver evidence-based recommendations.

STRUCTURE YOUR RESPONSE:
# Executive Summary
# Key Findings (with citations)
# Evidence Base
# Regulatory/Compliance Considerations
# Recommendations
# Knowledge Gaps
# References`;

// Return structured data
return [{
  json: {
    prompt: fullPrompt,
    research_topic: topic,
    task_id: $input.first().json.task_id || `fred_${Date.now()}`,
    existing_research_found: existingKnowledge.length
  }
}];
```

---

### Step 5: Call OpenAI API (HTTP Request #2)

1. Click **"+"** after Code node
2. Search for **"HTTP Request"**
3. Configure:
   - **Method**: `POST`
   - **URL**: `https://api.openai.com/v1/chat/completions`

4. **Authentication**: Click "Add Authentication"
   - Type: **Header Auth**
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_OPENAI_API_KEY_HERE`
   - (Replace with your actual key from .env)

5. **Headers**: Click "Add Header"
   - **Name**: `Content-Type`
   - **Value**: `application/json`

6. **Body**: Select "JSON" and paste:

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.prompt }}"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 4000
}
```

---

### Step 6: Extract Response (Code Node #2)

1. Click **"+"** after HTTP Request #2
2. Search for **"Code"**
3. Paste this code:

```javascript
// Extract OpenAI response
const response = $input.first().json.choices[0].message.content;
const topic = $('Code').first().json.research_topic;
const taskId = $('Code').first().json.task_id;
const existingCount = $('Code').first().json.existing_research_found;

return [{
  json: {
    fred_research: response,
    research_topic: topic,
    task_id: taskId,
    timestamp: new Date().toISOString(),
    built_on_existing: existingCount > 0
  }
}];
```

---

### Step 7: Save to Knowledge Lake (HTTP Request #3)

1. Click **"+"** after Code node #2
2. Search for **"HTTP Request"**
3. Configure:
   - **Method**: `POST`
   - **URL**: `http://192.168.68.61:8000/agent/fred/insights`

4. **Headers**: Click "Add Header"
   - **Name**: `Content-Type`
   - **Value**: `application/json`

5. **Body**: Select "JSON" and paste:

```json
{
  "insights": "{{ $json.fred_research }}",
  "task_id": "{{ $json.task_id }}"
}
```

---

### Step 8: Return Response (Respond to Webhook)

1. Click **"+"** after HTTP Request #3
2. Search for **"Respond to Webhook"**
3. Configure:
   - **Response Body**: Select "JSON"
   - Paste:

```json
{
  "status": "completed",
  "agent": "fred",
  "task_id": "{{ $json.task_id }}",
  "research_topic": "{{ $json.research_topic }}",
  "built_on_existing_research": {{ $json.built_on_existing }},
  "research": "{{ $json.fred_research }}",
  "saved_to_knowledge_lake": true,
  "timestamp": "{{ $json.timestamp }}",
  "message": "Research completed and saved. Other agents can now access it."
}
```

---

### Step 9: Save and Activate

1. Click **"Save"** (top right)
2. Toggle **"Active"** to ON
3. Note your webhook URL: `http://localhost:5678/webhook/fred-research-auto`

---

## 🧪 Test It!

### Test in n8n:

1. Go back to Webhook node
2. Click **"Execute Node"**
3. In the popup, paste test data:

```json
{
  "research_topic": "Medication safety in aged care",
  "context": "For RN education course",
  "task_id": "test_001"
}
```

4. Click **"Test step"**
5. Watch each node execute (green checkmarks)

### Test via curl:

```bash
curl -X POST "http://localhost:5678/webhook/fred-research-auto" \
  -H "Content-Type: application/json" \
  -d '{
    "research_topic": "Medication safety in aged care",
    "context": "For RN education course",
    "task_id": "test_001"
  }'
```

### Verify in Knowledge Lake:

```bash
# Check if Fred's research was saved
curl "http://192.168.68.61:8000/knowledge/search?query=medication+safety&user_id=fred"
```

---

## 🎯 Workflow Summary

```
Webhook (POST)
  ↓
Search Knowledge Lake (GET) - Check existing research
  ↓
Prepare Prompt (Code) - Build context with existing knowledge
  ↓
Call OpenAI (POST) - Fred does research
  ↓
Extract Response (Code) - Clean up output
  ↓
Save to Knowledge Lake (POST) - Store for other agents
  ↓
Return Response (Webhook) - Send results back
```

---

## 🔧 Node Configuration Quick Reference

| Node | Type | Purpose | Key Config |
|------|------|---------|------------|
| 1 | Webhook | Trigger | Path: `fred-research-auto` |
| 2 | HTTP Request | Search KL | URL: `...8000/knowledge/search` |
| 3 | Code | Build prompt | JavaScript with context |
| 4 | HTTP Request | Call OpenAI | URL: `api.openai.com`, Auth: Bearer |
| 5 | Code | Extract | Parse OpenAI response |
| 6 | HTTP Request | Save to KL | URL: `...8000/agent/fred/insights` |
| 7 | Respond to Webhook | Return | JSON response |

---

## 🚨 Common Issues

### "HTTP Request failed"
- Check Knowledge Lake is running: `curl http://192.168.68.61:8000/health`
- Verify URL has no typos
- Check firewall/network

### "OpenAI API error"
- Verify API key is correct
- Check you have credits/quota
- Try `gpt-4o-mini` if `gpt-4o` fails

### "Code node error"
- Check JavaScript syntax
- Verify previous node outputs data
- Use `console.log()` to debug

### "Webhook not triggering"
- Check workflow is Active (toggle ON)
- Verify webhook URL is correct
- Test with curl command

---

## 📊 What This Achieves

✅ **Fred gets context** from previous research automatically
✅ **No duplicate work** - searches Knowledge Lake first
✅ **Persistent memory** - saves all research findings
✅ **Cross-pollination** - Penny/Manus can access Fred's work
✅ **Audit trail** - task IDs track everything
✅ **Automatic** - Fred doesn't need to remember manual commands

---

## 🎁 Bonus: Add Penny Handoff (Optional)

After "Save to Knowledge Lake" node, add:

**Node 8: Trigger Penny (HTTP Request)**
- **Method**: `POST`
- **URL**: `http://192.168.68.61:8000/workflow/handoff`
- **Body**:
```json
{
  "from_agent": "fred",
  "to_agent": "penny",
  "task": "Transform research into educational content",
  "context": "{{ $('Code1').json.fred_research }}",
  "task_id": "{{ $('Code1').json.task_id }}"
}
```

This logs the handoff and can trigger Penny's workflow automatically!

---

## 📝 Next Steps

1. ✅ Build this workflow manually (15 mins)
2. ✅ Test with sample research topic
3. ✅ Verify Knowledge Lake saves it
4. → Use same pattern for Penny, Manus, Grok, Gemini
5. → Build cross-agent workflows

---

**This workflow replaces Fred's need to manually remember API commands.**

**Once built**: Just POST to the webhook and everything else is automatic! 🚀

# Fred Workflow - Visual Building Guide

## 🎨 Visual Layout in n8n

```
┌──────────────┐
│   Webhook    │ ← START: Receives research request
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   HTTP Request 1         │ ← Search Knowledge Lake
│   GET /knowledge/search  │   (Check existing research)
└──────┬───────────────────┘
       │
       ▼
┌──────────────┐
│   Code 1     │ ← Build prompt with context
│  (JS)        │   (Includes existing knowledge)
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   HTTP Request 2         │ ← Call OpenAI
│   POST /chat/completions │   (Fred does research)
└──────┬───────────────────┘
       │
       ▼
┌──────────────┐
│   Code 2     │ ← Extract & format response
│  (JS)        │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   HTTP Request 3         │ ← Save to Knowledge Lake
│   POST /agent/fred/...   │   (Store for other agents)
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│  Respond to WH   │ ← END: Return results
└──────────────────┘
```

---

## 📋 Node-by-Node Checklist

### ✅ Node 1: Webhook
- [ ] Added to canvas
- [ ] Path: `fred-research-auto`
- [ ] Method: `POST`
- [ ] Response Mode: `When Last Node Finishes`
- [ ] Tested and got webhook URL

---

### ✅ Node 2: HTTP Request (Search)
- [ ] Connected from Webhook
- [ ] Method: `GET`
- [ ] URL: `http://192.168.68.61:8000/knowledge/search`
- [ ] Query param: `query` = `{{ $json.research_topic }}`
- [ ] Query param: `user_id` = `fred`
- [ ] Query param: `limit` = `10`

---

### ✅ Node 3: Code (Prepare Prompt)
- [ ] Connected from HTTP Request 1
- [ ] Pasted JavaScript code
- [ ] No errors showing
- [ ] Returns: `prompt`, `research_topic`, `task_id`, `existing_research_found`

---

### ✅ Node 4: HTTP Request (OpenAI)
- [ ] Connected from Code 1
- [ ] Method: `POST`
- [ ] URL: `https://api.openai.com/v1/chat/completions`
- [ ] Authentication: Header Auth with Bearer token
- [ ] Header: `Content-Type: application/json`
- [ ] Body: JSON with model, messages, temperature, max_tokens
- [ ] OpenAI API key configured

---

### ✅ Node 5: Code (Extract Response)
- [ ] Connected from HTTP Request 2
- [ ] Pasted JavaScript code
- [ ] Returns: `fred_research`, `research_topic`, `task_id`, `timestamp`, `built_on_existing`

---

### ✅ Node 6: HTTP Request (Save)
- [ ] Connected from Code 2
- [ ] Method: `POST`
- [ ] URL: `http://192.168.68.61:8000/agent/fred/insights`
- [ ] Header: `Content-Type: application/json`
- [ ] Body: JSON with `insights` and `task_id`

---

### ✅ Node 7: Respond to Webhook
- [ ] Connected from HTTP Request 3
- [ ] Response body: JSON format
- [ ] Includes: status, agent, task_id, research, message

---

### ✅ Final Steps
- [ ] All nodes connected in sequence
- [ ] All green (no errors)
- [ ] Workflow saved
- [ ] Workflow activated (toggle ON)
- [ ] Tested with sample data
- [ ] Verified in Knowledge Lake

---

## 🧪 Quick Test Checklist

### Test 1: Knowledge Lake Running?
```bash
curl http://192.168.68.61:8000/health
```
**Expected**: `{"status":"healthy"...}`

---

### Test 2: Workflow Active?
- Go to n8n workflow list
- Check "Fred Research Auto" shows green "Active" badge

---

### Test 3: Webhook Works?
```bash
curl -X POST "http://localhost:5678/webhook/fred-research-auto" \
  -H "Content-Type: application/json" \
  -d '{"research_topic": "test", "task_id": "test_001"}'
```
**Expected**: JSON response with research results

---

### Test 4: Knowledge Lake Saved It?
```bash
curl "http://192.168.68.61:8000/knowledge/search?query=test&user_id=fred"
```
**Expected**: Your test research appears in results

---

## 🎯 Troubleshooting Guide

### Node 2 Fails (Search Knowledge Lake)
**Error**: "Connection refused" or "timeout"

**Fix**:
```bash
# Check Knowledge Lake is running
curl http://192.168.68.61:8000/health

# If not running:
cd C:\Users\carlo\Development\mem0-sync\mem0
python enhanced_knowledge_lake_api.py
```

---

### Node 4 Fails (OpenAI)
**Error**: "Invalid API key" or "insufficient quota"

**Fix**:
1. Check your OpenAI API key is correct
2. Verify you have credits: https://platform.openai.com/usage
3. Try using `gpt-4o-mini` instead of `gpt-4o` (cheaper)

---

### Node 3 or 5 Fails (Code)
**Error**: JavaScript syntax error

**Fix**:
1. Copy code EXACTLY as written (including backticks)
2. Check for missing brackets or semicolons
3. Test with simpler code first:
```javascript
return [{ json: { test: "hello" } }];
```

---

### Node 6 Fails (Save to Knowledge Lake)
**Error**: "404 Not Found" or "Invalid request"

**Fix**:
1. Check URL is exactly: `http://192.168.68.61:8000/agent/fred/insights`
2. Verify Content-Type header is set
3. Check JSON body has `insights` and `task_id` fields

---

### Workflow Doesn't Trigger
**Error**: Webhook URL doesn't respond

**Fix**:
1. Verify workflow is **Active** (green toggle)
2. Check webhook URL matches (no typos)
3. Restart n8n if needed:
```bash
docker restart n8n
```

---

## 📸 Screenshot Reference

### What Your Workflow Should Look Like:

```
[Webhook] ──> [HTTP GET] ──> [Code] ──> [HTTP POST] ──> [Code] ──> [HTTP POST] ──> [Respond]
   (1)           (2)         (3)          (4)          (5)          (6)            (7)
```

### Node Colors:
- **Purple** = Webhook/Trigger nodes
- **Blue** = HTTP Request nodes
- **Orange** = Code nodes
- **Green** = All nodes after successful execution

---

## 💡 Tips for Building

1. **Build one node at a time** - Don't skip ahead
2. **Test each node** - Click "Execute Node" to verify
3. **Check connections** - Lines should be solid, not dotted
4. **Save often** - Click Save after each node
5. **Use simple test data first** - "test" as research_topic

---

## 🎁 Bonus: Copy-Paste Values

### For Node 2 (Search) Query Parameters:
```
Parameter 1:
Name: query
Value: {{ $json.research_topic }}

Parameter 2:
Name: user_id
Value: fred

Parameter 3:
Name: limit
Value: 10
```

### For Node 4 (OpenAI) Authentication:
```
Type: Header Auth
Name: Authorization
Value: Bearer sk-proj-YOUR_KEY_HERE
```

### For Node 4 (OpenAI) Body:
```json
{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "{{ $json.prompt }}"}],
  "temperature": 0.3,
  "max_tokens": 4000
}
```

### For Node 6 (Save) Body:
```json
{
  "insights": "{{ $json.fred_research }}",
  "task_id": "{{ $json.task_id }}"
}
```

---

## ✨ Success Indicators

You know it's working when:

✅ All 7 nodes show green checkmarks after execution
✅ Webhook test returns JSON with research
✅ Knowledge Lake search finds Fred's research
✅ No red error messages in any node
✅ Workflow shows "Active" badge
✅ curl test returns 200 OK

---

**Time to Build**: 10-15 minutes
**Difficulty**: Medium (copy-paste most values)
**Result**: Automated Fred with persistent memory! 🎉

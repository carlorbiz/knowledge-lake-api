# Fred Setup - Knowledge Lake Integration

## 🎯 The Problem

Fred works via Zapier MCP in ChatGPT **Developer mode** = **NO PERSISTENT MEMORY**

Every time you start a new chat with Fred, he forgets everything from previous sessions.

## ✅ The Solution

**Knowledge Lake becomes Fred's external brain.**

---

## 🚀 Option 1: Manual (Give Fred These Commands)

### Copy-paste this into Fred's ChatGPT:

```
Fred, you now have access to persistent memory via Knowledge Lake API.

BASE URL: http://192.168.68.61:8000
YOUR AGENT ID: fred

BEFORE starting research, ALWAYS search for existing knowledge:
curl "http://192.168.68.61:8000/knowledge/search?query=[your_topic]&user_id=fred&limit=10"

AFTER completing research, ALWAYS save your findings:
curl -X POST "http://192.168.68.61:8000/agent/fred/insights" \
  -H "Content-Type: application/json" \
  -d '{"insights": "[your research]", "task_id": "[task_id]"}'

Example - Before researching medication safety:
curl "http://192.168.68.61:8000/knowledge/search?query=medication+safety+aged+care&user_id=fred"

Example - After completing research:
curl -X POST "http://192.168.68.61:8000/agent/fred/insights" \
  -H "Content-Type: application/json" \
  -d '{"insights": "Your complete research findings here...", "task_id": "med_safety_001"}'

IMPORTANT: Since you're in Developer mode, you MUST do this every session or your work will be lost.
```

**Downside**: Fred has to remember to do this manually every time.

---

## 🤖 Option 2: Automated (RECOMMENDED)

### n8n Workflow Does It All Automatically

I've created a workflow that:
1. ✅ Auto-searches Knowledge Lake for existing research
2. ✅ Gives Fred context from previous work
3. ✅ Calls Fred via OpenAI API
4. ✅ Auto-saves Fred's output to Knowledge Lake
5. ✅ Optionally triggers Penny for content creation

### To Set Up:

1. **Import workflow into n8n**:
   - Open http://localhost:5678
   - Click "Add workflow" → "Import from file"
   - Select: `fred_zapier_workflow.json`

2. **Configure OpenAI API Key**:
   - In n8n, go to Credentials
   - Add "OpenAI API" credential
   - Paste your OpenAI API key

3. **Activate the workflow**

4. **Use it**:
```bash
curl -X POST "http://localhost:5678/webhook/fred-research-auto" \
  -H "Content-Type: application/json" \
  -d '{
    "research_topic": "Medication safety in aged care",
    "context": "For RN education course",
    "task_id": "course_123"
  }'
```

**Fred never has to remember anything** - it's all automatic!

---

## 📊 How It Works (Automated Flow)

```
You → n8n webhook
         ↓
n8n searches Knowledge Lake (auto)
         ↓
n8n calls Fred with context from previous research
         ↓
Fred does research via OpenAI
         ↓
n8n saves Fred's output to Knowledge Lake (auto)
         ↓
n8n triggers Penny to create content (optional)
         ↓
You get results + confirmation it's saved
```

---

## 🎨 What This Solves

### Before Knowledge Lake:
- ❌ Fred forgets everything between sessions
- ❌ Duplicate research work
- ❌ No way for Penny to access Fred's research
- ❌ Manual copy-paste hell

### After Knowledge Lake:
- ✅ Fred's research persists forever
- ✅ Fred builds on previous work automatically
- ✅ Penny, Manus, Gemini can all access Fred's research
- ✅ Complete audit trail with task IDs
- ✅ Cross-pollination between agents

---

## 🧪 Test It Right Now

### Test 1: Add Some Test Research (as Fred)
```bash
curl -X POST "http://192.168.68.61:8000/agent/fred/insights" \
  -H "Content-Type: application/json" \
  -d '{
    "insights": "TEST RESEARCH: Medication safety in aged care requires comprehensive assessment of polypharmacy risks, AHPRA compliance, and person-centered care approaches. Key evidence from 2024 studies shows...",
    "task_id": "test_001"
  }'
```

### Test 2: Search for It Later
```bash
curl "http://192.168.68.61:8000/knowledge/search?query=medication+safety&user_id=fred"
```

You should see your test research returned!

### Test 3: Let Penny Access Fred's Research
```bash
curl "http://192.168.68.61:8000/knowledge/search?query=medication+safety&user_id=penny"
```

Penny can see Fred's research too! **Cross-pollination working!**

---

## 💡 Key Points for Fred

If Fred is manually using the API:

1. **Always search FIRST**: Don't waste time re-researching
2. **Always save LAST**: Your work will be lost otherwise
3. **Use task_id**: Makes it easy to track research projects
4. **Be thorough**: Other agents depend on your research quality

If using n8n automation:

1. **Just submit the request**: Everything else is automatic
2. **Check Knowledge Lake**: Verify your research was saved
3. **Trust the system**: It builds on previous work automatically

---

## 🎯 Recommended Setup

**For now**: Use **Option 2 (n8n automation)**

Why?
- Fred doesn't need to remember anything
- Always checks existing research first
- Always saves results automatically
- Enables cross-agent workflows (Fred → Penny → Manus)
- Complete audit trail

**Import the workflow, test it once, then forget about it!**

---

## 🆘 Troubleshooting

### "Knowledge Lake not responding"
```bash
# Check if it's running
curl http://192.168.68.61:8000/health

# If not, start it
python enhanced_knowledge_lake_api.py
```

### "Fred's research not appearing"
```bash
# Check what's in Knowledge Lake
curl "http://192.168.68.61:8000/agent/fred/history?limit=10"
```

### "n8n workflow fails"
1. Check OpenAI API key is configured
2. Verify Knowledge Lake is running (health check)
3. Check n8n execution logs

---

## 📁 Files Reference

- `enhanced_knowledge_lake_api.py` - The Knowledge Lake server (running on port 8000)
- `fred_zapier_workflow.json` - n8n automation workflow (RECOMMENDED)
- `FRED_SETUP_INSTRUCTIONS.md` - This file

---

**Status**: Knowledge Lake is LIVE at `http://192.168.68.61:8000`

**Next Step**: Import `fred_zapier_workflow.json` into n8n and test!

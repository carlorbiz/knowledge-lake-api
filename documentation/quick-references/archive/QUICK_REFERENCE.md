# AAE Knowledge Lake - Quick Reference Card

## 🟢 System Status

**Knowledge Lake**: ✅ RUNNING on `http://192.168.68.61:8000`
**Server**: Waitress (Production)
**Agents**: 6 registered (Grok, Manus, Fred, Penny, Gemini, Claude Code)

---

## ⚡ Quick Commands

### Check if running:
```bash
curl http://192.168.68.61:8000/health
```

### See all agents:
```bash
curl http://192.168.68.61:8000/agent/list
```

### Add knowledge (any agent):
```bash
curl -X POST "http://192.168.68.61:8000/knowledge/add" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your knowledge", "user_id": "agent_name"}'
```

### Search knowledge:
```bash
curl "http://192.168.68.61:8000/knowledge/search?query=your_query&user_id=agent_name"
```

---

## 👥 Agent-Specific Endpoints

### Fred (Research):
```bash
# Add research
POST http://192.168.68.61:8000/agent/fred/insights
{"insights": "research findings", "task_id": "123"}

# Search Fred's work
GET http://192.168.68.61:8000/agent/fred/history?limit=10
```

### Penny (Content):
```bash
POST http://192.168.68.61:8000/agent/penny/insights
{"insights": "content created", "task_id": "123"}
```

### Any Agent:
```bash
POST http://192.168.68.61:8000/agent/{agent_id}/insights
```

---

## 🔄 Workflow Coordination

### Record agent handoff:
```bash
POST http://192.168.68.61:8000/workflow/handoff
{
  "from_agent": "fred",
  "to_agent": "penny",
  "task": "description",
  "context": "data to pass",
  "task_id": "123"
}
```

### Check workflow status:
```bash
GET http://192.168.68.61:8000/workflow/status/task_123
```

---

## 📋 For Fred (ChatGPT + Zapier MCP)

### Manual Mode:
**Before research**: Search existing
```bash
curl "http://192.168.68.61:8000/knowledge/search?query=topic&user_id=fred"
```

**After research**: Save findings
```bash
curl -X POST "http://192.168.68.61:8000/agent/fred/insights" \
  -d '{"insights": "findings", "task_id": "123"}'
```

### Automated Mode (RECOMMENDED):
**Use n8n workflow**: Import `fred_zapier_workflow.json`
```bash
curl -X POST "http://localhost:5678/webhook/fred-research-auto" \
  -d '{"research_topic": "topic", "task_id": "123"}'
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `enhanced_knowledge_lake_api.py` | Main server (running) |
| `FRED_SETUP_INSTRUCTIONS.md` | Fred integration guide |
| `fred_zapier_workflow.json` | n8n automation for Fred |
| `AGENT_KNOWLEDGE_LAKE_ACCESS.md` | Complete API docs |
| `PRODUCTION_DEPLOYMENT_CORRECTED.md` | Setup guide |

---

## 🚨 Troubleshooting

**Server not responding?**
```bash
# Check if running
curl http://192.168.68.61:8000/health

# Restart if needed
python enhanced_knowledge_lake_api.py
```

**Can't find saved knowledge?**
```bash
# Check what's stored
curl "http://192.168.68.61:8000/knowledge/search?query=test&user_id=system"
```

**Need to stop server?**
```bash
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

---

## 🎯 Next Steps

1. ✅ Knowledge Lake is running
2. → Import Fred's n8n workflow
3. → Test with sample research task
4. → Add Penny, Grok, Manus workflows
5. → Build cross-agent automation

---

**Knowledge Lake**: http://192.168.68.61:8000
**n8n**: http://localhost:5678
**Documentation**: See AGENT_KNOWLEDGE_LAKE_ACCESS.md

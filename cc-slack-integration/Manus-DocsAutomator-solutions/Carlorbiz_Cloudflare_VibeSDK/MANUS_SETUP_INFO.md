# VibeSDK Integration - Complete Setup Information for Manus

**Date**: November 6, 2025
**For**: Manus DocsAutomator Task
**From**: Claude Code + Carla

---

## 1. Mem0 Instance Configuration

### Current Setup:
- **Running Location**: `C:\Users\carlo\Development\mem0-sync\mem0\api_server.py`
- **Current Port**: 5002 (NOT 5000 as documented)
- **CloudFlare Tunnel URL**: `https://mem0.carlorbiz.com` (to be configured)
- **Authentication**: Currently open, will need API key setup later

### Mem0 API Code Reference:
```python
# From api_server.py
from mem0 import Memory
memory = Memory()

# Endpoints already implemented:
# GET  /knowledge/search?query=...&user_id=...
# POST /knowledge/add (body: {content, user_id, metadata})
# GET  /knowledge/context/<topic>
# GET  /health
```

### Integration Notes:
- Self-hosted Mem0 instance (not using hosted platform)
- User ID pattern: `'carla_knowledge_lake'` for general knowledge
- Agent-specific IDs: `agent_id="vibesdk"`, `user_id="carla"`

---

## 2. Knowledge Lake API (AI Brain)

### Configuration:
- **Documented Port**: 5000 (in CLAUDE.md)
- **Actual Port**: 5002 (in api_server.py)
- **Proposed Public URL**: `https://ai-brain.carlorbiz.com`

### Endpoints Status:
**⚠️ CRITICAL**: The four endpoints mentioned in the task DO NOT currently exist in `api_server.py`.

**Required Endpoints** (Create placeholder templates):
```
POST /ai/audience-analysis
POST /course/architect
POST /ai/distribute-tasks
POST /ai/optimize-slides
```

### Recommendation:
1. Create placeholder endpoints that return mock data for Phase 1
2. Carla will implement the actual AI Brain logic later
3. Template should call these endpoints with proper error handling

---

## 3. API Keys from .env File

All keys extracted from `C:\Users\carlo\Development\mem0-sync\mem0\.env`:

### DocsAutomator:
```
API_KEY=3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc
ENDPOINT=https://api.docsautomator.co/createDocument
TEMPLATE_ID=68d7b000c2fc16ccc70abdac (Course Package Template)
```

### Gamma API:
```
API_KEY=sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE
BASE_URL=https://public-api.gamma.app/v0.2/generations
```

### Slack Webhooks:
```
N8N_SLACK_RESPONSE_WEBHOOK=https://primary-production-de49.up.railway.app/webhook/slack-response
CC_BOT_SLACK_OAUTH_TOKEN=xoxb-[REDACTED]
```

### N8N:
```
N8N_API_KEY=[REDACTED]
N8N_BASE_URL=http://localhost:5678
WEBHOOK_BASE=http://localhost:5678/webhook/
```

### Additional LLM Keys (already in Carla's .env):
```
OPENAI_API_KEY=sk-proj-[REDACTED]
ANTHROPIC_API_KEY=sk-ant-[REDACTED]
PERPLEXITY_API_KEY=pplx-[REDACTED]
GEMINI_API_KEY=AIza[REDACTED]
XAI_API_KEY=xai-[REDACTED]
QOLABA_API_KEY=[REDACTED]
```

---

## 4. Notion Database IDs

### From CLAUDE.md and API_notes.txt:
```
Master AI System Database: 24f9440556f78033a2e0e8f4eee6f341
Deck Generation Database: 27494405-56f7-8047-a148-db17477e12f3
```

### ⚠️ AI Agent Universal Conversations Database:
**NOT FOUND** in current documentation. Need Carla to provide this before bed.

### Notion Integration Token:
```
NOTION_N8N_AI_ROUTER_INTEGRATION_TOKEN=[REDACTED]
```

---

## 5. GitHub Integration

```
GITHUB_TOKEN=[REDACTED]
GITHUB_OWNER=carlorbiz
```

---

## 6. Implementation Priority Queue

### Phase 1 (IMMEDIATE):
1. ✅ Deploy base VibeSDK with Gemini models
2. ⚠️ Configure CloudFlare tunnel for `mem0.carlorbiz.com` and `ai-brain.carlorbiz.com`
3. ✅ Use Carla's API keys above (no additional setup needed)

### Phase 2 (TONIGHT/TOMORROW):
1. Add Mem0 integration layer
   - Connect to `https://mem0.carlorbiz.com` (or `http://localhost:5002` for now)
   - Implement agent context tracking
   - Store conversation history with `agent_id="vibesdk"`

2. Create Knowledge Lake API placeholder templates
   - Mock the 4 AI Brain endpoints
   - Proper error handling
   - Return structured JSON responses

### Phase 3 (THIS WEEK):
1. Build enhanced templates for:
   - DocsAutomator PDF generation
   - Gamma slide deck automation
   - N8N webhook triggers
   - Notion bi-directional sync
   - Agent-specific configurations (Fred, Claude, Colin, Penny, Pete)

---

## 7. Quick Reference Environment Variables

For VibeSDK `.dev.vars` file:
```bash
# Core LLM APIs
GOOGLE_AI_STUDIO_API_KEY=AIza[REDACTED]
ANTHROPIC_API_KEY=sk-ant-[REDACTED]
OPENAI_API_KEY=sk-proj-[REDACTED]
XAI_API_KEY=xai-[REDACTED]
PERPLEXITY_API_KEY=pplx-[REDACTED]
QOLABA_API_KEY=[REDACTED]

# Mem0 Knowledge Lake
MEM0_API_URL=http://localhost:5002
# MEM0_API_URL=https://mem0.carlorbiz.com  # Use after CloudFlare tunnel setup

# AI Brain (Knowledge Lake API)
AI_BRAIN_API_URL=http://localhost:5002
# AI_BRAIN_API_URL=https://ai-brain.carlorbiz.com  # Use after CloudFlare tunnel setup

# Document & Slide Generation
DOCSAUTOMATOR_API_KEY=[REDACTED]
GAMMA_API_KEY=[REDACTED]

# N8N Automation
N8N_API_KEY=[REDACTED]
N8N_WEBHOOK_BASE=http://localhost:5678/webhook/

# Slack Integration
SLACK_WEBHOOK_URL=https://primary-production-de49.up.railway.app/webhook/slack-response
SLACK_BOT_TOKEN=xoxb-[REDACTED]

# Notion Integration
NOTION_TOKEN=[REDACTED]
NOTION_MASTER_AI_DB=24f9440556f78033a2e0e8f4eee6f341
NOTION_DECK_GEN_DB=27494405-56f7-8047-a148-db17477e12f3

# GitHub
GITHUB_TOKEN=[REDACTED]
GITHUB_OWNER=carlorbiz
```

---

## 8. Critical Action Items for Carla BEFORE BED:

1. ⚠️ **Provide**: AI Agent Universal Conversations Database ID
2. ⚠️ **Confirm**: Should AI Brain endpoints be placeholders or do they already exist somewhere?
3. ⚠️ **Decide**: CloudFlare tunnel URLs: `mem0.carlorbiz.com` and `ai-brain.carlorbiz.com` - correct?

---

## 9. Architecture Diagram for Reference

```
┌─────────────────────────────────────────────────────────┐
│                    Carla's AAE Ecosystem                 │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              VibeSDK Multi-Model Router                  │
│                  (Cloudflare Workers)                    │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Model    │  │  Mem0 Memory │  │  Cost & Perf   │ │
│  │  Selector  │→ │  Integration │→ │   Monitoring   │ │
│  └────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
   ┌────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
   │ Claude │   │  Gemini  │   │  Grok   │   │Perplexity│
   └────────┘   └──────────┘   └─────────┘   └──────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Enhanced         │
                    │ Templates        │
                    │ - DocsAutomator  │
                    │ - Gamma Slides   │
                    │ - N8N Webhooks   │
                    │ - Notion Sync    │
                    │ - Agent Configs  │
                    └──────────────────┘
```

---

## 10. Testing Checklist

After Phase 1 deployment:
- [ ] Test Gemini model selection
- [ ] Verify CloudFlare AI Gateway routing
- [ ] Confirm custom domain accessibility
- [ ] Test basic chat functionality

After Phase 2 (Mem0 + Placeholders):
- [ ] Test Mem0 memory persistence across sessions
- [ ] Verify Knowledge Lake placeholder endpoints respond
- [ ] Test agent context tracking
- [ ] Confirm conversation history storage

---

**Generated by**: Claude Code (CC)
**Contact**: Via Manus task system or Carla directly

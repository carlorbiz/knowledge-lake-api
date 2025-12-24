# Deployment & Project Inventory

**Last Updated:** 2025-12-24
**Repository:** mem0 (carlorbiz/mem0)
**Purpose:** Single source of truth for all apps, courses, and deployments

---

## 📊 Quick Stats

| Category | Count | Status |
|----------|-------|--------|
| **Production Apps** | 4 | ✅ Live |
| **Apps in Development** | 3 | 🚧 Active |
| **MCP Servers** | 3 | ✅ Active |
| **Infrastructure Services** | 2 | ✅ Live (Railway) |
| **Course Generation Systems** | 1 | ✅ Active |
| **Example/Demo Projects** | 8 | 📚 Reference |

---

## 🌐 Production Applications (Live & Deployed)

### 1. **Aurelia AI Advisor** (Vera)
| Detail | Value |
|--------|-------|
| **Description** | Professional AI chatbot with Aoede voice persona |
| **Platform** | Cloudflare Pages |
| **Production URL** | https://aurelia.mtmot.com |
| **Tech Stack** | React, Vite, TypeScript, Google Gemini 2.5 Flash |
| **Features** | Voice interface (TTS/STT), multi-line input, dark mode, file upload |
| **Status** | ✅ Live & Active |
| **Location** | `/github-projects/vera-ai-advisor/` |
| **Wrangler Config** | `/github-projects/vera-ai-advisor/wrangler.toml` |
| **Worker Proxy** | `vera-ai-advisor-proxy` (Cloudflare Worker) |

### 2. **AAE Dashboard (VibeSDK)**
| Detail | Value |
|--------|-------|
| **Description** | AI Automation Ecosystem dashboard with cross-agent coordination |
| **Platform** | Cloudflare Pages |
| **Production URL** | https://vibe.mtmot.com |
| **Tech Stack** | React, Vite, TypeScript, tRPC, SQLite, Mem0, Knowledge Lake |
| **Features** | Platform management, LLM metrics, workflow automation, knowledge base, N8N REST API |
| **Status** | ✅ Build Complete, ⚠️ DNS Configuration Needed |
| **Location** | Root directory tracking (deployed from separate repo) |
| **Deployment Docs** | `/cloudflare-deployments/AAE Dashboard Deployment Summary.md` |
| **Integration** | Mem0 API, Knowledge Lake API, N8N workflows |
| **Dashboard Pages** | `/aae-dashboard`, `/aae-platforms`, `/aae-llm-metrics`, `/aae-workflows`, `/aae-knowledge`, `/aae-chat` |

### 3. **RWAV Strategic Tool**
| Detail | Value |
|--------|-------|
| **Description** | Progressive Web App for RWAV Board strategic planning workshop |
| **Platform** | Cloudflare Workers |
| **Production URL** | https://carlorbiz-strategic-tool.carla-c8b.workers.dev/ |
| **Tech Stack** | HTML, CSS, JavaScript (Vanilla) |
| **Features** | Offline capability, static intelligence briefing, financial visualisations, interactive maps |
| **Status** | ✅ Deployed (cache issues resolved as of Nov 2025) |
| **Location** | `/github-projects/carlorbiz-strategic-tool/` |
| **Deployment Docs** | `/cloudflare-deployments/RWAV Strategic Tool - Deployment Status Summary.md` |
| **Note** | Version 1 (Static) complete, Version 2 (Interactive) in development |

### 4. **Knowledge Lake API**
| Detail | Value |
|--------|-------|
| **Description** | Conversation ingestion, semantic search, knowledge graph management |
| **Platform** | Railway |
| **Production URL** | https://knowledge-lake-api-production.up.railway.app |
| **Tech Stack** | Python (FastAPI), PostgreSQL, Mem0, Qdrant |
| **Version** | 2.1.0_database_persistence |
| **Features** | Conversation search, entity extraction, relationship mapping, Aurelia query |
| **Status** | ✅ Live & Active |
| **Location** | `/mem0/api_server.py`, `/mem0/database.py` |
| **Health Check** | https://knowledge-lake-api-production.up.railway.app/health |
| **API Endpoints** | `/api/conversations/ingest`, `/api/conversations/search`, `/api/conversations/archive`, `/api/stats` |
| **Railway Config** | `/railway.json` |

---

## 🚧 Applications in Development

### 5. **Executive AI Advisor (Vera) - Full Platform**
| Detail | Value |
|--------|-------|
| **Description** | Full SaaS platform with WordPress paywall integration |
| **Tech Stack** | React (frontend), Express (backend), Supabase, Google Gemini |
| **Features** | WordPress JWT auth, persistent conversations, admin dashboard, ROI calculators, voice interface |
| **Status** | 🚧 Active Development |
| **Location** | `/github-projects/executive-ai-advisor/` |
| **Backend** | Express + TypeScript with WordPress middleware |
| **Database** | Supabase (users, chat_sessions, messages, analytics) |
| **Deployment Docs** | `DEPLOYMENT_CHECKLIST.md`, `PRODUCTION_SETUP.md` |
| **Note** | Simplified version deployed as Aurelia at aurelia.mtmot.com |

### 6. **Voice-to-Drive**
| Detail | Value |
|--------|-------|
| **Description** | Hands-free PWA for recording voice notes while driving |
| **Tech Stack** | React, Vite, Google Drive API, Voice Activity Detection |
| **Features** | Auto-upload to Google Drive, offline storage with IndexedDB |
| **Status** | 🚧 Development |
| **Location** | `/github-projects/voice-to-drive/` |
| **Wrangler Config** | `/github-projects/voice-to-drive/workers/wrangler.toml` |

### 7. **CareTrack**
| Detail | Value |
|--------|-------|
| **Description** | Healthcare tracking and management application |
| **Tech Stack** | HTML, CSS, JavaScript |
| **Status** | 🚧 Development |
| **Location** | `/CareTrack/` |
| **Documentation** | `CARETRACK_IMPLEMENTATION_PLAN.md`, `CARETRACK_SUPABASE_IMPLEMENTATION.md` |
| **Architecture** | Supabase backend, n8n workflow integration with Gemini AI |

---

## 🤖 MCP (Model Context Protocol) Servers

### 8. **MTMOT Unified MCP Server**
| Detail | Value |
|--------|-------|
| **Description** | Unified MCP server providing Notion, Google Drive, and Knowledge Lake access |
| **Status** | ✅ Active |
| **Location** | `/mtmot-unified-mcp/` |
| **Tools** | 33 total (10 Notion, 12 Google Drive, 10 Knowledge Lake, 1 AAE Dashboard) |
| **Transport** | STDIO (local) and SSE (remote HTTP) |
| **Clients** | ChatGPT Dev Mode, Claude Code, any MCP client |
| **Key Features** | Full CRUD operations, semantic search, conversation ingestion, entity management |

### 9. **Manus MCP Server**
| Detail | Value |
|--------|-------|
| **Description** | Task management for Claude Code to delegate tasks to Manus |
| **Status** | ✅ Active |
| **Location** | `/manus-mcp/` |
| **Tools** | 4 (assign_task, get_task_status, get_task_result, list_my_tasks) |
| **Storage** | JSON file (`~/.manus_tasks.json`) |
| **Transport** | STDIO and SSE |
| **Features** | Priority management, persistent storage, status tracking |

### 10. **MCP AI Orchestration**
| Detail | Value |
|--------|-------|
| **Description** | AI orchestration and coordination server |
| **Status** | 🚧 Development |
| **Location** | `/mcp-ai-orchestration/` |

---

## 🏗️ Infrastructure & Services

### 11. **Mem0 API Server** (Railway)
| Detail | Value |
|--------|-------|
| **Description** | Memory API for cross-agent memory sharing |
| **Platform** | Railway |
| **Production URL** | https://web-production-e3e44.up.railway.app |
| **Status** | ✅ Live |
| **Integration** | Used by AAE Dashboard and agents |

### 12. **OpenMemory UI**
| Detail | Value |
|--------|-------|
| **Description** | Web interface for Mem0 memory management |
| **Tech Stack** | Next.js |
| **Status** | ✅ Active (watch for CVE issues) |
| **Location** | `/openmemory/ui/` |

---

## 📚 Course Generation System

### 13. **Concept-to-Course Multi-Agent Workflow**
| Detail | Value |
|--------|-------|
| **Description** | AI-powered course generation from concept to complete course |
| **Platform** | n8n workflow automation |
| **Tech Stack** | n8n, Notion, Google Drive, Perplexity AI, Claude Sonnet 4, Gemini TTS |
| **Status** | ✅ Active Production System |
| **Location** | `/Carlorbiz_Course_Apps/` |
| **Documentation** | `/Carlorbiz_Course_Apps/docs/Claude_concept_to_course_roadmap.md` |
| **Workflow Stages** | Research Foundation → Course Recommendation → Multi-Agent Content Generation → Integration & Delivery |
| **Target Audience** | Australian healthcare and executive professionals |
| **Output** | 8-12 module courses with slides, audio, assessments, resources |

**Agent Pipeline:**
1. Research Foundation Specialist (Perplexity AI)
2. Course Recommendation Architect (Perplexity Sonar Deep Research)
3. Module Content Generator (Claude Sonnet 4)
4. Slide Generation Specialist (GPT-4/Claude)
5. Voiceover Script Developer (Claude Sonnet 4)
6. Audio Generation Specialist (Gemini TTS)
7. Assessment & Interactive Content Creator (Claude Sonnet 4)
8. Complementary Assets Generator (Claude Sonnet 4)
9. Course Integration Specialist (Automated)
10. Delivery & Notification Manager (Automated)

---

## 🧪 Example & Demo Projects

### 14. **Examples Directory** (`/examples/`)

| Project | Description | Tech Stack | Status |
|---------|-------------|------------|--------|
| **mem0-demo** | Mem0 demonstration app | Next.js, TypeScript | 📚 Demo |
| **multimodal-demo** | Multimodal AI demonstration | Node.js | 📚 Demo |
| **openai-inbuilt-tools** | OpenAI tools demonstration | Node.js | 📚 Demo |
| **vercel-ai-sdk-chat-app** | Vercel AI SDK chat demo | Next.js | 📚 Demo |
| **yt-assistant-chrome** | YouTube assistant Chrome extension | JavaScript | 📚 Demo |
| **graph-db-demo** | Graph database demonstration | Python | 📚 Demo |
| **multiagents** | Multi-agent system demos | Python | 📚 Demo |
| **misc** | Miscellaneous examples | Various | 📚 Demo |

### 15. **Embedchain**
| Detail | Value |
|--------|-------|
| **Description** | Legacy framework for building AI-powered applications |
| **Status** | 📚 Reference/Archive |
| **Location** | `/embedchain/` |
| **Note** | Predecessor to Mem0 |

---

## 🛠️ Supporting Tools & Infrastructure

### 16. **CC Slack Integration**
| Detail | Value |
|--------|-------|
| **Description** | Slack integration for Claude Code |
| **Status** | 🚧 In Development (Manus orchestrating via MCP) |
| **Location** | `/cc-slack-integration/` |

### 17. **N8N Workflows**
| Detail | Value |
|--------|-------|
| **Description** | Collection of n8n workflow automation templates |
| **Location** | `/n8n-workflows/` |
| **Workflows** | Course generation, CareTrack integrations, Notion-Supabase sync |

### 18. **Google Apps Script**
| Detail | Value |
|--------|-------|
| **Description** | Google Workspace automation scripts |
| **Location** | `/google_apps_script/` |

### 19. **Context Sync Tools**
| Detail | Value |
|--------|-------|
| **Description** | Python script for syncing Claude Code context with Knowledge Lake |
| **Location** | `/cc-context-sync.py` |
| **Usage** | `python cc-context-sync.py start` / `python cc-context-sync.py end "summary"` |

---

## 🚀 CI/CD & Automation

### GitHub Actions

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Continuous Integration** | `.github/workflows/ci.yml` | Push to main, PRs | Python testing, linting for mem0 and embedchain |
| **Continuous Deployment** | `.github/workflows/cd.yml` | Release tags | Publish to PyPI |

**Python Versions Tested:** 3.9, 3.10, 3.11

---

## 📂 Repository Structure Overview

```
mem0/
├── 🌐 Production Apps
│   ├── github-projects/
│   │   ├── vera-ai-advisor/              # Aurelia AI (Live)
│   │   ├── executive-ai-advisor/         # Vera Full Platform (Dev)
│   │   ├── carlorbiz-strategic-tool/     # RWAV Tool (Live)
│   │   └── voice-to-drive/               # Voice Notes (Dev)
│   └── CareTrack/                        # Healthcare App (Dev)
│
├── 🤖 MCP Servers
│   ├── mtmot-unified-mcp/                # Unified MCP (Active)
│   ├── manus-mcp/                        # Task Manager (Active)
│   └── mcp-ai-orchestration/             # Orchestration (Dev)
│
├── 🏗️ Infrastructure
│   ├── mem0/api_server.py                # Knowledge Lake API (Railway)
│   ├── mem0/database.py                  # PostgreSQL persistence
│   ├── openmemory/ui/                    # Mem0 UI
│   └── cloudflare-worker/                # CF Worker proxy
│
├── 📚 Course System
│   └── Carlorbiz_Course_Apps/            # Multi-agent course generation
│
├── 🧪 Examples & Demos
│   ├── examples/                         # 8 demo projects
│   └── embedchain/                       # Legacy framework
│
├── 🛠️ Tools & Scripts
│   ├── cc-context-sync.py                # Context sync script
│   ├── cc-slack-integration/             # Slack integration
│   ├── n8n-workflows/                    # Automation workflows
│   └── google_apps_script/               # GAS scripts
│
├── 📖 Documentation
│   ├── AAE-master/                       # AAE architecture docs
│   ├── knowledge-lake/                   # Knowledge Lake schemas
│   ├── cloudflare-deployments/           # Deployment guides
│   └── docs/                             # API documentation
│
└── 🔧 Configuration
    ├── .github/workflows/                # CI/CD pipelines
    ├── railway.json                      # Railway config
    ├── CLAUDE.md                         # CC context protocol
    └── FILE_MANIFEST.md                  # File directory
```

---

## 🌍 Deployment Platforms Summary

| Platform | Services | Count |
|----------|----------|-------|
| **Cloudflare Pages** | Aurelia, AAE Dashboard | 2 |
| **Cloudflare Workers** | RWAV Tool, Proxy Workers | 2+ |
| **Railway** | Knowledge Lake API, Mem0 API | 2 |
| **n8n** | Course generation workflows | 1 system |
| **Supabase** | CareTrack, Executive AI Advisor | 2 (planned) |

---

## 🔑 Key Integration Points

### Cross-Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Carla's AI Council Agents                  │
│  Claude (GUI) | Fred (ChatGPT) | Manus | Gemini | CC    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │  MTMOT Unified MCP   │
         │    (33 tools)        │
         └──────────┬───────────┘
                    │
      ┌─────────────┼─────────────┐
      ↓             ↓             ↓
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  Notion  │  │  Google  │  │ Knowledge    │
│          │  │  Drive   │  │ Lake API     │
└──────────┘  └──────────┘  └──────┬───────┘
                                   │
                         ┌─────────┴─────────┐
                         ↓                   ↓
                   ┌──────────┐       ┌──────────┐
                   │PostgreSQL│       │ Mem0/    │
                   │          │       │ Qdrant   │
                   └──────────┘       └──────────┘
```

---

## 🚨 Important URLs to Bookmark

### Production Services
- **Aurelia AI:** https://aurelia.mtmot.com
- **AAE Dashboard:** https://vibe.mtmot.com
- **Knowledge Lake API:** https://knowledge-lake-api-production.up.railway.app
- **Knowledge Lake Health:** https://knowledge-lake-api-production.up.railway.app/health
- **Mem0 API:** https://web-production-e3e44.up.railway.app

### Documentation & Tracking
- **Notion Tracking Page:** https://www.notion.so/2ce9440556f781b5b219d26fa3963b07
- **GitHub Repository:** https://github.com/carlorbiz/mem0

### ❌ Deprecated URLs (Do Not Use)
- ~~mem0-production-api.up.railway.app~~ - OLD/INCORRECT

---

## 📋 Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Live & Active |
| 🚧 | In Development |
| ⚠️ | Issue/Action Required |
| 📚 | Reference/Demo |
| 🔄 | Planned/Future |

---

## 🎯 Current Priorities (December 2025)

1. **Knowledge Lake MCP Tools** - Add extract-learning and archive tools to Manus MCP
2. **AAE Dashboard DNS** - Configure vibe.mtmot.com DNS in Cloudflare
3. **Course Generation** - MTMOT Mastermind Hub launch prep (mid-January 2026)
4. **CareTrack Development** - Continue Supabase implementation

---

## 📝 Notes for AI Agents

### For Claude Code (CC):
- Always read `/CLAUDE.md` at session start
- Run `python cc-context-sync.py start` before beginning work
- Knowledge Lake API is in THIS repo under `/mem0/api_server.py`
- Check this inventory before starting new projects to avoid duplication

### For Manus:
- You have GitHub access to this entire repository
- `/cc-slack-integration/` and `/carlorbiz-strategic-tool/` are ready for review
- Task delegation available via Manus MCP Server

### For All Agents:
- This inventory is the single source of truth - update it when projects change
- Always use production URLs from this document
- Reference the Cross-Service Architecture diagram for integration planning

---

**Document Version:** 1.0
**Created:** 2025-12-24
**Author:** Claude Code
**Repository:** carlorbiz/mem0
**Branch:** claude/audit-deployment-inventory-9bmeE

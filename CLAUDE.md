# CLAUDE.md - CC Context Sync Protocol

## 🚨 MANDATORY: Read This Before Every Session

This file exists because context loss after conversation compaction has caused months of debugging pain. Follow these protocols religiously.

---

## 🔥 CURRENT PRIORITY TASK (December 2025)

**Before doing anything else, query Knowledge Lake for these conversations:**

| Conv # | Topic | Why It Matters |
|--------|-------|----------------|
| **150** | CC TASK: Add Extract-Learning and Archive Tools | Your main technical task |
| **151** | CC TASK UPDATE: Two Distinct Workflows | Critical clarification - don't auto-archive! |
| **149** | Council Briefing | Your assignments and context |
| **147** | CC Context Sync Protocol | Why this file exists |

**Query command:**
```bash
curl -s -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"query": "CC TASK extract-learning archive MCP", "limit": 5}' | python -m json.tool
```

### Your Task Summary:
1. Add `knowledge_lake_extract_learning` tool to MCP (does NOT auto-archive)
2. Add `knowledge_lake_archive` tool to MCP (separate deliberate action)
3. Optionally add `knowledge_lake_process_and_archive` convenience tool (for completed single tasks only)
4. Test with Conv #140-141 (Jan strategic session - extract but DON'T archive)

---

## ⚠️ CRITICAL: Two Workflows for Learning Extraction

### Workflow A: Single-Task Completion
*"We fixed the Railway CVE issue"*
```
INGEST → EXTRACT-LEARNING → ARCHIVE
```

### Workflow B: Strategic Multi-Topic Session
*"Big planning conversation with Jan about Nera, deadlines, video pipeline..."*
```
INGEST → EXTRACT-LEARNING → KEEP ACTIVE
```

**Decision Matrix:**

| Conversation Type | Extract? | Archive? |
|-------------------|----------|----------|
| Bug fix / single task | ✅ | ✅ Archive |
| Strategic planning session | ✅ | ❌ Keep Active |
| Council briefing | ✅ | ❌ Keep Active |
| Superseded decision | ✅ | ✅ Archive |
| Ongoing project status | ✅ | ❌ Keep Active |

---

## 📍 Critical Project Details (MEMORISE THESE)

### Knowledge Lake API (Railway)
| Detail | Value |
|--------|-------|
| **Production URL** | `https://knowledge-lake-api-production.up.railway.app` |
| **Health Check** | `https://knowledge-lake-api-production.up.railway.app/health` |
| **API Version** | 2.1.0_database_persistence |
| **Repo Path** | This repo (mem0) - specifically `/mem0/api_server.py` |

### Notion Tracking Page
| Detail | Value |
|--------|-------|
| **URL** | `https://www.notion.so/2ce9440556f781b5b219d26fa3963b07` |
| **Title** | 🎯 AAE Project Review - December 2025 |
| **Purpose** | Track outstanding items, unanswered questions, council assignments |

### ❌ WRONG URLs (Never Use These)
- `mem0-production-api.up.railway.app` - OLD/INCORRECT
- Any URL not matching `knowledge-lake-api-production`

### Repo Structure
```
mem0/                          ← YOU ARE HERE (main working directory)
├── mem0/
│   ├── api_server.py          ← Knowledge Lake API server
│   └── database.py            ← PostgreSQL persistence
├── openmemory/
│   └── ui/                    ← Next.js UI (watch for CVE issues!)
├── examples/
│   └── mem0-demo/             ← Also has Next.js
├── CLAUDE.md                  ← This file
├── cc-context-sync.py         ← Context sync script (Python)
└── tools/
    └── learning_extractor/    ← WHERE YOUR NEW TOOLS GO
```

---

## 🔄 Session Start Protocol

**BEFORE doing anything the user asks, run this:**

```bash
python cc-context-sync.py start
```

Or manually:
```bash
# 1. Verify Knowledge Lake is accessible
curl -s https://knowledge-lake-api-production.up.railway.app/health | python -m json.tool

# 2. Fetch your current task context
curl -s -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"query": "CC TASK extract-learning", "limit": 5}' | python -m json.tool

# 3. Fetch recent CC sessions for continuity
curl -s -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Claude Code CC session", "limit": 5}' | python -m json.tool

# 4. Confirm you understand the current state before proceeding
```

**Then tell the user**: "I've synced context from the Knowledge Lake. [Summarise what you learned]. Ready to proceed."

---

## 🔄 Session End Protocol

**BEFORE compacting or ending the conversation:**

```bash
python cc-context-sync.py end "Brief description of what we accomplished"
```

Or manually:
```bash
curl -s -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "CC Session: [TOPIC]",
    "content": "[DETAILED SUMMARY - what was discussed, what code changed, what decisions were made, what remains TODO]",
    "agent": "Claude Code",
    "userId": "carla",
    "date": "'$(date +%Y-%m-%d)'",
    "metadata": {
      "businessArea": "AAE Development",
      "processingAgent": "Claude Code"
    }
  }'
```

---

## 🚨 Common Mistakes to Avoid

### 1. Wrong URL
- ❌ `mem0-production-api.up.railway.app`
- ✅ `knowledge-lake-api-production.up.railway.app`

### 2. Wrong Repo Reference
- ❌ "Pushing to mem0 repo" when you mean Knowledge Lake changes
- ✅ All Knowledge Lake API code lives in THIS repo under `/mem0/`

### 3. Railway 404 Errors
If you get 404 on ALL endpoints (including /health):
1. **Check Railway build logs FIRST** - likely a build failure
2. Common cause: Next.js CVEs in `openmemory/ui/` or `examples/mem0-demo/`
3. Fix: Upgrade Next.js to latest in ALL package.json files
4. DO NOT make api_server.py changes until build passes

### 4. Context Assumptions After Compaction
After compacting a conversation, you lose context. ALWAYS:
1. Re-read this CLAUDE.md
2. Run the context sync script
3. Verify URLs before making any curl calls

### 5. Auto-Archiving Strategic Sessions
- ❌ Never auto-archive multi-topic planning sessions
- ✅ Extract learnings but keep strategic conversations active
- ✅ Only archive completed single-task conversations

---

## 📋 MANDATORY: Deployment Inventory Update Protocol

### When to Update DEPLOYMENT_INVENTORY.md

**YOU MUST update DEPLOYMENT_INVENTORY.md when you:**
1. Create or modify any project in `github-projects/`
2. Create or modify any MCP server (`mtmot-unified-mcp/`, `manus-mcp/`, `mcp-ai-orchestration/`)
3. Deploy or update any CloudFlare Worker/Pages (`cloudflare-deployments/`, `cloudflare-worker/`)
4. Modify infrastructure services (`mem0/api_server.py`, Railway configs)
5. Create new apps or change deployment URLs
6. Change project status (Dev → Production, add new features, deprecate)
7. Add or modify course generation systems (`Carlorbiz_Course_Apps/`)

### Enforcement Mechanisms

This is enforced via **4 layers**:

1. **Git Pre-commit Hook** - Blocks commits if project files modified without inventory update
2. **GitHub Actions** - PR check fails if inventory not updated
3. **This Protocol** - All AI agents must follow this directive
4. **MCP Tool** - `update_deployment_inventory` tool (when available)

### How to Update

```bash
# 1. Edit the inventory file
vim DEPLOYMENT_INVENTORY.md  # or use your editor

# 2. Update relevant sections:
#    - Quick Stats (if project count changed)
#    - Add new project entry or update existing
#    - Update production URLs if changed
#    - Update status (Dev → Production, etc.)
#    - Update "Last Updated" date at top

# 3. Stage the inventory file
git add DEPLOYMENT_INVENTORY.md

# 4. Commit with your project changes
git commit -m "feat: your changes + update inventory"
```

### Bypass (Emergency Only)

If you have a legitimate reason to skip (e.g., fixing typo in README):
```bash
git commit --no-verify  # Bypasses pre-commit hook
```

**WARNING:** GitHub Actions will still check PRs. Add justification in PR description.

### For Session End Protocol

When you run `python cc-context-sync.py end`, include inventory updates in your summary:
```
"Created new Aurelia AI deployment at aurelia.mtmot.com, updated DEPLOYMENT_INVENTORY.md with production details"
```

---

## 📊 Key Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/stats` | GET | Knowledge Lake statistics |
| `/api/conversations/ingest` | POST | Add new conversation |
| `/api/conversations/search` | POST | Query conversations |
| `/api/conversations/unprocessed` | GET | Get unprocessed items |
| `/api/conversations/archive` | POST | Archive conversation |
| `/api/conversations/extract-learning` | POST | Extract learnings |

### MCP Tools to Build:
| Tool | Purpose | Auto-Archive? |
|------|---------|---------------|
| `knowledge_lake_extract_learning` | Extract discrete learnings | ❌ NO |
| `knowledge_lake_archive` | Archive processed conversation | N/A - deliberate action |
| `knowledge_lake_process_and_archive` | Convenience combo | ✅ YES - single tasks only |

---

## 🏗️ Current Architecture (Dec 2025)

```
┌─────────────────────────────────────────────────────────────┐
│                    Carla's AI Council                        │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  Claude  │  Fred    │  Manus   │  Gemini  │  CC (you)      │
│  (GUI)   │ (ChatGPT)│          │          │  (CLI)         │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴───────┬────────┘
     │          │          │          │             │
     └──────────┴──────────┴──────────┴─────────────┘
                           │
                           ▼
     ┌─────────────────────────────────────────────┐
     │         Knowledge Lake API (Railway)         │
     │  knowledge-lake-api-production.up.railway.app│
     │         Version: 2.1.0_database_persistence  │
     └─────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │   PostgreSQL    │      │   Mem0/Qdrant   │
     │  (persistence)  │      │ (semantic search)│
     └─────────────────┘      └─────────────────┘
```

---

## 👤 User Context: Carla

- **Organisations**: CARLORBIZ, MTMOT, GPSA/HPSA, ACRRM
- **Current Focus**: MTMOT Mastermind Hub launch (mid-January 2026)
- **Key Apps**: Nera (Executive AI Advisor), CareTrack, Knowledge Lake
- **Spelling**: Australian English
- **Visuals**: Gamma app only (no AI image generation)
- **Work Capacity**: ~40-50 hours/week available for MTMOT (down from 80hr consulting)

---

## 📅 Last Updated
2025-12-22 - Updated with:
- Current priority task (extract-learning + archive MCP tools)
- Two-workflow distinction (single task vs strategic session)
- Knowledge Lake conversation references (#147-151)
- Notion tracking page URL
- Clarification that extract-learning must NOT auto-archive
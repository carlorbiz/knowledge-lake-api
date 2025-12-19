# CLAUDE.md - CC Context Sync Protocol

## 🚨 MANDATORY: Read This Before Every Session

This file exists because context loss after conversation compaction has caused months of debugging pain. Follow these protocols religiously.

---

## 📍 Critical Project Details (MEMORISE THESE)

### Knowledge Lake API (Railway)
| Detail | Value |
|--------|-------|
| **Production URL** | `https://knowledge-lake-api-production.up.railway.app` |
| **Health Check** | `https://knowledge-lake-api-production.up.railway.app/health` |
| **API Version** | 2.1.0_database_persistence |
| **Repo Path** | This repo (mem0) - specifically `/mem0/api_server.py` |

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
└── cc-context-sync.py         ← Context sync script (Python)
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

# 2. Fetch recent CC sessions for context
curl -s -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Claude Code CC session", "limit": 5}' | python -m json.tool

# 3. Confirm you understand the current state before proceeding
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
- **Current Focus**: MTMOT Mastermind Hub launch (mid-January 2025)
- **Key Apps**: Nera (Executive AI Advisor), CareTrack, Knowledge Lake
- **Spelling**: Australian English
- **Visuals**: Gamma app only (no AI image generation)
- **Work Capacity**: ~20 hours/week real time + AI leverage

---

## 📅 Last Updated
2025-12-19 - Added after resolving months-long Railway deployment blocker caused by Next.js CVEs and URL confusion.
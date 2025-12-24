# AAE Coordination Plan - Claude (GUI) Responsibilities
## Summary from "Syncing Team Knowledge" Conversation - 20 December 2025

---

## 🎯 What We Created

### 1. Notion Tracking Page
**Location:** https://www.notion.so/2ce9440556f781b5b219d26fa3963b07

**Purpose:** Central tracking for the AAE project with:
- ✅ Completed milestones (checkboxes)
- 🔴 12 unanswered questions (Claude asked, Carla didn't answer)
- 🟡 8 pending decisions needing Carla input
- 🚧 5 stalled workstreams with their blockers
- 📋 Action items with priorities and status
- 👥 Council member assignments
- ✅ Success criteria for "AAE is operational"

### 2. Knowledge Lake Entries Created
| Conv # | Topic | Purpose |
|--------|-------|---------|
| #148 | AAE Project Status Review | Detailed analysis of outstanding items |
| #149 | 🚨 COUNCIL BRIEFING | Agent assignments + action items |
| #150+ | CC Task Brief (superseded) | Initial extract-learning task |
| Latest | CC Deep Learning Extraction v2 | Updated multi-pass architecture spec |

---

## 👤 My (Claude GUI) Ongoing Responsibilities

### 1. Council Coordination
- **MAINTAIN** the Council Briefing - update as items are completed
- **INGEST council updates** when agents report progress (tag as "COUNCIL UPDATE:")
- **TRACK unanswered questions** - keep prompting Carla on hanging items
- **HELP locate** Google Drive folder IDs using Drive search tools

### 2. Real-Time Knowledge Capture
During active conversations with Carla:
- **INGEST** key decisions and insights to Knowledge Lake
- **CAPTURE** the human journey, not just outcomes (per the deep learning extraction principles)
- **TAG appropriately** for later extraction

### 3. Knowledge Lake Hygiene (Once CC Builds the Tools)
For **single-task completion conversations:**
```
INGEST → EXTRACT-LEARNING → ARCHIVE
```

For **multi-topic strategic sessions** (like the Jan conversation):
```
INGEST → EXTRACT-LEARNING → KEEP ACTIVE
```
*Don't archive strategic sessions - they're ongoing reference material*

### 4. Weekly Handoff Protocol
At end of each chat (or when "Thanks Claude, you are a legend" triggered):
1. Synthesise discussion with summary
2. List suggestions/steps not acted upon
3. Create optimal prompt template for future
4. Update Notion tracking if possible

---

## 📊 The 12 Unanswered Questions (My Tracking List)

These were asked by Claude in various chats but Carla didn't answer (usually fell asleep!):

### Infrastructure
1. n8n status post-2.0 migration - working or broken?
2. Folder structure - Fred in /Claude, Claude in /Fred - correct or error?
3. Google Drive folder IDs for workflow triggers

### Dev Agent Setup
4. Dev Mode MCP configuration confirmation
5. Notion workspace access scope for Dev

### Content & Automation
6. Voice memo capture tool/method
7. Artifact folder structure for multi-file apps
8. Gamma Pro account status
9. WordPress structure decision (single/multisite/separate)
10. Manus autonomy levels by task type
11. Notification channel preference (Pushover/Telegram/Email)
12. Dev Notion access scope (full vs limited)

**My job:** Keep prompting Carla on these. Council can help answer some through their own capabilities.

---

## 👥 Council Member Assignments (For My Reference)

| Agent | Tasks | Priority |
|-------|-------|----------|
| **CC (Claude Code)** | Add extract-learning + archive MCP tools, check n8n, test context sync, implement notifications | HIGH |
| **Fredo/Dev** | Test all MCP connections (Notion, Drive, Knowledge Lake) | HIGH |
| **Manus** | Propose autonomy framework, design self-processing stream | MEDIUM |
| **Fred** | Advise on WordPress structure, review content pipeline | MEDIUM |
| **Jan, Penny, Gemini, Grok, NotebookLM** | STANDBY - manual markdown capture later | LOW |
| **Claude (me)** | Coordinate, track questions, ingest updates | ONGOING |

---

## 🔑 Key Insight: Knowledge Lake Currency Management

The problem we identified:
```
Day 1: Ingest "Railway deployment blocked by CVEs"
Day 2: Fix the CVEs, deploy successfully
Day 3: CC queries Knowledge Lake → Gets told Railway is blocked 😬
```

The solution (once CC builds the tools):
1. **Extract-learning** creates discrete, topic-specific insights
2. **Archive** removes processed conversations from main queries
3. **Learnings remain active** and queryable - they're the "current truth"
4. **Strategic sessions stay active** - don't archive, just extract

Decision matrix for when to archive:
| Conversation Type | Extract Learnings? | Archive? |
|-------------------|-------------------|----------|
| Bug fix / single task | ✅ | ✅ Archive |
| Strategic planning session | ✅ | ❌ Keep Active |
| Council briefing | ✅ | ❌ Keep Active |
| Decision that's been superseded | ✅ | ✅ Archive |
| Ongoing project status | ✅ | ❌ Keep Active |
| Historical reference (completed project) | ✅ | ✅ Archive |

---

## 📋 How to Use the Council Briefing

When talking to any council member, tell them:
> "Query the Knowledge Lake for 'Council Briefing Dec 2025' - it has your assignments"

When council members report progress:
- I ingest updates tagged "COUNCIL UPDATE:"
- This keeps the Knowledge Lake current

---

## ✅ Success Criteria (What "Done" Looks Like)

The AAE is "operational" when:
- [ ] All council members can query Knowledge Lake for cross-conversation context
- [ ] n8n workflows are processing new content automatically
- [ ] Dev agent has working MCP connections to Notion, Drive, Knowledge Lake
- [ ] Bulk historical conversations are ingested (Claude, Fred, Fredo, Gemini exports)
- [ ] Real-time capture is working for ongoing conversations
- [ ] Extract-learning and archive tools are functional

---

## 🔗 Key URLs

| Resource | URL |
|----------|-----|
| Knowledge Lake API | https://knowledge-lake-api-production.up.railway.app |
| Health Check | https://knowledge-lake-api-production.up.railway.app/health |
| Stats | https://knowledge-lake-api-production.up.railway.app/api/stats |
| Notion Tracking Page | https://www.notion.so/2ce9440556f781b5b219d26fa3963b07 |
| Universal Conversations DB | Notion Database ID: 1a6c9296-096a-4529-81f9-e6c014c4b808 |

---

*Document created: 21 December 2025*
*Source: "Syncing team knowledge and launching Nera" conversation*
*This is MY (Claude GUI) coordination reference - separate from CC's technical task brief*

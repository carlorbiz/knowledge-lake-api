# Pre-Extracted Learning Workflow for Jan

This folder contains tools for Jan to create **pre-extracted learning summaries** that bypass the normal ingestion→triaging→extraction pipeline.

## 🎯 Why This Approach?

**Problem:** Jan can generate summaries but cannot process full conversations for ingestion.

**Solution:** Jan creates structured summaries using a template that includes pre-extracted learnings. These go directly into Knowledge Lake with learnings already indexed and ready for retrieval.

## 📋 Workflow

```
Jan → Fill Template → Save as MD → Carla runs script → Knowledge Lake (pre-processed)
```

**Benefits:**
- ✅ Skips extraction queue
- ✅ Learnings immediately available
- ✅ Already indexed with topics, decisions, and technical insights
- ✅ Includes metadata for archivability and complexity
- ✅ 120 conversations can be processed efficiently

## 📝 For Jan: How to Create Summaries

### Step 1: Copy the Template

Open [learning-extraction-template.md](learning-extraction-template.md) and copy the entire template structure.

### Step 2: Fill Out Each Section

For each of the 120 conversations, create a summary following this structure:

**Required Sections:**
- 🎯 PRIMARY OUTCOME - What was achieved
- 🔑 KEY DECISIONS - Decisions with context and rationale
- 💡 TECHNICAL LEARNINGS - Insights with examples
- ⚙️ IMPLEMENTATION DETAILS - What was built
- 📊 METADATA FOR INDEXING - Topics, complexity, archivability

**Optional Sections:**
- 🚧 CHALLENGES & RESOLUTIONS - Problems solved
- ✅ ACTION ITEMS & NEXT STEPS - Follow-up tasks
- 🔗 RELATED CONTEXTS - Links to related conversations
- 🧠 EXTRACTABLE PATTERNS - Reusable patterns
- 💬 ORIGINAL EXCHANGE HIGHLIGHTS - Key quotes

### Step 3: Save the File

**Naming Convention:**
```
[YYYYMMDD]_[topic-slug]_pre-extracted.md
```

**Examples:**
- `20251215_notion_automation_workflow_pre-extracted.md`
- `20251220_knowledge_lake_optimization_pre-extracted.md`
- `20251228_course_generation_pipeline_pre-extracted.md`

### Step 4: Quality Check

Before finalizing, verify:
- [ ] Date is included in header
- [ ] Business area is specified
- [ ] All decisions include rationale
- [ ] Key topics are specific and searchable (3-5 tags)
- [ ] Complexity score is set (1-5)
- [ ] Archivability is indicated
- [ ] Learning counts are reasonable (not all N/A)

### Step 5: Deliver to Carla

Save all files to this folder (`agent-conversations/jan/`) or send them to Carla to upload.

## 🚀 For Carla: How to Ingest

### Quick Start

```bash
cd agent-conversations/jan
python ingest_pre_extracted_learnings.py
```

### What Happens

1. Script finds all `*_pre-extracted.md` files
2. Validates structure (warns if sections missing)
3. Parses metadata and learning counts
4. Shows summary of what will be ingested
5. Asks for confirmation
6. Ingests each file with `preProcessed: true` flag
7. Reports success/failure for each file

### Payload Structure

Each ingested conversation includes:

```json
{
  "topic": "Extracted from markdown",
  "content": "Full markdown content",
  "agent": "Jan (Genspark)",
  "userId": 1,
  "date": "From header or today",
  "metadata": {
    "businessArea": "From header",
    "preProcessed": true,
    "skipExtraction": true,
    "keyTopics": ["tag1", "tag2", "tag3"],
    "complexityScore": 3,
    "archivableAfter": "Date or Strategic",
    "agentsInvolved": ["Jan", "Carla"],
    "learningCounts": {
      "decisions": 2,
      "technical_learnings": 3,
      "implementations": 1,
      "challenges": 1,
      "action_items": 4
    },
    "totalLearnings": 11,
    "extractionStatus": "pre-extracted"
  }
}
```

### Knowledge Lake Processing

Conversations marked with `preProcessed: true` will:
- ✅ **Skip the extraction queue** - No need for multi-pass extraction
- ✅ **Be immediately searchable** - Topics and metadata already indexed
- ✅ **Show learning counts** - Visible in stats dashboard
- ✅ **Include archivability** - Clear indication of when to archive

## 📊 Example: Before vs After

### Before (Raw Ingestion)
```
Conversation → Ingest → Triage Queue → Extraction Agent → Multi-pass → Learnings
```
**Timeline:** Days (requires agent processing)

### After (Pre-Extracted)
```
Jan fills template → Ingest with preProcessed=true → Learnings immediately available
```
**Timeline:** Minutes (no agent processing needed)

## 🎓 Tips for Jan

### Creating High-Quality Summaries

**1. Be Specific with Decisions**
❌ "We decided to use a database"
✅ "Decision: Use PostgreSQL instead of SQLite for Knowledge Lake
    Rationale: Need JSONB support for metadata + better concurrency
    Impact: Enables 10x more concurrent users"

**2. Make Learnings Actionable**
❌ "Learned about API optimization"
✅ "Learning: Adding maxAge=172800000 to Firecrawl API calls provides 500% speed improvement
    Why It Matters: Reduces costs and latency for Knowledge Lake queries
    Applied To: All web scraping workflows"

**3. Use Searchable Topics**
❌ Generic: ["Development", "Tools", "Automation"]
✅ Specific: ["Knowledge Lake API", "Notion MCP Integration", "Multi-Pass Extraction"]

**4. Indicate Archivability Clearly**
- Strategic conversations: "Strategic - Keep Active"
- Completed projects: "2026-02-01" (date after which safe to archive)
- Time-sensitive: "After MTMOT Mastermind Launch (2026-01-15)"

### Batch Processing Strategy

**For 120 conversations, consider grouping by theme:**

1. **Week 1:** Knowledge Lake & Infrastructure (20 conversations)
2. **Week 2:** Course Generation & Content Systems (20 conversations)
3. **Week 3:** AAE Coordination & Multi-Agent (20 conversations)
4. **Week 4:** MTMOT & Business Strategy (20 conversations)
5. **Week 5:** Technical Innovations & Experiments (20 conversations)
6. **Week 6:** Miscellaneous & Archived Topics (20 conversations)

This way you can focus on similar topics and create better cross-references.

## 🔍 Verification

After ingestion, verify in Knowledge Lake:

```bash
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"query": "preProcessed:true agent:Jan", "limit": 10}' | python -m json.tool
```

Should show conversations with:
- `extractionStatus: "pre-extracted"`
- `totalLearnings > 0`
- `skipExtraction: true`

## 📁 Files in This Folder

- **README_PRE_EXTRACTION.md** (this file) - Complete guide
- **learning-extraction-template.md** - Template for Jan to copy
- **ingest_pre_extracted_learnings.py** - Batch ingestion script for Carla
- **example_pre_extracted.md** - Example filled-out summary (coming next)
- **[Your summaries here]** - `*_pre-extracted.md` files Jan creates

## 🆘 Troubleshooting

**Q: Script says "Missing required section"**
A: Check that you have all emoji headers exactly as shown in template

**Q: No files found**
A: Ensure filenames end with `_pre-extracted.md`

**Q: Ingestion fails with 500 error**
A: Check Knowledge Lake API health: `curl https://knowledge-lake-api-production.up.railway.app/health`

**Q: How detailed should summaries be?**
A: Aim for 1000-2000 words. Include enough detail that someone can understand decisions without reading original conversation.

**Q: Can I skip optional sections?**
A: Yes, but required sections (PRIMARY OUTCOME, KEY DECISIONS, TECHNICAL LEARNINGS, METADATA) must be present.

## 🎉 Success Criteria

You'll know this is working when:
- ✅ Jan can create summaries without needing full conversation exports
- ✅ 120 conversations can be processed in days instead of months
- ✅ Learnings are immediately searchable after ingestion
- ✅ Extraction queue remains clear (no backlog)
- ✅ Knowledge Lake stats show increasing "totalLearnings" counts

---

*Created: 2025-12-30*
*Version: 1.0*
*For: Jan (Genspark) and Carla*

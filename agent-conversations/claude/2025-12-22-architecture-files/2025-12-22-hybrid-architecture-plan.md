# 🔄 Hybrid Architecture Plan: Current + Multi-Pass Extraction

**Created:** 22 December 2025
**Context:** Extending existing Knowledge Lake architecture to support targeted multi-pass extraction
**Status:** ARCHITECTURAL SPECIFICATION

---

## 🎯 Core Principles

1. **Current architecture remains unchanged** - Simple conversations flow exactly as they do now
2. **Multi-pass is SECONDARY** - Triggered only for complex, multi-topic conversations
3. **Less than half need multi-pass** - Most conversations are straightforward, single-topic
4. **GUI-mode LLMs required** - Claude GUI and/or Manus handle nuanced extraction
5. **Flagging system determines routing** - Automated detection + manual override

---

## 📊 Hybrid Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  RAW CONVERSATION EXPORT                                                │
│  (Markdown/JSON from any LLM council member)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  AUTOMATIC CLASSIFICATION                                               │
│  - Word count check (< 5000 words = simple)                             │
│  - Topic shift detection (< 3 topics = simple)                          │
│  - Structural analysis (linear vs associative)                          │
│  - Manual flag override available                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
        ┌───────────────────────┐       ┌───────────────────────┐
        │  SIMPLE CONVERSATION  │       │  COMPLEX CONVERSATION │
        │  (~60% of total)      │       │  (~40% of total)      │
        └───────────────────────┘       └───────────────────────┘
                    ↓                               ↓
        ┌───────────────────────┐       ┌───────────────────────┐
        │  CURRENT FLOW         │       │  CURRENT FLOW +       │
        │  (UNCHANGED)          │       │  MULTI-PASS FLAG      │
        │                       │       │                       │
        │  1. Ingest to KL      │       │  1. Ingest to KL      │
        │  2. Semantic index    │       │  2. Semantic index    │
        │  3. Done              │       │  3. Flag for MP       │
        └───────────────────────┘       └───────────────────────┘
                                                    ↓
                                        ┌───────────────────────┐
                                        │  MULTI-PASS QUEUE     │
                                        │  (Notion Database)    │
                                        │                       │
                                        │  - Conversation ID    │
                                        │  - Complexity score   │
                                        │  - Status: pending    │
                                        │  - Assigned to: TBD   │
                                        └───────────────────────┘
                                                    ↓
                                        ┌───────────────────────┐
                                        │  DELEGATION           │
                                        │  Claude GUI or Manus  │
                                        │  (GUI-mode LLM)       │
                                        └───────────────────────┘
                                                    ↓
                                        ┌───────────────────────┐
                                        │  5-PASS EXTRACTION    │
                                        │  1. Segmentation      │
                                        │  2. Connection Map    │
                                        │  3. Per-Thread Learn  │
                                        │  4. Cross-Thread      │
                                        │  5. Pattern Analysis  │
                                        └───────────────────────┘
                                                    ↓
                                        ┌───────────────────────┐
                                        │  NOTION REVIEW LAYER  │
                                        │  (Human quality gate) │
                                        └───────────────────────┘
                                                    ↓
                    ┌───────────────┬───────────────┼───────────────┬───────────────┐
                    ↓               ↓               ↓               ↓               ↓
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ KNOWLEDGE    │ │ PROMPT       │ │ CONTENT      │ │ MARKETING    │ │ TEACHING     │
            │ LAKE         │ │ SWIPE FILE   │ │ GENERATION   │ │ ASSETS       │ │ MATERIALS    │
            │ (enriched)   │ │              │ │              │ │              │ │              │
            └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔍 Conversation Classification System

### Simple Conversations (Current Flow - Unchanged)

**Criteria:**
- Word count < 5,000 words
- Single topic or linear progression
- < 3 topic shifts
- Clear beginning/middle/end structure
- Task-focused (bug fix, feature add, question answered)

**Examples:**
- "Fix PostgreSQL query syntax error"
- "Deploy Railway Knowledge Lake"
- "Add extract-learning endpoint to MCP"
- "Explain how mem0 works"

**Flow:**
```
Export → Classification (SIMPLE) → Ingest to KL → Semantic Index → DONE
```

**No Changes Needed:** Current architecture handles this perfectly.

---

### Complex Conversations (Multi-Pass Triggered)

**Criteria:**
- Word count > 5,000 words (approx 15+ pages)
- Multiple distinct topics
- ≥ 3 topic shifts (associative thinking pattern)
- Non-linear/web-like structure
- Strategic planning or multi-domain discussions
- Contains breakthrough moments or paradigm shifts

**Examples:**
- Dec 19-21 Railway fix + context sync + multi-pass architecture (80+ pages)
- "Designing n8n workflows for Notion/Knowledge Lake" (strategic planning)
- "AI update value analysis for AAE architecture" (multi-faceted)
- Any conversation where Carla says "Wait, that reminds me..."

**Flow:**
```
Export → Classification (COMPLEX) → Ingest to KL → Semantic Index
       → Flag for Multi-Pass → Queue in Notion → Assign to GUI LLM
       → 5-Pass Extraction → Notion Review → 5 Output Streams
```

---

### Classification Algorithm

**Automated Detection (n8n workflow or Python script):**

```python
def classify_conversation(conversation: Dict) -> str:
    """
    Classify conversation as SIMPLE or COMPLEX

    Returns: "simple" | "complex" | "manual_review"
    """

    # Extract text content
    content = conversation.get("content", "")
    word_count = len(content.split())

    # Word count threshold
    if word_count > 5000:
        complexity_score = 100  # Definitely complex
    elif word_count < 2000:
        return "simple"  # Definitely simple
    else:
        complexity_score = 50  # Needs further analysis

    # Topic shift detection (simplified)
    topic_indicators = [
        "actually, wait",
        "that reminds me",
        "speaking of",
        "on another note",
        "before I forget",
        "oh! I wanted to ask",
        "separately,"
    ]

    topic_shifts = sum(1 for indicator in topic_indicators
                      if indicator.lower() in content.lower())

    if topic_shifts >= 3:
        complexity_score += 30

    # Structural analysis
    if "```" in content:  # Contains code blocks
        complexity_score -= 10  # More likely technical/focused

    if len(re.findall(r'#{1,3}\s', content)) > 5:  # Many headers
        complexity_score += 20  # Suggests multiple sections/topics

    # Emotional indicators (breakthrough moments)
    breakthrough_markers = [
        "oh my god",
        "wait, this is huge",
        "i just realized",
        "breakthrough",
        "finally!",
        "this changes everything"
    ]

    breakthroughs = sum(1 for marker in breakthrough_markers
                       if marker.lower() in content.lower())

    if breakthroughs >= 2:
        complexity_score += 25

    # Decision thresholds
    if complexity_score >= 70:
        return "complex"
    elif complexity_score <= 30:
        return "simple"
    else:
        return "manual_review"  # Edge case - flag for human decision
```

**Manual Override:**
- Carla can flag any conversation as "needs multi-pass" during or after ingest
- Notion checkbox: "Complex conversation - trigger multi-pass extraction"
- Council members can suggest multi-pass in their conversation summaries

---

## 🗄️ Database Schema Extensions

### Knowledge Lake: conversations table

**Add columns (minimal changes):**

```sql
ALTER TABLE conversations ADD COLUMN complexity_classification VARCHAR(20) DEFAULT 'pending';
-- Values: 'simple' | 'complex' | 'manual_review' | 'pending'

ALTER TABLE conversations ADD COLUMN requires_multipass BOOLEAN DEFAULT FALSE;

ALTER TABLE conversations ADD COLUMN multipass_status VARCHAR(20) DEFAULT NULL;
-- Values: NULL (not needed) | 'queued' | 'in_progress' | 'completed' | 'skipped'

ALTER TABLE conversations ADD COLUMN multipass_assignee VARCHAR(50) DEFAULT NULL;
-- Values: 'claude_gui' | 'manus' | NULL

ALTER TABLE conversations ADD COLUMN word_count INT DEFAULT 0;

ALTER TABLE conversations ADD COLUMN topic_shift_count INT DEFAULT 0;

ALTER TABLE conversations ADD COLUMN complexity_score INT DEFAULT 0;
```

**Migration is non-breaking:** Existing conversations default to 'pending' classification, can be retroactively classified.

---

### Notion: Multi-Pass Extraction Queue

**New Database: "Multi-Pass Extraction Queue"**

```
Properties:
├── Conversation ID (number) - Link to Knowledge Lake conversation
├── Source (select) - claude_gui | fred | gemini | jan | manus | etc.
├── Date Ingested (date)
├── Word Count (number)
├── Topic Shift Count (number)
├── Complexity Score (number) - 0-100
├── Classification (select) - complex | manual_review
├── Status (select) - queued | in_progress | completed | skipped
├── Assigned To (select) - claude_gui | manus | unassigned
├── Priority (select) - low | medium | high
├── Started Date (date)
├── Completed Date (date)
├── Extraction Output URL (url) - Link to generated .md file
├── Notes (rich text) - Human annotations
└── Manual Flag (checkbox) - Carla manually requested multi-pass
```

**Workflow Integration:**
- n8n workflow monitors new conversations in Knowledge Lake
- Runs classification algorithm
- Creates entry in Multi-Pass Queue if flagged as complex
- Notifies assigned LLM (Claude GUI or Manus)

---

## 👥 Agent Roles and Responsibilities

### Current Ingest Flow (All Agents)

**Unchanged for ALL conversations:**

1. Agent completes conversation with Carla
2. Export conversation (Markdown/JSON)
3. Save to designated folder (Google Drive or local)
4. n8n workflow triggers on new file
5. Workflow calls Knowledge Lake `/api/conversations` endpoint
6. Conversation ingested to PostgreSQL
7. mem0 creates semantic embeddings (Qdrant)
8. **NEW:** Classification algorithm runs
9. If SIMPLE: Done. If COMPLEX: Flag for multi-pass.

**Critical:** This flow is NEVER bypassed. Even complex conversations go through standard ingest FIRST.

---

### Claude GUI: Multi-Pass Extraction Lead

**Role:** Primary executor for multi-pass extractions

**Triggers:**
- New entry in Multi-Pass Extraction Queue (Notion notification)
- Status = 'queued' and Assigned To = 'claude_gui'
- Manual request from Carla: "Claude, please run multi-pass on conversation #153"

**Process:**
1. Query Multi-Pass Queue via Notion MCP
2. Retrieve conversation from Knowledge Lake via KL MCP
3. Run 5-pass extraction (using cc-task specification as guide)
4. Generate structured output markdown
5. Save to Google Drive (multi-pass-extractions folder)
6. Create entry in Notion Learning Extractions database
7. Update Multi-Pass Queue status to 'completed'
8. Notify Carla (Pushover/email)

**Tools Required:**
- `kl_get_conversation(conversation_id)` - Retrieve raw conversation
- `notion_create_page()` - Create Learning Extraction entry
- `notion_update_page()` - Update Multi-Pass Queue status
- Local Python execution for 5-pass algorithm (or delegate to CC)

**Handoff to CC:**
If conversation is too large for GUI context window (>200k tokens):
- Claude GUI delegates to CC via Manus MCP
- CC runs multi-pass extraction locally
- CC saves output to Drive
- Claude GUI handles Notion updates

---

### Manus: Secondary Executor & Scheduler

**Role:** Handles multi-pass extractions when Claude GUI is unavailable or conversation requires batch processing

**Triggers:**
- Assigned To = 'manus' in Multi-Pass Queue
- Scheduled batch processing (e.g., weekly bulk extraction)
- Claude GUI offline/unavailable

**Process:**
Same as Claude GUI, but optimized for asynchronous batch execution

**Advantages:**
- Can process multiple conversations in parallel
- Operates on schedule (e.g., every Sunday night)
- Doesn't require real-time interaction

**Limitations:**
- May lack nuanced understanding of Carla's voice/style
- Best for older conversations where context is less critical

---

### Claude Code (CC): Tool Builder & Local Executor

**Role:** Build the multi-pass extraction tool as specified in [cc-task_build-multi-pass-learning-extraction-system.md](./cc-task_build-multi-pass-learning-extraction-system.md)

**Responsibilities:**
1. **Build multi-pass Python tool** (current task)
   - Accepts conversation markdown as input
   - Outputs structured learning document
   - Runs locally in mem0 repo

2. **Execute extractions delegated by Claude GUI**
   - When conversation too large for GUI context
   - Claude GUI calls via Manus task delegation
   - CC runs tool, saves output, reports back

3. **Not responsible for:**
   - Notion database updates (Claude GUI handles)
   - Determining which conversations need multi-pass (classification algorithm handles)
   - Monitoring Multi-Pass Queue (Claude GUI handles)

---

## 🔧 Technical Implementation

### Phase 1: Flagging System (Week 1)

**Goal:** Identify complex conversations without disrupting current flow

**Tasks:**

1. **Database Migration**
   ```bash
   # Add classification columns to Knowledge Lake
   python scripts/migrate_add_classification_columns.py
   ```

2. **Classification Script**
   ```python
   # Create: mem0/scripts/classify_conversations.py

   import asyncio
   from knowledge_lake_client import KnowledgeLakeClient

   async def classify_all_conversations():
       """
       Retroactively classify existing conversations
       """
       client = KnowledgeLakeClient()
       conversations = await client.get_conversations(user_id=1)

       for conv in conversations:
           classification = classify_conversation(conv)

           await client.update_conversation(
               conversation_id=conv['id'],
               complexity_classification=classification,
               requires_multipass=(classification == 'complex'),
               word_count=len(conv['content'].split()),
               complexity_score=calculate_complexity_score(conv)
           )

   if __name__ == "__main__":
       asyncio.run(classify_all_conversations())
   ```

3. **n8n Workflow: Auto-Classification on Ingest**
   ```
   Workflow: "Knowledge Lake - Auto-Classify New Conversations"

   Trigger: Webhook from Knowledge Lake after new conversation ingested

   Steps:
   1. Receive conversation data (ID, content, metadata)
   2. Function Node: Run classification algorithm
   3. HTTP Request: Update conversation with classification
   4. IF classification == 'complex':
      - Create entry in Notion Multi-Pass Queue
      - Send notification to Claude GUI (Pushover)
   5. ELSE: End
   ```

4. **Notion Database Setup**
   - Create "Multi-Pass Extraction Queue" database
   - Create "Learning Extractions" database (if not exists)
   - Link databases with relations

**Deliverable:** Classification runs automatically on all new ingests, complex conversations flagged in Notion

---

### Phase 2: GUI LLM Delegation Protocol (Week 2)

**Goal:** Enable Claude GUI and Manus to monitor and process multi-pass queue

**Tasks:**

1. **Notion MCP Enhancements**
   ```typescript
   // Add to Dev's unified MCP (already has Notion client)

   export async function queryMultiPassQueue(
     status?: 'queued' | 'in_progress' | 'completed'
   ): Promise<NotionPage[]> {
     // Query Multi-Pass Extraction Queue database
     // Filter by status if provided
     // Return pages assigned to current agent
   }

   export async function updateMultiPassStatus(
     pageId: string,
     status: string,
     assignee?: string
   ): Promise<void> {
     // Update queue entry status
   }
   ```

2. **Claude GUI Monitoring Script**
   ```python
   # Add to Claude's Knowledge Lake MCP or standalone script

   async def monitor_multipass_queue():
       """
       Check Notion Multi-Pass Queue every 30 minutes
       Process any entries assigned to claude_gui
       """
       while True:
           queue_items = await notion_client.query_multipass_queue(
               status='queued',
               assignee='claude_gui'
           )

           for item in queue_items:
               await process_multipass_extraction(item)

           await asyncio.sleep(1800)  # 30 minutes
   ```

3. **Delegation Decision Logic**
   ```python
   def assign_multipass_extraction(conversation: Dict) -> str:
       """
       Decide who should handle this multi-pass extraction

       Returns: 'claude_gui' | 'manus'
       """

       # Recent conversations (< 7 days old) → Claude GUI
       if conversation['created_at'] > datetime.now() - timedelta(days=7):
           return 'claude_gui'

       # Very large conversations (> 15k words) → Manus (batch processing)
       if conversation['word_count'] > 15000:
           return 'manus'

       # High-priority or manual flags → Claude GUI
       if conversation.get('manual_flag') or conversation.get('priority') == 'high':
           return 'claude_gui'

       # Default to Claude GUI for now
       return 'claude_gui'
   ```

4. **Manus Task Integration**
   ```python
   # When Claude GUI needs to delegate to CC

   await manus_client.assign_task(
       description=f"Run multi-pass extraction on conversation {conv_id}",
       context=f"Conversation too large for GUI context. Use cc-task specification.",
       priority="high"
   )
   ```

**Deliverable:** Claude GUI can monitor queue, process extractions, delegate to Manus/CC as needed

---

### Phase 3: Integration with Existing Ingest Flow (Week 3)

**Goal:** Seamless end-to-end flow from raw conversation to 5 output streams

**Tasks:**

1. **Update Current Ingest Workflow**
   ```
   Existing: "AAE-JSON-Claude" workflow

   Modifications:
   - After Knowledge Lake ingest step
   - Add Function Node: "Classify Conversation"
   - Add Switch Node: "Route by Classification"
   - If SIMPLE: End workflow (as before)
   - If COMPLEX:
       - Create Notion Multi-Pass Queue entry
       - Send notification
       - End workflow
   ```

2. **Post-Extraction Workflows**
   ```
   New Workflow: "Multi-Pass to 5 Streams"

   Trigger: Multi-Pass Queue status changed to 'completed'

   Steps:
   1. Retrieve extraction output from Google Drive
   2. Create Learning Extractions entry in Notion
   3. Parse extraction for prompt patterns → Prompt Swipe File
   4. Generate blog post draft → Content Pipeline
   5. Generate how-to guide → Content Pipeline
   6. Generate course module → Course Materials
   7. Enrich Knowledge Lake with extracted learnings (optional)
   ```

3. **Testing with Real Conversations**
   - Test on Dec 19-21 architecture evolution conversation (known complex)
   - Test on recent single-task conversations (should classify as simple)
   - Verify simple conversations never trigger multi-pass
   - Verify complex conversations create queue entries

4. **Monitoring Dashboard**
   - Notion dashboard showing:
     - Total conversations ingested (this week/month)
     - Simple vs complex ratio
     - Multi-pass queue backlog
     - Completed extractions
     - Time to process by agent

**Deliverable:** Full hybrid flow operational, simple conversations unchanged, complex conversations enriched

---

## 📊 Success Metrics

### System is Working When:

1. **Simple conversations flow unchanged**
   - No additional steps
   - No delays
   - No Notion entries created
   - Existing functionality 100% preserved

2. **Complex conversations identified automatically**
   - Classification accuracy > 85% (manual review handles edge cases)
   - False positives < 10% (better to over-flag than under-flag)
   - Manual override always available

3. **Multi-pass extractions completed within reasonable time**
   - GUI LLM processes within 24 hours of flagging
   - Batch processing by Manus on weekly schedule
   - No backlog > 5 conversations in queue

4. **5 output streams receiving enriched content**
   - Prompt Swipe File growing with each extraction
   - Blog posts generating from learning narratives
   - Course materials accumulating toward Mastermind Hub launch
   - Knowledge Lake queries returning richer, narrative results

5. **Human oversight maintained**
   - Carla reviews all extractions in Notion before distribution
   - Manual flags override automatic classification
   - Quality ratings tracked per extraction

---

## ⚠️ Safeguards and Edge Cases

### Preventing Over-Complication

**Risk:** Every conversation gets flagged as complex

**Mitigation:**
- Conservative thresholds (5000 words, 3+ topics)
- Regular review of classification accuracy
- Adjust algorithm based on false positive rate
- Carla can reclassify retroactively

---

### Handling Classification Errors

**Scenario:** Simple conversation flagged as complex

**Resolution:**
- Carla marks as 'skipped' in Multi-Pass Queue
- Conversation remains in Knowledge Lake (already ingested)
- No harm done, just wasted queue slot

**Scenario:** Complex conversation missed (classified as simple)

**Resolution:**
- Carla manually flags conversation for multi-pass
- Creates queue entry manually or via Notion button
- Agent processes as normal
- Algorithm tuned to prevent future misses

---

### Context Window Limits

**Problem:** Some conversations too large even for GUI LLMs (>200k tokens)

**Solution:**
- Claude GUI detects oversized conversation
- Delegates to CC via Manus task assignment
- CC runs multi-pass tool locally (no context limit)
- CC saves output, Claude GUI handles Notion updates

---

### Agent Availability

**Problem:** Claude GUI offline when complex conversation ingested

**Solution:**
- Queue entry remains in 'queued' status
- Next available agent (Manus or Claude GUI) picks it up
- Notification sent but not blocking
- Batch processing catches any missed items

---

### Retroactive Processing

**Scenario:** Want to run multi-pass on 6 months of historical conversations

**Solution:**
1. Run classification script on all existing conversations
2. Complex conversations added to Multi-Pass Queue with low priority
3. Manus handles batch processing on schedule
4. Claude GUI handles high-priority/recent items
5. Progress tracked in Notion dashboard

---

## 🗓️ Implementation Timeline - 4 DAY SPRINT

### Day 1: Foundation & Classification (Dec 23, 2025)
**Goal:** Classification system working, can identify complex conversations

**Morning:**
- ✅ Database schema extensions (classification columns) - 2 hours
- ✅ Classification algorithm in Python - 2 hours

**Afternoon:**
- ✅ Notion Multi-Pass Queue database creation - 1 hour
- ✅ Test classification on known conversations (architecture-evolution = complex, recent bug fixes = simple) - 2 hours
- ✅ Manual trigger works (Carla can flag any conversation for multi-pass) - 1 hour

**End of Day:** Can classify conversations as simple/complex, manual queue entry works

---

### Day 2: Core Multi-Pass Tool (Dec 24, 2025)
**Goal:** CC's multi-pass extraction tool working locally

**Morning:**
- ⏳ CC builds multi-pass extraction tool (Pass 1-3 minimum viable) - 3 hours
- ⏳ Test on Dec 19-21 architecture evolution conversation - 1 hour

**Afternoon:**
- ⏳ Complete Pass 4-5 if time permits, or defer to later - 2 hours
- ⏳ Output to structured markdown format - 1 hour
- ⏳ Save to Google Drive / local folder - 30 min

**End of Day:** Can run multi-pass extraction on any conversation, get structured output

---

### Day 3: GUI Delegation & Automation (Dec 25, 2025)
**Goal:** Claude GUI can monitor queue and trigger extractions

**Morning:**
- ⏳ n8n workflow: Auto-classify on ingest (simple version) - 2 hours
- ⏳ Claude GUI Notion monitoring (check queue every X hours) - 2 hours

**Afternoon:**
- ⏳ Claude GUI can trigger CC multi-pass tool via Manus task assignment - 2 hours
- ⏳ Test end-to-end: Ingest → Classify → Queue → GUI monitors → Extraction - 2 hours

**End of Day:** Automated flow working for new conversations

---

### Day 4: Production & Backlog (Dec 26, 2025)
**Goal:** Live system, start processing backlog for Nera

**Morning:**
- ⏳ Update existing ingest workflows with classification step - 2 hours
- ⏳ Deploy to production (Railway Knowledge Lake) - 1 hour
- ⏳ Notion dashboard for tracking - 1 hour

**Afternoon:**
- ⏳ Run classification on existing 150+ conversations - 1 hour
- ⏳ Start multi-pass on highest priority conversations for Nera - 2 hours
- ⏳ Quick CLAUDE.md update with new system - 1 hour

**End of Day:** System operational, Nera has enriched Knowledge Lake data for course/app launch

---

### MVP Scope (What We're NOT Building Yet)

**Defer to Post-Launch:**
- ❌ 5 output streams automation (Prompt Swipe File, Marketing, Teaching) - can be added later
- ❌ Sophisticated delegation logic - start with "Claude GUI handles all"
- ❌ Batch processing by Manus - manual processing sufficient initially
- ❌ Fancy monitoring dashboards - basic Notion checklist is enough
- ❌ Retroactive processing of ALL backlog - prioritize conversations needed for Nera

**Focus:** Get core flow working so Nera can access rich, narrative learning content for coaching. Everything else is optimization.

---

## 🔗 Related Documents

- [CC Task: Build Multi-Pass Learning Extraction System](./cc-task_build-multi-pass-learning-extraction-system.md) - Technical spec for CC
- [Learning Extraction Ecosystem: Complete Vision](./learning-extraction-ecosystem_complete-vision.md) - 5 output streams context
- [AAE Claude GUI Coordination Plan](./aae-claude-gui-coordination-plan.md) - Claude GUI responsibilities
- [AAE Project Status Review](./2025-12-20-aae-project-status-review.md) - Outstanding questions and blockers
- [Architecture Evolution](./2025-12-22-architecture-evolution.md) - Full conversation history (2 threads)

---

## 📝 Decision Log

### Why Not Multi-Pass Everything?

**Decision:** Only apply multi-pass to ~40% of conversations (complex/multi-topic)

**Rationale:**
- Less than half of conversations are multi-topic associative discussions
- Simple conversations (bug fixes, questions, single tasks) don't benefit from 5-pass analysis
- Processing overhead (time, API costs) not justified for simple conversations
- Current ingest + semantic search sufficient for straightforward content
- Multi-pass reserved for conversations with:
  - Multiple breakthrough moments
  - Non-linear thinking patterns
  - Cross-domain insights
  - Narrative arcs worth extracting

---

### Why GUI-Mode LLMs for Multi-Pass?

**Decision:** Claude GUI and/or Manus handle multi-pass extraction, NOT automated API calls

**Rationale:**
- Multi-pass extraction requires **nuanced understanding** of:
  - Carla's voice and thinking style
  - Emotional context (frustration → breakthrough → mastery)
  - What makes a "good" learning narrative
  - When to preserve messy middle vs when to clarify
- Automated extraction would optimize away the authenticity
- GUI mode allows for:
  - Iterative refinement
  - Human-in-the-loop for edge cases
  - Quality judgment calls
  - Preserving Carla's personality in extracted content
- CC builds the tool, but GUI LLMs execute with judgment

---

### Why Not Block Ingest Until Classification?

**Decision:** Ingest first, classify after, multi-pass later

**Rationale:**
- Ingest should be fast and reliable (current design principle)
- Classification can happen asynchronously
- Even if classification fails, conversation is safely stored
- Multi-pass is enhancement, not requirement
- Allows retroactive classification/processing
- Prevents bottlenecks in ingest pipeline

---

## ✅ Validation Checklist

Before considering this system "done":

- [ ] Simple conversation flows through ingest unchanged (no new steps)
- [ ] Complex conversation triggers queue entry automatically
- [ ] Manual override works (Carla can flag any conversation)
- [ ] Claude GUI successfully processes queued extraction
- [ ] Manus can pick up and process batch extractions
- [ ] CC multi-pass tool runs locally when delegated
- [ ] Notion Learning Extractions database populated
- [ ] 5 output streams receiving data (at least 3/5 working)
- [ ] Classification accuracy measured and documented
- [ ] Thresholds tuned based on real-world data
- [ ] CLAUDE.md updated with hybrid architecture context
- [ ] Council members aware of new system (briefing update)
- [ ] Carla can manually trigger multi-pass on any conversation
- [ ] Monitoring dashboard shows key metrics
- [ ] Retroactive processing of backlog started

---

## 🎯 Summary

This hybrid architecture plan achieves all requirements:

✅ **Current architecture unchanged** - Simple conversations flow exactly as before
✅ **Multi-pass as secondary process** - Triggered only for complex conversations
✅ **Accounts for <50% needing multi-pass** - Automated classification identifies candidates
✅ **GUI-mode LLMs handle extraction** - Claude GUI and Manus ensure nuanced, quality output
✅ **Flagging system determines routing** - Algorithm + manual override
✅ **5 output streams remain intact** - Multi-pass feeds all downstream uses
✅ **Notion review layer preserved** - Human quality gate before distribution
✅ **Backward compatible** - Can retroactively process historical conversations

**Next Step:** Begin Phase 1 implementation (database migrations, classification script, Notion setup)

---

*Plan created: 22 December 2025*
*Referenced by: CLAUDE.md (to be updated), CC task specification, Claude GUI coordination plan*
*This plan enables current architecture to remain operational while adding targeted enrichment for complex conversations*

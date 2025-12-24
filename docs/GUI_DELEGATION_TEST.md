# GUI Delegation Workflow - Test Plan

**Date:** December 24, 2025
**Purpose:** Test cross-agent task delegation for multi-pass extraction
**Participants:** Claude Code → Manus (via MCP task manager)

---

## Workflow Overview

```
User Query → Claude GUI → Task Assignment → Manus Task Manager → Manus Execution → Results
```

### Components

1. **Claude GUI** - User interface for AAE Council
2. **Manus Task Manager MCP** - Cross-agent task queue (`manus-mcp` server)
3. **Manus** - Autonomous agent for complex extractions
4. **Knowledge Lake** - Persistent storage for results

---

## Test Scenario

### Scenario: Delegate Multi-Pass Extraction

**User Request:**
> "This conversation is getting complex. Can you delegate the multi-pass extraction to Manus?"

**Expected Workflow:**
1. Claude Code detects complexity threshold (25% context or word count > 5k)
2. Assigns task to Manus via `assign_task` MCP tool
3. Manus picks up task from queue
4. Manus runs multi-pass extraction
5. Manus updates task status with results
6. Claude Code retrieves results and updates Knowledge Lake

---

## Test Execution

### Test 1: Assign Task to Manus

**Objective:** Verify task assignment works via MCP

**Test Conversation:**
- File: `conversations/exports/archive/Claude_20251101.md`
- Word Count: ~3,500 words (medium complexity)
- Classification: Simple (good test case)

**Expected Results:**
- Task created in Manus queue
- Task ID returned
- Status = "pending"
- Priority = "medium"

### Test 2: Check Task Status

**Objective:** Verify status tracking works

**Expected Results:**
- Can query task by ID
- Status updates reflect actual progress
- Error messages captured if task fails

### Test 3: Retrieve Task Results

**Objective:** Verify results retrieval

**Expected Results:**
- Extraction report accessible
- Thread count, learnings, insights returned
- Links to MD/JSON reports provided

---

## MCP Tools Used

### 1. assign_task
```python
{
  "description": "Extract learnings from Claude_20251101 conversation",
  "context": "Medium complexity conversation (3,500 words) about Gemini CLI integration. Extract: methodology decisions, insights, prompting techniques.",
  "priority": "medium"
}
```

### 2. get_task_status
```python
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### 3. get_task_result
```python
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

## Implementation Status

### Current Capabilities ✅

1. **MCP Task Manager** - Installed and configured
   - Location: `manus-mcp/manus_server.py`
   - Config: `.vscode/mcp.json`
   - Tools: assign_task, get_task_status, get_task_result, list_my_tasks

2. **Multi-Pass Extraction Tool** - Fully functional
   - Script: `scripts/multipass_extract.py`
   - 5-pass extraction system
   - JSON + Markdown output

3. **Knowledge Lake Integration** - Working
   - API: https://knowledge-lake-api-production.up.railway.app
   - Classification system active
   - Conversation ingestion tested

### Pending Integration 🚧

1. **Manus Execution Loop**
   - Manus needs to poll task queue
   - Execute `multipass_extract.py` for assigned tasks
   - Update task status with results

2. **Auto-Delegation Triggers**
   - Context threshold detection (25%)
   - Automatic task assignment based on complexity
   - Priority calculation

3. **Results Sync**
   - Automatic Knowledge Lake updates
   - Notion queue updates
   - Google Drive archival

---

## Test Procedure

### Phase 1: Manual Task Assignment (NOW)

```bash
# Step 1: Verify MCP server is running
# (Check VS Code Output → MCP Servers)

# Step 2: Use Claude Code to assign task
# In Claude Code conversation:
"Please assign a multi-pass extraction task to Manus for the file
conversations/exports/archive/Claude_20251101.md with medium priority."

# Step 3: Claude Code uses assign_task MCP tool
# Expected output: task_id returned

# Step 4: Check task status
"What's the status of the Manus task?"

# Step 5: List all tasks
"Show me all tasks in Manus queue"
```

### Phase 2: Manus Execution (MANUAL SIMULATION)

Since Manus auto-execution isn't fully wired up yet, simulate manually:

```bash
# Step 1: List tasks
python scripts/check_manus_tasks.py

# Step 2: Execute extraction for pending task
python scripts/multipass_extract.py conversations/exports/archive/Claude_20251101.md \
  --output extractions/Claude_20251101-extraction.md

# Step 3: Manually update task status
# (Would be automatic in full implementation)
python scripts/update_manus_task.py TASK_ID \
  --status completed \
  --result "Extraction complete: 4 threads, 12 learnings, 3 insights"
```

### Phase 3: Verification

```bash
# Check task result via MCP
"Retrieve the result for task TASK_ID"

# Verify extraction files created
ls -lh extractions/Claude_20251101-extraction.*

# Verify Knowledge Lake updated
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "query": "Claude_20251101", "limit": 5}'
```

---

## Success Criteria

- [ ] Task successfully assigned to Manus via MCP tool
- [ ] Task ID returned and stored
- [ ] Task status queryable via `get_task_status`
- [ ] Task appears in `list_my_tasks` output
- [ ] Extraction executed (manually for now)
- [ ] Results retrievable via `get_task_result`
- [ ] Knowledge Lake updated with extraction metadata
- [ ] Extraction files saved to Google Drive

---

## Known Limitations

### Current State (Day 3 Complete)

**What Works:**
- ✅ MCP task assignment (Claude Code → Manus queue)
- ✅ Status tracking (pending → in_progress → completed)
- ✅ Multi-pass extraction tool
- ✅ Knowledge Lake API integration

**What's Manual:**
- ⚠️ Manus execution (needs polling loop)
- ⚠️ Auto-delegation triggers (needs context monitoring)
- ⚠️ Results sync (needs webhook integration)

### Day 4 Tasks (Future)

1. **Manus Polling Loop**
   ```python
   # manus_worker.py
   while True:
       tasks = get_pending_tasks()
       for task in tasks:
           run_extraction(task)
           update_status(task.id, "completed", results)
       sleep(60)
   ```

2. **Auto-Delegation**
   ```python
   # claude_code_hook.py
   if context_usage > 0.25 or word_count > 5000:
       task_id = assign_task_to_manus(conversation)
       notify_user(f"Delegated to Manus: {task_id}")
   ```

3. **Results Webhook**
   ```python
   # n8n workflow
   Manus task complete → Update Knowledge Lake → Update Notion → Archive to Drive
   ```

---

## Test Results Log

### Test Run 1: 2025-12-24 (Pending)

**Test:** Assign task via MCP tool

**Command:**
```
User: "Please assign a multi-pass extraction task to Manus for
conversations/exports/archive/Claude_20251101.md with medium priority"
```

**Expected Response:**
```
I'll assign this extraction task to Manus.

[Uses assign_task MCP tool]

✅ Task assigned to Manus
Task ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Priority: medium
Status: pending

You can check progress with: "What's the status of task a1b2c3d4?"
```

**Actual Response:** [TO BE TESTED]

---

## Next Steps

### Immediate (After Test)

1. Document actual test results in this file
2. Create issue tracker for any failures
3. Build Manus polling worker if test succeeds

### Short-term (Day 4)

1. Wire up auto-delegation triggers
2. Implement results webhook
3. Test full end-to-end workflow

### Long-term (Week 2)

1. Add Notion integration to delegation flow
2. Build dashboard for task monitoring
3. Add agent workload balancing

---

## Related Documentation

- [Manus MCP Server](../manus-mcp/README.md)
- [Multi-Pass Extraction Tool](../scripts/multipass_extract.py)
- [Knowledge Lake API Status](./KNOWLEDGE_LAKE_API_STATUS.md)
- [Notion Queue Schema](./NOTION_MULTIPASS_QUEUE_SCHEMA.md)

---

*Test Plan Created: 2025-12-24*
*Status: Ready for execution*
*Estimated Test Time: 15 minutes*

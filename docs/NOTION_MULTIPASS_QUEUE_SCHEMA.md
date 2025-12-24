# Notion Multi-Pass Queue Database Schema

**Date:** December 24, 2025
**Purpose:** Track conversations requiring multi-pass extraction with priority management and status tracking
**Integration:** Links to Knowledge Lake API conversations

---

## Database Overview

**Database Name:** Multi-Pass Extraction Queue
**Primary Use:** Manage complex conversation extraction workflow
**Target Users:** AAE Council (Claude, Manus, Jan, Fred, Penny, etc.)

---

## Property Specifications

### Core Identification

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Conversation Topic** | Title | Primary identifier (conversation topic/title) | Required |
| **Conversation ID** | Number | Knowledge Lake conversation ID | Format: Number |
| **Session ID** | Text | Original session UUID from JSONL | Max length: 50 |
| **Date** | Date | Conversation date | Format: YYYY-MM-DD |

### Classification & Complexity

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Classification** | Select | Complexity classification | Options: Simple, Complex, Manual Review |
| **Complexity Score** | Number | Calculated complexity (0-100) | Format: 0.00 |
| **Word Count** | Number | Total conversation word count | Format: Number |
| **Topic Shift Count** | Number | Number of major topic changes | Format: Number |
| **Breakthrough Moments** | Number | Count of breakthrough moments detected | Format: Number |

### Status Tracking

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Status** | Select | Current extraction status | Options: Pending, In Progress, Completed, Failed, Blocked |
| **Priority** | Select | Extraction priority | Options: Low, Medium, High, Urgent |
| **Assigned Agent** | Select | Agent responsible for extraction | Options: Claude, Manus, Jan, Fred, Penny, Auto |
| **Extracted** | Checkbox | Whether multi-pass extraction completed | Default: unchecked |

### Extraction Metadata

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Thread Count** | Number | Number of topic threads found | Format: Number (blank if not extracted) |
| **Connection Count** | Number | Number of thread connections mapped | Format: Number (blank if not extracted) |
| **Learning Count** | Number | Number of learnings extracted | Format: Number (blank if not extracted) |
| **Insight Count** | Number | Number of cross-thread insights | Format: Number (blank if not extracted) |

### File References

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Source File Path** | Text | Path to conversation markdown file | Max length: 500 |
| **Extraction Report (MD)** | URL | Link to markdown extraction report | |
| **Extraction Report (JSON)** | URL | Link to JSON extraction data | |
| **Google Drive Link** | URL | Link to Google Drive archived version | |

### Workflow Tracking

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Created At** | Created time | When conversation was added to queue | Auto-populated |
| **Last Modified** | Last edited time | Last status update | Auto-populated |
| **Extraction Started** | Date | When extraction began | Format: YYYY-MM-DD HH:mm |
| **Extraction Completed** | Date | When extraction finished | Format: YYYY-MM-DD HH:mm |
| **Duration (minutes)** | Formula | Extraction time in minutes | `dateBetween(prop("Extraction Completed"), prop("Extraction Started"), "minutes")` |

### Notes & Context

| Property Name | Type | Description | Configuration |
|--------------|------|-------------|---------------|
| **Key Topics** | Multi-select | Main conversation themes | Options: Architecture, API Design, Database, Testing, Documentation, Automation, n8n, Knowledge Lake, Mem0 |
| **Agent Notes** | Text | Notes from assigned agent | Rich text enabled |
| **Blocking Issues** | Text | Why extraction is blocked (if applicable) | Rich text enabled |

---

## Views

### 1. Pending Queue (Default View)
**Filter:** Status = Pending
**Sort:** Priority (Urgent → Low), then Complexity Score (High → Low)
**Visible Properties:** Conversation Topic, Date, Priority, Classification, Complexity Score, Word Count, Assigned Agent

**Purpose:** Primary work queue showing what needs to be extracted next

### 2. In Progress
**Filter:** Status = In Progress
**Sort:** Extraction Started (oldest first)
**Visible Properties:** Conversation Topic, Assigned Agent, Extraction Started, Word Count, Status

**Purpose:** Monitor active extractions

### 3. Completed
**Filter:** Status = Completed
**Sort:** Extraction Completed (newest first)
**Visible Properties:** Conversation Topic, Date, Complexity Score, Thread Count, Learning Count, Insight Count, Duration, Extraction Report (MD)

**Purpose:** Review completed extractions and metrics

### 4. By Priority
**Group by:** Priority
**Sort:** Complexity Score (High → Low)
**Filter:** Status ≠ Completed
**Visible Properties:** Conversation Topic, Status, Classification, Complexity Score, Word Count, Assigned Agent

**Purpose:** Priority-based work planning

### 5. By Agent
**Group by:** Assigned Agent
**Sort:** Priority, then Status
**Visible Properties:** Conversation Topic, Status, Priority, Word Count, Extraction Started

**Purpose:** Agent workload tracking

### 6. High Complexity (Score > 70)
**Filter:** Complexity Score > 70 AND Status ≠ Completed
**Sort:** Complexity Score (High → Low)
**Visible Properties:** Conversation Topic, Complexity Score, Word Count, Topic Shift Count, Breakthrough Moments, Priority, Status

**Purpose:** Identify most complex conversations requiring extra attention

---

## Automation Rules

### Rule 1: Auto-Assign Based on Complexity
**Trigger:** New item added OR Complexity Score changed
**Condition:** Complexity Score > 80
**Action:** Set Priority = High, Set Assigned Agent = Claude

### Rule 2: Flag Long-Running Extractions
**Trigger:** Extraction Started is more than 30 minutes ago
**Condition:** Status = In Progress
**Action:** Add comment: "Extraction running longer than expected - check for issues"

### Rule 3: Mark as Extracted in Knowledge Lake
**Trigger:** Status changed to Completed
**Condition:** Extraction Report (MD) is not empty
**Action:** Send to webhook to update Knowledge Lake `multipass_extracted = true`

---

## Integration Points

### Knowledge Lake API
**Base URL:** `https://knowledge-lake-api-production.up.railway.app`

**Endpoints to Use:**
1. **POST /api/query** - Search for conversations to add to queue
   ```json
   {
     "userId": 1,
     "query": "",
     "limit": 200
   }
   ```
   Response includes: `id`, `topic`, `date`, `complexity_classification`, `complexity_score`, `word_count`, `requires_multipass`, `multipass_extracted`

2. **Update conversation after extraction** (custom endpoint needed):
   ```json
   PATCH /api/conversations/{id}
   {
     "multipass_extracted": true,
     "metadata": {
       "thread_count": 74,
       "connection_count": 2301,
       "learning_count": 123,
       "insight_count": 59
     }
   }
   ```

### Google Drive
**Extraction Reports Folder:** `AAE Council/Extractions/Multi-Pass Reports/`

**Naming Convention:** `YYYY-MM-DD-{topic-slug}-extraction.md`

### GitHub Repository
**Repo:** `mem0-sync/mem0`
**Extraction Path:** `extractions/`
**Source Conversations Path:** `conversations/exports/jsonl-exports/`

---

## Workflow Integration

### Initial Population (One-Time)
```python
# Script: scripts/populate_notion_queue.py
# Fetch all complex conversations from Knowledge Lake
# Create Notion items for conversations where multipass_extracted = false
# Set Priority based on complexity_score
# Set Status = Pending
```

### Ongoing Sync (Automated)
1. **New complex conversation ingested to Knowledge Lake** → Webhook triggers n8n
2. **n8n workflow** → Creates Notion database entry
3. **Agent picks up from Pending Queue** → Updates Status to In Progress
4. **Extraction completes** → Agent updates Status to Completed, adds report links
5. **Notion automation** → Triggers webhook to update Knowledge Lake

---

## Sample Database Entry

| Property | Value |
|----------|-------|
| **Conversation Topic** | 2025-12-06 Hybrid Architecture Planning |
| **Conversation ID** | 165 |
| **Session ID** | b51709bd-1c6f-4d1e-9b2e-5a3c8d9e1f0a |
| **Date** | 2025-12-06 |
| **Classification** | Complex |
| **Complexity Score** | 95.0 |
| **Word Count** | 184,304 |
| **Topic Shift Count** | 74 |
| **Breakthrough Moments** | 59 |
| **Status** | Completed ✅ |
| **Priority** | High |
| **Assigned Agent** | Claude |
| **Extracted** | ✅ |
| **Thread Count** | 74 |
| **Connection Count** | 2,301 |
| **Learning Count** | 123 |
| **Insight Count** | 59 |
| **Source File Path** | conversations/exports/jsonl-exports/2025-12-06-conversation-b51709bd.md |
| **Extraction Report (MD)** | [Google Drive Link] |
| **Extraction Report (JSON)** | [Google Drive Link] |
| **Google Drive Link** | [Folder Link] |
| **Created At** | 2025-12-24 02:30 |
| **Extraction Started** | 2025-12-24 03:15 |
| **Extraction Completed** | 2025-12-24 03:18 |
| **Duration (minutes)** | 3 |
| **Key Topics** | Architecture, Multi-Pass System, Classification Algorithm, JSONL Parser |
| **Agent Notes** | Largest extraction to date. 74 distinct threads covering full hybrid architecture design. Exceptional learning capture - 123 discrete learnings across all categories. |

---

## Implementation Steps

### Phase 1: Manual Database Creation (15 minutes)
1. Create new database in Notion workspace
2. Add all properties listed above with exact specifications
3. Create the 6 views with filters and sorts
4. Set up 3 automation rules

### Phase 2: Initial Population (30 minutes)
1. Write `populate_notion_queue.py` script
2. Fetch all complex conversations from Knowledge Lake API
3. For each conversation where `multipass_extracted = false`:
   - Create Notion database item
   - Set all classification fields from API response
   - Calculate priority based on complexity_score
   - Set Status = Pending
   - Set Assigned Agent = Auto

### Phase 3: Automation Setup (1 hour)
1. Create n8n workflow: `notion-multipass-queue-sync`
2. Webhook trigger when new complex conversation ingested
3. Create Notion database item automatically
4. Webhook trigger when Notion status = Completed
5. Update Knowledge Lake `multipass_extracted = true`

### Phase 4: Testing (30 minutes)
1. Test manual queue item creation
2. Test automation workflow end-to-end
3. Verify Knowledge Lake sync
4. Test agent assignment and status updates

---

## Expected Results

### After Phase 1-2 (Initial Setup)
- Notion database with 7 entries (one per complex conversation)
- All pending conversations visible in Pending Queue view
- Priority automatically calculated

### After Phase 3 (Automation)
- New complex conversations auto-added to queue
- Knowledge Lake sync bidirectional
- Agent notifications when assigned

### After Phase 4 (Testing)
- 100% sync accuracy between Knowledge Lake and Notion
- Zero manual intervention required for queue management

---

## Metrics Dashboard (Bonus View)

Create a separate "Dashboard" view with the following formulas:

| Metric | Formula Property | Description |
|--------|------------------|-------------|
| **Total Conversations** | Rollup | Count of all items |
| **Pending Count** | Rollup | Count where Status = Pending |
| **Completed Count** | Rollup | Count where Status = Completed |
| **Average Duration** | Rollup | Average of Duration (minutes) |
| **Total Words Processed** | Rollup | Sum of Word Count where Extracted = true |
| **Total Learnings Extracted** | Rollup | Sum of Learning Count |
| **Avg Complexity** | Rollup | Average of Complexity Score |

---

## API Integration Code Examples

### Fetch Complex Conversations from Knowledge Lake
```python
import requests

def get_complex_conversations():
    response = requests.post(
        "https://knowledge-lake-api-production.up.railway.app/api/query",
        json={
            "userId": 1,
            "query": "",  # Empty query returns all
            "limit": 200
        }
    )

    conversations = response.json().get('results', [])

    # Filter for complex conversations not yet extracted
    complex_pending = [
        c for c in conversations
        if c.get('complexity_classification') == 'complex'
        and c.get('requires_multipass') == True
        and c.get('multipass_extracted') == False
    ]

    return complex_pending
```

### Create Notion Queue Item
```python
from notion_client import Client

notion = Client(auth="NOTION_API_TOKEN")

def create_queue_item(conversation):
    notion.pages.create(
        parent={"database_id": "MULTI_PASS_QUEUE_DB_ID"},
        properties={
            "Conversation Topic": {
                "title": [{"text": {"content": conversation['topic']}}]
            },
            "Conversation ID": {
                "number": conversation['id']
            },
            "Date": {
                "date": {"start": conversation['date']}
            },
            "Classification": {
                "select": {"name": "Complex"}
            },
            "Complexity Score": {
                "number": conversation.get('complexity_score', 0)
            },
            "Word Count": {
                "number": conversation.get('word_count', 0)
            },
            "Topic Shift Count": {
                "number": conversation.get('topic_shift_count', 0)
            },
            "Breakthrough Moments": {
                "number": conversation.get('breakthrough_moment_count', 0)
            },
            "Status": {
                "select": {"name": "Pending"}
            },
            "Priority": {
                "select": {"name": calculate_priority(conversation['complexity_score'])}
            },
            "Assigned Agent": {
                "select": {"name": "Auto"}
            },
            "Extracted": {
                "checkbox": False
            }
        }
    )

def calculate_priority(complexity_score):
    if complexity_score >= 80:
        return "High"
    elif complexity_score >= 60:
        return "Medium"
    else:
        return "Low"
```

### Update After Extraction Complete
```python
def update_extraction_complete(notion_page_id, extraction_results):
    notion.pages.update(
        page_id=notion_page_id,
        properties={
            "Status": {"select": {"name": "Completed"}},
            "Extracted": {"checkbox": True},
            "Thread Count": {"number": extraction_results['thread_count']},
            "Connection Count": {"number": extraction_results['connection_count']},
            "Learning Count": {"number": extraction_results['learning_count']},
            "Insight Count": {"number": extraction_results['insight_count']},
            "Extraction Completed": {"date": {"start": datetime.now().isoformat()}},
            "Extraction Report (MD)": {
                "url": extraction_results['md_report_url']
            },
            "Extraction Report (JSON)": {
                "url": extraction_results['json_report_url']
            }
        }
    )
```

---

## Success Criteria

- [ ] Notion database created with all 25+ properties
- [ ] 6 views configured (Pending, In Progress, Completed, By Priority, By Agent, High Complexity)
- [ ] 3 automation rules active
- [ ] Initial 7 complex conversations populated
- [ ] Bidirectional sync with Knowledge Lake working
- [ ] Agent assignment and status tracking functional
- [ ] Extraction metrics visible in Completed view
- [ ] Google Drive links accessible
- [ ] n8n webhook integration tested

---

*Schema Version: 1.0*
*Created: 2025-12-24*
*Complexity: 7 complex conversations to track initially*
*Integration Points: Knowledge Lake API, Google Drive, GitHub, n8n*

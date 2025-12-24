# Notion Multi-Pass Queue - Usage Guide

**Quick reference for managing the Notion Multi-Pass Extraction Queue**

---

## Prerequisites

### 1. Notion Database Setup
Create the database using [NOTION_MULTIPASS_QUEUE_SCHEMA.md](NOTION_MULTIPASS_QUEUE_SCHEMA.md)

### 2. Environment Variables
```bash
export NOTION_API_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxx"
export MULTIPASS_QUEUE_DB_ID="your-database-id-here"
```

**Finding your database ID:**
1. Open database in Notion
2. Click "..." → "Copy link"
3. Extract ID from URL: `notion.so/{workspace}/{DATABASE_ID}?v=...`

---

## Command Reference

### Populate Queue (Initial Setup)

**Dry run (preview without creating):**
```bash
python scripts/notion_queue_manager.py populate --dry-run
```

**Create queue items for all complex conversations:**
```bash
python scripts/notion_queue_manager.py populate
```

**Output:**
```
================================================================================
NOTION MULTI-PASS QUEUE POPULATION
================================================================================

🔍 Fetching complex conversations from Knowledge Lake...
✅ Found 169 total conversations
🔵 7 complex conversations pending extraction

📋 Found 7 conversations to add to queue

📝 Creating Notion pages...

[1/7] Processing: 2025-12-06 Hybrid Architecture Planning
  ID: 165, Complexity: 95.0, Words: 184,304
  ✅ Created: 2025-12-06 Hybrid Architecture Planning

[2/7] Processing: 2025-11-17 Knowledge Lake Implementation
  ID: 158, Complexity: 88.0, Words: 96,400
  ✅ Created: 2025-11-17 Knowledge Lake Implementation

...

================================================================================
POPULATION SUMMARY
================================================================================
Total conversations:   7
Pages created:         7
Skipped:               0
Failed:                0
================================================================================

✅ Successfully created 7 queue items
```

### Update Extraction Status

**Mark extraction as complete:**
```bash
python scripts/notion_queue_manager.py update 165 \
  --threads 74 \
  --connections 2301 \
  --learnings 123 \
  --insights 59 \
  --md-url "https://drive.google.com/file/d/xxx/2025-12-06-extraction.md" \
  --json-url "https://drive.google.com/file/d/xxx/2025-12-06-extraction.json" \
  --drive-url "https://drive.google.com/drive/folders/xxx"
```

**Minimal update (just mark as complete):**
```bash
python scripts/notion_queue_manager.py update 165
```

---

## Integration Workflows

### Initial Queue Population (One-Time)

```bash
# Step 1: Verify Knowledge Lake connection
curl -s https://knowledge-lake-api-production.up.railway.app/health

# Step 2: Preview what will be added
python scripts/notion_queue_manager.py populate --dry-run

# Step 3: Create queue items
python scripts/notion_queue_manager.py populate
```

### After Multi-Pass Extraction

When an extraction completes, update the Notion queue:

```bash
# Extract conversation
python scripts/multipass_extract.py conversations/file.md \
  --output extractions/report.md

# Parse results from JSON
THREADS=$(jq '.summary.total_threads' extractions/report.json)
CONNECTIONS=$(jq '.summary.total_connections' extractions/report.json)
LEARNINGS=$(jq '.summary.total_learnings' extractions/report.json)
INSIGHTS=$(jq '.summary.total_insights' extractions/report.json)
CONV_ID=$(jq '.metadata.conversation_id' extractions/report.json)

# Update Notion
python scripts/notion_queue_manager.py update $CONV_ID \
  --threads $THREADS \
  --connections $CONNECTIONS \
  --learnings $LEARNINGS \
  --insights $INSIGHTS \
  --md-url "https://drive.google.com/..." \
  --json-url "https://drive.google.com/..."
```

### Automated n8n Workflow

**Webhook Trigger:** New complex conversation ingested to Knowledge Lake

**n8n Workflow Steps:**
1. **Webhook** - Receive conversation data
2. **HTTP Request** - Run `notion_queue_manager.py populate`
3. **Notion** - Verify page created
4. **Slack/Discord** - Notify agent assigned to extraction

---

## Troubleshooting

### Error: NOTION_API_TOKEN not set

**Solution:**
```bash
export NOTION_API_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxx"
```

**Or pass directly:**
```bash
python scripts/notion_queue_manager.py populate \
  --token "secret_xxxxxxxxxxxxxxxxxxxxx" \
  --database-id "your-db-id"
```

### Error: No complex conversations found

**Cause:** All complex conversations already extracted

**Verify:**
```bash
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "query": "", "limit": 200}' | \
  jq '.results[] | select(.complexity_classification == "complex" and .multipass_extracted == false)'
```

### Error: Failed to create page

**Check Notion API token permissions:**
- Token must have "Insert content" capability
- Database must be shared with integration

**Verify token:**
```bash
curl -H "Authorization: Bearer $NOTION_API_TOKEN" \
     -H "Notion-Version: 2022-06-28" \
     https://api.notion.com/v1/users/me
```

### Error: Page already exists

**Solution:** Script automatically skips duplicates based on Conversation ID

---

## Current Status

### Conversations in Queue (As of 2025-12-24)

| ID | Topic | Complexity | Word Count | Status |
|----|-------|------------|------------|--------|
| 165 | 2025-12-06 Hybrid Architecture | 95.0 | 184,304 | ✅ Extracted |
| 158 | 2025-11-17 Knowledge Lake | 88.0 | 96,400 | ✅ Extracted |
| 160 | 2025-12-03 Knowledge Graph | 75.0 | 18,535 | ✅ Extracted |
| 156 | embed-AI-avatar-PWA | 72.0 | 5,988 | ✅ Extracted |
| 154 | hybrid-architecture-plan | 68.0 | 3,808 | ✅ Extracted |
| 152 | cc-task-multi-pass-system | 65.0 | 2,602 | ✅ Extracted |
| 151 | architecture-evolution | 85.0 | 10,672 | ✅ Extracted |

**Total:** 7 conversations
**Extracted:** 7 (100%)
**Pending:** 0

---

## Next Steps

### For New Complex Conversations

1. **Auto-Detection:** Classification script flags conversation as complex
2. **Auto-Ingestion:** Batch ingest adds to Knowledge Lake with `requires_multipass = true`
3. **Auto-Queue:** n8n webhook creates Notion queue item
4. **Agent Assignment:** Based on complexity score and current workload
5. **Extraction:** Agent runs multi-pass tool
6. **Update Queue:** Agent updates Notion with results
7. **Sync Knowledge Lake:** Webhook updates `multipass_extracted = true`

### Ongoing Maintenance

**Daily:** Check Pending Queue view in Notion
**Weekly:** Review completed extractions for quality
**Monthly:** Analyze metrics (avg duration, learnings per conversation, etc.)

---

## API Integration Examples

### Python Integration

```python
from scripts.notion_queue_manager import NotionQueueManager

# Initialize manager
manager = NotionQueueManager()

# Populate queue
stats = manager.populate_queue()
print(f"Created {stats['created']} queue items")

# Update after extraction
extraction_results = {
    'thread_count': 74,
    'connection_count': 2301,
    'learning_count': 123,
    'insight_count': 59
}

page_id = manager.find_page_by_conversation_id(165)
if page_id:
    manager.update_extraction_complete(
        page_id=page_id,
        extraction_results=extraction_results,
        md_report_url="https://drive.google.com/...",
        json_report_url="https://drive.google.com/..."
    )
```

### CLI Automation

```bash
#!/bin/bash
# auto_extract_and_update.sh

CONV_FILE=$1
CONV_ID=$2

# Run extraction
python scripts/multipass_extract.py "$CONV_FILE" \
  --output "extractions/$(basename $CONV_FILE)"

# Parse results
THREADS=$(jq '.summary.total_threads' "extractions/$(basename $CONV_FILE .md).json")
CONNECTIONS=$(jq '.summary.total_connections' "extractions/$(basename $CONV_FILE .md).json")
LEARNINGS=$(jq '.summary.total_learnings' "extractions/$(basename $CONV_FILE .md).json")
INSIGHTS=$(jq '.summary.total_insights' "extractions/$(basename $CONV_FILE .md).json")

# Update Notion
python scripts/notion_queue_manager.py update $CONV_ID \
  --threads $THREADS \
  --connections $CONNECTIONS \
  --learnings $LEARNINGS \
  --insights $INSIGHTS

echo "✅ Extraction complete and Notion updated for conversation $CONV_ID"
```

---

## Quick Commands Cheat Sheet

```bash
# Preview queue population
python scripts/notion_queue_manager.py populate --dry-run

# Populate queue
python scripts/notion_queue_manager.py populate

# Update extraction (full details)
python scripts/notion_queue_manager.py update 165 \
  --threads 74 --connections 2301 --learnings 123 --insights 59 \
  --md-url "URL" --json-url "URL" --drive-url "URL"

# Update extraction (minimal)
python scripts/notion_queue_manager.py update 165

# Check Knowledge Lake for pending extractions
curl -X POST https://knowledge-lake-api-production.up.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "query": "", "limit": 200}' | \
  jq '.results[] | select(.requires_multipass == true and .multipass_extracted == false)'
```

---

*Last Updated: 2025-12-24*
*Version: 1.0*
*Status: All 7 complex conversations extracted ✅*

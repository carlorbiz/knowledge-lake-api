# Batch Conversation Ingestion Guide

Ingest all existing Carla/CC conversations into Knowledge Lake with automatic classification.

---

## Quick Start

### Scan What You Have (Dry Run)

```bash
# Scan Claude conversations
python scripts/batch_ingest_conversations.py agent-conversations/claude --dry-run

# Scan all agent conversations
python scripts/batch_ingest_conversations.py agent-conversations --dry-run

# Scan archived exports
python scripts/batch_ingest_conversations.py conversations/exports/archive --dry-run

# Scan multiple directories at once
python scripts/batch_ingest_conversations.py agent-conversations conversations/exports/archive --dry-run
```

### Ingest Everything

```bash
# Ingest all conversations from agent-conversations folder
python scripts/batch_ingest_conversations.py agent-conversations

# Ingest with duplicate checking (default)
python scripts/batch_ingest_conversations.py agent-conversations --pattern "*.md"

# Force ingest even if duplicates exist
python scripts/batch_ingest_conversations.py agent-conversations --no-skip-duplicates
```

---

## Discovered Conversations

### agent-conversations/claude/ (10 files)
1. `2024-12-03-mtmot-unified-mcp-server.md`
2. `2025-12-22-architecture-evolution.md` (10,672 words - COMPLEX)
3. `2025-12-22-extraction-report.md`
4. `embed-AI-avatar-PWA-brainstorming.md`
5. `2025-12-20-aae-project-status-review.md`
6. `2025-12-22-hybrid-architecture-plan.md`
7. `aae-claude-gui-coordination-plan.md`
8. `cc-task-brief_deep-learning-extraction-system.md`
9. `cc-task_build-multi-pass-learning-extraction-system.md`
10. `learning-extraction-ecosystem_complete-vision.md`

### conversations/exports/archive/ (2 files)
1. `Claude_20251101.md`
2. `Gemini_CLI_20251101.md`

### agent-conversations/manus/ (1 file)
1. `knowledge-lake-google-drive-workflow.md`

**Total:** 13 conversations found (excluding READMEs)

---

## Features

### Automatic Classification
- Analyzes word count and topic shifts
- Flags complex conversations (>5k words, multiple topics)
- Sets `requires_multipass: true` for conversations needing deep extraction

### Duplicate Detection
- Checks if conversation already in Knowledge Lake
- Matches by topic + date
- Skips duplicates by default (use `--no-skip-duplicates` to override)

### Metadata Extraction
- **Topic:** Extracted from filename or first heading
- **Date:** Parsed from filename (YYYY-MM-DD) or file modification time
- **Agent:** Detected from path or content (claude_code, claude_gui, fred, jan, manus)
- **Classification:** Simple/Complex/Manual Review
- **Complexity Score:** 0-100
- **Word Count:** Total words in conversation

---

## Step-by-Step Ingestion

### Step 1: Scan to Preview

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
python scripts/batch_ingest_conversations.py agent-conversations --dry-run
```

**Output:**
```
📂 Scanning: agent-conversations
   Pattern: *.md
   Found: 13 conversation files

🔍 DRY RUN MODE - Showing what would be ingested:
1. 2025-12-22-architecture-evolution.md
   Topic: Architecture Evolution
   Date: 2025-12-22
   Agent: claude_code
...
```

### Step 2: Review List

Check that:
- Topics are correctly extracted
- Dates are accurate
- Agents are properly identified

### Step 3: Ingest

```bash
python scripts/batch_ingest_conversations.py agent-conversations
```

**The tool will:**
1. Scan all .md files
2. Check for duplicates
3. Classify each conversation
4. Ingest to Knowledge Lake with metadata
5. Flag complex conversations for multi-pass extraction

**Confirmation prompt:**
```
⚠️  This will ingest conversations to Knowledge Lake.
Continue? (yes/no):
```

Type `yes` to proceed.

### Step 4: Review Summary

```
================================================================================
INGESTION SUMMARY
================================================================================
Files scanned:     13
Already ingested:  1
Successfully added: 12
  - Simple:        9
  - Complex:       3 (flagged for multi-pass)
Failed:            0

⚠️  3 complex conversations detected
   These should be processed with multi-pass extraction tool:
   python scripts/multipass_extract.py <conversation.md>
================================================================================
```

---

## Advanced Usage

### Custom File Pattern

```bash
# Only .txt files
python scripts/batch_ingest_conversations.py conversations --pattern "*.txt"

# JSON conversation exports
python scripts/batch_ingest_conversations.py exports --pattern "*.json"
```

### Skip Classification (Faster)

```bash
# Skip classification for speed (won't detect complex conversations)
python scripts/batch_ingest_conversations.py agent-conversations --no-classify
```

### Force Re-Ingest

```bash
# Ingest even if conversation already exists (updates metadata)
python scripts/batch_ingest_conversations.py agent-conversations --no-skip-duplicates
```

---

## What Happens After Ingestion

### Simple Conversations (word_count < 5k, topic_shifts < 3)
- Ingested directly to Knowledge Lake
- Available for querying immediately
- Metadata: `requires_multipass: false`

### Complex Conversations (word_count >= 5k, topic_shifts >= 3)
- Ingested with `requires_multipass: true` flag
- Added to Notion Multi-Pass Queue (Day 3)
- Processed with multi-pass extraction tool
- Deep learnings extracted via Claude GUI/Manus

---

## Recommended Workflow

### Phase 1: Ingest All Existing Conversations (NOW)
```bash
# Ingest everything
python scripts/batch_ingest_conversations.py agent-conversations conversations/exports/archive
```

### Phase 2: Extract Complex Conversations (Day 3)
For conversations flagged as complex:

```bash
# Run multi-pass extraction
python scripts/multipass_extract.py agent-conversations/claude/2025-12-22-architecture-evolution.md --output extractions/architecture-evolution.md

# Save to Google Drive
cp extractions/architecture-evolution.md "C:/Users/carlo/Google Drive/FILE_MANIFEST - mem0 and CarlaAAE/multipass-extractions/"
```

### Phase 3: Ongoing Ingestion (Day 4)
- Auto-ingest new conversations at 25% context threshold
- Classification runs automatically
- Complex conversations delegated to Manus/Claude GUI

---

## Troubleshooting

### Issue: "No conversations found"
**Check:**
- Directory path is correct
- .md files exist in the directory
- Pattern matches your files (`--pattern "*.md"`)

### Issue: "Failed to ingest conversation"
**Possible causes:**
- Knowledge Lake API not accessible
- File encoding issues (non-UTF-8)
- Malformed metadata in file

**Fix:**
```bash
# Check API health
curl https://knowledge-lake-api-production.up.railway.app/health

# Check file encoding
file agent-conversations/claude/conversation.md
```

### Issue: All conversations marked as "already ingested"
**This means:**
- Conversations were previously added to Knowledge Lake
- Duplicate detection is working correctly

**To re-ingest:**
```bash
python scripts/batch_ingest_conversations.py agent-conversations --no-skip-duplicates
```

---

## Command Reference

### Required Arguments
- `directories` - One or more directories to scan

### Optional Flags
- `--pattern "*.md"` - File pattern to match (default: *.md)
- `--dry-run` - Preview what would be ingested without actually ingesting
- `--no-skip-duplicates` - Ingest even if conversation already exists
- `--no-classify` - Skip classification (faster but no multi-pass detection)

### Examples

```bash
# Dry run single directory
python scripts/batch_ingest_conversations.py agent-conversations/claude --dry-run

# Ingest multiple directories
python scripts/batch_ingest_conversations.py agent-conversations conversations/exports

# Custom pattern
python scripts/batch_ingest_conversations.py exports --pattern "*.txt"

# Force re-ingest without classification
python scripts/batch_ingest_conversations.py agent-conversations --no-skip-duplicates --no-classify
```

---

## Next Steps After Ingestion

1. **Query Knowledge Lake** - Verify conversations are accessible:
   ```bash
   python scripts/jan_query_knowledge_lake.py "architecture"
   ```

2. **Check Complex Conversations** - See which need multi-pass extraction:
   ```bash
   curl https://knowledge-lake-api-production.up.railway.app/api/query \
     -H "Content-Type: application/json" \
     -d '{"userId": 1, "query": "requires_multipass:true", "limit": 50}'
   ```

3. **Run Multi-Pass Extraction** - For flagged conversations:
   ```bash
   python scripts/multipass_extract.py <complex_conversation.md> --output extraction.md
   ```

4. **Build Notion Queue** (Day 3) - Track extraction status

---

## Integration with 4-Day Sprint

- **Day 1:** ✅ Classification algorithm + database migration
- **Day 2:** ✅ Multi-pass extraction tool
- **Day 2.5:** ⬅️ **BATCH INGEST EXISTING CONVERSATIONS** (YOU ARE HERE)
- **Day 3:** Notion queue + GUI integration
- **Day 4:** Automation + production deployment

---

*Created: 2025-12-23*
*Tool: `scripts/batch_ingest_conversations.py`*
*Status: Ready for immediate use*

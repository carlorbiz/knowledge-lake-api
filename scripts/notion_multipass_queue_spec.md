# Notion Multi-Pass Queue Database Specification

## Database Name
**Multi-Pass Extraction Queue**

## Purpose
Track complex conversations that require multi-pass learning extraction. Acts as a work queue for Claude GUI and Manus to monitor and process.

## Database Properties

### 1. Conversation ID (Number)
- **Type:** Number
- **Format:** Integer
- **Description:** Knowledge Lake conversation ID to process
- **Required:** Yes
- **Example:** 152

### 2. Source (Select)
- **Type:** Select
- **Options:**
  - claude_gui
  - claude_code
  - fred
  - gemini
  - jan
  - manus
  - colin
  - penny
  - pete
  - grok
  - notebooklm
  - callum
- **Description:** Which LLM council member created the conversation
- **Required:** Yes

### 3. Date Ingested (Date)
- **Type:** Date
- **Description:** When conversation was added to Knowledge Lake
- **Required:** Yes
- **Default:** Today

### 4. Word Count (Number)
- **Type:** Number
- **Format:** Integer
- **Description:** Total word count of conversation
- **Required:** Yes

### 5. Topic Shift Count (Number)
- **Type:** Number
- **Format:** Integer
- **Description:** Number of topic shifts detected by classification algorithm
- **Required:** Yes

### 6. Complexity Score (Number)
- **Type:** Number
- **Format:** Integer (0-100)
- **Description:** Calculated complexity score from classification algorithm
- **Required:** Yes

### 7. Classification (Select)
- **Type:** Select
- **Options:**
  - complex
  - manual_review
- **Description:** Classification result (only complex/manual_review added to queue)
- **Required:** Yes
- **Default:** complex

### 8. Status (Select)
- **Type:** Select
- **Options:**
  - queued (default)
  - in_progress
  - completed
  - skipped
  - blocked
- **Description:** Current processing status
- **Required:** Yes
- **Default:** queued

### 9. Assigned To (Select)
- **Type:** Select
- **Options:**
  - unassigned (default)
  - claude_gui
  - manus
- **Description:** Which agent is responsible for processing
- **Required:** Yes
- **Default:** unassigned

### 10. Priority (Select)
- **Type:** Select
- **Options:**
  - low
  - medium (default)
  - high
  - urgent
- **Description:** Processing priority
- **Required:** Yes
- **Default:** medium

### 11. Started Date (Date)
- **Type:** Date
- **Description:** When processing began (status changed to in_progress)
- **Required:** No

### 12. Completed Date (Date)
- **Type:** Date
- **Description:** When processing finished
- **Required:** No

### 13. Extraction Output URL (URL)
- **Type:** URL
- **Description:** Link to generated learning extraction markdown file (Google Drive)
- **Required:** No

### 14. Notion Learning Entry (Relation)
- **Type:** Relation
- **Related Database:** Learning Extractions (to be created)
- **Description:** Link to Learning Extraction entry created from this conversation
- **Required:** No

### 15. Notes (Rich Text)
- **Type:** Rich Text
- **Description:** Human annotations, processing notes, special instructions
- **Required:** No

### 16. Manual Flag (Checkbox)
- **Type:** Checkbox
- **Description:** Carla manually requested multi-pass for this conversation
- **Required:** No
- **Default:** False

### 17. Topics (Multi-select)
- **Type:** Multi-select
- **Options:** (Add as needed)
  - Knowledge Lake
  - Multi-Pass Extraction
  - Railway Deployment
  - Context Sync
  - Nera Launch
  - Architecture
  - Classification
  - n8n Workflows
  - Course Generation
  - VibeSdk
  - (Add more as patterns emerge)
- **Description:** Main topics covered in conversation
- **Required:** No

### 18. Breakthrough Moments (Number)
- **Type:** Number
- **Format:** Integer
- **Description:** Number of breakthrough moments detected
- **Required:** No

## Views

### 1. Queue Dashboard (Default View)
- **Type:** Table
- **Filter:** Status = "queued" OR Status = "in_progress"
- **Sort:**
  1. Priority (descending)
  2. Date Ingested (ascending - oldest first)
- **Properties Shown:**
  - Conversation ID
  - Source
  - Date Ingested
  - Status
  - Assigned To
  - Priority
  - Complexity Score
  - Word Count

### 2. Claude GUI Work Queue
- **Type:** Board (grouped by Status)
- **Filter:** Assigned To = "claude_gui"
- **Properties Shown:**
  - Conversation ID
  - Source
  - Date Ingested
  - Priority
  - Topics
  - Word Count

### 3. Manus Work Queue
- **Type:** Table
- **Filter:** Assigned To = "manus"
- **Sort:** Date Ingested (ascending)
- **Properties Shown:**
  - Conversation ID
  - Source
  - Date Ingested
  - Status
  - Complexity Score

### 4. Completed Extractions
- **Type:** Gallery
- **Filter:** Status = "completed"
- **Sort:** Completed Date (descending)
- **Properties Shown:**
  - Conversation ID
  - Source
  - Completed Date
  - Extraction Output URL
  - Topics

### 5. Manual Review Needed
- **Type:** Table
- **Filter:** Classification = "manual_review" AND Status = "queued"
- **Properties Shown:**
  - Conversation ID
  - Source
  - Complexity Score
  - Word Count
  - Topic Shift Count
  - Notes

## Initial Test Data

Create first entry manually to test:

```
Conversation ID: 152
Source: claude_code
Date Ingested: 2025-12-22
Word Count: 790
Topic Shift Count: 5
Complexity Score: 100
Classification: complex
Status: queued
Assigned To: claude_gui
Priority: high
Topics: Knowledge Lake, Multi-Pass Extraction, Hybrid Architecture, Nera Launch
Manual Flag: Yes
Notes: CC session about hybrid architecture plan. First test of multi-pass queue system.
```

## Integration Points

### Automated Entry Creation (n8n workflow)
```
Trigger: New conversation ingested to Knowledge Lake with requires_multipass = TRUE

Action:
1. Call classification API to get scores
2. Create entry in Multi-Pass Queue database
3. Assign to claude_gui if recent (<7 days old) OR priority = high
4. Assign to manus if old conversation or batch processing
5. Send notification (Pushover/email)
```

### Manual Entry (Carla can create anytime)
- Use Notion "New" button
- Fill in Conversation ID (required)
- Check "Manual Flag"
- Set Priority
- Add notes about why this needs multi-pass

## Success Criteria

Database is working when:
- ✅ Can create entries manually
- ✅ All required properties filled
- ✅ Views filter correctly
- ✅ Claude GUI can query for assigned work
- ✅ Status updates track correctly
- ✅ Completed extractions link to output files

## Next Steps

1. **Create database in Notion** (use this spec)
2. **Add test entry** (Conversation #152)
3. **Share database ID** with CC for integration
4. **Set up n8n workflow** for automated entry creation
5. **Test with real multi-pass extraction**

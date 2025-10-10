# PHOENIX SIMPLIFIED WORKFLOW - URGENT SETUP INSTRUCTIONS

## 🚀 IMMEDIATE STEPS TO DEPLOY

### 1. RESTART API SERVER
The new `/course-architect` endpoint has been added. You need to restart the Knowledge Lake API:

```bash
# Stop current servers (Ctrl+C on running terminals)
# Then restart:
cd "C:\Users\carlo\Development\mem0-sync\mem0" && python simple_api_server.py
```

### 2. TEST THE NEW ENDPOINT
```bash
curl -X POST http://localhost:5001/course-architect -H "Content-Type: application/json" -d "{\"course_concept\": \"Hand Hygiene Test\", \"audience_type\": \"Healthcare Clinical\", \"source_urls\": \"https://www.who.int/gpsc/clean_hands_protection/en/\"}"
```

### 3. CREATE N8N WORKFLOW

#### Required Nodes (in order):
1. **Google Sheets Trigger** → Form responses 1 (Course Requests)
2. **Set Initial Context** → Generate course_id, timestamp
3. **HTTP Request** → `/course-architect` endpoint
4. **HTTP Request** → DocsAutomator (Create Google Doc)
5. **Google Sheets Update** → Add doc link to Form responses 1
6. **Google Sheets Append** → Trigger Form responses 2 (Module Generation)
7. **HTTP Request** → Log to Knowledge Lake

#### Key Configuration Points:
- **Google Sheets Trigger**: Monitor columns A (Course Concept), B (Audience Type), C (Source URLs)
- **Course Architect Call**: Uses new `/course-architect` endpoint
- **Doc Creation**: Creates Google Doc with course recommendation
- **Sheet Updates**: Links doc URL back to original row
- **Module Trigger**: Populates Form responses 2 for next workflow

### 4. GOOGLE SHEETS STRUCTURE NEEDED

#### Form responses 1 (Course Requests):
- Column A: Course Concept
- Column B: Audience Type
- Column C: Source URLs
- Column D: Course ID (updated by workflow)
- Column E: Google Doc URL (updated by workflow)
- Column F: Status (updated by workflow)
- Column G: Knowledge Lake ID (updated by workflow)

#### Form responses 2 (Module Generation Triggers):
- Column A: Course ID
- Column B: Course Concept
- Column C: Audience Type
- Column D: Google Doc URL
- Column E: Knowledge Lake ID
- Column F: Trigger Timestamp
- Column G: Status

### 5. FILES CREATED
✅ `Phoenix_Simplified_Workflow_n8n.md` - Complete n8n workflow instructions
✅ `simple_api_server.py` - Added `/course-architect` endpoint
✅ Updated course architecture prompts to require 10-12 modules
✅ Research Foundation condensed to <5000 characters for NotebookLM

### 6. NEXT STEPS AFTER N8N SETUP
1. Create Module Generation workflow (triggered by Form responses 2)
2. Test complete end-to-end flow
3. Configure DocsAutomator API credentials
4. Set up error handling and notifications

## 🎯 THIS REMOVES ALL IF BRANCHING COMPLEXITY

The new simplified workflow:
**Form Response** → **Course Recommendation** → **Google Doc** → **Sheet Trigger** → **Knowledge Lake**

No more complex IF logic. Just a streamlined pipeline that always works the same way!

## 📋 READY FOR IMMEDIATE IMPLEMENTATION

All prompts upgraded, endpoints created, documentation complete. Just need to:
1. Restart API server
2. Build the 7-node n8n workflow
3. Test with a sample course request

**The Phoenix workflow is ready to fly! 🔥**
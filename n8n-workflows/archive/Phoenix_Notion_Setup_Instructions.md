# PHOENIX NOTION WORKFLOW - SETUP INSTRUCTIONS

## 🚀 IMMEDIATE IMPLEMENTATION STEPS

### 1. RESTART API SERVER WITH NEW ENDPOINT
The new `/course-architect-from-research` endpoint has been added for Notion integration:

```bash
# Stop current servers (Ctrl+C on running terminals)
# Then restart:
cd "C:\Users\carlo\Development\mem0-sync\mem0" && python simple_api_server.py
```

### 2. TEST NEW NOTION ENDPOINT
```bash
curl -X POST http://localhost:5001/course-architect-from-research -H "Content-Type: application/json" -d "{\"course_concept\": \"Advanced Wound Care Management\", \"audience_type\": \"Healthcare Clinical\", \"source_urls\": \"https://www.wounds.org.au/professional-development/\", \"research_file_url\": \"https://notion-file-url.com/research.pdf\", \"research_file_name\": \"wound_care_research_foundation.pdf\"}"
```

### 3. CREATE NOTION DATABASE

#### Database Name: "Phoenix Course Requests"

#### Required Properties:
1. **Course Concept** (Title) - Main course topic
2. **Audience Type** (Select) - Options: Healthcare Clinical, Operational Staff, Management, Leadership
3. **Source URLs** (URL) - Reference materials
4. **Research Foundation** (Files & Media) - Upload PDF/document files
5. **Status** (Status) - Options: New Request, Processing, Course Generated, Complete, Error
6. **Course ID** (Text) - Auto-populated by workflow
7. **Google Doc URL** (URL) - Generated course recommendation document
8. **Knowledge Lake ID** (Text) - Reference for stored course data
9. **Generated Date** (Created time) - Timestamp
10. **Processing Notes** (Rich text) - AI analysis results

#### Database Template:
```
Course Concept: [Enter course topic]
Audience Type: [Select from dropdown]
Source URLs: [Paste reference links]
Research Foundation: [Upload PDF files]
Status: New Request
```

### 4. CONFIGURE N8N NOTION INTEGRATION

#### Required Setup:
1. **Notion MCP Integration** (already installed)
2. **Workspace Access** - Share Phoenix Course Requests database with n8n
3. **API Permissions** - Read/Write access to database properties
4. **Webhook Configuration** - Enable "On app event" triggers

#### n8n Workflow Creation:
Follow the 9-node structure in `Phoenix_Notion_Workflow_n8n.md`:

1. **Notion App Event Trigger** → Monitor Phoenix Course Requests database
2. **Set Initial Context** → Process Notion page data
3. **Update Notion Status** → Set to "Processing"
4. **AI Document Analysis** → (If research foundation uploaded)
5. **Course Recommendation Generation** → (If no research foundation)
6. **Create Google Doc** → Generate course recommendation document
7. **Update Notion with Results** → Set status to "Course Generated"
8. **Trigger Google Sheets** → Populate Module Generation triggers
9. **Log to Knowledge Lake** → Store course architecture

### 5. GOOGLE SHEETS INTEGRATION

#### Required Sheets Structure:
- **Form responses 2 (Module Generation Triggers)**
  - Column A: Course ID
  - Column B: Course Concept
  - Column C: Audience Type
  - Column D: Google Doc URL
  - Column E: Knowledge Lake ID
  - Column F: Notion Page ID
  - Column G: Research Source (User-provided/AI-generated)
  - Column H: Trigger Timestamp
  - Column I: Status

### 6. DOSAUTOMATOR CONFIGURATION

#### Required Setup:
1. **API Credentials** - Configure DocsAutomator access token in n8n
2. **Document Template** - Create "course_recommendation_template"
3. **Template Fields**:
   - course_concept
   - audience_type
   - course_architecture
   - generation_date
   - course_id
   - research_source

---

## ✅ ADVANTAGES OF NOTION INTEGRATION

### User Experience Benefits:
1. **Native File Support** - Drag-and-drop PDF uploads
2. **Real-time Collaboration** - Multiple users can contribute
3. **Mobile Access** - Upload research from any device
4. **Version Control** - Track document changes and updates
5. **Rich Metadata** - Structured data extraction from properties
6. **Status Tracking** - Visual progress indicators

### Technical Benefits:
1. **Reliable Triggers** - "On app event" provides immediate activation
2. **MCP Integration** - Already installed and configured in n8n
3. **Error Handling** - Notion status updates provide clear feedback
4. **Scalability** - Handles multiple concurrent requests
5. **Audit Trail** - Complete workflow history in Notion

---

## 🎯 WORKFLOW OPERATION

### For Users WITH Research Foundation:
1. **Upload** - Drag PDF research foundation to Notion database
2. **Fill Form** - Complete Course Concept, Audience Type, Source URLs
3. **Submit** - Change status to "New Request"
4. **AI Analysis** - Workflow extracts content from uploaded research
5. **Course Generation** - Creates architecture based on research foundation
6. **Document Creation** - Generates Google Doc with course recommendation
7. **Status Update** - Notion shows "Course Generated" with document link

### For Users WITHOUT Research Foundation:
1. **Fill Form** - Complete Course Concept, Audience Type, Source URLs only
2. **Submit** - Change status to "New Request"
3. **Research Generation** - Workflow calls Perplexity for comprehensive research
4. **Course Generation** - Creates architecture based on AI research
5. **Document Creation** - Generates Google Doc with course recommendation
6. **Status Update** - Notion shows "Course Generated" with document link

---

## 🔧 TESTING SEQUENCE

### 1. Test Notion Database:
- Create test entries with and without research foundations
- Verify property configurations and data extraction
- Test file upload functionality

### 2. Test n8n Integration:
- Activate workflow with test Notion entries
- Monitor node execution and data flow
- Verify error handling and status updates

### 3. Test API Endpoints:
- Confirm `/course-architect-from-research` functionality
- Test standard `/course-architect` endpoint
- Validate Knowledge Lake storage

### 4. Test End-to-End Flow:
- Upload research foundation → Generate course → Create document → Update status
- No research foundation → AI research → Generate course → Create document → Update status

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] API server restarted with new endpoint
- [ ] Notion workspace access configured
- [ ] Phoenix Course Requests database created with all properties
- [ ] n8n Notion integration permissions set
- [ ] 9-node workflow built and tested
- [ ] DocsAutomator API credentials configured
- [ ] Google Sheets integration active
- [ ] Knowledge Lake storage verified
- [ ] Error handling tested
- [ ] User documentation provided

---

## 🚀 READY FOR IMMEDIATE DEPLOYMENT

The Notion-based Phoenix workflow eliminates Dropbox integration complexity while providing:
- **Superior user experience** with native file uploads
- **Reliable trigger mechanism** using Notion app events
- **Enhanced collaboration** through shared workspace
- **Better error handling** with visual status tracking
- **Mobile accessibility** for research foundation uploads
- **Complete audit trail** of course generation process

**The Phoenix Notion workflow is ready to deploy! ✨**
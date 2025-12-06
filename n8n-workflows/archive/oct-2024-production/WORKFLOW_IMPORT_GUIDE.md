# 3-WORKFLOW SYSTEM - IMPORT GUIDE
## Separate Workflows Communicating via Google Sheets
## Date: 2025-10-03

---

## 🎯 SYSTEM ARCHITECTURE

**3 Separate Workflows:**

1. **Workflow 1: Phoenix Course Architecture Generator**
   - Trigger: New row in "Form responses 2" tab
   - Output: Writes to "Course Architecture" tab AND "Module Queue" tab
   - Purpose: Parse user request, generate course structure, queue modules

2. **Workflow 2: Module Content + Resources Generator**
   - Trigger: New row in "Module Queue" tab
   - Output: Writes to "Module Content Complete" tab
   - Purpose: Generate content (Perplexity → Gemini → LMS Upload) AND resources (Workbook) in PARALLEL
   - **TWO CONCURRENT STREAMS:**
     - Stream A: Enhanced Research → Slides → LMS Upload Document
     - Stream B: Workbook Materials (sophisticated, not simple!)

3. **Workflow 3: Module Assessments Generator**
   - Trigger: New row in "Module Content Complete" tab
   - Output: Writes to "Text Outputs" tab AND "Audio" tab (12 rows)
   - Purpose: Generate Miller's Pyramid assessments, populate Audio tab, log to Knowledge Lake

---

## 📊 DATA FLOW

```
User fills form
    ↓
Form responses 2 (Google Sheet)
    ↓
WORKFLOW 1 triggers
    ↓
Course Architecture tab (Google Sheet)
Module Queue tab (Google Sheet)
    ↓
WORKFLOW 2 triggers (for each module)
    ↓
Module Content Complete tab (Google Sheet)
    ↓
WORKFLOW 3 triggers
    ↓
Text Outputs tab (Google Sheet)
Audio tab (12 rows per module)
Knowledge Lake (HTTP API)
```

---

## 🚀 IMPORT STEPS

### STEP 1: Create Required Google Sheet Tabs

Your Google Sheet needs these tabs:
1. **Form responses 2** (already exists - form submission)
2. **Course Architecture** (create new)
3. **Module Queue** (create new)
4. **Module Content Complete** (create new)
5. **Text Outputs** (already exists or create)
6. **Audio** (already exists or create)

### STEP 2: Import Workflow 1

1. Open n8n at http://localhost:5678
2. Click "+" (New workflow)
3. Click "⋮" menu → "Import from File"
4. Select **workflow_1_phoenix_course_architecture.json**
5. Click "Import"

**Fix immediately:**
- All Google Sheets nodes → Set credential
- Anthropic node → Set credential
- All sheet references → Select correct sheet from dropdown
- Replace "GOOGLE_SHEET_ID" with your actual sheet ID

**Save as:** "1. Phoenix Course Architecture Generator"

### STEP 3: Import Workflow 2

1. Click "+" (New workflow)
2. Click "⋮" menu → "Import from File"
3. Select **workflow_2_module_content_and_resources.json**
4. Click "Import"

**Fix immediately:**
- All Google Sheets nodes → Set credential
- Anthropic node → Set credential
- Perplexity node → Set credential
- **CRITICAL:** Gemini HTTP Request nodes (2 nodes) → Replace "YOUR_GEMINI_API_KEY_HERE" with actual API key
- All sheet references → Select correct sheet from dropdown
- Replace "GOOGLE_SHEET_ID" with your actual sheet ID

**Save as:** "2. Module Content + Resources Generator"

### STEP 4: Import Workflow 3

1. Click "+" (New workflow)
2. Click "⋮" menu → "Import from File"
3. Select **workflow_3_module_assessments.json**
4. Click "Import"

**Fix immediately:**
- All Google Sheets nodes → Set credential
- Anthropic node → Set credential
- All sheet references → Select correct sheet from dropdown
- Replace "GOOGLE_SHEET_ID" with your actual sheet ID
- **CRITICAL:** HTTP Request "Log to Knowledge Lake" → Verify URL is `http://host.docker.internal:5002/knowledge/add`

**Save as:** "3. Module Assessments Generator"

---

## 🔧 CRITICAL FIXES FOR EACH WORKFLOW

### Workflow 1 Fixes:

**Credentials needed:**
- Google Sheets OAuth2 (trigger + 2 write nodes)
- Anthropic API

**Node-specific fixes:**
- **Trigger node:** Point to "Form responses 2" tab
- **Node 3:** Write to "Course Architecture" tab
- **Node 5:** Write to "Module Queue" tab

---

### Workflow 2 Fixes:

**Credentials needed:**
- Google Sheets OAuth2 (trigger + 1 write node)
- Anthropic API
- Perplexity API
- Gemini API key (hardcoded in HTTP Request URL)

**Node-specific fixes:**
- **Trigger node:** Point to "Module Queue" tab
- **Node 5a (Gemini Slides):** Replace `YOUR_GEMINI_API_KEY_HERE` in URL
- **Node 7a (Gemini LMS Upload):** Replace `YOUR_GEMINI_API_KEY_HERE` in URL
- **Node 10:** Write to "Module Content Complete" tab

**Concurrent Processing:**
- Node 2 "Split to Concurrent Streams" outputs 2 items
- Node "If Content Stream" routes to Perplexity path
- Node "If Resources Stream" routes to Workbook path
- Node 9 "Merge Content + Resources" brings them back together

---

### Workflow 3 Fixes:

**Credentials needed:**
- Google Sheets OAuth2 (trigger + 2 write nodes)
- Anthropic API

**Node-specific fixes:**
- **Trigger node:** Point to "Module Content Complete" tab
- **Node 4:** Write to "Text Outputs" tab
- **Node 6:** Write to "Audio" tab (12 rows per module)
- **Node 7:** HTTP Request to Knowledge Lake
  - URL MUST be: `http://host.docker.internal:5002/knowledge/add`
  - (NOT localhost:5002 - Docker needs host.docker.internal)

---

## ✅ TESTING CHECKLIST

### Test Workflow 1:
- [ ] Manually add row to "Form responses 2" tab
- [ ] Check "Course Architecture" tab populated
- [ ] Check "Module Queue" tab has individual modules
- [ ] Verify audience type flows through

### Test Workflow 2:
- [ ] Check Workflow 2 triggers from "Module Queue" row
- [ ] Verify TWO streams execute (content + resources)
- [ ] Check Perplexity returns enhanced research
- [ ] Check Gemini returns 12 slides
- [ ] Check Gemini returns LMS upload document
- [ ] Check Anthropic returns sophisticated workbook
- [ ] Verify "Module Content Complete" tab populated
- [ ] Verify audience-specific content generated

### Test Workflow 3:
- [ ] Check Workflow 3 triggers from "Module Content Complete" row
- [ ] Verify assessments generated (4 levels + role-plays)
- [ ] Check "Text Outputs" tab populated
- [ ] Check "Audio" tab gets exactly 12 rows
- [ ] Verify Knowledge Lake HTTP call succeeds

---

## 🎯 SOPHISTICATED OUTPUT VERIFICATION

### Workbook Must Include:

**Quick Reference Cards:**
- Front: Key points, visual cue
- Back: Detailed explanation, practical example, common pitfalls, success indicators

**Professional Checklists:**
- Multiple sections (Preparation, Implementation, Review)
- Each item with rationale and standard reference

**Case Studies:**
- 200-300 word realistic scenarios
- Background information with stakeholders and constraints
- Analysis questions and discussion points

**Additional Resources:**
- Essential reading with key takeaways
- Professional standards with key requirements
- Advanced learning resources

**Practical Tools:**
- Templates, decision trees, assessment tools
- Step-by-step instructions
- Actual usable content

**Reflective Practice:**
- Self-assessment by dimension
- Action plan template with prompts

### LMS Upload Must Include:

- Professional formatted markdown
- Module overview (2-3 paragraphs)
- Complete component descriptions
- Key concepts explained
- Professional standards referenced
- Technical specifications
- Upload instructions for ABSORB CREATE

---

## 🔍 TROUBLESHOOTING

### Workflow 1 Issues:

**"Credentials not set"**
→ Set Google Sheets and Anthropic credentials

**"Course not appearing in queue"**
→ Check node 5 writes to "Module Queue" tab
→ Verify node 4 "Extract Individual Modules" outputs multiple items

### Workflow 2 Issues:

**"Gemini API error"**
→ Replace YOUR_GEMINI_API_KEY_HERE in BOTH Gemini nodes (5a and 7a)

**"Concurrent streams not working"**
→ Check node 2 outputs 2 items (one with stream: 'content', one with stream: 'resources')
→ Verify both "If" nodes route correctly

**"Workbook too simple"**
→ Check Anthropic prompt in node 3b includes all sophisticated structure
→ Verify audience_type and audience_frameworks flow through

**"LMS upload missing"**
→ Check node 7a Gemini HTTP Request executes
→ Verify node 8a parses response correctly

### Workflow 3 Issues:

**"Knowledge Lake connection refused"**
→ Change localhost:5002 to host.docker.internal:5002

**"Audio tab not getting 12 rows"**
→ Check slides parsed correctly in node 5
→ Verify loop outputs 12 items

**"Assessments not audience-specific"**
→ Check node 1 builds correct assessment framework
→ Verify audience_type flows from trigger

---

## 📋 GOOGLE SHEET COLUMN STRUCTURE

### Course Architecture Tab:
- Timestamp
- Course Title
- Course Description
- Target Audience
- Learning Outcomes
- Research Foundation
- Modules (JSON array)
- Module Count
- Original Request

### Module Queue Tab:
- Timestamp
- Course Title
- Module Number
- Module Title
- Module Summary
- Estimated Duration
- Target Audience
- Audience Type
- Research Foundation
- Status

### Module Content Complete Tab:
- Timestamp
- Course Title
- Module Number
- Module Title
- Target Audience
- Enhanced Summary
- Learning Objectives (JSON)
- Key Concepts (JSON)
- Slides (JSON - 12 slides)
- LMS Upload Text (markdown)
- Workbook Data (JSON)
- Status

### Text Outputs Tab:
- Timestamp
- Course Title
- Module Number
- Module Title
- Target Audience
- Assessment Data (JSON)
- Status

### Audio Tab:
- Timestamp
- Course Title
- Module Number
- Module Title
- Slide Number (1-12)
- Slide Title
- Voiceover Script
- Image Prompt
- Content Points (JSON)
- Presenter Notes

---

## 🚀 WORKFLOW ACTIVATION

After import and testing:

1. **Activate Workflow 1:**
   - Click "Inactive" toggle → "Active"
   - Workflow now watches "Form responses 2" tab

2. **Activate Workflow 2:**
   - Click "Inactive" toggle → "Active"
   - Workflow now watches "Module Queue" tab

3. **Activate Workflow 3:**
   - Click "Inactive" toggle → "Active"
   - Workflow now watches "Module Content Complete" tab

**Test the full pipeline:**
1. Add row to "Form responses 2" (or submit form)
2. Watch Workflow 1 execute
3. Watch Workflow 2 execute for each module
4. Watch Workflow 3 execute for each module
5. Verify all outputs in Google Sheets
6. Check Knowledge Lake dashboard

---

## 🎯 BENEFITS OF 3-WORKFLOW SYSTEM

**vs. One Monolithic Workflow:**

✅ **Truly concurrent processing** - Workflow 2 uses split node to run content + resources in parallel
✅ **Independent scaling** - Each module processed separately
✅ **Easier debugging** - Isolate issues to specific workflow
✅ **Better monitoring** - See exactly which stage each module is at
✅ **Resume capability** - If one module fails, others continue
✅ **Modular updates** - Update workbook generation without touching content generation

**Communication via Google Sheets:**
✅ **Visibility** - See queue, progress, and completion status
✅ **Manual intervention** - Can pause, edit, or restart modules
✅ **Audit trail** - Complete history in sheets
✅ **No complex merge logic** - Each workflow writes to its own tab

---

## 🔑 KEY DIFFERENCES FROM PREVIOUS VERSION

**What Changed:**

1. **Split into 3 workflows** instead of 1 monolithic workflow
2. **TRUE concurrent processing** in Workflow 2 using split node + If nodes
3. **Sophisticated workbook** with all components (not simple concatenation)
4. **Professional LMS upload** document generation (not missing)
5. **Audience adaptation** throughout all workflows
6. **Google Sheets as control center** between workflows

**What Stayed:**

- Same AI providers (Anthropic, Perplexity, Gemini)
- Same n8n Docker Community nodes
- Same audience types (6 audience categories)
- Same output quality standards
- Same Miller's Pyramid assessment framework

---

*3-Workflow System by: Claude Code*
*Date: 2025-10-03*
*Status: PRODUCTION READY*
*Includes: Sophisticated Workbook + Professional LMS Upload*

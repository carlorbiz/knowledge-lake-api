# HYBRID WORKFLOW ARCHITECTURE SPECIFICATION
## Knowledge Lake + Google Sheets + n8n Integration

### OVERVIEW
Transform course generation from monolithic API to user-controlled hybrid workflow with Google Sheets as the central control interface and Google Docs as accessible output storage.

---

## GOOGLE SHEETS STRUCTURE: "Concept to Course Requests"

### TAB 1: Form Responses 1 (A1 start)
```
A: Timestamp
B: Course Concept
C: Source URLs
D: Audience Type
E: Voice Selection
F: User Email
G: User Name
H: Research Foundation (NEW - User uploaded research link)
```

**WORKFLOW LOGIC:**
- If Column H (Research Foundation) is NOT empty → Skip Perplexity research, use user foundation
- If Column H is empty → Trigger Perplexity research via Knowledge Lake

### TAB 2: Text Outputs (A1 start)
```
A: Content For
B: Research Foundation (Google Doc link)
C: Course Recommendation (Google Doc link)
D: Learning Objectives (Google Doc link)
E: Key Concepts (Google Doc link)
F: Module Summary (Google Doc link)
G: Slide Specifications (Google Doc link)
H: Workbook & Extra Materials (Google Doc link)
I: LMS Upload (Google Doc link)
```

**ROWS 1-13:**
- Row 1: Headers
- Row 2: Course (overall course documents)
- Rows 3-14: Module 1-12 (individual module documents)

### TAB 3: Audio (A1 start)
**36 Columns across 12 modules × 3 columns per module:**
```
A: Slide #
B-D: Module 1 (Parsed Slides | Voiceover Scripts | Audio File)
E-G: Module 2 (Parsed Slides | Voiceover Scripts | Audio File)
...continues for 12 modules
```

**12 ROWS for slides 1-12 per module**

**TRIGGER LOGIC:** When Slide Specifications and Voiceover Scripts are populated → Trigger n8n audio generation workflow

### TAB 4: Interactive (A1 start)
```
A: Module #
B: Assessments (Google Doc link)
C: Role Plays (Google Doc link)
```

**ROWS 1-13:**
- Row 1: Headers
- Rows 2-13: Module 1-12

---

## KNOWLEDGE LAKE ARCHITECTURE CHANGES

### PHASE 1: REMOVE AUDIO INTEGRATION
- Remove Google Apps Script calls from main workflow
- Remove audio generation from course delivery endpoint
- Focus purely on content generation → Google Docs creation

### PHASE 2: GOOGLE DOCS OUTPUT INTEGRATION
**New Function: `create_course_google_docs(course_data, course_id)`**

**Documents to Create:**
1. **Research Foundation Doc** - Audience analysis + source research
2. **Course Architecture Doc** - Complete course structure
3. **Learning Objectives Doc** - Structured learning outcomes per module
4. **Key Concepts Doc** - Core concepts breakdown per module
5. **Module Summary Docs** (×12) - Individual module detailed content
6. **Slide Specifications Docs** (×12) - Slide-by-slide specifications
7. **Workbook Materials Doc** - Premium workbook content
8. **LMS Upload Doc** - Course packaging for LMS deployment
9. **Assessment Specs Docs** (×12) - iSpring assessment specifications
10. **Role Play Docs** (×12) - Interactive scenario scripts

### PHASE 3: GOOGLE SHEETS INTEGRATION
**New Function: `populate_google_sheets(course_data, doc_links, sheet_id)`**

**Actions:**
1. Create new row in "Text Outputs" tab
2. Populate Google Doc links for course and all modules
3. Parse slide specifications into "Audio" tab structure
4. Generate voiceover scripts and populate "Audio" tab
5. Populate "Interactive" tab with assessment/roleplay links

---

## HYBRID WORKFLOW TRIGGERS

### TRIGGER 1: Course Generation (Knowledge Lake)
**Source:** New row in "Form Responses 1" tab
**Condition:** Any new timestamp
**Action:**
- Generate all course content via Knowledge Lake
- Create Google Docs for all outputs
- Populate "Text Outputs" and "Interactive" tabs
- Prepare "Audio" tab with slide specs and scripts

### TRIGGER 2: Audio Generation (n8n)
**Source:** "Audio" tab populated with slide specs + scripts
**Condition:** Parsed Slides AND Voiceover Scripts columns filled
**Action:**
- n8n workflow picks up slide specifications
- Generates audio files via Google Apps Script
- Updates "Audio" tab with .wav file links

### TRIGGER 3: User Research Override
**Source:** "Form Responses 1" tab, Column H filled
**Condition:** Research Foundation link provided by user
**Action:**
- Skip Perplexity research step
- Use user-provided research foundation
- Continue with course generation using user content

---

## IMPLEMENTATION ROADMAP

### IMMEDIATE (Phase 1)
1. ✅ Remove audio from Knowledge Lake workflow
2. ✅ Create Google Docs integration functions
3. ✅ Test course generation → Google Docs output
4. ✅ Validate all 8 critical output types created as accessible docs

### SHORT-TERM (Phase 2)
1. Create Google Sheets API integration
2. Build sheet population functions
3. Test hybrid trigger between Knowledge Lake → Google Sheets
4. Create n8n workflow for audio generation from sheets

### MEDIUM-TERM (Phase 3)
1. Implement user research foundation override logic
2. Create slide specification parsing for audio workflow
3. Test complete hybrid: User input → Course docs → Audio generation
4. Add Vertex AI Google Workspace search integration

---

## BENEFITS OF HYBRID APPROACH

### USER CONTROL
- ✅ Visible progress tracking via Google Sheets
- ✅ Editable Google Docs for all outputs
- ✅ Granular control over audio generation
- ✅ User research integration capability

### SYSTEM RELIABILITY
- ✅ Decoupled audio generation prevents main workflow failures
- ✅ Individual component debugging and optimization
- ✅ Scalable architecture for future enhancements
- ✅ Clear separation of AI generation vs. user interaction

### ORGANIZATIONAL INTEGRATION
- ✅ Google Workspace native integration
- ✅ Shareable, collaborative documents
- ✅ Future Vertex AI search of organizational content
- ✅ Familiar interface for end users

This hybrid architecture transforms the Phoenix Generator from a black-box automation into a transparent, user-controlled, professional course development platform.
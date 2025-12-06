# MODULE GENERATOR - FIXED ARCHITECTURE
## Two Concurrent Streams + Module-by-Module Processing
## Date: 2025-10-02

---

## 🎯 DESIGN GOALS

### Problems We're Fixing:
1. ❌ **Truncation** - Processing all modules at once causes API limits
2. ❌ **Perplexity <think> tags** - Cluttering outputs and breaking parsing
3. ❌ **No Google Sheets population** - Can't see results or trigger audio
4. ❌ **Missing concurrent processing** - Not using Gemini + Anthropic optimally

### Solutions:
1. ✅ **Module-by-module loop** - Process 1 module at a time through full pipeline
2. ✅ **Clean prompts** - Strip <think> tags and parse JSON properly
3. ✅ **Sheets population** - Write to Text Outputs + Audio tabs after each module
4. ✅ **2 concurrent streams** - Split content generation vs assessments

---

## 📊 WORKFLOW ARCHITECTURE

```
Google Sheets Trigger (Text Outputs Row 2 - Course Recommendation Added)
    ↓
Parse Course Recommendation (Extract 10-12 modules)
    ↓
LOOP: For Each Module (1-12)
    ↓
    ├─────────────────────────────────────────────────┐
    ↓                                                 ↓
STREAM 1: Content & Slides                    STREAM 2: Assessments & Resources
    ↓                                                 ↓
1. Enhanced Research (Perplexity)              1. Generate Assessments (Anthropic)
   - Clean <think> tags                           - Miller's Pyramid levels
   - Parse JSON properly                          - Knowledge → Action
    ↓                                                 ↓
2. Extract Enhanced Data                        2. Generate Role Plays (Anthropic)
   - Learning objectives                           - 3 scenarios per module
   - Key concepts                                  - Australian context
   - Content areas                                   ↓
    ↓                                             3. Generate Workbooks (Anthropic)
3. Generate Slides (Gemini)                        - Extra reading
   - EXACTLY 12 slides                             - Checklists
   - Voiceover scripts                             - Templates
   - Image prompts (NO TEXT)                          ↓
   - Presenter notes                            MERGE POINT
    ↓                                                 ↓
4. Generate LMS Upload (Gemini)                     ↓
   - ABSORB CREATE format                           ↓
   - SCORM compliance                               ↓
    ↓                                                 ↓
    └─────────────────────────────────────────────────┘
                            ↓
                    Merge Stream Results
                            ↓
                    Parse 12 Slides for Audio Tab
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
    Populate Text Outputs Tab        Populate Audio Tab
    (Module row 3-14)                (12 rows per module)
            ↓                               ↓
    Store in Knowledge Lake         Trigger Audio Generation
            ↓
    LOOP NEXT MODULE
```

---

## 🔧 NODE IMPLEMENTATION

### NODE 1: Google Sheets Trigger
```javascript
Trigger: Google Sheets
Sheet: "Text Outputs"
Tab: "Text Outputs"
Event: Row Added to Row 2 (Course level)
Column to Monitor: "Course Recommendation"
```

**What this triggers on:**
Phoenix workflow populates Row 2 with course recommendation → This workflow starts

---

### NODE 2: Parse Course Recommendation (Code)
```javascript
// Extract modules from course recommendation
const courseRec = $json["Course Recommendation"];

// Parse the recommendation to extract modules
const modulePattern = /Module (\d+):\s*([^\n]+)/g;
const modules = [];
let match;

while ((match = modulePattern.exec(courseRec)) !== null) {
  modules.push({
    json: {
      module_number: parseInt(match[1]),
      module_title: match[2].trim(),
      course_recommendation: courseRec,
      course_concept: $json["Content For"],
      research_foundation: $json["Research Foundation"]
    },
    pairedItem: 0
  });
}

return modules;
```

**Output:** Array of 10-12 module objects, each ready for individual processing

---

### NODE 3: Loop Through Modules (Split in Batches)
```
Node Type: Split in Batches
Batch Size: 1
Reset: After workflow completes
```

**This ensures:** One module processes fully through both streams before next module starts

---

### STREAM 1 NODES:

### NODE 4: Enhanced Research (Perplexity)
```javascript
Model: sonar
Max Tokens: 8000
Temperature: 0.7

Prompt:
You are an expert Australian healthcare education researcher.

CONTEXT:
Course: {{ $json.course_concept }}
Module: {{ $json.module_title }}
Research Foundation: {{ $json.research_foundation }}

TASK:
Conduct deep research on "{{ $json.module_title }}" for Australian healthcare professionals.

OUTPUT REQUIREMENTS:
Provide ONLY valid JSON with NO <think> tags, NO markdown, NO explanations.

{
  "moduleNumber": {{ $json.module_number }},
  "moduleTitle": "{{ $json.module_title }}",
  "enhancedSummary": "350-400 word evidence-based summary",
  "learningObjectives": [
    "Objective 1 with measurable outcome",
    "Objective 2 with measurable outcome",
    "Objective 3 with measurable outcome",
    "Objective 4 with measurable outcome"
  ],
  "keyConcepts": [
    "Evidence-based concept 1",
    "Evidence-based concept 2",
    "Evidence-based concept 3",
    "Evidence-based concept 4"
  ],
  "enhancedContentAreas": [
    "Content area 1 with depth",
    "Content area 2 with depth",
    "Content area 3 with depth"
  ],
  "visualOpportunities": [
    "Slide-appropriate visual 1",
    "Slide-appropriate visual 2"
  ],
  "citations": [
    "Citation 1 (Vancouver style)",
    "Citation 2 (Vancouver style)"
  ]
}

CRITICAL: Return ONLY the JSON object. No additional text.
```

---

### NODE 5: Clean Perplexity Response (Code)
```javascript
// Get raw response
let rawResponse = $json.choices[0].message.content;

// CRITICAL: Strip all <think> tags and their content
rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/g, '');

// Remove markdown code blocks
rawResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

// Trim whitespace
rawResponse = rawResponse.trim();

// Parse JSON
let enhanced;
try {
  enhanced = JSON.parse(rawResponse);
} catch (error) {
  return [{
    json: {
      error: 'JSON Parse Error',
      raw_response: rawResponse,
      module_number: $json.module_number
    }
  }];
}

// Return clean data
return [{
  json: {
    ...enhanced,
    module_number: $json.module_number,
    module_title: $json.module_title,
    course_concept: $json.course_concept
  }
}];
```

---

### NODE 6: Generate Slides (Gemini 2.0 Flash)
```javascript
Model: gemini-2.0-flash-exp
Max Tokens: 4000
Temperature: 0.8

Prompt:
You are an expert instructional designer creating professional healthcare education slides.

CONTEXT:
Module: {{ $json.moduleTitle }}
Summary: {{ $json.enhancedSummary }}
Learning Objectives: {{ $json.learningObjectives.join('; ') }}
Key Concepts: {{ $json.keyConcepts.join('; ') }}

TASK:
Create EXACTLY 12 professional slides for this module.

OUTPUT REQUIREMENTS:
Return ONLY valid JSON with NO markdown, NO explanations.

{
  "slides": [
    {
      "slideNumber": 1,
      "slideTitle": "Introduction to {{ $json.moduleTitle }}",
      "contentPoints": [
        "3-5 bullet points",
        "Clear and concise",
        "Evidence-based"
      ],
      "presenterNotes": "2-3 sentences for presenter context",
      "voiceoverScript": "2-3 minute spoken script, natural Australian speech",
      "imagePrompt": "Professional healthcare image description. CRITICAL: NO TEXT IN IMAGE."
    },
    ... 12 slides total ...
  ]
}

CRITICAL RULES:
1. EXACTLY 12 slides (no more, no less)
2. Image prompts must have NO TEXT visible in image
3. Voiceover scripts 2-3 minutes spoken length
4. Australian healthcare context (AHPRA/NMBA/NSQHS)
5. Return ONLY JSON, no other text
```

---

### NODE 7: Generate LMS Upload Text (Gemini)
```javascript
Model: gemini-2.0-flash-exp
Max Tokens: 2000

Prompt:
Create LMS-ready upload text for ABSORB CREATE AI tool.

CONTEXT:
Module: {{ $json.moduleTitle }}
Content: {{ $json.enhancedSummary }}
Objectives: {{ $json.learningObjectives.join('\n') }}
Slides: {{ $json.slides.length }} slides

TASK:
Generate professional LMS upload document.

FORMAT:
**MODULE: {{ $json.moduleTitle }}**

**Duration:** 45-60 minutes

**Learning Outcomes:**
{{ $json.learningObjectives.join('\n') }}

**Module Content:**
{{ $json.enhancedSummary }}

**Assessment Method:**
Miller's Pyramid (Knowledge → Action)

**Resources Required:**
- Professional slides ({{ $json.slides.length }})
- Assessment questions
- Role play scenarios
- Additional reading materials

**SCORM Compliance:** Yes
**Australian Standards:** AHPRA, NMBA, NSQHS aligned

Return as plain text, ready for copy-paste into ABSORB CREATE.
```

---

### STREAM 2 NODES:

### NODE 8: Generate Assessments (Anthropic Claude)
```javascript
Model: claude-sonnet-4-20250514
Max Tokens: 4000
Temperature: 0.7

Prompt:
Create sophisticated assessments using Miller's Pyramid framework.

CONTEXT:
Module: {{ $json.moduleTitle }}
Learning Objectives: {{ $json.learningObjectives.join('\n') }}
Key Concepts: {{ $json.keyConcepts.join('\n') }}

TASK:
Generate assessment questions across all 4 Miller's Pyramid levels.

OUTPUT (JSON ONLY):
{
  "level1_knows": [
    {
      "questionNumber": 1,
      "questionText": "Multiple choice question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "feedback": "Explanation of correct answer",
      "difficulty": "Medium"
    },
    ... 4 questions total ...
  ],
  "level2_knows_how": [
    { /* 3-4 scenario-based questions */ }
  ],
  "level3_shows_how": [
    { /* 3-4 simulation/performance questions */ }
  ],
  "level4_does": [
    { /* 2-3 practical application questions */ }
  ]
}

Return ONLY JSON. No markdown. No explanations.
```

---

### NODE 9: Generate Role Plays (Anthropic)
```javascript
Model: claude-sonnet-4-20250514
Max Tokens: 3000

Prompt:
Create 3 interactive role play scenarios for iSpring TalkMaster.

CONTEXT:
Module: {{ $json.moduleTitle }}
Objectives: {{ $json.learningObjectives.join('\n') }}

TASK:
Generate 3 role plays with increasing complexity.

OUTPUT (JSON ONLY):
{
  "scenarios": [
    {
      "scenarioNumber": 1,
      "title": "Scenario title",
      "setting": "Australian healthcare context",
      "participants": ["Role 1", "Role 2"],
      "learningObjective": "From module objectives",
      "dialogue": [
        { "speaker": "Role 1", "line": "...", "decisionPoint": false },
        { "speaker": "Learner", "line": "DECISION", "options": ["A", "B", "C"] }
      ],
      "culturalSafety": ["Consideration 1", "Consideration 2"]
    },
    ... 3 scenarios total ...
  ]
}

Return ONLY JSON.
```

---

### NODE 10: Generate Workbooks (Anthropic)
```javascript
Model: claude-sonnet-4-20250514
Max Tokens: 2000

Prompt:
Create supplementary materials for professional development.

CONTEXT:
Module: {{ $json.moduleTitle }}
Concepts: {{ $json.keyConcepts.join('\n') }}

TASK:
Generate practical resources.

OUTPUT (JSON ONLY):
{
  "extraReading": [
    {
      "title": "Article/Resource title",
      "citation": "Vancouver style",
      "url": "URL if available",
      "relevance": "Why this matters"
    }
  ],
  "checklists": [
    {
      "title": "Checklist name",
      "items": ["Item 1", "Item 2", "Item 3"]
    }
  ],
  "templates": [
    {
      "title": "Template name",
      "purpose": "What it's for",
      "content": "Template structure"
    }
  ]
}

Return ONLY JSON.
```

---

### NODE 11: Merge Streams (Code)
```javascript
// Wait for both streams to complete
const allItems = $input.all();

// Find Stream 1 output (has slides)
const stream1 = allItems.find(item => item.json.slides);

// Find Stream 2 outputs (assessments, roleplay, workbooks)
const stream2_assessments = allItems.find(item => item.json.level1_knows);
const stream2_roleplay = allItems.find(item => item.json.scenarios);
const stream2_workbooks = allItems.find(item => item.json.extraReading);

// Merge into complete module
return [{
  json: {
    module_number: stream1.json.moduleNumber,
    module_title: stream1.json.moduleTitle,

    // Stream 1 outputs
    enhanced_summary: stream1.json.enhancedSummary,
    learning_objectives: stream1.json.learningObjectives,
    key_concepts: stream1.json.keyConcepts,
    slides: stream1.json.slides,
    lms_upload: stream1.json.lmsUpload,

    // Stream 2 outputs
    assessments: stream2_assessments?.json || {},
    role_plays: stream2_roleplay?.json || {},
    workbooks: stream2_workbooks?.json || {},

    // Metadata
    generation_complete: true,
    timestamp: new Date().toISOString()
  }
}];
```

---

### NODE 12: Parse Slides for Audio Tab (Code)
```javascript
// Extract EXACTLY 12 slides
const slides = $json.slides || [];

if (slides.length !== 12) {
  console.log(`WARNING: Expected 12 slides, got ${slides.length}`);
}

// Create 12 rows for Audio tab
const audioRows = slides.slice(0, 12).map((slide, index) => ({
  json: {
    slide_id: `Module ${$json.module_number}_Slide ${slide.slideNumber || (index + 1)}`,
    module_number: $json.module_number,
    slide_number: slide.slideNumber || (index + 1),

    // Parsed Slides column
    parsed_slide_content: `**${slide.slideTitle}**\n\nContent:\n${slide.contentPoints.join('\n')}\n\nPresenter Notes:\n${slide.presenterNotes}\n\nImage: ${slide.imagePrompt}`,

    // Voiceover Scripts column
    voiceover_script: slide.voiceoverScript,

    // Audio File column (empty - filled by Audio Generator workflow)
    audio_file_url: ''
  },
  pairedItem: 0
}));

// Pad to 12 if less
while (audioRows.length < 12) {
  const slideNum = audioRows.length + 1;
  audioRows.push({
    json: {
      slide_id: `Module ${$json.module_number}_Slide ${slideNum}`,
      module_number: $json.module_number,
      slide_number: slideNum,
      parsed_slide_content: '[Missing slide]',
      voiceover_script: '',
      audio_file_url: ''
    },
    pairedItem: 0
  });
}

return audioRows;
```

---

### NODE 13: Populate Text Outputs Tab (Google Sheets)
```javascript
Operation: Update
Sheet: "Text Outputs"
Range: A{{ $json.module_number + 2 }}:H{{ $json.module_number + 2 }}

Values:
{
  "A": `Module ${$json.module_number}`,
  "B": $json.enhanced_summary,
  "C": $json.learning_objectives.join('\n'),
  "D": $json.key_concepts.join('\n'),
  "E": JSON.stringify($json.assessments),
  "F": JSON.stringify($json.role_plays),
  "G": JSON.stringify($json.workbooks),
  "H": $json.lms_upload
}
```

---

### NODE 14: Populate Audio Tab (Google Sheets)
```javascript
Operation: Append (batch)
Sheet: "Audio"

For each slide (12 rows):
{
  "A": $json.slide_id,
  "B": $json.parsed_slide_content,
  "C": $json.voiceover_script,
  "D": "" // Empty - filled by Audio Generator
}
```

---

## ✅ KEY IMPROVEMENTS

### 1. **Module-by-Module Processing**
- ✅ No truncation - each module completes fully
- ✅ Better error handling - one module failure doesn't break all
- ✅ Progress visibility - see each module populate sheets

### 2. **Clean Prompts**
- ✅ Strips `<think>` tags from Perplexity
- ✅ Removes markdown code blocks
- ✅ Parses JSON properly
- ✅ Error handling for parse failures

### 3. **Concurrent Streams**
- ✅ Stream 1: Content-focused (Perplexity + Gemini)
- ✅ Stream 2: Assessment-focused (Anthropic)
- ✅ Merge results before sheets population

### 4. **Google Sheets Integration**
- ✅ Populates Text Outputs (module rows 3-14)
- ✅ Populates Audio tab (12 rows per module = 144 total)
- ✅ Triggers Audio Generator workflow

---

## 🚀 IMPLEMENTATION ORDER

1. **Test with 1 module first** - Validate full pipeline
2. **Add loop for all modules** - Scale to 10-12 modules
3. **Monitor Knowledge Lake** - See actual vs claimed outputs
4. **Verify sheets population** - Confirm triggers work
5. **Test audio generation** - End-to-end validation

---

*Architecture by: Claude Code (Reality-Based)*
*Date: 2025-10-02*
*Status: READY TO IMPLEMENT*

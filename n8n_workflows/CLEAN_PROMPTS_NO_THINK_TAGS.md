# CLEAN PROMPTS - NO <think> TAGS
## Production-Ready AI Prompts for Module Generator
## Date: 2025-10-02

---

## 🎯 PROMPT DESIGN PRINCIPLES

### Critical Rules:
1. ✅ **JSON ONLY output** - No markdown, no explanations
2. ✅ **Explicit "NO <think> tags"** instruction
3. ✅ **Clear structure** - Models know exactly what to return
4. ✅ **Australian context** - AHPRA/NMBA/NSQHS throughout
5. ✅ **Error handling** - Code strips any remaining tags

---

## 📝 STREAM 1 PROMPTS

### PROMPT 1: Enhanced Research (Perplexity Sonar)

**System Message:**
```
You are an expert Australian healthcare education researcher creating evidence-based content for professional development.
```

**User Message:**
```
RESEARCH TASK: Deep analysis of "{{ $json.module_title }}" for Australian healthcare professionals

CONTEXT:
- Course: {{ $json.course_concept }}
- Module: {{ $json.module_title }}
- Target Audience: Australian Healthcare Professionals
- Research Foundation: {{ $json.research_foundation }}

REQUIREMENTS:
1. Conduct comprehensive internet research on this specific module topic
2. Focus on Australian healthcare context (AHPRA, NMBA, NSQHS standards)
3. Prioritize peer-reviewed sources and professional guidelines from last 5 years
4. Extract evidence-based frameworks and methodologies
5. Identify practical applications for clinical practice

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- NO explanatory text before or after JSON
- NO nested JSON strings (use actual objects/arrays)

EXACT JSON STRUCTURE:
{
  "moduleNumber": {{ $json.module_number }},
  "moduleTitle": "{{ $json.module_title }}",
  "enhancedSummary": "Write 350-400 words of evidence-based content summarizing current best practice, key frameworks, and Australian regulatory context for this module topic. Include specific examples and cite evidence.",
  "learningObjectives": [
    "Measurable objective 1 using Bloom's taxonomy action verbs (e.g., Analyze, Evaluate, Apply)",
    "Measurable objective 2 with clear competency outcome",
    "Measurable objective 3 aligned with Australian standards",
    "Measurable objective 4 focused on practical application"
  ],
  "keyConcepts": [
    "Evidence-based concept 1 with supporting research",
    "Evidence-based concept 2 specific to Australian context",
    "Evidence-based concept 3 from recent guidelines",
    "Evidence-based concept 4 with practical relevance"
  ],
  "enhancedContentAreas": [
    "Content area 1: Detailed explanation of key frameworks or models",
    "Content area 2: Practical implementation strategies for Australian healthcare",
    "Content area 3: Common challenges and evidence-based solutions"
  ],
  "visualOpportunities": [
    "Visual description 1 suitable for professional healthcare slides",
    "Visual description 2 illustrating key concepts or workflows"
  ],
  "professionalResources": [
    "AHPRA/NMBA/NSQHS standard or guideline relevant to this topic",
    "Professional association resource or position statement"
  ],
  "citations": [
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL",
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL"
  ]
}

BEGIN RESEARCH AND RETURN ONLY THE JSON OBJECT ABOVE.
```

---

### PROMPT 2: Generate Professional Slides (Gemini 2.0 Flash)

**System Message:**
```
You are an expert instructional designer creating professional healthcare education slides for Australian practitioners.
```

**User Message:**
```
CREATE PROFESSIONAL SLIDES for "{{ $json.moduleTitle }}"

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Enhanced Summary: {{ $json.enhancedSummary }}
- Learning Objectives: {{ $json.learningObjectives.join(' | ') }}
- Key Concepts: {{ $json.keyConcepts.join(' | ') }}

SLIDE CREATION RULES:
1. Create EXACTLY 12 slides (no more, no less)
2. Slide 1: Module introduction and objectives
3. Slides 2-10: Core content covering all key concepts
4. Slide 11: Practical application and case examples
5. Slide 12: Summary and transition to next module

CONTENT REQUIREMENTS:
- 3-5 clear bullet points per slide
- Evidence-based content from enhanced summary
- Australian healthcare context (AHPRA/NMBA/NSQHS)
- Professional tone appropriate for experienced clinicians

VOICEOVER SCRIPT REQUIREMENTS:
- 2-3 minutes spoken length (300-450 words)
- Natural Australian conversational style
- Explain concepts clearly without reading bullet points verbatim
- Include examples and practical applications
- Use appropriate medical terminology

IMAGE PROMPT REQUIREMENTS:
- Professional healthcare imagery
- CRITICAL: NO TEXT visible in image description
- Suitable for Canva or AI image generation
- Culturally appropriate for diverse Australian healthcare settings

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- NO explanatory text
- EXACTLY 12 slides

EXACT JSON STRUCTURE:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideTitle": "Introduction to {{ $json.moduleTitle }}",
      "contentPoints": [
        "Clear, concise bullet point 1",
        "Clear, concise bullet point 2",
        "Clear, concise bullet point 3"
      ],
      "presenterNotes": "2-3 sentences providing context for presenter about this slide's purpose and key teaching points.",
      "voiceoverScript": "Write 300-450 words as a natural spoken script. Start with: 'Welcome to [module title]. In this module...' Use conversational Australian English. Explain the bullet points with examples. End with transition to next slide.",
      "imagePrompt": "Professional healthcare image description showing [relevant scene/concept]. Modern Australian healthcare setting. Diverse professionals. IMPORTANT: No text, labels, or words visible in image."
    },
    {
      "slideNumber": 2,
      "slideTitle": "[Key Concept 1 Title]",
      "contentPoints": [
        "Point about key concept",
        "Evidence or example",
        "Australian standard reference"
      ],
      "presenterNotes": "Context and teaching guidance.",
      "voiceoverScript": "300-450 word spoken script explaining this concept naturally...",
      "imagePrompt": "Relevant professional image. No text visible."
    }
    // Continue through slide 12...
  ]
}

CREATE ALL 12 SLIDES NOW AND RETURN ONLY THE JSON.
```

---

### PROMPT 3: Generate LMS Upload Text (Gemini 2.0 Flash)

**System Message:**
```
You are an LMS content specialist creating upload-ready text for ABSORB CREATE AI tool.
```

**User Message:**
```
CREATE LMS UPLOAD TEXT for "{{ $json.moduleTitle }}"

INPUT DATA:
- Module: {{ $json.moduleTitle }}
- Summary: {{ $json.enhancedSummary }}
- Learning Objectives: {{ $json.learningObjectives.join('\n') }}
- Key Concepts: {{ $json.keyConcepts.join('\n') }}
- Total Slides: {{ $json.slides.length }}

OUTPUT REQUIREMENTS:
Generate professional text formatted for direct copy-paste into ABSORB CREATE AI upload tool.

FORMAT (return as plain text, not JSON):

MODULE: {{ $json.moduleTitle }}

DURATION: 45-60 minutes

LEARNING OUTCOMES:
By completing this module, participants will be able to:
{{ $json.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n') }}

MODULE OVERVIEW:
{{ $json.enhancedSummary }}

KEY CONCEPTS COVERED:
{{ $json.keyConcepts.map((concept, i) => `${i + 1}. ${concept}`).join('\n') }}

CONTENT STRUCTURE:
- Professional slide presentation ({{ $json.slides.length }} slides)
- Evidence-based content with Australian healthcare context
- Interactive assessment questions (Miller's Pyramid framework)
- Practical role play scenarios
- Supplementary resources and templates

ASSESSMENT METHOD:
Miller's Pyramid progressive evaluation from Knowledge → Competence → Performance → Action

AUSTRALIAN STANDARDS ALIGNMENT:
- AHPRA professional standards
- NMBA/RACGP practice guidelines
- NSQHS Quality Standards

SCORM COMPLIANCE: Yes
MOBILE COMPATIBLE: Yes
ACCESSIBILITY: WCAG 2.1 AA compliant

TARGET AUDIENCE: Australian healthcare professionals ({{ $json.target_audience || 'Registered Healthcare Practitioners' }})

PREREQUISITES: Current registration with AHPRA or relevant professional body

RETURN THIS TEXT EXACTLY AS FORMATTED ABOVE (plain text, not JSON).
```

---

## 📝 STREAM 2 PROMPTS

### PROMPT 4: Generate Assessments (Anthropic Claude Sonnet)

**System Message:**
```
You are an expert Australian healthcare assessment designer creating sophisticated evaluation tools using Miller's Pyramid framework.
```

**User Message:**
```
CREATE ASSESSMENT QUESTIONS for "{{ $json.moduleTitle }}"

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Learning Objectives: {{ $json.learningObjectives.join(' | ') }}
- Key Concepts: {{ $json.keyConcepts.join(' | ') }}

MILLER'S PYRAMID FRAMEWORK:
Create questions across all 4 levels of clinical competence:

LEVEL 1 - KNOWS (Knowledge): 4 questions
- Multiple choice format (1 correct, 3 plausible distractors)
- Focus on factual knowledge and comprehension
- Reference Australian standards where applicable

LEVEL 2 - KNOWS HOW (Competence): 3-4 questions
- Scenario-based questions
- Require application of knowledge to clinical situations
- Australian healthcare context

LEVEL 3 - SHOWS HOW (Performance): 3-4 questions
- Simulation or case analysis questions
- Require demonstration of skills/competencies
- Include decision-making and critical thinking

LEVEL 4 - DOES (Action): 2-3 questions
- Practical application and integration questions
- Require synthesis and professional judgment
- Real-world clinical scenarios

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- NO explanatory text

EXACT JSON STRUCTURE:
{
  "level1_knows": [
    {
      "questionNumber": 1,
      "questionText": "Clear, concise multiple choice question testing factual knowledge of this module's content",
      "options": [
        "A) Plausible distractor",
        "B) Correct answer with specific detail",
        "C) Plausible distractor",
        "D) Plausible distractor"
      ],
      "correctAnswer": "B",
      "feedback": "Explanation of why B is correct and why others are incorrect. Reference evidence or Australian standard.",
      "difficulty": "Medium",
      "ahpraAlignment": "Relevant AHPRA standard if applicable"
    }
    // 4 questions total for Level 1
  ],
  "level2_knows_how": [
    {
      "questionNumber": 5,
      "questionText": "Scenario: [Describe realistic clinical scenario]. Question: How should the practitioner respond?",
      "options": [
        "A) Response option 1",
        "B) Response option 2 (best practice)",
        "C) Response option 3",
        "D) Response option 4"
      ],
      "correctAnswer": "B",
      "feedback": "Detailed explanation of best practice response with evidence",
      "difficulty": "Medium",
      "clinicalContext": "Australian healthcare setting description"
    }
    // 3-4 questions total for Level 2
  ],
  "level3_shows_how": [
    {
      "questionNumber": 9,
      "questionText": "Case Analysis: [Detailed clinical case]. What would you do and why?",
      "options": [
        "A) Action with rationale",
        "B) Action with rationale (best approach)",
        "C) Action with rationale",
        "D) Action with rationale"
      ],
      "correctAnswer": "B",
      "feedback": "Analysis of decision-making process and evidence-based practice",
      "difficulty": "Hard",
      "requiresIntegration": ["Concept 1", "Concept 2", "Concept 3"]
    }
    // 3-4 questions total for Level 3
  ],
  "level4_does": [
    {
      "questionNumber": 13,
      "questionText": "Complex Scenario: [Multi-faceted clinical situation requiring professional judgment]. Describe your complete approach including assessment, intervention, documentation, and follow-up.",
      "evaluationCriteria": [
        "Comprehensive assessment of situation",
        "Evidence-based intervention plan",
        "Professional documentation",
        "Follow-up and evaluation strategy",
        "AHPRA/NMBA standard compliance"
      ],
      "modelAnswer": "Detailed model answer demonstrating expert clinical reasoning and practice integration",
      "difficulty": "Hard",
      "professionalStandards": ["AHPRA standard 1", "NMBA standard 2", "NSQHS standard 3"]
    }
    // 2-3 questions total for Level 4
  ]
}

CREATE QUESTIONS FOR ALL 4 LEVELS AND RETURN ONLY THE JSON.
```

---

### PROMPT 5: Generate Role Play Scenarios (Anthropic Claude)

**System Message:**
```
You are an expert Australian healthcare educator creating interactive role play scenarios for iSpring TalkMaster.
```

**User Message:**
```
CREATE 3 ROLE PLAY SCENARIOS for "{{ $json.moduleTitle }}"

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Learning Objectives: {{ $json.learningObjectives.join(' | ') }}
- Key Concepts: {{ $json.keyConcepts.join(' | ') }}

SCENARIO REQUIREMENTS:
1. Three scenarios with progressive complexity
2. Australian healthcare settings
3. Diverse participants reflecting Australian cultural demographics
4. Decision points for learner interaction
5. Cultural safety considerations
6. iSpring TalkMaster compatibility

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks

EXACT JSON STRUCTURE:
{
  "scenarios": [
    {
      "scenarioNumber": 1,
      "title": "Descriptive scenario title",
      "complexity": "Basic",
      "setting": "Specific Australian healthcare setting (e.g., community health clinic in suburban Melbourne)",
      "participants": [
        "Learner (healthcare professional)",
        "Patient/Client with relevant characteristics",
        "Optional: Colleague or family member"
      ],
      "learningObjective": "Specific objective from module this scenario addresses",
      "scenario Description": "2-3 sentences setting the scene and context",
      "dialogue": [
        {
          "speaker": "Patient",
          "line": "Opening dialogue that presents the scenario",
          "decisionPoint": false
        },
        {
          "speaker": "Learner",
          "line": "DECISION POINT",
          "decisionPoint": true,
          "options": [
            {
              "option": "A) Appropriate response option 1",
              "outcome": "Positive outcome description",
              "effectiveness": "High",
              "feedback": "Positive feedback explaining why this is effective"
            },
            {
              "option": "B) Neutral response option",
              "outcome": "Neutral outcome description",
              "effectiveness": "Medium",
              "feedback": "Constructive feedback"
            },
            {
              "option": "C) Less effective response",
              "outcome": "Less positive outcome",
              "effectiveness": "Low",
              "feedback": "Developmental feedback explaining better approach"
            }
          ]
        },
        {
          "speaker": "Patient",
          "line": "Response continuing the scenario based on learner choice",
          "decisionPoint": false
        }
        // Continue dialogue with 2-3 decision points total
      ],
      "culturalSafetyConsiderations": [
        "Cultural consideration 1 relevant to this scenario",
        "Cultural consideration 2 addressing diversity and inclusion"
      ],
      "debriefingPoints": [
        "Key learning point 1 from this scenario",
        "Key learning point 2 linking to module objectives",
        "Reflection question for learner"
      ]
    },
    {
      "scenarioNumber": 2,
      "title": "Scenario 2 title",
      "complexity": "Intermediate",
      // Same structure with more complex scenario
    },
    {
      "scenarioNumber": 3,
      "title": "Scenario 3 title",
      "complexity": "Advanced",
      // Same structure with most complex scenario
    }
  ]
}

CREATE ALL 3 SCENARIOS AND RETURN ONLY THE JSON.
```

---

### PROMPT 6: Generate Workbooks & Resources (Anthropic Claude)

**System Message:**
```
You are an expert Australian healthcare professional development specialist creating supplementary learning resources.
```

**User Message:**
```
CREATE WORKBOOKS & RESOURCES for "{{ $json.moduleTitle }}"

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Key Concepts: {{ $json.keyConcepts.join(' | ') }}
- Learning Objectives: {{ $json.learningObjectives.join(' | ') }}

RESOURCE TYPES TO CREATE:
1. Extra Reading Materials (peer-reviewed + professional guidelines)
2. Practical Checklists (for clinical application)
3. Templates (for documentation or planning)

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks

EXACT JSON STRUCTURE:
{
  "extraReading": [
    {
      "title": "Article or resource title",
      "authors": "Author(s) name(s)",
      "citation": "Complete Vancouver style citation: Author(s). Title. Journal. Year;Volume(Issue):Pages. DOI",
      "url": "Direct URL if available",
      "type": "Journal Article / Guideline / Position Statement / Systematic Review",
      "relevance": "2-3 sentences explaining why this resource is valuable for this module",
      "keyPoints": [
        "Key finding or recommendation 1",
        "Key finding or recommendation 2"
      ]
    }
    // 5-6 reading materials
  ],
  "checklists": [
    {
      "title": "Checklist name (e.g., 'Pre-Procedure Safety Checklist')",
      "purpose": "What this checklist helps practitioners accomplish",
      "applicableSetting": "Where this checklist is used (e.g., 'Prior to any invasive procedure')",
      "items": [
        "Checkbox item 1 - specific, actionable",
        "Checkbox item 2 - specific, actionable",
        "Checkbox item 3 - specific, actionable",
        "Checkbox item 4 - specific, actionable",
        "Checkbox item 5 - specific, actionable"
      ],
      "ahpraAlignment": "Relevant AHPRA standard this checklist supports",
      "completionGuidance": "Brief instruction on how to use this checklist effectively"
    }
    // 2-3 checklists
  ],
  "templates": [
    {
      "title": "Template name (e.g., 'Patient Education Plan Template')",
      "purpose": "What this template is used for",
      "applicableSetting": "When and where this template is useful",
      "sections": [
        {
          "sectionName": "Section 1 heading",
          "promptQuestions": [
            "Guiding question 1 to complete this section",
            "Guiding question 2 to complete this section"
          ],
          "example": "Brief example of completed section"
        }
        // 3-5 sections per template
      ],
      "usageNotes": "Tips for effective use of this template"
    }
    // 2-3 templates
  ]
}

CREATE ALL RESOURCES AND RETURN ONLY THE JSON.
```

---

## 🔧 POST-PROCESSING CODE SNIPPETS

### Clean Perplexity Response (Always Use After Perplexity)
```javascript
// Get raw response
let rawResponse = $json.choices[0].message.content;

// CRITICAL: Strip all <think> tags and their content (case-insensitive, multiline)
rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

// Remove markdown code blocks
rawResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

// Remove any stray markdown
rawResponse = rawResponse.replace(/^```\s*/gm, '').replace(/\s*```$/gm, '');

// Trim all whitespace
rawResponse = rawResponse.trim();

// Parse JSON
let parsed;
try {
  parsed = JSON.parse(rawResponse);
} catch (error) {
  // Log error for debugging
  console.error('JSON Parse Error:', error.message);
  console.error('Raw response:', rawResponse.substring(0, 500));

  return [{
    json: {
      error: 'JSON Parse Error',
      error_message: error.message,
      raw_response: rawResponse,
      module_number: $json.module_number,
      module_title: $json.module_title
    }
  }];
}

// Return clean parsed data
return [{
  json: {
    ...parsed,
    _parsed_successfully: true,
    _timestamp: new Date().toISOString()
  }
}];
```

---

### Clean Anthropic Response (Use After Claude)
```javascript
// Anthropic returns: { content: [{ type: 'text', text: '...' }] }
let rawResponse = $json.content[0].text;

// Strip <think> tags (Anthropic shouldn't use them, but just in case)
rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

// Remove markdown
rawResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
rawResponse = rawResponse.trim();

// Parse JSON
let parsed;
try {
  parsed = JSON.parse(rawResponse);
} catch (error) {
  console.error('JSON Parse Error:', error.message);
  return [{
    json: {
      error: 'JSON Parse Error',
      raw_response: rawResponse,
      module_number: $json.module_number
    }
  }];
}

return [{ json: parsed }];
```

---

### Clean Gemini Response (Use After Gemini)
```javascript
// Gemini format varies, handle multiple cases
let rawResponse;

if ($json.candidates && $json.candidates[0]) {
  rawResponse = $json.candidates[0].content.parts[0].text;
} else if ($json.content) {
  rawResponse = $json.content;
} else {
  rawResponse = $json.text || JSON.stringify($json);
}

// Remove markdown
rawResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
rawResponse = rawResponse.trim();

// Parse JSON
let parsed;
try {
  parsed = JSON.parse(rawResponse);
} catch (error) {
  console.error('JSON Parse Error:', error.message);
  return [{
    json: {
      error: 'JSON Parse Error',
      raw_response: rawResponse,
      module_number: $json.module_number
    }
  }];
}

return [{ json: parsed }];
```

---

## ✅ TESTING CHECKLIST

Before deploying these prompts:

1. ✅ Test each prompt individually with 1 module
2. ✅ Verify JSON parsing works with cleaning code
3. ✅ Check for `<think>` tags in outputs (should be ZERO)
4. ✅ Confirm all required fields are present
5. ✅ Validate Australian context in outputs
6. ✅ Test with different module topics

---

*Prompts by: Claude Code (Clean, Production-Ready)*
*Date: 2025-10-02*
*Status: READY FOR IMPLEMENTATION*

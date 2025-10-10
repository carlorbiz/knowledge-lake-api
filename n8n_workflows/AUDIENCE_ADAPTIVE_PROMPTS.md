# AUDIENCE-ADAPTIVE PROMPTS
## Multi-Audience Course Creation (Not Just Healthcare!)
## Date: 2025-10-02

---

## 🎯 THE REAL PURPOSE

**This automation creates courses for MULTIPLE audience types:**
- ✅ **Healthcare Clinical** (GPSA learners - AHPRA/NMBA/NSQHS)
- ✅ **Healthcare Operational** (Admin staff, coordinators)
- ✅ **Healthcare Management** (Middle managers, team leaders)
- ✅ **Healthcare Leadership** (Executives, C-suite, board members)
- ✅ **General Professional** (Non-healthcare professionals)
- ✅ **Executive/Leadership** (Any industry executives)

**The prompts must adapt based on `{{ $json.audience_type }}`**

---

## 📝 CORRECTED PROMPTS (Audience-Adaptive)

### PROMPT 1: Enhanced Research (Perplexity) - FIXED

**System Message:**
```
You are an expert education researcher creating evidence-based content for professional development across multiple industries and audience types.
```

**User Message:**
```
RESEARCH TASK: Deep analysis of "{{ $json.module_title }}" for {{ $json.audience_type }}

CONTEXT:
- Course: {{ $json.course_concept }}
- Module: {{ $json.module_title }}
- Target Audience: {{ $json.audience_type }}
- Research Foundation: {{ $json.research_foundation }}

AUDIENCE-SPECIFIC REQUIREMENTS:

{{ if $json.audience_type === "Healthcare Clinical" }}
- Focus on AHPRA, NMBA, NSQHS standards
- Clinical practice applications
- Evidence-based healthcare frameworks
- Patient safety and quality care
- Regulatory compliance for registered practitioners
{{ else if $json.audience_type === "Healthcare Operational" }}
- Focus on operational efficiency
- Process improvement methodologies
- Healthcare administration standards
- Team coordination and workflow optimization
- Compliance for operational roles
{{ else if $json.audience_type === "Healthcare Management" }}
- Focus on middle management competencies
- Team leadership frameworks
- Performance management
- Resource allocation and budgeting
- Change management in healthcare
{{ else if $json.audience_type === "Healthcare Leadership" }}
- Focus on strategic leadership
- Governance and board-level decision-making
- Organizational transformation
- Executive responsibility frameworks
- Industry trends and innovation
{{ else if $json.audience_type === "Executive Leadership" }}
- Focus on C-suite competencies
- Strategic planning and execution
- Financial acumen and business strategy
- Stakeholder management
- Corporate governance
{{ else }}
- Focus on professional development
- Industry best practices
- Workplace application
- Career advancement frameworks
- Professional standards
{{ endif }}

REQUIREMENTS:
1. Conduct comprehensive research on this specific module topic
2. Focus on {{ $json.audience_type }} context and applications
3. Prioritize peer-reviewed sources and professional guidelines from last 5 years
4. Extract evidence-based frameworks and methodologies
5. Identify practical applications for {{ $json.audience_type }}

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- NO explanatory text before or after JSON

EXACT JSON STRUCTURE:
{
  "moduleNumber": {{ $json.module_number }},
  "moduleTitle": "{{ $json.module_title }}",
  "enhancedSummary": "Write 350-400 words of evidence-based content for {{ $json.audience_type }}. Include frameworks, standards, and practical applications relevant to this audience. {{ if $json.audience_type contains 'Healthcare' }}Include Australian regulatory context where applicable.{{ endif }}",
  "learningObjectives": [
    "Measurable objective 1 using Bloom's taxonomy for {{ $json.audience_type }}",
    "Measurable objective 2 with clear competency outcome for this audience",
    "Measurable objective 3 aligned with {{ $json.audience_type }} professional standards",
    "Measurable objective 4 focused on practical application in {{ $json.audience_type }} context"
  ],
  "keyConcepts": [
    "Evidence-based concept 1 relevant to {{ $json.audience_type }}",
    "Professional framework concept 2 for this audience",
    "Industry-specific concept 3",
    "Practical application concept 4"
  ],
  "enhancedContentAreas": [
    "Theoretical foundations relevant to {{ $json.audience_type }}",
    "{{ if $json.audience_type contains 'Healthcare' }}Australian regulatory requirements{{ else }}Industry standards and regulations{{ endif }}",
    "Practical implementation strategies for {{ $json.audience_type }}"
  ],
  "visualOpportunities": [
    "Framework or model visualization for {{ $json.audience_type }}",
    "Process or decision flow relevant to this audience"
  ],
  "professionalResources": [
    "{{ if $json.audience_type === 'Healthcare Clinical' }}AHPRA/NMBA/NSQHS standard{{ else if $json.audience_type contains 'Healthcare' }}Relevant healthcare standard{{ else }}Industry standard or guideline{{ endif }}",
    "Professional association resource or best practice guide"
  ],
  "citations": [
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL",
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL"
  ]
}

BEGIN RESEARCH AND RETURN ONLY THE JSON OBJECT ABOVE.
```

---

### PROMPT 2: Generate Slides (Gemini) - FIXED

**System Message:**
```
You are an expert instructional designer creating professional slides for {{ $json.audience_type }}.
```

**User Message:**
```
CREATE PROFESSIONAL SLIDES for "{{ $json.moduleTitle }}" targeting {{ $json.audience_type }}

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Target Audience: {{ $json.audience_type }}
- Enhanced Summary: {{ $json.enhancedSummary }}
- Learning Objectives: {{ JSON.stringify($json.learningObjectives) }}
- Key Concepts: {{ JSON.stringify($json.keyConcepts) }}

AUDIENCE-SPECIFIC TONE:

{{ if $json.audience_type === "Healthcare Clinical" }}
- Clinical, evidence-based language
- References to patient care and clinical practice
- AHPRA/NMBA standards integration
- Practical clinical applications
{{ else if $json.audience_type === "Healthcare Operational" }}
- Operational efficiency focus
- Process improvement language
- Workflow optimization examples
- Administrative best practices
{{ else if $json.audience_type === "Healthcare Management" }}
- Management and leadership terminology
- Team performance focus
- Resource management examples
- Change management frameworks
{{ else if $json.audience_type === "Healthcare Leadership" || $json.audience_type === "Executive Leadership" }}
- Strategic, executive-level language
- Governance and organizational focus
- High-level decision-making frameworks
- Business transformation examples
{{ else }}
- Professional development focus
- Industry best practices
- Career advancement language
- Workplace application examples
{{ endif }}

SLIDE CREATION RULES:
1. Create EXACTLY 12 slides (no more, no less)
2. Slide 1: Module introduction and objectives for {{ $json.audience_type }}
3. Slides 2-10: Core content for this specific audience
4. Slide 11: Practical application and examples for {{ $json.audience_type }}
5. Slide 12: Summary and transition

CONTENT REQUIREMENTS:
- 3-5 clear bullet points per slide
- Language appropriate for {{ $json.audience_type }}
- Professional tone matching audience seniority
- {{ if $json.audience_type contains 'Healthcare' }}Australian healthcare context{{ else }}Industry best practices{{ endif }}

VOICEOVER SCRIPT REQUIREMENTS:
- 2-3 minutes spoken length (300-450 words)
- Conversational style appropriate for {{ $json.audience_type }}
- Explain concepts clearly for this audience level
- Use terminology familiar to {{ $json.audience_type }}

IMAGE PROMPT REQUIREMENTS:
- Professional imagery suitable for {{ $json.audience_type }}
- CRITICAL: NO TEXT visible in image description
- {{ if $json.audience_type contains 'Healthcare' }}Healthcare settings{{ else if $json.audience_type contains 'Executive' || $json.audience_type contains 'Leadership' }}Executive/boardroom settings{{ else }}Professional workplace settings{{ endif }}
- Culturally appropriate and diverse

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- EXACTLY 12 slides

EXACT JSON STRUCTURE:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideTitle": "Introduction to {{ $json.moduleTitle }}",
      "contentPoints": [
        "Opening point relevant to {{ $json.audience_type }}",
        "Context-setting for this audience",
        "Preview of what {{ $json.audience_type }} will learn"
      ],
      "presenterNotes": "2-3 sentences about presenting to {{ $json.audience_type }}",
      "voiceoverScript": "Write 300-450 words as natural spoken script for {{ $json.audience_type }}. Start: 'Welcome to [module]. As [audience type], you'll discover...' Use language and examples appropriate for {{ $json.audience_type }}.",
      "imagePrompt": "Professional {{ if $json.audience_type contains 'Healthcare' }}healthcare{{ else if $json.audience_type contains 'Executive' }}executive{{ else }}workplace{{ endif }} image. Diverse professionals. NO text visible."
    }
    // ... 12 slides total
  ]
}

CREATE ALL 12 SLIDES FOR {{ $json.audience_type }} AND RETURN ONLY THE JSON.
```

---

### PROMPT 3: Assessments (Anthropic) - FIXED

**System Message:**
```
You are an expert assessment designer creating evaluations for {{ $json.audience_type }}.
```

**User Message:**
```
CREATE ASSESSMENT QUESTIONS for "{{ $json.moduleTitle }}" for {{ $json.audience_type }}

CONTEXT:
- Module: {{ $json.moduleTitle }}
- Target Audience: {{ $json.audience_type }}
- Learning Objectives: {{ JSON.stringify($json.learningObjectives) }}
- Key Concepts: {{ JSON.stringify($json.keyConcepts) }}

AUDIENCE-SPECIFIC ASSESSMENT APPROACH:

{{ if $json.audience_type === "Healthcare Clinical" }}
MILLER'S PYRAMID (Clinical):
- Level 1 KNOWS: Clinical knowledge, AHPRA standards, evidence base
- Level 2 KNOWS HOW: Clinical scenarios, patient care decisions
- Level 3 SHOWS HOW: Clinical simulations, competency demonstration
- Level 4 DOES: Real clinical practice, patient outcomes
{{ else if $json.audience_type === "Healthcare Operational" }}
COMPETENCY LEVELS (Operational):
- Level 1: Process knowledge, administrative standards
- Level 2: Operational scenarios, workflow decisions
- Level 3: Process improvement demonstrations
- Level 4: Operational excellence in practice
{{ else if $json.audience_type === "Healthcare Management" || $json.audience_type === "Healthcare Leadership" }}
LEADERSHIP COMPETENCY LEVELS:
- Level 1: Management theory, leadership frameworks
- Level 2: Management scenarios, team situations
- Level 3: Leadership simulation, decision-making
- Level 4: Strategic execution, organizational impact
{{ else if $json.audience_type === "Executive Leadership" }}
EXECUTIVE COMPETENCY LEVELS:
- Level 1: Strategic knowledge, governance frameworks
- Level 2: Executive scenarios, board-level decisions
- Level 3: Strategic simulations, stakeholder management
- Level 4: Organizational transformation, executive action
{{ else }}
PROFESSIONAL COMPETENCY LEVELS:
- Level 1: Professional knowledge, industry standards
- Level 2: Workplace scenarios, professional decisions
- Level 3: Skill demonstration, competency performance
- Level 4: Professional practice, career application
{{ endif }}

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks
- Questions must be relevant to {{ $json.audience_type }}

EXACT JSON STRUCTURE:
{
  "level1_knows": [
    {
      "questionNumber": 1,
      "questionText": "Question appropriate for {{ $json.audience_type }} testing knowledge",
      "options": ["A) Option", "B) Correct for {{ $json.audience_type }}", "C) Option", "D) Option"],
      "correctAnswer": "B",
      "feedback": "Explanation relevant to {{ $json.audience_type }}",
      "difficulty": "Medium",
      "audienceRelevance": "{{ $json.audience_type }}"
    }
    // 4 questions Level 1
  ],
  "level2_knows_how": [
    {
      "questionNumber": 5,
      "questionText": "{{ if $json.audience_type contains 'Healthcare' }}Clinical/Healthcare{{ else if $json.audience_type contains 'Executive' }}Executive/Strategic{{ else }}Professional{{ endif }} scenario: [Describe situation relevant to {{ $json.audience_type }}]. How should [{{ $json.audience_type }}] respond?",
      "options": ["A) Response", "B) Best practice for {{ $json.audience_type }}", "C) Response", "D) Response"],
      "correctAnswer": "B",
      "feedback": "Evidence-based explanation for {{ $json.audience_type }}",
      "scenarioContext": "{{ $json.audience_type }} workplace situation"
    }
    // 3-4 questions Level 2
  ],
  "level3_shows_how": [
    // Similar structure, performance-based for {{ $json.audience_type }}
  ],
  "level4_does": [
    // Similar structure, real-world application for {{ $json.audience_type }}
  ],
  "rolePlayScenarios": [
    {
      "scenarioNumber": 1,
      "title": "{{ $json.audience_type }} Scenario Title",
      "setting": "{{ if $json.audience_type contains 'Healthcare' }}Healthcare setting{{ else if $json.audience_type contains 'Executive' }}Boardroom/Executive setting{{ else }}Professional workplace{{ endif }}",
      "participants": [
        "{{ $json.audience_type }} (learner)",
        "Relevant stakeholder for {{ $json.audience_type }}"
      ],
      "dialogue": [],
      "audienceConsiderations": [
        "Consideration 1 specific to {{ $json.audience_type }}",
        "Consideration 2 for this audience level"
      ]
    }
    // 3 scenarios
  ]
}

CREATE ASSESSMENTS FOR {{ $json.audience_type }} AND RETURN ONLY THE JSON.
```

---

## 🔧 CODE NODE UPDATES NEEDED

### In "4a. Clean Perplexity Response" - Add Audience Context
```javascript
// After parsing enhanced data, ensure audience type flows through
return [{
  json: {
    ...enhanced,
    course_title: originalData.course_title,
    audience_type: originalData.audience_type,  // ← CRITICAL
    research_foundation: originalData.research_foundation
  }
}];
```

### In "6a. Parse Gemini Slides" - Preserve Audience
```javascript
return [{
  json: {
    ...moduleData,
    slides: slideData.slides || [],
    audience_type: moduleData.audience_type  // ← ENSURE THIS FLOWS
  }
}];
```

### In "7. Merge Streams" - Keep Audience Throughout
```javascript
merged.push({
  json: {
    module_number: slideData.moduleNumber,
    module_title: slideData.moduleTitle,
    // ... other fields ...
    audience_type: slideData.audience_type,  // ← PRESERVE
    course_title: slideData.course_title
  }
});
```

---

## 📊 AUDIENCE TYPE MAPPING

### From Google Sheets "Audience Type" Column:
```
"Healthcare Clinical" → AHPRA/NMBA/NSQHS, clinical practice
"Healthcare Operational" → Process improvement, workflows
"Healthcare Management" → Team leadership, performance management
"Healthcare Leadership" → Strategic, governance, C-suite
"Executive Leadership" → Any industry C-suite/board
"Professional Development" → General workplace learning
```

### Standards/Frameworks by Audience:
```javascript
const getStandards = (audienceType) => {
  if (audienceType === "Healthcare Clinical") {
    return "AHPRA, NMBA, NSQHS Standards";
  } else if (audienceType.includes("Healthcare")) {
    return "Australian Healthcare Standards";
  } else if (audienceType.includes("Executive")) {
    return "Corporate Governance, ASX Principles";
  } else {
    return "Industry Best Practices";
  }
};
```

---

## ✅ UPDATED WORKFLOW INTEGRATION

### Node 2: Extract Modules - ENSURE AUDIENCE PASSES
```javascript
outputs.push({
  json: {
    module_number: module.moduleNumber,
    module_title: module.moduleName,
    // ... other fields ...
    audience_type: $input.first().json['Audience Type'],  // ← FROM TRIGGER
    course_title: courseData.courseTitle
  }
});
```

### All Prompts: USE AUDIENCE VARIABLE
```
Target Audience: {{ $json.audience_type }}

{{ if $json.audience_type === "Healthcare Clinical" }}
  [Healthcare clinical content]
{{ else if $json.audience_type === "Executive Leadership" }}
  [Executive content]
{{ else }}
  [General professional content]
{{ endif }}
```

---

## 🎯 EXAMPLES BY AUDIENCE

### Healthcare Clinical:
```
Module: "Infection Control Fundamentals"
Audience: Healthcare Clinical
→ AHPRA standards, clinical protocols, patient safety
→ Voiceover: "As registered healthcare professionals..."
→ Assessment: Miller's Pyramid clinical scenarios
```

### Executive Leadership:
```
Module: "Strategic Risk Management"
Audience: Executive Leadership
→ Corporate governance, board responsibilities, ASX principles
→ Voiceover: "As executive leaders..."
→ Assessment: Board-level decision scenarios
```

### Healthcare Management:
```
Module: "Team Performance Optimization"
Audience: Healthcare Management
→ Middle management frameworks, team leadership
→ Voiceover: "As healthcare managers..."
→ Assessment: Management competency scenarios
```

---

## 🚀 IMPLEMENTATION PLAN

### Step 1: Update All Prompts (3 prompts)
- [x] Enhanced Research (Perplexity)
- [x] Generate Slides (Gemini)
- [x] Generate Assessments (Anthropic)

### Step 2: Update Code Nodes (4 nodes)
- [ ] Node 2: Ensure audience flows from trigger
- [ ] Node 4a: Preserve audience through Perplexity
- [ ] Node 6a: Preserve audience through Gemini
- [ ] Node 7: Ensure audience in merged data

### Step 3: Test Each Audience Type
- [ ] Healthcare Clinical → Verify AHPRA references
- [ ] Healthcare Leadership → Verify strategic content
- [ ] Executive Leadership → Verify governance content
- [ ] General Professional → Verify broad applicability

---

## 📋 VALIDATION CHECKLIST

For each generated module, verify:
- [ ] Language matches audience sophistication level
- [ ] Standards/frameworks match audience type
- [ ] Examples relevant to audience context
- [ ] Voiceover tone appropriate for audience
- [ ] Assessments test audience-specific competencies
- [ ] Images reflect audience work environment

---

*Audience-Adaptive Prompts by: Claude Code*
*Purpose: Multi-industry, multi-level course creation*
*NOT just healthcare!*

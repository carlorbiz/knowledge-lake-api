# KNOWLEDGE LAKE INTEGRATION MAP
## Connecting Module Generator Workflow to AAE/MCP Infrastructure
## Created: 2025-10-01

---

## OVERVIEW

**Purpose:** Map the data flows between the Module Generator Workflow and the broader Knowledge Lake ecosystem to enable:
- Organizational learning and knowledge reuse
- MCP (Model Context Protocol) retrieval
- AAE (AI Agent Engine) autonomous improvements
- Vertex AI Google Workspace search integration

---

## CURRENT DATA FLOWS

### 1. USER INPUT → KNOWLEDGE LAKE
```
Google Form (Course Request)
    ↓ [Form responses 2]
Research Foundation (User-provided AI research)
    ↓
Knowledge Lake Storage
    - Topic: {course_concept}
    - Audience: {audience_type}
    - Research: {research_foundation_part1 + part2}
    - Timestamp: {submission_date}

STORAGE FORMAT:
{
  "type": "user_research_foundation",
  "course_concept": "Clinical Supervision for IMGs",
  "audience_type": "Healthcare Clinical",
  "research_content": "...",
  "source_urls": [...],
  "created_at": "2025-10-01T...",
  "user_email": "...",
  "status": "pending_recommendation"
}
```

**Knowledge Lake Benefit:** Future courses on similar topics can retrieve and build upon existing research foundations.

---

### 2. PHOENIX COURSE RECOMMENDATION → KNOWLEDGE LAKE
```
Anthropic Course Architecture
    ↓ [Course Recommendation output]
Strategic Overview
Course Architecture (10-12 modules)
Learning Objectives
Key Concepts
Implementation Guidance
    ↓
Knowledge Lake Storage

STORAGE FORMAT:
{
  "type": "course_architecture",
  "course_id": "course_20251001_...",
  "course_concept": "...",
  "audience_type": "...",
  "modules": [
    {
      "module_number": 1,
      "module_title": "...",
      "learning_objectives": [...],
      "duration": "45-60 minutes"
    },
    // ... 10-12 modules
  ],
  "strategic_overview": "...",
  "key_concepts": [...],
  "created_at": "2025-10-01T...",
  "workflow": "phoenix",
  "status": "modules_pending"
}
```

**Knowledge Lake Benefit:** Course architectures become templates for similar topics, accelerating future development.

---

### 3. PERPLEXITY ENHANCED RESEARCH → KNOWLEDGE LAKE
```
Enhanced Module Research (per module)
    ↓ [Perplexity API response]
Enhanced Summary (350-400 words)
Learning Objectives (detailed)
Key Concepts (evidence-based)
Enhanced Content Areas
Visual Content Opportunities
Assessment Strategies
Professional Resources
    ↓
Knowledge Lake Storage

STORAGE FORMAT:
{
  "type": "enhanced_module_research",
  "course_id": "course_20251001_...",
  "module_number": 1,
  "module_title": "Understanding the IMG Journey",
  "enhanced_summary": "...",
  "learning_objectives": [...],
  "key_concepts": [...],
  "enhanced_content_areas": [...],
  "visual_opportunities": [...],
  "assessment_strategies": [...],
  "professional_resources": [...],
  "perplexity_metadata": {
    "prompt_tokens": 5655,
    "completion_tokens": 4000,
    "total_cost": 0.0234
  },
  "created_at": "2025-10-01T...",
  "workflow": "module_generator",
  "status": "content_pending"
}
```

**Knowledge Lake Benefit:** Deep research on specific topics (e.g., "IMG expert novice construct") becomes searchable organizational knowledge.

---

### 4. GEMINI MODULE CONTENT → KNOWLEDGE LAKE
```
Gemini Generated Content
    ↓
Module Overview (400-500 words)
Detailed Learning Content (2000-2500 words)
12 Professional Slides
  - Content Points
  - Presenter Notes
  - Voiceover Scripts
  - Image Prompts
LMS Upload Document
Professional Resources
Citations
    ↓
Knowledge Lake Storage

STORAGE FORMAT:
{
  "type": "module_content",
  "course_id": "course_20251001_...",
  "module_number": 1,
  "module_title": "...",
  "content": {
    "overview": "...",
    "detailed_content": "...",
    "slides": [
      {
        "slideNumber": 1,
        "slideTitle": "...",
        "contentPoints": [...],
        "presenterNotes": "...",
        "voiceoverScript": "...",
        "imagePrompt": "..."
      },
      // ... 12 slides
    ],
    "lms_upload_document": "...",
    "professional_resources": [...],
    "citations": [...]
  },
  "australian_compliance": {
    "ahpra_standards": [...],
    "nmba_references": [...],
    "nsqhs_alignment": [...]
  },
  "created_at": "2025-10-01T...",
  "ai_model": "gemini-2.0-flash-exp",
  "workflow": "module_generator",
  "status": "assessments_pending"
}
```

**Knowledge Lake Benefit:** High-quality educational content becomes a searchable library. Future courses can reference or adapt existing slides, scripts, and resources.

---

### 5. ANTHROPIC ASSESSMENTS → KNOWLEDGE LAKE
```
Anthropic Generated Assessments
    ↓
Miller's Pyramid Questions
  - KNOWS (Knowledge): 4 questions
  - KNOWS HOW (Competence): 3-4 questions
  - SHOWS HOW (Performance): 3-4 questions
  - DOES (Action): 2-3 questions
Role Play Scenarios (3 per module)
  - Australian healthcare context
  - iSpring TalkMaster specifications
  - Branching logic
    ↓
Knowledge Lake Storage

STORAGE FORMAT:
{
  "type": "module_assessments",
  "course_id": "course_20251001_...",
  "module_number": 1,
  "module_title": "...",
  "assessments": {
    "level1_knows": [
      {
        "questionNumber": 1,
        "questionText": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "B",
        "feedback": "...",
        "difficulty": "Medium"
      },
      // ... 4 questions
    ],
    "level2_knows_how": [...],
    "level3_shows_how": [...],
    "level4_does": [...]
  },
  "role_play_scenarios": [
    {
      "scenarioNumber": 1,
      "title": "Consent Conversation Challenge",
      "context": "...",
      "learningObjective": "...",
      "decisionPoints": [...],
      "culturalSafetyElements": [...]
    },
    // ... 3 scenarios
  ],
  "australian_context": {
    "regulatory_standards": [...],
    "clinical_guidelines": [...],
    "cultural_considerations": [...]
  },
  "created_at": "2025-10-01T...",
  "ai_model": "claude-sonnet-4-20250514",
  "workflow": "module_generator",
  "status": "complete"
}
```

**Knowledge Lake Benefit:** Assessment question banks organized by topic, competency level, and Miller's Pyramid stage. Role play scenarios become a reusable library.

---

### 6. COMPLETE MODULE → KNOWLEDGE LAKE
```
Merged Module (Gemini + Anthropic)
    ↓
Full Module Package
  - All content components
  - All assessment components
  - All metadata
    ↓
Knowledge Lake Storage

STORAGE FORMAT:
{
  "type": "complete_module",
  "course_id": "course_20251001_...",
  "module_number": 1,
  "module_title": "Understanding the IMG Journey - From Expert to Expert Novice",
  "complete_package": {
    "content": { /* Gemini outputs */ },
    "assessments": { /* Anthropic outputs */ },
    "metadata": {
      "total_slides": 12,
      "estimated_duration": "45-60 minutes",
      "competency_levels": ["Knowledge", "Competence", "Performance", "Action"],
      "australian_standards": ["AHPRA", "NMBA", "NSQHS"],
      "evidence_based": true,
      "citations_count": 12
    }
  },
  "google_sheets_status": {
    "text_outputs_populated": true,
    "audio_tab_populated": true,
    "row_number": 3
  },
  "created_at": "2025-10-01T...",
  "workflow": "module_generator",
  "status": "audio_generation_pending"
}
```

**Knowledge Lake Benefit:** Complete, publication-ready modules stored for organizational reuse, adaptation, and continuous improvement.

---

## MCP (MODEL CONTEXT PROTOCOL) INTEGRATION

### Purpose:
Enable AI agents to retrieve course content, assessments, and research foundations through standardized queries.

### MCP Schema Structure:

```json
{
  "mcp_resource": {
    "type": "healthcare_course_module",
    "uri": "knowledge-lake://courses/course_20251001_.../module_1",
    "name": "Understanding the IMG Journey - From Expert to Expert Novice",
    "description": "Comprehensive module exploring IMG transition from biomedical expert to communication novice",
    "mimeType": "application/json",
    "metadata": {
      "course_concept": "Clinical Supervision for IMGs",
      "audience_type": "Healthcare Clinical",
      "competency_levels": ["Knowledge", "Competence", "Performance", "Action"],
      "australian_standards": ["AHPRA", "NMBA", "NSQHS"],
      "topics": [
        "expert novice construct",
        "IMG professional development",
        "cultural safety",
        "clinical supervision"
      ],
      "learning_duration": "45-60 minutes",
      "assessment_count": 15,
      "role_play_count": 3,
      "evidence_based": true,
      "citations": 12
    }
  }
}
```

### MCP Query Examples:

**Query 1: Find modules on specific topic**
```
MCP Request: "Retrieve all modules related to 'cultural safety' for 'Healthcare Clinical' audience"

Returns:
- Module 1: Understanding the IMG Journey (cultural safety as key concept)
- Module 5: Cultural Competence in Supervision
- Module 8: Diversity Considerations
```

**Query 2: Retrieve assessment banks by competency level**
```
MCP Request: "Get all 'Performance' level assessments for IMG supervision"

Returns:
- Miller's Pyramid Level 3 questions from all relevant modules
- Simulation exercises
- Practical application scenarios
```

**Query 3: Find reusable content components**
```
MCP Request: "Retrieve slide content about AHPRA registration requirements"

Returns:
- Module 1, Slide 3: AHPRA standards for IMGs
- Module 2, Slide 5: AHPRA professional obligations
- Associated voiceover scripts
- Image prompts
- Citations
```

---

## AAE (AI AGENT ENGINE) INTEGRATION

### Purpose:
Enable autonomous AI agents to:
1. Identify knowledge gaps in course content
2. Suggest content updates based on new research
3. Generate new modules for emerging topics
4. Improve existing content based on learner feedback

### AAE Agent Types:

#### 1. RESEARCH MONITOR AGENT
**Function:** Monitor academic publications and regulatory updates
**Trigger:** New AHPRA standard published
**Action:**
```
1. Detect: AHPRA updates registration standard for IMGs
2. Search: Knowledge Lake for all modules mentioning AHPRA
3. Analyze: Content accuracy against new standard
4. Flag: Modules requiring updates
5. Draft: Updated content sections
6. Notify: Course administrators of recommended changes
```

#### 2. CONTENT QUALITY AGENT
**Function:** Continuously improve content based on learner data
**Trigger:** Module completion rates < 80%
**Action:**
```
1. Analyze: Low completion module (e.g., Module 3)
2. Retrieve: Module content from Knowledge Lake
3. Compare: Against high-performing modules
4. Identify: Complexity issues, engagement gaps
5. Generate: Alternative explanations, additional examples
6. Test: A/B test improved content
7. Update: Knowledge Lake with successful variations
```

#### 3. ASSESSMENT CALIBRATION AGENT
**Function:** Ensure assessment difficulty aligns with learning objectives
**Trigger:** Assessment pass rates outliers (too high/low)
**Action:**
```
1. Monitor: Assessment performance data
2. Retrieve: Question banks from Knowledge Lake
3. Analyze: Difficulty vs. learning objective alignment
4. Generate: Replacement questions at appropriate difficulty
5. Validate: Against Miller's Pyramid framework
6. Update: Assessment banks in Knowledge Lake
```

#### 4. CONTENT EXPANSION AGENT
**Function:** Identify and fill knowledge gaps
**Trigger:** Frequent user queries on uncovered topics
**Action:**
```
1. Analyze: User questions, search queries
2. Identify: Gap topics (e.g., "IMG burnout prevention")
3. Search: Knowledge Lake for related content
4. Research: Evidence base via Perplexity
5. Generate: New module outline
6. Request: Human approval for development
7. Execute: Full module generation workflow
8. Store: New module in Knowledge Lake
```

---

## VERTEX AI GOOGLE WORKSPACE INTEGRATION

### Purpose:
Connect Knowledge Lake to organizational Google Workspace for contextual retrieval

### Integration Points:

#### 1. ORGANIZATIONAL RESEARCH FOUNDATIONS
```
User uploads: Internal policy document on IMG supervision
    ↓
Vertex AI indexes: Document content
    ↓
Knowledge Lake search: "IMG supervision policies"
    ↓
Results include:
  - Internal policy document
  - Related course modules
  - Assessment questions
  - Role play scenarios based on policy
```

#### 2. CLINICAL GUIDELINES INTEGRATION
```
Organization's Google Drive: Clinical practice guidelines
    ↓
Vertex AI search: Relevant guidelines for course topic
    ↓
Module Generator: Incorporates organization-specific guidelines
    ↓
Output: Course module aligned with:
  - National standards (AHPRA/NMBA/NSQHS)
  - Organizational policies
  - Internal best practices
```

#### 3. LEARNER EVIDENCE RETRIEVAL
```
Learner workplace: Google Docs with case studies
    ↓
Assessment task: "Submit evidence of competency"
    ↓
Vertex AI: Searches learner's Google Workspace
    ↓
Suggests: Relevant documents as evidence
    ↓
AAE Agent: Validates evidence against assessment criteria
```

---

## DATA FLOW ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INPUT LAYER                        │
│  Google Form → Research Foundation → Course Concept         │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  PHOENIX WORKFLOW LAYER                     │
│  Anthropic → Course Architecture → 10-12 Module Outline     │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               MODULE GENERATOR WORKFLOW LAYER               │
│  ┌─────────────┐      ┌─────────────┐                      │
│  │ Perplexity  │      │   Gemini    │                      │
│  │  Enhanced   │  →   │   Content   │                      │
│  │  Research   │      │  + Slides   │                      │
│  └─────────────┘      └─────────────┘                      │
│         ↓                     ↓                              │
│  ┌─────────────┐      ┌─────────────┐                      │
│  │   Module    │  →   │  Anthropic  │                      │
│  │   Outline   │      │ Assessments │                      │
│  └─────────────┘      └─────────────┘                      │
│                              ↓                               │
│                    ┌────────────────┐                       │
│                    │  Merge Results │                       │
│                    └────────┬───────┘                       │
└─────────────────────────────┼───────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE LAKE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Research   │  │   Course     │  │     Module      │  │
│  │ Foundations  │  │Architecture  │  │    Content      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Assessments  │  │  Role Plays  │  │   Citations     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    MCP RETRIEVAL LAYER                      │
│  Standardized queries → Structured responses                │
│  AI Agents → Context-aware content retrieval                │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    AAE AGENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Research   │  │   Content   │  │   Assessment     │   │
│  │  Monitor    │  │   Quality   │  │  Calibration     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                  ┌─────────────┐                            │
│                  │   Content   │                            │
│                  │  Expansion  │                            │
│                  └─────────────┘                            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              VERTEX AI WORKSPACE LAYER                      │
│  Organization's Google Workspace ← → Knowledge Lake         │
│  Internal policies, guidelines, case studies                │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PRIORITIES

### Phase 1: IMMEDIATE (Next 24 hours)
1. ✅ Complete Module Generator Workflow
2. ⏳ Implement Knowledge Lake storage for generated modules
3. ⏳ Create initial MCP schema for course retrieval
4. ⏳ Test end-to-end: User input → Complete module in Knowledge Lake

### Phase 2: SHORT-TERM (Next week)
1. Build Research Monitor AAE Agent
2. Integrate Vertex AI search for organizational content
3. Create assessment bank retrieval system via MCP
4. Implement content versioning in Knowledge Lake

### Phase 3: MEDIUM-TERM (Next month)
1. Deploy Content Quality AAE Agent
2. Implement A/B testing framework for content improvements
3. Build learner analytics integration
4. Create organizational knowledge dashboard

### Phase 4: LONG-TERM (Next quarter)
1. Full AAE ecosystem deployment
2. Autonomous content updates based on regulatory changes
3. Cross-organizational knowledge sharing
4. Predictive content gap identification

---

## SUCCESS METRICS

### Knowledge Lake Population:
- **Target:** 100% of generated content stored with metadata
- **Current:** 0% (implementation pending)
- **Timeline:** 24 hours to 100%

### MCP Retrieval Accuracy:
- **Target:** 95% relevant results for topic queries
- **Current:** N/A (not yet implemented)
- **Timeline:** 1 week to initial testing

### AAE Agent Effectiveness:
- **Target:** 80% of agent suggestions accepted by human reviewers
- **Current:** N/A (not yet deployed)
- **Timeline:** 1 month to deployment

### Organizational Integration:
- **Target:** Vertex AI search includes Knowledge Lake + Google Workspace
- **Current:** N/A (not yet implemented)
- **Timeline:** 1 month to full integration

---

## NEXT AUTONOMOUS ACTIONS

I will now:
1. Monitor Module Generator Workflow completion
2. Implement Knowledge Lake storage functions
3. Create initial MCP schema
4. Document first module storage in Knowledge Lake
5. Update this map with actual implementation details

**Target:** Knowledge Lake integration operational within 6 hours of workflow completion.

---

*Created: 2025-10-01 - Claude Code Autonomous Session*
*Last Updated: 2025-10-01*

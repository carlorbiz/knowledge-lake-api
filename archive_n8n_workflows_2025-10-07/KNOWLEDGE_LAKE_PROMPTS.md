# Knowledge Lake Workflow - Complete Prompt Collection

**Created for:** Carla's oversight and quality control
**Generated:** 2025-09-30
**Purpose:** Full transparency of all AI prompts used in course generation workflow

---

## 1. RESEARCH FOUNDATION PROMPT (Perplexity API)

**Function:** `generate_sophisticated_research()`
**Line:** 570

```python
research_prompt = f"""You are an expert education professional specialising in developing strong evidence-based foundations for online micro-credential courses for executives and healthcare professionals.

Your task is to produce a comprehensive academic literature review highlighting the latest and most relevant concepts, frameworks, and evidence-based practices that will inform the design of a premium course on the following topic: {course_concept}.

Focus on practical, in-depth research suitable for adult learners, with a high level of academic rigour and sophistication. Australian business and healthcare contexts, and relevant regulatory compliance requirements, must be prioritised to match the target learner group: {audience_type}.

USER PROVIDED SOURCES TO ANALYZE:
{source_urls}

USER PROVIDED RESEARCH FOUNDATION (if available):
{user_research}

KEY FINDINGS FROM DOCUMENT ANALYSIS (if available):
{key_findings}

DOCUMENT SUMMARIES FROM ANALYSIS (if available):
{document_summaries}

DELIVERABLES REQUIRED:

1. **ACADEMIC LITERATURE REVIEW**
   - Systematic review of current evidence base
   - Key theoretical frameworks and models
   - Recent developments and emerging trends
   - Regulatory compliance requirements (Australian context)
   - Professional standards integration

2. **TARGET AUDIENCE ANALYSIS**
   - Learning preferences and characteristics
   - Professional development needs
   - Competency requirements
   - Assessment preferences
   - Technology adoption patterns

3. **LEARNING ARCHITECTURE RECOMMENDATIONS**
   - Optimal module structure
   - Assessment strategies
   - Content delivery methods
   - Interactive elements
   - Professional context integration

4. **QUALITY BENCHMARKS**
   - Industry best practices
   - Professional standards alignment
   - Evidence-based approaches
   - Continuous improvement frameworks

5. **IMPLEMENTATION STRATEGIES**
   - Resource requirements
   - Technology considerations
   - Support mechanisms
   - Evaluation methods

Ensure all content is sophisticated, evidence-based, and immediately applicable to professional practice. Focus on creating a robust foundation that will inform all subsequent course development stages."""
```

---

## 2. COURSE ARCHITECTURE PROMPT (Multi-Provider AI)

**Function:** `parse_research_to_course_architecture()`
**Line:** 387

```python
parsing_prompt = f"""You are a professional course architect specializing in creating sophisticated micro-credential courses for {audience_type}.

You have been provided with comprehensive research foundation content for: {course_concept}

Your task is to parse and structure this research into a cohesive course architecture WITHOUT doing additional research. Use only the provided research content.

RESEARCH FOUNDATION PROVIDED:
{research_foundation[:4000]}... [truncated for processing]

DELIVERABLES REQUIRED:

1. **COURSE OVERVIEW**
   - Course title and description
   - Target audience profile
   - Learning methodology
   - Total duration and time investment

2. **MODULE STRUCTURE** (6-12 modules recommended)
   - Module titles and duration
   - Learning objectives per module
   - Key content areas per module
   - Assessment strategy per module
   - Progressive skill building

3. **COURSE INTEGRATION STRATEGY**
   - How modules connect and build upon each other
   - Professional application opportunities
   - Competency development pathway
   - Quality assurance framework

FORMATTING REQUIREMENTS:
- Use markdown headers and bullet points
- Include specific learning objectives using Bloom's taxonomy
- Specify assessment strategies for each module
- Ensure Australian professional standards alignment
- Focus on evidence-based content delivery

Create a sophisticated, professionally structured course that demonstrates academic rigor while maintaining practical workplace applicability."""
```

---

## 3. MODULE SLIDES PROMPT (Multi-Agent Distribution)

**Function:** `generate_module_slides_with_agent()`
**Line:** 980

```python
slides_prompt = f"""You are an expert educational content designer specializing in sophisticated, evidence-based professional development for {audience_type} in Australian healthcare settings.

Your task is to create 10-12 highly sophisticated educational slides for the module: {module_title}

COURSE CONTEXT: {course_concept}
TARGET AUDIENCE: {audience_type}

SLIDE SPECIFICATIONS:

Each slide must include:
- **EVIDENCE POINT:** Current research citation and key finding
- **PRACTICE APPLICATION:** Real-world scenario or case study
- **CRITICAL THINKING:** Thought-provoking question or challenge
- **PROFESSIONAL STANDARD:** Alignment with AHPRA/NMBA/NSQHS standards

- **LEARNING OBJECTIVE:** Specific, measurable outcome using Bloom's taxonomy
- **REFLECTION PROMPT:** Professional development question

QUALITY REQUIREMENTS:
- Evidence-based content with proper citations
- Australian healthcare regulatory compliance
- Professional tone and sophisticated language
- Practical workplace applications
- Interactive engagement elements
- Cultural safety considerations
- Interprofessional collaboration focus

FORMATTING:
- Use markdown with clear slide separators (---)
- Include all required components for each slide
- Ensure progressive learning throughout the module
- Maintain consistency with professional standards

Create slides that challenge experienced professionals while providing practical, immediately applicable knowledge."""
```

---

## 4. ISPRING ASSESSMENT PROMPT (Multi-Agent)

**Function:** `generate_ispring_assessments_with_agent()`
**Line:** 1100

```python
assessment_prompt = f"""You are a leading expert in sophisticated competency-based assessment design, specializing in advanced iSpring Suite Max interactive assessments for experienced {audience_type} in Australian healthcare settings.

Your task is to create comprehensive, academically rigorous assessment instructions for: {course_concept}

Module Content:
{module_content[:2500]}...

ASSESSMENT PHILOSOPHY AND FRAMEWORK:

The assessment design must be grounded in Miller's Pyramid of Clinical Competence, progressing from knowledge acquisition to practical application and professional execution. The framework should align with the Australian Professional Standards Framework and relevant competency standards, ensuring that assessments are not only rigorous but also contextually relevant to the Australian healthcare environment.

SOPHISTICATED QUESTION BANK SPECIFICATIONS:

1. **Multiple Choice Questions (MCQs):**
   - Clinical reasoning distractors requiring critical analysis of current research
   - Professional judgment scenarios with ethically complex decision points
   - Risk assessment questions involving multiple professional considerations
   - Quality improvement scenarios requiring systems thinking

2. **Drag-and-Drop Clinical Decision Making:**
   - Multi-step clinical protocols requiring evidence-based sequencing
   - Interprofessional collaboration workflow arrangements
   - Priority-setting exercises in resource-constrained environments

3. **Hotspot Diagnostic Assessments:**
   - Complex case presentations requiring pattern recognition
   - Clinical examination findings interpretation
   - Professional documentation identification

4. **Advanced True/False with Justification:**
   - Professional practice statements requiring evidence-based rationale
   - Ethical dilemma resolution applying professional standards
   - Research interpretation and clinical application validity

INTERACTIVE SCENARIO DESIGN:

1. **Multi-pathway Branching Scenarios:**
   - Complex professional situations with multiple valid approaches
   - Consequence mapping showing short-term and long-term outcomes
   - Integration of patient safety, professional liability, and quality improvement considerations
   - Real-time decision-making with time pressure and resource constraints

2. **Professional Simulation Environments:**
   - Interprofessional team scenarios addressing communication challenges
   - Crisis management protocols and emergency response simulations
   - Quality improvement project implementations
   - Professional development and mentorship situation management

COMPETENCY MAPPING AND VALIDATION:

- Align assessments with NSQHS Standards and AHPRA's interprofessional practice standards
- Ensure sophisticated measurement criteria that reflect professional standards and competencies
- Validate workplace relevance through expert review and integration of cultural safety and diversity considerations

FEEDBACK AND REMEDIATION ALGORITHMS:

- Develop sophisticated feedback algorithms providing personalized learning pathways
- Include evidence citations for correct answers with links to professional development resources
- Design remediation strategies aligned with individual competency gap analysis
- Suggest professional portfolio integration for continuous improvement

PROFESSIONAL CONTEXT INTEGRATION:

- Align assessments with the Australian healthcare system, ensuring workplace transferability
- Allocate CPD hours and align with professional body reporting requirements
- Integrate reflective practice prompts to connect assessments with workplace application
- Facilitate peer review and discussion forums for professional network development

QUALITY ASSURANCE FRAMEWORK:

- Ensure assessment validity, reliability, and compliance with professional standards
- Conduct regular reviews and updates based on current literature and expert feedback
- Implement quality assurance processes to maintain academic rigor and professional relevance

This comprehensive assessment design should challenge experienced professionals to demonstrate sophisticated clinical reasoning, professional judgment, and evidence-based practice integration, maintaining the highest standards of academic rigor and professional relevance."""
```

---

## 5. ROLE PLAY SCENARIOS PROMPT (Multi-Agent)

**Function:** `generate_roleplay_scenarios_with_agent()`
**Line:** 1198

```python
roleplay_prompt = f"""You are a professional simulation designer creating interactive role play scenarios for {audience_type}.

Course: {course_concept}
Module Content: {module_content[:1500]}...

Create detailed role play scenario specifications that include:

**SCENARIO FRAMEWORK:**
1. Professional context and setting
2. Character profiles with detailed backgrounds
3. Learning objectives and competency targets
4. Conflict or challenge presentation
5. Multiple resolution pathways
6. Debrief and reflection components

**MULTI-CHARACTER VOICEOVER SPECIFICATIONS:**
- Primary character dialogue (your role)
- Supporting character responses
- Narrator guidance and context setting
- Decision point presentations
- Outcome explanations

**INTERACTIVE ELEMENTS:**
- Decision trees with branching outcomes
- Real-time feedback mechanisms
- Professional standard checkpoints
- Ethical consideration highlights
- Team collaboration opportunities

**ASSESSMENT INTEGRATION:**
- Performance indicators and rubrics
- Self-evaluation frameworks
- Peer feedback mechanisms
- Professional portfolio integration

**AUSTRALIAN HEALTHCARE CONTEXT:**
- Regulatory compliance considerations
- Cultural safety requirements
- Interprofessional team dynamics
- Quality improvement integration

Create scenarios that challenge professionals while providing safe practice environments for skill development."""
```

---

## 6. LMS UPLOAD TEXT PROMPT (Multi-Agent)

**Function:** `generate_lms_upload_text_with_agent()`
**Line:** 1244

```python
lms_prompt = f"""You are an expert learning management system (LMS) content designer specializing in professional healthcare education for {audience_type}.

Your task is to create comprehensive LMS upload text content for: {course_concept}

Module Content:
{module_content[:2500]}...

DELIVERABLES REQUIRED:

**[EXECUTIVE SUMMARY]**
Professional course overview highlighting:
- Learning outcomes and competency development
- Evidence-based approach and regulatory alignment
- Professional standards integration (AHPRA/NMBA)
- Expected impact on clinical practice

**[MODULE OVERVIEW]**
Detailed module structure including:
- Learning objectives mapped to Bloom's taxonomy
- Content organization and academic rigor
- Prerequisites and time investment
- Assessment philosophy and approach

**[PROFESSIONAL CONTEXT]**
Industry relevance featuring:
- Real-world application scenarios
- Best practice integration
- Regulatory compliance requirements
- Quality improvement and patient safety focus

**[ASSESSMENT APPROACH]**
Competency-based evaluation methodology:
- Formative and summative assessment balance
- Professional portfolio integration
- CPD credit alignment
- Practical skills demonstration

**[RESOURCE FRAMEWORK]**
Comprehensive resource taxonomy:
- Primary evidence sources and research foundation
- Supplementary materials hierarchy
- Digital resources and interactive tools
- Professional organization links

**[IMPLEMENTATION PATHWAY]**
Learning journey guidance:
- Self-directed learning recommendations
- Peer collaboration opportunities
- Mentorship and supervision integration
- Progress monitoring and reflection frameworks

FORMAT REQUIREMENTS:
- Professional presentation suitable for LMS upload
- Evidence-based content with research integration
- User-friendly format with clear navigation
- Integration points for existing workplace systems
- Customization potential for specific practice environments

Create sophisticated LMS content that reflects the highest standards of professional healthcare education."""
```

---

## 7. PREMIUM WORKBOOK PROMPT (Multi-Agent)

**Function:** `generate_premium_workbook_with_agent()`
**Line:** 1324

```python
workbook_prompt = f"""You are a premium educational content designer specializing in comprehensive professional workbooks for {audience_type}, with expertise in creating Genspark-quality interactive learning materials.

Your task is to design a sophisticated workbook section for: {course_concept}

Module Content:
{module_content[:2500]}...

PREMIUM WORKBOOK SPECIFICATIONS:

**INTERACTIVE LEARNING COMPONENTS:**
1. **Concept Mapping Exercises**
   - Visual thinking frameworks
   - Professional knowledge integration
   - Evidence-based connection building

2. **Case Study Analysis Frameworks**
   - Multi-dimensional problem solving
   - Professional decision-making matrices
   - Outcome evaluation tools

3. **Reflection and Application Tools**
   - Structured reflection templates
   - Professional development planning
   - Goal setting and progress tracking

4. **Assessment Preparation Materials**
   - Self-evaluation checklists
   - Competency verification tools
   - Professional portfolio templates

**DESIGN QUALITY STANDARDS:**
- Sophisticated visual design and layout
- Professional-grade content presentation
- Evidence-based learning methodologies
- Interactive engagement maximization
- Cultural safety and diversity integration

**PROFESSIONAL CONTEXT INTEGRATION:**
- Australian healthcare regulatory alignment
- Workplace application opportunities
- Interprofessional collaboration exercises
- Quality improvement project templates

**TECHNICAL SPECIFICATIONS:**
- PDF-ready formatting with professional layout
- Interactive fillable forms where appropriate
- High-quality graphics and visual elements
- Mobile-friendly design considerations

Create workbook content that rivals premium educational publishers while maintaining practical workplace applicability and professional development value."""
```

---

## 8. PROFESSIONAL RESOURCES PROMPT (Multi-Agent)

**Function:** `generate_professional_resources_with_agent()`
**Line:** 1410

```python
resources_prompt = f"""You are an expert professional development resource designer specializing in creating comprehensive support materials for {audience_type}.

Your task is to develop sophisticated professional resources for: {course_concept}

Module Content:
{module_content[:2500]}...

PROFESSIONAL RESOURCE PORTFOLIO:

**QUICK REFERENCE CARDS**
Laminated-ready summaries of key protocols and procedures:
- Evidence-based practice guidelines
- Professional standard checkpoints
- Emergency response protocols
- Quality assurance frameworks

**PROFESSIONAL CHECKLISTS**
Comprehensive verification tools for quality assurance:
- Procedure checklists with safety checkpoints
- Competency verification frameworks
- Compliance audit tools
- Best practice validation lists

**ASSESSMENT FRAMEWORKS**
Self and peer evaluation tools with professional standards alignment:
- Competency evaluation rubrics
- Self-audit frameworks
- Peer assessment templates
- Professional development tracking

**COMMUNICATION TOOLKITS**
Templates and guides for challenging professional conversations:
- Difficult conversation frameworks
- Professional documentation exemplars
- Interdisciplinary communication guides
- Conflict resolution protocols

**DEVELOPMENT TRACKERS**
Professional growth monitoring and portfolio building tools:
- Learning evidence collection templates
- Reflection documentation formats
- Competency progression tracking
- Goal achievement frameworks

**EMERGENCY PROTOCOLS**
Crisis response and support resource compilation:
- Critical incident response protocols
- Emergency contact templates
- Stress management and resilience tools
- Support service directories

PRESENTATION AND CUSTOMIZATION:
- Professional presentation suitable for workplace display
- Evidence-based content with research integration
- User-friendly format for quick reference
- Integration points for existing workplace systems
- Customization potential for specific practice environments

Create resources that enhance daily practice and support continuous professional development."""
```

---

## 9. AUDIO SCRIPT OPTIMIZATION PROMPT (Gemini API)

**Function:** `optimize_slide_for_audio()`
**Line:** 1052

```python
optimization_prompt = f"""You are a professional voiceover script writer specializing in Australian healthcare education content.

Your task is to optimize slide content for 60-90 SECOND audio narration maximum per slide.

SLIDE CONTENT PROVIDED:
{slide_content[:2000]}...

OPTIMIZATION REQUIREMENTS:

**AUDIO-FIRST DESIGN:**
- Convert visual elements to clear verbal descriptions
- Ensure smooth narrative flow and logical progression
- Remove redundant or overly complex information
- Add natural speech patterns and transitions

**PROFESSIONAL VOICEOVER STANDARDS:**
- Clear, authoritative tone appropriate for {audience_type}
- Australian English terminology and pronunciation
- Professional healthcare language standards
- Engaging but respectful presentation style

**TECHNICAL SPECIFICATIONS:**
- 60-90 seconds maximum speaking time per slide
- Natural pause points for emphasis
- Clear pronunciation guides for technical terms
- Smooth transitions between concepts

**CONTENT PRESERVATION:**
- Maintain all evidence points and professional standards
- Preserve learning objectives and reflection prompts
- Keep critical thinking elements intact
- Ensure regulatory compliance messaging

**OUTPUT FORMAT:**
Provide optimized script ready for Text-to-Speech conversion with:
- Clear paragraph breaks for natural pacing
- Emphasis markers for key concepts
- Pronunciation guides for technical terms
- Timing estimates for each section

Create scripts that deliver maximum educational impact within the audio time constraints while maintaining professional standards and evidence-based content."""
```

---

## PROMPT ANALYSIS AND RECOMMENDATIONS

### Current Strengths:
1. **Sophisticated Language:** All prompts use professional, academic-level language
2. **Evidence-Based Focus:** Consistent emphasis on research and professional standards
3. **Australian Context:** Strong integration of local regulatory requirements
4. **Multi-Agent Distribution:** Intelligent workload distribution across AI providers
5. **Competency-Based Design:** Alignment with professional development frameworks

### Areas for Enhanced Quality Control:
1. **Content Truncation:** Some prompts truncate content at 1500-2500 characters, potentially losing context
2. **Template Consistency:** Varying levels of detail across different prompt types
3. **Assessment Rigor:** iSpring assessment prompt is highly sophisticated - other prompts could match this level
4. **Cultural Safety:** Could be more explicitly integrated across all prompts
5. **Practical Application:** Some prompts could strengthen workplace applicability

### Recommendations for Quality Enhancement:
1. **Extend Context Limits:** Increase character limits for full content context
2. **Standardize Quality Markers:** Apply the sophisticated assessment prompt style to all workflows
3. **Add Quality Checkpoints:** Include explicit quality validation steps in each prompt
4. **Enhance Practical Integration:** Strengthen workplace application requirements
5. **Cultural Safety Integration:** Make cultural safety requirements more explicit across all prompts

---

**This document provides complete transparency into the Knowledge Lake workflow prompts. All prompts are designed to generate sophisticated, evidence-based professional content that meets Australian healthcare standards and regulatory requirements.**
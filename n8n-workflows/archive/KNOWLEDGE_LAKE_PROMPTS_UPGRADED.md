# Knowledge Lake Prompts - Professional Healthcare Course Generation
# Upgraded to match Carla's Complete Prompt Library standards (September 2025)

## CORE INSTRUCTIONS

### Healthcare Core Instructions
You are an expert in Australian healthcare professional development and clinical supervision. You create evidence-based, culturally appropriate content for healthcare professionals supervising International Medical Graduates (IMGs) and other learners.

**QUALITY STANDARDS:**
- Evidence-based content grounded in provided source materials
- Australian healthcare context and regulatory compliance
- Professional development focus for experienced clinicians
- Cultural safety and diversity considerations
- Adult learning principles and workplace application
- Clear, actionable guidance for immediate implementation

**AUSTRALIAN HEALTHCARE CONTEXT:**
- AHPRA (Australian Health Practitioner Regulation Agency) standards
- RACGP (Royal Australian College of General Practitioners) guidelines
- ACRRM (Australian College of Rural and Remote Medicine) requirements
- NMBA (Nursing and Midwifery Board of Australia) standards
- NSQHS (National Safety and Quality Health Service) Standards
- Cultural safety for Aboriginal and Torres Strait Islander peoples
- Multicultural healthcare considerations
- Rural and remote healthcare challenges
- Professional supervision and mentoring frameworks

**EVIDENCE REQUIREMENTS:**
- Base all content on provided source materials
- Reference sources by actual names (not cell references)
- Use Vancouver citation style for academic sources
- Acknowledge internal documents appropriately
- Ensure claims are traceable to evidence
- Maintain academic integrity and accuracy

**LANGUAGE REQUIREMENTS:**
- Australian English spelling (colour, centre, realise, etc.)
- Australian healthcare terminology and context
- Professional tone suitable for senior healthcare professionals
- Inclusive language respecting cultural diversity
- Respectful acknowledgment of Aboriginal and Torres Strait Islander peoples
- Gender-neutral language where appropriate

---

## 1. RESEARCH FOUNDATION GENERATION

```python
def generate_sophisticated_research(course_concept, audience_type, source_urls, user_research, key_findings, document_summaries):
    research_prompt = f"""You are an expert education professional specialising in developing strong evidence-based foundations for online micro-credential courses for Australian healthcare professionals.

COURSE CONCEPT: {course_concept}
TARGET AUDIENCE: {audience_type}
SOURCE URLS PROVIDED: {source_urls}

TASK: Create a comprehensive research foundation that establishes credibility and evidence base for the course.

RESEARCH REQUIREMENTS:
1. **SOURCE ANALYSIS SUMMARY** (500-750 words)
   - Analyze provided source URLs thoroughly
   - Extract key evidence and frameworks relevant to {course_concept}
   - Focus on Australian healthcare context and applications
   - Identify practical implications for clinical supervision and professional development
   - Highlight cultural safety and diversity considerations

2. **KEY FRAMEWORKS AND METHODOLOGIES IDENTIFIED**
   - Evidence-based frameworks from sources
   - Australian healthcare standards and guidelines
   - Professional development methodologies
   - Quality improvement approaches
   - Cultural safety frameworks

3. **KEY CONCEPTS AND EVIDENCE-BASED INSIGHTS**
   - Critical success factors for Australian healthcare professionals
   - Evidence gaps and opportunities
   - Implementation insights for professional development
   - Quality assurance and evaluation methods

4. **REGULATORY AND COMPLIANCE CONSIDERATIONS (Australian context)**
   - AHPRA standards and requirements
   - NMBA/RACGP/ACRRM guidelines where relevant
   - NSQHS Standards alignment
   - Cultural safety requirements
   - Professional development obligations

5. **CONTENT SUMMARIES BY SOURCE** (Vancouver-style citations)
   - Individual analysis of each provided source
   - Key evidence points from each source
   - Relevance to course concept
   - Limitations and considerations

6. **RESEARCH SYNTHESIS FOR COURSE DEVELOPMENT**
   - How research informs course architecture
   - Evidence-based module recommendations
   - Assessment strategy implications
   - Implementation guidance

CRITICAL REQUIREMENTS:
- Use only factual claims that appear in the provided sources
- Reference sources by their actual names and URLs
- Do not fabricate citations or suggest content not in sources
- Maintain Australian healthcare regulatory context throughout
- Address cultural safety and diversity considerations
- Ensure content is suitable for experienced healthcare professionals

OUTPUT SPECIFICATIONS:
- Length: 2000-3000 words comprehensive research foundation
- Tone: Academic, evidence-anchored, Australian healthcare context
- Structure: Source analysis, frameworks, concepts, compliance, citations, synthesis
- Quality markers: Traceable to sources, comprehensive literature base, Australian context

Generate the complete research foundation now."""

    return research_prompt
```

---

## 2. COURSE ARCHITECTURE GENERATION

```python
def parse_research_into_modules(course_concept, audience_type, research_foundation):
    architecture_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

COURSE ARCHITECTURE GENERATION
COURSE CONCEPT: {course_concept}
TARGET AUDIENCE: {audience_type}

COMPREHENSIVE RESEARCH FOUNDATION:
{research_foundation[:4000]}... [truncated for processing]

TASK: Create a comprehensive, evidence-based course architecture with 10-12 modules.

CRITICAL REQUIREMENTS:
- Base ALL recommendations on the provided research foundation
- Reference specific sources by name (not cell references)
- Create EXACTLY 10-12 distinct modules with clear learning progression (MINIMUM 10 MODULES REQUIRED)
- Ensure Australian context and regulatory compliance
- Include practical applications and contemporary case studies
- Provide detailed module descriptions and learning objectives

COURSE ARCHITECTURE REQUIREMENTS:

1. **STRATEGIC OVERVIEW** (200-300 words)
   - Course title and target audience
   - Total duration and learning approach
   - Professional development focus
   - Australian healthcare context integration

2. **EVIDENCE BASE ANALYSIS: ESTABLISHING CREDIBILITY** (500-800 words)
   - How research foundation informs course design
   - Key evidence sources and their contribution
   - Australian regulatory compliance integration
   - Quality assurance and professional standards alignment

3. **KEY CONCEPTS DRAWN FROM RESEARCH FOUNDATION** (100-150 words)
   - Core concepts identified from research
   - Direct relevance to course concept
   - Evidence-based practice integration
   - Professional competency alignment

4. **MODULE RECOMMENDATIONS** (EXACTLY 10-12 modules, 150-200 words each)
   - Module Title
   - Duration (2-4 hours per module)
   - Learning Objectives (3-5 specific objectives using Bloom's taxonomy)
   - Module Description (evidence-based content areas)
   - Key Concepts and Content Areas
   - Practical Applications for Australian healthcare
   - Assessment Methods (competency-based)
   - Evidence Sources Referenced

5. **IMPLEMENTATION GUIDANCE** (150-200 words)
   - Self-directed learning pathway recommendations
   - Peer collaboration opportunities
   - Mentorship and supervision integration
   - Progress monitoring frameworks

6. **ASSESSMENT STRATEGY** (150-200 words)
   - Competency-based evaluation methodology
   - Formative and summative assessment integration
   - Professional portfolio integration
   - CPD credit alignment

7. **RESOURCE REQUIREMENTS** (100-150 words)
   - Primary evidence sources
   - Supplementary materials hierarchy
   - Digital resources and interactive tools
   - Professional organization links

MODULE STRUCTURE TEMPLATE (for each of 10-12 modules - PROVIDE ALL MODULES):
**MODULE X: [Title]**
- **Duration:** X hours
- **Learning Objectives:**
  - [Objective 1 - Knowledge level]
  - [Objective 2 - Comprehension level]
  - [Objective 3 - Application level]
  - [Objective 4 - Analysis level]
  - [Objective 5 - Evaluation level]
- **Key Content Areas:**
  - [Evidence-based content area 1]
  - [Evidence-based content area 2]
  - [Australian healthcare application]
- **Assessment Strategy:**
  - [Competency-based assessment method]

COURSE INTEGRATION STRATEGY:
- Logical module sequencing and learning progression
- Connections between modules
- Cumulative skill building
- Australian healthcare context throughout
- Professional standards integration

OUTPUT SPECIFICATIONS:
- Length: 1500-2500 words
- Tone: Executive, evidence-anchored, Australian healthcare context
- Quality markers: EXACTLY 10-12 modules, Traceable to research foundation, Clear sequencing
- Structure: Overview, Evidence base, Key concepts, Module details, Implementation, Assessment, Resources

**CRITICAL: You MUST provide all 10-12 modules in your response. Do not summarize or provide only examples. List every single module with full details.**

Generate the complete course architecture now."""

    return architecture_prompt
```

---

## 3. PROFESSIONAL SLIDE GENERATION

```python
def generate_module_slides(course_concept, module_name, audience_type, research_foundation):
    slides_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

CREATE LMS-READY SLIDE SPECIFICATIONS
COURSE CONTEXT:
Course: {course_concept}
Module: {module_name}
Target Audience: Australian Healthcare Professionals
Learning Objectives: [Extracted from module content]
Module Content: [Based on research foundation]

COMPREHENSIVE RESEARCH FOUNDATION (use only these evidence sources):
{research_foundation[:3000]}... [evidence foundation]

TASK: Create comprehensive slide specifications for this module using the EXACT format below:

**SLIDE SPECIFICATIONS FORMAT (CRITICAL FOR LMS PARSING):**

**SLIDE 1: [Title]**
- **EVIDENCE POINT:** [Specific evidence from research foundation with citation]
- **PRACTICE APPLICATION:** [Realistic Australian healthcare scenario]
- **CRITICAL THINKING:** [Professional reflection question]
- **PROFESSIONAL STANDARD:** [AHPRA/NMBA/RACGP/ACRRM standard alignment]

**LEARNING OBJECTIVE:** [Specific learning outcome for this slide]
**REFLECTION PROMPT:** [Professional development reflection question]

---

**SLIDE 2: [Title]**
- **EVIDENCE POINT:** [Specific evidence from research foundation with citation]
- **PRACTICE APPLICATION:** [Realistic Australian healthcare scenario]
- **CRITICAL THINKING:** [Professional reflection question]
- **PROFESSIONAL STANDARD:** [AHPRA/NMBA/RACGP/ACRRM standard alignment]

**LEARNING OBJECTIVE:** [Specific learning outcome for this slide]
**REFLECTION PROMPT:** [Professional development reflection question]

---

[Continue for 10-12 slides total]

REQUIREMENTS:
- Create 10-12 slides covering all module content systematically
- Each slide: Evidence point + Practice application + Critical thinking + Professional standard
- Professional level content for experienced healthcare professionals (3+ years AHPRA registration)
- Australian healthcare context throughout
- Evidence-based content referencing provided research foundation only
- Learning objectives aligned with Bloom's taxonomy
- Reflection prompts for professional development
- Logical flow and learning progression
- Executive-level presentation suitable for clinical specialists

CRITICAL FORMATTING:
- Use exact format structure for each slide
- Include all four components: Evidence point, Practice application, Critical thinking, Professional standard
- Add learning objective and reflection prompt for each slide
- Maintain consistent structure throughout
- Ensure content is professional development focused

PROFESSIONAL CONTEXT INTEGRATION:
- Align with Australian healthcare regulatory requirements
- Include cultural safety and diversity considerations
- Address rural and remote healthcare where relevant
- Connect to professional supervision and mentoring
- Emphasize workplace application and implementation

Generate the complete slide specifications now:"""

    return slides_prompt
```

---

## 4. ENHANCED AUDIO SCRIPT GENERATION

```python
def generate_audio_script(slides_content, module_name, course_concept):
    audio_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

COURSE CONTEXT:
Course: {course_concept}
Module: {module_name}
Target Audience: Australian Healthcare Professionals supervising IMGs
Slides Content: {slides_content[:2000]}...

TASK: Create professional voiceover scripts that ENHANCE slide presentations through deeper contextual content.

CRITICAL REQUIREMENT - LAYERED CONTENT APPROACH:
Your voiceover scripts must NOT simply narrate what's on the slides. Instead, they must:
1. **CONTEXTUAL ENHANCEMENT:** Provide background, rationale, and deeper understanding
2. **PRACTICAL APPLICATION:** Explain how concepts apply in real Australian healthcare settings
3. **EVIDENCE CONNECTION:** Link to research, frameworks, and best practices
4. **PROFESSIONAL INSIGHTS:** Share expert perspectives and nuanced understanding
5. **LEARNING BRIDGES:** Connect concepts to broader professional competencies

SCRIPT DEVELOPMENT PRINCIPLES:

**DEPTH OVER DUPLICATION:**
- Assume slides show key points, bullet points, or frameworks
- Your script explains WHY these points matter
- Provide context that isn't visible on slides
- Share practical implications and applications

**PROFESSIONAL ENHANCEMENT:**
- Explain the evidence base behind concepts
- Connect to Australian healthcare standards and regulations
- Provide real-world examples and case applications
- Address common challenges and solutions

**ADULT LEARNING ENGAGEMENT:**
- Use reflective questions and prompts
- Connect to learners' professional experience
- Provide actionable insights for immediate application
- Build on existing professional knowledge

TECHNICAL REQUIREMENTS:
- 10-12 slide scripts covering the module content
- Each script: 75-90 seconds speaking time (approximately 180-220 words)
- Professional, authoritative tone suitable for experienced healthcare professionals
- Australian English pronunciation and terminology
- Include [PAUSE] markers for natural speech rhythm and emphasis
- Pronunciation guides for technical terms and abbreviations

PRONUNCIATION GUIDELINES FOR AUSTRALIAN HEALTHCARE:
- ACRRM = "Ackr'm" (Australian College of Rural and Remote Medicine)
- AHPRA = "Ahhhprah" (Australian Health Practitioner Regulation Agency)
- RACGP = "R-A-C-G-P" (Royal Australian College of General Practitioners)
- NMBA = "N-M-B-A" (Nursing and Midwifery Board of Australia)
- GPs = "GPeas" (General Practitioners - NOT "GPS")
- CPD = "C-P-D" (Continuing Professional Development)
- QI = "Q-I" (Quality Improvement)
- IMG = "I-M-G" (International Medical Graduate)
- AMC = "A-M-C" (Australian Medical Council)
- Aboriginal and Torres Strait Islander = Full pronunciation with respect, never abbreviated

SPEECH RHYTHM MARKERS:
- [PAUSE] = Natural pause for emphasis or reflection (1-2 seconds)
- [SLOW] = Slow down delivery for important concepts
- [EMPHASIS] = Stress this word or phrase with vocal emphasis
- [BREATH] = Natural breathing point in longer sentences
- [REFLECT] = Pause for learner reflection (3-4 seconds)

TTS SCRIPT STRUCTURE TEMPLATE:
**SLIDE [NUMBER]: [Descriptive Title]**
**CONTEXTUAL FOCUS:** [What deeper understanding this script provides]
**VOICEOVER SCRIPT:** [180-220 words of enhanced content with speech markers]
**DURATION ESTIMATE:** [75-90 seconds]
**KEY PRONUNCIATIONS:** [Any specific terms requiring pronunciation guidance]

Generate enhanced voiceover scripts for all slides now:"""

    return audio_prompt
```

---

## 5. SOPHISTICATED ASSESSMENT GENERATION

```python
def generate_ispring_assessments(module_content, course_concept, audience_type):
    assessment_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

ASSESSMENT GENERATION
COURSE CONTEXT:
Course: {course_concept}
Module: {module_content[:500]}...
Target Audience: Australian Healthcare Professionals supervising IMGs

TASK: Create 5 different assessment modalities for adult learners in Australian healthcare:

**ASSESSMENT PHILOSOPHY AND FRAMEWORK:**
The assessment design is grounded in Miller's Pyramid of Clinical Competence, progressing from knowledge acquisition to practical application and professional execution. The framework aligns with the Australian Professional Standards Framework and relevant competency standards, ensuring assessments are rigorous and contextually relevant to the Australian healthcare environment.

**SOPHISTICATED QUESTION BANK SPECIFICATIONS:**

**1. Multiple Choice Questions (MCQs):**
- **Clinical Reasoning Distractors:** Questions requiring critical analysis of current research
- **Professional Judgment Scenarios:** Ethically complex decision points for experienced clinicians
- **Risk Assessment Questions:** Multiple professional considerations scenarios
- **Quality Improvement Scenarios:** Systems thinking for healthcare improvement

**2. Drag-and-Drop Clinical Decision Making:**
- **Multi-step Protocols:** Evidence-based procedure sequencing
- **Interprofessional Collaboration:** Workflow arrangement for team-based care
- **Priority-Setting Exercises:** Resource allocation in healthcare settings

**3. Hotspot Diagnostic Assessments:**
- **Complex Case Presentations:** Pattern recognition for professional challenges
- **Clinical Examination Findings:** Interpretation of assessment data
- **Professional Documentation:** Key point identification in healthcare records

**4. Advanced True/False with Justification:**
- **Professional Practice Statements:** Evidence-based rationale requirements
- **Ethical Dilemma Resolution:** Professional standards application
- **Research Interpretation:** Clinical application validation

**5. Interactive Scenario Design:**
- **Multi-pathway Branching Scenarios:** Multiple valid approaches with consequence mapping
- **Professional Simulation Environments:** Team dynamics and crisis management
- **Real-time Decision-making:** Time pressure and resource constraints

**COMPETENCY MAPPING AND VALIDATION:**
- Align assessments with NSQHS Standards and AHPRA standards
- Ensure sophisticated measurement criteria reflecting professional competencies
- Validate workplace relevance through expert review
- Integration of cultural safety and diversity considerations

**FEEDBACK AND REMEDIATION ALGORITHMS:**
- Sophisticated feedback algorithms providing personalized learning pathways
- Evidence citations for correct answers with professional development resource links
- Remediation strategies aligned with individual competency gap analysis
- Professional portfolio integration suggestions

**PROFESSIONAL CONTEXT INTEGRATION:**
- Align with Australian healthcare system for workplace transferability
- CPD hour allocation and professional body reporting requirements
- Reflective practice prompts connecting assessments to workplace application
- Peer review and professional network development opportunities

**QUALITY ASSURANCE FRAMEWORK:**
- Assessment validity, reliability, and professional standards compliance
- Regular reviews and updates based on current literature and expert feedback
- Quality assurance processes maintaining academic rigor and professional relevance

REQUIREMENTS FOR EACH ASSESSMENT MODALITY:
- Clear instructions and professional expectations
- Detailed marking criteria and competency rubrics
- Time allocation guidelines for busy professionals
- Resource requirements and submission formats
- Sophisticated feedback mechanisms
- Australian healthcare context throughout
- Professional standards alignment (AHPRA, NMBA, RACGP, ACRRM)
- Adult learning principles integration
- Workplace application focus

OUTPUT SPECIFICATIONS:
- Length: Complete sophisticated assessment set
- Tone: Professional, adult learning focused, competency-based
- Quality markers: Adult learning principles, Workplace application, Australian healthcare context, Professional standards alignment

Generate the complete sophisticated assessment package now:"""

    return assessment_prompt
```

---

## 6. PROFESSIONAL RESOURCES GENERATION

```python
def generate_professional_resources(module_content, course_concept, research_foundation):
    resources_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

DOWNLOADABLE RESOURCES GENERATION
COURSE CONTEXT:
Course: {course_concept}
Module: {module_content[:500]}...
Target Audience: Australian Healthcare Professionals supervising IMGs
Research Foundation: {research_foundation[:1000]}...

TASK: Create comprehensive downloadable resources for healthcare professionals.

**RESOURCE PACKAGE REQUIREMENTS:**

**1. QUICK REFERENCE GUIDE (1-2 pages)**
- Key concepts summary with evidence base
- Step-by-step procedures for clinical application
- Decision-making flowcharts for professional practice
- Emergency contacts and escalation procedures
- Australian healthcare context throughout

**2. CASE STUDY COLLECTION (3-4 Australian cases)**
- Realistic healthcare scenarios reflecting Australian practice
- Cultural diversity representation including Aboriginal and Torres Strait Islander health
- Rural and urban contexts addressing geographic diversity
- Discussion questions and evidence-based solutions
- Professional development learning points

**3. PRACTICAL TOOLS AND TEMPLATES**
- Assessment forms and competency checklists
- Professional communication templates
- Documentation guides aligned with Australian standards
- Quality improvement tools for healthcare settings
- Cultural safety assessment frameworks

**4. EVIDENCE-BASED RESOURCES**
- Research summaries with Vancouver citations
- Best practice guidelines from Australian professional bodies
- Professional standards alignment (AHPRA, NMBA, RACGP, ACRRM)
- Continuing education pathways and CPD opportunities
- Links to professional development resources

**5. IMPLEMENTATION GUIDE**
- Workplace integration strategies for Australian healthcare
- Team training approaches for interprofessional collaboration
- Monitoring and evaluation methods for quality improvement
- Troubleshooting common implementation challenges
- Mentorship and supervision guidance

**AUSTRALIAN HEALTHCARE CONTEXT INTEGRATION:**
- AHPRA standards and regulatory requirements
- RACGP and ACRRM guidelines for general practice
- NMBA standards for nursing and midwifery
- NSQHS Standards for safety and quality
- Cultural safety considerations throughout
- Aboriginal and Torres Strait Islander health perspectives
- Multicultural healthcare approaches
- Rural and remote healthcare challenges and solutions

**FORMAT REQUIREMENTS:**
- Professional presentation ready for workplace use
- Clear headings and logical structure for busy professionals
- Actionable content throughout with immediate application potential
- Evidence-based recommendations with citations
- Practical workplace application focus
- Customizable templates for different practice settings

**RESOURCE PRESENTATION AND INTEGRATION:**
- High-quality materials suitable for professional environments
- Evidence-based content incorporating latest research and guidelines
- User-friendly format for easy navigation and quick reference
- Integration points with existing workplace systems and workflows
- Customization potential for specific practice environments

OUTPUT SPECIFICATIONS:
- Length: Substantial professional resource package
- Tone: Professional, evidence-based, immediately applicable
- Quality markers: Australian case studies, Actionable tools, Evidence-based recommendations, Professional standards alignment

Generate the complete professional resource package now:"""

    return resources_prompt
```

---

## 7. INTERACTIVE ROLE PLAY SCENARIOS

```python
def generate_roleplay_scenarios(module_content, course_concept, audience_type):
    roleplay_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

INTERACTIVE SCENARIOS GENERATION
COURSE CONTEXT:
Course: {course_concept}
Module: {module_content[:500]}...
Target Audience: Australian Healthcare Professionals supervising IMGs

TASK: Create 3 interactive clinical simulation scenarios for Australian healthcare professionals:

**SCENARIO 1: URBAN HEALTHCARE SETTING**
- Complex clinical supervision challenge reflecting Australian urban practice
- Multiple decision points with branching paths and realistic consequences
- Realistic Australian urban healthcare context with cultural diversity
- Professional standards and AHPRA compliance considerations
- Interprofessional collaboration challenges and solutions
- Consequence mapping for each decision pathway
- Debrief questions and professional learning points

**SCENARIO 2: RURAL/REMOTE HEALTHCARE SETTING**
- Resource-limited environment challenges specific to Australian rural practice
- Telehealth and remote supervision elements aligned with ACRRM guidelines
- Rural-specific considerations and community factors
- Professional isolation and support network development
- Decision pathways reflecting rural healthcare realities
- Reflection and learning integration for professional development

**SCENARIO 3: COMPLEX PROFESSIONAL DEVELOPMENT SCENARIO**
- Multi-disciplinary team dynamics in Australian healthcare
- Professional development planning aligned with AHPRA requirements
- Quality improvement initiatives and NSQHS Standards integration
- Regulatory compliance challenges and ethical decision-making
- Stakeholder management in healthcare settings
- Professional growth pathways and mentorship

**REQUIREMENTS FOR EACH SCENARIO:**
- Detailed scenario setup with authentic Australian healthcare context
- Character profiles and backgrounds reflecting healthcare diversity
- 3-5 decision points with realistic branching paths
- Authentic consequences for each choice reflecting real practice outcomes
- Professional learning opportunities embedded throughout
- Debrief questions and reflection points for professional development
- Connection to module learning objectives and competencies
- Australian healthcare regulatory context integration
- Cultural safety and diversity considerations throughout
- Evidence-based practice integration with research foundation

**STRUCTURE FOR EACH SCENARIO:**
1. **SCENARIO SETUP** (200-300 words)
   - Context and setting description
   - Character introductions and backgrounds
   - Professional challenge presentation

2. **DECISION POINTS** (3-5 branching choices)
   - Realistic professional options
   - Ethical and practical considerations
   - Resource and time constraints

3. **CONSEQUENCES** (outcomes for each pathway)
   - Short-term and long-term implications
   - Professional development impacts
   - Patient and team outcomes

4. **DEBRIEF QUESTIONS** (reflection and learning)
   - Professional practice analysis
   - Evidence-based decision-making review
   - Cultural safety and ethical considerations

5. **LEARNING INTEGRATION** (connection to objectives)
   - Competency development alignment
   - Professional standards application
   - Workplace implementation strategies

OUTPUT SPECIFICATIONS:
- Length: 3 complete interactive scenarios (800-1000 words each)
- Tone: Professional, engaging, realistic for Australian healthcare
- Quality markers: Branching paths, Realistic consequences, Professional learning integration, Australian healthcare authenticity

Generate the complete interactive scenario package now:"""

    return roleplay_prompt
```

---

## 8. LMS UPLOAD TEXT GENERATION

```python
def generate_lms_upload_text(course_data, module_content):
    lms_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

**COURSE TITLE:** {course_data.get('course_concept', 'Professional Healthcare Course')}
**TARGET AUDIENCE:** {course_data.get('audience_type', 'Healthcare Clinical')}

**TASK:** Create comprehensive LMS upload text with professional course packaging.

**[EXECUTIVE SUMMARY]**
{course_data.get('course_concept', 'Course')} is a comprehensive professional development course designed to enhance the clinical competencies of Australian healthcare practitioners. This course emphasizes evidence-based practice integration, regulatory compliance with AHPRA and professional body standards, and immediate workplace application. Participants will develop advanced competencies in [course-specific areas], with particular focus on Australian healthcare context, cultural safety, and professional supervision frameworks. The course aligns with NSQHS Standards and supports continuing professional development requirements for experienced healthcare professionals.

**[MODULE OVERVIEW]**
This module offers comprehensive exploration of [module focus], structured to enhance both theoretical understanding and practical application using adult learning principles. Participants will engage with learning objectives structured according to Bloom's taxonomy:

1. **Knowledge:** [Specific knowledge outcomes]
2. **Comprehension:** [Understanding and interpretation outcomes]
3. **Application:** [Practical skill application outcomes]
4. **Analysis:** [Critical analysis and evaluation outcomes]
5. **Synthesis:** [Integration and development outcomes]
6. **Evaluation:** [Assessment and judgment outcomes]

**Prerequisites:** Advanced clinical experience (3+ years AHPRA registration) and understanding of Australian healthcare regulatory framework.
**Time Investment:** [X] hours including interactive components, assessments, and reflection activities.

**[PROFESSIONAL CONTEXT]**
This module integrates real-world Australian healthcare scenarios, emphasizing regulatory compliance and professional obligations. Participants will explore case studies reflecting diverse Australian healthcare contexts, including urban, rural, and remote settings. The course aligns with AHPRA, NMBA, RACGP, and ACRRM standards, ensuring practitioners maintain professional competency and deliver culturally safe, high-quality patient care. Quality improvement initiatives and patient safety considerations are integrated throughout, reinforcing continuous professional development obligations.

**[ASSESSMENT APPROACH]**
The course employs sophisticated competency-based evaluation methodology, incorporating both formative and summative assessments aligned with Miller's Pyramid of Clinical Competence. Participants engage in:
- Complex case study analyses requiring clinical reasoning
- Professional portfolio integration with reflective practice
- Interactive scenarios with branching decision pathways
- Peer collaboration and interprofessional learning activities
- Professional development planning and goal setting

Opportunities for CPD credit alignment and professional body reporting are integrated throughout.

**[RESOURCE FRAMEWORK]**
Primary evidence sources include current Australian healthcare guidelines, professional body standards, and peer-reviewed research with Vancouver citation style. Resources are organized hierarchically:

**Primary Sources:**
- [Specific Australian healthcare guidelines and standards]
- [Professional body recommendations and frameworks]
- [Peer-reviewed research with direct practice application]

**Supplementary Materials:**
- Interactive digital tools and professional simulations
- Case study collections with Australian healthcare contexts
- Professional development templates and assessment tools
- Links to continuing education and professional networks

**[IMPLEMENTATION PATHWAY]**
Participants follow structured professional development pathways with opportunities for:
- Self-directed learning with mentor support integration
- Peer collaboration through professional discussion forums
- Workplace application with supervisor feedback mechanisms
- Progress monitoring through competency development tracking
- Reflection frameworks supporting continuous improvement

The course is designed for immediate workplace implementation, supporting both individual professional growth and organizational quality improvement initiatives.

**[PROFESSIONAL STANDARDS ALIGNMENT]**
This course explicitly aligns with:
- AHPRA professional standards and regulatory requirements
- NMBA standards for nursing and midwifery practice
- RACGP and ACRRM guidelines for general practice
- NSQHS Standards for safety and quality healthcare
- Cultural safety frameworks for Aboriginal and Torres Strait Islander health
- Multicultural healthcare best practices

**[CONTINUING PROFESSIONAL DEVELOPMENT]**
This course contributes [X] CPD hours toward professional development requirements, with alignment to:
- Annual CPD obligations for AHPRA-registered practitioners
- Professional body specific education requirements
- Quality improvement and patient safety competency development
- Leadership and supervision skill enhancement

Generate comprehensive LMS upload text now:"""

    return lms_prompt
```

---

## Quality Markers for All Prompts

**EVIDENCE-BASED CONTENT:**
- All content traceable to provided research foundation
- Vancouver citation style for academic sources
- No fabricated or hallucinated content
- Clear source attribution throughout

**AUSTRALIAN HEALTHCARE CONTEXT:**
- AHPRA, NMBA, RACGP, ACRRM standards integration
- NSQHS Standards alignment
- Cultural safety for Aboriginal and Torres Strait Islander peoples
- Rural and remote healthcare considerations
- Professional supervision and mentoring frameworks

**PROFESSIONAL DEVELOPMENT FOCUS:**
- Adult learning principles throughout
- Competency-based approach aligned with Miller's Pyramid
- Workplace application and immediate implementation
- Reflective practice integration
- Professional portfolio development support

**SOPHISTICATED ASSESSMENT:**
- Multiple assessment modalities
- Branching scenarios with realistic consequences
- Professional standards alignment
- Cultural safety and diversity integration
- Evidence-based feedback and remediation

---

## 9. TEXT-TO-IMAGE PROMPTS GENERATION

```python
def generate_text_to_image_prompts(slides_content, course_concept, module_name):
    image_prompts = f"""[CORE INSTRUCTIONS - Healthcare]

TEXT-TO-IMAGE PROMPTS FOR CANVA/ARTISTLY
COURSE CONTEXT:
Course: {course_concept}
Module: {module_name}
Slides Content: {slides_content[:2000]}...

TASK: Create professional text-to-image prompts for each slide in this module.

VISUAL REQUIREMENTS FOR AUSTRALIAN HEALTHCARE EDUCATION:

**PROFESSIONAL HEALTHCARE IMAGERY:**
- Clean, modern, professional aesthetic
- Australian healthcare settings and contexts
- Diverse representation including Aboriginal and Torres Strait Islander peoples
- Cultural safety and inclusivity throughout
- Professional healthcare environments (hospitals, clinics, community health)

**TECHNICAL SPECIFICATIONS:**
- 16:9 aspect ratio for slide presentations
- High contrast for accessibility
- Professional colour palette (blues, greens, whites)
- Clean typography integration space
- Suitable for both digital and print formats

**CONTENT GUIDELINES:**
- Evidence-based visual metaphors
- Professional healthcare scenarios
- Australian regulatory compliance visual elements
- Quality improvement and safety themes
- Interprofessional collaboration imagery

PROMPT STRUCTURE FOR EACH SLIDE:
**SLIDE [X]: [Title]**
**Primary Image Prompt:** [Detailed description for main slide visual - 2-3 sentences]
**Alternative Image Prompt:** [Backup visual concept - 2-3 sentences]
**Visual Elements:** [Specific elements to include: icons, graphics, backgrounds]
**Colour Scheme:** [Professional healthcare colour recommendations]
**Text Overlay Areas:** [Where slide text should be positioned]

**AUSTRALIAN HEALTHCARE CONTEXT VISUALS:**
- AHPRA, NMBA, RACGP, ACRRM compliant imagery
- Cultural safety visual representations
- Professional development and supervision scenarios
- Evidence-based practice visual metaphors
- Quality and safety in healthcare settings

Generate comprehensive image prompts for all slides in this module."""

    return image_prompts
```

---

## 10. PROMOTIONAL MATERIAL GENERATION

```python
def generate_promotional_material(course_data, target_audience):
    promotional_prompt = f"""[CORE INSTRUCTIONS - Healthcare]

PROMOTIONAL MATERIAL GENERATION
COURSE CONTEXT:
Course: {course_data.get('course_concept', 'Professional Healthcare Course')}
Target Audience: {target_audience}
Duration: [Extracted from course data]
Modules: [Number of modules from course architecture]

TASK: Create comprehensive promotional materials for this Australian healthcare course.

**1. COURSE MARKETING DESCRIPTION** (200-300 words)
- Executive summary highlighting value proposition
- Australian healthcare context and regulatory compliance
- Evidence-based approach and research foundation
- Professional development outcomes and CPD credits
- Target audience relevance and career benefits

**2. LEARNING OUTCOMES SUMMARY** (150-200 words)
- Clear, measurable learning objectives
- Professional competency development
- Workplace application focus
- Evidence-based practice integration
- Australian healthcare standards alignment

**3. COURSE HIGHLIGHTS AND FEATURES** (bullet points)
- Interactive elements and assessment methods
- Professional resources and downloadable tools
- Expert content and evidence base
- Cultural safety and diversity integration
- Technology integration (LMS, iSpring, SCORM)

**4. TARGET AUDIENCE DESCRIPTION** (100-150 words)
- Primary audience characteristics
- Professional experience requirements
- Regulatory context (AHPRA registration, etc.)
- Career stage and development goals
- Workplace application context

**5. PROFESSIONAL ENDORSEMENT TEMPLATE** (100-150 words)
- Template for professional body endorsements
- Regulatory compliance statements
- Quality assurance and standards alignment
- Professional development value proposition
- Continuing education credit information

**6. COURSE PREREQUISITES AND REQUIREMENTS** (100 words)
- Educational background requirements
- Professional experience expectations
- Technology requirements for online delivery
- Time commitment and study expectations
- Assessment and completion requirements

**7. PROMOTIONAL SOCIAL MEDIA CONTENT**
- LinkedIn post templates (3 variations)
- Professional networking content
- Conference presentation abstracts
- Newsletter content blocks
- Website course descriptions

**AUSTRALIAN HEALTHCARE MARKETING CONTEXT:**
- AHPRA professional development compliance
- Cultural safety and diversity messaging
- Evidence-based practice emphasis
- Quality improvement and patient safety focus
- Professional supervision and mentoring value

**TONE AND STYLE:**
- Professional, authoritative, evidence-based
- Australian English terminology and context
- Inclusive and culturally appropriate language
- Clear value proposition for busy healthcare professionals
- Academic credibility with practical application focus

Generate complete promotional package now."""

    return promotional_prompt
```

---

This upgraded prompt library ensures Knowledge Lake generates courses that match your sophisticated quality standards and professional expectations, including the complete Genspark deliverable suite: text-to-image prompts and promotional materials.
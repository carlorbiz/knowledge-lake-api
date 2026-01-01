// ===== CRITICAL FIX: RESTORE SOPHISTICATED MODULE GENERATION =====

// This is what your module generation prompt should look like (starting around line 917):

const prompt = brandHeader_() + `

ADVANCED MODULE DEVELOPMENT BRIEF

You are a senior medical education specialist and instructional designer with deep expertise in Australian healthcare systems, clinical supervision, adult learning theory, and competency-based education.

SPECIALISATION AREAS:
- Clinical supervision and medical education research
- Adult learning principles and evidence-based instructional design
- Australian healthcare competency frameworks (RACGP, ACRRM, AHPRA)
- Assessment design and evaluation methodology
- Cultural safety and inclusive practice frameworks
- Quality improvement and patient safety education
- Rural and remote healthcare considerations

MODULE TO DEVELOP: ${moduleName}
CONCEPT CONTEXT: ${concept}
TARGET AUDIENCE: Clinical supervisors and healthcare educators
DURATION: 45-60 minutes structured learning

SOURCE MATERIALS REFERENCE:
${String(sourcePack).slice(0, 8000)}

COMPREHENSIVE DEVELOPMENT REQUIREMENTS:

1. EVIDENCE-BASED FOUNDATION
- Integrate current Australian clinical guidelines and research (2019-2024)
- Reference peer-reviewed literature and systematic reviews
- Include professional college position statements and frameworks
- Ensure cultural safety and Indigenous health considerations
- Reference quality improvement and patient safety evidence

2. SOPHISTICATED LEARNING DESIGN
- Create 4-6 specific, measurable learning outcomes
- Design progressive skill development with scaffolded learning
- Include practical workplace applications and implementation strategies
- Integrate real-world case studies and clinical scenarios
- Provide evidence-based assessment and evaluation methods

3. PRACTICAL TOOLS AND RESOURCES
- Develop comprehensive checklists and assessment frameworks
- Create templates and practical implementation tools
- Design reflection exercises and peer learning activities
- Provide quality indicators and success metrics
- Include troubleshooting guides and common challenges

4. CULTURAL SAFETY AND INCLUSION
- Integrate Aboriginal and Torres Strait Islander health considerations
- Address diverse cultural backgrounds and language barriers
- Include inclusive practice strategies and unconscious bias awareness
- Reference cultural safety frameworks and evidence base

5. PROFESSIONAL DEVELOPMENT INTEGRATION
- Align with Australian healthcare competency standards
- Connect to CPD requirements and professional recognition
- Include career pathway considerations and skill progression
- Reference micro-credentialing and digital badging opportunities

COMPREHENSIVE OUTPUT FORMAT:

==== MODULE: ${moduleName} ====

EXECUTIVE SUMMARY:
[3-4 paragraphs providing evidence-based rationale, learning theory foundation, and professional development value]

LEARNING OUTCOMES:
Upon completion, participants will be able to:
• [Specific, measurable outcome 1 with assessment criteria]
• [Specific, measurable outcome 2 with assessment criteria]
• [Specific, measurable outcome 3 with assessment criteria]
• [Specific, measurable outcome 4 with assessment criteria]

THEORETICAL FRAMEWORK:
[Evidence-based foundation including research citations and professional guidelines that underpin this module]

KEY CONCEPTS & EVIDENCE BASE:
1. [Core Concept 1]
   - Definition and theoretical foundation
   - Current research evidence (with citations)
   - Australian context and guidelines
   - Practical implications for clinical practice

2. [Core Concept 2]
   - [Same detailed structure]

3. [Core Concept 3]
   - [Same detailed structure]

4. [Core Concept 4]
   - [Same detailed structure]

PRACTICAL TOOLS & CHECKLISTS:

Assessment Framework Checklist:
☐ [Specific assessment criteria 1]
☐ [Specific assessment criteria 2]
☐ [Specific assessment criteria 3]
☐ [Continue for 8-12 comprehensive criteria]

Implementation Checklist:
☐ [Practical implementation step 1]
☐ [Practical implementation step 2]
☐ [Continue for 6-10 actionable steps]

Quality Indicators:
☐ [Measurable quality indicator 1]
☐ [Measurable quality indicator 2]
☐ [Continue for 5-8 indicators]

CASE STUDIES & SCENARIOS:

Scenario 1: [Realistic Clinical Situation]
- Background and context
- Key challenges and considerations
- Discussion points and learning objectives
- Evidence-based solutions and approaches
- Cultural safety considerations

Scenario 2: [Complex Practice Situation]
- [Same detailed structure]

Scenario 3: [Rural/Remote Context if relevant]
- [Same detailed structure]

ASSESSMENT STRATEGIES:

Formative Assessment:
- [2-3 ongoing assessment methods with detailed descriptions]
- Self-reflection exercises and peer feedback mechanisms
- Progress monitoring and adjustment strategies

Summative Assessment:
- [1-2 comprehensive evaluation methods]
- Competency demonstration requirements
- Portfolio development and evidence collection

FACILITATION GUIDANCE:

Pre-Session Preparation:
- [Detailed facilitator preparation requirements]
- Resource gathering and technology setup
- Participant pre-work and preparation materials

Session Delivery:
- [Step-by-step facilitation guide with timing]
- Interactive activities and engagement strategies
- Technology integration and accessibility considerations

Post-Session Follow-up:
- [Reflection and application strategies]
- Ongoing support and community of practice development
- Quality improvement and feedback mechanisms

CULTURAL SAFETY INTEGRATION:
[Specific strategies for ensuring cultural safety throughout the module, including Aboriginal and Torres Strait Islander health considerations, diverse cultural backgrounds, and inclusive practice approaches]

RESOURCES & REFERENCES:

Essential Reading:
1. [Full citation - Vancouver style]
2. [Full citation - Vancouver style]
3. [Continue for 5-8 essential sources]

Professional Guidelines:
1. [RACGP/ACRRM/College guideline with citation]
2. [Government or professional body resource]
3. [Continue for 3-5 guidelines]

Research Evidence:
1. [Peer-reviewed research citation]
2. [Systematic review or meta-analysis]
3. [Continue for 5-8 research sources]

IMPLEMENTATION CONSIDERATIONS:
- Technology requirements and accessibility features
- Time allocation and pacing recommendations
- Resource requirements and cost considerations
- Evaluation and continuous improvement processes
- Integration with existing professional development programs

QUALITY ASSURANCE:
- Peer review and expert validation requirements
- Pilot testing and feedback incorporation
- Regular review and update cycles
- Outcome evaluation and effectiveness measurement

MICRO-CREDENTIALING VALUE:
[Detailed explanation of how this module contributes to professional recognition, CPD requirements, and career pathway development]

[END OF MODULE CONTENT]

Remember to provide comprehensive, evidence-based content with proper citations, practical tools that can be immediately implemented, and sophisticated assessment strategies that demonstrate real competency development.`;

// ALSO ADD THIS ENHANCED TTS PROMPT:

const TTS_ENHANCEMENT_PROMPT = `You are a professional script writer and medical education specialist creating sophisticated voice-over scripts for Australian healthcare education.

EXPERTISE:
- Medical education and clinical supervision
- Professional voice-over script development
- Adult learning principles and engagement strategies
- Australian healthcare context and terminology
- Cultural safety and inclusive language

SCRIPT REQUIREMENTS:
- Professional, conversational tone suitable for healthcare professionals
- Australian English pronunciation and terminology
- Engaging narrative structure with clear learning progression
- Evidence-based content with integrated research insights
- Practical examples and real-world applications
- Cultural safety and inclusive language throughout
- Appropriate pacing for professional learning (150 WPM)

MODULE CONTENT TO CONVERT: ${slideContent}

ENHANCED SCRIPT OUTPUT:

[Opening Hook - 30 seconds]
[Engaging introduction that connects to real-world healthcare challenges]

[Main Content - 4-5 minutes]
[Comprehensive, evidence-based content with:]
- Clear explanations of key concepts
- Integration of research evidence
- Practical examples and applications
- Cultural safety considerations
- Interactive elements and reflection prompts

[Summary & Application - 60 seconds]
[Concrete next steps and implementation guidance]

[Speaker Notes]
- Pronunciation guides for medical terminology
- Emphasis points and pacing recommendations
- Cultural sensitivity reminders
- Engagement strategies and interaction prompts

The script should be sophisticated, evidence-based, and immediately applicable to clinical practice while maintaining professional engagement throughout.`;
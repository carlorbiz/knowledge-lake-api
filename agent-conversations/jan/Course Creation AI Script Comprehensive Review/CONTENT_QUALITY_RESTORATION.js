// ===== CRITICAL FIXES FOR CONTENT QUALITY RESTORATION =====

// FIX 1: REPLACE COURSE_MAPPING_PROMPT (around line 68)
const COURSE_MAPPING_PROMPT = `You are an expert course designer and researcher for Australian healthcare education with deep knowledge of adult learning principles, clinical supervision practices, and Australian healthcare regulations.

CONTEXT & EXPERTISE:
- Peak authority on medical supervision in Australia/New Zealand
- Specialisation in adult learning, clinical supervision, and professional development
- Deep understanding of RACGP, ACRRM, AHPRA frameworks
- Expertise in micro-credentialing and competency-based education
- Knowledge of rural/remote healthcare contexts and cultural safety

ADVANCED REQUIREMENTS:
1. Conduct thorough analysis of the concept using evidence-based research
2. Integrate current Australian healthcare guidelines and regulations
3. Reference peer-reviewed literature and best practice frameworks
4. Design 6-12 modules with sophisticated learning outcomes
5. Include practical tools, checklists, and assessment frameworks
6. Ensure cultural safety and inclusive practice considerations
7. Address rural/remote contexts where relevant
8. Create competency-based progression with measurable outcomes
9. Integrate real-world scenarios and case studies
10. Provide citation-ready references for all recommendations

OUTPUT FORMAT:

EXECUTIVE SUMMARY:
[4-5 paragraphs providing comprehensive analysis including:]
- Evidence-based rationale for the course approach
- Research foundation and theoretical framework
- Target audience analysis and learning needs assessment
- Micro-credentialing value and professional recognition
- Quality assurance and continuous improvement considerations

RECOMMENDED MODULES:
[For each module, provide:]

Module [X]: [Compelling, Professional Title]

LEARNING OUTCOMES:
• [Specific, measurable outcome with assessment criteria]
• [Specific, measurable outcome with assessment criteria]
• [Specific, measurable outcome with assessment criteria]

CONTENT FRAMEWORK:
- Key Concepts: [3-4 evidence-based concepts with citations]
- Practical Tools: [Checklists, templates, frameworks]
- Case Studies: [2-3 relevant scenarios with learning points]
- Assessment Methods: [Formative and summative assessment strategies]

RESOURCES & REFERENCES:
- [Minimum 3 current research papers/guidelines per module]
- [Professional development tools and frameworks]
- [Assessment resources and quality indicators]

[Continue for all recommended modules]

ASSESSMENT FRAMEWORK:
[Detailed assessment strategy including:]
- Formative assessment methods with specific tools
- Summative evaluation approaches with criteria
- Competency demonstration requirements
- Quality indicators and success metrics

REFERENCES:
[Comprehensive reference list using Vancouver style, minimum 15-20 current references]`;

// FIX 2: ENHANCED MODULE GENERATION (replace around line 917)
// This is the CRITICAL fix - the module generation prompt was destroyed

const enhancedModulePrompt = `${brandHeader_()}

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

ASSESSMENT STRATEGIES:

Formative Assessment:
- [2-3 ongoing assessment methods with detailed descriptions]
- Self-reflection exercises and peer feedback mechanisms
- Progress monitoring and adjustment strategies

Summative Assessment:
- [1-2 comprehensive evaluation methods]
- Competency demonstration requirements
- Portfolio development and evidence collection

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

CULTURAL SAFETY INTEGRATION:
[Specific strategies for ensuring cultural safety throughout the module, including Aboriginal and Torres Strait Islander health considerations]

IMPLEMENTATION CONSIDERATIONS:
- Technology requirements and accessibility features
- Time allocation and pacing recommendations
- Resource requirements and cost considerations
- Quality assurance and evaluation mechanisms

[END OF MODULE CONTENT]`;

// FIX 3: UPDATE TOKEN LIMITS IN ALL API CALLS
// Find all instances of callGeminiWithRetry and increase token limits:

// Change from:
// const rec = callGeminiWithRetry(mappingPrompt, 3000);
// To:
// const rec = callGeminiWithRetry(mappingPrompt, 10000);

// Change from:
// const result = callGeminiWithRetry(prompt, 4000);  
// To:
// const result = callGeminiWithRetry(enhancedModulePrompt, 12000);
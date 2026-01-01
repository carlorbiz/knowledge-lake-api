/**
 * FORMAT-COMPLIANT ENHANCED MODIFICATION PROMPT
 * 
 * Issue: Enhanced prompt produces high-quality content but in wrong format
 * Solution: Add explicit formatting requirements for module extraction compatibility
 */

// REPLACE your current enhanced modification prompt with this version
// that includes MANDATORY FORMATTING requirements:

const FORMAT_COMPLIANT_ENHANCED_PROMPT = `
if (userChoice === 'modify') {
  // ENHANCED MODIFICATION MODE: Quality-preserving revision with format compliance
  docSuffix = '_REVISED';
  
  mappingPrompt = brandHeader_() + '\\n' + 
    \`You are an expert in Australian healthcare education revising a course recommendation. 

CRITICAL REQUIREMENT: The revised recommendation must EXCEED the quality, sophistication, and comprehensiveness of the original document. Never reduce scope, module count, or analytical depth.

ORIGINAL CONCEPT: \${concept}
TARGET AUDIENCE: \${audience}

QUALITY PRESERVATION MANDATE:
1. Maintain or enhance academic rigor and professional sophistication - NO casual language like "Okay," or "Here's..."
2. Preserve structural complexity (module count, framework depth)  
3. Expand evidence base - minimum 12-15 high-quality Australian healthcare references
4. Strengthen rather than simplify content
5. Address modification requests by ADDING value, not replacing existing quality
6. Ensure RECOMMENDED MODULES section contains same or more modules than original

EXISTING RECOMMENDATION TO ENHANCE: \${existingRecommendation}

ENHANCEMENT REQUESTS: \${modificationRequests}

REVISION STRATEGY:
- First analyse the original document's sophistication and preserve all quality markers
- Then incorporate enhancement requests without reducing complexity or scope
- Expand evidence base with additional RACGP, ACRRM, and Australian Medical Board sources
- Ensure the result is demonstrably MORE comprehensive and sophisticated than original
- Maintain or expand the RECOMMENDED MODULES section with detailed module descriptions

EVIDENCE REQUIREMENTS:
- Minimum 12-15 high-quality references from Australian healthcare sources
- RACGP guidelines and position statements
- ACRRM rural health frameworks
- Australian Medical Board IMG pathway documentation
- Recent peer-reviewed Australian medical education journals
- Cultural competency and supervision best practices

TONE AND QUALITY REQUIREMENTS:
- NEVER begin with casual language like "Okay," "Here's," "I have analyzed," etc.
- Professional academic tone throughout appropriate for senior medical educators
- Evidence-based assertions with proper citation integration
- Australian healthcare context strengthened with relevant frameworks
- Sophisticated analysis that demonstrates expertise

MANDATORY FORMATTING REQUIREMENTS (CRITICAL FOR SYSTEM COMPATIBILITY):
- MUST include a section titled exactly "RECOMMENDED MODULES:"
- Each module MUST be listed as a bullet point or numbered item
- Module names should be clear and descriptive (e.g. "Module 1: Cultural Competency in IMG Supervision")
- Each module should include brief description after the title
- Follow this exact format:

RECOMMENDED MODULES:

• Module 1: [Title] - [Brief description]
• Module 2: [Title] - [Brief description]
• Module 3: [Title] - [Brief description]
[Continue for all modules]

STRUCTURE REQUIREMENTS:
- Include comprehensive "RECOMMENDED MODULES:" section with detailed module descriptions
- Ensure module descriptions are substantial and pedagogically sound
- Each module should have clear learning objectives and practical applications
- Maintain or exceed the structural sophistication of the original
- CRITICAL: The "RECOMMENDED MODULES:" section must be parseable by automated systems

The final document must be superior in every measurable way to the original while maintaining exact formatting compatibility for module extraction.\` +
    '\\n\\n' + VANCOUVER_CITATION_INSTRUCTIONS;

} else {
  // NEW RECOMMENDATION MODE: Fresh start
  mappingPrompt = brandHeader_() + '\\n' + COURSE_MAPPING_PROMPT +
    \`\\n\\nCONCEPT: \${concept}\\nSELECTED TARGET AUDIENCE: \${audience}\\n\` +
    VANCOUVER_CITATION_INSTRUCTIONS;
}
`;

/**
 * KEY ADDITIONS:
 * 1. ✅ Explicit "RECOMMENDED MODULES:" heading requirement
 * 2. ✅ Specific bullet point format specification
 * 3. ✅ Module naming convention guidance
 * 4. ✅ Compatibility note for automated parsing
 * 5. ✅ Maintains all quality enhancement requirements
 */
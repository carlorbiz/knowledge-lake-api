/**
 * CRITICAL FIX: Missing mappingPrompt Assignment
 * 
 * PROBLEM: Your script defines enhanced constants but never assigns them to mappingPrompt
 * RESULT: All modifications use the default new recommendation prompt
 * 
 * CURRENT BROKEN STRUCTURE:
 * if (userChoice === 'modify') {
 *   docSuffix = '_REVISED';
 *   
 *   const ENHANCED_MODIFICATION_INSTRUCTIONS = `...`;  // ← Defined but never used!
 *   const ENHANCED_VANCOUVER_INSTRUCTIONS = `...`;    // ← Defined but never used!
 *   
 *   } else {
 *     mappingPrompt = ...;  // ← Only new recommendations get a prompt!
 *   }
 */

// 🚨 CRITICAL FIX: ADD THE MISSING mappingPrompt ASSIGNMENT

/**
 * FIND this section in your script (around line 2477-2511):
 */
/*
if (userChoice === 'modify') {
  // MODIFICATION MODE: Use existing recommendation + modification requests
  docSuffix = '_REVISED';
  
  const ENHANCED_MODIFICATION_INSTRUCTIONS = `...`;
  const ENHANCED_VANCOUVER_INSTRUCTIONS = `...`;
  
  } else {
    // NEW RECOMMENDATION MODE: Fresh start
    mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT + ...;
  }
*/

/**
 * REPLACE the entire if/else section with this CORRECTED version:
 */

const CORRECTED_IF_ELSE_SECTION = `
if (userChoice === 'modify') {
  // ENHANCED MODIFICATION MODE: Quality-preserving revision
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

STRUCTURE REQUIREMENTS:
- Include comprehensive "RECOMMENDED MODULES:" section with detailed module descriptions
- Ensure module descriptions are substantial and pedagogically sound
- Each module should have clear learning objectives and practical applications
- Maintain or exceed the structural sophistication of the original

The final document must be superior in every measurable way to the original.\` +
    '\\n\\n' + VANCOUVER_CITATION_INSTRUCTIONS;

} else {
  // NEW RECOMMENDATION MODE: Fresh start
  mappingPrompt = brandHeader_() + '\\n' + COURSE_MAPPING_PROMPT +
    \`\\n\\nCONCEPT: \${concept}\\nSELECTED TARGET AUDIENCE: \${audience}\\n\` +
    VANCOUVER_CITATION_INSTRUCTIONS;
}
`;

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. FIND lines 2477-2517 in your generateCourseRecommendation function
 * 2. DELETE the entire if/else block (from "if (userChoice === 'modify')" to the closing "}")
 * 3. REPLACE with the corrected version above
 * 4. SAVE and test immediately
 * 
 * This will ensure modifications actually use the enhanced prompt instead of 
 * falling through to the default new recommendation prompt.
 */

/**
 * KEY CHANGES:
 * 1. ✅ Adds the missing mappingPrompt assignment for modifications
 * 2. ✅ Removes unused constants that were just sitting there
 * 3. ✅ Adds explicit "NEVER begin with casual language" instruction
 * 4. ✅ Strengthens professional tone requirements
 * 5. ✅ Preserves the else section for new recommendations
 */
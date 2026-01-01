/**
 * ENHANCED MODIFICATION REQUEST PROMPTS
 * 
 * Problem: Current modification workflow produces lower quality, shorter content
 * that doesn't maintain the sophistication of the original recommendation.
 * 
 * Root Cause: The modification prompt doesn't preserve original quality standards,
 * structure complexity, or comprehensive scope.
 */

// ❌ CURRENT PROBLEM: Basic modification prompt
/*
mappingPrompt = brandHeader_() + '\n' + 
  'You are revising an existing course recommendation based on specific modification requests.\n\n' +
  'ORIGINAL CONCEPT: ' + concept + '\n' +
  'TARGET AUDIENCE: ' + audience + '\n\n' +
  'MODIFICATION REQUESTS FROM USER:\n' + modificationRequests + '\n\n' +
  'EXISTING RECOMMENDATION DOCUMENT: ' + existingRecommendation + '\n\n'
*/

// ✅ ENHANCED SOLUTION: Quality-preserving modification prompts

/**
 * REPLACE the modification prompt section in generateCourseRecommendation with:
 */

const ENHANCED_MODIFICATION_INSTRUCTIONS = `
CRITICAL QUALITY STANDARDS FOR REVISIONS:

1. PRESERVE ORIGINAL SOPHISTICATION: The revised recommendation must maintain or exceed the academic rigor, depth of analysis, and professional sophistication of the original document.

2. MAINTAIN STRUCTURAL COMPLEXITY: If the original had multiple modules, comprehensive frameworks, or detailed pedagogical approaches, the revision must preserve this level of structural sophistication.

3. ENHANCE, DON'T REDUCE: The revision should ADD value by incorporating modification requests while PRESERVING all high-quality elements from the original. Never reduce scope, module count, or analytical depth.

4. AUSTRALIAN HEALTHCARE EXCELLENCE: Maintain the highest standards for Australian healthcare education, incorporating RACGP, ACRRM, and GPSA frameworks as appropriate.

5. EVIDENCE-BASED EXPANSION: When modification requests ask for additional references or evidence, expand the academic foundation rather than replacing existing quality content.

REVISION APPROACH:
- First, analyse the original document's quality markers (complexity, depth, structure, scope)
- Then, identify how to incorporate modification requests WITHOUT compromising these markers
- Finally, enhance the document by adding requested elements while preserving original excellence

The result should be demonstrably BETTER than the original, not simplified or reduced.
`;

const ENHANCED_VANCOUVER_INSTRUCTIONS = `
ENHANCED VANCOUVER CITATION REQUIREMENTS:

1. MINIMUM CITATIONS: Include at least 12-15 high-quality references from:
   - RACGP guidelines and position statements
   - ACRRM rural health frameworks  
   - Australian Medical Board IMG pathway documentation
   - Peer-reviewed Australian medical education journals
   - International best practice in medical supervision (UK, Canada, NZ)
   - Cultural competency in healthcare frameworks

2. CITATION INTEGRATION: References must be meaningfully integrated into content, not just listed. Each citation should support specific pedagogical or clinical points.

3. REFERENCE QUALITY: Prioritise recent (last 5 years), Australian-relevant, and evidence-based sources. Include government health department resources and professional college publications.

4. VANCOUVER PRECISION: Use correct Vancouver style with numbered citations in order of appearance, complete author lists for first 6 authors, proper journal abbreviations, and DOIs where available.
`;

/**
 * COMPLETE ENHANCED MODIFICATION PROMPT REPLACEMENT
 */
function buildEnhancedModificationPrompt(concept, audience, modificationRequests, existingRecommendation, srcPack) {
  
  const enhancedPrompt = brandHeader_() + '\n' + 
    `You are an expert in Australian healthcare education, specialising in creating sophisticated, evidence-based course recommendations for medical professionals. You are revising an existing course recommendation to incorporate specific enhancement requests.

COURSE CONTEXT:
• Original Concept: ${concept}
• Target Audience: ${audience}
• Educational Setting: Australian healthcare (GPSA/HPSA standards)

ORIGINAL DOCUMENT ANALYSIS REQUIRED:
Before making any changes, carefully analyse the existing recommendation document at: ${existingRecommendation}

Identify and preserve these quality markers:
• Academic sophistication and depth of analysis
• Structural complexity (number of modules, framework depth)
• Evidence base and citation quality  
• Pedagogical approach sophistication
• Professional tone and Australian healthcare context
• Scope and comprehensiveness

ENHANCEMENT REQUESTS TO INCORPORATE:
${modificationRequests}

${ENHANCED_MODIFICATION_INSTRUCTIONS}

QUALITY ASSURANCE CHECKLIST:
✓ Revised document is MORE comprehensive than original
✓ Academic sophistication is maintained or enhanced  
✓ Module structure preserves or expands original complexity
✓ Citation count and quality exceeds original standards
✓ Professional tone appropriate for senior medical educators
✓ Australian healthcare context is strengthened
✓ All modification requests are addressed without compromising quality

${ENHANCED_VANCOUVER_INSTRUCTIONS}

CONTENT ENHANCEMENT STRATEGY:
1. Preserve all high-quality elements from the original
2. Expand sections relevant to modification requests
3. Add new modules or components as needed to address requests
4. Enhance evidence base with additional, high-quality Australian sources
5. Strengthen pedagogical frameworks and practical applications
6. Ensure cultural competency and rural/remote considerations are robust

The result must be a demonstrably superior document that incorporates requested enhancements while preserving the academic excellence of the original.`;

  return enhancedPrompt;
}

/**
 * QUICK FIX: Update your generateCourseRecommendation function
 */

// Find this section in your generateCourseRecommendation function:
/*
if (userChoice === 'modify') {
  // MODIFICATION MODE: Use existing recommendation + modification requests
  docSuffix = '_REVISED';
  
  mappingPrompt = brandHeader_() + '\n' + 
    'You are revising an existing course recommendation based on specific modification requests.\n\n' +
    // ... existing code
*/

// REPLACE the entire mappingPrompt assignment with:
/*
if (userChoice === 'modify') {
  // ENHANCED MODIFICATION MODE: Quality-preserving revision
  docSuffix = '_REVISED';
  
  mappingPrompt = buildEnhancedModificationPrompt(concept, audience, modificationRequests, existingRecommendation, srcPack);
  
  // Add source materials context
  if (srcPack.text && srcPack.text.trim()) {
    mappingPrompt += `\n\nADDITIONAL SOURCE MATERIALS FOR ENHANCEMENT:\n${String(srcPack.text).slice(0,8000)}`;
  }

  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    mappingPrompt += `\n\nPDF DOCUMENTS FOR EVIDENCE BASE ENHANCEMENT: ${srcPack.pdfFiles.length} PDF file(s) attached. Use these to strengthen the evidence base and support the enhanced recommendation with additional high-quality references.`;
  }
*/

/**
 * ALTERNATIVE: Quick Inline Fix
 * If you prefer not to add the helper function, replace the modification section with:
 */

const INLINE_ENHANCED_MODIFICATION_PROMPT = `
if (userChoice === 'modify') {
  docSuffix = '_REVISED';
  
  mappingPrompt = brandHeader_() + '\\n' + 
    \`You are an expert in Australian healthcare education revising a course recommendation. 

CRITICAL: The revised recommendation must EXCEED the quality, sophistication, and comprehensiveness of the original document. Never reduce scope, module count, or analytical depth.

ORIGINAL CONCEPT: \${concept}
TARGET AUDIENCE: \${audience}

QUALITY PRESERVATION REQUIREMENTS:
1. Maintain or enhance academic rigor and professional sophistication
2. Preserve structural complexity (module count, framework depth)  
3. Expand evidence base - include 12-15 high-quality Australian healthcare references
4. Strengthen rather than simplify content
5. Address modification requests by ADDING value, not replacing quality content

EXISTING RECOMMENDATION (analyse first): \${existingRecommendation}

ENHANCEMENT REQUESTS: \${modificationRequests}

APPROACH:
- First analyse the original's quality markers and preserve them
- Then incorporate requested enhancements without reducing sophistication
- Expand evidence base with additional Australian healthcare sources (RACGP, ACRRM, AMB)
- Ensure result is demonstrably superior to original

Result must be MORE comprehensive, sophisticated, and evidence-based than the original document.\` +
    '\\n\\n' + VANCOUVER_CITATION_INSTRUCTIONS;
}
`;

/**
 * DEPLOYMENT STEPS:
 */

// 1. Add the buildEnhancedModificationPrompt function to your script
// 2. Replace the modification prompt section as shown above
// 3. Test with your IMG course modification request
// 4. Compare quality - should be significantly improved

/**
 * EXPECTED IMPROVEMENTS:
 */

// ✓ Maintains original module structure and complexity
// ✓ Preserves sophisticated academic tone  
// ✓ Enhances rather than reduces content scope
// ✓ Incorporates modification requests without quality loss
// ✓ Strengthens evidence base with quality Australian sources
// ✓ Explicit quality preservation instructions to AI
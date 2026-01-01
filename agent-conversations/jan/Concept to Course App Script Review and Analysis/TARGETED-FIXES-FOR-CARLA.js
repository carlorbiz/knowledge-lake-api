/**
 * TARGETED FIXES FOR CARLA'S SPECIFIC ISSUES
 * 
 * Issue 1: Can't locate modification section to replace
 * Issue 2: No content added to columns G-S (module extraction missing)
 */

// =============================================================================
// FIX 1: EXACT LOCATION OF MODIFICATION SECTION TO REPLACE
// =============================================================================

/**
 * FIND THESE LINES (around line 2402-2418 in your generateCourseRecommendation function):
 */

/*
  if (userChoice === 'modify') {
    // MODIFICATION MODE: Use existing recommendation + modification requests
    docSuffix = '_REVISED';
    
    mappingPrompt = brandHeader_() + '\n' + 
      `You are revising an existing course recommendation based on specific modification requests.\n\n` +
      `ORIGINAL CONCEPT: ${concept}\n` +
      `TARGET AUDIENCE: ${audience}\n\n` +
      `MODIFICATION REQUESTS FROM USER:\n${modificationRequests}\n\n` +
      `EXISTING RECOMMENDATION DOCUMENT: ${existingRecommendation}\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Review the existing recommendation document at the URL above\n` +
      `2. Incorporate the specific modification requests provided\n` +
      `3. Maintain the quality and structure of the original recommendation\n` +
      `4. Ensure all requested changes are addressed comprehensively\n` +
      `5. Use the source materials below to support any new content needed\n\n` +
      VANCOUVER_CITATION_INSTRUCTIONS;

  } else {
*/

/**
 * REPLACE THE ENTIRE mappingPrompt ASSIGNMENT (lines 2406-2418) WITH:
 */

const ENHANCED_MODIFICATION_REPLACEMENT = `
    mappingPrompt = brandHeader_() + '\\n' + 
      \`You are an expert in Australian healthcare education revising a course recommendation. 

CRITICAL REQUIREMENT: The revised recommendation must EXCEED the quality, sophistication, and comprehensiveness of the original document. Never reduce scope, module count, or analytical depth.

ORIGINAL CONCEPT: \${concept}
TARGET AUDIENCE: \${audience}

QUALITY PRESERVATION MANDATE:
1. Maintain or enhance academic rigor and professional sophistication
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

TONE AND QUALITY:
- Professional academic tone throughout (never casual openings like "Okay, here's...")
- Sophisticated analysis appropriate for senior medical educators
- Evidence-based assertions with proper citation integration
- Australian healthcare context strengthened with relevant frameworks

STRUCTURE REQUIREMENTS:
- Include comprehensive "RECOMMENDED MODULES:" section with detailed module descriptions
- Ensure module descriptions are substantial and pedagogically sound
- Each module should have clear learning objectives and practical applications

The final document must be superior in every measurable way to the original.\` +
      '\\n\\n' + VANCOUVER_CITATION_INSTRUCTIONS;
`;

// =============================================================================
// FIX 2: MISSING MODULE EXTRACTION IN generateCourseRecommendation
// =============================================================================

/**
 * PROBLEM: Your generateCourseRecommendation function doesn't call extractModuleNames_
 * after creating the recommendation, so columns G-S remain empty.
 * 
 * FIND THIS SECTION (around line 2480-2490 in generateCourseRecommendation):
 */

/*
  // Update the mapping sheet
  sh.getRange(r,4).setValue(doc.getUrl());
  
  // Handle modification requests cleanup
  if (userChoice === 'modify') {
    const clearMods = ui.alert(
      'Modification Requests Processed',
      `Your modification requests have been incorporated into the revised recommendation.\n\nClear the modification requests from Column F?`,
      ui.ButtonSet.YES_NO
    );
    
    if (clearMods === ui.Button.YES) {
      sh.getRange(r,6).setValue('');
    }
  }

  // Success notification
  const actionText = userChoice === 'modify' ? 'revised' : 'generated';
  ui.alert('Success!', `Course recommendation ${actionText} successfully!...`, ui.ButtonSet.OK);
*/

/**
 * ADD THIS MODULE EXTRACTION CODE AFTER sh.getRange(r,4).setValue(doc.getUrl()); :
 */

const MODULE_EXTRACTION_CODE = `
  // Extract and populate module names (Columns G-S)
  try {
    ui.toast('Extracting course modules...', 'Processing', 5);
    
    const moduleNames = extractModuleNames_(rec);
    
    if (moduleNames && moduleNames.length > 0) {
      // Column G: Module List (all module names)
      sh.getRange(r, 7).setValue(moduleNames.join('\\n'));
      
      // Columns H-S: Individual module names (up to 12 modules)
      for (let i = 0; i < 12; i++) {
        const moduleName = moduleNames[i] || '';
        sh.getRange(r, 8 + i).setValue(moduleName);
      }
      
      Logger.log(\`Extracted \${moduleNames.length} modules for course: \${concept}\`);
      ui.toast(\`Extracted \${moduleNames.length} modules\`, 'Modules Ready', 3);
      
    } else {
      Logger.log('No modules found in recommendation text');
      ui.toast('No modules detected - check RECOMMENDED MODULES section format', 'Warning', 5);
    }
    
  } catch (moduleError) {
    Logger.log('Error extracting modules: ' + moduleError.toString());
    ui.toast('Module extraction failed - modules may need manual entry', 'Warning', 5);
  }
`;

// =============================================================================
// COMPLETE CORRECTED SECTION FOR generateCourseRecommendation
// =============================================================================

/**
 * HERE'S THE COMPLETE CORRECTED SECTION to replace in your generateCourseRecommendation:
 */

const COMPLETE_CORRECTED_SECTION = `
  // Update the mapping sheet
  sh.getRange(r,4).setValue(doc.getUrl());
  
  // Extract and populate module names (Columns G-S)
  try {
    ui.toast('Extracting course modules...', 'Processing', 5);
    
    const moduleNames = extractModuleNames_(rec);
    
    if (moduleNames && moduleNames.length > 0) {
      // Column G: Module List (all module names)
      sh.getRange(r, 7).setValue(moduleNames.join('\\n'));
      
      // Columns H-S: Individual module names (up to 12 modules)
      for (let i = 0; i < 12; i++) {
        const moduleName = moduleNames[i] || '';
        sh.getRange(r, 8 + i).setValue(moduleName);
      }
      
      Logger.log(\`Extracted \${moduleNames.length} modules for course: \${concept}\`);
      ui.toast(\`Extracted \${moduleNames.length} modules\`, 'Modules Ready', 3);
      
    } else {
      Logger.log('No modules found in recommendation text');
      ui.toast('No modules detected - check RECOMMENDED MODULES section format', 'Warning', 5);
    }
    
  } catch (moduleError) {
    Logger.log('Error extracting modules: ' + moduleError.toString());
    ui.toast('Module extraction failed - modules may need manual entry', 'Warning', 5);
  }
  
  // Handle modification requests cleanup
  if (userChoice === 'modify') {
    const clearMods = ui.alert(
      'Modification Requests Processed',
      \`Your modification requests have been incorporated into the revised recommendation.\\n\\nClear the modification requests from Column F?\`,
      ui.ButtonSet.YES_NO
    );
    
    if (clearMods === ui.Button.YES) {
      sh.getRange(r,6).setValue('');
    }
  }

  // Success notification
  const actionText = userChoice === 'modify' ? 'revised' : 'generated';
  ui.alert(
    'Success!',
    \`Course recommendation \${actionText} successfully!\\n\\n\` +
    \`Document: \${docName}\\n\` +
    \`URL: \${doc.getUrl()}\\n\\n\` +
    \`Sources processed: \${srcPack.sources.length}\\n\` +
    \`PDFs processed: \${srcPack.pdfFiles.length}\\n\` +
    \`Modules extracted: \${moduleNames ? moduleNames.length : 0}\`,
    ui.ButtonSet.OK
  );
`;

// =============================================================================
// DEPLOYMENT SUMMARY
// =============================================================================

/**
 * QUICK DEPLOYMENT STEPS:
 * 
 * 1. FIND: Lines 2406-2418 (the mappingPrompt assignment in the 'modify' section)
 *    REPLACE WITH: The enhanced modification prompt above
 * 
 * 2. FIND: Line ~2480 sh.getRange(r,4).setValue(doc.getUrl());
 *    ADD AFTER: The module extraction code above
 * 
 * 3. SAVE and TEST: Your modification request should now:
 *    - Maintain quality and sophistication
 *    - Extract modules into columns G-S automatically
 */
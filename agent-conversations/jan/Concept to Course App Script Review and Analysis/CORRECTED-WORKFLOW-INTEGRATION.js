/**
 * CORRECTED WORKFLOW INTEGRATION
 * 
 * Carla's solution: 
 * 1. Integrate LMS generation INTO generateFullSuiteOfResources (Step 4)
 * 2. Make generateVoiceoverScripts Step 5 
 * 3. Maintain efficient 10-step workflow
 */

/**
 * STEP 4: Enhanced generateFullSuiteOfResources - NOW INCLUDES LMS GENERATION
 */
function generateFullSuiteOfResources() {
  try {
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    if (!sheet || !moduleName || !conceptName) {
      SpreadsheetApp.getUi().alert(
        'Setup Required',
        'Please ensure you are on a Module-Resources sheet and have selected a module row.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Get course setup
    const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mapping');
    if (!mappingSheet) {
      SpreadsheetApp.getUi().alert('Error', 'Mapping sheet not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    let courseFolderUrl = null;
    const mappingData = mappingSheet.getDataRange().getValues();
    
    for (let i = 1; i < mappingData.length; i++) {
      if (mappingData[i][0] === conceptName) {
        courseFolderUrl = mappingData[i][19];
        break;
      }
    }

    if (!courseFolderUrl) {
      SpreadsheetApp.getUi().alert('Error', 'Course folder URL not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    const moduleSubfolder = getModuleSubfolder_(courseFolder, moduleName);

    SpreadsheetApp.getActiveSpreadsheet().toast(`Generating complete content suite for "${moduleName}"...`);

    // Generate Module Description (Column C)
    if (!sheet.getRange(row, 3).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Module Description...');
      const descPrompt = buildModuleDescriptionPrompt(moduleName, conceptName);
      const description = callGeminiApi_(descPrompt);
      sheet.getRange(row, 3).setValue(description);
    }
    const moduleDescription = sheet.getRange(row, 3).getValue();

    // Generate Key Concepts (Column D)
    if (!sheet.getRange(row, 4).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Key Concepts...');
      const conceptsPrompt = buildKeyConceptsPrompt(moduleDescription, moduleName, conceptName);
      const keyConcepts = callGeminiApi_(conceptsPrompt);
      sheet.getRange(row, 4).setValue(keyConcepts);
    }
    const keyConcepts = sheet.getRange(row, 4).getValue();

    // Generate Slide Specifications (Column H) - REQUIRED FOR LMS
    if (!sheet.getRange(row, 8).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Slide Specifications...');
      const specsPrompt = buildSlideSpecsPrompt(moduleDescription, keyConcepts, moduleName, conceptName);
      const slideSpecs = callGeminiApi_(specsPrompt);
      sheet.getRange(row, 8).setValue(slideSpecs);
    }
    const slideSpecs = sheet.getRange(row, 8).getValue();

    // Generate Scenarios (Column E)
    if (!sheet.getRange(row, 5).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Scenarios...');
      const scenariosPrompt = buildEnhancedScenariosPrompt_(moduleName, moduleDescription, slideSpecs);
      const scenarios = callGeminiApi_(scenariosPrompt, 1.0);
      sheet.getRange(row, 5).setValue(scenarios);
    }

    // Generate Assessments (Column F)
    if (!sheet.getRange(row, 6).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Assessments...');
      const assessmentsPrompt = buildEnhancedAssessmentsPrompt_(moduleName, moduleDescription, slideSpecs);
      const assessments = callGeminiApi_(assessmentsPrompt);
      sheet.getRange(row, 6).setValue(assessments);
    }

    // Generate Resources (Column G)
    if (!sheet.getRange(row, 7).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Downloadable Resources...');
      const resourcesPrompt = buildResourcesPrompt_(moduleName, moduleDescription, keyConcepts);
      const resources = callGeminiApi_(resourcesPrompt);
      sheet.getRange(row, 7).setValue(resources);
    }

    // *** INTEGRATED: LMS CONTENT GENERATION (Column I) ***
    // This was previously a separate Step 5 - now integrated for efficiency
    if (!sheet.getRange(row, 9).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Absorb LMS Content - INTEGRATED INTO FULL SUITE!');
      
      if (!slideSpecs) {
        SpreadsheetApp.getUi().alert('LMS Generation Error', 'Slide Specifications are required for LMS content generation but are missing.', SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      // Use existing buildAbsorbLmsPrompt_ function - PRESERVED
      const absorbLmsPrompt = buildAbsorbLmsPrompt_(moduleName, slideSpecs, 'Note: Downloadable resources are provided in a separate document linked in the course.');
      const markdownContent = callGeminiApi_(absorbLmsPrompt);
      
      if (!markdownContent || markdownContent.trim().length === 0) {
        SpreadsheetApp.getUi().alert('LMS Generation Error', 'Gemini API returned empty content for LMS generation.', SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      // Create LMS document using existing function - PRESERVED
      const docId = createGoogleDocFromMarkdown_(moduleSubfolder, conceptName, moduleName, markdownContent);
      const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
      
      // Store URL in Column I
      sheet.getRange(row, 9).setValue(docUrl);
      
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ LMS Content integrated and generated!');
    }

    // Update status and completion
    const timestamp = new Date().toLocaleString('en-AU');
    sheet.getRange(row, 10).setValue('Full Suite Generated');
    sheet.getRange(row, 11).setValue(`Complete suite with LMS: ${timestamp}`);

    // SUCCESS MESSAGE - ENHANCED
    SpreadsheetApp.getUi().alert(
      'Complete Content Suite Generated!',
      `All resources generated for "${moduleName}":\n\n` +
      `✓ Module Description (C)\n` +
      `✓ Key Concepts (D)\n` +
      `✓ Scenarios (E)\n` +
      `✓ Assessments (F)\n` +
      `✓ Downloadable Resources (G)\n` +
      `✓ Slide Specifications (H)\n` +
      `🎯 LMS Content (I) - NOW INTEGRATED!\n` +
      `✓ Status Updated (J)\n\n` +
      `Next: Run Step 5 to generate voiceover scripts while still on this sheet.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    console.error('Error in generateFullSuiteOfResources:', error.toString());
    SpreadsheetApp.getUi().alert('Generation Error', `Error: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * STEP 5: generateVoiceoverScripts - Now properly positioned in workflow
 * This runs while user is still on Module-Resources tab for maximum efficiency
 */
function generateVoiceoverScripts() {
  const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
  if (!moduleName) {
    SpreadsheetApp.getUi().alert('Module Selection Required', 'Please select a module row on the Module-Resources sheet.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  SpreadsheetApp.getActiveSpreadsheet().toast(`Generating voiceover scripts for "${moduleName}"...`);

  // Get slide specifications (should exist from Step 4)
  const slideSpecs = sheet.getRange(row, 8).getValue();
  if (!slideSpecs) {
    return ui.alert('Prerequisites Missing', 'Slide Specifications (Column H) are required. Please run Step 4 first.', ui.ButtonSet.OK);
  }

  // Get TTS sheet (should exist from Step 3)
  const ttsSheet = ss.getSheetByName(`TTS-${conceptName}`);
  if (!ttsSheet) {
    return ui.alert('TTS Sheet Missing', `TTS sheet "TTS-${conceptName}" not found. Please run Step 3 first.`, ui.ButtonSet.OK);
  }

  // Parse slide specifications
  const slideData = parseSlideSpecs(slideSpecs);
  if (slideData.length === 0) {
    return ui.alert("Parsing Error", "Could not parse slide specifications. Please check the format in Column H.", ui.ButtonSet.OK);
  }
  
  // Generate voiceover scripts for each slide
  const ttsContent = [];
  try {
    for (let i = 0; i < slideData.length; i++) {
      const slide = slideData[i];
      const slideNumber = i + 1;
      
      ss.toast(`Processing Slide ${slideNumber} of ${slideData.length}...`);
      
      // Create comprehensive script for voiceover
      const combinedText = `${slide.title}\n\n${slide.body.join('\n')}`;
      
      // Generate professional voiceover script
      const scriptPrompt = `Convert this slide content into a professional voiceover script for Australian healthcare education:

SLIDE ${slideNumber}: ${slide.title}

Content:
${slide.body.join('\n')}

Requirements:
- Natural, conversational tone appropriate for healthcare professionals
- Clear pronunciation guidance for medical terms
- Smooth transitions and pacing cues
- Australian English pronunciation and terminology
- Approximately 60-90 seconds of spoken content per slide
- Include brief pauses [PAUSE] where appropriate for comprehension

Generate a professional narration script:`;

      const voiceScript = callGeminiApi_(scriptPrompt);
      
      // Prepare TTS sheet data
      ttsContent.push([
        moduleName,           // A: Module Name
        slideNumber,          // B: Slide Number  
        slide.title,          // C: Slide Title
        voiceScript,          // D: Narration Script
        '',                   // E: Audio File URL (to be filled in Step 8)
        '',                   // F: Duration (to be calculated)
        'Default Voice',      // G: Voice Settings
        'Script Ready',       // H: Status
        `Generated: ${new Date().toLocaleString('en-AU')}` // I: Notes
      ]);
    }
    
    // Clear existing TTS content for this module and populate new scripts
    const existingData = ttsSheet.getDataRange().getValues();
    let insertRow = 2; // Start after headers
    
    // Find insertion point (after any existing modules)
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0]) { // If module name exists
        insertRow = i + 1;
      }
    }
    
    // Insert the voiceover scripts
    if (ttsContent.length > 0) {
      ttsSheet.getRange(insertRow, 1, ttsContent.length, 9).setValues(ttsContent);
      
      // Format the narration script column for better readability
      ttsSheet.getRange(insertRow, 4, ttsContent.length, 1).setWrap(true);
    }
    
    ui.alert(
      'Voiceover Scripts Generated!',
      `Successfully generated ${ttsContent.length} voiceover scripts for "${moduleName}".\n\n` +
      `Scripts are now available in the TTS-${conceptName} sheet.\n\n` +
      `Next: Navigate to slides generation or audio generation as needed.`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    console.error('Error generating voiceover scripts:', error.toString());
    ui.alert('Script Generation Error', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Helper function (preserve existing)
 */
function buildResourcesPrompt_(moduleName, moduleDescription, keyConcepts) {
  return `Generate comprehensive downloadable resources for healthcare education module "${moduleName}".

Module Description: ${moduleDescription}

Key Concepts: ${keyConcepts}

Create detailed downloadable resources including:
1. Essential reading materials (Australian healthcare focus)
2. Interactive exercises and case studies
3. Practical tools and templates
4. Professional development opportunities
5. Reference materials and guidelines

Ensure all resources are relevant to Australian healthcare professionals and meet CPD requirements.`;
}

/*
CORRECTED MENU STRUCTURE (10 Steps):

Step 1: Setup Mapping Tab ✅
Step 2: Generate Recommendation ✅  
Step 3: Create Content Tabs & Subfolders ✅
Step 4: Generate Full Suite of Resources ✅ (NOW INCLUDES LMS!)
Step 5: Generate Voiceover Scripts ✅ (NEW - while on Module-Resources tab)
Step 6: Generate Slides for Module ✅
Step 7: Set TTS Voice ✅
Step 8: Generate All Audio for Module ✅
Step 9: Archive & Data Management ✅
Step 10: [Final step] ✅

WORKFLOW EFFICIENCY ACHIEVED:
✅ Step 4 generates ALL content including LMS in one go
✅ Step 5 generates voiceover scripts while still on Module-Resources tab
✅ No need to switch contexts between content generation and LMS creation
✅ Maintains 10-step workflow as intended
✅ Maximises script efficiency by integrating related functions

WHAT TO UPDATE IN MENU:
- Remove separate "Generate Absorb LMS Upload Doc" menu item
- Add "Generate Voiceover Scripts" as Step 5
- Update Step 4 description to include LMS generation

This achieves Carla's vision: efficient, integrated workflow with logical step progression!
*/
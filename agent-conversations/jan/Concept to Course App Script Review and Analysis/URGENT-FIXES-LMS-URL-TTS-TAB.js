/**
 * URGENT FIXES: LMS URL + Missing TTS Tab
 * 
 * FIX 1: LMS Content showing document ID instead of URL
 * FIX 2: TTS tab still not being created
 */

// FIX 1: Update the LMS content generation to create proper URL
function generateFullSuiteOfResources() {
  try {
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    if (!sheet || !moduleName || !conceptName) {
      SpreadsheetApp.getUi().alert(
        'Setup Required',
        'Please ensure you are:\n• On a Module-Resources sheet\n• In a row with a module name (row 2 or below)\n• The sheet name follows format: Module-Resources-{ConceptName}',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Get course folder
    const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mapping');
    if (!mappingSheet) {
      SpreadsheetApp.getUi().alert('Error', 'Mapping sheet not found. Please run setup first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    let courseFolderUrl = null;
    const mappingData = mappingSheet.getDataRange().getValues();
    
    for (let i = 1; i < mappingData.length; i++) {
      if (mappingData[i][0] === conceptName) {
        courseFolderUrl = mappingData[i][19]; // Column T
        break;
      }
    }

    if (!courseFolderUrl) {
      SpreadsheetApp.getUi().alert('Error', 'Course folder URL not found in Mapping sheet for this concept.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    const moduleSubfolder = getModuleSubfolder_(courseFolder, moduleName);

    SpreadsheetApp.getActiveSpreadsheet().toast(`Starting content generation for "${moduleName}"...`);

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

    // Generate Slide Specifications (Column H)
    if (!sheet.getRange(row, 8).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Slide Specifications...');
      const specsPrompt = buildSlideSpecsPrompt(moduleDescription, keyConcepts, moduleName, conceptName);
      const slideSpecs = callGeminiApi_(specsPrompt);
      sheet.getRange(row, 8).setValue(slideSpecs);
    }
    const slideSpecs = sheet.getRange(row, 8).getValue();

    // Generate Scenarios (Column E)
    if (!sheet.getRange(row, 5).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Generating Scenarios for "${moduleName}"`);
      const scenariosPrompt = buildEnhancedScenariosPrompt_(moduleName, moduleDescription, slideSpecs);
      const scenarios = callGeminiApi_(scenariosPrompt, 1.0);
      sheet.getRange(row, 5).setValue(scenarios);
    }

    // Generate Assessments (Column F)  
    if (!sheet.getRange(row, 6).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Generating Assessments for "${moduleName}"`);
      const assessmentsPrompt = buildEnhancedAssessmentsPrompt_(moduleName, moduleDescription, slideSpecs);
      const assessments = callGeminiApi_(assessmentsPrompt);
      sheet.getRange(row, 6).setValue(assessments);
    }

    // Generate Resources (Column G)
    if (!sheet.getRange(row, 7).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Generating Resources for "${moduleName}"`);
      const resourcesPrompt = buildResourcesPrompt_(moduleName, moduleDescription, keyConcepts);
      const resources = callGeminiApi_(resourcesPrompt);
      sheet.getRange(row, 7).setValue(resources);
    }

    // *** FIXED: GENERATE LMS CONTENT WITH PROPER URL (Column I) ***
    if (!sheet.getRange(row, 9).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`Generating Absorb LMS Content for "${moduleName}"`);
      
      const absorbLmsPrompt = buildAbsorbLmsPrompt_(moduleName, slideSpecs, 'Note: Downloadable resources are provided in a separate document linked in the course.');
      const markdownContent = callGeminiApi_(absorbLmsPrompt);
      
      // FIXED: Get document ID then convert to proper URL
      const docId = createGoogleDocFromMarkdown_(moduleSubfolder, conceptName, moduleName, markdownContent);
      const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
      
      // Store the proper URL in Column I
      sheet.getRange(row, 9).setValue(docUrl);
      
      SpreadsheetApp.getActiveSpreadsheet().toast(`✅ LMS Content URL generated and saved!`);
    }

    // Update status and notes
    const timestamp = new Date().toLocaleString('en-AU');
    sheet.getRange(row, 10).setValue('All Content Generated');
    sheet.getRange(row, 11).setValue(`Complete generation: ${timestamp}`);

    SpreadsheetApp.getUi().alert(
      'Content Generation Complete!',
      `All resources generated for "${moduleName}":\n✓ Module Description\n✓ Key Concepts\n✓ Scenarios\n✓ Assessments\n✓ Resources\n✓ Slide Specifications\n✅ LMS Content (proper URL)\n✓ Status Updated`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    console.error('Error in generateFullSuiteOfResources:', error.toString());
    SpreadsheetApp.getUi().alert('Generation Error', `Error: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// FIX 2: Force create the missing TTS tab
function createMissingTTSTab() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) {
    return ui.alert('Missing Mapping Sheet', 'Please run "#1 Setup" first to create the Mapping sheet.', ui.ButtonSet.OK);
  }
  
  // Get the active concept from current sheet or mapping
  let conceptName;
  const activeSheet = ss.getActiveSheet();
  const activeSheetName = activeSheet.getName();
  
  if (activeSheetName.startsWith('Module-Resources-')) {
    conceptName = activeSheetName.replace('Module-Resources-', '');
  } else {
    // Get from mapping sheet
    const row = mappingSheet.getActiveCell().getRow();
    if (row < 2) {
      return ui.alert('Row Selection Required', 'Please select a data row on the Mapping sheet or be on a Module-Resources sheet.', ui.ButtonSet.OK);
    }
    conceptName = mappingSheet.getRange(row, 1).getValue();
  }
  
  if (!conceptName) {
    return ui.alert('Concept Name Missing', 'Cannot determine concept name for TTS sheet creation.', ui.ButtonSet.OK);
  }
  
  // Check if TTS sheet already exists
  const ttsSheetName = `TTS-${conceptName}`;
  let ttsSheet = ss.getSheetByName(ttsSheetName);
  
  if (ttsSheet) {
    return ui.alert('TTS Sheet Exists', `The TTS sheet "${ttsSheetName}" already exists.`, ui.ButtonSet.OK);
  }
  
  try {
    ss.toast('Creating missing TTS sheet...');
    
    // Create new TTS sheet
    ttsSheet = ss.insertSheet(ttsSheetName);
    
    // Set up proper headers for TTS sheet
    const ttsHeaders = [
      'Module Name',           // A
      'Slide Number',          // B
      'Slide Title',           // C
      'Narration Script',      // D
      'Audio File URL',        // E
      'Duration (seconds)',    // F
      'Voice Settings',        // G
      'Status',                // H
      'Notes'                  // I
    ];
    
    // Set headers
    ttsSheet.getRange(1, 1, 1, ttsHeaders.length).setValues([ttsHeaders]);
    
    // Format headers
    const ttsHeaderRange = ttsSheet.getRange(1, 1, 1, ttsHeaders.length);
    ttsHeaderRange.setFontWeight('bold')
                  .setBackground('#34A853')
                  .setFontColor('#FFFFFF')
                  .setHorizontalAlignment('center');
    
    // Freeze header row
    ttsSheet.setFrozenRows(1);
    
    // Set column widths
    ttsSheet.setColumnWidth(1, 200); // Module Name
    ttsSheet.setColumnWidth(3, 250); // Slide Title
    ttsSheet.setColumnWidth(4, 400); // Narration Script
    ttsSheet.setColumnWidth(5, 300); // Audio File URL
    
    // Set text wrapping for narration script
    ttsSheet.getRange(2, 4, 50, 1).setWrap(true);
    
    Logger.log(`Successfully created TTS sheet: ${ttsSheetName}`);
    
    // Success message
    ui.alert('TTS Sheet Created', `Successfully created "${ttsSheetName}" sheet with proper headers and formatting.`, ui.ButtonSet.OK);
    
    // Navigate to the new TTS sheet
    ss.setActiveSheet(ttsSheet);
    
    ss.toast(`TTS sheet "${ttsSheetName}" created successfully!`, '', 3);
    
  } catch (error) {
    Logger.log(`Error creating TTS sheet: ${error.toString()}`);
    ui.alert('TTS Creation Error', `Error creating TTS sheet: ${error.message}`, ui.ButtonSet.OK);
  }
}

function buildResourcesPrompt_(moduleName, moduleDescription, keyConcepts) {
  return `Generate comprehensive resources for healthcare education module "${moduleName}".

Module Description: ${moduleDescription}

Key Concepts: ${keyConcepts}

Create detailed resources including:
1. Essential reading materials (Australian healthcare focus)
2. Interactive exercises and case studies
3. Practical tools and templates
4. Professional development opportunities
5. Reference materials and guidelines

Ensure all resources are relevant to Australian healthcare professionals and meet CPD requirements.`;
}

/*
IMMEDIATE ACTIONS REQUIRED:

1. REPLACE generateFullSuiteOfResources function with the fixed version above
   - This converts the document ID to proper Google Docs URL
   - Line: const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

2. ADD the createMissingTTSTab function to your script

3. RUN createMissingTTSTab() to create the missing TTS sheet

4. TEST the LMS content generation - should now show proper URLs instead of IDs

WHAT'S FIXED:
✅ LMS Content now stores proper Google Docs URLs instead of document IDs
✅ TTS tab creation function that works independently  
✅ Better concept name detection for TTS sheet creation
✅ Proper error handling and user guidance

The LMS URL issue was simple - the function was returning document ID instead of URL. 
Now it converts: "1T4B_Jtwq02jN3dxlDTsdI-gQ8ENadtVV1uVCu_AxUc0" 
Into: "https://docs.google.com/document/d/1T4B_Jtwq02jN3dxlDTsdI-gQ8ENadtVV1uVCu_AxUc0/edit"
*/
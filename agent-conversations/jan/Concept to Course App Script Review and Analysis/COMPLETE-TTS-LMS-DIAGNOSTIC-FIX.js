/**
 * COMPLETE DIAGNOSTIC AND FIX
 * 
 * ISSUE 1: TTS tab creation logic is broken - buried in conditional
 * ISSUE 2: LMS documents are empty - need diagnostic logging
 * 
 * This provides complete fixes and diagnostics for both issues.
 */

/**
 * FIXED: createCourseContentTabs - ALWAYS creates TTS sheet
 */
function createCourseContentTabs() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) {
    return ui.alert('Missing Mapping Sheet', 'Please run "#1 Setup" first to create the Mapping sheet.', ui.ButtonSet.OK);
  }
  
  const row = mappingSheet.getActiveCell().getRow();
  if (row < 2) {
    return ui.alert('Row Selection Required', 'Please select a data row (not the header row).', ui.ButtonSet.OK);
  }

  const courseName = mappingSheet.getRange(row, 1).getValue();
  const courseFolderUrl = mappingSheet.getRange(row, 20).getValue(); // Column T
  
  if (!courseName || !courseFolderUrl) {
    return ui.alert('Prerequisites Missing', 'Please run steps #1 and #2 first to set up course name and folder.', ui.ButtonSet.OK);
  }
  
  try {
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    
    // Get module names from columns H-S (8-19)
    const moduleNames = mappingSheet.getRange(row, 8, 1, 12).getValues()[0].filter(String);
    
    if (moduleNames.length === 0) {
      return ui.alert('No Modules Found', 'No module names found in columns H-S. Please run step #2 first to generate the recommendation.', ui.ButtonSet.OK);
    }

    let resourcesSheetCreated = false;
    let ttsSheetCreated = false;

    // Create module subfolders
    ss.toast('Creating/checking module subfolders...');
    moduleNames.forEach((name, index) => {
      const sanitizedName = name.replace(/[^a-zA-Z0-9\s\-]/g, '');
      const folderName = `Module ${index + 1} - ${sanitizedName}`;
      getOrCreateFolder_(courseFolder, folderName);
    });
    
    // Create Module-Resources sheet (if needed)
    const resourcesSheetName = `Module-Resources-${courseName}`;
    let resourcesSheet = ss.getSheetByName(resourcesSheetName);
    
    if (!resourcesSheet) {
      ss.toast('Creating Module-Resources sheet...');
      resourcesSheetCreated = true;
      
      resourcesSheet = ss.insertSheet(resourcesSheetName);
      
      const resourceHeaders = [
        'Module Name', 'Concept Name', 'Module Description', 'Key Concepts',
        'Scenarios', 'Assessments', 'Resources', 'Slide Specifications',
        'LMS Content', 'Status', 'Notes'
      ];
      
      resourcesSheet.getRange(1, 1, 1, resourceHeaders.length).setValues([resourceHeaders]);
      
      const headerRange = resourcesSheet.getRange(1, 1, 1, resourceHeaders.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#4285F4')
                 .setFontColor('#FFFFFF')
                 .setHorizontalAlignment('center');
      
      resourcesSheet.setFrozenRows(1);
      
      if (moduleNames.length > 0) {
        const moduleData = moduleNames.map(moduleName => [
          moduleName, courseName, '', '', '', '', '', '', '', 'Ready', ''
        ]);
        resourcesSheet.getRange(2, 1, moduleData.length, resourceHeaders.length).setValues(moduleData);
      }
      
      resourcesSheet.autoResizeColumns(1, resourceHeaders.length);
      resourcesSheet.setColumnWidth(1, 250);
      resourcesSheet.setColumnWidth(3, 300);
      resourcesSheet.setColumnWidth(4, 250);
      
      if (moduleNames.length > 0) {
        resourcesSheet.getRange(2, 3, moduleNames.length, 1).setWrap(true);
        resourcesSheet.getRange(2, 4, moduleNames.length, 1).setWrap(true);
      }
    }

    // FIXED: ALWAYS CREATE TTS SHEET (not conditional on Module-Resources creation)
    const ttsSheetName = `TTS-${courseName}`;
    let ttsSheet = ss.getSheetByName(ttsSheetName);
    
    if (!ttsSheet) {
      ss.toast('Creating TTS sheet...');
      ttsSheetCreated = true;
      
      try {
        ttsSheet = ss.insertSheet(ttsSheetName);
        
        const ttsHeaders = [
          'Module Name', 'Slide Number', 'Slide Title', 'Narration Script',
          'Audio File URL', 'Duration (seconds)', 'Voice Settings', 'Status', 'Notes'
        ];
        
        ttsSheet.getRange(1, 1, 1, ttsHeaders.length).setValues([ttsHeaders]);
        
        const ttsHeaderRange = ttsSheet.getRange(1, 1, 1, ttsHeaders.length);
        ttsHeaderRange.setFontWeight('bold')
                      .setBackground('#34A853')
                      .setFontColor('#FFFFFF')
                      .setHorizontalAlignment('center');
        
        ttsSheet.setFrozenRows(1);
        ttsSheet.autoResizeColumns(1, ttsHeaders.length);
        ttsSheet.setColumnWidth(1, 200);
        ttsSheet.setColumnWidth(3, 250);
        ttsSheet.setColumnWidth(4, 400);
        ttsSheet.setColumnWidth(5, 300);
        
        ttsSheet.getRange(2, 4, 50, 1).setWrap(true);
        
        Logger.log(`Successfully created TTS sheet: ${ttsSheetName}`);
        
      } catch (ttsError) {
        Logger.log(`Error creating TTS sheet: ${ttsError.toString()}`);
        ui.alert('TTS Sheet Warning', `Module-Resources created, but TTS sheet error: ${ttsError.message}`, ui.ButtonSet.OK);
      }
    }
    
    // Success message
    const createdItems = ['✓ Module subfolders checked/created'];
    if (resourcesSheetCreated) createdItems.push(`✓ Created ${resourcesSheetName}`);
    else createdItems.push(`✓ ${resourcesSheetName} already exists`);
    
    if (ttsSheetCreated) createdItems.push(`✅ Created ${ttsSheetName}`);
    else createdItems.push(`✓ ${ttsSheetName} already exists`);
    
    const successMessage = [
      'Content Workspace Setup Complete!',
      '',
      ...createdItems,
      '',
      'Next Steps:',
      '• Navigate to Module-Resources sheet',
      '• Select a module row',
      '• Run "#4 Generate Full Suite of Resources"'
    ].join('\n');
    
    ui.alert('Setup Complete', successMessage, ui.ButtonSet.OK);
    
    if (resourcesSheet) {
      ss.setActiveSheet(resourcesSheet);
      resourcesSheet.getRange(2, 1).activate();
    }
    
  } catch (error) {
    Logger.log(`Error in createCourseContentTabs: ${error.toString()}`);
    ui.alert('Creation Error', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * DIAGNOSTIC: Enhanced generateFullSuiteOfResources with LMS debugging
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

    console.log(`=== GENERATION START FOR ${moduleName} ===`);

    // Generate prerequisites for LMS content
    if (!sheet.getRange(row, 3).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Module Description...');
      const descPrompt = buildModuleDescriptionPrompt(moduleName, conceptName);
      const description = callGeminiApi_(descPrompt);
      sheet.getRange(row, 3).setValue(description);
      console.log('Module Description generated:', description.length, 'characters');
    }

    if (!sheet.getRange(row, 4).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Key Concepts...');
      const conceptsPrompt = buildKeyConceptsPrompt(sheet.getRange(row, 3).getValue(), moduleName, conceptName);
      const keyConcepts = callGeminiApi_(conceptsPrompt);
      sheet.getRange(row, 4).setValue(keyConcepts);
      console.log('Key Concepts generated:', keyConcepts.length, 'characters');
    }

    if (!sheet.getRange(row, 8).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Slide Specifications...');
      const specsPrompt = buildSlideSpecsPrompt(sheet.getRange(row, 3).getValue(), sheet.getRange(row, 4).getValue(), moduleName, conceptName);
      const slideSpecs = callGeminiApi_(specsPrompt);
      sheet.getRange(row, 8).setValue(slideSpecs);
      console.log('Slide Specs generated:', slideSpecs.length, 'characters');
    }

    // Get slide specs for LMS generation
    const slideSpecs = sheet.getRange(row, 8).getValue();
    console.log('Slide Specs for LMS:', slideSpecs ? slideSpecs.length : 'NULL', 'characters');

    // Generate other content
    if (!sheet.getRange(row, 5).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Scenarios...');
      const scenariosPrompt = buildEnhancedScenariosPrompt_(moduleName, sheet.getRange(row, 3).getValue(), slideSpecs);
      const scenarios = callGeminiApi_(scenariosPrompt, 1.0);
      sheet.getRange(row, 5).setValue(scenarios);
    }

    if (!sheet.getRange(row, 6).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Assessments...');
      const assessmentsPrompt = buildEnhancedAssessmentsPrompt_(moduleName, sheet.getRange(row, 3).getValue(), slideSpecs);
      const assessments = callGeminiApi_(assessmentsPrompt);
      sheet.getRange(row, 6).setValue(assessments);
    }

    if (!sheet.getRange(row, 7).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Resources...');
      const resourcesPrompt = buildResourcesPrompt_(moduleName, sheet.getRange(row, 3).getValue(), sheet.getRange(row, 4).getValue());
      const resources = callGeminiApi_(resourcesPrompt);
      sheet.getRange(row, 7).setValue(resources);
    }

    // *** DIAGNOSTIC LMS CONTENT GENERATION ***
    if (!sheet.getRange(row, 9).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('🔍 GENERATING LMS CONTENT - DIAGNOSTIC MODE');
      
      console.log('=== LMS GENERATION DIAGNOSTIC ===');
      console.log('Module Name:', moduleName);
      console.log('Slide Specs available:', !!slideSpecs);
      console.log('Slide Specs length:', slideSpecs ? slideSpecs.length : 'NULL');
      
      if (!slideSpecs) {
        SpreadsheetApp.getUi().alert('LMS Generation Error', 'Slide Specifications (Column H) are required for LMS content generation but are missing.', SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      // Generate LMS prompt
      const absorbLmsPrompt = buildAbsorbLmsPrompt_(moduleName, slideSpecs, 'Note: Downloadable resources are provided in a separate document linked in the course.');
      console.log('LMS Prompt generated:', absorbLmsPrompt.length, 'characters');
      console.log('LMS Prompt preview:', absorbLmsPrompt.substring(0, 300) + '...');
      
      // Call Gemini API
      console.log('Calling Gemini API for LMS content...');
      const markdownContent = callGeminiApi_(absorbLmsPrompt);
      console.log('LMS Content received:', markdownContent ? markdownContent.length : 'NULL', 'characters');
      
      if (!markdownContent || markdownContent.trim().length === 0) {
        SpreadsheetApp.getUi().alert('LMS Generation Error', 'Gemini API returned empty content for LMS generation. Check console logs.', SpreadsheetApp.getUi().ButtonSet.OK);
        console.error('EMPTY LMS CONTENT - Gemini API returned:', markdownContent);
        return;
      }
      
      console.log('LMS Content preview:', markdownContent.substring(0, 500) + '...');
      
      // Create document
      console.log('Creating Google Doc...');
      const docId = createGoogleDocFromMarkdown_(moduleSubfolder, conceptName, moduleName, markdownContent);
      console.log('Document created with ID:', docId);
      
      const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
      console.log('Document URL:', docUrl);
      
      // Store URL
      sheet.getRange(row, 9).setValue(docUrl);
      console.log('LMS URL stored in Column I');
      
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ LMS Content generated with diagnostics!');
    }

    // Update status
    const timestamp = new Date().toLocaleString('en-AU');
    sheet.getRange(row, 10).setValue('All Content Generated');
    sheet.getRange(row, 11).setValue(`Complete: ${timestamp}`);

    console.log('=== GENERATION COMPLETE ===');

    SpreadsheetApp.getUi().alert(
      'Content Generation Complete!',
      `All resources generated for "${moduleName}" including LMS content. Check console logs for diagnostics.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    console.error('Error in generateFullSuiteOfResources:', error.toString());
    SpreadsheetApp.getUi().alert('Generation Error', `Error: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
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
DEPLOYMENT INSTRUCTIONS:

1. REPLACE createCourseContentTabs function - fixes TTS creation logic
2. REPLACE generateFullSuiteOfResources function - adds LMS diagnostics  
3. Run Step 3 again to create the TTS sheet
4. Run content generation and check browser console (Ctrl+Shift+J) for detailed LMS diagnostics

WHAT'S FIXED:
✅ TTS sheet now ALWAYS gets created regardless of Module-Resources status
✅ LMS generation has comprehensive diagnostic logging  
✅ Better error handling for empty LMS content
✅ Console logging shows exactly what's happening with LMS generation

This will tell us exactly why the LMS document is empty!
*/
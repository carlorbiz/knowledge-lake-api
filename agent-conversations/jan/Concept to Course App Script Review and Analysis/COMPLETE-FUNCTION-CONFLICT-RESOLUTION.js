/**
 * COMPLETE FUNCTION CONFLICT RESOLUTION
 * 
 * ROOT CAUSE IDENTIFIED:
 * Your script has TWO getActiveModuleInfo_ functions with completely different signatures!
 * 
 * Function 1 (line 2313): getActiveModuleInfo_() - no parameters, looks at fixed Mapping cells
 * Function 2 (line 3907): getActiveModuleInfo_() - expects to work with sheet selection
 * 
 * generateFullSuiteOfResources() calls getActiveModuleInfo_('Module-Resources') 
 * but the first function ignores the parameter entirely!
 * 
 * This fixes the fundamental conflict by providing ONE correct function.
 */

/**
 * REMOVE BOTH EXISTING getActiveModuleInfo_ functions and replace with this one
 */
function getActiveModuleInfo_(sheetPrefix) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const sheetName = activeSheet.getName();
    
    // Add detailed logging to debug the issue
    console.log('=== getActiveModuleInfo_ Debug ===');
    console.log('Sheet name:', sheetName);
    console.log('Looking for prefix:', sheetPrefix);
    console.log('Active cell:', activeSheet.getActiveCell().getA1Notation());
    
    // Handle Module-Resources sheets
    if (sheetPrefix === 'Module-Resources') {
      // Check if current sheet is a Module-Resources sheet
      if (sheetName.startsWith('Module-Resources-')) {
        const conceptName = sheetName.replace('Module-Resources-', '').trim();
        const activeRow = activeSheet.getActiveCell().getRow();
        
        console.log('Detected Module-Resources sheet');
        console.log('Concept name:', conceptName);
        console.log('Active row:', activeRow);
        
        if (activeRow < 2) {
          SpreadsheetApp.getUi().alert('Row Selection', 'Please select a module row (row 2 or below), not the header row.', SpreadsheetApp.getUi().ButtonSet.OK);
          return { sheet: null, row: null, moduleName: null, conceptName: null };
        }
        
        // Get module name from Column A
        const moduleName = activeSheet.getRange(activeRow, 1).getValue();
        
        console.log('Module name from A' + activeRow + ':', moduleName);
        
        if (!moduleName || String(moduleName).trim() === '') {
          SpreadsheetApp.getUi().alert('No Module Name', 'No module name found in column A of the selected row. Please select a row with a module name.', SpreadsheetApp.getUi().ButtonSet.OK);
          return { sheet: null, row: null, moduleName: null, conceptName: null };
        }
        
        const result = {
          sheet: activeSheet,
          row: activeRow,
          moduleName: String(moduleName).trim(),
          conceptName: conceptName
        };
        
        console.log('Returning result:', result);
        return result;
      } else {
        // Not on a Module-Resources sheet
        console.log('Not on Module-Resources sheet');
        SpreadsheetApp.getUi().alert(
          'Wrong Sheet', 
          `Please navigate to a Module-Resources sheet first. Currently on: "${sheetName}"`, 
          SpreadsheetApp.getUi().ButtonSet.OK
        );
        return { sheet: null, row: null, moduleName: null, conceptName: null };
      }
    }
    
    // Handle other sheet types if needed (TTS, etc.)
    if (sheetPrefix === 'TTS') {
      if (sheetName.startsWith('TTS-')) {
        const conceptName = sheetName.replace('TTS-', '').trim();
        return {
          sheet: activeSheet,
          row: activeSheet.getActiveCell().getRow(),
          moduleName: null, // TTS sheets don't have module names in same way
          conceptName: conceptName
        };
      }
    }
    
    // If we get here, wrong sheet type
    console.log('Sheet does not match expected prefix');
    return { sheet: null, row: null, moduleName: null, conceptName: null };
    
  } catch (error) {
    console.error('Error in getActiveModuleInfo_:', error.toString());
    SpreadsheetApp.getUi().alert('Function Error', `Error: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { sheet: null, row: null, moduleName: null, conceptName: null };
  }
}

/**
 * CORRECTED: generateFullSuiteOfResources with better error handling
 */
function generateFullSuiteOfResources() {
  try {
    // Call the corrected function
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    console.log('generateFullSuiteOfResources called');
    console.log('Got from getActiveModuleInfo_:', { sheet: sheet?.getName(), row, moduleName, conceptName });
    
    // Check if we got valid data
    if (!sheet || !moduleName || !conceptName) {
      console.log('Invalid data returned from getActiveModuleInfo_');
      SpreadsheetApp.getUi().alert(
        'Setup Required',
        'Please ensure you are:\n• On a Module-Resources sheet\n• In a row with a module name (row 2 or below)\n• The sheet name follows format: Module-Resources-{ConceptName}',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Get course folder for file creation
    const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mapping');
    if (!mappingSheet) {
      SpreadsheetApp.getUi().alert('Error', 'Mapping sheet not found. Please run setup first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    // Find the course row in mapping (look for matching concept name)
    let courseFolderUrl = null;
    const mappingData = mappingSheet.getDataRange().getValues();
    
    for (let i = 1; i < mappingData.length; i++) {
      if (mappingData[i][0] === conceptName) { // Column A = Concept Name
        courseFolderUrl = mappingData[i][19]; // Column T = Course Folder URL
        break;
      }
    }

    if (!courseFolderUrl) {
      SpreadsheetApp.getUi().alert('Error', 'Course folder URL not found in Mapping sheet for this concept.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);

    SpreadsheetApp.getActiveSpreadsheet().toast(`Starting content generation for "${moduleName}"...`);

    // Column mappings based on the headers we created:
    // A: Module Name, B: Concept Name, C: Module Description, D: Key Concepts
    // E: Scenarios, F: Assessments, G: Resources, H: Slide Specifications

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

    // Update status (Column J) and notes (Column K)
    const timestamp = new Date().toLocaleString('en-AU');
    sheet.getRange(row, 10).setValue('Content Generated');
    sheet.getRange(row, 11).setValue(`Generated: ${timestamp}`);

    // Success message
    SpreadsheetApp.getUi().alert(
      'Content Generation Complete',
      `All resources generated for "${moduleName}":\n✓ Module Description\n✓ Key Concepts\n✓ Slide Specifications\n✓ Scenarios\n✓ Assessments\n✓ Resources`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    console.error('Error in generateFullSuiteOfResources:', error.toString());
    SpreadsheetApp.getUi().alert(
      'Generation Error',
      `Error: ${error.message}\n\nPlease check the console logs for more details.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Helper function for resource generation (add if missing)
 */
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
CRITICAL DEPLOYMENT INSTRUCTIONS:

1. FIND AND DELETE both existing getActiveModuleInfo_ functions in your script
   - One around line 2313
   - One around line 3907

2. REPLACE with the single corrected function above

3. REPLACE your generateFullSuiteOfResources function with the corrected version

4. The logging will help us see exactly what's happening when you test

5. TEST PROCESS:
   - Navigate to Module-Resources sheet
   - Click on a module row (row 2 or below)
   - Run menu item #4
   - Check browser console (Ctrl+Shift+J) to see the debug logs

This should finally fix the recognition issue by eliminating the function conflicts!
*/
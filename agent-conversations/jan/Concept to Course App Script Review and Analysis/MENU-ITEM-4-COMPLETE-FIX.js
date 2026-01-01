/**
 * MENU ITEM #4 COMPLETE FIX - Content Generation Not Working
 * 
 * ROOT CAUSE IDENTIFIED:
 * 1. Missing proper headers in Module-Resources sheet (fixed by Step 3 repair)
 * 2. getActiveModuleInfo_ function mismatch - calls expect different return structure
 * 3. Column mapping assumptions that don't match actual sheet structure
 * 
 * This fix provides the correct getActiveModuleInfo_ function and ensures
 * content generation works with the proper header structure.
 */

/**
 * CORRECTED: Get active module information for content generation
 * This version works with the Module-Resources sheet structure
 */
function getActiveModuleInfo_(sheetPrefix) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = SpreadsheetApp.getActiveSheet();
  const sheetName = activeSheet.getName();
  
  // Handle Module-Resources sheets
  if (sheetPrefix === 'Module-Resources' && sheetName.startsWith('Module-Resources-')) {
    const conceptName = sheetName.replace('Module-Resources-', '');
    const activeRow = activeSheet.getActiveCell().getRow();
    
    if (activeRow < 2) {
      SpreadsheetApp.getUi().alert('Please select a module row (not the header row).');
      return { sheet: null, row: null, moduleName: null, conceptName: null };
    }
    
    // Get module name from Column A (as per the fixed sheet structure)
    const moduleName = activeSheet.getRange(activeRow, 1).getValue();
    
    if (!moduleName) {
      SpreadsheetApp.getUi().alert('No module name found in the selected row.');
      return { sheet: null, row: null, moduleName: null, conceptName: null };
    }
    
    return {
      sheet: activeSheet,
      row: activeRow,
      moduleName: moduleName,
      conceptName: conceptName
    };
  }
  
  // Handle other sheet types if needed
  return { sheet: null, row: null, moduleName: null, conceptName: null };
}

/**
 * CORRECTED: Generate full suite of resources for a module
 * Now works with proper column mappings from the fixed sheet structure
 */
function generateFullSuiteOfResources() {
  const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
  
  if (!sheet || !moduleName) {
    SpreadsheetApp.getUi().alert(
      'Module Selection Required',
      'Please navigate to a Module-Resources sheet and select a module row.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  try {
    // Get or create the module subfolder
    const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mapping');
    const courseFolderUrl = mappingSheet.getRange('T2').getValue(); // Assuming course is in row 2
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    const moduleSubfolder = getModuleSubfolder_(courseFolder, moduleName);

    // CORRECTED COLUMN MAPPINGS based on fixed sheet structure:
    // A: Module Name
    // B: Concept Name  
    // C: Module Description
    // D: Key Concepts
    // E: Scenarios
    // F: Assessments
    // G: Resources
    // H: Slide Specifications
    // I: LMS Content
    // J: Status
    // K: Notes

    // Generate Module Description (Column C)
    if (!sheet.getRange(row, 3).getValue()) {
      SpreadsheetApp.getActiveSpreadsheet().toast('Generating Module Description...');
      const descPrompt = buildModuleDescriptionPrompt(moduleName, conceptName);
      const description = callGeminiApi_(descPrompt);
      sheet.getRange(row, 3).setValue(description);
      sheet.getRange(row, 10).setValue('Description Generated'); // Status update
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

    // Update status to completed (Column J)
    sheet.getRange(row, 10).setValue('Content Generated');
    
    // Add completion timestamp in notes (Column K)
    const timestamp = new Date().toLocaleString('en-AU');
    sheet.getRange(row, 11).setValue(`Content generated: ${timestamp}`);

    // Success message
    SpreadsheetApp.getUi().alert(
      'Content Generation Complete',
      `All resources have been generated for module "${moduleName}".\n\nGenerated:\n✓ Module Description\n✓ Key Concepts\n✓ Slide Specifications\n✓ Scenarios\n✓ Assessments\n✓ Resources`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    Logger.log('Error in generateFullSuiteOfResources: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Generation Error',
      `Error generating content: ${error.message}\n\nPlease check that:\n• You're on a Module-Resources sheet\n• A valid module row is selected\n• The Mapping sheet has proper folder URLs`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * HELPER: Get module subfolder - improved version
 */
function getModuleSubfolder_(courseFolder, moduleName) {
  try {
    const sanitizedName = moduleName.replace(/[^a-zA-Z0-9\s\-]/g, '');
    const folderName = sanitizedName;
    
    const folders = courseFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      return courseFolder.createFolder(folderName);
    }
  } catch (error) {
    Logger.log(`Error getting module subfolder for "${moduleName}": ${error.toString()}`);
    return null;
  }
}

/**
 * HELPER: Build resources prompt (if missing from script)
 */
function buildResourcesPrompt_(moduleName, moduleDescription, keyConcepts) {
  return `Generate comprehensive resources for the module "${moduleName}".

Module Description:
${moduleDescription}

Key Concepts:
${keyConcepts}

Create a detailed resources list including:
1. Essential reading materials
2. Interactive exercises
3. Practical tools and templates  
4. Additional learning resources
5. Reference materials

Focus on Australian healthcare context and ensure resources are accessible and practical for healthcare professionals.`;
}

/*
DEPLOYMENT INSTRUCTIONS:

1. DEPLOY THE STEP 3 FIX FIRST
   - This creates the proper headers that content generation depends on
   - Without proper headers, content generation will fail

2. REPLACE the existing getActiveModuleInfo_ function 
   - Use the corrected version that handles the 'Module-Resources' parameter
   - This fixes the function signature mismatch

3. REPLACE the existing generateFullSuiteOfResources function
   - Uses correct column mappings for the fixed sheet structure
   - Provides better error handling and user feedback

4. WHAT THIS FIXES:
   ✅ Content generation now works with proper column mappings
   ✅ Function calls match expected parameters and return values
   ✅ Proper error handling when user selects wrong row/sheet
   ✅ Status updates so user can track progress
   ✅ Timestamp tracking in notes column
   ✅ Comprehensive success/error messaging

5. TESTING PROCESS:
   ✅ Run Step 3 to create proper Module-Resources sheet with headers
   ✅ Navigate to Module-Resources sheet  
   ✅ Click on a module row (not header)
   ✅ Run Menu Item #4
   ✅ Content should generate in columns C, D, E, F, G, H

THE KEY: Proper headers in row 1 are ABSOLUTELY ESSENTIAL for content generation to work!
*/
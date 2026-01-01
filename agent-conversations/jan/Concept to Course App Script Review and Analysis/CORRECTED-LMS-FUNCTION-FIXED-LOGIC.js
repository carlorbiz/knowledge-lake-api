/**
 * CORRECTED LMS FUNCTION - Fixed Sheet Context Logic
 * 
 * CRITICAL FIX: Get folder URL from Mapping sheet (where it exists)
 * NOT from Module-Resources sheet (where it doesn't exist for module rows)
 * 
 * ROOT CAUSE RESOLVED:
 * - Module details: Module-Resources sheet (current row)
 * - Folder URL: Mapping sheet (always Row 2, Column T)
 */

/**
 * Generate LMS Content with corrected sheet logic
 */
function generateAbsorbLmsFile() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get module info from Module-Resources sheet (current context)
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    if (!moduleName) {
      ui.alert('Error', 'No module name found. Make sure you are on a Module-Resources sheet with a valid module row selected.', ui.ButtonSet.OK);
      return;
    }

    // CORRECTED: Get folder URL from Mapping sheet (where it actually exists)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = ss.getSheetByName('Mapping');
    
    if (!mappingSheet) {
      ui.alert('Error', 'Mapping sheet not found. Cannot locate course folder URL.', ui.ButtonSet.OK);
      return;
    }
    
    // Find the course row in Mapping sheet by matching concept name
    let courseFolderUrl = '';
    let courseRowFound = false;
    const mappingLastRow = mappingSheet.getLastRow();
    
    for (let r = 2; r <= mappingLastRow; r++) {
      const mappingConcept = mappingSheet.getRange(r, 1).getValue();
      if (String(mappingConcept).trim() === String(conceptName).trim()) {
        courseFolderUrl = mappingSheet.getRange(r, 20).getValue(); // Column T
        courseRowFound = true;
        Logger.log(`Found course folder URL in Mapping sheet row ${r}: ${courseFolderUrl}`);
        break;
      }
    }
    
    if (!courseRowFound || !courseFolderUrl) {
      ui.alert('Error', `Course folder URL not found in Mapping sheet for concept: "${conceptName}". Please ensure Column T in the Mapping sheet contains the course folder URL.`, ui.ButtonSet.OK);
      return;
    }

    // Get module subfolder (using the folder URL from Mapping sheet)
    const moduleSubfolder = getModuleSubfolder_(conceptName, moduleName);
    if (!moduleSubfolder) {
      ui.alert('Error', `Module subfolder not found for: "${moduleName}". Please ensure the module subfolder exists in the course directory.`, ui.ButtonSet.OK);
      return;
    }

    // Get content from Module-Resources sheet (current row context)
    const slideSpecs = sheet.getRange(row, 8).getValue(); // Column H - Slide Specifications
    const downloadableResourcesUrl = sheet.getRange(row, 7).getValue(); // Column G - Downloadable Resources
    
    if (!slideSpecs) {
      ui.alert('Error', 'Slide Specifications (Column H) are required for LMS content generation but are missing. Please generate slide specifications first.', ui.ButtonSet.OK);
      return;
    }
    
    if (!downloadableResourcesUrl) {
      ui.alert('Error', 'Downloadable Resources (Column G) are required for LMS content generation but are missing. Please generate downloadable resources first.', ui.ButtonSet.OK);
      return;
    }
    
    // Generate LMS content
    Logger.log(`Generating LMS content for module: ${moduleName}`);
    
    const absorbLmsPrompt = buildAbsorbLmsPrompt_(moduleName, slideSpecs, 'Note: Downloadable resources are provided in a separate document linked in the course.');
    
    if (!absorbLmsPrompt) {
      ui.alert('Error', 'Failed to build LMS prompt. Please check the buildAbsorbLmsPrompt_ function.', ui.ButtonSet.OK);
      return;
    }
    
    const markdownContent = callGeminiApi_(absorbLmsPrompt);
    
    if (!markdownContent || markdownContent.trim().length === 0) {
      ui.alert('Error', 'Gemini API returned empty content for LMS generation. Please try again or check your API configuration.', ui.ButtonSet.OK);
      return;
    }
    
    Logger.log(`Generated markdown content: ${markdownContent.length} characters`);
    
    // Create LMS document
    const docId = createGoogleDocFromMarkdown_(moduleSubfolder, conceptName, moduleName, markdownContent);
    
    if (!docId) {
      ui.alert('Error', 'Failed to create LMS document. Please check the createGoogleDocFromMarkdown_ function.', ui.ButtonSet.OK);
      return;
    }
    
    Logger.log(`Created LMS document with ID: ${docId}`);
    
    // Construct document URL
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    
    // Store URL in Column I of Module-Resources sheet
    sheet.getRange(row, 9).setValue(docUrl);
    
    // Verify the URL was stored
    const storedUrl = sheet.getRange(row, 9).getValue();
    Logger.log(`Stored URL in Column I: ${storedUrl}`);
    
    if (String(storedUrl) === String(docUrl)) {
      SpreadsheetApp.getActiveSpreadsheet().toast(`✅ Successfully created Absorb LMS Doc for "${moduleName}" and linked to Column I.`);
      Logger.log(`LMS generation completed successfully for module: ${moduleName}`);
    } else {
      ui.alert('Warning', `LMS document was created but may not have been properly linked to Column I. Document URL: ${docUrl}`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    Logger.log(`Error in generateAbsorbLmsFile: ${error.toString()}`);
    ui.alert('Error', `LMS generation failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * DEBUG FUNCTION - Test the corrected logic
 */
function debugCorrectedLMSLogic() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test getting module info from current sheet
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    let debugMsg = `CORRECTED LOGIC DEBUG:\n\n`;
    debugMsg += `Current Sheet: ${sheet ? sheet.getName() : 'NOT FOUND'}\n`;
    debugMsg += `Current Row: ${row}\n`;
    debugMsg += `Module Name: ${moduleName}\n`;
    debugMsg += `Concept Name: ${conceptName}\n\n`;
    
    if (!moduleName || !conceptName) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Module or concept name not found!', ui.ButtonSet.OK);
      return;
    }
    
    // Test getting folder URL from Mapping sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = ss.getSheetByName('Mapping');
    
    debugMsg += `Mapping Sheet Found: ${mappingSheet ? 'YES' : 'NO'}\n`;
    
    if (!mappingSheet) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Mapping sheet not found!', ui.ButtonSet.OK);
      return;
    }
    
    // Search for matching concept in Mapping sheet
    let courseFolderUrl = '';
    let courseRowFound = false;
    let mappingRowUsed = 0;
    const mappingLastRow = mappingSheet.getLastRow();
    
    debugMsg += `Searching Mapping sheet (${mappingLastRow} rows) for concept: "${conceptName}"\n\n`;
    
    for (let r = 2; r <= mappingLastRow; r++) {
      const mappingConcept = mappingSheet.getRange(r, 1).getValue();
      debugMsg += `Row ${r}: "${mappingConcept}" ${String(mappingConcept).trim() === String(conceptName).trim() ? '← MATCH!' : ''}\n`;
      
      if (String(mappingConcept).trim() === String(conceptName).trim()) {
        courseFolderUrl = mappingSheet.getRange(r, 20).getValue();
        courseRowFound = true;
        mappingRowUsed = r;
        break;
      }
    }
    
    debugMsg += `\nCourse Row Found: ${courseRowFound ? `YES (Row ${mappingRowUsed})` : 'NO'}\n`;
    debugMsg += `Course Folder URL: "${courseFolderUrl}"\n`;
    debugMsg += `Folder URL Valid: ${courseFolderUrl && String(courseFolderUrl).includes('drive.google.com') ? 'YES' : 'NO'}\n\n`;
    
    // Test content from Module-Resources sheet
    const slideSpecs = sheet.getRange(row, 8).getValue();
    const downloadableResources = sheet.getRange(row, 7).getValue();
    
    debugMsg += `Slide Specs (Col H): ${slideSpecs ? 'FOUND' : 'MISSING'}\n`;
    debugMsg += `Downloadable Resources (Col G): ${downloadableResources ? 'FOUND' : 'MISSING'}\n`;
    
    if (slideSpecs) {
      debugMsg += `Slide Specs Length: ${String(slideSpecs).length} characters\n`;
    }
    
    ui.alert('CORRECTED LOGIC DEBUG RESULTS', debugMsg, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('DEBUG ERROR', `Error in corrected logic debug: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. REPLACE your existing generateAbsorbLmsFile() function with this corrected version
 * 2. TEST by running debugCorrectedLMSLogic() first to verify the logic
 * 3. Then run the actual generateAbsorbLmsFile() on a module row
 * 
 * KEY CORRECTIONS:
 * - Gets folder URL from Mapping sheet (where it exists) by matching concept name
 * - Gets module details from Module-Resources sheet (current context)
 * - Proper error handling and user feedback
 * - Enhanced logging for troubleshooting
 * - Verification that URL was stored in Column I
 * 
 * LOGIC FLOW:
 * 1. Get module info from current Module-Resources sheet row
 * 2. Find matching concept in Mapping sheet 
 * 3. Get folder URL from Mapping sheet Column T
 * 4. Get module content from Module-Resources sheet columns
 * 5. Generate LMS content and store URL in Module-Resources Column I
 * 
 * This resolves the sheet context confusion that was causing the folder URL 
 * to be missing for modules beyond the first one.
 */
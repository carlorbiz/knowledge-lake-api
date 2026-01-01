/**
 * LMS LINKING DEBUG - Find out why Column I isn't getting the URL
 */

function debugLMSLinking() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test the generateAbsorbLmsFile function step by step
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    let debugMsg = `DEBUG - LMS Linking Issue:\n\n`;
    debugMsg += `Sheet: ${sheet ? sheet.getName() : 'NOT FOUND'}\n`;
    debugMsg += `Row: ${row}\n`;
    debugMsg += `Module: ${moduleName}\n`;
    debugMsg += `Concept: ${conceptName}\n\n`;
    
    if (!moduleName) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: No module name found!', ui.ButtonSet.OK);
      return;
    }
    
    // Check current Column I value before generation
    const currentColIValue = sheet.getRange(row, 9).getValue();
    debugMsg += `Column I BEFORE generation: "${currentColIValue}"\n\n`;
    
    // Check if moduleSubfolder is found
    const moduleSubfolder = getModuleSubfolder_(conceptName, moduleName);
    debugMsg += `Module subfolder: ${moduleSubfolder ? 'FOUND' : 'NOT FOUND'}\n`;
    
    if (!moduleSubfolder) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Module subfolder not found!', ui.ButtonSet.OK);
      return;
    }
    
    // Check slide specs and downloadable resources
    const slideSpecs = sheet.getRange(row, 8).getValue();
    const downloadableResourcesUrl = sheet.getRange(row, 7).getValue();
    
    debugMsg += `Slide Specs (Col H): ${slideSpecs ? 'FOUND' : 'MISSING'}\n`;
    debugMsg += `Downloadable Resources (Col G): ${downloadableResourcesUrl ? 'FOUND' : 'MISSING'}\n\n`;
    
    if (!slideSpecs || !downloadableResourcesUrl) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Missing slide specs or downloadable resources!', ui.ButtonSet.OK);
      return;
    }
    
    // Test the prompt generation
    const absorbLmsPrompt = buildAbsorbLmsPrompt_(moduleName, slideSpecs, 'Note: Downloadable resources are provided in a separate document linked in the course.');
    debugMsg += `LMS Prompt generated: ${absorbLmsPrompt ? 'YES' : 'NO'}\n`;
    debugMsg += `Prompt length: ${absorbLmsPrompt ? absorbLmsPrompt.length : 0} characters\n\n`;
    
    // Test Gemini API call
    const markdownContent = callGeminiApi_(absorbLmsPrompt);
    debugMsg += `Markdown content generated: ${markdownContent ? 'YES' : 'NO'}\n`;
    debugMsg += `Content length: ${markdownContent ? markdownContent.length : 0} characters\n\n`;
    
    if (!markdownContent || markdownContent.trim().length === 0) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Gemini API returned empty content!', ui.ButtonSet.OK);
      return;
    }
    
    // Test document creation
    const docId = createGoogleDocFromMarkdown_(moduleSubfolder, conceptName, moduleName, markdownContent);
    debugMsg += `Document ID returned: "${docId}"\n`;
    debugMsg += `DocId type: ${typeof docId}\n`;
    debugMsg += `DocId valid: ${docId && docId.length > 0 ? 'YES' : 'NO'}\n\n`;
    
    if (!docId) {
      ui.alert('DEBUG RESULT', debugMsg + 'ISSUE: Document creation failed - no docId returned!', ui.ButtonSet.OK);
      return;
    }
    
    // Test URL construction
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    debugMsg += `Constructed URL: "${docUrl}"\n\n`;
    
    // Test writing to Column I
    try {
      sheet.getRange(row, 9).setValue(docUrl);
      const newColIValue = sheet.getRange(row, 9).getValue();
      debugMsg += `Column I AFTER setting: "${newColIValue}"\n`;
      debugMsg += `URL successfully written: ${newColIValue === docUrl ? 'YES' : 'NO'}\n`;
    } catch (writeError) {
      debugMsg += `ERROR writing to Column I: ${writeError.toString()}\n`;
    }
    
    ui.alert('LMS LINKING DEBUG RESULTS', debugMsg, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('DEBUG ERROR', `Error during LMS linking debug: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * SIMPLIFIED LMS TEST - Create document and force link
 */
function testLMSLinkingSimple() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    if (!moduleName) {
      ui.alert('ERROR', 'No module found for testing', ui.ButtonSet.OK);
      return;
    }
    
    // Create a simple test document
    const testDoc = DocumentApp.create(`TEST_LMS_${moduleName}_${new Date().getTime()}`);
    testDoc.getBody().appendParagraph('TEST LMS DOCUMENT - If this appears in Column I, linking works!');
    testDoc.saveAndClose();
    
    const testDocId = testDoc.getId();
    const testDocUrl = `https://docs.google.com/document/d/${testDocId}/edit`;
    
    // Try to write to Column I
    sheet.getRange(row, 9).setValue(testDocUrl);
    
    // Verify it was written
    const verifyUrl = sheet.getRange(row, 9).getValue();
    
    ui.alert('TEST RESULT', 
      `Test document created and linked:\n\n` +
      `Document ID: ${testDocId}\n` +
      `URL written: ${testDocUrl}\n` +
      `URL verified: ${verifyUrl}\n\n` +
      `Success: ${verifyUrl === testDocUrl ? 'YES' : 'NO'}`, 
      ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('TEST ERROR', `Error in simple test: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * DEPLOYMENT FOR DEBUGGING:
 * 
 * 1. Add these debug functions to your script
 * 2. Select a row in Module-Resources sheet that should have LMS generation
 * 3. Run debugLMSLinking() to see exactly where it's failing
 * 4. Run testLMSLinkingSimple() to test basic linking functionality
 * 5. Report what the debug output shows
 * 
 * This will tell us:
 * - Is the document being created successfully?
 * - Is the docId being returned correctly?
 * - Is the URL construction working?
 * - Is the write to Column I succeeding?
 * - What's the exact point of failure?
 */
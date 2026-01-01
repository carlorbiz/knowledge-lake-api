/**
 * EMERGENCY LMS DEBUG - Let's find out exactly what's failing!
 */

function debugLMSGeneration() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const sh = SpreadsheetApp.getActiveSheet();
    const row = sh.getActiveRange().getRow();
    
    // Debug step 1: Basic values
    const concept = sh.getRange(row, 1).getValue();
    const audience = sh.getRange(row, 3).getValue() || 'Clinical';
    const courseFolderUrl = sh.getRange(row, 20).getValue();
    
    let debugMsg = `DEBUG STEP 1 - Basic Values:\n`;
    debugMsg += `Concept: "${concept}"\n`;
    debugMsg += `Audience: "${audience}"\n`;
    debugMsg += `Course Folder: "${courseFolderUrl}"\n\n`;
    
    if (!concept || !courseFolderUrl) {
      ui.alert('DEBUG FAILURE', debugMsg + 'MISSING concept or courseFolderUrl!', ui.ButtonSet.OK);
      return;
    }
    
    // Debug step 2: Check for Module-Resources sheet
    const ss = SpreadsheetApp.getActive();
    const moduleResourcesSheetName = `Module-Resources-${concept}`;
    const moduleResourcesSheet = ss.getSheetByName(moduleResourcesSheetName);
    
    debugMsg += `DEBUG STEP 2 - Sheet Check:\n`;
    debugMsg += `Looking for sheet: "${moduleResourcesSheetName}"\n`;
    debugMsg += `Sheet exists: ${moduleResourcesSheet ? 'YES' : 'NO'}\n\n`;
    
    if (!moduleResourcesSheet) {
      ui.alert('DEBUG FAILURE', debugMsg + 'MODULE-RESOURCES SHEET NOT FOUND!', ui.ButtonSet.OK);
      return;
    }
    
    // Debug step 3: Check modules in mapping sheet
    let modulesFound = [];
    for (let col = 8; col <= 19; col++) {
      const moduleName = sh.getRange(row, col).getValue();
      if (moduleName && String(moduleName).trim()) {
        modulesFound.push(`Col ${col}: "${String(moduleName).trim()}"`);
      }
    }
    
    debugMsg += `DEBUG STEP 3 - Modules in Mapping Sheet:\n`;
    debugMsg += modulesFound.length > 0 ? modulesFound.join('\n') : 'NO MODULES FOUND!\n';
    debugMsg += '\n\n';
    
    if (modulesFound.length === 0) {
      ui.alert('DEBUG FAILURE', debugMsg + 'NO MODULES IN MAPPING SHEET COLUMNS H-S!', ui.ButtonSet.OK);
      return;
    }
    
    // Debug step 4: Check Module-Resources sheet content
    const lastRow = moduleResourcesSheet.getLastRow();
    let moduleResourcesContent = [];
    
    for (let r = 2; r <= Math.min(lastRow, 10); r++) { // Check first few rows
      const moduleName = moduleResourcesSheet.getRange(r, 1).getValue();
      const moduleDesc = moduleResourcesSheet.getRange(r, 3).getValue();
      const keyConcepts = moduleResourcesSheet.getRange(r, 4).getValue();
      const slideSpecs = moduleResourcesSheet.getRange(r, 8).getValue();
      
      moduleResourcesContent.push(
        `Row ${r}: Module="${moduleName}" Desc="${String(moduleDesc).slice(0,50)}..." Concepts="${String(keyConcepts).slice(0,50)}..." Slides="${String(slideSpecs).slice(0,50)}..."`
      );
    }
    
    debugMsg += `DEBUG STEP 4 - Module-Resources Content (first few rows):\n`;
    debugMsg += `Total rows: ${lastRow}\n`;
    debugMsg += moduleResourcesContent.join('\n') + '\n\n';
    
    // Debug step 5: Try to find matching module
    let matchFound = false;
    let matchDetails = '';
    
    for (let col = 8; col <= 19; col++) {
      const mappingModuleName = sh.getRange(row, col).getValue();
      if (mappingModuleName && String(mappingModuleName).trim()) {
        const searchName = String(mappingModuleName).trim();
        
        for (let r = 2; r <= lastRow; r++) {
          const sheetModuleName = String(moduleResourcesSheet.getRange(r, 1).getValue()).trim();
          if (sheetModuleName === searchName) {
            matchFound = true;
            matchDetails = `MATCH FOUND!\nMapping Col ${col}: "${searchName}"\nSheet Row ${r}: "${sheetModuleName}"`;
            
            // Get the actual content
            const moduleDesc = moduleResourcesSheet.getRange(r, 3).getValue();
            const keyConcepts = moduleResourcesSheet.getRange(r, 4).getValue();
            const slideSpecs = moduleResourcesSheet.getRange(r, 8).getValue();
            
            matchDetails += `\nModule Desc (C): "${String(moduleDesc).slice(0,100)}..."`;
            matchDetails += `\nKey Concepts (D): "${String(keyConcepts).slice(0,100)}..."`;
            matchDetails += `\nSlide Specs (H): "${String(slideSpecs).slice(0,100)}..."`;
            break;
          }
        }
        if (matchFound) break;
      }
    }
    
    debugMsg += `DEBUG STEP 5 - Module Matching:\n`;
    debugMsg += matchFound ? matchDetails : 'NO MATCHING MODULE FOUND BETWEEN MAPPING AND MODULE-RESOURCES SHEETS!';
    
    ui.alert('LMS DEBUG RESULTS', debugMsg, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('DEBUG ERROR', `Error during debug: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * SIMPLIFIED LMS FUNCTION - Let's start basic and build up
 */
function generateLMSContent_SIMPLE() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const sh = SpreadsheetApp.getActiveSheet();
    const row = sh.getActiveRange().getRow();
    
    const concept = sh.getRange(row, 1).getValue();
    const courseFolderUrl = sh.getRange(row, 20).getValue();
    
    // Just create a test document with some content to verify it works
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    const docName = `${concept}_LMS_TEST_${timestamp}`;
    const doc = DocumentApp.create(docName);
    
    // Add to course folder
    let file = DriveApp.getFileById(doc.getId());
    const targetFolder = DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]);
    targetFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Add title and subtitle
    doc.getBody().appendParagraph(concept).setHeading(DocumentApp.ParagraphHeading.TITLE);
    doc.getBody().appendParagraph('Test Module').setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    doc.getBody().appendParagraph('');
    
    // Add test content
    doc.getBody().appendParagraph('TEST CONTENT ADDED SUCCESSFULLY!').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    doc.getBody().appendParagraph('If you can see this, the basic document creation is working.');
    doc.getBody().appendParagraph('');
    doc.getBody().appendParagraph('Next step: Debug why the real content is not being added.');
    
    doc.saveAndClose();
    
    ui.alert('SUCCESS', `Test LMS document created: ${docName}\n\nCheck if you can see the test content!`, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('ERROR', `Failed to create test document: ${error.toString()}`, ui.ButtonSet.OK);
  }
}

/**
 * DEPLOYMENT FOR DEBUGGING:
 * 
 * 1. Add these debug functions to your script
 * 2. Run debugLMSGeneration() on a mapping sheet row with modules
 * 3. Check what the debug reveals - where exactly is it failing?
 * 4. Run generateLMSContent_SIMPLE() to test if basic document creation works
 * 5. Report back what the debug shows so we can fix the exact issue!
 */
/**
 * MISSING LMS FUNCTION FIX
 * 
 * ISSUE IDENTIFIED: The generateLMSContent_ function doesn't exist in your script!
 * This explains why LMS documents are empty except for title/subtitle.
 * 
 * SOLUTION: Create the missing function that compiles content from TTS sheet
 * Formula equivalent: =H&" "&C&" "&D for each slide with clear slide breaks
 */

/**
 * Generate LMS Content - Missing function that creates content compilation
 * @param {number} row - The row number from the Mapping sheet
 */
function generateLMSContent_(row) {
  try {
    const sh = SpreadsheetApp.getActiveSheet();
    const concept = sh.getRange(row, 1).getValue();
    const audience = sh.getRange(row, 3).getValue() || 'Clinical';
    const courseFolderUrl = sh.getRange(row, 20).getValue();
    
    if (!concept || !courseFolderUrl) {
      Logger.log('Missing concept or course folder URL for LMS content generation');
      return;
    }
    
    // Get the TTS sheet for this concept
    const ss = SpreadsheetApp.getActive();
    const ttsSheet = ss.getSheetByName(`TTS-${concept}`);
    
    if (!ttsSheet) {
      Logger.log(`No TTS sheet found for concept: ${concept}`);
      return;
    }
    
    // Get all modules from the mapping sheet (columns H-S)
    const moduleNames = [];
    for (let i = 8; i <= 19; i++) { // Columns H-S (8-19)
      const moduleName = sh.getRange(row, i).getValue();
      if (moduleName && String(moduleName).trim()) {
        moduleNames.push(String(moduleName).trim());
      }
    }
    
    if (moduleNames.length === 0) {
      Logger.log('No modules found for LMS content generation');
      return;
    }
    
    // Create LMS document for each module
    moduleNames.forEach((moduleName, index) => {
      createLMSDocumentForModule(concept, moduleName, audience, courseFolderUrl, ttsSheet);
    });
    
    Logger.log(`Generated LMS content for ${moduleNames.length} modules`);
    
  } catch (error) {
    Logger.log('Error in generateLMSContent_: ' + error.toString());
  }
}

/**
 * Create LMS document for a specific module
 * @param {string} concept - Course concept name
 * @param {string} moduleName - Module name
 * @param {string} audience - Target audience
 * @param {string} courseFolderUrl - Course folder URL
 * @param {Object} ttsSheet - TTS sheet object
 */
function createLMSDocumentForModule(concept, moduleName, audience, courseFolderUrl, ttsSheet) {
  try {
    // Find all rows for this module in TTS sheet
    const lastRow = ttsSheet.getLastRow();
    const moduleRows = [];
    
    for (let r = 2; r <= lastRow; r++) {
      const rowModuleName = String(ttsSheet.getRange(r, 1).getValue()).trim();
      if (rowModuleName === moduleName) {
        moduleRows.push(r);
      }
    }
    
    if (moduleRows.length === 0) {
      Logger.log(`No TTS content found for module: ${moduleName}`);
      return;
    }
    
    // Create LMS document
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    const docName = `${concept}_${moduleName}_LMS_${timestamp}`;
    const doc = DocumentApp.create(docName);
    
    // Add to course folder
    let file = DriveApp.getFileById(doc.getId());
    const targetFolder = DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]);
    targetFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Add document title and subtitle (this part already works)
    doc.getBody().appendParagraph(concept).setHeading(DocumentApp.ParagraphHeading.TITLE);
    doc.getBody().appendParagraph(moduleName).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    doc.getBody().appendParagraph(''); // Empty line
    
    // COMPILE CONTENT: H + C + D for each slide with clear breaks
    moduleRows.forEach((rowNum, slideIndex) => {
      // Get content from columns H, C, D (positions 8, 3, 4)
      const slideNumber = ttsSheet.getRange(rowNum, 2).getValue(); // Column B - Slide#
      const slideContent = ttsSheet.getRange(rowNum, 3).getValue(); // Column C - Slide Content
      const voiceoverScript = ttsSheet.getRange(rowNum, 4).getValue(); // Column D - Voiceover Scripts
      const imagePrompt = ttsSheet.getRange(rowNum, 8).getValue(); // Column H - Image Prompt
      
      // CLEAR SLIDE BREAK for LMS AI tool recognition
      doc.getBody().appendParagraph(`=== SLIDE ${slideNumber} ===`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
      
      // Image Prompt (Column H)
      if (imagePrompt && String(imagePrompt).trim()) {
        doc.getBody().appendParagraph('IMAGE PROMPT:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        doc.getBody().appendParagraph(String(imagePrompt).trim());
        doc.getBody().appendParagraph(''); // Empty line
      }
      
      // Slide Content (Column C)
      if (slideContent && String(slideContent).trim()) {
        doc.getBody().appendParagraph('SLIDE CONTENT:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        doc.getBody().appendParagraph(String(slideContent).trim());
        doc.getBody().appendParagraph(''); // Empty line
      }
      
      // Voiceover Script (Column D)
      if (voiceoverScript && String(voiceoverScript).trim()) {
        doc.getBody().appendParagraph('VOICEOVER SCRIPT:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        doc.getBody().appendParagraph(String(voiceoverScript).trim());
        doc.getBody().appendParagraph(''); // Empty line
      }
      
      // Add separation between slides (except for last slide)
      if (slideIndex < moduleRows.length - 1) {
        doc.getBody().appendParagraph(''); // Extra spacing between slides
      }
    });
    
    doc.saveAndClose();
    
    // Update mapping sheet with LMS document link in Column I (position 9)
    const mappingSheet = SpreadsheetApp.getActiveSheet();
    const currentRow = mappingSheet.getActiveRange().getRow();
    mappingSheet.getRange(currentRow, 9).setValue(doc.getUrl());
    
    Logger.log(`Created LMS document for ${moduleName}: ${docName}`);
    
  } catch (error) {
    Logger.log(`Error creating LMS document for ${moduleName}: ${error.toString()}`);
  }
}

/**
 * Alternative: Create single combined LMS document for all modules
 * (Use this instead if you prefer one document per course rather than per module)
 */
function generateCombinedLMSContent_(row) {
  try {
    const sh = SpreadsheetApp.getActiveSheet();
    const concept = sh.getRange(row, 1).getValue();
    const audience = sh.getRange(row, 3).getValue() || 'Clinical';
    const courseFolderUrl = sh.getRange(row, 20).getValue();
    
    if (!concept || !courseFolderUrl) {
      Logger.log('Missing concept or course folder URL for LMS content generation');
      return;
    }
    
    // Get the TTS sheet for this concept
    const ss = SpreadsheetApp.getActive();
    const ttsSheet = ss.getSheetByName(`TTS-${concept}`);
    
    if (!ttsSheet) {
      Logger.log(`No TTS sheet found for concept: ${concept}`);
      return;
    }
    
    // Create single LMS document for entire course
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    const docName = `${concept}_LMS_Complete_${timestamp}`;
    const doc = DocumentApp.create(docName);
    
    // Add to course folder
    let file = DriveApp.getFileById(doc.getId());
    const targetFolder = DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]);
    targetFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Add document title
    doc.getBody().appendParagraph(concept).setHeading(DocumentApp.ParagraphHeading.TITLE);
    doc.getBody().appendParagraph('LMS Content Compilation').setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    doc.getBody().appendParagraph('');
    
    // Process all rows in TTS sheet
    const lastRow = ttsSheet.getLastRow();
    let currentModule = '';
    
    for (let r = 2; r <= lastRow; r++) {
      const moduleName = String(ttsSheet.getRange(r, 1).getValue()).trim();
      const slideNumber = ttsSheet.getRange(r, 2).getValue();
      const slideContent = ttsSheet.getRange(r, 3).getValue();
      const voiceoverScript = ttsSheet.getRange(r, 4).getValue();
      const imagePrompt = ttsSheet.getRange(r, 8).getValue();
      
      // Add module header if this is a new module
      if (moduleName !== currentModule) {
        doc.getBody().appendParagraph(`MODULE: ${moduleName}`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
        doc.getBody().appendParagraph('');
        currentModule = moduleName;
      }
      
      // CLEAR SLIDE BREAK for LMS AI tool recognition
      doc.getBody().appendParagraph(`=== SLIDE ${slideNumber} ===`).setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      // Compile H + C + D content
      if (imagePrompt && String(imagePrompt).trim()) {
        doc.getBody().appendParagraph('Image Prompt: ' + String(imagePrompt).trim());
        doc.getBody().appendParagraph('');
      }
      
      if (slideContent && String(slideContent).trim()) {
        doc.getBody().appendParagraph('Slide Content: ' + String(slideContent).trim());
        doc.getBody().appendParagraph('');
      }
      
      if (voiceoverScript && String(voiceoverScript).trim()) {
        doc.getBody().appendParagraph('Voiceover Script: ' + String(voiceoverScript).trim());
        doc.getBody().appendParagraph('');
      }
      
      doc.getBody().appendParagraph(''); // Separation between slides
    }
    
    doc.saveAndClose();
    
    // Update mapping sheet with LMS document link
    sh.getRange(row, 9).setValue(doc.getUrl()); // Column I for LMS link
    
    Logger.log(`Created combined LMS document: ${docName}`);
    
  } catch (error) {
    Logger.log(`Error creating combined LMS document: ${error.toString()}`);
  }
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. ADD the generateLMSContent_() function to your script
 * 2. ADD the createLMSDocumentForModule() helper function  
 * 3. CHOOSE your preferred approach:
 *    - Use generateLMSContent_() for separate LMS docs per module
 *    - OR use generateCombinedLMSContent_() for single combined document
 * 
 * 4. The function is automatically called after module extraction in 
 *    the corrected generateCourseRecommendation() function
 * 
 * CONTENT STRUCTURE:
 * - Clear slide breaks: === SLIDE 1 ===, === SLIDE 2 ===, etc.
 * - Image Prompt (Column H)
 * - Slide Content (Column C) 
 * - Voiceover Script (Column D)
 * - Proper formatting for LMS AI tool recognition
 * 
 * This creates the H + C + D compilation you requested with clear structure
 * for the LMS AI tool to recognise slide boundaries and content types.
 */
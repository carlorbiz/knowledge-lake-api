/**
 * CORRECTED LMS FUNCTION - Single Module from Module-Resources Tab
 * 
 * CORRECT UNDERSTANDING:
 * - Source: Module-Resources-{Concept} tab (NOT TTS tab)
 * - Content: D + C + H from Module-Resources tab
 * - D = Key Concepts
 * - C = Module Description  
 * - H = Slide Specifications
 * - Output: Single LMS document for single module
 * - Function name: generateLMSContent_ (as referenced in script)
 */

/**
 * Generate LMS Content for a single module from Module-Resources tab
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
    
    // Get the Module-Resources sheet for this concept
    const ss = SpreadsheetApp.getActive();
    const moduleResourcesSheet = ss.getSheetByName(`Module-Resources-${concept}`);
    
    if (!moduleResourcesSheet) {
      Logger.log(`No Module-Resources sheet found for concept: ${concept}`);
      return;
    }
    
    // Find the current module being processed
    // Look for the active module in the mapping sheet columns H-S
    let currentModule = '';
    let moduleFound = false;
    
    // Check columns H-S (8-19) to find which module we're working with
    for (let col = 8; col <= 19; col++) {
      const moduleName = sh.getRange(row, col).getValue();
      if (moduleName && String(moduleName).trim()) {
        // Check if this module exists in Module-Resources sheet
        const lastRow = moduleResourcesSheet.getLastRow();
        for (let r = 2; r <= lastRow; r++) {
          const sheetModuleName = String(moduleResourcesSheet.getRange(r, 1).getValue()).trim();
          if (sheetModuleName === String(moduleName).trim()) {
            currentModule = String(moduleName).trim();
            moduleFound = true;
            
            // Get the content from Module-Resources sheet
            const moduleDescription = moduleResourcesSheet.getRange(r, 3).getValue(); // Column C
            const keyConcepts = moduleResourcesSheet.getRange(r, 4).getValue(); // Column D  
            const slideSpecifications = moduleResourcesSheet.getRange(r, 8).getValue(); // Column H
            
            // Create LMS document
            createLMSDocument(concept, currentModule, moduleDescription, keyConcepts, slideSpecifications, courseFolderUrl, row, col);
            
            Logger.log(`Generated LMS content for module: ${currentModule}`);
            return; // Exit after processing first found module
          }
        }
      }
    }
    
    if (!moduleFound) {
      Logger.log('No matching module found in Module-Resources sheet');
    }
    
  } catch (error) {
    Logger.log('Error in generateLMSContent_: ' + error.toString());
  }
}

/**
 * Create LMS document with D + C + H content from Module-Resources tab
 * @param {string} concept - Course concept name
 * @param {string} moduleName - Module name
 * @param {string} moduleDescription - Column C content
 * @param {string} keyConcepts - Column D content
 * @param {string} slideSpecifications - Column H content
 * @param {string} courseFolderUrl - Course folder URL
 * @param {number} mappingRow - Mapping sheet row
 * @param {number} mappingCol - Mapping sheet column for this module
 */
function createLMSDocument(concept, moduleName, moduleDescription, keyConcepts, slideSpecifications, courseFolderUrl, mappingRow, mappingCol) {
  try {
    // Create LMS document
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    const docName = `${concept}_${moduleName}_LMS_${timestamp}`;
    const doc = DocumentApp.create(docName);
    
    // Add to course folder
    let file = DriveApp.getFileById(doc.getId());
    const targetFolder = DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]);
    targetFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Document structure: Title and Module name
    doc.getBody().appendParagraph(concept).setHeading(DocumentApp.ParagraphHeading.TITLE);
    doc.getBody().appendParagraph(moduleName).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    doc.getBody().appendParagraph(''); // Empty line
    
    // COMPILE CONTENT: H + C + D from Module-Resources tab (CORRECT ORDER)
    
    // 1. Slide Specifications (Column H) - FIRST and MOST HEAVILY EMPHASISED
    if (slideSpecifications && String(slideSpecifications).trim()) {
      doc.getBody().appendParagraph('SLIDE SPECIFICATIONS:').setHeading(DocumentApp.ParagraphHeading.HEADING1);
      
      // Parse slide specifications to add clear breaks for LMS AI tool
      const slideContent = String(slideSpecifications).trim();
      const slides = slideContent.split(/(?=SLIDE TITLE:|Slide \d+:|^\d+\.)/gm).filter(s => s.trim());
      
      slides.forEach((slide, index) => {
        if (slide.trim()) {
          // Add clear slide break for LMS AI recognition
          doc.getBody().appendParagraph(`=== SLIDE ${index + 1} ===`).setHeading(DocumentApp.ParagraphHeading.HEADING2);
          doc.getBody().appendParagraph(slide.trim());
          doc.getBody().appendParagraph(''); // Empty line between slides
        }
      });
    }
    
    // 2. Module Description (Column C) - SECOND
    if (moduleDescription && String(moduleDescription).trim()) {
      doc.getBody().appendParagraph('MODULE DESCRIPTION:').setHeading(DocumentApp.ParagraphHeading.HEADING1);
      doc.getBody().appendParagraph(String(moduleDescription).trim());
      doc.getBody().appendParagraph(''); // Empty line
    }
    
    // 3. Key Concepts (Column D) - LAST (for reinforcement of topic ideation)
    if (keyConcepts && String(keyConcepts).trim()) {
      doc.getBody().appendParagraph('KEY CONCEPTS:').setHeading(DocumentApp.ParagraphHeading.HEADING1);
      doc.getBody().appendParagraph(String(keyConcepts).trim());
      doc.getBody().appendParagraph(''); // Empty line
    }
    
    doc.saveAndClose();
    
    // Store LMS document URL back to mapping sheet
    // We can use column I (9) for LMS URLs since it's typically available
    const mappingSheet = SpreadsheetApp.getActiveSheet();
    mappingSheet.getRange(mappingRow, 9).setValue(doc.getUrl());
    
    Logger.log(`Created LMS document: ${docName}`);
    
  } catch (error) {
    Logger.log(`Error creating LMS document: ${error.toString()}`);
  }
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. REPLACE any existing generateLMSContent_ function with this corrected version
 * 2. ADD the createLMSDocument helper function
 * 3. TEST by running the course recommendation workflow
 * 
 * CORRECT CONTENT SOURCE:
 * - Module-Resources-{Concept} tab (NOT TTS tab)
 * - Column C: Module Description
 * - Column D: Key Concepts  
 * - Column H: Slide Specifications
 * 
 * DOCUMENT STRUCTURE (CORRECT ORDER):
 * - Course title
 * - Module name  
 * - Slide Specifications (Column H) - FIRST and most heavily emphasised
 * - Module Description (Column C) - SECOND
 * - Key Concepts (Column D) - LAST (for reinforcement of topic ideation)
 * 
 * OUTPUT:
 * - Single LMS document per module
 * - Clear formatting for LMS AI tool recognition
 * - Document URL stored in mapping sheet Column I
 * 
 * This creates the D + C + H compilation from Module-Resources tab
 * as requested, with proper slide breaks for LMS AI processing.
 */
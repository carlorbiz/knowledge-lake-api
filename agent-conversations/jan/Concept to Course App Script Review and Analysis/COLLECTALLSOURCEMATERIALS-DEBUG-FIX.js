/**
 * DEBUG FIX for collectAllSourceMaterials_ undefined errors
 * 
 * The error suggests the function is returning undefined instead of 
 * the expected object structure. This provides a robust fix.
 */

/**
 * SAFE WRAPPER for generateCourseRecommendation to handle undefined returns
 */
function generateCourseRecommendation(){
  var sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  var r = sh.getActiveRange().getRow();
  if (r === 1) return SpreadsheetApp.getUi().alert('Select a data row.');

  var concept = sh.getRange(r,1).getValue();
  var audience = sh.getRange(r,3).getValue() || 'Clinical';
  var existingRecommendation = sh.getRange(r,4).getValue(); // Column D - existing rec
  var modificationRequests = sh.getRange(r,6).getValue(); // Column F - modification requests
  var courseFolderUrl = sh.getRange(r,20).getValue();
  
  if (!concept) return SpreadsheetApp.getUi().alert('Fill Concept (A).');
  if (!courseFolderUrl) return SpreadsheetApp.getUi().alert('Missing Course Project Folder (Column T).');

  // Check if this is a modification request (existing rec + modification requests)
  var isModificationRequest = existingRecommendation && 
                             String(existingRecommendation).trim() && 
                             modificationRequests && 
                             String(modificationRequests).trim();

  var ui = SpreadsheetApp.getUi();
  var userChoice = 'new'; // default

  if (isModificationRequest) {
    // Ask user what they want to do
    var response = ui.alert(
      'Existing Recommendation Found',
      'This course already has a recommendation document.\n\n' +
      'Modification requests found: "' + String(modificationRequests).substring(0, 100) + (String(modificationRequests).length > 100 ? '...' : '') + '"\n\n' +
      'What would you like to do?\n\n' +
      '• YES: Create revised recommendation incorporating modification requests\n' +
      '• NO: Create completely new recommendation (ignores modifications)\n' +
      '• CANCEL: Stop and review modifications first',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (response === ui.Button.CANCEL) return;
    userChoice = response === ui.Button.YES ? 'modify' : 'new';
    
  } else if (existingRecommendation && String(existingRecommendation).trim()) {
    // Existing rec but no modification requests
    var response = ui.alert(
      'Existing Recommendation Found', 
      'This course already has a recommendation document.\n\n' +
      'Do you want to create a new recommendation?\n\n' +
      'TIP: To modify the existing recommendation, enter your requests in Column F (Modification Requests) first.',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.NO) return;
    userChoice = 'new';
  }

  // SAFE SOURCE COLLECTION with error handling
  var srcPack;
  try {
    srcPack = collectAllSourceMaterials_(r);
    
    // Ensure srcPack has required structure
    if (!srcPack || typeof srcPack !== 'object') {
      Logger.log('collectAllSourceMaterials_ returned invalid result: ' + srcPack);
      srcPack = {
        text: '',
        errors: ['Warning: Source materials could not be processed properly'],
        sources: [],
        pdfFiles: []
      };
    }
    
    // Ensure all required properties exist
    if (!srcPack.hasOwnProperty('errors')) srcPack.errors = [];
    if (!srcPack.hasOwnProperty('text')) srcPack.text = '';
    if (!srcPack.hasOwnProperty('sources')) srcPack.sources = [];
    if (!srcPack.hasOwnProperty('pdfFiles')) srcPack.pdfFiles = [];
    
  } catch (error) {
    Logger.log('Error in collectAllSourceMaterials_: ' + error.toString());
    srcPack = {
      text: '',
      errors: ['Error collecting source materials: ' + error.message],
      sources: [],
      pdfFiles: []
    };
  }
  
  // ENHANCED ERROR DISPLAY
  if (srcPack.errors && srcPack.errors.length) {
    // Separate permission errors from other errors
    var permissionErrors = srcPack.errors.filter(function(err) {
      return err.includes('FILE ACCESS ISSUE') || err.includes('FOLDER ACCESS ISSUE');
    });
    var otherErrors = srcPack.errors.filter(function(err) {
      return !err.includes('FILE ACCESS ISSUE') && !err.includes('FOLDER ACCESS ISSUE');
    });
    
    var errorMessage = '';
    
    if (permissionErrors.length > 0) {
      errorMessage += '🔒 SHARING PERMISSION ISSUES:\n\n' + permissionErrors.join('\n\n') + '\n\n';
    }
    
    if (otherErrors.length > 0) {
      errorMessage += '⚠️ OTHER ISSUES:\n\n' + otherErrors.join('\n');
    }
    
    // Show more user-friendly alert
    var response = ui.alert(
      'Source File Issues Detected',
      errorMessage + '\n\nDo you want to continue generating the recommendation with the available files?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.NO) return;
  }

  // Build the prompt based on user choice
  var mappingPrompt;
  var docSuffix = '';

  if (userChoice === 'modify') {
    // MODIFICATION MODE: Use existing recommendation + modification requests
    docSuffix = '_REVISED';
    
    mappingPrompt = brandHeader_() + '\n' + 
      'You are revising an existing course recommendation based on specific modification requests.\n\n' +
      'ORIGINAL CONCEPT: ' + concept + '\n' +
      'TARGET AUDIENCE: ' + audience + '\n\n' +
      'MODIFICATION REQUESTS FROM USER:\n' + modificationRequests + '\n\n' +
      'EXISTING RECOMMENDATION DOCUMENT: ' + existingRecommendation + '\n\n' +
      'INSTRUCTIONS:\n' +
      '1. Review the existing recommendation document at the URL above\n' +
      '2. Incorporate the specific modification requests provided\n' +
      '3. Maintain the quality and structure of the original recommendation\n' +
      '4. Ensure all requested changes are addressed comprehensively\n' +
      '5. Use the source materials below to support any new content needed\n\n' +
      VANCOUVER_CITATION_INSTRUCTIONS;

  } else {
    // NEW RECOMMENDATION MODE: Fresh start
    mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT +
      '\n\nCONCEPT: ' + concept + '\nSELECTED TARGET AUDIENCE: ' + audience + '\n' +
      VANCOUVER_CITATION_INSTRUCTIONS;
  }

  // Add source materials
  if (srcPack.text && srcPack.text.trim()) {
    mappingPrompt += '\n\nTEXT SOURCE MATERIALS:\n' + String(srcPack.text).slice(0,8000);
  }

  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    mappingPrompt += '\n\nPDF DOCUMENTS PROVIDED: ' + srcPack.pdfFiles.length + ' PDF file(s) attached for analysis. Please extract relevant information from these documents to inform the course development.';
    
    // Add note about source coverage for modifications
    if (userChoice === 'modify') {
      mappingPrompt += '\n\nNote: Pay special attention to the modification requests. If more sources or references are requested, ensure thorough coverage of the available materials.';
    }
  }

  // Call Gemini with PDFs (if available, otherwise fall back to regular call)
  var rec;
  try {
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0 && typeof callGeminiWithPDFs === 'function') {
      rec = callGeminiWithPDFs(mappingPrompt, 7000, srcPack.pdfFiles);
    } else {
      rec = callGemini(mappingPrompt, 7000);
    }
  } catch (error) {
    Logger.log('Error calling Gemini: ' + error.toString());
    ui.alert('Error', 'Failed to generate recommendation: ' + error.message, ui.ButtonSet.OK);
    return;
  }

  // Create document with appropriate naming
  var timestamp = new Date().toISOString().slice(0,16).replace('T','_');
  var docName = concept + '_Recommendations' + docSuffix + '_' + timestamp;
  var doc = DocumentApp.create(docName);
  
  var file = DriveApp.getFileById(doc.getId());
  var folderId = courseFolderUrl.split('/folders/')[1];
  if (folderId) {
    DriveApp.getFolderById(folderId).addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }

  // Add modification context to the document if applicable
  if (userChoice === 'modify') {
    doc.getBody().appendParagraph('REVISED RECOMMENDATION - ' + new Date().toLocaleString()).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    doc.getBody().appendParagraph('Original recommendation: ' + existingRecommendation);
    doc.getBody().appendParagraph('Modification requests addressed: ' + modificationRequests);
    doc.getBody().appendParagraph('').appendParagraph('REVISED RECOMMENDATION:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  doc.getBody().appendParagraph(rec);
  doc.saveAndClose();

  // Update the mapping sheet
  sh.getRange(r,4).setValue(doc.getUrl());
  
  // Clear modification requests after processing (optional - user preference)
  if (userChoice === 'modify') {
    var clearMods = ui.alert(
      'Modification Requests Processed',
      'Your modification requests have been incorporated into the revised recommendation.\n\n' +
      'Clear the modification requests from Column F?',
      ui.ButtonSet.YES_NO
    );
    
    if (clearMods === ui.Button.YES) {
      sh.getRange(r,6).setValue('');
    }
  }

  var actionText = userChoice === 'modify' ? 'revised' : 'generated';
  ui.alert('Course recommendation ' + actionText + '!\n\nDocument: ' + docName + '\nURL: ' + doc.getUrl());
}
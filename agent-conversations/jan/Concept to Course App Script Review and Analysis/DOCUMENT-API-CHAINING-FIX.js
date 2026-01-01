/**
 * FIX: Document API Chaining Error
 * 
 * Error: "doc.getBody(...).appendParagraph(...).appendParagraph is not a function"
 * 
 * Problem: You can't chain appendParagraph() calls because appendParagraph() 
 * returns a Paragraph object, not the Body object.
 */

// ❌ INCORRECT (causes the error you're seeing):
// doc.getBody().appendParagraph('Title').appendParagraph('Content');

// ✅ CORRECT (fix the chaining):
// const body = doc.getBody();
// body.appendParagraph('Title');
// body.appendParagraph('Content');

/**
 * FIND THIS SECTION in your generateCourseRecommendation function and REPLACE:
 */

// ❌ OLD CODE (likely around line where document is created):
/*
doc.getBody().appendParagraph('REVISED RECOMMENDATION')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1)
    .setForegroundColor('#1a73e8');
doc.getBody().appendParagraph(`Generated: ${new Date().toLocaleString('en-AU')}`);
doc.getBody().appendParagraph(`Original recommendation: ${existingRecommendation}`);
doc.getBody().appendParagraph(`Modification requests addressed: ${modificationRequests}`);
doc.getBody().appendParagraph('').appendParagraph('REVISED RECOMMENDATION:')  // ← THIS LINE CAUSES THE ERROR
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
*/

// ✅ NEW CODE (replace with this):
/**
 * CORRECTED Document Creation Section
 */
function createRecommendationDocument(doc, userChoice, existingRecommendation, modificationRequests, recommendation, srcPack) {
  const body = doc.getBody();
  
  if (userChoice === 'modify') {
    // Add revision header
    const titlePara = body.appendParagraph('REVISED RECOMMENDATION');
    titlePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    titlePara.setForegroundColor('#1a73e8');
    
    body.appendParagraph(`Generated: ${new Date().toLocaleString('en-AU')}`);
    body.appendParagraph(`Original recommendation: ${existingRecommendation}`);
    body.appendParagraph(`Modification requests addressed: ${modificationRequests}`);
    
    // Add empty paragraph, then subheading
    body.appendParagraph('');
    const subheadingPara = body.appendParagraph('REVISED RECOMMENDATION:');
    subheadingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  // Add the main recommendation content
  body.appendParagraph(recommendation);
  
  // Add source summary if available
  if (srcPack && (srcPack.sources.length > 0 || srcPack.pdfFiles.length > 0)) {
    body.appendParagraph('');
    const sourceHeaderPara = body.appendParagraph('SOURCE MATERIALS PROCESSED:');
    sourceHeaderPara.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
      body.appendParagraph(`PDF Documents: ${srcPack.pdfFiles.map(pdf => pdf.name).join(', ')}`);
    }
    
    if (srcPack.sources && srcPack.sources.length > 0) {
      body.appendParagraph(`Additional Sources: ${srcPack.sources.length} items processed`);
    }
  }
}

/**
 * REPLACEMENT for your document creation section in generateCourseRecommendation:
 */

// Find this in your generateCourseRecommendation function:
// Around where you create the document and add content
// REPLACE the document content section with:

/*
  // Create the recommendation document
  try {
    ui.toast('Creating recommendation document...', 'Finalising', 10);
    
    const timestamp = new Date().toISOString().slice(0,16).replace('T','_').replace(/:/g, '-');
    const docName = `${concept}_Recommendations${docSuffix}_${timestamp}`;
    const doc = DocumentApp.create(docName);
    
    // Move to course folder
    const file = DriveApp.getFileById(doc.getId());
    const folderId = courseFolderUrl.split('/folders/')[1];
    if (folderId) {
      DriveApp.getFolderById(folderId).addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }

    // ✅ USE THE CORRECTED DOCUMENT CREATION:
    createRecommendationDocument(doc, userChoice, existingRecommendation, modificationRequests, rec, srcPack);
    
    doc.saveAndClose();

    // Update the mapping sheet
    sh.getRange(r,4).setValue(doc.getUrl());
    
    // ... rest of your success handling code ...
    
  } catch (error) {
    Logger.log(`Error creating document: ${error.toString()}`);
    ui.alert('Document Creation Error', `Failed to create recommendation document: ${error.message}`, ui.ButtonSet.OK);
  }
*/

/**
 * ALTERNATIVE: Quick In-Place Fix
 * If you want to fix just the chaining error without adding the helper function:
 */

// Find the problematic line that looks like:
// doc.getBody().appendParagraph('').appendParagraph('REVISED RECOMMENDATION:')

// Replace with:
/*
const body = doc.getBody();
body.appendParagraph('');
const subheadingPara = body.appendParagraph('REVISED RECOMMENDATION:');
subheadingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
*/

/**
 * COMPLETE CORRECTED generateCourseRecommendation SECTION:
 * Document Creation with Proper API Usage
 */
/*
// Create the recommendation document
try {
  ui.toast('Creating recommendation document...', 'Finalising', 10);
  
  const timestamp = new Date().toISOString().slice(0,16).replace('T','_').replace(/:/g, '-');
  const docName = `${concept}_Recommendations${docSuffix}_${timestamp}`;
  const doc = DocumentApp.create(docName);
  
  // Move to course folder
  const file = DriveApp.getFileById(doc.getId());
  const folderId = courseFolderUrl.split('/folders/')[1];
  if (folderId) {
    DriveApp.getFolderById(folderId).addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }

  // Add content with proper Document API usage
  const body = doc.getBody();
  
  if (userChoice === 'modify') {
    const titlePara = body.appendParagraph('REVISED RECOMMENDATION');
    titlePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    titlePara.setForegroundColor('#1a73e8');
    
    body.appendParagraph(`Generated: ${new Date().toLocaleString('en-AU')}`);
    body.appendParagraph(`Original recommendation: ${existingRecommendation}`);
    body.appendParagraph(`Modification requests addressed: ${modificationRequests}`);
    
    body.appendParagraph('');
    const subheadingPara = body.appendParagraph('REVISED RECOMMENDATION:');
    subheadingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  body.appendParagraph(rec);
  
  // Add source summary
  if (srcPack.sources.length > 0 || srcPack.pdfFiles.length > 0) {
    body.appendParagraph('');
    const sourceHeaderPara = body.appendParagraph('SOURCE MATERIALS PROCESSED:');
    sourceHeaderPara.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    
    if (srcPack.pdfFiles.length > 0) {
      body.appendParagraph(`PDF Documents: ${srcPack.pdfFiles.map(pdf => pdf.name).join(', ')}`);
    }
    
    if (srcPack.sources.length > 0) {
      body.appendParagraph(`Additional Sources: ${srcPack.sources.length} items processed`);
    }
  }
  
  doc.saveAndClose();

  // Update the mapping sheet
  sh.getRange(r,4).setValue(doc.getUrl());
  
  // Handle modification requests cleanup
  if (userChoice === 'modify') {
    const clearMods = ui.alert(
      'Modification Requests Processed',
      `Your modification requests have been incorporated into the revised recommendation.\n\nClear the modification requests from Column F?`,
      ui.ButtonSet.YES_NO
    );
    
    if (clearMods === ui.Button.YES) {
      sh.getRange(r,6).setValue('');
    }
  }

  // Success notification
  const actionText = userChoice === 'modify' ? 'revised' : 'generated';
  ui.alert(
    'Success!',
    `Course recommendation ${actionText} successfully!\n\nDocument: ${docName}\nURL: ${doc.getUrl()}\n\nSources processed: ${srcPack.sources.length}\nPDFs processed: ${srcPack.pdfFiles.length}`,
    ui.ButtonSet.OK
  );
  
} catch (error) {
  Logger.log(`Error creating document: ${error.toString()}`);
  ui.alert('Document Creation Error', `Failed to create recommendation document: ${error.message}`, ui.ButtonSet.OK);
}
*/
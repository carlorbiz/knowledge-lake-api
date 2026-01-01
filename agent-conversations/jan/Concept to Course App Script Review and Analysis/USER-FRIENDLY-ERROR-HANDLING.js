/**
 * USER-FRIENDLY ERROR HANDLING
 * 
 * Enhanced error messages that help users resolve Drive access issues
 * with clear, actionable instructions.
 */

/**
 * ENHANCED readDriveFileText_ function with user-friendly error handling
 */
function readDriveFileText_(id){
  try{
    const f = DriveApp.getFileById(id);
    const nm = f.getName();
    const mime = String(f.getMimeType()||'').toLowerCase();
    
    if (mime.includes('document')){
      sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
      return DocumentApp.openById(id).getBody().getText() || '';
    }
    
    if (mime.includes('pdf')){
      sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
      
      // Add PDF to collection for Gemini processing (no conversion!)
      pdfFiles.push({
        name: nm,
        id: id,
        blob: f.getBlob(),
        url: `https://drive.google.com/file/d/${id}/view`
      });
      
      return `[PDF Document: ${nm} - Content will be processed by Gemini AI]\n`;
    }
    
    // Generic text files
    try { 
      return f.getBlob().getDataAsString(); 
    } catch(e) { 
      errors.push(`${nm}: ${e.message}`); 
      return ''; 
    }
    
  } catch(e) {
    // USER-FRIENDLY ERROR HANDLING
    if (e.message.includes('inaccessible') || 
        e.message.includes('not found') || 
        e.message.includes('Permission denied') ||
        e.message.includes('Requested entity was not found')) {
      
      const userFriendlyError = `FILE ACCESS ISSUE (${id}): Check sharing permissions for all sources are set to 'Anyone with the link'. ` +
        `Easy fix: download all source files to your device and upload into the new folder linked at row B2, then delete from your Downloads folder. ` +
        `Problem file: https://drive.google.com/file/d/${id}/view`;
      
      errors.push(userFriendlyError);
      return `[Inaccessible File - See instructions above to fix sharing permissions]`;
    }
    
    // Other Drive errors
    errors.push(`Drive read failed (${id}): ${e.message}`); 
    return '';
  }
}

/**
 * ENHANCED processOne_ function with user-friendly folder error handling
 */
function processOne_(label, val){
  if (!val) return;
  val = String(val).trim();
  if (!val) return;
  
  if (val.includes('drive.google.com/file/')){
    const match = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) push(label, readDriveFileText_(match[1]));
    
  } else if (val.includes('drive.google.com/folders/')){
    const match = val.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match){
      sources.push({type:'gfolder', title:label, id:match[1], url:val});
      try {
        const folder = DriveApp.getFolderById(match[1]);
        
        // Process files in main folder
        const files = folder.getFiles();
        while (files.hasNext()){
          const file = files.next();
          push(`${label}/${file.getName()}`, readDriveFileText_(file.getId()));
        }
        
        // Process subfolders
        const subfolders = folder.getFolders();
        while (subfolders.hasNext()){
          const subfolder = subfolders.next();
          const subFiles = subfolder.getFiles();
          while (subFiles.hasNext()){
            const subFile = subFiles.next();
            push(`${label}/${subfolder.getName()}/${subFile.getName()}`, readDriveFileText_(subFile.getId()));
          }
        }
        
      } catch(e){ 
        // USER-FRIENDLY FOLDER ERROR HANDLING
        if (e.message.includes('inaccessible') || 
            e.message.includes('not found') || 
            e.message.includes('Permission denied')) {
          
          const folderError = `FOLDER ACCESS ISSUE (${label}): Check sharing permissions for all source folders are set to 'Anyone with the link'. ` +
            `Easy fix: download all files from the restricted folder to your device and upload into the new course folder linked at row B2, then delete from your Downloads folder. ` +
            `Problem folder: ${val}`;
          
          errors.push(folderError);
        } else {
          errors.push(`${label} folder: ${e.message}`);
        }
      }
    }
    
  } else if (val.includes('docs.google.com/document/')){
    const match = val.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (match) push(label, readDriveFileText_(match[1]));
    
  } else if (val.match(/^https?:\/\//)){
    sources.push({type:'web', title:label, url:val});
    const webText = fetchUrlText_(val);
    if (typeof webText === 'string') push(label, webText);
    else if (webText && webText.text) push(label, webText.text);
    if (webText && webText.error) errors.push(`${label}: ${webText.error}`);
    
  } else {
    push(label, val);
  }
}

/**
 * ENHANCED error display in generateCourseRecommendation
 */
function generateCourseRecommendation(){
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  const r = sh.getActiveRange().getRow();
  if (r === 1) return SpreadsheetApp.getUi().alert('Select a data row.');

  const concept = sh.getRange(r,1).getValue();
  const audience = sh.getRange(r,3).getValue() || 'Clinical';
  const courseFolderUrl = sh.getRange(r,20).getValue();
  if (!concept) return SpreadsheetApp.getUi().alert('Fill Concept (A).');
  if (!courseFolderUrl) return SpreadsheetApp.getUi().alert('Missing Course Project Folder (Column T).');

  // Multi-source pack WITH PDF support
  const srcPack = collectAllSourceMaterials_(r);
  
  // ENHANCED ERROR DISPLAY
  if (srcPack.errors.length) {
    const ui = SpreadsheetApp.getUi();
    
    // Separate permission errors from other errors
    const permissionErrors = srcPack.errors.filter(err => err.includes('FILE ACCESS ISSUE') || err.includes('FOLDER ACCESS ISSUE'));
    const otherErrors = srcPack.errors.filter(err => !err.includes('FILE ACCESS ISSUE') && !err.includes('FOLDER ACCESS ISSUE'));
    
    let errorMessage = '';
    
    if (permissionErrors.length > 0) {
      errorMessage += '🔒 SHARING PERMISSION ISSUES:\n\n' + permissionErrors.join('\n\n') + '\n\n';
    }
    
    if (otherErrors.length > 0) {
      errorMessage += '⚠️ OTHER ISSUES:\n\n' + otherErrors.join('\n');
    }
    
    // Show more user-friendly alert
    const response = ui.alert(
      'Source File Issues Detected',
      errorMessage + '\n\nDo you want to continue generating the recommendation with the available files?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.NO) {
      return; // User chose to fix issues first
    }
  }

  // Build the prompt (rest of function continues as before...)
  let mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT +
    `\n\nCONCEPT: ${concept}\nSELECTED TARGET AUDIENCE: ${audience}\n` +
    VANCOUVER_CITATION_INSTRUCTIONS;

  if (srcPack.text && srcPack.text.trim()) {
    mappingPrompt += `\n\nTEXT SOURCE MATERIALS:\n${String(srcPack.text).slice(0,8000)}`;
  }

  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    mappingPrompt += `\n\nPDF DOCUMENTS PROVIDED: ${srcPack.pdfFiles.length} PDF file(s) attached for analysis. Please extract relevant information from these documents to inform the course development.`;
  }

  // Call Gemini with PDFs (if available, otherwise fall back to regular call)
  let rec;
  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    rec = callGeminiWithPDFs(mappingPrompt, 7000, srcPack.pdfFiles);
  } else {
    rec = callGemini(mappingPrompt, 7000);
  }

  // Create/attach doc (rest stays the same)
  const doc = DocumentApp.create(`${concept}_Recommendations_${new Date().toISOString().slice(0,16).replace('T','_')}`);
  let file = DriveApp.getFileById(doc.getId());
  DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]).addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  doc.getBody().appendParagraph(rec);
  doc.saveAndClose();

  sh.getRange(r,4).setValue(doc.getUrl());
  SpreadsheetApp.getUi().alert(`Course recommendation generated!\n\nDocument: ${doc.getName()}\nURL: ${doc.getUrl()}`);
}
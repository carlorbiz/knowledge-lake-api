/**
 * SIMPLE PDF FIX - NO CONVERSION AT ALL
 * 
 * Completely avoid any PDF conversion that triggers Adobe namespace resolution.
 * This will stop the DNS errors immediately.
 */

/**
 * REPLACE the PDF handling section (lines 1832-1841) in readDriveFileText_ with:
 */

if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  // Skip all PDF conversion - just return reference
  return `[PDF Document: ${nm}]\nFile Location: https://drive.google.com/file/d/${id}/view\n\nThis PDF document has been identified as a source material. Please review manually and include key points in your course development process.`;
}

/**
 * ALTERNATIVE: If you want to try basic text extraction without conversion:
 */

/*
if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  try {
    // Only try direct text extraction - no conversion
    const textContent = f.getBlob().getDataAsString('UTF-8');
    
    if (textContent && textContent.length > 100) {
      // Very basic text cleaning
      let cleanText = textContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep only printable ASCII + whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      // If we got some readable text, return it
      if (cleanText.length > 50 && /[a-zA-Z]{3,}/.test(cleanText)) {
        return `[PDF Content from ${nm}]\n\n${cleanText.substring(0, 2000)}${cleanText.length > 2000 ? '...' : ''}`;
      }
    }
  } catch (e) {
    Logger.log(`PDF text extraction failed for ${nm}: ${e.toString()}`);
  }
  
  // Fallback to reference only
  return `[PDF Document: ${nm}]\nFile Location: https://drive.google.com/file/d/${id}/view\n\nPDF text extraction not available. Please review manually.`;
}
*/

/**
 * COMPLETE CORRECTED readDriveFileText_ FUNCTION WITH SIMPLE PDF FIX:
 */

function readDriveFileText_(id){
  try{
    const f   = DriveApp.getFileById(id);
    const nm  = f.getName();
    const mime= String(f.getMimeType()||'').toLowerCase();
    
    if (mime.includes('document')){
      sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
      return DocumentApp.openById(id).getBody().getText() || '';
    }
    
    // SIMPLE PDF HANDLING - NO CONVERSION
    if (mime.includes('pdf')){
      sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
      
      // Skip all conversion - just return reference
      return `[PDF Document: ${nm}]\nFile Location: https://drive.google.com/file/d/${id}/view\n\nThis PDF document has been identified as a source material. Please review manually and include key points in your course development process.`;
    }
    
    // generic text-ish
    try { return f.getBlob().getDataAsString(); } catch(e){ errors.push(`${nm}: ${e.message}`); return ''; }
    
  }catch(e){
    errors.push(`Drive read failed (${id}): ${e.message}`); return '';
  }
}
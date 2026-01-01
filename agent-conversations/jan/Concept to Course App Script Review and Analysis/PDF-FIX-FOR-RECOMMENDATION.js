/**
 * PDF READING FIX FOR RECOMMENDATION GENERATION
 * 
 * The current PDF reading is causing DNS errors due to Adobe namespace resolution.
 * This provides a safer PDF handling approach.
 */

/**
 * SAFER PDF PROCESSING - Replace the PDF handling section in your readDriveFile_ function
 */

// REPLACE THIS SECTION (around line 1832-1840):
/*
      if (mime.includes('pdf')){
        sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
        try{
          const parentId = f.getParents().hasNext() ? f.getParents().next().getId() : null;
          const conv = Drive.Files.insert({title:'_ingest_'+nm, mimeType:'application/pdf', parents: parentId ? [{id: parentId}] : []}, f.getBlob(), {convert:true});
          return DocumentApp.openById(conv.id).getBody().getText() || '';
        } catch(e){
          try { return f.getBlob().getDataAsString(); } catch(_) { errors.push(`${nm}: PDF conversion unavailable`); return ''; }
        }
      }
*/

// WITH THIS SAFER VERSION:
if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  // Try safer PDF text extraction methods
  try {
    // Method 1: Try basic text extraction without XML parsing
    const blob = f.getBlob();
    let textContent = '';
    
    try {
      // Create a temporary Google Doc for conversion
      const tempDoc = DriveApp.createFile(`temp_pdf_convert_${Date.now()}`, blob, 'application/pdf');
      
      // Wait a moment for processing
      Utilities.sleep(1000);
      
      // Try to get the converted text
      const convertedBlob = tempDoc.getBlob();
      textContent = convertedBlob.getDataAsString('UTF-8');
      
      // Clean up temporary file
      DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
      
      if (textContent && textContent.trim().length > 10) {
        return textContent;
      }
    } catch (conversionError) {
      Logger.log(`PDF conversion method 1 failed for ${nm}: ${conversionError.toString()}`);
    }
    
    // Method 2: Try simple blob text extraction
    try {
      textContent = blob.getDataAsString('UTF-8');
      if (textContent && textContent.trim().length > 10) {
        return textContent;
      }
    } catch (blobError) {
      Logger.log(`PDF blob extraction failed for ${nm}: ${blobError.toString()}`);
    }
    
    // Method 3: Return placeholder with file info
    errors.push(`${nm}: PDF text extraction not available - file referenced but content not processed`);
    return `[PDF Document: ${nm} - Content requires manual review. File located at: https://drive.google.com/file/d/${id}/view]`;
    
  } catch(e) {
    errors.push(`${nm}: PDF processing error - ${e.message}`);
    return `[PDF Document: ${nm} - Processing failed. File located at: https://drive.google.com/file/d/${id}/view]`;
  }
}

/**
 * ALTERNATIVE SIMPLER APPROACH - If above is too complex
 * 
 * Just skip PDF text extraction and reference the files:
 */

/*
if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  // Don't try to extract PDF content - just reference it
  errors.push(`${nm}: PDF content not extracted - file referenced for manual review`);
  return `[PDF Reference: ${nm} - Please review manually at: https://drive.google.com/file/d/${id}/view]`;
}
*/

/**
 * RECOMMENDED IMMEDIATE FIX
 * 
 * For fastest resolution, temporarily disable PDF processing:
 */

/*
if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  // Temporary: Skip PDF extraction to avoid DNS errors
  return `[PDF Document: ${nm} - Content extraction temporarily disabled. File: https://drive.google.com/file/d/${id}/view]`;
}
*/
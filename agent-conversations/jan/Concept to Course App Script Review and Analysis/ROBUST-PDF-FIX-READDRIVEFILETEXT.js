/**
 * ROBUST PDF FIX for readDriveFileText_ function
 * 
 * Replaces the problematic PDF conversion that causes DNS errors
 * with a robust solution that avoids metadata processing.
 */

/**
 * REPLACE the PDF handling section (lines 1832-1841) in readDriveFileText_ function:
 * 
 * REMOVE THIS PROBLEMATIC CODE:
 */
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

/**
 * REPLACE WITH THIS ROBUST SOLUTION:
 */
if (mime.includes('pdf')){
  sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
  
  try {
    // Method 1: Use Google Drive API without metadata processing
    const blob = f.getBlob();
    
    // Create temporary document for conversion WITHOUT metadata parsing
    const tempFileName = `temp_pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Use DriveApp.createFile (simpler than Drive.Files.insert)
      const tempFile = DriveApp.createFile(tempFileName, blob);
      
      // Try to convert to Google Doc format for text extraction
      const convertedFile = Drive.Files.copy(
        {
          title: `${tempFileName}_converted`,
          mimeType: 'application/vnd.google-apps.document'
        },
        tempFile.getId()
      );
      
      // Extract text from converted document
      const extractedText = DocumentApp.openById(convertedFile.id).getBody().getText();
      
      // Clean up temporary files
      DriveApp.getFileById(tempFile.getId()).setTrashed(true);
      DriveApp.getFileById(convertedFile.id).setTrashed(true);
      
      if (extractedText && extractedText.trim().length > 10) {
        return extractedText;
      }
      
    } catch (conversionError) {
      Logger.log(`PDF conversion failed for ${nm}: ${conversionError.toString()}`);
    }
    
    // Method 2: Fallback to direct text extraction (works for text-based PDFs)
    try {
      const textContent = blob.getDataAsString('UTF-8');
      
      // Simple check if we got readable text (not just binary data)
      if (textContent && textContent.length > 50) {
        // Basic cleanup of common PDF artifacts
        let cleanText = textContent
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        // If we got reasonable text content, return it
        if (cleanText.length > 100 && /[a-zA-Z]/.test(cleanText)) {
          return cleanText;
        }
      }
    } catch (textError) {
      Logger.log(`PDF text extraction failed for ${nm}: ${textError.toString()}`);
    }
    
    // Method 3: Return informative placeholder if extraction fails
    return `[PDF Document: ${nm} - Text extraction not available. This is a PDF file that requires manual review. Access the file at: https://drive.google.com/file/d/${id}/view]\n\nNote: Please review this PDF manually and summarise key content for course development.`;
    
  } catch(e) {
    errors.push(`${nm}: PDF processing error - ${e.message}`);
    return `[PDF Document: ${nm} - Processing failed. File available at: https://drive.google.com/file/d/${id}/view]`;
  }
}

/**
 * COMPLETE CORRECTED readDriveFileText_ FUNCTION
 * 
 * Here's the entire function with the PDF fix applied:
 */
/*
function readDriveFileText_(id){
  try{
    const f   = DriveApp.getFileById(id);
    const nm  = f.getName();
    const mime= String(f.getMimeType()||'').toLowerCase();
    
    if (mime.includes('document')){
      sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
      return DocumentApp.openById(id).getBody().getText() || '';
    }
    
    // ROBUST PDF HANDLING (NO METADATA PROCESSING)
    if (mime.includes('pdf')){
      sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
      
      try {
        const blob = f.getBlob();
        const tempFileName = `temp_pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          const tempFile = DriveApp.createFile(tempFileName, blob);
          const convertedFile = Drive.Files.copy(
            {
              title: `${tempFileName}_converted`,
              mimeType: 'application/vnd.google-apps.document'
            },
            tempFile.getId()
          );
          
          const extractedText = DocumentApp.openById(convertedFile.id).getBody().getText();
          
          DriveApp.getFileById(tempFile.getId()).setTrashed(true);
          DriveApp.getFileById(convertedFile.id).setTrashed(true);
          
          if (extractedText && extractedText.trim().length > 10) {
            return extractedText;
          }
          
        } catch (conversionError) {
          Logger.log(`PDF conversion failed for ${nm}: ${conversionError.toString()}`);
        }
        
        try {
          const textContent = blob.getDataAsString('UTF-8');
          if (textContent && textContent.length > 50) {
            let cleanText = textContent
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (cleanText.length > 100 && /[a-zA-Z]/.test(cleanText)) {
              return cleanText;
            }
          }
        } catch (textError) {
          Logger.log(`PDF text extraction failed for ${nm}: ${textError.toString()}`);
        }
        
        return `[PDF Document: ${nm} - Text extraction not available. This is a PDF file that requires manual review. Access the file at: https://drive.google.com/file/d/${id}/view]\n\nNote: Please review this PDF manually and summarise key content for course development.`;
        
      } catch(e) {
        errors.push(`${nm}: PDF processing error - ${e.message}`);
        return `[PDF Document: ${nm} - Processing failed. File available at: https://drive.google.com/file/d/${id}/view]`;
      }
    }
    
    // generic text-ish
    try { return f.getBlob().getDataAsString(); } catch(e){ errors.push(`${nm}: ${e.message}`); return ''; }
    
  }catch(e){
    errors.push(`Drive read failed (${id}): ${e.message}`); return '';
  }
}
*/
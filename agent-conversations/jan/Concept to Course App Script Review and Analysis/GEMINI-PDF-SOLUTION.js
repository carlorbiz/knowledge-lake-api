/**
 * GEMINI API PDF SOLUTION
 * 
 * Use Gemini's native PDF processing capabilities instead of trying 
 * to convert PDFs in Google Apps Script.
 */

/**
 * ENHANCED collectAllSourceMaterials_ function that sends PDFs directly to Gemini
 */

function collectAllSourceMaterialsWithGeminiPDF_(row) {
  const sh = SpreadsheetApp.getActiveSheet();
  const sources = [];
  const errors = [];
  let textContent = '';
  const pdfFiles = [];  // Collect PDFs for Gemini processing
  
  // Helper function to process Drive files
  function processDriveFile_(id) {
    try {
      const f = DriveApp.getFileById(id);
      const nm = f.getName();
      const mime = String(f.getMimeType() || '').toLowerCase();
      
      if (mime.includes('document')) {
        sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
        return DocumentApp.openById(id).getBody().getText() || '';
      }
      
      if (mime.includes('pdf')) {
        sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
        
        // Add PDF to collection for Gemini processing
        pdfFiles.push({
          name: nm,
          id: id,
          blob: f.getBlob(),
          url: `https://drive.google.com/file/d/${id}/view`
        });
        
        return `[PDF Document: ${nm} - Content will be processed by AI]\n`;
      }
      
      // Generic text files
      try { 
        return f.getBlob().getDataAsString(); 
      } catch(e) { 
        errors.push(`${nm}: ${e.message}`); 
        return ''; 
      }
      
    } catch(e) {
      errors.push(`Drive read failed (${id}): ${e.message}`); 
      return '';
    }
  }
  
  // Collect text from regular sources (same as before)
  const resourceFolder = sh.getRange(row, 2).getValue();
  if (resourceFolder) {
    // Process folder contents
    try {
      const folderId = resourceFolder.includes('/folders/') 
        ? resourceFolder.split('/folders/')[1].split('/')[0]
        : resourceFolder;
      
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.getFiles();
      
      while (files.hasNext()) {
        const file = files.next();
        textContent += processDriveFile_(file.getId()) + '\n\n';
      }
    } catch (e) {
      errors.push(`Folder access error: ${e.message}`);
    }
  }
  
  // Process additional resource rows (B3, B4, etc.)
  let additionalRow = row + 1;
  while (additionalRow <= sh.getLastRow()) {
    const additionalResource = sh.getRange(additionalRow, 2).getValue();
    if (!additionalResource) break;
    
    if (typeof additionalResource === 'string' && additionalResource.includes('drive.google.com')) {
      const id = extractDriveId_(additionalResource);
      if (id) {
        textContent += processDriveFile_(id) + '\n\n';
      }
    }
    additionalRow++;
  }
  
  return {
    text: textContent,
    sources: sources,
    errors: errors,
    pdfFiles: pdfFiles  // Return PDFs for Gemini processing
  };
}

/**
 * ENHANCED Gemini call function that can handle PDFs
 */

function callGeminiWithPDFs(prompt, maxTokens, pdfFiles = []) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${CFG.GEMINI_API_KEY}`;
    
    const parts = [];
    
    // Add text prompt
    parts.push({
      text: prompt
    });
    
    // Add PDF files if any
    pdfFiles.forEach(pdf => {
      parts.push({
        inline_data: {
          mime_type: "application/pdf",
          data: Utilities.base64Encode(pdf.blob.getBytes())
        }
      });
      
      // Add context about the PDF
      parts.push({
        text: `\n\n--- Content from PDF: ${pdf.name} ---\n(Please analyze this PDF and extract relevant information for the course development)\n`
      });
    });
    
    const payload = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        maxOutputTokens: maxTokens || 4096,
        temperature: 0.7
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected Gemini response format: ' + JSON.stringify(data));
    }
    
  } catch (error) {
    Logger.log('Gemini API error: ' + error.toString());
    throw new Error('Gemini API call failed: ' + error.message);
  }
}

/**
 * UPDATED generateCourseRecommendation function
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
  const srcPack = collectAllSourceMaterialsWithGeminiPDF_(r);
  if (srcPack.errors.length) SpreadsheetApp.getUi().alert('Some resources could not be fetched:\n' + srcPack.errors.join('\n'));

  // Build the prompt
  const mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT +
    `\n\nCONCEPT: ${concept}\nSELECTED TARGET AUDIENCE: ${audience}\n` +
    VANCOUVER_CITATION_INSTRUCTIONS;

  // Add text content if any
  if (srcPack.text.trim()) {
    mappingPrompt += `\n\nTEXT SOURCE MATERIALS:\n${String(srcPack.text).slice(0,8000)}`;
  }

  // Add PDF context
  if (srcPack.pdfFiles.length > 0) {
    mappingPrompt += `\n\nPDF DOCUMENTS PROVIDED: ${srcPack.pdfFiles.length} PDF file(s) attached for analysis. Please extract relevant information from these documents to inform the course development.`;
  }

  // Call Gemini with PDFs
  const rec = callGeminiWithPDFs(mappingPrompt, 7000, srcPack.pdfFiles);

  // Create/attach doc (rest of function stays the same)
  const doc = DocumentApp.create(`${concept}_Recommendations_${new Date().toISOString().slice(0,16).replace('T','_')}`);
  let file = DriveApp.getFileById(doc.getId());
  DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]).addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  doc.getBody().appendParagraph(rec);
  doc.saveAndClose();

  sh.getRange(r,4).setValue(doc.getUrl());
  SpreadsheetApp.getUi().alert(`Course recommendation generated!\n\nDocument: ${doc.getName()}\nURL: ${doc.getUrl()}`);
}
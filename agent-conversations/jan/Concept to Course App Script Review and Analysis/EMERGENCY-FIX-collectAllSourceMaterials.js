/**
 * EMERGENCY FIX for collectAllSourceMaterials_ - COMPLETE REPLACEMENT
 * 
 * Your current function is incomplete and missing the return statement,
 * causing the TypeError. This is a complete, working replacement.
 */

function collectAllSourceMaterials_(arg){
  // Initialize the result object that will always be returned
  const result = {
    text: '',
    errors: [],
    sources: [],
    pdfFiles: []
  };

  try {
    // ----- Legacy folder mode -----
    if (arg && typeof arg.getFiles === 'function') {
      const folderResult = readFromFolder_(arg);
      result.text = folderResult.text || '';
      result.errors = folderResult.errors || [];
      
      const urls = extractUrls_(result.text || '');
      const uniq = Array.from(new Set(urls)).slice(0, (typeof URL_CRAWL_LIMIT !== 'undefined' ? URL_CRAWL_LIMIT : 12));
      let appended = '', appendedLen = 0, crawlErr = [];
      
      uniq.forEach(u => {
        const r = fetchUrlText_(u);
        const t = (typeof r === 'string') ? r : (r && r.text) || '';
        if (t) {
          const chunk = `\n\n===== SOURCE: ${u} (Inline URL) =====\n${t}`;
          const cap = (typeof URL_MAX_APPEND_CHARS !== 'undefined' ? URL_MAX_APPEND_CHARS : 20000);
          if (appendedLen + chunk.length <= cap) { 
            appended += chunk; 
            appendedLen += chunk.length; 
          }
        }
        if (r && r.error) crawlErr.push(r.error);
      });
      
      result.text = (result.text || '') + appended;
      result.errors = [].concat(result.errors || [], crawlErr);
      return result;
    }

    // ----- Mapping B-block mode -----
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName('Mapping');
    if (!sh) {
      result.errors.push('Mapping sheet not found.');
      return result;
    }

    const row = (typeof arg === 'number' && arg >= 2) ? arg : sh.getActiveRange().getRow();
    if (row < 2) {
      result.errors.push('Select a course row (row ≥ 2).');
      return result;
    }

    const concept = String(sh.getRange(row, 1).getValue() || '').trim();
    if (!concept) {
      result.errors.push('Course Concept (Column A) is empty on the selected row.');
      return result;
    }

    // Find end of this course block (next non-empty A)
    const lastRow = sh.getLastRow();
    let end = lastRow + 1;
    for (let r = row + 1; r <= lastRow; r++){
      if (String(sh.getRange(r, 1).getValue() || '').trim()) { 
        end = r; 
        break; 
      }
    }

    const parts = [];

    // Helper function to add content
    function push(label, t){
      if (t && String(t).trim()) {
        parts.push(`\n\n===== SOURCE: ${label} =====\n${String(t).trim()}`);
      }
    }

    // Enhanced readDriveFileText_ function (scoped within collectAllSourceMaterials_)
    function readDriveFileText_(id){
      try{
        const f = DriveApp.getFileById(id);
        const nm = f.getName();
        const mime = String(f.getMimeType()||'').toLowerCase();
        
        if (mime.includes('document')){
          result.sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
          return DocumentApp.openById(id).getBody().getText() || '';
        }
        
        if (mime.includes('pdf')){
          result.sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
          
          // Add PDF to collection for Gemini processing (no conversion!)
          result.pdfFiles.push({
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
          result.errors.push(`${nm}: ${e.message}`); 
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
          
          result.errors.push(userFriendlyError);
          return `[Inaccessible File - See instructions above to fix sharing permissions]`;
        }
        
        // Other Drive errors
        result.errors.push(`Drive read failed (${id}): ${e.message}`); 
        return '';
      }
    }

    // Enhanced processOne_ function (scoped within collectAllSourceMaterials_)
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
          result.sources.push({type:'gfolder', title:label, id:match[1], url:val});
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
            
          } catch(e) { 
            // USER-FRIENDLY FOLDER ERROR HANDLING
            if (e.message.includes('inaccessible') || 
                e.message.includes('not found') || 
                e.message.includes('Permission denied') ||
                e.message.includes('Requested entity was not found')) {
              
              const userFriendlyError = `FOLDER ACCESS ISSUE (${label}): Check sharing permissions for folder '${label}' are set to 'Anyone with the link'. ` +
                `Problem folder: ${val}`;
              
              result.errors.push(userFriendlyError);
            } else {
              result.errors.push(`${label} folder: ${e.message}`);
            }
          }
        }
        
      } else if (val.includes('docs.google.com/document/')){
        const match = val.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
        if (match) push(label, readDriveFileText_(match[1]));
        
      } else if (val.match(/^https?:\/\//)){
        result.sources.push({type:'web', title:label, url:val});
        const webText = fetchUrlText_(val);
        if (typeof webText === 'string') {
          push(label, webText);
        } else if (webText && webText.text) {
          push(label, webText.text);
        }
        if (webText && webText.error) {
          result.errors.push(`${label}: ${webText.error}`);
        }
        
      } else {
        // Direct text content
        push(label, val);
      }
    }

    // Process B2 (main resource)
    processOne_('B2', sh.getRange(row, 2).getValue());

    // Process additional B column resources in the course block
    for (let r = row + 1; r < end; r++){
      const val = sh.getRange(r, 2).getValue();
      if (val) processOne_(`B${r}`, val);
    }

    // Combine all text content
    result.text = parts.join('');

    // Extract and crawl inline URLs
    if (result.text) {
      try {
        const urls = extractUrls_(result.text);
        const uniq = Array.from(new Set(urls)).slice(0, (typeof URL_CRAWL_LIMIT !== 'undefined' ? URL_CRAWL_LIMIT : 12));
        let appended = '';
        let appendedLen = 0;

        uniq.forEach(u => {
          const r = fetchUrlText_(u);
          const t = (typeof r === 'string') ? r : (r && r.text) || '';
          if (t) {
            const chunk = `\n\n===== SOURCE: ${u} (Inline URL) =====\n${t}`;
            const cap = (typeof URL_MAX_APPEND_CHARS !== 'undefined' ? URL_MAX_APPEND_CHARS : 20000);
            if (appendedLen + chunk.length <= cap) { 
              appended += chunk; 
              appendedLen += chunk.length; 
            }
          }
          if (r && r.error) result.errors.push(`Inline URL ${u}: ${r.error}`);
        });

        result.text += appended;
      } catch (e) {
        result.errors.push(`URL extraction error: ${e.message}`);
      }
    }

    // CRUCIAL: Always return the result object
    return result;

  } catch (e) {
    // Emergency fallback - ensure we never return undefined
    Logger.log('Critical error in collectAllSourceMaterials_: ' + e.toString());
    result.errors.push(`CRITICAL ERROR: ${e.message}`);
    return result;
  }
}

/**
 * ALSO ADD: Enhanced Gemini PDF function
 */
function callGeminiWithPDFs(prompt, maxTokens, pdfFiles = []) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${CFG.GEMINI_API_KEY}`;
    
    const parts = [];
    
    // Add text prompt
    parts.push({ text: prompt });
    
    // Add PDF files (limit to 5 to avoid payload size issues)
    const maxPdfs = 5;
    pdfFiles.slice(0, maxPdfs).forEach(pdf => {
      parts.push({
        inline_data: {
          mime_type: "application/pdf",
          data: Utilities.base64Encode(pdf.blob.getBytes())
        }
      });
      
      // Add context about the PDF
      parts.push({
        text: `\n\n--- Content from PDF: ${pdf.name} ---\n(Please analyze this PDF document and extract relevant information for the course development)\n`
      });
    });

    if (pdfFiles.length > maxPdfs) {
      parts.push({
        text: `\n\nNote: ${pdfFiles.length - maxPdfs} additional PDF documents were referenced but not processed due to size limits. These include: ${pdfFiles.slice(maxPdfs).map(p => p.name).join(', ')}`
      });
    }
    
    const payload = {
      contents: [{ parts: parts }],
      generationConfig: {
        maxOutputTokens: maxTokens || 4096,
        temperature: 0.7
      }
    };
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
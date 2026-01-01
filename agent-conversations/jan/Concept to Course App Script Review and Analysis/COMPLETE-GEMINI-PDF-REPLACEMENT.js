/**
 * COMPLETE GEMINI PDF REPLACEMENT
 * 
 * This replaces collectAllSourceMaterials_ with full functionality:
 * - Legacy folder mode support
 * - B-block mode (B2 folder + B3:B URLs)
 * - Subfolder processing
 * - URL crawling
 * - PDF processing via Gemini API (no conversion errors)
 */

/**
 * ENHANCED REPLACEMENT for collectAllSourceMaterials_
 * 
 * This maintains ALL existing functionality while adding Gemini PDF support
 */
function collectAllSourceMaterials_(arg){
  // ----- Legacy folder mode -----
  if (arg && typeof arg.getFiles === 'function') {
    const { text, errors } = readFromFolder_(arg);
    const urls = extractUrls_(text || '');
    const uniq = Array.from(new Set(urls)).slice(0, (typeof URL_CRAWL_LIMIT !== 'undefined' ? URL_CRAWL_LIMIT : 12));
    let appended = '', appendedLen = 0, crawlErr = [];
    uniq.forEach(u => {
      const r = fetchUrlText_(u);
      const t = (typeof r === 'string') ? r : (r && r.text) || '';
      if (t) {
        const chunk = `\n\n===== SOURCE: ${u} (Inline URL) =====\n${t}`;
        const cap = (typeof URL_MAX_APPEND_CHARS !== 'undefined' ? URL_MAX_APPEND_CHARS : 20000);
        if (appendedLen + chunk.length <= cap) { appended += chunk; appendedLen += chunk.length; }
      }
      if (r && r.error) crawlErr.push(r.error);
    });
    return { text: (text || '') + appended, errors: [].concat(errors || [], crawlErr), sources: [], pdfFiles: [] };
  }

  // ----- Mapping B-block mode -----
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Mapping');
  if (!sh) throw new Error('Mapping sheet not found.');

  const row = (typeof arg === 'number' && arg >= 2) ? arg : sh.getActiveRange().getRow();
  if (row < 2) throw new Error('Select a course row (row ≥ 2).');

  const concept = String(sh.getRange(row, 1).getValue() || '').trim();
  if (!concept) throw new Error('Course Concept (Column A) is empty on the selected row.');

  // find end of this course block (next non-empty A)
  const lastRow = sh.getLastRow();
  let end = lastRow + 1;
  for (let r = row + 1; r <= lastRow; r++){
    if (String(sh.getRange(r, 1).getValue() || '').trim()) { end = r; break; }
  }

  const errors = [];
  const parts = [];
  const pdfFiles = [];  // NEW: Collect PDFs for Gemini processing
  /** @type {{type:'web'|'gdoc'|'gfolder'|'pdf'|'text', title?:string, url?:string, id?:string}[]} */
  const sources = [];

  function push(label, t){
    if (t && String(t).trim()) parts.push(`\n\n===== SOURCE: ${label} =====\n${String(t).trim()}`);
  }

  // ENHANCED readDriveFileText_ that collects PDFs instead of converting them
  function readDriveFileText_(id){
    try{
      const f   = DriveApp.getFileById(id);
      const nm  = f.getName();
      const mime= String(f.getMimeType()||'').toLowerCase();
      
      if (mime.includes('document')){
        sources.push({type:'gdoc', title:nm, id, url:`https://docs.google.com/document/d/${id}/edit`});
        return DocumentApp.openById(id).getBody().getText() || '';
      }
      
      if (mime.includes('pdf')){
        sources.push({type:'pdf', title:nm, id, url:`https://drive.google.com/file/d/${id}/view`});
        
        // NEW: Add PDF to collection for Gemini processing (no conversion!)
        pdfFiles.push({
          name: nm,
          id: id,
          blob: f.getBlob(),
          url: `https://drive.google.com/file/d/${id}/view`
        });
        
        return `[PDF Document: ${nm} - Content will be processed by Gemini AI]\n`;
      }
      
      // generic text-ish
      try { return f.getBlob().getDataAsString(); } catch(e){ errors.push(`${nm}: ${e.message}`); return ''; }
    }catch(e){
      errors.push(`Drive read failed (${id}): ${e.message}`); return '';
    }
  }

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
        } catch(e){ errors.push(`${label} folder: ${e.message}`); }
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

  // Process B2 (main resource)
  processOne_('B2', sh.getRange(row, 2).getValue());

  // Process B3:B (additional resources in the course block)
  for (let r = row + 1; r < end; r++){
    const val = sh.getRange(r, 2).getValue();
    if (val) processOne_(`B${r}`, val);
  }

  // URL extraction and crawling from collected text
  const combinedText = parts.join('');
  const urls = extractUrls_(combinedText);
  const uniq = Array.from(new Set(urls)).slice(0, (typeof URL_CRAWL_LIMIT !== 'undefined' ? URL_CRAWL_LIMIT : 12));
  let appended = '', appendedLen = 0;
  uniq.forEach(u => {
    const r = fetchUrlText_(u);
    const t = (typeof r === 'string') ? r : (r && r.text) || '';
    if (t) {
      const chunk = `\n\n===== SOURCE: ${u} (Inline URL) =====\n${t}`;
      const cap = (typeof URL_MAX_APPEND_CHARS !== 'undefined' ? URL_MAX_APPEND_CHARS : 20000);
      if (appendedLen + chunk.length <= cap) { appended += chunk; appendedLen += chunk.length; }
    }
    if (r && r.error) errors.push(`Inline URL ${u}: ${r.error}`);
  });

  return { 
    text: combinedText + appended, 
    errors, 
    sources,
    pdfFiles  // NEW: Return collected PDFs for Gemini processing
  };
}

/**
 * ENHANCED Gemini call function that handles PDFs
 */
function callGeminiWithPDFs(prompt, maxTokens, pdfFiles = []) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${CFG.GEMINI_API_KEY}`;
    
    const parts = [];
    
    // Add text prompt
    parts.push({
      text: prompt
    });
    
    // Add PDF files if any (limit to avoid payload size issues)
    const maxPdfs = 5; // Reasonable limit for API payload
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

  // Multi-source pack WITH PDF support (using enhanced function)
  const srcPack = collectAllSourceMaterials_(r);
  if (srcPack.errors.length) SpreadsheetApp.getUi().alert('Some resources could not be fetched:\n' + srcPack.errors.join('\n'));

  // Build the prompt
  let mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT +
    `\n\nCONCEPT: ${concept}\nSELECTED TARGET AUDIENCE: ${audience}\n` +
    VANCOUVER_CITATION_INSTRUCTIONS;

  // Add text content if any
  if (srcPack.text && srcPack.text.trim()) {
    mappingPrompt += `\n\nTEXT SOURCE MATERIALS:\n${String(srcPack.text).slice(0,8000)}`;
  }

  // Add PDF context
  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    mappingPrompt += `\n\nPDF DOCUMENTS PROVIDED: ${srcPack.pdfFiles.length} PDF file(s) attached for analysis. Please extract relevant information from these documents to inform the course development.`;
  }

  // Call Gemini with PDFs (if available, otherwise fall back to regular call)
  let rec;
  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    rec = callGeminiWithPDFs(mappingPrompt, 7000, srcPack.pdfFiles);
  } else {
    rec = callGemini(mappingPrompt, 7000); // Fallback to existing function
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
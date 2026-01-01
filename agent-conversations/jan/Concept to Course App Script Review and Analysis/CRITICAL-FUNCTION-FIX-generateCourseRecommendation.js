/**
 * CRITICAL FIX: Enhanced generateCourseRecommendation() Function
 * 
 * FIXES IDENTIFIED ISSUES:
 * 1. Quality degradation in modification workflow
 * 2. PDF content not being referenced despite successful detection
 * 3. Enhancement requests replacing rather than expanding original quality
 * 
 * DEPLOYMENT: Replace your entire generateCourseRecommendation() function with this enhanced version
 */

function generateCourseRecommendation(){
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  const r = sh.getActiveRange().getRow();
  if (r === 1) return SpreadsheetApp.getUi().alert('Select a data row.');

  const concept = sh.getRange(r,1).getValue();
  const audience = sh.getRange(r,3).getValue() || 'Clinical';
  const existingRecommendation = sh.getRange(r,4).getValue(); // Column D - existing rec
  const modificationRequests = sh.getRange(r,6).getValue(); // Column F - modification requests
  const courseFolderUrl = sh.getRange(r,20).getValue(); // Column T - project folder
  
  if (!concept) return SpreadsheetApp.getUi().alert('Fill Concept (A).');
  if (!courseFolderUrl) return SpreadsheetApp.getUi().alert('Missing Course Project Folder (Column T).');

  // Check if this is a modification request
  const isModificationRequest = existingRecommendation && 
                               String(existingRecommendation).trim() && 
                               modificationRequests && 
                               String(modificationRequests).trim();

  let ui = SpreadsheetApp.getUi();
  let userChoice = 'new'; // default

  if (isModificationRequest) {
    const response = ui.alert(
      'Existing Recommendation Found',
      `This course already has a recommendation document.\n\n` +
      `Modification requests found: "${String(modificationRequests).substring(0, 100)}${String(modificationRequests).length > 100 ? '...' : ''}"\n\n` +
      `What would you like to do?\n\n` +
      `• YES: Create ENHANCED recommendation incorporating modification requests\n` +
      `• NO: Create completely new recommendation (ignores modifications)\n` +
      `• CANCEL: Stop and review modifications first`,
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (response === ui.Button.CANCEL) return;
    userChoice = response === ui.Button.YES ? 'modify' : 'new';
    
  } else if (existingRecommendation && String(existingRecommendation).trim()) {
    const response = ui.alert(
      'Existing Recommendation Found', 
      `This course already has a recommendation document.\n\n` +
      `Do you want to create a new recommendation?\n\n` +
      `TIP: To modify the existing recommendation, enter your requests in Column F (Modification Requests) first.`,
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.NO) return;
    userChoice = 'new';
  }

  // Multi-source pack WITH PDF support (scans B2 folder correctly)
  const srcPack = collectAllSourceMaterials_(r);
  
  // Enhanced error display with better UX
  if (srcPack.errors.length) {
    const permissionErrors = srcPack.errors.filter(err => err.includes('FILE ACCESS ISSUE') || err.includes('FOLDER ACCESS ISSUE'));
    const otherErrors = srcPack.errors.filter(err => !err.includes('FILE ACCESS ISSUE') && !err.includes('FOLDER ACCESS ISSUE'));
    
    let errorMessage = '';
    
    if (permissionErrors.length > 0) {
      errorMessage += '🔒 SHARING PERMISSION ISSUES:\n\n' + permissionErrors.join('\n\n') + '\n\n';
    }
    
    if (otherErrors.length > 0) {
      errorMessage += '⚠️ OTHER ISSUES:\n\n' + otherErrors.join('\n');
    }
    
    const response = ui.alert(
      'Source File Issues Detected',
      errorMessage + '\n\nDo you want to continue generating the recommendation with the available files?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.NO) return;
  }

  // ENHANCED prompt building with quality preservation and strong PDF integration
  let mappingPrompt;
  let docSuffix = '';

  if (userChoice === 'modify') {
    // QUALITY-PRESERVING MODIFICATION MODE - Major enhancement
    docSuffix = '_ENHANCED';
    
    // Build comprehensive PDF context
    let pdfContext = '';
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
      const pdfNames = srcPack.pdfFiles.map(pdf => pdf.name).join(', ');
      pdfContext = `

CRITICAL: ${srcPack.pdfFiles.length} PDF DOCUMENTS PROVIDED FOR ANALYSIS:
Files: ${pdfNames}

MANDATORY PDF INTEGRATION REQUIREMENTS:
• You MUST extract and integrate specific information from each PDF document
• Explicitly reference PDF documents by name in your recommendation
• Use PDF content to strengthen evidence base and module development
• PDF content should be prominently featured, not secondary to text sources
• Each PDF should contribute meaningfully to the final recommendation
• Include specific quotes, data, or frameworks from the PDF materials where relevant

PDF CONTENT PRIORITY: The PDF documents are primary source materials - treat them as the foundation for course development, not supplementary materials.`;
    }
    
    mappingPrompt = brandHeaderWithCitations_() + `

CRITICAL MISSION: ENHANCE AND EXPAND THE EXISTING RECOMMENDATION

You are Australia's leading medical education expert tasked with ENHANCING an existing course recommendation. This is NOT a revision or rewrite - this is an ENHANCEMENT that must EXCEED the original in every measurable dimension.

CONCEPT: ${concept}
TARGET AUDIENCE: ${audience}

ENHANCEMENT IMPERATIVES:
1. The enhanced recommendation must be MORE sophisticated, comprehensive, and academically rigorous than the original
2. PRESERVE all quality elements of the original while adding substantial new value
3. EXPAND module count and depth - never reduce scope or complexity
4. ADD more evidence, references, and Australian healthcare frameworks
5. The result must demonstrate clear enhancement, not simplification

ORIGINAL RECOMMENDATION (TO BE ENHANCED, NOT REPLACED): 
${existingRecommendation}

ENHANCEMENT REQUESTS TO INCORPORATE:
${modificationRequests}

ENHANCEMENT STRATEGY:
• First, identify and preserve all sophistication markers from the original
• Then, ADD value through the enhancement requests without losing existing quality
• Expand evidence base with additional RACGP, ACRRM, and Medical Board of Australia sources
• Enhance module descriptions with more detailed learning objectives and practical applications
• Strengthen Australian healthcare context and compliance elements
• Ensure the RECOMMENDED MODULES section is more comprehensive than the original

QUALITY ASSURANCE CHECKLIST:
✓ More modules than original (never fewer)
✓ More sophisticated language and analysis
✓ Expanded evidence base with minimum 15 high-quality Australian references
✓ Enhanced pedagogical frameworks
✓ Strengthened compliance with Australian healthcare standards
✓ More detailed practical applications and case scenarios

TONE REQUIREMENTS:
• Professional academic tone suitable for senior medical educators
• NO casual language like "Okay," "Here's," "I have analysed," etc.
• Evidence-based assertions with integrated citations
• Sophisticated analysis demonstrating deep expertise in Australian healthcare education

STRUCTURE REQUIREMENTS:
• Comprehensive "RECOMMENDED MODULES:" section with detailed descriptions
• Each module must have clear learning objectives and practical applications
• Module descriptions should be substantial and pedagogically sound
• Maintain or exceed the structural sophistication of the original document

${pdfContext}` + (srcPack.text && srcPack.text.trim() ? `

ADDITIONAL TEXT SOURCE MATERIALS:
${String(srcPack.text).slice(0,6000)}` : '');

  } else {
    // NEW RECOMMENDATION MODE with enhanced PDF integration
    let pdfContext = '';
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
      const pdfNames = srcPack.pdfFiles.map(pdf => pdf.name).join(', ');
      pdfContext = `

CRITICAL: ${srcPack.pdfFiles.length} PDF DOCUMENTS PROVIDED FOR COMPREHENSIVE ANALYSIS:
Files: ${pdfNames}

PDF INTEGRATION REQUIREMENTS:
• Extract key concepts, frameworks, and evidence from each PDF document
• Reference PDF documents explicitly by name throughout your recommendation
• Use PDF content as primary foundation for course structure and modules
• Include specific data, quotes, or frameworks from the PDF materials
• Each PDF should contribute substantially to the final recommendation
• PDF content takes priority over general knowledge - use provided materials first`;
    }
    
    mappingPrompt = brandHeaderWithCitations_() + '\n' + COURSE_MAPPING_PROMPT +
      `\n\nCONCEPT: ${concept}\nSELECTED TARGET AUDIENCE: ${audience}` + 
      pdfContext +
      (srcPack.text && srcPack.text.trim() ? `\n\nADDITIONAL TEXT SOURCE MATERIALS:\n${String(srcPack.text).slice(0,8000)}` : '');
  }

  // Call Gemini with enhanced PDF integration
  let rec;
  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    Logger.log(`Calling Gemini with ${srcPack.pdfFiles.length} PDF files for concept: ${concept}`);
    rec = callGeminiWithPDFs(mappingPrompt, 8000, srcPack.pdfFiles);
  } else {
    Logger.log(`Calling Gemini without PDFs for concept: ${concept}`);
    rec = callGemini_(mappingPrompt, 8000);
  }

  // Create document with appropriate naming
  const timestamp = new Date().toISOString().slice(0,16).replace('T','_');
  const docName = `${concept}_Recommendations${docSuffix}_${timestamp}`;
  const doc = DocumentApp.create(docName);
  
  let file = DriveApp.getFileById(doc.getId());
  const targetFolder = DriveApp.getFolderById(courseFolderUrl.split('/folders/')[1]);
  targetFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  // Add enhancement context to the document if applicable
  if (userChoice === 'modify') {
    doc.getBody().appendParagraph(`ENHANCED RECOMMENDATION - ${new Date().toLocaleString()}`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    doc.getBody().appendParagraph(`Enhancement requests addressed: ${modificationRequests}`);
    
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
      const pdfNames = srcPack.pdfFiles.map(pdf => pdf.name).join(', ');
      doc.getBody().appendParagraph(`PDF documents integrated: ${pdfNames}`);
    }
    
    const body = doc.getBody();
    body.appendParagraph('');
    const subheadingPara = body.appendParagraph('ENHANCED RECOMMENDATION:');
    subheadingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  } else if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    // For new recommendations with PDFs, note the source materials
    const pdfNames = srcPack.pdfFiles.map(pdf => pdf.name).join(', ');
    doc.getBody().appendParagraph(`Source PDF Documents: ${pdfNames}`).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    doc.getBody().appendParagraph('');
  }

  doc.getBody().appendParagraph(rec);
  doc.saveAndClose();

  // Update the mapping sheet
  sh.getRange(r,4).setValue(doc.getUrl());

  // Extract and populate module names (Columns G-S) - enhanced extraction
  try {
    Logger.log('Starting enhanced module extraction...');
    
    const moduleNames = extractModuleNames_(rec);
    
    if (moduleNames && moduleNames.length > 0) {
      // Column G: Module List (all module names)
      sh.getRange(r, 7).setValue(moduleNames.join('\n'));
      
      // Columns H-S: Individual module names (up to 12 modules)
      for (let i = 0; i < 12; i++) {
        const moduleName = moduleNames[i] || '';
        sh.getRange(r, 8 + i).setValue(moduleName);
      }
      
      Logger.log(`Successfully extracted ${moduleNames.length} modules for concept: ${concept}`);
      
    } else {
      Logger.log('No modules found in recommendation text - check RECOMMENDED MODULES section format');
      
      // Try alternative extraction if standard format fails
      const alternativeModules = rec.match(/Module \d+[:\-\s]+([^\n]+)/gi);
      if (alternativeModules) {
        const cleanModules = alternativeModules.map(m => m.replace(/Module \d+[:\-\s]+/i, '').trim());
        sh.getRange(r, 7).setValue(cleanModules.join('\n'));
        Logger.log(`Alternative extraction found ${cleanModules.length} modules`);
      }
    }
    
  } catch (moduleError) {
    Logger.log('Error extracting modules: ' + moduleError.toString());
  }

  // Success notification with PDF confirmation
  let successMessage = `Course recommendation generated successfully!\n\nDocument: ${docName}`;
  if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
    const pdfNames = srcPack.pdfFiles.map(pdf => pdf.name).join(', ');
    successMessage += `\n\nPDF documents integrated: ${pdfNames}`;
  }
  
  ui.alert('Success', successMessage, ui.ButtonSet.OK);
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. BACKUP your current generateCourseRecommendation() function
 * 2. REPLACE the entire function with this enhanced version
 * 3. TEST with a course that has:
 *    - Existing recommendation in Column D
 *    - Modification requests in Column F  
 *    - PDF files in the B2 folder
 * 4. VERIFY that the enhanced recommendation:
 *    - References PDF documents by name
 *    - Preserves/enhances original quality
 *    - Expands rather than replaces content
 * 
 * KEY IMPROVEMENTS:
 * - Quality preservation in modification workflow
 * - Strong PDF integration with explicit referencing
 * - Enhanced prompting for comprehensive analysis
 * - Better user notifications and success confirmation
 * - Improved module extraction with fallback methods
 */
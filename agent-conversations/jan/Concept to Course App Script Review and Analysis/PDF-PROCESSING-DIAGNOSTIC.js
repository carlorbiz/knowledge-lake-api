/**
 * PDF PROCESSING DIAGNOSTIC
 * 
 * ISSUE IDENTIFIED BY CARLA:
 * "Please check the create recommendation prompt hasn't been diluted - note the single source 
 * referenced and the failure to mention any of the pdfs uploaded (all accessible) to the top 
 * level of the created course folder"
 * 
 * DIAGNOSIS: The collectAllSourceMaterials_ function should be scanning B2 folder for PDFs
 * and calling callGeminiWithPDFs, but something is failing.
 * 
 * This diagnostic will help identify the exact issue.
 */

/**
 * DIAGNOSTIC FUNCTION: Add this temporarily to test PDF processing
 * Run this on your Mapping sheet to see what's happening
 */
function diagnosticPDFProcessing() {
  try {
    const ui = SpreadsheetApp.getUi();
    const sh = SpreadsheetApp.getActiveSheet();
    
    if (sh.getName() !== 'Mapping') {
      return ui.alert('Run this on the Mapping tab, with a course row selected.');
    }
    
    const row = sh.getActiveRange().getRow();
    if (row < 2) {
      return ui.alert('Select a course row (row 2 or higher).');
    }
    
    const concept = sh.getRange(row, 1).getValue();
    const b2Value = sh.getRange(row, 2).getValue();
    
    ui.alert(
      'PDF Processing Diagnostic Started',
      `Testing PDF processing for:\n\nConcept: ${concept}\nB2 Value: ${b2Value}\n\nCheck the logs (Extensions > Apps Script > Executions) for detailed results.`,
      ui.ButtonSet.OK
    );
    
    // Test collectAllSourceMaterials_
    Logger.log('=== PDF PROCESSING DIAGNOSTIC ===');
    Logger.log(`Concept: ${concept}`);
    Logger.log(`B2 Value: ${b2Value}`);
    
    const srcPack = collectAllSourceMaterials_(row);
    
    Logger.log('=== SOURCE PACK RESULTS ===');
    Logger.log(`Text length: ${srcPack.text ? srcPack.text.length : 0} characters`);
    Logger.log(`Errors: ${srcPack.errors.length}`);
    Logger.log(`Sources: ${srcPack.sources.length}`);
    Logger.log(`PDF Files: ${srcPack.pdfFiles ? srcPack.pdfFiles.length : 0}`);
    
    if (srcPack.errors.length > 0) {
      Logger.log('=== ERRORS FOUND ===');
      srcPack.errors.forEach((error, index) => {
        Logger.log(`Error ${index + 1}: ${error}`);
      });
    }
    
    if (srcPack.sources.length > 0) {
      Logger.log('=== SOURCES FOUND ===');
      srcPack.sources.forEach((source, index) => {
        Logger.log(`Source ${index + 1}: Type=${source.type}, Title=${source.title}, URL=${source.url}`);
      });
    }
    
    if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0) {
      Logger.log('=== PDF FILES FOUND ===');
      srcPack.pdfFiles.forEach((pdf, index) => {
        Logger.log(`PDF ${index + 1}: Name=${pdf.name}, ID=${pdf.id}, URL=${pdf.url}`);
      });
      
      // Test if callGeminiWithPDFs function exists
      if (typeof callGeminiWithPDFs === 'function') {
        Logger.log('✅ callGeminiWithPDFs function exists');
        
        // Test a simple call
        try {
          const testPrompt = `Test prompt for PDF processing: Please summarise the content of the provided PDF documents for the course "${concept}".`;
          Logger.log('Testing callGeminiWithPDFs...');
          const result = callGeminiWithPDFs(testPrompt, 1000, srcPack.pdfFiles);
          Logger.log(`✅ callGeminiWithPDFs SUCCESS: ${result ? result.length : 0} characters returned`);
          if (result) {
            Logger.log(`First 500 chars: ${result.substring(0, 500)}...`);
          }
        } catch (pdfError) {
          Logger.log(`❌ callGeminiWithPDFs ERROR: ${pdfError.toString()}`);
        }
      } else {
        Logger.log('❌ callGeminiWithPDFs function NOT FOUND');
      }
    } else {
      Logger.log('❌ No PDF files found');
      
      // Check if B2 is a folder URL
      if (b2Value && String(b2Value).includes('drive.google.com/folders/')) {
        Logger.log('B2 contains folder URL - checking folder access...');
        
        try {
          const folderMatch = String(b2Value).match(/\/folders\/([a-zA-Z0-9_-]+)/);
          if (folderMatch) {
            const folderId = folderMatch[1];
            const folder = DriveApp.getFolderById(folderId);
            const files = folder.getFiles();
            
            let fileCount = 0;
            let pdfCount = 0;
            
            while (files.hasNext()) {
              const file = files.next();
              fileCount++;
              const mimeType = file.getBlob().getContentType();
              Logger.log(`File found: ${file.getName()} (${mimeType})`);
              
              if (mimeType === 'application/pdf') {
                pdfCount++;
                Logger.log(`✅ PDF found: ${file.getName()}`);
              }
            }
            
            Logger.log(`Folder scan complete: ${fileCount} total files, ${pdfCount} PDFs`);
            
            if (pdfCount === 0) {
              Logger.log('❌ No PDFs found in folder - this explains the issue!');
            }
            
          } else {
            Logger.log('❌ Could not extract folder ID from B2 URL');
          }
        } catch (folderError) {
          Logger.log(`❌ Folder access error: ${folderError.toString()}`);
        }
      } else {
        Logger.log('❌ B2 is not a folder URL');
      }
    }
    
    Logger.log('=== DIAGNOSTIC COMPLETE ===');
    
    // Show summary to user
    const summary = `PDF Processing Diagnostic Complete!\n\n` +
      `✅ Text sources: ${srcPack.text ? Math.round(srcPack.text.length/1000) : 0}k characters\n` +
      `✅ Sources found: ${srcPack.sources.length}\n` +
      `✅ PDFs found: ${srcPack.pdfFiles ? srcPack.pdfFiles.length : 0}\n` +
      `⚠️ Errors: ${srcPack.errors.length}\n\n` +
      `Check the Apps Script logs (Extensions > Apps Script > Executions) for detailed analysis.`;
    
    ui.alert('Diagnostic Results', summary, ui.ButtonSet.OK);
    
  } catch (error) {
    Logger.log(`Diagnostic error: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Diagnostic Error', `Error running diagnostic: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * QUICK FIX: Enhanced logging in collectAllSourceMaterials_ 
 * 
 * ADD these logging lines to your existing collectAllSourceMaterials_ function
 * in the processOne_ folder scanning section (around line 2057-2081)
 */

// ADD THIS LOGGING in the folder processing section:
/*
Logger.log(`Processing folder: ${label} = ${val}`);
const folder = DriveApp.getFolderById(match[1]);

// Process files in main folder
const files = folder.getFiles();
let fileCount = 0;
while (files.hasNext()){
  const file = files.next();
  fileCount++;
  const fileName = file.getName();
  const mimeType = file.getBlob().getContentType();
  Logger.log(`File ${fileCount}: ${fileName} (${mimeType})`);
  
  const content = readDriveFileText_(file.getId());
  if (content) {
    Logger.log(`✅ Content extracted from ${fileName}: ${content.length} characters`);
  } else {
    Logger.log(`❌ No content extracted from ${fileName}`);
  }
  
  push(`${label}/${fileName}`, content);
}

Logger.log(`Folder ${label} processed: ${fileCount} files total`);
*/

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. ADD the diagnosticPDFProcessing() function to your script
 * 
 * 2. RUN the diagnostic on your course row with uploaded PDFs
 * 
 * 3. CHECK the Apps Script execution logs to see detailed analysis
 * 
 * 4. REPORT back what the diagnostic shows - this will pinpoint the exact issue
 * 
 * The diagnostic will tell us:
 * - Whether the B2 folder is being accessed
 * - Whether PDFs are being found in the folder
 * - Whether the callGeminiWithPDFs function exists
 * - What errors (if any) are occurring
 * - Whether the folder permissions are correct
 * 
 * This will help us identify why your PDFs aren't being processed in the recommendations.
 */
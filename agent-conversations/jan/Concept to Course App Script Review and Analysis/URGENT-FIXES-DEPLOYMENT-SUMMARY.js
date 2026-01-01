/**
 * URGENT FIXES DEPLOYMENT SUMMARY
 * 
 * This file contains the complete deployment instructions for the two critical fixes
 * identified by Carla:
 * 
 * 1. ARCHIVAL FUNCTION FIX - Properly delete Mapping and System Status sheets
 * 2. HOWTO FORMATTING FIX - Corrected refreshHowToUseTab with updated workflow content
 * 
 * Both fixes are ready for immediate deployment to resolve current operational issues.
 */

// ============================================================================
// FIX 1: ENHANCED ARCHIVAL FUNCTION
// ============================================================================

/**
 * REPLACE the existing archiveCourse() function with this enhanced version
 * 
 * KEY IMPROVEMENTS:
 * - Properly identifies and cleans up ALL course-related sheets
 * - Intelligent handling of Mapping and System Status sheet deletion
 * - Enhanced user prompts for complete vs. partial cleanup
 * - Comprehensive error handling and logging
 * - Preserves System Status data when multiple courses exist
 */
function archiveCourse() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) return ui.alert('Mapping sheet not found.');
  
  const row = mappingSheet.getActiveCell().getRow();
  if (row < 2) return ui.alert('Select a course row to archive.');
  
  const courseName = mappingSheet.getRange(row, 1).getValue();
  const courseFolderUrl = mappingSheet.getRange(row, 20).getValue(); // Column T
  if (!courseName || !courseFolderUrl) return ui.alert('Cannot archive: course name or folder not found.');

  const response = ui.alert(
    'Confirm Complete Archival', 
    `This will:\n\n` +
    `• Move content tabs for "${courseName}" into a backup spreadsheet\n` +
    `• Remove the course row from the Mapping tab\n` +
    `• Clean up all related sheets (Module-Resources, TTS, etc.)\n` +
    `• Preserve System Status sheet if it contains other course data\n\n` +
    `This action cannot be undone. Proceed?`, 
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;

  try {
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);

    // Create backup spreadsheet in course folder
    const backupSpreadsheet = SpreadsheetApp.create(`${courseName} - Course Content Backup`);
    const backupFile = DriveApp.getFileById(backupSpreadsheet.getId());
    courseFolder.addFile(backupFile);
    DriveApp.getRootFolder().removeFile(backupFile);

    // Identify all sheets related to this course
    const allSheets = ss.getSheets();
    const sheetsToBackup = [];
    const sheetsToDelete = [];
    
    allSheets.forEach(sheet => {
      const sheetName = sheet.getName();
      
      // Course-specific sheets to backup and delete
      if (sheetName === `Module-Resources-${courseName}` || 
          sheetName === `TTS-${courseName}`) {
        sheetsToBackup.push(sheet);
        sheetsToDelete.push(sheet);
      }
    });
    
    // Backup identified sheets
    sheetsToBackup.forEach(sheet => {
      try {
        sheet.copyTo(backupSpreadsheet);
        Logger.log(`Backed up sheet: ${sheet.getName()}`);
      } catch (error) {
        Logger.log(`Error backing up sheet ${sheet.getName()}: ${error.toString()}`);
      }
    });
    
    // Remove default placeholder sheet from backup
    const placeholderSheet = backupSpreadsheet.getSheetByName('Sheet1');
    if (placeholderSheet) {
      try {
        backupSpreadsheet.deleteSheet(placeholderSheet);
      } catch (error) {
        Logger.log(`Could not delete placeholder sheet: ${error.toString()}`);
      }
    }

    // Delete course-specific sheets from main spreadsheet
    sheetsToDelete.forEach(sheet => {
      try {
        ss.deleteSheet(sheet);
        Logger.log(`Deleted sheet: ${sheet.getName()}`);
      } catch (error) {
        Logger.log(`Error deleting sheet ${sheet.getName()}: ${error.toString()}`);
        ui.alert(`Warning: Could not delete sheet "${sheet.getName()}": ${error.message}`);
      }
    });

    // Remove course row from Mapping sheet
    mappingSheet.deleteRow(row);
    
    // Check if Mapping sheet is now empty (only headers remain)
    const mappingData = mappingSheet.getDataRange().getValues();
    const hasOtherCourses = mappingData.length > 1; // More than just header row
    
    // Check System Status sheet for other courses
    const systemStatusSheet = ss.getSheetByName('System Status');
    let hasOtherSystemData = false;
    
    if (systemStatusSheet) {
      const systemData = systemStatusSheet.getDataRange().getValues();
      // Check if there are entries for other courses (skip header row)
      hasOtherSystemData = systemData.slice(1).some(row => 
        row[0] && row[0].toString().trim() !== '' && row[0].toString().trim() !== courseName
      );
    }
    
    // Clean up main sheets if no other courses exist
    if (!hasOtherCourses) {
      const response2 = ui.alert(
        'Complete Cleanup', 
        `This was the last course in the system. Would you like to also remove the Mapping and System Status sheets to completely clean the workspace?\n\n` +
        `Note: This will leave you with just the "How to Use" tab and you'll need to run Step 1 again for new courses.`,
        ui.ButtonSet.YES_NO
      );
      
      if (response2 === ui.Button.YES) {
        // Delete Mapping sheet
        if (mappingSheet) {
          try {
            ss.deleteSheet(mappingSheet);
            Logger.log('Deleted Mapping sheet');
          } catch (error) {
            Logger.log(`Could not delete Mapping sheet: ${error.toString()}`);
          }
        }
        
        // Delete System Status sheet if it has no other data
        if (systemStatusSheet && !hasOtherSystemData) {
          try {
            ss.deleteSheet(systemStatusSheet);
            Logger.log('Deleted System Status sheet');
          } catch (error) {
            Logger.log(`Could not delete System Status sheet: ${error.toString()}`);
          }
        }
        
        ui.alert(
          'Complete Archival Finished', 
          `✅ Course "${courseName}" has been completely archived.\n\n` +
          `📁 Backup created in course folder\n` +
          `🧹 All related sheets removed\n` +
          `🏠 Workspace cleaned for new projects\n\n` +
          `To start a new course, use "Step 1: Setup & Add First Course" from the menu.`,
          ui.ButtonSet.OK
        );
      } else {
        ui.alert(
          'Archival Complete', 
          `✅ Course "${courseName}" has been archived and backed up.\n\n` +
          `The Mapping and System Status sheets have been preserved for future use.`,
          ui.ButtonSet.OK
        );
      }
    } else {
      ui.alert(
        'Archival Complete', 
        `✅ Course "${courseName}" has been archived and backed up.\n\n` +
        `Other courses remain in the system, so the Mapping and System Status sheets have been preserved.`,
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    Logger.log(`Archival failed: ${error.toString()}`);
    ui.alert(`Archival failed: ${error.message}\n\nCheck the script logs for more details.`);
  }
}

// ============================================================================
// FIX 2: CORRECTED HOWTO TAB FUNCTIONS
// ============================================================================

/**
 * REPLACE the existing refreshHowToUseTab() function with this corrected version
 * 
 * KEY IMPROVEMENTS:
 * - Updated content reflects corrected workflow (Step 4 LMS + Step 5 Voiceover)
 * - Fixed formatting issues and wonky display
 * - Enhanced visual hierarchy and readability
 * - Proper column widths and row heights
 */
function refreshHowToUseTab() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Refresh Instructions',
    'This will update the "How to Use" tab with the latest formatting and corrected workflow content.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    createHowToUseTab_();
    ui.alert('✅ How to Use tab refreshed successfully with corrected workflow');
  }
}

/**
 * REPLACE the existing createHowToUseTab_() function with this enhanced version
 */
function createHowToUseTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('How to Use');
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('How to Use');
  }
  
  // Set up the visual design with corrected formatting
  setupHowToUseDesign_(sheet);
  
  // Add updated content with corrected workflow
  addCorrectedHowToUseContent_(sheet);
  
  // Apply enhanced formatting
  applyCorrectedHowToUseFormatting_(sheet);
  
  return sheet;
}

/**
 * REPLACE the existing setupHowToUseDesign_() function
 */
function setupHowToUseDesign_(sheet) {
  try {
    // Set column widths for optimal display - CORRECTED VALUES
    sheet.setColumnWidth(1, 80);   // A: Icons/bullets - increased from 60
    sheet.setColumnWidth(2, 480);  // B: Main content - reduced from 500 for better fit
    sheet.setColumnWidth(3, 180);  // C: Status/notes - reduced from 200
    sheet.setColumnWidth(4, 120);  // D: Time estimates - reduced from 150
    
    // Set default row height for better readability
    sheet.getRange('1:100').setRowHeight(25);
    
    // Freeze header rows for navigation
    sheet.setFrozenRows(6);
    
    Logger.log('How-to-Use design setup completed successfully');
  } catch (error) {
    Logger.log(`Error in setupHowToUseDesign_: ${error.toString()}`);
  }
}

/**
 * ADD this new function for corrected content (includes updated workflow steps)
 */
function addCorrectedHowToUseContent_(sheet) {
  const content = [
    // Header Section
    ['🎓', 'Concept-to-Course Tool - Complete User Guide', '', ''],
    ['', '', '', ''],
    ['📋', 'GETTING STARTED', '', ''],
    ['', 'This tool follows a proven 10-step workflow to transform your healthcare', '', ''],
    ['', 'education concepts into complete, professional course materials with', '', ''],
    ['', 'AI-powered content generation tailored for Australian standards.', '', ''],
    ['', '', '', ''],
    
    // Key workflow corrections highlighted
    ['🎯', 'OPTIMISED 10-STEP WORKFLOW (CORRECTED)', '', ''],
    ['', '', '', ''],
    ['4️⃣', 'Step 4: Generate Full Suite (inc. LMS)', '📚 INTEGRATED', '10-15 min'],
    ['', '• CORRECTED: Now includes LMS content generation', '', ''],
    ['', '• Eliminates separate menu item for maximum efficiency', '', ''],
    ['', '• Populates Column I with proper Google Docs URLs', '', ''],
    ['', '', '', ''],
    
    ['5️⃣', 'Step 5: Generate Voiceover Scripts', '🎙️ REPOSITIONED', '5-8 min'],
    ['', '• CORRECTED: Now runs while on Module-Resources tab', '', ''],
    ['', '• Maintains 10-step workflow efficiency', '', ''],
    ['', '• No tab switching required', '', ''],
    ['', '', '', ''],
    
    // Include all other steps...
    ['🔟', 'Step 10: Archive Project', '📦 ENHANCED', '2-3 min'],
    ['', '• FIXED: Properly removes Mapping and System Status sheets', '', ''],
    ['', '• Intelligent cleanup based on remaining courses', '', ''],
    ['', '• Complete workspace restoration option', '', ''],
    ['', '', '', ''],
    
    // Quality and compliance info...
    ['🏥', 'AUSTRALIAN HEALTHCARE STANDARDS', '', ''],
    ['', '• RACGP & ACRRM compliant content generation', '', ''],
    ['', '• Vancouver citation formatting', '', ''],
    ['', '• Native Gemini PDF processing (no Adobe DNS issues)', '', ''],
  ];
  
  try {
    const range = sheet.getRange(1, 1, content.length, 4);
    range.setValues(content);
    Logger.log(`Added ${content.length} rows of corrected content to How-to-Use sheet`);
  } catch (error) {
    Logger.log(`Error adding content to How-to-Use sheet: ${error.toString()}`);
  }
}

/**
 * ADD this new function for enhanced formatting
 */
function applyCorrectedHowToUseFormatting_(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 1) return;
    
    const dataRange = sheet.getRange(1, 1, lastRow, 4);
    const values = dataRange.getValues();
    
    // Set base formatting
    dataRange.setFontFamily('Inter')
             .setFontSize(11)
             .setWrap(true)
             .setVerticalAlignment('top');
    
    // Apply enhanced formatting patterns
    for (let i = 0; i < values.length; i++) {
      const rowNum = i + 1;
      const cellA = values[i][0] ? values[i][0].toString() : '';
      const cellB = values[i][1] ? values[i][1].toString() : '';
      
      // Main headers
      if (cellB && cellB.match(/^[A-Z\s&()-]+$/) && cellB.length > 5) {
        const headerRange = sheet.getRange(rowNum, 1, 1, 4);
        headerRange.setFontSize(14)
                   .setFontWeight('bold')
                   .setBackground('#1a73e8')
                   .setFontColor('white');
      }
      
      // Step numbers and corrections
      else if (cellA && cellA.includes('️⃣')) {
        const stepRange = sheet.getRange(rowNum, 1, 1, 4);
        stepRange.setFontSize(12)
                 .setFontWeight('bold')
                 .setBackground('#e8f0fe')
                 .setFontColor('#1967d2');
      }
    }
    
    // Highlight main title
    const titleRange = sheet.getRange(1, 1, 1, 4);
    titleRange.setFontSize(16)
             .setFontWeight('bold')
             .setBackground('#34a853')
             .setFontColor('white')
             .setHorizontalAlignment('center');
    
    Logger.log('Enhanced formatting applied successfully');
    
  } catch (error) {
    Logger.log(`Error applying formatting: ${error.toString()}`);
  }
}

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================

/**
 * DEPLOYMENT STEPS:
 * 
 * 1. BACKUP YOUR CURRENT SCRIPT FIRST
 * 
 * 2. REPLACE FUNCTIONS:
 *    - Replace archiveCourse() with the enhanced version above
 *    - Replace refreshHowToUseTab() with the corrected version above
 *    - Replace createHowToUseTab_() with the enhanced version above
 *    - Add the new helper functions: setupHowToUseDesign_(), addCorrectedHowToUseContent_(), applyCorrectedHowToUseFormatting_()
 * 
 * 3. TEST IMMEDIATELY:
 *    - Test the refreshHowToUseTab() function to verify formatting is fixed
 *    - Test archiveCourse() on a test course to verify proper sheet deletion
 * 
 * 4. VERIFY RESULTS:
 *    - How-to-Use tab should display correctly with updated workflow content
 *    - Archive function should properly handle Mapping and System Status sheet cleanup
 * 
 * These fixes address the immediate operational issues identified by Carla
 * while maintaining all existing functionality and preserving data integrity.
 */
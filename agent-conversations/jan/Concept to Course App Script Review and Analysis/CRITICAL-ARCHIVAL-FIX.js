/**
 * CRITICAL FIX: Archival Function - Complete Sheet Deletion
 * 
 * ISSUE: The archiveCourse() function was only deleting Module-Resources and TTS sheets
 * but leaving behind the Mapping and System Status sheets, which should also be removed
 * during archival to properly clean up the workspace.
 * 
 * SOLUTION: Enhanced archival function that properly cleans up ALL related sheets
 * while preserving important data in the backup spreadsheet.
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

/**
 * Helper function to extract ID from Google Drive URL
 * (Assumes this function already exists in your script)
 */
function extractIdFromUrl_(url) {
  if (!url) return null;
  
  // Handle various Google Drive URL formats
  const patterns = [
    /\/folders\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // If no pattern matches, assume the URL is just the ID
  return url;
}
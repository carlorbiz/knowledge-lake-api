/**
 * CRITICAL FIX: Function Recognition and TTS Sheet Creation
 * 
 * PROBLEMS IDENTIFIED:
 * 1. getActiveModuleInfo_ function not recognizing Module-Resources sheets properly
 * 2. TTS sheet creation failing in Step 3 fix
 * 3. Sheet name parsing issues
 * 
 * This fixes both the recognition problem and ensures TTS sheet creation works
 */

/**
 * FIXED: Get active module information - now properly recognizes Module-Resources sheets
 */
function getActiveModuleInfo_(sheetPrefix) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const sheetName = activeSheet.getName();
    
    Logger.log(`Checking sheet: ${sheetName}, looking for prefix: ${sheetPrefix}`);
    
    // Handle Module-Resources sheets - more flexible matching
    if (sheetPrefix === 'Module-Resources') {
      // Check if we're on ANY Module-Resources sheet (not just exact prefix match)
      if (sheetName.includes('Module-Resources-') || sheetName.startsWith('Module-Resources-')) {
        const conceptName = sheetName.replace('Module-Resources-', '').trim();
        const activeCell = activeSheet.getActiveCell();
        const activeRow = activeCell.getRow();
        
        Logger.log(`On Module-Resources sheet, row: ${activeRow}, concept: ${conceptName}`);
        
        if (activeRow < 2) {
          SpreadsheetApp.getUi().alert('Row Selection', 'Please select a module row (not the header row).', SpreadsheetApp.getUi().ButtonSet.OK);
          return { sheet: null, row: null, moduleName: null, conceptName: null };
        }
        
        // Get module name from Column A
        const moduleName = activeSheet.getRange(activeRow, 1).getValue();
        
        Logger.log(`Module name from row ${activeRow}, col A: "${moduleName}"`);
        
        if (!moduleName || String(moduleName).trim() === '') {
          SpreadsheetApp.getUi().alert('No Module Name', 'No module name found in the selected row. Please select a row with a module name in column A.', SpreadsheetApp.getUi().ButtonSet.OK);
          return { sheet: null, row: null, moduleName: null, conceptName: null };
        }
        
        Logger.log(`Successfully identified: sheet=${sheetName}, row=${activeRow}, module="${moduleName}", concept="${conceptName}"`);
        
        return {
          sheet: activeSheet,
          row: activeRow,
          moduleName: String(moduleName).trim(),
          conceptName: conceptName
        };
      }
    }
    
    // If we get here, we're not on the expected sheet type
    Logger.log(`Sheet "${sheetName}" does not match expected prefix "${sheetPrefix}"`);
    return { sheet: null, row: null, moduleName: null, conceptName: null };
    
  } catch (error) {
    Logger.log(`Error in getActiveModuleInfo_: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Function Error', `Error getting module info: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { sheet: null, row: null, moduleName: null, conceptName: null };
  }
}

/**
 * CORRECTED: Step 3 function with proper TTS sheet creation
 */
function createCourseContentTabs() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) {
    return ui.alert('Missing Mapping Sheet', 'Please run "#1 Setup" first to create the Mapping sheet.', ui.ButtonSet.OK);
  }
  
  const row = mappingSheet.getActiveCell().getRow();
  if (row < 2) {
    return ui.alert('Row Selection Required', 'Please select a data row (not the header row).', ui.ButtonSet.OK);
  }

  const courseName = mappingSheet.getRange(row, 1).getValue();
  const courseFolderUrl = mappingSheet.getRange(row, 20).getValue(); // Column T
  
  if (!courseName || !courseFolderUrl) {
    return ui.alert('Prerequisites Missing', 'Please run steps #1 and #2 first to set up course name and folder.', ui.ButtonSet.OK);
  }
  
  try {
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    
    // Get module names from columns H-S (8-19)
    const moduleNames = mappingSheet.getRange(row, 8, 1, 12).getValues()[0].filter(String);
    
    if (moduleNames.length === 0) {
      return ui.alert('No Modules Found', 'No module names found in columns H-S. Please run step #2 first to generate the recommendation.', ui.ButtonSet.OK);
    }

    // Create module subfolders in Google Drive
    ss.toast('Creating module subfolders in Google Drive...');
    
    moduleNames.forEach((name, index) => {
      const sanitizedName = name.replace(/[^a-zA-Z0-9\s\-]/g, '');
      const folderName = `Module ${index + 1} - ${sanitizedName}`;
      getOrCreateFolder_(courseFolder, folderName);
    });
    
    // Create Module-Resources sheet with proper headers
    const resourcesSheetName = `Module-Resources-${courseName}`;
    let resourcesSheet = ss.getSheetByName(resourcesSheetName);
    
    if (!resourcesSheet) {
      ss.toast('Creating Module-Resources sheet...');
      
      // Create new sheet
      resourcesSheet = ss.insertSheet(resourcesSheetName);
      
      // Set up proper headers for Module-Resources sheet
      const resourceHeaders = [
        'Module Name',           // A
        'Concept Name',          // B  
        'Module Description',    // C
        'Key Concepts',          // D
        'Scenarios',             // E
        'Assessments',           // F
        'Resources',             // G
        'Slide Specifications',  // H
        'LMS Content',           // I
        'Status',                // J
        'Notes'                  // K
      ];
      
      // Set headers
      resourcesSheet.getRange(1, 1, 1, resourceHeaders.length).setValues([resourceHeaders]);
      
      // Format headers
      const headerRange = resourcesSheet.getRange(1, 1, 1, resourceHeaders.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#4285F4')
                 .setFontColor('#FFFFFF')
                 .setHorizontalAlignment('center');
      
      // Freeze header row
      resourcesSheet.setFrozenRows(1);
      
      // Populate module names and concept name
      if (moduleNames.length > 0) {
        const moduleData = moduleNames.map(moduleName => [
          moduleName,    // Module Name (A)
          courseName,    // Concept Name (B)
          '',            // Module Description (C) - to be filled
          '',            // Key Concepts (D) - to be filled
          '',            // Scenarios (E) - to be filled
          '',            // Assessments (F) - to be filled
          '',            // Resources (G) - to be filled
          '',            // Slide Specifications (H) - to be filled
          '',            // LMS Content (I) - to be filled
          'Ready',       // Status (J)
          ''             // Notes (K)
        ]);
        
        resourcesSheet.getRange(2, 1, moduleData.length, resourceHeaders.length).setValues(moduleData);
      }
      
      // Auto-resize columns and set proper widths
      resourcesSheet.autoResizeColumns(1, resourceHeaders.length);
      resourcesSheet.setColumnWidth(1, 250); // Module Name
      resourcesSheet.setColumnWidth(2, 150); // Concept Name
      resourcesSheet.setColumnWidth(3, 300); // Module Description
      resourcesSheet.setColumnWidth(4, 250); // Key Concepts
      resourcesSheet.setColumnWidth(8, 250); // Slide Specifications
      
      // Set text wrapping for key columns
      if (moduleNames.length > 0) {
        resourcesSheet.getRange(2, 3, moduleNames.length, 1).setWrap(true); // Module Description
        resourcesSheet.getRange(2, 4, moduleNames.length, 1).setWrap(true); // Key Concepts
      }
    }

    // FIXED: Create TTS (Text-to-Speech) sheet with proper error handling
    const ttsSheetName = `TTS-${courseName}`;
    let ttsSheet = ss.getSheetByName(ttsSheetName);
    
    if (!ttsSheet) {
      ss.toast('Creating TTS sheet...');
      
      try {
        // Create new sheet
        ttsSheet = ss.insertSheet(ttsSheetName);
        
        // Set up proper headers for TTS sheet
        const ttsHeaders = [
          'Module Name',           // A
          'Slide Number',          // B
          'Slide Title',           // C
          'Narration Script',      // D
          'Audio File URL',        // E
          'Duration (seconds)',    // F
          'Voice Settings',        // G
          'Status',                // H
          'Notes'                  // I
        ];
        
        // Set headers
        ttsSheet.getRange(1, 1, 1, ttsHeaders.length).setValues([ttsHeaders]);
        
        // Format headers
        const ttsHeaderRange = ttsSheet.getRange(1, 1, 1, ttsHeaders.length);
        ttsHeaderRange.setFontWeight('bold')
                      .setBackground('#34A853')
                      .setFontColor('#FFFFFF')
                      .setHorizontalAlignment('center');
        
        // Freeze header row
        ttsSheet.setFrozenRows(1);
        
        // Auto-resize columns and set proper widths
        ttsSheet.autoResizeColumns(1, ttsHeaders.length);
        ttsSheet.setColumnWidth(1, 200); // Module Name
        ttsSheet.setColumnWidth(3, 250); // Slide Title
        ttsSheet.setColumnWidth(4, 400); // Narration Script
        ttsSheet.setColumnWidth(5, 300); // Audio File URL
        
        // Set text wrapping for narration script
        ttsSheet.getRange(2, 4, 50, 1).setWrap(true);
        
        Logger.log(`Successfully created TTS sheet: ${ttsSheetName}`);
        
      } catch (ttsError) {
        Logger.log(`Error creating TTS sheet: ${ttsError.toString()}`);
        ui.alert('TTS Sheet Warning', `Module-Resources sheet created successfully, but there was an issue creating the TTS sheet: ${ttsError.message}`, ui.ButtonSet.OK);
      }
    }
    
    // Success message with details
    const createdSheets = [];
    if (resourcesSheet) createdSheets.push(`✓ ${resourcesSheetName}`);
    if (ttsSheet) createdSheets.push(`✓ ${ttsSheetName}`);
    
    const successMessage = [
      'Content Workspace Created Successfully!',
      '',
      '✓ Created module subfolders in Google Drive',
      ...createdSheets.map(sheet => `${sheet} sheet`),
      '',
      'Next Steps:',
      '• Navigate to the Module-Resources sheet',
      '• Select a module row', 
      '• Run "#4 Generate Full Suite of Resources"'
    ].join('\n');
    
    ui.alert('Setup Complete', successMessage, ui.ButtonSet.OK);
    
    // Automatically navigate to the Module-Resources sheet
    if (resourcesSheet) {
      ss.setActiveSheet(resourcesSheet);
      // Select the first module row to help user get started
      resourcesSheet.getRange(2, 1).activate();
    }
    
    ss.toast('Workspace creation complete! Select a module row and run menu item #4.', '', 5);
    
  } catch (error) {
    Logger.log(`Error in createCourseContentTabs: ${error.toString()}`);
    ui.alert('Creation Error', `Error creating content tabs: ${error.message}`, ui.ButtonSet.OK);
  }
}

/*
DEPLOYMENT INSTRUCTIONS:

1. REPLACE both functions in your script:
   - getActiveModuleInfo_ (the recognition fix)
   - createCourseContentTabs (the TTS creation fix)

2. WHAT'S FIXED:
   ✅ Function now properly recognizes Module-Resources sheets
   ✅ More flexible sheet name matching
   ✅ Better logging for debugging
   ✅ Proper TTS sheet creation with error handling
   ✅ Auto-navigation to help user get started
   ✅ Better error messages and user guidance

3. TESTING PROCESS:
   ✅ Run Step 3 again to ensure TTS sheet is created
   ✅ Navigate to Module-Resources sheet
   ✅ Click on any module row (row 2, 3, etc.)
   ✅ Run Menu Item #4 - should now recognize your selection

The key fixes: More robust sheet name detection and proper TTS sheet creation!
*/
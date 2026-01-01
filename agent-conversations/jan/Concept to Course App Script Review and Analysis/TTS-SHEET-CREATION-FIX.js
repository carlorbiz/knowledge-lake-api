/**
 * TTS SHEET CREATION FIX
 * 
 * PROBLEM: The createCourseContentTabs function skips TTS creation when Module-Resources already exists
 * SOLUTION: Separate the TTS creation logic to run independently
 */

/**
 * CORRECTED: Create TTS sheet independently - call this to fix missing TTS sheet
 */
function createMissingTTSSheet() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) {
    return ui.alert('Missing Mapping Sheet', 'Please run "#1 Setup" first to create the Mapping sheet.', ui.ButtonSet.OK);
  }
  
  const row = mappingSheet.getActiveCell().getRow();
  if (row < 2) {
    return ui.alert('Row Selection Required', 'Please select a data row (not the header row) on the Mapping sheet.', ui.ButtonSet.OK);
  }

  const courseName = mappingSheet.getRange(row, 1).getValue();
  
  if (!courseName) {
    return ui.alert('Course Name Missing', 'No course name found in column A of the selected row.', ui.ButtonSet.OK);
  }
  
  // Check if TTS sheet already exists
  const ttsSheetName = `TTS-${courseName}`;
  let ttsSheet = ss.getSheetByName(ttsSheetName);
  
  if (ttsSheet) {
    return ui.alert('TTS Sheet Exists', `The TTS sheet "${ttsSheetName}" already exists.`, ui.ButtonSet.OK);
  }
  
  try {
    ss.toast('Creating TTS sheet...');
    
    // Create new TTS sheet
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
    
    // Success message
    ui.alert('TTS Sheet Created', `Successfully created "${ttsSheetName}" sheet with proper headers and formatting.`, ui.ButtonSet.OK);
    
    // Navigate to the new TTS sheet
    ss.setActiveSheet(ttsSheet);
    
    ss.toast(`TTS sheet "${ttsSheetName}" created successfully!`, '', 3);
    
  } catch (error) {
    Logger.log(`Error creating TTS sheet: ${error.toString()}`);
    ui.alert('TTS Creation Error', `Error creating TTS sheet: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * IMPROVED: Fixed createCourseContentTabs that ALWAYS checks for TTS sheet
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

    let resourcesSheetCreated = false;
    let ttsSheetCreated = false;

    // Create module subfolders in Google Drive (always do this)
    ss.toast('Creating/checking module subfolders in Google Drive...');
    
    moduleNames.forEach((name, index) => {
      const sanitizedName = name.replace(/[^a-zA-Z0-9\s\-]/g, '');
      const folderName = `Module ${index + 1} - ${sanitizedName}`;
      getOrCreateFolder_(courseFolder, folderName);
    });
    
    // Create Module-Resources sheet with proper headers (if it doesn't exist)
    const resourcesSheetName = `Module-Resources-${courseName}`;
    let resourcesSheet = ss.getSheetByName(resourcesSheetName);
    
    if (!resourcesSheet) {
      ss.toast('Creating Module-Resources sheet...');
      resourcesSheetCreated = true;
      
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

    // ALWAYS CREATE TTS SHEET (whether or not Module-Resources existed)
    const ttsSheetName = `TTS-${courseName}`;
    let ttsSheet = ss.getSheetByName(ttsSheetName);
    
    if (!ttsSheet) {
      ss.toast('Creating TTS sheet...');
      ttsSheetCreated = true;
      
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
        ui.alert('TTS Sheet Warning', `Module-Resources sheet processed successfully, but there was an issue creating the TTS sheet: ${ttsError.message}`, ui.ButtonSet.OK);
      }
    }
    
    // Success message with details about what was created
    const createdItems = [];
    createdItems.push('✓ Module subfolders checked/created in Google Drive');
    
    if (resourcesSheetCreated) {
      createdItems.push(`✓ Created ${resourcesSheetName} sheet`);
    } else {
      createdItems.push(`✓ ${resourcesSheetName} sheet already exists`);
    }
    
    if (ttsSheetCreated) {
      createdItems.push(`✓ Created ${ttsSheetName} sheet`);
    } else {
      createdItems.push(`✓ ${ttsSheetName} sheet already exists`);
    }
    
    const successMessage = [
      'Content Workspace Setup Complete!',
      '',
      ...createdItems,
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
    
    ss.toast('Workspace setup complete! Select a module row and run menu item #4.', '', 5);
    
  } catch (error) {
    Logger.log(`Error in createCourseContentTabs: ${error.toString()}`);
    ui.alert('Creation Error', `Error creating content tabs: ${error.message}`, ui.ButtonSet.OK);
  }
}

/*
DEPLOYMENT OPTIONS:

OPTION 1 - QUICK FIX (Recommended):
1. Add the createMissingTTSSheet() function to your script
2. Run createMissingTTSSheet() once to create the missing TTS sheet
3. This doesn't change your existing createCourseContentTabs function

OPTION 2 - COMPLETE FIX:
1. Replace your existing createCourseContentTabs() function with the improved version above
2. This ensures TTS sheet is always checked/created, regardless of Module-Resources sheet status

WHAT'S FIXED:
✅ TTS sheet creation no longer depends on Module-Resources sheet creation status
✅ Function always checks for and creates missing TTS sheet
✅ Better success messaging showing what was actually created vs. already existed
✅ Separate function available for creating just the TTS sheet

TESTING:
✅ Run createMissingTTSSheet() - should create your missing TTS sheet
✅ Check that TTS-IMGs in Oz sheet appears with proper headers
*/
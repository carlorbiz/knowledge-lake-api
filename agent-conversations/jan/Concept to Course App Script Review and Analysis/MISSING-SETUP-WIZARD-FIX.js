/**
 * MISSING FUNCTION FIX: Add Setup Wizard to Your Script
 * 
 * PROBLEM: launchSetupWizard function is not found
 * CAUSE: Setup Wizard functions were not included in the integration
 * 
 * INSTRUCTIONS:
 * 1. Copy ALL functions below
 * 2. Paste at the END of your Google Apps Script
 * 3. Save your script
 * 4. The Setup Wizard menu option will then work
 */

/**
 * Launch Setup Wizard for system configuration
 */
function launchSetupWizard() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Welcome message
    const startWizard = ui.alert(
      '🚀 Concept-to-Course Setup Wizard',
      'Welcome! This wizard will guide you through configuring your Concept-to-Course system.\n\n' +
      'We\'ll set up:\n' +
      '• Gemini API access for AI-powered content\n' +
      '• Google Drive folder for course materials\n' +
      '• System validation and testing\n\n' +
      'Ready to begin setup?',
      ui.ButtonSet.YES_NO
    );
    
    if (startWizard !== ui.Button.YES) {
      ui.alert('Setup cancelled. You can run the Setup Wizard anytime from the menu.');
      return;
    }
    
    // Step 1: Check existing configuration
    checkExistingConfiguration_();
    
    // Step 2: Configure API access
    configureApiAccess_();
    
    // Step 3: Configure Drive folder
    configureDriveFolder_();
    
    // Step 4: Create initial worksheets if needed
    createInitialWorksheets_();
    
    // Step 5: Validate complete setup
    validateCompleteSetup_();
    
    // Success message
    ui.alert(
      '✅ Setup Complete!',
      'Your Concept-to-Course system is now configured and ready to use.\n\n' +
      'Next steps:\n' +
      '• Create a How-to-Use guide for reference\n' +
      '• Try the Course Creation Wizard\n' +
      '• Explore the original 10-step workflow\n\n' +
      'Happy course creating!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    Logger.log('Setup Wizard error: ' + error.toString());
    ui.alert(
      'Setup Error',
      'There was an issue during setup: ' + error.message + '\n\n' +
      'Please check the logs and try again, or configure manually via Script Properties.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Check existing configuration status
 */
function checkExistingConfiguration_() {
  const ui = SpreadsheetApp.getUi();
  const properties = PropertiesService.getScriptProperties();
  
  const existingKeys = properties.getKeys();
  const hasGemini = existingKeys.includes('GEMINI_API_KEY');
  const hasFolder = existingKeys.includes('DRIVE_FOLDER_ID') || existingKeys.includes('PROJECT_FOLDER_ID');
  
  if (hasGemini || hasFolder) {
    let message = 'Found existing configuration:\n\n';
    if (hasGemini) message += '• Gemini API key: Configured ✅\n';
    if (hasFolder) message += '• Drive folder: Configured ✅\n';
    message += '\nWould you like to update existing settings?';
    
    const updateExisting = ui.alert('Existing Configuration Found', message, ui.ButtonSet.YES_NO);
    
    if (updateExisting !== ui.Button.YES) {
      throw new Error('Setup cancelled - keeping existing configuration');
    }
  }
}

/**
 * Configure Gemini API access
 */
function configureApiAccess_() {
  const ui = SpreadsheetApp.getUi();
  
  const apiChoice = ui.alert(
    '🔑 API Configuration',
    'To use AI-powered content generation, you need a Gemini API key.\n\n' +
    'Do you have a Gemini API key ready to configure?',
    ui.ButtonSet.YES_NO
  );
  
  if (apiChoice === ui.Button.YES) {
    const apiKeyPrompt = ui.prompt(
      'Gemini API Key',
      'Please enter your Gemini API key:\n\n' +
      '(You can get one from https://makersuite.google.com/app/apikey)',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (apiKeyPrompt.getSelectedButton() === ui.Button.OK) {
      const apiKey = apiKeyPrompt.getResponseText().trim();
      
      if (apiKey && apiKey.length > 10) {
        PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
        ui.alert('✅ Gemini API key saved successfully!');
      } else {
        throw new Error('Invalid API key provided');
      }
    } else {
      throw new Error('API key configuration cancelled');
    }
  } else {
    ui.alert(
      'API Key Skipped',
      'You can add your Gemini API key later via:\n' +
      'Extensions → Apps Script → Project Settings → Script Properties\n\n' +
      'Property name: GEMINI_API_KEY',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Configure Drive folder for course materials
 */
function configureDriveFolder_() {
  const ui = SpreadsheetApp.getUi();
  
  const folderChoice = ui.alert(
    '📁 Drive Folder Setup',
    'Course materials will be stored in a Google Drive folder.\n\n' +
    'Would you like to:\n' +
    'YES = Create a new folder\n' +
    'NO = Use an existing folder',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (folderChoice === ui.Button.CANCEL) {
    throw new Error('Drive folder configuration cancelled');
  }
  
  let folderId;
  
  if (folderChoice === ui.Button.YES) {
    // Create new folder
    const folderName = 'Concept-to-Course Materials';
    try {
      const newFolder = DriveApp.createFolder(folderName);
      folderId = newFolder.getId();
      ui.alert('✅ Created new folder: ' + folderName);
    } catch (error) {
      throw new Error('Failed to create Drive folder: ' + error.message);
    }
  } else {
    // Use existing folder
    const folderPrompt = ui.prompt(
      'Existing Folder',
      'Please enter the Google Drive folder ID:\n\n' +
      '(Right-click folder in Drive → Share → Copy link, then extract ID)',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (folderPrompt.getSelectedButton() === ui.Button.OK) {
      folderId = folderPrompt.getResponseText().trim();
      
      // Test folder access
      try {
        DriveApp.getFolderById(folderId).getName();
      } catch (error) {
        throw new Error('Cannot access folder. Please check the folder ID and permissions.');
      }
    } else {
      throw new Error('Folder configuration cancelled');
    }
  }
  
  // Save folder ID (use both property names for compatibility)
  PropertiesService.getScriptProperties().setProperties({
    'DRIVE_FOLDER_ID': folderId,
    'PROJECT_FOLDER_ID': folderId
  });
  
  ui.alert('✅ Drive folder configured successfully!');
}

/**
 * Create initial worksheets if needed
 */
function createInitialWorksheets_() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check if Mapping sheet exists
  if (!spreadsheet.getSheetByName('Mapping')) {
    const createMapping = ui.alert(
      'Create Mapping Sheet',
      'Would you like to create the main "Mapping" sheet for course configuration?',
      ui.ButtonSet.YES_NO
    );
    
    if (createMapping === ui.Button.YES) {
      const mappingSheet = spreadsheet.insertSheet('Mapping');
      
      // Set up headers
      const headers = ['Concept', 'Sources', 'Audience', 'Learning Objectives', 'Content Areas'];
      mappingSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      mappingSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      mappingSheet.setFrozenRows(1);
      
      ui.alert('✅ Mapping sheet created with basic structure');
    }
  }
}

/**
 * Validate complete setup
 */
function validateCompleteSetup_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Use the enhanced validation if available, otherwise basic check
    if (typeof validateSystemConfiguration_ === 'function') {
      const validation = validateSystemConfiguration_(false);
      if (!validation.isValid) {
        throw new Error('System validation failed: ' + validation.issues.join(', '));
      }
    } else {
      // Basic validation
      CFG.validateConfiguration();
    }
    
    ui.alert('✅ System validation passed - all components are working correctly!');
    
  } catch (error) {
    ui.alert(
      '⚠️ Validation Warning',
      'Setup completed but validation found issues:\n\n' + error.message + 
      '\n\nYou can still use the system, but some features may not work until resolved.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Show current configuration (for diagnostics)
 */
function showCurrentConfiguration_() {
  const ui = SpreadsheetApp.getUi();
  const properties = PropertiesService.getScriptProperties();
  const keys = properties.getKeys();
  
  let message = 'Current Configuration:\n\n';
  
  const checkKeys = ['GEMINI_API_KEY', 'DRIVE_FOLDER_ID', 'PROJECT_FOLDER_ID', 'SLIDES_TEMPLATE_ID'];
  checkKeys.forEach(key => {
    const value = properties.getProperty(key);
    if (value) {
      message += `✅ ${key}: Configured (${value.length} chars)\n`;
    } else {
      message += `❌ ${key}: Not configured\n`;
    }
  });
  
  ui.alert('System Configuration', message, ui.ButtonSet.OK);
}
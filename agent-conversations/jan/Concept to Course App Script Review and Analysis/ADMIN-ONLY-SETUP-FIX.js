/**
 * ADMIN-ONLY SETUP WIZARD FIX
 * 
 * PROBLEM: Setup Wizard appears in user menu but should be admin-only
 * SOLUTION: Remove from menu, keep function for admin use only
 * 
 * INSTRUCTIONS:
 * 1. Replace your onOpen function with the corrected version below
 * 2. Add the admin-only setup functions at the end of your script
 * 3. Setup Wizard will only be accessible to you via script editor
 */

// ===============================
// PART 1: CORRECTED onOpen FUNCTION (USER MENU ONLY)
// ===============================

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // USER MENU - Course Creation Wizard ONLY
    const menu = ui.createMenu('🎓 Concept-to-Course Enhanced')
      .addItem('📖 Create How-to-Use Guide', 'createHowToUseTab_')
      .addItem('🎯 Course Creation Wizard', 'launchCourseCreationWizard')
      .addSeparator()
      .addItem('📊 System Diagnostics', 'runSystemDiagnostics_')
      .addItem('🔧 Validate Configuration', 'validateSystemConfiguration_')
      .addSeparator()
      .addSubMenu(ui.createMenu('📋 Original Workflow')
        .addItem('1️⃣ Setup', 'step1Setup')
        .addItem('2️⃣ Recommendation', 'step2Recommendation') 
        .addItem('3️⃣ Workspace', 'step3Workspace')
        .addItem('4️⃣ Content', 'step4Content')
        .addItem('5️⃣ LMS', 'step5LMS')
        .addItem('6️⃣ Slides', 'step6Slides')
        .addItem('7️⃣ Voice', 'step7Voice')
        .addItem('8️⃣ Audio', 'step8Audio')
        .addItem('9️⃣ Maintenance', 'step9Maintenance')
        .addItem('🔟 Archive', 'step10Archive'))
      .addSeparator()
      .addItem('❓ Help & Support', 'showHelpDialog_');
    
    menu.addToUi();
    
    // Show welcome message on first use
    if (!hasUserSeenWelcome_()) {
      showWelcomeDialog_();
      markUserSeenWelcome_();
    }
    
    // Validate system configuration silently (no setup wizard prompt)
    const validationResult = validateSystemConfiguration_(false);
    if (!validationResult.isValid) {
      // QUIET validation - just log, don't prompt user to run setup
      Logger.log('System validation issues detected: ' + validationResult.issues.join(', '));
    }
    
    Logger.log('Enhanced onOpen completed successfully');
    
  } catch (error) {
    Logger.log('Error in enhanced onOpen: ' + error.toString());
    SpreadsheetApp.getUi().alert('Initialisation Error', 
      'There was an issue loading the enhanced menu system. Please check the logs.', 
      SpreadsheetApp.getUi().AlertResponse.OK);
  }
}

// ===============================
// PART 2: ADMIN-ONLY SETUP FUNCTIONS
// ===============================

/**
 * ADMIN ONLY: Launch Setup Wizard for new client configuration
 * Run this function directly from the Apps Script editor when setting up new clients
 */
function adminLaunchSetupWizard() {
  const ui = SpreadsheetApp.getUi();
  
  // Admin confirmation
  const adminConfirm = ui.alert(
    '⚠️ ADMINISTRATOR SETUP',
    'This is an administrator function for setting up new client systems.\n\n' +
    'Are you Carla Taylor configuring this system for a client?',
    ui.ButtonSet.YES_NO
  );
  
  if (adminConfirm !== ui.Button.YES) {
    ui.alert('Access Denied', 'This function is restricted to system administrators.');
    return;
  }
  
  try {
    // Welcome message
    const startWizard = ui.alert(
      '🔧 ADMIN: Client Setup Wizard',
      'Welcome Carla! This will configure the Concept-to-Course system for a new client.\n\n' +
      'We\'ll set up:\n' +
      '• Gemini API access for AI-powered content\n' +
      '• Google Drive folder for course materials\n' +
      '• Initial worksheet structure\n' +
      '• System validation and testing\n\n' +
      'Ready to begin client setup?',
      ui.ButtonSet.YES_NO
    );
    
    if (startWizard !== ui.Button.YES) {
      ui.alert('Setup cancelled.');
      return;
    }
    
    // Step 1: Check existing configuration
    adminCheckExistingConfiguration_();
    
    // Step 2: Configure API access
    adminConfigureApiAccess_();
    
    // Step 3: Configure Drive folder
    adminConfigureDriveFolder_();
    
    // Step 4: Create initial worksheets
    adminCreateInitialWorksheets_();
    
    // Step 5: Validate complete setup
    adminValidateCompleteSetup_();
    
    // Success message
    ui.alert(
      '✅ Client Setup Complete!',
      'The Concept-to-Course system is now configured for this client.\n\n' +
      'Client can now access:\n' +
      '• Course Creation Wizard\n' +
      '• How-to-Use guide generation\n' +
      '• Complete 10-step workflow\n' +
      '• System diagnostics\n\n' +
      'Setup Wizard is hidden from client menu.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    Logger.log('Admin Setup error: ' + error.toString());
    ui.alert(
      'Setup Error',
      'There was an issue during setup: ' + error.message + '\n\n' +
      'Check the logs for details.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * ADMIN ONLY: Check existing configuration
 */
function adminCheckExistingConfiguration_() {
  const ui = SpreadsheetApp.getUi();
  const properties = PropertiesService.getScriptProperties();
  
  const existingKeys = properties.getKeys();
  const hasGemini = existingKeys.includes('GEMINI_API_KEY');
  const hasFolder = existingKeys.includes('DRIVE_FOLDER_ID') || existingKeys.includes('PROJECT_FOLDER_ID');
  
  if (hasGemini || hasFolder) {
    let message = 'Found existing configuration:\n\n';
    if (hasGemini) message += '• Gemini API key: Configured ✅\n';
    if (hasFolder) message += '• Drive folder: Configured ✅\n';
    message += '\nOverwrite existing settings for new client?';
    
    const updateExisting = ui.alert('Existing Configuration Found', message, ui.ButtonSet.YES_NO);
    
    if (updateExisting !== ui.Button.YES) {
      throw new Error('Setup cancelled - keeping existing configuration');
    }
  }
}

/**
 * ADMIN ONLY: Configure client's Gemini API access
 */
function adminConfigureApiAccess_() {
  const ui = SpreadsheetApp.getUi();
  
  const apiKeyPrompt = ui.prompt(
    'Client Gemini API Key',
    'Enter the client\'s Gemini API key:\n\n' +
    'Client can get one from: https://makersuite.google.com/app/apikey',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (apiKeyPrompt.getSelectedButton() === ui.Button.OK) {
    const apiKey = apiKeyPrompt.getResponseText().trim();
    
    if (apiKey && apiKey.length > 10) {
      PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
      ui.alert('✅ Client Gemini API key configured successfully!');
    } else {
      throw new Error('Invalid API key provided');
    }
  } else {
    throw new Error('API key configuration cancelled');
  }
}

/**
 * ADMIN ONLY: Configure client Drive folder
 */
function adminConfigureDriveFolder_() {
  const ui = SpreadsheetApp.getUi();
  
  const folderChoice = ui.alert(
    '📁 Client Drive Folder Setup',
    'How should we set up the client\'s course materials folder?\n\n' +
    'YES = Create new folder in their Drive\n' +
    'NO = Use existing folder (need ID)',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (folderChoice === ui.Button.CANCEL) {
    throw new Error('Drive folder configuration cancelled');
  }
  
  let folderId;
  
  if (folderChoice === ui.Button.YES) {
    // Create new folder
    const clientNamePrompt = ui.prompt(
      'Client Folder Name',
      'Enter client name for folder (e.g., "ABC Healthcare"):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (clientNamePrompt.getSelectedButton() === ui.Button.OK) {
      const clientName = clientNamePrompt.getResponseText().trim() || 'Client';
      const folderName = `${clientName} - Concept-to-Course Materials`;
      
      try {
        const newFolder = DriveApp.createFolder(folderName);
        folderId = newFolder.getId();
        ui.alert('✅ Created client folder: ' + folderName);
      } catch (error) {
        throw new Error('Failed to create Drive folder: ' + error.message);
      }
    } else {
      throw new Error('Folder naming cancelled');
    }
  } else {
    // Use existing folder
    const folderPrompt = ui.prompt(
      'Existing Client Folder ID',
      'Enter the client\'s Google Drive folder ID:',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (folderPrompt.getSelectedButton() === ui.Button.OK) {
      folderId = folderPrompt.getResponseText().trim();
      
      try {
        const folderName = DriveApp.getFolderById(folderId).getName();
        ui.alert('✅ Using existing folder: ' + folderName);
      } catch (error) {
        throw new Error('Cannot access folder. Check folder ID and permissions.');
      }
    } else {
      throw new Error('Folder configuration cancelled');
    }
  }
  
  // Save folder ID (both property names for compatibility)
  PropertiesService.getScriptProperties().setProperties({
    'DRIVE_FOLDER_ID': folderId,
    'PROJECT_FOLDER_ID': folderId
  });
}

/**
 * ADMIN ONLY: Create initial client worksheets
 */
function adminCreateInitialWorksheets_() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Always create/update Mapping sheet for new client
  let mappingSheet = spreadsheet.getSheetByName('Mapping');
  
  if (!mappingSheet) {
    mappingSheet = spreadsheet.insertSheet('Mapping');
  }
  
  // Set up headers for client
  const headers = ['Concept', 'Sources', 'Audience', 'Learning Objectives', 'Content Areas'];
  mappingSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  mappingSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E8F0FE');
  mappingSheet.setFrozenRows(1);
  
  ui.alert('✅ Client worksheet structure configured');
}

/**
 * ADMIN ONLY: Validate client setup
 */
function adminValidateCompleteSetup_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Use enhanced validation
    if (typeof validateSystemConfiguration_ === 'function') {
      const validation = validateSystemConfiguration_(false);
      if (!validation.isValid) {
        throw new Error('Client system validation failed: ' + validation.issues.join(', '));
      }
      ui.alert('✅ Client system validation passed - all components working!');
    } else {
      // Fallback to basic validation
      CFG.validateConfiguration();
      ui.alert('✅ Basic validation passed');
    }
    
  } catch (error) {
    ui.alert(
      '⚠️ Validation Issues',
      'Setup completed but found issues:\n\n' + error.message + 
      '\n\nPlease resolve before handing over to client.',
      ui.ButtonSet.OK
    );
  }
}

// ===============================
// INSTRUCTIONS FOR CARLA
// ===============================

/**
 * HOW TO USE THESE ADMIN FUNCTIONS:
 * 
 * FOR NEW CLIENT SETUP:
 * 1. Open Google Apps Script editor
 * 2. Run function: adminLaunchSetupWizard
 * 3. Follow the admin prompts to configure client system
 * 4. Client will only see Course Creation Wizard in their menu
 * 
 * CLIENT SEES:
 * - Course Creation Wizard
 * - How-to-Use Guide
 * - System Diagnostics  
 * - Original 10-step workflow
 * 
 * CLIENT DOES NOT SEE:
 * - Setup Wizard (admin only)
 * - Any configuration prompts
 */
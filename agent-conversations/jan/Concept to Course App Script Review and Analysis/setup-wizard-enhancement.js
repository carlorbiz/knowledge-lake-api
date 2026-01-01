/**
 * SETUP WIZARD ENHANCEMENT FOR CONCEPT-TO-COURSE
 * Add these functions to your existing script to provide guided setup
 */

// ==== ENHANCED SETUP WIZARD ====

function launchSetupWizard() {
  const ui = SpreadsheetApp.getUi();
  
  // Check if already configured
  const isConfigured = checkExistingConfiguration_();
  if (isConfigured.complete) {
    const response = ui.alert(
      'Configuration Detected',
      'The tool appears to be already configured. Would you like to:\n\n' +
      'YES = Run configuration check and update if needed\n' +
      'NO = Start fresh configuration (will overwrite existing)',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (response === ui.Button.CANCEL) return;
    if (response === ui.Button.YES) {
      return validateAndShowConfiguration_();
    }
  }
  
  // Welcome message
  const welcome = ui.alert(
    'Welcome to Concept-to-Course Setup',
    'This wizard will guide you through the initial configuration.\n\n' +
    'You will need:\n' +
    '• Your Gemini API key\n' +
    '• A Google Drive folder for your course projects\n' +
    '• A Google Slides template for presentations\n\n' +
    'The setup takes 2-3 minutes. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (welcome !== ui.Button.YES) {
    ui.alert('Setup cancelled. Run "Setup Wizard" again when ready.');
    return;
  }
  
  try {
    // Step 1: API Configuration
    if (!configureApiAccess_()) return;
    
    // Step 2: Drive Folder Setup
    if (!configureDriveFolder_()) return;
    
    // Step 3: Slides Template
    if (!configureSlidesTemplate_()) return;
    
    // Step 4: Create Initial Sheets
    createInitialWorksheets_();
    
    // Step 5: Final Validation
    const validation = validateCompleteSetup_();
    
    if (validation.success) {
      ui.alert(
        'Setup Complete!',
        'Concept-to-Course is now ready to use.\n\n' +
        '✓ API access configured\n' +
        '✓ Drive folder connected\n' +
        '✓ Slides template ready\n' +
        '✓ Worksheets created\n\n' +
        'Check the "How to Use" tab to get started with your first course.',
        ui.ButtonSet.OK
      );
      
      // Navigate to How to Use tab
      createHowToUseTab_();
      const howToSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('How to Use');
      if (howToSheet) SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(howToSheet);
      
    } else {
      ui.alert(
        'Setup Issues Detected',
        'Some configuration issues were found:\n\n' + validation.issues.join('\n') +
        '\n\nPlease contact Carla for assistance or try running the setup wizard again.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert(
      'Setup Error',
      'An error occurred during setup:\n\n' + error.message +
      '\n\nPlease contact Carla for assistance.',
      ui.ButtonSet.OK
    );
  }
}

function checkExistingConfiguration_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const hasApiKey = !!props.getProperty('GEMINI_API_KEY');
    const hasFolderId = !!props.getProperty('DRIVE_FOLDER_ID');
    const hasTemplateId = !!props.getProperty('SLIDES_TEMPLATE_ID');
    
    return {
      complete: hasApiKey && hasFolderId && hasTemplateId,
      apiKey: hasApiKey,
      folderId: hasFolderId,
      templateId: hasTemplateId
    };
  } catch (error) {
    return { complete: false, error: error.message };
  }
}

function configureApiAccess_() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 1: API Configuration',
    'You need a Gemini API key from Google AI Studio.\n\n' +
    'If you don\'t have one:\n' +
    '1. Visit https://aistudio.google.com/apikey\n' +
    '2. Create a new API key\n' +
    '3. Copy the key (starts with "AI...")\n\n' +
    'Ready to enter your API key?',
    ui.ButtonSet.OK
  );
  
  const apiPrompt = ui.prompt(
    'Enter Gemini API Key',
    'Paste your Gemini API key below:\n(It should start with "AI" and be about 40 characters long)',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (apiPrompt.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  
  const apiKey = apiPrompt.getResponseText().trim();
  
  // Validate API key format
  if (!apiKey || !apiKey.startsWith('AI') || apiKey.length < 30) {
    ui.alert(
      'Invalid API Key',
      'The API key format appears incorrect. It should:\n' +
      '• Start with "AI"\n' +
      '• Be approximately 40 characters long\n\n' +
      'Please try the setup wizard again with the correct key.',
      ui.ButtonSet.OK
    );
    return false;
  }
  
  // Test the API key
  SpreadsheetApp.getActiveSpreadsheet().toast('Testing API key...', 'Setup', 3);
  
  try {
    // Store temporarily and test
    PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
    
    // Simple test call
    const testResponse = callGemini('Hello', 100, 0.1);
    if (testResponse && testResponse.length > 0) {
      ui.alert('✓ API Key Validated', 'Your Gemini API key is working correctly.', ui.ButtonSet.OK);
      return true;
    } else {
      throw new Error('Empty response from API');
    }
    
  } catch (error) {
    // Remove the invalid key
    PropertiesService.getScriptProperties().deleteProperty('GEMINI_API_KEY');
    ui.alert(
      'API Key Test Failed',
      'The API key could not be validated:\n\n' + error.message +
      '\n\nPlease check your API key and try again, or contact Carla for assistance.',
      ui.ButtonSet.OK
    );
    return false;
  }
}

function configureDriveFolder_() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 2: Drive Folder Setup',
    'You need a Google Drive folder for storing course projects.\n\n' +
    'Options:\n' +
    '• Use an existing folder (provide the URL)\n' +
    '• Create a new folder automatically\n\n' +
    'What would you prefer?',
    ui.ButtonSet.OK
  );
  
  const choice = ui.alert(
    'Folder Setup Choice',
    'Do you have an existing Google Drive folder to use for course projects?',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (choice === ui.Button.CANCEL) {
    ui.alert('Setup cancelled.');
    return false;
  }
  
  let folderId = '';
  
  if (choice === ui.Button.YES) {
    // Use existing folder
    const folderPrompt = ui.prompt(
      'Existing Folder URL',
      'Paste the Google Drive folder URL:\n(Right-click folder in Drive → Get link)',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (folderPrompt.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Setup cancelled.');
      return false;
    }
    
    const folderUrl = folderPrompt.getResponseText().trim();
    folderId = extractIdFromUrl_(folderUrl);
    
    if (!folderId) {
      ui.alert(
        'Invalid Folder URL',
        'Could not extract folder ID from the provided URL.\n' +
        'Please ensure you copied the complete Google Drive folder URL.',
        ui.ButtonSet.OK
      );
      return false;
    }
    
  } else {
    // Create new folder
    try {
      const newFolder = DriveApp.createFolder('Concept-to-Course Projects - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
      folderId = newFolder.getId();
      
      ui.alert(
        '✓ Folder Created',
        'Created new folder: "' + newFolder.getName() + '"\n\n' +
        'Location: ' + newFolder.getUrl() +
        '\n\nYou can rename or move this folder as needed.',
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      ui.alert(
        'Folder Creation Failed',
        'Could not create Drive folder:\n\n' + error.message +
        '\n\nPlease try using an existing folder instead.',
        ui.ButtonSet.OK
      );
      return false;
    }
  }
  
  // Test folder access
  try {
    const folder = DriveApp.getFolderById(folderId);
    const folderName = folder.getName();
    PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folderId);
    
    ui.alert('✓ Drive Folder Configured', 'Successfully connected to: "' + folderName + '"', ui.ButtonSet.OK);
    return true;
    
  } catch (error) {
    ui.alert(
      'Folder Access Failed',
      'Could not access the specified folder:\n\n' + error.message +
      '\n\nPlease ensure you have edit permissions to the folder.',
      ui.ButtonSet.OK
    );
    return false;
  }
}

function configureSlidesTemplate_() {
  const ui = SpreadsheetApp.getUi();
  
  const choice = ui.alert(
    'Step 3: Slides Template',
    'You need a Google Slides template for presentations.\n\n' +
    'Options:\n' +
    '• Use your existing template\n' +
    '• Create a basic template automatically\n\n' +
    'Do you have a Google Slides template to use?',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (choice === ui.Button.CANCEL) {
    ui.alert('Setup cancelled.');
    return false;
  }
  
  let templateId = '';
  
  if (choice === ui.Button.YES) {
    // Use existing template
    const templatePrompt = ui.prompt(
      'Slides Template URL',
      'Paste your Google Slides template URL:\n(From the template in Google Slides → Share → Get link)',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (templatePrompt.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Setup cancelled.');
      return false;
    }
    
    const templateUrl = templatePrompt.getResponseText().trim();
    templateId = extractIdFromUrl_(templateUrl);
    
    if (!templateId) {
      ui.alert(
        'Invalid Template URL',
        'Could not extract presentation ID from the provided URL.\n' +
        'Please ensure you copied the complete Google Slides URL.',
        ui.ButtonSet.OK
      );
      return false;
    }
    
  } else {
    // Create basic template
    try {
      const presentation = SlidesApp.create('Concept-to-Course Template - Basic');
      templateId = presentation.getId();
      
      // Move to projects folder
      const templateFile = DriveApp.getFileById(templateId);
      const projectsFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID'));
      projectsFolder.addFile(templateFile);
      DriveApp.getRootFolder().removeFile(templateFile);
      
      ui.alert(
        '✓ Template Created',
        'Created basic slides template.\n\n' +
        'You can customise the template design, fonts, and layout as needed.\n' +
        'Location: ' + templateFile.getUrl(),
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      ui.alert(
        'Template Creation Failed',
        'Could not create slides template:\n\n' + error.message +
        '\n\nPlease try using an existing template instead.',
        ui.ButtonSet.OK
      );
      return false;
    }
  }
  
  // Test template access
  try {
    const presentation = SlidesApp.openById(templateId);
    const title = presentation.getName();
    PropertiesService.getScriptProperties().setProperty('SLIDES_TEMPLATE_ID', templateId);
    
    ui.alert('✓ Slides Template Configured', 'Successfully connected to: "' + title + '"', ui.ButtonSet.OK);
    return true;
    
  } catch (error) {
    ui.alert(
      'Template Access Failed',
      'Could not access the specified template:\n\n' + error.message +
      '\n\nPlease ensure you have edit permissions to the template.',
      ui.ButtonSet.OK
    );
    return false;
  }
}

function createInitialWorksheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create/ensure required sheets exist
  if (!ss.getSheetByName('Mapping')) {
    setupMappingTab();
  }
  
  if (!ss.getSheetByName('How to Use')) {
    createHowToUseTab_();
  }
  
  if (!ss.getSheetByName('Status')) {
    ensureStatusSheet_();
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('Worksheets configured...', 'Setup', 2);
}

function validateCompleteSetup_() {
  const issues = [];
  
  try {
    // Validate configuration
    CFG.validateConfiguration();
    
    // Check sheet structure
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['Mapping', 'How to Use', 'Status'];
    
    for (const sheetName of requiredSheets) {
      if (!ss.getSheetByName(sheetName)) {
        issues.push(`Missing required worksheet: ${sheetName}`);
      }
    }
    
    // Test basic functionality
    try {
      const testFolder = DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID);
      const testTemplate = DriveApp.getFileById(CFG.SLIDES_TEMPLATE_ID);
    } catch (error) {
      issues.push(`Resource access issue: ${error.message}`);
    }
    
    return {
      success: issues.length === 0,
      issues: issues
    };
    
  } catch (error) {
    return {
      success: false,
      issues: [`Configuration validation failed: ${error.message}`]
    };
  }
}

function validateAndShowConfiguration_() {
  const ui = SpreadsheetApp.getUi();
  const config = checkExistingConfiguration_();
  
  if (config.error) {
    ui.alert('Configuration Error', config.error, ui.ButtonSet.OK);
    return;
  }
  
  let status = 'Current Configuration Status:\n\n';
  status += `✓ API Key: ${config.apiKey ? 'Configured' : '✗ Missing'}\n`;
  status += `✓ Drive Folder: ${config.folderId ? 'Configured' : '✗ Missing'}\n`;
  status += `✓ Slides Template: ${config.templateId ? 'Configured' : '✗ Missing'}\n`;
  
  if (config.complete) {
    try {
      CFG.validateConfiguration();
      status += '\n✓ All systems operational';
      
      // Show folder and template info
      const folder = DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID);
      const template = DriveApp.getFileById(CFG.SLIDES_TEMPLATE_ID);
      
      status += `\n\nActive Resources:`;
      status += `\n• Project Folder: "${folder.getName()}"`;
      status += `\n• Slides Template: "${template.getName()}"`;
      
    } catch (error) {
      status += `\n⚠ Configuration issue: ${error.message}`;
    }
  } else {
    status += '\n\n⚠ Incomplete configuration - run Setup Wizard to complete';
  }
  
  ui.alert('Configuration Status', status, ui.ButtonSet.OK);
}

// Add this to your existing onOpen function
function onOpenEnhanced() {
  const ui = SpreadsheetApp.getUi();
  
  // Check if configured
  const config = checkExistingConfiguration_();
  
  if (!config.complete) {
    ui.createMenu('⚙️ Setup Required')
        .addItem('🚀 Launch Setup Wizard', 'launchSetupWizard')
        .addItem('📋 Check Configuration', 'validateAndShowConfiguration_')
        .addToUi();
  }
  
  // Your existing menu structure
  ui.createMenu('Concept-to-Course')
      .addItem('#1 Setup & Add First Course', 'setupMappingTab')
      .addItem('#2 Generate Course Recommendation', 'generateCourseRecommendation')
      .addItem('#3 Create Content Tabs & Subfolders', 'createCourseContentTabs')
      .addSeparator()
      .addItem('#4 Generate Full Suite of Resources', 'generateFullSuiteOfResources')
      .addItem('#5 Generate LMS Upload Doc', 'generateAbsorbLmsFile')
      .addSeparator()
      .addSubMenu(ui.createMenu('SLIDES & AUDIO')
          .addItem('#6 Generate Slides for Module', 'generateSlidesForSelectedModule')
          .addItem('#7 Set Voiceover Artist', 'setTtsVoice_')
          .addItem('#8 Generate All Audio for Module', 'generateAllAudioForModule'))
      .addSeparator()
      .addSubMenu(ui.createMenu('DATA & ARCHIVAL')
          .addItem('#9 Clean Module Audio Files', 'cleanModuleAudioFiles')
          .addItem('#10 Archive Course Project', 'archiveCourse'))
      .addSeparator()
      .addItem('⚙️ Configuration', 'validateAndShowConfiguration_')
      .addToUi();
}
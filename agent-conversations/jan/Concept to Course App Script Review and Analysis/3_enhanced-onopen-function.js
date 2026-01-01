/**
 * ENHANCED onOpen FUNCTION WITH INTEGRATED WIZARD
 * Replace your existing onOpen function with this enhanced version
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Validate system configuration
  const configValidation = validateSystemConfiguration_();
  const configIndicator = configValidation.valid ? '✓' : '⚙️';
  
  // Create enhanced menu system with wizard integration
  const mainMenu = ui.createMenu(`${configIndicator} Concept-to-Course`)
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
      .addSeparator();
  
  // Add guided workflow submenu
  mainMenu.addSubMenu(ui.createMenu('🧙‍♂️ GUIDED WORKFLOW')
          .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
          .addItem('📋 Check Course Progress', 'showCourseProgressSummary')
          .addItem('🔄 Resume Course Development', 'continueExistingCourseWizard_')
          .addSeparator()
          .addItem('📖 Refresh How-to-Use Tab', 'refreshHowToUseTab')
          .addItem('✨ Create How-to-Use Tab', 'createHowToUseTab_'));
  
  // Add utilities and diagnostics
  mainMenu.addSeparator()
      .addItem('🔧 System Diagnostics', 'runSystemDiagnostics')
      .addItem('📊 Usage Statistics', 'showUsageStatistics');
  
  // Add configuration menu if system not properly configured
  if (!configValidation.valid) {
    mainMenu.addSeparator()
        .addItem('⚙️ Configuration Help', 'showConfigurationHelp');
  }
  
  mainMenu.addToUi();
  
  // Auto-create How-to-Use tab if it doesn't exist
  ensureHowToUseTabExists_();
  
  // Show welcome message for new users
  showWelcomeMessageIfNeeded_();
}

// ==== SUPPORTING FUNCTIONS FOR ENHANCED MENU ====

function ensureHowToUseTabExists_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const howToSheet = ss.getSheetByName('How to Use');
    
    if (!howToSheet) {
      // Auto-create the How-to-Use tab
      createHowToUseTab_();
      trackProgress('System Setup', 1, 1, 'Auto-created How-to-Use tab');
    }
  } catch (error) {
    console.warn('Could not ensure How-to-Use tab exists:', error.message);
  }
}

function showWelcomeMessageIfNeeded_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const hasShownWelcome = props.getProperty('WELCOME_SHOWN');
    
    if (!hasShownWelcome) {
      // Show welcome message in a few seconds to allow sheet to load
      Utilities.sleep(2000);
      
      const ui = SpreadsheetApp.getUi();
      const configValidation = validateSystemConfiguration_();
      
      if (configValidation.valid) {
        ui.alert(
          'Welcome to Concept-to-Course!',
          'Your professional course creation tool is ready.\n\n' +
          '🚀 NEW USER? Start with the Course Creation Wizard\n' +
          '📖 NEED GUIDANCE? Check the "How to Use" tab\n' +
          '⚡ EXPERIENCED USER? Use the numbered menu items directly\n\n' +
          'Access everything from the Concept-to-Course menu above.',
          ui.ButtonSet.OK
        );
      } else {
        ui.alert(
          'Configuration Required',
          'Welcome to Concept-to-Course!\n\n' +
          configValidation.message + '\n\n' +
          'The system needs initial configuration before you can create courses.',
          ui.ButtonSet.OK
        );
      }
      
      // Mark welcome as shown
      props.setProperty('WELCOME_SHOWN', 'true');
    }
  } catch (error) {
    console.warn('Could not show welcome message:', error.message);
  }
}

function runSystemDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  const diagnostics = [];
  
  // Configuration check
  const configValidation = validateSystemConfiguration_();
  if (configValidation.valid) {
    diagnostics.push('✅ System configuration valid');
  } else {
    diagnostics.push('❌ Configuration issue: ' + configValidation.message);
  }
  
  // Sheets check
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = ['Mapping', 'How to Use'];
  
  requiredSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      diagnostics.push(`✅ ${sheetName} sheet exists`);
    } else {
      diagnostics.push(`⚠️ ${sheetName} sheet missing (can be created automatically)`);
    }
  });
  
  // API connectivity check
  try {
    CFG.validateConfiguration();
    // Test basic API call
    const testResult = callGemini('Hello', 50, 0.1);
    if (testResult) {
      diagnostics.push('✅ Gemini API connectivity confirmed');
    } else {
      diagnostics.push('⚠️ Gemini API returned empty response');
    }
  } catch (error) {
    diagnostics.push('❌ API connectivity issue: ' + error.message);
  }
  
  // Drive access check
  try {
    const folder = DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID);
    const folderName = folder.getName();
    diagnostics.push(`✅ Drive folder access confirmed: "${folderName}"`);
  } catch (error) {
    diagnostics.push('❌ Drive folder access error: ' + error.message);
  }
  
  // Slides template check
  try {
    const template = DriveApp.getFileById(CFG.SLIDES_TEMPLATE_ID);
    const templateName = template.getName();
    diagnostics.push(`✅ Slides template access confirmed: "${templateName}"`);
  } catch (error) {
    diagnostics.push('❌ Slides template access error: ' + error.message);
  }
  
  // Function availability check
  const criticalFunctions = [
    'generateCourseRecommendation',
    'createCourseContentTabs',
    'generateFullSuiteOfResources',
    'launchCourseCreationWizard'
  ];
  
  let functionsAvailable = 0;
  criticalFunctions.forEach(funcName => {
    try {
      if (typeof eval(funcName) === 'function') {
        functionsAvailable++;
      }
    } catch (e) {
      // Function not available
    }
  });
  
  diagnostics.push(`✅ Critical functions available: ${functionsAvailable}/${criticalFunctions.length}`);
  
  // Display results
  const results = diagnostics.join('\n');
  const hasErrors = diagnostics.some(d => d.includes('❌'));
  
  const title = hasErrors ? '🚨 System Diagnostics - Issues Found' : '✅ System Diagnostics - All Good';
  
  ui.alert(
    title,
    results + '\n\n' +
    'Legend:\n' +
    '✅ Working correctly\n' +
    '⚠️ Minor issue or missing non-critical component\n' +
    '❌ Requires immediate attention\n\n' +
    (hasErrors ? 'Contact Carla for assistance with ❌ items.' : 'Your system is ready for professional course creation!'),
    ui.ButtonSet.OK
  );
  
  // Log diagnostics
  trackProgress('System Diagnostics', functionsAvailable, criticalFunctions.length, 
                `${diagnostics.filter(d => d.includes('✅')).length} checks passed, ${diagnostics.filter(d => d.includes('❌')).length} errors found`);
}

function showUsageStatistics() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const props = PropertiesService.getScriptProperties();
    const today = new Date().toDateString();
    
    // Get usage statistics
    const geminiUsage = parseInt(props.getProperty(`gemini_tokens_${today}`) || '0');
    const batchSize = CFG.getBatchSize();
    
    // Count courses in development
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = ss.getSheetByName('Mapping');
    let coursesCount = 0;
    
    if (mappingSheet) {
      const lastRow = mappingSheet.getLastRow();
      for (let row = 2; row <= lastRow; row++) {
        const concept = mappingSheet.getRange(row, 1).getValue();
        if (concept && String(concept).trim()) {
          coursesCount++;
        }
      }
    }
    
    // Count modules across all courses
    let modulesCount = 0;
    const sheets = ss.getSheets();
    sheets.forEach(sheet => {
      if (sheet.getName().startsWith('Module-Resources-')) {
        const moduleRows = Math.max(0, sheet.getLastRow() - 1);
        modulesCount += moduleRows;
      }
    });
    
    const statistics = [
      `📊 USAGE STATISTICS`,
      ``,
      `Today's API Usage: ${geminiUsage.toLocaleString()} tokens`,
      `Batch Processing Size: ${batchSize} modules`,
      ``,
      `📚 CONTENT STATISTICS`,
      ``,
      `Courses in Development: ${coursesCount}`,
      `Total Modules Created: ${modulesCount}`,
      ``,
      `⚙️ SYSTEM CONFIGURATION`,
      ``,
      `Batch Size: ${batchSize} modules per batch`,
      `System Status: ${validateSystemConfiguration_().valid ? 'Operational' : 'Needs Configuration'}`,
      ``
    ].join('\n');
    
    ui.alert('Usage Statistics', statistics, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      'Statistics Error',
      `Could not retrieve usage statistics.\n\nError: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

function showConfigurationHelp() {
  const ui = SpreadsheetApp.getUi();
  
  const configValidation = validateSystemConfiguration_();
  
  ui.alert(
    'Configuration Help',
    'Your Concept-to-Course tool requires initial setup by the administrator.\n\n' +
    'CURRENT STATUS:\n' + configValidation.message + '\n\n' +
    'WHAT TO DO:\n' +
    '1. Contact Carla for system configuration\n' +
    '2. Do not attempt to configure the system yourself\n' +
    '3. Focus on preparing your course materials while waiting\n\n' +
    'WHAT YOU CAN PREPARE:\n' +
    '• Course concept and objectives\n' +
    '• Source materials and research\n' +
    '• Target audience definition\n' +
    '• Learning outcomes and goals\n\n' +
    'Once configured, you\'ll have access to the full course creation workflow.',
    ui.ButtonSet.OK
  );
}
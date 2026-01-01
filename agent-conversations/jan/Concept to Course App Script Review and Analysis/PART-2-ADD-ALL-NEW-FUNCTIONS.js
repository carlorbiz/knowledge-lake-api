/**
 * PART 2: ALL NEW FUNCTIONS TO ADD - PASTE AT END OF YOUR SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Scroll to the very END of your Google Apps Script file
 * 2. COPY everything below this comment block
 * 3. PASTE it after all your existing functions
 * 4. These are ALL NEW functions - they don't replace anything existing
 */

// ===============================
// CORRECTED FUNCTION NAMES (New - don't replace existing)
// ===============================

/**
 * Navigate to sheet (wizard-specific version to avoid conflicts)
 */
function wizardNavigateToSheet_(sheetName) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Creating missing sheet: ${sheetName}`);
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    spreadsheet.setActiveSheet(sheet);
    return sheet;
  } catch (error) {
    Logger.log(`Error navigating to sheet ${sheetName}: ${error.toString()}`);
    throw new Error(`Failed to navigate to sheet ${sheetName}: ${error.message}`);
  }
}

/**
 * Ensure correct row (wizard-specific version to avoid conflicts)
 */
function wizardEnsureCorrectRow_(sheet, concept) {
  try {
    const dataRange = sheet.getDataRange();
    if (dataRange.getNumRows() === 0) {
      return 1; // First row for empty sheet
    }
    
    const values = dataRange.getValues();
    
    // Look for existing concept row
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().toLowerCase() === concept.toLowerCase()) {
        return i + 1; // Convert to 1-based indexing
      }
    }
    
    // If not found, return next available row
    return values.length + 1;
  } catch (error) {
    Logger.log(`Error ensuring correct row for concept ${concept}: ${error.toString()}`);
    return 1; // Default to first row
  }
}

// ===============================
// MISSING HELPER FUNCTIONS (New)
// ===============================

/**
 * Get active module information from current context
 */
function getActiveModuleInfo_() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Parse concept from sheet name (Module-Resources-{Concept} format)
    const conceptMatch = sheetName.match(/Module-Resources-(.+)/);
    if (conceptMatch) {
      return {
        concept: conceptMatch[1],
        sheetName: sheetName,
        sheet: sheet,
        type: 'module'
      };
    }
    
    // Parse from TTS sheet name
    const ttsMatch = sheetName.match(/TTS-(.+)/);
    if (ttsMatch) {
      return {
        concept: ttsMatch[1], 
        sheetName: sheetName,
        sheet: sheet,
        type: 'tts'
      };
    }
    
    // Check if on Mapping sheet
    if (sheetName === 'Mapping') {
      const activeRow = sheet.getActiveCell().getRow();
      if (activeRow > 1) {
        const concept = sheet.getRange(activeRow, 1).getValue();
        return {
          concept: concept,
          sheetName: sheetName,
          sheet: sheet,
          type: 'mapping',
          row: activeRow
        };
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error getting active module info: ' + error.toString());
    return null;
  }
}

/**
 * Track wizard progress with enhanced status updates
 */
function trackWizardProgress_(step, status, details = '') {
  try {
    const statusSheet = ensureStatusSheet_();
    const timestamp = new Date().toISOString();
    
    // Find or create progress row
    const dataRange = statusSheet.getDataRange();
    let progressRow = -1;
    
    if (dataRange.getNumRows() > 1) {
      const values = dataRange.getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === 'Wizard Progress') {
          progressRow = i + 1;
          break;
        }
      }
    }
    
    if (progressRow === -1) {
      progressRow = statusSheet.getLastRow() + 1;
      statusSheet.getRange(progressRow, 1).setValue('Wizard Progress');
    }
    
    // Update progress information
    statusSheet.getRange(progressRow, 2).setValue(step);
    statusSheet.getRange(progressRow, 3).setValue(status);
    statusSheet.getRange(progressRow, 4).setValue(timestamp);
    statusSheet.getRange(progressRow, 5).setValue(details);
    
    Logger.log(`Wizard progress tracked: ${step} - ${status}`);
    
  } catch (error) {
    Logger.log('Error tracking wizard progress: ' + error.toString());
  }
}

/**
 * Validate system configuration with comprehensive checks
 */
function validateSystemConfiguration_(showResults = true) {
  const results = {
    isValid: true,
    issues: [],
    warnings: [],
    info: []
  };
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    
    // Check for required sheets
    const requiredSheets = ['Mapping'];
    requiredSheets.forEach(sheetName => {
      if (!spreadsheet.getSheetByName(sheetName)) {
        results.issues.push(`Missing required sheet: ${sheetName}`);
        results.isValid = false;
      }
    });
    
    // Check Properties Service for API configuration
    const properties = PropertiesService.getScriptProperties();
    const geminiApiKey = properties.getProperty('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      results.warnings.push('Gemini API key not configured');
    } else if (geminiApiKey.length < 20) {
      results.warnings.push('Gemini API key appears invalid (too short)');
    } else {
      results.info.push('Gemini API key configured');
    }
    
    // Check Drive folder configuration
    const projectFolderId = properties.getProperty('PROJECT_FOLDER_ID');
    if (!projectFolderId) {
      results.warnings.push('Project folder not configured');
    } else {
      try {
        DriveApp.getFolderById(projectFolderId);
        results.info.push('Project folder accessible');
      } catch (error) {
        results.issues.push('Project folder not accessible');
        results.isValid = false;
      }
    }
    
    // Check Mapping sheet structure
    const mappingSheet = spreadsheet.getSheetByName('Mapping');
    if (mappingSheet) {
      const headers = mappingSheet.getRange(1, 1, 1, 20).getValues()[0];
      const expectedHeaders = ['Concept', 'Sources', 'Audience'];
      
      expectedHeaders.forEach((header, index) => {
        if (!headers[index] || headers[index] !== header) {
          results.warnings.push(`Mapping sheet header mismatch at column ${index + 1}: expected "${header}"`);
        }
      });
    }
    
    // Show results if requested
    if (showResults) {
      let message = '🔧 System Configuration Validation\n\n';
      
      if (results.issues.length > 0) {
        message += '❌ Issues Found:\n';
        results.issues.forEach(issue => message += `• ${issue}\n`);
        message += '\n';
      }
      
      if (results.warnings.length > 0) {
        message += '⚠️ Warnings:\n';
        results.warnings.forEach(warning => message += `• ${warning}\n`);
        message += '\n';
      }
      
      if (results.info.length > 0) {
        message += '✅ Configuration OK:\n';
        results.info.forEach(info => message += `• ${info}\n`);
      }
      
      if (results.isValid && results.warnings.length === 0) {
        message += '\n🎉 System fully configured and ready!';
      }
      
      ui.alert('System Validation Results', message, ui.AlertResponse.OK);
    }
    
  } catch (error) {
    Logger.log('Error in system validation: ' + error.toString());
    results.issues.push(`Validation error: ${error.message}`);
    results.isValid = false;
  }
  
  return results;
}

/**
 * Ensure status sheet exists for progress tracking
 */
function ensureStatusSheet_() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let statusSheet = spreadsheet.getSheetByName('System Status');
    
    if (!statusSheet) {
      statusSheet = spreadsheet.insertSheet('System Status');
      
      // Set up headers
      const headers = [
        'Component', 'Current Step', 'Status', 'Timestamp', 'Details'
      ];
      statusSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      statusSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      statusSheet.setFrozenRows(1);
      
      Logger.log('Created System Status sheet');
    }
    
    return statusSheet;
  } catch (error) {
    Logger.log('Error ensuring status sheet: ' + error.toString());
    throw new Error('Failed to create or access status sheet');
  }
}

// ===============================
// ENHANCED ERROR RECOVERY (New)
// ===============================

/**
 * Enhanced error recovery wrapper with contextual error handling
 */
function withErrorRecovery_(operation, context = '', fallbackAction = null) {
  try {
    return operation();
  } catch (error) {
    Logger.log(`Error in ${context}: ${error.toString()}`);
    
    // Track error in status sheet
    try {
      trackWizardProgress_(`Error in ${context}`, 'Failed', error.message);
    } catch (trackingError) {
      Logger.log('Failed to track error: ' + trackingError.toString());
    }
    
    // Show user-friendly error message
    const ui = SpreadsheetApp.getUi();
    let message = `An error occurred in ${context}:\n\n${error.message}`;
    
    if (fallbackAction) {
      message += '\n\nAttempting automatic recovery...';
      ui.alert('Error with Recovery', message, ui.AlertResponse.OK);
      
      try {
        return fallbackAction();
      } catch (fallbackError) {
        Logger.log(`Fallback action failed: ${fallbackError.toString()}`);
        ui.alert('Recovery Failed', 
          'Automatic recovery was unsuccessful. Please check the logs and try again.', 
          ui.AlertResponse.OK);
        throw fallbackError;
      }
    } else {
      message += '\n\nPlease check the logs and try again.';
      ui.alert('Operation Error', message, ui.AlertResponse.OK);
      throw error;
    }
  }
}

// ===============================
// WELCOME AND HELP SYSTEM (New)
// ===============================

/**
 * Check if user has seen welcome message
 */
function hasUserSeenWelcome_() {
  const properties = PropertiesService.getDocumentProperties();
  return properties.getProperty('WELCOME_SHOWN') === 'true';
}

/**
 * Mark that user has seen welcome message
 */
function markUserSeenWelcome_() {
  const properties = PropertiesService.getDocumentProperties();
  properties.setProperty('WELCOME_SHOWN', 'true');
}

/**
 * Show welcome dialog for first-time users
 */
function showWelcomeDialog_() {
  const ui = SpreadsheetApp.getUi();
  
  const message = `🎓 Welcome to Concept-to-Course Enhanced!

This enhanced version provides:
• 🚀 Setup Wizard for easy configuration
• 📖 Visual How-to-Use guide
• 🎯 Guided Course Creation Wizard
• 📊 System diagnostics and validation

To get started:
1. Run the Setup Wizard to configure your API keys
2. Create a How-to-Use guide for reference
3. Use the Course Creation Wizard for guided workflow

Need help? Use the Help & Support option from the menu.`;

  ui.alert('Welcome to Enhanced Concept-to-Course', message, ui.AlertResponse.OK);
}

/**
 * Show help and support information
 */
function showHelpDialog_() {
  const ui = SpreadsheetApp.getUi();
  
  const message = `🎓 Concept-to-Course Help & Support

📋 QUICK START:
1. Setup Wizard → Configure API keys and folders
2. How-to-Use Guide → Visual instructions in new sheet
3. Course Creation Wizard → Guided 10-step workflow

🔧 TROUBLESHOOTING:
• System Diagnostics → Check configuration issues
• Validate Configuration → Verify all settings
• System Status sheet → Track progress and errors

📖 WORKFLOW STEPS:
The 10-step process guides you from concept to complete course:
Setup → Recommendation → Workspace → Content → LMS → Slides → Voice → Audio → Maintenance → Archive

⚡ ADVANCED FEATURES:
• Automatic error recovery
• Progress tracking
• Drive folder organisation
• Gemini AI integration

Need additional support? Check the logs (Extensions → Apps Script → View Logs)`;

  ui.alert('Help & Support', message, ui.AlertResponse.OK);
}

// ===============================
// SYSTEM DIAGNOSTICS (New)
// ===============================

/**
 * Run comprehensive system diagnostics
 */
function runSystemDiagnostics_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    let report = '🔧 SYSTEM DIAGNOSTICS REPORT\n\n';
    
    // Check spreadsheet structure
    report += '📊 SPREADSHEET STRUCTURE:\n';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    report += `• Total sheets: ${sheets.length}\n`;
    
    const sheetNames = sheets.map(sheet => sheet.getName());
    report += `• Sheet names: ${sheetNames.join(', ')}\n`;
    
    // Check for required sheets
    const requiredSheets = ['Mapping'];
    const missingSheets = requiredSheets.filter(name => !sheetNames.includes(name));
    if (missingSheets.length > 0) {
      report += `• ❌ Missing sheets: ${missingSheets.join(', ')}\n`;
    } else {
      report += `• ✅ All required sheets present\n`;
    }
    
    // Check Properties Service
    report += '\n🔑 CONFIGURATION:\n';
    const properties = PropertiesService.getScriptProperties();
    const keys = properties.getKeys();
    report += `• Configured properties: ${keys.length}\n`;
    
    if (keys.includes('GEMINI_API_KEY')) {
      const keyLength = properties.getProperty('GEMINI_API_KEY').length;
      report += `• ✅ Gemini API key: ${keyLength} characters\n`;
    } else {
      report += `• ❌ Gemini API key: Not configured\n`;
    }
    
    if (keys.includes('PROJECT_FOLDER_ID')) {
      report += `• ✅ Project folder: Configured\n`;
    } else {
      report += `• ❌ Project folder: Not configured\n`;
    }
    
    // Check Drive permissions
    report += '\n📁 DRIVE ACCESS:\n';
    try {
      const rootFolder = DriveApp.getRootFolder();
      report += `• ✅ Drive access: Available\n`;
      
      if (keys.includes('PROJECT_FOLDER_ID')) {
        const folderId = properties.getProperty('PROJECT_FOLDER_ID');
        try {
          const folder = DriveApp.getFolderById(folderId);
          report += `• ✅ Project folder: Accessible (${folder.getName()})\n`;
        } catch (error) {
          report += `• ❌ Project folder: Not accessible\n`;
        }
      }
    } catch (error) {
      report += `• ❌ Drive access: Limited or unavailable\n`;
    }
    
    // Check function availability
    report += '\n⚙️ FUNCTION AVAILABILITY:\n';
    const criticalFunctions = [
      'launchSetupWizard',
      'createHowToUseTab_',
      'launchCourseCreationWizard',
      'validateSystemConfiguration_'
    ];
    
    criticalFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          report += `• ✅ ${funcName}: Available\n`;
        } else {
          report += `• ❌ ${funcName}: Not available\n`;
        }
      } catch (error) {
        report += `• ❌ ${funcName}: Error checking availability\n`;
      }
    });
    
    report += '\n📝 RECOMMENDATIONS:\n';
    if (missingSheets.length > 0) {
      report += '• Run Setup Wizard to create missing sheets\n';
    }
    if (!keys.includes('GEMINI_API_KEY')) {
      report += '• Configure Gemini API key in Setup Wizard\n';
    }
    if (!keys.includes('PROJECT_FOLDER_ID')) {
      report += '• Set up project folder in Setup Wizard\n';
    }
    
    // Show report
    ui.alert('System Diagnostics Complete', report, ui.AlertResponse.OK);
    
    // Log detailed report
    Logger.log('System Diagnostics Report:\n' + report);
    
  } catch (error) {
    Logger.log('Error running system diagnostics: ' + error.toString());
    ui.alert('Diagnostics Error', 
      'Unable to complete system diagnostics. Please check the logs.', 
      ui.AlertResponse.OK);
  }
}

/**
 * DEPLOYMENT VALIDATION FUNCTION
 * Run this after copying all functions to verify integration
 */
function validateDeployment_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    let message = '✅ DEPLOYMENT VALIDATION\n\n';
    
    // Check all required functions exist
    const requiredFunctions = [
      'onOpen',
      'wizardNavigateToSheet_',
      'wizardEnsureCorrectRow_',
      'getActiveModuleInfo_',
      'trackWizardProgress_',
      'validateSystemConfiguration_',
      'ensureStatusSheet_',
      'withErrorRecovery_',
      'runSystemDiagnostics_'
    ];
    
    let allFunctionsPresent = true;
    requiredFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          message += `✅ ${funcName}\n`;
        } else {
          message += `❌ ${funcName} - Missing\n`;
          allFunctionsPresent = false;
        }
      } catch (error) {
        message += `❌ ${funcName} - Error\n`;
        allFunctionsPresent = false;
      }
    });
    
    if (allFunctionsPresent) {
      message += '\n🎉 All functions successfully deployed!';
      message += '\n\nNext steps:';
      message += '\n1. Test the enhanced menu (refresh spreadsheet)';
      message += '\n2. Run Setup Wizard';
      message += '\n3. Create How-to-Use guide';
      message += '\n4. Test Course Creation Wizard';
    } else {
      message += '\n⚠️ Some functions are missing. Please copy all functions from the integration file.';
    }
    
    ui.alert('Deployment Validation', message, ui.AlertResponse.OK);
    
  } catch (error) {
    ui.alert('Validation Error', 
      'Unable to validate deployment: ' + error.message, 
      ui.AlertResponse.OK);
  }
}
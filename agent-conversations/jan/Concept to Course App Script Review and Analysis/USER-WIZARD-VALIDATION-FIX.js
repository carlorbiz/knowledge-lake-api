/**
 * USER-FRIENDLY COURSE CREATION WIZARD FIX
 * 
 * PROBLEM: Course Creation Wizard shows admin setup prompts to end users
 * SOLUTION: Replace with user-friendly validation that guides without setup access
 * 
 * INSTRUCTIONS:
 * Replace your existing launchCourseCreationWizard function with this version
 */

function launchCourseCreationWizard() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // USER-FRIENDLY validation - check if system is ready without admin prompts
    const systemReady = checkUserSystemReady_();
    
    if (!systemReady.isReady) {
      // Show user-friendly message without setup wizard prompt
      ui.alert(
        'System Not Ready',
        systemReady.message + '\n\n' +
        'Please contact your administrator to complete the system configuration.\n\n' +
        'Required configuration:\n' +
        '• API keys for AI content generation\n' +
        '• Project folder for course materials',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Welcome and course selection - only show if system is ready
    const wizardChoice = ui.alert(
      'Course Creation Wizard',
      'Welcome to guided course development!\n\n' +
      'This wizard will walk you through creating professional healthcare education courses from concept to completion.\n\n' +
      'Choose your path:\n' +
      'YES = Start a new course from scratch\n' +
      'NO = Continue working on an existing course\n' +
      'CANCEL = Exit wizard',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (wizardChoice === ui.Button.CANCEL) return;
    
    // Track progress (only if tracking function exists)
    if (typeof trackWizardProgress_ === 'function') {
      trackWizardProgress_('Course Creation Wizard', 'Started', 
        wizardChoice === ui.Button.YES ? 'New course' : 'Existing course');
    }
    
    if (wizardChoice === ui.Button.YES) {
      startNewCourseWizard_();
    } else {
      continueExistingCourseWizard_();
    }
    
  } catch (error) {
    Logger.log('Course Creation Wizard error: ' + error.toString());
    ui.alert(
      'Wizard Error',
      'There was an issue starting the Course Creation Wizard.\n\n' +
      'Please try again or contact your administrator if the problem persists.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Check if system is ready for user course creation (no admin setup prompts)
 */
function checkUserSystemReady_() {
  try {
    // Check basic requirements without throwing errors
    const properties = PropertiesService.getScriptProperties();
    const geminiKey = properties.getProperty('GEMINI_API_KEY');
    const driveFolder = properties.getProperty('DRIVE_FOLDER_ID') || properties.getProperty('PROJECT_FOLDER_ID');
    
    const issues = [];
    
    // Check Gemini API key
    if (!geminiKey) {
      issues.push('AI content generation is not configured');
    } else if (geminiKey.length < 20) {
      issues.push('AI configuration appears incomplete');
    }
    
    // Check Drive folder
    if (!driveFolder) {
      issues.push('Project folder is not configured');
    } else {
      // Test folder access safely
      try {
        DriveApp.getFolderById(driveFolder);
      } catch (error) {
        issues.push('Project folder is not accessible');
      }
    }
    
    // Check basic sheet structure
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet.getSheetByName('Mapping')) {
      issues.push('Mapping worksheet is missing');
    }
    
    if (issues.length === 0) {
      return {
        isReady: true,
        message: 'System ready for course creation'
      };
    } else {
      return {
        isReady: false,
        message: 'The following system components need configuration:\n\n• ' + issues.join('\n• ')
      };
    }
    
  } catch (error) {
    Logger.log('Error checking system readiness: ' + error.toString());
    return {
      isReady: false,
      message: 'Unable to verify system configuration. Please contact your administrator.'
    };
  }
}

/**
 * Enhanced validateSystemConfiguration_ that doesn't prompt for setup
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
    const projectFolderId = properties.getProperty('PROJECT_FOLDER_ID') || properties.getProperty('DRIVE_FOLDER_ID');
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
    
    // Show results if requested (for admin diagnostics)
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
      } else if (results.warnings.length > 0 && results.issues.length === 0) {
        message += '\n⚠️ System functional but has configuration warnings.';
      } else {
        message += '\n❌ System requires administrator attention.';
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
 * Enhanced runSystemDiagnostics_ that's user-friendly
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
      report += `• ⚠️ Missing sheets: ${missingSheets.join(', ')}\n`;
    } else {
      report += `• ✅ All required sheets present\n`;
    }
    
    // Check Properties Service (without exposing sensitive info)
    report += '\n🔑 CONFIGURATION:\n';
    const properties = PropertiesService.getScriptProperties();
    const keys = properties.getKeys();
    
    if (keys.includes('GEMINI_API_KEY')) {
      const keyLength = properties.getProperty('GEMINI_API_KEY').length;
      report += `• ✅ AI content generation: Configured (${keyLength} chars)\n`;
    } else {
      report += `• ❌ AI content generation: Not configured\n`;
    }
    
    if (keys.includes('PROJECT_FOLDER_ID') || keys.includes('DRIVE_FOLDER_ID')) {
      report += `• ✅ Project folder: Configured\n`;
    } else {
      report += `• ❌ Project folder: Not configured\n`;
    }
    
    // Check Drive permissions (safely)
    report += '\n📁 DRIVE ACCESS:\n';
    try {
      const rootFolder = DriveApp.getRootFolder();
      report += `• ✅ Drive access: Available\n`;
      
      const folderId = properties.getProperty('PROJECT_FOLDER_ID') || properties.getProperty('DRIVE_FOLDER_ID');
      if (folderId) {
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
    
    // Check function availability (core functions only)
    report += '\n⚙️ CORE FUNCTIONALITY:\n';
    const coreFunctions = [
      'createHowToUseTab_',
      'launchCourseCreationWizard',
      'step1Setup',
      'step2Recommendation'
    ];
    
    coreFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          report += `• ✅ ${funcName}: Available\n`;
        } else {
          report += `• ❌ ${funcName}: Not available\n`;
        }
      } catch (error) {
        report += `• ❌ ${funcName}: Error checking\n`;
      }
    });
    
    report += '\n📝 RECOMMENDATIONS:\n';
    if (missingSheets.length > 0) {
      report += '• Contact administrator to create missing sheets\n';
    }
    if (!keys.includes('GEMINI_API_KEY')) {
      report += '• Contact administrator to configure AI content generation\n';
    }
    if (!keys.includes('PROJECT_FOLDER_ID') && !keys.includes('DRIVE_FOLDER_ID')) {
      report += '• Contact administrator to set up project folder\n';
    }
    if (keys.includes('GEMINI_API_KEY') && (keys.includes('PROJECT_FOLDER_ID') || keys.includes('DRIVE_FOLDER_ID')) && missingSheets.length === 0) {
      report += '• ✅ System appears ready for course creation!\n';
    }
    
    // Show report
    ui.alert('System Diagnostics Complete', report, ui.AlertResponse.OK);
    
    // Log detailed report
    Logger.log('System Diagnostics Report:\n' + report);
    
  } catch (error) {
    Logger.log('Error running system diagnostics: ' + error.toString());
    ui.alert('Diagnostics Error', 
      'Unable to complete system diagnostics. Please contact your administrator.', 
      ui.AlertResponse.OK);
  }
}
/**
 * CRITICAL FIX: Mapping Sheet Workflow Correction
 * 
 * PROBLEM: System treats missing Mapping sheet as configuration error
 * REALITY: Users should create Mapping sheet as part of course creation workflow
 * 
 * SOLUTION: Update validation to allow missing Mapping sheet, let Course Creation Wizard handle it
 */

/**
 * CORRECTED: Check if system is ready for user course creation
 * - Allow missing Mapping sheet (user creates during workflow)
 * - Only check admin-configured components (API keys, folders)
 */
function checkUserSystemReady_() {
  try {
    // Check basic requirements without throwing errors
    const properties = PropertiesService.getScriptProperties();
    const geminiKey = properties.getProperty('GEMINI_API_KEY');
    const driveFolder = properties.getProperty('DRIVE_FOLDER_ID') || properties.getProperty('PROJECT_FOLDER_ID');
    
    const issues = [];
    
    // Check Gemini API key (admin-configured)
    if (!geminiKey) {
      issues.push('AI content generation is not configured');
    } else if (geminiKey.length < 20) {
      issues.push('AI configuration appears incomplete');
    }
    
    // Check Drive folder (admin-configured)
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
    
    // DO NOT CHECK MAPPING SHEET - users create this during course workflow
    // const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    // if (!spreadsheet.getSheetByName('Mapping')) {
    //   issues.push('Mapping worksheet is missing');  // REMOVED - this is user workflow
    // }
    
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
 * CORRECTED: Enhanced validateSystemConfiguration_ 
 * - Mapping sheet is optional (user workflow dependency)
 * - Only validate admin-configured components
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
    
    // DO NOT require Mapping sheet - it's part of user workflow
    // Check for other required sheets if any (but not Mapping)
    // const requiredSheets = ['Mapping'];  // REMOVED - user creates this
    // requiredSheets.forEach(sheetName => {
    //   if (!spreadsheet.getSheetByName(sheetName)) {
    //     results.issues.push(`Missing required sheet: ${sheetName}`);
    //     results.isValid = false;
    //   }
    // });
    
    // Check Properties Service for API configuration (admin-configured)
    const properties = PropertiesService.getScriptProperties();
    const geminiApiKey = properties.getProperty('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      results.warnings.push('Gemini API key not configured');
    } else if (geminiApiKey.length < 20) {
      results.warnings.push('Gemini API key appears invalid (too short)');
    } else {
      results.info.push('Gemini API key configured');
    }
    
    // Check Drive folder configuration (admin-configured)
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
    
    // Check Mapping sheet structure IF IT EXISTS (but don't require it)
    const mappingSheet = spreadsheet.getSheetByName('Mapping');
    if (mappingSheet) {
      results.info.push('Mapping sheet exists (user workflow)');
      
      const headers = mappingSheet.getRange(1, 1, 1, 20).getValues()[0];
      const expectedHeaders = ['Concept', 'Sources', 'Audience'];
      
      expectedHeaders.forEach((header, index) => {
        if (!headers[index] || headers[index] !== header) {
          results.warnings.push(`Mapping sheet header mismatch at column ${index + 1}: expected "${header}"`);
        }
      });
    } else {
      results.info.push('Mapping sheet not yet created (normal for new projects)');
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
        message += '✅ Configuration Status:\n';
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
 * CORRECTED: Enhanced runSystemDiagnostics_
 * - Treats missing Mapping sheet as normal, not an error
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
    
    // Check for Mapping sheet (but don't treat as error if missing)
    if (sheetNames.includes('Mapping')) {
      report += `• ✅ Mapping sheet: Present (course project active)\n`;
    } else {
      report += `• ℹ️ Mapping sheet: Not yet created (normal for new projects)\n`;
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
    
    report += '\n📝 STATUS:\n';
    if (!keys.includes('GEMINI_API_KEY') || (!keys.includes('PROJECT_FOLDER_ID') && !keys.includes('DRIVE_FOLDER_ID'))) {
      report += '• ⚠️ Contact administrator to complete system configuration\n';
    } else {
      report += '• ✅ System ready for course creation!\n';
      if (!sheetNames.includes('Mapping')) {
        report += '• ℹ️ Ready to start new course project (Mapping sheet will be created during workflow)\n';
      }
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

/**
 * WHAT THIS FIXES:
 * 
 * BEFORE (Incorrect):
 * - Missing Mapping sheet = "System Not Ready" 
 * - User told to contact administrator
 * - Course creation blocked
 * 
 * AFTER (Correct):
 * - Missing Mapping sheet = Normal state for new projects
 * - Course Creation Wizard handles Mapping sheet creation
 * - User workflow proceeds normally
 * 
 * ONLY admin-configured components (API keys, Drive folders) block course creation
 */
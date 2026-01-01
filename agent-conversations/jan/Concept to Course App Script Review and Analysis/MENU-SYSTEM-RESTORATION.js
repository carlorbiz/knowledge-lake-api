/**
 * MENU SYSTEM RESTORATION FIX
 * 
 * This file restores the complete menu system for the Concept-to-Course tool.
 * The original workflow functions (step1Setup through step10Archive) are the core
 * functionality that users need for course creation and must be included in the menu.
 * 
 * Problem: The menu was corrupted by removing the original 10-step workflow functions
 * Solution: Restore complete menu with both Course Creation Wizard and original workflow
 * 
 * Author: Assistant for Carla Taylor
 * Date: 2025-09-14
 */

/**
 * CORRECTED onOpen FUNCTION
 * 
 * This function creates the complete menu structure that users need:
 * 1. Course Creation Wizard (guided workflow)
 * 2. Original 10-step workflow functions (step1Setup through step10Archive)
 * 3. System diagnostics and help functions
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // Create the main menu with all essential functions
  var menu = ui.createMenu('🎓 Concept-to-Course Tool')
    
    // COURSE CREATION WIZARD (Guided Workflow)
    .addItem('🚀 Launch Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // ORIGINAL 10-STEP WORKFLOW (Core Functions)
    .addSubMenu(ui.createMenu('📋 10-Step Workflow')
      .addItem('Step 1: Setup Course Project', 'step1Setup')
      .addItem('Step 2: Get AI Recommendations', 'step2Recommendation') 
      .addItem('Step 3: Create Workspace Structure', 'step3Workspace')
      .addItem('Step 4: Generate Course Content', 'step4Content')
      .addItem('Step 5: Create LMS Materials', 'step5LMS')
      .addItem('Step 6: Generate Presentation Slides', 'step6Slides')
      .addItem('Step 7: Add Voice Narration', 'step7Voice')
      .addItem('Step 8: Process Audio Files', 'step8Audio')
      .addItem('Step 9: Course Maintenance', 'step9Maintenance')
      .addItem('Step 10: Archive Project', 'step10Archive'))
    .addSeparator()
    
    // SYSTEM FUNCTIONS
    .addSubMenu(ui.createMenu('⚙️ System Tools')
      .addItem('📊 Run System Diagnostics', 'runSystemDiagnostics')
      .addItem('🔧 Check System Status', 'checkSystemStatus')
      .addItem('📁 Organise Drive Folders', 'organiseFolders'))
    .addSeparator()
    
    // HELP AND GUIDANCE
    .addItem('📖 How to Use This Tool', 'showHowToUse')
    .addItem('🆘 Get Help & Support', 'showHelp');
  
  menu.installMenu();
}

/**
 * SYSTEM STATUS CHECK FUNCTION
 * 
 * Provides users with system readiness information without admin setup access
 */
function checkSystemStatus() {
  try {
    var statusInfo = checkUserSystemReady_();
    
    if (statusInfo.ready) {
      SpreadsheetApp.getUi().alert(
        '✅ System Status: Ready',
        'Your Concept-to-Course system is properly configured and ready to use.\n\n' +
        'You can:\n' +
        '• Use the Course Creation Wizard for guided workflow\n' +
        '• Access individual workflow steps (Step 1-10)\n' +
        '• Create new course projects\n\n' +
        'Get started by selecting "Launch Course Creation Wizard" or "Step 1: Setup Course Project".',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '⚠️ System Status: Configuration Needed',
        statusInfo.message + '\n\n' +
        'Please contact your system administrator to complete the initial setup.\n\n' +
        'Required configuration:\n' +
        '• API keys and credentials\n' +
        '• System settings and preferences\n' +
        '• Drive folder permissions',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    Logger.log('Error in checkSystemStatus: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Error',
      'Unable to check system status. Please contact your administrator.\n\nError: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * UPDATED HOW TO USE FUNCTION
 * 
 * Creates comprehensive user guide including original workflow functions
 */
function showHowToUse() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var existingSheet = spreadsheet.getSheetByName('How-to-Use');
    
    if (existingSheet) {
      existingSheet.clear();
    } else {
      existingSheet = spreadsheet.insertSheet('How-to-Use');
    }
    
    // Enhanced content including original workflow functions
    var content = [
      ['🎓 Concept-to-Course Tool - User Guide', '', '', ''],
      ['', '', '', ''],
      ['GETTING STARTED', '', '', ''],
      ['', '', '', ''],
      ['1. CHOOSE YOUR WORKFLOW METHOD', '', '', ''],
      ['', '', '', ''],
      ['Option A: Course Creation Wizard (Recommended for new users)', '', '', ''],
      ['• Click "Launch Course Creation Wizard" from the menu', '', '', ''],
      ['• Follow the guided steps for streamlined course creation', '', '', ''],
      ['• System will guide you through each phase automatically', '', '', ''],
      ['', '', '', ''],
      ['Option B: Manual 10-Step Workflow (For experienced users)', '', '', ''],
      ['• Use individual step functions from "10-Step Workflow" submenu', '', '', ''],
      ['• Start with "Step 1: Setup Course Project"', '', '', ''],
      ['• Progress through each step as needed', '', '', ''],
      ['• Full control over timing and customisation', '', '', ''],
      ['', '', '', ''],
      ['2. ORIGINAL WORKFLOW FUNCTIONS', '', '', ''],
      ['', '', '', ''],
      ['Step 1: Setup Course Project', 'Initialise new course, create Mapping sheet, set basic parameters', '', ''],
      ['Step 2: Get AI Recommendations', 'Generate course structure suggestions using AI analysis', '', ''],
      ['Step 3: Create Workspace Structure', 'Set up Drive folders and file organisation', '', ''],
      ['Step 4: Generate Course Content', 'Create learning materials using AI-powered generation', '', ''],
      ['Step 5: Create LMS Materials', 'Prepare content for Learning Management System upload', '', ''],
      ['Step 6: Generate Presentation Slides', 'Create PowerPoint presentations and visual materials', '', ''],
      ['Step 7: Add Voice Narration', 'Generate text-to-speech audio for course content', '', ''],
      ['Step 8: Process Audio Files', 'Finalise and organise audio components', '', ''],
      ['Step 9: Course Maintenance', 'Update, revise, and maintain course materials', '', ''],
      ['Step 10: Archive Project', 'Safely archive completed course projects', '', ''],
      ['', '', '', ''],
      ['3. COURSE PROJECT SETUP', '', '', ''],
      ['', '', '', ''],
      ['Before starting any course creation:', '', '', ''],
      ['• Ensure your concept is clearly defined', '', '', ''],
      ['• Have source materials and references ready', '', '', ''],
      ['• Know your target audience (GP, specialists, allied health)', '', '', ''],
      ['• Understand the learning outcomes you want to achieve', '', '', ''],
      ['', '', '', ''],
      ['4. MAPPING SHEET CREATION', '', '', ''],
      ['', '', '', ''],
      ['Each new course project requires a Mapping sheet:', '', '', ''],
      ['• Column A: Course concept/topic', '', '', ''],
      ['• Column B: Source materials and references', '', '', ''],
      ['• Column C: Target audience specification', '', '', ''],
      ['• Columns D-H: Content components (modules, resources, assessments)', '', '', ''],
      ['• Column T: Project Drive folder location', '', '', ''],
      ['', '', '', ''],
      ['5. SYSTEM REQUIREMENTS', '', '', ''],
      ['', '', '', ''],
      ['Your administrator must configure:', '', '', ''],
      ['• Gemini AI API credentials', '', '', ''],
      ['• Google Drive folder permissions', '', '', ''],
      ['• Text-to-speech API access', '', '', ''],
      ['• System settings and preferences', '', '', ''],
      ['', '', '', ''],
      ['6. TROUBLESHOOTING', '', '', ''],
      ['', '', '', ''],
      ['If you encounter issues:', '', '', ''],
      ['• Use "Run System Diagnostics" to check configuration', '', '', ''],
      ['• Check "System Status" for readiness confirmation', '', '', ''],
      ['• Contact your administrator for API or permission issues', '', '', ''],
      ['• Ensure all required sheets and folders exist before starting', '', '', ''],
      ['', '', '', ''],
      ['7. AUSTRALIAN HEALTHCARE STANDARDS', '', '', ''],
      ['', '', '', ''],
      ['This tool is designed for Australian healthcare education:', '', '', ''],
      ['• Follows RACGP and ACRRM guidelines for GP education', '', '', ''],
      ['• Uses Vancouver citation style for references', '', '', ''],
      ['• Incorporates Australian clinical practice standards', '', '', ''],
      ['• Supports CPD requirements and learning objectives', '', '', ''],
      ['', '', '', ''],
      ['8. GETTING HELP', '', '', ''],
      ['', '', '', ''],
      ['For assistance:', '', '', ''],
      ['• Review this guide thoroughly', '', '', ''],
      ['• Use built-in diagnostics and status checks', '', '', ''],
      ['• Contact your system administrator for technical issues', '', '', ''],
      ['• Refer to GPSA documentation for educational standards', '', '', '']
    ];
    
    // Write content to sheet
    if (content.length > 0) {
      existingSheet.getRange(1, 1, content.length, 4).setValues(content);
    }
    
    // Format the sheet
    formatHowToUseSheet_(existingSheet);
    
    // Navigate to the sheet
    spreadsheet.setActiveSheet(existingSheet);
    
    SpreadsheetApp.getUi().alert(
      '📖 User Guide Updated',
      'The "How-to-Use" tab has been updated with comprehensive guidance including:\n\n' +
      '• Original 10-step workflow functions\n' +
      '• Course Creation Wizard instructions\n' +
      '• Setup requirements and troubleshooting\n' +
      '• Australian healthcare education standards\n\n' +
      'The guide is now displayed in the "How-to-Use" sheet.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    Logger.log('Error in showHowToUse: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Error',
      'Unable to create user guide. Error: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * FORMAT HOW-TO-USE SHEET
 * 
 * Applies professional formatting to the user guide
 */
function formatHowToUseSheet_(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow < 1) return;
    
    // Set column widths
    sheet.setColumnWidth(1, 400);
    sheet.setColumnWidth(2, 300);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 100);
    
    // Format main title
    var titleRange = sheet.getRange(1, 1, 1, 4);
    titleRange.setFontSize(16)
             .setFontWeight('bold')
             .setBackground('#4285f4')
             .setFontColor('white')
             .setHorizontalAlignment('center');
    
    // Format section headers
    var dataRange = sheet.getRange(1, 1, lastRow, 4);
    var values = dataRange.getValues();
    
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().match(/^[A-Z0-9]+\./)) {
        var headerRange = sheet.getRange(i + 1, 1, 1, 4);
        headerRange.setFontWeight('bold')
                   .setBackground('#f1f3f4')
                   .setFontSize(12);
      }
    }
    
    // Format step descriptions
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().match(/^Step \d+:/)) {
        var stepRange = sheet.getRange(i + 1, 1, 1, 2);
        stepRange.setFontWeight('bold')
                 .setBackground('#e8f0fe');
      }
    }
    
    // Set text wrapping
    dataRange.setWrap(true);
    
  } catch (error) {
    Logger.log('Error formatting How-to-Use sheet: ' + error.toString());
  }
}
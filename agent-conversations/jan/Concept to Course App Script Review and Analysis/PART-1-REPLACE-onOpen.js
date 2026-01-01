/**
 * PART 1: ENHANCED onOpen FUNCTION - REPLACE YOUR EXISTING onOpen
 * 
 * INSTRUCTIONS:
 * 1. Find your existing "function onOpen()" in your Google Apps Script
 * 2. DELETE the entire existing onOpen function 
 * 3. REPLACE it with this enhanced version below
 * 4. This replaces your old menu with the new enhanced menu system
 */

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Main menu with all functionality
    const menu = ui.createMenu('🎓 Concept-to-Course Enhanced')
      .addItem('🚀 Launch Setup Wizard', 'launchSetupWizard')
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
    
    // Validate system configuration silently
    const validationResult = validateSystemConfiguration_(false);
    if (!validationResult.isValid) {
      ui.alert('⚠️ Configuration Issues Detected', 
        'Some system components need attention. Please run Setup Wizard or System Diagnostics.', 
        ui.AlertResponse.OK);
    }
    
    Logger.log('Enhanced onOpen completed successfully');
    
  } catch (error) {
    Logger.log('Error in enhanced onOpen: ' + error.toString());
    SpreadsheetApp.getUi().alert('Initialisation Error', 
      'There was an issue loading the enhanced menu system. Please check the logs.', 
      SpreadsheetApp.getUi().AlertResponse.OK);
  }
}
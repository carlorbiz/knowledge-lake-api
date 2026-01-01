/**
 * CRITICAL FIX: Replace your launchCourseCreationWizard function
 * 
 * PROBLEM: Your current function uses CFG.validateConfiguration() 
 * SOLUTION: Use the enhanced validateSystemConfiguration_() instead
 * 
 * INSTRUCTIONS:
 * 1. Find function launchCourseCreationWizard() in your script (around line 3819)
 * 2. Replace the ENTIRE function with this corrected version
 */

function launchCourseCreationWizard() {
  const ui = SpreadsheetApp.getUi();
  
  // CORRECTED: Use enhanced validation instead of CFG.validateConfiguration()
  const validation = validateSystemConfiguration_(false);
  if (!validation.isValid) {
    ui.alert(
      'Configuration Required',
      'The system needs to be configured before creating courses.\n\n' +
      'Please run the Setup Wizard first to configure your API keys and project folder.',
      ui.ButtonSet.OK
    );
    return;
  }
  
  // Welcome and course selection
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
  
  // Add progress tracking
  trackWizardProgress_('Course Creation Wizard', 'Started', 
    wizardChoice === ui.Button.YES ? 'New course' : 'Existing course');
  
  if (wizardChoice === ui.Button.YES) {
    startNewCourseWizard_();
  } else {
    continueExistingCourseWizard_();
  }
}

/**
 * WHAT THIS FIXES:
 * - Uses enhanced validateSystemConfiguration_() instead of CFG.validateConfiguration()
 * - Adds proper progress tracking with trackWizardProgress_()
 * - Maintains compatibility with the enhanced menu system
 * - Ensures consistent validation behavior throughout the system
 */
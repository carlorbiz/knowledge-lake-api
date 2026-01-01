/**
 * FUNCTION NAMING CLARIFICATION GUIDE
 * 
 * QUESTION: Does showHowToUseTab_() replace showHowToUse()?
 * ANSWER: NO - They serve different purposes and both should exist
 */

// ============================================================================
// EXISTING FUNCTIONS (KEEP THESE)
// ============================================================================

/**
 * ✅ KEEP: This is the main public function called from menu
 * Purpose: Menu item "How to Use" calls this function
 * What it does: Creates/refreshes the tab AND navigates to it
 */
function showHowToUse() {
  try {
    // Call the existing function to create/update the How-to-Use tab
    createHowToUseTab_();
    
    // Navigate to the How-to-Use sheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var howToUseSheet = spreadsheet.getSheetByName('How to Use');
    
    if (howToUseSheet) {
      spreadsheet.setActiveSheet(howToUseSheet);
    }
    
  } catch (error) {
    Logger.log('Error in showHowToUse: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'Unable to show How-to-Use guide: ' + error.message);
  }
}

/**
 * ✅ KEEP & UPDATE: This creates/refreshes the How-to-Use tab content
 * Purpose: Internal function to build the tab content
 * What it does: Creates sheet, adds content, applies formatting
 */
function createHowToUseTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('How to Use');
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('How to Use');
  }
  
  // Set up design, add content, apply formatting
  setupHowToUseDesign_(sheet);
  addCorrectedHowToUseContent_(sheet);
  applyCorrectedHowToUseFormatting_(sheet);
  
  return sheet;
}

// ============================================================================
// NEW FUNCTION (ADD THIS - DIFFERENT PURPOSE)
// ============================================================================

/**
 * ✅ ADD: This is a lightweight helper for the wizard
 * Purpose: Used internally by wizard to navigate to How-to-Use tab
 * What it does: Shows the tab without forcing a refresh (performance)
 */
function showHowToUseTab_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let howToSheet = ss.getSheetByName('How to Use');
    
    // Create it if it doesn't exist (but don't force refresh if it does)
    if (!howToSheet) {
      createHowToUseTab_();
      howToSheet = ss.getSheetByName('How to Use');
    }
    
    // Navigate to the sheet
    if (howToSheet) {
      ss.setActiveSheet(howToSheet);
    }
  } catch (error) {
    Logger.log(`Error showing How-to-Use tab: ${error.toString()}`);
  }
}

// ============================================================================
// FUNCTION RELATIONSHIPS EXPLAINED
// ============================================================================

/**
 * NAMING CONVENTION EXPLANATION:
 * 
 * showHowToUse()        - PUBLIC function (no underscore)
 *                       - Called from menu items
 *                       - Always refreshes content AND navigates
 * 
 * createHowToUseTab_()  - PRIVATE function (underscore suffix)
 *                       - Called internally to build/refresh content
 *                       - Does NOT navigate, just builds content
 * 
 * showHowToUseTab_()    - PRIVATE helper (underscore suffix)
 *                       - Used by wizard for lightweight navigation
 *                       - Only creates if missing, doesn't force refresh
 * 
 * USAGE PATTERNS:
 * 
 * Menu Item "How to Use" → calls showHowToUse()
 *   └── calls createHowToUseTab_() to refresh content
 *   └── navigates to sheet
 * 
 * Menu Item "Refresh How to Use" → calls refreshHowToUseTab()
 *   └── calls createHowToUseTab_() to rebuild content
 * 
 * Wizard Manual Workflow → calls showHowToUseTab_()
 *   └── navigates without forcing refresh (performance)
 */

// ============================================================================
// CORRECTED WIZARD FUNCTION (with proper function name)
// ============================================================================

function launchCourseCreationWizard() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // ... welcome and setup logic ...
    
    if (approachResponse === ui.Button.NO) {
      // Direct them to manual workflow
      ui.alert(
        '⚡ Manual Workflow Selected',
        'Perfect! You\'ve chosen the manual workflow approach.\n\n' +
        // ... rest of message ...
        'Need guidance anytime? Check the "How to Use" tab or run this wizard again.',
        ui.ButtonSet.OK
      );
      
      // ✅ CORRECTED: Use the lightweight helper function
      showHowToUseTab_(); // Navigate to How-to-Use for reference
      return;
    }
    
    // ... rest of wizard logic ...
    
  } catch (error) {
    // ... error handling ...
  }
}

// ============================================================================
// DEPLOYMENT SUMMARY
// ============================================================================

/**
 * WHAT TO DO:
 * 
 * 1. KEEP existing showHowToUse() function (used by menu)
 * 
 * 2. UPDATE createHowToUseTab_() with corrected content and formatting
 *    (from HOWTO-FORMATTING-FIX.js)
 * 
 * 3. ADD new showHowToUseTab_() helper function (from USER-FRIENDLY-WIZARD-FIX.js)
 * 
 * 4. UPDATE launchCourseCreationWizard() with user-friendly version
 * 
 * RESULT: 
 * - Menu items work correctly (showHowToUse)
 * - Wizard has lightweight navigation (showHowToUseTab_)
 * - Content is properly formatted (updated createHowToUseTab_)
 * - No function conflicts or replacements
 */

// ============================================================================
// MENU INTEGRATION (verify these menu items exist)
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Concept-to-Course')
    .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')  // calls wizard
    .addSeparator()
    .addItem('📖 How to Use', 'showHowToUse')                           // calls showHowToUse()
    .addItem('🔄 Refresh How-to-Use Tab', 'refreshHowToUseTab')         // calls refreshHowToUseTab()
    // ... other menu items ...
    .addToUi();
}
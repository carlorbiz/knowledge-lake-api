/**
 * MISSING showHowToUse() FUNCTION
 * 
 * This function was referenced but doesn't exist in the current script.
 * It should call the existing createHowToUseTab_() function and provide
 * user feedback.
 * 
 * Author: Assistant for Carla Taylor  
 * Date: 2025-09-14
 */

/**
 * Show How to Use - calls existing createHowToUseTab_() function
 * 
 * This function provides the menu interface to create/update the How-to-Use tab
 * using the existing createHowToUseTab_() function in your script.
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
      
      // Provide user feedback
      SpreadsheetApp.getUi().alert(
        '📖 How-to-Use Guide',
        'The "How to Use" tab has been created/updated with comprehensive guidance for using the Concept-to-Course tool.\n\n' +
        'The guide includes:\n' +
        '• Step-by-step workflow instructions\n' +
        '• Course Creation Wizard guidance\n' +
        '• Australian healthcare education standards\n' +
        '• Troubleshooting information\n\n' +
        'You are now viewing the "How to Use" sheet.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      throw new Error('How-to-Use sheet was not created successfully.');
    }
    
  } catch (error) {
    Logger.log('Error in showHowToUse: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Error',
      'Unable to create/show the How-to-Use guide.\n\n' +
      'Error: ' + error.message + '\n\n' +
      'Please ensure the createHowToUseTab_() function is available in your script.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Alternative simpler version if you prefer minimal function
 */
/*
function showHowToUse() {
  try {
    createHowToUseTab_();
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
*/
/**
 * MISSING showHowToUse FUNCTION - calls your existing createHowToUseTab_()
 */
function showHowToUse() {
  try {
    createHowToUseTab_();
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const howToUseSheet = spreadsheet.getSheetByName('How to Use');
    if (howToUseSheet) {
      spreadsheet.setActiveSheet(howToUseSheet);
    }
  } catch (error) {
    Logger.log('Error in showHowToUse: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'Unable to show How-to-Use guide: ' + error.message);
  }
}
/**
 * FORMATTING FUNCTION REPLACEMENT GUIDE
 * 
 * YES - applyCorrectedHowToUseFormatting_() should REPLACE finaliseHowToUseFormatting_()
 * 
 * REASON FOR REPLACEMENT:
 * The existing finaliseHowToUseFormatting_() function has several issues:
 * 1. Hard-coded row numbers that don't match the new content structure
 * 2. Outdated formatting patterns that don't work with corrected content
 * 3. References to content sections that no longer exist in the same positions
 * 4. Uses helper functions like findRowByContent_() that may not be reliable
 * 5. Complex conditional logic that breaks with the updated workflow content
 */

// ============================================================================
// OLD FUNCTION (TO BE REMOVED)
// ============================================================================

// ❌ REMOVE THIS FUNCTION - IT'S CAUSING THE FORMATTING ISSUES
function finaliseHowToUseFormatting_(sheet) {
  // This function has hard-coded row numbers that don't match new content:
  const stepRows = [7, 15, 23, 31, 39, 47, 55, 63, 71, 79];  // ❌ WRONG ROWS
  const actionRows = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80]; // ❌ WRONG ROWS
  
  // These rows don't correspond to the corrected content structure!
  // This is why the formatting has gone "wonky" as you observed.
}

// ============================================================================
// NEW FUNCTION (REPLACEMENT)
// ============================================================================

/**
 * ✅ USE THIS FUNCTION INSTEAD - It's designed for the corrected content structure
 */
function applyCorrectedHowToUseFormatting_(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 1) return;
    
    // Get full data range
    const dataRange = sheet.getRange(1, 1, lastRow, 4);
    const values = dataRange.getValues();
    
    // Set base formatting for entire sheet
    dataRange.setFontFamily('Inter')
             .setFontSize(11)
             .setWrap(true)
             .setVerticalAlignment('top');
    
    // ✅ DYNAMIC FORMATTING - Works with any content structure
    for (let i = 0; i < values.length; i++) {
      const rowNum = i + 1;
      const cellA = values[i][0] ? values[i][0].toString() : '';
      const cellB = values[i][1] ? values[i][1].toString() : '';
      
      // Main headers - Detects headers dynamically, not by hard-coded row numbers
      if (cellB && cellB.match(/^[A-Z\s&-]+$/) && cellB.length > 3) {
        const headerRange = sheet.getRange(rowNum, 1, 1, 4);
        headerRange.setFontSize(14)
                   .setFontWeight('bold')
                   .setBackground('#1a73e8')
                   .setFontColor('white')
                   .setHorizontalAlignment('left');
      }
      
      // Step numbers - Detects emoji step indicators dynamically
      else if (cellA && (cellA.includes('️⃣') || cellA.includes('🎓') || cellA.includes('🏥') || cellA.includes('🤖'))) {
        const stepRange = sheet.getRange(rowNum, 1, 1, 4);
        stepRange.setFontSize(12)
                 .setFontWeight('bold')
                 .setBackground('#e8f0fe')
                 .setFontColor('#1967d2');
      }
      
      // Sub-items - Detects bullet points dynamically
      else if (cellB && cellB.startsWith('•')) {
        const bulletRange = sheet.getRange(rowNum, 2, 1, 2);
        bulletRange.setFontColor('#5f6368')
                   .setFontSize(10);
      }
      
      // Status indicators - Dynamic detection and colouring
      if (values[i][2]) {
        const statusText = values[i][2].toString();
        const statusRange = sheet.getRange(rowNum, 3);
        
        if (statusText.includes('✅') || statusText.includes('Best for')) {
          statusRange.setBackground('#d1e7dd')
                     .setFontColor('#0a3622')
                     .setFontWeight('bold')
                     .setFontSize(9);
        } else if (statusText.includes('🔧') || statusText.includes('Advanced')) {
          statusRange.setBackground('#fff3cd')
                     .setFontColor('#664d03')
                     .setFontWeight('bold')
                     .setFontSize(9);
        } else if (statusText.includes('⚡') || statusText.includes('🛠️')) {
          statusRange.setBackground('#cff4fc')
                     .setFontColor('#055160')
                     .setFontWeight('bold')
                     .setFontSize(9);
        }
      }
    }
    
    // Set borders for better visual separation
    const borderRange = sheet.getRange(1, 1, lastRow, 4);
    borderRange.setBorder(
      false, false, false, false, 
      false, false, 
      '#e0e0e0', SpreadsheetApp.BorderStyle.SOLID
    );
    
    // Highlight the main title row
    const titleRange = sheet.getRange(1, 1, 1, 4);
    titleRange.setFontSize(16)
             .setFontWeight('bold')
             .setBackground('#34a853')
             .setFontColor('white')
             .setHorizontalAlignment('center');
    
    Logger.log('Enhanced formatting applied successfully to How-to-Use sheet');
    
  } catch (error) {
    Logger.log(`Error applying formatting to How-to-Use sheet: ${error.toString()}`);
  }
}

// ============================================================================
// KEY DIFFERENCES EXPLAINED
// ============================================================================

/**
 * WHY THE REPLACEMENT IS NECESSARY:
 * 
 * 1. HARD-CODED vs DYNAMIC ROW DETECTION:
 *    Old: stepRows = [7, 15, 23, 31, 39, 47, 55, 63, 71, 79]
 *    New: Detects steps dynamically by looking for emoji patterns (️⃣)
 * 
 * 2. CONTENT STRUCTURE MISMATCH:
 *    Old: Expected specific content at specific rows
 *    New: Works with the corrected workflow content structure
 * 
 * 3. MISSING HELPER FUNCTIONS:
 *    Old: Uses findRowByContent_() which may not exist or work properly
 *    New: Self-contained formatting logic
 * 
 * 4. OUTDATED FORMATTING PATTERNS:
 *    Old: Based on old content organisation
 *    New: Reflects corrected workflow (Step 4 LMS + Step 5 Voiceover)
 * 
 * 5. ERROR HANDLING:
 *    Old: Can break if content doesn't match expected pattern
 *    New: Graceful handling of different content structures
 */

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================

/**
 * TO FIX THE FORMATTING ISSUES:
 * 
 * 1. REMOVE the old finaliseHowToUseFormatting_() function completely
 * 
 * 2. ADD the new applyCorrectedHowToUseFormatting_() function
 * 
 * 3. UPDATE the createHowToUseTab_() function to call the new formatter:
 *    
 *    function createHowToUseTab_() {
 *      // ... existing setup code ...
 *      
 *      // Replace this line:
 *      // finaliseHowToUseFormatting_(sheet);  // ❌ OLD
 *      
 *      // With this line:
 *      applyCorrectedHowToUseFormatting_(sheet);  // ✅ NEW
 *      
 *      return sheet;
 *    }
 * 
 * 4. TEST by running refreshHowToUseTab() - formatting should now display correctly
 */

// ============================================================================
// ADDITIONAL HELPER FUNCTION (if findRowByContent_ is missing)
// ============================================================================

/**
 * If your script is missing the findRowByContent_ helper function,
 * add this implementation (though the new formatter doesn't need it):
 */
function findRowByContent_(sheet, searchText) {
  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] && data[i][j].toString().includes(searchText)) {
          return i + 1; // Return 1-based row number
        }
      }
    }
    return -1; // Not found
  } catch (error) {
    Logger.log(`Error in findRowByContent_: ${error.toString()}`);
    return -1;
  }
}

/**
 * Helper function used by old formatter (can be removed after replacement)
 */
function isSpecialFormattedRow_(sheet, row) {
  try {
    const range = sheet.getRange(row, 1, 1, 4);
    const backgrounds = range.getBackgrounds()[0];
    
    // Check if row has special background colours
    return backgrounds.some(bg => 
      bg === '#1c4587' || bg === '#e8f0fe' || bg === '#f1f3f4' || 
      bg === '#34a853' || bg === '#e8f5e8'
    );
  } catch (error) {
    Logger.log(`Error checking special formatting: ${error.toString()}`);
    return false;
  }
}
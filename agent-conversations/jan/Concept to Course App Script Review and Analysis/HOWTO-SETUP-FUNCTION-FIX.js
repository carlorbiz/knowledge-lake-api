/**
 * CRITICAL FIX: setupHowToUseDesign_ Function Error
 * 
 * ERROR: "sheet.getRange(...).setRowHeight is not a function"
 * CAUSE: setRowHeight() method doesn't exist - should be setRowHeights()
 * 
 * SOLUTION: Corrected setupHowToUseDesign_ function with proper Google Apps Script methods
 */

/**
 * REPLACE the existing setupHowToUseDesign_ function with this corrected version
 */
function setupHowToUseDesign_(sheet) {
  try {
    // Set column widths for optimal display - CORRECTED VALUES
    sheet.setColumnWidth(1, 80);   // A: Icons/bullets - increased from 60
    sheet.setColumnWidth(2, 480);  // B: Main content - reduced from 500 for better fit
    sheet.setColumnWidth(3, 180);  // C: Status/notes - reduced from 200
    sheet.setColumnWidth(4, 120);  // D: Time estimates - reduced from 150
    
    // ✅ FIXED: Use setRowHeights() instead of setRowHeight()
    // Set default row height for better readability (applies to first 100 rows)
    sheet.setRowHeights(1, 100, 25);  // startRow, numRows, height
    
    // Freeze header rows for navigation
    sheet.setFrozenRows(6);
    
    Logger.log('How-to-Use design setup completed successfully');
  } catch (error) {
    Logger.log(`Error in setupHowToUseDesign_: ${error.toString()}`);
  }
}

/**
 * ALTERNATIVE VERSION: More conservative approach if setRowHeights still causes issues
 */
function setupHowToUseDesign_Conservative_(sheet) {
  try {
    // Set column widths for optimal display
    sheet.setColumnWidth(1, 80);   // A: Icons/bullets
    sheet.setColumnWidth(2, 480);  // B: Main content  
    sheet.setColumnWidth(3, 180);  // C: Status/notes
    sheet.setColumnWidth(4, 120);  // D: Time estimates
    
    // ✅ ALTERNATIVE: Set row heights individually for key rows if batch method fails
    try {
      // Try batch method first
      sheet.setRowHeights(1, 50, 25);
    } catch (rowError) {
      // Fallback: Set individual row heights for first 20 rows
      Logger.log('Batch row height setting failed, using individual method');
      for (let i = 1; i <= 20; i++) {
        try {
          sheet.setRowHeight(i, 25);
        } catch (individualError) {
          // If individual method also fails, just log and continue
          Logger.log(`Could not set height for row ${i}: ${individualError.toString()}`);
        }
      }
    }
    
    // Freeze header rows for navigation
    sheet.setFrozenRows(6);
    
    Logger.log('How-to-Use design setup completed successfully (conservative mode)');
  } catch (error) {
    Logger.log(`Error in setupHowToUseDesign_Conservative_: ${error.toString()}`);
  }
}

/**
 * MINIMAL VERSION: If you want to avoid row height issues entirely
 */
function setupHowToUseDesign_Minimal_(sheet) {
  try {
    // Set column widths only - skip row height adjustments
    sheet.setColumnWidth(1, 80);   // A: Icons/bullets
    sheet.setColumnWidth(2, 480);  // B: Main content  
    sheet.setColumnWidth(3, 180);  // C: Status/notes
    sheet.setColumnWidth(4, 120);  // D: Time estimates
    
    // Freeze header rows for navigation
    sheet.setFrozenRows(6);
    
    Logger.log('How-to-Use design setup completed successfully (minimal mode)');
  } catch (error) {
    Logger.log(`Error in setupHowToUseDesign_Minimal_: ${error.toString()}`);
  }
}

/**
 * COMPLETE CORRECTED FUNCTION SUITE
 * 
 * Use this complete replacement for the createHowToUseTab_ function
 * that includes the corrected setup function:
 */
function createHowToUseTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('How to Use');
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('How to Use');
  }
  
  // ✅ CORRECTED: Use the fixed setup function
  setupHowToUseDesign_(sheet);
  
  // Add updated content with corrected workflow
  addCorrectedHowToUseContent_(sheet);
  
  // Apply enhanced formatting - NO FONT FAMILY ISSUES
  applyCorrectedHowToUseFormatting_(sheet);
  
  return sheet;
}

/**
 * ALSO FIX: Font family issue in formatting function
 * 
 * REPLACE the font family line in applyCorrectedHowToUseFormatting_:
 */
function applyCorrectedHowToUseFormatting_(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 1) return;
    
    const dataRange = sheet.getRange(1, 1, lastRow, 4);
    const values = dataRange.getValues();
    
    // ✅ FIXED: Use standard Google Fonts or remove font family entirely
    // Instead of: dataRange.setFontFamily('Inter')
    // Use one of these options:
    
    // Option 1: Use a standard Google Sheets font
    dataRange.setFontFamily('Arial')
             .setFontSize(11)
             .setWrap(true)
             .setVerticalAlignment('top');
    
    // Option 2: Skip font family entirely (comment out the setFontFamily line)
    // dataRange.setFontSize(11)
    //          .setWrap(true)
    //          .setVerticalAlignment('top');
    
    // ... rest of formatting logic remains the same ...
    
    // Apply formatting based on content patterns
    for (let i = 0; i < values.length; i++) {
      const rowNum = i + 1;
      const cellA = values[i][0] ? values[i][0].toString() : '';
      const cellB = values[i][1] ? values[i][1].toString() : '';
      
      // Main headers
      if (cellB && cellB.match(/^[A-Z\s&-]+$/) && cellB.length > 3) {
        const headerRange = sheet.getRange(rowNum, 1, 1, 4);
        headerRange.setFontSize(14)
                   .setFontWeight('bold')
                   .setBackground('#1a73e8')
                   .setFontColor('white')
                   .setHorizontalAlignment('left');
      }
      
      // Step numbers and major sections
      else if (cellA && (cellA.includes('️⃣') || cellA.includes('🎓') || cellA.includes('🏥') || cellA.includes('🤖'))) {
        const stepRange = sheet.getRange(rowNum, 1, 1, 4);
        stepRange.setFontSize(12)
                 .setFontWeight('bold')
                 .setBackground('#e8f0fe')
                 .setFontColor('#1967d2');
      }
      
      // Sub-items and bullet points
      else if (cellB && cellB.startsWith('•')) {
        const bulletRange = sheet.getRange(rowNum, 2, 1, 2);
        bulletRange.setFontColor('#5f6368')
                   .setFontSize(10);
      }
      
      // Status indicators in column C
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

/**
 * DEPLOYMENT SUMMARY:
 * 
 * 1. Replace setupHowToUseDesign_() with the corrected version above
 * 2. Change 'Inter' font family to 'Arial' or remove font family line entirely
 * 3. Use setRowHeights(startRow, numRows, height) instead of setRowHeight()
 * 4. Test the refreshHowToUseTab() function - errors should be resolved
 */
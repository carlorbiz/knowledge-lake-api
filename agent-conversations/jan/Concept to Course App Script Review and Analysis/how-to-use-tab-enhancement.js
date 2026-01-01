/**
 * AESTHETICALLY PLEASING "HOW TO USE" TAB CREATION
 * Creates a visually engaging instruction sheet within Google Sheets limitations
 */

function createHowToUseTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('How to Use');
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('How to Use');
  }
  
  // Set up the visual design
  setupHowToUseDesign_(sheet);
  
  // Add content sections
  addHowToUseContent_(sheet);
  
  // Apply final formatting
  finaliseHowToUseFormatting_(sheet);
  
  return sheet;
}

function setupHowToUseDesign_(sheet) {
  // Set column widths for optimal display
  sheet.setColumnWidths(1, 1, 60);  // A: Narrow for icons/bullets
  sheet.setColumnWidths(2, 1, 500); // B: Main content
  sheet.setColumnWidths(3, 1, 200); // C: Status/notes
  sheet.setColumnWidths(4, 1, 150); // D: Time estimates
  
  // Set row heights
  sheet.setRowHeights(1, 5, 35);    // Header rows
  sheet.setRowHeights(6, 50, 30);   // Content rows
  
  // Freeze header
  sheet.setFrozenRows(5);
}

function addHowToUseContent_(sheet) {
  const content = [
    // Header Section (Rows 1-5)
    ['🎓', 'CONCEPT-TO-COURSE PROFESSIONAL TOOL', 'STATUS', 'TIME'],
    ['', 'Transform Healthcare Education Ideas into Complete Course Materials', '', ''],
    ['', '', '', ''],
    ['📋', 'WORKFLOW OVERVIEW', 'READY ✓', 'TOTAL: ~3-4 HRS'],
    ['', 'Follow the numbered steps below for professional course development', '', ''],
    
    // Step-by-step content (Rows 6+)
    ['', '', '', ''],
    ['1️⃣', 'INITIAL SETUP & COURSE PLANNING', '', ''],
    ['📝', 'Setup & Add First Course', 'Required', '10 min'],
    ['', '• Define your course concept and target audience', '', ''],
    ['', '• Specify source materials (Drive folders, documents, URLs)', '', ''],
    ['', '• Set course folder location and slides template', '', ''],
    ['', 'OUTCOME: Foundation established for course development', '', ''],
    
    ['', '', '', ''],
    ['2️⃣', 'AI-POWERED COURSE STRUCTURE', '', ''],
    ['🤖', 'Generate Course Recommendation', 'Required', '15 min'],
    ['', '• AI analyses your materials and creates 8-12 module structure', '', ''],
    ['', '• Generates professional recommendation document', '', ''],
    ['', '• Includes Vancouver-style citations and Australian context', '', ''],
    ['', 'OUTCOME: Complete course blueprint with justified module breakdown', '', ''],
    
    ['', '', '', ''],
    ['3️⃣', 'WORKSPACE PREPARATION', '', ''],
    ['📁', 'Create Content Tabs & Subfolders', 'Required', '5 min'],
    ['', '• Creates organised folder structure in Google Drive', '', ''],
    ['', '• Sets up content tracking worksheets', '', ''],
    ['', '• Prepares TTS (text-to-speech) management system', '', ''],
    ['', 'OUTCOME: Organised workspace ready for content generation', '', ''],
    
    ['', '', '', ''],
    ['4️⃣', 'COMPREHENSIVE CONTENT DEVELOPMENT', '', ''],
    ['📚', 'Generate Full Suite of Resources', 'Per Module', '45-60 min'],
    ['', '• Module descriptions and learning objectives', '', ''],
    ['', '• Key concepts and slide specifications (12 slides per module)', '', ''],
    ['', '• Interactive scenarios for role-play exercises', '', ''],
    ['', '• Comprehensive assessments with detailed rationales', '', ''],
    ['', '• Professional downloadable resources with research', '', ''],
    ['', 'OUTCOME: Complete educational content suite per module', '', ''],
    
    ['', '', '', ''],
    ['5️⃣', 'LMS-READY CONTENT', '', ''],
    ['🎯', 'Generate LMS Upload Document', 'Per Module', '10 min'],
    ['', '• Creates Absorb LMS-compatible content document', '', ''],
    ['', '• Maintains educational flow and engagement standards', '', ''],
    ['', '• Includes interactive elements and assessment integration', '', ''],
    ['', 'OUTCOME: Ready-to-upload LMS content package', '', ''],
    
    ['', '', '', ''],
    ['6️⃣', 'PRESENTATION DEVELOPMENT', '', ''],
    ['📊', 'Generate Slides for Module', 'Per Module', '15 min'],
    ['', '• Creates professional slide presentations', '', ''],
    ['', '• Choice of standard or executive summary formats', '', ''],
    ['', '• Organised in Drive subfolder with automated naming', '', ''],
    ['', 'OUTCOME: Presentation-ready slides for training delivery', '', ''],
    
    ['', '', '', ''],
    ['7️⃣', 'VOICE CUSTOMISATION', '', ''],
    ['🎤', 'Set Voiceover Artist', 'Optional', '2 min'],
    ['', '• Select from 6 professional voice options', '', ''],
    ['', '• Applies to all audio generation for consistent experience', '', ''],
    ['', '• Australian-accented professional delivery', '', ''],
    ['', 'OUTCOME: Personalised audio branding for your courses', '', ''],
    
    ['', '', '', ''],
    ['8️⃣', 'PROFESSIONAL AUDIO NARRATION', '', ''],
    ['🎵', 'Generate All Audio for Module', 'Per Module', '30-45 min'],
    ['', '• High-quality AI voiceover for each slide', '', ''],
    ['', '• Executive-level narration scripts', '', ''],
    ['', '• Organised audio files ready for LMS integration', '', ''],
    ['', 'OUTCOME: Complete narrated course content', '', ''],
    
    ['', '', '', ''],
    ['9️⃣', 'MAINTENANCE & UPDATES', '', ''],
    ['🧹', 'Clean Module Audio Files', 'As Needed', '2 min'],
    ['', '• Removes outdated audio files from Drive storage', '', ''],
    ['', '• Maintains organised project folders', '', ''],
    ['', '• Clears audio links from tracking sheets', '', ''],
    ['', 'OUTCOME: Clean workspace for fresh audio generation', '', ''],
    
    ['', '', '', ''],
    ['🔟', 'PROJECT COMPLETION', '', ''],
    ['📦', 'Archive Course Project', 'Per Course', '5 min'],
    ['', '• Creates backup of all course materials', '', ''],
    ['', '• Removes working tabs from main spreadsheet', '', ''],
    ['', '• Prepares project folder for long-term storage', '', ''],
    ['', 'OUTCOME: Professional course archive ready for delivery', '', ''],
    
    ['', '', '', ''],
    ['', '', '', ''],
    ['💡', 'PROFESSIONAL WORKFLOW TIPS', '', ''],
    ['', '', '', ''],
    ['✅', 'QUALITY CONTROL', '', ''],
    ['', '• Review each module recommendation before proceeding', '', ''],
    ['', '• Test sample slides and audio before full generation', '', ''],
    ['', '• Keep source materials organised and accessible', '', ''],
    ['', '• Use modification requests between steps for refinements', '', ''],
    
    ['', '', '', ''],
    ['⚡', 'EFFICIENCY OPTIMISATION', '', ''],
    ['', '• Complete steps 1-3 for all courses first (bulk setup)', '', ''],
    ['', '• Generate resources in batches to maximise API efficiency', '', ''],
    ['', '• Archive completed courses to maintain workspace clarity', '', ''],
    ['', '• Maintain consistent folder naming for easy navigation', '', ''],
    
    ['', '', '', ''],
    ['🔧', 'TROUBLESHOOTING SUPPORT', '', ''],
    ['', '• Status sheet tracks all operations and progress', '', ''],
    ['', '• Toast notifications provide real-time feedback', '', ''],
    ['', '• Contact Carla for any configuration or error issues', '', ''],
    ['', '• Setup wizard available for initial configuration', '', ''],
    
    ['', '', '', ''],
    ['📞', 'TECHNICAL SUPPORT', 'CONTACT CARLA', ''],
    ['', 'For configuration issues, script errors, or advanced customisation', '', ''],
    ['', 'Users should focus on content creation, not technical troubleshooting', '', '']
  ];
  
  // Write content to sheet
  const range = sheet.getRange(1, 1, content.length, 4);
  range.setValues(content);
}

function finaliseHowToUseFormatting_(sheet) {
  const maxRow = sheet.getLastRow();
  
  // Header formatting (rows 1-5)
  const headerRange = sheet.getRange(1, 1, 5, 4);
  headerRange.setBackground('#1c4587').setFontColor('white').setFontWeight('bold').setFontSize(11);
  
  // Title row special formatting
  sheet.getRange(1, 2).setFontSize(14).setFontWeight('bold');
  sheet.getRange(2, 2).setFontSize(10).setFontStyle('italic');
  
  // Step number formatting (emoji rows)
  const stepRows = [7, 15, 23, 31, 39, 47, 55, 63, 71, 79];
  stepRows.forEach(row => {
    if (row <= maxRow) {
      const stepRange = sheet.getRange(row, 1, 1, 4);
      stepRange.setBackground('#e8f0fe').setFontWeight('bold').setFontSize(12);
    }
  });
  
  // Main action rows formatting
  const actionRows = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80];
  actionRows.forEach(row => {
    if (row <= maxRow) {
      const actionRange = sheet.getRange(row, 1, 1, 4);
      actionRange.setBackground('#f1f3f4').setFontWeight('bold');
      
      // Status column conditional formatting
      const statusCell = sheet.getRange(row, 3);
      const statusValue = statusCell.getValue();
      if (statusValue === 'Required') {
        statusCell.setBackground('#fce8e6').setFontColor('#d93025');
      } else if (statusValue === 'Per Module') {
        statusCell.setBackground('#e8f0fe').setFontColor('#1a73e8');
      } else if (statusValue === 'Optional') {
        statusCell.setBackground('#e6f4ea').setFontColor('#137333');
      }
    }
  });
  
  // Outcome rows formatting
  for (let row = 1; row <= maxRow; row++) {
    const cellValue = sheet.getRange(row, 2).getValue();
    if (typeof cellValue === 'string' && cellValue.startsWith('OUTCOME:')) {
      const outcomeRange = sheet.getRange(row, 2, 1, 2);
      outcomeRange.setFontStyle('italic').setBackground('#f8f9fa').setFontColor('#5f6368');
    }
  }
  
  // Tips section formatting
  const tipsStartRow = findRowByContent_(sheet, 'PROFESSIONAL WORKFLOW TIPS');
  if (tipsStartRow > 0) {
    const tipsHeaderRange = sheet.getRange(tipsStartRow, 1, 1, 4);
    tipsHeaderRange.setBackground('#34a853').setFontColor('white').setFontWeight('bold');
    
    // Sub-sections in tips
    const subSectionRows = [
      findRowByContent_(sheet, 'QUALITY CONTROL'),
      findRowByContent_(sheet, 'EFFICIENCY OPTIMISATION'),
      findRowByContent_(sheet, 'TROUBLESHOOTING SUPPORT'),
      findRowByContent_(sheet, 'TECHNICAL SUPPORT')
    ].filter(row => row > 0);
    
    subSectionRows.forEach(row => {
      const subRange = sheet.getRange(row, 1, 1, 4);
      subRange.setBackground('#e8f5e8').setFontWeight('bold');
    });
  }
  
  // Add borders and final touches
  const allContent = sheet.getRange(1, 1, maxRow, 4);
  allContent.setBorder(true, true, true, true, false, false, '#dadce0', SpreadsheetApp.BorderStyle.SOLID);
  
  // Alternating row backgrounds for better readability
  for (let row = 6; row <= maxRow; row += 2) {
    if (!isSpecialFormattedRow_(sheet, row)) {
      sheet.getRange(row, 1, 1, 4).setBackground('#fafafa');
    }
  }
  
  // Center align status and time columns
  sheet.getRange(1, 3, maxRow, 2).setHorizontalAlignment('center');
  
  // Wrap text in main content column
  sheet.getRange(1, 2, maxRow, 1).setWrap(true);
  
  // Final row height adjustments
  sheet.setRowHeights(1, 2, 40);  // Title rows
  sheet.setRowHeights(3, 1, 20);  // Spacer
  sheet.setRowHeights(4, 2, 35);  // Overview
}

function findRowByContent_(sheet, searchText) {
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (typeof data[i][j] === 'string' && data[i][j].includes(searchText)) {
        return i + 1; // Convert to 1-based row number
      }
    }
  }
  return -1;
}

function isSpecialFormattedRow_(sheet, row) {
  const cellValue = sheet.getRange(row, 2).getValue();
  if (typeof cellValue !== 'string') return false;
  
  return cellValue.includes('OUTCOME:') || 
         cellValue.includes('WORKFLOW TIPS') ||
         cellValue.includes('QUALITY CONTROL') ||
         cellValue.includes('EFFICIENCY') ||
         cellValue.includes('TROUBLESHOOTING') ||
         cellValue.includes('TECHNICAL SUPPORT') ||
         /^[1-9]️⃣/.test(sheet.getRange(row, 1).getValue());
}

// Function to refresh the How to Use tab (useful for updates)
function refreshHowToUseTab() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Refresh Instructions',
    'This will update the "How to Use" tab with the latest formatting and content.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    createHowToUseTab_();
    ui.alert('✓ How to Use tab refreshed successfully');
  }
}
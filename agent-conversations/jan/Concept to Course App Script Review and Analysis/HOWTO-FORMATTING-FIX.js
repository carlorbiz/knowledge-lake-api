/**
 * CRITICAL FIX: refreshHowToUseTab Formatting Issues
 * 
 * ISSUE: The refreshHowToUseTab function has formatting problems and outdated content
 * that doesn't reflect the corrected workflow integration (Step 4 LMS + Step 5 Voiceover).
 * 
 * SOLUTION: Complete rebuild of the How-to-Use tab with proper formatting, updated content,
 * and corrected workflow steps that reflect the optimised 10-step process.
 */

function refreshHowToUseTab() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Refresh Instructions',
    'This will update the "How to Use" tab with the latest formatting and corrected workflow content.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    createHowToUseTab_();
    ui.alert('✅ How to Use tab refreshed successfully with corrected workflow');
  }
}

/**
 * CORRECTED: createHowToUseTab_ function with proper formatting and updated content
 */
function createHowToUseTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('How to Use');
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet('How to Use');
  }
  
  // Set up the visual design with corrected formatting
  setupHowToUseDesign_(sheet);
  
  // Add updated content with corrected workflow
  addCorrectedHowToUseContent_(sheet);
  
  // Apply enhanced formatting
  applyCorrectedHowToUseFormatting_(sheet);
  
  return sheet;
}

/**
 * FIXED: Setup design with proper column widths and formatting
 */
function setupHowToUseDesign_(sheet) {
  try {
    // Set column widths for optimal display - CORRECTED VALUES
    sheet.setColumnWidth(1, 80);   // A: Icons/bullets - increased from 60
    sheet.setColumnWidth(2, 480);  // B: Main content - reduced from 500 for better fit
    sheet.setColumnWidth(3, 180);  // C: Status/notes - reduced from 200
    sheet.setColumnWidth(4, 120);  // D: Time estimates - reduced from 150
    
    // Set default row height for better readability
    sheet.getRange('1:100').setRowHeight(25);
    
    // Freeze header rows for navigation
    sheet.setFrozenRows(6);
    
    Logger.log('How-to-Use design setup completed successfully');
  } catch (error) {
    Logger.log(`Error in setupHowToUseDesign_: ${error.toString()}`);
  }
}

/**
 * UPDATED: Content with corrected workflow integration
 */
function addCorrectedHowToUseContent_(sheet) {
  const content = [
    // Header Section
    ['🎓', 'Concept-to-Course Tool - Complete User Guide', '', ''],
    ['', '', '', ''],
    ['📋', 'GETTING STARTED', '', ''],
    ['', 'This tool follows a proven 10-step workflow to transform your healthcare', '', ''],
    ['', 'education concepts into complete, professional course materials with', '', ''],
    ['', 'AI-powered content generation tailored for Australian standards.', '', ''],
    ['', '', '', ''],
    
    // Approach Selection
    ['🚀', 'CHOOSE YOUR APPROACH', '', ''],
    ['', '', '', ''],
    ['🧙', 'Course Creation Wizard (Recommended)', '✅ Best for new users', '5-10 min'],
    ['', '• Guided step-by-step workflow for new users', '', ''],
    ['', '• Automatic validation and error checking', '', ''],
    ['', '• Built-in help and explanations', '', ''],
    ['', '• Handles complex setup automatically', '', ''],
    ['', '', '', ''],
    
    ['⚡', 'Manual 10-Step Workflow (Advanced)', '🔧 For experienced users', '2-5 min'],
    ['', '• Direct access to individual functions', '', ''],
    ['', '• Maximum control and flexibility', '', ''],
    ['', '• Faster execution for repeat users', '', ''],
    ['', '• Requires familiarity with process', '', ''],
    ['', '', '', ''],
    
    // CORRECTED Workflow Steps
    ['🎯', 'OPTIMISED 10-STEP WORKFLOW', '', ''],
    ['', '', '', ''],
    ['1️⃣', 'Step 1: Setup & Add First Course', '📊 Foundation', '2-3 min'],
    ['', '• Creates Mapping tab for course tracking', '', ''],
    ['', '• Sets up project structure and folders', '', ''],
    ['', '• Initialises System Status monitoring', '', ''],
    ['', '', '', ''],
    
    ['2️⃣', 'Step 2: Generate Course Recommendation', '🤖 AI Analysis', '3-5 min'],
    ['', '• Analyses uploaded source materials using Gemini AI', '', ''],
    ['', '• Creates comprehensive course structure', '', ''],
    ['', '• Supports modification requests for iterative improvement', '', ''],
    ['', '• Maintains quality whilst preserving format compatibility', '', ''],
    ['', '', '', ''],
    
    ['3️⃣', 'Step 3: Create Content Tabs & Subfolders', '🏗️ Infrastructure', '1-2 min'],
    ['', '• Creates Module-Resources tracking sheet', '', ''],
    ['', '• Sets up TTS audio management sheet', '', ''],
    ['', '• Establishes Google Drive folder structure', '', ''],
    ['', '', '', ''],
    
    ['4️⃣', 'Step 4: Generate Full Suite (inc. LMS)', '📚 Content Creation', '10-15 min'],
    ['', '• INTEGRATED: Generates ALL module resources', '', ''],
    ['', '• Creates learning objectives, assessments, case studies', '', ''],
    ['', '• INCLUDES: LMS content generation (Column I)', '', ''],
    ['', '• Produces downloadable resources and activities', '', ''],
    ['', '', '', ''],
    
    ['5️⃣', 'Step 5: Generate Voiceover Scripts', '🎙️ Audio Prep', '5-8 min'],
    ['', '• REPOSITIONED: Now runs while on Module-Resources tab', '', ''],
    ['', '• Converts slide content to professional voiceover scripts', '', ''],
    ['', '• Optimises timing and pacing for audio delivery', '', ''],
    ['', '• Maintains workflow efficiency (no tab switching)', '', ''],
    ['', '', '', ''],
    
    ['6️⃣', 'Step 6: Generate Slide Presentations', '🖼️ Visual Content', '8-12 min'],
    ['', '• Creates professional PowerPoint presentations', '', ''],
    ['', '• Applies consistent Australian healthcare branding', '', ''],
    ['', '• Includes interactive elements and assessments', '', ''],
    ['', '', '', ''],
    
    ['7️⃣', 'Step 7: Generate Audio Files', '🔊 TTS Processing', '10-20 min'],
    ['', '• Converts voiceover scripts to professional audio', '', ''],
    ['', '• Uses Google Text-to-Speech with Australian voices', '', ''],
    ['', '• Manages audio files in Google Drive structure', '', ''],
    ['', '', '', ''],
    
    ['8️⃣', 'Step 8: Trash Slide Audio', '🗑️ Cleanup', '1-2 min'],
    ['', '• Removes outdated or unwanted audio files', '', ''],
    ['', '• Maintains clean audio library', '', ''],
    ['', '• Prevents storage bloat and confusion', '', ''],
    ['', '', '', ''],
    
    ['9️⃣', 'Step 9: Maintenance & Updates', '🔧 Optimisation', '5-10 min'],
    ['', '• Updates existing content based on feedback', '', ''],
    ['', '• Refines materials for improved delivery', '', ''],
    ['', '• Ensures compliance with latest standards', '', ''],
    ['', '', '', ''],
    
    ['🔟', 'Step 10: Archive Project', '📦 Completion', '2-3 min'],
    ['', '• ENHANCED: Properly removes all project sheets', '', ''],
    ['', '• Creates comprehensive backup in project folder', '', ''],
    ['', '• Cleans workspace for new projects', '', ''],
    ['', '• Preserves hundreds of hours of development work', '', ''],
    ['', '', '', ''],
    
    // Quality Standards
    ['🏥', 'AUSTRALIAN HEALTHCARE STANDARDS', '', ''],
    ['', '', '', ''],
    ['🇦🇺', 'RACGP & ACRRM Compliance', '✅ Certified', ''],
    ['', '• Follows Royal Australian College of General Practitioners guidelines', '', ''],
    ['', '• Meets Australian College of Rural and Remote Medicine standards', '', ''],
    ['', '• Uses Vancouver citation style for medical references', '', ''],
    ['', '• Incorporates Australian healthcare context and terminology', '', ''],
    ['', '', '', ''],
    
    // Technical Features
    ['🤖', 'AI-POWERED FEATURES', '', ''],
    ['', '', '', ''],
    ['🧠', 'Gemini 1.5 Pro Integration', '⚡ Advanced', ''],
    ['', '• Native PDF processing (no Adobe DNS issues)', '', ''],
    ['', '• Comprehensive error handling and validation', '', ''],
    ['', '• Quality preservation in modification workflows', '', ''],
    ['', '• Australian context-aware content generation', '', ''],
    ['', '', '', ''],
    
    // Troubleshooting
    ['🔍', 'TROUBLESHOOTING & SUPPORT', '', ''],
    ['', '', '', ''],
    ['⚠️', 'Common Issues', '🛠️ Solutions', ''],
    ['', '• TypeError: undefined errors → Run emergency fixes provided', '', ''],
    ['', '• Module extraction fails → Use restored better extraction function', '', ''],
    ['', '• Quality degradation → Check modification prompt assignment', '', ''],
    ['', '• Workflow inefficiency → Use integrated LMS generation', '', ''],
    ['', '', '', ''],
    
    ['📞', 'Need Help?', '💡 Resources', ''],
    ['', '• Check System Status tab for current project state', '', ''],
    ['', '• Review error logs in Google Apps Script editor', '', ''],
    ['', '• Use Course Creation Wizard for guided assistance', '', ''],
    ['', '• Refer to deployment documentation for critical fixes', '', ''],
  ];
  
  try {
    // Write content to sheet
    const range = sheet.getRange(1, 1, content.length, 4);
    range.setValues(content);
    
    Logger.log(`Added ${content.length} rows of corrected content to How-to-Use sheet`);
  } catch (error) {
    Logger.log(`Error adding content to How-to-Use sheet: ${error.toString()}`);
  }
}

/**
 * ENHANCED: Formatting with better visual hierarchy and readability
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
    
    // Apply formatting based on content patterns
    for (let i = 0; i < values.length; i++) {
      const rowNum = i + 1;
      const cellA = values[i][0] ? values[i][0].toString() : '';
      const cellB = values[i][1] ? values[i][1].toString() : '';
      
      // Main headers (e.g., "GETTING STARTED", "WORKFLOW")
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
 * Additional helper function to maintain sheet consistency
 */
function validateHowToUseSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('How to Use');
    
    if (!sheet) {
      Logger.log('How to Use sheet not found - creating new one');
      createHowToUseTab_();
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 50) { // Expect substantial content
      Logger.log('How to Use sheet appears incomplete - refreshing');
      createHowToUseTab_();
    }
    
    Logger.log('How to Use sheet validation complete');
    
  } catch (error) {
    Logger.log(`Error validating How-to-Use sheet: ${error.toString()}`);
  }
}
/**
 * SIMPLIFIED MENU SYSTEM - CORRECT LAYOUT
 * 
 * Clean, appropriate menu structure with only:
 * 1. Course Creation Wizard
 * 2. Steps 1-10 organised under logical sub-tabs
 * 
 * Removes all inappropriate system tools and extra items.
 * 
 * Author: Assistant for Carla Taylor
 * Date: 2025-09-14
 */

/**
 * SIMPLIFIED onOpen FUNCTION
 * 
 * Creates clean menu with only Wizard and Steps 1-10 under sub-tabs
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // Create simple, clean menu structure
  var menu = ui.createMenu('🎓 Concept-to-Course')
    
    // COURSE CREATION WIZARD
    .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // PROJECT SETUP (Steps 1-3)
    .addSubMenu(ui.createMenu('📋 Project Setup')
      .addItem('Step 1: Setup Course Project', 'step1Setup')
      .addItem('Step 2: Get AI Recommendations', 'step2Recommendation')
      .addItem('Step 3: Create Workspace Structure', 'step3Workspace'))
    
    // CONTENT CREATION (Steps 4-6)
    .addSubMenu(ui.createMenu('✏️ Content Creation')
      .addItem('Step 4: Generate Course Content', 'step4Content')
      .addItem('Step 5: Create LMS Materials', 'step5LMS')
      .addItem('Step 6: Generate Presentation Slides', 'step6Slides'))
    
    // MEDIA PRODUCTION (Steps 7-8)
    .addSubMenu(ui.createMenu('🎵 Media Production')
      .addItem('Step 7: Add Voice Narration', 'step7Voice')
      .addItem('Step 8: Process Audio Files', 'step8Audio'))
    
    // PROJECT COMPLETION (Steps 9-10)
    .addSubMenu(ui.createMenu('🏁 Project Completion')
      .addItem('Step 9: Course Maintenance', 'step9Maintenance')
      .addItem('Step 10: Archive Project', 'step10Archive'));
  
  menu.installMenu();
}

/**
 * ALTERNATIVE LAYOUT 1: Grouped by Workflow Phase
 * 
 * If you prefer different grouping, uncomment this version instead
 */
/*
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  var menu = ui.createMenu('🎓 Concept-to-Course')
    
    // COURSE CREATION WIZARD
    .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // SETUP & PLANNING (Steps 1-3)
    .addSubMenu(ui.createMenu('🛠️ Setup & Planning')
      .addItem('Step 1: Setup Course Project', 'step1Setup')
      .addItem('Step 2: Get AI Recommendations', 'step2Recommendation')
      .addItem('Step 3: Create Workspace Structure', 'step3Workspace'))
    
    // CONTENT DEVELOPMENT (Steps 4-6)
    .addSubMenu(ui.createMenu('📝 Content Development')
      .addItem('Step 4: Generate Course Content', 'step4Content')
      .addItem('Step 5: Create LMS Materials', 'step5LMS')
      .addItem('Step 6: Generate Presentation Slides', 'step6Slides'))
    
    // MEDIA & FINALISATION (Steps 7-10)
    .addSubMenu(ui.createMenu('🎬 Media & Finalisation')
      .addItem('Step 7: Add Voice Narration', 'step7Voice')
      .addItem('Step 8: Process Audio Files', 'step8Audio')
      .addItem('Step 9: Course Maintenance', 'step9Maintenance')
      .addItem('Step 10: Archive Project', 'step10Archive'));
  
  menu.installMenu();
}
*/

/**
 * ALTERNATIVE LAYOUT 2: Simple Two-Group Structure
 * 
 * Even simpler grouping if preferred
 */
/*
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  var menu = ui.createMenu('🎓 Concept-to-Course')
    
    // COURSE CREATION WIZARD
    .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // COURSE DEVELOPMENT (Steps 1-6)
    .addSubMenu(ui.createMenu('📚 Course Development')
      .addItem('Step 1: Setup Course Project', 'step1Setup')
      .addItem('Step 2: Get AI Recommendations', 'step2Recommendation')
      .addItem('Step 3: Create Workspace Structure', 'step3Workspace')
      .addItem('Step 4: Generate Course Content', 'step4Content')
      .addItem('Step 5: Create LMS Materials', 'step5LMS')
      .addItem('Step 6: Generate Presentation Slides', 'step6Slides'))
    
    // COURSE FINALISATION (Steps 7-10)
    .addSubMenu(ui.createMenu('🎯 Course Finalisation')
      .addItem('Step 7: Add Voice Narration', 'step7Voice')
      .addItem('Step 8: Process Audio Files', 'step8Audio')
      .addItem('Step 9: Course Maintenance', 'step9Maintenance')
      .addItem('Step 10: Archive Project', 'step10Archive'));
  
  menu.installMenu();
}
*/
/**
 * REAL MENU SYSTEM FIX - ACTUAL FUNCTION NAMES
 * 
 * This creates the proper menu with the REAL function names from your script,
 * not the made-up step1Setup nonsense I was creating.
 * 
 * URGENT FIX for Carla Taylor
 * Date: 2025-09-14
 */

/**
 * CORRECTED onOpen with REAL function names from your actual script
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Create clean menu with ACTUAL functions from your script
  ui.createMenu('🎓 Concept-to-Course')
    
    // COURSE CREATION WIZARD
    .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // PROJECT SETUP
    .addSubMenu(ui.createMenu('📋 Project Setup')
      .addItem('Step 1: Setup Mapping & Approved Course', 'createApprovedCourseTab')
      .addItem('Step 2: Generate Course Recommendation', 'generateCourseRecommendation')
      .addItem('Step 3: Create Course Content Structure', 'createCourseContentTabs'))
    
    // CONTENT GENERATION  
    .addSubMenu(ui.createMenu('✏️ Content Generation')
      .addItem('Step 4: Generate Full Suite of Resources', 'generateFullSuiteOfResources')
      .addItem('Step 5: Generate LMS File', 'generateAbsorbLmsFile')
      .addItem('Step 6: Generate Slides for Module', 'generateSlidesForSelectedModule'))
    
    // AUDIO & FINALISATION
    .addSubMenu(ui.createMenu('🎵 Audio & Finalisation')
      .addItem('Step 7: Generate Voiceover Scripts', 'generateVoiceoverScripts')
      .addItem('Step 8: Generate Audio for Module', 'generateAllAudioForModule'))
    
    // UTILITIES
    .addSeparator()
    .addItem('📖 How to Use', 'showHowToUse')
    
    .installMenu();
}
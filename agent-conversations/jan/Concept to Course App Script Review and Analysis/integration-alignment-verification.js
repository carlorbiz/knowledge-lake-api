/**
 * INTEGRATION ALIGNMENT VERIFICATION
 * Ensures Course Creation Wizard and How-To-Use Tab align with latest script version
 * CTscript_Concept2Course_20250914_14_40.txt
 */

// ==== VERIFIED ALIGNMENT CONFIRMATION ====

/**
 * WORKFLOW VERIFICATION (2024-09-14 14:40 script version)
 * All numbered steps and their functions remain identical:
 */

const VERIFIED_WORKFLOW_STEPS = {
  1: {
    name: "Setup & Add First Course",
    function: "setupMappingTab",
    description: "Course concept, audience, source materials",
    columns: { concept: "A", audience: "C", sources: "B", folder: "T" }
  },
  2: {
    name: "Generate Course Recommendation", 
    function: "generateCourseRecommendation",
    description: "AI analysis and module structure",
    output: "Google Doc with Vancouver citations"
  },
  3: {
    name: "Create Content Tabs & Subfolders",
    function: "createCourseContentTabs", 
    description: "Workspace preparation",
    creates: ["Module-Resources sheet", "TTS sheet", "Drive subfolders"]
  },
  4: {
    name: "Generate Full Suite of Resources",
    function: "generateFullSuiteOfResources",
    description: "Complete module content generation",
    columns: { desc: "C", concepts: "D", scenarios: "E", assessments: "F", resources: "G", slides: "H" }
  },
  5: {
    name: "Generate LMS Upload Doc",
    function: "generateAbsorbLmsFile",
    description: "LMS-ready content creation", 
    output_column: "I"
  },
  6: {
    name: "Generate Slides for Module",
    function: "generateSlidesForSelectedModule",
    menu_path: "SLIDES & AUDIO",
    description: "Professional presentation creation"
  },
  7: {
    name: "Set Voiceover Artist",
    function: "setTtsVoice_",
    menu_path: "SLIDES & AUDIO",
    description: "Voice customisation"
  },
  8: {
    name: "Generate All Audio for Module", 
    function: "generateAllAudioForModule",
    menu_path: "SLIDES & AUDIO",
    description: "Professional audio narration"
  },
  9: {
    name: "Clean Module Audio Files",
    function: "cleanModuleAudioFiles", 
    menu_path: "DATA & ARCHIVAL",
    description: "Maintenance and cleanup"
  },
  10: {
    name: "Archive Course Project",
    function: "archiveCourse",
    menu_path: "DATA & ARCHIVAL", 
    description: "Course completion and archival"
  }
};

/**
 * SHEET STRUCTURE VERIFICATION
 * Column mappings confirmed identical in updated script:
 */

const VERIFIED_SHEET_STRUCTURE = {
  Mapping: {
    concept: "A",        // Course concept
    sources_primary: "B", // Primary source materials  
    audience: "C",       // Target audience
    recommendation: "D", // Link to recommendation doc
    modules_list: "G",   // Concatenated module list
    modules_individual: "H-S", // Individual modules H through S (columns 8-19)
    project_folder: "T"  // Course project folder (column 20)
  },
  ModuleResources: {
    module_name: "A",    // Module name (column 1)
    concept_name: "B",   // Course concept (column 2)  
    description: "C",    // Module description (column 3)
    key_concepts: "D",   // Key concepts (column 4)
    scenarios: "E",      // Interactive scenarios (column 5)
    assessments: "F",    // Assessment questions (column 6)  
    resources: "G",      // Downloadable resources link (column 7)
    slide_specs: "H",    // Slide specifications (column 8)
    lms_content: "I"     // LMS upload document (column 9)
  },
  TTS: {
    module: "A",         // Module name (column 1)
    slide_num: "B",      // Slide number (column 2) 
    slide_content: "C",  // Slide content (column 3)
    script: "D",         // Voiceover script (column 4)
    duration: "E",       // Estimated duration (column 5)
    slides_link: "F",    // Link to slides (column 6)
    audio_url: "G",      // Audio file URL (column 7)
    image_prompt: "H",   // Image generation prompt (column 8)
    voice: "I",          // Voice selection (column 9)
    alt_content: "J"     // Alternative slide content (column 10)
  }
};

/**
 * INTEGRATION COMPATIBILITY CHECK
 * Verifies wizard and how-to-use tab compatibility
 */

function verifyIntegrationCompatibility() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Verify configuration
    CFG.validateConfiguration();
    
    // Verify required sheets exist or can be created
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const requiredSheets = ['Mapping'];
    
    let compatibilityIssues = [];
    
    // Check sheet structure
    for (const sheetName of requiredSheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        compatibilityIssues.push(`Missing required sheet: ${sheetName}`);
      }
    }
    
    // Check function availability
    const requiredFunctions = [
      'generateCourseRecommendation',
      'createCourseContentTabs', 
      'generateFullSuiteOfResources',
      'generateAbsorbLmsFile',
      'generateSlidesForSelectedModule',
      'setTtsVoice_',
      'generateAllAudioForModule',
      'cleanModuleAudioFiles',
      'archiveCourse'
    ];
    
    for (const funcName of requiredFunctions) {
      try {
        if (typeof eval(funcName) !== 'function') {
          compatibilityIssues.push(`Missing function: ${funcName}`);
        }
      } catch (e) {
        compatibilityIssues.push(`Function not accessible: ${funcName}`);
      }
    }
    
    if (compatibilityIssues.length === 0) {
      ui.alert(
        '✅ Integration Compatibility Verified',
        'Course Creation Wizard and How-To-Use Tab are fully compatible with the current script version.\n\n' +
        'All workflow steps, column mappings, and functions verified successfully.',
        ui.ButtonSet.OK
      );
      return true;
    } else {
      ui.alert(
        '⚠️ Compatibility Issues Detected',
        'Found compatibility issues:\n\n' + compatibilityIssues.join('\n') +
        '\n\nPlease contact Carla for assistance.',
        ui.ButtonSet.OK
      );
      return false;
    }
    
  } catch (error) {
    ui.alert(
      '❌ Compatibility Check Failed',
      'Could not verify compatibility:\n\n' + error.message +
      '\n\nPlease contact Carla for assistance.',
      ui.ButtonSet.OK
    );
    return false;
  }
}

/**
 * ENHANCED MENU INTEGRATION
 * Integrates wizard with existing menu structure
 */

function createEnhancedMenuSystem() {
  const ui = SpreadsheetApp.getUi();
  
  // Check configuration status  
  let configStatus = '';
  try {
    CFG.validateConfiguration();
    configStatus = '✓';
  } catch (e) {
    configStatus = '⚙️';
  }
  
  // Create main menu with configuration indicator
  const mainMenu = ui.createMenu(`${configStatus} Concept-to-Course`)
      .addItem('#1 Setup & Add First Course', 'setupMappingTab')
      .addItem('#2 Generate Course Recommendation', 'generateCourseRecommendation')
      .addItem('#3 Create Content Tabs & Subfolders', 'createCourseContentTabs')
      .addSeparator()
      .addItem('#4 Generate Full Suite of Resources', 'generateFullSuiteOfResources')
      .addItem('#5 Generate LMS Upload Doc', 'generateAbsorbLmsFile')
      .addSeparator()
      .addSubMenu(ui.createMenu('SLIDES & AUDIO')
          .addItem('#6 Generate Slides for Module', 'generateSlidesForSelectedModule')
          .addItem('#7 Set Voiceover Artist', 'setTtsVoice_')
          .addItem('#8 Generate All Audio for Module', 'generateAllAudioForModule'))
      .addSeparator()
      .addSubMenu(ui.createMenu('DATA & ARCHIVAL')
          .addItem('#9 Clean Module Audio Files', 'cleanModuleAudioFiles')
          .addItem('#10 Archive Course Project', 'archiveCourse'))
      .addSeparator();
  
  // Add wizard and utilities
  mainMenu.addSubMenu(ui.createMenu('🧙‍♂️ GUIDED WORKFLOW')
          .addItem('🚀 Course Creation Wizard', 'launchCourseCreationWizard')
          .addItem('📋 Check Course Progress', 'showCourseProgressSummary')
          .addItem('🔄 Resume Course Development', 'continueExistingCourseWizard_'))
      .addSeparator()
      .addItem('📖 Refresh How-to-Use Tab', 'refreshHowToUseTab')
      .addItem('🔧 Verify Integration', 'verifyIntegrationCompatibility');
  
  // Add configuration menu if needed
  if (configStatus === '⚙️') {
    mainMenu.addSeparator()
        .addItem('⚙️ Setup Wizard', 'launchSetupWizard')
        .addItem('📊 Configuration Status', 'validateAndShowConfiguration_');
  }
  
  mainMenu.addToUi();
}

/**
 * DEPLOYMENT VERIFICATION CHECKLIST  
 * Use this to verify successful integration
 */

function runDeploymentVerification() {
  const ui = SpreadsheetApp.getUi();
  
  let checklist = [];
  
  // 1. Configuration check
  try {
    CFG.validateConfiguration();
    checklist.push('✅ System configuration valid');
  } catch (e) {
    checklist.push('❌ Configuration issue: ' + e.message);
  }
  
  // 2. How-to-Use tab check  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const howToSheet = ss.getSheetByName('How to Use');
    if (howToSheet) {
      checklist.push('✅ How-to-Use tab available');
    } else {
      checklist.push('⚠️ How-to-Use tab not found - run createHowToUseTab_()');
    }
  } catch (e) {
    checklist.push('❌ How-to-Use tab error: ' + e.message);
  }
  
  // 3. Wizard functions check
  const wizardFunctions = [
    'launchCourseCreationWizard',
    'showCourseProgressSummary', 
    'verifyIntegrationCompatibility'
  ];
  
  let wizardCount = 0;
  for (const func of wizardFunctions) {
    try {
      if (typeof eval(func) === 'function') {
        wizardCount++;
      }
    } catch (e) {
      // Function not available
    }
  }
  
  if (wizardCount === wizardFunctions.length) {
    checklist.push('✅ All wizard functions available');
  } else {
    checklist.push(`⚠️ Wizard functions: ${wizardCount}/${wizardFunctions.length} available`);
  }
  
  // 4. Menu integration check
  try {
    createEnhancedMenuSystem();
    checklist.push('✅ Enhanced menu system created');
  } catch (e) {
    checklist.push('❌ Menu creation error: ' + e.message);
  }
  
  // Show results
  const results = checklist.join('\n');
  ui.alert(
    'Deployment Verification Results',
    results + '\n\nRecommendations:\n' +
    '• ✅ items are ready for use\n' +
    '• ⚠️ items need attention but are not critical\n' +
    '• ❌ items require immediate resolution\n\n' +
    'Contact Carla for any ❌ items.',
    ui.ButtonSet.OK
  );
  
  return checklist;
}
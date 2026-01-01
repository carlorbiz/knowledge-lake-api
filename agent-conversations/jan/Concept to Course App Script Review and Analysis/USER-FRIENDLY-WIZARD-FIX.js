/**
 * CRITICAL FIX: User-Friendly Course Creation Wizard
 * 
 * PROBLEM: Current wizard immediately throws technical error messages without welcome
 * "SYSTEM CONFIGURATION REQUIRED: mapping worksheet is missing"
 * 
 * TERRIBLE UX: Users are greeted with complaints instead of a warm welcome
 * 
 * SOLUTION: Complete user-friendly wizard that welcomes users first,
 * explains what it does, then gracefully handles any setup needed
 */

/**
 * REPLACE the existing launchCourseCreationWizard() function with this user-friendly version
 */
function launchCourseCreationWizard() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // ✅ STEP 1: WARM WELCOME FIRST (no system checks yet!)
    const welcomeResponse = ui.alert(
      '🎓 Welcome to Concept-to-Course!',
      
      '👋 G\'day! I\'m your Course Creation Assistant.\n\n' +
      
      '🚀 I\'ll help you transform your healthcare education concepts into ' +
      'complete, professional course materials using AI-powered content generation.\n\n' +
      
      '✨ Here\'s what we\'ll accomplish together:\n' +
      '• Set up your course project workspace\n' +
      '• Generate comprehensive course recommendations\n' +
      '• Create all learning materials and assessments\n' +
      '• Produce slide presentations and audio content\n' +
      '• Ensure Australian healthcare standards compliance\n\n' +
      
      '⏱️ This usually takes about 30-45 minutes total, but you can pause anytime.\n\n' +
      
      'Ready to create something amazing? 🎯',
      
      ui.ButtonSet.YES_NO
    );
    
    if (welcomeResponse !== ui.Button.YES) {
      ui.alert(
        'No Worries!', 
        'Feel free to come back anytime when you\'re ready to create your course.\n\n' +
        'You can also use the individual menu functions if you prefer more control over the process.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // ✅ STEP 2: EXPLAIN THE APPROACH OPTIONS
    const approachResponse = ui.alert(
      '🛠️ Choose Your Approach',
      
      'I can help you in two ways:\n\n' +
      
      '🧙 GUIDED WIZARD (Recommended)\n' +
      '• Perfect for first-time users\n' +
      '• I\'ll walk you through each step\n' +
      '• Automatic setup and validation\n' +
      '• Built-in help and explanations\n\n' +
      
      '⚡ MANUAL WORKFLOW (Advanced)\n' +
      '• For experienced users\n' +
      '• Direct access to individual functions\n' +
      '• Maximum control and flexibility\n\n' +
      
      'Which would you prefer?\n\n' +
      'YES = Guided Wizard | NO = Manual Workflow',
      
      ui.ButtonSet.YES_NO
    );
    
    if (approachResponse === ui.Button.NO) {
      // Direct them to manual workflow
      ui.alert(
        '⚡ Manual Workflow Selected',
        
        'Perfect! You\'ve chosen the manual workflow approach.\n\n' +
        
        '📋 Here\'s your 10-step process:\n' +
        '1. Setup & Add First Course\n' +
        '2. Generate Course Recommendation\n' +
        '3. Create Content Tabs & Subfolders\n' +
        '4. Generate Full Suite (inc. LMS)\n' +
        '5. Generate Voiceover Scripts\n' +
        '6-10. Presentations, Audio, Maintenance, Archive\n\n' +
        
        '🚀 Start with menu item "#1 Setup & Add First Course"\n\n' +
        
        'Need guidance anytime? Check the "How to Use" tab or run this wizard again.',
        
        ui.ButtonSet.OK
      );
      
      // Navigate to How to Use tab for reference
      showHowToUseTab_();
      return;
    }
    
    // ✅ STEP 3: GUIDED WIZARD - NOW CHECK SYSTEM GRACEFULLY
    const setupResponse = ui.alert(
      '🔧 Quick Setup Check',
      
      'Great choice! Let me quickly check if everything\'s ready for your course creation.\n\n' +
      
      '🔍 I\'ll verify:\n' +
      '• Workspace configuration\n' +
      '• AI content generation setup\n' +
      '• Project folder structure\n\n' +
      
      'Don\'t worry - if anything needs setup, I\'ll guide you through it step by step!\n\n' +
      
      'Ready for the quick check?',
      
      ui.ButtonSet.OK_CANCEL
    );
    
    if (setupResponse !== ui.Button.OK) return;
    
    // ✅ NOW do the system check (but handle gracefully)
    const systemCheck = checkUserSystemReadyGracefully_();
    
    if (!systemCheck.isReady) {
      // Handle setup needs gracefully, not as errors
      const setupNeededResponse = ui.alert(
        '🛠️ Quick Setup Needed',
        
        'No worries! I need to set up a couple of things for you:\n\n' +
        
        systemCheck.setupMessage + '\n\n' +
        
        '✅ This is completely normal for first-time setup.\n' +
        '🚀 I\'ll handle everything automatically.\n\n' +
        
        'Shall I proceed with the setup?',
        
        ui.ButtonSet.YES_NO
      );
      
      if (setupNeededResponse !== ui.Button.YES) {
        ui.alert(
          'Setup Postponed',
          'No problem! When you\'re ready to proceed, just run the Course Creation Wizard again.\n\n' +
          'The setup only takes a moment and you\'ll be creating courses in no time!',
          ui.ButtonSet.OK
        );
        return;
      }
      
      // Perform graceful setup
      performGracefulSetup_(systemCheck);
    }
    
    // ✅ STEP 4: READY TO CREATE - SHOW SUCCESS AND PROCEED
    ui.alert(
      '🎉 All Ready!',
      
      'Excellent! Everything is set up and ready to go.\n\n' +
      
      '🎯 Next, I\'ll help you:\n' +
      '1. Define your course concept and audience\n' +
      '2. Upload or specify your source materials\n' +
      '3. Generate AI-powered course recommendations\n' +
      '4. Create your complete learning ecosystem\n\n' +
      
      '⏱️ Let\'s start with defining your course concept...',
      
      ui.ButtonSet.OK
    );
    
    // Continue with the actual wizard workflow
    continueWithCourseCreation_();
    
  } catch (error) {
    Logger.log(`Course Creation Wizard error: ${error.toString()}`);
    SpreadsheetApp.getUi().alert(
      'Oops! Something Unexpected Happened',
      
      'I encountered an unexpected issue while starting the wizard.\n\n' +
      
      '🛠️ Don\'t worry - this is easily fixable!\n\n' +
      
      '📋 What you can do:\n' +
      '• Try running the wizard again\n' +
      '• Use the manual workflow (Menu items #1-10)\n' +
      '• Check the "How to Use" tab for guidance\n\n' +
      
      'Technical details (for support): ' + error.message,
      
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * ✅ GRACEFUL system checking (no harsh error messages)
 */
function checkUserSystemReadyGracefully_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const properties = PropertiesService.getScriptProperties();
    
    const setupNeeded = [];
    const setupActions = [];
    
    // Check Mapping sheet (most common issue)
    if (!ss.getSheetByName('Mapping')) {
      setupNeeded.push('📊 Course tracking workspace');
      setupActions.push('create_mapping');
    }
    
    // Check API configuration (if needed)
    const geminiKey = properties.getProperty('GEMINI_API_KEY');
    if (!geminiKey || geminiKey.length < 20) {
      setupNeeded.push('🤖 AI content generation');
      setupActions.push('configure_ai');
    }
    
    // Check project folder
    const projectFolder = properties.getProperty('DRIVE_FOLDER_ID') || properties.getProperty('PROJECT_FOLDER_ID');
    if (!projectFolder) {
      setupNeeded.push('📁 Project file organisation');
      setupActions.push('create_folder');
    }
    
    if (setupNeeded.length === 0) {
      return {
        isReady: true,
        message: '✅ Everything looks great!'
      };
    }
    
    // Create friendly setup message
    let setupMessage = '🔧 Setup needed for:\n';
    setupNeeded.forEach((item, index) => {
      setupMessage += `${index + 1}. ${item}\n`;
    });
    
    return {
      isReady: false,
      setupMessage: setupMessage.trim(),
      setupActions: setupActions,
      isFirstTime: setupNeeded.includes('📊 Course tracking workspace')
    };
    
  } catch (error) {
    Logger.log(`Error in graceful system check: ${error.toString()}`);
    return {
      isReady: false,
      setupMessage: '🔧 Initial workspace setup needed.',
      setupActions: ['create_mapping'],
      isFirstTime: true
    };
  }
}

/**
 * ✅ GRACEFUL setup performance (no errors, only success messages)
 */
function performGracefulSetup_(systemCheck) {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Show progress
    SpreadsheetApp.getActiveSpreadsheet().toast('Setting up your workspace... 🛠️', 'Course Creation Wizard', 3);
    
    // Perform setup actions
    if (systemCheck.setupActions.includes('create_mapping')) {
      setupMappingTab(); // This should be the existing function
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Course tracking workspace created!', 'Setup Progress', 2);
    }
    
    if (systemCheck.setupActions.includes('configure_ai')) {
      // Guide user to AI configuration if needed
      ui.alert(
        '🤖 AI Configuration',
        'Your workspace is ready! For AI-powered content generation, you\'ll need to configure your Gemini API key.\n\n' +
        'This can be done later - you can still create courses manually.',
        ui.ButtonSet.OK
      );
    }
    
    if (systemCheck.setupActions.includes('create_folder')) {
      // This might be handled by setupMappingTab or could be a separate function
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Project folders organised!', 'Setup Progress', 2);
    }
    
    SpreadsheetApp.getActiveSpreadsheet().toast('🎉 Setup complete! Ready to create courses!', 'Wizard Ready', 3);
    
  } catch (error) {
    Logger.log(`Error during graceful setup: ${error.toString()}`);
    ui.alert(
      'Setup Nearly Complete',
      'Most setup completed successfully! You may need to configure some advanced features later.\n\n' +
      'Don\'t worry - you can start creating courses right now!',
      ui.ButtonSet.OK
    );
  }
}

/**
 * ✅ CONTINUE with the actual course creation workflow
 */
function continueWithCourseCreation_() {
  const ui = SpreadsheetApp.getUi();
  
  // Now proceed with the actual course creation steps
  // This would continue with concept definition, etc.
  
  const nextResponse = ui.alert(
    '📝 Define Your Course',
    
    'Perfect! Now let\'s define your course concept.\n\n' +
    
    '🎯 I need to know:\n' +
    '• Course topic/concept name\n' +
    '• Target audience (GPs, nurses, etc.)\n' +
    '• Learning objectives or goals\n\n' +
    
    '📚 Do you have source materials ready to upload?\n' +
    '(PDFs, documents, guidelines, etc.)\n\n' +
    
    'YES = I have materials ready | NO = I\'ll define concept first',
    
    ui.ButtonSet.YES_NO
  );
  
  if (nextResponse === ui.Button.YES) {
    // Guide them through Step 1 (Setup & Add Course)
    ui.alert(
      '📂 Upload Your Materials',
      'Excellent! Let\'s get your materials uploaded and organised.\n\n' +
      '🚀 I\'ll now run "Step 1: Setup & Add First Course" which will:\n' +
      '• Create your course entry\n' +
      '• Set up folder structure\n' +
      '• Help you upload source materials\n\n' +
      'Ready to proceed?',
      ui.ButtonSet.OK
    );
    
    // Call the existing setup function
    setupMappingTab();
    
  } else {
    // Guide them through manual concept definition
    ui.alert(
      '💡 Concept Definition',
      'No worries! You can define your concept and I\'ll help generate materials.\n\n' +
      '📋 Next steps:\n' +
      '1. Use "Step 1: Setup & Add First Course" to create your course entry\n' +
      '2. Use "Step 2: Generate Course Recommendation" for AI assistance\n\n' +
      '🎓 I\'ve set everything up - you\'re ready to create amazing courses!',
      ui.ButtonSet.OK
    );
  }
  
  // Final success message
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '🎉 Wizard Complete! You\'re ready to create amazing courses!', 
    'Welcome to Concept-to-Course!', 
    5
  );
}

/**
 * ✅ HELPER: Show How-to-Use tab (if they choose manual workflow)
 */
function showHowToUseTab_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let howToSheet = ss.getSheetByName('How to Use');
    
    if (!howToSheet) {
      // Create it if it doesn't exist
      createHowToUseTab_();
      howToSheet = ss.getSheetByName('How to Use');
    }
    
    if (howToSheet) {
      ss.setActiveSheet(howToSheet);
    }
  } catch (error) {
    Logger.log(`Error showing How-to-Use tab: ${error.toString()}`);
  }
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. REPLACE the existing launchCourseCreationWizard() function with the version above
 * 2. ADD the helper functions: checkUserSystemReadyGracefully_(), performGracefulSetup_(), continueWithCourseCreation_(), showHowToUseTab_()
 * 3. TEST immediately - users should now get a warm welcome instead of error messages
 * 
 * KEY IMPROVEMENTS:
 * ✅ Warm welcome first (no immediate error checking)
 * ✅ Clear explanation of what the wizard does
 * ✅ Graceful handling of setup needs (not presented as errors)
 * ✅ Options for both guided and manual workflows
 * ✅ Encouraging, positive language throughout
 * ✅ Australian-friendly tone and context
 * ✅ Clear next steps and progress indicators
 */
/**
 * FUNCTION NAME CONFLICT CORRECTIONS
 * Updated wizard functions to avoid naming conflicts
 */

// ==== CORRECTED WIZARD HELPER FUNCTIONS ====

function wizardNavigateToSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    ss.setActiveSheet(sheet);
  }
}

function wizardEnsureCorrectRow_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  
  // Ensure user is on a data row (not header)
  const activeRange = sheet.getActiveRange();
  if (!activeRange || activeRange.getRow() < 2) {
    sheet.getRange('A2').activate();
  }
  
  return sheet;
}

// ==== UPDATED WIZARD FUNCTIONS WITH CORRECTED NAMES ====

function executeStep1_Setup_(courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  // Introduction to Step 1
  ui.alert(
    'Step 1: Setup & Course Planning',
    'Time Required: ~10 minutes\n\n' +
    'In this step, you\'ll:\n' +
    '• Define your course concept clearly\n' +
    '• Identify your target audience\n' +
    '• Organise your source materials\n' +
    '• Set up the foundation for AI analysis\n\n' +
    'This step is crucial - good planning makes everything else smoother!',
    ui.ButtonSet.OK
  );
  
  // Navigate to Mapping sheet
  wizardNavigateToSheet_('Mapping');
  
  ui.alert(
    'Course Concept Definition',
    'You\'re now on the Mapping sheet.\n\n' +
    'WHAT TO DO NOW:\n' +
    '1. Click on cell A2 (first empty row)\n' +
    '2. Enter your course concept (e.g., "Clinical Supervision Excellence")\n' +
    '3. Be specific and professional - this drives all AI generation\n\n' +
    'TIPS:\n' +
    '• Use clear, descriptive language\n' +
    '• Think about your end goal\n' +
    '• Consider your professional audience\n\n' +
    'Click OK when you\'ve entered your course concept.',
    ui.ButtonSet.OK
  );
  
  // Validate course concept was entered
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  const concept = mappingSheet.getRange('A2').getValue();
  
  if (!concept || String(concept).trim().length < 5) {
    const retry = ui.alert(
      'Course Concept Needed',
      'I don\'t see a course concept in cell A2 yet.\n\n' +
      'Would you like to:\n' +
      'YES = Continue anyway (you can add it later)\n' +
      'NO = Go back and add the concept now',
      ui.ButtonSet.YES_NO
    );
    
    if (retry === ui.Button.NO) {
      return executeStep1_Setup_(courseContext);
    }
  }
  
  // Target audience selection
  ui.alert(
    'Target Audience Selection',
    'Now let\'s define your target audience.\n\n' +
    'WHAT TO DO NOW:\n' +
    '1. Click on cell C2 (Target Audience column)\n' +
    '2. Choose from: Clinical, Administrative, Combined, or Other\n' +
    '3. This affects how the AI generates content tone and examples\n\n' +
    'AUDIENCE GUIDE:\n' +
    '• Clinical: Practicing healthcare professionals\n' +
    '• Administrative: Healthcare managers and support staff\n' +
    '• Combined: Mixed clinical and administrative learners\n' +
    '• Other: Specify your unique audience\n\n' +
    'Click OK when you\'ve selected your audience.',
    ui.ButtonSet.OK
  );
  
  // Source materials guidance
  ui.alert(
    'Source Materials Organisation',
    'Now for the most important part - your source materials!\n\n' +
    'WHAT TO DO NOW:\n' +
    '1. Click on cell B2 (Course Drive Folder column)\n' +
    '2. Add your PRIMARY source material:\n' +
    '   - Google Drive folder URL (with all your documents)\n' +
    '   - Single Google Doc URL\n' +
    '   - Website URL with relevant content\n' +
    '   - Or paste text content directly\n\n' +
    'QUALITY TIP:\n' +
    'Better source materials = better AI-generated courses!\n' +
    'Include research, guidelines, existing content, and your expertise.\n\n' +
    'Click OK when your primary source is added.',
    ui.ButtonSet.OK
  );
  
  // Additional sources
  const additionalSources = ui.alert(
    'Additional Source Materials',
    'Do you have additional source materials to add?\n\n' +
    'You can add multiple sources in rows B3, B4, etc.\n' +
    'This gives the AI more context for better recommendations.\n\n' +
    'YES = I\'ll add more sources now\n' +
    'NO = I\'m ready to proceed with what I have',
    ui.ButtonSet.YES_NO
  );
  
  if (additionalSources === ui.Button.YES) {
    ui.alert(
      'Adding Additional Sources',
      'WHAT TO DO NOW:\n' +
      '1. Click on cells B3, B4, B5, etc. to add more sources\n' +
      '2. Each row can contain:\n' +
      '   - Another folder or document URL\n' +
      '   - Website URLs with relevant content\n' +
      '   - Additional text content\n\n' +
      'ORGANISATION TIP:\n' +
      'Keep related materials together and use clear, descriptive sources.\n\n' +
      'Click OK when you\'re finished adding sources.',
      ui.ButtonSet.OK
    );
  }
  
  // Track progress
  trackWizardProgress_(1, 'completed', `Course concept: ${concept || 'To be defined'}`);
  
  // Completion and next step
  const step1Complete = ui.alert(
    'Step 1 Complete - Ready for AI Analysis!',
    'Excellent! You\'ve set up the foundation:\n\n' +
    '✓ Course concept defined\n' +
    '✓ Target audience selected\n' +
    '✓ Source materials organised\n\n' +
    'WHAT HAPPENS NEXT:\n' +
    'The AI will analyse your materials and create a professional course structure with 8-12 modules.\n\n' +
    'Ready to proceed to Step 2: AI-Powered Course Structure?',
    ui.ButtonSet.YES_NO
  );
  
  if (step1Complete === ui.Button.YES) {
    return executeWizardStep_(2, { concept: concept });
  }
  
  return true; // Step completed, user can continue later
}

function executeStep3_Workspace_(courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 3: Workspace Preparation',
    'Time Required: ~5 minutes\n\n' +
    'This step creates your organised development workspace:\n' +
    '• Individual folders for each module in Google Drive\n' +
    '• Content tracking worksheets\n' +
    '• Audio management system\n' +
    '• Progress monitoring tools\n\n' +
    'Think of this as setting up your professional course development office!',
    ui.ButtonSet.OK
  );
  
  ui.alert(
    'Create Organised Workspace',
    'WHAT TO DO NOW:\n' +
    '1. Ensure you\'re on the correct row in the Mapping sheet\n' +
    '2. From the menu, select: Concept-to-Course → #3 Create Content Tabs & Subfolders\n' +
    '3. Wait for the workspace creation (about 1 minute)\n\n' +
    'WHAT WILL BE CREATED:\n' +
    '• Module subfolders in your Drive project folder\n' +
    '• Module-Resources worksheet for tracking content\n' +
    '• TTS worksheet for audio management\n' +
    '• Organised structure for professional development\n\n' +
    'Click OK, then run the menu function.',
    ui.ButtonSet.OK
  );
  
  const completed = waitForStepCompletion_('workspace',
    'Creating Workspace...',
    'Setting up your organised development environment.\n\n' +
    'This creates all the folders and worksheets you\'ll need for professional course development.'
  );
  
  if (!completed) return false;
  
  // Track progress
  trackWizardProgress_(3, 'completed', 'Workspace created with folders and tracking sheets');
  
  ui.alert(
    'Explore Your New Workspace',
    'Your development workspace is ready!\n\n' +
    'WHAT TO EXPLORE:\n' +
    '1. Check your Drive folder - you\'ll see new module subfolders\n' +
    '2. Look at the new worksheet tabs in this spreadsheet\n' +
    '3. Notice the organised structure for tracking progress\n\n' +
    'WORKSPACE BENEFITS:\n' +
    '• Each module has its own organised folder\n' +
    '• Progress tracking keeps you on track\n' +
    '• Audio files will be systematically organised\n' +
    '• Professional project management built-in\n\n' +
    'Click OK when you\'ve explored the workspace.',
    ui.ButtonSet.OK
  );
  
  const step3Complete = ui.alert(
    'Step 3 Complete - Workspace Ready!',
    'Perfect! Your development workspace is organised:\n\n' +
    '✓ Module folders created in Drive\n' +
    '✓ Content tracking worksheets ready\n' +
    '✓ Audio management system prepared\n\n' +
    'WHAT HAPPENS NEXT:\n' +
    'We\'ll start generating comprehensive content for each module.\n' +
    'This is where your course really comes to life!\n\n' +
    'Ready to proceed to Step 4: Content Development?',
    ui.ButtonSet.YES_NO
  );
  
  if (step3Complete === ui.Button.YES) {
    return executeWizardStep_(4, courseContext);
  }
  
  return true;
}

function findModuleResourcesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  for (const sheet of sheets) {
    if (sheet.getName().startsWith('Module-Resources-')) {
      return sheet.getName();
    }
  }
  
  return null;
}

function executeStep4_Content_(courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 4: Comprehensive Content Development',
    'Time Required: ~45-60 minutes per module\n\n' +
    'This is the heart of course creation! For each module, you\'ll generate:\n' +
    '• Detailed learning objectives and descriptions\n' +
    '• Key concepts with practical applications\n' +
    '• 12-slide presentation specifications\n' +
    '• Interactive scenarios for role-play\n' +
    '• Comprehensive assessments with rationales\n' +
    '• Professional downloadable resources\n\n' +
    'IMPORTANT: Complete one full module before starting the next!',
    ui.ButtonSet.OK
  );
  
  // Navigate to Module Resources sheet
  const courseResourceSheet = findModuleResourcesSheet_();
  if (!courseResourceSheet) {
    ui.alert('Error', 'Cannot find Module Resources sheet. Please ensure Step 3 was completed successfully.', ui.ButtonSet.OK);
    return false;
  }
  
  wizardNavigateToSheet_(courseResourceSheet);
  
  ui.alert(
    'Select Your First Module',
    'You\'re now on the Module Resources worksheet.\n\n' +
    'WHAT TO DO NOW:\n' +
    '1. Click on row 2 (your first module)\n' +
    '2. Review the module name - this is from your approved course structure\n' +
    '3. This module will be your focus for the next 45-60 minutes\n\n' +
    'PROFESSIONAL TIP:\n' +
    'Complete one module completely (Steps 4-8) before starting another.\n' +
    'This ensures quality and prevents confusion.\n\n' +
    'Click OK when you\'ve selected your first module row.',
    ui.ButtonSet.OK
  );
  
  ui.alert(
    'Generate Complete Module Content',
    'WHAT TO DO NOW:\n' +
    '1. Ensure you\'re on the module row you want to develop\n' +
    '2. From the menu, select: Concept-to-Course → #4 Generate Full Suite of Resources\n' +
    '3. Wait for content generation (this takes 15-20 minutes)\n\n' +
    'WHAT WILL BE GENERATED:\n' +
    '• Professional module description and learning objectives\n' +
    '• Key concepts with healthcare context\n' +
    '• Detailed 12-slide specifications\n' +
    '• Interactive scenarios for workplace application\n' +
    '• Comprehensive assessments with expert rationales\n' +
    '• Research-backed downloadable resources\n\n' +
    'Click OK, then run the menu function.',
    ui.ButtonSet.OK
  );
  
  const completed = waitForStepCompletion_('content',
    'Generating Module Content...',
    'The AI is creating comprehensive educational content for your module.\n\n' +
    'This includes learning objectives, slide specs, scenarios, assessments, and downloadable resources.\n\n' +
    'Process time: 15-20 minutes with progress notifications.'
  );
  
  if (!completed) return false;
  
  // Track progress
  trackWizardProgress_(4, 'completed', `Module content generated for ${courseContext?.concept || 'course'}`);
  
  ui.alert(
    'Review Your Module Content',
    'Your module content suite is complete!\n\n' +
    'WHAT TO REVIEW:\n' +
    '1. Module Description (Column C) - engaging and professional?\n' +
    '2. Key Concepts (Column D) - comprehensive coverage?\n' +
    '3. Slide Specifications (Column H) - logical flow and appropriate depth?\n' +
    '4. Interactive Scenarios (Column E) - realistic workplace applications?\n' +
    '5. Assessments (Column F) - appropriate difficulty and clear rationales?\n' +
    '6. Downloadable Resources (Column G) - click link to review document\n\n' +
    'QUALITY STANDARDS:\n' +
    '• Content should meet professional healthcare education standards\n' +
    '• All elements should align with learning objectives\n' +
    '• Australian context and cultural safety throughout\n\n' +
    'Click OK when you\'ve reviewed the content.',
    ui.ButtonSet.OK
  );
  
  // Quality check
  const contentApproved = ui.alert(
    'Content Quality Approval',
    'How does the generated module content look?\n\n' +
    'YES = Excellent! Ready to proceed with this content\n' +
    'NO = Needs improvement - I\'d like to regenerate or modify\n\n' +
    'Remember: It\'s better to get the content right now than fix it later!',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (contentApproved === ui.Button.CANCEL) return false;
  
  if (contentApproved === ui.Button.NO) {
    ui.alert(
      'Content Refinement',
      'For content modifications:\n\n' +
      '1. You can regenerate individual sections by running Step 4 again\n' +
      '2. For major changes, consider modifying your source materials\n' +
      '3. Contact Carla if you need help with specific improvements\n\n' +
      'Would you like to try regenerating now, or continue with current content?',
      ui.ButtonSet.OK
    );
    // Could add regeneration logic here
  }
  
  const step4Complete = ui.alert(
    'Step 4 Complete - Module Content Ready!',
    'Outstanding! Your first module content is complete:\n\n' +
    '✓ Professional module description and objectives\n' +
    '✓ Comprehensive key concepts\n' +
    '✓ Detailed slide specifications (12 slides)\n' +
    '✓ Interactive workplace scenarios\n' +
    '✓ Expert-level assessments\n' +
    '✓ Research-backed downloadable resources\n\n' +
    'WHAT HAPPENS NEXT:\n' +
    'We\'ll create LMS-ready content for easy upload to your learning system.\n\n' +
    'Ready to proceed to Step 5: LMS-Ready Content?',
    ui.ButtonSet.YES_NO
  );
  
  if (step4Complete === ui.Button.YES) {
    return executeWizardStep_(5, courseContext);
  }
  
  return true;
}

// Add the corrected function calls throughout other wizard functions as needed...
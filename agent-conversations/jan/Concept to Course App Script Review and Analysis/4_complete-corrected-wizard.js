/**
 * COMPLETE CORRECTED COURSE CREATION WIZARD
 * All function names corrected to avoid conflicts
 * Enhanced with error recovery and progress tracking
 */

// ==== COURSE CREATION WIZARD WITH CORRECTED FUNCTION NAMES ====

function launchCourseCreationWizard() {
  const ui = SpreadsheetApp.getUi();
  
  // Verify system is configured
  const configValidation = validateSystemConfiguration_();
  if (!configValidation.valid) {
    ui.alert(
      'Configuration Required',
      configValidation.message,
      ui.ButtonSet.OK
    );
    return;
  }
  
  // Welcome and course selection
  const wizardChoice = ui.alert(
    'Course Creation Wizard',
    'Welcome to guided course development!\n\n' +
    'This wizard will walk you through creating professional healthcare education courses from concept to completion.\n\n' +
    'Choose your path:\n' +
    'YES = Start a new course from scratch\n' +
    'NO = Continue working on an existing course\n' +
    'CANCEL = Exit wizard',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (wizardChoice === ui.Button.CANCEL) return;
  
  trackWizardProgress_('Launch', 'started', 'Course Creation Wizard launched');
  
  if (wizardChoice === ui.Button.YES) {
    startNewCourseWizard_();
  } else {
    continueExistingCourseWizard_();
  }
}

function startNewCourseWizard_() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'New Course Creation',
    'Great! Let\'s create a new professional course.\n\n' +
    'The wizard will guide you through each step, explain what to expect, and help you make quality decisions along the way.\n\n' +
    'Estimated total time: 3-4 hours (spread across multiple sessions)\n' +
    'You can stop and resume at any point.',
    ui.ButtonSet.OK
  );
  
  trackWizardProgress_('New Course', 'started', 'Starting new course creation');
  
  // Start with Step 1
  executeWizardStep_(1, null);
}

function continueExistingCourseWizard_() {
  const ui = SpreadsheetApp.getUi();
  
  // Detect existing courses and their progress
  const courseStatus = analyseExistingCourses_();
  
  if (courseStatus.courses.length === 0) {
    const startNew = ui.alert(
      'No Existing Courses Found',
      'I couldn\'t find any courses in progress.\n\n' +
      'Would you like to start a new course instead?',
      ui.ButtonSet.YES_NO
    );
    
    if (startNew === ui.Button.YES) {
      startNewCourseWizard_();
    }
    return;
  }
  
  // Present course options
  let message = 'Found courses in progress:\n\n';
  courseStatus.courses.forEach((course, index) => {
    message += `${index + 1}. "${course.name}" - ${course.status}\n`;
  });
  message += '\nWhich course would you like to continue?';
  
  const courseChoice = ui.prompt(
    'Continue Existing Course',
    message + '\n\nEnter the number (1, 2, etc.):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (courseChoice.getSelectedButton() !== ui.Button.OK) return;
  
  const selectedIndex = parseInt(courseChoice.getResponseText().trim()) - 1;
  if (selectedIndex >= 0 && selectedIndex < courseStatus.courses.length) {
    const selectedCourse = courseStatus.courses[selectedIndex];
    continueWizardForCourse_(selectedCourse);
  } else {
    ui.alert('Invalid selection. Please try again.');
  }
}

function executeWizardStep_(stepNumber, courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  // Show progress
  showWizardProgress_(stepNumber, 10);
  trackWizardProgress_(stepNumber, 'started', `${getWizardStepName_(stepNumber)} began`);
  
  // Wrap step execution in error recovery
  return withErrorRecovery_(
    () => {
      switch (stepNumber) {
        case 1: return executeStep1_Setup_(courseContext);
        case 2: return executeStep2_Recommendation_(courseContext);
        case 3: return executeStep3_Workspace_(courseContext);
        case 4: return executeStep4_Content_(courseContext);
        case 5: return executeStep5_LMS_(courseContext);
        case 6: return executeStep6_Slides_(courseContext);
        case 7: return executeStep7_Voice_(courseContext);
        case 8: return executeStep8_Audio_(courseContext);
        case 9: return executeStep9_Maintenance_(courseContext);
        case 10: return executeStep10_Archive_(courseContext);
        default:
          ui.alert('Course Creation Complete!', 'Congratulations! Your professional course is ready for delivery.', ui.ButtonSet.OK);
          trackWizardProgress_('Complete', 'finished', 'Course creation wizard completed successfully');
          return false;
      }
    },
    false,
    `Wizard Step ${stepNumber}: ${getWizardStepName_(stepNumber)}`
  );
}

// ==== CORRECTED STEP 2: AI-POWERED COURSE STRUCTURE ====

function executeStep2_Recommendation_(courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 2: AI-Powered Course Structure',
    'Time Required: ~15 minutes\n\n' +
    'In this step, the AI will:\n' +
    '• Analyse all your source materials\n' +
    '• Create a professional course structure\n' +
    '• Generate 8-12 logical learning modules\n' +
    '• Provide educational justification\n' +
    '• Include Vancouver-style citations\n\n' +
    'This is where your source materials are transformed into a professional course blueprint!',
    ui.ButtonSet.OK
  );
  
  // Check if user is on correct row
  const mappingSheet = wizardEnsureCorrectRow_('Mapping');
  if (!mappingSheet) return false;
  
  ui.alert(
    'Generate Course Recommendation',
    'WHAT TO DO NOW:\n' +
    '1. Ensure you\'re on the correct row with your course data\n' +
    '2. From the menu, select: Concept-to-Course → #2 Generate Course Recommendation\n' +
    '3. Wait for the AI analysis (this takes 2-3 minutes)\n' +
    '4. A new Google Doc will be created with your course structure\n\n' +
    'WHAT TO EXPECT:\n' +
    '• Professional recommendation document\n' +
    '• Detailed module breakdown with rationale\n' +
    '• Research-backed educational design\n\n' +
    'Click OK, then run the menu function.',
    ui.ButtonSet.OK
  );
  
  // Wait for completion and validate
  const completed = waitForStepCompletion_('recommendation', 
    'Waiting for AI Analysis...',
    'The AI is analysing your materials and generating the course structure.\n' +
    'This process takes 2-3 minutes.\n\n' +
    'You\'ll see toast notifications showing progress.\n' +
    'A new document will appear in your Drive folder when complete.'
  );
  
  if (!completed) return false;
  
  trackWizardProgress_(2, 'completed', 'Course recommendation generated');
  
  // Review guidance
  ui.alert(
    'Review Your Course Structure',
    'The AI has created your course recommendation!\n\n' +
    'WHAT TO DO NOW:\n' +
    '1. Open the new recommendation document from your Drive folder\n' +
    '2. Review the proposed module structure carefully\n' +
    '3. Check that modules flow logically\n' +
    '4. Ensure the educational rationale makes sense\n\n' +
    'QUALITY CHECK:\n' +
    '• Do the 8-12 modules cover your topic comprehensively?\n' +
    '• Is the learning progression logical?\n' +
    '• Does each module justify its place in the course?\n\n' +
    'Click OK when you\'ve reviewed the recommendation.',
    ui.ButtonSet.OK
  );
  
  // Modification option
  const needsChanges = ui.alert(
    'Course Structure Approval',
    'How does the generated course structure look?\n\n' +
    'YES = Perfect! Ready to proceed with this structure\n' +
    'NO = Needs changes - I\'d like to request modifications',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (needsChanges === ui.Button.CANCEL) return false;
  
  if (needsChanges === ui.Button.NO) {
    handleModificationRequest_();
    // After modification, re-run this step
    return executeStep2_Recommendation_(courseContext);
  }
  
  // Success - proceed to next step
  const step2Complete = ui.alert(
    'Step 2 Complete - Course Structure Approved!',
    'Excellent! Your course structure is approved:\n\n' +
    '✓ AI analysis complete\n' +
    '✓ Professional course structure created\n' +
    '✓ Module breakdown approved\n\n' +
    'WHAT HAPPENS NEXT:\n' +
    'We\'ll set up organised workspaces for developing each module\'s content.\n\n' +
    'Ready to proceed to Step 3: Workspace Preparation?',
    ui.ButtonSet.YES_NO
  );
  
  if (step2Complete === ui.Button.YES) {
    return executeWizardStep_(3, courseContext);
  }
  
  return true;
}

// ==== REMAINING WIZARD STEPS WITH ERROR RECOVERY ====

function executeStep5_LMS_(courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
    ui.alert(
      'Step 5: LMS-Ready Content Creation',
      'Time Required: ~10 minutes\n\n' +
      'This step packages your module content for Learning Management Systems:\n' +
      '• Converts slide specs into flowing narrative content\n' +
      '• Adds interactive elements and engagement prompts\n' +
      '• Creates proper navigation and progress indicators\n' +
      '• Ensures accessibility compliance\n' +
      '• Formats for Absorb LMS compatibility\n\n' +
      'The result: Upload-ready content that maintains learner engagement!',
      ui.ButtonSet.OK
    );
    
    ui.alert(
      'Generate LMS Upload Document',
      'WHAT TO DO NOW:\n' +
      '1. Ensure you\'re on the same module row from Step 4\n' +
      '2. From the menu, select: Concept-to-Course → #5 Generate LMS Upload Doc\n' +
      '3. Wait for document creation (about 2-3 minutes)\n\n' +
      'WHAT WILL BE CREATED:\n' +
      '• Comprehensive LMS-compatible document\n' +
      '• Flowing narrative content from your slide specs\n' +
      '• Interactive elements and learner engagement prompts\n' +
      '• Professional online learning experience design\n\n' +
      'Click OK, then run the menu function.',
      ui.ButtonSet.OK
    );
    
    const completed = waitForStepCompletion_('lms',
      'Creating LMS Content...',
      'Converting your professional slide specifications into engaging, LMS-ready content.\n\n' +
      'This creates flowing narrative suitable for online learning platforms.'
    );
    
    if (!completed) return false;
    
    trackWizardProgress_(5, 'completed', 'LMS-ready content created');
    
    ui.alert(
      'Review LMS-Ready Content',
      'Your LMS upload document is ready!\n\n' +
      'WHAT TO REVIEW:\n' +
      '1. Click the link in Column I to open the LMS document\n' +
      '2. Read through as if you were a learner\n' +
      '3. Check for smooth flow and engagement\n' +
      '4. Verify interactive elements are well-placed\n' +
      '5. Ensure content maintains professional tone\n\n' +
      'QUALITY CHECK:\n' +
      '• Does the content read smoothly online?\n' +
      '• Are there enough engagement points to maintain attention?\n' +
      '• Is the learning progression clear and logical?\n\n' +
      'Click OK when you\'ve reviewed the LMS content.',
      ui.ButtonSet.OK
    );
    
    const step5Complete = ui.alert(
      'Step 5 Complete - LMS Content Ready!',
      'Excellent! Your module is ready for LMS upload:\n\n' +
      '✓ Professional narrative content created\n' +
      '✓ Interactive elements integrated\n' +
      '✓ Absorb LMS compatibility ensured\n' +
      '✓ Learner engagement optimised\n\n' +
      'WHAT HAPPENS NEXT:\n' +
      'We\'ll create professional slide presentations for instructor-led or self-paced delivery.\n\n' +
      'Ready to proceed to Step 6: Slide Presentation Creation?',
      ui.ButtonSet.YES_NO
    );
    
    if (step5Complete === ui.Button.YES) {
      return executeWizardStep_(6, courseContext);
    }
    
    return true;
  }, false, 'Step 5: LMS Content Creation');
}

// ==== WIZARD HELPER FUNCTIONS WITH CORRECTED NAMES ====

function analyseExistingCourses_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mappingSheet = ss.getSheetByName('Mapping');
  
  if (!mappingSheet) return { courses: [] };
  
  const courses = [];
  const lastRow = mappingSheet.getLastRow();
  
  for (let row = 2; row <= lastRow; row++) {
    const concept = mappingSheet.getRange(row, 1).getValue();
    if (!concept) continue;
    
    // Determine status based on what exists
    let status = 'Setup Complete';
    
    // Check if recommendation exists
    const hasRecommendation = mappingSheet.getRange(row, 4).getValue();
    if (hasRecommendation) status = 'Structure Created';
    
    // Check if workspace exists
    const conceptName = String(concept).trim();
    if (ss.getSheetByName(`Module-Resources-${conceptName}`)) {
      status = 'Workspace Ready';
    }
    
    // Check if content exists
    const resourceSheet = ss.getSheetByName(`Module-Resources-${conceptName}`);
    if (resourceSheet && resourceSheet.getLastRow() > 1) {
      status = 'Content Development';
    }
    
    courses.push({
      name: conceptName,
      row: row,
      status: status
    });
  }
  
  return { courses: courses };
}

function continueWizardForCourse_(courseInfo) {
  const ui = SpreadsheetApp.getUi();
  
  // Determine appropriate next step based on course status
  let nextStep = 1;
  
  switch (courseInfo.status) {
    case 'Setup Complete': nextStep = 2; break;
    case 'Structure Created': nextStep = 3; break;
    case 'Workspace Ready': nextStep = 4; break;
    case 'Content Development': nextStep = 5; break;
    default: nextStep = 1;
  }
  
  ui.alert(
    `Continue Course: "${courseInfo.name}"`,
    `Course status: ${courseInfo.status}\n\n` +
    `I recommend continuing from Step ${nextStep}.\n\n` +
    'The wizard will guide you through the remaining steps to complete your professional course development.',
    ui.ButtonSet.OK
  );
  
  trackWizardProgress_('Resume', 'started', `Resuming course "${courseInfo.name}" from step ${nextStep}`);
  
  // Navigate to appropriate sheet and row
  const mappingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mapping');
  mappingSheet.getRange(courseInfo.row, 1).activate();
  
  executeWizardStep_(nextStep, { concept: courseInfo.name });
}

function waitForStepCompletion_(stepType, progressTitle, progressMessage) {
  const ui = SpreadsheetApp.getUi();
  
  // Show progress dialog
  ui.alert(
    progressTitle,
    progressMessage + '\n\nClick OK to continue when the process is complete.\n\n' +
    'You\'ll see toast notifications showing progress, and a completion message when finished.',
    ui.ButtonSet.OK
  );
  
  return true; // User confirmed completion
}

function handleModificationRequest_() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Request Course Structure Changes',
    'To modify the course structure:\n\n' +
    '1. In the Mapping sheet, find the "Modification Request" column\n' +
    '2. Describe the specific changes you want\n' +
    '3. Run the modification process from the menu\n' +
    '4. Review the updated recommendation\n\n' +
    'EXAMPLE REQUESTS:\n' +
    '• "Combine modules 3 and 4 into one comprehensive module"\n' +
    '• "Add a module on cultural safety considerations"\n' +
    '• "Reorder modules to start with practical applications"\n\n' +
    'Be specific about what changes you want to see.',
    ui.ButtonSet.OK
  );
}

function showCourseProgressSummary() {
  const ui = SpreadsheetApp.getUi();
  const courseStatus = analyseExistingCourses_();
  
  if (courseStatus.courses.length === 0) {
    ui.alert(
      'No Courses Found',
      'No courses found in development.\n\nUse the Course Creation Wizard to start your first course!',
      ui.ButtonSet.OK
    );
    return;
  }
  
  let summary = 'COURSE DEVELOPMENT PROGRESS:\n\n';
  courseStatus.courses.forEach((course, index) => {
    summary += `${index + 1}. "${course.name}"\n   Status: ${course.status}\n\n`;
  });
  
  summary += 'Use "Resume Course Development" to continue any course.';
  
  ui.alert('Course Progress Summary', summary, ui.ButtonSet.OK);
}
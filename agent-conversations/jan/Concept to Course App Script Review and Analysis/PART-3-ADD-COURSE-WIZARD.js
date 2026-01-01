/**
 * PART 3: COURSE CREATION WIZARD - ADD THESE FUNCTIONS
 * 
 * INSTRUCTIONS:
 * 1. Copy all functions below
 * 2. Paste at the END of your Google Apps Script (after PART-2 functions)
 * 3. These are the CORRECTED wizard functions that work with the enhanced system
 * 
 * NOTE: Do NOT use the launchCourseCreationWizard from your uploaded file - 
 * it's an older version with compatibility issues!
 */

/**
 * Launch the Course Creation Wizard - CORRECTED VERSION
 */
function launchCourseCreationWizard() {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
    // Verify system is configured using the new validation function
    const validation = validateSystemConfiguration_(false);
    if (!validation.isValid) {
      ui.alert(
        'Configuration Required',
        'The system needs to be configured before creating courses.\n\n' +
        'Please run the Setup Wizard first to configure your API keys and project folder.',
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
    
    trackWizardProgress_('Course Creation Wizard', 'Started', 
      wizardChoice === ui.Button.YES ? 'New course' : 'Existing course');
    
    if (wizardChoice === ui.Button.YES) {
      startNewCourseWizard_();
    } else {
      continueExistingCourseWizard_();
    }
  }, 'Course Creation Wizard Launch');
}

/**
 * Start new course wizard workflow
 */
function startNewCourseWizard_() {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
    ui.alert(
      'New Course Creation',
      'Great! Let\'s create a new professional course.\n\n' +
      'The wizard will guide you through each step, explain what to expect, and help you make quality decisions along the way.\n\n' +
      'Estimated total time: 3-4 hours (spread across multiple sessions)\n' +
      'You can stop and resume at any point.',
      ui.ButtonSet.OK
    );
    
    // Start with Step 1
    executeWizardStep_(1, null);
  }, 'New Course Wizard');
}

/**
 * Continue existing course wizard workflow
 */
function continueExistingCourseWizard_() {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
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
  }, 'Continue Existing Course');
}

/**
 * Execute a specific wizard step with enhanced error handling
 */
function executeWizardStep_(stepNumber, courseContext) {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
    trackWizardProgress_(`Step ${stepNumber}`, 'In Progress', 
      courseContext ? `Course: ${courseContext.name}` : 'New course');
    
    const stepConfig = getWizardStepConfig_(stepNumber);
    
    if (!stepConfig) {
      ui.alert('Invalid step number. Wizard will exit.');
      return;
    }
    
    // Show step introduction
    const proceed = ui.alert(
      `Step ${stepNumber}: ${stepConfig.title}`,
      stepConfig.description + '\n\n' +
      `Estimated time: ${stepConfig.estimatedTime}\n\n` +
      'Ready to proceed with this step?',
      ui.ButtonSet.YES_NO
    );
    
    if (proceed !== ui.Button.YES) {
      trackWizardProgress_(`Step ${stepNumber}`, 'Skipped', 'User chose not to proceed');
      return;
    }
    
    // Execute the step
    const stepResult = executeStepFunction_(stepNumber, courseContext);
    
    if (stepResult.success) {
      trackWizardProgress_(`Step ${stepNumber}`, 'Completed', stepResult.message || '');
      
      // Ask about continuing to next step
      if (stepNumber < 10) {
        const continueWizard = ui.alert(
          'Step Complete!',
          `Step ${stepNumber} completed successfully.\n\n` +
          'Would you like to continue to the next step?',
          ui.ButtonSet.YES_NO
        );
        
        if (continueWizard === ui.Button.YES) {
          executeWizardStep_(stepNumber + 1, stepResult.courseContext || courseContext);
        }
      } else {
        ui.alert(
          'Course Creation Complete!',
          'Congratulations! You\'ve completed all 10 steps of the course creation process.\n\n' +
          'Your course is now ready for delivery to learners.',
          ui.ButtonSet.OK
        );
        trackWizardProgress_('Course Creation', 'Completed', 'All 10 steps finished');
      }
    } else {
      trackWizardProgress_(`Step ${stepNumber}`, 'Failed', stepResult.error || 'Unknown error');
      ui.alert('Step Error', stepResult.error || 'An error occurred in this step.');
    }
    
  }, `Wizard Step ${stepNumber} Execution`);
}

/**
 * Get configuration for a specific wizard step
 */
function getWizardStepConfig_(stepNumber) {
  const stepConfigs = {
    1: {
      title: 'Setup',
      description: 'Initial project setup and concept definition. We\'ll gather your course concept, target audience, and learning objectives.',
      estimatedTime: '15-20 minutes',
      functionName: 'step1Setup'
    },
    2: {
      title: 'Recommendation',
      description: 'AI-powered course structure recommendations. The system will analyse your concept and suggest an optimal course structure.',
      estimatedTime: '10-15 minutes',
      functionName: 'step2Recommendation'
    },
    3: {
      title: 'Workspace',
      description: 'Create and organise your course workspace. Set up folders, templates, and project structure.',
      estimatedTime: '10-15 minutes',
      functionName: 'step3Workspace'
    },
    4: {
      title: 'Content',
      description: 'Generate and refine course content. Create learning modules, resources, and educational materials.',
      estimatedTime: '45-60 minutes',
      functionName: 'step4Content'
    },
    5: {
      title: 'LMS',
      description: 'Prepare content for Learning Management System. Format and structure content for optimal delivery.',
      estimatedTime: '20-25 minutes',
      functionName: 'step5LMS'
    },
    6: {
      title: 'Slides',
      description: 'Create professional presentation slides. Generate visual aids and presentation materials.',
      estimatedTime: '30-40 minutes',
      functionName: 'step6Slides'
    },
    7: {
      title: 'Voice',
      description: 'Prepare text-to-speech content. Optimise text for natural-sounding voice narration.',
      estimatedTime: '15-20 minutes',
      functionName: 'step7Voice'
    },
    8: {
      title: 'Audio',
      description: 'Generate and process audio files. Create professional audio content for your course.',
      estimatedTime: '20-30 minutes',
      functionName: 'step8Audio'
    },
    9: {
      title: 'Maintenance',
      description: 'Set up ongoing course maintenance. Plan for updates, revisions, and quality assurance.',
      estimatedTime: '10-15 minutes',
      functionName: 'step9Maintenance'
    },
    10: {
      title: 'Archive',
      description: 'Finalise and archive the completed course. Package everything for delivery and future reference.',
      estimatedTime: '15-20 minutes',
      functionName: 'step10Archive'
    }
  };
  
  return stepConfigs[stepNumber] || null;
}

/**
 * Execute the function for a specific step
 */
function executeStepFunction_(stepNumber, courseContext) {
  try {
    const stepConfig = getWizardStepConfig_(stepNumber);
    if (!stepConfig) {
      return { success: false, error: 'Invalid step configuration' };
    }
    
    // Call the original step function
    const stepFunction = eval(stepConfig.functionName);
    if (typeof stepFunction === 'function') {
      stepFunction();
      return { 
        success: true, 
        message: `${stepConfig.title} completed successfully`,
        courseContext: courseContext 
      };
    } else {
      return { 
        success: false, 
        error: `Step function ${stepConfig.functionName} not found` 
      };
    }
  } catch (error) {
    Logger.log(`Error executing step ${stepNumber}: ${error.toString()}`);
    return { 
      success: false, 
      error: `Step execution failed: ${error.message}` 
    };
  }
}

/**
 * Analyse existing courses to determine progress
 */
function analyseExistingCourses_() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = spreadsheet.getSheetByName('Mapping');
    
    if (!mappingSheet) {
      return { courses: [] };
    }
    
    const dataRange = mappingSheet.getDataRange();
    if (dataRange.getNumRows() <= 1) {
      return { courses: [] };
    }
    
    const values = dataRange.getValues();
    const courses = [];
    
    // Analyse each concept row for progress
    for (let i = 1; i < values.length; i++) {
      const concept = values[i][0];
      if (concept && concept.toString().trim()) {
        const courseStatus = determineCourseStatus_(concept, values[i]);
        courses.push({
          name: concept,
          status: courseStatus.status,
          progress: courseStatus.progress,
          nextStep: courseStatus.nextStep
        });
      }
    }
    
    return { courses: courses };
  } catch (error) {
    Logger.log('Error analysing existing courses: ' + error.toString());
    return { courses: [] };
  }
}

/**
 * Determine the status and progress of a course
 */
function determineCourseStatus_(concept, rowData) {
  try {
    // Check various indicators of progress
    const hasBasicInfo = rowData[1] && rowData[2]; // Sources and Audience
    const hasContent = rowData.slice(3, 8).some(cell => cell && cell.toString().trim());
    const hasFolder = rowData[19]; // Column T (project folder)
    
    // Check for module sheets
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const moduleSheet = spreadsheet.getSheetByName(`Module-Resources-${concept}`);
    const ttsSheet = spreadsheet.getSheetByName(`TTS-${concept}`);
    
    let progress = 0;
    let status = 'Not Started';
    let nextStep = 1;
    
    if (hasBasicInfo) {
      progress = 1;
      status = 'Setup Complete';
      nextStep = 2;
    }
    
    if (hasContent) {
      progress = 4;
      status = 'Content in Progress';
      nextStep = 5;
    }
    
    if (moduleSheet) {
      progress = Math.max(progress, 3);
      status = 'Workspace Created';
      if (nextStep <= 3) nextStep = 4;
    }
    
    if (ttsSheet) {
      progress = Math.max(progress, 7);
      status = 'Voice Preparation Complete';
      if (nextStep <= 7) nextStep = 8;
    }
    
    if (hasFolder) {
      progress = Math.max(progress, 2);
      if (status === 'Not Started') {
        status = 'Workspace Setup';
        nextStep = 3;
      }
    }
    
    return {
      status: status,
      progress: progress,
      nextStep: nextStep
    };
  } catch (error) {
    Logger.log(`Error determining status for ${concept}: ${error.toString()}`);
    return {
      status: 'Unknown',
      progress: 0,
      nextStep: 1
    };
  }
}

/**
 * Continue wizard for a specific course
 */
function continueWizardForCourse_(selectedCourse) {
  const ui = SpreadsheetApp.getUi();
  
  return withErrorRecovery_(() => {
    const continueChoice = ui.alert(
      'Continue Course Development',
      `Course: "${selectedCourse.name}"\n` +
      `Current Status: ${selectedCourse.status}\n` +
      `Recommended Next Step: ${selectedCourse.nextStep}\n\n` +
      'Would you like to continue from the recommended step?',
      ui.ButtonSet.YES_NO
    );
    
    if (continueChoice === ui.Button.YES) {
      executeWizardStep_(selectedCourse.nextStep, { name: selectedCourse.name });
    }
  }, 'Continue Course Wizard');
}
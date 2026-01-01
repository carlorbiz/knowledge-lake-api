/**
 * CORRECTED WIZARD SYNTAX FOR GOOGLE APPS SCRIPT
 * 
 * Fixed syntax issues and properly formatted for Apps Script environment
 */

function launchCourseCreationWizard() {
  try {
    var ui = SpreadsheetApp.getUi();
    
    // Check system readiness
    var systemCheck = checkUserSystemReady_();
    if (!systemCheck.ready) {
      ui.alert('System Configuration Required', systemCheck.message, ui.ButtonSet.OK);
      return;
    }

    // Welcome and overview
    var welcomeResponse = ui.alert(
      '🎓 Welcome to Concept-to-Course Wizard!',
      'This guided wizard will help you create professional healthcare education courses.\n\n' +
      'The wizard will guide you through:\n' +
      '1. Course setup and concept definition\n' +
      '2. AI-powered course structure generation\n' +
      '3. Content development workspace creation\n' +
      '4. Resource generation and organisation\n\n' +
      'You can also use individual menu functions for more control.\n\n' +
      'Ready to start your course creation journey?',
      ui.ButtonSet.OK_CANCEL
    );

    if (welcomeResponse !== ui.Button.OK) return;

    // Check if we're on the Mapping sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var mappingSheet = ss.getSheetByName('Mapping');
    
    if (!mappingSheet) {
      var createSheet = ui.alert(
        'Setup Required',
        'No Mapping sheet found. The wizard will create the essential Mapping sheet for your courses.\n\nProceed with setup?',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (createSheet !== ui.Button.OK) return;
      
      // Create mapping sheet first
      setupMappingTab();
      mappingSheet = ss.getSheetByName('Mapping');
    }

    // Ensure we're on the Mapping sheet
    ss.setActiveSheet(mappingSheet);
    
    // Find appropriate row for new course or existing course
    var targetRow = 2; // Default to row 2
    var existingCourse = null;
    
    // Check if there are existing courses
    var lastRow = mappingSheet.getLastRow();
    if (lastRow >= 2) {
      // Look for existing courses
      var existingCourses = [];
      for (var r = 2; r <= lastRow; r++) {
        var concept = String(mappingSheet.getRange(r, 1).getValue() || '').trim();
        if (concept) {
          var status = determineProjectStatus_(mappingSheet, r);
          existingCourses.push({
            row: r,
            concept: concept,
            status: status
          });
        }
      }
      
      if (existingCourses.length > 0) {
        // Show existing courses and let user choose
        var courseList = 'Found courses in progress:\n\n';
        for (var i = 0; i < existingCourses.length; i++) {
          var course = existingCourses[i];
          courseList += (i + 1) + '. "' + course.concept + '" - ' + course.status + '\n';
        }
        
        var continueChoice = ui.prompt(
          'Continue Existing Course',
          courseList + '\nWhich course would you like to continue?\n\nEnter the number (1, 2, etc.) or leave blank for new course:',
          ui.ButtonSet.OK_CANCEL
        );
        
        if (continueChoice.getSelectedButton() === ui.Button.OK) {
          var choice = continueChoice.getResponseText().trim();
          var courseIndex = parseInt(choice) - 1;
          
          if (!isNaN(courseIndex) && courseIndex >= 0 && courseIndex < existingCourses.length) {
            existingCourse = existingCourses[courseIndex];
            targetRow = existingCourse.row;
          }
        } else {
          return; // User cancelled
        }
      }
    }

    if (existingCourse) {
      // EXISTING COURSE WORKFLOW
      var concept = existingCourse.concept;
      mappingSheet.getRange(targetRow, 1).activate();
      
      // Check for modification requests
      var modificationRequests = mappingSheet.getRange(targetRow, 6).getValue();
      var hasModifications = modificationRequests && String(modificationRequests).trim();
      
      if (hasModifications) {
        var modText = String(modificationRequests);
        var displayMod = modText.substring(0, 200);
        if (modText.length > 200) displayMod += '...';
        
        var modResponse = ui.alert(
          'Continue "' + concept + '" - Modifications Found',
          'This course has pending modification requests:\n\n"' + displayMod + '"\n\n' +
          'What would you like to do?\n\n' +
          '• YES: Process modification requests (revise recommendation)\n' +
          '• NO: Continue with normal workflow\n' +
          '• CANCEL: Exit to review modifications manually',
          ui.ButtonSet.YES_NO_CANCEL
        );
        
        if (modResponse === ui.Button.CANCEL) return;
        
        if (modResponse === ui.Button.YES) {
          // Process modification requests
          ui.alert(
            'Processing Modification Requests',
            'The wizard will now process your modification requests for "' + concept + '".\n\n' +
            'This will create a revised recommendation document incorporating your requested changes.\n\n' +
            'Click OK to proceed with modification processing.',
            ui.ButtonSet.OK
          );
          
          // Run the enhanced generateCourseRecommendation that handles modifications
          generateCourseRecommendation();
          
          ui.alert(
            '✅ Modification Requests Processed!',
            'Your modification requests have been processed for "' + concept + '".\n\n' +
            'A revised recommendation document has been created and linked in Column D.\n\n' +
            'Next steps:\n' +
            '• Review the revised recommendation\n' +
            '• Continue with content creation if satisfied\n' +
            '• Add new modification requests if further changes needed',
            ui.ButtonSet.OK
          );
          return;
        }
      }
      
      // Continue with existing course - determine next step
      continueExistingCourse_(mappingSheet, targetRow, concept);
      
    } else {
      // NEW COURSE WORKFLOW
      // Find next available row
      for (var r = 2; r <= lastRow + 1; r++) {
        var concept = String(mappingSheet.getRange(r, 1).getValue() || '').trim();
        if (!concept) {
          targetRow = r;
          break;
        }
      }
      
      mappingSheet.getRange(targetRow, 1).activate();
      
      // Step 1: Course Setup
      var step1Response = ui.alert(
        'Step 1: Course Setup',
        'Let\'s start by setting up your new course project.\n\n' +
        'This will:\n' +
        '• Create your course concept entry\n' +
        '• Set up Google Drive folder structure\n' +
        '• Configure target audience\n' +
        '• Prepare source materials workspace\n\n' +
        'Ready to set up your course project?',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (step1Response !== ui.Button.OK) return;
      
      // Run Step 1: Setup
      setupMappingTab();
      
      // Step 1 completion check
      var concept = String(mappingSheet.getRange(targetRow, 1).getValue() || '').trim();
      if (!concept) {
        ui.alert('Setup Incomplete', 'Course setup was not completed. Please try again.', ui.ButtonSet.OK);
        return;
      }
      
      // Step 1 Complete - prepare for Step 2
      var step1Complete = ui.alert(
        'Step 1 Complete - Ready for AI Analysis!',
        'Excellent! You\'ve set up the foundation:\n\n' +
        '✓ Course concept defined\n' +
        '✓ Target audience selected\n' +
        '✓ Source materials workspace ready\n\n' +
        'WHAT HAPPENS NEXT:\n' +
        'The AI will analyse your materials and create a professional course structure with 8-12 modules.\n\n' +
        'Ready to proceed to Step 2: AI-Powered Course Structure?',
        ui.ButtonSet.YES_NO
      );
      
      if (step1Complete === ui.Button.YES) {
        proceedToStep2_(mappingSheet, targetRow, concept);
      } else {
        ui.alert(
          'Wizard Paused',
          'Your course "' + concept + '" has been set up successfully.\n\n' +
          'You can continue anytime by:\n' +
          '• Running the wizard again and selecting your course\n' +
          '• Using "#2 Generate Course Recommendation" from the menu\n\n' +
          'Your progress has been saved automatically.',
          ui.ButtonSet.OK
        );
      }
    }
    
  } catch (error) {
    Logger.log('Wizard error: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Wizard Error',
      'An error occurred in the course creation wizard.\n\n' +
      'Error: ' + error.message + '\n\n' +
      'You can continue using individual menu functions.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Continue existing course workflow
 */
function continueExistingCourse_(sheet, row, concept) {
  var ui = SpreadsheetApp.getUi();
  
  // Determine current progress and next steps
  var recommendation = sheet.getRange(row, 4).getValue();
  var approved = sheet.getRange(row, 5).getValue();
  
  var nextStep = '';
  var nextAction = '';
  
  if (!recommendation || !String(recommendation).trim()) {
    nextStep = 'Step 2: Generate Course Recommendation';
    nextAction = 'Generate AI-powered course structure and recommendations';
  } else if (!approved) {
    nextStep = 'Step 2: Review & Approve Recommendation';
    nextAction = 'Review the generated recommendation and mark as approved';
  } else {
    nextStep = 'Step 3: Create Content Workspace';
    nextAction = 'Create organised workspace for content development';
  }
  
  var continueResponse = ui.alert(
    'Continue "' + concept + '"',
    'Current Progress: ' + nextStep + '\n\n' +
    'Next Action: ' + nextAction + '\n\n' +
    'The wizard will guide you through the next step.\n\n' +
    'Continue with "' + concept + '"?',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (continueResponse === ui.Button.OK) {
    sheet.getRange(row, 1).activate();
    
    if (!recommendation || !String(recommendation).trim()) {
      proceedToStep2_(sheet, row, concept);
    } else if (!approved) {
      proceedToApproval_(sheet, row, concept);
    } else {
      proceedToStep3_(sheet, row, concept);
    }
  }
}

/**
 * Proceed to Step 2: Generate Course Recommendation
 */
function proceedToStep2_(sheet, row, concept) {
  var ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Step 2: AI-Powered Course Structure',
    'Now generating professional course structure for "' + concept + '".\n\n' +
    'The AI will:\n' +
    '• Analyse your source materials\n' +
    '• Create 8-12 learning modules\n' +
    '• Define learning objectives\n' +
    '• Suggest assessment strategies\n' +
    '• Apply Australian healthcare standards\n\n' +
    'This may take 1-2 minutes. Click OK to start.',
    ui.ButtonSet.OK
  );
  
  // Run the recommendation generation
  generateCourseRecommendation();
  
  // Check if it was successful
  var recommendation = sheet.getRange(row, 4).getValue();
  if (recommendation && String(recommendation).trim()) {
    var step2Complete = ui.alert(
      'Step 2 Complete - Course Structure Generated!',
      '✅ AI has created your course structure for "' + concept + '"!\n\n' +
      'WHAT TO DO NOW:\n' +
      '1. Review the generated recommendation document\n' +
      '2. Check if the structure meets your needs\n' +
      '3. If changes needed, add requests to Column F (Modification Requests)\n' +
      '4. Mark as approved in Column E when satisfied\n\n' +
      'Would you like to continue to workspace creation, or review first?',
      ui.ButtonSet.YES_NO
    );
    
    if (step2Complete === ui.Button.YES) {
      proceedToStep3_(sheet, row, concept);
    } else {
      ui.alert(
        'Review Your Course Structure',
        'Please review the generated recommendation document.\n\n' +
        'TO MAKE MODIFICATIONS:\n' +
        '• Add specific requests to Column F (Modification Requests)\n' +
        '• Example: "Include more practical scenarios", "Add 2 more modules on communication"\n' +
        '• Run the wizard again or use "#2 Generate Course Recommendation"\n\n' +
        'TO CONTINUE:\n' +
        '• Check the Approved box in Column E\n' +
        '• Run the wizard again to proceed to content creation',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Proceed to approval process
 */
function proceedToApproval_(sheet, row, concept) {
  var ui = SpreadsheetApp.getUi();
  
  var approvalResponse = ui.alert(
    '"' + concept + '" - Ready for Approval',
    'Your course recommendation has been generated.\n\n' +
    'BEFORE PROCEEDING:\n' +
    '• Review the recommendation document\n' +
    '• Ensure the structure meets your requirements\n' +
    '• Add modification requests to Column F if changes needed\n\n' +
    'Is the course structure approved and ready for content creation?',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (approvalResponse === ui.Button.YES) {
    sheet.getRange(row, 5).setValue(true); // Mark as approved
    proceedToStep3_(sheet, row, concept);
  } else if (approvalResponse === ui.Button.NO) {
    ui.alert(
      'Add Modification Requests',
      'Please add your modification requests to Column F.\n\n' +
      'Examples:\n' +
      '• "Include more practical case studies"\n' +
      '• "Add assessment rubrics"\n' +
      '• "Expand module 3 with more detail"\n' +
      '• "Include minimum 10 references"\n\n' +
      'Then run the wizard again to process modifications.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Proceed to Step 3: Create Content Workspace
 */
function proceedToStep3_(sheet, row, concept) {
  var ui = SpreadsheetApp.getUi();
  
  var step3Response = ui.alert(
    'Step 3: Create Organised Workspace',
    'Ready to create the content development workspace for "' + concept + '".\n\n' +
    'This will create:\n' +
    '• Module subfolders in your Drive project folder\n' +
    '• Module-Resources worksheet for tracking content\n' +
    '• TTS worksheet for audio management\n' +
    '• Organised structure for professional development\n\n' +
    'Create the organised workspace now?',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (step3Response === ui.Button.OK) {
    // Show the workspace creation guide
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
    
    // Could automatically run createCourseContentTabs() here if desired
    // createCourseContentTabs();
  }
}

/**
 * Helper function to determine project status
 */
function determineProjectStatus_(sheet, row) {
  var recommendation = sheet.getRange(row, 4).getValue();
  var approved = sheet.getRange(row, 5).getValue();
  var modificationRequests = sheet.getRange(row, 6).getValue();
  
  if (modificationRequests && String(modificationRequests).trim()) {
    return 'Modifications Requested';
  } else if (!recommendation || !String(recommendation).trim()) {
    return 'Setup Complete';
  } else if (!approved) {
    return 'Awaiting Approval';
  } else {
    return 'Ready for Content Creation';
  }
}
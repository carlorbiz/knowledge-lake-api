# Complete Menu System Restoration Guide

## Problem Analysis

The menu system was corrupted by removing the core workflow functions (`step1Setup` through `step10Archive`) that users need for course creation. The current menu is "totally irrelevant to the user" because it lacks the essential 10-step workflow functions.

## Solution Overview

This guide provides the corrected `onOpen()` function that restores the complete menu structure with:

1. **Course Creation Wizard** (guided workflow for new users)
2. **Original 10-Step Workflow** (core functions that were removed)
3. **System Tools** (diagnostics and utilities)
4. **Help and Guidance** (updated user guide)

## Critical Integration Steps

### Step 1: Replace the onOpen() Function

**REPLACE** the existing `onOpen()` function in your main script with this corrected version:

```javascript
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // Create the main menu with all essential functions
  var menu = ui.createMenu('🎓 Concept-to-Course Tool')
    
    // COURSE CREATION WIZARD (Guided Workflow)
    .addItem('🚀 Launch Course Creation Wizard', 'launchCourseCreationWizard')
    .addSeparator()
    
    // ORIGINAL 10-STEP WORKFLOW (Core Functions)
    .addSubMenu(ui.createMenu('📋 10-Step Workflow')
      .addItem('Step 1: Setup Course Project', 'step1Setup')
      .addItem('Step 2: Get AI Recommendations', 'step2Recommendation') 
      .addItem('Step 3: Create Workspace Structure', 'step3Workspace')
      .addItem('Step 4: Generate Course Content', 'step4Content')
      .addItem('Step 5: Create LMS Materials', 'step5LMS')
      .addItem('Step 6: Generate Presentation Slides', 'step6Slides')
      .addItem('Step 7: Add Voice Narration', 'step7Voice')
      .addItem('Step 8: Process Audio Files', 'step8Audio')
      .addItem('Step 9: Course Maintenance', 'step9Maintenance')
      .addItem('Step 10: Archive Project', 'step10Archive'))
    .addSeparator()
    
    // SYSTEM FUNCTIONS
    .addSubMenu(ui.createMenu('⚙️ System Tools')
      .addItem('📊 Run System Diagnostics', 'runSystemDiagnostics')
      .addItem('🔧 Check System Status', 'checkSystemStatus')
      .addItem('📁 Organise Drive Folders', 'organiseFolders'))
    .addSeparator()
    
    // HELP AND GUIDANCE
    .addItem('📖 How to Use This Tool', 'showHowToUse')
    .addItem('🆘 Get Help & Support', 'showHelp');
  
  menu.installMenu();
}
```

### Step 2: Add Supporting Functions

**ADD** these supporting functions to your script:

```javascript
function checkSystemStatus() {
  try {
    var statusInfo = checkUserSystemReady_();
    
    if (statusInfo.ready) {
      SpreadsheetApp.getUi().alert(
        '✅ System Status: Ready',
        'Your Concept-to-Course system is properly configured and ready to use.\n\n' +
        'You can:\n' +
        '• Use the Course Creation Wizard for guided workflow\n' +
        '• Access individual workflow steps (Step 1-10)\n' +
        '• Create new course projects\n\n' +
        'Get started by selecting "Launch Course Creation Wizard" or "Step 1: Setup Course Project".',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '⚠️ System Status: Configuration Needed',
        statusInfo.message + '\n\n' +
        'Please contact your system administrator to complete the initial setup.\n\n' +
        'Required configuration:\n' +
        '• API keys and credentials\n' +
        '• System settings and preferences\n' +
        '• Drive folder permissions',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    Logger.log('Error in checkSystemStatus: ' + error.toString());
    SpreadsheetApp.getUi().alert(
      'Error',
      'Unable to check system status. Please contact your administrator.\n\nError: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}
```

### Step 3: Update How-to-Use Function

**REPLACE** the existing `showHowToUse()` function with the enhanced version that includes the original workflow functions at the beginning (see MENU-SYSTEM-RESTORATION.js for the complete function).

## Menu Structure Explanation

### Main Menu Items:

1. **🚀 Launch Course Creation Wizard**
   - Guided workflow for new users
   - Streamlined course creation process
   - Includes validation and error handling

2. **📋 10-Step Workflow** (Submenu)
   - **Step 1: Setup Course Project** - Create Mapping sheet, initialise project
   - **Step 2: Get AI Recommendations** - Generate course structure suggestions
   - **Step 3: Create Workspace Structure** - Set up Drive folders
   - **Step 4: Generate Course Content** - AI-powered content creation
   - **Step 5: Create LMS Materials** - Prepare for LMS upload
   - **Step 6: Generate Presentation Slides** - Create PowerPoint materials
   - **Step 7: Add Voice Narration** - Text-to-speech generation
   - **Step 8: Process Audio Files** - Finalise audio components
   - **Step 9: Course Maintenance** - Update and revise materials
   - **Step 10: Archive Project** - Archive completed courses

3. **⚙️ System Tools** (Submenu)
   - **📊 Run System Diagnostics** - Check system configuration
   - **🔧 Check System Status** - User-friendly status information
   - **📁 Organise Drive Folders** - Folder management utilities

4. **📖 How to Use This Tool**
   - Comprehensive user guide
   - Includes original workflow functions documentation
   - Australian healthcare education standards

5. **🆘 Get Help & Support**
   - Support and troubleshooting information

## Key Benefits of This Structure

1. **Complete Functionality**: Restores all original workflow functions
2. **User-Friendly**: Provides both guided wizard and individual step access
3. **Clear Organisation**: Logical grouping of functions in submenus
4. **Professional Presentation**: Uses emojis and clear naming conventions
5. **Comprehensive Help**: Updated user guide with complete documentation

## Function Dependencies

Ensure these functions exist in your script:
- `step1Setup` through `step10Archive` (original workflow functions)
- `launchCourseCreationWizard` (Course Creation Wizard)
- `runSystemDiagnostics` (system diagnostics)
- `checkUserSystemReady_` (system validation helper)
- `showHelp` (help and support function)
- `organiseFolders` (Drive folder management)

## Testing the Restoration

After implementing these changes:

1. **Reload the spreadsheet** to trigger the new `onOpen()` function
2. **Check the menu** appears with all sections
3. **Test Step 1: Setup Course Project** to ensure core functions work
4. **Verify Course Creation Wizard** launches without errors
5. **Check system status** using the System Tools submenu

## Troubleshooting

If functions are still missing:
- Ensure all original `step1Setup` through `step10Archive` functions exist in your script
- Check for any syntax errors in the `onOpen()` function
- Verify function names match exactly (case-sensitive)
- Use Google Apps Script editor's "Run" button to test individual functions

This restoration provides users with the complete, relevant menu system they need for effective course creation using your Concept-to-Course tool.
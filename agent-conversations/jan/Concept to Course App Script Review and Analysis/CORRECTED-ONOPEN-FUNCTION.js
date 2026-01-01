/**
 * CORRECTED onOpen FUNCTION
 * 
 * This is the REAL menu structure that aligns with the actual functions
 * in Carla's current script and matches the 10-step workflow.
 * 
 * All function names verified to exist in CTscript_Concept2Course_CURRENT.txt
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Concept-to-Course')
      .addItem('#1 Setup & Add First Course', 'setupMappingTab')
      .addItem('#2 Generate Course Recommendation', 'generateCourseRecommendation')
      .addItem('#3 Create Content Tabs & Subfolders', 'createCourseContentTabs')
      .addSeparator()
      .addItem('#4 Generate Full Suite of Resources', 'generateFullSuiteOfResources')
      .addItem('#5 Generate Absorb LMS Upload Doc', 'generateAbsorbLmsFile')
      .addSeparator()
      .addSubMenu(ui.createMenu('SLIDES & AUDIO')
          .addItem('#6 Generate Slides for Module', 'generateSlidesForSelectedModule')
          .addItem('#7 Set TTS Voice', 'setTtsVoice_')
          .addItem('#8 Generate All Audio for Module', 'generateAllAudioForModule'))
      .addSeparator()
      .addSubMenu(ui.createMenu('DATA & ARCHIVAL')
          .addItem('#9 Clean Module Audio Files', 'cleanModuleAudioFiles')
          .addItem('#10 Archive Course Project', 'archiveCourse'))
      .addToUi();
}
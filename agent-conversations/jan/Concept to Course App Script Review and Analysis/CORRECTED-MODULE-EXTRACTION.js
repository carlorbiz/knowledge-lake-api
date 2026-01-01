/**
 * CORRECTED MODULE EXTRACTION CODE
 * 
 * Error: ui.toast is not a function
 * Fix: Use SpreadsheetApp.getUi().toast() instead of ui.toast()
 */

// ❌ INCORRECT (causes the error):
// ui.toast('Extracting course modules...', 'Processing', 5);

// ✅ CORRECT (replace your module extraction code with this):

// Extract and populate module names (Columns G-S)
try {
  SpreadsheetApp.getUi().toast('Extracting course modules...', 'Processing', 5);
  
  const moduleNames = extractModuleNames_(rec);
  
  if (moduleNames && moduleNames.length > 0) {
    // Column G: Module List (all module names)
    sh.getRange(r, 7).setValue(moduleNames.join('\n'));
    
    // Columns H-S: Individual module names (up to 12 modules)
    for (let i = 0; i < 12; i++) {
      const moduleName = moduleNames[i] || '';
      sh.getRange(r, 8 + i).setValue(moduleName);
    }
    
    Logger.log(`Extracted ${moduleNames.length} modules for course: ${concept}`);
    SpreadsheetApp.getUi().toast(`Extracted ${moduleNames.length} modules`, 'Modules Ready', 3);
    
  } else {
    Logger.log('No modules found in recommendation text');
    SpreadsheetApp.getUi().toast('No modules detected - check RECOMMENDED MODULES section format', 'Warning', 5);
  }
  
} catch (moduleError) {
  Logger.log('Error extracting modules: ' + moduleError.toString());
  SpreadsheetApp.getUi().toast('Module extraction failed - modules may need manual entry', 'Warning', 5);
}

/**
 * ALTERNATIVE: Simpler version without toast notifications
 * Use this if you prefer no progress messages:
 */

// Extract and populate module names (Columns G-S)
try {
  const moduleNames = extractModuleNames_(rec);
  
  if (moduleNames && moduleNames.length > 0) {
    // Column G: Module List (all module names)
    sh.getRange(r, 7).setValue(moduleNames.join('\n'));
    
    // Columns H-S: Individual module names (up to 12 modules)
    for (let i = 0; i < 12; i++) {
      const moduleName = moduleNames[i] || '';
      sh.getRange(r, 8 + i).setValue(moduleName);
    }
    
    Logger.log(`Extracted ${moduleNames.length} modules for course: ${concept}`);
  } else {
    Logger.log('No modules found in recommendation text');
  }
  
} catch (moduleError) {
  Logger.log('Error extracting modules: ' + moduleError.toString());
}
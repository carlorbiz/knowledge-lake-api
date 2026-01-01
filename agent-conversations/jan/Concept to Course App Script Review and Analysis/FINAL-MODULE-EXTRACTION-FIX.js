/**
 * FINAL MODULE EXTRACTION FIX
 * 
 * Error: SpreadsheetApp.getUi().toast is not a function
 * Solution: Remove toast notifications, use only Logger and console.log
 */

// ✅ CORRECTED MODULE EXTRACTION CODE (No Toast):

// Extract and populate module names (Columns G-S)
try {
  Logger.log('Starting module extraction...');
  
  const moduleNames = extractModuleNames_(rec);
  
  if (moduleNames && moduleNames.length > 0) {
    // Column G: Module List (all module names)
    sh.getRange(r, 7).setValue(moduleNames.join('\n'));
    
    // Columns H-S: Individual module names (up to 12 modules)
    for (let i = 0; i < 12; i++) {
      const moduleName = moduleNames[i] || '';
      sh.getRange(r, 8 + i).setValue(moduleName);
    }
    
    Logger.log(`Successfully extracted ${moduleNames.length} modules for course: ${concept}`);
    console.log(`Module extraction complete: ${moduleNames.length} modules found`);
    
  } else {
    Logger.log('No modules found in recommendation text - check RECOMMENDED MODULES section format');
    console.log('Warning: No modules detected in recommendation');
  }
  
} catch (moduleError) {
  Logger.log('Error extracting modules: ' + moduleError.toString());
  console.log('Module extraction failed: ' + moduleError.message);
}

/**
 * ALTERNATIVE: Even simpler version with minimal logging
 */

// Extract and populate module names (Columns G-S) - MINIMAL VERSION
const moduleNames = extractModuleNames_(rec);

if (moduleNames && moduleNames.length > 0) {
  // Column G: Module List (all module names)
  sh.getRange(r, 7).setValue(moduleNames.join('\n'));
  
  // Columns H-S: Individual module names (up to 12 modules)
  for (let i = 0; i < 12; i++) {
    const moduleName = moduleNames[i] || '';
    sh.getRange(r, 8 + i).setValue(moduleName);
  }
  
  Logger.log(`Extracted ${moduleNames.length} modules`);
}

/**
 * DEPLOYMENT: Replace your current module extraction code with either version above
 */
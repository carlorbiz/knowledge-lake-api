/**
 * FOLDER NAMING MISMATCH FIX
 * 
 * ISSUE: createCourseContentTabs() creates "Module 1 - ModuleName" 
 * but getModuleSubfolder_() is looking for something else
 * 
 * SOLUTIONS:
 */

/**
 * Option 1: Update getModuleSubfolder_ to match the folder naming pattern
 * (Replace your existing getModuleSubfolder_ function with this)
 */
function getModuleSubfolder_(conceptName, moduleName) {
  try {
    // Get the course folder from Mapping sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = ss.getSheetByName('Mapping');
    
    if (!mappingSheet) {
      Logger.log('Mapping sheet not found');
      return null;
    }
    
    // Find the course row by concept name
    const lastRow = mappingSheet.getLastRow();
    let courseFolderUrl = '';
    
    for (let r = 2; r <= lastRow; r++) {
      const mappingConcept = mappingSheet.getRange(r, 1).getValue();
      if (String(mappingConcept).trim() === String(conceptName).trim()) {
        courseFolderUrl = mappingSheet.getRange(r, 20).getValue();
        break;
      }
    }
    
    if (!courseFolderUrl) {
      Logger.log(`Course folder URL not found for concept: ${conceptName}`);
      return null;
    }
    
    // Extract course folder ID
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    
    // Find the module subfolder using the EXACT naming pattern from createCourseContentTabs
    const subfolders = courseFolder.getFolders();
    
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      const folderName = subfolder.getName();
      
      // Match the pattern: "Module X - ModuleName"
      if (folderName.includes(` - ${moduleName}`)) {
        Logger.log(`Found module subfolder: ${folderName}`);
        return subfolder;
      }
    }
    
    Logger.log(`Module subfolder not found for: ${moduleName}`);
    Logger.log(`Searched in course folder: ${courseFolder.getName()}`);
    
    // List all subfolders for debugging
    const allSubfolders = courseFolder.getFolders();
    const folderNames = [];
    while (allSubfolders.hasNext()) {
      folderNames.push(allSubfolders.next().getName());
    }
    Logger.log(`Available subfolders: ${folderNames.join(', ')}`);
    
    return null;
    
  } catch (error) {
    Logger.log(`Error in getModuleSubfolder_: ${error.toString()}`);
    return null;
  }
}

/**
 * Option 2: Debug function to check folder naming
 */
function debugModuleFolderNaming() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const { sheet, row, moduleName, conceptName } = getActiveModuleInfo_('Module-Resources');
    
    if (!moduleName || !conceptName) {
      ui.alert('Error', 'Module or concept name not found', ui.ButtonSet.OK);
      return;
    }
    
    // Get course folder
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mappingSheet = ss.getSheetByName('Mapping');
    const lastRow = mappingSheet.getLastRow();
    let courseFolderUrl = '';
    
    for (let r = 2; r <= lastRow; r++) {
      const mappingConcept = mappingSheet.getRange(r, 1).getValue();
      if (String(mappingConcept).trim() === String(conceptName).trim()) {
        courseFolderUrl = mappingSheet.getRange(r, 20).getValue();
        break;
      }
    }
    
    if (!courseFolderUrl) {
      ui.alert('Error', 'Course folder URL not found', ui.ButtonSet.OK);
      return;
    }
    
    const courseFolderId = extractIdFromUrl_(courseFolderUrl);
    const courseFolder = DriveApp.getFolderById(courseFolderId);
    
    // List all subfolders
    const subfolders = courseFolder.getFolders();
    const folderList = [];
    
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      const folderName = subfolder.getName();
      const isMatch = folderName.includes(` - ${moduleName}`);
      folderList.push(`${isMatch ? '✅' : '❌'} "${folderName}"`);
    }
    
    const debugMsg = `FOLDER NAMING DEBUG:\n\n` +
      `Looking for module: "${moduleName}"\n` +
      `In course folder: "${courseFolder.getName()}"\n\n` +
      `Available subfolders:\n${folderList.join('\n')}\n\n` +
      `Expected pattern: "Module X - ${moduleName}"`;
    
    ui.alert('Folder Debug Results', debugMsg, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Debug Error', error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Option 3: Alternative - Fix createCourseContentTabs to match existing pattern
 * (Use this if your getModuleSubfolder_ expects a different naming pattern)
 */
function fixCreateCourseContentTabsNaming() {
  // In your createCourseContentTabs function, change this line:
  // const folderName = `Module ${index + 1} - ${sanitizedName}`;
  // 
  // To match whatever pattern getModuleSubfolder_ expects, such as:
  // const folderName = sanitizedName; // Just the module name
  // OR
  // const folderName = `${index + 1}. ${sanitizedName}`; // Different format
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. First run debugModuleFolderNaming() to see the actual folder names
 * 2. Check what naming pattern your folders currently use
 * 3. Either:
 *    - Replace getModuleSubfolder_ with Option 1 (matches createCourseContentTabs pattern)
 *    - OR modify createCourseContentTabs to match your existing pattern
 * 
 * The key is making sure both functions use the SAME folder naming convention.
 */
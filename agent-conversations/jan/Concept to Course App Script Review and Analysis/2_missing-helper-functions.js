/**
 * MISSING HELPER FUNCTIONS FOR MAIN SCRIPT
 * Add these functions to your main script after existing helper functions
 */

// ==== CORE HELPER FUNCTIONS ====

function getActiveModuleInfo_(sheetType) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  if (sheetType && !sheetName.startsWith(sheetType)) {
    SpreadsheetApp.getUi().alert(`Please run this function on a ${sheetType} sheet.`);
    return { sheet: null, row: null, moduleName: null, conceptName: null };
  }
  
  const row = sheet.getActiveRange().getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a data row (row 2 or higher).');
    return { sheet: null, row: null, moduleName: null, conceptName: null };
  }
  
  const moduleName = sheet.getRange(row, 1).getValue();
  const conceptName = sheet.getRange(row, 2).getValue() || 
                      sheetName.replace('Module-Resources-', '').replace('TTS-', '');
  
  return { sheet, row, moduleName, conceptName };
}

// ==== ENHANCED STATUS TRACKING ====

function trackWizardProgress_(step, status, details) {
  try {
    const statusSheet = ensureStatusSheet_();
    statusSheet.appendRow([
      new Date(),
      `Wizard Step ${step}`,
      status,
      details || ''
    ]);
  } catch (error) {
    console.warn('Could not track wizard progress:', error.message);
  }
}

// ==== QUALITY ENHANCEMENTS ====

function validateSystemConfiguration_() {
  try {
    CFG.validateConfiguration();
    return { valid: true, message: 'System configured correctly' };
  } catch (error) {
    return { 
      valid: false, 
      message: `Configuration required: ${error.message}\n\nPlease contact Carla for system setup.`
    };
  }
}

function withErrorRecovery_(operation, fallback, context = '') {
  try {
    return operation();
  } catch (error) {
    console.error(`${context}: ${error.message}`);
    trackProgress('Error Recovery', 0, 1, `${context}: ${error.message}`);
    
    if (typeof fallback === 'function') {
      return fallback();
    }
    
    SpreadsheetApp.getUi().alert(
      'Operation Failed',
      `${context}\n\nError: ${error.message}\n\nPlease contact Carla if this persists.`,
      ui.ButtonSet.OK
    );
    
    return fallback;
  }
}

// ==== WIZARD-SPECIFIC HELPER FUNCTIONS ====

function getModuleSubfolder_(conceptName, moduleName) {
  try {
    // Get the main course folder
    const mainFolderId = CFG.DRIVE_FOLDER_ID;
    const mainFolder = DriveApp.getFolderById(mainFolderId);
    
    // Look for course-specific folder
    const courseFolders = mainFolder.getFoldersByName(conceptName);
    let courseFolder;
    
    if (courseFolders.hasNext()) {
      courseFolder = courseFolders.next();
    } else {
      // Create course folder if it doesn't exist
      courseFolder = mainFolder.createFolder(conceptName);
    }
    
    // Look for module-specific subfolder
    const sanitizedModuleName = String(moduleName || 'Module').replace(/[^\w\s-]/g, '_');
    const moduleSubfolders = courseFolder.getFoldersByName(sanitizedModuleName);
    
    if (moduleSubfolders.hasNext()) {
      return moduleSubfolders.next();
    } else {
      return courseFolder.createFolder(sanitizedModuleName);
    }
  } catch (error) {
    console.error('Error accessing module subfolder:', error.message);
    SpreadsheetApp.getUi().alert(
      'Folder Access Error',
      `Could not access module folder for "${moduleName}".\n\nError: ${error.message}\n\nPlease contact Carla for assistance.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return null;
  }
}

function createDownloadableDoc_(moduleSubfolder, conceptName, moduleName, content) {
  try {
    const docTitle = `${conceptName} - ${moduleName} - Downloadable Resources`;
    const doc = DocumentApp.create(docTitle);
    const docFile = DriveApp.getFileById(doc.getId());
    
    // Move to module subfolder
    if (moduleSubfolder) {
      moduleSubfolder.addFile(docFile);
      DriveApp.getRootFolder().removeFile(docFile);
    }
    
    // Add content to document
    const body = doc.getBody();
    body.clear();
    
    // Add title
    const titleParagraph = body.appendParagraph(docTitle);
    titleParagraph.setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    // Add content
    if (content) {
      body.appendParagraph(''); // Space
      const contentParagraph = body.appendParagraph(content);
      contentParagraph.setSpacingBefore(12);
    }
    
    doc.saveAndClose();
    return docFile.getUrl();
  } catch (error) {
    console.error('Error creating downloadable doc:', error.message);
    throw new Error(`Could not create downloadable document: ${error.message}`);
  }
}

function seedTTSFromSpecs(conceptName, moduleName, slideSpecsText) {
  try {
    const slides = parseSlideSpecs_(slideSpecsText);
    if (!slides || slides.length === 0) {
      console.warn('No slides parsed from specifications');
      return;
    }
    
    const ttsSheetName = `TTS-${conceptName}`;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let ttsSheet = ss.getSheetByName(ttsSheetName);
    
    if (!ttsSheet) {
      ttsSheet = ss.insertSheet(ttsSheetName);
      // Add headers
      ttsSheet.getRange(1, 1, 1, 10).setValues([[
        'Module', 'Slide #', 'Script', 'Image Prompt', 'Alt Text', 
        'Voice', 'Backup Image Prompt', 'Audio File Id', 'Audio URL', 'Notes'
      ]]);
    }
    
    const rows = [];
    slides.forEach((slide, index) => {
      const slideNumber = index + 1;
      const slideTitle = slide.title || `Slide ${slideNumber}`;
      const slideContent = slide.body ? slide.body.join('. ') : '';
      
      rows.push([
        moduleName,
        slideNumber,
        `${slideTitle}\n\n${slideContent}`,
        `Professional healthcare education slide for: ${slideTitle}`,
        '', // Alt text
        '', // Voice (will use default)
        '', // Backup image prompt
        '', // Audio file ID
        '', // Audio URL  
        '' // Notes
      ]);
    });
    
    if (rows.length > 0) {
      const startRow = ttsSheet.getLastRow() + 1;
      ttsSheet.getRange(startRow, 1, rows.length, 10).setValues(rows);
    }
    
    trackWizardProgress_('TTS Setup', 'completed', `Seeded ${rows.length} slides for ${moduleName}`);
  } catch (error) {
    console.error('Error seeding TTS from specs:', error.message);
    // Don't throw - this is not critical for workflow continuation
  }
}

function parseSlideSpecs_(specText) {
  if (!specText || typeof specText !== 'string') {
    return [];
  }
  
  const slides = [];
  const lines = specText.split('\n').map(line => line.trim()).filter(Boolean);
  
  let currentSlide = null;
  
  lines.forEach(line => {
    // Check if this is a slide header
    const slideMatch = line.match(/^(?:#\s*)?slide\s+(\d+)[\:\-\s]*(.*)/i);
    
    if (slideMatch) {
      // Save previous slide if exists
      if (currentSlide) {
        slides.push(currentSlide);
      }
      
      // Start new slide
      currentSlide = {
        number: parseInt(slideMatch[1]),
        title: slideMatch[2].trim() || `Slide ${slideMatch[1]}`,
        body: []
      };
    } else if (currentSlide && line) {
      // Add content to current slide
      // Remove bullet markers and clean up
      const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
      if (cleanLine) {
        currentSlide.body.push(cleanLine);
      }
    }
  });
  
  // Don't forget the last slide
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  return slides;
}

// ==== INTEGRATION HELPER FUNCTIONS ====

function createGoogleDocFromMarkdown_(parentFolder, title, markdownContent) {
  try {
    const doc = DocumentApp.create(title);
    const docFile = DriveApp.getFileById(doc.getId());
    
    // Move to parent folder
    if (parentFolder) {
      parentFolder.addFile(docFile);
      DriveApp.getRootFolder().removeFile(docFile);
    }
    
    // Convert markdown-like content to document
    const body = doc.getBody();
    body.clear();
    
    // Add title
    const titleParagraph = body.appendParagraph(title);
    titleParagraph.setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    // Process content
    if (markdownContent) {
      const sections = markdownContent.split(/\n\s*\n/).filter(Boolean);
      
      sections.forEach(section => {
        const lines = section.split('\n');
        const firstLine = lines[0].trim();
        
        // Check for headers
        if (firstLine.startsWith('# ')) {
          const headerText = firstLine.replace('# ', '');
          const headerParagraph = body.appendParagraph(headerText);
          headerParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);
          
          // Add remaining lines as content
          if (lines.length > 1) {
            const contentText = lines.slice(1).join('\n').trim();
            if (contentText) {
              body.appendParagraph(contentText);
            }
          }
        } else if (firstLine.startsWith('## ')) {
          const headerText = firstLine.replace('## ', '');
          const headerParagraph = body.appendParagraph(headerText);
          headerParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING2);
          
          if (lines.length > 1) {
            const contentText = lines.slice(1).join('\n').trim();
            if (contentText) {
              body.appendParagraph(contentText);
            }
          }
        } else {
          // Regular paragraph
          body.appendParagraph(section.trim());
        }
      });
    }
    
    doc.saveAndClose();
    return docFile.getId();
  } catch (error) {
    console.error('Error creating Google Doc from markdown:', error.message);
    throw new Error(`Could not create document: ${error.message}`);
  }
}

// ==== ENHANCED PROGRESS TRACKING ====

function showWizardProgress_(stepNumber, totalSteps) {
  const percentage = Math.round((stepNumber / totalSteps) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Course Creation Progress: Step ${stepNumber}/${totalSteps} (${percentage}%)\n${progressBar}`,
    'Wizard Progress',
    5
  );
}

function getWizardStepName_(stepNumber) {
  const stepNames = {
    1: 'Setup & Course Planning',
    2: 'AI-Powered Course Structure',
    3: 'Workspace Preparation',
    4: 'Comprehensive Content Development',
    5: 'LMS-Ready Content Creation',
    6: 'Professional Presentation Development',
    7: 'Voice Customisation',
    8: 'Professional Audio Narration',
    9: 'Maintenance & Quality Control',
    10: 'Professional Course Completion'
  };
  
  return stepNames[stepNumber] || `Step ${stepNumber}`;
}
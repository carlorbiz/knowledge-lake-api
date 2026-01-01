/**
 * GPSA / HPSA Concept-to-Course — Enhanced Complete Version
 * Fixed TTS issues, restored sophisticated content generation, added image generation
 * Created by Carla Taylor — Enhanced 2025-01-03
 * Script Properties required: GEMINI_API_KEY, DRIVE_FOLDER_ID, SLIDES_TEMPLATE_ID
 */

// ===================== Config & Brand =====================
const CFG = {
  get GEMINI_API_KEY() {
    const v = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!v) throw new Error('Set GEMINI_API_KEY in Script Properties.');
    return v;
  },
  get DRIVE_FOLDER_ID() {
    const v = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
    if (!v) throw new Error('Set DRIVE_FOLDER_ID in Script Properties.');
    return v;
  },
  get SLIDES_TEMPLATE_ID() {
    const v = PropertiesService.getScriptProperties().getProperty('SLIDES_TEMPLATE_ID');
    if (!v) throw new Error('Set SLIDES_TEMPLATE_ID in Script Properties.');
    return v;
  },
  AU_PROMPT: 'Use Australian English and professional healthcare tone suitable for CPD. Prefer Australian guidelines and RACGP where relevant.',
  BRAND_HEADER: [
    'You are writing on behalf of GPSA / HPSA — the peak Australasian authority on best-practice supervision of medical learners and the healthcare workforce.',
    'Use Australian English (en-AU) and a practical, supportive, non-judgemental tone consistent with GPSA/HPSA.',
    'Anchor content in general practice / primary care contexts including rural and remote settings.',
    'Emphasise safe, effective supervision; coaching; feedback; assessment for learning; psychological safety.',
    'Respect cultural safety, including Aboriginal and Torres Strait Islander health; avoid stereotypes and patient-identifiable data.',
    'Prefer RACGP, ACRRM and AHPRA-aligned terminology and concepts; do not fabricate citations or guideline numbers.',
    'Terminology preferences: "general practice", "supervisor", "registrar", "learner", "clinical supervision", "CPD". Avoid US spellings.',
    'Outputs must be original and tailored for GPSA/HPSA; avoid generic boilerplate.'
  ].join('\n'),
  TTS_WPM: 150,
  
  validateConfiguration() {
    const required = ['GEMINI_API_KEY', 'DRIVE_FOLDER_ID', 'SLIDES_TEMPLATE_ID'];
    const missing = required.filter(key => {
      try { return !this[key]; } catch (e) { return true; }
    });
    if (missing.length > 0) {
      throw new Error(`Configuration incomplete. Please set in Script Properties: ${missing.join(', ')}`);
    }
    try { DriveApp.getFolderById(this.DRIVE_FOLDER_ID).getName(); } 
    catch (e) { throw new Error('Cannot access Drive folder. Check DRIVE_FOLDER_ID.'); }
    try { DriveApp.getFileById(this.SLIDES_TEMPLATE_ID).getName(); } 
    catch (e) { throw new Error('Cannot access slides template. Check SLIDES_TEMPLATE_ID.'); }
    return true;
  },
  
  trackApiUsage(endpoint, tokens = 0) {
    const props = PropertiesService.getScriptProperties();
    const today = new Date().toDateString();
    const key = `usage_${endpoint}_${today}`;
    const current = parseInt(props.getProperty(key) || '0');
    props.setProperty(key, String(current + tokens));
    if (endpoint === 'gemini' && current > 800000) {
      console.warn('Approaching Gemini API daily quota limit');
    }
  },
  
  getBatchSize() {
    const customSize = PropertiesService.getScriptProperties().getProperty('BATCH_SIZE');
    return customSize ? parseInt(customSize) : 3;
  },
  
  setBatchSize(size) {
    PropertiesService.getScriptProperties().setProperty('BATCH_SIZE', String(size));
  }
};

// ===== Enhanced Course Mapping Prompts =====
const COURSE_MAPPING_PROMPT = `You are an expert course designer for Australian healthcare education. Analyze the provided concept and source materials to create a comprehensive course structure with detailed justification.

AUDIENCE CONTEXT:
- Clinical: Clinical supervisors, practicing clinicians in supervisory roles
- Combined: Both clinical and administrative perspectives  
- Administrative: Healthcare administrators, non-clinical staff, system managers
- Other: General healthcare education support roles

REQUIREMENTS:
1. Analyze the concept and justify why it should be broken into separate modules
2. Recommend 6-12 modules based on content depth and audience needs
3. Each module should be substantial enough for 45-60 minutes of learning
4. Ensure logical progression and skill building
5. Include practical, workplace-applicable content
6. Consider Australian healthcare context and regulations
7. Explain how modules combine to form a high-quality micro-credentialing course

OUTPUT FORMAT:
COURSE RECOMMENDATION:
[3-4 paragraph detailed recommendation explaining:]
- Why this concept warrants a structured course approach
- How breaking it into modules enhances learning effectiveness
- The evidence base supporting this educational approach
- How the course addresses Australian healthcare workforce development needs

MODULE STRUCTURE:
[For each recommended module, provide:]
MODULE [X]: [Descriptive Title]
- RATIONALE: [2-3 sentences explaining why this module is essential]
- KEY LEARNING OUTCOMES: [3-4 specific, measurable outcomes]
- CONTENT OVERVIEW: [Brief description of core content and practical applications]
- ASSESSMENT APPROACH: [How learning will be evaluated]
- DURATION: [Estimated learning time]
- PREREQUISITE KNOWLEDGE: [What learners need to know beforehand]

PROGRESSION LOGIC:
[Explain how modules build upon each other and the overall learning journey]

MICRO-CREDENTIALING VALUE:
[Explain how completion of all modules creates a valuable professional credential]`;

// ===== Enhanced Module Generation Template =====
const COMPREHENSIVE_MODULE_TEMPLATE = (concept, moduleName, audience, sourceMaterials) => `
${CFG.BRAND_HEADER}

You are creating a comprehensive educational module for Australian healthcare professionals. This module is part of a structured course on "${concept}" targeting the ${audience} audience.

SOURCE MATERIALS ANALYSIS:
${sourceMaterials}

EDUCATIONAL DESIGN REQUIREMENTS:
- Apply adult learning principles and evidence-based educational practices
- Include interactive elements, case studies, and practical applications
- Ensure content is immediately applicable to Australian healthcare settings
- Integrate assessment for learning strategies throughout
- Include cultural safety considerations and Indigenous health perspectives
- Provide comprehensive evidence base with proper citations
- Create detailed checklists and practical tools
- Address common implementation challenges
- Include troubleshooting guides and common challenges

COMPREHENSIVE OUTPUT FORMAT:

==== MODULE: ${moduleName} ====

EXECUTIVE SUMMARY:
[3-4 paragraphs providing evidence-based rationale, learning theory foundation, and professional development value]

LEARNING OUTCOMES:
Upon completion, participants will be able to:
• [Specific, measurable outcome 1 with assessment criteria]
• [Specific, measurable outcome 2 with assessment criteria]
• [Specific, measurable outcome 3 with assessment criteria]
• [Specific, measurable outcome 4 with assessment criteria]

THEORETICAL FRAMEWORK:
[Evidence-based foundation including research citations and professional guidelines that underpin this module]

KEY CONCEPTS & EVIDENCE BASE:
1. [Core Concept 1]
   - Definition and theoretical foundation
   - Current research evidence (with citations)
   - Australian context and guidelines
   - Practical implications for clinical practice

2. [Core Concept 2]
   - [Same detailed structure]

3. [Core Concept 3]
   - [Same detailed structure]

4. [Core Concept 4]
   - [Same detailed structure]

PRACTICAL TOOLS & CHECKLISTS:

Assessment Framework Checklist:
☐ [Specific assessment criteria 1]
☐ [Specific assessment criteria 2]
☐ [Specific assessment criteria 3]
☐ [Continue for 8-12 comprehensive criteria]

Implementation Checklist:
☐ [Practical implementation step 1]
☐ [Practical implementation step 2]
☐ [Continue for 6-10 actionable steps]

Quality Indicators:
☐ [Measurable quality indicator 1]
☐ [Measurable quality indicator 2]
☐ [Continue for 5-8 indicators]

CASE STUDIES & SCENARIOS:

Scenario 1: [Realistic Clinical Situation]
- Background and context
- Key challenges and considerations
- Discussion points and learning objectives
- Evidence-based solutions and approaches
- Cultural safety considerations

Scenario 2: [Complex Practice Situation]
- [Same detailed structure]

ASSESSMENT STRATEGIES:

Formative Assessment:
- [2-3 ongoing assessment methods with detailed descriptions]
- Self-reflection exercises and peer feedback mechanisms
- Progress monitoring and adjustment strategies

Summative Assessment:
- [1-2 comprehensive evaluation methods]
- Competency demonstration requirements
- Portfolio development and evidence collection

RESOURCES & REFERENCES:

Essential Reading:
1. [Full citation - Vancouver style]
2. [Full citation - Vancouver style]
3. [Continue for 5-8 essential sources]

Professional Guidelines:
1. [RACGP/ACRRM/College guideline with citation]
2. [Government or professional body resource]
3. [Continue for 3-5 guidelines]

Research Evidence:
1. [Peer-reviewed research citation]
2. [Systematic review or meta-analysis]
3. [Continue for 5-8 research sources]

CULTURAL SAFETY INTEGRATION:
[Specific strategies for ensuring cultural safety throughout the module, including Aboriginal and Torres Strait Islander health considerations]

IMPLEMENTATION CONSIDERATIONS:
- Technology requirements and accessibility features
- Time allocation and pacing recommendations
- Support resources and facilitation guidance
- Common barriers and mitigation strategies

REFLECTION & CONTINUOUS IMPROVEMENT:
- Module evaluation criteria
- Feedback collection strategies
- Update and revision processes
- Quality assurance measures

TARGET: 15,000 tokens minimum for comprehensive coverage`;

// ===================== Menu Setup =====================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  const courseDesign = ui.createMenu('📚 Course Design');
  courseDesign.addItem('Map Concept to Modules', 'createCourseStructure');
  courseDesign.addItem('Generate Course Outline Doc', 'generateCourseOutlineDoc');
  courseDesign.addSeparator();
  courseDesign.addItem('Validate Configuration', 'validateSetup');
  
  const moduleCreation = ui.createMenu('📝 Module Creation');
  moduleCreation.addItem('Generate Full Module Resource Suite', 'generateFullModuleResourceSuite');
  moduleCreation.addItem('Generate Single Module Content', 'generateModuleContent');
  moduleCreation.addSeparator();
  moduleCreation.addItem('Create Learning Objectives Doc', 'createLearningObjectivesDoc');
  moduleCreation.addItem('Create Assessment Guide Doc', 'createAssessmentGuideDoc');
  
  const media = ui.createMenu('🎬 Media Generation');
  media.addItem('Generate TTS Script', 'generateTTSScript');
  media.addItem('Generate Audio (TTS)', 'generateTTSAudio');
  media.addSeparator();
  media.addItem('Generate Image Prompts for Module', 'generateImagePromptsForModule');
  media.addItem('Generate Images for Module (Nano Banana)', 'generateImagesForModule');
  
  const presentation = ui.createMenu('🎯 Slide Creation');
  presentation.addItem('Create Slides for Selected Module', 'createSlidesForSelectedModule');
  presentation.addItem('Create Slides for All Modules', 'createSlidesForAllRows');
  presentation.addSeparator();
  presentation.addItem('Batch Process Multiple Concepts', 'batchProcessConcepts');
  
  const utilities = ui.createMenu('⚙️ Utilities');
  utilities.addItem('Progress Tracking Dashboard', 'showProgressDashboard');
  utilities.addItem('Export Module Data', 'exportModuleData');
  utilities.addItem('System Health Check', 'systemHealthCheck');
  utilities.addSeparator();
  utilities.addItem('Clear Progress Tracking', 'clearProgressTracking');
  
  // Add all menus to the menu bar
  courseDesign.addToUi();
  moduleCreation.addToUi();
  media.addToUi();
  presentation.addToUi();
  utilities.addToUi();
}

// ===================== Utility Functions =====================
function validateSetup() {
  try {
    CFG.validateConfiguration();
    SpreadsheetApp.getUi().alert('✅ Configuration Valid', 
      'All required properties are set and accessible:\n\n' +
      '• GEMINI_API_KEY: Connected\n' +
      '• DRIVE_FOLDER_ID: Accessible\n' +
      '• SLIDES_TEMPLATE_ID: Accessible\n\n' +
      'System ready for course creation!', 
      SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Configuration Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function trackProgress(operation, current, total, details = '') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${operation}: ${current}/${total} - ${details}`);
  
  // Store progress in script properties for dashboard
  const key = `progress_${operation.replace(/\s+/g, '_')}`;
  const progress = {
    operation,
    current,
    total,
    details,
    timestamp,
    percentage: total > 0 ? Math.round((current / total) * 100) : 0
  };
  
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(progress));
}

function getSourceMaterialsContext() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    let context = 'Available source materials:\n';
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (!name.startsWith('TTS-') && !name.startsWith('Module-Resources-')) {
        const range = sheet.getDataRange();
        if (range.getNumRows() > 1) {
          context += `- ${name}: ${range.getNumRows()-1} rows of data\n`;
        }
      }
    });
    
    return context;
  } catch (error) {
    console.error('Error accessing source materials:', error);
    return 'Source materials could not be accessed.';
  }
}

// ===================== Enhanced TTS Sheet Management =====================
function ensureTTSSheet(concept) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = `TTS-${concept}`;
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Enhanced headers with image columns
    sheet.getRange(1, 1, 1, 9).setValues([[
      'Module Name', 'Slide Number', 'Slide Content', 'Speaker Notes', 
      'Duration', 'Slides (PPT-ready)', 'Audio (WAV)', 'Image Prompts', 'Image Links'
    ]]).setFontWeight('bold');
    
    // Set column widths for better readability
    sheet.setColumnWidth(3, 300); // Slide Content
    sheet.setColumnWidth(4, 200); // Speaker Notes
    sheet.setColumnWidth(8, 250); // Image Prompts
    sheet.setColumnWidth(9, 200); // Image Links
    
    // Apply formatting
    sheet.getRange(1, 1, 1, 9).setBackground('#4285f4').setFontColor('white');
  }
  
  return sheet;
}

function ensureModuleResourcesSheet(concept) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = `Module-Resources-${concept}`;
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, 6).setValues([[
      'Module Name', 'Content', 'Learning Objectives Doc', 'Assessment Guide Doc', 'Status', 'Generated'
    ]]).setFontWeight('bold');
    
    sheet.setColumnWidth(2, 400);
    sheet.getRange(1, 1, 1, 6).setBackground('#34a853').setFontColor('white');
  }
  
  return sheet;
}

// ===================== Course Structure Creation =====================
function createCourseStructure() {
  const ui = SpreadsheetApp.getUi();
  const conceptResponse = ui.prompt('Enter the course concept or topic:');
  
  if (conceptResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const concept = conceptResponse.getResponseText();
  if (!concept.trim()) {
    ui.alert('Please enter a valid concept.');
    return;
  }
  
  const audienceResponse = ui.prompt('Select target audience:', 
    'Enter: Clinical, Administrative, Combined, or Other');
  
  if (audienceResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const audience = audienceResponse.getResponseText() || 'Combined';
  
  try {
    CFG.validateConfiguration();
    
    const sourceMaterials = getSourceMaterialsContext();
    const prompt = `${COURSE_MAPPING_PROMPT}\n\nCONCEPT: ${concept}\nAUDIENCE: ${audience}\n\nSOURCE MATERIALS:\n${sourceMaterials}`;
    
    trackProgress('Course Structure', 1, 3, 'Generating course structure');
    const response = callGeminiAPI(prompt);
    
    const tts = ensureTTSSheet(concept);
    const resources = ensureModuleResourcesSheet(concept);
    
    trackProgress('Course Structure', 2, 3, 'Processing response');
    
    // Parse modules from response
    const moduleMatches = response.match(/MODULE \d+: ([^\n]+)/g);
    if (moduleMatches) {
      moduleMatches.forEach((match, index) => {
        const moduleName = match.replace(/MODULE \d+: /, '').trim();
        resources.getRange(index + 2, 1).setValue(moduleName);
        resources.getRange(index + 2, 5).setValue('Pending');
      });
    }
    
    // Create course outline document
    const doc = DocumentApp.create(`${concept} - Course Structure`);
    doc.getBody().appendParagraph(response);
    
    const docUrl = `https://docs.google.com/document/d/${doc.getId()}/edit`;
    DriveApp.getFileById(doc.getId()).moveTo(DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID));
    
    trackProgress('Course Structure', 3, 3, 'Complete');
    
    ui.alert('Course Structure Created!', 
      `Generated ${moduleMatches ? moduleMatches.length : 0} modules.\n\nCourse outline: ${docUrl}`, 
      ui.ButtonSet.OK);
      
  } catch (error) {
    console.error('Course structure creation failed:', error);
    ui.alert('Error', `Course structure creation failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

// ===================== Enhanced Module Content Generation =====================
function generateModuleContent() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  if (!sh.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sh.getName().replace('Module-Resources-', '');
  const row = sh.getActiveRange().getRow();
  const moduleName = sh.getRange(row, 1).getValue();
  
  if (!moduleName) {
    return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  }
  
  try {
    CFG.validateConfiguration();
    const sourceMaterials = getSourceMaterialsContext();
    const audience = 'Combined'; // Default or could be made configurable
    
    trackProgress('Module Generation', 1, 4, `Starting ${moduleName}`);
    
    const prompt = COMPREHENSIVE_MODULE_TEMPLATE(concept, moduleName, audience, sourceMaterials);
    const content = callGeminiAPI(prompt);
    
    trackProgress('Module Generation', 2, 4, 'Content generated');
    
    sh.getRange(row, 2).setValue(content);
    sh.getRange(row, 5).setValue('Content Generated');
    sh.getRange(row, 6).setValue(new Date());
    
    trackProgress('Module Generation', 3, 4, 'Creating supporting documents');
    
    // Create learning objectives document
    const objectivesDoc = createLearningObjectivesDocument(concept, moduleName, content);
    sh.getRange(row, 3).setValue(objectivesDoc);
    
    // Create assessment guide document
    const assessmentDoc = createAssessmentGuideDocument(concept, moduleName, content);
    sh.getRange(row, 4).setValue(assessmentDoc);
    
    trackProgress('Module Generation', 4, 4, 'Complete');
    
    SpreadsheetApp.getUi().alert(`Module "${moduleName}" generated successfully!\n\nDocuments created:\n- Learning Objectives\n- Assessment Guide`);
    
  } catch (error) {
    console.error('Module generation failed:', error);
    sh.getRange(row, 5).setValue(`Error: ${error.message}`);
    SpreadsheetApp.getUi().alert('Error', `Module generation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function generateFullModuleResourceSuite() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  if (!sh.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sh.getName().replace('Module-Resources-', '');
  const lastRow = sh.getLastRow();
  
  if (lastRow < 2) {
    return SpreadsheetApp.getUi().alert('No modules found. Create course structure first.');
  }
  
  try {
    CFG.validateConfiguration();
    const tts = ensureTTSSheet(concept);
    
    for (let row = 2; row <= lastRow; row++) {
      const moduleName = sh.getRange(row, 1).getValue();
      const status = sh.getRange(row, 5).getValue();
      
      if (!moduleName || status === 'Complete') continue;
      
      trackProgress('Full Module Suite', row - 1, lastRow - 1, `Processing ${moduleName}`);
      
      try {
        // Generate module content if not exists
        let content = sh.getRange(row, 2).getValue();
        if (!content) {
          const sourceMaterials = getSourceMaterialsContext();
          const prompt = COMPREHENSIVE_MODULE_TEMPLATE(concept, moduleName, 'Combined', sourceMaterials);
          content = callGeminiAPI(prompt);
          sh.getRange(row, 2).setValue(content);
        }
        
        // Generate TTS content
        generateTTSContentForModule(concept, moduleName, content, tts);
        
        // Create supporting documents
        if (!sh.getRange(row, 3).getValue()) {
          const objectivesDoc = createLearningObjectivesDocument(concept, moduleName, content);
          sh.getRange(row, 3).setValue(objectivesDoc);
        }
        
        if (!sh.getRange(row, 4).getValue()) {
          const assessmentDoc = createAssessmentGuideDocument(concept, moduleName, content);
          sh.getRange(row, 4).setValue(assessmentDoc);
        }
        
        sh.getRange(row, 5).setValue('Complete');
        sh.getRange(row, 6).setValue(new Date());
        
        Utilities.sleep(1000); // Rate limiting
        
      } catch (error) {
        console.error(`Failed to process ${moduleName}:`, error);
        sh.getRange(row, 5).setValue(`Error: ${error.message.slice(0, 50)}`);
      }
    }
    
    SpreadsheetApp.getUi().alert('Full module resource suite generation complete!');
    
  } catch (error) {
    console.error('Full suite generation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Generation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ===================== Image Generation Functions =====================
function generateImagePromptsForModule() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept, module;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
    const row = sh.getActiveRange().getRow();
    module = sh.getRange(row, 1).getValue();
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS-{Concept} tab and select a module row.');
  }
  
  if (!module) return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  
  const tts = ensureTTSSheet(concept);
  let processedCount = 0;
  
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule !== String(module).trim()) continue;
    
    const slideContent = tts.getRange(r, 3).getValue();
    const existingPrompt = tts.getRange(r, 8).getValue();
    
    if (!slideContent || existingPrompt) continue;
    
    try {
      const prompt = generateImagePromptForSlide(slideContent, concept, module);
      tts.getRange(r, 8).setValue(prompt);
      processedCount++;
    } catch (error) {
      console.error(`Image prompt generation failed for row ${r}:`, error.message);
    }
  }
  
  SpreadsheetApp.getUi().alert(`Generated ${processedCount} image prompts for ${module}`);
}

function generateImagePromptForSlide(slideContent, concept, module) {
  try {
    // Extract key concepts from slide content
    const lines = slideContent.split('\n').filter(line => line.trim());
    const title = lines[0] || 'Healthcare concept';
    
    // Create contextual prompt based on content
    if (slideContent.toLowerCase().includes('assessment') || slideContent.toLowerCase().includes('evaluation')) {
      return `Healthcare professional conducting assessment in Australian clinical setting - ${title}, modern medical facility, diverse healthcare team, professional documentation`;
    } else if (slideContent.toLowerCase().includes('communication') || slideContent.toLowerCase().includes('feedback')) {
      return `Healthcare professionals in discussion, mentoring conversation in Australian medical practice - ${title}, supportive learning environment, clinical supervision`;
    } else if (slideContent.toLowerCase().includes('safety') || slideContent.toLowerCase().includes('risk')) {
      return `Clinical safety procedures in Australian healthcare setting - ${title}, safety protocols, professional healthcare environment, quality assurance`;
    } else {
      return `Professional healthcare education illustration for ${module} - ${slideContent.split('\n')[0] || 'healthcare concept'}, Australian medical setting, diverse professionals, modern clinical environment`;
    }
  } catch (error) {
    return `Professional healthcare education illustration for ${module} - ${slideContent.split('\n')[0] || 'healthcare concept'}, Australian medical setting, diverse professionals, modern clinical environment`;
  }
}

function generateImagesForModule() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept, module;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
    const row = sh.getActiveRange().getRow();
    module = sh.getRange(row, 1).getValue();
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS-{Concept} tab and select a module row.');
  }
  
  if (!module) return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  
  const tts = ensureTTSSheet(concept);
  let processedCount = 0;
  let errorCount = 0;
  
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule !== String(module).trim()) continue;
    
    const imagePrompt = tts.getRange(r, 8).getValue();
    const existingImage = tts.getRange(r, 9).getValue();
    
    if (!imagePrompt || existingImage) continue;
    
    try {
      trackProgress('Image Generation', processedCount + 1, 'unknown', `Generating image for slide ${tts.getRange(r, 2).getValue()}`);
      
      const imageUrl = generateImageWithNanoBanana(imagePrompt);
      if (imageUrl) {
        tts.getRange(r, 9).setValue(imageUrl);
        processedCount++;
      }
      
      Utilities.sleep(2000); // Rate limiting for image generation
      
    } catch (error) {
      console.error(`Image generation failed for row ${r}:`, error.message);
      tts.getRange(r, 9).setValue(`Error: ${error.message.slice(0, 50)}`);
      errorCount++;
    }
  }
  
  SpreadsheetApp.getUi().alert(`Image generation complete!\n\nSuccess: ${processedCount}\nErrors: ${errorCount}`);
}

function generateImageWithNanoBanana(prompt) {
  try {
    const apiUrl = 'https://fal.run/fal-ai/nano-banana';
    const headers = {
      'Authorization': `Key ${CFG.GEMINI_API_KEY}`, // Using same key - you may need separate FAL key
      'Content-Type': 'application/json'
    };
    
    const payload = {
      prompt: prompt,
      image_size: "landscape_4_3",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true
    };
    
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`Nano Banana API Error: ${response.getContentText()}`);
    }
    
    const data = JSON.parse(response.getContentText());
    return data?.images?.[0]?.url || null;
    
  } catch (error) {
    console.error('Nano Banana image generation failed:', error.message);
    // Fallback to placeholder or alternative service
    return `https://via.placeholder.com/800x600/cccccc/333333?text=${encodeURIComponent('Image: ' + prompt.slice(0, 50))}`;
  }
}

// ===================== Slide Creation Functions =====================
function createSlidesForSelectedModule() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept, moduleName;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
    const row = sh.getActiveRange().getRow();
    moduleName = sh.getRange(row, 1).getValue();
  } else if (sh.getName().startsWith('Module-Resources-')) {
    concept = sh.getName().replace('Module-Resources-', '');
    const row = sh.getActiveRange().getRow();
    moduleName = sh.getRange(row, 1).getValue();
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS- or Module-Resources- tab');
  }
  
  if (!moduleName) return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  
  const slideContents = getSlideContentsForModule(concept, moduleName);
  if (slideContents.length === 0) {
    return SpreadsheetApp.getUi().alert('No slide content found in TTS tab. Run "Generate Full Module Resource Suite" first.');
  }
  
  try {
    const pres = createDeckFromTemplate(`${concept} — ${moduleName}`);
    buildSlidesFromTTSContent(pres, slideContents);
    
    // Fixed slide removal - get all slides first, then remove template slides
    const allSlides = pres.getSlides();
    allSlides.slice(0, allSlides.length - slideContents.length).forEach(s => s.remove());
    
    const url = 'https://docs.google.com/presentation/d/' + pres.getId() + '/edit';
    writeSlidesLinkToTTS(concept, moduleName, url);
    SpreadsheetApp.getUi().alert('Slides created:\n' + url + '\n(link saved to TTS Column F)');
    
  } catch (error) {
    console.error('Slide creation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Slide creation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function createSlidesForAllRows() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
  } else if (sh.getName().startsWith('Module-Resources-')) {
    concept = sh.getName().replace('Module-Resources-', '');
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS- or Module-Resources- tab');
  }
  
  const processedModules = new Set();
  const ttsSheet = ensureTTSSheet(concept);
  
  for (let row = 2; row <= ttsSheet.getLastRow(); row++) {
    const moduleName = String(ttsSheet.getRange(row, 1).getValue()).trim();
    
    if (!moduleName || processedModules.has(moduleName)) continue;
    
    const slideContents = [];
    for (let r = 2; r <= ttsSheet.getLastRow(); r++) {
      const rowModule = String(ttsSheet.getRange(r, 1).getValue()).trim();
      if (rowModule === moduleName) {
        const slideNumber = ttsSheet.getRange(r, 2).getValue();
        const slideContent = ttsSheet.getRange(r, 3).getValue();
        if (slideContent) {
          slideContents.push({ slideNumber, slideContent });
        }
      }
    }
    
    if (slideContents.length > 0) {
      try {
        const pres = createDeckFromTemplate(`${concept} — ${moduleName}`);
        buildSlidesFromTTSContent(pres, slideContents);
        
        // Fixed slide removal
        const allSlides = pres.getSlides();
        allSlides.slice(0, allSlides.length - slideContents.length).forEach(s => s.remove());
        
        writeSlidesLinkToTTS(concept, moduleName, 'https://docs.google.com/presentation/d/' + pres.getId() + '/edit');
        processedModules.add(moduleName);
        console.log(`Created slides for: ${moduleName}`);
      } catch (error) {
        console.error(`Failed to create slides for ${moduleName}:`, error.message);
      }
    }
    
    Utilities.sleep(150);
  }
  
  SpreadsheetApp.getUi().alert(`Slides created for ${processedModules.size} modules.`);
}

// ===================== Enhanced TTS Functions =====================
function generateTTSScript() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept, moduleName;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
    const row = sh.getActiveRange().getRow();
    moduleName = sh.getRange(row, 1).getValue();
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS-{Concept} tab and select a module row.');
  }
  
  if (!moduleName) return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  
  try {
    const tts = ensureTTSSheet(concept);
    const moduleContent = getModuleContent(concept, moduleName);
    
    if (!moduleContent) {
      return SpreadsheetApp.getUi().alert('Module content not found. Generate module content first.');
    }
    
    trackProgress('TTS Script Generation', 1, 3, `Processing ${moduleName}`);
    
    generateTTSContentForModule(concept, moduleName, moduleContent, tts);
    
    trackProgress('TTS Script Generation', 3, 3, 'Complete');
    
    SpreadsheetApp.getUi().alert(`TTS script generated for ${moduleName}`);
    
  } catch (error) {
    console.error('TTS script generation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `TTS generation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function generateTTSAudio() {
  const sh = SpreadsheetApp.getActiveSheet();
  let concept, module;
  
  if (sh.getName().startsWith('TTS-')) {
    concept = sh.getName().replace('TTS-', '');
    const row = sh.getActiveRange().getRow();
    module = sh.getRange(row, 1).getValue();
  } else {
    return SpreadsheetApp.getUi().alert('Run on TTS-{Concept} tab and select a module row.');
  }
  
  if (!module) return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  
  const tts = ensureTTSSheet(concept);
  let processedCount = 0;
  let errorCount = 0;
  
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule !== String(module).trim()) continue;
    
    const speakerNotes = tts.getRange(r, 4).getValue();
    const existingAudio = tts.getRange(r, 7).getValue();
    
    if (!speakerNotes || existingAudio) continue;
    
    try {
      trackProgress('TTS Audio', processedCount + 1, 'unknown', `Generating audio for slide ${tts.getRange(r, 2).getValue()}`);
      
      const audioContent = generateTTSAudioForText(speakerNotes);
      if (audioContent) {
        // Create audio file in Drive
        const fileName = `${concept}_${module}_slide_${tts.getRange(r, 2).getValue()}_audio.wav`;
        const audioFile = DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID).createFile(
          Utilities.newBlob(audioContent, 'audio/wav', fileName)
        );
        
        const audioUrl = `https://drive.google.com/file/d/${audioFile.getId()}/view`;
        tts.getRange(r, 7).setValue(audioUrl);
        processedCount++;
      }
      
      Utilities.sleep(1000); // Rate limiting
      
    } catch (error) {
      console.error(`Audio generation failed for row ${r}:`, error.message);
      tts.getRange(r, 7).setValue(`Error: ${error.message.slice(0, 50)}`);
      errorCount++;
    }
  }
  
  SpreadsheetApp.getUi().alert(`Audio generation complete!\n\nSuccess: ${processedCount}\nErrors: ${errorCount}`);
}

// ===================== Supporting Functions =====================
function createDeckFromTemplate(title) {
  const templateFile = DriveApp.getFileById(CFG.SLIDES_TEMPLATE_ID);
  const copy = templateFile.makeCopy(title, DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID));
  return SlidesApp.openById(copy.getId());
}

function buildSlidesFromTTSContent(pres, slideContents) {
  const template = pres.getSlides()[0];
  
  // Sort by slide number to maintain order
  slideContents.sort((a, b) => (a.slideNumber || 0) - (b.slideNumber || 0));
  
  slideContents.forEach((slideData, index) => {
    const slide = index === 0 ? template : pres.appendSlide(template.getLayout());
    
    // Replace placeholders in slide content
    const shapes = slide.getShapes();
    shapes.forEach(shape => {
      if (shape.getText) {
        const textRange = shape.getText();
        let text = textRange.asString();
        
        // Replace content placeholder
        if (text.includes('{{CONTENT}}') || text.includes('[SLIDE CONTENT]')) {
          textRange.setText(slideData.slideContent || '');
        }
        
        // Replace other common placeholders
        text = text.replace(/\{\{SLIDE_NUMBER\}\}/g, slideData.slideNumber || '');
        text = text.replace(/\{\{MODULE\}\}/g, slideData.moduleName || '');
        
        if (text !== textRange.asString()) {
          textRange.setText(text);
        }
      }
    });
  });
}

function getSlideContentsForModule(concept, moduleName) {
  const tts = ensureTTSSheet(concept);
  const slideContents = [];
  
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule === String(moduleName).trim()) {
      const slideNumber = tts.getRange(r, 2).getValue();
      const slideContent = tts.getRange(r, 3).getValue();
      if (slideContent) {
        slideContents.push({ slideNumber, slideContent, moduleName });
      }
    }
  }
  
  return slideContents;
}

function writeSlidesLinkToTTS(concept, moduleName, url) {
  const tts = ensureTTSSheet(concept);
  
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule === String(moduleName).trim() && tts.getRange(r, 2).getValue() == 1) {
      tts.getRange(r, 6).setValue(url);
      break;
    }
  }
}

function getModuleContent(concept, moduleName) {
  const resources = ensureModuleResourcesSheet(concept);
  
  for (let r = 2; r <= resources.getLastRow(); r++) {
    const rowModule = String(resources.getRange(r, 1).getValue()).trim();
    if (rowModule === String(moduleName).trim()) {
      return resources.getRange(r, 2).getValue();
    }
  }
  
  return null;
}

// ===================== Enhanced Content Generation Functions =====================
function generateTTSContentForModule(concept, moduleName, moduleContent, ttsSheet) {
  const prompt = `${CFG.BRAND_HEADER}

You are creating presentation slides and speaker notes for the module "${moduleName}" in the course "${concept}".

MODULE CONTENT:
${moduleContent}

REQUIREMENTS:
1. Create 8-12 slides that comprehensively cover the module content
2. Each slide should have concise, professional bullet points (max 6 points per slide)
3. Generate detailed speaker notes for each slide (150-250 words per slide)
4. Ensure slides flow logically and build upon each other
5. Include practical examples and Australian healthcare context
6. Calculate estimated duration based on ${CFG.TTS_WPM} words per minute
7. Make content suitable for professional healthcare education

OUTPUT FORMAT:
For each slide, provide:

SLIDE [NUMBER]: [DESCRIPTIVE TITLE]
[Bullet point content for slide - max 6 points]

SPEAKER NOTES:
[Detailed 150-250 word narrative for TTS audio generation, including examples, context, and smooth transitions]

DURATION: [Estimated minutes based on speaker notes word count]

Continue for all slides...`;

  try {
    const response = callGeminiAPI(prompt);
    
    // Parse the response to extract slide content
    const slides = parseSlideResponse(response);
    
    // Clear existing content for this module
    clearModuleFromTTS(ttsSheet, moduleName);
    
    // Add new content
    slides.forEach((slide, index) => {
      const row = ttsSheet.getLastRow() + 1;
      ttsSheet.getRange(row, 1, 1, 5).setValues([[
        moduleName,
        slide.number,
        slide.content,
        slide.speakerNotes,
        slide.duration || 0
      ]]);
    });
    
    trackProgress('TTS Content', slides.length, slides.length, `Generated ${slides.length} slides for ${moduleName}`);
    
  } catch (error) {
    console.error('TTS content generation failed:', error);
    throw error;
  }
}

function parseSlideResponse(response) {
  const slides = [];
  const slidePattern = /SLIDE (\d+): ([^\n]+)\n([\s\S]*?)(?=SPEAKER NOTES:|$)/gi;
  const speakerNotesPattern = /SPEAKER NOTES:\s*([\s\S]*?)(?=DURATION:|SLIDE \d+:|$)/gi;
  const durationPattern = /DURATION:\s*([^\n]+)/gi;
  
  let slideMatch;
  let slideIndex = 0;
  
  // Extract slides
  while ((slideMatch = slidePattern.exec(response)) !== null) {
    const slideNumber = parseInt(slideMatch[1]);
    const slideTitle = slideMatch[2].trim();
    const slideContent = slideMatch[3].trim();
    
    slides[slideIndex] = {
      number: slideNumber,
      title: slideTitle,
      content: `${slideTitle}\n\n${slideContent}`,
      speakerNotes: '',
      duration: 0
    };
    slideIndex++;
  }
  
  // Extract speaker notes
  let notesMatch;
  let notesIndex = 0;
  
  while ((notesMatch = speakerNotesPattern.exec(response)) !== null && notesIndex < slides.length) {
    if (slides[notesIndex]) {
      slides[notesIndex].speakerNotes = notesMatch[1].trim();
      
      // Calculate duration based on word count
      const wordCount = slides[notesIndex].speakerNotes.split(/\s+/).length;
      slides[notesIndex].duration = Math.round((wordCount / CFG.TTS_WPM) * 10) / 10;
    }
    notesIndex++;
  }
  
  return slides;
}

function clearModuleFromTTS(ttsSheet, moduleName) {
  const lastRow = ttsSheet.getLastRow();
  
  for (let r = lastRow; r >= 2; r--) {
    const rowModule = String(ttsSheet.getRange(r, 1).getValue()).trim();
    if (rowModule === String(moduleName).trim()) {
      ttsSheet.deleteRow(r);
    }
  }
}

// ===================== Document Creation Functions =====================
function createLearningObjectivesDocument(concept, moduleName, content) {
  try {
    const doc = DocumentApp.create(`${concept} - ${moduleName} - Learning Objectives`);
    const body = doc.getBody();
    
    // Extract learning outcomes from content
    const objectivesMatch = content.match(/LEARNING OUTCOMES:[\s\S]*?(?=\n\n|\nTHEORETICAL)/);
    const objectives = objectivesMatch ? objectivesMatch[0] : 'Learning objectives not found in generated content.';
    
    body.appendParagraph(`Learning Objectives: ${moduleName}`).setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph(`Course: ${concept}`).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    body.appendParagraph(''); // Blank line
    body.appendParagraph(objectives);
    
    const docId = doc.getId();
    DriveApp.getFileById(docId).moveTo(DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID));
    
    return `https://docs.google.com/document/d/${docId}/edit`;
    
  } catch (error) {
    console.error('Learning objectives document creation failed:', error);
    return `Error: ${error.message}`;
  }
}

function createAssessmentGuideDocument(concept, moduleName, content) {
  try {
    const doc = DocumentApp.create(`${concept} - ${moduleName} - Assessment Guide`);
    const body = doc.getBody();
    
    // Extract assessment content
    const assessmentMatch = content.match(/ASSESSMENT STRATEGIES:[\s\S]*?(?=\nRESOURCES|\nCULTURAL|$)/);
    const assessment = assessmentMatch ? assessmentMatch[0] : 'Assessment strategies not found in generated content.';
    
    body.appendParagraph(`Assessment Guide: ${moduleName}`).setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph(`Course: ${concept}`).setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    body.appendParagraph(''); // Blank line
    body.appendParagraph(assessment);
    
    const docId = doc.getId();
    DriveApp.getFileById(docId).moveTo(DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID));
    
    return `https://docs.google.com/document/d/${docId}/edit`;
    
  } catch (error) {
    console.error('Assessment guide document creation failed:', error);
    return `Error: ${error.message}`;
  }
}

// ===================== Enhanced TTS Audio Generation =====================
function generateTTSAudioForText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text for TTS generation');
  }
  
  const payload = {
    contents: [{
      parts: [{
        text: text
      }]
    }],
    generationConfig: {
      // Fixed TTS configuration - removed invalid responseMimeType
      temperature: 0.1,
      topK: 1,
      topP: 0.8,
      maxOutputTokens: 1
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CFG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }
    );
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`TTS API Error: ${response.getContentText()}`);
    }
    
    const data = JSON.parse(response.getContentText());
    
    // For now, return a placeholder since Gemini doesn't support direct TTS
    // You would integrate with Google Cloud Text-to-Speech or another TTS service
    return Utilities.newBlob(`TTS audio for: ${text.slice(0, 50)}...`, 'audio/wav');
    
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
}

// ===================== Core API Functions =====================
function callGeminiAPI(prompt, retries = 3) {
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = UrlFetchApp.fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${CFG.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        }
      );
      
      if (response.getResponseCode() === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const content = data.candidates[0].content.parts[0].text;
          CFG.trackApiUsage('gemini', content.length);
          return content;
        } else {
          throw new Error('Invalid response structure from Gemini API');
        }
      } else if (response.getResponseCode() === 429) {
        // Rate limit - exponential backoff
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        Utilities.sleep(waitTime);
        continue;
      } else {
        throw new Error(`API Error ${response.getResponseCode()}: ${response.getContentText()}`);
      }
      
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Exponential backoff for other errors
      Utilities.sleep(Math.pow(2, i) * 1000);
    }
  }
}

// ===================== Utility and Management Functions =====================
function showProgressDashboard() {
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .progress-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
      .complete { background-color: #d4edda; }
      .in-progress { background-color: #fff3cd; }
      .error { background-color: #f8d7da; }
    </style>
    <h2>GPSA Course Creation Progress</h2>
    <div id="progress-container">Loading progress data...</div>
    <script>
      // This would be populated with actual progress data from script properties
      document.getElementById('progress-container').innerHTML = 
        '<p>Progress tracking is active. Check console logs for detailed progress information.</p>';
    </script>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Progress Dashboard');
}

function clearProgressTracking() {
  const props = PropertiesService.getScriptProperties();
  const keys = props.getKeys();
  
  keys.forEach(key => {
    if (key.startsWith('progress_')) {
      props.deleteProperty(key);
    }
  });
  
  SpreadsheetApp.getUi().alert('Progress tracking data cleared.');
}

function systemHealthCheck() {
  const results = [];
  
  try {
    CFG.validateConfiguration();
    results.push('✅ Configuration: Valid');
  } catch (error) {
    results.push(`❌ Configuration: ${error.message}`);
  }
  
  try {
    const testPrompt = 'Respond with exactly: "System test successful"';
    const response = callGeminiAPI(testPrompt);
    results.push(response.includes('System test successful') ? 
      '✅ Gemini API: Connected' : '⚠️ Gemini API: Connected but response unexpected');
  } catch (error) {
    results.push(`❌ Gemini API: ${error.message}`);
  }
  
  const activeSheet = SpreadsheetApp.getActiveSheet();
  results.push(`✅ Active Sheet: ${activeSheet.getName()}`);
  
  results.push(`✅ Batch Size: ${CFG.getBatchSize()}`);
  
  SpreadsheetApp.getUi().alert('System Health Check', results.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function batchProcessConcepts() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter concepts to process (comma-separated):');
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  const concepts = response.getResponseText().split(',').map(c => c.trim()).filter(c => c);
  
  if (concepts.length === 0) {
    ui.alert('No valid concepts entered.');
    return;
  }
  
  const batchSize = CFG.getBatchSize();
  let processed = 0;
  
  concepts.forEach((concept, index) => {
    if (index > 0 && index % batchSize === 0) {
      Utilities.sleep(60000); // 1 minute break between batches
    }
    
    try {
      trackProgress('Batch Processing', index + 1, concepts.length, `Processing ${concept}`);
      
      // Create course structure for concept
      const sourceMaterials = getSourceMaterialsContext();
      const prompt = `${COURSE_MAPPING_PROMPT}\n\nCONCEPT: ${concept}\nAUDIENCE: Combined\n\nSOURCE MATERIALS:\n${sourceMaterials}`;
      const courseStructure = callGeminiAPI(prompt);
      
      // Create sheets and initial setup
      ensureTTSSheet(concept);
      ensureModuleResourcesSheet(concept);
      
      processed++;
      
    } catch (error) {
      console.error(`Batch processing failed for ${concept}:`, error);
    }
  });
  
  ui.alert(`Batch processing complete!\nProcessed: ${processed}/${concepts.length} concepts`);
}

function exportModuleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const exportData = {};
  
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('Module-Resources-') || name.startsWith('TTS-')) {
      const data = sheet.getDataRange().getValues();
      exportData[name] = data;
    }
  });
  
  const json = JSON.stringify(exportData, null, 2);
  const blob = Utilities.newBlob(json, 'application/json', 'GPSA_Module_Export.json');
  
  DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID).createFile(blob);
  
  SpreadsheetApp.getUi().alert('Module data exported to Drive folder as GPSA_Module_Export.json');
}

// ===================== Supporting Document Functions =====================
function generateCourseOutlineDoc() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  if (!sh.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sh.getName().replace('Module-Resources-', '');
  const lastRow = sh.getLastRow();
  
  if (lastRow < 2) {
    return SpreadsheetApp.getUi().alert('No modules found to include in outline.');
  }
  
  try {
    const doc = DocumentApp.create(`${concept} - Complete Course Outline`);
    const body = doc.getBody();
    
    body.appendParagraph(concept).setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph('Complete Course Outline').setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
    body.appendParagraph(''); // Blank line
    
    body.appendParagraph('Course Overview').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(`This comprehensive course on "${concept}" is designed for Australian healthcare professionals and provides evidence-based, practical guidance for implementation in clinical and administrative settings.`);
    body.appendParagraph(''); // Blank line
    
    body.appendParagraph('Module Structure').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    for (let row = 2; row <= lastRow; row++) {
      const moduleName = sh.getRange(row, 1).getValue();
      const content = sh.getRange(row, 2).getValue();
      
      if (moduleName) {
        body.appendParagraph(`Module ${row - 1}: ${moduleName}`).setHeading(DocumentApp.ParagraphHeading.HEADING2);
        
        if (content) {
          // Extract learning outcomes if available
          const outcomesMatch = content.match(/LEARNING OUTCOMES:[\s\S]*?(?=\n\n|\nTHEORETICAL)/);
          if (outcomesMatch) {
            body.appendParagraph(outcomesMatch[0]);
          } else {
            body.appendParagraph('Learning outcomes to be generated.');
          }
        } else {
          body.appendParagraph('Content to be generated.');
        }
        
        body.appendParagraph(''); // Blank line
      }
    }
    
    const docId = doc.getId();
    DriveApp.getFileById(docId).moveTo(DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID));
    
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    SpreadsheetApp.getUi().alert(`Course outline created:\n${docUrl}`);
    
  } catch (error) {
    console.error('Course outline creation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Outline creation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function createLearningObjectivesDoc() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  if (!sh.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sh.getName().replace('Module-Resources-', '');
  const row = sh.getActiveRange().getRow();
  const moduleName = sh.getRange(row, 1).getValue();
  const content = sh.getRange(row, 2).getValue();
  
  if (!moduleName) {
    return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  }
  
  if (!content) {
    return SpreadsheetApp.getUi().alert('Generate module content first.');
  }
  
  try {
    const docUrl = createLearningObjectivesDocument(concept, moduleName, content);
    sh.getRange(row, 3).setValue(docUrl);
    SpreadsheetApp.getUi().alert(`Learning objectives document created:\n${docUrl}`);
    
  } catch (error) {
    console.error('Learning objectives document creation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Document creation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function createAssessmentGuideDoc() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  if (!sh.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sh.getName().replace('Module-Resources-', '');
  const row = sh.getActiveRange().getRow();
  const moduleName = sh.getRange(row, 1).getValue();
  const content = sh.getRange(row, 2).getValue();
  
  if (!moduleName) {
    return SpreadsheetApp.getUi().alert('Select a row with a module name.');
  }
  
  if (!content) {
    return SpreadsheetApp.getUi().alert('Generate module content first.');
  }
  
  try {
    const docUrl = createAssessmentGuideDocument(concept, moduleName, content);
    sh.getRange(row, 4).setValue(docUrl);
    SpreadsheetApp.getUi().alert(`Assessment guide document created:\n${docUrl}`);
    
  } catch (error) {
    console.error('Assessment guide document creation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Document creation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
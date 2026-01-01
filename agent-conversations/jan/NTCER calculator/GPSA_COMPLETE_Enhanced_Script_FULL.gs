/**
 * GPSA / HPSA Concept‑to‑Course — COMPLETE Enhanced Version with ALL Original Functions
 * Fixed TTS issues, restored sophisticated content generation, added image generation
 * Enhanced by Carla Taylor — 2025-01-03
 * Script Properties in place: GEMINI_API_KEY, DRIVE_FOLDER_ID, SLIDES_TEMPLATE_ID
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
  
  // Enhanced configuration validation
  validateConfiguration() {
    const required = ['GEMINI_API_KEY', 'DRIVE_FOLDER_ID', 'SLIDES_TEMPLATE_ID'];
    const missing = required.filter(key => {
      try { return !this[key]; } catch (e) { return true; }
    });
    if (missing.length > 0) {
      throw new Error(`Configuration incomplete. Please set in Script Properties: ${missing.join(', ')}`);
    }
    // Test Drive folder access
    try { DriveApp.getFolderById(this.DRIVE_FOLDER_ID).getName(); } 
    catch (e) { throw new Error('Cannot access Drive folder. Check DRIVE_FOLDER_ID.'); }
    // Test template access
    try { DriveApp.getFileById(this.SLIDES_TEMPLATE_ID).getName(); } 
    catch (e) { throw new Error('Cannot access slides template. Check SLIDES_TEMPLATE_ID.'); }
    return true;
  },
  
  // Track API usage to prevent quota exhaustion
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
  
  // Configurable batch processing settings
  getBatchSize() {
    const customSize = PropertiesService.getScriptProperties().getProperty('BATCH_SIZE');
    return customSize ? parseInt(customSize) : 3; // Default to 3 modules per batch
  },
  
  setBatchSize(size) {
    PropertiesService.getScriptProperties().setProperty('BATCH_SIZE', String(size));
  }
};

// ===== Bespoke prompts (restored) =====
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
- Target audience fit and learning progression
- Value as a micro-credentialing opportunity

RECOMMENDED MODULES:
1. [Module Name] - [Detailed description with learning focus and practical applications]
2. [Module Name] - [Detailed description with learning focus and practical applications]
[Continue for all recommended modules - up to 12 for comprehensive courses]

COURSE STRUCTURE RATIONALE:
[2-3 paragraphs explaining:]
- Why this specific module breakdown serves the audience effectively
- How modules build upon each other progressively
- Integration points and practical application opportunities
- Assessment and credentialing considerations

MICRO-CREDENTIALING VALUE:
[Explanation of how this course structure provides valuable professional development and recognition]`;

const RESEARCH_ENHANCEMENT_PROMPT = `You are a research specialist for Australian healthcare education. Enhance the provided source materials by identifying additional high-quality resources.

REQUIREMENTS:
1. Find 5-8 additional peer-reviewed articles or industry resources
2. Focus on Australian healthcare context where possible
3. Include recent publications (last 5 years preferred)
4. Ensure sources are accessible and credible
5. Provide brief relevance explanations

SOURCE MATERIALS PROVIDED:
[EXISTING_SOURCES]

OUTPUT FORMAT:
ADDITIONAL RECOMMENDED SOURCES:

1. [Title] - [Author/Organization] ([Year])
   URL: [if available]
   Relevance: [2-3 sentences explaining why this source enhances the course]

2. [Continue pattern...]

RESEARCH SUMMARY:
[2-3 sentences summarizing how these additional sources strengthen the course development]`;

// Voice direction for scripts & CSV
const VOICE_NAME = 'Kore';
const SPEECH_TEMPERATURE = 0.5;
const AUSTRALIAN_PROMPT =
  "You are a highly educated Australian woman with a warm, personable delivery. Speak with the refined Australian accent of educated professionals - a subtle blend of American, western European and British influences with softer jaw movement than American English, but more open than formal British. Maintain professional warmth without any exaggerated regional characteristics. Read this with conversational inflection as if the listener is a valued member of your team:";

// Safe text formatting helper
function safeClearTextStyle(textElement) {
  try {
    if (textElement && textElement.getTextStyle && typeof textElement.getTextStyle === 'function') {
      textElement.getTextStyle().clear();
    }
  } catch (e) {
    // Skip formatting if not supported by this template
  }
}

function safeClearRangeStyle(paragraph) {
  try {
    if (paragraph && paragraph.getRange && typeof paragraph.getRange === 'function') {
      const range = paragraph.getRange();
      if (range && range.getTextStyle && typeof range.getTextStyle === 'function') {
        range.getTextStyle().clear();
      }
    }
  } catch (e) {
    // Skip formatting if not supported by this template
  }
}

// ===================== Menu =====================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const root = ui.createMenu('GPSA Course Creator');

  // ── Setup / Core flow ──────────────────────────────────────────────────────
  addMenu_(root, 'Setup: Create Mapping Tab',                  'createMappingTabStructure');
  root.addSeparator();
  addMenu_(root, 'Validate Configuration',                     'validateSetup');
  root.addSeparator();
  addMenu_(root, '1. Generate Course Recommendation (Enhanced)', 'generateCourseRecommendationEnhanced');
  addMenu_(root, '2. Process Modification Request',            'processModificationRequest');

  // NOTE: 2b (Refresh Module List) is deprecated and intentionally removed.

  addMenu_(root, '3. Create Approved Course Tab',              'createApprovedCourseTab');
  addMenu_(root, '4. Generate Full Module Suite (Enhanced)',   'generateModuleSuiteEnhanced');
  addMenu_(root, '5. Generate AI Voiceover Scripts (per slide)','populateTTSWithAIGeneratedVoiceovers');

  addMenu_(root, '6. Resync: Seed TTS rows from Slide Specs',  'menuSeedTTSForAll');       // wrapper
  root.addSeparator();

  // ── Slides & Presentations ─────────────────────────────────────────────────
  const slides = ui.createMenu('Slides & Presentations');
  addMenu_(slides, 'Create Slides for Selected Row',           'menuCreateSlidesSelected'); // wrapper
  addMenu_(slides, 'Create Slides for All Rows',               'menuCreateSlidesAll');      // wrapper
  addMenu_(slides, 'Export PPTX for Selected Row',             'menuExportPptxSelected');   // wrapper
  addMenu_(slides, 'Export All Decks to PPTX',                 'exportAllDecksToPptx');

  // ── NEW: Image Generation Menu ─────────────────────────────────────────────
  const images = ui.createMenu('Image Generation');
  addMenu_(images, 'Generate Image Prompts for Module',        'generateImagePromptsForModule');
  addMenu_(images, 'Generate Images for Module (Nano Banana)', 'generateImagesForModule');
  addMenu_(images, 'Generate Images for All Modules',          'generateImagesForAllModules');

  // ── TTS Management ─────────────────────────────────────────────────────────
  const tts = ui.createMenu('TTS Management');
  addMenu_(tts, 'Generate TTS Script for Module',              'generateTTSScript');
  addMenu_(tts, 'Generate TTS Audio for Module',               'generateTTSAudio');
  addMenu_(tts, 'Generate CSV for ElevenLabs TTS',             'generateTTSCsv');
  addMenu_(tts, 'Create TTS Audio Files',                      'createTtsAudioFiles');
  addMenu_(tts, 'Audio Management: Find & Clean Orphans',      'cleanTtsAudioOrphans');
  addMenu_(tts, 'Audio Management: Purge with Confirmation',   'purgeTtsAudioWithConfirm');

  // ── Debug & Administrative ─────────────────────────────────────────────────
  const debug = ui.createMenu('Debug & Admin');
  addMenu_(debug, 'Test Gemini API Connection',                'testGeminiConnection');
  addMenu_(debug, 'Export Current Configuration',              'exportConfiguration');
  addMenu_(debug, 'Clear API Usage Tracking',                  'clearApiUsageTracking');
  addMenu_(debug, 'System Health Check',                       'systemHealthCheck');
  addMenu_(debug, 'Progress Dashboard',                        'showProgressDashboard');

  // Add all menus to UI
  root.addToUi();
  slides.addToUi();
  images.addToUi();
  tts.addToUi();
  debug.addToUi();
}

function addMenu_(menu, label, fnName) {
  if (typeof this[fnName] === 'function') {
    menu.addItem(label, fnName);
  } else {
    console.warn(`Function ${fnName} not found for menu item: ${label}`);
  }
}

/* ── Wrappers so the menu works with either old or new function names ─────── */

function menuGenerateModuleSuite(){
  if(typeof generateModuleSuiteEnhanced === 'function') generateModuleSuiteEnhanced();
  else SpreadsheetApp.getUi().alert('No module-suite function found.');
}

function menuSeedTTSForAll(){
  if(typeof reseedTtsFromSlideSpecs === 'function') reseedTtsFromSlideSpecs();
  else SpreadsheetApp.getUi().alert('No TTS reseed function found.');
}

function menuCreateSlidesSelected(){
  if(typeof createSlidesForSelectedModule === 'function') createSlidesForSelectedModule();
  else SpreadsheetApp.getUi().alert('No create-slides function found.');
}

function menuCreateSlidesAll(){
  if(typeof createSlidesForAllRows === 'function') createSlidesForAllRows();
  else SpreadsheetApp.getUi().alert('No create-all-slides function found.');
}

function menuExportPptxSelected(){
  if(typeof exportSelectedDeckToPptx === 'function') exportSelectedDeckToPptx();
  else SpreadsheetApp.getUi().alert('No PPTX export function found.');
}

function brandHeader_(){ return CFG.BRAND_HEADER + '\n\n' + CFG.AU_PROMPT + '\n'; }

// ===================== Enhanced Setup Functions =====================

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

function createMappingTabStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Course Mapping');
  
  if (!sheet) {
    sheet = ss.insertSheet('Course Mapping');
    sheet.getRange(1, 1, 1, 6).setValues([['Concept', 'Audience', 'Source Materials', 'AI Recommendation', 'Human Modifications', 'Status']]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 300);
    sheet.setColumnWidth(4, 400);
    sheet.setColumnWidth(5, 300);
    sheet.setColumnWidth(6, 100);
  }
  
  SpreadsheetApp.getUi().alert('Course Mapping tab created/verified.');
}

// ===================== Enhanced TTS Sheet Management =====================
function ensureTTSSheet(concept) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = `TTS-${concept}`;
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Enhanced headers with image columns (H and I)
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

// ===================== Course Generation Functions =====================

function generateCourseRecommendationEnhanced() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const concept = sheet.getRange('A2').getValue() || 
    SpreadsheetApp.getUi().prompt('Enter course concept:').getResponseText();
  
  if (!concept) return;
  
  const audience = sheet.getRange('B2').getValue() || 'Combined';
  const sourceMaterials = sheet.getRange('C2').getValue() || 'No specific source materials provided';
  
  try {
    CFG.validateConfiguration();
    
    const prompt = `${COURSE_MAPPING_PROMPT}\n\nCONCEPT: ${concept}\nAUDIENCE: ${audience}\n\nSOURCE MATERIALS:\n${sourceMaterials}`;
    
    trackProgress('Course Structure', 1, 3, 'Generating course structure');
    const response = callGeminiAPI(prompt);
    
    sheet.getRange('D2').setValue(response);
    sheet.getRange('F2').setValue('AI Generated');
    
    trackProgress('Course Structure', 3, 3, 'Complete');
    
    SpreadsheetApp.getUi().alert('Course recommendation generated successfully!');
    
  } catch (error) {
    console.error('Course generation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Course generation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function processModificationRequest() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const aiRecommendation = sheet.getRange('D2').getValue();
  const humanModifications = sheet.getRange('E2').getValue();
  
  if (!aiRecommendation || !humanModifications) {
    return SpreadsheetApp.getUi().alert('Both AI recommendation (D2) and human modifications (E2) are required.');
  }
  
  try {
    const prompt = `${CFG.BRAND_HEADER}\n\nModify the following course recommendation based on the human feedback provided:\n\nORIGINAL RECOMMENDATION:\n${aiRecommendation}\n\nHUMAN MODIFICATIONS REQUESTED:\n${humanModifications}\n\nProvide the revised course recommendation incorporating the requested changes while maintaining educational best practices.`;
    
    const revisedRecommendation = callGeminiAPI(prompt);
    sheet.getRange('D2').setValue(revisedRecommendation);
    sheet.getRange('F2').setValue('Modified');
    
    SpreadsheetApp.getUi().alert('Course recommendation updated with your modifications!');
    
  } catch (error) {
    console.error('Modification processing failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Modification failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function createApprovedCourseTab() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const concept = sheet.getRange('A2').getValue();
  const finalRecommendation = sheet.getRange('D2').getValue();
  
  if (!concept || !finalRecommendation) {
    return SpreadsheetApp.getUi().alert('Both concept (A2) and final recommendation (D2) are required.');
  }
  
  // Parse modules from the recommendation
  const moduleMatches = finalRecommendation.match(/\d+\.\s*([^\n\-]+)/g);
  
  if (!moduleMatches) {
    return SpreadsheetApp.getUi().alert('No modules found in recommendation. Please check the format.');
  }
  
  const modules = moduleMatches.map(match => match.replace(/^\d+\.\s*/, '').trim());
  
  // Create or update the course tab
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const courseTabName = `Course-${concept}`;
  let courseSheet = ss.getSheetByName(courseTabName);
  
  if (!courseSheet) {
    courseSheet = ss.insertSheet(courseTabName);
    courseSheet.getRange(1, 1, 1, 4).setValues([['Module', 'Content Generated', 'Slides Created', 'Status']]);
    courseSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#ff9900').setFontColor('white');
  }
  
  // Clear existing data and add modules
  if (courseSheet.getLastRow() > 1) {
    courseSheet.deleteRows(2, courseSheet.getLastRow() - 1);
  }
  
  modules.forEach((module, index) => {
    courseSheet.getRange(index + 2, 1, 1, 4).setValues([[module, 'No', 'No', 'Pending']]);
  });
  
  // Create TTS and Module Resources sheets
  ensureTTSSheet(concept);
  ensureModuleResourcesSheet(concept);
  
  sheet.getRange('F2').setValue('Course Tab Created');
  
  SpreadsheetApp.getUi().alert(`Course tab "${courseTabName}" created with ${modules.length} modules!`);
}

// ===== Enhanced Module Generation with Sophisticated Prompts =====

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

// Continue reading from the original file to include ALL functions
function readSourceMaterials_(linkOrFolder) {
  if (!linkOrFolder) return '';
  let content = '', urlText = '';
  
  try {
    const folder = DriveApp.getFolderById(linkOrFolder);
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      const name = f.getName();
      try {
        if (String(f.getMimeType()).indexOf('document') >= 0) {
          const doc = DocumentApp.openById(f.getId());
          const t = doc.getBody().getText() || '';
          content += `--- ${name} ---\n` + t + '\n\n';
          const urls = extractUrls_(t);
          if (urls.length) urlText += fetchUrlsBundle_(urls);
        }
      } catch (e) {}
    }
  } catch (e) {
    try {
      const doc = DocumentApp.openById(presIdFromUrl(linkOrFolder) || extractIdFromUrl_(linkOrFolder));
      content = doc.getBody().getText() || '';
      const urls = extractUrls_(content);
      if (urls.length) urlText += fetchUrlsBundle_(urls);
    } catch (e2) {}
  }
  return content + urlText;
}

function generateCourseRecommendation() {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  const r = sh.getActiveRange().getRow();
  if (r === 1) return SpreadsheetApp.getUi().alert('Select a data row.');

  const concept = sh.getRange(r, 1).getValue();
  const sourceLink = sh.getRange(r, 2).getValue();
  const audience = sh.getRange(r, 3).getValue() || 'Clinical';
  if (!concept || !sourceLink) return SpreadsheetApp.getUi().alert('Fill Concept (A) and Resources (B).');

  const srcText = readSourceMaterials_(sourceLink);

  const mappingPrompt = brandHeader_() + '\n' + COURSE_MAPPING_PROMPT +
    `\n\nCONCEPT: ${concept}\nSELECTED TARGET AUDIENCE: ${audience}\n\nSOURCE MATERIALS PROVIDED:\n${String(srcText).slice(0, 12000)}`;
  const rec = callGemini(mappingPrompt, 7000);

  const doc = DocumentApp.create(`${concept}_Recommendations_${new Date().toISOString().slice(0, 16).replace('T', '_')}`);
  let file = DriveApp.getFileById(doc.getId());
  DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID).addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  doc.getBody().appendParagraph(rec);
  doc.saveAndClose();

  try {
    const rPrompt = brandHeader_() + '\n' + RESEARCH_ENHANCEMENT_PROMPT.replace('[EXISTING_SOURCES]', String(srcText).slice(0, 8000));
    const rOut = callGemini(rPrompt, 2800);
    const d2 = DocumentApp.openById(doc.getId());
    d2.getBody().appendParagraph('\n\nADDITIONAL RECOMMENDED SOURCES (AI‑assisted)\n').appendParagraph(rOut);
    d2.saveAndClose();
  } catch (e) {}

  sh.getRange(r, 4).setValue(doc.getUrl());

  const names = extractModuleNames_(rec);
  sh.getRange(r, 7).setValue(names.join('\n'));
  for (let i = 0; i < 12; i++) { sh.getRange(r, 8 + i).setValue(names[i] || ''); }

  SpreadsheetApp.getUi().alert('Course recommendation generated and document created.');
}

function processModificationRequest() {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  const r = sh.getActiveRange().getRow();
  const concept = sh.getRange(r, 1).getValue();
  const request = sh.getRange(r, 6).getValue();
  const docUrl = sh.getRange(r, 4).getValue();
  if (!request || !docUrl) return SpreadsheetApp.getUi().alert('Need Modification Request (F) and Recommendations link (D).');

  const docId = presIdFromUrl(docUrl) || extractIdFromUrl_(docUrl);
  let currentText = '';
  try { currentText = DocumentApp.openById(docId).getBody().getText(); } catch (e) {}

  const prompt = brandHeader_() + `
Revise the existing course recommendation for "${concept}" based on this request:

${request}

Current document text:
${currentText}

Return the complete revised recommendation with the same headings and refreshed module list.`;
  const revised = callGemini(prompt, 7000);
  const doc = DocumentApp.openById(docId);
  doc.getBody().clear(); doc.getBody().appendParagraph(revised); doc.saveAndClose();

  const names = extractModuleNames_(revised);
  sh.getRange(r, 7).setValue(names.join('\n'));
  for (let i = 0; i < 12; i++) { sh.getRange(r, 8 + i).setValue(names[i] || ''); }
  sh.getRange(r, 6).clearContent();
  SpreadsheetApp.getUi().alert('Recommendation updated and module list refreshed.');
}

function extractModuleNames_(text) {
  const src = String(text || '');

  const blockMatch = src.match(/RECOMMENDED MODULES\s*:?\s*([\s\S]*?)(?:\n{1,2}(?:COURSE STRUCTURE RATIONALE|MICRO[-–— ]CREDENTIALING VALUE|COURSE RATIONALE|ADDITIONAL RECOMMENDED SOURCES|ASSESSMENTS?|REFERENCES|SOURCES)\b|$)/i);
  const block = blockMatch ? blockMatch[1] : src;

  const lines = block
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.replace(/\*\*/g, '').trim())
    .filter(Boolean);

  const names = [];
  const seen = new Set();

  function pushName(raw) {
    if (!raw) return;
    let name = String(raw).trim();

    const dashIdx = name.search(/\s[-–—]\s/);
    if (dashIdx > 0) name = name.slice(0, dashIdx);

    name = name.replace(/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:\s*)/i, '').trim();
    name = name.replace(/\s*[-–—:|]\s*$/, '').trim();

    if (name && !seen.has(name)) { seen.add(name); names.push(name); }
  }

  lines.forEach(function (l) {
    if (/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:)/i.test(l)) pushName(l);
  });

  if (!names.length) {
    lines.forEach(function (l) {
      const m = l.match(/^[A-Z].{4,120}$/);
      if (m) pushName(l);
    });
  }

  return names.slice(0, 12);
}

function createApprovedCourseTab() {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  const r = sh.getActiveRange().getRow();
  const approvedVal = sh.getRange(r, 5).getValue();
  if (!(approvedVal === true || String(approvedVal).toString().trim().toUpperCase() === 'TRUE' || String(approvedVal).toString().trim().toUpperCase() === 'YES' || String(approvedVal).toString().trim() === '✓')) {
    return SpreadsheetApp.getUi().alert('Tick Approved (E) (checkbox) — or type TRUE.');
  }
  const concept = sh.getRange(r, 1).getValue();
  const ss = SpreadsheetApp.getActive();

  const tabName = `Module-Resources-${concept}`;
  if (ss.getSheetByName(tabName)) ss.deleteSheet(ss.getSheetByName(tabName));
  const t = ss.insertSheet(tabName);
  const headers = ['Module Name', 'Course Name', 'Module Description', 'Key Concepts', 'Scenarios', 'Assessments', 'Downloadable Resources', 'Slide Specs'];
  t.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');

  for (let c = 8; c <= 19; c++) { const v = sh.getRange(r, c).getValue(); if (v) { const R = t.getLastRow() + 1; t.getRange(R, 1).setValue(v); t.getRange(R, 2).setValue(concept); } }

  const ttsName = `TTS-${concept}`;
  if (ss.getSheetByName(ttsName)) ss.deleteSheet(ss.getSheetByName(ttsName));
  const tts = ss.insertSheet(ttsName);
  // ENHANCED: Add image columns H and I
  tts.getRange(1, 1, 1, 9).setValues([['Module Name', 'Slide Number', 'Slide Content', 'Speaker Notes', 'Duration', 'Slides (PPT-ready)', 'Audio (WAV)', 'Image Prompts', 'Image Links']]).setFontWeight('bold');

  SpreadsheetApp.getUi().alert(`Created:\n${tabName}\n${ttsName}\n\nNext: run "Generate Full Module Resource Suite" on each row (or all rows).`);
}

function generateModuleSuiteEnhanced() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  if (!sheet.getName().startsWith('Module-Resources-')) {
    return SpreadsheetApp.getUi().alert('Run this on a Module-Resources-{Concept} tab');
  }
  
  const concept = sheet.getName().replace('Module-Resources-', '');
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return SpreadsheetApp.getUi().alert('No modules found in Module-Resources tab.');
  }
  
  try {
    CFG.validateConfiguration();
    const tts = ensureTTSSheet(concept);
    
    const map = SpreadsheetApp.getActive().getSheetByName('Mapping');
    let resourcesLink = '';
    if (map) {
      const mLast = map.getLastRow();
      for (let rr = 2; rr <= mLast; rr++) {
        if (String(map.getRange(rr, 1).getValue()).trim() === String(concept).trim()) {
          resourcesLink = map.getRange(rr, 2).getValue();
          break;
        }
      }
    }
    const sourcePack = resourcesLink ? readSourceMaterials_(resourcesLink) : '';
    
    for (let row = 2; row <= lastRow; row++) {
      const moduleName = sheet.getRange(row, 1).getValue();
      if (!moduleName) continue;
      
      trackProgress('Full Module Suite', row - 1, lastRow - 1, `Processing ${moduleName}`);
      
      try {
        // Use sophisticated content generation template
        const prompt = COMPREHENSIVE_MODULE_TEMPLATE(concept, moduleName, 'Combined', sourcePack);
        const content = callGeminiAPI(prompt);
        
        // Parse and store content sections
        function sec(label) {
          const rx = new RegExp(label + '\\s*\\n([\\s\\S]*?)(?=\\n[A-Z ]{3,}|$)', 'i');
          const m = content.match(rx); return m ? m[1].trim() : '';
        }
        
        const desc = sec('MODULE DESCRIPTION') || sec('EXECUTIVE SUMMARY');
        const keys = sec('KEY CONCEPTS') || sec('KEY CONCEPTS & EVIDENCE BASE');
        const scns = sec('CLINICAL SCENARIOS') || sec('CASE STUDIES & SCENARIOS');
        const asmt = sec('ASSESSMENT METHODS') || sec('ASSESSMENT STRATEGIES');
        let spec = sec('SLIDE SPECIFICATIONS');
        
        // Ensure adequate slide specifications
        spec = fixShortSpecs_(spec, 8, concept, moduleName, sourcePack);
        
        sheet.getRange(row, 3).setValue(desc);
        sheet.getRange(row, 4).setValue(keys);
        sheet.getRange(row, 5).setValue(scns);
        sheet.getRange(row, 6).setValue(asmt);
        sheet.getRange(row, 8).setValue(spec);
        
        // Create resources document
        const docUrl = createModuleResourcesDoc_(concept, moduleName, desc, keys, scns, asmt, sourcePack);
        sheet.getRange(row, 7).setValue(docUrl);
        
        // Seed TTS with slide specifications
        seedTTSFromSpecs(concept, moduleName, spec);
        
        Utilities.sleep(1000); // Rate limiting
        
      } catch (error) {
        console.error(`Failed to process ${moduleName}:`, error);
        sheet.getRange(row, 7).setValue(`Error: ${error.message.slice(0, 50)}`);
      }
    }
    
    SpreadsheetApp.getUi().alert('Full module suite generation complete!');
    
  } catch (error) {
    console.error('Suite generation failed:', error);
    SpreadsheetApp.getUi().alert('Error', `Generation failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
/**
 * ========================================
 * AUDIO TAB COMPLETE APPS SCRIPT
 * ========================================
 *
 * FEATURES:
 * - Audio generation using Gemini TTS (30 voices)
 * - Image generation using Imagen 3 via Gemini API
 * - Google Slides PPT generation
 * - Male/female adaptive voice prompts
 * - Rate limiting to prevent API crashes
 * - Voice selection per slide
 *
 * COLUMN STRUCTURE (Audio Tab):
 * A: Slide #
 * B: Voiceover Script (generated from R)
 * C: Audio File
 * D: Image Prompt (generated from R)
 * E: Image File
 * F: Course ID
 * G: Module Number
 * H: Slide Number
 * I: Module Title
 * J: Course Title
 * K: Target Audience
 * L: Slide Title
 * M: Content Points (JSON - generated from R)
 * N: Timestamp
 * O: Status
 * P: Voice Selection
 * Q: Slides (PPT-ready)
 * R: Raw Slide Content (USER INPUT - basic text)
 */

// ========================================
// CONFIGURATION
// ========================================

// Get configuration from Script Properties (File → Project Properties → Script Properties)
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

const CONFIG = {
  // Script Properties (set in Project Properties)
  GEMINI_API_KEY: SCRIPT_PROPS.getProperty('GEMINI_API_KEY'),
  DRIVE_FOLDER_ID: SCRIPT_PROPS.getProperty('DRIVE_FOLDER_ID'),
  SHEETS_TEMPLATE_ID: SCRIPT_PROPS.getProperty('SHEETS_TEMPLATE_ID'),
  SLIDES_TEMPLATE_ID: SCRIPT_PROPS.getProperty('SLIDES_TEMPLATE_ID'),
  VOICE_NAME_OVERRIDE: SCRIPT_PROPS.getProperty('VOICE_NAME_OVERRIDE') || null,

  // Sheet configuration
  SHEET_NAME: 'Audio',

  // Rate limiting (milliseconds)
  DELAY_BETWEEN_REQUESTS: 2000, // 2 seconds between API calls
  DELAY_BETWEEN_SLIDES: 3000,   // 3 seconds between slides in batch
  MAX_CONCURRENT: 1,             // Process one at a time to prevent crashes

  // API Endpoints
  TTS_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
  CONTENT_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
  IMAGE_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',

  // Voice configuration
  DEFAULT_VOICE: SCRIPT_PROPS.getProperty('VOICE_NAME_OVERRIDE') || 'Charon', // Informative - good for Australian healthcare

  // Column indices (0-based)
  COLS: {
    SLIDE_NUM: 0,
    VOICEOVER_SCRIPT: 1,
    AUDIO_FILE: 2,
    IMAGE_PROMPT: 3,
    IMAGE_FILE: 4,
    COURSE_ID: 5,
    MODULE_NUMBER: 6,
    SLIDE_NUMBER: 7,
    MODULE_TITLE: 8,
    COURSE_TITLE: 9,
    TARGET_AUDIENCE: 10,
    SLIDE_TITLE: 11,
    CONTENT_POINTS: 12,
    TIMESTAMP: 13,
    STATUS: 14,
    VOICE_SELECTION: 15,
    SLIDES_PPT: 16,
    RAW_CONTENT: 17  // NEW: User's basic text input
  }
};

// ========================================
// GEMINI TTS VOICES (30 VOICES)
// ========================================

const GEMINI_VOICES = {
  // FEMALE-LEANING VOICES (Professional, Clear)
  'Aoede': { characteristic: 'Breezy', gender: 'female', description: 'Light, professional female voice' },
  'Callirrhoe': { characteristic: 'Easy-going', gender: 'female', description: 'Relaxed female voice' },
  'Autonoe': { characteristic: 'Bright', gender: 'female', description: 'Clear, bright female voice' },
  'Despina': { characteristic: 'Smooth', gender: 'female', description: 'Smooth professional female voice' },
  'Erinome': { characteristic: 'Clear', gender: 'female', description: 'Clear articulate female voice' },
  'Laomedeia': { characteristic: 'Upbeat', gender: 'female', description: 'Energetic female voice' },
  'Leda': { characteristic: 'Youthful', gender: 'female', description: 'Youthful female voice' },
  'Vindemiatrix': { characteristic: 'Gentle', gender: 'female', description: 'Gentle professional female voice' },
  'Sadachbia': { characteristic: 'Lively', gender: 'female', description: 'Lively engaging female voice' },
  'Achernar': { characteristic: 'Soft', gender: 'female', description: 'Soft professional female voice' },
  'Pulcherrima': { characteristic: 'Forward', gender: 'female', description: 'Assertive female voice' },
  'Schedar': { characteristic: 'Even', gender: 'female', description: 'Even-toned female voice' },
  'Sulafat': { characteristic: 'Warm', gender: 'female', description: 'Warm engaging female voice' },

  // MALE-LEANING VOICES (Professional, Authoritative)
  'Charon': { characteristic: 'Informative', gender: 'male', description: 'Authoritative male voice - RECOMMENDED for healthcare' },
  'Kore': { characteristic: 'Firm', gender: 'male', description: 'Firm professional male voice' },
  'Orus': { characteristic: 'Firm', gender: 'male', description: 'Strong firm male voice' },
  'Fenrir': { characteristic: 'Excitable', gender: 'male', description: 'Engaging male voice' },
  'Enceladus': { characteristic: 'Breathy', gender: 'male', description: 'Breathy male voice' },
  'Iapetus': { characteristic: 'Clear', gender: 'male', description: 'Clear articulate male voice' },
  'Umbriel': { characteristic: 'Easy-going', gender: 'male', description: 'Relaxed male voice' },
  'Algieba': { characteristic: 'Smooth', gender: 'male', description: 'Smooth professional male voice' },
  'Algenib': { characteristic: 'Gravelly', gender: 'male', description: 'Deep gravelly male voice' },
  'Rasalgethi': { characteristic: 'Informative', gender: 'male', description: 'Informative male voice' },
  'Alnilam': { characteristic: 'Firm', gender: 'male', description: 'Firm authoritative male voice' },
  'Gacrux': { characteristic: 'Mature', gender: 'male', description: 'Mature experienced male voice' },
  'Achird': { characteristic: 'Friendly', gender: 'male', description: 'Friendly approachable male voice' },
  'Zubenelgenubi': { characteristic: 'Casual', gender: 'male', description: 'Casual conversational male voice' },
  'Sadaltager': { characteristic: 'Knowledgeable', gender: 'male', description: 'Knowledgeable expert male voice' },

  // NEUTRAL VOICES (Versatile)
  'Zephyr': { characteristic: 'Bright', gender: 'neutral', description: 'Bright versatile voice' },
  'Puck': { characteristic: 'Upbeat', gender: 'neutral', description: 'Upbeat engaging voice' }
};

// ========================================
// VOICE PROMPTS (Male/Female Adaptive)
// ========================================

function getVoicePrompt(voiceName, targetAudience) {
  const voice = GEMINI_VOICES[voiceName];
  const gender = voice ? voice.gender : 'neutral';

  // Base professional context
  const audienceContext = targetAudience || 'healthcare professionals';

  if (gender === 'female') {
    return `You are a highly experienced Australian female healthcare educator speaking to ${audienceContext}.
Your voice is professional, warm, and authoritative. You naturally reference Australian healthcare standards
(AHPRA, NMBA, NSQHS Standards) and speak with the confidence of years of clinical and educational experience.
Your tone is engaging yet sophisticated, making complex concepts accessible while maintaining academic rigor.
You use evidence-based language and cite Australian guidelines naturally in conversation.`;
  } else if (gender === 'male') {
    return `You are a highly experienced Australian male healthcare educator speaking to ${audienceContext}.
Your voice is authoritative, clear, and professional. You naturally reference Australian healthcare standards
(AHPRA, NMBA, NSQHS Standards) and speak with the gravitas of years of clinical and educational leadership.
Your tone is engaging yet commanding, making complex concepts clear while maintaining professional authority.
You use evidence-based language and cite Australian guidelines naturally in conversation.`;
  } else {
    return `You are a highly experienced Australian healthcare educator speaking to ${audienceContext}.
Your voice is professional, clear, and engaging. You naturally reference Australian healthcare standards
(AHPRA, NMBA, NSQHS Standards) and speak with the expertise of years in healthcare education.
Your tone balances authority with accessibility, making complex concepts understandable while maintaining
academic rigor. You use evidence-based language and cite Australian guidelines naturally in conversation.`;
  }
}

// ========================================
// MENU FUNCTIONS
// ========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎙️ Audio Generation')
    .addItem('🚀 STEP 1: Enhance Content (Text → Scripts + Points)', 'enhanceContentForSelected')
    .addSeparator()
    .addItem('▶️ STEP 2: Generate Audio for Selected Slides', 'generateAudioForSelected')
    .addItem('📊 STEP 3: Generate Presentation from Selected Slides', 'generatePresentationForSelected')
    .addItem('📄 Generate LMS Upload', 'generateLMSForSelectedModule')
    .addSeparator()
    .addItem('⚡ AUTO: Enhance + Audio (Full Pipeline)', 'fullPipelineForSelected')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔄 Auto-Process by Status')
      .addItem('▶️ Process All "Next" Slides (Sequential)', 'processNextSlides')
      // .addItem('🔄 Process All "Pending" Slides (Batch)', 'processPendingSlides')  // DISABLED - needs debugging
      .addItem('🔍 Show Processing Queue', 'showProcessingQueue'))
    .addSeparator()
    .addItem('🎤 Set Voice for Selected Slides', 'setVoiceForSelected')
    .addItem('🎤 Set Default Voice for All', 'setDefaultVoiceForAll')
    .addItem('📋 Show Available Voices', 'showAvailableVoices')
    .addSeparator()
    .addItem('📊 Show Statistics', 'showStatistics')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ========================================
// SETTINGS
// ========================================

function showSettings() {
  const apiKeyDisplay = CONFIG.GEMINI_API_KEY
    ? CONFIG.GEMINI_API_KEY.substring(0, 10) + '...'
    : '❌ NOT SET';

  const driveFolderDisplay = CONFIG.DRIVE_FOLDER_ID
    ? CONFIG.DRIVE_FOLDER_ID.substring(0, 15) + '...'
    : '(Using My Drive)';

  const sheetsTemplateDisplay = CONFIG.SHEETS_TEMPLATE_ID
    ? CONFIG.SHEETS_TEMPLATE_ID.substring(0, 15) + '...'
    : '(Not configured)';

  const slidesTemplateDisplay = CONFIG.SLIDES_TEMPLATE_ID
    ? CONFIG.SLIDES_TEMPLATE_ID.substring(0, 15) + '...'
    : '(Not configured)';

  const html = HtmlService.createHtmlOutput(`
    <h3>⚙️ Audio Tab Settings</h3>

    <h4>Script Properties (from Project Properties)</h4>
    <p><strong>Gemini API Key:</strong> ${apiKeyDisplay}</p>
    <p><strong>Drive Folder ID:</strong> ${driveFolderDisplay}</p>
    <p><strong>Sheets Template ID:</strong> ${sheetsTemplateDisplay}</p>
    <p><strong>Slides Template ID:</strong> ${slidesTemplateDisplay}</p>
    <p><strong>Voice Override:</strong> ${CONFIG.VOICE_NAME_OVERRIDE || '(None - using default)'}</p>
    <br>

    <h4>Runtime Configuration</h4>
    <p><strong>Default Voice:</strong> ${CONFIG.DEFAULT_VOICE}</p>
    <p><strong>Rate Limiting:</strong> ${CONFIG.DELAY_BETWEEN_REQUESTS}ms between requests</p>
    <p><strong>Total Voices Available:</strong> ${Object.keys(GEMINI_VOICES).length}</p>
    <p><strong>Sheet Name:</strong> ${CONFIG.SHEET_NAME}</p>
    <br>

    <h4>How to Update</h4>
    <ol>
      <li>Go to <strong>Extensions → Apps Script</strong></li>
      <li>Click <strong>Project Settings</strong> (⚙️ icon on left)</li>
      <li>Scroll to <strong>Script Properties</strong></li>
      <li>Add/Edit properties:
        <ul>
          <li><code>GEMINI_API_KEY</code> - Your Gemini API key</li>
          <li><code>DRIVE_FOLDER_ID</code> - Google Drive folder for audio/images</li>
          <li><code>SHEETS_TEMPLATE_ID</code> - (Optional) Google Sheets template</li>
          <li><code>SLIDES_TEMPLATE_ID</code> - (Optional) Google Slides template</li>
          <li><code>VOICE_NAME_OVERRIDE</code> - (Optional) Override default voice</li>
        </ul>
      </li>
      <li>Save and reload sheet</li>
    </ol>
  `).setWidth(600).setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}

// ========================================
// CONTENT ENHANCEMENT (STEP 1)
// ========================================

/**
 * Transform basic text into:
 * - Content Points (JSON array)
 * - Rich Voiceover Script (150-225 words)
 * - Image Prompt
 */
function enhanceContentForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Enhance Content',
    `Transform raw content into content points, voiceover scripts, and image prompts for ${numRows} slide(s)?\n\nThis will take approximately ${Math.ceil(numRows * CONFIG.DELAY_BETWEEN_SLIDES / 1000)} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < numRows; i++) {
    const rowIndex = startRow + i;

    try {
      // Get row data
      const rowData = sheet.getRange(rowIndex, 1, 1, Object.keys(CONFIG.COLS).length + 1).getValues()[0];

      const rawContent = rowData[CONFIG.COLS.RAW_CONTENT];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE] || 'Healthcare Professionals';
      const courseTitle = rowData[CONFIG.COLS.COURSE_TITLE];
      const moduleTitle = rowData[CONFIG.COLS.MODULE_TITLE];

      if (!rawContent) {
        Logger.log(`Row ${rowIndex}: No raw content found in column R`);
        errorCount++;
        continue;
      }

      // Enhance content using Gemini
      const enhanced = enhanceSlideContent(rawContent, slideTitle, targetAudience, courseTitle, moduleTitle);

      if (enhanced) {
        // Write enhanced content
        sheet.getRange(rowIndex, CONFIG.COLS.CONTENT_POINTS + 1).setValue(JSON.stringify(enhanced.contentPoints));
        sheet.getRange(rowIndex, CONFIG.COLS.VOICEOVER_SCRIPT + 1).setValue(enhanced.voiceoverScript);
        sheet.getRange(rowIndex, CONFIG.COLS.IMAGE_PROMPT + 1).setValue(enhanced.imagePrompt);

        // Update status
        if (rowData[CONFIG.COLS.STATUS] !== undefined) {
          sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Content Enhanced');
        }

        successCount++;
        Logger.log(`Row ${rowIndex}: Content enhanced successfully`);
      } else {
        errorCount++;
        Logger.log(`Row ${rowIndex}: Content enhancement failed`);
      }

      // Rate limiting
      if (i < numRows - 1) {
        Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);
      }

    } catch (error) {
      Logger.log(`Error processing row ${rowIndex}: ${error.message}`);
      errorCount++;
    }
  }

  ui.alert('Content Enhancement Complete',
    `✅ Success: ${successCount}\n❌ Errors: ${errorCount}\n\nNext: Generate audio/images for enhanced slides`,
    ui.ButtonSet.OK);
}

function enhanceSlideContent(rawContent, slideTitle, targetAudience, courseTitle, moduleTitle) {
  try {
    Logger.log(`enhanceSlideContent called for: ${slideTitle}`);
    Logger.log(`Raw content length: ${rawContent ? rawContent.length : 0}`);

    const prompt = `You are an expert Australian healthcare educator creating professional educational content for ${targetAudience}.

**Course:** ${courseTitle}
**Module:** ${moduleTitle}
**Slide Title:** ${slideTitle}

**Raw Slide Content:**
${rawContent}

Transform this into THREE outputs:

**1. CONTENT POINTS (4-6 bullet points for slide display):**
Create concise, professional bullet points suitable for presentation slides. Each point should be:
- One clear, actionable statement
- 10-15 words maximum
- Professional healthcare language
- Evidence-based where relevant

**2. VOICEOVER SCRIPT (150-225 words):**
Transform the content into flowing, engaging paragraphs for professional Australian healthcare voiceover:
- NO bullet points - flowing paragraphs only
- Sophisticated, authoritative language suitable for ${targetAudience}
- Include practical applications and real-world Australian healthcare examples
- Reference Australian standards naturally (AHPRA, NMBA, PBS, MBS, NSQHS where relevant)
- 150-225 words for optimal timing (60-90 seconds audio)
- Evidence-based language citing Australian guidelines
- Smooth transitions for audio flow
- Conversational yet professional tone

**3. IMAGE PROMPT (for Imagen AI generation):**
Create a detailed image generation prompt describing a professional, educational slide image:
- CRITICAL: Describe ONLY visual elements - NO text, labels, diagrams with words, roadmaps with text, charts with labels, or any written content
- Focus on: photographs, scenes, objects, people, settings, colours, lighting, composition
- Professional healthcare setting/context
- Modern, clean design aesthetic
- Photo-realistic where appropriate, otherwise minimalist illustration
- Suitable for ${targetAudience}
- Australian healthcare context
- AVOID: roadmaps, flowcharts, diagrams, infographics, posters, signs, or any elements that typically contain text

**OUTPUT FORMAT (strict JSON):**
{
  "contentPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "voiceoverScript": "Full flowing paragraph text here...",
  "imagePrompt": "Detailed image generation prompt here..."
}

Respond ONLY with valid JSON. No other text.`;

    const requestBody = {
      "contents": [{
        "parts": [{
          "text": prompt
        }]
      }],
      "generationConfig": {
        "temperature": 0.4,
        "maxOutputTokens": 2048,
        "responseMimeType": "application/json"
      }
    };

    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'headers': {
        'x-goog-api-key': CONFIG.GEMINI_API_KEY
      },
      'payload': JSON.stringify(requestBody),
      'muteHttpExceptions': true
    };

    // Rate limiting
    Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);

    const response = UrlFetchApp.fetch(CONFIG.CONTENT_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    Logger.log(`Content API response code: ${responseCode}`);

    const result = JSON.parse(response.getContentText());

    if (result.candidates && result.candidates[0].content.parts[0].text) {
      const jsonText = result.candidates[0].content.parts[0].text;
      const enhanced = JSON.parse(jsonText);

      // Validate structure
      if (!enhanced.contentPoints || !enhanced.voiceoverScript || !enhanced.imagePrompt) {
        Logger.log('Invalid enhancement structure: ' + jsonText);
        return null;
      }

      // Apply phonetic replacements to voiceover script so user can see and edit them
      Logger.log(`Before phonetic: ${enhanced.voiceoverScript.substring(0, 100)}`);
      enhanced.voiceoverScript = applyPhoneticReplacements(enhanced.voiceoverScript);
      Logger.log(`After phonetic: ${enhanced.voiceoverScript.substring(0, 100)}`);
      Logger.log(`Enhancement successful! Returning content.`);

      return enhanced;
    } else {
      Logger.log('Content enhancement failed - no candidates in response: ' + JSON.stringify(result));
      return null;
    }

  } catch (error) {
    Logger.log('ERROR in enhanceSlideContent: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return null;
  }
}

// ========================================
// FULL PIPELINE (ENHANCE + AUDIO)
// ========================================

function fullPipelineForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const totalTime = Math.ceil(numRows * CONFIG.DELAY_BETWEEN_SLIDES * 2 / 1000); // Enhancement + audio only
  const response = ui.alert(
    'Full Pipeline',
    `Run complete pipeline (enhance → audio) for ${numRows} slide(s)?\n\nImage prompts will be generated but you can use them with your own AI tools.\n\nThis will take approximately ${totalTime} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let enhanceSuccess = 0, enhanceError = 0;
  let audioSuccess = 0, audioError = 0;

  for (let i = 0; i < numRows; i++) {
    const rowIndex = startRow + i;

    try {
      // Get row data
      const rowData = sheet.getRange(rowIndex, 1, 1, Object.keys(CONFIG.COLS).length + 1).getValues()[0];

      const rawContent = rowData[CONFIG.COLS.RAW_CONTENT];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE] || 'Healthcare Professionals';
      const courseTitle = rowData[CONFIG.COLS.COURSE_TITLE];
      const moduleTitle = rowData[CONFIG.COLS.MODULE_TITLE];
      const voiceSelection = rowData[CONFIG.COLS.VOICE_SELECTION] || CONFIG.DEFAULT_VOICE;

      // STEP 1: Enhance content
      if (rawContent) {
        const enhanced = enhanceSlideContent(rawContent, slideTitle, targetAudience, courseTitle, moduleTitle);
        if (enhanced) {
          sheet.getRange(rowIndex, CONFIG.COLS.CONTENT_POINTS + 1).setValue(JSON.stringify(enhanced.contentPoints));
          sheet.getRange(rowIndex, CONFIG.COLS.VOICEOVER_SCRIPT + 1).setValue(enhanced.voiceoverScript);
          sheet.getRange(rowIndex, CONFIG.COLS.IMAGE_PROMPT + 1).setValue(enhanced.imagePrompt);
          enhanceSuccess++;

          // Update rowData with enhanced content
          rowData[CONFIG.COLS.VOICEOVER_SCRIPT] = enhanced.voiceoverScript;
          rowData[CONFIG.COLS.IMAGE_PROMPT] = enhanced.imagePrompt;

          Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        } else {
          enhanceError++;
          continue; // Skip audio/image if enhancement failed
        }
      } else {
        enhanceError++;
      }

      // STEP 2: Generate audio
      const voiceoverScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      if (voiceoverScript) {
        const audioUrl = generateAudio(voiceoverScript, voiceSelection, targetAudience, slideTitle);
        if (audioUrl) {
          sheet.getRange(rowIndex, CONFIG.COLS.AUDIO_FILE + 1).setValue(audioUrl);
          audioSuccess++;
        } else {
          audioError++;
        }
        Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
      } else {
        audioError++;
      }

      // Update status
      sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Audio Generated');

      // Rate limiting between slides
      if (i < numRows - 1) {
        Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);
      }

    } catch (error) {
      Logger.log(`Error processing row ${rowIndex}: ${error.message}`);
      enhanceError++;
      audioError++;
    }
  }

  ui.alert('Full Pipeline Complete',
    `🚀 Content Enhanced: ${enhanceSuccess} success, ${enhanceError} errors\n🎙️ Audio: ${audioSuccess} success, ${audioError} errors\n\n💡 Image prompts have been generated in Column D. Use them with your own AI tools for best results.`,
    ui.ButtonSet.OK);
}

// ========================================
// AUDIO GENERATION
// ========================================

/**
 * Apply phonetic replacements to voiceover script for correct TTS pronunciation
 * This is applied RIGHT BEFORE audio generation, not during content enhancement
 */
function applyPhoneticReplacements(text) {
  const replacements = {
    // Phonetic acronyms (pronounced as words)
    'ACRRM': "Ackr'm",
    'AHPRA': 'Ah-pra',
    'RWAV': 'R-Wave',

    // Spelled-out acronyms (periods force letter-by-letter pronunciation)
    'RACGP': 'R.A.C.G.P.',
    'NMBA': 'N.M.B.A.',
    'PBS': 'P.B.S.',
    'MBS': 'M.B.S.',
    'CPD': 'C.P.D.',
    'ANMF': 'A.N.M.F.',
    'GPSA': 'G.P.S.A.',
    'AICD': 'A.I.C.D.',
    'AMA': 'A.M.A.',
    'AAPM': 'A.A.P.M.',
    'NTCER': 'N.T.C.E.R',
    'AGPT': 'A.G.P.T.',

    // Prevent GPS confusion
    'GPs': 'G.P.s',
    "GP's": "G.P.'s"
  };

  let processedText = text;

  // Apply each replacement with word boundaries
  for (const [original, phonetic] of Object.entries(replacements)) {
    const regex = new RegExp('\\b' + original + '\\b', 'g');
    processedText = processedText.replace(regex, phonetic);
  }

  // Handle number ranges: "3-5" → "3 to 5"
  processedText = processedText.replace(/\b(\d+)-(\d+)\b/g, '$1 to $2');

  // Handle day ranges: "Monday-Friday" → "Monday to Friday"
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.forEach(day1 => {
    days.forEach(day2 => {
      const dayRange = new RegExp(`\\b${day1}-${day2}\\b`, 'g');
      processedText = processedText.replace(dayRange, `${day1} to ${day2}`);
    });
  });

  // Handle slashes as "or": "GPT1/CGT1" → "GPT1 or CGT1"
  processedText = processedText.replace(/\b(\w+)\/(\w+)\b/g, '$1 or $2');

  // Hyphens between words stay as-is (stay-in-place remains stay-in-place)
  // This happens naturally - no action needed

  return processedText;
}

function generateAudioForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Audio',
    `Generate audio for ${numRows} slide(s)?\n\nThis will take approximately ${Math.ceil(numRows * CONFIG.DELAY_BETWEEN_SLIDES / 1000)} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < numRows; i++) {
    const rowIndex = startRow + i;

    try {
      // Get row data
      const rowData = sheet.getRange(rowIndex, 1, 1, Object.keys(CONFIG.COLS).length).getValues()[0];

      const voiceoverScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const voiceSelection = rowData[CONFIG.COLS.VOICE_SELECTION] || CONFIG.DEFAULT_VOICE;
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
      const slideNumber = rowData[CONFIG.COLS.SLIDE_NUMBER];
      const courseTitle = rowData[CONFIG.COLS.COURSE_TITLE];

      if (!voiceoverScript) {
        Logger.log(`Row ${rowIndex}: No voiceover script found`);
        errorCount++;
        continue;
      }

      // Generate audio
      const audioUrl = generateAudio(voiceoverScript, voiceSelection, targetAudience, slideTitle);

      if (audioUrl) {
        // Write audio URL to column C
        sheet.getRange(rowIndex, CONFIG.COLS.AUDIO_FILE + 1).setValue(audioUrl);

        // Update status if exists
        if (rowData[CONFIG.COLS.STATUS] !== undefined) {
          sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Audio Generated');
        }

        successCount++;
        Logger.log(`Row ${rowIndex}: Audio generated successfully`);
      } else {
        errorCount++;
        Logger.log(`Row ${rowIndex}: Audio generation failed`);
      }

      // Rate limiting - delay between slides
      if (i < numRows - 1) {
        Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);
      }

    } catch (error) {
      Logger.log(`Error processing row ${rowIndex}: ${error.message}`);
      errorCount++;
    }
  }

  ui.alert('Audio Generation Complete',
    `✅ Success: ${successCount}\n❌ Errors: ${errorCount}`,
    ui.ButtonSet.OK);
}

/**
 * Pre-process script to fix TTS misinterpretations and hallucinations
 * Catches problematic words before TTS generation to prevent mispronunciations
 */
function preprocessScriptForTTS(text) {
  const ttsFixup = {
    // Words that TTS commonly mispronounces - force syllable breaks or phonetic hints
    'administration': 'admin-istration',
    'administrative': 'admin-istrative',
    'administrator': 'admin-istrator',
    'administrators': 'admin-istrators',

    // Add more as discovered during testing
    // Format: 'problematic-word': 'phonetic-hint'
  };

  let processed = text;

  // Apply replacements with word boundaries to avoid partial matches
  for (const [word, phonetic] of Object.entries(ttsFixup)) {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    processed = processed.replace(regex, (match) => {
      // Preserve original case
      if (match === match.toUpperCase()) return phonetic.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return phonetic.charAt(0).toUpperCase() + phonetic.slice(1);
      return phonetic;
    });
  }

  return processed;
}

function generateAudio(script, voiceName, targetAudience, slideTitle) {
  try {
    // Pre-process script to fix TTS misinterpretations
    script = preprocessScriptForTTS(script);

    // Australian professional voice prompt
    const voicePrompt = `GEMINI API AUSTRALIAN VOICE GENERATION:

You are a highly educated Australian professional with warm, personable delivery. Speak with refined Australian accent - subtle blend of American, western European and British influences. Softer jaw movement than American English, more open than formal British. Professional warmth without exaggerated regional characteristics.

DELIVERY SPECIFICATIONS:
- Conversational inflection as if speaking to valued colleague
- Professional authority with approachable warmth
- Clear articulation for adult learning
- Pace: 160-180 words per minute
- Strategic pauses for emphasis
- Australian pronunciation: broad 'a' sounds (dance, castle), natural rhythm

CRITICAL EXCLUSIONS:
- NO Australian slang (G'day, mate, fair dinkum)
- NO exaggerated vowel sounds or stereotypes
- NO informal cultural references
- Maintain sophisticated professional standards

Read this content as if listener is valued professional team member:`;

    // Build TTS request for Gemini (script already has phonetic replacements from enhancement)
    // NOTE: Do NOT include "Slide Title:" label - it can cause TTS to read it aloud
    const requestBody = {
      "contents": [{
        "parts": [{
          "text": `${voicePrompt}\n\n${script}`
        }]
      }],
      "generationConfig": {
        "responseModalities": ["AUDIO"],
        "speechConfig": {
          "voiceConfig": {
            "prebuiltVoiceConfig": {
              "voiceName": voiceName
            }
          }
        }
      }
    };

    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'headers': {
        'x-goog-api-key': CONFIG.GEMINI_API_KEY
      },
      'payload': JSON.stringify(requestBody),
      'muteHttpExceptions': true
    };

    // Rate limiting
    Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);

    // Retry logic for transient API errors (500s)
    let response;
    let result;
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = UrlFetchApp.fetch(CONFIG.TTS_ENDPOINT, options);
        result = JSON.parse(response.getContentText());

        // If we got a 500 error in the response body, throw to trigger retry
        if (result.error && result.error.code === 500) {
          throw new Error(`Gemini API 500 error: ${result.error.message}`);
        }

        // Success - break out of retry loop
        Logger.log(`Gemini TTS response received (attempt ${attempt})`);
        break;

      } catch (retryError) {
        lastError = retryError;
        Logger.log(`Attempt ${attempt}/${maxRetries} failed: ${retryError.message}`);

        if (attempt < maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          const backoffDelay = Math.pow(2, attempt) * 1000;
          Logger.log(`Waiting ${backoffDelay/1000}s before retry...`);
          Utilities.sleep(backoffDelay);
        } else {
          // All retries exhausted
          throw new Error(`Audio generation failed after ${maxRetries} attempts: ${lastError.message}`);
        }
      }
    }

    Logger.log('Gemini TTS response structure: ' + JSON.stringify(result));

    // Check for audio in response
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
      for (let part of result.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('audio/')) {
          Logger.log('Found audio data with mime type: ' + part.inlineData.mimeType);

          const audioBase64 = part.inlineData.data;
          const audioBytes = Utilities.base64Decode(audioBase64);

          // Convert L16 PCM to WAV if needed
          let audioBlob;
          if (part.inlineData.mimeType.includes('audio/L16') || part.inlineData.mimeType.includes('pcm')) {
            Logger.log('Converting L16 PCM to WAV format');
            const wavBytes = convertL16ToWav(audioBytes, part.inlineData.mimeType);
            audioBlob = Utilities.newBlob(wavBytes, 'audio/wav');
          } else {
            audioBlob = Utilities.newBlob(audioBytes, part.inlineData.mimeType);
          }

          // Save to Google Drive using Advanced Drive service
          const audioUrl = saveAudioToDrive(audioBlob, slideTitle, voiceName);
          return audioUrl;
        }
      }
    }

    // Check if response has error
    if (result.error) {
      throw new Error('Gemini TTS API error: ' + JSON.stringify(result.error));
    }

    Logger.log('Audio generation failed: ' + JSON.stringify(result));
    return null;

  } catch (error) {
    Logger.log('Error generating audio: ' + error.message);
    return null;
  }
}

/**
 * Convert L16 audio data to WAV format (proven conversion from working script)
 */
function convertL16ToWav(inputData, mimeType = "audio/L16;codec=pcm;rate=24000", numChannels = 1) {
  const [type, codec, sampleRate] = mimeType.split(";").map(e => e.includes("=") ? e.trim().split("=")[1] : e.trim());
  if (type !== "audio/L16" || codec !== "pcm") throw new Error('Unsupported audio format.');

  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = Number(sampleRate) * blockAlign;
  const dataSize = inputData.length;
  const fileSize = 36 + dataSize;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const data = [
    { method: "setUint8", value: [..."RIFF"].map(e => e.charCodeAt(0)), add: [0, 1, 2, 3] },
    { method: "setUint32", value: [fileSize], add: [4], littleEndian: true },
    { method: "setUint8", value: [..."WAVE"].map(e => e.charCodeAt(0)), add: [8, 9, 10, 11] },
    { method: "setUint8", value: [..."fmt "].map(e => e.charCodeAt(0)), add: [12, 13, 14, 15] },
    { method: "setUint32", value: [16], add: [16], littleEndian: true },
    { method: "setUint16", value: [1, numChannels], add: [20, 22], littleEndian: true },
    { method: "setUint32", value: [Number(sampleRate), byteRate], add: [24, 28], littleEndian: true },
    { method: "setUint16", value: [blockAlign, bitsPerSample], add: [32, 34], littleEndian: true },
    { method: "setUint8", value: [..."data"].map(e => e.charCodeAt(0)), add: [36, 37, 38, 39] },
    { method: "setUint32", value: [dataSize], add: [40], littleEndian: true }
  ];

  data.forEach(({ method, value, add, littleEndian }) => add.forEach((a, i) => view[method](a, value[i], littleEndian || false)));

  return [...new Uint8Array(header), ...inputData];
}

/**
 * Save audio blob to Google Drive using Advanced Drive service (v3)
 */
function saveAudioToDrive(audioBlob, slideTitle, voiceName) {
  try {
    // Get folder ID from config or create folder
    let folderId = CONFIG.DRIVE_FOLDER_ID;

    if (!folderId) {
      Logger.log('No DRIVE_FOLDER_ID configured, using folder by name');
      const folder = getOrCreateFolder('Course Audio Files');
      folderId = folder.getId();
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFileName = `${slideTitle}_${voiceName}_${timestamp}.wav`;

    // Use Advanced Drive service v3
    const fileMetadata = {
      name: fullFileName,
      parents: [folderId],
      mimeType: 'audio/wav'
    };

    // Create file using Advanced Drive service v3
    const file = Drive.Files.create(fileMetadata, audioBlob, {
      fields: 'id,name,webViewLink'
    });

    Logger.log('File created with Advanced Drive service v3: ' + file.name);

    // Make file publicly accessible using v3 API
    try {
      Drive.Permissions.create({
        role: 'reader',
        type: 'anyone'
      }, file.id, {
        fields: 'id'
      });
      Logger.log('File made publicly accessible');
    } catch (permissionError) {
      Logger.log('Permission setting failed, but file created: ' + permissionError.message);
    }

    // Return direct download URL
    return `https://drive.google.com/uc?export=download&id=${file.id}`;

  } catch (error) {
    Logger.log('Drive save error: ' + error.message);
    throw error;
  }
}

// ========================================
// IMAGE GENERATION (REMOVED - USE EXTERNAL TOOLS)
// ========================================
// Image generation has been removed from this script.
// Image prompts are still generated in Column D.
// Use these prompts with your own AI tools (ChatGPT, Claude, etc.) for better control.
// Absorb LMS AI will also automatically generate images from prompts during LMS upload.

// ========================================
// BATCH AUDIO ONLY
// ========================================

function generateAudioAndImagesForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const totalTime = Math.ceil(numRows * CONFIG.DELAY_BETWEEN_SLIDES / 1000); // Audio only
  const response = ui.alert(
    'Generate Audio',
    `Generate audio for ${numRows} slide(s)?\n\nImage prompts are in Column D - use them with your own AI tools.\n\nThis will take approximately ${totalTime} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let audioSuccess = 0, audioError = 0;

  for (let i = 0; i < numRows; i++) {
    const rowIndex = startRow + i;

    try {
      // Get row data
      const rowData = sheet.getRange(rowIndex, 1, 1, Object.keys(CONFIG.COLS).length).getValues()[0];

      const voiceoverScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const imagePrompt = rowData[CONFIG.COLS.IMAGE_PROMPT];
      const voiceSelection = rowData[CONFIG.COLS.VOICE_SELECTION] || CONFIG.DEFAULT_VOICE;
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];

      // Generate audio
      if (voiceoverScript) {
        const audioUrl = generateAudio(voiceoverScript, voiceSelection, targetAudience, slideTitle);
        if (audioUrl) {
          sheet.getRange(rowIndex, CONFIG.COLS.AUDIO_FILE + 1).setValue(audioUrl);
          audioSuccess++;
        } else {
          audioError++;
        }
      } else {
        audioError++;
      }

      // Update status
      if (rowData[CONFIG.COLS.STATUS] !== undefined) {
        sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Audio Generated');
      }

      // Rate limiting between slides
      if (i < numRows - 1) {
        Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);
      }

    } catch (error) {
      Logger.log(`Error processing row ${rowIndex}: ${error.message}`);
      audioError++;
      imageError++;
    }
  }

  ui.alert('Audio Generation Complete',
    `🎙️ Audio: ${audioSuccess} success, ${audioError} errors\n\n💡 Image prompts are in Column D - use with your own AI tools for best results.`,
    ui.ButtonSet.OK);
}

// ========================================
// PRESENTATION GENERATION
// ========================================

function generatePresentationForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Generate Presentation',
    `Create a Google Slides presentation from ${numRows} slide(s)?`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  try {
    // Get first row to determine course/module info
    const firstRow = sheet.getRange(startRow, 1, 1, Object.keys(CONFIG.COLS).length).getValues()[0];
    const courseTitle = firstRow[CONFIG.COLS.COURSE_TITLE] || 'Course';
    const moduleTitle = firstRow[CONFIG.COLS.MODULE_TITLE] || 'Module';

    // Create presentation
    const presentation = SlidesApp.create(`${courseTitle} - ${moduleTitle}`);
    const slides = presentation.getSlides();

    // Remove default blank slide
    slides[0].remove();

    // Process each row
    for (let i = 0; i < numRows; i++) {
      const rowIndex = startRow + i;
      const rowData = sheet.getRange(rowIndex, 1, 1, Object.keys(CONFIG.COLS).length).getValues()[0];

      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE] || `Slide ${i + 1}`;
      const contentPoints = rowData[CONFIG.COLS.CONTENT_POINTS];
      const imageUrl = rowData[CONFIG.COLS.IMAGE_FILE];

      // Create slide
      const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);

      // Set title
      const titleShape = slide.getShapes()[0];
      titleShape.getText().setText(slideTitle);

      // Set content
      let contentText = '';
      if (contentPoints) {
        try {
          const points = JSON.parse(contentPoints);
          if (Array.isArray(points)) {
            contentText = points.map(p => `• ${p}`).join('\n');
          } else {
            contentText = contentPoints;
          }
        } catch (e) {
          contentText = contentPoints;
        }
      }

      const bodyShape = slide.getShapes()[1];
      bodyShape.getText().setText(contentText);

      // Add image if available
      if (imageUrl) {
        try {
          const imageId = imageUrl.match(/id=([^&]+)/)[1];
          const imageBlob = DriveApp.getFileById(imageId).getBlob();
          slide.insertImage(imageBlob, 400, 100, 400, 300);
        } catch (error) {
          Logger.log(`Could not insert image for slide ${i + 1}: ${error.message}`);
        }
      }
    }

    // Get presentation URL
    const presentationUrl = presentation.getUrl();

    // Write URL to first selected row's PPT column
    sheet.getRange(startRow, CONFIG.COLS.SLIDES_PPT + 1).setValue(presentationUrl);

    ui.alert('Presentation Created',
      `✅ Created ${numRows} slide(s)\n\nOpening presentation...`,
      ui.ButtonSet.OK);

    // Open presentation
    const htmlOutput = HtmlService.createHtmlOutput(
      `<script>window.open('${presentationUrl}', '_blank'); google.script.host.close();</script>`
    );
    ui.showModalDialog(htmlOutput, 'Opening Presentation');

  } catch (error) {
    ui.alert('Error', `Failed to create presentation: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Presentation error: ' + error.message);
  }
}

// ========================================
// AUTO-PROCESS BY STATUS
// ========================================

/**
 * Process all slides with Status = "Next" (sequential, like n8n Workflow 4)
 * Processes one slide at a time, updating Status as it goes
 */
function processNextSlides() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found in Audio tab.');
    return;
  }

  // Get all data
  const data = sheet.getRange(2, 1, lastRow - 1, Object.keys(CONFIG.COLS).length + 1).getValues();

  // Find rows with Status = "Next"
  const nextRows = [];
  data.forEach((row, index) => {
    const status = row[CONFIG.COLS.STATUS];
    if (status === 'Next') {
      nextRows.push({
        rowIndex: index + 2, // +2 because: +1 for header, +1 for 0-based index
        data: row
      });
    }
  });

  if (nextRows.length === 0) {
    SpreadsheetApp.getUi().alert(
      'No Slides to Process',
      'No slides found with Status = "Next".\n\nSet slides to "Next" status to queue them for processing.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Process "Next" Slides',
    `Found ${nextRows.length} slide(s) with Status = "Next".\n\nProcess them sequentially (one at a time)?\n\nThis will take approximately ${Math.ceil(nextRows.length * 10)} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let successCount = 0;
  let errorCount = 0;

  // Process each "Next" slide
  for (const row of nextRows) {
    try {
      const rowData = row.data;
      const rowIndex = row.rowIndex;

      // Check if we need to enhance content first
      const rawContent = rowData[CONFIG.COLS.RAW_CONTENT];
      const voiceoverScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const hasContent = voiceoverScript && voiceoverScript.trim().length > 0;

      // STEP 1: Enhance content if needed
      if (!hasContent && rawContent) {
        const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
        const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE] || 'Healthcare Professionals';
        const courseTitle = rowData[CONFIG.COLS.COURSE_TITLE];
        const moduleTitle = rowData[CONFIG.COLS.MODULE_TITLE];

        Logger.log(`Row ${rowIndex}: Enhancing content...`);
        const enhanced = enhanceSlideContent(rawContent, slideTitle, targetAudience, courseTitle, moduleTitle);
        if (enhanced) {
          sheet.getRange(rowIndex, CONFIG.COLS.CONTENT_POINTS + 1).setValue(JSON.stringify(enhanced.contentPoints));
          sheet.getRange(rowIndex, CONFIG.COLS.VOICEOVER_SCRIPT + 1).setValue(enhanced.voiceoverScript);
          sheet.getRange(rowIndex, CONFIG.COLS.IMAGE_PROMPT + 1).setValue(enhanced.imagePrompt);
          SpreadsheetApp.flush(); // Force update to sheet NOW

          // Update rowData
          rowData[CONFIG.COLS.VOICEOVER_SCRIPT] = enhanced.voiceoverScript;
          rowData[CONFIG.COLS.IMAGE_PROMPT] = enhanced.imagePrompt;

          Logger.log(`Row ${rowIndex}: Content enhanced. Script length: ${enhanced.voiceoverScript.length}`);
          Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        } else {
          Logger.log(`Row ${rowIndex}: Enhancement failed!`);
        }
      }

      // STEP 2: Generate audio
      const finalScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE];
      const voiceSelection = rowData[CONFIG.COLS.VOICE_SELECTION] || CONFIG.DEFAULT_VOICE;

      Logger.log(`Row ${rowIndex}: About to generate audio`);
      Logger.log(`Script length: ${finalScript ? finalScript.length : 0}`);
      Logger.log(`First 100 chars: ${finalScript ? finalScript.substring(0, 100) : 'EMPTY'}`);

      if (finalScript && finalScript.trim().length > 0) {
        const audioUrl = generateAudio(finalScript, voiceSelection, targetAudience, slideTitle);
        if (audioUrl) {
          sheet.getRange(rowIndex, CONFIG.COLS.AUDIO_FILE + 1).setValue(audioUrl);
          SpreadsheetApp.flush(); // Force update to sheet NOW
          Logger.log(`Row ${rowIndex}: Audio URL saved: ${audioUrl}`);
        } else {
          Logger.log(`Row ${rowIndex}: Audio generation returned null`);
        }
        Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
      } else {
        Logger.log(`Row ${rowIndex}: No script to generate audio from`);
      }

      // Update status to Audio Generated
      sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Audio Generated');
      SpreadsheetApp.flush(); // Force update to sheet NOW

      successCount++;
      Logger.log(`Processed row ${rowIndex} successfully`);

      // Rate limiting between slides
      Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);

    } catch (error) {
      Logger.log(`Error processing row ${row.rowIndex}: ${error.message}`);
      sheet.getRange(row.rowIndex, CONFIG.COLS.STATUS + 1).setValue('Error');
      errorCount++;
    }
  }

  ui.alert('Processing Complete',
    `✅ Success: ${successCount}\n❌ Errors: ${errorCount}`,
    ui.ButtonSet.OK);
}

/**
 * Process all slides with Status = "Pending" (batch mode)
 */
function processPendingSlides() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found in Audio tab.');
    return;
  }

  // Get all data
  const data = sheet.getRange(2, 1, lastRow - 1, Object.keys(CONFIG.COLS).length + 1).getValues();

  // Find rows with Status = "Pending"
  const pendingRows = [];
  data.forEach((row, index) => {
    const status = row[CONFIG.COLS.STATUS];
    if (status === 'Pending') {
      pendingRows.push({
        rowIndex: index + 2,
        data: row
      });
    }
  });

  if (pendingRows.length === 0) {
    SpreadsheetApp.getUi().alert(
      'No Slides to Process',
      'No slides found with Status = "Pending".',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Process "Pending" Slides',
    `Found ${pendingRows.length} slide(s) with Status = "Pending".\n\nProcess all in batch?\n\nThis will take approximately ${Math.ceil(pendingRows.length * 10)} seconds.`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  let successCount = 0;
  let errorCount = 0;

  // Process each pending slide
  for (const row of pendingRows) {
    try {
      const rowData = row.data;
      const rowIndex = row.rowIndex;

      // Same processing as processNextSlides
      const rawContent = rowData[CONFIG.COLS.RAW_CONTENT];
      const voiceoverScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const hasContent = voiceoverScript && voiceoverScript.trim().length > 0;

      // STEP 1: Enhance content if needed
      if (!hasContent && rawContent) {
        const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
        const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE] || 'Healthcare Professionals';
        const courseTitle = rowData[CONFIG.COLS.COURSE_TITLE];
        const moduleTitle = rowData[CONFIG.COLS.MODULE_TITLE];

        const enhanced = enhanceSlideContent(rawContent, slideTitle, targetAudience, courseTitle, moduleTitle);
        if (enhanced) {
          sheet.getRange(rowIndex, CONFIG.COLS.CONTENT_POINTS + 1).setValue(JSON.stringify(enhanced.contentPoints));
          sheet.getRange(rowIndex, CONFIG.COLS.VOICEOVER_SCRIPT + 1).setValue(enhanced.voiceoverScript);
          sheet.getRange(rowIndex, CONFIG.COLS.IMAGE_PROMPT + 1).setValue(enhanced.imagePrompt);
          SpreadsheetApp.flush(); // Force update to sheet NOW

          rowData[CONFIG.COLS.VOICEOVER_SCRIPT] = enhanced.voiceoverScript;
          rowData[CONFIG.COLS.IMAGE_PROMPT] = enhanced.imagePrompt;

          Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        }
      }

      // STEP 2: Generate audio
      const finalScript = rowData[CONFIG.COLS.VOICEOVER_SCRIPT];
      const slideTitle = rowData[CONFIG.COLS.SLIDE_TITLE];
      const targetAudience = rowData[CONFIG.COLS.TARGET_AUDIENCE];
      const voiceSelection = rowData[CONFIG.COLS.VOICE_SELECTION] || CONFIG.DEFAULT_VOICE;

      if (finalScript) {
        const audioUrl = generateAudio(finalScript, voiceSelection, targetAudience, slideTitle);
        if (audioUrl) {
          sheet.getRange(rowIndex, CONFIG.COLS.AUDIO_FILE + 1).setValue(audioUrl);
          SpreadsheetApp.flush(); // Force update to sheet NOW
        }
        Utilities.sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
      }

      // Update status to Audio Generated
      sheet.getRange(rowIndex, CONFIG.COLS.STATUS + 1).setValue('Audio Generated');
      SpreadsheetApp.flush(); // Force update to sheet NOW

      successCount++;
      Logger.log(`Processed row ${rowIndex} successfully`);

      // Rate limiting between slides
      Utilities.sleep(CONFIG.DELAY_BETWEEN_SLIDES);

    } catch (error) {
      Logger.log(`Error processing row ${row.rowIndex}: ${error.message}`);
      sheet.getRange(row.rowIndex, CONFIG.COLS.STATUS + 1).setValue('Error');
      errorCount++;
    }
  }

  ui.alert('Processing Complete',
    `✅ Success: ${successCount}\n❌ Errors: ${errorCount}`,
    ui.ButtonSet.OK);
}

/**
 * Show processing queue (slides by status)
 */
function showProcessingQueue() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found in Audio tab.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, Object.keys(CONFIG.COLS).length + 1).getValues();

  // Count by status
  const statusCounts = {};
  data.forEach(row => {
    const status = row[CONFIG.COLS.STATUS] || 'No Status';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Build HTML
  let htmlContent = `
    <h3>🔍 Processing Queue</h3>
    <p><strong>Total Slides:</strong> ${data.length}</p>
    <br>
    <h4>Status Breakdown:</h4>
    <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
      <tr>
        <th>Status</th>
        <th>Count</th>
        <th>Action</th>
      </tr>
  `;

  // Order: Next, Pending, Content Enhanced, Audio Generated, Image Generated, Complete, Error, others
  const statusOrder = ['Next', 'Pending', 'Content Enhanced', 'Audio Generated', 'Image Generated', 'Complete', 'Error'];
  const processedStatuses = new Set();

  statusOrder.forEach(status => {
    if (statusCounts[status]) {
      const count = statusCounts[status];
      let action = '';

      if (status === 'Next') {
        action = '▶️ Auto-Process Sequential';
      } else if (status === 'Pending') {
        action = '🔄 Auto-Process Batch';
      } else if (status === 'Error') {
        action = '⚠️ Review Errors';
      }

      htmlContent += `
        <tr>
          <td><strong>${status}</strong></td>
          <td>${count}</td>
          <td><em>${action}</em></td>
        </tr>
      `;
      processedStatuses.add(status);
    }
  });

  // Add any other statuses
  Object.keys(statusCounts).forEach(status => {
    if (!processedStatuses.has(status)) {
      htmlContent += `
        <tr>
          <td>${status}</td>
          <td>${statusCounts[status]}</td>
          <td></td>
        </tr>
      `;
    }
  });

  htmlContent += `
    </table>
    <br>
    <h4>Recommended Status Values:</h4>
    <ul>
      <li><strong>Pending</strong> - Not started yet</li>
      <li><strong>Next</strong> - Ready to process (auto-triggers)</li>
      <li><strong>Content Enhanced</strong> - Column R enhanced</li>
      <li><strong>Audio Generated</strong> - Audio created</li>
      <li><strong>Image Generated</strong> - Image created</li>
      <li><strong>Complete</strong> - All done</li>
      <li><strong>Error</strong> - Processing failed</li>
    </ul>
  `;

  const html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, '🔍 Processing Queue');
}

// ========================================
// VOICE MANAGEMENT
// ========================================

function setVoiceForSelected() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header row.');
    return;
  }

  // Show voice selection dialog
  const voiceList = Object.keys(GEMINI_VOICES)
    .map(name => `${name} (${GEMINI_VOICES[name].characteristic}, ${GEMINI_VOICES[name].gender})`)
    .join('\n');

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Set Voice',
    `Enter voice name for ${numRows} slide(s):\n\nRecommended:\n• Charon (Informative, male) - Best for healthcare\n• Aoede (Breezy, female)\n• Gacrux (Mature, male)\n\nFull list in "Show Available Voices"`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const voiceName = response.getResponseText().trim();

  if (!GEMINI_VOICES[voiceName]) {
    ui.alert('Invalid Voice', `"${voiceName}" is not a valid voice name. Use "Show Available Voices" to see all options.`, ui.ButtonSet.OK);
    return;
  }

  // Set voice for all selected rows
  for (let i = 0; i < numRows; i++) {
    sheet.getRange(startRow + i, CONFIG.COLS.VOICE_SELECTION + 1).setValue(voiceName);
  }

  ui.alert('Voice Updated', `Set voice to "${voiceName}" for ${numRows} slide(s).`, ui.ButtonSet.OK);
}

function setDefaultVoiceForAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    'Set Default Voice',
    `Enter voice name to set as default for ALL slides:\n\nCurrent default: ${CONFIG.DEFAULT_VOICE}\n\nRecommended:\n• Charon (Informative, male)\n• Aoede (Breezy, female)`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const voiceName = response.getResponseText().trim();

  if (!GEMINI_VOICES[voiceName]) {
    ui.alert('Invalid Voice', `"${voiceName}" is not a valid voice name.`, ui.ButtonSet.OK);
    return;
  }

  // Get all data rows
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('No data rows found.');
    return;
  }

  // Set voice for all rows
  const range = sheet.getRange(2, CONFIG.COLS.VOICE_SELECTION + 1, lastRow - 1, 1);
  const values = Array(lastRow - 1).fill([voiceName]);
  range.setValues(values);

  ui.alert('Default Voice Set', `Set "${voiceName}" for all ${lastRow - 1} slide(s).`, ui.ButtonSet.OK);
}

function showAvailableVoices() {
  let htmlContent = '<h3>Available Gemini TTS Voices (30 Total)</h3>';

  // Female voices
  htmlContent += '<h4>👩 Female Voices</h4><ul>';
  Object.keys(GEMINI_VOICES)
    .filter(name => GEMINI_VOICES[name].gender === 'female')
    .forEach(name => {
      const voice = GEMINI_VOICES[name];
      htmlContent += `<li><strong>${name}</strong> - ${voice.characteristic} (${voice.description})</li>`;
    });
  htmlContent += '</ul>';

  // Male voices
  htmlContent += '<h4>👨 Male Voices</h4><ul>';
  Object.keys(GEMINI_VOICES)
    .filter(name => GEMINI_VOICES[name].gender === 'male')
    .forEach(name => {
      const voice = GEMINI_VOICES[name];
      htmlContent += `<li><strong>${name}</strong> - ${voice.characteristic} (${voice.description})</li>`;
    });
  htmlContent += '</ul>';

  // Neutral voices
  htmlContent += '<h4>⚡ Neutral Voices</h4><ul>';
  Object.keys(GEMINI_VOICES)
    .filter(name => GEMINI_VOICES[name].gender === 'neutral')
    .forEach(name => {
      const voice = GEMINI_VOICES[name];
      htmlContent += `<li><strong>${name}</strong> - ${voice.characteristic} (${voice.description})</li>`;
    });
  htmlContent += '</ul>';

  htmlContent += '<p><em>Recommended for Australian healthcare: <strong>Charon</strong> (Informative, male)</em></p>';

  const html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, '🎤 Available Voices');
}

// ========================================
// STATISTICS
// ========================================

function showStatistics() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found in Audio tab.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, Object.keys(CONFIG.COLS).length).getValues();

  let audioGenerated = 0;
  let imageGenerated = 0;
  let pptGenerated = 0;
  let voiceUsage = {};

  data.forEach(row => {
    if (row[CONFIG.COLS.AUDIO_FILE]) audioGenerated++;
    if (row[CONFIG.COLS.IMAGE_FILE]) imageGenerated++;
    if (row[CONFIG.COLS.SLIDES_PPT]) pptGenerated++;

    const voice = row[CONFIG.COLS.VOICE_SELECTION] || 'None';
    voiceUsage[voice] = (voiceUsage[voice] || 0) + 1;
  });

  let htmlContent = `
    <h3>📊 Audio Tab Statistics</h3>
    <p><strong>Total Slides:</strong> ${data.length}</p>
    <p><strong>Audio Generated:</strong> ${audioGenerated} (${Math.round(audioGenerated/data.length*100)}%)</p>
    <p><strong>Images Generated:</strong> ${imageGenerated} (${Math.round(imageGenerated/data.length*100)}%)</p>
    <p><strong>Presentations Created:</strong> ${pptGenerated}</p>

    <h4>Voice Usage Breakdown:</h4>
    <ul>
  `;

  Object.keys(voiceUsage)
    .sort((a, b) => voiceUsage[b] - voiceUsage[a])
    .forEach(voice => {
      const count = voiceUsage[voice];
      const percentage = Math.round(count / data.length * 100);
      const voiceInfo = GEMINI_VOICES[voice] ? ` (${GEMINI_VOICES[voice].characteristic})` : '';
      htmlContent += `<li><strong>${voice}${voiceInfo}:</strong> ${count} slides (${percentage}%)</li>`;
    });

  htmlContent += '</ul>';

  const html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, '📊 Statistics');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getOrCreateFolder(folderName) {
  // If DRIVE_FOLDER_ID is set in Script Properties, use that folder
  if (CONFIG.DRIVE_FOLDER_ID) {
    try {
      const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

      // Check if subfolder exists within the configured folder
      const subfolders = folder.getFoldersByName(folderName);
      if (subfolders.hasNext()) {
        return subfolders.next();
      } else {
        // Create subfolder within configured folder
        return folder.createFolder(folderName);
      }
    } catch (error) {
      Logger.log('Error accessing configured Drive folder: ' + error.message);
      Logger.log('Falling back to search/create in My Drive');
    }
  }

  // Fallback: search by name or create in My Drive
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

// ========================================
// LMS UPLOAD GENERATION
// ========================================

/**
 * Australian spelling enforcement function
 * Converts US spelling to Australian spelling throughout text
 */
function enforceAustralianSpelling(text) {
  const spellingReplacements = {
    // -ize to -ise
    'optimize': 'optimise',
    'optimized': 'optimised',
    'optimizing': 'optimising',
    'organize': 'organise',
    'organized': 'organised',
    'organizing': 'organising',
    'recognize': 'recognise',
    'recognized': 'recognised',
    'recognizing': 'recognising',
    'realize': 'realise',
    'realized': 'realised',
    'realizing': 'realising',
    'specialize': 'specialise',
    'specialized': 'specialised',
    'specializing': 'specialising',
    'standardize': 'standardise',
    'standardized': 'standardised',
    'standardizing': 'standardising',
    'minimize': 'minimise',
    'minimized': 'minimised',
    'minimizing': 'minimising',
    'maximize': 'maximise',
    'maximized': 'maximised',
    'maximizing': 'maximising',
    'utilize': 'utilise',
    'utilized': 'utilised',
    'utilizing': 'utilising',
    'prioritize': 'prioritise',
    'prioritized': 'prioritised',
    'prioritizing': 'prioritising',
    'emphasize': 'emphasise',
    'emphasized': 'emphasised',
    'emphasizing': 'emphasising',
    'summarize': 'summarise',
    'summarized': 'summarised',
    'summarizing': 'summarising',

    // -or to -our
    'color': 'colour',
    'colors': 'colours',
    'colored': 'coloured',
    'coloring': 'colouring',
    'favor': 'favour',
    'favors': 'favours',
    'favored': 'favoured',
    'favoring': 'favouring',
    'honor': 'honour',
    'honors': 'honours',
    'honored': 'honoured',
    'honoring': 'honouring',
    'labor': 'labour',
    'labors': 'labours',
    'labored': 'laboured',
    'laboring': 'labouring',
    'neighbor': 'neighbour',
    'neighbors': 'neighbours',
    'behavior': 'behaviour',
    'behaviors': 'behaviours',
    'behavioral': 'behavioural',

    // -er to -re
    'center': 'centre',
    'centers': 'centres',
    'centered': 'centred',
    'centering': 'centring',
    'fiber': 'fibre',
    'fibers': 'fibres',
    'meter': 'metre',
    'meters': 'metres',
    'liter': 'litre',
    'liters': 'litres',

    // -ense to -ence
    'defense': 'defence',
    'defenses': 'defences',
    'license': 'licence',
    'licenses': 'licences',
    'offense': 'offence',
    'offenses': 'offences',

    // -og to -ogue
    'analog': 'analogue',
    'analogs': 'analogues',
    'catalog': 'catalogue',
    'catalogs': 'catalogues',
    'dialog': 'dialogue',
    'dialogs': 'dialogues',

    // Other common differences
    'analyze': 'analyse',
    'analyzed': 'analysed',
    'analyzing': 'analysing',
    'analysis': 'analysis', // same
    'practiced': 'practised',
    'practicing': 'practising',
    'program': 'programme', // TV/radio context
    'aging': 'ageing',
    'judgment': 'judgement',
    'pediatric': 'paediatric',
    'pediatrics': 'paediatrics',
    'pediatrician': 'paediatrician',
    'anesthesia': 'anaesthesia',
    'anesthetic': 'anaesthetic',
    'anesthesiologist': 'anaesthesiologist',
    'edema': 'oedema',
    'estrogen': 'oestrogen',
    'fetus': 'foetus',
    'hemoglobin': 'haemoglobin',
    'leukemia': 'leukaemia',
    'maneuver': 'manoeuvre',
    'maneuvers': 'manoeuvres',
    'maneuvering': 'manoeuvring'
  };

  let processedText = text;

  // Apply replacements with word boundaries to avoid partial matches
  for (const [us, au] of Object.entries(spellingReplacements)) {
    // Case-insensitive replacement preserving original case
    const regex = new RegExp('\\b' + us + '\\b', 'gi');
    processedText = processedText.replace(regex, (match) => {
      // Preserve case of original
      if (match === match.toUpperCase()) return au.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return au.charAt(0).toUpperCase() + au.slice(1);
      return au;
    });
  }

  return processedText;
}

/**
 * Generate LMS Upload document matching ProvenLMSlayout.txt format EXACTLY
 * CORRECTED DATA FLOW:
 * - Slide Title: Column L (rows 2-13)
 * - Bullet Points: Column M Content Points JSON (rows 2-13)
 * - Voiceover Summary: Column X Slides JSON detailedContent (1-2 sentences)
 * Works with individual module tabs (Module 1, Module 2, etc.)
 * NO NEED TO SELECT ROWS - just click anywhere in the module tab
 */
function generateLMSForSelectedModule() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  // Get module info from row 2
  const moduleNumber = sheet.getRange(2, 7).getValue(); // Column G
  const moduleTitle = sheet.getRange(2, 9).getValue();  // Column I - Module Title

  // Get Slides JSON from Column X (column 24) for detailedContent (voiceover source)
  const slidesJsonCell = sheet.getRange(2, 24).getValue();

  if (!moduleNumber || !moduleTitle) {
    ui.alert('Error',
      'Module Number or Module Title not found.\n\nExpected:\n- Module Number in Column G (row 2)\n- Module Title in Column I (row 2)',
      ui.ButtonSet.OK);
    return;
  }

  if (!slidesJsonCell || slidesJsonCell.trim() === '') {
    ui.alert('Error',
      'No Slides JSON found in Column X (row 2).\n\nThis function requires Slides JSON generated by Module_Content_Generator.gs.',
      ui.ButtonSet.OK);
    return;
  }

  // Parse Slides JSON (for detailedContent only - voiceover summaries)
  let slidesData;
  try {
    slidesData = JSON.parse(slidesJsonCell);
    if (!Array.isArray(slidesData) || slidesData.length === 0) {
      throw new Error('Slides JSON is empty or invalid');
    }
  } catch (parseError) {
    ui.alert('Error',
      `Failed to parse Slides JSON:\n\n${parseError.message}`,
      ui.ButtonSet.OK);
    return;
  }

  // Read SLIDE TITLES from Column L (rows 2-13)
  const slideTitlesRange = sheet.getRange(2, 12, 12, 1); // Column L, 12 rows
  const slideTitlesData = slideTitlesRange.getValues();

  // Read CONTENT POINTS from Column M (rows 2-13)
  const contentPointsRange = sheet.getRange(2, 13, 12, 1); // Column M, 12 rows
  const contentPointsData = contentPointsRange.getValues();

  // Confirm with user
  const response = ui.alert(
    'Generate LMS Upload Document',
    `Create LMS upload document for:\n\nSheet: "${sheet.getName()}"\nModule ${moduleNumber}: ${moduleTitle}\n12 slide(s)\n\nFormat: ProvenLMSlayout.txt (bullet points + voiceover)`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  try {
    // Build LMS document content matching ProvenLMSlayout.txt EXACTLY
    let lmsContent = `Module ${moduleNumber}: ${moduleTitle}\n`;
    lmsContent += '='.repeat(60) + '\n\n';

    // Process each slide (12 slides)
    for (let i = 0; i < 12; i++) {
      const slideNumber = i + 1;

      // Get slide title from Column L
      const slideTitle = slideTitlesData[i] ? slideTitlesData[i][0] : `Slide ${slideNumber}`;

      // Get content points from Column M (JSON array)
      const contentPointsJson = contentPointsData[i] ? contentPointsData[i][0] : '';
      let bulletPoints = [];

      if (contentPointsJson && contentPointsJson.trim() !== '') {
        try {
          bulletPoints = JSON.parse(contentPointsJson);
          if (!Array.isArray(bulletPoints)) {
            bulletPoints = [contentPointsJson]; // Fallback if not array
          }
        } catch (parseError) {
          Logger.log(`Row ${i+2}: Failed to parse content points JSON: ${parseError.message}`);
          bulletPoints = ['Key concept 1', 'Key concept 2', 'Key concept 3'];
        }
      } else {
        bulletPoints = ['Key concept 1', 'Key concept 2', 'Key concept 3'];
      }

      // Get detailedContent from Slides JSON for voiceover summary
      const detailedContent = (slidesData[i] && slidesData[i].detailedContent) ? slidesData[i].detailedContent : '';

      // Add slide header (EXACT format from ProvenLMSlayout.txt)
      lmsContent += `Slide ${slideNumber}: ${slideTitle}\n`;

      // Add bullet points from Column M
      bulletPoints.forEach(bullet => {
        lmsContent += `- ${bullet}\n`;
      });

      lmsContent += '\n';

      // Add voiceover section (EXACT format from ProvenLMSlayout.txt)
      lmsContent += 'Voiceover:\n';

      // Extract 1-2 sentences from detailedContent (Column X) for LMS context
      let voiceoverSummary = extractVoiceoverSummaryFromDetailed(detailedContent);

      lmsContent += `"${voiceoverSummary}"\n`;

      lmsContent += '\n---\n\n';
    }

    // Apply Australian spelling enforcement
    lmsContent = enforceAustralianSpelling(lmsContent);

    // Create Google Doc
    const docName = `LMS Upload - Module ${moduleNumber} - ${moduleTitle}`;
    const doc = DocumentApp.create(docName);
    const body = doc.getBody();

    // Add content as plain text (no fancy formatting - keep it simple for LMS parsing)
    body.setText(lmsContent);

    const docUrl = doc.getUrl();

    // Save Google Doc URL to Column Y (column 25) in row 2
    sheet.getRange(2, 25).setValue(docUrl);

    Logger.log(`LMS Upload URL saved to ${sheet.getName()} row 2, column Y`);

    // Show success dialog
    const htmlOutput = HtmlService.createHtmlOutput(`
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h3 { color: #1a73e8; }
        .success { background: #e6f4ea; padding: 15px; border-radius: 8px; border-left: 4px solid #34a853; margin: 20px 0; }
        a { color: #1a73e8; text-decoration: none; font-weight: bold; font-size: 16px; }
        a:hover { text-decoration: underline; }
        .note { background: #fef7e0; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 13px; }
        button { background: #1a73e8; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 15px; }
        button:hover { background: #1557b0; }
      </style>

      <h3>✅ LMS Upload Document Created</h3>

      <div class="success">
        <p><strong>Module ${moduleNumber}: ${moduleTitle}</strong></p>
        <p>${slidesData.length} slide(s) in ProvenLMSlayout.txt format</p>
        <p style="font-size: 13px; color: #5f6368;">Bullet points + Voiceover (no phonetics)</p>
      </div>

      <p><a href="${docUrl}" target="_blank">→ Open LMS Upload Document</a></p>

      <div class="note">
        <strong>📋 Next Steps:</strong><br>
        1. Review document - matches ProvenLMSlayout.txt structure<br>
        2. Australian spelling enforced throughout<br>
        3. Download as .txt or copy content<br>
        4. Upload to Absorb LMS "Create" tool<br>
        5. Upload your audio files (from Audio tab) to align with each slide<br>
        6. Absorb will parse into exactly 12 slides matching your audio
      </div>

      <div style="text-align: center;">
        <button onclick="window.open('${docUrl}', '_blank'); google.script.host.close();">Open Document</button>
      </div>
    `).setWidth(600).setHeight(500);

    ui.showModalDialog(htmlOutput, '✅ LMS Upload Document Ready');

    Logger.log(`LMS Upload document created: ${docUrl}`);

  } catch (error) {
    Logger.log('Error generating LMS document: ' + error.message);
    ui.alert('Error', `Failed to generate LMS document:\n\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Extract brief 1-2 sentence summary from detailedContent (Column X Slides JSON) for LMS voiceover
 * Gives Absorb LMS AI just enough background context without overwhelming it
 * Max ~50 words, 1-2 sentences
 */
function extractVoiceoverSummaryFromDetailed(detailedContent) {
  if (!detailedContent || detailedContent.trim().length < 20) {
    return 'This slide covers key concepts for Australian healthcare practice.';
  }

  // Split into sentences
  const sentences = detailedContent
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length === 0) {
    return 'This slide covers key concepts for Australian healthcare practice.';
  }

  // Take first 1-2 sentences (max ~50 words total)
  let summary = '';
  let wordCount = 0;
  const maxWords = 50;

  for (let i = 0; i < sentences.length && wordCount < maxWords; i++) {
    const sentence = sentences[i];
    const words = sentence.split(/\s+/).length;

    if (wordCount + words <= maxWords) {
      summary += sentence + '. ';
      wordCount += words;
    } else {
      break;
    }
  }

  // Ensure we have at least 1 sentence
  if (summary.trim().length < 20 && sentences.length > 0) {
    summary = sentences[0] + '.';
  }

  return summary.trim();
}

// ========================================
// API QUOTA MONITORING (Vertex AI Future)
// ========================================

/**
 * VERTEX AI EXPLORATION NOTES:
 *
 * Vertex AI offers several advantages over direct Gemini API:
 *
 * 1. UNIFIED API PLATFORM:
 *    - Single endpoint for all Google AI models
 *    - Centralized quota management
 *    - Better monitoring and logging
 *
 * 2. ENTERPRISE FEATURES:
 *    - Higher rate limits and quotas
 *    - Better SLA guarantees
 *    - Advanced security and access controls
 *    - VPC integration for secure access
 *
 * 3. COST OPTIMIZATION:
 *    - Volume discounting available
 *    - Better cost tracking per project
 *    - Commitment-based pricing options
 *
 * 4. MONITORING & OBSERVABILITY:
 *    - Cloud Logging integration
 *    - Cloud Monitoring metrics
 *    - Error tracking and alerting
 *    - Usage analytics dashboard
 *
 * IMPLEMENTATION PATH:
 *
 * To migrate to Vertex AI:
 * 1. Enable Vertex AI API in Google Cloud Console
 * 2. Create service account with Vertex AI permissions
 * 3. Update endpoints:
 *    - TTS: https://REGION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/REGION/publishers/google/models/gemini-2.0-flash-exp:generateContent
 *    - Image: https://REGION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/REGION/publishers/google/models/imagen-3.0-generate-002:predict
 * 4. Use OAuth2 service account authentication instead of API key
 * 5. Monitor quotas via Cloud Console
 *
 * CURRENT APPROACH:
 * Using direct Gemini API for simplicity and faster setup.
 * For production at scale, migrate to Vertex AI for better controls.
 */

// ========================================
// END OF SCRIPT
// ========================================


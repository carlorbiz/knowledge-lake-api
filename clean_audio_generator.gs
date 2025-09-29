/**
 * Complete Apps Script Audio Generator with Proven Australian Voice Specifications
 * Integrates with n8n via webhook for reliable audio generation
 */

// Configuration - using script properties for security
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const DRIVE_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');

/**
 * Main function to generate audio from ready script using Gemini TTS
 */
function generateAudioFromScript(voiceScript, voiceType = 'Charon', slideName = 'slide') {
  try {
    // Generate audio using Gemini 2.5 Flash TTS
    const audioBlob = generateGeminiTTS(voiceScript, voiceType);

    // Save to Google Drive
    const fileUrl = saveAudioToDrive(audioBlob, slideName);

    return {
      success: true,
      audioUrl: fileUrl,
      voiceType: voiceType
    };

  } catch (error) {
    console.error('Audio generation error:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Convert L16 audio data to WAV format (proven from your early script)
 */
function convertL16ToWav(inputData, mimeType = "audio/L16;codec=pcm;rate=24000", numChannels = 1) {
  const [type, codec, sampleRate] = mimeType.split(";").map(e => e.includes("=") ? e.trim().split("=")[1] : e.trim());
  if (type !== "audio/L16" || codec !== "pcm") throw new Error('Unsupported audio format.');
  const bitsPerSample = 16, blockAlign = numChannels * bitsPerSample / 8,
    byteRate = Number(sampleRate) * blockAlign, dataSize = inputData.length, fileSize = 36 + dataSize;
  const header = new ArrayBuffer(44), view = new DataView(header);
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
 * Generate audio using Gemini 2.5 Flash TTS with proven Australian voice specifications
 */
function generateGeminiTTS(scriptText, voiceType) {
  // Proven Australian voice generation prompt with comprehensive specifications
  const australianVoicePrompt = `You are a highly educated Australian adult with a warm, personable delivery. Speak with the refined Australian accent of educated professionals - a subtle blend of American, western European and British influences with softer jaw movement than American English, but more open than formal British. Maintain professional warmth without any exaggerated regional characteristics.

DELIVERY SPECIFICATIONS:
- Speed: 160-180 words per minute (measured pace)
- Tone: Professional, warm, authoritative yet approachable
- Inflection: Conversational as if the listener is a valued colleague
- Pauses: Strategic pauses for emphasis and comprehension
- Breathing: Natural breath patterns without artificial breaks

CRITICAL EXCLUSIONS:
- NO broad Australian accent or "Ocker" characteristics
- NO rising intonation on statements (no uptalk)
- NO slang, colloquialisms, or stereotypical Australian phrases
- NO exaggerated vowel sounds or dramatic inflections
- NO theatrical or overly animated delivery

VOICE SELECTION (based on content type):
Professional: Confident, knowledgeable, slightly formal but warm
Executive: Authoritative, strategic, measured, commanding respect
Clinical: Precise, caring, trustworthy, evidence-based tone
Default: Engaging, clear, educational, accessible

SPEECH RHYTHM MARKERS:
Use natural pauses at:
- End of sentences (1-2 second pause)
- After key points (0.5-1 second pause)
- Before important information (0.5 second pause)
- Between sections or topics (2-3 second pause)

PRONUNCIATION GUIDELINES FOR AUSTRALIAN HEALTHCARE:
- ACRRM = "Ackr'm" (not A-C-R-R-M)
- GPs = plural of GP (not "GPS" navigation)
- RACGP = "R-A-C-G-P" (spell out each letter)
- Schedule = "skedule" (American pronunciation)
- Research = "REE-search" (emphasis on first syllable)
- Data = "DAY-ta" (not "DAH-ta")
- Privacy = "PRY-va-see" (not "PRIV-a-see")
- Medicare = "MEDI-care" (equal emphasis)
- AHPRA = "AH-pra" (not A-H-P-R-A)
- NMBA = "N-M-B-A" (spell out)
- PBS = "P-B-S" (spell out, not "pubs")
- MBS = "M-B-S" (spell out)
- CPD = "C-P-D" (continuing professional development)
- ANMF = "A-N-M-F" (spell out)
- GPSA = "G-P-S-A" (spell out)
- RWAV = "R-WAVE"
- AICD = "A-I-C-D" (spell out)
- AMA = "A-M-A" (spell out)

Read this content with conversational inflection while maintaining professional authority:

${scriptText}`;

  const response = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      contents: [{
        parts: [{
          text: australianVoicePrompt
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceType
            }
          }
        }
      }
    })
  });

  const data = JSON.parse(response.getContentText());
  console.log('Gemini TTS response structure:', JSON.stringify(data, null, 2));

  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    for (let part of data.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('audio/')) {
        console.log('Found audio data with mime type:', part.inlineData.mimeType);
        const audioBase64 = part.inlineData.data;
        const audioBytes = Utilities.base64Decode(audioBase64);

        // Convert PCM to WAV if needed using proven conversion
        if (part.inlineData.mimeType.includes('audio/L16') || part.inlineData.mimeType.includes('pcm')) {
          console.log('Converting L16 PCM to WAV format using proven method');
          const wavBytes = convertL16ToWav(audioBytes, part.inlineData.mimeType);
          return Utilities.newBlob(wavBytes, 'audio/wav');
        }

        return Utilities.newBlob(audioBytes, part.inlineData.mimeType);
      }
    }
  }

  // Check if response has error or different structure
  if (data.error) {
    throw new Error('Gemini TTS API error: ' + JSON.stringify(data.error));
  }

  throw new Error('Failed to generate audio: No audio data found in response. Response: ' + JSON.stringify(data));
}

/**
 * Save audio blob to Google Drive using Advanced Drive service
 */
function saveAudioToDrive(audioBlob, fileName) {
  try {
    // Use provided folder ID or create new folder
    let folderId = DRIVE_FOLDER_ID;

    if (!folderId) {
      console.log('No folder ID provided, creating new folder');
      folderId = findOrCreateAudioFolder();
    } else {
      console.log('Using provided folder ID:', folderId);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Audio should now always be WAV format after conversion
    const fullFileName = `${fileName}_${timestamp}.wav`;

    // Use Advanced Drive service
    const fileMetadata = {
      name: fullFileName,
      parents: [folderId],
      mimeType: 'audio/wav'
    };

    // Create file using Advanced Drive service
    const file = Drive.Files.create(fileMetadata, audioBlob, {
      'fields': 'id,name,webViewLink'
    });

    console.log('File created with Advanced Drive service:', file.name);

    // Make file publicly accessible
    try {
      Drive.Permissions.create({
        'role': 'reader',
        'type': 'anyone'
      }, file.id);
      console.log('File made publicly accessible');
    } catch (permissionError) {
      console.log('Permission setting failed, but file created');
    }

    // Return direct download URL
    return `https://drive.google.com/uc?export=download&id=${file.id}`;

  } catch (error) {
    console.error('Drive save error:', error);
    console.error('Folder ID value:', folderId);
    throw new Error('Failed to save audio to Drive: ' + error.toString());
  }
}

/**
 * Webhook endpoint for n8n integration - expects ready voiceover script
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);

    const voiceScript = requestData.voiceScript || requestData.script || '';
    const voiceType = requestData.voiceType || 'Charon';
    const slideName = requestData.slideName || 'slide';

    if (!voiceScript) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No voice script provided'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const result = generateAudioFromScript(voiceScript, voiceType, slideName);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Webhook error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function for development - creates folder if needed
 */
function testAudioGeneration() {
  const testScript = `Evidence-based practice represents the cornerstone of modern healthcare delivery in Australia. This approach integrates the best available research evidence with clinical expertise and patient values to inform decision-making. Within the Australian healthcare framework, EBP ensures that practitioners meet AHPRA standards while delivering patient-centered care that aligns with contemporary evidence and professional guidelines.`;

  const result = generateAudioFromScript(testScript, 'Charon', 'test_slide');
  console.log('Test result:', result);
}

/**
 * Helper function to find or create the audio folder
 */
function findOrCreateAudioFolder() {
  try {
    // Try to find existing folder
    const folders = Drive.Files.list({
      q: "name='Course Audio Files' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    });

    if (folders.files && folders.files.length > 0) {
      const folderId = folders.files[0].id;
      console.log('Found existing folder:', folderId);
      return folderId;
    }

    // Create new folder
    const folderMetadata = {
      name: 'Course Audio Files',
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = Drive.Files.create(folderMetadata);
    console.log('Created new folder:', folder.id);
    return folder.id;

  } catch (error) {
    console.error('Folder creation error:', error);
    throw new Error('Failed to find or create audio folder');
  }
}
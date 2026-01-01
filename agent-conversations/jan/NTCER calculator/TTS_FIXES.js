// ===== FIX 1: GEMINI TTS API CONFIGURATION =====

// REPLACE the callGeminiTTS_ function (around line 1719) with this corrected version:

function callGeminiTTS_(text, voiceName, temperature){
  const model = "gemini-1.5-flash-latest";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CFG.GEMINI_API_KEY}`;
  
  // FIXED: Remove invalid responseMimeType and use correct TTS configuration
  const payload = {
    contents: [{ parts: [{ text: text }]}],
    generationConfig: {
      temperature: temperature,
      // responseMimeType: "text/plain",  // FIXED: Use valid MIME type or remove entirely
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 64
    },
    // Add proper TTS configuration if supported by your API version
    systemInstruction: {
      parts: [{ text: "Generate natural-sounding Australian English speech suitable for professional healthcare education. Use clear pronunciation, appropriate pacing for learning content, and professional tone." }]
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const resp = UrlFetchApp.fetch(apiUrl, options);
  
  if (resp.getResponseCode() !== 200) {
    const errorText = resp.getContentText();
    console.error('Gemini TTS API Error:', errorText);
    throw new Error('Gemini TTS error: ' + errorText);
  }
  
  const data = JSON.parse(resp.getContentText());
  
  // Handle text response for now - you may need to integrate with actual TTS service
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('No content generated from Gemini TTS');
  }
  
  // For now, return null to indicate TTS needs external service
  // You'll need to integrate with Google Cloud Text-to-Speech API separately
  console.log('Generated TTS script:', textContent);
  return null; // Indicates TTS integration needed
}

// ===== ALTERNATIVE: PROPER TTS INTEGRATION =====

// If you want actual audio generation, you need to use Google Cloud Text-to-Speech API:

function callGoogleCloudTTS_(text, voiceName = 'en-US-Standard-A', speakingRate = 1.0) {
  // This requires Google Cloud TTS API key and different endpoint
  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${CFG.GOOGLE_CLOUD_TTS_KEY}`;
  
  const payload = {
    input: { text: text },
    voice: {
      languageCode: 'en-AU', // Australian English
      name: voiceName,
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'LINEAR16',
      speakingRate: speakingRate,
      pitch: 0.0,
      volumeGainDb: 0.0
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const resp = UrlFetchApp.fetch(apiUrl, options);
  
  if (resp.getResponseCode() !== 200) {
    throw new Error('Google Cloud TTS error: ' + resp.getContentText());
  }
  
  const data = JSON.parse(resp.getContentText());
  const audioBytes = Utilities.base64Decode(data.audioContent);
  
  return Utilities.newBlob(audioBytes, 'audio/wav', 'voiceover.wav');
}

// ===== FIX 2: ENHANCED TTS SCRIPT GENERATION =====

// The TTS scripts are probably low quality now. Add this enhanced function:

function generateEnhancedTTSScript(moduleContent, slideNumber, totalSlides) {
  const prompt = `${CFG.BRAND_HEADER}

PROFESSIONAL TTS SCRIPT DEVELOPMENT

You are a professional script writer and medical education specialist creating sophisticated voice-over scripts for Australian healthcare education.

EXPERTISE:
- Medical education and clinical supervision
- Professional voice-over script development  
- Adult learning principles and engagement strategies
- Australian healthcare context and terminology
- Cultural safety and inclusive language

SCRIPT REQUIREMENTS:
- Professional, conversational tone suitable for healthcare professionals
- Australian English pronunciation and terminology
- Engaging narrative structure with clear learning progression
- Evidence-based content with integrated research insights
- Practical examples and real-world applications
- Cultural safety and inclusive language throughout
- Appropriate pacing for professional learning (150 WPM)
- Natural speech patterns with appropriate pauses

SLIDE CONTEXT:
- Slide ${slideNumber} of ${totalSlides}
- Part of comprehensive healthcare education module
- Target audience: Clinical supervisors and healthcare educators

MODULE CONTENT TO CONVERT:
${moduleContent}

ENHANCED SCRIPT OUTPUT FORMAT:

[OPENING - if slide 1, otherwise transition]
${slideNumber === 1 ? 
  '[30-second engaging introduction that connects to real-world healthcare challenges]' : 
  '[15-second smooth transition from previous slide with connection to current content]'
}

[MAIN CONTENT - 3-4 minutes]
[Comprehensive, evidence-based content with:]
- Clear explanations of key concepts using conversational language
- Integration of research evidence in accessible terms  
- Practical examples and applications relevant to Australian healthcare
- Cultural safety considerations woven naturally into content
- Interactive elements and reflection prompts
- Appropriate pauses for processing complex information

[CLOSING/TRANSITION - 30 seconds]
${slideNumber === totalSlides ? 
  '[Summary of key takeaways and concrete next steps for implementation]' : 
  '[Bridge to next slide with curiosity-building preview]'
}

[SPEAKER NOTES]
- Pronunciation guides for medical terminology
- Emphasis points and pacing recommendations (mark with *emphasis*)
- Natural pause points (mark with ... for short pause, ---- for longer pause)
- Cultural sensitivity reminders
- Engagement strategies and interaction prompts

The script should be sophisticated, evidence-based, and immediately applicable to clinical practice while maintaining professional engagement throughout. Write for natural speech delivery, not reading text.`;

  return callGeminiWithRetry(prompt, 4000);
}
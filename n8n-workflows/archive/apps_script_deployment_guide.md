# Apps Script Audio Generator Deployment Guide

## Quick Setup (5 minutes)

### 1. Create New Apps Script Project
1. Go to https://script.google.com
2. Click "New Project"
3. Replace default code with `complete_audio_generator.gs` content
4. Save as "Course Audio Generator"

### 2. Configure APIs
1. Click on "Services" (+ icon in left sidebar)
2. Add these APIs:
   - **Drive API** (v2)
   - **Generative Language API** (if available, otherwise use UrlFetchApp)

### 3. Set Configuration Variables
Replace these placeholders in the script:
```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';
```

### 4. Create Drive Folder
1. Go to Google Drive
2. Create folder named "Course Audio Files"
3. Right-click folder → Share → Anyone with link can view
4. Copy folder ID from URL (long string after `/folders/`)

### 5. Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone (for n8n webhook)
5. Click "Deploy"
6. Copy the Web App URL

## Integration with n8n

### HTTP Request Node Configuration
```json
{
  "method": "POST",
  "url": "YOUR_APPS_SCRIPT_WEB_APP_URL",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "slideContent": "{{ $json.slideContent }}",
    "voiceType": "{{ $json.voiceType || 'professional' }}",
    "slideName": "{{ $json.slideName || 'slide' }}"
  }
}
```

### Expected Response
```json
{
  "success": true,
  "audioUrl": "https://drive.google.com/file/d/...",
  "scriptGenerated": "Generated voice script...",
  "voiceType": "professional"
}
```

## Voice Types Available
- **professional**: Healthcare practitioners (default)
- **executive**: Healthcare leadership
- **clinical**: Clinical practitioners
- **default**: General educational content

## Features Included
✅ Proven Australian voice specifications with temperature 0.5
✅ Sophisticated script generation for each voice type
✅ Comprehensive pronunciation guidelines for Australian healthcare
✅ Strategic pauses and rhythm markers
✅ Professional delivery specifications (160-180 WPM)
✅ Automatic file naming with timestamps
✅ Google Drive integration with shareable URLs
✅ Error handling and logging
✅ Webhook endpoint for n8n integration

## Testing
Run the `testAudioGeneration()` function in Apps Script to verify setup.

## Troubleshooting
- Check API quotas in Google Cloud Console
- Verify Drive folder permissions
- Ensure Gemini API key has TTS access
- Check Apps Script execution logs for errors
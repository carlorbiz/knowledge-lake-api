# Voice-to-Drive Recording App

## Project Overview
A hands-free Progressive Web App (PWA) for recording voice notes while driving, with automatic upload to Google Drive.

## The Problem
- Existing tools (Google Recorder, Turboscribe) lack API access and proper integration
- Need safe, hands-free voice recording while driving
- Want automatic organization and storage in Google Drive
- Future goal: automated transcription and AI-powered action assessment

## Core Features

### Phase 1 (MVP - Current Focus)
- **Voice Activity Detection (VAD)**: Automatically starts/stops recording when you speak
- **Hands-free operation**: No touching phone while driving
- **Google Drive Integration**: Auto-upload to organized folders (Year/Month/Day structure)
- **Offline Support**: Records locally, syncs when connection available
- **Session Mode**: Start once, record multiple thoughts throughout your drive
- **Dedicated Device**: Designed to run on a spare phone/tablet mounted in car

### Phase 2 (Future)
- Transcription integration (Whisper API or Turboscribe)
- n8n workflow automation
- AI assessment of transcripts (Claude/Manus)
- Automated actions based on content

## Why PWA Instead of Native App?
- **Avoid app stores**: No submission process, update instantly
- **Dedicated device setup**: Perfect for a mounted phone that stays in Session Mode
- **Acceptable trade-offs**: 
  - No background wake word detection (would need native app)
  - Requires screen-on (device is plugged in, so battery not an issue)
  - Call interruptions fragment recordings (mitigated by using dedicated device)

## Technical Stack
- **Frontend**: React (or vanilla JavaScript - TBD)
- **Audio**: Web Audio API + MediaRecorder
- **VAD**: @ricky0123/vad-web
- **Offline Storage**: IndexedDB
- **Cloud Storage**: Google Drive API
- **PWA**: Service Workers for offline support

## User Flow
1. Mount dedicated device in car, plug into charger
2. Open PWA, tap "Start Session"
3. Drive and talk naturally - VAD auto-detects speech
4. Each thought/note saves as separate recording
5. Recordings upload to Drive: `2025/November/12/14-23-45.mp3`
6. Internet dropout? No problem - queues locally, syncs later
7. End session when you park

## Device Recommendations
- Old smartphone (iOS or Android)
- Cheap Android device ($50-100)
- Tablet for larger display
- Requirements: Microphone, browser, internet connection

## Setup Requirements
- Google Cloud Project with Drive API enabled
- OAuth 2.0 credentials
- Modern browser with MediaRecorder support
- Car mount + charger for dedicated device

## Project Status
🚧 **In Planning** - Creating initial documentation and architecture

## Next Steps
1. Set up development environment
2. Create basic PWA structure
3. Implement VAD recording
4. Add Google Drive integration
5. Test on dedicated device
6. Deploy and iterate

## Contact & Context
This project emerged from frustration with:
- Poor voice transcription in existing interfaces
- Lack of proper API/webhook support in consumer apps
- Need for reliable, hands-free recording while driving
- Desire for automated downstream processing

Built with safety in mind - designed for legal, hands-free operation while driving.

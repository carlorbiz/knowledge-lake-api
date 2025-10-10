# ROLE PLAY AUDIO GENERATION SPECIFICATION
## Future Implementation - OpenAI TTS Integration

---

## OVERVIEW

Generate audio files for role play dialogue using OpenAI TTS with character-specific voices for iSpring TalkMaster scenarios.

---

## VOICE MAPPING

- **Male characters:** OpenAI "verse"
- **Female characters:** OpenAI "fable"
- **Learner (GP):** No audio - interactive choice point

---

## DIALOGUE DATA STRUCTURE (Built into Anthropic output NOW)

Each dialogue in role play scenarios includes audio generation metadata:

```json
{
  "dialogueId": "M1_RP1_D1",
  "character": "Sarah Chen",
  "characterGender": "female",
  "voiceModel": "fable",
  "text": "I'm not comfortable with AI recording our conversation.",
  "duration": 5,
  "audioFile": ""
}
```

**Field Definitions:**
- `dialogueId`: Format `M{module}_RP{scenario}_D{dialogue}` for unique identification
- `character`: Character name from scenario
- `characterGender`: "male" / "female" / "neutral"
- `voiceModel`: "verse" (male) / "fable" (female) / null (learner)
- `text`: Dialogue text to be spoken
- `duration`: Estimated seconds for audio clip
- `audioFile`: Empty string - populated by future audio generation workflow

---

## FUTURE WORKFLOW ADDITION (Phase 2)

```
Text Outputs Tab (Role Play JSON populated)
    ↓
Information Extractor: Extract all dialogues with voiceModel !== null
    ↓
Loop: Process each dialogue item
    ↓
AI Chain: OpenAI TTS
    Model: "tts-1-hd" (higher quality)
    Voice: {{ dialogue.voiceModel }}
    Input: {{ dialogue.text }}
    Speed: 1.0
    Format: mp3
    ↓
Upload to Google Drive: /Role_Play_Audio/M{module}/
    ↓
Update dialogue.audioFile: Drive URL
    ↓
Update Text Outputs Tab: Complete role play JSON with audio URLs
    ↓
Ready for iSpring TalkMaster import
```

---

## ESTIMATED VOLUME

**Per Module:**
- 3 role play scenarios
- ~15 dialogue clips per scenario
- 45 short audio clips per module

**Full Course (12 modules):**
- 36 scenarios total
- ~540 dialogue audio clips
- Average 15 seconds each = 135 minutes total audio
- OpenAI TTS cost estimate: ~$2.70 per full course

---

## IMPLEMENTATION PRIORITY

**Phase 2** - After core slide/voiceover audio generation working

**Prerequisites:**
1. Core workflow operational (slides + voiceover working)
2. Audio tab population tested
3. Apps Script/Gemini TTS pipeline proven

**Benefits of waiting:**
1. Learn from slide audio implementation
2. Optimize Information Extractor + AI Chain patterns
3. Validate iSpring import process without audio first
4. Lower priority than core module audio

---

## INTEGRATION NOTES

**Anthropic prompt already includes dialogue structure** - no workflow changes needed now

**When implementing:**
1. Add loop node after Text Outputs population
2. Use Information Extractor to parse dialogues
3. Filter for voiceModel !== null
4. Route to OpenAI TTS via AI Chain
5. Update role play JSON with audio URLs

**No impact on current workflow development** - future-ready structure in place

---

*Created: 2025-10-01*
*Status: Specification Only - Not Yet Implemented*

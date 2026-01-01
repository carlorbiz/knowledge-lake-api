/**
 * ADD MISSING VOICEOVER SCRIPTS MENU ITEM
 * 
 * This critical step was missing from the menu but exists in the code.
 * It bridges Step 4 (content generation) and Step 8 (audio generation).
 */

// UPDATE YOUR MENU STEPS ARRAY - ADD THIS SECTION AROUND LINE 1149:

    ['Step 6: Generate Voiceover Scripts', 'generateVoiceoverScripts', '', ''],
    ['• Parses slide specifications into individual slide scripts', '', '', ''],
    ['• Populates TTS sheet with slide-by-slide narration content', '', '', ''],
    ['• Prepares detailed scripts for professional audio generation', '', '', ''],
    ['• Ensures consistent narrative flow across all module slides', '', '', ''],
    ['', '', '', ''],
    ['Step 7: Generate Slides for Module', 'generateSlidesForSelectedModule', '', ''],
    // ... rest of existing steps shifted down
    
// UPDATE YOUR MENU CREATION - ADD THIS LINE AROUND LINE 1552:

.addItem('#6 Generate Voiceover Scripts', 'generateVoiceoverScripts')
.addItem('#7 Generate Slides for Module', 'generateSlidesForSelectedModule')
// ... rest of existing menu items shifted down

/*
CORRECTED WORKFLOW SEQUENCE:

Step 1: Setup Mapping Tab ✅
Step 2: Generate Recommendation ✅  
Step 3: Create Content Tabs & Subfolders ✅
Step 4: Generate Full Suite of Resources ✅
Step 5: Generate Absorb LMS Upload Doc ✅
⭐ Step 6: Generate Voiceover Scripts ← ADD THIS!
Step 7: Generate Slides for Module (renumbered)
Step 8: Set TTS Voice (renumbered)  
Step 9: Generate All Audio for Module (renumbered)

WHY THIS IS CRITICAL:
✅ generateVoiceoverScripts populates the TTS sheet with actual content
✅ Without this step, TTS sheet remains empty even after creation
✅ Step 8 (Generate All Audio) depends on TTS sheet having script content
✅ This bridges content generation → audio generation workflow

CURRENT PROBLEM:
- Step 4 generates Slide Specifications (Column H)
- TTS sheet gets created empty
- Users jump to audio generation but TTS sheet has no scripts
- generateVoiceoverScripts exists but isn't accessible via menu

SOLUTION:
Add Step 6 to menu so users can:
1. Generate content (Step 4)
2. Generate voiceover scripts (Step 6) ← Populates TTS sheet
3. Generate audio (Step 8) ← Now has content to work with
*/
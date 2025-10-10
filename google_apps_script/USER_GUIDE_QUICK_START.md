# AUDIO TAB QUICK START GUIDE

## 🎯 Complete Workflow: Raw Content → Audio Files

### Step 1: Set Up Script Properties (One-Time Setup)

1. Open your Google Sheet
2. **Extensions** → **Apps Script**
3. Click **Project Settings** (⚙️ icon on left)
4. Scroll to **Script Properties**
5. Add property:
   - **Property:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
6. Click **Save**
7. Close Apps Script tab
8. Reload your Google Sheet

**Optional Properties:**
- `DRIVE_FOLDER_ID` - Store audio files in specific folder
- `VOICE_NAME_OVERRIDE` - Set default voice (e.g., "Charon", "Aoede")

---

## 📝 Step 2: Add Your Raw Content

In the **Audio** tab:

| Column | What to Fill |
|--------|--------------|
| **A - Slide Number** | 1, 2, 3, etc. |
| **L - Slide Title** | "Introduction to Patient Safety" |
| **R - Raw Slide Content** | Your basic text, notes, or bullet points |

**Example:**

| A | L | R |
|---|---|---|
| 1 | Introduction to Patient Safety | Key concepts: WHO guidelines, Australian NSQHS standards, patient-centred care. Focus on communication, documentation, incident reporting. |
| 2 | Communication Strategies | Effective handover, ISBAR framework, closed-loop communication. Real examples from Australian hospitals. |

---

## 🚀 Step 3: Enhance Content

1. **Select** the rows you want to process (click row numbers on left)
2. **Menu** → **🎙️ Audio Generation** → **🚀 STEP 1: Enhance Content**
3. Click **Yes** to confirm
4. Wait ~3 seconds per slide

**What happens:**
- Column B gets **300-450 word voiceover script** (flowing paragraphs)
- Column M gets **content points** as JSON array
- Column D gets **image prompt** (use this with ChatGPT/Claude for images)

---

## 🎙️ Step 4: Generate Audio Files

1. **Select** the same rows (or new ones)
2. **Menu** → **🎙️ Audio Generation** → **▶️ STEP 2: Generate Audio for Selected Slides**
3. Click **Yes** to confirm
4. Wait ~3 seconds per slide

**What happens:**
- Audio files generated from voiceover scripts
- Column C gets **Google Drive URL** for audio file (WAV format)
- Files stored in "Course Audio Files" folder in Drive

---

## ⚡ Step 5: One-Click Full Pipeline (Optional)

**Skip Steps 3 & 4** - do everything at once:

1. **Select** rows with raw content in Column R
2. **Menu** → **🎙️ Audio Generation** → **⚡ AUTO: Enhance + Audio (Full Pipeline)**
3. Click **Yes**
4. Wait ~6 seconds per slide

**What happens:**
- Enhances content (Column R → B, D, M)
- Generates audio files (Column C)
- All in one step!

---

## 📊 Step 6: Generate Presentation (Optional)

1. **Select** rows with audio files
2. **Menu** → **🎙️ Audio Generation** → **📊 STEP 3: Generate Presentation from Selected Slides**
3. New Google Slides created with:
   - Slide titles
   - Content points as bullets
   - Audio file links in speaker notes

---

## 🎤 Voice Selection

### Use Different Voices

**Column P - Voice Selection:**
- Leave blank = Default voice (Charon)
- Or choose from: Puck, Charon, Kore, Fenrir, Aoede, etc.

**Set voice for specific slides:**
1. **Select** rows
2. **Menu** → **🎙️ Audio Generation** → **🎤 Set Voice for Selected Slides**
3. Choose voice from list

**See all available voices:**
- **Menu** → **🎙️ Audio Generation** → **📋 Show Available Voices**

---

## 🔄 Status-Based Auto-Processing

### Use Status Column (O) for Queue Management

**Set up workflow:**
1. Fill Column R with raw content for 12 slides
2. Set Column O = **"Pending"** for all slides
3. **Menu** → **🔄 Auto-Process by Status** → **🔄 Process All "Pending" Slides**
4. Walk away - script processes all slides automatically

**Status values:**
- **Pending** = Queued for batch processing
- **Next** = Process this one next (sequential)
- **Audio Generated** = Script sets this when complete

**Check queue:**
- **Menu** → **🔄 Auto-Process by Status** → **🔍 Show Processing Queue**

---

## 📋 Complete Example Workflow

### Example: 12-Slide Module

**Step 1: Fill in basic data**
| A | L | R | O |
|---|---|---|---|
| 1 | Introduction | Key concepts and overview... | Pending |
| 2 | Foundation | Core principles and frameworks... | Pending |
| ... | ... | ... | Pending |
| 12 | Summary | Key takeaways and next steps... | Pending |

**Step 2: Run auto-process**
- Menu → 🔄 Auto-Process by Status → 🔄 Process All "Pending" Slides
- Wait ~2-3 minutes (12 slides × ~10 seconds each)

**Step 3: Done!**
- Column B: Full voiceover scripts ✅
- Column C: Audio file URLs ✅
- Column D: Image prompts ✅
- Column M: Content points ✅
- Column O: Status = "Audio Generated" ✅

---

## 🎨 What About Images?

**Image prompts are generated in Column D**, but the script does NOT create images.

**Use image prompts with:**
- ChatGPT (GPT-4 with DALL-E)
- Claude (with image generation)
- Midjourney
- Adobe Firefly
- Absorb LMS AI (auto-generates during upload)

**Why?**
- Better quality control
- Can tweak prompts before generating
- Avoid nonsensical text in images
- LMS will handle it automatically anyway

---

## ⚙️ Settings & Configuration

**View current settings:**
- **Menu** → **🎙️ Audio Generation** → **⚙️ Settings**

**See:**
- API key status
- Drive folder configuration
- Default voice
- Rate limiting settings

---

## 📊 View Statistics

**Menu** → **🎙️ Audio Generation** → **📊 Show Statistics**

**See:**
- Total slides
- Audio files generated
- Completion percentage
- Status breakdown

---

## 🐛 Troubleshooting

### Audio generation fails

**Check:**
1. Script Properties set? (Extensions → Apps Script → Project Settings)
2. GEMINI_API_KEY correct?
3. Column B has voiceover script?
4. API quota not exceeded?

**View logs:**
- Extensions → Apps Script → Executions

### "Drive is not defined" error

**Fix:**
1. Extensions → Apps Script
2. Click **Services** (➕ icon on left)
3. Find **Google Drive API**
4. Click **Add**
5. Select version **v3**
6. Save

### Audio file won't play

**Check:**
- File format should be WAV
- Download from Drive URL
- Try different media player

---

## 🎓 Tips & Best Practices

### Content Quality
- **Column R**: Brief notes are fine - AI will expand them
- **Be specific**: Include key terms, standards, frameworks
- **Mention Australian context**: AHPRA, NMBA, NSQHS, etc.

### Voice Scripts
- **Auto-generated**: 300-450 words per slide (2-3 minutes audio)
- **Australian English**: Spelling and terminology
- **Evidence-based**: References standards and guidelines
- **Conversational**: Professional but engaging

### Processing Speed
- **Enhancement**: ~3 seconds per slide
- **Audio**: ~3 seconds per slide
- **Full pipeline**: ~6-10 seconds per slide
- **12 slides**: ~2-3 minutes total

### Batch vs Sequential
- **"Pending" status**: Batch all at once (faster)
- **"Next" status**: One at a time (more control)
- **Select rows**: Process specific slides only

---

## 🔗 Links to Other Guides

- **SCRIPT_PROPERTIES_SETUP.md** - Detailed Script Properties setup
- **CONTENT_ENHANCEMENT_GUIDE.md** - Deep dive into content enhancement
- **STATUS_WORKFLOW_GUIDE.md** - Advanced status-based workflows
- **CRITICAL_AUDIO_FIX.md** - Enable Advanced Drive Service

---

## ✅ Quick Checklist

Before using for the first time:

- [ ] Script Properties: GEMINI_API_KEY added
- [ ] Advanced Drive Service enabled (v3)
- [ ] Script authorized (Run → onOpen → Review permissions)
- [ ] Test with 1 slide first
- [ ] Check execution logs for errors

**Ready to go!**

---

## 📞 Support

**View execution logs:**
- Extensions → Apps Script → Executions

**Check configuration:**
- Menu → ⚙️ Settings

**View queue status:**
- Menu → 🔄 Auto-Process by Status → 🔍 Show Processing Queue

---

*Quick Start Guide for Audio Tab Complete*
*Date: 2025-10-07*
*Version: 2.0*

# COURSE DEVELOPMENT SYSTEM - CHANGELOG

## Version 3.0 (2025-10-08)

### ✅ Major Changes

#### 1. Module Content Generator - Complete Enhancement (Phases A/B/C)
**Enhanced from basic content generation to premium quality system**

**Phase A: Critical Fixes**
- ✅ Voiceover word count: 200-250 → 150-225 words (60-90 sec audio)
- ✅ Vancouver citations integration throughout LMS document
- ✅ LMS document structure: Added rationale, key concepts, glossary, references
- ✅ Enhanced to support Absorb LMS AI parsing

**Phase B: Premium Workbook Quality**
- ✅ Created `generateCaseStudies()` function (2-3 detailed scenarios per module)
- ✅ Enhanced workbook with glossary, professional templates, comprehensive resources
- ✅ Integrated case studies into workflow as Step 4/6
- ✅ Added Case Studies column to Module Content Complete sheet

**Phase C: iSpring Audio Scripts**
- ✅ Enhanced `generateAssessments()` to include audio scripts
- ✅ Assessment intro narration (150-225 words)
- ✅ Quiz feedback (correct/incorrect, 50-75 words each)
- ✅ Role-play intros (3 scenarios with intro/transition/debrief scripts)
- ✅ Added Audio Scripts JSON column to storage

#### 2. Removed Duplicate Content Generation
**Streamlined workflow - single source of truth**

**Before:**
- Module Generator created: slideTitle, contentPoints, voiceoverScript, imagePrompt
- Audio tab overwrote: voiceoverScript, contentPoints, imagePrompt
- Result: Wasted tokens, duplicate work

**After:**
- Module Generator creates: slideTitle, detailedContent (100-150 words)
- Audio tab reads detailedContent and generates: contentPoints, voiceoverScript, imagePrompt
- Result: No duplication, clean separation of concerns

#### 3. Absorb LMS AI Compatibility
**Fixed ineffective slide parsing**

**Problem:** Absorb AI couldn't reliably identify 12 discrete screens
**Solution:**
- Explicit instructions in LMS document generation
- MUST have exactly 12 "## Slide X:" sections
- Clear structure: front matter → 12 slides → back matter
- Horizontal rules separating slides
- Validation logs slide count

**Result:** Voiceover files now align perfectly with Absorb course screens

#### 4. Citations Support - Two Column Structure
**Separated research body from citations**

**New Structure:**
- Research Notes column: Main research content/summary
- Citations column (Column M): Vancouver-style citations
- Both read by Module Generator and passed to LMS generation

**Benefits:**
- Cleaner organization
- Easier to maintain citations
- Direct use in References section

#### 5. Audio Tab Enhancements
**Phonetic pronunciation and optimization**

- ✅ Phonetic replacement function for Australian healthcare acronyms
- ✅ Applied BEFORE writing to Column B (user visibility)
- ✅ Real-time sheet updates with SpreadsheetApp.flush()
- ✅ Voiceover word count aligned: 150-225 words
- ✅ Column mapping fixed to match Audio_Tab_Enhanced.gs spec

#### 6. Error Handling & Validation
**Improved reliability**

- ✅ Per-slide validation before writing to Audio tab
- ✅ JSON parse error logging with raw response preview
- ✅ Slide count validation (must be exactly 12)
- ✅ LMS document slide structure validation
- ✅ Detailed logging for troubleshooting

---

### 🔄 Breaking Changes

#### Content Structure Change
**Old:** contentPoints array (3 brief points)
**New:** detailedContent string (100-150 words rich content)

**Impact:** Provides richer source material for:
- LMS upload (Absorb AI needs detail)
- Audio enhancement (creates better voiceovers)
- Workbook & case studies (comprehensive material)

#### Column Mapping Update
**Audio Tab columns now aligned:**
- Column B: Empty → filled by Audio tab enhancement
- Column D: Empty → filled by Audio tab enhancement
- Column M: Empty → filled by Audio tab enhancement
- Column R: Raw slide content (formatted detailedContent)

---

### 📁 Files Updated

**Scripts:**
- Module_Content_Generator.gs (major enhancements)
- Audio_Tab_Enhanced.gs (phonetic replacements, optimizations)

**Documentation:**
- README.md (NEW - comprehensive system overview)
- CHANGELOG.md (this file - updated)
- Complete_Course_Development_Workflow.txt (updated)
- Quick_Reference_All_Prompts_&_Templates.txt (updated)

**Archived:**
- Audio_Tab_Complete.gs → archive_2025-10-08/
- MODULE_GENERATOR_REVIEW.md → archive_2025-10-08/ (enhancements complete)
- CONTENT_ENHANCEMENT_GUIDE.md → archive_2025-10-08/ (incorporated)
- CONTENT_ENHANCEMENT_SUMMARY.md → archive_2025-10-08/ (obsolete)
- CRITICAL_AUDIO_FIX.md → archive_2025-10-08/ (issues resolved)

---

### 🎯 Performance Optimizations

**Token Usage:**
- Reduced maxOutputTokens: 16384 → 8192
- Lowered temperature: 0.8 → 0.7 (more reliable JSON)
- Optimized content length: 200-300 → 100-150 words per slide
- Total output: ~3600 → ~1800 words (2x faster, more reliable)

**Execution:**
- Better error handling prevents timeouts
- JSON validation catches issues early
- Logging provides clear debugging info

---

### ✨ New Capabilities

**Module Content Generator now produces:**
1. 12 slides with rich 100-150 word detailed content
2. LMS upload document (Absorb AI compatible, exactly 12 screens)
3. Premium workbook (glossary, templates, resources)
4. 2-3 detailed case studies (600-800 words each)
5. Assessments (10 MCQs + 3 role-plays)
6. iSpring audio scripts (assessment intros, feedback, role-play narration)
7. All with Vancouver citations integrated

**Audio Tab now handles:**
1. Content enhancement (detailedContent → content points)
2. Voiceover generation (150-225 words, phonetically corrected)
3. Image prompt generation
4. Audio file generation with Gemini TTS
5. Real-time progress updates

---

### 📊 Workflow Improvements

**Before v3.0:**
```
Research (manual) → Module Generator (basic slides) → Audio Tab (generate everything)
```

**After v3.0:**
```
Research (manual - Claude UI/Genspark/NotebookLM/Gems)
  ↓
Module Generator (rich educational content + LMS + workbook + case studies + assessments)
  ↓
Audio Tab (enhance slides → generate audio)
  ↓
Absorb Upload (AI creates exactly 12 screens matching voiceovers)
```

---

### 🐛 Bug Fixes

- ✅ Fixed JSON parsing errors (reduced content size, better error handling)
- ✅ Fixed column mapping mismatch (Audio tab alignment)
- ✅ Fixed duplicate content generation (removed from Module Generator)
- ✅ Fixed Absorb AI slide parsing (explicit 12-screen structure)
- ✅ Fixed voiceover timing (150-225 words)
- ✅ Fixed missing citations (two-column structure)

---

### 🔮 Future Enhancements

- [ ] Automated citation extraction from research
- [ ] Bulk module processing (process multiple modules in sequence)
- [ ] Custom audience type templates
- [ ] Enhanced image generation integration
- [ ] PowerPoint export functionality

---

## Version 2.0 (2025-10-07)

### ✅ Major Changes

#### 1. Script Properties Integration
**Changed from hardcoded config to Script Properties**

**Before:**
```javascript
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSy...', // ❌ Hardcoded in script
  DEFAULT_VOICE: 'Charon'
};
```

**After:**
```javascript
const SCRIPT_PROPS = PropertiesService.getScriptProperties();
const CONFIG = {
  GEMINI_API_KEY: SCRIPT_PROPS.getProperty('GEMINI_API_KEY'), // ✅ Secure!
  DRIVE_FOLDER_ID: SCRIPT_PROPS.getProperty('DRIVE_FOLDER_ID'),
  DEFAULT_VOICE: SCRIPT_PROPS.getProperty('VOICE_NAME_OVERRIDE') || 'Charon'
};
```

**Benefits:**
- ✅ API keys not exposed in code
- ✅ Easy to update without editing script
- ✅ Safe to share script with others
- ✅ Per-sheet configuration

---

#### 2. Content Enhancement Feature (NEW!)
**Transform basic text → professional content**

**Added Column R: Raw Slide Content**
- User input: Basic text, notes, bullet points
- Auto-generates:
  - Column M: Content Points (JSON)
  - Column B: Voiceover Script (300-450 words)
  - Column D: Image Prompt

**New Menu Items:**
- 🚀 STEP 1: Enhance Content (Text → Scripts + Points)
- ⚡ AUTO: Enhance + Audio + Images (Full Pipeline)

**New Functions:**
- `enhanceContentForSelected()` - Transform basic text
- `enhanceSlideContent()` - AI enhancement with Gemini
- `fullPipelineForSelected()` - One-click complete generation

---

#### 3. Drive Folder Management
**Improved file organization with configured folder**

**Before:**
```javascript
function getOrCreateFolder(folderName) {
  // Always searches My Drive
  const folders = DriveApp.getFoldersByName(folderName);
  ...
}
```

**After:**
```javascript
function getOrCreateFolder(folderName) {
  // Uses configured DRIVE_FOLDER_ID if set
  if (CONFIG.DRIVE_FOLDER_ID) {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    return folder.createFolder(folderName); // Creates subfolder
  }
  // Fallback to My Drive
  ...
}
```

**Benefits:**
- ✅ Organized file storage in specified folder
- ✅ Creates subfolders: "Course Audio Files", "Course Image Files"
- ✅ Falls back to My Drive if not configured

---

#### 4. Voice Override Support
**Global default voice configuration**

**New Property:** `VOICE_NAME_OVERRIDE`
- Set once in Script Properties
- Applies to all slides by default
- Per-slide override still works (Column P)

**Example:**
```
VOICE_NAME_OVERRIDE = Aoede
→ All slides use Aoede unless Column P specifies otherwise
```

---

#### 5. Enhanced Settings Display
**New Settings dialog shows all configuration**

**Added to Settings (⚙️):**
- Script Properties status (set/not set)
- Drive Folder ID
- Sheets/Slides Template IDs
- Voice Override
- Instructions to update properties

---

### 📊 New Script Properties

| Property | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Gemini API authentication |
| `DRIVE_FOLDER_ID` | 🔷 Optional | Organized file storage |
| `SHEETS_TEMPLATE_ID` | 🔷 Optional | (Future use) |
| `SLIDES_TEMPLATE_ID` | 🔷 Optional | (Future use) |
| `VOICE_NAME_OVERRIDE` | 🔷 Optional | Global default voice |

---

### 📁 New Files

1. **SCRIPT_PROPERTIES_SETUP.md** - Complete guide to setting up Script Properties
2. **CONTENT_ENHANCEMENT_GUIDE.md** - Detailed workflow guide for content enhancement
3. **CONTENT_ENHANCEMENT_SUMMARY.md** - Quick reference
4. **CHANGELOG.md** - This file

---

### 🔄 Updated Files

1. **Audio_Tab_Complete.gs** - Main script with all new features
2. **AUDIO_TAB_INSTALLATION.md** - Updated installation steps for Script Properties

---

### 🎯 Breaking Changes

#### ⚠️ IMPORTANT: Configuration Method Changed

**Old Way (v1.0):**
```javascript
// Edit line 49 in script
GEMINI_API_KEY: 'YOUR_KEY_HERE'
```

**New Way (v2.0):**
```
1. Apps Script → Project Settings → Script Properties
2. Add property: GEMINI_API_KEY = your_key
3. Save
4. Reload sheet
```

**Migration Steps:**
1. Copy your API key from old script (line 49)
2. Add to Script Properties
3. Update script to v2.0 code
4. Reload sheet

**No data loss** - existing Audio tab data unchanged

---

### ✨ New Capabilities

#### Before v2.0:
```
User has: Pre-formatted voiceover scripts (Column B)
→ Generate audio
→ Generate images (if prompt provided)
```

#### After v2.0:
```
OPTION 1:
User has: Basic text notes (Column R)
→ STEP 1: Enhance Content
→ STEP 2: Generate audio + images
→ STEP 3: Create presentation

OPTION 2:
User has: Basic text notes (Column R)
→ AUTO: Full Pipeline (one click!)
→ Done!

OPTION 3 (existing):
User has: Pre-formatted scripts from n8n
→ Generate audio + images
→ Done!
```

---

### 🐛 Bug Fixes

- None (new version, no bugs to fix)

---

### 🔮 Future Enhancements (Noted in Script)

#### Vertex AI Migration Path
**Current:** Direct Gemini API (simple, fast setup)

**Future:** Vertex AI (enterprise features)
- Higher quotas
- Better monitoring
- Advanced security
- Cost optimization
- Cloud Logging integration

**Migration notes included in script** at line 1208+

---

### 📈 Performance

**No performance changes** - same rate limiting:
- 2 seconds between API requests
- 3 seconds between slides in batch
- 1 concurrent request at a time

**New timing (with enhancement):**
- Enhance content: ~3 sec per slide
- Generate audio: ~3 sec per slide
- Generate image: ~3 sec per slide
- **Full pipeline: ~10 sec per slide**

---

### 🎓 Backwards Compatibility

✅ **Fully backwards compatible** with existing workflows:

1. **Existing n8n integration** - Still works! n8n populates B, D, M directly
2. **Existing Audio tab data** - No changes needed
3. **Column structure** - Column R is NEW (added at end), existing columns unchanged
4. **Voice selection** - Column P still works same way
5. **Menu items** - Old menu items still present (STEP 2, STEP 3)

**Only change:** Must add Script Properties (API key)

---

### 📚 Documentation Updates

#### New Guides:
- SCRIPT_PROPERTIES_SETUP.md (complete property setup)
- CONTENT_ENHANCEMENT_GUIDE.md (25 sections on enhancement workflow)
- CONTENT_ENHANCEMENT_SUMMARY.md (quick reference)
- CHANGELOG.md (this file)

#### Updated Guides:
- AUDIO_TAB_INSTALLATION.md (Step 3 now covers Script Properties)

---

### 🔐 Security Improvements

#### v1.0 (Hardcoded):
```javascript
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyDg3Kl...' // ❌ Visible in script!
};
```

**Problems:**
- ❌ Anyone with script access sees API key
- ❌ Must manually remove before sharing
- ❌ Key appears in version history
- ❌ Difficult to rotate keys

#### v2.0 (Script Properties):
```javascript
const CONFIG = {
  GEMINI_API_KEY: SCRIPT_PROPS.getProperty('GEMINI_API_KEY') // ✅ Secure!
};
```

**Benefits:**
- ✅ Key not visible in script code
- ✅ Safe to share script publicly
- ✅ Key encrypted by Google
- ✅ Easy to update/rotate

---

### 🎯 Summary of Changes

**Code changes:**
- +300 lines (content enhancement)
- ~50 lines (Script Properties integration)
- +50 lines (improved Drive folder handling)
- +50 lines (enhanced Settings dialog)
- **Total: ~450 new lines**

**New features:**
- Content enhancement (Column R → B, D, M)
- Full auto pipeline
- Script Properties configuration
- Voice override support
- Enhanced settings display

**Files:**
- 1 updated script (Audio_Tab_Complete.gs)
- 4 new documentation files
- 1 updated installation guide

**Breaking changes:**
- Configuration method (hardcoded → Script Properties)

**Migration required:**
- Add API key to Script Properties (5 minutes)

---

*Changelog for Audio Tab Complete v2.0*
*Date: 2025-10-07*
*All changes backwards compatible except configuration method*

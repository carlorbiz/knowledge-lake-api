# SCRIPT PROPERTIES SETUP GUIDE

## 🔐 Overview

The Audio Tab Complete script uses **Script Properties** to store sensitive configuration (API keys, folder IDs) securely **outside the code**.

This means:
- ✅ API keys never appear in the script code
- ✅ Different users/sheets can have different settings
- ✅ Easy to update without editing code
- ✅ More secure than hardcoding

---

## 📋 Required vs Optional Properties

### ✅ REQUIRED

| Property | Description | How to Get |
|----------|-------------|------------|
| `GEMINI_API_KEY` | Your Gemini API key | https://aistudio.google.com/apikey |

### 🔷 OPTIONAL (Recommended)

| Property | Description | Default if Not Set |
|----------|-------------|-------------------|
| `DRIVE_FOLDER_ID` | Google Drive folder for audio/images | Creates in My Drive |
| `VOICE_NAME_OVERRIDE` | Override default voice for all slides | Uses "Charon" |
| `SHEETS_TEMPLATE_ID` | Google Sheets template ID | Not used currently |
| `SLIDES_TEMPLATE_ID` | Google Slides template ID | Not used currently |

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Open Script Editor

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. You should see the `Audio_Tab_Complete.gs` code

### Step 2: Open Project Settings

1. Click the **⚙️ Project Settings** icon on the left sidebar
2. Scroll down to **Script Properties** section

### Step 3: Add Properties

Click **Add script property** for each:

#### Property 1: GEMINI_API_KEY (REQUIRED)

- **Property:** `GEMINI_API_KEY`
- **Value:** Your Gemini API key (starts with `AIza...`)
- **Get it:** https://aistudio.google.com/apikey

#### Property 2: DRIVE_FOLDER_ID (Recommended)

- **Property:** `DRIVE_FOLDER_ID`
- **Value:** Google Drive folder ID
- **Get it:**
  1. Open Google Drive
  2. Create/open folder for course audio files
  3. Copy folder ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
  4. Paste just the ID (after `/folders/`)

**Example:**
```
URL: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
DRIVE_FOLDER_ID: 1a2b3c4d5e6f7g8h9i0j
```

#### Property 3: VOICE_NAME_OVERRIDE (Optional)

- **Property:** `VOICE_NAME_OVERRIDE`
- **Value:** Voice name to use by default (e.g., `Charon`, `Aoede`, `Gacrux`)
- **Use case:** Override default voice for your entire sheet

**Example:** Set to `Aoede` to use female voice by default

### Step 4: Save Properties

1. Click **Save script properties**
2. Close Project Settings
3. Reload your Google Sheet

---

## ✅ VERIFY SETUP

### Check Settings

1. In your Google Sheet
2. Menu → **🎙️ Audio Generation → ⚙️ Settings**
3. Verify:
   - ✅ Gemini API Key shows `AIza......` (not "❌ NOT SET")
   - ✅ Drive Folder ID shows folder ID (or "Using My Drive")
   - ✅ Default Voice shows correct voice name

---

## 🔍 TROUBLESHOOTING

### "❌ NOT SET" for Gemini API Key

**Cause:** Property not added or misspelled

**Fix:**
1. Check spelling: `GEMINI_API_KEY` (exact, case-sensitive)
2. Re-add property
3. Reload sheet

---

### Audio/images saving to wrong folder

**Cause:** DRIVE_FOLDER_ID not set or incorrect

**Fix:**
1. Verify folder ID is correct (copy from Drive URL)
2. Check you have edit access to the folder
3. Re-save property

---

### Voice override not working

**Cause:** Property value not a valid voice name

**Fix:**
1. Check spelling matches exactly (e.g., `Charon` not `charon`)
2. View available voices: Menu → Show Available Voices
3. Use exact name from list

---

## 📊 HOW IT WORKS IN THE SCRIPT

### Old Way (Hardcoded - BAD)
```javascript
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSy...', // ❌ Exposed in code!
  DEFAULT_VOICE: 'Charon'
};
```

### New Way (Script Properties - GOOD)
```javascript
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

const CONFIG = {
  GEMINI_API_KEY: SCRIPT_PROPS.getProperty('GEMINI_API_KEY'), // ✅ Secure!
  DEFAULT_VOICE: SCRIPT_PROPS.getProperty('VOICE_NAME_OVERRIDE') || 'Charon'
};
```

---

## 🔄 UPDATING PROPERTIES

### Change API Key

1. Extensions → Apps Script → Project Settings
2. Find `GEMINI_API_KEY` in Script Properties
3. Click **Edit** (pencil icon)
4. Update value
5. Click **Save**
6. Reload sheet

### Add New Property

1. Extensions → Apps Script → Project Settings
2. Scroll to Script Properties
3. Click **Add script property**
4. Enter property name and value
5. Click **Save**
6. Reload sheet

### Delete Property

1. Extensions → Apps Script → Project Settings
2. Find property in Script Properties
3. Click **Delete** (trash icon)
4. Confirm deletion
5. Reload sheet

---

## 🎯 PROPERTY DETAILS

### GEMINI_API_KEY

**Purpose:** Authenticate with Gemini API for TTS, image generation, content enhancement

**Format:** String starting with `AIza`

**Get it:**
1. Visit https://aistudio.google.com/apikey
2. Click "Create API key"
3. Copy the key

**Used for:**
- Audio generation (Gemini TTS)
- Image generation (Imagen 3)
- Content enhancement (Gemini 2.0 Flash)

---

### DRIVE_FOLDER_ID

**Purpose:** Where to save audio files and images

**Format:** Google Drive folder ID (long alphanumeric string)

**Get it:**
1. Open Google Drive
2. Navigate to folder
3. URL shows: `https://drive.google.com/drive/folders/FOLDER_ID`
4. Copy `FOLDER_ID` part

**Behavior if not set:**
- Script creates folders in "My Drive"
- Folders named "Course Audio Files" and "Course Image Files"

**Behavior if set:**
- Script creates **subfolders** within your specified folder
- Structure: `Your Folder/Course Audio Files/` and `Your Folder/Course Image Files/`

---

### VOICE_NAME_OVERRIDE

**Purpose:** Set global default voice for entire sheet

**Format:** Exact voice name (case-sensitive)

**Valid values:** Charon, Kore, Aoede, Puck, Fenrir, Gacrux, Sulafat, etc. (30 total)

**Full list:** Menu → 📋 Show Available Voices

**Behavior if not set:**
- Uses "Charon" (Informative, male)

**Behavior if set:**
- ALL slides use this voice by default
- Can still override per-slide in Column P

**Example:**
```
VOICE_NAME_OVERRIDE = Aoede
→ All slides use Aoede (Breezy, female) unless Column P specifies otherwise
```

---

### SHEETS_TEMPLATE_ID / SLIDES_TEMPLATE_ID

**Purpose:** Reserved for future features

**Status:** Not currently used by the script

**Future use cases:**
- Creating new Google Sheets from template
- Creating presentations from custom Slides template

**Can be left blank** for now.

---

## 🔐 SECURITY NOTES

### Why Script Properties?

1. **Not visible in code** - Anyone viewing script won't see API key
2. **Per-project** - Each Google Sheet project has its own properties
3. **Encrypted** - Google encrypts property values at rest
4. **Scoped** - Only your script can access your properties

### Best Practices

✅ **DO:**
- Use Script Properties for API keys
- Use Script Properties for folder IDs
- Keep API keys private
- Rotate API keys periodically

❌ **DON'T:**
- Hardcode API keys in script
- Share scripts with API keys in code
- Commit API keys to version control
- Share Script Properties screenshots publicly

---

## 🆚 COMPARISON: Script Properties vs Hardcoded

| Feature | Script Properties | Hardcoded in Script |
|---------|-------------------|---------------------|
| **Security** | ✅ Secure (not visible) | ❌ Exposed in code |
| **Updates** | ✅ Easy (no code edit) | ❌ Must edit script |
| **Sharing** | ✅ Safe to share script | ❌ Must remove keys first |
| **Per-sheet config** | ✅ Different per sheet | ❌ Same for all copies |
| **Version control** | ✅ Keys not committed | ❌ Keys in commits |

---

## 📚 RELATED DOCUMENTATION

- [Apps Script Properties Service](https://developers.google.com/apps-script/reference/properties/properties-service)
- [Gemini API Keys](https://aistudio.google.com/apikey)
- [Google Drive Folder IDs](https://support.google.com/drive/answer/2494822)

---

## 💡 QUICK REFERENCE

### Minimum Setup (to get started):

1. Add `GEMINI_API_KEY` property
2. Save
3. Reload sheet
4. ✅ Ready to use!

### Recommended Setup (for best experience):

1. Add `GEMINI_API_KEY` property
2. Add `DRIVE_FOLDER_ID` property (organized file storage)
3. Add `VOICE_NAME_OVERRIDE` property (if you prefer different default voice)
4. Save
5. Reload sheet
6. ✅ Fully configured!

---

*Script Properties Setup Guide*
*Date: 2025-10-07*
*Compatible with Audio_Tab_Complete.gs v2.0*

# N8N IMPORT - QUICK FIX REFERENCE CARD
## Keep This Open While Importing
## Date: 2025-10-02

---

## 🚀 IMPORT STEPS (1-2-3)

1. **Open n8n** → http://localhost:5678
2. **Import** → ⋮ menu → "Import from File"
3. **Select** → `module_generator_complete_IMPORT_ME.json`

---

## 🔧 TOP 5 FIXES YOU'LL NEED

### FIX #1: Gemini API Key (MOST COMMON)
**Node:** "5a. Generate Slides (Gemini)"

**Find this URL:**
```
https://generativelanguage.googleapis.com/.../generateContent?key={{ $credentials.geminiApiKey }}
```

**Replace with:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_GEMINI_API_KEY
```

---

### FIX #2: Audio Sheet ID (REQUIRED)
**Node:** "9b. Write to Audio Tab"

**Current:** Sheet name shows "AUDIO_SHEET_ID_HERE"

**Fix:**
1. Open Google Sheets
2. Go to Audio tab
3. Look at URL: `...#gid=123456789`
4. Copy that number
5. Paste in n8n sheet selector OR select "Audio" from dropdown

---

### FIX #3: Docker URL (CRITICAL)
**Node:** "10. Log to Knowledge Lake"

**Current:** `http://localhost:5002/knowledge/add`

**Change to:** `http://host.docker.internal:5002/knowledge/add`

---

### FIX #4: Credentials (ALL NODES)
Click each red/warning node:

**Google Sheets (3 nodes):**
- Trigger node
- "9a. Write to Text Outputs"
- "9b. Write to Audio Tab"
→ Create New → OAuth2 → Authorize → Save

**Anthropic (2 nodes):**
- "1. Parse Course Recommendation"
- "5b. Assessments & Role Plays"
→ Create New → Paste API Key → Save

**Perplexity (1 node):**
- "3a. Enhanced Research"
→ Create New → Paste API Key → Save

---

### FIX #5: Node References (IF ERRORS)
**Common broken references:**

**In "4a. Clean Perplexity Response":**
```javascript
// Change FROM:
const originalData = $('Extract Individual Modules').item.json;

// Change TO:
const originalData = $('2. Extract Individual Modules').item.json;
```

**In "9a. Write to Text Outputs" columns:**
```javascript
// Make sure this works:
$('7. Merge Slides + Assessments').item.json.module_number
```

---

## 🎯 TESTING CHECKLIST

### After Import, Check:
- [ ] No red warning icons on nodes
- [ ] All credentials show green
- [ ] Gemini URL has real API key
- [ ] Audio sheet ID is correct
- [ ] Docker URL uses `host.docker.internal`
- [ ] All nodes connected with solid lines
- [ ] Trigger points to "Text Outputs" tab

### Test Run:
- [ ] Click "Execute Workflow" (manual test)
- [ ] Or add test data to Google Sheets
- [ ] Check execution log (no errors)
- [ ] Verify Text Outputs tab gets data
- [ ] Verify Audio tab gets 12 rows
- [ ] Check Knowledge Lake dashboard

---

## ⚡ QUICK TROUBLESHOOTING

| Error | Quick Fix |
|-------|-----------|
| "Credentials not set" | Click node → Add credential |
| "Sheet not found" | Select correct sheet from dropdown |
| "Node not found" | Check node name matches exactly |
| "Invalid expression" | Add `=` at start of expression |
| "Connection refused" | Change localhost to host.docker.internal |
| "Cannot read property" | Check previous node executed |
| "<think> tags found" | Verify cleaning code in node 4a |
| "12 slides expected, got X" | Check Gemini prompt and parse code |

---

## 📋 WORKFLOW FLOW (Visual Check)

```
Trigger (Row Added)
    ↓
1. Parse Course Rec (Anthropic)
    ↓
2. Extract Modules (Code)
    ↓
   ╔════════════╗
   ║ SPLIT HERE ║
   ╚════════════╝
    ↓          ↓
3a. Research   5b. Assessments
    ↓              ↓
4a. Clean      6b. Parse
    ↓              ↓
5a. Gemini         ↓
    ↓              ↓
6a. Parse          ↓
    ↓              ↓
   ╔════════════╗
   ║ MERGE HERE ║
   ╚════════════╝
    ↓
7. Merge Streams
    ↓
   ╔════════════╗
   ║ SPLIT HERE ║
   ╚════════════╝
    ↓          ↓
8. Parse    9a. Text Outputs
    ↓          ↓
9b. Audio   10. Knowledge Lake
```

---

## 🆘 WHEN STUCK

**Try this order:**
1. Check credentials (all green?)
2. Check connections (all solid lines?)
3. Check Gemini API key (real key?)
4. Check Docker URL (host.docker.internal?)
5. Check Audio sheet ID (real number?)
6. Run workflow and check execution data
7. Look at first failed node's Input/Output
8. Ask Claude with screenshot + error message

---

## ✅ SUCCESS =
- All green nodes
- Workflow runs without errors
- Google Sheets populated
- Knowledge Lake shows module
- 12 slides generated

---

*Quick Reference by: Claude Code*
*Print this or keep it on second monitor!*

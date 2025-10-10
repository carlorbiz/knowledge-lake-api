# N8N WORKFLOW IMPORT - TROUBLESHOOTING GUIDE
## Step-by-Step Fixes for Import Issues
## Date: 2025-10-02

---

## 📥 IMPORTING THE WORKFLOW

### Step 1: Import the JSON
1. Open n8n at http://localhost:5678
2. Click **"+"** (New workflow) or open existing workflow
3. Click **"⋮"** (3 dots menu) → **"Import from File"**
4. Select `module_generator_complete_IMPORT_ME.json`
5. Click **"Import"**

---

## ⚠️ EXPECTED IMPORT ISSUES & FIXES

### ISSUE 1: **Credentials Missing** ❌

**What You'll See:**
- Red warning icons on nodes
- "Credentials are not set" errors
- Nodes marked with ⚠️

**FIX - Set Up Credentials:**

#### A) Google Sheets Credentials
1. Click on **"Trigger: Text Outputs Row Added"** node
2. Under "Credential to connect with", click dropdown
3. If no credential exists:
   - Click **"Create New"**
   - Select **"OAuth2"**
   - Click **"Connect my account"**
   - Authorize with your Google account
   - Name it: "Google Sheets Trigger account"
   - **Save**

4. **Repeat for these nodes:**
   - "9a. Write to Text Outputs" → Use same credential
   - "9b. Write to Audio Tab" → Use same credential

#### B) Anthropic Credentials
1. Click **"1. Parse Course Recommendation"** node
2. Under credentials, click dropdown
3. If no credential exists:
   - Click **"Create New"**
   - Enter your Anthropic API Key
   - Name it: "Anthropic account"
   - **Save**

4. **Repeat for:**
   - "5b. Assessments & Role Plays" → Use same credential

#### C) Perplexity Credentials
1. Click **"3a. Enhanced Research (Perplexity)"** node
2. Under credentials, click dropdown
3. If no credential exists:
   - Click **"Create New"**
   - Enter your Perplexity API Key
   - Name it: "Perplexity account"
   - **Save**

#### D) Gemini API Key (Different - Uses Expression)
**IMPORTANT:** Gemini doesn't have a credential node in your n8n!

1. Click **"5a. Generate Slides (Gemini)"** node
2. Look at the URL parameter - it says `{{ $credentials.geminiApiKey }}`
3. **You need to replace this manually:**

**Option 1: Hardcode the API key (Quick)**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_ACTUAL_GEMINI_API_KEY_HERE
```

**Option 2: Use Environment Variable (Better)**
- Set environment variable in n8n: `GEMINI_API_KEY=your_key`
- In URL use: `{{ $env.GEMINI_API_KEY }}`

**Option 3: Create Custom Credential**
- Go to Settings → Credentials → Create New
- Type: "Generic Credential Type"
- Save API key there
- Reference: `{{ $credentials.geminiApi.apiKey }}`

---

### ISSUE 2: **Sheet IDs Not Matching** ⚠️

**What You'll See:**
- "Sheet not found" errors
- Wrong sheet selected in dropdowns

**FIX - Update Sheet References:**

#### A) Trigger Node
1. Click **"Trigger: Text Outputs Row Added"**
2. Check "Document" dropdown
   - If your sheet isn't there, reconnect credential
   - If showing, select: **"Concept to Course Requests"**
3. Check "Sheet" dropdown
   - Select: **"Text Outputs"** (NOT Form responses 2)
4. **Save**

#### B) Text Outputs Write Node
1. Click **"9a. Write to Text Outputs"**
2. Operation: **"Append"** (correct)
3. Document: Select **"Concept to Course Requests"**
4. Sheet: Select **"Text Outputs"**
5. Check column mappings are present
6. **Save**

#### C) Audio Tab Write Node
1. Click **"9b. Write to Audio Tab"**
2. Document: Select **"Concept to Course Requests"**
3. Sheet: **IMPORTANT - Replace "AUDIO_SHEET_ID_HERE"**
   - You need to find your Audio tab's sheet ID
   - In Google Sheets, go to Audio tab
   - Look at URL: `...#gid=XXXXXXXXX`
   - Copy that number
   - In n8n, paste it or select "Audio" from dropdown
4. **Save**

---

### ISSUE 3: **Expression Syntax Errors** ❌

**What You'll See:**
- Yellow warning triangles
- "Invalid expression" errors
- Expressions not evaluating

**FIX - Update Expressions:**

#### Common Expression Fixes:

**Node: "2. Extract Individual Modules"**
- Line that says `$input.first().json['Course Recommendation']`
- Change to: `$input.first().json["Course Recommendation"]`
- (Use double quotes consistently)

**Node: "4a. Clean Perplexity Response"**
- Line: `$('2. Extract Individual Modules').item.json`
- If error, try: `$node['2. Extract Individual Modules'].item.json`

**Node: "9a. Write to Text Outputs"**
- Column mappings use `={{ expression }}`
- Make sure `=` is at start
- Example: `=Module {{ $('7. Merge Slides + Assessments').item.json.module_number }}`

---

### ISSUE 4: **Connections Broken** 🔗

**What You'll See:**
- Nodes not connected
- Gray lines instead of arrows
- Execution doesn't flow

**FIX - Reconnect Nodes:**

**Verify these connections exist:**
```
Trigger → 1. Parse Course Recommendation
1 → 2. Extract Individual Modules
2 → 3a. Enhanced Research (Perplexity)
2 → 5b. Assessments & Role Plays  [PARALLEL]
3a → 4a. Clean Perplexity Response
4a → 5a. Generate Slides (Gemini)
5a → 6a. Parse Gemini Slides
6a → 7. Merge Slides + Assessments
5b → 6b. Parse Assessments
6b → 7. Merge Slides + Assessments  [CONVERGE HERE]
7 → 8. Parse Slides for Audio
7 → 9a. Write to Text Outputs  [PARALLEL]
8 → 9b. Write to Audio Tab
9a → 10. Log to Knowledge Lake
```

**To reconnect:**
1. Click and drag from output circle of one node
2. Drop on input circle of target node
3. Gray line becomes solid when connected

---

### ISSUE 5: **Node References Wrong** 📛

**What You'll See:**
- "Node not found" errors
- Empty data in downstream nodes
- `$node['NodeName']` returns undefined

**FIX - Update Node References:**

**Each Code node needs correct parent references:**

**"4a. Clean Perplexity Response":**
```javascript
// Should reference:
const originalData = $('2. Extract Individual Modules').item.json;
```

**"6a. Parse Gemini Slides":**
```javascript
// Should reference:
const moduleData = $('4a. Clean Perplexity Response').item.json;
```

**"7. Merge Slides + Assessments":**
```javascript
// Should reference both streams:
const slidesItems = $input.all().filter(item => item.json.slides);
const assessmentItems = $input.all().filter(item => item.json.level1_knows);
```

**"9a. Write to Text Outputs":**
```javascript
// Column values should reference:
$('7. Merge Slides + Assessments').item.json.module_number
```

---

### ISSUE 6: **Gemini Response Format** 🤖

**What You'll See:**
- "Cannot read property 'parts'" errors
- Gemini returning different structure

**FIX - Update Gemini Parse Code:**

In **"6a. Parse Gemini Slides"** node, update to handle all formats:

```javascript
// Parse Gemini response (multiple format handling)
let rawResponse = '';

// Try different Gemini response structures
if ($json.candidates && $json.candidates[0]) {
  rawResponse = $json.candidates[0].content.parts[0].text;
} else if ($json.content && $json.content.parts) {
  rawResponse = $json.content.parts[0].text;
} else if ($json.text) {
  rawResponse = $json.text;
} else if (typeof $json === 'string') {
  rawResponse = $json;
} else {
  return [{ json: {
    error: 'Unknown Gemini format',
    structure: Object.keys($json),
    raw: JSON.stringify($json).substring(0, 500)
  }}];
}

// Rest of parsing code...
```

---

### ISSUE 7: **Docker URL Not Working** 🐳

**What You'll See:**
- "Connection refused" from Knowledge Lake
- HTTP Request to localhost:5002 fails

**FIX - Use Docker-Aware URL:**

In **"10. Log to Knowledge Lake"** node:
- Current URL: `http://localhost:5002/knowledge/add`
- **Change to:** `http://host.docker.internal:5002/knowledge/add`

This allows n8n Docker container to reach your host machine!

---

### ISSUE 8: **Perplexity <think> Tags** 💭

**What You'll See:**
- JSON parse errors in "4a. Clean Perplexity Response"
- `<think>` tags in raw output

**FIX - Verify Cleaning Code:**

In **"4a. Clean Perplexity Response"**, ensure this code exists:

```javascript
// Strip <think> tags (case-insensitive, multiline)
rawResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

// Remove markdown code blocks
rawResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

// Trim whitespace
rawResponse = rawResponse.trim();
```

**Test it:**
1. Run node with test data
2. Check execution data
3. Look for `<think>` in output
4. If present, regex didn't work - check multiline flag: `/gi`

---

## ✅ POST-IMPORT CHECKLIST

### Step 1: Verify Credentials (All Green)
- [ ] Google Sheets Trigger credential set
- [ ] Google Sheets Write credentials set (2 nodes)
- [ ] Anthropic credentials set (2 nodes)
- [ ] Perplexity credential set (1 node)
- [ ] Gemini API key in URL (1 node)

### Step 2: Verify Sheet IDs
- [ ] Trigger points to "Text Outputs" tab
- [ ] "Text Outputs" write node has correct sheet
- [ ] "Audio Tab" write node has correct sheet ID
- [ ] Column mappings are present in write nodes

### Step 3: Test Connections
- [ ] All nodes connected (no gray lines)
- [ ] Parallel split works (node 2 → nodes 3a & 5b)
- [ ] Merge works (nodes 6a & 6b → node 7)

### Step 4: Update Expressions
- [ ] Node references use correct names
- [ ] Expressions start with `=` where needed
- [ ] JSON.stringify() used for objects in sheets

### Step 5: Test with 1 Module
- [ ] Manually trigger workflow
- [ ] Check execution log for errors
- [ ] Verify data flows through all nodes
- [ ] Check Google Sheets populated correctly

---

## 🔍 DEBUGGING TIPS

### Check Execution Data:
1. Run workflow (even if errors)
2. Click on each node
3. Look at "Input" and "Output" tabs
4. See what data is actually flowing

### Common Data Flow Issues:

**No data in node:**
- Check if previous node executed
- Check if `$input.all()` returns empty array
- Verify node connections

**Wrong data structure:**
- Check if accessing correct property
- Use `console.log(Object.keys($json))` to see available fields
- Verify parent node references

**Expression errors:**
- Test expressions in Expression Editor
- Use drag & drop from "Current Node" panel
- Check for typos in node names

---

## 🆘 EMERGENCY FALLBACKS

### If Import Completely Fails:

**Option 1: Build from Scratch**
1. Use the architecture doc as guide
2. Add nodes one by one
3. Test each before adding next

**Option 2: Fix Existing Workflow**
1. Open `module_generator_agent.json` (your current one)
2. Manually add missing nodes:
   - Gemini HTTP Request
   - Google Sheets Write (2 nodes)
3. Connect them per architecture

**Option 3: Partial Import**
1. Import workflow
2. Delete broken nodes
3. Manually recreate just those nodes
4. Reconnect

---

## 📞 WHEN TO ASK FOR HELP

**Ask Claude if:**
- Credentials setup unclear
- Expression syntax broken
- Node references not working
- Gemini API call failing
- Sheet IDs not found
- Connections logic confusing

**Provide when asking:**
- Screenshot of error
- Node execution data (Input/Output tabs)
- Which node is failing
- Error message text

---

## ✨ SUCCESS INDICATORS

**You'll know it worked when:**
1. ✅ All nodes show green checkmarks (credentials set)
2. ✅ Workflow executes without errors
3. ✅ Text Outputs tab gets new row with module data
4. ✅ Audio tab gets 12 rows per module
5. ✅ Knowledge Lake dashboard shows new module
6. ✅ No `<think>` tags in any outputs
7. ✅ Exactly 12 slides generated per module

---

*Troubleshooting Guide by: Claude Code*
*Date: 2025-10-02*
*Status: READY TO USE*

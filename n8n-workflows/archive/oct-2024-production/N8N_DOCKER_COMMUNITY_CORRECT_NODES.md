# N8N DOCKER COMMUNITY - CORRECT NODE TYPES
## Based on Your Actual Workflow Files
## Date: 2025-10-02

---

## ✅ AVAILABLE NODES IN YOUR N8N

### **From Your Actual Workflows:**

1. **`@n8n/n8n-nodes-langchain.anthropic`** - Anthropic Claude (LangChain integration)
   - typeVersion: 1
   - Parameters: modelId, messages, options (maxTokens, temperature)

2. **`n8n-nodes-base.perplexity`** - Perplexity AI
   - typeVersion: 1
   - Parameters: messages, options (maxTokens, temperature)

3. **`n8n-nodes-base.code`** - Code/Function node (JavaScript)
   - typeVersion: 2
   - Parameters: jsCode, mode (runOnceForEachItem / runOnceForAllItems)

4. **`n8n-nodes-base.googleSheetsTrigger`** - Google Sheets Trigger
   - typeVersion: 1
   - Parameters: documentId, sheetName, event, pollTimes

5. **`n8n-nodes-base.googleSheets`** - Google Sheets (read/write)
   - typeVersion: 4
   - Operations: append, update, read

6. **`n8n-nodes-base.httpRequest`** - HTTP Request
   - typeVersion: 4
   - Parameters: method, url, sendBody, bodyParameters

---

## ❌ NODES YOU DON'T HAVE (That I Incorrectly Assumed)

1. ~~**Gemini node**~~ - NOT available as standalone node
2. ~~**Split in Batches node**~~ - NOT visible in your workflows
3. ~~**IF node**~~ - NOT visible in your workflows
4. ~~**Merge node**~~ - Using Code node instead

---

## 🔧 CORRECTED WORKFLOW ARCHITECTURE

### Your Actual Working Pattern:

```
Google Sheets Trigger
    ↓
Anthropic (Parse Course Recommendation)
    ↓
Code (Extract Individual Modules)
    ↓
Perplexity (Enhanced Research)
    ↓
Code (2nd Extraction - Clean Perplexity)
    ↓
[MISSING: Concurrent streams for Slides + Assessments]
    ↓
Code (Merge Module Outputs)
    ↓
Code (Parse Slides for Audio Tab)
    ↓
[MISSING: Google Sheets Write nodes]
    ↓
HTTP Request (Store in Knowledge Lake)
```

---

## 🎯 HOW TO IMPLEMENT MISSING PIECES

### **For Gemini (Since no dedicated node):**
Use **HTTP Request** node to call Gemini API directly:

```javascript
Node Type: n8n-nodes-base.httpRequest
typeVersion: 4

Parameters:
{
  "method": "POST",
  "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $credentials.geminiApiKey }}",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": {
    "contents": [{
      "parts": [{
        "text": "{{ $json.prompt }}"
      }]
    }],
    "generationConfig": {
      "temperature": 0.8,
      "maxOutputTokens": 4000
    }
  }
}
```

---

### **For Loop Through Modules:**
Use **Code node** with manual looping logic:

```javascript
Node Type: n8n-nodes-base.code
typeVersion: 2

Parameters:
{
  "mode": "runOnceForEachItem",  // This processes items one by one
  "jsCode": "// Your processing code for each module\nreturn { json: $json };"
}
```

**The `runOnceForEachItem` mode IS your loop!**

---

### **For Concurrent Streams (Slides + Assessments):**
Use **multiple Code nodes** that split the flow:

```javascript
// Code Node: "Split to Streams"
const moduleData = $json;

return [
  {
    json: {
      ...moduleData,
      processing_type: "slides",
      stream: "content"
    },
    pairedItem: 0
  },
  {
    json: {
      ...moduleData,
      processing_type: "assessments",
      stream: "assessments"
    },
    pairedItem: 0
  }
];
```

Then connect:
- Output 1 → Gemini HTTP Request (Slides)
- Output 2 → Anthropic (Assessments)

Both can run concurrently!

---

### **For Conditional Routing (IF node replacement):**
Use **Code node** with filtering:

```javascript
// Route to Gemini (only items with stream: "content")
if ($json.stream === "content") {
  return { json: $json };
} else {
  return null; // Skip this item
}
```

Or use **Switch node** if available (check in your n8n UI under "Flow" category)

---

### **For Google Sheets Write:**
Use **`n8n-nodes-base.googleSheets`** with these operations:

#### **Append to Text Outputs:**
```javascript
Node Type: n8n-nodes-base.googleSheets
typeVersion: 4
Operation: append

Parameters:
{
  "documentId": {
    "__rl": true,
    "value": "1fK-4Bgq9ju1jV2ouk_yVpTYS3AZZhCuo7DhOOgnj8kA",
    "mode": "list"
  },
  "sheetName": {
    "__rl": true,
    "value": 1827304897,  // Text Outputs sheet ID
    "mode": "list"
  },
  "columns": {
    "mappingMode": "defineBelow",
    "value": {
      "A": "={{ $json.module_number }}",
      "B": "={{ $json.module_summary }}",
      "C": "={{ JSON.stringify($json.learning_objectives) }}",
      "D": "={{ JSON.stringify($json.key_concepts) }}",
      "E": "={{ JSON.stringify($json.assessments) }}",
      "F": "={{ JSON.stringify($json.role_plays) }}",
      "G": "={{ $json.lms_upload }}",
      "H": "={{ JSON.stringify($json.professional_resources) }}"
    }
  },
  "options": {}
}
```

#### **Append to Audio Tab:**
```javascript
Node Type: n8n-nodes-base.googleSheets
typeVersion: 4
Operation: appendOrUpdate

Parameters:
{
  "documentId": {
    "__rl": true,
    "value": "1fK-4Bgq9ju1jV2ouk_yVpTYS3AZZhCuo7DhOOgnj8kA",
    "mode": "list"
  },
  "sheetName": {
    "__rl": true,
    "value": "[Audio_Sheet_ID]",  // Get this from your sheets
    "mode": "list"
  },
  "columns": {
    "mappingMode": "defineBelow",
    "value": {
      "A": "={{ $json.slide_id }}",
      "B": "={{ $json.parsed_slide_content }}",
      "C": "={{ $json.voiceover_script }}",
      "D": ""  // Empty - filled by Audio Generator
    }
  },
  "options": {}
}
```

---

## 📋 CORRECTED WORKFLOW IMPLEMENTATION ORDER

### **Phase 1: Complete Basic Flow (What You Have)**
1. ✅ Google Sheets Trigger (working)
2. ✅ Anthropic Parse (working)
3. ✅ Code Extract Modules (working)
4. ✅ Perplexity Enhanced Research (working)
5. ✅ Code 2nd Extraction (working)

### **Phase 2: Add Concurrent Processing**
6. ⏳ **Code: Split to Streams** (NEW)
   ```javascript
   // Output 1: For slides
   // Output 2: For assessments
   ```

7. ⏳ **HTTP Request: Gemini Slides Generation** (NEW)
   - Use Gemini API directly
   - Generate 12 slides per module

8. ⏳ **Anthropic: Assessments & Role Plays** (NEW)
   - Already have the node type
   - Generate Miller's Pyramid assessments

9. ⏳ **Code: Merge Streams** (UPDATE EXISTING)
   - Already have this node
   - Ensure it waits for both streams

### **Phase 3: Add Sheets Population**
10. ⏳ **Code: Parse Slides** (UPDATE EXISTING)
    - Already have this node
    - Ensure 12 slides output

11. ⏳ **Google Sheets: Populate Text Outputs** (NEW)
    - Operation: append or update
    - Row = module_number + 2

12. ⏳ **Google Sheets: Populate Audio Tab** (NEW)
    - Operation: append
    - 12 rows per module

13. ✅ **HTTP Request: Knowledge Lake** (working)

---

## 🔑 KEY DIFFERENCES FROM MY PREVIOUS DESIGN

### **What I Got Wrong:**
1. ❌ Assumed dedicated Gemini node → Use HTTP Request instead
2. ❌ Assumed Split in Batches node → Use Code with `runOnceForEachItem`
3. ❌ Assumed IF node → Use Code with conditional logic
4. ❌ Assumed specific Merge node → Use Code node

### **What You Actually Use:**
1. ✅ **Anthropic LangChain node** - `@n8n/n8n-nodes-langchain.anthropic`
2. ✅ **Perplexity node** - `n8n-nodes-base.perplexity`
3. ✅ **Code nodes** - For all logic, parsing, merging
4. ✅ **HTTP Request** - For Gemini, Knowledge Lake, any API
5. ✅ **Google Sheets** - For triggers and writes

---

## 🚀 IMPLEMENTATION PLAN (CORRECT VERSION)

### **Step 1: Add Gemini Slides via HTTP Request**
```javascript
// After 2nd Extraction
HTTP Request node:
- URL: Gemini API endpoint
- Body: Prompt with module data
- Parse response to extract slides
```

### **Step 2: Add Concurrent Anthropic Assessments**
```javascript
// Parallel to Gemini
Anthropic node:
- Same input as Gemini
- Generate assessments + role plays
```

### **Step 3: Update Merge Node**
```javascript
// Already exists, update to handle new structure
Code node:
- Wait for Gemini output
- Wait for Anthropic output
- Combine by module_number
```

### **Step 4: Add Google Sheets Writes**
```javascript
// Two Google Sheets nodes
1. Text Outputs append
2. Audio tab append (12 rows per module)
```

---

## ✅ TESTING CHECKLIST

Before implementing:
1. ✅ Verify Gemini API key in n8n credentials
2. ✅ Test HTTP Request to Gemini with sample data
3. ✅ Confirm Google Sheets has correct sheet IDs
4. ✅ Test with 1 module first
5. ✅ Check `runOnceForEachItem` mode for looping

---

*Corrected by: Claude Code (Reality-Based)*
*Date: 2025-10-02*
*Status: READY FOR IMPLEMENTATION*

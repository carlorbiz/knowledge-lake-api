# 🚨 EMERGENCY FIX: Complete collectAllSourceMaterials_ Replacement

## The Problem
Your `collectAllSourceMaterials_` function is **incomplete and missing its return statement**, causing it to return `undefined` and triggering the TypeError at line `if (srcPack.errors.length)`.

## The Fix
Replace the entire broken function and related helper functions with the complete working version below.

## Step-by-Step Deployment

### 1. Find and Delete the Broken Functions
In your Google Apps Script, find and **DELETE** these broken functions entirely:

- **Line ~1916:** `function collectAllSourceMaterials_(arg){` until its closing brace `}`
- **Line ~1967:** `function readDriveFileText_(id){` until its closing brace `}`  
- **Line ~2024:** `function processOne_(label, val){` until its closing brace `}`

### 2. Replace with Complete Working Function
Copy and paste the **entire content** from `EMERGENCY-FIX-collectAllSourceMaterials.js` to replace the deleted functions.

### 3. Update Your generateCourseRecommendation Function
Find your `generateCourseRecommendation()` function and ensure it uses PDF processing. Around line where you have:

```javascript
// Multi-source pack WITH PDF support
const srcPack = collectAllSourceMaterials_(r);
```

Replace the Gemini call section with:

```javascript
// Call Gemini with PDFs (if available, otherwise fall back to regular call)
let rec;
if (srcPack.pdfFiles && srcPack.pdfFiles.length > 0 && typeof callGeminiWithPDFs === 'function') {
  rec = callGeminiWithPDFs(mappingPrompt, 7000, srcPack.pdfFiles);
} else {
  rec = callGemini(mappingPrompt, 7000);
}
```

## Why This Fixes the Error

1. **Complete Function:** The new function has proper structure and **always returns** the required object `{text, errors, sources, pdfFiles}`
2. **Proper Scoping:** All helper functions are now properly scoped inside the main function
3. **Error Handling:** Comprehensive try-catch blocks prevent undefined returns
4. **PDF Support:** Native Gemini PDF processing without conversion errors

## Test After Deployment

1. Open your Mapping sheet
2. Select a row with course data
3. Run "Generate Course Recommendation"
4. The TypeError should be completely resolved
5. PDFs should process without Adobe namespace errors

## What Was Wrong

Your original function looked like this:
```javascript
function collectAllSourceMaterials_(arg){
  // ... some code ...
  const sources = [];
  
  function push(label, t){
    if (t && String(t).trim()) parts.push(`\n\n===== SOURCE: ${label} =====\n${String(t).trim()}`);
  }
} // ← FUNCTION ENDED HERE WITH NO RETURN!

// Then these functions were OUTSIDE but referenced internal variables:
function readDriveFileText_(id){
  // ... references 'sources', 'errors', 'pdfFiles' that don't exist here
}
```

The fixed version keeps everything properly scoped and **always returns the expected object structure**.
/**
 * SAFE HYBRID UPGRADE: extractModuleNames_ Function
 * 
 * This combines the SUPERIOR parsing logic from the older version
 * with the current script's architecture to avoid conflicts.
 * 
 * WHAT THIS FIXES:
 * - Superior regex pattern with better section stoppers
 * - Enhanced dash handling for module names  
 * - Two-stage processing (specific then greedy fallback)
 * - Better bullet and numbering recognition
 * 
 * WHAT THIS PRESERVES:
 * - Current script's function interface
 * - Existing architecture and dependencies
 * - Current error handling patterns
 */

function extractModuleNames_(text){
  const src = String(text || '');

  // UPGRADED: Superior older regex with better section stoppers and dash handling
  const blockMatch = src.match(/RECOMMENDED MODULES\s*:?\s*([\s\S]*?)(?:\n{1,2}(?:COURSE STRUCTURE RATIONALE|MICRO[-–— ]CREDENTIALING VALUE|COURSE RATIONALE|ADDITIONAL RECOMMENDED SOURCES|ASSESSMENTS?|REFERENCES|SOURCES)\b|$)/i);
  const block = blockMatch ? blockMatch[1] : src;

  // PRESERVED: Current line processing approach
  const lines = block
    .replace(/\r/g,'')
    .split('\n')
    .map(l => l.replace(/\*\*/g,'').trim())
    .filter(Boolean);

  const names = [];
  const seen = new Set();

  // UPGRADED: Superior older pushName function with better dash handling
  function pushName(raw){
    if (!raw) return;
    let name = String(raw).trim();

    // SUPERIOR: Better dash handling from older version
    const dashIdx = name.search(/\s[-–—]\s/);
    if (dashIdx > 0) name = name.slice(0, dashIdx);

    // SUPERIOR: Better prefix/suffix cleaning from older version
    name = name.replace(/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:\s*)/i, '').trim();
    name = name.replace(/\s*[-–—:|]\s*$/, '').trim();

    // PRESERVED: Current deduplication logic but with case-insensitive check
    if (name && !seen.has(name.toLowerCase())) { 
      seen.add(name.toLowerCase()); 
      names.push(name); 
    }
  }

  // UPGRADED: Superior two-stage processing from older version
  // Stage 1: Primary - numbered/bulleted lines (more specific)
  lines.forEach(function(l){
    if (/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:)/i.test(l)) {
      pushName(l);
    }
  });

  // Stage 2: Greedy capture if nothing found (fallback)
  if (!names.length){
    lines.forEach(function(l){
      const m = l.match(/^[A-Z].{4,120}$/);
      if (m) pushName(l);
    });
  }

  // PRESERVED: Current return pattern with sensible limits
  return names.slice(0,12);
}

/**
 * BONUS: Add the row-based functionality as separate function
 * This preserves the older workflow for users who prefer it
 */
function refreshModulesFromRecommendationByRow(){
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== 'Mapping') {
    return SpreadsheetApp.getUi().alert('Run on the Mapping tab.');
  }
  
  const r = sh.getActiveRange().getRow();
  if (r === 1) {
    return SpreadsheetApp.getUi().alert('Select a data row.');
  }

  const docUrl = sh.getRange(r,4).getValue();
  if (!docUrl) {
    return SpreadsheetApp.getUi().alert('No Recommendations Doc link in Column D.');
  }
  
  const docId = presIdFromUrl(docUrl) || extractIdFromUrl_(docUrl);
  if (!docId) {
    return SpreadsheetApp.getUi().alert('Could not extract Doc ID from Column D.');
  }

  let text = '';
  try { 
    text = DocumentApp.openById(docId).getBody().getText(); 
  } catch(e){
    return SpreadsheetApp.getUi().alert('Could not open the document: ' + e.message);
  }

  const names = extractModuleNames_(text);
  if (!names.length) {
    return SpreadsheetApp.getUi().alert('No module names detected. Check the numbering/format in the doc.');
  }

  // Populate both the combined column (G) and individual columns (H-S)
  sh.getRange(r,7).setValue(names.join('\n'));
  for (let i = 0; i < 12; i++){ 
    sh.getRange(r, 8 + i).setValue(names[i] || ''); 
  }
  
  SpreadsheetApp.getUi().alert('Module list refreshed from the Recommendation document.');
}

/*
DEPLOYMENT INSTRUCTIONS:

1. REPLACE the existing extractModuleNames_ function with the version above
   - This is SAFE because it preserves the current interface
   - It only upgrades the internal parsing logic

2. OPTIONALLY ADD the refreshModulesFromRecommendationByRow function
   - This gives you the older row-based workflow as an additional feature
   - You can add this to your menu system if desired

3. TEST with your current workflow
   - The existing refreshModulesFromRecommendation() function will automatically
     benefit from the superior parsing logic
   - No changes needed to existing code that calls extractModuleNames_

WHAT YOU GET:
✅ Superior module name extraction (older algorithm)
✅ Better section recognition and parsing
✅ Enhanced dash and bullet handling  
✅ Two-stage processing with greedy fallback
✅ Preserved current architecture and dependencies
✅ Optional row-based workflow for power users
✅ No breaking changes to existing functionality
*/
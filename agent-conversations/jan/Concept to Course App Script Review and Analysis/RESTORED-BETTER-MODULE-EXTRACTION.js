/**
 * RESTORED BETTER MODULE EXTRACTION FUNCTION
 * 
 * This is the superior earlier version that handles more cases
 * Replace your current extractModuleNames_ function with this one
 */

function extractModuleNames_(text){
  const src = String(text||'');

  // 1) Isolate the "RECOMMENDED MODULES" block up to next section heading
  const blockMatch = src.match(/RECOMMENDED MODULES\s*:?\s*([\s\S]*?)(?:\n{1,2}(?:COURSE STRUCTURE RATIONALE|MICRO[-–— ]CREDENTIALING VALUE|COURSE RATIONALE|ADDITIONAL RECOMMENDED SOURCES|ASSESSMENTS?|REFERENCES|SOURCES)\b|$)/i);
  const block = blockMatch ? blockMatch[1] : src;

  // 2) Split into lines and normalise markdown/bullets
  const lines = block
    .replace(/\r/g,'')
    .split('\n')
    .map(l => l.replace(/\*\*/g,'').trim())
    .filter(Boolean);

  const names = [];
  const seen = new Set();

  function pushName(raw){
    if (!raw) return;
    let name = String(raw).trim();

    // Handle dash separators (extract text before dash)
    const dashIdx = name.search(/\s[-–—]\s/);
    if (dashIdx > 0) name = name.slice(0, dashIdx);

    // Remove bullets, numbers, "Module X:" prefixes
    name = name.replace(/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:\s*)/i, '').trim();
    
    // Remove trailing punctuation
    name = name.replace(/\s*[-–—:|]\s*$/, '').trim();

    if (name && !seen.has(name)) { 
      seen.add(name); 
      names.push(name); 
    }
  }

  // 3) Primary: numbered / bulleted lines
  lines.forEach(function(l){
    if (/^(?:\d+[\.\)]\s*|[-•*]\s*|Module\s*\d+\s*:)/i.test(l)) {
      pushName(l);
    }
  });

  // 4) Greedy capture if nothing found - look for any reasonable module-like lines
  if (!names.length){
    lines.forEach(function(l){
      const m = l.match(/^[A-Z].{4,120}$/);
      if (m) pushName(l);
    });
  }

  // Log results for debugging
  Logger.log(`Module extraction: Found ${names.length} modules in text of ${src.length} characters`);
  if (names.length) {
    Logger.log(`Modules: ${names.join(', ')}`);
  } else {
    Logger.log('No modules found. Block extracted: ' + (blockMatch ? 'YES' : 'NO'));
    Logger.log('First 500 chars of text: ' + src.slice(0, 500));
  }

  return names.slice(0,12);
}

/**
 * DEPLOYMENT:
 * 1. Find your current extractModuleNames_ function in the script
 * 2. Replace it entirely with this version
 * 3. Test the refreshModulesFromRecommendation function
 * 4. Should now detect modules from your enhanced content
 */
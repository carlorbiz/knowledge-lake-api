/**
 * ENHANCED MODULE EXTRACTION FUNCTION
 * 
 * Problem: Current extractModuleNames_ function is too rigid for enhanced content
 * Solution: More flexible parsing that handles various high-quality formats
 */

// OPTIONAL: Replace your existing extractModuleNames_ function with this enhanced version
// that can handle multiple format variations while preserving the original functionality

function extractModuleNames_(text) {
  const src = String(text || '');
  if (!src.trim()) return [];

  // Try multiple patterns for module extraction
  
  // Pattern 1: Original "RECOMMENDED MODULES" section
  let blockMatch = src.match(/RECOMMENDED MODULES\s*:?\s*([\s\S]+?)(?:\n[A-Z ]{4,}\s*:|^\s*(?:ASSESSMENTS?|REFERENCES?|SOURCES|ADDITIONAL RECOMMENDED SOURCES)\b|$)/im);
  
  // Pattern 2: Alternative "MODULES" heading
  if (!blockMatch) {
    blockMatch = src.match(/(?:COURSE\s+)?MODULES\s*:?\s*([\s\S]+?)(?:\n[A-Z ]{4,}\s*:|^\s*(?:ASSESSMENTS?|REFERENCES?|SOURCES|ADDITIONAL RECOMMENDED SOURCES)\b|$)/im);
  }
  
  // Pattern 3: "CURRICULUM MODULES" or "TRAINING MODULES"
  if (!blockMatch) {
    blockMatch = src.match(/(?:CURRICULUM|TRAINING|EDUCATION)\s+MODULES\s*:?\s*([\s\S]+?)(?:\n[A-Z ]{4,}\s*:|^\s*(?:ASSESSMENTS?|REFERENCES?|SOURCES|ADDITIONAL RECOMMENDED SOURCES)\b|$)/im);
  }
  
  // Pattern 4: Look for numbered modules throughout document
  if (!blockMatch) {
    // Extract any "Module X:" patterns from the entire document
    const moduleMatches = src.match(/Module\s+\d+\s*[:.]?\s*([^\n]+)/gi);
    if (moduleMatches && moduleMatches.length > 0) {
      const names = [];
      moduleMatches.forEach(match => {
        const cleaned = match.replace(/Module\s+\d+\s*[:.]?\s*/i, '').trim();
        if (cleaned && !names.includes(cleaned)) {
          names.push(cleaned);
        }
      });
      return names;
    }
  }

  const block = blockMatch ? blockMatch[1] : '';
  if (!block.trim()) {
    Logger.log('No module block found in recommendation text');
    return [];
  }

  // Split lines and clean up
  const lines = block
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.replace(/\*\*/g, '').trim())
    .filter(Boolean);

  const names = [];
  const seen = new Set();

  function pushName(raw) {
    if (!raw || seen.has(raw)) return;
    
    // Clean up the module name
    let cleaned = raw
      .replace(/^[•\-\*\d\.\)\s]+/, '') // Remove bullets, numbers, etc.
      .replace(/Module\s+\d+\s*[:.]?\s*/i, '') // Remove "Module X:" prefix
      .trim();
    
    if (cleaned && cleaned.length > 3 && !seen.has(cleaned)) {
      seen.add(cleaned);
      names.push(cleaned);
    }
  }

  // Process each line
  lines.forEach(line => {
    // Skip section headers and short lines
    if (line.length < 4 || /^[A-Z\s]{4,}:?\s*$/.test(line)) return;
    
    // Handle various bullet formats
    if (/^[•\-\*\d\.\)\s]/.test(line)) {
      pushName(line);
    }
    // Handle lines that start with "Module"
    else if (/^Module\s+\d+/i.test(line)) {
      pushName(line);
    }
    // Handle other potential module lines
    else if (line.includes(':') && line.length < 100) {
      pushName(line);
    }
  });

  Logger.log(`Extracted ${names.length} modules: ${names.join(', ')}`);
  return names;
}

/**
 * DEPLOYMENT OPTIONS:
 * 
 * Option A (Recommended): Update the enhanced prompt with formatting requirements
 * Option B (Advanced): Replace extractModuleNames_ function with enhanced version above
 * Option C (Best): Do both - enhanced prompt + enhanced extraction function
 * 
 * The enhanced prompt should solve the immediate issue by ensuring proper formatting.
 * The enhanced extraction function provides backup compatibility for various formats.
 */
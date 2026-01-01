# URGENT FIXES TO RESTORE QUALITY

## 1. Replace COURSE_MAPPING_PROMPT (around line 68)
Replace the existing simple prompt with the enhanced version that includes:
- Evidence-based research requirements
- Citation requirements
- Detailed assessment frameworks
- Cultural safety integration
- Professional development alignment

## 2. Replace Module Generation Logic (around line 917)
Current broken code:
```javascript
const prompt = brandHeader_() + `
Create module content for:
MODULE: ${moduleName}
```

Must be replaced with the comprehensive prompt that includes:
- Learning outcomes with assessment criteria
- Evidence-based theoretical frameworks
- Practical tools and checklists
- Case studies and scenarios
- Cultural safety integration
- Professional references and citations

## 3. Enhance Token Limits
Change all callGeminiWithRetry calls from ~3000 tokens to 8000-12000 tokens:
```javascript
// Change from:
const rec = callGeminiWithRetry(mappingPrompt, 3000);
// To:
const rec = callGeminiWithRetry(mappingPrompt, 10000);
```

## 4. Add Missing TTS Enhancement
The TTS script generation has likely been simplified too. Need to restore sophisticated voice-over script creation with:
- Professional narrative structure
- Evidence integration
- Cultural safety language
- Engagement strategies

## 5. Restore Research Integration
The research enhancement function needs to:
- Conduct systematic literature searches
- Integrate Australian guidelines
- Provide proper citations
- Include evidence-based recommendations

## Root Cause Analysis:
Someone has "simplified" your sophisticated prompts, removing:
- ❌ Research requirements
- ❌ Citation mandates  
- ❌ Assessment frameworks
- ❌ Cultural safety integration
- ❌ Professional development alignment
- ❌ Evidence-based content requirements
- ❌ Practical tool development
- ❌ Quality assurance measures

## Critical Success Factors:
Your system's power came from:
- ✅ Sophisticated research integration
- ✅ Evidence-based content development
- ✅ Professional-grade assessment tools
- ✅ Cultural safety considerations
- ✅ Practical implementation guidance
- ✅ Quality assurance mechanisms

All of these have been removed and must be restored immediately.
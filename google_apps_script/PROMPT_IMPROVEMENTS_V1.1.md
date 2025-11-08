# Module Content Generator - Prompt Improvements v1.1
**Based on 9-Module Production Testing Feedback**

---

## Critical Issues to Fix

### 1. 🚨 TOPIC ACCURACY VALIDATION (HIGHEST PRIORITY)
**Problem:** Generated content doesn't match actual module topics
- Module 6 generated workforce planning instead of "Managing Critical Incidents and Near Misses"
- Apps Script not referencing correct module definitions

**Solution:**
- Add topic validation step BEFORE content generation
- Read Learning Objectives + Core Content Focus from Module Queue
- Cross-reference with module number
- Halt generation if topic mismatch detected
- Add explicit topic confirmation in all Gemini prompts

**Implementation:**
```javascript
// Add at start of generateModuleContent()
const topicValidation = `
CRITICAL TOPIC VALIDATION:
Module ${moduleNumber}: ${moduleTitle}
Core Content Focus: ${coreContent}
Learning Objectives: ${learningObjectives}

CONFIRM: This module is about "${coreContent}" NOT any other topic.
If the research summary seems to be about a different topic, STOP and indicate topic mismatch.
`;
```

---

### 2. 🎯 SIMPLIFIED ASSESSMENT FORMAT (HIGHEST PRIORITY)
**Problem:** Current format too complex for iSpring/Absorb implementation
- 10 MCQs + 3 role-plays + audio scripts = too elaborate
- Not compatible with actual LMS capabilities
- Implementation difficulty too high

**Solution:** Replace with EXACTLY 5 assessment types per module:

#### Assessment Type 1: Foundational Knowledge MCQ (Checkbox Style)
```markdown
**Question:** [Clear question testing basic knowledge]

- ☐ [Incorrect option]
- ☑ [Correct option]
- ☐ [Incorrect option]
- ☐ [Incorrect option]

**Rationale:** [Brief explanation]
```

#### Assessment Type 2: Most Important Factor (Colored Box Options)
```markdown
**Scenario:** [2-3 sentence realistic scenario]

**Question:** What is the MOST important factor/action/consideration?

**OPTION A:** [Description] (Color: Teal/Blue)
**OPTION B:** [Description] (Color: Blue - usually correct)
**OPTION C:** [Description] (Color: Orange)
**OPTION D:** [Description] (Color: Yellow)
**OPTION E:** [Description] (Color: Grey)

**Correct Answer: Option B** - [Justification]
```

#### Assessment Type 3: Correct Sequence (Ordering/Drag-Drop)
```markdown
**Question:** Place the following [process/steps] in the correct order:

**Step 1:** [First action]
**Step 2:** [Second action]
**Step 3:** [Third action]
**Step 4:** [Fourth action]
**Step 5:** [Fifth action]

[Learner drags into correct sequence]
```

#### Assessment Type 4: Match Items (Drag and Drop Matching)
```markdown
**Instructions:** Match each [concept/strategy] to its [purpose/description]:

- **[Item 1]** → DROP TARGET: [Matching description 1]
- **[Item 2]** → DROP TARGET: [Matching description 2]
- **[Item 3]** → DROP TARGET: [Matching description 3]
- **[Item 4]** → DROP TARGET: [Matching description 4]
```

#### Assessment Type 5: Scenario-Based MCQ (with Image Context)
```markdown
**Scenario:** [3-4 sentence detailed realistic scenario]

**Question:** [Specific question requiring knowledge application]

- ○ [Clearly incorrect]
- ○ [Plausible but incorrect]
- ● [Correct option with specific action]
- ○ [Another incorrect]

**Correct Answer:** [Correct option]
**Rationale:** [2-3 sentence explanation]
```

**Word Count Limits:**
- Question text: 30-50 words max
- Scenario descriptions: 40-80 words
- Options: 8-15 words each
- Rationales: 30-50 words
- Sequencing steps: 10-15 words each
- Matching items: 8-12 words each

---

### 3. 🇦🇺 AUSTRALIAN CONTEXT ENFORCEMENT
**Problem:** Generic international examples, missing Australian specifics

**Requirements:**
- ALWAYS Australian spelling (behaviour, recognise, organisation, practise as verb, centre, analyse)
- Reference: RACGP, ACRRM, GPSA, AHPRA, Department of Health
- Include NTCER 2025.2 clause references where relevant
- Use Australian practice examples (rural/remote, DPA, Section 19AB)
- Reference NSQHS Standards where applicable
- Include AGPT, RVTS, RGTS programs

**Add to ALL prompts:**
```
CRITICAL AUSTRALIAN CONTEXT:
- Australian English spelling ONLY
- Set all scenarios in Australian GP training practices
- Reference RACGP, ACRRM, AHPRA, GPSA standards
- Include NTCER 2025.2 requirements where relevant
- Use Australian healthcare examples and terminology
```

---

### 4. 🎤 AUDIO GLITCH FIX
**Problem:** TTS randomly reads "Slide Title:" or voice instructions

**Root Cause:** Gemini TTS interpreting prompt metadata as content

**Current Code (Audio_Tab_Enhanced.gs:696-726):**
```javascript
const requestBody = {
  "contents": [{
    "parts": [{
      "text": `${voicePrompt}\n\nSlide Title: ${slideTitle}\n\nVoiceover Script:\n${script}`
    }]
  }],
  ...
```

**Fix:** Remove "Slide Title:" label from TTS request
```javascript
const requestBody = {
  "contents": [{
    "parts": [{
      "text": `${voicePrompt}\n\n${script}`
    }]
  }],
  ...
```

The slide title is context for us but shouldn't be in the audio generation request.

---

## Module-Specific Assessment Focus

### Module 5 (Conflict Management)
- NTCER 2025.2 Clause 18 dispute resolution
- Early warning signs
- Prevention strategies
- GPSA expectation management

### Module 6 (Critical Incidents)
- Adverse events vs near misses vs critical incidents definitions
- DRS4DRS, RLO, EAP support protocols
- Factual documentation vs blame language
- RACGP/ACRRM reporting requirements
- Just culture principles

### Module 7 (Alternate Pathways)
- RVTS stay-in-place model
- ACRRM Independent Pathway
- RACGP FSP workplace-based assessment
- IMG AHPRA registration types
- Section 19AB Medicare restrictions
- RGTS consolidation into AGPT (2026)

### Module 8 (Cultural Diversity)
- Cultural awareness vs competence vs safety
- Aboriginal and Torres Strait Islander protocols
- Physical accessibility, interpreters, LGBTQIA+ inclusivity
- Policy development with reporting processes
- Inclusive workplace culture

### Module 9 (Medical Student Placements)
- Strategic benefits (recruitment pipeline)
- Logistics coordination with universities
- First-day orientation (IT, privacy, booking)
- Day-to-day management
- PIP Teaching and Training Incentive (HPOS claiming)

---

## Quality Control Checklist

Before generating content, verify:
- ☑ Module topic matches project knowledge definitions
- ☑ All 5 assessment types present
- ☑ Australian spelling throughout
- ☑ Scenarios in Australian GP training context
- ☑ Relevant Australian regulatory bodies referenced
- ☑ NTCER 2025.2 clauses where relevant
- ☑ Word counts within limits
- ☑ Clear single correct answers
- ☑ iSpring Suite Max compatible formats
- ☑ Appropriate for practice manager audience
- ☑ No clinical depth beyond practice management scope

---

## Removed Elements

**Do NOT Generate:**
- ❌ Complex JSON assessment structures
- ❌ 3-part elaborate role-play scenarios
- ❌ Separate audio script files
- ❌ More than 5 assessment types
- ❌ Clinical diagnosis case studies
- ❌ Generic international examples
- ❌ Video/advanced multimedia assessments
- ❌ Free-text response questions

---

## Implementation Priority

1. **CRITICAL:** Topic validation (prevents wrong content generation)
2. **CRITICAL:** Simplified 5-assessment format (iSpring compatibility)
3. **HIGH:** TTS glitch fix (no "Slide Title:" in audio)
4. **HIGH:** Australian context enforcement
5. **MEDIUM:** Word count limits
6. **MEDIUM:** Module-specific competency targeting

---

## Next Steps

1. Update `generateAssessments()` function completely
2. Add topic validation to `generateModuleContent()`
3. Update all prompts with Australian context requirements
4. Fix TTS audio generation in Audio_Tab_Enhanced.gs
5. Test with Module 6 regeneration
6. Update documentation
7. Release v1.1

---

**Document Version:** 1.0
**Date:** 2025-10-10
**Status:** Ready for implementation
**Developer:** Carlorbiz for GPSA/HPSA

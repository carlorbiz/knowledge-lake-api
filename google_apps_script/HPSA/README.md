# HPSA/GPSA Course Development Scripts
## Complete Hybrid AI-Assisted Course Creation Workflow

**Version:** 1.0 - HPSA Production Release
**Created:** October 2025
**Developer:** Carlorbiz for GPSA (General Practice Supervisors Australia)
**Client:** Healthcare Professionals Support Australia (HPSA)

---

## Overview

This folder contains the production-ready scripts and documentation for the **HPSA Concept-to-Course** workflow - a hybrid AI-assisted system that combines human quality control with AI automation to create professional Australian healthcare education modules.

## Key Features

✅ **Hybrid Quality Control**: Human-curated research with AI content generation
✅ **Australian English Enforcement**: Multi-level spelling verification
✅ **LMS-Ready Outputs**: Absorb LMS compatible formats
✅ **Audio Generation**: Gemini TTS with 30 professional voices
✅ **Complete Module Packages**: Slides, workbooks, assessments, case studies
✅ **Research Foundation**: Gems + NotebookLM integration for quality research

## Files in This Folder

### Scripts
- **`Audio_Tab_Enhanced.gs`** - Master Workbook script for audio generation and LMS upload creation
- **`Module_Content_Generator.gs`** - Module Queue script for content generation

### Reference
- **`ProvenLMSlayout.txt`** - Proven LMS upload format template
- **`README.md`** - This file

## Workflow Summary

1. **Module Queue** → Plan modules, conduct research (Gems/NotebookLM)
2. **Generate Content** → AI creates slides, LMS docs, workbooks, assessments
3. **Audio Tab** → Enhance content, generate professional voiceovers
4. **LMS Upload** → Create clean Absorb LMS upload documents
5. **Deploy** → Upload to LMS with audio files

## Key Innovations

### LMS Upload Generation
- Reads from Module tabs (Module 1, Module 2, etc.)
- Data sources (rows 2-13):
  * Column L: Slide Title
  * Column M: Content Points JSON (bullet points)
  * Column X: Slides JSON detailedContent (voiceover summaries)
- Matches ProvenLMSlayout.txt format exactly
- NO phonetic spellings (clean for LMS parsing)
- Saves to Column Y automatically

### Australian Spelling Enforcement
- 60+ US→AU replacements in `enforceAustralianSpelling()`
- Applied at multiple levels:
  - Gemini prompts (generation time)
  - Post-processing (verification)
  - LMS upload (final output)
- Instruction headers for Absorb LMS AI

### Research Foundation
- Gems for web-based research
- NotebookLM for Drive source analysis
- Citations stored separately (Column M) to avoid character limits
- Full research used for AI generation
- Array formulas in Module Content Complete preserve full text

## Installation

See parent folder documentation:
- `README.md` - Main setup guide
- `SCRIPT_PROPERTIES_SETUP.md` - Configuration
- `USER_GUIDE_QUICK_START.md` - Usage instructions

## Support

**Developer:** Carlorbiz
**Client:** GPSA/HPSA
**Purpose:** Australian healthcare education course development

---

## Version History

### v1.0 - HPSA Production (October 2025)
- LMS Upload generation from Module tabs
- Australian spelling enforcement
- ProvenLMSlayout.txt format matching
- Research foundation with Citations split
- Array formula integration for Module Content Complete
- Production-ready for HPSA deployment

---

**© 2025 Carlorbiz | Developed for GPSA/HPSA**

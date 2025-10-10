# PROJECT STRUCTURE - MEM0 COURSE GENERATION

## 📁 Current Active Files & Folders

### Google Apps Scripts (PRIMARY WORKFLOWS)
📂 **google_apps_script/**
- `Audio_Tab_Complete.gs` - Audio generation from slide content (Workflow 4)
- `Module_Content_Generator.gs` - Module content + assessments (Workflows 2 & 3)
- `USER_GUIDE_QUICK_START.md` - Quick start guide for audio workflow
- `CRITICAL_AUDIO_FIX.md` - Drive API v3 setup instructions
- `STATUS_WORKFLOW_GUIDE.md` - Status-based processing documentation
- `SCRIPT_PROPERTIES_SETUP.md` - Script Properties configuration
- `CONTENT_ENHANCEMENT_GUIDE.md` - Content enhancement workflow
- `CHANGELOG.md` - Version history and changes

**Status:** ✅ Active - Ready for production use

---

### Core Python Services
📂 **Root directory/**

**API Server:**
- `simple_api_server.py` - Knowledge Lake API server (Flask-based)
  - Endpoints: /course/create, /course/status, /knowledge/add
  - Port: 5002 (default)
  - Status: ✅ Active

**Dashboard:**
- `knowledge_lake_dashboard.py` - Streamlit monitoring dashboard
  - Port: 8501
  - Status: ✅ Active (running in background)

**Batch Scripts:**
- `start_simple_server.bat` - Start Knowledge Lake API
- `start_production.bat` - Production startup script

**Status:** ✅ Active - Core infrastructure

---

### Configuration Files
📂 **Root directory/**
- `.env` - Environment variables (API keys, ports)
- `requirements.txt` - Python dependencies
- `pyproject.toml` - Poetry configuration
- `poetry.lock` - Dependency lock file

**Status:** ✅ Active - Do not modify without backup

---

### Documentation
📂 **Root directory/**
- `carla-claude-conversations.txt` - Session continuity and context
- `README.md` - Project overview
- `README_PROJECT_STRUCTURE.md` - This file
- `LLM.md` - LLM integration documentation
- `API_notes.txt` - API endpoint notes
- `DEPLOY_TODAY.md` - Deployment checklist

**Status:** ✅ Active - Reference documentation

---

### Course Outputs
📂 **course_outputs/**
- Generated course content from Knowledge Lake
- Directory format: `course_YYYYMMDD_HHMMSS_HASH/`
- Contents: JSON files with module data

**Status:** ✅ Active - Preserves course history

---

### Archive (2025-10-07)
📂 **archive_n8n_workflows_2025-10-07/**
- Old n8n workflow files
- Python orchestrators
- Design documents
- Test files
- See `archive_n8n_workflows_2025-10-07/README_ARCHIVE.md` for details

**Status:** 🗄️ Archived - Reference only, safe to delete after 90 days

---

### Legacy Archives
📂 **archive/**
- Previous archival materials
- Historical reference

**Status:** 🗄️ Archived - Reference only

---

## 🎯 Current Workflow Architecture

### Module Content Generation (Workflows 2 & 3)
**Trigger:** Google Sheets "Module Queue" tab, Status = "Next"
**Process:** Module_Content_Generator.gs
**Output:**
- Module Content Complete sheet
- Text Outputs sheet
- Audio tab (12 slides populated)

**APIs Used:**
- Perplexity (research)
- Gemini (12 slides + LMS upload)
- Anthropic (workbook + assessments)

---

### Audio Generation (Workflow 4)
**Trigger:** Google Sheets "Audio" tab, Column R (Raw Content)
**Process:** Audio_Tab_Complete.gs
**Output:**
- Column B: Enhanced voiceover scripts
- Column C: Audio file URLs (WAV format)
- Column D: Image prompts (for manual use)

**APIs Used:**
- Gemini 2.5 Flash TTS (audio)
- Gemini 2.0 Flash (content enhancement)

---

## 🚀 Quick Start Commands

### Start Knowledge Lake API
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
python simple_api_server.py
```

### Start Dashboard
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
streamlit run knowledge_lake_dashboard.py --server.port 8501
```

### Start Claude Code
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0
claude-code
```

---

## 📊 Project Status

**Phase:** Production-ready Apps Script migration
**Date:** 2025-10-07
**Status:** ✅ Active development

**Completed:**
- ✅ Audio generation Apps Script
- ✅ Module content generation Apps Script
- ✅ Image generation removed (unreliable)
- ✅ Documentation complete
- ✅ Old n8n files archived

**Pending:**
- ⏳ Complete 12 modules for current course
- ⏳ Verify LMS uploads working
- ⏳ Presentation preparation

---

## 🔧 Maintenance Notes

**Backup Before Modifying:**
- `.env` (contains API keys)
- `simple_api_server.py`
- `knowledge_lake_dashboard.py`
- `google_apps_script/*.gs`

**Safe to Delete After 90 Days:**
- `archive_n8n_workflows_2025-10-07/` (if not referenced)

**Never Delete:**
- `course_outputs/` (course history)
- `.env` (active configuration)
- `carla-claude-conversations.txt` (session continuity)

---

## 📞 Support References

**Claude Code Session Continuity:**
- Read `carla-claude-conversations.txt` for context
- Contains full technical details and decisions

**API Documentation:**
- See `API_notes.txt` for endpoint details
- Check `.env` for current configuration

**Apps Script Setup:**
- See `google_apps_script/SCRIPT_PROPERTIES_SETUP.md`
- See `google_apps_script/CRITICAL_AUDIO_FIX.md`

---

*Last Updated: 2025-10-07 by Claude Code*
*Archive Created: 2025-10-07*

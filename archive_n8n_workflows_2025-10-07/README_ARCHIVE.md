# N8N WORKFLOWS ARCHIVE - 2025-10-07

## Purpose
This archive contains outdated n8n workflow files from the development phase. These files were replaced by Google Apps Script solutions for better reliability and user control.

## What Was Replaced

### Workflow 2 & 3: Module Content + Assessments
**Old:** Complex n8n workflows with Python orchestrators
**New:** `Module_Content_Generator.gs` - Single Apps Script

### Workflow 4: Audio Generation
**Old:** n8n workflow with webhook triggers
**New:** `Audio_Tab_Complete.gs` - Single Apps Script

## Why Archived

1. **Image Generation Issues** - Imagen API created nonsensical text in images
2. **Complexity** - n8n workflows required multiple orchestrators and webhook handlers
3. **Debugging Difficulty** - Hard to troubleshoot multi-node workflows
4. **User Control** - Apps Script gives direct visibility into Google Sheets
5. **Reliability** - Google Apps Script more stable for this use case

## Future Use

These files may be revisited for:
- **Glide UI integration** instead of Google Forms
- **Alternative workflow orchestration** if Apps Script limitations emerge
- **Reference implementations** for multi-AI orchestration patterns

## Files Archived

### Python Orchestrators
- workflow_generator.py
- agent_builder.py
- module_generator_agent.py
- audio_generator_agent.py
- workflow_fixer.py
- phoenix_orchestrator.py
- phoenix_architect_agent.py
- phoenix_webhook_orchestrator.py
- phoenix_orchestrator_fixed.py
- module_generator_webhook.py
- audio_generator_webhook.py
- fix_anthropic_nodes.py

### N8N Workflow JSONs
- n8n_audio_generator_config.json
- corrected_audio_workflow_nodes.json
- audio_workflow_test_data.json
- ai_brain_workflow.json
- monolithic_workflow.json
- monolithic_workflow_fixed.json
- monolithic_workflow_complete.json
- COMPLETE_GAMMA_N8N_WORKFLOW.json
- Module_Generator_Agent_workflow.json

### Design Documents
- PRIORITY_2_3_IMPLEMENTATION_PLAN.md
- BULLETPROOF_WORKLOAD_DISTRIBUTION.md
- STANDALONE_WORKFLOWS_DESIGN.md
- MODIFIED_EXISTING_WORKFLOWS.md
- GAMMA_URL_FIX_WORKFLOW.md
- HYBRID_WORKFLOW_ARCHITECTURE.md
- Phoenix_Enhanced_Workflow_Design.md
- Phoenix_Simplified_Workflow_n8n.md
- Phoenix_Setup_Instructions.md
- Phoenix_Notion_Workflow_n8n.md
- Phoenix_Notion_Setup_Instructions.md
- Phoenix_Module_Creation_Workflow_n8n.md
- MODULE_GENERATOR_WORKFLOW_STATUS.md

### Test/Debug Files
- sort_newest_code_fixed.js
- monolithic_output_for_revision.txt
- complete_pipeline_roadmap.md
- workflow_activation_checklist.md
- test_ai_brain.py
- test_workflow.py
- workflow_debugger.py
- test_premium_system.py

### Old Apps Script Versions
- apps_script_deployment_guide.md
- complete_audio_generator.gs
- clean_audio_generator.gs
- australian_healthcare_tts_final.gs

## Current Active Files

**Google Apps Scripts:**
- `../google_apps_script/Audio_Tab_Complete.gs` - Audio generation (Workflow 4)
- `../google_apps_script/Module_Content_Generator.gs` - Module content + assessments (Workflows 2 & 3)

**Documentation:**
- `../google_apps_script/USER_GUIDE_QUICK_START.md`
- `../google_apps_script/CRITICAL_AUDIO_FIX.md`
- `../google_apps_script/STATUS_WORKFLOW_GUIDE.md`
- `../google_apps_script/SCRIPT_PROPERTIES_SETUP.md`

**Active Development:**
- `../simple_api_server.py` - Knowledge Lake API
- `../knowledge_lake_dashboard.py` - Streamlit dashboard
- `../carla-claude-conversations.txt` - Session continuity

## Archive Date
2025-10-07

## Archived By
Claude Code (autonomous cleanup)

## Status
**Safe to delete after 90 days** if not needed for reference

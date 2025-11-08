# AAE (AI Automation Ecosystem) Master Documentation

**Last Updated:** 2025-11-08

## Overview

This folder contains all documentation related to Carla's AI Automation Ecosystem (AAE) - the coordination layer for multiple AI agents, memory systems, and automation workflows.

## Current Status

**VibeSDK Integration:** LIVE at https://vibe.mtmot.com
- Memory API via Mem0 (Railway)
- Knowledge Lake API (Railway)
- Cross-agent coordination
- N8N workflow orchestration

**Active Agents:**
- Manus (Slack orchestrator, DocsAutomator, MCP access)
- Fred (ChatGPT)
- Claude (Claude Code, Claude GUI)
- Gemini, Grok, Notebook LM, others

## Folder Structure

### `/agent-constitution`
- **V1.0** - Current agent constitution (Nov 4, 2025)
- `/archive` - Previous versions

### `/agent-perspectives`
Agent-specific architectural reviews and recommendations:
- Claude GUI, Fredo, Penny, Fred, Manus perspectives

### `/architecture`
Core architecture documents:
- BREAKTHROUGH_AAE_ARCHITECTURE_2025-11-03.md (Latest breakthrough)
- `/state-documents` - Master state documents

### `/session-notes`
Organized by date. Contains session-specific planning:
- `/2025-11-03` - November 3 breakthrough session

### `/implementation`
Implementation guides and solutions:
- Agent Knowledge Lake access
- Agent solutions summary
- Implementation roadmaps

### `/integration`
Integration documentation:
- VibeSDK N8N API integration (future)

## Key Integrations

**Mem0 Memory API:**
- URL: https://web-production-e3e44.up.railway.app
- Cross-agent memory sharing
- User preference tracking

**Knowledge Lake API:**
- URL: https://knowledge-lake-api-production.up.railway.app
- AI Brain for course generation
- Context retrieval for agents

**VibeSDK:**
- URL: https://vibe.mtmot.com
- Web interface for agent coordination
- REST API for N8N/Zapier integration

## Next Steps

See `/implementation` for current roadmap and priorities.

## For Manus

Manus: You have GitHub access to this entire repository. The `cc-slack-integration/` and `carlorbiz-strategic-tool/` folders in the root directory are ready for your review.

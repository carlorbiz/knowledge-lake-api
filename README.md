# Mem0 AI Automation Ecosystem

**Last Updated:** 2025-11-08
**Purpose:** Carla's integrated AI automation platform with Mem0 memory layer, Knowledge Lake API, and multi-agent coordination

---

## 🏗️ Repository Structure (Reorganized 2025-11-08)

### 📁 Core Infrastructure (Root Directory)

**Knowledge Lake API** (deployed to Railway):
- `api_server.py` - Main Knowledge Lake Flask API
- `start_knowledge_lake.py` - Production server (Waitress, port 5002)
- `knowledge_lake_dashboard.py` - Dashboard interface
- `enhanced_knowledge_lake_api.py` - Enhanced API features
- `simple_api_server.py` - Simplified API server
- `course_outputs/` - Course generation output directory

**Mem0 Library** (deployed to Railway):
- `mem0/` - Core mem0 AI memory library
- `embedchain/` - Legacy embedchain RAG framework
- `tests/`, `docs/`, `examples/`, `cookbooks/` - Library components

**Utility Scripts:**
- `check_github_repo.py`, `gemini_receiver.py`, `test_env.py`

---

### 📂 Organized Project Folders

#### `/AAE-master` - AI Automation Ecosystem Documentation
Complete AAE architecture, agent coordination, and integration documentation.
- `/agent-constitution` - Agent behavior guidelines (V1.0 current)
- `/agent-perspectives` - Agent-specific architectural reviews
- `/architecture` - Core architecture and state documents
- `/session-notes` - Date-organized planning sessions
- `/implementation` - Implementation guides and solutions
- `/integration` - VibeSDK and external integrations

[See AAE-master/README.md](AAE-master/README.md)

#### `/github-projects` - Active Development Projects
Self-contained projects with their own deployments.
- `/executive-ai-advisor` - Executive AI advisor application
- `/carlorbiz-strategic-tool` - Strategic planning tool

**Note:** `cc-slack-integration/` remains in root for Manus review.

[See github-projects/README.md](github-projects/README.md)

#### `/consulting` - Client Projects
- `/acrrm/resources` - ACRRM consulting project resources

[See consulting/acrrm/README.md](consulting/acrrm/README.md)

#### `/n8n-workflows` - Automation Workflows
- `/active` - Current n8n workflow definitions
- `/archive` - Archived workflows

[See n8n-workflows/README.md](n8n-workflows/README.md)

#### `/deployment` - Deployment Documentation & Scripts
- `/current` - Active deployment guides
- `/archive` - Historical deployment docs
- `/scripts` - Batch files and deployment scripts

[See deployment/README.md](deployment/README.md)

#### `/documentation` - Project Documentation
- `/quick-references` - Quick reference guides
- `/session-notes` - Session-specific documentation

[See documentation/README.md](documentation/README.md)

#### `/conversations` - Conversation Logs
- `/agent-conversations` - Agent-specific conversations
- `/exports` - Conversation exports (current + archive)

[See conversations/README.md](conversations/README.md)

#### Existing Folders (Unchanged)
- `/databases` - Notion database exports
- `/archive` - General archive
- `/google_apps_script`, `/mcp_servers`, `/knowledge-lake`, etc.

---

## 🚀 Active Deployments

### Mem0 Memory API
- **URL:** https://web-production-e3e44.up.railway.app
- **Platform:** Railway
- **Source:** `/mem0` directory
- **Purpose:** Cross-agent memory sharing

### Knowledge Lake API
- **URL:** https://knowledge-lake-api-production.up.railway.app
- **Platform:** Railway
- **Source:** Root directory
- **Purpose:** AI Brain for course generation, context retrieval

### VibeSDK AAE Dashboard
- **URL:** https://vibe.mtmot.com
- **Platform:** Cloudflare/Railway
- **Features:** Memory API, Knowledge Lake integration, REST API for N8N/Zapier
- **Docs:** See `/AAE-master/integration/`

---

## 🤖 Active AI Agents

- **Manus** - Slack orchestrator, DocsAutomator, full MCP access
- **Fred** - ChatGPT integration
- **Claude** - Claude Code, Claude GUI
- **Others** - Gemini, Grok, Notebook LM, Pete, Penny, Colin, Callum

---

## 💾 Backup & Sync

- **Google Drive Backup:** Automated via rclone (daily)
- **Backup Log:** `C:\Users\carlo\backup-log.txt`
- **Notion Sync:** Manual exports + n8n automation (in development)
- **GitHub:** Primary source of truth for AI-accessible data

---

## 📋 Development Commands

See [CLAUDE.md](CLAUDE.md) for complete development workflow and commands.

**Quick Start:**
```bash
# Install environment
make install

# Start Knowledge Lake API
python start_knowledge_lake.py

# Run tests
make test

# Format code
make format
```

---

## 📝 For Manus

Manus: You have GitHub access to this repository.

**For Your Review:**
- `/cc-slack-integration/` (root) - Slack integration system
- All reorganized folders are now accessible via GitHub

**API Access:**
- Mem0 API: Via your MCP Docker integration
- Knowledge Lake API: https://knowledge-lake-api-production.up.railway.app

---

## 📚 Additional Documentation

- [CLAUDE.md](CLAUDE.md) - Instructions for Claude Code
- [README_PROJECT_STRUCTURE.md](README_PROJECT_STRUCTURE.md) - Detailed project structure
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [FILE_MANIFEST_2025-11-08.md](FILE_MANIFEST_2025-11-08.md) - Reorganization manifest

---

**Reorganized:** 2025-11-08
**Previous Structure:** See [FILE_MANIFEST_2025-11-08.md](FILE_MANIFEST_2025-11-08.md) for file move tracking

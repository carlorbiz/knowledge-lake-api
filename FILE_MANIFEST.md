# Mem0 AI Automation Ecosystem - File Manifest

**Last Updated:** January 17, 2025
**Purpose:** Complete directory structure and file inventory for Carla's AAE

---

## 📂 GitHub Projects Directory

Location: `C:\Users\carlo\Development\mem0-sync\mem0\github-projects\`

### Active Projects

#### 1. `/voice-to-drive` ✅ PRODUCTION
**Status:** Production Ready (v2.0 - Whisper AI)
**Deployment:** https://voice-to-drive.pages.dev
**Platform:** Cloudflare Pages + Workers
**Purpose:** Hands-free PWA for voice recording while driving with AI transcription

**Key Files:**
```
voice-to-drive/
├── src/
│   ├── App.jsx                         # Main application + control panel
│   ├── services/
│   │   ├── vad.js                      # Voice Activity Detection
│   │   ├── recorder.js                 # Audio recording service
│   │   ├── storage.js                  # IndexedDB operations (v2 schema)
│   │   ├── syncManager.js              # Sync orchestration (no auto-delete)
│   │   ├── driveApi.js                 # Google Drive upload
│   │   └── transcription.js            # Whisper AI client
│   └── components/
│       ├── SessionControl.jsx          # Start/End session UI
│       └── StatusIndicator.jsx         # Recording status display
├── workers/
│   ├── transcribe-audio.js             # Cloudflare Worker (Whisper)
│   └── wrangler.toml                   # Worker configuration
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service worker
│   └── vad/                            # VAD WASM files (25 files, 60MB+)
├── dist/                               # Build output (deployed)
├── node_modules/                       # Dependencies
├── .env                                # Local environment variables
├── package.json                        # Project dependencies
├── vite.config.js                      # Vite configuration
├── README.md                           # ✨ Updated (Jan 17, 2025)
├── PROJECT_STATUS_2025-01-17.md        # ✨ NEW - Current status
├── PROJECT_STATUS_2025-01-16.md        # Phase 2 completion
├── PROJECT_STATUS_2025-01-15.md        # Phase 1 completion
├── PHASE2_DEPLOYMENT.md                # Whisper integration docs
├── MOBILE_READY_GUIDE.md               # User guide for mobile
├── SUPABASE_MIGRATION_PLAN.md          # Future migration strategy
├── EMERGENCY_EXPORT.md                 # Console export script
└── RECOVERY_SCRIPT.md                  # Data recovery procedures
```

**Recent Changes (Jan 16-17, 2025):**
- Fixed database schema upgrade bug (storage.js)
- Disabled auto-deletion after sync (syncManager.js)
- Added always-visible control panel (App.jsx)
- Added Clear DB button
- Comprehensive documentation updates

**Environment Variables:**
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth
- `VITE_GOOGLE_API_KEY` - Google Drive API
- `VITE_TRANSCRIPTION_WORKER_URL` - Whisper Worker URL

**Deployment Commands:**
```bash
npm run build
wsl wrangler pages deploy dist --project-name=voice-to-drive
```

#### 2. `/executive-ai-advisor` (Formerly Vera AI Advisor)
**Status:** Active Development (Rebranded to Aurelia)
**Deployment:** Cloudflare Pages
**Purpose:** AI-powered executive advisory dashboard

**Key Files:**
```
executive-ai-advisor/
├── src/
├── public/
├── workers/
├── README.md
└── package.json
```

#### 3. `/carlorbiz-strategic-tool`
**Status:** Active Development
**Purpose:** Strategic planning and analysis tool

#### 4. `/aae-dashboard`
**Status:** Planning/Early Development
**Purpose:** AI Automation Ecosystem central dashboard

#### 5. `/mtmot-vibesdk-production`
**Status:** Production
**Purpose:** VibeSDK integration and production deployment

**Key Files:**
```
mtmot-vibesdk-production/
├── .github/workflows/          # CI/CD workflows
├── src/
├── workers/
└── wrangler.toml
```

---

## 📁 Root Directory Structure

Location: `C:\Users\carlo\Development\mem0-sync\mem0\`

### Core Components

#### Knowledge Lake API
```
api_server.py                   # Main Knowledge Lake Flask API
start_knowledge_lake.py         # Production server (Waitress, port 5002)
knowledge_lake_dashboard.py     # Dashboard interface
enhanced_knowledge_lake_api.py  # Enhanced API features
simple_api_server.py            # Simplified API server
course_outputs/                 # Course generation outputs
```

**Deployment:** https://knowledge-lake-api-production.up.railway.app

#### Mem0 Library
```
mem0/                           # Core mem0 AI memory library
embedchain/                     # Legacy embedchain RAG framework
tests/                          # Test suites
docs/                           # Documentation
examples/                       # Example implementations
cookbooks/                      # Usage cookbooks
```

**Deployment:** https://web-production-e3e44.up.railway.app

---

## 📂 Organized Directories

### `/AAE-master` - AI Automation Ecosystem Documentation
**Purpose:** Complete AAE architecture, agent coordination, integration docs

```
AAE-master/
├── agent-constitution/         # Agent behavior guidelines (V1.0)
│   └── V1.0/
├── agent-perspectives/         # Agent-specific architectural reviews
├── architecture/               # Core architecture and state documents
├── session-notes/              # Date-organized planning sessions
├── implementation/             # Implementation guides and solutions
├── integration/                # VibeSDK and external integrations
└── README.md
```

### `/github-projects` - Active Development Projects
**Purpose:** Self-contained projects with their own deployments

```
github-projects/
├── voice-to-drive/             # ✨ Production PWA (v2.0 Whisper AI)
├── executive-ai-advisor/       # Executive dashboard
├── carlorbiz-strategic-tool/   # Strategic planning tool
├── aae-dashboard/              # AAE central dashboard
├── mtmot-vibesdk-production/   # VibeSDK production
└── README.md                   # ✨ Needs update with voice-to-drive
```

### `/consulting` - Client Projects
```
consulting/
├── acrrm/
│   ├── resources/
│   └── README.md
└── README.md
```

### `/n8n-workflows` - Automation Workflows
```
n8n-workflows/
├── active/                     # Current workflow definitions
│   ├── notion-sync/
│   ├── github-integration/
│   └── ai-agent-triggers/
├── archive/                    # Archived workflows
└── README.md
```

### `/deployment` - Deployment Documentation & Scripts
```
deployment/
├── current/                    # Active deployment guides
├── archive/                    # Historical deployment docs
├── scripts/                    # Batch files and deployment scripts
└── README.md
```

### `/documentation` - Project Documentation
```
documentation/
├── quick-references/           # Quick reference guides
├── session-notes/              # Session-specific documentation
└── README.md
```

### `/conversations` - Conversation Logs
```
conversations/
├── agent-conversations/        # Agent-specific conversations
│   ├── claude/
│   ├── fred/
│   ├── colin/
│   └── manus/
├── exports/                    # Conversation exports
│   ├── current/
│   └── archive/
└── README.md
```

### `/databases` - Notion Database Exports
```
databases/
├── master-ai-system/
├── courses-education/
├── ai-prompts/
├── secrets/
└── README.md
```

### `/mcp_servers` - MCP Server Implementations
```
mcp_servers/
├── manus-mcp/                  # Manus task manager
│   ├── manus_server.py
│   └── README.md
└── mcp-ai-orchestration/       # AI agent orchestration
    ├── dist/index.js
    └── README.md
```

### Other Directories
```
archive/                        # General archive
google_apps_script/             # Google Apps Script projects
knowledge-lake/                 # Knowledge Lake utilities
cc-slack-integration/           # Claude Code Slack integration (root - for Manus review)
```

---

## 🔧 Configuration Files (Root)

### Environment & Config
```
.env                            # Environment variables
.env.example                    # Example environment file
.gitignore                      # Git ignore patterns
.dockerignore                   # Docker ignore patterns
.python-version                 # Python version specification
```

### Build & Dependencies
```
pyproject.toml                  # Python project configuration
Makefile                        # Build automation
package.json                    # Node.js dependencies (if any)
requirements.txt                # Python dependencies
hatch.toml                      # Hatch build system config
```

### VSCode & Development
```
.vscode/
├── mcp.json                    # ✨ Updated MCP server config (Jan 2025)
│                               # - manus-task-manager (Python)
│                               # - ai-orchestration (Node.js)
└── settings.json               # VSCode settings
```

### Documentation (Root)
```
README.md                       # Main repository README
CLAUDE.md                       # ✨ Updated Claude Code instructions (Jan 2025)
                                # - Added MCP server configuration section
                                # - Added voice-to-drive project details
                                # - Updated activation troubleshooting
CHANGELOG.md                    # Change log
API_notes.txt                   # API keys and integration configs
DEPLOY_TODAY.md                 # AI Brain deployment guide
```

---

## 📊 Project Status Summary

### Production Deployments
| Project | Platform | URL | Status | Updated |
|---------|----------|-----|--------|---------|
| Voice to Drive | Cloudflare Pages | https://voice-to-drive.pages.dev | ✅ Live | Jan 17, 2025 |
| Whisper Worker | Cloudflare Workers | https://voice-transcribe.carla-c8b.workers.dev | ✅ Live | Jan 16, 2025 |
| Knowledge Lake API | Railway | https://knowledge-lake-api-production.up.railway.app | ✅ Live | - |
| Mem0 Memory API | Railway | https://web-production-e3e44.up.railway.app | ✅ Live | - |
| VibeSDK Production | Cloudflare | - | ✅ Live | - |

### Active Development
| Project | Status | Next Milestone |
|---------|--------|----------------|
| Voice to Drive | Production Ready | Supabase migration (Q1 2025) |
| Executive AI Advisor | Development | Feature completion |
| AAE Dashboard | Planning | Initial implementation |
| Strategic Tool | Development | Beta release |

---

## 🚀 Recent Updates (January 2025)

### Voice to Drive (Jan 16-17, 2025)
- ✅ Fixed database schema upgrade bug
- ✅ Disabled premature recording deletion
- ✅ Added always-visible control panel
- ✅ Comprehensive documentation update
- ✅ Production deployment (v2.0)

### MCP Server Configuration (January 2025)
- ✅ Configured `manus-task-manager` (Python MCP)
- ✅ Configured `ai-orchestration` (Node.js MCP)
- ✅ Updated `.vscode/mcp.json`
- ✅ Updated `CLAUDE.md` with activation guide

### AAE Documentation (November 2024 - January 2025)
- ✅ Reorganized repository structure
- ✅ Agent constitution V1.0
- ✅ Architecture documentation
- ✅ Session notes organization

---

## 📝 File Naming Conventions

### Project Status Files
```
PROJECT_STATUS_YYYY-MM-DD.md    # Dated status snapshots
PROJECT_STATUS.md               # Current status (symlink/latest)
```

### Session Notes
```
YYYY-MM-DD_session-topic.md     # Session documentation
YYYY-MM-DD_planning.md          # Planning sessions
```

### Deployment Docs
```
DEPLOY_YYYY-MM-DD.md            # Deployment guides
PHASE[N]_DEPLOYMENT.md          # Phase-specific deployment
```

### Guides & References
```
[TOPIC]_GUIDE.md                # User guides
[TOPIC]_REFERENCE.md            # Quick references
[TOPIC]_PLAN.md                 # Planning documents
```

---

## 🔍 Search & Navigation Tips

### Finding Voice-to-Drive Files
```bash
cd C:\Users\carlo\Development\mem0-sync\mem0\github-projects\voice-to-drive
```

### Finding Documentation
```bash
# Project-specific
cd C:\Users\carlo\Development\mem0-sync\mem0\github-projects\voice-to-drive
# View: PROJECT_STATUS_2025-01-17.md, README.md

# AAE-wide
cd C:\Users\carlo\Development\mem0-sync\mem0\AAE-master
# View: architecture/, agent-constitution/, session-notes/
```

### Finding MCP Server Code
```bash
# Manus task manager
cd C:\Users\carlo\Development\mem0-sync\mem0\mcp_servers\manus-mcp

# AI Orchestration
cd C:\Users\carlo\Development\mem0-sync\mem0\mcp-ai-orchestration
```

---

## 🎯 Next Actions

### Documentation Updates Needed
- [ ] Update `/github-projects/README.md` with voice-to-drive
- [ ] Create `/github-projects/PROJECTS.md` with status table
- [ ] Update root `README.md` with recent projects

### Code Organization
- [ ] Consider moving MCP servers to `/mcp_servers` subfolder
- [ ] Archive old project status files
- [ ] Clean up duplicate documentation

### Future Additions
- [ ] Add changelog automation
- [ ] Create file manifest generator script
- [ ] Set up automated documentation builds

---

## 📞 Maintenance

**File Manifest Maintainer:** Claude Code
**Last Full Audit:** January 17, 2025
**Next Audit:** After Supabase migration (Q1 2025)

**Update Process:**
1. Add new projects to `/github-projects`
2. Update this manifest with new directories/files
3. Update root `README.md` with deployment info
4. Update `CLAUDE.md` with development context

---

**Last Updated:** January 17, 2025, 1:30 AM
**Total Projects:** 5 active, 2 in planning
**Total Lines of Documentation:** ~10,000+ across all files

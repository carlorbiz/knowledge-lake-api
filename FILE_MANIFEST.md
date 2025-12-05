# Mem0 AI Automation Ecosystem - File Manifest

**Last Updated:** December 5, 2025
**Purpose:** Complete directory structure and file inventory for Carla's AAE
**Maintained by:** Claude Code (iteratively updated - DO NOT create dated versions)

---

## Repository Structure Overview

```
mem0/
├── AAE-master/                    # AAE architecture and agent documentation
├── aae-council/                   # AAE Council updates and briefings
├── aae-exports/                   # Exported data from AAE systems
├── agent-conversations/           # Agent-specific conversation logs
├── archive/                       # Historical/dated files (organized)
├── consulting/                    # Client consulting projects
├── conversations/                 # General conversation exports
├── databases/                     # Notion database exports
├── docs/                          # Core mem0 documentation
├── embedchain/                    # Legacy embedchain RAG framework
├── examples/                      # Usage examples
├── github-projects/               # Active development projects
├── google_apps_script/            # Google Apps Script projects
├── knowledge-lake/                # Knowledge Lake utilities
├── manus-mcp/                     # Manus MCP task manager server
├── mcp-ai-orchestration/          # AI orchestration MCP server
├── mem0/                          # Core mem0 library
├── mtmot-unified-mcp/             # MTMOT Unified MCP Server (Railway)
├── n8n-workflows/                 # n8n automation workflows
├── scripts/                       # Utility and ingestion scripts
├── tests/                         # Test suites
└── [root files]                   # Configuration and documentation
```

---

## Production Deployments

| Project | Platform | URL | Status |
|---------|----------|-----|--------|
| MTMOT Unified MCP | Railway | https://mtmot-unified-mcp-production.up.railway.app/mcp | LIVE |
| Voice to Drive | Cloudflare Pages | https://voice-to-drive.pages.dev | LIVE |
| Knowledge Lake API | Railway | https://knowledge-lake-api-production.up.railway.app | LIVE |
| Mem0 Memory API | Railway | https://web-production-e3e44.up.railway.app | LIVE |

---

## Key Directories

### `/mtmot-unified-mcp` - MTMOT Unified MCP Server
**Status:** Production (Railway)
**Purpose:** Unified API gateway connecting ChatGPT to AAE infrastructure (31 tools)

```
mtmot-unified-mcp/
├── src/
│   ├── http-server.ts             # Main HTTP/SSE server
│   ├── logger.ts                  # Logging configuration
│   ├── clients/
│   │   ├── notionClient.ts        # Notion API client
│   │   └── driveClient.ts         # Google Drive client
│   └── tools/
│       ├── notionTools.ts         # 10 Notion tools
│       ├── driveTools.ts          # 8 Google Drive tools
│       ├── knowledgeLakeTools.ts  # 11 Knowledge Lake tools
│       └── aaeTools.ts            # 2 AAE Dashboard tools
├── dist/                          # Compiled output
├── Dockerfile                     # Railway deployment
├── package.json
└── tsconfig.json
```

### `/github-projects` - Active Development Projects

```
github-projects/
├── voice-to-drive/                # PWA for voice recording (v2.0 Whisper)
├── executive-ai-advisor/          # Aurelia AI Advisor dashboard
├── carlorbiz-strategic-tool/      # Strategic planning tool
├── aae-dashboard/                 # AAE central dashboard
└── mtmot-vibesdk-production/      # VibeSDK production
```

### `/scripts` - Organized Python Scripts

```
scripts/
├── ingestion/                     # Knowledge Lake ingestion scripts
│   ├── ingest_claude_conversations.py
│   ├── ingest_claude_memories.py
│   ├── ingest_claude_projects.py
│   ├── ingest_fred_conversations.py
│   └── add_agent_prompts_to_knowledge_lake.py
└── utilities/                     # General utility scripts
    ├── analyze_aae_exports.py
    ├── check_github_repo.py
    ├── sample_fred.py
    ├── sample_fred_format.py
    └── test_env.py
```

### `/archive` - Historical Files (Organized)

```
archive/
├── session-logs-2025/             # Dated session logs
├── deployment-docs/               # Historical deployment documentation
├── dated-manifests/               # Previous manifest versions
└── legacy-scripts/                # Old scripts for reference
```

### `/aae-council` - AAE Council Updates

```
aae-council/
└── updates-2025/
    └── AAE_COUNCIL_UPDATE_2024-12-04.md
```

### `/manus-mcp` - Manus Task Manager MCP Server
**Purpose:** Cross-agent task delegation between Claude Code and Manus

```
manus-mcp/
├── manus_server.py                # MCP server implementation
├── requirements.txt
└── README.md
```

### `/mcp-ai-orchestration` - AI Orchestration MCP Server
**Purpose:** Browser automation to orchestrate AI agents (Grok, Fred, Penny)

```
mcp-ai-orchestration/
├── src/
│   └── index.ts                   # Main server
├── dist/
│   └── index.js                   # Compiled output
├── package.json
└── tsconfig.json
```

### `/AAE-master` - AI Automation Ecosystem Documentation

```
AAE-master/
├── agent-constitution/            # Agent behavior guidelines (V1.0)
├── agent-perspectives/            # Agent-specific architectural reviews
├── architecture/                  # Core architecture documents
├── session-notes/                 # Planning session notes
├── implementation/                # Implementation guides
└── integration/                   # VibeSDK integrations
```

---

## Root Configuration Files

### Environment & Config
```
.env                               # Environment variables (gitignored)
.env.example                       # Example environment file
.gitignore                         # Git ignore patterns
.python-version                    # Python version specification
```

### Build & Dependencies
```
pyproject.toml                     # Python project configuration
Makefile                           # Build automation
requirements.txt                   # Python dependencies
hatch.toml                         # Hatch build system config
```

### Documentation
```
README.md                          # Main repository README
CLAUDE.md                          # Claude Code instructions (comprehensive)
FILE_MANIFEST.md                   # This file (single source of truth)
API_notes.txt                      # API keys and integration configs
DEPLOY_TODAY.md                    # AI Brain deployment guide
```

### API Servers
```
api_server.py                      # Knowledge Lake Flask API
api_server_enhanced.py             # Enhanced API (experimental)
start_knowledge_lake.py            # Production server (Waitress)
```

---

## MCP Server Configuration

Configured in `.vscode/mcp.json`:

1. **manus-task-manager** (Python)
   - Tools: `assign_task`, `get_task_status`, `get_task_result`, `list_my_tasks`

2. **ai-orchestration** (Node.js)
   - Tools: `ask_grok`, `list_grok_threads`, `get_rate_limit_status`

Active via Docker MCP:
- **MCP_DOCKER**: Firecrawl, GitHub, Docker, knowledge graph, npm, Perplexity
- **notionApi**: Notion database operations

---

## Recent Updates (December 2025)

### MTMOT Unified MCP Server Launch (Dec 4, 2025)
- Deployed to Railway with 31 tools
- Connects ChatGPT (Dev/Fredo) to AAE infrastructure
- Notion, Google Drive, Knowledge Lake, AAE Dashboard integrations

### Folder Structure Reorganization (Dec 5, 2025)
- Created organized archive structure
- Moved Python scripts to `scripts/ingestion/` and `scripts/utilities/`
- Consolidated AAE Council updates to `aae-council/updates-2025/`
- Archived dated session logs, deployment docs, and manifests

---

## Maintenance Guidelines

1. **This file is the SINGLE source of truth** - Do not create dated versions
2. Update iteratively when structure changes
3. Keep deployment status current
4. Archive old dated files to `/archive` subdirectories

---

**Last Full Audit:** December 5, 2025
**Next Audit:** As needed during development

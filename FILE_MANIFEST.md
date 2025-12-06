# Mem0 AI Automation Ecosystem - File Manifest

**Last Updated:** December 6, 2025
**Purpose:** Complete directory structure and file inventory for Carla's AAE
**Maintained by:** Claude Code (iteratively updated - DO NOT create dated versions)

---

## Root Directory - Clean Structure

The root directory now contains ONLY:
- **Config files** (required at root by tools)
- **Core documentation** (README, CLAUDE.md, this manifest)
- **API server files** (Railway deployment)

```
mem0/
├── .env, .gitignore, .dockerignore    # Environment config
├── .pre-commit-config.yaml            # Git hooks
├── .railwayignore, railway.json       # Railway deployment
├── nixpacks.toml, runtime.txt         # Build config
├── pyproject.toml, poetry.lock        # Python config
├── requirements.txt, requirements-api.txt
├── package.json, package-lock.json    # Node config
├── Makefile                           # Build automation
├── Dockerfile                         # Container build
├── README.md                          # Main readme
├── CLAUDE.md                          # Claude Code instructions
├── CONTRIBUTING.md                    # Contribution guide
├── LICENSE                            # License
├── FILE_MANIFEST.md                   # This file
├── api_server.py                      # Knowledge Lake API
├── start_knowledge_lake.py            # Production server
└── mem0_config.py                     # Mem0 configuration
```

---

## Production Deployments

| Project | Platform | URL | Status |
|---------|----------|-----|--------|
| MTMOT Unified MCP | Railway | https://mtmot-unified-mcp-production.up.railway.app/mcp | LIVE |
| Voice to Drive | Cloudflare | https://voice-to-drive.pages.dev | LIVE |
| Knowledge Lake API | Railway | https://knowledge-lake-api-production.up.railway.app | LIVE |
| Mem0 Memory API | Railway | https://web-production-e3e44.up.railway.app | LIVE |

---

## Key Directories

### `/docs` - All Documentation
```
docs/
├── guides/                            # How-to guides and references
│   ├── AAE_CONTENT_STRUCTURE_GUIDE.md
│   ├── BRIEF_FOR_CODEX_GEMINI.md
│   ├── CODEX_QUICK_START.md
│   ├── DIAGNOSTIC_COMMANDS_FOR_GEMINI.md
│   ├── LLM.md                         # LLM integration docs
│   ├── MANUS_RAILWAY_INTEGRATION.md
│   ├── NGROK_QUICK_START.md
│   ├── RAILWAY_DEPLOYMENT.md
│   └── README_PROJECT_STRUCTURE.md
├── API_notes.txt                      # API keys and configs
└── [mem0 core docs]                   # Original mem0 documentation
```

### `/scripts` - All Python Scripts
```
scripts/
├── ingestion/                         # Knowledge Lake ingestion
│   ├── ingest_claude_conversations.py
│   ├── ingest_claude_memories.py
│   ├── ingest_claude_projects.py
│   ├── ingest_fred_conversations.py
│   └── add_agent_prompts_to_knowledge_lake.py
└── utilities/                         # General utilities
    ├── analyze_aae_exports.py
    ├── check_github_repo.py
    ├── gemini_receiver.py
    ├── redact-secrets.sh
    ├── sample_fred.py
    ├── sample_fred_format.py
    ├── test_env.py
    └── test_railway_deployment.bat
```

### `/archive` - Historical Files
```
archive/
├── session-logs-2025/                 # Dated session logs
├── deployment-docs/                   # Historical deployment docs
├── dated-manifests/                   # Old manifest versions
└── legacy-scripts/                    # Deprecated scripts
```

### `/github-projects` - Active Development
```
github-projects/
├── voice-to-drive/                    # PWA v2.0 (Whisper AI)
├── executive-ai-advisor/              # Aurelia AI Advisor
├── carlorbiz-strategic-tool/          # Strategic planning
├── aae-dashboard/                     # AAE central dashboard
└── mtmot-vibesdk-production/          # VibeSDK production
```

### `/mtmot-unified-mcp` - MTMOT MCP Server
```
mtmot-unified-mcp/
├── src/
│   ├── http-server.ts                 # Main HTTP/SSE server
│   ├── clients/                       # API clients
│   └── tools/                         # 31 MCP tools
├── dist/                              # Compiled output
└── Dockerfile                         # Railway deployment
```

### `/n8n-workflows` - Automation Workflows
```
n8n-workflows/
├── active/                            # Current workflows
├── archive/
│   └── oct-2024-production/           # Historical workflows
└── README.md
```

### `/conversations` - Conversation Logs
```
conversations/
├── carla-claude-conversations.txt     # Historical exports
└── [other conversation exports]
```

### `/aae-council` - Council Updates
```
aae-council/
└── updates-2025/                      # Council briefings
```

### MCP Servers
```
manus-mcp/                             # Manus task manager
mcp-ai-orchestration/                  # AI agent orchestration
mcp_servers/                           # Additional MCP servers
```

### Core Libraries
```
mem0/                                  # Core mem0 library
embedchain/                            # Legacy RAG framework
mem0-ts/                               # TypeScript SDK
```

### Other Directories
```
AAE-master/                            # AAE architecture docs
agent-conversations/                   # Agent-specific logs
consulting/                            # Client projects
databases/                             # Notion exports
examples/                              # Usage examples
tests/                                 # Test suites
```

---

## MCP Server Configuration

Configured in `.vscode/mcp.json`:
- **manus-task-manager** - Cross-agent task delegation
- **ai-orchestration** - Browser automation for AI agents

Via Docker MCP:
- **MCP_DOCKER** - Firecrawl, GitHub, Docker, Perplexity
- **notionApi** - Notion operations

---

## Recent Changes (December 2025)

### Dec 6: Root Cleanup
- Moved 9 markdown guides to `docs/guides/`
- Moved stray scripts to `scripts/ingestion/` and `scripts/utilities/`
- Deleted junk files (`nul`, `cloudflared.exe`)
- Consolidated `n8n_workflows` into `n8n-workflows/archive/`
- Moved `carla-claude-conversations.txt` to `conversations/`
- Moved `API_notes.txt` to `docs/`

### Dec 5: Folder Reorganization
- Created organized archive structure
- Consolidated FILE_MANIFEST.md as single source

### Dec 4: MTMOT Unified MCP Launch
- Deployed 31-tool MCP server to Railway

---

## Maintenance Guidelines

1. **This file is the SINGLE source of truth** - Never create dated versions
2. **Root stays clean** - Only config and core docs at root
3. **Scripts go in scripts/** - Organized by purpose
4. **Guides go in docs/guides/** - All reference documentation
5. **Old files go to archive/** - Organized by type

---

**Last Full Audit:** December 6, 2025

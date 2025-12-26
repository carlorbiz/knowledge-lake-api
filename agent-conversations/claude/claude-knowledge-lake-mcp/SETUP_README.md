# Claude Desktop MCP Setup - Portable Configuration

## Quick Start (Any Device)

```bash
cd mem0\agent-conversations\claude\claude-knowledge-lake-mcp
setup-claude-desktop.bat
```

The script will:
1. ✅ Auto-detect Python installation
2. ✅ Auto-detect mem0-sync repository location
3. ✅ Verify MCP server files exist
4. ✅ Generate correctly-formatted config with device-specific paths
5. ✅ Optionally copy to Claude Desktop config directory
6. ✅ Optionally backup existing config before overwriting

## What This Solves

**Problem:** Claude Desktop's `claude_desktop_config.json` uses **absolute file paths** that break when copied to different devices:

```json
{
  "command": "C:\\Users\\carlo\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe",
  "args": ["C:\\Users\\carlo\\Development\\mem0-sync\\mem0\\...\\server.py"]
}
```

**Solution:** This setup script automatically detects the correct paths for **your device** and generates a working config file.

## Prerequisites

### On First Device (Already Done)
- ✅ Python installed
- ✅ mem0-sync repository cloned
- ✅ MCP server dependencies installed

### On Second Device (New Setup)

**Step 1: Install Python**
```bash
# Download from python.org or use Windows Store
# Verify installation:
python --version
```

**Step 2: Clone Repository**
```bash
cd C:\Users\[YOUR_USERNAME]\Development
git clone https://github.com/[your-org]/mem0-sync.git
cd mem0-sync\mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude-knowledge-lake-mcp
```

**Step 3: Install MCP Server Dependencies**
```bash
pip install fastmcp pydantic httpx python-dotenv
```

**Step 4: Run Setup Script**
```bash
cd ..  # Back to claude-knowledge-lake-mcp directory
setup-claude-desktop.bat
```

**Step 5: Restart Claude Desktop**
- Close Claude Desktop completely
- Reopen to activate the 5 Knowledge Lake tools

## What Gets Generated

The script creates `claude_desktop_config.json` with:

```json
{
  "mcpServers": {
    "knowledge-lake": {
      "command": "[AUTO-DETECTED PYTHON PATH]",
      "args": ["[AUTO-DETECTED SERVER PATH]"],
      "env": {
        "KNOWLEDGE_LAKE_BASE_URL": "https://knowledge-lake-api-production.up.railway.app"
      }
    }
  },
  "preferences": {
    "chromeExtensionEnabled": true
  }
}
```

**Device-Specific Paths (Auto-Detected):**
- `command`: Python executable location (e.g., `C:\Python311\python.exe` or Windows Store Python)
- `args[0]`: MCP server.py location (relative to where you cloned mem0-sync)

**Universal Settings (Same Everywhere):**
- `KNOWLEDGE_LAKE_BASE_URL`: Railway production API (accessible from any device)
- `chromeExtensionEnabled`: Chrome integration preference

## Available MCP Tools

After setup and restart, Claude Desktop will have 5 Knowledge Lake tools:

### Read-Only (2 tools)
- **`knowledge_lake_query`** - Search conversations and entities
  - Uses `/api/conversations/search` endpoint
  - Supports agent filtering, entity type filtering
  - Returns full conversation details with metadata

- **`knowledge_lake_stats`** - Get Knowledge Lake statistics
  - Total conversations, entities, relationships
  - Verifies connection to Railway production

### Write/Delete (3 tools)
- **`knowledge_lake_ingest`** - Add new conversations
  - Real-time ingestion to PostgreSQL + Qdrant
  - Automatic entity extraction and relationship mapping

- **`knowledge_lake_extract_learning`** - Extract 7-dimension learnings
  - Methodology, decisions, corrections, insights, values, prompting, teaching
  - Creates discrete searchable learning entities
  - Does NOT auto-archive (deliberate choice)

- **`knowledge_lake_archive`** - Archive processed conversations
  - Soft delete (scheduled deletion), hard delete (immediate), compress (future)
  - Marked as `destructiveHint: true` in MCP
  - Use after extracting learnings to keep Knowledge Lake clean

## Architecture

```
┌─────────────────────────────────────┐
│      Claude Desktop (Any Device)    │
└──────────────┬──────────────────────┘
               │ stdio transport
               ▼
┌─────────────────────────────────────┐
│  Python MCP Server (Local Process)  │
│  - FastMCP framework                │
│  - Pydantic validation              │
│  - httpx async client               │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│   Knowledge Lake API (Railway)      │
│   knowledge-lake-api-production     │
│   .up.railway.app                   │
│   - PostgreSQL persistence          │
│   - Qdrant semantic search          │
└─────────────────────────────────────┘
```

## Troubleshooting

### Script Errors

**"Python not found in PATH"**
```bash
# Add Python to PATH or specify full path
where python  # Should show Python location
```

**"Could not find mem0-sync repository"**
```bash
# Run from within the mem0-sync directory tree
cd C:\Users\[USERNAME]\Development\mem0-sync\mem0\agent-conversations\claude\claude-knowledge-lake-mcp
```

**"MCP server not found at [path]"**
```bash
# Verify server.py exists
dir claude-knowledge-lake-mcp\server.py
```

### Claude Desktop Errors

**"MCP server not showing up"**
1. Verify config file location: `%APPDATA%\Claude\claude_desktop_config.json`
2. Check config file syntax (must be valid JSON)
3. Restart Claude Desktop completely (close and reopen)
4. Check Claude Desktop logs for errors

**"Tools not appearing after restart"**
1. Open Claude Desktop Developer Tools (if available)
2. Check for MCP connection errors
3. Verify Python dependencies installed:
   ```bash
   pip list | findstr "fastmcp pydantic httpx"
   ```

**"Connection errors to Knowledge Lake"**
1. Test Railway API directly:
   ```bash
   curl https://knowledge-lake-api-production.up.railway.app/health
   ```
2. Check internet connection
3. Verify `KNOWLEDGE_LAKE_BASE_URL` in config is correct

## Manual Setup (Alternative)

If you prefer not to use the script:

1. **Find Python path:**
   ```bash
   where python
   ```

2. **Find server.py path:**
   ```bash
   dir /s /b server.py | findstr "claude-knowledge-lake-mcp"
   ```

3. **Create config manually:**
   - Location: `%APPDATA%\Claude\claude_desktop_config.json`
   - Format: See "What Gets Generated" section above
   - Remember to escape backslashes (`\` → `\\` in JSON)

4. **Restart Claude Desktop**

## File Locations Reference

| File | Location (Current Device) | Purpose |
|------|---------------------------|---------|
| Setup Script | `mem0\agent-conversations\claude\claude-knowledge-lake-mcp\setup-claude-desktop.bat` | Auto-generates config |
| Generated Config | `mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude_desktop_config.json` | Temporary (for review) |
| Claude Config | `%APPDATA%\Claude\claude_desktop_config.json` | Active config file |
| MCP Server | `mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude-knowledge-lake-mcp\server.py` | Python MCP server |
| Config Backups | `%APPDATA%\Claude\claude_desktop_config.json.backup_[timestamp]` | Auto-created by script |

## Version Control Note

**DO NOT commit `claude_desktop_config.json` to git** - it contains device-specific paths.

The setup script is version-controlled and can be run on any device to generate the correct config.

## Updates and Maintenance

**When MCP server code changes:**
1. Pull latest changes from git: `git pull`
2. No config regeneration needed (paths remain the same)
3. Restart Claude Desktop to load new code

**When switching devices:**
1. Clone/pull repository on new device
2. Run `setup-claude-desktop.bat`
3. Choose to copy to Claude config directory
4. Restart Claude Desktop

**When Python installation changes:**
1. Re-run `setup-claude-desktop.bat`
2. Script will detect new Python location
3. Regenerate config with updated paths
4. Restart Claude Desktop

## Last Updated
2025-12-26 - Initial portable setup script created

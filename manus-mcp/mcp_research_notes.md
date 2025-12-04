# MCP Server Implementation Research Notes

## Key Findings

### MCP Server Architecture
- **MCP servers** can provide three main capabilities:
  1. **Resources**: File-like data that can be read by clients
  2. **Tools**: Functions that can be called by the LLM (with user approval)
  3. **Prompts**: Pre-written templates for specific tasks

### Transport Protocols
1. **STDIO Transport** (Local)
   - Used for local MCP servers
   - Communication via standard input/output
   - Configured in Claude Desktop via `claude_desktop_config.json`
   - **Critical**: Never write to stdout in STDIO mode (corrupts JSON-RPC)

2. **Streamable HTTP Transport** (Remote)
   - Modern standard for remote MCP servers
   - Operates over HTTP POST and GET
   - Can handle multiple client connections
   - Server runs as independent process
   - Accessible from any MCP client with internet connection

3. **HTTP+SSE Transport** (Legacy Remote)
   - Older approach, being replaced by Streamable HTTP
   - Uses Server-Sent Events for server-to-client messages
   - HTTP POST for client-to-server messages

### Python Implementation (FastMCP)
- Use `mcp.server.fastmcp.FastMCP` class
- Python 3.10+ required
- MCP SDK 1.2.0+ required
- Tools defined using `@mcp.tool()` decorator
- Type hints and docstrings auto-generate tool definitions
- Run with `mcp.run(transport='stdio')` for local or HTTP for remote

### VSCode Integration (Claude Code)
- MCP servers configured in `.vscode/mcp.json` or workspace settings
- For STDIO servers, specify command and args
- For remote servers, specify URL endpoint
- Example configuration format:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "python",
      "args": ["path/to/server.py"]
    }
  }
}
```

### Task Management Server Requirements
Need to implement:
1. `assign_task(description, context, priority)` - Create new task
2. `get_task_status(taskId)` - Check task status
3. `get_task_result(taskId)` - Retrieve task results
4. `list_my_tasks()` - List all tasks

### Implementation Approach
1. Create Python MCP server using FastMCP
2. Support both STDIO (local) and HTTP (remote) transports
3. Store tasks in-memory or simple file-based storage
4. Provide clear configuration instructions for VSCode
5. Include example `.vscode/mcp.json` configuration

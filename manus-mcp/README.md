# Manus MCP Server - Task Management for Claude Code

A custom Model Context Protocol (MCP) server that provides task management tools for seamless integration between Claude Code (CC) in VSCode and Manus. This server enables Claude Code to delegate tasks to Manus and retrieve results through a standardized interface.

## Overview

This MCP server exposes four primary tools that allow Claude Code to:
- **Assign tasks** to Manus for execution
- **Check task status** to monitor progress
- **Retrieve task results** when completed
- **List all tasks** with filtering capabilities

## Features

- ✅ **STDIO Transport** - Local integration with Claude Code in VSCode
- ✅ **SSE Transport** - Remote HTTP/SSE access for distributed setups
- ✅ **Persistent Storage** - Tasks are saved to `~/.manus_tasks.json`
- ✅ **Priority Management** - Support for low, medium, and high priority tasks
- ✅ **Status Tracking** - Real-time task status updates (pending, in_progress, completed, failed)
- ✅ **Error Handling** - Comprehensive error messages and validation

## Requirements

- Python 3.10 or higher
- MCP SDK 1.2.0 or higher

## Installation

### 1. Clone or Download

```bash
git clone <repository-url>
cd manus-mcp-server
```

Or download and extract the files to a directory of your choice.

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Or using the package:

```bash
pip install -e .
```

### 3. Test the Server

Run the server in STDIO mode to verify it works:

```bash
python3 manus_server.py
```

The server should start and wait for input. Press `Ctrl+C` to exit.

## Integration with Claude Code (VSCode)

### Option 1: User-Level Configuration

1. **Locate your Claude Code configuration file:**
   - **macOS/Linux**: `~/.vscode/mcp.json` or `~/.config/Code/User/settings.json`
   - **Windows**: `%APPDATA%\Code\User\settings.json`

2. **Add the Manus MCP server configuration:**

```json
{
  "mcpServers": {
    "manus-task-manager": {
      "command": "python3",
      "args": [
        "/absolute/path/to/manus-mcp-server/manus_server.py"
      ]
    }
  }
}
```

**Important:** Replace `/absolute/path/to/manus-mcp-server/` with the actual absolute path to where you installed the server.

### Option 2: Workspace-Level Configuration

1. **Create or edit `.vscode/mcp.json` in your project:**

```json
{
  "mcpServers": {
    "manus-task-manager": {
      "command": "python3",
      "args": [
        "/absolute/path/to/manus-mcp-server/manus_server.py"
      ]
    }
  }
}
```

2. **Reload VSCode** to apply the configuration.

### Finding the Absolute Path

To get the absolute path to your server:

```bash
cd manus-mcp-server
pwd
```

This will output something like `/home/username/manus-mcp-server` which you should use in the configuration.

## Available Tools

### 1. `assign_task`

Create a new task for Manus to execute.

**Parameters:**
- `description` (string, required): Clear description of the task
- `context` (string, optional): Additional context or requirements
- `priority` (string, optional): Task priority - "low", "medium" (default), or "high"

**Returns:** JSON with `task_id` and confirmation

**Example:**
```python
assign_task(
    description="Create a Python script to analyze CSV data",
    context="The CSV has columns: date, sales, region. Calculate total sales by region.",
    priority="high"
)
```

### 2. `get_task_status`

Check the current status of a task.

**Parameters:**
- `task_id` (string, required): The unique task identifier

**Returns:** JSON with task status and metadata

**Status Values:**
- `pending` - Task is waiting to be processed
- `in_progress` - Task is currently being executed
- `completed` - Task has finished successfully
- `failed` - Task encountered an error

**Example:**
```python
get_task_status(task_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890")
```

### 3. `get_task_result`

Retrieve the result of a completed task.

**Parameters:**
- `task_id` (string, required): The unique task identifier

**Returns:** JSON with task result or current status

**Example:**
```python
get_task_result(task_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890")
```

### 4. `list_my_tasks`

List all tasks with optional filtering.

**Parameters:**
- `status_filter` (string, optional): Filter by status - "all" (default), "pending", "in_progress", "completed", or "failed"
- `limit` (integer, optional): Maximum number of tasks to return (default: 50)

**Returns:** JSON with array of task summaries

**Example:**
```python
list_my_tasks(status_filter="pending", limit=10)
```

## Usage Examples

### From Claude Code in VSCode

Once configured, you can interact with the Manus MCP server directly through Claude Code:

```
User: "Create a task for Manus to build a weather dashboard"

Claude Code: [Uses assign_task tool]
Task assigned successfully with ID: abc123...

User: "Check the status of task abc123"

Claude Code: [Uses get_task_status tool]
Task is currently in_progress...

User: "Show me all my pending tasks"

Claude Code: [Uses list_my_tasks tool]
You have 3 pending tasks: ...
```

## Remote Access (HTTP/SSE)

To run the server for remote access:

```bash
python3 manus_server.py --transport sse --port 8123
```

The server will be available at `http://localhost:8123`.

For remote Claude clients, configure the MCP connection with the server URL.

## Task Storage

Tasks are automatically persisted to `~/.manus_tasks.json` and loaded on server startup. This ensures tasks survive server restarts.

To view or manually edit tasks:

```bash
cat ~/.manus_tasks.json
```

## Advanced Configuration

### Custom Python Interpreter

If you need to use a specific Python interpreter (e.g., from a virtual environment):

```json
{
  "mcpServers": {
    "manus-task-manager": {
      "command": "/path/to/venv/bin/python",
      "args": [
        "/absolute/path/to/manus-mcp-server/manus_server.py"
      ]
    }
  }
}
```

### Environment Variables

You can pass environment variables to the server:

```json
{
  "mcpServers": {
    "manus-task-manager": {
      "command": "python3",
      "args": [
        "/absolute/path/to/manus-mcp-server/manus_server.py"
      ],
      "env": {
        "MANUS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Troubleshooting

### Server Not Showing Up in Claude Code

1. **Check the configuration file location** - Ensure you're editing the correct file
2. **Verify the absolute path** - Use `pwd` to get the correct path
3. **Check Python version** - Run `python3 --version` (must be 3.10+)
4. **Test the server manually** - Run `python3 manus_server.py` to check for errors
5. **Reload VSCode** - Close and reopen VSCode after configuration changes

### Import Errors

If you see "ModuleNotFoundError: No module named 'mcp'":

```bash
pip install mcp>=1.2.0 httpx>=0.27.0
```

### Permission Errors

If you get permission errors when running the server:

```bash
chmod +x manus_server.py
```

### Viewing Logs

The server logs to stderr. To view logs when running manually:

```bash
python3 manus_server.py 2>&1 | tee server.log
```

## Architecture

### For Human Operators

This MCP server acts as a bridge between Claude Code in VSCode and Manus. When you're working in VSCode with Claude Code, you can now delegate complex tasks to Manus without leaving your development environment. Claude Code will:

1. Understand when a task is better suited for Manus
2. Use the `assign_task` tool to send the task to Manus
3. Monitor progress using `get_task_status`
4. Retrieve and present results using `get_task_result`

This creates a seamless workflow where Claude Code handles your immediate coding needs while Manus tackles larger, more complex tasks in the background.

### For AI Agents

This MCP server enables **cross-agent task delegation** within the Autonomous Agent Ecosystem (AAE). Key benefits:

- **Task Distribution**: Claude Code can offload complex, multi-step tasks to Manus
- **Asynchronous Processing**: Non-blocking task execution with status polling
- **Result Aggregation**: Structured data exchange between agents
- **Context Preservation**: Task context and requirements are maintained across agent boundaries
- **Priority Queuing**: High-priority tasks can be expedited

This architecture enhances the AAE by enabling specialized agents to collaborate effectively, with Claude Code focusing on immediate development tasks while Manus handles research, analysis, and complex automation.

## Security Considerations

- **Local STDIO Transport**: Most secure option, no network exposure
- **Task Storage**: Tasks are stored locally in user's home directory
- **No Authentication**: STDIO mode requires no authentication (local access only)
- **Remote Access**: If using SSE transport, implement authentication and use HTTPS in production

## Future Enhancements

Potential improvements for future versions:

- [ ] Database backend (SQLite, PostgreSQL) for better scalability
- [ ] Task execution engine integration
- [ ] Webhook notifications for task completion
- [ ] Task cancellation support
- [ ] Task dependencies and workflows
- [ ] Authentication for remote access
- [ ] Rate limiting and quotas
- [ ] Task history and analytics

## Contributing

Contributions are welcome! Please ensure:

1. Code follows PEP 8 style guidelines
2. All tools have comprehensive docstrings
3. Error handling is robust
4. Changes are backward compatible

## License

This project is provided as-is for integration with Manus and Claude Code.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review MCP documentation at https://modelcontextprotocol.io
- Submit issues to the repository

## Version History

### 1.0.0 (Initial Release)
- STDIO and SSE transport support
- Four core task management tools
- Persistent task storage
- Priority-based task management
- Comprehensive error handling

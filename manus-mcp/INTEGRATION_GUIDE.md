# Integration Guide - Manus MCP Server with Claude Code

This guide provides detailed instructions for integrating the Manus MCP Server with Claude Code in VSCode and other MCP clients.

## Table of Contents

1. [Understanding the Integration](#understanding-the-integration)
2. [VSCode + Claude Code Setup](#vscode--claude-code-setup)
3. [Alternative MCP Clients](#alternative-mcp-clients)
4. [Usage Patterns](#usage-patterns)
5. [Best Practices](#best-practices)
6. [Advanced Configuration](#advanced-configuration)
7. [Troubleshooting](#troubleshooting)

## Understanding the Integration

### What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to connect with external tools and data sources. It provides a standardized way for LLMs to:

- **Discover available tools** through a protocol-defined interface
- **Execute functions** with proper parameter validation
- **Receive structured responses** in a consistent format

### How This Integration Works

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Claude Code   │  MCP    │  Manus MCP       │  Task   │   Manus     │
│   (VSCode)      │ ◄─────► │  Server          │ ◄─────► │   System    │
│                 │         │  (This Project)  │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

**Flow:**
1. Claude Code discovers available MCP tools on startup
2. User interacts with Claude Code in VSCode
3. Claude Code determines when to use Manus tools
4. MCP server receives tool calls and manages tasks
5. Task data is persisted locally
6. Results are returned to Claude Code
7. Claude Code presents results to user

### Why This Matters

This integration enables **seamless task delegation** between Claude Code and Manus:

- **Claude Code** handles immediate coding tasks, quick edits, and interactive development
- **Manus** handles complex, multi-step tasks that require research, analysis, or extended processing
- **You** benefit from the best of both AI assistants without context switching

## VSCode + Claude Code Setup

### Prerequisites

- VSCode installed (latest version recommended)
- Claude Code extension installed
- Python 3.10+ installed
- Manus MCP Server downloaded and installed

### Step-by-Step Configuration

#### 1. Locate Your Configuration File

The configuration location depends on your setup preference:

**Option A: User Settings (Global)**
- **macOS**: `~/Library/Application Support/Code/User/settings.json`
- **Linux**: `~/.config/Code/User/settings.json`
- **Windows**: `%APPDATA%\Code\User\settings.json`

**Option B: Workspace Settings (Project-specific)**
- Create `.vscode/settings.json` in your project root

#### 2. Add MCP Configuration

Open your chosen settings file and add:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": [
          "/absolute/path/to/manus-mcp-server/manus_server.py"
        ]
      }
    }
  }
}
```

**Important Notes:**
- Use **absolute paths** (not relative paths like `~/` or `./`)
- On Windows, use forward slashes `/` or escaped backslashes `\\`
- The `command` should point to your Python 3.10+ executable

#### 3. Find Your Absolute Path

```bash
# Navigate to the server directory
cd manus-mcp-server

# Get the absolute path
pwd

# Example output: /home/username/Documents/manus-mcp-server
```

Use this path in your configuration.

#### 4. Verify Python Version

```bash
# Check Python version
python3 --version

# Should show 3.10 or higher
# If not, specify the full path to Python 3.10+
which python3.11  # or python3.10
```

If you need to use a specific Python version:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "/usr/local/bin/python3.11",
        "args": [
          "/absolute/path/to/manus-mcp-server/manus_server.py"
        ]
      }
    }
  }
}
```

#### 5. Using Virtual Environment (Recommended)

If you installed dependencies in a virtual environment:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "/absolute/path/to/manus-mcp-server/venv/bin/python",
        "args": [
          "/absolute/path/to/manus-mcp-server/manus_server.py"
        ]
      }
    }
  }
}
```

#### 6. Restart VSCode

Close and reopen VSCode to load the new configuration.

#### 7. Verify the Connection

1. Open Claude Code in VSCode
2. Start a new conversation
3. Type: "Can you list my tasks?"

If Claude Code responds using the `list_my_tasks` tool, the integration is working! 🎉

### Multiple MCP Servers

You can configure multiple MCP servers:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": ["/path/to/manus-mcp-server/manus_server.py"]
      },
      "another-server": {
        "command": "node",
        "args": ["/path/to/another-server/index.js"]
      }
    }
  }
}
```

## Alternative MCP Clients

### Claude Desktop

Claude Desktop uses a different configuration file:

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

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

### Cline (VSCode Extension)

Cline uses VSCode settings similar to Claude Code:

```json
{
  "cline.mcpServers": {
    "manus-task-manager": {
      "command": "python3",
      "args": ["/absolute/path/to/manus-mcp-server/manus_server.py"]
    }
  }
}
```

### Continue.dev

In `.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "manus-task-manager",
      "command": "python3",
      "args": ["/absolute/path/to/manus-mcp-server/manus_server.py"]
    }
  ]
}
```

### Custom MCP Client

If you're building your own MCP client:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Connect to the server
server_params = StdioServerParameters(
    command="python3",
    args=["/path/to/manus-mcp-server/manus_server.py"]
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize
        await session.initialize()
        
        # List available tools
        tools = await session.list_tools()
        
        # Call a tool
        result = await session.call_tool(
            "assign_task",
            arguments={
                "description": "Create a Python script",
                "priority": "high"
            }
        )
```

## Usage Patterns

### Pattern 1: Task Delegation

**Scenario:** You're working on a project and need Manus to handle a complex task.

```
User: "I need to build a REST API for user management. 
       Can you create a task for Manus to design and implement this?"

Claude Code: [Uses assign_task]
✅ Task created with ID: abc123
Priority: high
Description: Design and implement REST API for user management

User: "Great, let me know when it's done."

[Later...]

User: "Check the status of task abc123"

Claude Code: [Uses get_task_status]
Status: completed
Completed at: 2025-11-16T10:30:00

User: "Show me the result"

Claude Code: [Uses get_task_result]
[Displays the API implementation, documentation, and tests]
```

### Pattern 2: Task Management

**Scenario:** Managing multiple ongoing tasks.

```
User: "Show me all my pending tasks"

Claude Code: [Uses list_my_tasks with status_filter="pending"]
You have 3 pending tasks:
1. Build weather dashboard (high priority)
2. Research Python testing frameworks (low priority)
3. Create database migration scripts (medium priority)

User: "What's the status of the weather dashboard task?"

Claude Code: [Uses get_task_status]
Status: in_progress
Started: 2 hours ago
```

### Pattern 3: Priority Management

**Scenario:** Assigning tasks with different priorities.

```
User: "Create a high priority task for Manus to fix the authentication bug"

Claude Code: [Uses assign_task with priority="high"]
✅ High priority task created: Fix authentication bug

User: "Also create a low priority task to update the documentation"

Claude Code: [Uses assign_task with priority="low"]
✅ Low priority task created: Update documentation
```

### Pattern 4: Context-Rich Tasks

**Scenario:** Providing detailed context for complex tasks.

```
User: "Create a task for Manus to optimize the database queries. 
       Context: We're seeing slow response times on the /api/users endpoint.
       The query joins 5 tables and returns 10k+ rows.
       We need to implement pagination and add indexes."

Claude Code: [Uses assign_task with detailed context]
✅ Task created with comprehensive context
Manus will have all the information needed to optimize effectively.
```

## Best Practices

### 1. Clear Task Descriptions

**Good:**
```
"Create a Python script that:
- Reads CSV files from the data/ directory
- Calculates total sales by region
- Generates a bar chart visualization
- Exports results to Excel"
```

**Bad:**
```
"Make a script for sales data"
```

### 2. Provide Context

Always include relevant context:
- Current project structure
- Dependencies and versions
- Constraints or requirements
- Expected output format

### 3. Use Appropriate Priorities

- **High**: Urgent bugs, blocking issues, critical features
- **Medium**: Regular features, improvements, refactoring
- **Low**: Nice-to-haves, documentation, research tasks

### 4. Regular Status Checks

For long-running tasks, check status periodically:

```
User: "Check all in-progress tasks"

Claude Code: [Lists tasks and their status]
```

### 5. Task Naming Conventions

Use descriptive task names that include:
- Action verb (Create, Fix, Implement, Research)
- Subject (what's being worked on)
- Optional scope (which part of the project)

Examples:
- "Implement user authentication with JWT"
- "Fix memory leak in data processing pipeline"
- "Research best practices for React state management"

### 6. Cleanup Completed Tasks

Periodically review and archive completed tasks:

```
User: "Show me all completed tasks from this week"

Claude Code: [Filters and displays completed tasks]
```

## Advanced Configuration

### Environment Variables

Pass environment variables to the MCP server:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": ["/path/to/manus_server.py"],
        "env": {
          "MANUS_API_KEY": "your-api-key",
          "LOG_LEVEL": "DEBUG",
          "TASKS_FILE": "/custom/path/tasks.json"
        }
      }
    }
  }
}
```

### Custom Working Directory

Specify a working directory:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": ["/path/to/manus_server.py"],
        "cwd": "/path/to/working/directory"
      }
    }
  }
}
```

### Timeout Configuration

Set custom timeouts for tool calls:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": ["/path/to/manus_server.py"],
        "timeout": 30000
      }
    }
  }
}
```

### Logging Configuration

Enable detailed logging for debugging:

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": ["/path/to/manus_server.py"],
        "env": {
          "LOG_LEVEL": "DEBUG"
        }
      }
    },
    "logging": {
      "level": "debug"
    }
  }
}
```

## Troubleshooting

### Server Not Detected

**Symptom:** Claude Code doesn't show Manus tools

**Solutions:**

1. **Verify configuration path:**
   ```bash
   # Check if file exists
   cat ~/.config/Code/User/settings.json
   ```

2. **Check Python path:**
   ```bash
   which python3
   # Use this path in configuration
   ```

3. **Test server manually:**
   ```bash
   python3 /path/to/manus_server.py
   # Should start without errors
   ```

4. **Check VSCode output:**
   - Open Output panel (View → Output)
   - Select "MCP" from dropdown
   - Look for error messages

### Import Errors

**Symptom:** "ModuleNotFoundError: No module named 'mcp'"

**Solution:**

```bash
cd manus-mcp-server
source venv/bin/activate
pip install -r requirements.txt

# Update configuration to use venv Python
# command: "/path/to/manus-mcp-server/venv/bin/python"
```

### Permission Denied

**Symptom:** "Permission denied" when starting server

**Solution:**

```bash
chmod +x /path/to/manus_server.py
```

### Server Crashes

**Symptom:** Server starts but immediately crashes

**Solutions:**

1. **Check logs:**
   ```bash
   python3 manus_server.py 2>&1 | tee server.log
   ```

2. **Verify dependencies:**
   ```bash
   pip list | grep mcp
   # Should show mcp>=1.2.0
   ```

3. **Test with test script:**
   ```bash
   python test_server.py
   ```

### Tools Not Working

**Symptom:** Server connects but tools don't work

**Solutions:**

1. **Check tool definitions:**
   - Verify all tools have proper docstrings
   - Check parameter types match

2. **Test individual tools:**
   ```bash
   python test_server.py
   ```

3. **Check task storage:**
   ```bash
   cat ~/.manus_tasks.json
   # Should be valid JSON
   ```

### Slow Performance

**Symptom:** Tools take long time to respond

**Solutions:**

1. **Check task file size:**
   ```bash
   ls -lh ~/.manus_tasks.json
   # If very large, consider archiving old tasks
   ```

2. **Monitor resource usage:**
   ```bash
   top -p $(pgrep -f manus_server)
   ```

3. **Consider database backend** for large task volumes

## Support Resources

- **MCP Documentation**: https://modelcontextprotocol.io
- **VSCode MCP Guide**: Check VSCode documentation
- **Test Script**: Run `python test_server.py` to diagnose issues
- **Logs**: Check VSCode Output panel → MCP

## Next Steps

Now that you have the integration working:

1. **Experiment** with different task types
2. **Develop workflows** that leverage both Claude Code and Manus
3. **Share feedback** on what works well and what could be improved
4. **Explore advanced features** like custom priorities and filtering

---

**Happy integrating!** The Manus MCP Server bridges the gap between immediate coding assistance and complex task execution.

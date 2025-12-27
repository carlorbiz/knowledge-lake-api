#!/usr/bin/env python3
"""
Manus MCP Server - Task Management Tools for Claude Code Integration

This MCP server provides task management capabilities that allow Claude Code
to delegate tasks to Manus and retrieve results.
"""

import asyncio
import json
import logging
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from mcp.server.fastmcp import FastMCP

# Import Knowledge Lake client
try:
    from knowledge_lake_client import get_knowledge_lake_client
except ImportError:
    logger.warning("knowledge_lake_client not found - Knowledge Lake features will be unavailable")
    get_knowledge_lake_client = None

# Configure logging to stderr (required for STDIO transport)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("manus-task-manager")

# Task storage (in-memory for simplicity, can be extended to persistent storage)
TASKS = {}
TASKS_FILE = Path.home() / ".manus_tasks.json"


class TaskStatus:
    """Task status constants"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Task:
    """Task data structure"""
    def __init__(self, task_id: str, description: str, context: str = "", priority: str = "medium"):
        self.task_id = task_id
        self.description = description
        self.context = context
        self.priority = priority
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.created_at = datetime.now().isoformat()
        self.updated_at = self.created_at
        self.completed_at = None

    def to_dict(self) -> dict:
        """Convert task to dictionary"""
        return {
            "task_id": self.task_id,
            "description": self.description,
            "context": self.context,
            "priority": self.priority,
            "status": self.status,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "completed_at": self.completed_at
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Task':
        """Create task from dictionary"""
        task = cls(
            task_id=data["task_id"],
            description=data["description"],
            context=data.get("context", ""),
            priority=data.get("priority", "medium")
        )
        task.status = data.get("status", TaskStatus.PENDING)
        task.result = data.get("result")
        task.error = data.get("error")
        task.created_at = data.get("created_at", task.created_at)
        task.updated_at = data.get("updated_at", task.updated_at)
        task.completed_at = data.get("completed_at")
        return task


def load_tasks():
    """Load tasks from persistent storage"""
    global TASKS
    try:
        if TASKS_FILE.exists():
            with open(TASKS_FILE, 'r') as f:
                data = json.load(f)
                TASKS = {task_id: Task.from_dict(task_data) for task_id, task_data in data.items()}
                logger.info(f"Loaded {len(TASKS)} tasks from storage")
    except Exception as e:
        logger.error(f"Error loading tasks: {e}")
        TASKS = {}


def save_tasks():
    """Save tasks to persistent storage"""
    try:
        with open(TASKS_FILE, 'w') as f:
            data = {task_id: task.to_dict() for task_id, task in TASKS.items()}
            json.dump(data, f, indent=2)
            logger.info(f"Saved {len(TASKS)} tasks to storage")
    except Exception as e:
        logger.error(f"Error saving tasks: {e}")


# Load tasks on startup
load_tasks()


@mcp.tool()
async def assign_task(description: str, context: str = "", priority: str = "medium") -> str:
    """Assign a new task to Manus for execution.
    
    This tool creates a new task that will be processed by Manus. The task is assigned
    a unique ID and initially set to 'pending' status. Use get_task_status() to check
    progress and get_task_result() to retrieve the final result.
    
    Args:
        description: Clear description of the task to be performed
        context: Additional context, requirements, or constraints for the task
        priority: Task priority level - 'low', 'medium', or 'high' (default: 'medium')
    
    Returns:
        JSON string containing the task_id and confirmation message
    
    Example:
        assign_task(
            description="Create a Python script to analyze CSV data",
            context="The CSV has columns: date, sales, region. Calculate total sales by region.",
            priority="high"
        )
    """
    try:
        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if priority not in valid_priorities:
            return json.dumps({
                "success": False,
                "error": f"Invalid priority '{priority}'. Must be one of: {', '.join(valid_priorities)}"
            })
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Create new task
        task = Task(
            task_id=task_id,
            description=description,
            context=context,
            priority=priority
        )
        
        # Store task
        TASKS[task_id] = task
        save_tasks()
        
        logger.info(f"Created new task: {task_id} - {description[:50]}...")
        
        return json.dumps({
            "success": True,
            "task_id": task_id,
            "message": f"Task assigned successfully with ID: {task_id}",
            "status": task.status,
            "priority": task.priority,
            "created_at": task.created_at
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error assigning task: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_task_status(task_id: str) -> str:
    """Get the current status of a task.
    
    Check the execution status of a previously assigned task. Status values include:
    - 'pending': Task is waiting to be processed
    - 'in_progress': Task is currently being executed
    - 'completed': Task has finished successfully
    - 'failed': Task encountered an error
    
    Args:
        task_id: The unique identifier of the task (returned by assign_task)
    
    Returns:
        JSON string containing task status and metadata
    
    Example:
        get_task_status(task_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    """
    try:
        if task_id not in TASKS:
            return json.dumps({
                "success": False,
                "error": f"Task not found: {task_id}"
            })
        
        task = TASKS[task_id]
        
        response = {
            "success": True,
            "task_id": task.task_id,
            "status": task.status,
            "description": task.description,
            "priority": task.priority,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
        
        if task.status == TaskStatus.COMPLETED:
            response["completed_at"] = task.completed_at
            response["has_result"] = task.result is not None
        elif task.status == TaskStatus.FAILED:
            response["error"] = task.error
        
        return json.dumps(response, indent=2)
        
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_task_result(task_id: str) -> str:
    """Get the result of a completed task.
    
    Retrieve the output or result from a task that has finished execution.
    If the task is not yet completed, this will return the current status instead.
    
    Args:
        task_id: The unique identifier of the task (returned by assign_task)
    
    Returns:
        JSON string containing the task result or current status
    
    Example:
        get_task_result(task_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    """
    try:
        if task_id not in TASKS:
            return json.dumps({
                "success": False,
                "error": f"Task not found: {task_id}"
            })
        
        task = TASKS[task_id]
        
        if task.status == TaskStatus.COMPLETED:
            return json.dumps({
                "success": True,
                "task_id": task.task_id,
                "status": task.status,
                "result": task.result,
                "completed_at": task.completed_at
            }, indent=2)
        elif task.status == TaskStatus.FAILED:
            return json.dumps({
                "success": False,
                "task_id": task.task_id,
                "status": task.status,
                "error": task.error
            }, indent=2)
        else:
            return json.dumps({
                "success": False,
                "task_id": task.task_id,
                "status": task.status,
                "message": f"Task is not yet completed. Current status: {task.status}"
            }, indent=2)
        
    except Exception as e:
        logger.error(f"Error getting task result: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def list_my_tasks(status_filter: str = "all", limit: int = 50) -> str:
    """List all tasks with optional filtering.
    
    Retrieve a list of all tasks, optionally filtered by status. Tasks are returned
    in reverse chronological order (newest first).
    
    Args:
        status_filter: Filter by status - 'all', 'pending', 'in_progress', 'completed', or 'failed' (default: 'all')
        limit: Maximum number of tasks to return (default: 50)
    
    Returns:
        JSON string containing array of task summaries
    
    Example:
        list_my_tasks(status_filter="pending", limit=10)
    """
    try:
        # Get all tasks sorted by creation time (newest first)
        all_tasks = sorted(TASKS.values(), key=lambda t: t.created_at, reverse=True)
        
        # Apply status filter
        if status_filter != "all":
            valid_statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.FAILED]
            if status_filter not in valid_statuses:
                return json.dumps({
                    "success": False,
                    "error": f"Invalid status filter '{status_filter}'. Must be 'all' or one of: {', '.join(valid_statuses)}"
                })
            all_tasks = [t for t in all_tasks if t.status == status_filter]
        
        # Apply limit
        tasks_to_return = all_tasks[:limit]
        
        # Build response
        task_list = []
        for task in tasks_to_return:
            task_summary = {
                "task_id": task.task_id,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "created_at": task.created_at
            }
            if task.status == TaskStatus.COMPLETED:
                task_summary["completed_at"] = task.completed_at
            task_list.append(task_summary)
        
        return json.dumps({
            "success": True,
            "total_tasks": len(TASKS),
            "filtered_count": len(all_tasks),
            "returned_count": len(task_list),
            "status_filter": status_filter,
            "tasks": task_list
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error listing tasks: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def update_task_status(task_id: str, status: str, result: str = None, error: str = None) -> str:
    """Update the status of a task (internal use).
    
    This tool is primarily for internal use or testing. It allows manual updates to task status.
    In production, task status would typically be updated by the Manus execution system.
    
    Args:
        task_id: The unique identifier of the task
        status: New status - 'pending', 'in_progress', 'completed', or 'failed'
        result: Task result (for completed tasks)
        error: Error message (for failed tasks)
    
    Returns:
        JSON string confirming the update
    """
    try:
        if task_id not in TASKS:
            return json.dumps({
                "success": False,
                "error": f"Task not found: {task_id}"
            })
        
        valid_statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.FAILED]
        if status not in valid_statuses:
            return json.dumps({
                "success": False,
                "error": f"Invalid status '{status}'. Must be one of: {', '.join(valid_statuses)}"
            })
        
        task = TASKS[task_id]
        task.status = status
        task.updated_at = datetime.now().isoformat()
        
        if status == TaskStatus.COMPLETED:
            task.result = result
            task.completed_at = datetime.now().isoformat()
        elif status == TaskStatus.FAILED:
            task.error = error
        
        save_tasks()
        
        logger.info(f"Updated task {task_id} to status: {status}")
        
        return json.dumps({
            "success": True,
            "task_id": task_id,
            "status": status,
            "updated_at": task.updated_at
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error updating task status: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


def main():
    """Main entry point for the MCP server"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manus MCP Task Manager Server')
    parser.add_argument('--transport', choices=['stdio', 'sse'], default='stdio',
                       help='Transport protocol to use (default: stdio)')
    parser.add_argument('--port', type=int, default=8123,
                       help='Port for SSE transport (default: 8123)')
    
    args = parser.parse_args()
    
    logger.info(f"Starting Manus MCP Server with {args.transport} transport")
    
    if args.transport == 'stdio':
        # Run with STDIO transport (for local VSCode integration)
        mcp.run(transport='stdio')
    else:
        # Run with SSE transport (for remote access)
        logger.info(f"Server will be available at http://localhost:{args.port}")
        mcp.run(transport='sse', port=args.port)


if __name__ == "__main__":
    main()

# ============================================================================
# Knowledge Lake Integration Tools
# ============================================================================

@mcp.tool()
async def query_knowledge_lake(query: str = "", limit: int = 10) -> str:
    """Query conversations from Knowledge Lake API.
    
    Search for conversations in the Knowledge Lake database. Use empty query
    to retrieve all conversations, or provide search terms to filter results.
    
    Args:
        query: Search query (empty string returns all conversations)
        limit: Maximum number of results to return (default: 10)
    
    Returns:
        JSON string containing conversation results with metadata
    
    Example:
        query_knowledge_lake(query="hybrid architecture", limit=5)
    """
    try:
        client = get_knowledge_lake_client()
        conversations = client.query_conversations(query=query, limit=limit)
        
        return json.dumps({
            "success": True,
            "count": len(conversations),
            "query": query,
            "conversations": conversations
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error querying Knowledge Lake: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_complex_conversations(only_pending: bool = True, limit: int = 50) -> str:
    """Get complex conversations requiring multi-pass extraction.
    
    Retrieve conversations flagged as complex that need multi-pass extraction.
    Can filter to show only pending (not yet extracted) conversations.
    
    Args:
        only_pending: If True, only return conversations not yet extracted (default: True)
        limit: Maximum number of results (default: 50)
    
    Returns:
        JSON string containing complex conversations with classification metadata
    
    Example:
        get_complex_conversations(only_pending=True, limit=10)
    """
    try:
        client = get_knowledge_lake_client()
        conversations = client.get_complex_conversations(
            only_pending=only_pending,
            limit=limit
        )
        
        # Add summary statistics
        total_words = sum(c.get('word_count', 0) for c in conversations)
        avg_complexity = (
            sum(c.get('complexity_score', 0) for c in conversations) / len(conversations)
            if conversations else 0
        )
        
        return json.dumps({
            "success": True,
            "count": len(conversations),
            "only_pending": only_pending,
            "total_words": total_words,
            "avg_complexity_score": round(avg_complexity, 2),
            "conversations": conversations
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error getting complex conversations: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_knowledge_lake_stats() -> str:
    """Get Knowledge Lake API statistics.
    
    Retrieve overall statistics about the Knowledge Lake database including
    total conversations, entities, and classification breakdown.
    
    Returns:
        JSON string containing database statistics
    
    Example:
        get_knowledge_lake_stats()
    """
    try:
        client = get_knowledge_lake_client()
        
        # Get stats
        stats = client.get_stats()
        
        # Get all conversations to build classification breakdown
        all_conversations = client.query_conversations(query="", limit=200)
        
        # Count classifications
        classifications = {}
        for conv in all_conversations:
            classification = conv.get('complexity_classification', 'unknown')
            classifications[classification] = classifications.get(classification, 0) + 1
        
        # Count pending multi-pass
        pending_multipass = sum(
            1 for c in all_conversations
            if c.get('requires_multipass') is True
            and c.get('multipass_extracted') is not True
        )
        
        if stats:
            stats['classification_breakdown'] = classifications
            stats['pending_multipass_count'] = pending_multipass
        
        return json.dumps({
            "success": True,
            "stats": stats,
            "classification_breakdown": classifications,
            "pending_multipass": pending_multipass
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error getting Knowledge Lake stats: {e}")
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def check_knowledge_lake_health() -> str:
    """Check if Knowledge Lake API is healthy and accessible.
    
    Verify connectivity to the Knowledge Lake API endpoint. Useful for
    troubleshooting and monitoring API availability.
    
    Returns:
        JSON string indicating health status
    
    Example:
        check_knowledge_lake_health()
    """
    try:
        client = get_knowledge_lake_client()
        is_healthy = client.health_check()
        
        return json.dumps({
            "success": True,
            "api_url": client.api_url,
            "healthy": is_healthy,
            "message": "Knowledge Lake API is healthy" if is_healthy else "Knowledge Lake API is not responding"
        }, indent=2)
        
    except Exception as e:
        logger.error(f"Error checking Knowledge Lake health: {e}")
        return json.dumps({
            "success": False,
            "error": str(e),
            "healthy": False
        })


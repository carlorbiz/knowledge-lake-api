#!/usr/bin/env python3
"""
CC Auto-Processor - Autonomous task processor that watches for tasks and executes them
This runs continuously and processes tasks using Claude Code's capabilities
"""

import os
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Directories
TASKS_DIR = Path(__file__).parent / "tasks"
PENDING_DIR = TASKS_DIR / "pending"
COMPLETED_DIR = TASKS_DIR / "completed"

# Create directories
for dir_path in [TASKS_DIR, PENDING_DIR, COMPLETED_DIR]:
    dir_path.mkdir(exist_ok=True)

def execute_command(command):
    """Execute a command and return the result"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
            timeout=60
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except subprocess.TimeoutExpired:
        return "[ERROR] Command timed out after 60 seconds"
    except Exception as e:
        return f"[ERROR] {str(e)}"

def process_task(task_data):
    """Process a task and return the response"""
    task = task_data['task']
    issue_number = task_data['issue_number']
    user = task_data['user']

    print(f"\n[PROCESSING] Task #{issue_number} from @{user}")
    print(f"Task: {task}")

    response_parts = []
    response_parts.append(f"# Task #{issue_number}: {task}")
    response_parts.append(f"# Requested by: @{user}")
    response_parts.append(f"# Processed: {datetime.now().isoformat()}")
    response_parts.append("")

    # Parse the task and execute appropriate commands
    task_lower = task.lower()

    if 'list files' in task_lower or 'list directory' in task_lower or 'show files' in task_lower:
        # List files command
        if 'cc-slack-integration' in task_lower:
            result = execute_command("dir cc-slack-integration /b")
        else:
            result = execute_command("dir /b")

        response_parts.append("## Files in directory:")
        response_parts.append("```")
        response_parts.append(result)
        response_parts.append("```")

    elif 'check' in task_lower and ('issue' in task_lower or 'github' in task_lower):
        # Check GitHub issues
        result = execute_command('gh issue list --repo carlorbiz/cc-task-queue --label pending --limit 10')
        response_parts.append("## Pending GitHub Issues:")
        response_parts.append("```")
        response_parts.append(result if result else "No pending issues found")
        response_parts.append("```")

    elif 'status' in task_lower or 'health' in task_lower:
        # System status
        response_parts.append("## System Status:")
        response_parts.append("- CC Auto-Processor: ✓ Running")
        response_parts.append("- Task Queue: ✓ Active")
        response_parts.append("- Processing Directory: " + str(PENDING_DIR))

    else:
        # Generic response for unrecognized tasks
        response_parts.append("## Task Received")
        response_parts.append(f"I received your task: '{task}'")
        response_parts.append("")
        response_parts.append("**Available commands:**")
        response_parts.append("- `list files` - Show files in directory")
        response_parts.append("- `check github issues` - Show pending tasks")
        response_parts.append("- `status` - Show system health")
        response_parts.append("")
        response_parts.append("For other tasks, I'll process them as capabilities expand!")

    response_parts.append("")
    response_parts.append("---")
    response_parts.append("*Processed by Claude Code Auto-Processor*")

    return "\n".join(response_parts)

def monitor_loop():
    """Main monitoring loop"""
    print("[START] CC Auto-Processor started")
    print(f"[INFO] Monitoring: {PENDING_DIR}")
    print(f"[INFO] Responses: {COMPLETED_DIR}")
    print("=" * 60)

    processed = set()

    while True:
        try:
            # Check for pending tasks
            pending_files = list(PENDING_DIR.glob("*.json"))

            for task_file in pending_files:
                if task_file.name in processed:
                    continue

                # Read task
                with open(task_file, 'r') as f:
                    task_data = json.load(f)

                # Process it
                response = process_task(task_data)

                # Write response
                response_file = COMPLETED_DIR / f"{task_file.stem}_response.txt"
                with open(response_file, 'w', encoding='utf-8', errors='replace') as f:
                    f.write(response)

                print(f"[COMPLETE] Response written to {response_file.name}")

                # Mark as processed and clean up
                processed.add(task_file.name)
                task_file.unlink()

            time.sleep(5)

        except KeyboardInterrupt:
            print("\n[STOP] Auto-processor stopped")
            break
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            time.sleep(5)

if __name__ == '__main__':
    monitor_loop()

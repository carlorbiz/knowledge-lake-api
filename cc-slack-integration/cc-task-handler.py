#!/usr/bin/env python3
"""
CC Task Handler - Processes tasks from the queue and returns responses
This script runs alongside Claude Code and processes incoming tasks
"""

import os
import json
import time
from pathlib import Path
from datetime import datetime

# Directories for task queue
TASKS_DIR = Path(__file__).parent / "tasks"
PENDING_DIR = TASKS_DIR / "pending"
PROCESSING_DIR = TASKS_DIR / "processing"
COMPLETED_DIR = TASKS_DIR / "completed"

# Create directories if they don't exist
for dir_path in [TASKS_DIR, PENDING_DIR, PROCESSING_DIR, COMPLETED_DIR]:
    dir_path.mkdir(exist_ok=True)

def get_pending_tasks():
    """Get all pending task files"""
    return list(PENDING_DIR.glob("*.json"))

def process_task_file(task_file):
    """Process a single task file"""
    # Read task
    with open(task_file, 'r') as f:
        task_data = json.load(f)

    issue_number = task_data['issue_number']
    task_text = task_data['task']
    user = task_data['user']

    print(f"\n[TASK #{issue_number}] From @{user}")
    print(f"Task: {task_text}")
    print("-" * 60)

    # Move to processing
    processing_file = PROCESSING_DIR / task_file.name
    task_file.rename(processing_file)

    # Create response file for Claude Code to fill in
    response_file = COMPLETED_DIR / f"{task_file.stem}_response.txt"

    with open(response_file, 'w') as f:
        f.write(f"# Task #{issue_number}: {task_text}\n")
        f.write(f"# Requested by: @{user}\n")
        f.write(f"# Time: {datetime.now().isoformat()}\n\n")
        f.write("# CLAUDE CODE: Please process this task and write your response below:\n")
        f.write("# Delete these instruction lines and add your actual response\n\n")

    print(f"[INFO] Response file created: {response_file.name}")
    print(f"[WAITING] Waiting for Claude Code to process and fill in response...")

    return {
        'issue_number': issue_number,
        'task_file': processing_file,
        'response_file': response_file
    }

def check_for_completed_responses():
    """Check if any responses have been completed"""
    completed_tasks = []

    for response_file in COMPLETED_DIR.glob("*_response.txt"):
        # Check if it's been filled in (file is larger than template)
        if response_file.stat().st_size > 300:  # Template is ~200 bytes
            with open(response_file, 'r') as f:
                content = f.read()

            # Check if instruction lines were removed
            if "# CLAUDE CODE:" not in content:
                # This response is complete!
                task_id = response_file.stem.replace('_response', '')
                completed_tasks.append({
                    'task_id': task_id,
                    'response': content,
                    'response_file': response_file
                })

    return completed_tasks

def monitor_loop():
    """Main monitoring loop"""
    print("[START] CC Task Handler started")
    print(f"[INFO] Watching: {PENDING_DIR}")
    print(f"[INFO] Responses go to: {COMPLETED_DIR}")
    print("=" * 60)

    processed_tasks = {}

    while True:
        try:
            # Check for new pending tasks
            pending = get_pending_tasks()

            for task_file in pending:
                if task_file.name not in processed_tasks:
                    task_info = process_task_file(task_file)
                    processed_tasks[task_file.name] = task_info

            # Check for completed responses
            completed = check_for_completed_responses()

            for task in completed:
                print(f"\n[COMPLETE] Task {task['task_id']} response ready!")
                print(f"Response preview: {task['response'][:100]}...")
                # The monitor will pick this up and post to GitHub

            time.sleep(5)

        except KeyboardInterrupt:
            print("\n[STOP] Task handler stopped")
            break
        except Exception as e:
            print(f"[ERROR] {str(e)}")
            time.sleep(5)

if __name__ == '__main__':
    monitor_loop()

#!/usr/bin/env python3
"""
CC Slack Monitor - Polls GitHub for tasks from Slack agents
Responds to tasks and notifies Slack when complete
"""

import os
import time
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_OWNER = os.getenv('GITHUB_OWNER', 'carlorbiz')
REPO_NAME = 'cc-task-queue'
POLL_INTERVAL = 30  # seconds
SLACK_WEBHOOK = os.getenv('N8N_SLACK_RESPONSE_WEBHOOK')

def get_pending_issues():
    """Get all open issues with 'pending' label"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/issues'
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    params = {
        'state': 'open',
        'labels': 'pending',
        'sort': 'created',
        'direction': 'asc'
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching issues: {response.status_code}")
        return []

def parse_issue_body(body):
    """Extract metadata from issue body"""
    metadata = {}
    lines = body.split('\n')

    for line in lines:
        if line.startswith('**From:**'):
            metadata['from_user'] = line.replace('**From:**', '').strip()
        elif line.startswith('**Channel:**'):
            metadata['channel_id'] = line.replace('**Channel:**', '').strip()
        elif line.startswith('**Response URL:**'):
            metadata['response_url'] = line.replace('**Response URL:**', '').strip()

    # Extract task (after ## Task and before ---)
    if '## Task' in body:
        task_start = body.index('## Task') + len('## Task')
        task_end = body.index('---', task_start) if '---' in body[task_start:] else len(body)
        metadata['task'] = body[task_start:task_end].strip()

    return metadata

def add_comment_to_issue(issue_number, comment_body):
    """Add a comment to a GitHub issue"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/issues/{issue_number}/comments'
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    data = {'body': comment_body}

    response = requests.post(url, headers=headers, json=data)
    return response.status_code == 201

def close_issue(issue_number):
    """Close a GitHub issue"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/issues/{issue_number}'
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    data = {'state': 'closed'}

    response = requests.patch(url, headers=headers, json=data)
    return response.status_code == 200

def update_issue_labels(issue_number, labels):
    """Update issue labels"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/issues/{issue_number}/labels'
    headers = {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }
    data = {'labels': labels}

    response = requests.put(url, headers=headers, json=data)
    return response.status_code == 200

def send_slack_response(channel_id, message, response_url=None):
    """Send response back to Slack via n8n webhook"""
    if not SLACK_WEBHOOK:
        print("No Slack webhook configured, skipping response")
        return False

    payload = {
        'channel_id': channel_id,
        'message': message,
        'response_url': response_url
    }

    response = requests.post(SLACK_WEBHOOK, json=payload)
    return response.status_code == 200

def process_task(task_text, issue_number, user_name):
    """
    Process the task using file-based queue for Claude Code
    Writes task to file, waits for CC to process it
    """
    from pathlib import Path

    # Setup task queue directories
    tasks_dir = Path(__file__).parent / "tasks"
    pending_dir = tasks_dir / "pending"
    completed_dir = tasks_dir / "completed"

    # Create directories if needed
    for dir_path in [tasks_dir, pending_dir, completed_dir]:
        dir_path.mkdir(exist_ok=True)

    # Write task to pending queue
    task_file = pending_dir / f"task_{issue_number}.json"
    task_data = {
        'issue_number': issue_number,
        'task': task_text,
        'user': user_name,
        'timestamp': datetime.now().isoformat()
    }

    with open(task_file, 'w') as f:
        json.dump(task_data, f, indent=2)

    print(f"   [QUEUED] Task written to {task_file.name}")
    print(f"   [WAITING] Waiting for Claude Code to process...")

    # Wait for response (with timeout)
    response_file = completed_dir / f"task_{issue_number}_response.txt"
    timeout = 300  # 5 minutes
    start_time = time.time()

    while time.time() - start_time < timeout:
        if response_file.exists() and response_file.stat().st_size > 300:
            # Check if response is complete (no instruction template)
            with open(response_file, 'r') as f:
                response = f.read()

            if "# CLAUDE CODE:" not in response:
                print(f"   [RESPONSE] Received from Claude Code!")
                # Clean up
                task_file.unlink(missing_ok=True)
                response_file.unlink()
                return response

        time.sleep(2)

    # Timeout - return placeholder
    print(f"   [TIMEOUT] No response after {timeout}s, using placeholder")
    return f"""[QUEUED] Task Queued for Claude Code

**Task:** {task_text}

**Status:** Waiting for processing
**Issue:** #{issue_number}

_Claude Code will process this task and update the response._
"""

def monitor_loop():
    """Main monitoring loop"""
    print(f"[START] CC Slack Monitor started")
    print(f"[INFO] Polling GitHub repo: {GITHUB_OWNER}/{REPO_NAME}")
    print(f"[INFO] Poll interval: {POLL_INTERVAL}s")
    print(f"{'='*60}")

    while True:
        try:
            issues = get_pending_issues()

            if issues:
                print(f"\n[FOUND] Found {len(issues)} pending task(s)")

                for issue in issues:
                    print(f"\n[PROCESSING] Processing: #{issue['number']} - {issue['title']}")

                    # Parse issue metadata
                    metadata = parse_issue_body(issue['body'])
                    task = metadata.get('task', issue['title'])
                    channel_id = metadata.get('channel_id', '')
                    response_url = metadata.get('response_url', '')
                    from_user = metadata.get('from_user', 'unknown')

                    # Update to 'processing'
                    update_issue_labels(issue['number'], ['cc-task', 'from-slack', 'processing'])

                    # Process the task
                    try:
                        response = process_task(task, issue['number'], from_user)

                        # Add response as comment
                        add_comment_to_issue(issue['number'], response)

                        # Send to Slack
                        if channel_id:
                            slack_message = f"[OK] **Task Complete**\n\n{response}\n\n_Requested by @{from_user}_"
                            send_slack_response(channel_id, slack_message, response_url)

                        # Close issue
                        close_issue(issue['number'])
                        update_issue_labels(issue['number'], ['cc-task', 'from-slack', 'completed'])

                        print(f"   [OK] Completed and closed #{issue['number']}")

                    except Exception as e:
                        error_msg = f"[ERROR] **Error Processing Task**\n\n```\n{str(e)}\n```"
                        add_comment_to_issue(issue['number'], error_msg)
                        update_issue_labels(issue['number'], ['cc-task', 'from-slack', 'error'])
                        print(f"   [ERROR] Error: {str(e)}")

            else:
                print(f"[WAITING] No pending tasks (checked {datetime.now().strftime('%H:%M:%S')})", end='\r')

            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            print("\n\n[STOP] Monitor stopped by user")
            break
        except Exception as e:
            print(f"\n[ERROR] Error in monitor loop: {str(e)}")
            time.sleep(POLL_INTERVAL)

if __name__ == '__main__':
    # Check for required environment variables
    if not GITHUB_TOKEN:
        print("[ERROR] GITHUB_TOKEN environment variable not set")
        exit(1)

    monitor_loop()

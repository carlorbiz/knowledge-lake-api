#!/usr/bin/env python3
"""Quick script to check recent GitHub issues"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_OWNER = os.getenv('GITHUB_OWNER', 'carlorbiz')
REPO_NAME = 'cc-task-queue'

url = f'https://api.github.com/repos/{GITHUB_OWNER}/{REPO_NAME}/issues'
headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}
params = {
    'state': 'open',
    'per_page': 10,
    'sort': 'created',
    'direction': 'desc'
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    issues = response.json()
    if issues:
        print(f"[INFO] Found {len(issues)} open issue(s):\n")
        for issue in issues:
            labels = [l['name'] for l in issue['labels']]
            print(f"#{issue['number']}: {issue['title']}")
            print(f"  Labels: {labels}")
            print(f"  Created: {issue['created_at']}")
            print(f"  State: {issue['state']}")
            print()
    else:
        print("[INFO] No open issues found")
else:
    print(f"[ERROR] GitHub API error: {response.status_code}")
    print(response.text)

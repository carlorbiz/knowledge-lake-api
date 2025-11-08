from dotenv import load_dotenv
import os
import requests

load_dotenv()

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_OWNER = os.getenv('GITHUB_OWNER')

# Check if cc-task-queue repo exists
url = f'https://api.github.com/repos/{GITHUB_OWNER}/cc-task-queue'
headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

response = requests.get(url, headers=headers)

print(f"Checking: {GITHUB_OWNER}/cc-task-queue")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    repo = response.json()
    print(f"[OK] Repository exists!")
    print(f"   - Name: {repo['name']}")
    print(f"   - Private: {repo['private']}")
    print(f"   - URL: {repo['html_url']}")
elif response.status_code == 404:
    print(f"[NOT FOUND] Repository does not exist - needs to be created")
else:
    print(f"[ERROR] Error: {response.status_code}")
    print(f"   Message: {response.json().get('message', 'Unknown error')}")

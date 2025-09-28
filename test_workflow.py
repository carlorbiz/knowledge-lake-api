#!/usr/bin/env python3
"""
Test the Course Recommendation Engine workflow
"""

import requests
import json

def test_workflow():
    n8n_url = "http://localhost:5678"
    n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"

    headers = {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": n8n_api_key
    }

    # Get workflow ID
    workflows = requests.get(f"{n8n_url}/api/v1/workflows", headers=headers).json()

    target_workflow_id = None
    for wf in workflows.get('data', workflows):
        if isinstance(wf, dict) and "Course Recommendation Engine" in wf.get('name', ''):
            target_workflow_id = wf.get('id')
            break

    if not target_workflow_id:
        print("ERROR: Could not find Course Recommendation Engine workflow")
        return

    print(f"Found workflow ID: {target_workflow_id}")

    # Test data
    test_data = {
        "audience": "Healthcare Clinical",
        "course_concept": "Infection Control Best Practices"
    }

    # Execute workflow
    print("Testing workflow execution...")
    try:
        response = requests.post(
            f"{n8n_url}/api/v1/workflows/{target_workflow_id}/execute",
            json={"data": test_data},
            headers=headers
        )

        if response.status_code == 200:
            print("SUCCESS: Workflow executed successfully")
            result = response.json()
            print(f"Execution ID: {result.get('executionId', 'N/A')}")
        else:
            print(f"ERROR: Workflow execution failed: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_workflow()
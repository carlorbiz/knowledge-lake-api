#!/usr/bin/env python3
"""
The Phoenix Generator: A Sophisticated, Uncompromised, and Fully Automated
n8n Workflow Generation Script - CORRECTED STRUCTURE VERSION
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, List, Any

class WorkflowGenerator:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def test_n8n_connection(self) -> bool:
        """Test if n8n API is accessible"""
        if not self.n8n_api_key:
            print("FATAL: N8N_API_KEY environment variable not set. Please set it before running.")
            return False
        try:
            response = requests.get(f"{self.n8n_url}/api/v1/workflows", headers=self.headers, timeout=5)
            print(f"n8n API Connection Status: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"n8n API Connection Error: {e}")
            return False

    def create_orchestrator_workflow(self) -> Dict:
        """Generates the master Course Orchestrator workflow exactly as specified."""

        sheet_url = "https://docs.google.com/spreadsheets/d/1fK-4Bgq9ju1jV2ouk_yVpTYS3AZZhCuo7DhOOgnj8kA/edit?gid=1878873675#gid=1878873675"
        spreadsheet_id = sheet_url.split('/d/')[1].split('/')[0]
        sheet_gid = sheet_url.split('gid=')[1].split('#')[0]

        workflow = {
            "name": "Course Orchestrator (Phoenix Rebuild)",
            "nodes": [
                # Google Sheets Trigger - exactly as specified
                {
                    "parameters": {
                        "authentication": "oAuth2",
                        "sheetId": spreadsheet_id,
                        "sheetName": f"gid:{sheet_gid}",
                        "events": ["sheetAppended"],
                        "options": {}
                    },
                    "id": "trigger-google-sheets",
                    "name": "On New Course Request",
                    "type": "n8n-nodes-base.googleSheetsTrigger",
                    "typeVersion": 1,
                    "position": [240, 300],
                    "credentials": {
                        "googleSheetsOAuth2Api": {
                            "name": "Google Service Account account"
                        }
                    }
                },
                # Set Initial Context - exactly as specified
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "course_title", "value": "{{ $json.body.Title }}"},
                                {"name": "target_audience", "value": "{{ $json.body.Audience }}"},
                                {"name": "source_urls", "value": "{{ $json.body.Sources }}"}
                            ]
                        },
                        "options": {}
                    },
                    "id": "set-initial-context",
                    "name": "Set Initial Context",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [460, 300]
                },
                # MCP Research Call - exactly as specified
                {
                    "parameters": {
                        "toolName": "research-agent",
                        "input": "Research topic: {{ $json.course_title }}. Sources: {{ $json.source_urls }}",
                        "options": {}
                    },
                    "id": "mcp-research",
                    "name": "MCP Call: Research",
                    "type": "n8n-nodes-mcp.mcp",
                    "typeVersion": 1,
                    "position": [680, 300]
                },
                # MCP Course Architect Call - exactly as specified
                {
                    "parameters": {
                        "toolName": "course-architect",
                        "input": "{{ JSON.stringify($json) }}",
                        "options": {}
                    },
                    "id": "mcp-architect",
                    "name": "MCP Call: Architect",
                    "type": "n8n-nodes-mcp.mcp",
                    "typeVersion": 1,
                    "position": [900, 300]
                },
                # Knowledge Lake Logging - exactly as specified with correct structure
                {
                    "parameters": {
                        "url": "http://localhost:3000/knowledge/add",
                        "method": "POST",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Course '{{ $json.course_title }}' architecture complete. Ready for module generation loop."},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"architecture_complete\", \"course_title\": \"{{ $json.course_title }}\"}"}
                            ]
                        }
                    },
                    "id": "log-to-lake",
                    "name": "Log to Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 300]
                }
            ],
            "connections": {
                "On New Course Request": {"main": [[{"node": "Set Initial Context", "type": "main", "index": 0}]]},
                "Set Initial Context": {"main": [[{"node": "MCP Call: Research", "type": "main", "index": 0}]]},
                "MCP Call: Research": {"main": [[{"node": "MCP Call: Architect", "type": "main", "index": 0}]]},
                "MCP Call: Architect": {"main": [[{"node": "Log to Knowledge Lake", "type": "main", "index": 0}]]}
            },
            "settings": {}
        }
        return workflow

    def deploy_workflow(self, workflow: Dict) -> bool:
        """Deploy workflow to n8n"""
        try:
            response = requests.post(
                f"{self.n8n_url}/api/v1/workflows",
                json=workflow,
                headers=self.headers
            )
            if response.status_code in [200, 201]:
                print(f"Deployed workflow: {workflow['name']}")
                return True
            else:
                print(f"Failed to deploy {workflow['name']}: {response.status_code}")
                print(f"Error: {response.text}")
                return False
        except Exception as e:
            print(f"Deployment error for {workflow['name']}: {e}")
            return False

    def generate_and_deploy_all(self):
        """Generate and deploy the orchestrator workflow"""
        print("Starting AI-Powered Workflow Recreation...")
        if not self.test_n8n_connection():
            return

        print("Building the 'Course Orchestrator' workflow...")
        orchestrator_workflow = self.create_orchestrator_workflow()

        print("NOTE: You must manually select your 'Google Service Account' credential in the 'On New Course Request' trigger node after deployment.")

        self.deploy_workflow(orchestrator_workflow)

        print("Workflow recreation complete.")
        print(f"Access n8n at: {self.n8n_url}")
        print("Please open the new 'Course Orchestrator' workflow and link the Google credential to finalize.")

if __name__ == "__main__":
    generator = WorkflowGenerator()
    generator.generate_and_deploy_all()
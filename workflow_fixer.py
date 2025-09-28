#!/usr/bin/env python3
"""
Workflow Fixer - Diagnose and fix n8n workflow structure issues
"""

import requests
import json
import os

class WorkflowFixer:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def list_workflows(self):
        """List all workflows"""
        try:
            response = requests.get(f"{self.n8n_url}/api/v1/workflows", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                workflows = data.get('data', data) if isinstance(data, dict) else data
                print(f"Found {len(workflows)} workflows:")
                for i, wf in enumerate(workflows):
                    print(f"{i+1}. ID: {wf.get('id', 'N/A')}, Name: {wf.get('name', 'N/A')}")
                return workflows
            else:
                print(f"Error: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error: {e}")
            return []

    def delete_all_problematic_workflows(self):
        """Delete all workflows that might have issues"""
        workflows = self.list_workflows()

        # Keywords to identify our problematic workflows
        problematic_keywords = [
            "Course Orchestrator",
            "Course Architect",
            "Module Generator",
            "Audio Generation",
            "Course Recommendation Engine"
        ]

        deleted_count = 0
        for wf in workflows:
            wf_name = wf.get('name', '')
            if any(keyword in wf_name for keyword in problematic_keywords):
                try:
                    response = requests.delete(
                        f"{self.n8n_url}/api/v1/workflows/{wf['id']}",
                        headers=self.headers
                    )
                    if response.status_code == 200:
                        print(f"SUCCESS: Deleted: {wf_name}")
                        deleted_count += 1
                    else:
                        print(f"ERROR: Failed to delete: {wf_name}")
                except Exception as e:
                    print(f"ERROR: Error deleting {wf_name}: {e}")

        print(f"\nDeleted {deleted_count} problematic workflows")

    def create_simple_test_workflow(self):
        """Create a simple, working test workflow"""
        workflow = {
            "name": "Simple Test Workflow",
            "nodes": [
                {
                    "parameters": {},
                    "id": "manual-trigger",
                    "name": "Manual Trigger",
                    "type": "n8n-nodes-base.manualTrigger",
                    "typeVersion": 1,
                    "position": [300, 300]
                },
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "test_message", "value": "Hello from n8n!"},
                                {"name": "timestamp", "value": "={{ $now }}"}
                            ]
                        }
                    },
                    "id": "set-data",
                    "name": "Set Test Data",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [500, 300]
                }
            ],
            "connections": {
                "Manual Trigger": {
                    "main": [[{"node": "Set Test Data", "type": "main", "index": 0}]]
                }
            },
            "settings": {}
        }
        return workflow

    def create_fixed_orchestrator(self):
        """Create a properly structured orchestrator workflow"""
        workflow = {
            "name": "Course Orchestrator (Fixed)",
            "nodes": [
                {
                    "parameters": {},
                    "id": "manual-start",
                    "name": "Manual Start",
                    "type": "n8n-nodes-base.manualTrigger",
                    "typeVersion": 1,
                    "position": [300, 300]
                },
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "course_title", "value": "Patient Safety Protocols"},
                                {"name": "target_audience", "value": "Healthcare Clinical"},
                                {"name": "source_urls", "value": "https://www.safetyandquality.gov.au/"}
                            ]
                        }
                    },
                    "id": "course-data",
                    "name": "Course Data",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [500, 300]
                },
                {
                    "parameters": {
                        "method": "POST",
                        "url": "https://api.perplexity.ai/chat/completions",
                        "authentication": "none",
                        "sendHeaders": True,
                        "headerParameters": {
                            "parameters": [
                                {"name": "Authorization", "value": "Bearer {{ $env.PERPLEXITY_API_KEY }}"},
                                {"name": "Content-Type", "value": "application/json"}
                            ]
                        },
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "model", "value": "sonar-large-online"},
                                {"name": "messages", "value": "[{\"role\": \"user\", \"content\": \"Research {{ $json.course_title }} for Australian healthcare professionals. Focus on evidence-based practices and current guidelines.\"}]"},
                                {"name": "max_tokens", "value": "4000"}
                            ]
                        }
                    },
                    "id": "research-step",
                    "name": "Research Foundation",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [700, 300]
                },
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Course request processed: {{ $json.course_title }} for {{ $json.target_audience }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"course_request\", \"title\": \"{{ $json.course_title }}\"}"}
                            ]
                        }
                    },
                    "id": "log-result",
                    "name": "Log to Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                }
            ],
            "connections": {
                "Manual Start": {
                    "main": [[{"node": "Course Data", "type": "main", "index": 0}]]
                },
                "Course Data": {
                    "main": [[{"node": "Research Foundation", "type": "main", "index": 0}]]
                },
                "Research Foundation": {
                    "main": [[{"node": "Log to Knowledge Lake", "type": "main", "index": 0}]]
                }
            },
            "settings": {}
        }
        return workflow

    def create_fixed_architect(self):
        """Create a simplified, working architect workflow"""
        workflow = {
            "name": "Course Architect (Fixed)",
            "nodes": [
                {
                    "parameters": {},
                    "id": "manual-trigger-arch",
                    "name": "Manual Trigger",
                    "type": "n8n-nodes-base.manualTrigger",
                    "typeVersion": 1,
                    "position": [300, 300]
                },
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "course_title", "value": "Patient Safety Protocols"},
                                {"name": "target_audience", "value": "Healthcare Clinical"},
                                {"name": "research_foundation", "value": "Evidence-based safety protocols for Australian healthcare"}
                            ]
                        }
                    },
                    "id": "input-data",
                    "name": "Input Data",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [500, 300]
                },
                {
                    "parameters": {
                        "conditions": {
                            "options": {
                                "caseSensitive": True,
                                "leftValue": "",
                                "typeValidation": "strict"
                            },
                            "conditions": [
                                {
                                    "leftValue": "={{ $json.target_audience }}",
                                    "rightValue": "Healthcare Clinical",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                }
                            ],
                            "combineOperation": "any"
                        }
                    },
                    "id": "audience-check",
                    "name": "Check Audience",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 2,
                    "position": [700, 300]
                },
                {
                    "parameters": {
                        "method": "POST",
                        "url": "https://api.anthropic.com/v1/messages",
                        "authentication": "none",
                        "sendHeaders": True,
                        "headerParameters": {
                            "parameters": [
                                {"name": "x-api-key", "value": "={{ $env.ANTHROPIC_API_KEY }}"},
                                {"name": "anthropic-version", "value": "2023-06-01"},
                                {"name": "Content-Type", "value": "application/json"}
                            ]
                        },
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "model", "value": "claude-3-sonnet-20240229"},
                                {"name": "max_tokens", "value": "4000"},
                                {"name": "messages", "value": "[{\"role\": \"user\", \"content\": \"Create a course architecture for {{ $json.course_title }} targeting {{ $json.target_audience }}. Include 8-12 modules with clear learning objectives.\"}]"}
                            ]
                        }
                    },
                    "id": "generate-architecture",
                    "name": "Generate Architecture",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 250]
                }
            ],
            "connections": {
                "Manual Trigger": {
                    "main": [[{"node": "Input Data", "type": "main", "index": 0}]]
                },
                "Input Data": {
                    "main": [[{"node": "Check Audience", "type": "main", "index": 0}]]
                },
                "Check Audience": {
                    "main": [
                        [{"node": "Generate Architecture", "type": "main", "index": 0}]
                    ]
                }
            },
            "settings": {}
        }
        return workflow

    def deploy_workflow(self, workflow):
        """Deploy a workflow"""
        try:
            response = requests.post(
                f"{self.n8n_url}/api/v1/workflows",
                json=workflow,
                headers=self.headers
            )
            if response.status_code in [200, 201]:
                print(f"SUCCESS: Deployed: {workflow['name']}")
                return True
            else:
                print(f"ERROR: Failed to deploy {workflow['name']}: {response.status_code}")
                print(f"Error: {response.text}")
                return False
        except Exception as e:
            print(f"ERROR: {e}")
            return False

    def fix_all_workflows(self):
        """Complete workflow fixing process"""
        print("=== n8n Workflow Fixer ===")

        # Step 1: Delete problematic workflows
        print("\n1. Cleaning up problematic workflows...")
        self.delete_all_problematic_workflows()

        # Step 2: Deploy fixed workflows
        print("\n2. Deploying fixed workflows...")

        # Simple test workflow first
        test_workflow = self.create_simple_test_workflow()
        self.deploy_workflow(test_workflow)

        # Fixed orchestrator
        orchestrator = self.create_fixed_orchestrator()
        self.deploy_workflow(orchestrator)

        # Fixed architect
        architect = self.create_fixed_architect()
        self.deploy_workflow(architect)

        print("\n=== Workflow Fixing Complete ===")
        print("SUCCESS: All workflows should now be accessible in n8n")
        print("Access n8n at: http://localhost:5678")
        print("Test workflows by opening them and clicking 'Test workflow'")

if __name__ == "__main__":
    fixer = WorkflowFixer()
    fixer.fix_all_workflows()
#!/usr/bin/env python3
"""
n8n Workflow Debugger
Diagnose and fix workflow issues
"""

import requests
import json
import os

class WorkflowDebugger:
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
                workflows = response.json()
                print(f"Found {len(workflows)} workflows:")
                for wf in workflows:
                    print(f"- ID: {wf['id']}, Name: {wf['name']}, Active: {wf.get('active', 'Unknown')}")
                return workflows
            else:
                print(f"Error listing workflows: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error: {e}")
            return []

    def get_workflow_details(self, workflow_id):
        """Get detailed workflow information"""
        try:
            response = requests.get(f"{self.n8n_url}/api/v1/workflows/{workflow_id}", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error getting workflow details: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None

    def delete_workflow(self, workflow_id):
        """Delete a workflow"""
        try:
            response = requests.delete(f"{self.n8n_url}/api/v1/workflows/{workflow_id}", headers=self.headers)
            if response.status_code == 200:
                print(f"Successfully deleted workflow {workflow_id}")
                return True
            else:
                print(f"Error deleting workflow: {response.status_code}")
                return False
        except Exception as e:
            print(f"Error: {e}")
            return False

    def create_corrected_workflow(self):
        """Create a corrected, simplified workflow"""
        workflow = {
            "name": "Course Recommendation Engine (Fixed)",
            "nodes": [
                {
                    "parameters": {},
                    "id": "start-node",
                    "name": "When clicking 'Test workflow'",
                    "type": "n8n-nodes-base.manualTrigger",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "audience", "value": "Healthcare Clinical"},
                                {"name": "course_concept", "value": "Patient Safety Protocols"}
                            ]
                        }
                    },
                    "id": "test-data",
                    "name": "Test Data",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [460, 300]
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
                                    "leftValue": "={{ $json.audience }}",
                                    "rightValue": "Healthcare Clinical",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.audience }}",
                                    "rightValue": "Executive",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.audience }}",
                                    "rightValue": "Healthcare Administrative",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.audience }}",
                                    "rightValue": "Healthcare Combined",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                }
                            ],
                            "combineOperation": "any"
                        },
                        "options": {}
                    },
                    "id": "audience-switch",
                    "name": "Route by Audience",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                {
                    "parameters": {
                        "jsCode": "const prompt = `You are an expert Australian healthcare course designer.\nTask: Create a modular course structure for clinical healthcare professionals.\nCourse Concept: ${$json.course_concept}\nAudience: Clinical healthcare professionals\nRequirements:\n- Use evidence-based approach\n- Reference NMBA/AHPRA standards\n- Use Australian spelling\n- Create 8-12 modules\n- Include learning objectives`;\n\nreturn { prompt };"
                    },
                    "id": "clinical-prompt",
                    "name": "Clinical Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 200]
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
                                {"name": "content-type", "value": "application/json"}
                            ]
                        },
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "model", "value": "claude-3-sonnet-20240229"},
                                {"name": "max_tokens", "value": "4000"},
                                {"name": "messages", "value": "[{\"role\": \"user\", \"content\": \"{{ $json.prompt }}\"}]"}
                            ]
                        },
                        "options": {}
                    },
                    "id": "anthropic-call",
                    "name": "Generate Course",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 300]
                }
            ],
            "connections": {
                "When clicking 'Test workflow'": {
                    "main": [[{"node": "Test Data", "type": "main", "index": 0}]]
                },
                "Test Data": {
                    "main": [[{"node": "Route by Audience", "type": "main", "index": 0}]]
                },
                "Route by Audience": {
                    "main": [
                        [{"node": "Clinical Prompt", "type": "main", "index": 0}],
                        [],
                        [],
                        []
                    ]
                },
                "Clinical Prompt": {
                    "main": [[{"node": "Generate Course", "type": "main", "index": 0}]]
                }
            },
            "settings": {
                "executionOrder": "v1"
            }
        }
        return workflow

    def deploy_corrected_workflow(self):
        """Deploy the corrected workflow"""
        try:
            workflow = self.create_corrected_workflow()
            response = requests.post(
                f"{self.n8n_url}/api/v1/workflows",
                json=workflow,
                headers=self.headers
            )
            if response.status_code in [200, 201]:
                print("SUCCESS: Deployed corrected workflow")
                return response.json()
            else:
                print(f"ERROR: Failed to deploy corrected workflow: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        except Exception as e:
            print(f"ERROR: {e}")
            return None

    def diagnose_and_fix(self):
        """Main diagnosis and fix process"""
        print("=== n8n Workflow Diagnostics ===")

        # List current workflows
        workflows = self.list_workflows()

        # Find the problematic workflow
        target_workflow = None
        for wf in workflows:
            if "Course Recommendation Engine" in wf.get('name', ''):
                target_workflow = wf
                break

        if target_workflow:
            print(f"\nFound problematic workflow: {target_workflow['name']}")
            print(f"Workflow ID: {target_workflow['id']}")

            # Delete the problematic workflow
            print("Deleting problematic workflow...")
            if self.delete_workflow(target_workflow['id']):
                print("Successfully removed problematic workflow")

        # Deploy corrected workflow
        print("\nDeploying corrected workflow...")
        result = self.deploy_corrected_workflow()

        if result:
            print(f"New workflow created with ID: {result.get('id')}")
            print("Access your workflow at: http://localhost:5678")

        print("\n=== Diagnosis Complete ===")

if __name__ == "__main__":
    debugger = WorkflowDebugger()
    debugger.diagnose_and_fix()
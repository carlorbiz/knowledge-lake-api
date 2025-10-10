#!/usr/bin/env python3
"""
Phoenix Orchestrator - Webhook Version
Eliminates Google Sheets credential issues by using webhook trigger
"""

import requests
import json

class PhoenixWebhookOrchestrator:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_orchestrator_workflow(self) -> dict:
        """Creates the Phoenix Orchestrator with webhook trigger - NO CREDENTIALS NEEDED"""

        workflow = {
            "name": "Course Orchestrator (Webhook)",
            "nodes": [
                # Webhook Trigger - NO CREDENTIALS REQUIRED
                {
                    "parameters": {
                        "path": "course-request",
                        "options": {}
                    },
                    "id": "webhook-course-request",
                    "name": "Course Request Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Validate and Set Initial Context
                {
                    "parameters": {
                        "jsCode": """
// Parse incoming webhook data from Google Sheet
console.log('Received webhook data:', JSON.stringify($json, null, 2));

// Extract course data (can handle different formats)
const courseTitle = $json.title || $json.course_title || $json.Title || 'Unknown Course';
const targetAudience = $json.audience || $json.target_audience || $json.Audience || 'General';
const sourceUrls = $json.sources || $json.source_urls || $json.Sources || '';

// Validate required fields
if (!courseTitle || courseTitle === 'Unknown Course') {
    throw new Error('Course title is required');
}

if (!targetAudience || targetAudience === 'General') {
    throw new Error('Target audience is required');
}

return {
    course_title: courseTitle,
    target_audience: targetAudience,
    source_urls: sourceUrls,
    timestamp: new Date().toISOString(),
    status: 'processing'
};
"""
                    },
                    "id": "validate-course-data",
                    "name": "Validate Course Data",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [460, 300]
                },
                # Research Foundation Generator (Perplexity)
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
                                {
                                    "name": "messages",
                                    "value": "[{\"role\": \"system\", \"content\": \"You are a research specialist for Australian healthcare professional development. Analyze provided sources and create comprehensive research foundations using Vancouver citation style.\"}, {\"role\": \"user\", \"content\": \"RESEARCH TASK: {{ $json.course_title }}\\n\\nSOURCES TO ANALYZE:\\n{{ $json.source_urls }}\\n\\nTARGET AUDIENCE: {{ $json.target_audience }}\\n\\nCreate a comprehensive research foundation that includes:\\n\\n**EXECUTIVE SUMMARY**\\n- Key evidence-based findings relevant to {{ $json.course_title }}\\n- Critical success factors for {{ $json.target_audience }}\\n\\n**EVIDENCE BASE**\\n- Current best practices and guidelines\\n- Australian regulatory and cultural considerations (AHPRA, NMBA where relevant)\\n- Recent research and evidence gaps\\n\\n**LEARNING FRAMEWORK RECOMMENDATIONS**\\n- Adult learning principles application\\n- Implementation insights for professional development\\n- Quality assurance and evaluation methods\\n\\n**AUSTRALIAN HEALTHCARE CONTEXT**\\n- Regulatory compliance requirements\\n- Cultural safety and diversity considerations\\n- Integration with existing healthcare systems\\n\\nUse Vancouver citation style [1], [2], etc. for all references. Focus on creating actionable insights for course development while maintaining academic rigour.\"}]"
                                },
                                {"name": "max_tokens", "value": "4000"},
                                {"name": "temperature", "value": "0.1"}
                            ]
                        }
                    },
                    "id": "research-foundation",
                    "name": "Generate Research Foundation",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [680, 300]
                },
                # Prepare Data for Course Architect
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "course_title", "value": "{{ $json.course_title }}"},
                                {"name": "target_audience", "value": "{{ $json.target_audience }}"},
                                {"name": "source_urls", "value": "{{ $json.source_urls }}"},
                                {"name": "research_foundation", "value": "{{ $json.choices[0].message.content }}"},
                                {"name": "research_status", "value": "completed"}
                            ]
                        },
                        "options": {}
                    },
                    "id": "prepare-architect-data",
                    "name": "Prepare for Course Architect",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [900, 300]
                },
                # Call Course Architect via Webhook
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:5678/webhook/course-architect",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "course_title", "value": "{{ $json.course_title }}"},
                                {"name": "target_audience", "value": "{{ $json.target_audience }}"},
                                {"name": "research_foundation", "value": "{{ $json.research_foundation }}"},
                                {"name": "source_urls", "value": "{{ $json.source_urls }}"},
                                {"name": "timestamp", "value": "{{ $json.timestamp }}"}
                            ]
                        }
                    },
                    "id": "call-course-architect",
                    "name": "Call Course Architect",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 300]
                },
                # Log Complete Process to Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "COURSE GENERATION COMPLETE: '{{ $json.course_title }}' for {{ $json.target_audience }}. Status: {{ $json.status }}. Architecture: {{ $json.architecture }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"course_complete\", \"course_title\": \"{{ $json.course_title }}\", \"audience\": \"{{ $json.target_audience }}\", \"timestamp\": \"{{ $json.timestamp }}\", \"generation_type\": \"phoenix_orchestrator\"}"}
                            ]
                        }
                    },
                    "id": "log-completion",
                    "name": "Log to Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 300]
                }
            ],
            "connections": {
                "Course Request Webhook": {
                    "main": [[{"node": "Validate Course Data", "type": "main", "index": 0}]]
                },
                "Validate Course Data": {
                    "main": [[{"node": "Generate Research Foundation", "type": "main", "index": 0}]]
                },
                "Generate Research Foundation": {
                    "main": [[{"node": "Prepare for Course Architect", "type": "main", "index": 0}]]
                },
                "Prepare for Course Architect": {
                    "main": [[{"node": "Call Course Architect", "type": "main", "index": 0}]]
                },
                "Call Course Architect": {
                    "main": [[{"node": "Log to Knowledge Lake", "type": "main", "index": 0}]]
                }
            },
            "settings": {}
        }
        return workflow

    def create_google_apps_script(self) -> str:
        """Creates Google Apps Script code to connect your Google Sheet to the webhook"""

        script = """
function onEdit(e) {
  // Only trigger on the specific sheet and when a new row is added
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Check if this is a new row addition (you can adjust this logic)
  if (range.getRow() > 1 && range.getColumn() === 1) {
    sendCourseRequest(range.getRow());
  }
}

function sendCourseRequest(row) {
  const sheet = SpreadsheetApp.getActiveSheet();

  // Get data from the row (adjust column numbers as needed)
  const title = sheet.getRange(row, 1).getValue(); // Column A: Title
  const audience = sheet.getRange(row, 2).getValue(); // Column B: Audience
  const sources = sheet.getRange(row, 3).getValue(); // Column C: Sources

  // Validate data
  if (!title || !audience) {
    console.log('Missing required data: title or audience');
    return;
  }

  // Prepare payload
  const payload = {
    'title': title,
    'audience': audience,
    'sources': sources || '',
    'timestamp': new Date().toISOString(),
    'source': 'google_sheets'
  };

  // n8n webhook URL (you'll get this after deploying the workflow)
  const webhookUrl = 'http://localhost:5678/webhook/course-request';

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    console.log('Course request sent successfully:', response.getContentText());

    // Optionally update a status column
    sheet.getRange(row, 4).setValue('Processing...'); // Column D: Status

  } catch (error) {
    console.error('Error sending course request:', error);
    sheet.getRange(row, 4).setValue('Error: ' + error.toString());
  }
}

// Test function - you can run this manually to test
function testCourseRequest() {
  const payload = {
    'title': 'Patient Safety Protocols',
    'audience': 'Healthcare Clinical',
    'sources': 'https://www.safetyandquality.gov.au/',
    'timestamp': new Date().toISOString(),
    'source': 'manual_test'
  };

  const webhookUrl = 'http://localhost:5678/webhook/course-request';

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    console.log('Test request successful:', response.getContentText());
  } catch (error) {
    console.error('Test request failed:', error);
  }
}
"""
        return script

    def deploy_workflow(self, workflow: dict) -> bool:
        """Deploy workflow to n8n"""
        try:
            response = requests.post(
                f"{self.n8n_url}/api/v1/workflows",
                json=workflow,
                headers=self.headers
            )
            if response.status_code in [200, 201]:
                print(f"SUCCESS: Deployed {workflow['name']}")
                return True
            else:
                print(f"ERROR: Failed to deploy {workflow['name']}: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"ERROR: {e}")
            return False

    def deploy_webhook_orchestrator(self):
        """Deploy the webhook-based orchestrator"""
        print("=== Deploying Phoenix Orchestrator (Webhook) ===")
        print("This version eliminates Google Sheets credential issues!")

        workflow = self.create_orchestrator_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("\nSUCCESS: Phoenix Orchestrator (Webhook) deployed!")
            print("\nWebhook URL will be: http://localhost:5678/webhook/course-request")
            print("\nTo connect your Google Sheet:")
            print("1. Open your Google Sheet")
            print("2. Go to Extensions > Apps Script")
            print("3. Replace the default code with the script below")
            print("4. Save and authorize the script")
            print("5. Test by adding a row to your sheet")

            print("\n" + "="*60)
            print("GOOGLE APPS SCRIPT CODE:")
            print("="*60)
            print(self.create_google_apps_script())
            print("="*60)

            print("\nSheet columns should be:")
            print("Column A: Course Title")
            print("Column B: Target Audience (Healthcare Clinical, Executive, Healthcare Administrative, Healthcare Combined)")
            print("Column C: Source URLs")
            print("Column D: Status (will be updated automatically)")

        return success

if __name__ == "__main__":
    orchestrator = PhoenixWebhookOrchestrator()
    orchestrator.deploy_webhook_orchestrator()
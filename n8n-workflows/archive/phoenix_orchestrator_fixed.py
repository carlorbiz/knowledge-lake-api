#!/usr/bin/env python3
"""
The Phoenix Generator: Fixed Version - No MCP Dependencies
Sophisticated workflow using standard n8n nodes
"""

import requests
import json

class PhoenixOrchestratorFixed:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_orchestrator_workflow(self) -> dict:
        """Creates the Phoenix Orchestrator without MCP dependencies"""

        sheet_url = "https://docs.google.com/spreadsheets/d/1fK-4Bgq9ju1jV2ouk_yVpTYS3AZZhCuo7DhOOgnj8kA/edit?gid=1878873675#gid=1878873675"
        spreadsheet_id = sheet_url.split('/d/')[1].split('/')[0]
        # Use default sheet name since you can set this in n8n UI
        sheet_name = "Sheet1"

        workflow = {
            "name": "Course Orchestrator (Phoenix Fixed)",
            "nodes": [
                # Google Sheets Trigger - Fixed Node Type and Credential Reference
                {
                    "parameters": {
                        "sheetId": spreadsheet_id,
                        "sheetName": sheet_name,
                        "events": ["sheetAppended"],
                        "options": {}
                    },
                    "id": "trigger-google-sheets",
                    "name": "On New Course Request",
                    "type": "n8n-nodes-base.googleSheetsTrigger",
                    "typeVersion": 1,
                    "position": [240, 300],
                    "credentials": {
                        "googleSheetsOAuth2Api": "Google Service Account account"
                    }
                },
                # Set Initial Context
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
                # Research Foundation Generator (Replaces MCP Research)
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
                                    "value": "[{\"role\": \"system\", \"content\": \"You are a research specialist for Australian healthcare professional development. Analyze provided sources and create comprehensive research foundations.\"}, {\"role\": \"user\", \"content\": \"Research topic: {{ $json.course_title }}\\nSources: {{ $json.source_urls }}\\n\\nCreate a detailed research foundation that includes:\\n- Executive summary of key evidence-based findings\\n- Critical success factors for Australian healthcare professionals\\n- Australian regulatory and cultural considerations\\n- Learning framework recommendations\\n- Implementation insights for professional development\\n- Evidence gaps and opportunities\\n\\nFocus on creating actionable insights for course development while maintaining academic rigour and Australian healthcare context.\"}]"
                                },
                                {"name": "max_tokens", "value": "4000"},
                                {"name": "temperature", "value": "0.1"}
                            ]
                        }
                    },
                    "id": "research-foundation-generator",
                    "name": "Research Foundation Generator",
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
                                {"name": "research_foundation", "value": "{{ $json.choices[0].message.content }}"}
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
                # Call Course Architect (Direct HTTP instead of MCP)
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
                                {"name": "source_urls", "value": "{{ $json.source_urls }}"}
                            ]
                        }
                    },
                    "id": "call-course-architect",
                    "name": "Call Course Architect",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 300]
                },
                # Log to Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Course '{{ $json.course_title }}' architecture complete. Ready for module generation loop. Architecture: {{ $json.architecture }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"architecture_complete\", \"course_title\": \"{{ $json.course_title }}\", \"audience\": \"{{ $json.target_audience }}\"}"}
                            ]
                        }
                    },
                    "id": "log-to-lake",
                    "name": "Log to Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 300]
                }
            ],
            "connections": {
                "On New Course Request": {
                    "main": [[{"node": "Set Initial Context", "type": "main", "index": 0}]]
                },
                "Set Initial Context": {
                    "main": [[{"node": "Research Foundation Generator", "type": "main", "index": 0}]]
                },
                "Research Foundation Generator": {
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

    def create_course_architect_workflow(self) -> dict:
        """Creates the Course Architect as a webhook-triggered workflow"""

        # Sophisticated prompt templates
        PROMPT_HEALTHCARE_CLINICAL = """You are an expert Australian healthcare course designer with access to an evidence-based Research Foundation.

RESEARCH FOUNDATION:
{{ $json["research_foundation"] }}

**Task:** Analyse {{ $json["course_title"] }} for {{ $json["target_audience"] }} and create:
- Modular course structure for clinical healthcare professionals
- Evidence-based justification using the Research Foundation above
- Vancouver citation style references
- NMBA/AHPRA alignment and adult learning principles
- Australian spelling throughout

**OUTPUT STRUCTURE:**
COURSE ARCHITECTURE: {{ $json["course_title"] }}
Target: Clinical Healthcare Professionals

MODULE BREAKDOWN (8-12 modules):
Module 1: [Title] - [Duration] minutes
- Learning Objectives: [3-4 specific, measurable objectives]
- Key Concepts: [5 evidence-based concepts with Research Foundation references]
- Assessment Strategy: [Competency-aligned approach]
- Implementation Notes: [Practical application guidance]

[Continue for all 8-12 modules]

EVIDENCE INTEGRATION:
- Minimum 10 Research Foundation references
- AHPRA/NMBA compliance alignment
- Adult learning methodology application
- Quality assurance framework"""

        PROMPT_EXECUTIVE = """You are a strategic L&D consultant for Australian healthcare C-suite executives.

RESEARCH FOUNDATION:
{{ $json["research_foundation"] }}

**Task:** Frame {{ $json["course_title"] }} for {{ $json["target_audience"] }} as strategic capability uplift:
- High-level modular course focusing on business outcomes and ROI
- Market trends and competitive advantages from Research Foundation
- Efficiency, impact, and scalability emphasis
- Australian business and healthcare terminology

**OUTPUT STRUCTURE:**
STRATEGIC COURSE INITIATIVE: {{ $json["course_title"] }}
Executive Audience: C-Suite Healthcare Leaders

EXECUTIVE MODULE FRAMEWORK (8-12 modules):
Module 1: [Strategic Title] - [Duration] minutes
- Business Objectives: [Strategic outcomes and KPIs]
- Leadership Concepts: [5 high-impact concepts]
- ROI Indicators: [Measurable business value]
- Implementation Timeline: [Deployment strategy]

[Continue for all 8-12 modules]

BUSINESS CASE:
- Strategic alignment with organisational goals
- Investment analysis and resource requirements
- Risk mitigation and success metrics"""

        PROMPT_HEALTHCARE_ADMIN = """You are a VET course designer for Australian healthcare administration.

RESEARCH FOUNDATION:
{{ $json["research_foundation"] }}

**Task:** Adapt {{ $json["course_title"] }} for {{ $json["target_audience"] }} into practical training:
- Operational tasks, compliance, and administrative efficiency focus
- MBS, patient management systems, regulatory requirements
- Clear learning activities and assessments
- Australian administrative and healthcare terminology

**OUTPUT STRUCTURE:**
OPERATIONAL TRAINING: {{ $json["course_title"] }}
Administrative Professionals Focus

PRACTICAL MODULE STRUCTURE (8-12 modules):
Module 1: [Operational Title] - [Duration] minutes
- Practical Objectives: [Workplace-applicable outcomes]
- Core Procedures: [5 step-by-step processes]
- System Integration: [Software/tools application]
- Compliance Requirements: [Regulatory alignment]

[Continue for all 8-12 modules]

IMPLEMENTATION GUIDE:
- VET compliance and workplace integration
- Technology requirements and performance monitoring"""

        PROMPT_HEALTHCARE_COMBINED = """You are a master instructional designer for mixed Australian healthcare teams.

RESEARCH FOUNDATION:
{{ $json["research_foundation"] }}

**Task:** Create {{ $json["course_title"] }} for {{ $json["target_audience"] }} as unified experience:
- Strategic/clinical concepts AND practical administrative applications
- Distinct learning tracks with integration points
- Cross-functional collaboration emphasis
- Australian spelling and terminology

**OUTPUT STRUCTURE:**
INTEGRATED COURSE: {{ $json["course_title"] }}
Combined Clinical & Administrative Teams

UNIFIED MODULE STRUCTURE (8-12 modules):
Module 1: [Integrated Title] - [Duration] minutes
- Shared Learning Objectives: [Common outcomes]
- Clinical Track: [3 clinical-specific concepts]
- Administrative Track: [3 admin-specific concepts]
- Integration Points: [Cross-functional collaboration]

[Continue for all 8-12 modules]

COLLABORATIVE FRAMEWORK:
- Cross-functional learning activities
- Shared assessment strategies"""

        workflow = {
            "name": "Course Architect Agent (Webhook)",
            "nodes": [
                # Webhook Trigger instead of MCP
                {
                    "parameters": {
                        "path": "course-architect",
                        "options": {}
                    },
                    "id": "webhook-trigger",
                    "name": "Webhook Trigger",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse incoming data
                {
                    "parameters": {
                        "jsCode": """
// Parse webhook data
const courseTitle = $json.course_title || 'Unknown Course';
const targetAudience = $json.target_audience || 'General';
const researchFoundation = $json.research_foundation || 'No research foundation provided';
const sourceUrls = $json.source_urls || '';

return {
    course_title: courseTitle,
    target_audience: targetAudience,
    research_foundation: researchFoundation,
    source_urls: sourceUrls,
    timestamp: new Date().toISOString()
};
"""
                    },
                    "id": "parse-webhook-data",
                    "name": "Parse Input Data",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [460, 300]
                },
                # Audience Router
                {
                    "parameters": {
                        "conditions": {
                            "options": {
                                "caseSensitive": False
                            },
                            "conditions": [
                                {
                                    "leftValue": "={{ $json.target_audience }}",
                                    "rightValue": "Healthcare Clinical",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.target_audience }}",
                                    "rightValue": "Executive",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.target_audience }}",
                                    "rightValue": "Healthcare Administrative",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                },
                                {
                                    "leftValue": "={{ $json.target_audience }}",
                                    "rightValue": "Healthcare Combined",
                                    "operator": {
                                        "type": "string",
                                        "operation": "equals"
                                    }
                                }
                            ],
                            "combineOperation": "any"
                        }
                    },
                    "id": "audience-router",
                    "name": "Route by Audience",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Clinical Prompt
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{PROMPT_HEALTHCARE_CLINICAL}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Clinical',
    course_title: $json.course_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "clinical-prompt",
                    "name": "Clinical Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 150]
                },
                # Executive Prompt
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{PROMPT_EXECUTIVE}`;
return {{
    prompt: prompt,
    audience: 'Executive',
    course_title: $json.course_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "executive-prompt",
                    "name": "Executive Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 250]
                },
                # Admin Prompt
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{PROMPT_HEALTHCARE_ADMIN}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Administrative',
    course_title: $json.course_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "admin-prompt",
                    "name": "Admin Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 350]
                },
                # Combined Prompt
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{PROMPT_HEALTHCARE_COMBINED}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Combined',
    course_title: $json.course_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "combined-prompt",
                    "name": "Combined Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 450]
                },
                # Claude Opus Generation
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
                                {"name": "model", "value": "claude-3-opus-20240229"},
                                {"name": "max_tokens", "value": "8000"},
                                {"name": "messages", "value": "[{\"role\": \"user\", \"content\": \"{{ $json.prompt }}\"}]"}
                            ]
                        }
                    },
                    "id": "claude-opus",
                    "name": "Generate Course Architecture",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 300]
                },
                # Response formatting
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "architecture", "value": "{{ $json.content[0].text }}"},
                                {"name": "audience", "value": "{{ $json.audience }}"},
                                {"name": "course_title", "value": "{{ $json.course_title }}"},
                                {"name": "status", "value": "completed"}
                            ]
                        }
                    },
                    "id": "format-response",
                    "name": "Format Response",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [1340, 300]
                }
            ],
            "connections": {
                "Webhook Trigger": {
                    "main": [[{"node": "Parse Input Data", "type": "main", "index": 0}]]
                },
                "Parse Input Data": {
                    "main": [[{"node": "Route by Audience", "type": "main", "index": 0}]]
                },
                "Route by Audience": {
                    "main": [
                        [{"node": "Clinical Prompt", "type": "main", "index": 0}],
                        [{"node": "Executive Prompt", "type": "main", "index": 0}],
                        [{"node": "Admin Prompt", "type": "main", "index": 0}],
                        [{"node": "Combined Prompt", "type": "main", "index": 0}]
                    ]
                },
                "Clinical Prompt": {
                    "main": [[{"node": "Generate Course Architecture", "type": "main", "index": 0}]]
                },
                "Executive Prompt": {
                    "main": [[{"node": "Generate Course Architecture", "type": "main", "index": 0}]]
                },
                "Admin Prompt": {
                    "main": [[{"node": "Generate Course Architecture", "type": "main", "index": 0}]]
                },
                "Combined Prompt": {
                    "main": [[{"node": "Generate Course Architecture", "type": "main", "index": 0}]]
                },
                "Generate Course Architecture": {
                    "main": [[{"node": "Format Response", "type": "main", "index": 0}]]
                }
            },
            "settings": {}
        }
        return workflow

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

    def deploy_complete_system(self):
        """Deploy both orchestrator and architect workflows"""
        print("=== Deploying Complete Phoenix System (No MCP) ===")

        # Deploy Course Architect first
        print("1. Deploying Course Architect Agent...")
        architect_workflow = self.create_course_architect_workflow()
        architect_success = self.deploy_workflow(architect_workflow)

        # Deploy Orchestrator
        print("2. Deploying Course Orchestrator...")
        orchestrator_workflow = self.create_orchestrator_workflow()
        orchestrator_success = self.deploy_workflow(orchestrator_workflow)

        if architect_success and orchestrator_success:
            print("\n=== Phoenix System Deployment Complete ===")
            print("SUCCESS: All workflows deployed successfully!")
            print("")
            print("System Architecture:")
            print("Google Sheet → Orchestrator → Research → Course Architect → Knowledge Lake")
            print("")
            print("Features:")
            print("- Google Sheets trigger for course requests")
            print("- Perplexity research foundation generation")
            print("- 4 sophisticated audience-aware prompts")
            print("- Claude Opus course architecture generation")
            print("- Knowledge Lake integration")
            print("- Webhook-based agent communication")
            print("")
            print("Next steps:")
            print("1. Link Google credential in Orchestrator")
            print("2. Test with Google Sheet entry")
            print("3. Monitor results in Knowledge Lake")

        return architect_success and orchestrator_success

if __name__ == "__main__":
    phoenix = PhoenixOrchestratorFixed()
    phoenix.deploy_complete_system()
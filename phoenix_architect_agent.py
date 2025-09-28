#!/usr/bin/env python3
"""
Phoenix Course Architect Agent - The Brain of the System
Sophisticated, audience-aware course architecture generation
"""

import requests
import json

class PhoenixArchitectAgent:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_architect_agent_workflow(self) -> dict:
        """Creates the sophisticated Course Architect Agent exactly as planned"""

        # The advanced prompt templates from your original design
        PROMPT_HEALTHCARE_CLINICAL = """You are an expert Australian healthcare course designer with access to an evidence-based Research Foundation.
**Task:** Analyse the {{ $json["course_title"] }} and Research Foundation to:
- Develop a modular course structure for clinical healthcare professionals.
- Fully justify choices using the Research Foundation.
- Reference specific findings, frameworks, and evidence (use Vancouver citation style).
- Align to NMBA, AHPRA, governance, and adult learning microlearning principles.
- Use Australian spelling.
**AUDIENCE:** Clinical: Registered nurses, allied health professionals.

**OUTPUT STRUCTURE:**
COURSE ARCHITECTURE for {{ $json["course_title"] }}
Target Audience: {{ $json["target_audience"] }}

MODULE BREAKDOWN (8-12 modules):
Module 1: [Title] - [Duration] minutes
- Learning Objectives: [3-4 specific objectives]
- Key Concepts: [5 evidence-based concepts]
- Assessment Strategy: [Aligned to competency standards]
- Evidence References: [Research Foundation citations]

[Continue for all modules...]

IMPLEMENTATION FRAMEWORK:
- Delivery methodology aligned to Australian healthcare education standards
- AHPRA/NMBA compliance requirements
- Adult learning principles application
- Quality assurance measures"""

        PROMPT_EXECUTIVE = """You are a strategic L&D consultant advising a C-suite executive in the Australian healthcare sector.
**Task:** Frame the {{ $json["course_title"] }} as a strategic capability uplift initiative.
- Develop a high-level, modular course outline focusing on business outcomes, ROI, and strategic alignment.
- Justify the structure with reference to market trends, competitive advantages, and leadership development principles from the Research Foundation.
- Emphasise efficiency, impact, and scalability.
- Use Australian business and healthcare terminology.
**AUDIENCE:** Executive: CEO, COO, Chief Clinical Officer.

**OUTPUT STRUCTURE:**
STRATEGIC COURSE INITIATIVE: {{ $json["course_title"] }}
Executive Audience: {{ $json["target_audience"] }}

EXECUTIVE MODULE FRAMEWORK (8-12 strategic modules):
Module 1: [Strategic Title] - [Duration] minutes
- Business Objectives: [Strategic outcomes]
- Leadership Concepts: [5 high-impact concepts]
- ROI Indicators: [Measurable business value]
- Implementation Timeline: [Deployment strategy]

[Continue for all modules...]

BUSINESS CASE:
- Strategic alignment with organisational goals
- Investment analysis and resource requirements
- Risk mitigation and success metrics"""

        PROMPT_HEALTHCARE_ADMIN = """You are a practical VET course designer creating accredited training for Australian healthcare administration staff.
**Task:** Adapt the {{ $json["course_title"] }} into a practical, skills-based training program.
- Develop a modular course structure focused on operational tasks, compliance, and administrative efficiency.
- Justify the structure by referencing specific administrative challenges, software/systems, and regulatory requirements (e.g., MBS, patient management systems) from the Research Foundation.
- Ensure content is practical, with clear learning activities and assessments.
- Use Australian administrative and healthcare terminology.
**AUDIENCE:** Administrative: Practice managers, receptionists, ward clerks.

**OUTPUT STRUCTURE:**
OPERATIONAL TRAINING PROGRAM: {{ $json["course_title"] }}
Administrative Audience: {{ $json["target_audience"] }}

PRACTICAL MODULE STRUCTURE (8-12 operational modules):
Module 1: [Operational Title] - [Duration] minutes
- Practical Objectives: [Workplace outcomes]
- Core Procedures: [5 step-by-step processes]
- System Integration: [Software/tools application]
- Compliance Requirements: [Regulatory alignment]

[Continue for all modules...]

IMPLEMENTATION GUIDE:
- Workplace integration strategies
- Technology requirements and VET compliance
- Performance monitoring and quality assurance"""

        PROMPT_HEALTHCARE_COMBINED = """You are a master instructional designer creating a unified learning experience for a mixed group of Australian healthcare professionals.
**Task:** Synthesize the {{ $json["course_title"] }} into a cohesive, multi-faceted course for a combined clinical and administrative audience.
- Develop a modular course structure that includes both strategic/clinical high-level concepts and practical administrative applications.
- Create distinct learning tracks or modules where appropriate (e.g., "Clinical Application," "Administrative Workflow").
- Justify the blended structure by referencing the need for integrated care and cross-functional collaboration, using evidence from the Research Foundation.
- Use clear, accessible language that respects the expertise of both audiences.
- Use Australian spelling and terminology.
**AUDIENCE:** Combined: Clinical and Administrative staff learning together.

**OUTPUT STRUCTURE:**
INTEGRATED COURSE FRAMEWORK: {{ $json["course_title"] }}
Combined Audience: {{ $json["target_audience"] }}

UNIFIED MODULE STRUCTURE (8-12 integrated modules):
Module 1: [Integrated Title] - [Duration] minutes
- Shared Learning Objectives: [Common outcomes for both audiences]
- Clinical Track: [3 clinical-specific concepts]
- Administrative Track: [3 admin-specific concepts]
- Integration Points: [Cross-functional collaboration elements]

[Continue for all modules...]

COLLABORATIVE FRAMEWORK:
- Cross-functional learning activities
- Shared assessment strategies and team-based implementation"""

        workflow = {
            "name": "Course Architect Agent (Phoenix)",
            "nodes": [
                # MCP Trigger - listens for calls from Orchestrator
                {
                    "parameters": {
                        "toolName": "course-architect",
                        "options": {}
                    },
                    "id": "mcp-trigger-architect",
                    "name": "MCP Trigger: Course Architect",
                    "type": "n8n-nodes-mcp.mcpTrigger",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse incoming data from Orchestrator
                {
                    "parameters": {
                        "jsCode": """
// Parse the sophisticated input from the Orchestrator
const input = $input.first().json;
console.log('Course Architect received:', JSON.stringify(input, null, 2));

// Parse JSON string if needed
let parsedData = input;
if (typeof input === 'string') {
    try {
        parsedData = JSON.parse(input);
    } catch (e) {
        console.log('Input is not JSON string, using as-is');
    }
}

// Extract the key data fields
const courseTitle = parsedData.course_title || parsedData.title || 'Unknown Course';
const targetAudience = parsedData.target_audience || parsedData.audience || 'General';
const researchFoundation = parsedData.research_foundation || 'Research foundation to be provided';
const sourceUrls = parsedData.source_urls || parsedData.sources || '';

return {
    course_title: courseTitle,
    target_audience: targetAudience,
    research_foundation: researchFoundation,
    source_urls: sourceUrls,
    timestamp: new Date().toISOString()
};
"""
                    },
                    "id": "parse-orchestrator-data",
                    "name": "Parse Orchestrator Data",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [460, 300]
                },
                # Sophisticated Audience Router - the heart of the intelligence
                {
                    "parameters": {
                        "conditions": {
                            "options": {
                                "caseSensitive": False,
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
                        },
                        "options": {}
                    },
                    "id": "sophisticated-audience-router",
                    "name": "Switch by Audience",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Healthcare Clinical Prompt Node
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
                    "id": "clinical-prompt-node",
                    "name": "HC Clinical Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 100]
                },
                # Executive Prompt Node
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
                    "id": "executive-prompt-node",
                    "name": "Executive Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 200]
                },
                # Healthcare Admin Prompt Node
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
                    "id": "admin-prompt-node",
                    "name": "HC Admin Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 300]
                },
                # Healthcare Combined Prompt Node
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
                    "id": "combined-prompt-node",
                    "name": "HC Combined Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 400]
                },
                # Prep Step - formats prompt for API
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "promptForApi", "value": "{{ $json.prompt }}"},
                                {"name": "audience", "value": "{{ $json.audience }}"},
                                {"name": "course_title", "value": "{{ $json.course_title }}"}
                            ]
                        },
                        "options": {}
                    },
                    "id": "prep-step",
                    "name": "Prep Step",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [1120, 250]
                },
                # Claude Opus - The sophisticated AI engine
                {
                    "parameters": {
                        "url": "https://api.anthropic.com/v1/messages",
                        "method": "POST",
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
                                {"name": "messages", "value": "[{\"role\": \"user\", \"content\": \"{{ $json.promptForApi }}\"}]"}
                            ]
                        },
                        "options": {}
                    },
                    "id": "claude-opus-engine",
                    "name": "Course Recommendation Engine",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 250]
                },
                # Store in Knowledge Lake
                {
                    "parameters": {
                        "url": "http://localhost:3000/knowledge/add",
                        "method": "POST",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Course Architecture Generated: {{ $json.course_title }} for {{ $json.audience }}. Full Architecture: {{ $json.content[0].text }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"course_architecture\", \"audience\": \"{{ $json.audience }}\", \"course_title\": \"{{ $json.course_title }}\", \"generated_by\": \"phoenix_architect_agent\"}"}
                            ]
                        }
                    },
                    "id": "store-architecture-knowledge",
                    "name": "Store in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1560, 250]
                }
            ],
            "connections": {
                "MCP Trigger: Course Architect": {
                    "main": [[{"node": "Parse Orchestrator Data", "type": "main", "index": 0}]]
                },
                "Parse Orchestrator Data": {
                    "main": [[{"node": "Switch by Audience", "type": "main", "index": 0}]]
                },
                "Switch by Audience": {
                    "main": [
                        [{"node": "HC Clinical Prompt", "type": "main", "index": 0}],
                        [{"node": "Executive Prompt", "type": "main", "index": 0}],
                        [{"node": "HC Admin Prompt", "type": "main", "index": 0}],
                        [{"node": "HC Combined Prompt", "type": "main", "index": 0}]
                    ]
                },
                "HC Clinical Prompt": {
                    "main": [[{"node": "Prep Step", "type": "main", "index": 0}]]
                },
                "Executive Prompt": {
                    "main": [[{"node": "Prep Step", "type": "main", "index": 0}]]
                },
                "HC Admin Prompt": {
                    "main": [[{"node": "Prep Step", "type": "main", "index": 0}]]
                },
                "HC Combined Prompt": {
                    "main": [[{"node": "Prep Step", "type": "main", "index": 0}]]
                },
                "Prep Step": {
                    "main": [[{"node": "Course Recommendation Engine", "type": "main", "index": 0}]]
                },
                "Course Recommendation Engine": {
                    "main": [[{"node": "Store in Knowledge Lake", "type": "main", "index": 0}]]
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

    def deploy_architect_agent(self):
        """Deploy the sophisticated Course Architect Agent"""
        print("=== Deploying Phoenix Course Architect Agent ===")
        print("This is the BRAIN of your course generation system")

        workflow = self.create_architect_agent_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("Phoenix Course Architect Agent deployed successfully!")
            print("Features:")
            print("- MCP Trigger responds to Orchestrator calls")
            print("- 4 sophisticated audience-aware prompt engines")
            print("- Vancouver citation integration")
            print("- AHPRA/NMBA compliance alignment")
            print("- Claude Opus powered architecture generation")
            print("- Knowledge Lake integration")
            print("- Evidence-based course structuring")

        return success

if __name__ == "__main__":
    agent = PhoenixArchitectAgent()
    agent.deploy_architect_agent()
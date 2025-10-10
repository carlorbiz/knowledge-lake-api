#!/usr/bin/env python3
"""
Specialist Agent Workflow Builder
Creates sophisticated agent workflows for the Course Generation System
"""

import requests
import json
import os
from typing import Dict, List, Any

class AgentBuilder:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_course_architect_agent(self) -> Dict:
        """The sophisticated Course Architect Agent with audience-aware prompts"""

        # Advanced prompt templates
        clinical_prompt = """You are an expert Australian healthcare course designer with access to evidence-based Research Foundation.
Task: Analyse the course concept and Research Foundation to develop a modular course structure for clinical healthcare professionals.

Course Concept: {{ $json.course_title }}
Research Foundation: {{ $json.research_foundation }}
Target Audience: Clinical healthcare professionals (Registered nurses, allied health professionals)

Requirements:
- Develop 8-12 standalone modules with clear learning progression
- Fully justify choices using the Research Foundation with Vancouver citation style [1], [2], etc.
- Align to NMBA, AHPRA governance and adult learning microlearning principles
- Each module must include: Learning objectives, Key concepts (5), Assessment strategy, Evidence-based resources
- Use Australian spelling throughout
- Professional calibre for executive and health professional audiences
- Ensure modules are suitable for iSpring Suite Max development

Output Format:
**COURSE ARCHITECTURE**
Title: [Course Title]
Duration: [Total hours]
Audience: Clinical Healthcare Professionals

**MODULE STRUCTURE**
Module 1: [Title] (Duration: X minutes)
- Learning Objectives: [3-4 objectives]
- Key Concepts: [5 concepts with brief descriptions]
- Evidence Base: [References to research foundation]
- Assessment Strategy: [Type and approach]

[Repeat for all 8-12 modules]

**IMPLEMENTATION STRATEGY**
- Delivery method and platform recommendations
- Prerequisites and learner preparation
- Quality assurance measures
- Evaluation metrics"""

        executive_prompt = """You are a strategic L&D consultant advising C-suite executives in the Australian healthcare sector.
Task: Frame the course concept as a strategic capability uplift initiative focusing on business outcomes and ROI.

Course Concept: {{ $json.course_title }}
Research Foundation: {{ $json.research_foundation }}
Target Audience: Executive (CEO, COO, Chief Clinical Officer)

Requirements:
- Develop 8-12 high-impact modules focusing on strategic outcomes
- Justify structure with market trends, competitive advantages, and leadership development principles
- Emphasise efficiency, impact, and scalability
- Link each module to business KPIs and organisational outcomes
- Use Australian business and healthcare terminology
- Evidence-based approach with clear ROI projections

Output Format:
**STRATEGIC COURSE ARCHITECTURE**
Initiative: [Course Title]
Strategic Objective: [High-level business goal]
Expected ROI: [Quantified benefits]

**EXECUTIVE MODULE FRAMEWORK**
Module 1: [Strategic Title] (Duration: X minutes)
- Business Objectives: [3-4 strategic outcomes]
- Key Leadership Concepts: [5 concepts]
- Market Relevance: [Evidence from research foundation]
- KPI Alignment: [Measurable outcomes]
- Implementation Timeline: [Practical deployment]

[Repeat for all 8-12 modules]

**BUSINESS CASE**
- Strategic alignment with organisational goals
- Resource requirements and investment analysis
- Risk mitigation strategies
- Success metrics and evaluation framework"""

        admin_prompt = """You are a practical VET course designer creating accredited training for Australian healthcare administration staff.
Task: Adapt the course concept into practical, skills-based training focused on operational excellence.

Course Concept: {{ $json.course_title }}
Research Foundation: {{ $json.research_foundation }}
Target Audience: Administrative (Practice managers, receptionists, ward clerks)

Requirements:
- Develop 8-12 practical modules focused on operational tasks and compliance
- Reference specific administrative challenges, software/systems, and regulatory requirements (MBS, patient management systems)
- Ensure content is practical with clear learning activities and assessments
- Suitable for iSpring Suite Max interactive development
- Use Australian administrative and healthcare terminology
- Include step-by-step procedures and checklists

Output Format:
**OPERATIONAL COURSE STRUCTURE**
Program: [Course Title]
Competency Level: [VET qualification alignment]
Delivery Mode: [Practical implementation]

**ADMINISTRATIVE MODULE FRAMEWORK**
Module 1: [Practical Title] (Duration: X minutes)
- Operational Objectives: [3-4 practical outcomes]
- Core Procedures: [5 step-by-step processes]
- System Applications: [Software/tools integration]
- Compliance Requirements: [Regulatory alignment]
- Quality Assurance: [Accuracy measures]

[Repeat for all 8-12 modules]

**IMPLEMENTATION GUIDE**
- Workplace integration strategies
- Technology requirements and setup
- Performance monitoring and feedback systems
- Continuous improvement processes"""

        combined_prompt = """You are a master instructional designer creating a unified learning experience for mixed Australian healthcare teams.
Task: Synthesise the course concept into a cohesive, multi-faceted course for combined clinical and administrative audiences.

Course Concept: {{ $json.course_title }}
Research Foundation: {{ $json.research_foundation }}
Target Audience: Combined (Clinical and Administrative staff learning together)

Requirements:
- Develop 8-12 modules with distinct learning tracks where appropriate
- Create both strategic/clinical high-level concepts and practical administrative applications
- Justify blended structure by referencing integrated care and cross-functional collaboration
- Use clear, accessible language respecting expertise of both audiences
- Include collaborative elements and shared learning outcomes
- Use Australian spelling and terminology

Output Format:
**INTEGRATED COURSE ARCHITECTURE**
Program: [Course Title]
Integration Approach: [Multi-disciplinary methodology]
Collaboration Framework: [Cross-functional elements]

**UNIFIED MODULE STRUCTURE**
Module 1: [Inclusive Title] (Duration: X minutes)
- Shared Learning Objectives: [3-4 common outcomes]
- Clinical Track Concepts: [3 clinical-specific elements]
- Administrative Track Concepts: [3 admin-specific elements]
- Integration Points: [2 collaborative activities]
- Evidence Integration: [Research foundation application]

[Repeat for all 8-12 modules]

**COLLABORATIVE FRAMEWORK**
- Cross-functional learning activities
- Shared assessment strategies
- Knowledge transfer mechanisms
- Team-based implementation planning"""

        workflow = {
            "name": "Course Architect Agent",
            "nodes": [
                # MCP Trigger to receive calls from Orchestrator
                {
                    "parameters": {
                        "toolName": "course-architect",
                        "options": {}
                    },
                    "id": "mcp-trigger",
                    "name": "MCP Trigger: Course Architect",
                    "type": "n8n-nodes-mcp.mcpTrigger",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse incoming data
                {
                    "parameters": {
                        "jsCode": """
// Parse the incoming MCP call data
const input = $input.first().json;
console.log('Received input:', JSON.stringify(input, null, 2));

// Extract relevant fields
const courseTitle = input.course_title || input.title || 'Unknown Course';
const targetAudience = input.target_audience || input.audience || 'General';
const researchFoundation = input.research_foundation || 'No research foundation provided';
const sourceUrls = input.source_urls || input.sources || '';

return {
    course_title: courseTitle,
    target_audience: targetAudience,
    research_foundation: researchFoundation,
    source_urls: sourceUrls,
    timestamp: new Date().toISOString()
};
"""
                    },
                    "id": "parse-input",
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
                    "id": "audience-router",
                    "name": "Route by Audience",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Clinical Prompt Node
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{clinical_prompt}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Clinical',
    course_title: $json.course_title,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "clinical-prompt",
                    "name": "Clinical Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 100]
                },
                # Executive Prompt Node
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{executive_prompt}`;
return {{
    prompt: prompt,
    audience: 'Executive',
    course_title: $json.course_title,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "executive-prompt",
                    "name": "Executive Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 200]
                },
                # Admin Prompt Node
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{admin_prompt}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Administrative',
    course_title: $json.course_title,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "admin-prompt",
                    "name": "Admin Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 300]
                },
                # Combined Prompt Node
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{combined_prompt}`;
return {{
    prompt: prompt,
    audience: 'Healthcare Combined',
    course_title: $json.course_title,
    research_foundation: $json.research_foundation
}};
"""
                    },
                    "id": "combined-prompt",
                    "name": "Combined Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [900, 400]
                },
                # Claude Opus Call
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
                        },
                        "options": {}
                    },
                    "id": "claude-opus",
                    "name": "Generate Course Architecture",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 250]
                },
                # Store in Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Course Architecture Generated: {{ $json.course_title }} for {{ $json.audience }}. Architecture: {{ $json.content[0].text }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"course_architecture\", \"audience\": \"{{ $json.audience }}\", \"course_title\": \"{{ $json.course_title }}\"}"}
                            ]
                        }
                    },
                    "id": "store-knowledge",
                    "name": "Store in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 250]
                }
            ],
            "connections": {
                "MCP Trigger: Course Architect": {
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
                    "main": [[{"node": "Store in Knowledge Lake", "type": "main", "index": 0}]]
                }
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
                print(f"SUCCESS: Deployed {workflow['name']}")
                return True
            else:
                print(f"ERROR: Failed to deploy {workflow['name']}: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except Exception as e:
            print(f"ERROR: {e}")
            return False

    def build_all_agents(self):
        """Build and deploy all specialist agent workflows"""
        print("=== Building Specialist Agent Workflows ===")

        # Deploy Course Architect Agent
        print("Building Course Architect Agent...")
        architect_workflow = self.create_course_architect_agent()
        self.deploy_workflow(architect_workflow)

        print("\n=== Agent Deployment Complete ===")
        print("Access n8n at: http://localhost:5678")
        print("Your Course Orchestrator can now call the Course Architect Agent!")

if __name__ == "__main__":
    builder = AgentBuilder()
    builder.build_all_agents()
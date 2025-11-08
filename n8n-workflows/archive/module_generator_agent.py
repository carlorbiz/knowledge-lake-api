#!/usr/bin/env python3
"""
Module Generator Agent Builder
Creates the sophisticated module content generation workflow
"""

import requests
import json
import os
from typing import Dict

class ModuleGeneratorAgent:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_module_generator_workflow(self) -> Dict:
        """Creates the comprehensive module generation workflow"""

        module_content_prompt = """You are an expert Australian instructional designer creating comprehensive module content for professional healthcare education.

CONTEXT:
Course Title: {{ $json.course_title }}
Module: {{ $json.module_title }}
Target Audience: {{ $json.target_audience }}
Research Foundation: {{ $json.research_foundation }}
Learning Objectives: {{ $json.learning_objectives }}

TASK: Create complete module content including all required components.

REQUIREMENTS:
- Use Australian spelling throughout
- Professional calibre for executive and health professional audiences
- Evidence-based content referencing the Research Foundation
- All content must tie back to evidence using Vancouver citation style [1], [2], etc.
- Suitable for iSpring Suite Max development
- Adult learning principles applied throughout

OUTPUT STRUCTURE:

**MODULE OVERVIEW**
Title: {{ $json.module_title }}
Duration: [Specify minutes]
Prerequisites: [List any requirements]
Module Description: [2-3 sentences explaining the module's focus and relevance]

**LEARNING OBJECTIVES**
Upon completion of this module, learners will be able to:
1. [Specific, measurable objective]
2. [Specific, measurable objective]
3. [Specific, measurable objective]
4. [Specific, measurable objective]

**KEY CONCEPTS (5 required)**
1. **Concept Name**: [Detailed explanation with evidence reference [1]]
2. **Concept Name**: [Detailed explanation with evidence reference [2]]
3. **Concept Name**: [Detailed explanation with evidence reference [3]]
4. **Concept Name**: [Detailed explanation with evidence reference [4]]
5. **Concept Name**: [Detailed explanation with evidence reference [5]]

**SLIDE STRUCTURE (10-12 slides)**
Slide 1: Module Title & Objectives
- Title: {{ $json.module_title }}
- Learning objectives overview
- Duration and prerequisites

Slide 2: Module Introduction
- Context setting
- Relevance to practice
- Learning pathway overview

Slides 3-10: Core Content Slides
[For each slide, provide:]
- Slide Title
- Key Content Points (3-4 bullet points)
- Supporting Evidence References
- Visual Elements Suggested
- Interactive Elements for iSpring

Slide 11: Knowledge Check
- 3-4 review questions
- Key concept reinforcement

Slide 12: Module Summary & Next Steps
- Key takeaways
- Application to practice
- Preview of next module

**VOICEOVER SCRIPT SPECIFICATIONS**
For each slide, provide:
- Professional, conversational Australian tone
- 2-3 minutes speaking duration per slide
- Pronunciation guides for technical terms
- Natural speech patterns with appropriate pauses
- Emphasis on key learning points

**ASSESSMENT STRATEGY**
Provide detailed instructions for creating 5 dynamic assessments in iSpring Suite Max:

Assessment 1: Knowledge Check Quiz
- 10 multiple choice questions
- Scenario-based questions preferred
- Immediate feedback for each answer
- Reference to evidence base in explanations

Assessment 2: Drag & Drop Activity
- Interactive categorisation exercise
- Real-world scenarios
- Visual feedback system

Assessment 3: Decision Tree Scenario
- Branching scenario with multiple pathways
- Consequence-based learning
- Reflection questions at key decision points

Assessment 4: Case Study Analysis
- Comprehensive scenario analysis
- Multi-part questions
- Evidence-based reasoning required

Assessment 5: Competency Checklist
- Observable behaviours assessment
- Workplace application focus
- Supervisor/peer review component

**ROLE PLAY SCENARIOS (3 required)**
Provide detailed instructions for creating 3 interactive role play scenarios:

Role Play 1: [Scenario Title]
- Setting: [Workplace context]
- Characters: [2-3 participants with defined roles]
- Scenario: [Detailed situation description]
- Learning Focus: [Specific skills/knowledge being practiced]
- Debrief Questions: [3-4 reflection questions]
- iSpring Implementation: [Technical specifications for interactive elements]

Role Play 2: [Scenario Title]
[Follow same structure]

Role Play 3: [Scenario Title]
[Follow same structure]

**MODULE WORKBOOK CONTENT**
Provide comprehensive workbook materials:

Section 1: Module Overview
- Learning objectives
- Key concepts summary
- Evidence references

Section 2: Interactive Worksheets
- Reflection exercises
- Application planning templates
- Self-assessment checklists

Section 3: Additional Resources
- Recommended reading (Australian sources)
- Professional development opportunities
- Regulatory and compliance information

Section 4: Implementation Checklists
- Pre-module preparation
- During module activities
- Post-module application steps

**LMS UPLOAD SPECIFICATIONS**
Create content formatted for PDF upload that aligns with the 10-12 slide structure:

Page 1: Module Overview (matches Slide 1)
Page 2: Introduction (matches Slide 2)
Pages 3-10: Core Content (matches Slides 3-10)
Page 11: Knowledge Check (matches Slide 11)
Page 12: Summary (matches Slide 12)

Each page should include:
- Clear headings matching slide titles
- Bullet points for easy parsing
- Evidence references in consistent format
- Space for learner notes
- QR codes linking to additional resources

**EVIDENCE INTEGRATION**
Ensure all content includes:
- Minimum 8-10 evidence references per module
- Vancouver citation style throughout
- Research Foundation integration in every section
- Australian healthcare context and terminology
- Current best practice alignment"""

        workflow = {
            "name": "Module Generator Agent",
            "nodes": [
                # MCP Trigger
                {
                    "parameters": {
                        "toolName": "module-generator",
                        "options": {}
                    },
                    "id": "mcp-trigger-module",
                    "name": "MCP Trigger: Module Generator",
                    "type": "n8n-nodes-mcp.mcpTrigger",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse Module Data
                {
                    "parameters": {
                        "jsCode": """
// Parse the incoming module generation request
const input = $input.first().json;
console.log('Module Generator received:', JSON.stringify(input, null, 2));

// Extract module-specific data
const courseTitle = input.course_title || 'Unknown Course';
const moduleTitle = input.module_title || input.module_name || 'Unknown Module';
const targetAudience = input.target_audience || input.audience || 'General';
const researchFoundation = input.research_foundation || 'No research foundation provided';
const learningObjectives = input.learning_objectives || [];
const moduleNumber = input.module_number || 1;

return {
    course_title: courseTitle,
    module_title: moduleTitle,
    target_audience: targetAudience,
    research_foundation: researchFoundation,
    learning_objectives: learningObjectives,
    module_number: moduleNumber,
    timestamp: new Date().toISOString()
};
"""
                    },
                    "id": "parse-module-data",
                    "name": "Parse Module Data",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [460, 300]
                },
                # Generate Module Content
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{module_content_prompt}`;
return {{
    prompt: prompt,
    course_title: $json.course_title,
    module_title: $json.module_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation,
    learning_objectives: $json.learning_objectives
}};
"""
                    },
                    "id": "prepare-module-prompt",
                    "name": "Prepare Module Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Claude Opus for Module Content
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
                    "id": "generate-module-content",
                    "name": "Generate Module Content",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                },
                # Extract Slides for Voiceover
                {
                    "parameters": {
                        "jsCode": """
// Extract slide information for voiceover generation
const content = $json.content[0].text;
const slidePattern = /Slide \\d+:.*?(?=Slide \\d+:|$)/gs;
const slides = content.match(slidePattern) || [];

// Process each slide for voiceover
const slideData = slides.map((slide, index) => {
    const titleMatch = slide.match(/Slide \\d+: (.+)/);
    const title = titleMatch ? titleMatch[1] : `Slide ${index + 1}`;

    return {
        slide_number: index + 1,
        slide_title: title.trim(),
        slide_content: slide.trim(),
        module_title: $json.module_title,
        course_title: $json.course_title
    };
});

return slideData;
"""
                    },
                    "id": "extract-slides",
                    "name": "Extract Slides for Voiceover",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [1120, 300]
                },
                # Store Module Content in Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Module Content Generated: {{ $json.module_title }} for {{ $json.course_title }}. Complete module with slides, assessments, and workbook materials."},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"module_content\", \"module_title\": \"{{ $json.module_title }}\", \"course_title\": \"{{ $json.course_title }}\"}"}
                            ]
                        }
                    },
                    "id": "store-module-knowledge",
                    "name": "Store Module in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 300]
                },
                # Call Audio Generation Agent for each slide
                {
                    "parameters": {
                        "toolName": "audio-generator",
                        "input": "{{ JSON.stringify($json) }}",
                        "options": {}
                    },
                    "id": "call-audio-agent",
                    "name": "Call Audio Generation Agent",
                    "type": "n8n-nodes-mcp.mcp",
                    "typeVersion": 1,
                    "position": [1340, 150]
                }
            ],
            "connections": {
                "MCP Trigger: Module Generator": {
                    "main": [[{"node": "Parse Module Data", "type": "main", "index": 0}]]
                },
                "Parse Module Data": {
                    "main": [[{"node": "Prepare Module Prompt", "type": "main", "index": 0}]]
                },
                "Prepare Module Prompt": {
                    "main": [[{"node": "Generate Module Content", "type": "main", "index": 0}]]
                },
                "Generate Module Content": {
                    "main": [
                        [
                            {"node": "Extract Slides for Voiceover", "type": "main", "index": 0},
                            {"node": "Store Module in Knowledge Lake", "type": "main", "index": 0}
                        ]
                    ]
                },
                "Extract Slides for Voiceover": {
                    "main": [[{"node": "Call Audio Generation Agent", "type": "main", "index": 0}]]
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

    def deploy_module_generator(self):
        """Deploy the Module Generator Agent"""
        print("=== Deploying Module Generator Agent ===")

        workflow = self.create_module_generator_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("Module Generator Agent deployed successfully!")
            print("This agent will create:")
            print("- Comprehensive module content")
            print("- 10-12 detailed slides")
            print("- Voiceover script specifications")
            print("- 5 dynamic assessments for iSpring Suite")
            print("- 3 interactive role play scenarios")
            print("- Complete module workbooks")
            print("- LMS upload formatted content")

        return success

if __name__ == "__main__":
    agent = ModuleGeneratorAgent()
    agent.deploy_module_generator()
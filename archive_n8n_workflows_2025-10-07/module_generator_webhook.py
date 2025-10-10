#!/usr/bin/env python3
"""
Module Generator Agent Builder - Webhook Version
Creates comprehensive module content generation with webhook triggers
"""

import requests
import json
import os
from typing import Dict

class ModuleGeneratorWebhook:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_module_generator_workflow(self) -> Dict:
        """Creates the comprehensive module generation workflow with webhook trigger"""

        module_content_prompt = """You are an expert Australian instructional designer creating comprehensive module content for professional education.

CONTEXT:
Course Title: {{ $json.course_title }}
Module: {{ $json.module_title }}
Target Audience: {{ $json.target_audience }}
Research Foundation: {{ $json.research_foundation }}
Learning Objectives: {{ $json.learning_objectives }}
User: {{ $json.user_name }} ({{ $json.user_email }})

TASK: Create complete module content including all required components for professional adult learning.

REQUIREMENTS:
- Use Australian spelling throughout
- Professional calibre for executive and health professional audiences
- Evidence-based content referencing the Research Foundation
- All content must tie back to evidence using Vancouver citation style [1], [2], etc.
- Suitable for iSpring Suite Max development
- Adult learning principles applied throughout
- Include all deliverables for complete module package

OUTPUT STRUCTURE:

**MODULE OVERVIEW**
Title: {{ $json.module_title }}
Duration: [Specify 45-60 minutes]
Prerequisites: [List any requirements]
Module Description: [2-3 sentences explaining the module's focus and relevance]

**LEARNING OBJECTIVES**
Upon completion of this module, learners will be able to:
1. [Specific, measurable objective aligned to target audience]
2. [Specific, measurable objective with action verbs]
3. [Specific, measurable objective with assessment criteria]
4. [Specific, measurable objective for workplace application]

**KEY CONCEPTS (5 required)**
1. **Concept Name**: [Detailed explanation with evidence reference [1]]
2. **Concept Name**: [Detailed explanation with evidence reference [2]]
3. **Concept Name**: [Detailed explanation with evidence reference [3]]
4. **Concept Name**: [Detailed explanation with evidence reference [4]]
5. **Concept Name**: [Detailed explanation with evidence reference [5]]

**SLIDE SPECIFICATIONS (10-12 slides)**
Slide 1: Module Title & Objectives
- Title: {{ $json.module_title }}
- Learning objectives overview (4 bullet points)
- Duration: 45-60 minutes
- Prerequisites listed

Slide 2: Module Introduction & Context
- Relevance to {{ $json.target_audience }}
- Connection to overall course {{ $json.course_title }}
- Learning pathway overview
- Key benefits for learners

Slides 3-10: Core Content Slides (8 slides)
[For each core content slide, provide:]
- Slide Title: [Clear, descriptive title]
- Key Content Points: [3-4 bullet points max per slide]
- Supporting Evidence: [Reference to Research Foundation with citations]
- Visual Elements: [Specific suggestions for graphics, charts, diagrams]
- Interactive Elements: [Suggestions for iSpring interactions]
- Speaker Notes: [Detailed notes for voiceover development]

Slide 11: Knowledge Check & Reflection
- Quick review questions (3-4 questions)
- Key concept reinforcement
- Self-assessment opportunity
- Reflection prompts

Slide 12: Module Summary & Next Steps
- Key takeaways (3-4 main points)
- Application to practice
- Preview of next module
- Additional resources

**VOICEOVER SCRIPT SPECIFICATIONS (10-12 scripts)**
For each slide, provide complete voiceover requirements:

Script Structure for Each Slide:
- Professional, conversational Australian tone
- 2-3 minutes speaking duration per slide (300-450 words)
- Natural speech patterns with [pause] indicators
- Emphasis markers for key points [emphasise: term]
- Pronunciation guides for technical terms
- Speaker notes for tone and pacing

**ASSESSMENT STRATEGY (5 Dynamic Assessments)**

Assessment 1: Knowledge Check Quiz
- 10 multiple choice questions with scenario-based content
- Immediate feedback with evidence-based explanations
- Questions aligned to learning objectives
- Mix of recall and application questions

Assessment 2: Drag & Drop Categorisation
- Interactive categorisation exercise using key concepts
- Real-world scenarios relevant to {{ $json.target_audience }}
- Visual feedback system with explanations
- Time-limited challenge element

Assessment 3: Decision Tree Scenario
- Branching scenario with 3-4 decision points
- Consequence-based learning with realistic outcomes
- Reflection questions at key decision points
- Multiple pathways leading to learning insights

Assessment 4: Case Study Analysis
- Comprehensive scenario based on {{ $json.target_audience }} context
- Multi-part questions requiring evidence-based reasoning
- Open-ended and structured response options
- Peer review component if applicable

Assessment 5: Competency Self-Assessment
- Observable behaviours checklist
- Workplace application focus
- Pre- and post-module comparison
- Action planning component

**ROLE PLAY SCENARIOS (3 Required)**

Role Play 1: [Scenario Title Relevant to Learning Objectives]
- Setting: [Specific workplace context for {{ $json.target_audience }}]
- Characters: [2-3 participants with clearly defined roles]
- Scenario Brief: [200-word situation description]
- Learning Focus: [Specific skills/knowledge being practiced]
- Success Criteria: [Observable outcomes for effective performance]
- Debrief Questions: [4-5 reflection questions for learning consolidation]
- iSpring Implementation: [Technical specifications for interactive delivery]

Role Play 2: [Progressive Complexity Scenario]
- Setting: [Different but related workplace context]
- Characters: [Role definitions with motivations and constraints]
- Scenario Brief: [Complex situation requiring multiple competencies]
- Learning Focus: [Integration of concepts from multiple learning objectives]
- Success Criteria: [Multi-dimensional assessment criteria]
- Debrief Questions: [Strategic reflection questions]
- iSpring Implementation: [Advanced interactive features]

Role Play 3: [Challenging Application Scenario]
- Setting: [High-stakes or complex workplace situation]
- Characters: [Multiple stakeholders with competing interests]
- Scenario Brief: [Authentic challenge requiring critical thinking]
- Learning Focus: [Advanced application and problem-solving]
- Success Criteria: [Professional-level performance indicators]
- Debrief Questions: [Critical reflection and future application]
- iSpring Implementation: [Sophisticated branching and feedback]

**MODULE WORKBOOK CONTENT (Comprehensive Resource)**

Section 1: Module Overview & Objectives
- Complete learning objectives with assessment criteria
- Key concepts summary with definitions
- Evidence references with full citations
- Module roadmap and time allocations

Section 2: Interactive Learning Activities
- Pre-module preparation checklist
- During-module reflection exercises
- Concept application worksheets
- Self-assessment tools and rubrics

Section 3: Professional Development Resources
- Additional reading list (Australian sources prioritised)
- Professional development opportunities
- Industry contacts and networks
- Continuing education pathways

Section 4: Implementation Planning
- Workplace application templates
- Goal-setting frameworks
- Progress monitoring tools
- Supervisor discussion guides

Section 5: Reference Materials
- Glossary of key terms
- Quick reference guides
- Troubleshooting common challenges
- Contact information for support

**LMS UPLOAD TEXT FILE SPECIFICATIONS**
Create a structured text file formatted for Absorb LMS AI parsing:

=== MODULE: {{ $json.module_title }} ===

COURSE: {{ $json.course_title }}
DURATION: 45-60 minutes
AUDIENCE: {{ $json.target_audience }}

--- LEARNING OBJECTIVES ---
1. [Objective 1 - clear action verb and criteria]
2. [Objective 2 - measurable outcome]
3. [Objective 3 - workplace application]
4. [Objective 4 - assessment-aligned]

--- SLIDE CONTENT ---

SLIDE 1: [Title]
Content: [Key points for LMS parsing]
Notes: [Additional context for AI interpretation]
Break: === SLIDE BREAK ===

SLIDE 2: [Title]
Content: [Key points for LMS parsing]
Notes: [Additional context for AI interpretation]
Break: === SLIDE BREAK ===

[Continue for all 10-12 slides]

--- MODULE SUMMARY ---
[3-4 key takeaways for LMS integration]

--- ASSESSMENT INSTRUCTIONS ---
[Brief instructions for LMS assessment setup]

--- ADDITIONAL RESOURCES ---
[Links and references for LMS resource section]

**EVIDENCE INTEGRATION REQUIREMENTS**
- Minimum 15-20 evidence references per module
- Vancouver citation style throughout [1], [2], [3] format
- Research Foundation integration in every major section
- Australian context and terminology prioritised
- Current best practice alignment with publication dates
- Regulatory compliance references where applicable"""

        workflow = {
            "name": "Module Generator Agent (Webhook)",
            "nodes": [
                # Webhook Trigger instead of MCP
                {
                    "parameters": {
                        "path": "module-generator",
                        "options": {}
                    },
                    "id": "webhook-trigger-module",
                    "name": "Module Generator Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse Module Data
                {
                    "parameters": {
                        "jsCode": """
// Parse the incoming module generation request
console.log('Module Generator received:', JSON.stringify($json, null, 2));

// Extract module-specific data from webhook
const courseTitle = $json.course_title || 'Unknown Course';
const moduleTitle = $json.module_title || $json.module_name || 'Unknown Module';
const targetAudience = $json.target_audience || 'General';
const researchFoundation = $json.research_foundation || 'No research foundation provided';
const learningObjectives = $json.learning_objectives || [];
const moduleNumber = $json.module_number || 1;
const userEmail = $json.user_email || '';
const userName = $json.user_name || '';
const voiceSelection = $json.voice_selection || 'default';

return {
    course_title: courseTitle,
    module_title: moduleTitle,
    target_audience: targetAudience,
    research_foundation: researchFoundation,
    learning_objectives: learningObjectives,
    module_number: moduleNumber,
    user_email: userEmail,
    user_name: userName,
    voice_selection: voiceSelection,
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
                # Prepare Module Content Prompt
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
    learning_objectives: $json.learning_objectives,
    user_name: $json.user_name,
    user_email: $json.user_email,
    voice_selection: $json.voice_selection
}};
"""
                    },
                    "id": "prepare-module-prompt",
                    "name": "Prepare Module Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Anthropic for Module Content Generation
                {
                    "parameters": {
                        "model": "claude-3-opus-20240229",
                        "text": "{{ $json.prompt }}",
                        "options": {
                            "maxTokens": 8000,
                            "temperature": 0.1
                        }
                    },
                    "id": "generate-module-content",
                    "name": "Generate Module Content",
                    "type": "n8n-nodes-base.anthropic",
                    "typeVersion": 1,
                    "position": [900, 300]
                },
                # Extract Slides for Audio Generation
                {
                    "parameters": {
                        "jsCode": """
// Extract slide information for voiceover generation
const content = $json.text || $json.content || '';
const slidePattern = /Slide \\d+:.*?(?=Slide \\d+:|Break: === SLIDE BREAK ===|$)/gs;
const slides = content.match(slidePattern) || [];

// Process each slide for voiceover
const slideData = slides.map((slide, index) => {
    const titleMatch = slide.match(/Slide \\d+: (.+)/);
    const title = titleMatch ? titleMatch[1].split('\\n')[0].trim() : `Slide ${index + 1}`;

    return {
        slide_number: index + 1,
        slide_title: title,
        slide_content: slide.trim(),
        module_title: $json.module_title,
        course_title: $json.course_title,
        voice_selection: $json.voice_selection,
        user_email: $json.user_email,
        user_name: $json.user_name
    };
});

console.log(`Extracted ${slideData.length} slides for audio generation`);
return slideData;
"""
                    },
                    "id": "extract-slides",
                    "name": "Extract Slides for Audio",
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
                                {"name": "content", "value": "COMPLETE MODULE GENERATED: {{ $json.module_title }} for {{ $json.course_title }}. Target: {{ $json.target_audience }}. Generated for: {{ $json.user_name }}. Full Content: {{ $json.text }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"complete_module\", \"module_title\": \"{{ $json.module_title }}\", \"course_title\": \"{{ $json.course_title }}\", \"user_email\": \"{{ $json.user_email }}\", \"generation_date\": \"{{ $now }}\"}"}
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
                        "method": "POST",
                        "url": "http://localhost:5678/webhook/audio-generator",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "slides", "value": "{{ JSON.stringify($json) }}"},
                                {"name": "module_title", "value": "{{ $json.module_title }}"},
                                {"name": "course_title", "value": "{{ $json.course_title }}"},
                                {"name": "voice_selection", "value": "{{ $json.voice_selection }}"}
                            ]
                        }
                    },
                    "id": "call-audio-agent",
                    "name": "Call Audio Generation Agent",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 150]
                }
            ],
            "connections": {
                "Module Generator Webhook": {
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
                            {"node": "Extract Slides for Audio", "type": "main", "index": 0},
                            {"node": "Store Module in Knowledge Lake", "type": "main", "index": 0}
                        ]
                    ]
                },
                "Extract Slides for Audio": {
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
        """Deploy the Module Generator Agent with webhook trigger"""
        print("=== Deploying Module Generator Agent (Webhook) ===")

        workflow = self.create_module_generator_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("SUCCESS: Module Generator Agent deployed!")
            print("")
            print("Features:")
            print("- Webhook trigger: http://localhost:5678/webhook/module-generator")
            print("- Comprehensive module content generation")
            print("- 10-12 detailed slide specifications")
            print("- Complete voiceover script requirements")
            print("- 5 dynamic assessments for iSpring Suite")
            print("- 3 interactive role play scenarios")
            print("- Complete module workbooks")
            print("- LMS upload formatted content")
            print("- Automatic audio generation triggering")
            print("- Knowledge Lake integration")
            print("")
            print("This agent creates ALL module deliverables:")
            print("✓ Slide specifications (10-12 slides)")
            print("✓ Voiceover scripts (professional Australian tone)")
            print("✓ Assessment strategies (5 dynamic assessments)")
            print("✓ Role play scenarios (3 interactive scenarios)")
            print("✓ Module workbooks (comprehensive resources)")
            print("✓ LMS upload files (Absorb LMS compatible)")

        return success

if __name__ == "__main__":
    agent = ModuleGeneratorWebhook()
    agent.deploy_module_generator()
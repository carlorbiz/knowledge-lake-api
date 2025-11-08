#!/usr/bin/env python3
"""
Fix Anthropic Node Issues - Replace with HTTP Request Nodes
Updates Module Generator and Audio Generator to use HTTP requests
"""

import requests
import json

class AnthropicNodeFixer:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def delete_broken_workflows(self):
        """Delete the workflows with broken Anthropic nodes"""
        try:
            # Get all workflows
            response = requests.get(f"{self.n8n_url}/api/v1/workflows", headers=self.headers)
            if response.status_code == 200:
                workflows = response.json()
                if isinstance(workflows, dict):
                    workflows = workflows.get('data', [])

                # Find and delete the broken workflows
                for workflow in workflows:
                    name = workflow.get('name', '')
                    if 'Module Generator Agent (Webhook)' in name or 'Audio Generation Agent (Webhook)' in name:
                        wf_id = workflow.get('id')
                        print(f"Deleting broken workflow: {name}")
                        delete_response = requests.delete(
                            f"{self.n8n_url}/api/v1/workflows/{wf_id}",
                            headers=self.headers
                        )
                        if delete_response.status_code == 200:
                            print(f"SUCCESS: Deleted {name}")
                        else:
                            print(f"ERROR: Failed to delete {name}")

        except Exception as e:
            print(f"Error deleting workflows: {e}")

    def create_fixed_module_generator(self):
        """Create Module Generator with HTTP Request instead of Anthropic node"""

        workflow = {
            "name": "Module Generator Agent (Fixed)",
            "nodes": [
                # Webhook Trigger
                {
                    "parameters": {
                        "path": "module-generator",
                        "httpMethod": "POST",
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
console.log('Module Generator received:', JSON.stringify($json, null, 2));

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
                        "jsCode": """
const prompt = `You are an expert Australian instructional designer creating comprehensive module content for professional education.

CONTEXT:
Course Title: ${$json.course_title}
Module: ${$json.module_title}
Target Audience: ${$json.target_audience}
Research Foundation: ${$json.research_foundation}
User: ${$json.user_name} (${$json.user_email})

Create complete module content including:
- MODULE OVERVIEW with title, duration (45-60 minutes), prerequisites, description
- LEARNING OBJECTIVES (4 specific, measurable objectives)
- KEY CONCEPTS (5 evidence-based concepts with citations)
- SLIDE SPECIFICATIONS (10-12 slides with detailed structure)
- VOICEOVER SCRIPT SPECIFICATIONS for each slide
- ASSESSMENT STRATEGY (5 dynamic assessments)
- ROLE PLAY SCENARIOS (3 interactive scenarios)
- MODULE WORKBOOK CONTENT (comprehensive resources)
- LMS UPLOAD TEXT FILE formatted for Absorb LMS AI parsing

Use Australian spelling, professional calibre content, evidence-based references with Vancouver citations, and adult learning principles throughout.`;

return {
    prompt: prompt,
    course_title: $json.course_title,
    module_title: $json.module_title,
    target_audience: $json.target_audience,
    research_foundation: $json.research_foundation,
    user_name: $json.user_name,
    user_email: $json.user_email,
    voice_selection: $json.voice_selection
};
"""
                    },
                    "id": "prepare-module-prompt",
                    "name": "Prepare Module Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Anthropic HTTP Request (Fixed)
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
                    "id": "generate-module-content",
                    "name": "Generate Module Content",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                },
                # Extract Slides for Audio Generation
                {
                    "parameters": {
                        "jsCode": """
const content = $json.content[0].text || '';
const slidePattern = /Slide \\d+:.*?(?=Slide \\d+:|Break: === SLIDE BREAK ===|$)/gs;
const slides = content.match(slidePattern) || [];

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
                # Store Module Content in Knowledge Lake (Fixed URL)
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:5000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "COMPLETE MODULE GENERATED: {{ $json.module_title }} for {{ $json.course_title }}. Target: {{ $json.target_audience }}. Generated for: {{ $json.user_name }}. Full Content: {{ $json.content[0].text }}"},
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
                # Call Audio Generation Agent
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

    def create_fixed_audio_generator(self):
        """Create Audio Generator with HTTP Request instead of Anthropic node"""

        workflow = {
            "name": "Audio Generation Agent (Fixed)",
            "nodes": [
                # Webhook Trigger
                {
                    "parameters": {
                        "path": "audio-generator",
                        "httpMethod": "POST",
                        "options": {}
                    },
                    "id": "webhook-trigger-audio",
                    "name": "Audio Generator Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse Slide Data
                {
                    "parameters": {
                        "jsCode": """
console.log('Audio Generator received:', JSON.stringify($json, null, 2));

let slides = [];
if ($json.slides) {
    try {
        slides = typeof $json.slides === 'string' ? JSON.parse($json.slides) : $json.slides;
    } catch (e) {
        console.log('Error parsing slides JSON:', e);
        slides = [];
    }
} else if (Array.isArray($json)) {
    slides = $json;
} else if ($json.slide_number) {
    slides = [$json];
}

console.log(`Processing ${slides.length} slides for audio generation`);

return slides.map(slide => ({
    slide_number: slide.slide_number || 1,
    slide_title: slide.slide_title || 'Untitled Slide',
    slide_content: slide.slide_content || '',
    module_title: slide.module_title || $json.module_title || 'Unknown Module',
    course_title: slide.course_title || $json.course_title || 'Unknown Course',
    voice_selection: slide.voice_selection || $json.voice_selection || 'professional',
    target_audience: slide.target_audience || 'General',
    timestamp: new Date().toISOString()
}));
"""
                    },
                    "id": "parse-slide-data",
                    "name": "Parse Slide Data",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [460, 300]
                },
                # Generate Voiceover Script Prompt
                {
                    "parameters": {
                        "jsCode": """
const prompt = `You are an expert Australian voiceover script writer creating professional audio content for education.

CONTEXT:
Slide Number: ${$json.slide_number}
Slide Title: ${$json.slide_title}
Slide Content: ${$json.slide_content}
Module: ${$json.module_title}
Course: ${$json.course_title}
Voice Selection: ${$json.voice_selection}
Target Audience: ${$json.target_audience}

Create a professional 2-3 minute voiceover script with:
- Professional, conversational Australian tone
- Natural speech patterns with strategic pauses
- Emphasis on key learning points
- Pronunciation guides for technical terms
- Voice selection compliance: ${$json.voice_selection}

Output structured script with introduction, main content, transition/summary, pronunciation guide, and delivery instructions.`;

return {
    prompt: prompt,
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    slide_content: $json.slide_content,
    module_title: $json.module_title,
    course_title: $json.course_title,
    voice_selection: $json.voice_selection,
    target_audience: $json.target_audience
};
"""
                    },
                    "id": "prepare-script-prompt",
                    "name": "Prepare Script Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Anthropic HTTP Request for Script Generation (Fixed)
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
                        }
                    },
                    "id": "generate-script",
                    "name": "Generate Voiceover Script",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                },
                # Store Audio Information in Knowledge Lake (Fixed URL)
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:5000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "AUDIO SCRIPT GENERATED: Slide {{ $json.slide_number }} - {{ $json.slide_title }} for {{ $json.module_title }}. Voice: {{ $json.voice_selection }}. Script: {{ $json.content[0].text }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"audio_script\", \"slide_number\": \"{{ $json.slide_number }}\", \"module_title\": \"{{ $json.module_title }}\", \"voice_type\": \"{{ $json.voice_selection }}\"}"}
                            ]
                        }
                    },
                    "id": "store-audio-knowledge",
                    "name": "Store Audio in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1120, 150]
                }
            ],
            "connections": {
                "Audio Generator Webhook": {
                    "main": [[{"node": "Parse Slide Data", "type": "main", "index": 0}]]
                },
                "Parse Slide Data": {
                    "main": [[{"node": "Prepare Script Prompt", "type": "main", "index": 0}]]
                },
                "Prepare Script Prompt": {
                    "main": [[{"node": "Generate Voiceover Script", "type": "main", "index": 0}]]
                },
                "Generate Voiceover Script": {
                    "main": [[{"node": "Store Audio in Knowledge Lake", "type": "main", "index": 0}]]
                }
            },
            "settings": {}
        }
        return workflow

    def deploy_workflow(self, workflow):
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
                return False
        except Exception as e:
            print(f"ERROR: {e}")
            return False

    def fix_all_workflows(self):
        """Delete broken workflows and deploy fixed versions"""
        print("=== Fixing Anthropic Node Issues ===")

        # Step 1: Delete broken workflows
        print("1. Deleting broken workflows with invalid Anthropic nodes...")
        self.delete_broken_workflows()

        # Step 2: Deploy fixed versions
        print("\n2. Deploying fixed workflows with HTTP Request nodes...")

        # Deploy fixed Module Generator
        module_workflow = self.create_fixed_module_generator()
        module_success = self.deploy_workflow(module_workflow)

        # Deploy fixed Audio Generator
        audio_workflow = self.create_fixed_audio_generator()
        audio_success = self.deploy_workflow(audio_workflow)

        if module_success and audio_success:
            print("\n=== SUCCESS: All workflows fixed! ===")
            print("Fixed workflows:")
            print("- Module Generator Agent (Fixed) with POST webhook")
            print("- Audio Generation Agent (Fixed) with POST webhook")
            print("- Corrected Knowledge Lake URLs (localhost:5000)")
            print("- HTTP Request nodes instead of invalid Anthropic nodes")
            print("\nWebhook URLs:")
            print("- Module Generator: http://localhost:5678/webhook/module-generator")
            print("- Audio Generator: http://localhost:5678/webhook/audio-generator")
            print("\nNext: Activate both workflows and test the complete system!")

        return module_success and audio_success

if __name__ == "__main__":
    fixer = AnthropicNodeFixer()
    fixer.fix_all_workflows()
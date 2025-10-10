#!/usr/bin/env python3
"""
Audio Generation Agent Builder
Creates sophisticated voiceover generation with custom Australian accent
"""

import requests
import json
import os
from typing import Dict

class AudioGeneratorAgent:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_audio_generation_workflow(self) -> Dict:
        """Creates the audio generation workflow with custom Australian accent"""

        voiceover_script_prompt = """You are an expert Australian voiceover script writer creating professional audio content for healthcare education.

CONTEXT:
Slide Number: {{ $json.slide_number }}
Slide Title: {{ $json.slide_title }}
Slide Content: {{ $json.slide_content }}
Module: {{ $json.module_title }}
Course: {{ $json.course_title }}

TASK: Create a professional voiceover script for this slide that complements (not duplicates) the visual content.

REQUIREMENTS:
- Professional, conversational Australian tone
- 2-3 minutes speaking duration (approximately 300-450 words)
- Natural speech patterns with appropriate pauses
- Emphasis on key learning points
- Healthcare professional audience
- Australian pronunciation and terminology
- Engaging and authoritative delivery

PRONUNCIATION GUIDE:
Include specific pronunciation guidance for:
- Medical terminology: [pronunciation in brackets]
- Australian regulatory bodies: AHPRA [AH-prah], NMBA [en-em-bee-ay]
- Healthcare terms with Australian context
- Key technical concepts

SCRIPT STRUCTURE:
**SLIDE {{ $json.slide_number }} VOICEOVER SCRIPT**

[INTRODUCTION - 30-45 seconds]
Welcome to slide {{ $json.slide_number }} of {{ $json.module_title }}. [pause]
[Context-setting content that introduces the slide topic]

[MAIN CONTENT - 90-120 seconds]
[Detailed explanation that expands on slide content, provides examples, and adds value]
[Include natural pauses indicated with [pause]]
[Indicate emphasis with [emphasise: word/phrase]]

[TRANSITION/SUMMARY - 30-60 seconds]
[Summarise key points and transition to next slide or activity]
Let's move on to explore [next topic preview].

**PRONUNCIATION NOTES:**
- [Technical term]: [phonetic pronunciation]
- [Medical term]: [Australian pronunciation guide]
- [Regulatory term]: [emphasis and pronunciation]

**DELIVERY NOTES:**
- Tone: [Specific direction for this slide]
- Pace: [Fast/moderate/slow for different sections]
- Emphasis: [Key words or phrases to stress]
- Pauses: [Strategic pause points for comprehension]

**TOTAL ESTIMATED DURATION:** [X minutes X seconds]

The script should sound natural when read aloud and maintain professional credibility while being engaging for adult learners in the Australian healthcare context."""

        accent_prompt = """AUSTRALIAN ACCENT SPECIFICATIONS for Gemini TTS:

Base Voice: Use a professional, clear Australian accent with the following characteristics:

**Vowel Modifications:**
- "a" sounds: Slightly flattened (dance → dahnce)
- "i" sounds: Dipthong emphasis (like → layk)
- "o" sounds: Rounded but not overly broad
- "u" sounds: Central positioning

**Consonant Features:**
- "r" sounds: Non-rhotic (not pronounced at end of words)
- "t" sounds: Clear articulation, not dropped
- Rising intonation: Characteristic Australian uptalk for questions

**Professional Modifications:**
- Maintain clarity and authority
- Reduce colloquialisms but keep Australian character
- Professional pacing (not rushed)
- Clear articulation for healthcare terminology

**Healthcare Context Adjustments:**
- AHPRA: "AH-prah" (not A-H-P-R-A)
- NMBA: "en-em-bee-ay"
- "Schedule": "SHED-yool" (Australian pronunciation)
- "Privacy": "PRY-vah-see" (Australian emphasis)
- "Data": "DAY-tah" (Australian preference)

**Emotional Tone:**
- Confident and knowledgeable
- Warm but professional
- Engaging without being overly casual
- Appropriate authority for healthcare education

This accent should sound like a professional Australian healthcare educator - authoritative, clear, and appropriately engaging for adult learners."""

        workflow = {
            "name": "Audio Generation Agent",
            "nodes": [
                # MCP Trigger
                {
                    "parameters": {
                        "toolName": "audio-generator",
                        "options": {}
                    },
                    "id": "mcp-trigger-audio",
                    "name": "MCP Trigger: Audio Generator",
                    "type": "n8n-nodes-mcp.mcpTrigger",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse Slide Data
                {
                    "parameters": {
                        "jsCode": """
// Parse the incoming slide data for audio generation
const input = $input.first().json;
console.log('Audio Generator received:', JSON.stringify(input, null, 2));

// Handle both single slide and array of slides
let slides = [];
if (Array.isArray(input)) {
    slides = input;
} else if (input.slide_number) {
    slides = [input];
} else {
    // Try to extract from nested structure
    slides = input.slides || [input];
}

return slides.map(slide => ({
    slide_number: slide.slide_number || 1,
    slide_title: slide.slide_title || 'Untitled Slide',
    slide_content: slide.slide_content || '',
    module_title: slide.module_title || input.module_title || 'Unknown Module',
    course_title: slide.course_title || input.course_title || 'Unknown Course',
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
                # Generate Voiceover Script
                {
                    "parameters": {
                        "jsCode": f"""
const prompt = `{voiceover_script_prompt}`;
return {{
    prompt: prompt,
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    slide_content: $json.slide_content,
    module_title: $json.module_title,
    course_title: $json.course_title
}};
"""
                    },
                    "id": "prepare-script-prompt",
                    "name": "Prepare Script Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Claude for Script Generation
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
                    "id": "generate-script",
                    "name": "Generate Voiceover Script",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                },
                # Extract Clean Script
                {
                    "parameters": {
                        "jsCode": """
// Extract the clean script text from Claude's response
const scriptContent = $json.content[0].text;

// Remove formatting markers and extract just the spoken content
const cleanScript = scriptContent
    .replace(/\\*\\*.*?\\*\\*/g, '') // Remove bold markers
    .replace(/\\[.*?\\]/g, '') // Remove stage directions initially
    .replace(/SLIDE \\d+ VOICEOVER SCRIPT/gi, '')
    .replace(/PRONUNCIATION NOTES:.*$/gms, '')
    .replace(/DELIVERY NOTES:.*$/gms, '')
    .replace(/TOTAL ESTIMATED DURATION:.*$/gms, '')
    .trim();

// Extract stage directions for TTS optimization
const stageDirections = scriptContent.match(/\\[.*?\\]/g) || [];
const pronunciationNotes = scriptContent.match(/PRONUNCIATION NOTES:[\\s\\S]*?(?=\\*\\*|$)/gi) || [];

return {
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    clean_script: cleanScript,
    full_script: scriptContent,
    stage_directions: stageDirections,
    pronunciation_notes: pronunciationNotes,
    module_title: $json.module_title,
    course_title: $json.course_title
};
"""
                    },
                    "id": "extract-clean-script",
                    "name": "Extract Clean Script",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [1120, 300]
                },
                # Prepare for Gemini TTS
                {
                    "parameters": {
                        "jsCode": f"""
// Prepare the script for Gemini TTS with Australian accent instructions
const accentInstructions = `{accent_prompt}`;

const ttsPrompt = `${{accentInstructions}}

SCRIPT TO READ:
${{$json.clean_script}}

Please generate this with a professional Australian accent as specified above.`;

return {{
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    tts_prompt: ttsPrompt,
    clean_script: $json.clean_script,
    module_title: $json.module_title,
    course_title: $json.course_title,
    filename: `${{$json.course_title}}_${{$json.module_title}}_Slide_${{$json.slide_number}}.wav`.replace(/[^a-zA-Z0-9_]/g, '_')
}};
"""
                    },
                    "id": "prepare-tts",
                    "name": "Prepare for TTS",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [1340, 300]
                },
                # Gemini TTS Generation
                {
                    "parameters": {
                        "method": "POST",
                        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                        "authentication": "none",
                        "sendHeaders": True,
                        "headerParameters": {
                            "parameters": [
                                {"name": "x-goog-api-key", "value": "={{ $env.GEMINI_API_KEY }}"},
                                {"name": "content-type", "value": "application/json"}
                            ]
                        },
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {
                                    "name": "contents",
                                    "value": "[{\"parts\": [{\"text\": \"{{ $json.tts_prompt }}\"}]}]"
                                },
                                {
                                    "name": "generationConfig",
                                    "value": "{\"temperature\": 0.1, \"maxOutputTokens\": 1000}"
                                }
                            ]
                        },
                        "options": {}
                    },
                    "id": "gemini-tts",
                    "name": "Generate Audio with Gemini",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1560, 300]
                },
                # Store Audio Script in Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "Audio Script Generated: Slide {{ $json.slide_number }} - {{ $json.slide_title }} for {{ $json.module_title }}. Script: {{ $json.clean_script }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"audio_script\", \"slide_number\": \"{{ $json.slide_number }}\", \"module_title\": \"{{ $json.module_title }}\", \"filename\": \"{{ $json.filename }}\"}"}
                            ]
                        }
                    },
                    "id": "store-audio-knowledge",
                    "name": "Store Audio in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 150]
                }
            ],
            "connections": {
                "MCP Trigger: Audio Generator": {
                    "main": [[{"node": "Parse Slide Data", "type": "main", "index": 0}]]
                },
                "Parse Slide Data": {
                    "main": [[{"node": "Prepare Script Prompt", "type": "main", "index": 0}]]
                },
                "Prepare Script Prompt": {
                    "main": [[{"node": "Generate Voiceover Script", "type": "main", "index": 0}]]
                },
                "Generate Voiceover Script": {
                    "main": [[{"node": "Extract Clean Script", "type": "main", "index": 0}]]
                },
                "Extract Clean Script": {
                    "main": [
                        [
                            {"node": "Prepare for TTS", "type": "main", "index": 0},
                            {"node": "Store Audio in Knowledge Lake", "type": "main", "index": 0}
                        ]
                    ]
                },
                "Prepare for TTS": {
                    "main": [[{"node": "Generate Audio with Gemini", "type": "main", "index": 0}]]
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

    def deploy_audio_generator(self):
        """Deploy the Audio Generation Agent"""
        print("=== Deploying Audio Generation Agent ===")

        workflow = self.create_audio_generation_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("Audio Generation Agent deployed successfully!")
            print("Features:")
            print("- Professional Australian accent with Gemini TTS")
            print("- Custom pronunciation for healthcare terms")
            print("- 2-3 minute scripts per slide")
            print("- Natural speech patterns and emphasis")
            print("- Professional healthcare educator tone")
            print("- Integration with Knowledge Lake")

        return success

if __name__ == "__main__":
    agent = AudioGeneratorAgent()
    agent.deploy_audio_generator()
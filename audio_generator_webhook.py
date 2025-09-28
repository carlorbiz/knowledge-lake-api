#!/usr/bin/env python3
"""
Audio Generation Agent Builder - Webhook Version
Creates sophisticated voiceover generation with custom Australian accent
"""

import requests
import json
import os
from typing import Dict

class AudioGeneratorWebhook:
    def __init__(self):
        self.n8n_url = "http://localhost:5678"
        self.n8n_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDMyZWEzMi05ZWEwLTRjYTgtYTMwMS01Y2RjYWVhNmIxYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5MDU2NzQ1fQ.fwV6TAjSuVHj6gNcsADHhUz6UHJrke5Njxo81Hy6hDc"
        self.headers = {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": self.n8n_api_key
        }

    def create_audio_generation_workflow(self) -> Dict:
        """Creates the audio generation workflow with custom Australian accent and webhook trigger"""

        voiceover_script_prompt = """You are an expert Australian voiceover script writer creating professional audio content for education.

CONTEXT:
Slide Number: {{ $json.slide_number }}
Slide Title: {{ $json.slide_title }}
Slide Content: {{ $json.slide_content }}
Module: {{ $json.module_title }}
Course: {{ $json.course_title }}
Voice Selection: {{ $json.voice_selection }}
Target Audience: {{ $json.target_audience }}

TASK: Create a professional voiceover script that complements (not duplicates) the visual slide content.

REQUIREMENTS:
- Professional, conversational Australian tone
- 2-3 minutes speaking duration (approximately 300-450 words)
- Natural speech patterns with strategic pauses
- Emphasis on key learning points
- Professional audience appropriate
- Australian pronunciation and terminology
- Engaging and authoritative delivery
- Voice selection compliance: {{ $json.voice_selection }}

SCRIPT STRUCTURE:

**SLIDE {{ $json.slide_number }} VOICEOVER SCRIPT**

[INTRODUCTION - 30-45 seconds]
Welcome to slide {{ $json.slide_number }} of {{ $json.module_title }}. [pause]
[Context-setting content that introduces the slide topic and connects to previous learning]

[MAIN CONTENT - 90-120 seconds]
[Detailed explanation that expands on slide content]
[Provide real-world examples relevant to {{ $json.target_audience }}]
[Include natural pauses indicated with [pause]]
[Mark emphasis with [emphasise: word/phrase]]
[Add pronunciation guides for technical terms [pronounce: technical-term as "tek-ni-kal term"]]

[TRANSITION/SUMMARY - 30-60 seconds]
[Summarise key points and provide transition]
This brings us to our next important concept... [or] Let's now explore how this applies in practice...

**PRONUNCIATION GUIDE:**
- [Technical terms]: [Phonetic pronunciation with Australian accent]
- [Medical/business terms]: [Australian pronunciation variations]
- [Regulatory terms]: [Emphasis and correct pronunciation]

**DELIVERY INSTRUCTIONS:**
- Tone: [Authoritative but approachable]
- Pace: [Moderate with strategic slowing for key concepts]
- Emphasis: [Key words requiring vocal stress]
- Pauses: [Strategic pause points for comprehension and note-taking]
- Energy Level: [Professional enthusiasm appropriate for adult learners]

**ESTIMATED DURATION:** [X minutes X seconds - must be 2-3 minutes]

**VOICE SELECTION NOTES:**
Voice Type: {{ $json.voice_selection }}
[Specific instructions for the selected voice type regarding tone, pace, and emphasis]

The script should sound natural when read aloud and maintain professional credibility while being engaging for Australian adult learners."""

        accent_prompt_templates = {
            "professional": """PROFESSIONAL AUSTRALIAN ACCENT for TTS Generation:

Voice Characteristics:
- Clear, articulate professional Australian accent
- Authoritative but approachable tone
- Moderate pace suitable for educational content
- Clear pronunciation of technical terms
- Professional warmth without casual informality

Accent Features:
- Non-rhotic 'r' sounds (not pronounced at word endings)
- Slightly flattened 'a' sounds (dance → dahnce)
- Clear 't' articulation (not dropped or softened)
- Rising intonation for engagement, not uncertainty
- Rounded 'o' sounds without exaggeration

Professional Modifications:
- Reduced colloquialisms while maintaining Australian character
- Clear articulation for complex terminology
- Confident, knowledgeable delivery
- Appropriate authority for professional education
- Engaging without being overly casual""",

            "executive": """EXECUTIVE AUSTRALIAN ACCENT for TTS Generation:

Voice Characteristics:
- Sophisticated, executive-level Australian accent
- Confident, strategic tone
- Measured pace for gravitas
- Clear, decisive articulation
- Leadership authority in delivery

Accent Features:
- Refined Australian vowel sounds
- Strong consonant definition
- Strategic pausing for emphasis
- Lower vocal register for authority
- Minimal uptalk, assertive statements

Executive Modifications:
- Business-appropriate formality
- Strategic communication style
- Confident decision-making tone
- International business accent (less colloquial)
- Authority without aggression""",

            "clinical": """CLINICAL AUSTRALIAN ACCENT for TTS Generation:

Voice Characteristics:
- Professional healthcare Australian accent
- Competent, caring tone
- Clear, precise articulation
- Patient, educational delivery
- Clinical authority with approachability

Accent Features:
- Precise pronunciation of medical terms
- Clear, measured speech for accuracy
- Professional healthcare register
- Calm, reassuring vocal quality
- Evidence-based confidence

Clinical Modifications:
- Medical terminology precision
- Patient-appropriate communication
- Professional healthcare authority
- Careful, considerate pace
- Trustworthy, knowledgeable delivery""",

            "default": """STANDARD PROFESSIONAL AUSTRALIAN ACCENT for TTS Generation:

Voice Characteristics:
- Clear, professional Australian accent
- Friendly but authoritative tone
- Natural, conversational pace
- Engaging educational delivery
- Professional adult learning appropriate

Standard Features:
- Natural Australian vowel patterns
- Clear consonant articulation
- Engaging but not overly casual
- Professional warmth
- Educational authority"""
        }

        workflow = {
            "name": "Audio Generation Agent (Webhook)",
            "nodes": [
                # Webhook Trigger instead of MCP
                {
                    "parameters": {
                        "path": "audio-generator",
                        "options": {}
                    },
                    "id": "webhook-trigger-audio",
                    "name": "Audio Generator Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300]
                },
                # Parse Slide Data from Module Generator
                {
                    "parameters": {
                        "jsCode": """
// Parse the incoming slide data for audio generation
console.log('Audio Generator received:', JSON.stringify($json, null, 2));

// Handle the slides data from Module Generator
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

// Return array of slides for processing
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
                # Generate Voiceover Script for Each Slide
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
    course_title: $json.course_title,
    voice_selection: $json.voice_selection,
    target_audience: $json.target_audience
}};
"""
                    },
                    "id": "prepare-script-prompt",
                    "name": "Prepare Script Prompt",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                # Anthropic for Script Generation
                {
                    "parameters": {
                        "model": "claude-3-sonnet-20240229",
                        "text": "{{ $json.prompt }}",
                        "options": {
                            "maxTokens": 4000,
                            "temperature": 0.1
                        }
                    },
                    "id": "generate-script",
                    "name": "Generate Voiceover Script",
                    "type": "n8n-nodes-base.anthropic",
                    "typeVersion": 1,
                    "position": [900, 300]
                },
                # Extract Clean Script for TTS
                {
                    "parameters": {
                        "jsCode": """
// Extract the clean script text for TTS generation
const scriptContent = $json.text || '';

// Remove formatting markers and extract spoken content
const cleanScript = scriptContent
    .replace(/\\*\\*.*?\\*\\*/g, '') // Remove bold markers
    .replace(/\\[pause\\]/g, ' ') // Convert pause markers to spaces
    .replace(/\\[emphasise: (.*?)\\]/g, '$1') // Remove emphasis markers but keep text
    .replace(/\\[pronounce: .*? as ".*?"\\]/g, '') // Remove pronunciation guides
    .replace(/SLIDE \\d+ VOICEOVER SCRIPT/gi, '')
    .replace(/PRONUNCIATION GUIDE:.*$/gms, '')
    .replace(/DELIVERY INSTRUCTIONS:.*$/gms, '')
    .replace(/ESTIMATED DURATION:.*$/gms, '')
    .replace(/VOICE SELECTION NOTES:.*$/gms, '')
    .trim();

// Extract timing and emphasis information
const estimatedDuration = scriptContent.match(/ESTIMATED DURATION: ([^\\n]+)/i);
const voiceType = $json.voice_selection || 'professional';

return {
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    clean_script: cleanScript,
    full_script: scriptContent,
    voice_selection: voiceType,
    estimated_duration: estimatedDuration ? estimatedDuration[1] : '2-3 minutes',
    module_title: $json.module_title,
    course_title: $json.course_title,
    filename: `${{$json.course_title}}_${{$json.module_title}}_Slide_${{$json.slide_number}}.wav`.replace(/[^a-zA-Z0-9_]/g, '_')
};
"""
                    },
                    "id": "extract-clean-script",
                    "name": "Extract Clean Script",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [1120, 300]
                },
                # Prepare Australian Accent Instructions
                {
                    "parameters": {
                        "jsCode": f"""
// Select appropriate accent template based on voice selection
const accentTemplates = {json.dumps(accent_prompt_templates)};

const voiceType = $json.voice_selection || 'default';
const accentInstructions = accentTemplates[voiceType] || accentTemplates['default'];

// Prepare comprehensive TTS prompt
const ttsPrompt = `AUSTRALIAN ACCENT TTS GENERATION

${{accentInstructions}}

HEALTHCARE/PROFESSIONAL PRONUNCIATION GUIDE:
- AHPRA: "AH-prah" (not A-H-P-R-A)
- NMBA: "en-em-bee-ay"
- Schedule: "SHED-yool" (Australian pronunciation)
- Privacy: "PRY-vah-see" (Australian emphasis)
- Data: "DAY-tah" (Australian preference)
- Research: "REE-search" (Australian pronunciation)

SCRIPT TO READ WITH AUSTRALIAN ACCENT:

${{$json.clean_script}}

Please generate this audio with the specified professional Australian accent characteristics above.`;

return {{
    slide_number: $json.slide_number,
    slide_title: $json.slide_title,
    tts_prompt: ttsPrompt,
    clean_script: $json.clean_script,
    voice_selection: $json.voice_selection,
    module_title: $json.module_title,
    course_title: $json.course_title,
    filename: $json.filename,
    accent_type: voiceType
}};
"""
                    },
                    "id": "prepare-tts",
                    "name": "Prepare Australian TTS",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [1340, 300]
                },
                # Gemini Text-to-Speech Generation
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
                                    "value": "{\"temperature\": 0.1, \"maxOutputTokens\": 2000}"
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
                # Store Audio Information in Knowledge Lake
                {
                    "parameters": {
                        "method": "POST",
                        "url": "http://localhost:3000/knowledge/add",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {"name": "content", "value": "AUDIO GENERATED: Slide {{ $json.slide_number }} - {{ $json.slide_title }} for {{ $json.module_title }}. Voice: {{ $json.voice_selection }}. Script: {{ $json.clean_script }}. Filename: {{ $json.filename }}"},
                                {"name": "user_id", "value": "carla_knowledge_lake"},
                                {"name": "metadata", "value": "{\"type\": \"audio_file\", \"slide_number\": \"{{ $json.slide_number }}\", \"module_title\": \"{{ $json.module_title }}\", \"voice_type\": \"{{ $json.voice_selection }}\", \"filename\": \"{{ $json.filename }}\", \"accent\": \"australian_professional\"}"}
                            ]
                        }
                    },
                    "id": "store-audio-knowledge",
                    "name": "Store Audio in Knowledge Lake",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 150]
                },
                # Format Final Audio Package
                {
                    "parameters": {
                        "values": {
                            "string": [
                                {"name": "audio_status", "value": "generated"},
                                {"name": "slide_number", "value": "{{ $json.slide_number }}"},
                                {"name": "filename", "value": "{{ $json.filename }}"},
                                {"name": "voice_type", "value": "{{ $json.voice_selection }}"},
                                {"name": "duration_estimate", "value": "2-3 minutes"},
                                {"name": "accent", "value": "Professional Australian"},
                                {"name": "generation_timestamp", "value": "{{ $now }}"}
                            ]
                        }
                    },
                    "id": "format-audio-package",
                    "name": "Format Audio Package",
                    "type": "n8n-nodes-base.set",
                    "typeVersion": 3,
                    "position": [1780, 300]
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
                    "main": [[{"node": "Extract Clean Script", "type": "main", "index": 0}]]
                },
                "Extract Clean Script": {
                    "main": [
                        [
                            {"node": "Prepare Australian TTS", "type": "main", "index": 0},
                            {"node": "Store Audio in Knowledge Lake", "type": "main", "index": 0}
                        ]
                    ]
                },
                "Prepare Australian TTS": {
                    "main": [[{"node": "Generate Audio with Gemini", "type": "main", "index": 0}]]
                },
                "Generate Audio with Gemini": {
                    "main": [[{"node": "Format Audio Package", "type": "main", "index": 0}]]
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
        """Deploy the Audio Generation Agent with webhook trigger"""
        print("=== Deploying Audio Generation Agent (Webhook) ===")

        workflow = self.create_audio_generation_workflow()
        success = self.deploy_workflow(workflow)

        if success:
            print("SUCCESS: Audio Generation Agent deployed!")
            print("")
            print("Features:")
            print("- Webhook trigger: http://localhost:5678/webhook/audio-generator")
            print("- Professional Australian accent generation")
            print("- 4 voice types: professional, executive, clinical, default")
            print("- Custom pronunciation for Australian healthcare/business terms")
            print("- 2-3 minute professional scripts per slide")
            print("- Natural speech patterns with strategic pauses")
            print("- Gemini TTS integration")
            print("- Knowledge Lake audio tracking")
            print("- Professional healthcare/business educator tone")
            print("")
            print("Voice Selection Options:")
            print("- professional: Clear, authoritative Australian professional")
            print("- executive: Sophisticated, strategic business accent")
            print("- clinical: Healthcare professional accent")
            print("- default: Standard professional Australian")
            print("")
            print("Audio Output:")
            print("- .wav files with professional Australian accent")
            print("- Pronunciation guides for technical terms")
            print("- Strategic emphasis and pacing")
            print("- Adult learning appropriate delivery")

        return success

if __name__ == "__main__":
    agent = AudioGeneratorWebhook()
    agent.deploy_audio_generator()
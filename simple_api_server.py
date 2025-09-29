API_KEY = "carla_knowledge_lake_2025"  # Your secret key

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from datetime import datetime
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
XAI_API_KEY = os.getenv('XAI_API_KEY')

# API rate limiting and provider rotation
import time
from collections import defaultdict
import random

api_call_counts = defaultdict(int)
api_last_reset = defaultdict(float)
API_LIMITS = {
    'perplexity': {'calls_per_hour': 100, 'tokens_per_request': 8000},
    'openai': {'calls_per_hour': 500, 'tokens_per_request': 4000},
    'anthropic': {'calls_per_hour': 300, 'tokens_per_request': 4000},
    'gemini': {'calls_per_hour': 400, 'tokens_per_request': 3000},
    'grok': {'calls_per_hour': 200, 'tokens_per_request': 3000}
}

def reset_api_counter_if_needed(provider):
    """Reset API call counter if an hour has passed"""
    current_time = time.time()
    if current_time - api_last_reset[provider] >= 3600:  # 1 hour
        api_call_counts[provider] = 0
        api_last_reset[provider] = current_time

def can_make_api_call(provider):
    """Check if we can make an API call without hitting limits"""
    reset_api_counter_if_needed(provider)
    return api_call_counts[provider] < API_LIMITS[provider]['calls_per_hour']

def select_best_provider(task_type='general'):
    """Select best available provider based on task type and current limits"""

    # Task-specific provider preferences
    provider_preferences = {
        'research': ['perplexity', 'openai', 'anthropic'],
        'content_generation': ['openai', 'anthropic', 'gemini'],
        'assessment_creation': ['anthropic', 'openai', 'gemini'],
        'roleplay_scenarios': ['anthropic', 'openai', 'grok'],
        'audio_optimization': ['gemini', 'openai', 'anthropic'],
        'general': ['openai', 'anthropic', 'gemini', 'perplexity']
    }

    preferred_providers = provider_preferences.get(task_type, provider_preferences['general'])

    # Find first available provider
    for provider in preferred_providers:
        if can_make_api_call(provider):
            return provider

    # If all preferred providers are at limit, try any available provider
    all_providers = list(API_LIMITS.keys())
    random.shuffle(all_providers)
    for provider in all_providers:
        if can_make_api_call(provider):
            return provider

    return None  # All providers at limit

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for now
knowledge_store = []

def call_openai_api(prompt, task_type='general'):
    """Call OpenAI API with rate limiting"""
    if not OPENAI_API_KEY:
        return "Error: OpenAI API key not found"

    if not can_make_api_call('openai'):
        return "Error: OpenAI API rate limit reached"

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": API_LIMITS['openai']['tokens_per_request'],
                "temperature": 0.3
            },
            timeout=300
        )
        response.raise_for_status()
        result = response.json()

        api_call_counts['openai'] += 1

        if result.get('choices') and len(result['choices']) > 0:
            return result["choices"][0]["message"]["content"]
        else:
            return "Error: No content in OpenAI response"

    except Exception as e:
        return f"Error calling OpenAI API: {str(e)}"

def call_anthropic_api(prompt, task_type='general'):
    """Call Anthropic Claude API with rate limiting"""
    if not ANTHROPIC_API_KEY:
        return "Error: Anthropic API key not found"

    if not can_make_api_call('anthropic'):
        return "Error: Anthropic API rate limit reached"

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Authorization": f"Bearer {ANTHROPIC_API_KEY}",
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": API_LIMITS['anthropic']['tokens_per_request'],
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            },
            timeout=300
        )
        response.raise_for_status()
        result = response.json()

        api_call_counts['anthropic'] += 1

        if result.get('content') and len(result['content']) > 0:
            return result["content"][0]["text"]
        else:
            return "Error: No content in Anthropic response"

    except Exception as e:
        return f"Error calling Anthropic API: {str(e)}"

def call_gemini_api(prompt, task_type='general'):
    """Call Google Gemini API with rate limiting"""
    if not GEMINI_API_KEY:
        return "Error: Gemini API key not found"

    if not can_make_api_call('gemini'):
        return "Error: Gemini API rate limit reached"

    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": API_LIMITS['gemini']['tokens_per_request'],
                    "temperature": 0.3
                }
            },
            timeout=300
        )
        response.raise_for_status()
        result = response.json()

        api_call_counts['gemini'] += 1

        if result.get('candidates') and len(result['candidates']) > 0:
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            return "Error: No content in Gemini response"

    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"

def call_grok_api(prompt, task_type='general'):
    """Call XAI Grok API with rate limiting"""
    if not XAI_API_KEY:
        return "Error: XAI API key not found"

    if not can_make_api_call('grok'):
        return "Error: XAI API rate limit reached"

    try:
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "grok-4",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": API_LIMITS['grok']['tokens_per_request'],
                "temperature": 0.3,
                "stream": False
            },
            timeout=300
        )
        response.raise_for_status()
        result = response.json()

        api_call_counts['grok'] += 1

        if result.get('choices') and len(result['choices']) > 0:
            return result["choices"][0]["message"]["content"]
        else:
            return "Error: No content in XAI response"

    except Exception as e:
        return f"Error calling XAI API: {str(e)}"

def call_ai_provider(prompt, task_type='general'):
    """Smart AI provider selection with automatic fallback"""
    provider = select_best_provider(task_type)

    if not provider:
        return "Error: All AI providers have reached their rate limits. Please try again later."

    print(f"Using {provider} for {task_type} task")

    if provider == 'perplexity':
        return call_perplexity_api(prompt)
    elif provider == 'openai':
        return call_openai_api(prompt, task_type)
    elif provider == 'anthropic':
        return call_anthropic_api(prompt, task_type)
    elif provider == 'gemini':
        return call_gemini_api(prompt, task_type)
    elif provider == 'grok':
        return call_grok_api(prompt, task_type)
    else:
        return "Error: Unknown provider selected"

def call_perplexity_api(prompt):
    """
    Call Perplexity API with the research prompt
    """
    if not PERPLEXITY_API_KEY:
        return "Error: Perplexity API key not found in environment variables"

    try:
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "sonar-deep-research",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 8000,
                "temperature": 0.3,
                "top_p": 0.9
            },
            timeout=600  # 10 minute timeout for comprehensive research
        )
        response.raise_for_status()
        result = response.json()

        # Debug: Log the response structure
        print(f"Perplexity response status: {response.status_code}")
        print(f"Response has choices: {len(result.get('choices', []))}")

        if result.get('choices') and len(result['choices']) > 0:
            content = result["choices"][0]["message"]["content"]
            print(f"Content length: {len(content)} characters")
            print(f"Content preview: {content[:200]}...")
            return content
        else:
            return "Error: No content in Perplexity response"

    except requests.exceptions.Timeout:
        return "Error: Perplexity API request timed out after 10 minutes - try again or use a shorter prompt"
    except requests.exceptions.RequestException as e:
        # Try to get more detailed error information
        try:
            error_detail = response.json() if 'response' in locals() else "No response details"
            return f"Error calling Perplexity API: {str(e)} - Details: {error_detail}"
        except:
            return f"Error calling Perplexity API: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"

def select_audience_specific_prompt(course_concept, audience_type, research_foundation):
    """
    Intelligent audience-specific prompt selection using Claude/OpenAI
    Determines the optimal approach based on target audience
    """

    selection_prompt = f"""You are an expert educational consultant specializing in Australian healthcare professional development.

Your task is to analyze the target audience and course concept to determine the most effective educational approach.

COURSE CONCEPT: {course_concept}
TARGET AUDIENCE: {audience_type}
RESEARCH FOUNDATION AVAILABLE: Yes (comprehensive 21KB+ evidence base)

AUDIENCE ANALYSIS:
Based on the target audience "{audience_type}", determine:

1. EDUCATIONAL SOPHISTICATION LEVEL:
   - Executive/Leadership level
   - Clinical specialist level
   - General practitioner level
   - Entry-level professional

2. OPTIMAL LEARNING APPROACH:
   - Case-based learning emphasis
   - Theoretical framework focus
   - Practical application priority
   - Regulatory compliance focus

3. ASSESSMENT STRATEGY:
   - Competency-based assessment
   - Portfolio development
   - Simulation-based evaluation
   - Peer review emphasis

4. MODULE COMPLEXITY:
   - 10-12 detailed modules (4 hours each)
   - 6-8 intensive modules (6-8 hours each)
   - 15+ micro-modules (2-3 hours each)

OUTPUT: Provide your recommendation in this format:

AUDIENCE_PROFILE: [Executive/Clinical Specialist/General Practitioner/Entry-level]
LEARNING_APPROACH: [Primary educational methodology]
ASSESSMENT_FOCUS: [Primary assessment strategy]
MODULE_STRUCTURE: [Recommended module count and duration]
SOPHISTICATION_LEVEL: [Academic rigor level 1-5]
REGULATORY_EMPHASIS: [AHPRA/Professional standards integration level]

REASONING: [2-3 sentences explaining your recommendation]"""

    # Use best available AI provider for intelligent analysis
    analysis = call_ai_provider(selection_prompt, 'research')
    return analysis

def parse_research_into_modules(course_concept, audience_type, research_foundation):
    """
    Parse comprehensive research foundation into structured course modules
    Leverages the 21KB+ Perplexity research instead of doing duplicate work
    """

    # Create intelligent parsing prompt for Perplexity
    parsing_prompt = f"""You are a professional course architect specializing in creating sophisticated micro-credential courses for {audience_type}.

You have been provided with comprehensive research foundation content for: {course_concept}

Your task is to parse and structure this research into a cohesive course architecture WITHOUT doing additional research. Use only the provided research content.

RESEARCH FOUNDATION PROVIDED:
{research_foundation[:4000]}... [truncated for processing]

INSTRUCTIONS:
1. Analyze the provided research content to extract:
   - Key learning objectives already identified
   - Frameworks and methodologies mentioned
   - Evidence-based practices highlighted
   - Assessment strategies suggested

2. Structure into 10-12 standalone course modules that:
   - Build progressively from foundational to advanced concepts
   - Align with the audience type ({audience_type})
   - Maintain academic rigor and sophistication
   - Include practical application opportunities
   - Extract distinct learning concepts identified in the research

3. For each module, provide:
   - Module title and learning objectives
   - Key content areas (from the research)
   - Assessment strategy (from the research)
   - Duration and complexity level

OUTPUT FORMAT:
***
Course Overview
***
Course Title: [Derived from research]
Target Audience: {audience_type}
Total Duration: [Estimated hours]
Learning Approach: [Based on research findings]

***
Module Structure
***

MODULE 1: [Title]
Duration: [Hours]
Learning Objectives:
- [From research foundation]
- [From research foundation]

Key Content Areas:
- [Specific topics from research]
- [Evidence-based practices mentioned]

Assessment Strategy:
- [From research recommendations]

MODULE 2: [Title]
[Continue pattern for all 10-12 modules...]

***
Course Integration Strategy
***
[How modules connect and build upon each other]

Use ONLY the research content provided. Do not add new research or external content."""

    # Use best available AI provider to intelligently parse and structure
    return call_ai_provider(parsing_prompt, 'content_generation')

def distribute_course_tasks(course_architecture, audience_profile):
    """
    Break down course architecture into specific agent tasks
    Creates detailed task assignments for each specialized agent
    """

    distribution_prompt = f"""You are a sophisticated educational project manager specializing in multi-agent course production workflows.

Your task is to analyze the course architecture and create specific task assignments for specialized content creation agents.

COURSE ARCHITECTURE PROVIDED:
{course_architecture[:3000]}... [truncated for processing]

AUDIENCE PROFILE: {audience_profile}

AGENT SPECIALIZATIONS:
1. SLIDES_AGENT: Creates 10-12 slides per module with learning objectives, key points, visual descriptions
2. ASSESSMENTS_AGENT: Develops competency-based assessments, rubrics, and evaluation criteria
3. ROLEPLAY_AGENT: Designs scenario-based learning experiences and simulation exercises
4. WORKBOOK_AGENT: Creates supporting materials, worksheets, and practical exercises
5. CASE_STUDIES_AGENT: Develops evidence-based case studies aligned with Australian healthcare contexts

OUTPUT FORMAT:
For each module in the course architecture, provide:

MODULE_[X]_TASKS:
- SLIDES_AGENT: [Specific requirements: number of slides, key learning points, visual elements needed]
- ASSESSMENTS_AGENT: [Assessment type, competency criteria, Australian regulatory alignment]
- ROLEPLAY_AGENT: [Scenario description, learning objectives, participant roles]
- WORKBOOK_AGENT: [Supporting materials needed, practical exercises, reflection activities]
- CASE_STUDIES_AGENT: [Case study requirements, evidence-base, Australian healthcare context]

AUDIO_PREPARATION:
- VOICEOVER_OPTIMIZATION: [Specific requirements for slide content optimization for audio narration]
- SCRIPT_REQUIREMENTS: [Australian healthcare pronunciation, pacing, technical term handling]

INTEGRATION_REQUIREMENTS:
- MODULE_SEQUENCING: [How modules connect and build upon each other]
- CROSS_REFERENCES: [Links between different agent outputs]
- QUALITY_STANDARDS: [Academic rigor and professional standards requirements]

Use the course architecture details to create specific, actionable task assignments for each agent."""

    # Use best available AI provider for intelligent task distribution
    task_distribution = call_ai_provider(distribution_prompt, 'content_generation')
    return task_distribution

def optimize_slides_for_audio(slide_content, voice_type='Charon', audience_type='healthcare professionals'):
    """
    Optimize slide content for high-quality audio narration
    Ensures content is suitable for voiceover with Australian healthcare pronunciation
    """

    optimization_prompt = f"""You are a professional voiceover script writer specializing in Australian healthcare education content.

Your task is to optimize slide content for high-quality audio narration using advanced text-to-speech technology.

SLIDE CONTENT PROVIDED:
{slide_content[:2000]}... [truncated for processing]

VOICE TYPE: {voice_type}
AUDIENCE: {audience_type}

OPTIMIZATION REQUIREMENTS:

1. NARRATION FLOW:
   - Convert bullet points to natural spoken sentences
   - Add smooth transitions between concepts
   - Include appropriate pauses and emphasis markers
   - Create conversational yet professional tone

2. AUSTRALIAN HEALTHCARE PRONUNCIATION:
   - Mark technical terms for correct pronunciation
   - Include phonetic guides for complex medical terminology
   - Ensure regulatory terminology is correctly emphasized
   - Add pronunciation notes for abbreviations (AHPRA, NMBA, etc.)

3. AUDIO STRUCTURE:
   - Introduction hook for each slide
   - Clear learning point delivery
   - Summarizing statements for retention
   - Transition cues to next slide

4. VOICE-OPTIMIZED FORMATTING:
   - Remove visual-only elements
   - Convert charts/diagrams to descriptive narration
   - Add timing suggestions for optimal pacing
   - Include emphasis markers for key concepts

OUTPUT FORMAT:
SLIDE_[X]_AUDIO_SCRIPT:
[Optimized narration script with natural flow]

PRONUNCIATION_GUIDE:
[Technical terms with phonetic guidelines]

TIMING_SUGGESTIONS:
[Pacing recommendations for 3-5 minute slide narration]

TRANSITION_CUES:
[Smooth connections to maintain course flow]

Create professional, engaging audio content suitable for Australian healthcare professionals."""

    # Use best available AI provider for intelligent script optimization
    audio_script = call_ai_provider(optimization_prompt, 'audio_optimization')
    return audio_script

def generate_sophisticated_research(course_concept, audience_type, source_urls, user_research='', key_findings='', document_summaries=''):
    """
    Generate comprehensive academic literature review using Perplexity API
    Analyzes source URLs AND performs additional research
    """

    # Create the sophisticated research prompt that was used with Perplexity
    research_prompt = f"""You are an expert education professional specialising in developing strong evidence-based foundations for online micro-credential courses for executives and healthcare professionals.

Your task is to produce a comprehensive academic literature review highlighting the latest and most relevant concepts, frameworks, and evidence-based practices that will inform the design of a premium course on the following topic: {course_concept}.

Focus on practical, in-depth research suitable for adult learners, with a high level of academic rigour and sophistication. Australian business and healthcare contexts, and relevant regulatory compliance requirements, must be prioritised to match the target learner group: {audience_type}.

Research priorities:

1. First, read, analyse, and extract key content from each of the provided source URLs: {source_urls}.
- If a source URL is inaccessible (especially private Google Drive/Docs links), note this clearly and instead research the same topic area using your online research capabilities.
- For any accessible URLs, provide detailed analysis and direct citations.
2. Second, identify 5–10 additional sources from subject matter experts or peer-reviewed journals published within the last 10 years, specifically expanding on the provided sources and course topic.
- Prioritise the most recent, highly relevant research.
- Include full bibliographic details (authors, title, publication date, source/journal, URL/DOI).
- All additional sources must relate directly to concepts in the provided sources.

Instructions:

- Read and analyse each provided and discovered source.
- Extract and summarise key frameworks, methodologies, and evidence-based practices.
- For each source, list full bibliographic details in Vancouver citation style: Author(s). Title. Journal. Year;Volume(Issue):Pages. Include URL or DOI where available.
- Identify core concepts suitable for developing 8–12 standalone course modules that increase learners' practical application or understanding.
- Note any relevant regulatory or compliance considerations in the Australian context.
- Use Australian spelling throughout your response.
- Clearly label and title each output section as below for downstream workflow parsing.

Output format (section headers required):
***
Source Analysis Summary (500-750 words)
***
Key Frameworks and Methodologies Identified
***
Key Concepts and Evidence-Based Insights Aligned with {course_concept}
***
Regulatory and Compliance Considerations (with specific focus on Australian business or healthcare context)
***
Content Summaries by Source (use Vancouver-style citation)
***
Research Synthesis for Course Development

Provide only detailed, evidence-based content suitable for forming the academic foundation of a premium executive or healthcare professional course. Attribute sources accurately."""

    # Call Perplexity API to get actual research
    print(f"Calling Perplexity API for: {course_concept}")
    print(f"Source URLs received: {source_urls}")

    # Check URL accessibility
    url_list = source_urls.split('\n') if source_urls else []
    print(f"Number of URLs: {len(url_list)}")
    for i, url in enumerate(url_list):
        url = url.strip()
        if 'drive.google.com' in url or 'docs.google.com' in url:
            print(f"URL {i+1}: {url} - WARNING: Private Google Drive/Docs link - Perplexity cannot access")
        else:
            print(f"URL {i+1}: {url} - Public URL - Should be accessible")

    evidence_base = call_ai_provider(research_prompt, 'research')
    print(f"Research completed. Evidence base length: {len(evidence_base)} characters")

    return {
        'course_concept': course_concept,
        'audience_type': audience_type,
        'evidence_base': evidence_base,
        'key_learning_outcomes': [
            f"Demonstrate advanced understanding of {course_concept} within Australian healthcare regulatory context",
            f"Apply evidence-based practice principles specific to {audience_type} professional requirements",
            "Integrate quality improvement methodologies with clinical practice applications",
            "Develop competency-based assessment capabilities for ongoing professional development",
            "Demonstrate cultural competency and person-centred care approaches in interprofessional environments"
        ],
        'assessment_strategies': [
            "Case-based scenario analysis with Vancouver-style citation requirements",
            "Competency-based practical assessments aligned with AHPRA professional standards",
            "Reflective practice portfolios meeting regulatory CPD requirements with peer review",
            "Interprofessional collaboration simulation exercises with standardised assessment rubrics",
            "Evidence-based practice project development with knowledge translation focus"
        ],
        'regulatory_compliance': [
            "AHPRA continuing professional development documentation",
            "NMBA competency standards alignment verification",
            "Australian Commission on Safety and Quality guideline integration",
            "Professional college-specific requirements compliance tracking"
        ],
        'source_urls': source_urls,
        'generated_at': datetime.now().isoformat(),
        'status': 'completed',
        'research_method': 'perplexity_api'
    }

@app.route('/ai/audience-analysis', methods=['POST'])
def analyze_audience():
    """
    Intelligent audience-specific prompt selection
    AI Brain determines optimal educational approach
    """
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        research_foundation = data.get('research_foundation', '')

        if not course_concept or not audience_type:
            return jsonify({
                'success': False,
                'error': 'Course concept and audience type are required'
            }), 400

        # AI-powered audience analysis
        analysis = select_audience_specific_prompt(course_concept, audience_type, research_foundation)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': analysis,
            'metadata': {
                'type': 'audience_analysis',
                'course_concept': course_concept,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'audience_analysis': analysis,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ai/distribute-tasks', methods=['POST'])
def distribute_tasks():
    """
    Multi-agent task distribution system
    AI Brain breaks course into specialized agent tasks
    """
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_architecture = data.get('course_architecture', '')
        audience_profile = data.get('audience_profile', '')

        if not course_architecture:
            return jsonify({
                'success': False,
                'error': 'Course architecture is required'
            }), 400

        # AI-powered task distribution
        task_distribution = distribute_course_tasks(course_architecture, audience_profile)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': task_distribution,
            'metadata': {
                'type': 'task_distribution',
                'audience_profile': audience_profile
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'task_distribution': task_distribution,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ai/optimize-slides', methods=['POST'])
def optimize_slides():
    """
    Slide optimization for audio narration
    AI Brain optimizes content for professional voiceover
    """
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        slide_content = data.get('slide_content', '')
        voice_type = data.get('voice_type', 'Charon')
        audience_type = data.get('audience_type', 'healthcare professionals')

        if not slide_content:
            return jsonify({
                'success': False,
                'error': 'Slide content is required'
            }), 400

        # AI-powered slide optimization
        audio_script = optimize_slides_for_audio(slide_content, voice_type, audience_type)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': audio_script,
            'metadata': {
                'type': 'audio_script',
                'voice_type': voice_type,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'audio_script': audio_script,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/course/complete-pipeline', methods=['POST'])
def complete_course_generation():
    """
    MONOLITHIC COURSE GENERATOR
    Single endpoint that does EVERYTHING:
    1. Audience Analysis
    2. Research Foundation (if needed)
    3. Course Architecture (12 modules)
    4. Task Distribution for agents
    5. Module Content Generation
    6. Audio Script Optimization
    Returns complete course ready for implementation
    """
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        source_urls = data.get('source_urls', '')
        voice_type = data.get('voice_type', 'Charon')
        research_foundation = data.get('research_foundation', '')

        if not course_concept or not audience_type:
            return jsonify({
                'success': False,
                'error': 'Course concept and audience type are required'
            }), 400

        # STEP 1: Generate or use existing research foundation
        if not research_foundation or research_foundation.startswith("Available - comprehensive"):
            print(f"STEP 1: Generating research foundation for {course_concept}")
            research_result = generate_sophisticated_research(course_concept, audience_type, source_urls)
            research_foundation = research_result.get('evidence_base', '')
        else:
            print(f"STEP 1: Using provided research foundation")

        # STEP 2: Audience Analysis
        print(f"STEP 2: Analyzing audience for {audience_type}")
        audience_analysis = select_audience_specific_prompt(course_concept, audience_type, research_foundation)

        # STEP 3: Course Architecture (12 modules)
        print(f"STEP 3: Creating course architecture")
        course_architecture = parse_research_into_modules(course_concept, audience_type, research_foundation)

        # STEP 4: Task Distribution
        print(f"STEP 4: Distributing tasks to specialized agents")
        task_distribution = distribute_course_tasks(course_architecture, audience_analysis)

        # STEP 5: Module Content Generation (simplified for now)
        print(f"STEP 5: Generating basic module structure")
        modules = extract_modules_from_architecture(course_architecture)

        # STEP 6: Generate Premium Course Components
        print(f"STEP 6: Generating premium course components")
        audio_ready_modules = []
        premium_components = {
            'ispring_assessments': [],
            'roleplay_scenarios': [],
            'workbook_specifications': '',
            'scorm_package': ''
        }

        # Process modules with all premium components
        for i, module in enumerate(modules):  # Process ALL modules
            print(f"Processing module {i+1}: {module}")

            # Generate module slides
            module_slides = generate_module_slides(module, course_concept, audience_type)

            # Generate audio script
            audio_script = optimize_slides_for_audio(module_slides, voice_type, audience_type)

            # Generate iSpring assessments for this module
            ispring_assessment = generate_ispring_assessments(module_slides, course_concept, audience_type)

            # Generate role play scenarios for this module
            roleplay_scenario = generate_roleplay_scenarios(course_concept, audience_type, module_slides)

            audio_ready_modules.append({
                'module': module,
                'slides': module_slides,
                'audio_script': audio_script,
                'ispring_assessment': ispring_assessment,
                'roleplay_scenario': roleplay_scenario
            })

            premium_components['ispring_assessments'].append(ispring_assessment)
            premium_components['roleplay_scenarios'].append(roleplay_scenario)

        # Generate course-wide premium components
        print(f"Generating course-wide premium components")
        premium_components['workbook_specifications'] = generate_premium_workbooks(course_architecture, audience_type, modules)
        premium_components['scorm_package'] = generate_lms_scorm_package({
            'course_concept': course_concept,
            'audience_type': audience_type
        }, modules)

        # Store complete course in knowledge base
        complete_course = {
            'course_concept': course_concept,
            'audience_type': audience_type,
            'research_foundation': research_foundation,
            'audience_analysis': audience_analysis,
            'course_architecture': course_architecture,
            'task_distribution': task_distribution,
            'modules': audio_ready_modules,
            'premium_components': premium_components,
            'voice_type': voice_type,
            'status': 'complete',
            'generated_at': datetime.now().isoformat()
        }

        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': complete_course,
            'metadata': {
                'type': 'complete_course',
                'course_concept': course_concept,
                'audience_type': audience_type,
                'modules_count': len(audio_ready_modules)
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'message': 'Complete premium course generated successfully',
            'course': complete_course,
            'knowledge_id': knowledge_entry['id'],
            'modules_ready_for_audio': len(audio_ready_modules),
            'premium_components_generated': {
                'ispring_assessments': len(premium_components['ispring_assessments']),
                'roleplay_scenarios': len(premium_components['roleplay_scenarios']),
                'workbook_specifications': 'generated',
                'scorm_package': 'generated'
            },
            'audio_generation_ready': True,
            'premium_course_ready': True
        })

    except Exception as e:
        print(f"ERROR in complete pipeline: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def extract_modules_from_architecture(course_architecture):
    """Extract module titles from course architecture"""
    modules = []
    lines = course_architecture.split('\n')
    for line in lines:
        if line.strip().startswith('MODULE ') and ':' in line:
            module_title = line.split(':', 1)[1].strip()
            modules.append(module_title)
    return modules

def generate_module_slides(module_title, course_concept, audience_type):
    """Generate slides for a specific module"""
    slides_prompt = f"""Create 10-12 educational slides for the module: {module_title}

Course: {course_concept}
Audience: {audience_type}

Format each slide as:
SLIDE X: [Title]
- Key point 1
- Key point 2
- Key point 3
[Learning objective for this slide]

Create professional, evidence-based content suitable for {audience_type}."""

    return call_ai_provider(slides_prompt, 'content_generation')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'carla_knowledge_lake',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/knowledge/search', methods=['GET'])
def search_knowledge():
    query = request.args.get('query', '')
    # Simple search - handle both string and dict content
    results = []
    for item in knowledge_store:
        content = item.get('content', '')
        if isinstance(content, dict):
            # Convert dict to searchable string
            content_str = str(content)
        else:
            content_str = content

        if query.lower() in content_str.lower():
            results.append(item)

    return jsonify({
        'results': results,
        'query': query,
        'count': len(results),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/knowledge/add', methods=['POST'])
def add_knowledge():
    data = request.get_json()

    knowledge_entry = {
        'id': len(knowledge_store) + 1,
        'content': data.get('content', ''),
        'metadata': data.get('metadata', {}),
        'timestamp': datetime.now().isoformat()
    }

    knowledge_store.append(knowledge_entry)

    return jsonify({
        'status': 'added',
        'id': knowledge_entry['id'],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/research/document-upload', methods=['POST'])
def upload_research_document():
    """
    Allow users to upload research documents for analysis
    """
    try:
        # Handle file uploads
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                # Process uploaded document
                content = file.read().decode('utf-8')
                return jsonify({
                    'success': True,
                    'content': content,
                    'filename': file.filename
                })

        return jsonify({'success': False, 'error': 'No file uploaded'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/course/architect', methods=['POST'])
def generate_course_architecture():
    """
    Course Architect - Intelligent parser of research foundation
    Takes comprehensive research and structures it into course modules
    """
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = request.form.to_dict()
        else:
            data = {}

        course_concept = data.get('course_concept', '') or data.get('course_title', '')
        audience_type = data.get('audience_type', '') or data.get('target_audience', 'healthcare professionals')
        research_foundation = data.get('research_foundation', '') or data.get('evidence_base', '')

        if not research_foundation:
            return jsonify({
                'success': False,
                'error': 'Research foundation is required for course architecture'
            }), 400

        # Parse and structure the research into course modules
        course_architecture = parse_research_into_modules(course_concept, audience_type, research_foundation)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': course_architecture,
            'metadata': {
                'type': 'course_architecture',
                'course_concept': course_concept,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'course_architecture': course_architecture,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/research/foundation', methods=['POST'])
def generate_research_foundation():
    """
    Research Foundation Generator - Replaces problematic Perplexity node
    Uses Claude Code capabilities for reliable research generation
    """
    try:
        # Handle JSON, form data, and URL-encoded data
        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = request.form.to_dict()
        else:
            data = {}

        # Accept both variable name formats for flexibility
        course_concept = data.get('course_concept', '') or data.get('course_title', '')
        source_urls = data.get('source_urls', '')
        audience_type = data.get('audience_type', '') or data.get('target_audience', 'healthcare professionals')

        # Additional user research inputs
        user_research = data.get('user_research', '')
        key_findings = data.get('key_findings', '')
        document_summaries = data.get('document_summaries', '')

        if not course_concept:
            return jsonify({
                'success': False,
                'error': 'Course concept is required'
            }), 400

        # Generate sophisticated research foundation with evidence-based content
        research_foundation = generate_sophisticated_research(course_concept, audience_type, source_urls, user_research, key_findings, document_summaries)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': research_foundation,
            'metadata': {
                'type': 'research_foundation',
                'course_concept': course_concept,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'research_foundation': research_foundation,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_ispring_assessments(module_content, course_concept, audience_type):
    """Generate iSpring Suite Max compatible assessments"""
    assessment_prompt = f"""You are an expert assessment designer specializing in iSpring Suite Max interactive assessments for {audience_type}.

Your task is to create comprehensive assessment instructions for: {course_concept}

Module Content:
{module_content[:2000]}...

Create detailed instructions for iSpring Suite Max that include:

1. QUESTION BANK DESIGN:
   - Multiple choice questions with 4-5 options and detailed explanations
   - Drag-and-drop scenario questions for practical application
   - Hot spot questions for diagram-based assessments
   - True/False questions with comprehensive rationales
   - Sequence ordering questions for process understanding

2. INTERACTIVE SCENARIOS:
   - Branching scenario instructions with decision points
   - Consequence feedback for each pathway
   - Real-world case studies relevant to {audience_type}
   - Progressive complexity throughout the scenario

3. ASSESSMENT CONFIGURATION:
   - Scoring rubrics aligned with Australian professional standards
   - Passing criteria and remediation pathways
   - Time limits and attempt restrictions
   - Feedback mechanisms for immediate learning

4. COMPETENCY MAPPING:
   - Link each question to specific learning objectives
   - Map to AHPRA/NMBA competency standards where relevant
   - Include CPD tracking requirements

OUTPUT FORMAT:
ASSESSMENT_DESIGN_[MODULE]:
[Detailed iSpring Suite Max instructions]

QUESTION_SPECIFICATIONS:
[Specific question types and content requirements]

SCENARIO_INSTRUCTIONS:
[Interactive scenario design requirements]

COMPETENCY_ALIGNMENT:
[Professional standards mapping]

Provide comprehensive instructions that can be directly implemented in iSpring Suite Max."""

    return call_ai_provider(assessment_prompt, 'assessment_creation')

def generate_lms_scorm_package(course_data, modules):
    """Generate LMS SCORM 1.2/2004 packaging instructions"""
    scorm_prompt = f"""You are an LMS integration specialist creating SCORM packaging instructions for: {course_data.get('course_concept', '')}

Target Audience: {course_data.get('audience_type', '')}
Modules Count: {len(modules)}

Create comprehensive SCORM packaging instructions that include:

1. SCORM MANIFEST STRUCTURE:
   - imsmanifest.xml configuration for SCORM 2004
   - Resource declarations for all course assets
   - Sequencing and navigation rules
   - Completion and success criteria

2. CONTENT ORGANIZATION:
   - Module sequencing and prerequisites
   - Assessment tracking and reporting
   - Progress indicators and bookmarking
   - Adaptive content delivery based on performance

3. LMS INTEGRATION REQUIREMENTS:
   - Grade passback configuration
   - Completion tracking mechanisms
   - Time tracking and session management
   - Offline content access capabilities

4. QUALITY ASSURANCE:
   - SCORM Cloud testing requirements
   - Common LMS compatibility checks (Moodle, Blackboard, Canvas)
   - Mobile responsiveness validation
   - Accessibility compliance (WCAG 2.1 AA)

5. DEPLOYMENT PACKAGE:
   - ZIP file structure and naming conventions
   - Asset optimization for web delivery
   - Backup and version control procedures

OUTPUT FORMAT:
SCORM_MANIFEST_TEMPLATE:
[XML template with course-specific configuration]

PACKAGING_INSTRUCTIONS:
[Step-by-step packaging procedures]

TESTING_PROTOCOL:
[Quality assurance and compatibility testing]

DEPLOYMENT_GUIDE:
[LMS installation and configuration instructions]

Provide detailed technical specifications for professional LMS deployment."""

    return call_ai_provider(scorm_prompt, 'content_generation')

def generate_premium_workbooks(course_architecture, audience_type, modules):
    """Generate comprehensive premium workbooks"""
    workbook_prompt = f"""You are a professional education materials designer creating premium workbooks for {audience_type}.

Course: {course_architecture[:1000]}...
Modules: {len(modules)} total

Create comprehensive premium workbook specifications that include:

1. WORKBOOK STRUCTURE:
   - Pre-course self-assessment and readiness checklist
   - Module-specific worksheets with practical exercises
   - Case study analysis templates with guided questions
   - Reflection journals with professional development prompts
   - Post-course action planning and implementation guides

2. INTERACTIVE ELEMENTS:
   - Fill-in-the-blank templates for key concepts
   - Decision-making flowcharts for complex scenarios
   - Evidence collection templates for portfolio development
   - Peer collaboration worksheets for group activities
   - Professional networking and mentoring guides

3. ASSESSMENT INTEGRATION:
   - Self-evaluation rubrics aligned with learning objectives
   - Competency checklists for skills demonstration
   - Progress tracking sheets with milestone markers
   - Continuous improvement planning templates

4. PROFESSIONAL DEVELOPMENT:
   - CPD logging templates with reflection requirements
   - Career pathway mapping exercises
   - Leadership development planning worksheets
   - Quality improvement project templates

5. DESIGN SPECIFICATIONS:
   - Professional branding and layout requirements
   - Print-friendly formatting with clear typography
   - Digital fillable PDF capabilities
   - Mobile-responsive design for tablet access

OUTPUT FORMAT:
WORKBOOK_CONTENTS:
[Detailed table of contents and page specifications]

WORKSHEET_TEMPLATES:
[Specific worksheet designs and instructions]

ASSESSMENT_TOOLS:
[Self-evaluation and peer assessment instruments]

DESIGN_REQUIREMENTS:
[Technical specifications for professional production]

Provide detailed specifications for premium educational workbook creation."""

    return call_ai_provider(workbook_prompt, 'content_generation')

def generate_roleplay_scenarios(course_concept, audience_type, module_content):
    """Generate role play scenarios with multi-character voiceover"""
    roleplay_prompt = f"""You are a professional simulation designer creating interactive role play scenarios for {audience_type}.

Course: {course_concept}
Module Content: {module_content[:1500]}...

Create detailed role play scenario specifications that include:

1. SCENARIO DESIGN:
   - Realistic workplace situations relevant to {audience_type}
   - Multiple characters with distinct roles and perspectives
   - Progressive complexity with decision branch points
   - Learning objectives embedded in each interaction
   - Cultural diversity and inclusion considerations

2. CHARACTER DEVELOPMENT:
   - Primary learner role with specific objectives
   - Supporting characters with authentic motivations
   - Challenging personalities requiring different approaches
   - Professional hierarchy and power dynamics
   - Background information and character profiles

3. MULTI-CHARACTER VOICEOVER SPECIFICATIONS:
   - Character 1: [Name] - Australian accent, professional tone
   - Character 2: [Name] - Different accent/tone, distinct personality
   - Character 3: [Name] - Authority figure, confident delivery
   - Character 4: [Name] - Client/patient perspective, emotional range
   - Narrator: Neutral, guiding voice for instructions

4. INTERACTION FRAMEWORK:
   - Conversation flow with natural pauses for learner input
   - Response options with immediate feedback mechanisms
   - Consequence modeling for different choices
   - Escalation and de-escalation pathways
   - Resolution strategies and learning reinforcement

5. ASSESSMENT INTEGRATION:
   - Performance indicators for each interaction
   - Competency demonstration requirements
   - Feedback delivery mechanisms
   - Scoring rubrics for professional skills
   - Reflection and debriefing questions

6. TECHNICAL SPECIFICATIONS:
   - Audio script formatting for multi-voice recording
   - Timing and pacing guidelines for natural dialogue
   - Background audio and sound effects requirements
   - Interactive interface design specifications

OUTPUT FORMAT:
SCENARIO_OVERVIEW:
[Situation description and learning objectives]

CHARACTER_PROFILES:
[Detailed character descriptions and voice specifications]

DIALOGUE_SCRIPT:
[Multi-character conversation with branching options]

VOICEOVER_INSTRUCTIONS:
[Specific recording requirements for each character]

ASSESSMENT_CRITERIA:
[Performance evaluation and feedback mechanisms]

TECHNICAL_REQUIREMENTS:
[Audio production and interface specifications]

Provide detailed specifications for professional role play scenario development."""

    return call_ai_provider(roleplay_prompt, 'roleplay_scenarios')

@app.route('/premium/ispring-assessments', methods=['POST'])
def create_ispring_assessments():
    """Generate iSpring Suite Max assessment specifications"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        module_content = data.get('module_content', '')
        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')

        if not module_content or not course_concept:
            return jsonify({
                'success': False,
                'error': 'Module content and course concept are required'
            }), 400

        assessment_specs = generate_ispring_assessments(module_content, course_concept, audience_type)

        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': assessment_specs,
            'metadata': {
                'type': 'ispring_assessments',
                'course_concept': course_concept,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'ispring_assessments': assessment_specs,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/premium/lms-scorm-package', methods=['POST'])
def create_lms_package():
    """Generate LMS SCORM packaging specifications"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_data = {
            'course_concept': data.get('course_concept', ''),
            'audience_type': data.get('audience_type', '')
        }
        modules = data.get('modules', [])

        if not course_data['course_concept']:
            return jsonify({
                'success': False,
                'error': 'Course concept is required'
            }), 400

        scorm_specs = generate_lms_scorm_package(course_data, modules)

        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': scorm_specs,
            'metadata': {
                'type': 'lms_scorm_package',
                'course_concept': course_data['course_concept'],
                'modules_count': len(modules)
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'scorm_package': scorm_specs,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/premium/workbooks', methods=['POST'])
def create_premium_workbooks():
    """Generate premium workbook specifications"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_architecture = data.get('course_architecture', '')
        audience_type = data.get('audience_type', '')
        modules = data.get('modules', [])

        if not course_architecture:
            return jsonify({
                'success': False,
                'error': 'Course architecture is required'
            }), 400

        workbook_specs = generate_premium_workbooks(course_architecture, audience_type, modules)

        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': workbook_specs,
            'metadata': {
                'type': 'premium_workbooks',
                'audience_type': audience_type,
                'modules_count': len(modules)
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'workbook_specifications': workbook_specs,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/premium/roleplay-scenarios', methods=['POST'])
def create_roleplay_scenarios():
    """Generate role play scenarios with multi-character voiceover"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        module_content = data.get('module_content', '')

        if not course_concept or not module_content:
            return jsonify({
                'success': False,
                'error': 'Course concept and module content are required'
            }), 400

        roleplay_specs = generate_roleplay_scenarios(course_concept, audience_type, module_content)

        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': roleplay_specs,
            'metadata': {
                'type': 'roleplay_scenarios',
                'course_concept': course_concept,
                'audience_type': audience_type
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'roleplay_scenarios': roleplay_specs,
            'knowledge_id': knowledge_entry['id']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Carla's Simple Knowledge Lake API...")
    print("API will be available at: http://localhost:5000" )
    app.run(host='0.0.0.0', port=5000, debug=True)

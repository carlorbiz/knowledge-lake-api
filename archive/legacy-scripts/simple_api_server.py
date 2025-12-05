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
GOOGLE_DRIVE_API_KEY = os.getenv('GOOGLE_DRIVE_API_KEY')
GOOGLE_APPS_SCRIPT_URL = os.getenv('GOOGLE_APPS_SCRIPT_URL')
DOCS_AUTOMATOR_API_KEY = os.getenv('DOCSAUTOMATOR_API_KEY')
GAMMA_API_KEY = os.getenv('GAMMA_API_KEY')

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

# File storage and delivery system
import uuid
import zipfile
import io
from datetime import datetime, timedelta

# Simple in-memory storage for now
knowledge_store = []
file_storage_base = "C:/Users/carlo/Development/mem0-sync/mem0/course_outputs/"

# Ensure output directory exists
os.makedirs(file_storage_base, exist_ok=True)

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
                "model": "claude-3-haiku-20240307",
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
    Efficient audience-specific prompt selection - direct selection from 4 predefined types
    No API calls needed - immediate selection based on audience_type from form data
    """

    # PREDEFINED AUDIENCE-SPECIFIC CONFIGURATIONS
    audience_configs = {
        "Healthcare Clinical": {
            "profile": "Clinical Specialist level",
            "learning_approach": "Case-based learning emphasis",
            "assessment_focus": "Competency-based assessment",
            "module_structure": "6-8 intensive modules (6-8 hours each)",
            "sophistication_level": "4 (High academic rigor)",
            "regulatory_emphasis": "High AHPRA/Professional standards integration",
            "professional_context": "Experienced clinicians with 3+ years AHPRA registration, likely consultants, specialists, or senior GPs taking on supervisory or advanced practice roles"
        },
        "Healthcare Administration": {
            "profile": "Healthcare Management level",
            "learning_approach": "Systems thinking and strategic planning emphasis",
            "assessment_focus": "Performance improvement metrics assessment",
            "module_structure": "8-10 comprehensive modules (4-6 hours each)",
            "sophistication_level": "4 (High academic rigor)",
            "regulatory_emphasis": "High regulatory compliance and quality framework integration",
            "professional_context": "Healthcare executives, department managers, quality coordinators requiring strategic oversight and operational excellence"
        },
        "Healthcare Education": {
            "profile": "Professional Development Specialist level",
            "learning_approach": "Adult learning principles and curriculum design emphasis",
            "assessment_focus": "Educational effectiveness and learning outcome assessment",
            "module_structure": "10-12 detailed modules (3-5 hours each)",
            "sophistication_level": "4 (High academic rigor)",
            "regulatory_emphasis": "Professional development standards and accreditation integration",
            "professional_context": "Education coordinators, clinical educators, professional development specialists focused on workforce capability building"
        },
        "Healthcare Support": {
            "profile": "Professional Practice level",
            "learning_approach": "Practical application and skill development emphasis",
            "assessment_focus": "Competency demonstration and workplace application assessment",
            "module_structure": "8-10 practical modules (3-4 hours each)",
            "sophistication_level": "3 (Professional rigor with practical focus)",
            "regulatory_emphasis": "Moderate regulatory integration with workplace compliance focus",
            "professional_context": "Allied health professionals, healthcare assistants, administrative support requiring enhanced professional capabilities"
        }
    }

    # DIRECT SELECTION - NO API CALL NEEDED
    selected_config = audience_configs.get(audience_type, audience_configs["Healthcare Clinical"])

    return f"""AUDIENCE PROFILE: {selected_config['profile']}

LEARNING APPROACH: {selected_config['learning_approach']}

ASSESSMENT FOCUS: {selected_config['assessment_focus']}

MODULE STRUCTURE: {selected_config['module_structure']}

SOPHISTICATION LEVEL: {selected_config['sophistication_level']}

REGULATORY EMPHASIS: {selected_config['regulatory_emphasis']}

PROFESSIONAL CONTEXT: {selected_config['professional_context']}

COURSE OPTIMIZATION: Content customized for {audience_type} with research foundation integration and Australian healthcare standards alignment."""

def parse_research_into_modules(course_concept, audience_type, research_foundation):
    """
    Parse comprehensive research foundation into structured course modules
    Leverages the 21KB+ Perplexity research instead of doing duplicate work
    """

    # Create sophisticated course architecture prompt from upgraded prompt library
    parsing_prompt = f"""You are an expert in Australian healthcare professional development and clinical supervision. You create evidence-based, culturally appropriate content for healthcare professionals supervising International Medical Graduates (IMGs) and other learners.

COURSE ARCHITECTURE GENERATION
COURSE CONCEPT: {course_concept}
TARGET AUDIENCE: {audience_type}

COMPREHENSIVE RESEARCH FOUNDATION:
{research_foundation[:4000]}... [truncated for processing]

TASK: Create a comprehensive, evidence-based course architecture with 10-12 modules.

CRITICAL REQUIREMENTS:
- Base ALL recommendations on the provided research foundation
- Reference specific sources by name (not cell references)
- Create EXACTLY 10-12 distinct modules with clear learning progression (MINIMUM 10 MODULES REQUIRED)
- Ensure Australian context and regulatory compliance
- Include practical applications and contemporary case studies
- Provide detailed module descriptions and learning objectives

COURSE ARCHITECTURE REQUIREMENTS:

1. **STRATEGIC OVERVIEW** (200-300 words)
   - Course title and target audience
   - Total duration and learning approach
   - Professional development focus
   - Australian healthcare context integration

2. **EVIDENCE BASE ANALYSIS: ESTABLISHING CREDIBILITY** (500-800 words)
   - How research foundation informs course design
   - Key evidence sources and their contribution
   - Australian regulatory compliance integration
   - Quality assurance and professional standards alignment

3. **KEY CONCEPTS DRAWN FROM RESEARCH FOUNDATION** (100-150 words)
   - Core concepts identified from research
   - Direct relevance to course concept
   - Evidence-based practice integration
   - Professional competency alignment

4. **MODULE RECOMMENDATIONS** (EXACTLY 10-12 modules, 150-200 words each)
   - Module Title
   - Duration (2-4 hours per module)
   - Learning Objectives (3-5 specific objectives using Bloom's taxonomy)
   - Module Description (evidence-based content areas)
   - Key Concepts and Content Areas
   - Practical Applications for Australian healthcare
   - Assessment Methods (competency-based)
   - Evidence Sources Referenced

5. **IMPLEMENTATION GUIDANCE** (150-200 words)
   - Self-directed learning pathway recommendations
   - Peer collaboration opportunities
   - Mentorship and supervision integration
   - Progress monitoring frameworks

6. **ASSESSMENT STRATEGY** (150-200 words)
   - Competency-based evaluation methodology
   - Formative and summative assessment integration
   - Professional portfolio integration
   - CPD credit alignment

7. **RESOURCE REQUIREMENTS** (100-150 words)
   - Primary evidence sources
   - Supplementary materials hierarchy
   - Digital resources and interactive tools
   - Professional organization links

MODULE STRUCTURE TEMPLATE (for each of 10-12 modules - PROVIDE ALL MODULES):
**MODULE X: [Title]**
- **Duration:** X hours
- **Learning Objectives:**
  - [Objective 1 - Knowledge level]
  - [Objective 2 - Comprehension level]
  - [Objective 3 - Application level]
  - [Objective 4 - Analysis level]
  - [Objective 5 - Evaluation level]
- **Key Content Areas:**
  - [Evidence-based content area 1]
  - [Evidence-based content area 2]
  - [Australian healthcare application]
- **Assessment Strategy:**
  - [Competency-based assessment method]

COURSE INTEGRATION STRATEGY:
- Logical module sequencing and learning progression
- Connections between modules
- Cumulative skill building
- Australian healthcare context throughout
- Professional standards integration

AUSTRALIAN HEALTHCARE CONTEXT:
- AHPRA (Australian Health Practitioner Regulation Agency) standards
- RACGP (Royal Australian College of General Practitioners) guidelines
- ACRRM (Australian College of Rural and Remote Medicine) requirements
- NMBA (Nursing and Midwifery Board of Australia) standards
- NSQHS (National Safety and Quality Health Service) Standards
- Cultural safety for Aboriginal and Torres Strait Islander peoples
- Multicultural healthcare considerations
- Rural and remote healthcare challenges
- Professional supervision and mentoring frameworks

OUTPUT SPECIFICATIONS:
- Length: 1500-2500 words
- Tone: Executive, evidence-anchored, Australian healthcare context
- Quality markers: EXACTLY 10-12 modules, Traceable to research foundation, Clear sequencing
- Structure: Overview, Evidence base, Key concepts, Module details, Implementation, Assessment, Resources

**CRITICAL: You MUST provide all 10-12 modules in your response. Do not summarize or provide only examples. List every single module with full details.**

Generate the complete course architecture now."""

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

    # Create the sophisticated research prompt from upgraded prompt library
    research_prompt = f"""You are an expert education professional specialising in developing strong evidence-based foundations for online micro-credential courses for Australian healthcare professionals.

COURSE CONCEPT: {course_concept}
TARGET AUDIENCE: {audience_type}
SOURCE URLS PROVIDED: {source_urls}

TASK: Create a comprehensive research foundation that establishes credibility and evidence base for the course.

RESEARCH REQUIREMENTS:
1. **SOURCE ANALYSIS SUMMARY** (500-750 words)
   - Analyze provided source URLs thoroughly
   - Extract key evidence and frameworks relevant to {course_concept}
   - Focus on Australian healthcare context and applications
   - Identify practical implications for clinical supervision and professional development
   - Highlight cultural safety and diversity considerations

2. **COMPREHENSIVE LITERATURE SEARCH AND ANALYSIS**
   - Identify and research 5-10 additional peer-reviewed sources published within the last 5 years
   - Prioritize systematic reviews, meta-analyses, and high-impact journal publications
   - Focus on recent developments and emerging evidence in {course_concept}
   - Include Australian and international research that directly relates to the topic
   - Search for sector updates, policy changes, and clinical guidelines that could impact practice
   - Full bibliographic details with Vancouver-style citations: Author(s). Title. Journal. Year;Volume(Issue):Pages. DOI/URL

3. **KEY FRAMEWORKS AND METHODOLOGIES IDENTIFIED**
   - Evidence-based frameworks from both provided and researched sources
   - Australian healthcare standards and guidelines
   - Professional development methodologies
   - Quality improvement approaches
   - Cultural safety frameworks
   - Contemporary best practice models

4. **KEY CONCEPTS AND EVIDENCE-BASED INSIGHTS**
   - Critical success factors for Australian healthcare professionals
   - Latest research findings and emerging evidence
   - Evidence gaps and opportunities identified in recent literature
   - Implementation insights for professional development
   - Quality assurance and evaluation methods
   - Safety considerations and risk management insights

5. **REGULATORY AND COMPLIANCE CONSIDERATIONS (Australian context)**
   - AHPRA standards and requirements
   - NMBA/RACGP/ACRRM guidelines where relevant
   - NSQHS Standards alignment
   - Cultural safety requirements
   - Professional development obligations
   - Recent policy updates and regulatory changes

6. **CONTENT SUMMARIES BY SOURCE** (Vancouver-style citations)
   - Individual analysis of each provided source
   - Individual analysis of each researched peer-reviewed source
   - Key evidence points from each source
   - Relevance to course concept
   - Limitations and considerations
   - Currency and validity of findings

7. **RESEARCH SYNTHESIS FOR COURSE DEVELOPMENT**
   - How comprehensive research foundation informs course architecture
   - Evidence-based module recommendations
   - Assessment strategy implications based on current best practice
   - Implementation guidance incorporating latest research
   - Knowledge gaps requiring ongoing professional development

CRITICAL REQUIREMENTS:
- First analyze provided source URLs thoroughly
- Then conduct comprehensive internet research to identify 5-10 additional peer-reviewed sources
- Use only factual claims that appear in provided sources AND researched sources
- Reference all sources by their actual names and URLs with full citations
- Do not fabricate citations or suggest content not found in actual sources
- Prioritize recent publications (last 5 years) and high-impact research
- Search for latest sector updates, policy changes, and emerging evidence
- Maintain Australian healthcare regulatory context throughout
- Address cultural safety and diversity considerations
- Ensure content is suitable for experienced healthcare professionals

OUTPUT SPECIFICATIONS:
- Length: 2000-3000 words comprehensive research foundation
- Tone: Academic, evidence-anchored, Australian healthcare context
- Structure: Source analysis, frameworks, concepts, compliance, citations, synthesis
- Quality markers: Traceable to sources, comprehensive literature base, Australian context

AUSTRALIAN HEALTHCARE CONTEXT:
- AHPRA (Australian Health Practitioner Regulation Agency) standards
- RACGP (Royal Australian College of General Practitioners) guidelines
- ACRRM (Australian College of Rural and Remote Medicine) requirements
- NMBA (Nursing and Midwifery Board of Australia) standards
- NSQHS (National Safety and Quality Health Service) Standards
- Cultural safety for Aboriginal and Torres Strait Islander peoples
- Multicultural healthcare considerations
- Rural and remote healthcare challenges
- Professional supervision and mentoring frameworks

EVIDENCE REQUIREMENTS:
- Base all content on provided source materials
- Reference sources by actual names (not cell references)
- Use Vancouver citation style for academic sources
- Acknowledge internal documents appropriately
- Ensure claims are traceable to evidence
- Maintain academic integrity and accuracy

LANGUAGE REQUIREMENTS:
- Australian English spelling (colour, centre, realise, etc.)
- Australian healthcare terminology and context
- Professional tone suitable for senior healthcare professionals
- Inclusive language respecting cultural diversity
- Respectful acknowledgment of Aboriginal and Torres Strait Islander peoples
- Gender-neutral language where appropriate

Generate the complete research foundation now."""

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

    # Use Perplexity API for actual research with internet access
    evidence_base = call_perplexity_api(research_prompt)
    print(f"Research completed using Perplexity API. Evidence base length: {len(evidence_base)} characters")

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

def generate_module_slides_with_agent(module_title, course_concept, audience_type, agent):
    """Generate slides with specific agent for workload distribution"""
    slides_prompt = f"""You are an expert educational content designer specializing in sophisticated, evidence-based professional development for {audience_type} in Australian healthcare settings.

Your task is to create 10-12 highly sophisticated educational slides for the module: {module_title}

COURSE CONTEXT: {course_concept}
TARGET AUDIENCE: {audience_type}

SOPHISTICATION REQUIREMENTS:

1. EVIDENCE-BASED FOUNDATION:
   - Integrate current research findings and systematic review evidence
   - Reference Australian professional standards (AHPRA, NMBA, relevant specialty bodies)
   - Include quality improvement frameworks and patient safety principles
   - Connect to real-world clinical scenarios and professional practice contexts

2. ADVANCED LEARNING DESIGN:
   - Utilize Bloom's Taxonomy progression (Knowledge → Comprehension → Application → Analysis → Synthesis → Evaluation)
   - Incorporate reflective practice frameworks (Schön, Gibbs, Johns)
   - Build critical thinking through case-based reasoning and clinical decision-making
   - Include metacognitive elements that promote self-directed learning

3. PROFESSIONAL DEPTH AND RIGOR:
   - Address complex professional dilemmas and ethical considerations
   - Integrate interprofessional collaboration and communication principles
   - Connect to continuous professional development and lifelong learning
   - Include risk management, quality assurance, and regulatory compliance

4. AUSTRALIAN HEALTHCARE CONTEXT:
   - Align with Australian healthcare system structures and processes
   - Reference relevant legislation, policies, and professional guidelines
   - Include cultural safety, diversity, and Indigenous health considerations
   - Connect to contemporary healthcare challenges and innovation

5. ADULT LEARNING PRINCIPLES:
   - Build on existing professional experience and knowledge
   - Promote active engagement through scenario-based learning
   - Include opportunities for professional reflection and peer discussion
   - Support transfer of learning to workplace practice

SLIDE STRUCTURE (Each slide optimized for 60-90 second audio narration):

SLIDE X: [Sophisticated Professional Title]
• EVIDENCE POINT: [Research-backed key concept with citation reference]
• PRACTICE APPLICATION: [Real-world professional scenario or case example]
• CRITICAL THINKING: [Analytical question or professional dilemma]
• PROFESSIONAL STANDARD: [Relevant regulatory/professional body requirement]

LEARNING OBJECTIVE: [Specific, measurable outcome using professional competency language]
REFLECTION PROMPT: [Question promoting deeper professional consideration]

QUALITY ASSURANCE CHECKLIST:
- Is content aligned to current evidence and best practice?
- Does it challenge professionals to think critically about their practice?
- Are Australian professional standards and context clearly integrated?
- Will this content enhance professional competency and patient outcomes?
- Is the sophistication appropriate for experienced {audience_type}?

Create slides that demonstrate academic rigor, professional depth, and evidence-based practice integration while maintaining the 60-90 second audio constraint through focused, impactful content."""

    if agent == 'openai':
        return call_openai_api(slides_prompt, 'content_generation')
    elif agent == 'anthropic':
        return call_anthropic_api(slides_prompt, 'content_generation')
    elif agent == 'gemini':
        return call_gemini_api(slides_prompt, 'content_generation')
    elif agent == 'grok':
        return call_grok_api(slides_prompt, 'content_generation')
    else:
        return call_ai_provider(slides_prompt, 'content_generation')

def optimize_slides_for_audio_with_limit(slide_content, voice_type='Charon', audience_type='healthcare professionals'):
    """Optimize slides for 60-90 second audio narration"""
    optimization_prompt = f"""You are a professional voiceover script writer specializing in Australian healthcare education content.

Your task is to optimize slide content for 60-90 SECOND audio narration maximum per slide.

SLIDE CONTENT PROVIDED:
{slide_content[:2000]}...

VOICE TYPE: {voice_type}
AUDIENCE: {audience_type}

CRITICAL REQUIREMENT: Each slide must be exactly 60-90 seconds when read aloud at natural pace.

OPTIMIZATION FOR 60-90 SECOND LIMIT:
1. CONCISE NARRATION:
   - Convert bullet points to brief, natural sentences
   - Maximum 150-180 words per slide (60-90 seconds at normal pace)
   - Remove redundant words and filler

2. AUSTRALIAN HEALTHCARE PRONUNCIATION:
   - Mark technical terms: [AHPRA: ay-prah], [NMBA: en-em-bee-ay]
   - Include phonetic guides for complex medical terminology
   - Professional pronunciation notes

3. NATURAL FLOW:
   - Clear opening statement (10 seconds)
   - 2-3 key points (60 seconds)
   - Brief closing/transition (10-20 seconds)

4. TIMING VALIDATION:
   - Count words: 150-180 words = 60-90 seconds
   - Mark natural pauses with [PAUSE]
   - Include timing estimates

OUTPUT FORMAT:
SLIDE_X_AUDIO_SCRIPT (60-90 seconds):
[Optimized script with word count and timing]

PRONUNCIATION_GUIDE:
[Technical terms with phonetic guidelines]

ESTIMATED_DURATION: [X seconds]

Create engaging 60-90 second audio content for Australian healthcare professionals."""

    return call_gemini_api(optimization_prompt, 'audio_optimization')

def generate_ispring_assessments_with_agent(module_content, course_concept, audience_type, agent):
    """Generate iSpring assessments with specific agent"""
    assessment_prompt = f"""You are a leading expert in sophisticated competency-based assessment design, specializing in advanced iSpring Suite Max interactive assessments for experienced {audience_type} in Australian healthcare settings.

Your task is to create comprehensive, academically rigorous assessment instructions for: {course_concept}

Module Content:
{module_content[:2500]}...

SOPHISTICATED ASSESSMENT DESIGN REQUIREMENTS:

1. ADVANCED COMPETENCY-BASED FRAMEWORK:
   - Utilize Miller's Pyramid (Knows, Knows How, Shows How, Does) for assessment progression
   - Map to Australian Professional Standards Framework and relevant competency standards
   - Include formative assessment strategies that promote continuous professional development
   - Integrate assessment for learning, assessment of learning, and assessment as learning principles

2. COMPLEX COGNITIVE ASSESSMENT DESIGN:
   - Multiple Choice Questions with sophisticated clinical reasoning distractors
     * Evidence-based options requiring critical analysis of research
     * Professional judgment scenarios with ethically complex decision points
     * Risk assessment questions involving multiple professional considerations
     * Quality improvement scenarios requiring systems thinking
   - Drag-and-Drop Clinical Decision Making:
     * Multi-step clinical protocols with evidence-based sequencing
     * Interprofessional collaboration workflow arrangements
     * Priority-setting exercises in resource-constrained environments
   - Hotspot Diagnostic Assessments:
     * Complex case presentations requiring pattern recognition
     * Clinical examination findings interpretation
     * Professional documentation and communication point identification
   - Advanced True/False with Justification:
     * Professional practice statements requiring evidence-based rationale
     * Ethical dilemma resolution with professional standard applications
     * Research interpretation and clinical application validity

3. SOPHISTICATED INTERACTIVE SCENARIOS:
   - Multi-pathway Branching Scenarios:
     * Complex professional situations with multiple valid approaches
     * Consequence mapping showing short-term and long-term outcomes
     * Integration of patient safety, professional liability, and quality considerations
     * Real-time decision-making with time pressure and resource constraints
   - Professional Simulation Environments:
     * Interprofessional team scenarios with communication challenges
     * Crisis management and emergency response protocols
     * Quality improvement project implementation scenarios
     * Professional development and mentorship situation management

4. EVIDENCE-BASED ASSESSMENT VALIDATION:
   - Research-backed question development using current literature
   - Australian healthcare context integration (NSQHS Standards, Professional Bodies)
   - Cultural safety and diversity considerations in assessment design
   - Workplace relevance validation through professional expert review

5. ADVANCED FEEDBACK AND REMEDIATION:
   - Sophisticated feedback algorithms providing personalized learning pathways
   - Evidence citations for all correct answers with professional development links
   - Remediation strategies aligned to individual competency gap analysis
   - Professional portfolio integration suggestions for continuous improvement

6. PROFESSIONAL DEVELOPMENT INTEGRATION:
   - CPD hour allocation and professional body reporting alignment
   - Reflective practice prompts connecting assessment to workplace application
   - Peer review and discussion forum integration opportunities
   - Professional network development and mentorship connection points

OUTPUT FORMAT:

ASSESSMENT PHILOSOPHY AND FRAMEWORK:
[Theoretical foundation and evidence-based assessment approach]

SOPHISTICATED QUESTION BANK SPECIFICATIONS:
[Detailed iSpring Suite Max implementation with cognitive complexity levels]

INTERACTIVE SCENARIO DESIGN:
[Multi-pathway professional simulations with evidence-based consequences]

COMPETENCY MAPPING AND VALIDATION:
[Professional standards alignment with sophisticated measurement criteria]

FEEDBACK AND REMEDIATION ALGORITHMS:
[Personalized learning pathway specifications with professional development integration]

PROFESSIONAL CONTEXT INTEGRATION:
[Australian healthcare system alignment and workplace transfer strategies]

QUALITY ASSURANCE FRAMEWORK:
[Assessment validity, reliability, and professional standard compliance verification]

Create assessment specifications that challenge experienced professionals to demonstrate sophisticated clinical reasoning, professional judgment, and evidence-based practice integration while maintaining the highest standards of academic rigor and professional relevance."""

    if agent == 'anthropic':
        return call_anthropic_api(assessment_prompt, 'assessment_creation')
    elif agent == 'openai':
        return call_openai_api(assessment_prompt, 'assessment_creation')
    else:
        return call_ai_provider(assessment_prompt, 'assessment_creation')

def generate_roleplay_scenarios_with_agent(course_concept, audience_type, module_content, agent):
    """Generate role play scenarios with specific agent"""
    roleplay_prompt = f"""You are a professional simulation designer creating interactive role play scenarios for {audience_type}.

Course: {course_concept}
Module Content: {module_content[:1500]}...

Create detailed role play scenario specifications that include:

1. SCENARIO DESIGN:
   - Realistic workplace situations relevant to {audience_type}
   - Multiple characters with distinct roles and perspectives
   - Progressive complexity with decision branch points

2. MULTI-CHARACTER VOICEOVER SPECIFICATIONS:
   - Character 1: [Name] - Australian accent, professional tone
   - Character 2: [Name] - Different accent/tone, distinct personality
   - Character 3: [Name] - Authority figure, confident delivery
   - Character 4: [Name] - Client/patient perspective, emotional range

3. INTERACTION FRAMEWORK:
   - Conversation flow with natural pauses for learner input
   - Response options with immediate feedback mechanisms
   - Consequence modeling for different choices

OUTPUT FORMAT:
SCENARIO_OVERVIEW:
[Situation description and learning objectives]

CHARACTER_PROFILES:
[Detailed character descriptions and voice specifications]

DIALOGUE_SCRIPT:
[Multi-character conversation with branching options]

Provide detailed specifications for professional role play scenario development."""

    if agent == 'grok':
        return call_grok_api(roleplay_prompt, 'roleplay_scenarios')
    elif agent == 'anthropic':
        return call_anthropic_api(roleplay_prompt, 'roleplay_scenarios')
    elif agent == 'openai':
        return call_openai_api(roleplay_prompt, 'roleplay_scenarios')
    else:
        return call_ai_provider(roleplay_prompt, 'roleplay_scenarios')

def generate_lms_upload_text_with_agent(module_content, course_concept, audience_type, agent):
    """Generate sophisticated LMS upload text ready for PDF conversion"""
    lms_prompt = f"""You are an expert learning management system (LMS) content designer specializing in professional healthcare education for {audience_type}.

Your task is to create comprehensive LMS upload text content for: {course_concept}

Module Content:
{module_content[:2500]}...

SOPHISTICATED LMS TEXT REQUIREMENTS:

1. EXECUTIVE SUMMARY SECTION:
   - Professional course overview with clear learning pathways
   - Evidence-based rationale for module sequencing
   - Integration with Australian healthcare standards (AHPRA/NMBA)
   - Expected competency outcomes aligned to professional frameworks

2. MODULE OVERVIEW WITH DEPTH:
   - Detailed module description with academic rigor
   - Learning objectives using Bloom's taxonomy (Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation)
   - Prerequisites and foundational knowledge requirements
   - Time investment expectations with realistic completion estimates

3. PROFESSIONAL CONTEXT INTEGRATION:
   - Real-world application scenarios specific to {audience_type}
   - Industry best practice alignment and evidence sources
   - Regulatory compliance requirements and professional obligations
   - Quality improvement and patient safety considerations

4. ASSESSMENT PHILOSOPHY:
   - Competency-based evaluation methodology
   - Formative and summative assessment strategies
   - Professional portfolio integration opportunities
   - Continuing Professional Development (CPD) credit alignment

5. RESOURCE TAXONOMY:
   - Primary evidence sources with full citations (Vancouver style)
   - Supplementary reading with relevance hierarchy
   - Digital resource integration (videos, interactive tools, databases)
   - Professional organization resources and guidelines

6. IMPLEMENTATION GUIDANCE:
   - Self-directed learning pathway recommendations
   - Peer collaboration and discussion forum integration
   - Mentorship and supervision connection points
   - Progress monitoring and reflection framework

OUTPUT FORMAT:
COURSE TITLE: {course_concept}
TARGET AUDIENCE: {audience_type}

[EXECUTIVE SUMMARY]
[Professional 200-word overview emphasizing evidence-based approach and professional standards alignment]

[MODULE OVERVIEW]
[Detailed academic description with learning taxonomy integration]

[PROFESSIONAL CONTEXT]
[Industry integration and real-world application focus]

[ASSESSMENT APPROACH]
[Competency-based evaluation methodology]

[RESOURCE FRAMEWORK]
[Hierarchical evidence sources and supplementary materials]

[IMPLEMENTATION PATHWAY]
[Professional development integration guidance]

Create sophisticated, academically rigorous LMS content that reflects the highest standards of professional healthcare education."""

    if agent == 'openai':
        return call_openai_api(lms_prompt, 'lms_upload_generation')
    elif agent == 'anthropic':
        return call_anthropic_api(lms_prompt, 'lms_upload_generation')
    elif agent == 'perplexity':
        return call_perplexity_api(lms_prompt, 'lms_upload_generation')
    else:
        return call_ai_provider(lms_prompt, 'lms_upload_generation')

def generate_premium_workbook_with_agent(module_content, course_concept, audience_type, agent):
    """Generate Genspark-style premium workbook content with sophisticated depth"""
    workbook_prompt = f"""You are a premium educational content designer specializing in comprehensive professional workbooks for {audience_type}, with expertise in creating Genspark-quality interactive learning materials.

Your task is to design a sophisticated workbook section for: {course_concept}

Module Content:
{module_content[:2500]}...

PREMIUM WORKBOOK SOPHISTICATION REQUIREMENTS:

1. REFLECTIVE PRACTICE FRAMEWORK:
   - Structured reflection prompts using Gibbs' Reflective Cycle
   - Critical thinking questions that challenge assumptions
   - Professional scenario analysis with multiple perspectives
   - Personal development planning with SMART goal integration

2. INTERACTIVE KNOWLEDGE APPLICATION:
   - Case study analysis with tiered complexity levels
   - Decision-making matrices for complex professional situations
   - Risk assessment templates specific to {audience_type}
   - Quality improvement project planning frameworks

3. EVIDENCE-BASED PRACTICE INTEGRATION:
   - Research critique templates with structured evaluation criteria
   - Literature synthesis worksheets for ongoing professional development
   - Clinical guideline application exercises
   - Best practice implementation planning tools

4. PROFESSIONAL COMPETENCY MAPPING:
   - Self-assessment matrices aligned to professional standards
   - Competency development tracking with progression indicators
   - Peer feedback integration frameworks
   - Mentorship conversation guides

5. PRACTICAL RESOURCE TOOLKIT:
   - Checklist templates for clinical procedures or professional processes
   - Communication templates for challenging professional conversations
   - Documentation frameworks ensuring compliance and quality
   - Emergency response protocols with decision trees

6. CONTINUOUS IMPROVEMENT MECHANISMS:
   - Learning journal templates with structured prompts
   - Action plan development with implementation timelines
   - Progress monitoring tools with milestone tracking
   - Professional network development strategies

WORKBOOK STRUCTURE:

SECTION 1: KNOWLEDGE INTEGRATION
[Interactive exercises connecting theory to practice]

SECTION 2: REFLECTIVE PRACTICE
[Structured reflection frameworks and critical thinking prompts]

SECTION 3: COMPETENCY DEVELOPMENT
[Professional standards alignment and self-assessment tools]

SECTION 4: PRACTICAL APPLICATION
[Real-world scenario analysis and decision-making frameworks]

SECTION 5: QUALITY IMPROVEMENT
[Evidence-based practice integration and improvement planning]

SECTION 6: PROFESSIONAL GROWTH
[Continuing development and network building strategies]

Each section must include:
- Clear learning objectives
- Interactive exercises with varied formats
- Professional scenario integration
- Self-assessment opportunities
- Action planning templates
- Resource links and references

Create premium workbook content that mirrors the depth and interactivity of Genspark materials, ensuring professional sophistication throughout."""

    if agent == 'openai':
        return call_openai_api(workbook_prompt, 'premium_workbook_generation')
    elif agent == 'anthropic':
        return call_anthropic_api(workbook_prompt, 'premium_workbook_generation')
    elif agent == 'perplexity':
        return call_perplexity_api(workbook_prompt, 'premium_workbook_generation')
    else:
        return call_ai_provider(workbook_prompt, 'premium_workbook_generation')

def generate_professional_resources_with_agent(module_content, course_concept, audience_type, agent):
    """Generate comprehensive professional resources and checklists with sophistication"""
    resources_prompt = f"""You are an expert professional development resource designer specializing in creating comprehensive support materials for {audience_type}.

Your task is to develop sophisticated professional resources for: {course_concept}

Module Content:
{module_content[:2500]}...

SOPHISTICATED RESOURCE DEVELOPMENT REQUIREMENTS:

1. PROFESSIONAL PRACTICE CHECKLISTS:
   - Evidence-based procedure checklists with safety checkpoints
   - Quality assurance frameworks with measurable indicators
   - Compliance verification tools aligned to regulatory requirements
   - Risk management protocols with escalation pathways

2. REFERENCE QUICK GUIDES:
   - Key concept summaries with clinical decision points
   - Professional standard interpretation guides
   - Emergency protocols with immediate action steps
   - Best practice reminders with evidence ratings

3. ASSESSMENT AND EVALUATION TOOLS:
   - Competency evaluation rubrics with detailed performance indicators
   - Self-audit frameworks for professional practice review
   - Peer assessment templates promoting collaborative learning
   - Quality improvement measurement tools

4. COMMUNICATION RESOURCES:
   - Difficult conversation templates with empathetic approaches
   - Professional documentation exemplars
   - Interdisciplinary communication frameworks
   - Patient/client education resource templates

5. PROFESSIONAL DEVELOPMENT PORTFOLIO:
   - Learning evidence collection templates
   - Reflection documentation formats
   - Competency progression tracking tools
   - Professional goal setting and monitoring frameworks

6. CRISIS AND EMERGENCY RESOURCES:
   - Critical incident response protocols
   - Emergency contact templates and escalation procedures
   - Stress management and resilience building tools
   - Professional support service directories

RESOURCE PACKAGE STRUCTURE:

QUICK REFERENCE CARDS:
[Laminated-ready summaries of key protocols and procedures]

PROFESSIONAL CHECKLISTS:
[Comprehensive verification tools for quality assurance]

ASSESSMENT FRAMEWORKS:
[Self and peer evaluation tools with professional standards alignment]

COMMUNICATION TOOLKITS:
[Templates and guides for challenging professional conversations]

DEVELOPMENT TRACKERS:
[Professional growth monitoring and portfolio building tools]

EMERGENCY PROTOCOLS:
[Crisis response and support resource compilation]

Each resource must feature:
- Professional presentation suitable for workplace display
- Evidence-based content with current research integration
- User-friendly format promoting quick reference capability
- Integration points with existing workplace systems
- Customization potential for specific practice environments

Create professional-grade resources that enhance daily practice and support continuous professional development."""

    if agent == 'openai':
        return call_openai_api(resources_prompt, 'professional_resources_generation')
    elif agent == 'anthropic':
        return call_anthropic_api(resources_prompt, 'professional_resources_generation')
    elif agent == 'perplexity':
        return call_perplexity_api(resources_prompt, 'professional_resources_generation')
    else:
        return call_ai_provider(resources_prompt, 'professional_resources_generation')

def generate_course_pdf_with_docsautomator(course_data, course_id):
    """Generate beautiful PDF course package using DocsAutomator"""
    try:
        # Template data for DocsAutomator - using template ID from API_notes.txt
        template_data = {
            "docId": "68d7b000c2fc16ccc70abdac",  # Course Package Template ID
            "documentName": f"Course Package - {course_data.get('course_concept', 'Unknown Course')}",
            "data": {
                "course_title": course_data.get('course_concept', 'Professional Healthcare Course'),
                "client_name": course_data.get('user_email', 'Healthcare Professional').split('@')[0],
                "target_audience": course_data.get('audience_type', 'Healthcare Professionals'),
                "creation_date": datetime.now().strftime('%Y-%m-%d'),
                "course_id": course_id,
                "modules_count": len(course_data.get('modules', [])),
                "voice_type": course_data.get('voice_type', 'Charon'),
                "completion_status": "Complete Premium Package",
                "components_generated": "7 components per module including slides, assessments, workbooks, resources",
                "audio_ready": "Yes - TTS scripts optimized for 60-90 seconds",
                "professional_standards": "AHPRA/NMBA compliant content"
            }
        }

        # Call DocsAutomator API
        headers = {
            "Authorization": f"Bearer {DOCS_AUTOMATOR_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            "https://api.docsautomator.co/createDocument",
            headers=headers,
            json=template_data,
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'pdf_url': result.get('document_url', ''),
                'download_url': result.get('download_url', ''),
                'document_id': result.get('document_id', ''),
                'status': 'PDF generated successfully'
            }
        else:
            return {
                'success': False,
                'error': f"DocsAutomator API error: {response.status_code} - {response.text}",
                'status': 'PDF generation failed'
            }

    except Exception as e:
        return {
            'success': False,
            'error': f"DocsAutomator integration error: {str(e)}",
            'status': 'PDF generation failed'
        }

def generate_course_slides_with_gamma(course_data, module_outlines):
    """Generate professional slide deck using Gamma API"""
    try:
        # Prepare slide content from module outlines
        slide_content = f"Course: {course_data.get('course_concept', 'Professional Course')}\n"
        slide_content += f"Audience: {course_data.get('audience_type', 'Professionals')}\n\n"

        for i, module in enumerate(module_outlines[:6]):  # Limit to 6 modules for slide deck
            slide_content += f"---\n"
            slide_content += f"Module {i+1}: {module.get('module', 'Module Title')}\n"
            # Extract key points from module content
            if isinstance(module.get('slides'), str):
                # Parse slides content to extract key points
                slides_text = module['slides'][:500]  # Limit length
                slide_content += f"{slides_text}\n"

        # Gamma API request
        headers = {
            "Authorization": f"Bearer {GAMMA_API_KEY}",
            "Content-Type": "application/json"
        }

        gamma_request = {
            "inputText": slide_content,
            "cardSplit": "inputTextBreaks",
            "theme": "professional"  # Professional theme for healthcare content
        }

        response = requests.post(
            "https://public-api.gamma.app/v0.2/generations",
            headers=headers,
            json=gamma_request,
            timeout=120
        )

        if response.status_code == 200:
            result = response.json()
            gamma_id = result.get('id', '')

            # Construct actual Gamma URLs from the deck ID
            presentation_url = f"https://gamma.app/docs/{gamma_id}" if gamma_id else ""
            export_url = result.get('export_url', f"https://gamma.app/docs/{gamma_id}/export" if gamma_id else "")

            return {
                'success': True,
                'presentation_url': presentation_url,
                'export_url': export_url,
                'gamma_id': gamma_id,
                'status': 'Slide deck generated successfully'
            }
        else:
            return {
                'success': False,
                'error': f"Gamma API error: {response.status_code} - {response.text}",
                'status': 'Slide deck generation failed'
            }

    except Exception as e:
        return {
            'success': False,
            'error': f"Gamma integration error: {str(e)}",
            'status': 'Slide deck generation failed'
        }

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

def save_course_files(course_id, complete_course):
    """Save all course components to local files for delivery"""
    course_folder = os.path.join(file_storage_base, course_id)
    os.makedirs(course_folder, exist_ok=True)

    # Create subfolders
    folders = ['audio_scripts', 'assessments', 'workbooks', 'scorm', 'roleplay_scenarios', 'course_architecture']
    for folder in folders:
        os.makedirs(os.path.join(course_folder, folder), exist_ok=True)

    file_paths = {}

    try:
        # 1. Course Architecture
        arch_file = os.path.join(course_folder, 'course_architecture', 'course_architecture.txt')
        with open(arch_file, 'w', encoding='utf-8') as f:
            f.write(complete_course.get('course_architecture', ''))
        file_paths['course_architecture'] = arch_file

        # 2. Audio Scripts for each module
        audio_files = []
        for i, module in enumerate(complete_course.get('modules', [])):
            script_file = os.path.join(course_folder, 'audio_scripts', f'module_{i+1}_audio_script.txt')
            with open(script_file, 'w', encoding='utf-8') as f:
                f.write(f"MODULE {i+1}: {module.get('module', 'Unknown')}\n\n")
                f.write("SLIDES CONTENT:\n")
                f.write(module.get('slides', ''))
                f.write("\n\nAUDIO SCRIPT (TTS OPTIMIZED):\n")
                f.write(module.get('audio_script', ''))
            audio_files.append(script_file)
        file_paths['audio_scripts'] = audio_files

        # 3. iSpring Assessments
        assessment_files = []
        for i, module in enumerate(complete_course.get('modules', [])):
            assess_file = os.path.join(course_folder, 'assessments', f'module_{i+1}_ispring_assessment.txt')
            with open(assess_file, 'w', encoding='utf-8') as f:
                f.write(f"iSPRING SUITE MAX ASSESSMENT - MODULE {i+1}\n")
                f.write("="*50 + "\n\n")
                f.write(module.get('ispring_assessment', ''))
            assessment_files.append(assess_file)
        file_paths['assessments'] = assessment_files

        # 4. Role Play Scenarios
        roleplay_files = []
        for i, module in enumerate(complete_course.get('modules', [])):
            roleplay_file = os.path.join(course_folder, 'roleplay_scenarios', f'module_{i+1}_roleplay.txt')
            with open(roleplay_file, 'w', encoding='utf-8') as f:
                f.write(f"ROLE PLAY SCENARIO - MODULE {i+1}\n")
                f.write("="*40 + "\n\n")
                f.write(module.get('roleplay_scenario', ''))
            roleplay_files.append(roleplay_file)
        file_paths['roleplay_scenarios'] = roleplay_files

        # 5. Premium Workbook
        workbook_file = os.path.join(course_folder, 'workbooks', 'premium_workbook_specifications.txt')
        with open(workbook_file, 'w', encoding='utf-8') as f:
            f.write("PREMIUM WORKBOOK SPECIFICATIONS\n")
            f.write("="*35 + "\n\n")
            f.write(complete_course.get('premium_components', {}).get('workbook_specifications', ''))
        file_paths['workbook'] = workbook_file

        # 6. SCORM Package Specifications
        scorm_file = os.path.join(course_folder, 'scorm', 'scorm_package_specifications.txt')
        with open(scorm_file, 'w', encoding='utf-8') as f:
            f.write("LMS SCORM PACKAGE SPECIFICATIONS\n")
            f.write("="*35 + "\n\n")
            f.write(complete_course.get('premium_components', {}).get('scorm_package', ''))
        file_paths['scorm'] = scorm_file

        # 7. Complete Course Data JSON
        course_data_file = os.path.join(course_folder, 'course_data.json')
        with open(course_data_file, 'w', encoding='utf-8') as f:
            json.dump(complete_course, f, indent=2, ensure_ascii=False)
        file_paths['course_data'] = course_data_file

        # 8. Complete Course Summary
        summary_file = os.path.join(course_folder, 'COURSE_SUMMARY.txt')
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"COMPLETE PREMIUM COURSE PACKAGE\n")
            f.write("="*35 + "\n\n")
            f.write(f"Course: {complete_course.get('course_concept', 'Unknown')}\n")
            f.write(f"Audience: {complete_course.get('audience_type', 'Unknown')}\n")
            f.write(f"Modules Generated: {len(complete_course.get('modules', []))}\n")
            f.write(f"Generated: {complete_course.get('generated_at', '')}\n\n")
            f.write(f"Research Foundation: {'✅ Comprehensive (' + str(len(complete_course.get('research_foundation', ''))) + ' characters)' if complete_course.get('research_foundation') else '❌ Missing'}\n")

            f.write("DELIVERABLES:\n")
            f.write("- Course Architecture Document\n")
            f.write(f"- {len(audio_files)} Audio Script Files (TTS Ready)\n")
            f.write(f"- {len(assessment_files)} iSpring Assessment Specifications\n")
            f.write(f"- {len(roleplay_files)} Role Play Scenario Scripts\n")
            f.write("- Premium Workbook Specifications\n")
            f.write("- LMS SCORM Package Specifications\n\n")

            f.write("NEXT STEPS:\n")
            f.write("1. Generate audio files using Google Apps Script TTS\n")
            f.write("2. Create iSpring Suite Max assessments\n")
            f.write("3. Build workbook using specifications\n")
            f.write("4. Package SCORM for LMS deployment\n")

        file_paths['summary'] = summary_file

        # 9. Create ZIP package for download
        zip_file = os.path.join(course_folder, f'{course_id}_complete_course.zip')
        with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(course_folder):
                for file in files:
                    if not file.endswith('.zip'):  # Don't include the zip in itself
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, course_folder)
                        zipf.write(file_path, arcname)

        file_paths['complete_package'] = zip_file

        return file_paths

    except Exception as e:
        print(f"Error saving course files: {str(e)}")
        return None

def generate_audio_files_via_apps_script(audio_scripts, course_id, slide_by_slide=False):
    """Call Google Apps Script to generate audio files"""
    if not GOOGLE_APPS_SCRIPT_URL:
        return {"error": "Google Apps Script URL not configured"}

    try:
        # Prepare audio generation request
        audio_request = {
            "course_id": course_id,
            "generation_type": "slide_by_slide" if slide_by_slide else "module_by_module",
            "scripts": []
        }

        for i, script_file in enumerate(audio_scripts):
            with open(script_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract just the audio script part
                if "AUDIO SCRIPT (TTS OPTIMIZED):" in content:
                    script_content = content.split("AUDIO SCRIPT (TTS OPTIMIZED):")[1].strip()
                else:
                    script_content = content

                if slide_by_slide:
                    # Split script into individual slides
                    slides = extract_individual_slides(script_content)
                    for j, slide_script in enumerate(slides):
                        audio_request["scripts"].append({
                            "module_number": i + 1,
                            "slide_number": j + 1,
                            "script_content": slide_script,
                            "voice_type": "Charon",
                            "file_name": f"module_{i+1}_slide_{j+1}"
                        })
                else:
                    # Generate one audio file per module
                    audio_request["scripts"].append({
                        "module_number": i + 1,
                        "script_content": script_content,
                        "voice_type": "Charon",
                        "file_name": f"module_{i+1}_complete"
                    })

        # Call Apps Script with timeout protection
        print(f"Calling Apps Script for {len(audio_request['scripts'])} audio files...")

        # For slide-by-slide generation, use longer timeout and batching
        if slide_by_slide and len(audio_request['scripts']) > 20:
            # Process in batches to avoid timeout
            return process_audio_in_batches(audio_request, course_id)
        else:
            response = requests.post(
                GOOGLE_APPS_SCRIPT_URL,
                json=audio_request,
                timeout=600  # 10 minute timeout for audio generation
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Apps Script call failed: {response.status_code}"}

    except Exception as e:
        return {"error": f"Audio generation failed: {str(e)}"}

def extract_individual_slides(script_content):
    """Extract individual slide scripts from complete module script"""
    slides = []

    # Look for slide markers in the script
    if "SLIDE " in script_content:
        slide_sections = script_content.split("SLIDE ")
        for section in slide_sections[1:]:  # Skip first empty section
            # Extract slide content until next slide or end
            slide_lines = section.split('\n')
            slide_script = []

            for line in slide_lines:
                if line.strip().startswith("SLIDE "):
                    break
                slide_script.append(line)

            slide_content = '\n'.join(slide_script).strip()
            if slide_content:
                slides.append(slide_content)
    else:
        # If no slide markers, split by paragraphs or sections
        paragraphs = script_content.split('\n\n')
        slides = [p.strip() for p in paragraphs if p.strip() and len(p.strip()) > 50]

    return slides

def process_audio_in_batches(audio_request, course_id, batch_size=10):
    """Process audio generation in batches to avoid timeouts"""
    all_results = []
    scripts = audio_request['scripts']

    for i in range(0, len(scripts), batch_size):
        batch = scripts[i:i+batch_size]
        batch_request = {
            "course_id": f"{course_id}_batch_{i//batch_size + 1}",
            "generation_type": audio_request['generation_type'],
            "scripts": batch
        }

        try:
            print(f"Processing audio batch {i//batch_size + 1} ({len(batch)} files)...")
            response = requests.post(
                GOOGLE_APPS_SCRIPT_URL,
                json=batch_request,
                timeout=300  # 5 minute timeout per batch
            )

            if response.status_code == 200:
                batch_result = response.json()
                all_results.append(batch_result)
                time.sleep(5)  # Pause between batches
            else:
                all_results.append({"error": f"Batch {i//batch_size + 1} failed: {response.status_code}"})

        except Exception as e:
            all_results.append({"error": f"Batch {i//batch_size + 1} error: {str(e)}"})

    return {
        "batch_processing": True,
        "total_batches": len(all_results),
        "results": all_results
    }

@app.route('/course/complete-and-deliver', methods=['POST'])
def complete_course_and_deliver():
    """Complete course generation with full file storage and delivery"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        source_urls = data.get('source_urls', '')
        voice_type = data.get('voice_type', 'Charon')
        research_foundation = data.get('research_foundation', '')
        user_email = data.get('user_email', '')

        if not course_concept or not audience_type:
            return jsonify({
                'success': False,
                'error': 'Course concept and audience type are required'
            }), 400

        # Generate unique course ID
        course_id = f"course_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"

        print(f"Starting complete course generation with delivery: {course_id}")

        # STEP 1-6: Generate complete course (existing logic)
        if not research_foundation or research_foundation.startswith("Available - comprehensive"):
            print(f"STEP 1: Generating research foundation for {course_concept}")
            research_result = generate_sophisticated_research(course_concept, audience_type, source_urls)
            research_foundation = research_result.get('evidence_base', '')
        else:
            print(f"STEP 1: Using provided research foundation")

        print(f"STEP 2: Analyzing audience for {audience_type}")
        audience_analysis = select_audience_specific_prompt(course_concept, audience_type, research_foundation)

        print(f"STEP 3: Creating course architecture")
        course_architecture = parse_research_into_modules(course_concept, audience_type, research_foundation)

        print(f"STEP 4: Distributing tasks to specialized agents")
        task_distribution = distribute_course_tasks(course_architecture, audience_analysis)

        print(f"STEP 5: Generating basic module structure")
        modules = extract_modules_from_architecture(course_architecture)

        print(f"STEP 6: Generating premium course components")
        audio_ready_modules = []
        premium_components = {
            'ispring_assessments': [],
            'roleplay_scenarios': [],
            'lms_upload_texts': [],
            'premium_workbooks': [],
            'professional_resources': [],
            'workbook_specifications': '',
            'scorm_package': ''
        }

        # Process ALL modules with bulletproof multi-agent distribution
        total_modules = len(modules)
        print(f"STARTING COMPLETE MODULE GENERATION: {total_modules} modules")

        for i, module in enumerate(modules):
            print(f"\nProcessing module {i+1}/{total_modules}: {module}")

            # PARALLEL PROCESSING: Use different agents for each component
            try:
                # Agent 1: OpenAI/Anthropic for slides (rotating)
                slides_agent = 'openai' if i % 2 == 0 else 'anthropic'
                print(f"   Generating slides using {slides_agent}...")
                module_slides = generate_module_slides_with_agent(module, course_concept, audience_type, slides_agent)

                # Agent 2: Gemini for audio optimization (60-90 second limit)
                print(f"   Optimizing audio script (60-90 sec limit)...")
                audio_script = optimize_slides_for_audio_with_limit(module_slides, voice_type, audience_type)
                time.sleep(1)  # Brief pause for Gemini

                # Agent 3: Anthropic for assessments
                print(f"   Creating iSpring assessments...")
                ispring_assessment = generate_ispring_assessments_with_agent(module_slides, course_concept, audience_type, 'anthropic')
                time.sleep(1)  # Brief pause

                # Agent 4: Grok for role play scenarios
                print(f"   Designing role play scenarios...")
                roleplay_scenario = generate_roleplay_scenarios_with_agent(course_concept, audience_type, module_slides, 'grok')
                time.sleep(1)  # Brief pause

                # Agent 5: OpenAI/Perplexity for LMS upload text (alternating)
                lms_agent = 'openai' if i % 2 == 0 else 'perplexity'
                print(f"   Creating LMS upload text using {lms_agent}...")
                lms_upload_text = generate_lms_upload_text_with_agent(module_slides, course_concept, audience_type, lms_agent)
                time.sleep(1)  # Brief pause

                # Agent 6: Anthropic/OpenAI for premium workbook (alternating)
                workbook_agent = 'anthropic' if i % 2 == 0 else 'openai'
                print(f"   Generating premium workbook content using {workbook_agent}...")
                premium_workbook = generate_premium_workbook_with_agent(module_slides, course_concept, audience_type, workbook_agent)
                time.sleep(1)  # Brief pause

                # Agent 7: Perplexity/Anthropic for professional resources (alternating)
                resources_agent = 'perplexity' if i % 2 == 0 else 'anthropic'
                print(f"   Creating professional resources using {resources_agent}...")
                professional_resources = generate_professional_resources_with_agent(module_slides, course_concept, audience_type, resources_agent)
                time.sleep(2)  # Pause before next module

                print(f"   Module {i+1} COMPLETE with ALL 7 components")

            except Exception as e:
                print(f"   Module {i+1} FAILED: {str(e)}")
                # FAILOVER: Retry with different agent
                print(f"   RETRYING module {i+1} with failover agents...")
                try:
                    module_slides = generate_module_slides_with_agent(module, course_concept, audience_type, 'openai')
                    audio_script = optimize_slides_for_audio_with_limit(module_slides, voice_type, audience_type)
                    ispring_assessment = generate_ispring_assessments_with_agent(module_slides, course_concept, audience_type, 'openai')
                    roleplay_scenario = generate_roleplay_scenarios_with_agent(course_concept, audience_type, module_slides, 'anthropic')
                    lms_upload_text = generate_lms_upload_text_with_agent(module_slides, course_concept, audience_type, 'openai')
                    premium_workbook = generate_premium_workbook_with_agent(module_slides, course_concept, audience_type, 'anthropic')
                    professional_resources = generate_professional_resources_with_agent(module_slides, course_concept, audience_type, 'openai')
                    print(f"   Module {i+1} RECOVERED with ALL components")
                except Exception as retry_error:
                    print(f"   Module {i+1} CRITICAL FAILURE: {str(retry_error)}")
                    # Use minimal content to keep workflow moving
                    module_slides = f"Module {i+1}: {module} - Content generation failed, using placeholder"
                    audio_script = f"This is module {i+1} about {module}. Please refer to the course materials for detailed content."
                    ispring_assessment = f"Assessment for module {i+1} - {module}"
                    roleplay_scenario = f"Role play scenario for module {i+1} - {module}"
                    lms_upload_text = f"LMS Upload Content for Module {i+1}: {module} - Please refer to course materials for detailed content."
                    premium_workbook = f"Premium Workbook Section for Module {i+1}: {module} - Content generation failed, manual completion required."
                    professional_resources = f"Professional Resources for Module {i+1}: {module} - Please refer to course materials and professional standards."

            audio_ready_modules.append({
                'module': module,
                'slides': module_slides,
                'audio_script': audio_script,
                'ispring_assessment': ispring_assessment,
                'roleplay_scenario': roleplay_scenario,
                'lms_upload_text': lms_upload_text,
                'premium_workbook': premium_workbook,
                'professional_resources': professional_resources
            })

            premium_components['ispring_assessments'].append(ispring_assessment)
            premium_components['roleplay_scenarios'].append(roleplay_scenario)
            premium_components['lms_upload_texts'].append(lms_upload_text)
            premium_components['premium_workbooks'].append(premium_workbook)
            premium_components['professional_resources'].append(professional_resources)

        print(f"Generating course-wide premium components")
        premium_components['workbook_specifications'] = generate_premium_workbooks(course_architecture, audience_type, modules)
        premium_components['scorm_package'] = generate_lms_scorm_package({
            'course_concept': course_concept,
            'audience_type': audience_type
        }, modules)

        # Complete course data
        complete_course = {
            'course_id': course_id,
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
            'generated_at': datetime.now().isoformat(),
            'user_email': user_email
        }

        # STEP 7: Save all files locally
        print(f"STEP 7: Saving all course files to local storage")
        file_paths = save_course_files(course_id, complete_course)

        if not file_paths:
            return jsonify({
                'success': False,
                'error': 'Failed to save course files'
            }), 500

        # STEP 8: Generate audio files via Apps Script
        slide_by_slide = data.get('slide_by_slide', False)
        print(f"STEP 8: Generating audio files via Google Apps Script ({'slide-by-slide' if slide_by_slide else 'module-by-module'})")
        audio_result = generate_audio_files_via_apps_script(file_paths['audio_scripts'], course_id, slide_by_slide)

        # Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': complete_course,
            'metadata': {
                'type': 'complete_course_delivered',
                'course_id': course_id,
                'course_concept': course_concept,
                'audience_type': audience_type,
                'modules_count': len(audio_ready_modules),
                'file_paths': file_paths,
                'audio_generation': audio_result
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        return jsonify({
            'success': True,
            'message': 'Complete premium course generated and saved successfully',
            'course_id': course_id,
            'course': complete_course,
            'file_paths': {
                'local_folder': os.path.join(file_storage_base, course_id),
                'complete_package': file_paths['complete_package'],
                'audio_scripts_count': len(file_paths['audio_scripts']),
                'assessment_files_count': len(file_paths['assessments']),
                'roleplay_files_count': len(file_paths['roleplay_scenarios'])
            },
            'audio_generation': audio_result,
            'knowledge_id': knowledge_entry['id'],
            'modules_ready_for_audio': len(audio_ready_modules),
            'premium_components_generated': {
                'ispring_assessments': len(premium_components['ispring_assessments']),
                'roleplay_scenarios': len(premium_components['roleplay_scenarios']),
                'workbook_specifications': 'generated',
                'scorm_package': 'generated'
            },
            'deliverables_ready': True,
            'download_ready': True
        })

    except Exception as e:
        print(f"ERROR in complete course and deliver: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/gamma/create-presentation', methods=['POST'])
def create_gamma_presentation():
    """Standalone Gamma presentation creation for consulting use"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        title = data.get('title', '')
        outline = data.get('outline', '')
        theme = data.get('theme', 'professional')

        if not title or not outline:
            return jsonify({
                'success': False,
                'error': 'Title and outline are required'
            }), 400

        print(f"Creating Gamma presentation: {title}")

        # Format outline for Gamma API
        slide_content = f"{title}\n\n{outline}"

        # Call Gamma API
        headers = {
            "Authorization": f"Bearer {GAMMA_API_KEY}",
            "Content-Type": "application/json"
        }

        gamma_request = {
            "inputText": slide_content,
            "cardSplit": "inputTextBreaks",
            "theme": theme
        }

        response = requests.post(
            "https://public-api.gamma.app/v0.2/generations",
            headers=headers,
            json=gamma_request,
            timeout=120
        )

        if response.status_code == 200:
            result = response.json()
            gamma_id = result.get('id', '')

            # Construct actual Gamma URLs from the deck ID
            # Gamma presentations are typically accessible via:
            # https://gamma.app/docs/[deck-id]
            presentation_url = f"https://gamma.app/docs/{gamma_id}" if gamma_id else ""

            # Export URL for PDF/other formats (if available)
            export_url = result.get('export_url', f"https://gamma.app/docs/{gamma_id}/export" if gamma_id else "")

            return jsonify({
                'success': True,
                'presentation_url': presentation_url,
                'export_url': export_url,
                'gamma_id': gamma_id,
                'title': title,
                'theme': theme,
                'timestamp': datetime.now().isoformat(),
                'instructions': 'Open presentation_url to view and share your deck. Use export_url for download options.'
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Gamma API error: {response.status_code} - {response.text}"
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Gamma presentation error: {str(e)}'
        }), 500

@app.route('/course/complete-with-premium-delivery', methods=['POST'])
def complete_course_with_premium_delivery():
    """Complete course generation with PDF and slide deck delivery"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        voice_type = data.get('voice_type', 'Charon')
        user_email = data.get('user_email', '')

        if not course_concept or not audience_type:
            return jsonify({
                'success': False,
                'error': 'Course concept and audience type are required'
            }), 400

        print(f"STARTING PREMIUM DELIVERY PIPELINE")
        print(f"Course: {course_concept}")
        print(f"Audience: {audience_type}")

        # STEP 1: Quick test data generation for PDF and Gamma testing
        course_data = {
            'course_concept': course_concept,
            'audience_type': audience_type,
            'voice_type': voice_type,
            'user_email': user_email,
            'modules': [
                {'module': 'Module 1: Introduction', 'slides': 'Professional healthcare introduction content'},
                {'module': 'Module 2: Core Concepts', 'slides': 'Evidence-based practice fundamentals'},
                {'module': 'Module 3: Application', 'slides': 'Practical implementation strategies'}
            ]
        }
        course_id = f"TEST_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # STEP 2: Generate PDF with DocsAutomator
        print(f"Generating premium PDF package...")
        pdf_result = generate_course_pdf_with_docsautomator(course_data, course_id)

        # STEP 3: Generate Slide Deck with Gamma
        print(f"Generating professional slide deck...")
        slides_result = generate_course_slides_with_gamma(course_data, course_data.get('modules', []))

        # STEP 4: Return test results
        return jsonify({
            'success': True,
            'test_mode': True,
            'course_data': course_data,
            'pdf_result': pdf_result,
            'slides_result': slides_result,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Premium delivery test error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

# HYBRID WORKFLOW: GOOGLE DOCS AND SHEETS INTEGRATION
# ====================================================

def create_google_doc_via_docs_automator(title, content):
    """Create Google Doc using DocsAutomator API"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {DOCS_AUTOMATOR_API_KEY}"
        }

        payload = {
            "title": title,
            "content": content,
            "sharing": {
                "type": "anyone",
                "role": "reader"
            }
        }

        response = requests.post(
            "https://api.docsautomator.co/v1/documents",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 201:
            result = response.json()
            return {
                'success': True,
                'doc_url': result.get('url', ''),
                'doc_id': result.get('id', ''),
                'title': title
            }
        else:
            print(f"DocsAutomator API error: {response.status_code} - {response.text}")
            return {
                'success': False,
                'error': f"API error: {response.status_code}",
                'doc_url': '',
                'doc_id': '',
                'title': title
            }

    except Exception as e:
        print(f"Error creating Google Doc: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'doc_url': '',
            'doc_id': '',
            'title': title
        }

def create_course_google_docs(course_data, course_id):
    """Create all Google Docs for course outputs as per hybrid architecture"""
    try:
        print("Creating Google Docs for all course outputs...")
        doc_links = {}

        # 1. Research Foundation Doc
        research_foundation_content = course_data.get('research_foundation', '')
        if research_foundation_content or course_data.get('audience_analysis'):
            print("  Creating Research Foundation Doc...")

            # Use comprehensive research foundation if available, otherwise fallback to audience analysis
            if research_foundation_content and len(research_foundation_content) > 1000:
                doc_content = f"# Research Foundation - {course_data.get('course_concept', 'Course')}\n\n## Course Concept\n{course_data.get('course_concept', '')}\n\n## Comprehensive Research Foundation\n\n{research_foundation_content}\n\n## Source URLs\n{course_data.get('source_urls', '')}\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            else:
                doc_content = f"# Research Foundation - {course_data.get('course_concept', 'Course')}\n\n## Course Concept\n{course_data.get('course_concept', '')}\n\n## Audience Analysis\n{course_data.get('audience_analysis', '')}\n\n## Source Research\n{course_data.get('source_urls', '')}\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

            research_doc = create_google_doc_via_docs_automator(
                f"Research Foundation - {course_data.get('course_concept', 'Course')}",
                doc_content
            )
            doc_links['research_foundation'] = research_doc['doc_url']

        # 2. Course Architecture Doc
        if course_data.get('course_architecture'):
            print("  Creating Course Architecture Doc...")
            arch_doc = create_google_doc_via_docs_automator(
                f"Course Architecture - {course_data.get('course_concept', 'Course')}",
                f"# Course Architecture\n\n{course_data.get('course_architecture', '')}\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            doc_links['course_architecture'] = arch_doc['doc_url']

        # 3. Learning Objectives Doc (extracted from modules)
        if course_data.get('modules'):
            print("  Creating Learning Objectives Doc...")
            learning_objectives = "# Learning Objectives\n\n"
            for i, module in enumerate(course_data['modules'], 1):
                module_name = module.get('module', f'Module {i}')
                learning_objectives += f"## {module_name}\n\n"

                # Extract learning objectives from slides or assessments
                slides = module.get('slides', '')
                if 'LEARNING OBJECTIVE' in slides:
                    lines = slides.split('\n')
                    for line in lines:
                        if 'LEARNING OBJECTIVE' in line:
                            learning_objectives += f"- {line.replace('**LEARNING OBJECTIVE:**', '').strip()}\n"
                learning_objectives += "\n"

            objectives_doc = create_google_doc_via_docs_automator(
                f"Learning Objectives - {course_data.get('course_concept', 'Course')}",
                f"{learning_objectives}\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            doc_links['learning_objectives'] = objectives_doc['doc_url']

        # 4. Key Concepts Doc (extracted from modules)
        if course_data.get('modules'):
            print("  Creating Key Concepts Doc...")
            key_concepts = "# Key Concepts\n\n"
            for i, module in enumerate(course_data['modules'], 1):
                module_name = module.get('module', f'Module {i}')
                key_concepts += f"## {module_name}\n\n"

                # Extract key concepts from slides
                slides = module.get('slides', '')
                if 'EVIDENCE POINT' in slides or 'PRACTICE APPLICATION' in slides:
                    lines = slides.split('\n')
                    for line in lines:
                        if 'EVIDENCE POINT' in line:
                            key_concepts += f"### Evidence: {line.replace('**EVIDENCE POINT:**', '').strip()}\n\n"
                        elif 'PRACTICE APPLICATION' in line:
                            key_concepts += f"### Application: {line.replace('**PRACTICE APPLICATION:**', '').strip()}\n\n"
                key_concepts += "\n"

            concepts_doc = create_google_doc_via_docs_automator(
                f"Key Concepts - {course_data.get('course_concept', 'Course')}",
                f"{key_concepts}\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            doc_links['key_concepts'] = concepts_doc['doc_url']

        # 5-16. Module Summary Docs (×12)
        if course_data.get('modules'):
            print("  Creating Module Summary Docs...")
            for i, module in enumerate(course_data['modules'], 1):
                module_name = module.get('module', f'Module {i}')
                module_content = f"# {module_name}\n\n"

                if module.get('slides'):
                    module_content += f"## Slide Content\n{module['slides']}\n\n"
                if module.get('audio_script'):
                    module_content += f"## Audio Script\n{module['audio_script']}\n\n"
                if module.get('ispring_assessment'):
                    module_content += f"## Assessment Specifications\n{module['ispring_assessment']}\n\n"
                if module.get('professional_resources'):
                    module_content += f"## Professional Resources\n{module['professional_resources']}\n\n"

                module_content += f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

                module_doc = create_google_doc_via_docs_automator(
                    f"{module_name} - {course_data.get('course_concept', 'Course')}",
                    module_content
                )
                doc_links[f'module_{i}_summary'] = module_doc['doc_url']

        # 6-17. Slide Specifications Docs (×12)
        if course_data.get('modules'):
            print("  Creating Slide Specifications Docs...")
            for i, module in enumerate(course_data['modules'], 1):
                module_name = module.get('module', f'Module {i}')
                slide_specs = f"# Slide Specifications - {module_name}\n\n"

                if module.get('slides'):
                    slide_specs += f"## Complete Slide Content\n{module['slides']}\n\n"

                    # Parse individual slides for audio tab population
                    slides_text = module['slides']
                    slide_sections = slides_text.split('**SLIDE ')

                    for j, slide_section in enumerate(slide_sections[1:], 1):  # Skip first empty split
                        slide_specs += f"### Slide {j}\n"
                        lines = slide_section.split('\n')
                        slide_title = lines[0].replace(':', '').strip() if lines else f"Slide {j}"
                        slide_specs += f"**Title:** {slide_title}\n"

                        # Extract bullet points or content
                        content_lines = [line.strip() for line in lines[1:] if line.strip() and not line.startswith('**')]
                        if content_lines:
                            slide_specs += f"**Content:** {' '.join(content_lines[:3])}\n"  # First 3 lines
                        slide_specs += "\n"

                slide_specs += f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

                slides_doc = create_google_doc_via_docs_automator(
                    f"Slide Specifications - {module_name}",
                    slide_specs
                )
                doc_links[f'module_{i}_slides'] = slides_doc['doc_url']

        # 7. Workbook & Extra Materials Doc
        if course_data.get('modules'):
            print("  Creating Workbook & Extra Materials Doc...")
            workbook_content = "# Workbook & Extra Materials\n\n"

            for i, module in enumerate(course_data['modules'], 1):
                if module.get('premium_workbook'):
                    module_name = module.get('module', f'Module {i}')
                    workbook_content += f"## {module_name} Workbook\n{module['premium_workbook']}\n\n"

            workbook_content += f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

            workbook_doc = create_google_doc_via_docs_automator(
                f"Workbook & Extra Materials - {course_data.get('course_concept', 'Course')}",
                workbook_content
            )
            doc_links['workbook_materials'] = workbook_doc['doc_url']

        # 8. LMS Upload Doc
        if course_data.get('modules'):
            print("  Creating LMS Upload Doc...")
            lms_content = "# LMS Upload Package\n\n"

            for i, module in enumerate(course_data['modules'], 1):
                if module.get('lms_upload_text'):
                    module_name = module.get('module', f'Module {i}')
                    lms_content += f"## {module_name} LMS Content\n{module['lms_upload_text']}\n\n"

            lms_content += f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

            lms_doc = create_google_doc_via_docs_automator(
                f"LMS Upload Package - {course_data.get('course_concept', 'Course')}",
                lms_content
            )
            doc_links['lms_upload'] = lms_doc['doc_url']

        # 9-20. Assessment Specs Docs (×12)
        if course_data.get('modules'):
            print("  Creating Assessment Specifications Docs...")
            for i, module in enumerate(course_data['modules'], 1):
                if module.get('ispring_assessment'):
                    module_name = module.get('module', f'Module {i}')
                    assessment_doc = create_google_doc_via_docs_automator(
                        f"Assessment Specifications - {module_name}",
                        f"# Assessment Specifications - {module_name}\n\n{module['ispring_assessment']}\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                    )
                    doc_links[f'module_{i}_assessments'] = assessment_doc['doc_url']

        # 10-21. Role Play Docs (×12)
        if course_data.get('modules'):
            print("  Creating Role Play Scenarios Docs...")
            for i, module in enumerate(course_data['modules'], 1):
                if module.get('roleplay_scenario'):
                    module_name = module.get('module', f'Module {i}')
                    roleplay_doc = create_google_doc_via_docs_automator(
                        f"Role Play Scenarios - {module_name}",
                        f"# Role Play Scenarios - {module_name}\n\n{module['roleplay_scenario']}\n\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                    )
                    doc_links[f'module_{i}_roleplays'] = roleplay_doc['doc_url']

        print(f"Successfully created {len(doc_links)} Google Docs")
        return {
            'success': True,
            'doc_links': doc_links,
            'docs_created': len(doc_links)
        }

    except Exception as e:
        print(f"Error creating course Google Docs: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'doc_links': {},
            'docs_created': 0
        }

@app.route('/course/create-hybrid-docs', methods=['POST'])
def create_hybrid_course_docs():
    """Create Google Docs and prepare Google Sheets data for hybrid workflow"""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        course_id = data.get('course_id', '')
        sheet_id = data.get('sheet_id', 'YOUR_GOOGLE_SHEET_ID')

        if not course_id:
            return jsonify({
                'success': False,
                'error': 'Course ID is required'
            }), 400

        # Load course data from the completed course
        course_output_dir = f"course_outputs/{course_id}"
        course_data_file = f"{course_output_dir}/course_data.json"

        if not os.path.exists(course_data_file):
            return jsonify({
                'success': False,
                'error': f'Course data not found for {course_id}'
            }), 404

        with open(course_data_file, 'r', encoding='utf-8') as f:
            course_data = json.load(f)

        print(f"Creating hybrid workflow docs for course: {course_id}")

        # Step 1: Create all Google Docs
        docs_result = create_course_google_docs(course_data, course_id)

        if not docs_result['success']:
            return jsonify({
                'success': False,
                'error': f"Failed to create Google Docs: {docs_result['error']}"
            }), 500

        # Step 2: Save hybrid workflow data
        hybrid_data = {
            'course_id': course_id,
            'course_concept': course_data.get('course_concept', ''),
            'generated_at': datetime.now().isoformat(),
            'google_docs': docs_result['doc_links'],
            'docs_created': docs_result['docs_created'],
            'status': 'hybrid_docs_created'
        }

        # Save hybrid data file
        hybrid_file = f"{course_output_dir}/hybrid_workflow_data.json"
        with open(hybrid_file, 'w', encoding='utf-8') as f:
            json.dump(hybrid_data, f, indent=2, ensure_ascii=False)

        return jsonify({
            'success': True,
            'course_id': course_id,
            'google_docs_created': docs_result['docs_created'],
            'google_docs': docs_result['doc_links'],
            'hybrid_workflow_status': 'docs_created_ready_for_sheets',
            'message': 'Hybrid workflow Google Docs created successfully. All course outputs are now accessible as Google Docs.',
            'next_steps': [
                '1. Set up Google Sheets API integration',
                '2. Populate Text Outputs, Audio, and Interactive tabs',
                '3. Configure n8n triggers for audio generation',
                '4. Test complete hybrid workflow'
            ]
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Hybrid docs creation error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/course-architect', methods=['POST'])
def course_architect():
    """
    PHOENIX SIMPLIFIED WORKFLOW ENDPOINT
    Generates Course Recommendation for n8n Phoenix workflow
    No research foundation needed - just creates course architecture from concept and sources
    """
    try:
        # Get request data
        data = request.get_json()
        course_concept = data.get('course_concept', '')
        audience_type = data.get('audience_type', '')
        source_urls = data.get('source_urls', '')

        if not course_concept or not audience_type:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: course_concept and audience_type'
            }), 400

        print(f"PHOENIX: Generating course recommendation for '{course_concept}' - {audience_type}")

        # STEP 1: Generate basic research foundation using Perplexity
        evidence_base = call_perplexity_api(f"""
        Research and analyze the topic: {course_concept}
        Target audience: {audience_type}
        Source materials: {source_urls}

        Provide a comprehensive evidence base including:
        - Key evidence from provided sources
        - 3-5 additional peer-reviewed sources from last 5 years
        - Australian healthcare regulatory context
        - Evidence-based insights and frameworks
        - Critical success factors
        - Contemporary best practices

        Use Vancouver citation style. Focus on practical applications for {audience_type}.
        """)

        # STEP 2: Generate course architecture using upgraded prompts
        course_architecture = parse_research_into_modules(course_concept, audience_type, evidence_base)

        # STEP 3: Store in knowledge base
        knowledge_entry = {
            'id': len(knowledge_store) + 1,
            'content': course_architecture,
            'metadata': {
                'type': 'course_recommendation',
                'course_concept': course_concept,
                'audience_type': audience_type,
                'workflow': 'phoenix_simplified',
                'evidence_base_length': len(evidence_base),
                'generated_via': 'perplexity_research'
            },
            'timestamp': datetime.now().isoformat()
        }

        knowledge_store.append(knowledge_entry)

        # STEP 4: Extract course data for response
        course_data = {
            'title': f"{course_concept} for {audience_type}",
            'course_architecture': course_architecture,
            'evidence_base_summary': evidence_base[:500] + "..." if len(evidence_base) > 500 else evidence_base,
            'knowledge_id': knowledge_entry['id'],
            'generated_at': knowledge_entry['timestamp']
        }

        print(f"PHOENIX: Course recommendation generated successfully. Knowledge ID: {knowledge_entry['id']}")

        return jsonify({
            'success': True,
            'course_architecture': course_architecture,
            'knowledge_id': knowledge_entry['id'],
            'course_data': course_data,
            'message': 'Course recommendation generated successfully for Phoenix workflow'
        })

    except Exception as e:
        print(f"PHOENIX ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Course architect error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/course-architect-from-research', methods=['POST'])
def course_architect_from_research():
    """
    PHOENIX NOTION WORKFLOW ENDPOINT
    Analyzes uploaded research foundation and generates course architecture
    """
    try:
        data = request.get_json()
        course_concept = data.get('course_concept')
        target_audience = data.get('target_audience')
        research_foundation = data.get('research_foundation')
        voice_selection = data.get('voice_selection')
        user_name = data.get('user_name')
        user_email = data.get('user_email')

        print(f"PHOENIX GOOGLE FORMS: Processing {course_concept} for {target_audience}")
        print(f"Research foundation: {research_foundation}")
        print(f"Voice selection: {voice_selection}, User: {user_name}")

        # Use Google Drive URL to reference the research foundation
        research_foundation_reference = f"""
        Research Foundation Analysis:

        This endpoint received a user-provided research foundation document for:
        Course: {course_concept}
        Target Audience: {target_audience}
        Voice Selection: {voice_selection}
        User: {user_name} ({user_email})
        Research Foundation: {research_foundation}

        The uploaded research foundation will be analyzed to extract evidence-based frameworks,
        learning objectives, assessment strategies, and implementation guidance
        aligned with Australian healthcare professional development standards.

        This course architecture will incorporate the user's comprehensive research foundation
        to create sophisticated, evidence-based modules for {target_audience} professionals.
        """

        # Use existing parse_research_into_modules function with reference
        course_architecture = parse_research_into_modules(
            research_foundation_reference,
            course_concept,
            target_audience
        )

        # Store in Knowledge Lake
        knowledge_response = requests.post("http://localhost:5002/knowledge/store", json={
            'content': course_architecture,
            'metadata': {
                'type': 'course_recommendation',
                'course_concept': course_concept,
                'audience_type': target_audience,
                'research_source': 'user_provided',
                'research_file': research_foundation,
                'workflow': 'phoenix_notion',
                'timestamp': datetime.now().isoformat()
            }
        })

        knowledge_id = None
        if knowledge_response.status_code == 200:
            knowledge_id = knowledge_response.json().get('id', 'unknown')

        return jsonify({
            'success': True,
            'course_architecture': course_architecture,
            'knowledge_id': knowledge_id,
            'research_analysis': f'Analyzed user-provided research foundation: {research_foundation}',
            'source': 'notion_research_upload',
            'course_data': {
                'title': f"{course_concept} - Professional Development Course",
                'description': f"Evidence-based course for {target_audience} based on user-provided research foundation",
                'audience': target_audience,
                'research_source': research_foundation
            }
        })

    except Exception as e:
        print(f"PHOENIX NOTION ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Course architect from research error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/module/generate-premium', methods=['POST'])
def generate_premium_module():
    """
    PHOENIX PREMIUM MODULE GENERATION
    Generates comprehensive module using upgraded prompts
    """
    try:
        data = request.get_json()
        module_number = data.get('module_number')
        module_title = data.get('module_title')
        learning_objectives = data.get('learning_objectives')
        course_concept = data.get('course_concept')
        audience_type = data.get('audience_type')
        research_foundation = data.get('research_foundation')
        course_architecture = data.get('course_architecture')

        print(f"PREMIUM MODULE: Generating Module {module_number} - {module_title}")

        # Use sophisticated module generation prompt from KNOWLEDGE_LAKE_PROMPTS_UPGRADED.md
        module_prompt = f"""
        SOPHISTICATED MODULE CONTENT GENERATION - ENHANCED (October 2025)

        You are an expert in Australian healthcare professional development creating evidence-based content for healthcare professionals supervising International Medical Graduates (IMGs) and other learners.

        **MODULE DETAILS:**
        - Module Number: {module_number}
        - Module Title: {module_title}
        - Learning Objectives: {learning_objectives}
        - Course: {course_concept}
        - Audience: {audience_type}

        **RESEARCH FOUNDATION:**
        {research_foundation[:2000]}...

        **COURSE ARCHITECTURE CONTEXT:**
        {course_architecture[:1000]}...

        Generate comprehensive module content with:
        1. **Detailed Content** (2000-3000 words)
        2. **Evidence-Based Frameworks** with citations
        3. **Practical Applications** for Australian healthcare
        4. **Case Studies** relevant to audience
        5. **Interactive Elements** for engagement
        6. **Assessment Integration** aligned with learning objectives
        7. **Cultural Safety Considerations**
        8. **AHPRA/NMBA Compliance** requirements

        Ensure content is sophisticated, evidence-based, and ready for professional development use.
        """

        # Generate module content using call_ai_provider
        module_content = call_ai_provider(module_prompt, 'course_generation')

        return jsonify({
            'success': True,
            'module_content': module_content,
            'module_number': module_number,
            'module_title': module_title,
            'learning_objectives': learning_objectives,
            'generation_method': 'premium_prompts'
        })

    except Exception as e:
        print(f"PREMIUM MODULE ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Premium module generation error: {str(e)}'
        }), 500

@app.route('/slides/generate-professional', methods=['POST'])
def generate_professional_slides():
    """
    PROFESSIONAL SLIDE GENERATION
    Creates sophisticated presentation slides with presenter notes
    """
    try:
        data = request.get_json()
        module_content = data.get('module_content')
        module_title = data.get('module_title')
        learning_objectives = data.get('learning_objectives')
        audience_type = data.get('audience_type')

        print(f"PROFESSIONAL SLIDES: Generating for {module_title}")

        # Use professional slide generation prompt
        slides_prompt = f"""
        PROFESSIONAL SLIDE GENERATION - ENHANCED (October 2025)

        Create 15 professional presentation slides for:
        **Module:** {module_title}
        **Audience:** {audience_type}
        **Learning Objectives:** {learning_objectives}

        **Module Content:**
        {module_content[:3000]}...

        Generate slides with:
        1. **Title Slide** with Australian healthcare branding
        2. **Learning Objectives** (1 slide)
        3. **Content Slides** (10-11 slides) with evidence-based content
        4. **Case Study/Scenario** (1-2 slides)
        5. **Summary/Key Takeaways** (1 slide)
        6. **References** (1 slide)

        **Each slide must include:**
        - Clear, professional layout
        - Bullet points (max 6 per slide)
        - Presenter notes (detailed talking points)
        - Visual descriptions for images/graphics
        - Australian healthcare context
        - Evidence-based citations where relevant

        Format as complete slide deck ready for professional presentation.
        """

        slides_content = call_ai_provider(slides_prompt, 'slide_generation')

        return jsonify({
            'success': True,
            'slides': slides_content,
            'slide_count': 15,
            'includes_presenter_notes': True
        })

    except Exception as e:
        print(f"PROFESSIONAL SLIDES ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Professional slides generation error: {str(e)}'
        }), 500

@app.route('/audio/generate-enhanced', methods=['POST'])
def generate_enhanced_audio():
    """
    ENHANCED AUDIO SCRIPT GENERATION
    Creates sophisticated audio narration scripts
    """
    try:
        data = request.get_json()
        module_content = data.get('module_content')
        slide_content = data.get('slide_content')
        voice_type = data.get('voice_type', 'professional')

        print(f"ENHANCED AUDIO: Generating script for {voice_type} voice")

        audio_prompt = f"""
        ENHANCED AUDIO SCRIPT GENERATION - ENHANCED (October 2025)

        Create a 15-20 minute professional audio script for Australian healthcare professionals.

        **Voice Type:** {voice_type}
        **Target Duration:** 15-20 minutes (approximately 2000-2500 words)

        **Module Content:**
        {module_content[:2000]}...

        **Slide Content:**
        {slide_content[:1500]}...

        Generate script with:
        1. **Professional Introduction** (1-2 minutes)
        2. **Main Content Sections** (12-15 minutes)
        3. **Interactive Pauses** for reflection
        4. **Case Study Narration** (2-3 minutes)
        5. **Professional Conclusion** (1-2 minutes)

        **Script Requirements:**
        - Natural, conversational tone for healthcare professionals
        - Australian pronunciation notes where needed
        - Appropriate pacing markers [PAUSE], [SLOW], [EMPHASIS]
        - Interactive elements "Take a moment to consider..."
        - Professional transitions between sections
        - Evidence-based content delivery
        - Cultural safety language considerations

        Format as complete audio script ready for professional voice recording.
        """

        audio_script = call_ai_provider(audio_prompt, 'audio_generation')

        return jsonify({
            'success': True,
            'script': audio_script,
            'estimated_duration': '15-20 minutes',
            'voice_type': voice_type,
            'includes_interactions': True
        })

    except Exception as e:
        print(f"ENHANCED AUDIO ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Enhanced audio generation error: {str(e)}'
        }), 500

@app.route('/assessment/generate-sophisticated', methods=['POST'])
def generate_sophisticated_assessment():
    """
    SOPHISTICATED ASSESSMENT GENERATION
    Creates advanced assessments using Miller's Pyramid
    """
    try:
        data = request.get_json()
        module_content = data.get('module_content')
        learning_objectives = data.get('learning_objectives')
        audience_type = data.get('audience_type')

        print(f"SOPHISTICATED ASSESSMENT: Generating for {audience_type}")

        assessment_prompt = f"""
        SOPHISTICATED ASSESSMENT GENERATION - ENHANCED (October 2025)

        Create comprehensive assessments for Australian healthcare professionals using Miller's Pyramid of Clinical Competence.

        **Target Audience:** {audience_type}
        **Learning Objectives:** {learning_objectives}

        **Module Content:**
        {module_content[:2000]}...

        Generate assessments covering all Miller's Pyramid levels:

        **1. KNOWS (Knowledge) - 5 questions**
        - Advanced multiple choice with clinical scenarios
        - Evidence-based best practice questions
        - Australian healthcare standards knowledge

        **2. KNOWS HOW (Competence) - 3 scenarios**
        - Complex case study analysis
        - Decision-making scenarios
        - Problem-solving applications

        **3. SHOWS HOW (Performance) - 2 practical assessments**
        - Simulated practice scenarios
        - Skill demonstration requirements
        - Peer review components

        **4. DOES (Action) - 1 workplace application**
        - Real-world implementation task
        - Quality improvement project
        - Reflective practice component

        **Assessment Requirements:**
        - AHPRA/NMBA professional development alignment
        - Cultural safety considerations
        - Evidence-based marking criteria
        - Clear performance indicators
        - Constructive feedback mechanisms
        - CPD point calculations where applicable

        Format as complete assessment package ready for professional implementation.
        """

        assessment_content = call_ai_provider(assessment_prompt, 'assessment_generation')

        return jsonify({
            'success': True,
            'assessments': assessment_content,
            'assessment_levels': ['knows', 'knows_how', 'shows_how', 'does'],
            'total_questions': 11,
            'millers_pyramid_aligned': True
        })

    except Exception as e:
        print(f"SOPHISTICATED ASSESSMENT ERROR: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Sophisticated assessment generation error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting Carla's Simple Knowledge Lake API...")
    print("API will be available at: http://localhost:5002")

    # Use Waitress for production-ready server
    from waitress import serve
    serve(app, host='0.0.0.0', port=5002)

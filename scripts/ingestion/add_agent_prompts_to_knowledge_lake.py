"""
Add Agent Prompts to Knowledge Lake
Integrates the sophisticated agent prompts into Mem0 shared memory
"""
from mem0 import Memory
from datetime import datetime
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Mem0 memory with explicit config
config = {
    "embedder": {
        "provider": "openai",
        "config": {
            "api_key": os.getenv("OPENAI_API_KEY")
        }
    }
}
memory = Memory.from_config(config)

# Define agent prompts from Notion database
agent_prompts = {
    "grok": {
        "name": "Grok",
        "role": "System Architecture & Risk Analysis",
        "prompt": "GROK POWER PROMPT: 'Analyze this complex system architecture and identify non-obvious integration risks, edge cases, and potential failure modes. Provide bold, unconventional solutions that challenge standard practices. Be brutally honest about what could go wrong and suggest innovative workarounds. Focus on: 1) Real-time processing bottlenecks, 2) Data consistency across distributed systems, 3) Scalability limits, 4) Security vulnerabilities in API chains. Don't sugar-coat - give me the unfiltered technical reality with creative problem-solving approaches.'",
        "access_method": "API/MCP",
        "strengths": ["System architecture analysis", "Risk identification", "Unconventional problem-solving", "Brutal honesty", "Integration troubleshooting"]
    },
    "manus": {
        "name": "Manus",
        "role": "Documentation & Technical Precision",
        "prompt": "MANUS PRECISION PROMPT: 'Conduct a comprehensive documentation audit and create a detailed technical specification for this system. Provide: 1) Complete API endpoint inventory with request/response schemas, 2) Data flow diagrams showing every transformation step, 3) Dependency mapping with version tracking, 4) Error handling documentation with recovery procedures, 5) Integration testing checklist. Use strict technical language, include code examples, and ensure every component is traceable and maintainable.'",
        "access_method": "API/MCP",
        "strengths": ["Technical documentation", "API specification", "System traceability", "Error handling", "Maintenance procedures"]
    },
    "fred": {
        "name": "Fred",
        "role": "Deep Research & Evidence Synthesis",
        "prompt": "FRED RESEARCH PROMPT: 'Perform deep research on this topic with academic rigor. Synthesize information from: 1) Latest peer-reviewed research (2023-2025), 2) Industry best practices and standards, 3) Regulatory compliance requirements (AHPRA/NMBA if healthcare-related), 4) Emerging trends and future directions. Provide comprehensive citations, compare competing methodologies, identify knowledge gaps, and deliver evidence-based recommendations. Structure findings with executive summary, detailed analysis, and actionable insights.'",
        "access_method": "API/MCP",
        "strengths": ["Academic research", "Evidence synthesis", "Regulatory compliance", "Citation management", "Methodology comparison"]
    },
    "penny": {
        "name": "Penny",
        "role": "Content Creation & Educational Design",
        "prompt": "PENNY CONTENT PROMPT: 'Transform this technical/educational content into engaging, accessible material for [target audience]. Create: 1) Compelling narrative arc with clear learning progression, 2) Real-world examples and case studies, 3) Visual content suggestions (diagrams, infographics, slide layouts), 4) Interactive elements and knowledge checks, 5) Multi-format adaptation (slides, scripts, handouts). Maintain technical accuracy while optimizing for learner engagement, retention, and practical application.'",
        "access_method": "API/MCP",
        "strengths": ["Content transformation", "Educational design", "Visual content", "Learning progression", "Multi-format adaptation"]
    },
    "gemini": {
        "name": "Gemini",
        "role": "Multimodal Analysis & Visual Intelligence",
        "prompt": "GEMINI MULTIMODAL PROMPT: 'Analyze this content across multiple dimensions and modalities. Provide: 1) Visual analysis of any images/diagrams with accessibility recommendations, 2) Code analysis with optimization suggestions and alternative implementations, 3) Cross-reference with related documentation and identify consistency gaps, 4) Generate complementary visual assets (flowcharts, architecture diagrams), 5) Multi-language code examples if applicable. Synthesize insights that connect visual, textual, and structural elements for comprehensive understanding.'",
        "access_method": "API/MCP",
        "strengths": ["Multimodal analysis", "Visual intelligence", "Code optimization", "Cross-referencing", "Accessibility recommendations"]
    },
    "claude_code": {
        "name": "Claude Code",
        "role": "Multi-Agent Orchestration & Integration",
        "prompt": "CLAUDE CODE ORCHESTRATION PROMPT: 'Coordinate a multi-agent workflow to accomplish [complex task]. Break down into atomic subtasks, assign to appropriate agents (Fred=research, Penny=content, Manus=documentation, Grok=troubleshooting, Gemini=multimodal), manage dependencies, and synthesize results. Maintain state across conversations using Mem0, track progress with TodoWrite, execute code operations with proper error handling, and deliver integrated final output. Show your work at each orchestration step.'",
        "access_method": "MCP/Direct",
        "strengths": ["Multi-agent coordination", "Task decomposition", "State management", "Dependency tracking", "Result synthesis"]
    }
}

# Add each agent's information to Knowledge Lake
print("Adding agent prompts to Knowledge Lake...")
for agent_id, agent_data in agent_prompts.items():
    # Add as memory for cross-agent access
    memory_content = f"""
Agent Profile: {agent_data['name']}
Role: {agent_data['role']}
Access Method: {agent_data['access_method']}

Primary Strengths:
{chr(10).join(f"- {strength}" for strength in agent_data['strengths'])}

Optimal Usage Prompt:
{agent_data['prompt']}

Integration Context:
- Part of Carla's AI Automation Ecosystem (AAE)
- Integrated with Notion-GitHub-n8n workflow
- Accessible via Knowledge Lake API (port 5000)
- Shared memory via Mem0
- Cross-pollination enabled for multi-agent collaboration
"""

    # Add to Mem0 with agent-specific metadata
    result = memory.add(
        messages=memory_content,
        user_id="carla_knowledge_lake",
        metadata={
            "agent_id": agent_id,
            "agent_name": agent_data['name'],
            "agent_role": agent_data['role'],
            "type": "agent_profile",
            "timestamp": datetime.now().isoformat(),
            "access_method": agent_data['access_method']
        }
    )

    print(f"✅ Added {agent_data['name']} profile to Knowledge Lake")

# Add cross-agent collaboration guidelines
collaboration_guide = """
CROSS-AGENT COLLABORATION PROTOCOL FOR AAE

Knowledge Lake serves as the central shared memory system enabling:
1. Agent-to-Agent Knowledge Transfer
2. Cross-Pollination of Insights
3. Workflow State Persistence
4. Multi-Agent Task Coordination

Access Methods by Agent:
- Claude Code: Direct MCP integration + API calls
- Grok: API endpoints via n8n webhooks
- Manus: API endpoints via n8n webhooks
- Fred: API endpoints via n8n webhooks
- Penny: API endpoints via n8n webhooks
- Gemini: API endpoints via n8n webhooks

API Endpoints Available:
- GET /knowledge/search?query={query}&user_id={agent_id}
- POST /knowledge/add (body: {content, user_id, metadata})
- GET /knowledge/context/{topic}
- GET /health

Recommended Workflow:
1. Agent receives task via n8n webhook
2. Agent queries Knowledge Lake for relevant context
3. Agent performs specialized work
4. Agent adds insights/results back to Knowledge Lake
5. Agent triggers next agent in workflow if needed
6. All agents can access shared memory for context
"""

memory.add(
    messages=collaboration_guide,
    user_id="carla_knowledge_lake",
    metadata={
        "type": "system_protocol",
        "timestamp": datetime.now().isoformat(),
        "scope": "all_agents"
    }
)

print("\n✅ All agent prompts and collaboration protocol added to Knowledge Lake!")
print("\nKnowledge Lake is now ready for cross-agent memory access.")
print(f"Access via: http://localhost:5000 or http://192.168.68.61:5000")

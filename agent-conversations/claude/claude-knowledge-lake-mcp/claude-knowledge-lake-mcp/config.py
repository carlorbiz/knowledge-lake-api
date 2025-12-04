"""
Configuration for Claude Knowledge Lake MCP Server
Part of Carla's AI Automation Ecosystem (AAE)
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Knowledge Lake API Configuration
KNOWLEDGE_LAKE_BASE_URL = os.getenv(
    "KNOWLEDGE_LAKE_BASE_URL", 
    "http://localhost:5002"  # Local development default
)

# Production Railway URL (update when deployed)
# KNOWLEDGE_LAKE_BASE_URL = "https://your-knowledge-lake.up.railway.app"

# User ID for Carla's account (always 1 as per API spec)
DEFAULT_USER_ID = 1

# Agent identifier for Claude conversations
AGENT_NAME = "Claude"

# API timeouts (seconds)
REQUEST_TIMEOUT = 30
CONNECT_TIMEOUT = 10

# Entity types available in Knowledge Lake
ENTITY_TYPES = [
    "Agents",           # AI assistants, bots, automation
    "Technology",       # Tools, platforms, software
    "ExecutiveAI",      # AI leadership, strategy, governance
    "Content",          # Documents, courses, materials
    "Consulting",       # Business processes, methodologies
    "ClientIntelligence" # Client insights, feedback, needs
]

# Relationship types available
RELATIONSHIP_TYPES = [
    "uses",
    "integrates_with",
    "requires",
    "discusses",
    "approves",
    "implements"
]

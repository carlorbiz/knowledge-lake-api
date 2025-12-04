"""
Pydantic Models for Claude Knowledge Lake MCP
Data validation and schema definitions

Part of Carla's AI Automation Ecosystem (AAE)
"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import date


class EntityType(str, Enum):
    """Valid entity types for Knowledge Lake."""
    AGENTS = "Agents"
    TECHNOLOGY = "Technology"
    EXECUTIVE_AI = "ExecutiveAI"
    CONTENT = "Content"
    CONSULTING = "Consulting"
    CLIENT_INTELLIGENCE = "ClientIntelligence"


class RelationshipType(str, Enum):
    """Valid relationship types for Knowledge Lake."""
    USES = "uses"
    INTEGRATES_WITH = "integrates_with"
    REQUIRES = "requires"
    DISCUSSES = "discusses"
    APPROVES = "approves"
    IMPLEMENTS = "implements"


class ResponseFormat(str, Enum):
    """Output format for tool responses."""
    MARKDOWN = "markdown"
    JSON = "json"


class Entity(BaseModel):
    """An entity extracted from a conversation."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra='forbid'
    )
    
    name: str = Field(
        ..., 
        description="Name of the entity (e.g., 'Claude', 'n8n', 'AAE Dashboard')",
        min_length=1,
        max_length=200
    )
    entityType: EntityType = Field(
        ...,
        description="Type classification: Agents, Technology, ExecutiveAI, Content, Consulting, ClientIntelligence"
    )
    confidence: float = Field(
        default=0.85,
        description="Confidence score for this entity extraction (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )
    description: str = Field(
        ...,
        description="Brief description of the entity",
        min_length=1,
        max_length=500
    )
    sourceContext: str = Field(
        ...,
        description="Where/how this entity appeared in the conversation",
        min_length=1,
        max_length=500
    )


class Relationship(BaseModel):
    """A relationship between two entities."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra='forbid'
    )
    
    fromEntity: str = Field(
        ...,
        alias="from",
        description="Source entity name",
        min_length=1,
        max_length=200
    )
    toEntity: str = Field(
        ...,
        alias="to",
        description="Target entity name",
        min_length=1,
        max_length=200
    )
    relationshipType: RelationshipType = Field(
        ...,
        description="Type of relationship: uses, integrates_with, requires, discusses, approves, implements"
    )
    weight: int = Field(
        default=5,
        description="Strength of relationship (1-10, where 10 is critical dependency)",
        ge=1,
        le=10
    )
    confidence: float = Field(
        default=0.80,
        description="Confidence score for this relationship (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )


class ConversationMetadata(BaseModel):
    """Metadata for a conversation being ingested."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra='allow'  # Allow additional metadata fields
    )
    
    processingAgent: str = Field(
        default="Claude",
        description="Which agent processed this conversation"
    )
    businessArea: Optional[str] = Field(
        default=None,
        description="Business area: CARLORBIZ, MTMOT, AAE Development, etc."
    )
    qualityRating: Optional[str] = Field(
        default=None,
        description="Quality rating if known"
    )
    sourceUrl: Optional[str] = Field(
        default=None,
        description="URL to original conversation if available"
    )


class IngestConversationInput(BaseModel):
    """Input model for ingesting a conversation into Knowledge Lake."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra='forbid'
    )
    
    topic: str = Field(
        ...,
        description="Brief topic or title for the conversation (e.g., 'AAE Knowledge Lake MCP Development')",
        min_length=1,
        max_length=300
    )
    content: str = Field(
        ...,
        description="Full conversation content or summary to store",
        min_length=1,
        max_length=50000
    )
    conversation_date: Optional[str] = Field(
        default=None,
        description="Date of conversation in YYYY-MM-DD format. Defaults to today if not provided.",
        pattern=r'^\d{4}-\d{2}-\d{2}$'
    )
    entities: Optional[List[Entity]] = Field(
        default_factory=list,
        description="List of entities extracted from the conversation",
        max_length=50
    )
    relationships: Optional[List[Relationship]] = Field(
        default_factory=list,
        description="List of relationships between entities",
        max_length=100
    )
    metadata: Optional[ConversationMetadata] = Field(
        default=None,
        description="Additional metadata about the conversation"
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for structured"
    )


class QueryKnowledgeLakeInput(BaseModel):
    """Input model for querying the Knowledge Lake."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra='forbid'
    )
    
    query: str = Field(
        ...,
        description="Search query to find relevant conversations and entities",
        min_length=1,
        max_length=500
    )
    agent_filter: Optional[str] = Field(
        default=None,
        description="Filter by agent name (e.g., 'Manus', 'Fred', 'Claude Code')"
    )
    entity_type_filter: Optional[EntityType] = Field(
        default=None,
        description="Filter by entity type"
    )
    limit: int = Field(
        default=20,
        description="Maximum number of results to return",
        ge=1,
        le=100
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for structured"
    )


class GetStatsInput(BaseModel):
    """Input model for getting Knowledge Lake statistics."""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        extra='forbid'
    )
    
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Output format: 'markdown' for human-readable or 'json' for structured"
    )


# Response models for type safety
class IngestResponse(BaseModel):
    """Response from a successful ingestion."""
    success: bool
    conversation_id: int
    entities_created: int
    relationships_created: int
    timestamp: str


class StatsResponse(BaseModel):
    """Response from stats endpoint."""
    total_conversations: int
    total_entities: int
    total_relationships: int
    conversations_by_agent: Dict[str, int]
    entity_type_distribution: Dict[str, int]

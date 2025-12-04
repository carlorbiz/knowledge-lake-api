"""
Claude Knowledge Lake MCP Server
Enables Claude to directly interact with Carla's AAE Knowledge Lake

Part of Carla's AI Automation Ecosystem (AAE)

Tools provided:
- knowledge_lake_ingest: Push conversation to Knowledge Lake in real-time
- knowledge_lake_query: Search for context from other council members
- knowledge_lake_stats: Get statistics and verify connection

Usage:
    # stdio transport (local)
    python server.py
    
    # HTTP transport (remote/Railway)
    python server.py --http --port 8080
"""

import sys
import json
import argparse
from datetime import datetime
from typing import Optional, List

from mcp.server.fastmcp import FastMCP

from models import (
    IngestConversationInput,
    QueryKnowledgeLakeInput,
    GetStatsInput,
    Entity,
    Relationship,
    ResponseFormat
)
from knowledge_lake import (
    KnowledgeLakeClient,
    KnowledgeLakeError,
    format_ingest_result_markdown,
    format_query_result_markdown,
    format_stats_markdown
)
from config import KNOWLEDGE_LAKE_BASE_URL, AGENT_NAME


# Initialise the MCP server
mcp = FastMCP("knowledge_lake_mcp")

# Create the Knowledge Lake client
client = KnowledgeLakeClient()


@mcp.tool(
    name="knowledge_lake_ingest",
    annotations={
        "title": "Ingest Conversation to Knowledge Lake",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True
    }
)
async def knowledge_lake_ingest(params: IngestConversationInput) -> str:
    """
    Ingest a conversation or insight into Carla's Knowledge Lake.
    
    Use this tool to capture valuable conversations, insights, and learnings
    in real-time during your session with Claude. The content will be stored
    in the Knowledge Lake and made available for cross-council queries.
    
    Args:
        params (IngestConversationInput): Validated input parameters containing:
            - topic (str): Brief topic/title for the conversation
            - content (str): Full content or summary to store
            - conversation_date (Optional[str]): Date in YYYY-MM-DD format
            - entities (Optional[List[Entity]]): Extracted entities
            - relationships (Optional[List[Relationship]]): Entity relationships
            - metadata (Optional[ConversationMetadata]): Additional metadata
            - response_format (ResponseFormat): Output format (markdown/json)
    
    Returns:
        str: Ingestion result with conversation ID and creation stats
    
    Example:
        Ingest a conversation about building an MCP:
        {
            "topic": "Claude-Knowledge Lake MCP Development",
            "content": "Built a custom MCP server to enable real-time...",
            "entities": [
                {"name": "Knowledge Lake", "entityType": "Technology", 
                 "confidence": 0.95, "description": "AAE central data store",
                 "sourceContext": "Main integration target"}
            ]
        }
    """
    try:
        # Convert Pydantic models to dicts for API
        entities_data = None
        if params.entities:
            entities_data = [
                {
                    "name": e.name,
                    "entityType": e.entityType.value,
                    "confidence": e.confidence,
                    "description": e.description,
                    "sourceContext": e.sourceContext
                }
                for e in params.entities
            ]
        
        relationships_data = None
        if params.relationships:
            relationships_data = [
                {
                    "from": r.fromEntity,
                    "to": r.toEntity,
                    "relationshipType": r.relationshipType.value,
                    "weight": r.weight,
                    "confidence": r.confidence
                }
                for r in params.relationships
            ]
        
        metadata_data = None
        if params.metadata:
            metadata_data = params.metadata.model_dump(exclude_none=True)
        
        # Call the Knowledge Lake API
        result = await client.ingest_conversation(
            topic=params.topic,
            content=params.content,
            conversation_date=params.conversation_date,
            entities=entities_data,
            relationships=relationships_data,
            metadata=metadata_data
        )
        
        # Format response based on requested format
        if params.response_format == ResponseFormat.JSON:
            return json.dumps(result, indent=2)
        else:
            return format_ingest_result_markdown(result)
            
    except KnowledgeLakeError as e:
        error_msg = f"Knowledge Lake Error: {e.message}"
        if e.status_code:
            error_msg += f" (HTTP {e.status_code})"
        
        # Provide helpful guidance
        if "connect" in e.message.lower():
            error_msg += "\n\n**Troubleshooting:**\n"
            error_msg += "1. Check if Knowledge Lake API is running: `curl http://localhost:5002/health`\n"
            error_msg += "2. For Railway deployment, verify the URL in config.py\n"
            error_msg += "3. Check network connectivity"
        
        return error_msg
    except Exception as e:
        return f"Unexpected error during ingestion: {str(e)}"


@mcp.tool(
    name="knowledge_lake_query",
    annotations={
        "title": "Query Knowledge Lake",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def knowledge_lake_query(params: QueryKnowledgeLakeInput) -> str:
    """
    Search the Knowledge Lake for relevant conversations, entities, and context.
    
    Use this tool to retrieve context from conversations with other AI council
    members (Manus, Fred, Claude Code, Gemini, etc.). This enables Claude to
    build on work done in other sessions and maintain continuity across the AAE.
    
    Args:
        params (QueryKnowledgeLakeInput): Validated input parameters containing:
            - query (str): Search query to find relevant content
            - agent_filter (Optional[str]): Filter by agent name
            - entity_type_filter (Optional[EntityType]): Filter by entity type
            - limit (int): Maximum results to return (default 20)
            - response_format (ResponseFormat): Output format (markdown/json)
    
    Returns:
        str: Search results with matching conversations and entities
    
    Example:
        Find context about the AAE Dashboard:
        {"query": "AAE Dashboard architecture", "agent_filter": "Fred"}
        
        Find all n8n workflow discussions:
        {"query": "n8n workflows automation", "entity_type_filter": "Technology"}
    """
    try:
        entity_filter = None
        if params.entity_type_filter:
            entity_filter = params.entity_type_filter.value
        
        result = await client.query_conversations(
            query=params.query,
            agent_filter=params.agent_filter,
            entity_type_filter=entity_filter,
            limit=params.limit
        )
        
        if params.response_format == ResponseFormat.JSON:
            return json.dumps(result, indent=2)
        else:
            return format_query_result_markdown(result)
            
    except KnowledgeLakeError as e:
        error_msg = f"Knowledge Lake Query Error: {e.message}"
        if "connect" in e.message.lower():
            error_msg += "\n\n*Knowledge Lake may be offline. Check API status.*"
        return error_msg
    except Exception as e:
        return f"Unexpected error during query: {str(e)}"


@mcp.tool(
    name="knowledge_lake_stats",
    annotations={
        "title": "Get Knowledge Lake Statistics",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def knowledge_lake_stats(params: GetStatsInput) -> str:
    """
    Get statistics about the Knowledge Lake and verify API connectivity.
    
    Use this tool to:
    - Verify the Knowledge Lake API is accessible
    - See total conversation and entity counts
    - View distribution of content by agent and entity type
    
    Args:
        params (GetStatsInput): Validated input parameters containing:
            - response_format (ResponseFormat): Output format (markdown/json)
    
    Returns:
        str: Statistics including totals and distributions
    
    Example:
        {"response_format": "markdown"}
    """
    try:
        # First check health
        try:
            health = await client.check_health()
            health_status = f"✅ API Status: {health.get('status', 'unknown')} (v{health.get('version', 'unknown')})"
        except Exception:
            health_status = "⚠️ Could not verify API health"
        
        # Get stats
        result = await client.get_stats()
        
        if params.response_format == ResponseFormat.JSON:
            return json.dumps({
                "health": health_status,
                "stats": result
            }, indent=2)
        else:
            output = format_stats_markdown(result)
            return f"{health_status}\n\n{output}"
            
    except KnowledgeLakeError as e:
        error_msg = f"Knowledge Lake Stats Error: {e.message}"
        if "connect" in e.message.lower():
            error_msg += f"\n\n**Connection Details:**\n"
            error_msg += f"- Target URL: {KNOWLEDGE_LAKE_BASE_URL}\n"
            error_msg += "- Ensure the API is running locally or Railway URL is correct"
        return error_msg
    except Exception as e:
        return f"Unexpected error getting stats: {str(e)}"


def main():
    """Run the MCP server."""
    parser = argparse.ArgumentParser(
        description="Claude Knowledge Lake MCP Server"
    )
    parser.add_argument(
        "--http",
        action="store_true",
        help="Use HTTP transport instead of stdio"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8080,
        help="Port for HTTP transport (default: 8080)"
    )
    
    args = parser.parse_args()
    
    if args.http:
        # HTTP transport for remote deployment
        print(f"Starting Knowledge Lake MCP server on HTTP port {args.port}...", 
              file=sys.stderr)
        mcp.run(transport="streamable_http", port=args.port)
    else:
        # stdio transport for local use
        print("Starting Knowledge Lake MCP server (stdio)...", file=sys.stderr)
        mcp.run()


if __name__ == "__main__":
    main()

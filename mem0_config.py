"""
Mem0 configuration for Railway deployment
Uses environment variables to configure memory backend
"""
import os

def get_mem0_config():
    """
    Get mem0 configuration based on environment
    Railway: Use in-memory vector store (ephemeral)
    Local: Use qdrant (persistent)
    """
    is_railway = os.environ.get('RAILWAY_ENVIRONMENT') is not None

    if is_railway:
        # Railway: Use simple in-memory store
        return {
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "collection_name": "knowledge_lake",
                    "host": "memory",  # In-memory mode
                }
            }
        }
    else:
        # Local: Use persistent qdrant
        return {
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "collection_name": "knowledge_lake",
                    "path": "./qdrant_data",
                }
            }
        }

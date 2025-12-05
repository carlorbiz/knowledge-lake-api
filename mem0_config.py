"""
Mem0 configuration for Railway deployment
Uses environment variables to configure memory backend
"""
import os

def get_mem0_config():
    """
    Get mem0 configuration based on environment
    For mem0ai v0.1.115, use simplified config structure
    Railway: Use defaults (Qdrant in-memory)
    Local: Use defaults (Qdrant in-memory)
    """
    # mem0ai 0.1.115 uses default Qdrant in-memory when no config provided
    # This is perfect for Railway ephemeral storage
    return None  # Use defaults

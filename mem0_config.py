"""
Mem0 configuration for Railway deployment
Uses environment variables to configure memory backend
"""
import os

def get_mem0_config():
    """
    Railway: fall back to default mem0 storage to avoid signature mismatch.
    """
    return {}  # no vector_store kwargs; let mem0 use its bundled defaults

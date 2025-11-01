"""
Knowledge Lake API - Production Server with Waitress
Runs on port 5002 locally, or uses Railway's PORT environment variable in production
"""

from waitress import serve
from api_server import app
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

if __name__ == '__main__':
    # Use Railway's PORT if available, otherwise default to 5002
    port = int(os.environ.get('PORT', 5002))

    # Detect environment
    is_railway = os.environ.get('RAILWAY_ENVIRONMENT') is not None
    env_name = "Railway (Production)" if is_railway else "Local Development"

    logger.info("=" * 60)
    logger.info(f"🚀 Starting Knowledge Lake API - {env_name}")
    logger.info(f"📍 Port: {port}")
    logger.info(f"📍 Health check: http://localhost:{port}/health")
    logger.info(f"🔍 Search endpoint: http://localhost:{port}/knowledge/search?query=test")
    logger.info(f"➕ Add endpoint: POST http://localhost:{port}/knowledge/add")
    logger.info("=" * 60)

    # Serve with Waitress (production-ready WSGI server)
    serve(app, host='0.0.0.0', port=port, threads=4)

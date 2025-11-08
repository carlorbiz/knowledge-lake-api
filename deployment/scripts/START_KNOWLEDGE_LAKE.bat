@echo off
echo.
echo ========================================
echo  Knowledge Lake API Server
echo ========================================
echo.
echo Starting on port 5002...
echo.
echo Health check will be at:
echo   http://localhost:5002/health
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python start_knowledge_lake.py

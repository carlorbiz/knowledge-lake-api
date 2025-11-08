@echo off
echo Starting Knowledge Lake Production Server...
cd /d "C:\Users\carlo\Development\mem0-sync\mem0"

REM Kill any existing Flask dev servers
taskkill /f /im python.exe /fi "WINDOWTITLE eq *simple_api_server*" 2>nul

REM Start Waitress production server (Windows compatible)
echo Starting Waitress production server on port 5000...
python -m waitress --host=0.0.0.0 --port=5000 --threads=4 --connection-limit=1000 --cleanup-interval=30 simple_api_server:app

pause
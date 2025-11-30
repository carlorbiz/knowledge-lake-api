@echo off
echo Monitoring Railway deployment...
echo.
echo Press Ctrl+C to stop
echo.

:loop
curl -s https://knowledge-lake-api-production.up.railway.app/health
echo.
echo Checking again in 10 seconds...
echo.
timeout /t 10 /nobreak > nul
goto loop

@echo off
echo.
echo ================================================
echo   Executive AI Advisor - Quick Test
echo ================================================
echo.

:: Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please copy .env.example to .env and add your API keys:
    echo.
    echo   1. Copy .env.example to .env
    echo   2. Add GEMINI_API_KEY from https://aistudio.google.com/apikey
    echo   3. Add SUPABASE credentials from supabase.com
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Testing real-time search component...
echo.
node test-search.mjs

echo.
if errorlevel 1 (
    echo [FAILED] Tests failed. Check your API keys.
) else (
    echo [SUCCESS] All tests passed! Backend is ready.
    echo.
    echo Next step: Start the dev server with 'npm run dev'
)
echo.
pause

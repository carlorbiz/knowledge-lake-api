@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo Claude Desktop MCP Config Generator
echo ========================================
echo.

REM Step 1: Find Python executable
echo [1/5] Detecting Python installation...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found in PATH
    echo Please install Python or add it to your PATH
    exit /b 1
)

for /f "tokens=*" %%i in ('where python') do (
    set PYTHON_PATH=%%i
    goto :found_python
)
:found_python
echo    Found: %PYTHON_PATH%

REM Step 2: Find mem0-sync repo location
echo.
echo [2/5] Detecting mem0-sync repository location...
set "CURRENT_DIR=%~dp0"
set "SEARCH_DIR=%CURRENT_DIR%"

REM Navigate up to find mem0-sync root
:find_repo
if exist "%SEARCH_DIR%\mem0" (
    set "REPO_ROOT=%SEARCH_DIR%"
    goto :found_repo
)
REM Go up one directory
for %%i in ("%SEARCH_DIR%..") do set "SEARCH_DIR=%%~fi"
REM Check if we've reached root
if "%SEARCH_DIR:~-1%"=="\" (
    if "%SEARCH_DIR%"=="%SEARCH_DIR:~0,3%" (
        echo ERROR: Could not find mem0-sync repository
        echo Please run this script from within the mem0-sync directory
        exit /b 1
    )
)
goto :find_repo

:found_repo
echo    Found: %REPO_ROOT%

REM Step 3: Verify MCP server file exists
echo.
echo [3/5] Verifying MCP server files...
set "SERVER_PATH=%REPO_ROOT%\mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude-knowledge-lake-mcp\server.py"
if not exist "%SERVER_PATH%" (
    echo ERROR: MCP server not found at:
    echo %SERVER_PATH%
    exit /b 1
)
echo    Found: server.py

REM Step 4: Generate config file
echo.
echo [4/5] Generating claude_desktop_config.json...
set "CONFIG_FILE=%REPO_ROOT%\mem0\agent-conversations\claude\claude-knowledge-lake-mcp\claude_desktop_config.json"

REM Escape backslashes for JSON
set "PYTHON_PATH_JSON=%PYTHON_PATH:\=\\%"
set "SERVER_PATH_JSON=%SERVER_PATH:\=\\%"

REM Create config file
(
echo {
echo   "mcpServers": {
echo     "knowledge-lake": {
echo       "command": "%PYTHON_PATH_JSON%",
echo       "args": [
echo         "%SERVER_PATH_JSON%"
echo       ],
echo       "env": {
echo         "KNOWLEDGE_LAKE_BASE_URL": "https://knowledge-lake-api-production.up.railway.app"
echo       }
echo     }
echo   },
echo   "preferences": {
echo     "chromeExtensionEnabled": true
echo   }
echo }
) > "%CONFIG_FILE%"

echo    Generated: %CONFIG_FILE%

REM Step 5: Show installation instructions
echo.
echo [5/5] Installation Instructions
echo ========================================
echo.
echo Config file created at:
echo %CONFIG_FILE%
echo.
echo To activate in Claude Desktop:
echo.
echo 1. Copy the config file to Claude Desktop's config directory:
echo    %APPDATA%\Claude\claude_desktop_config.json
echo.
echo 2. Or run this command to copy automatically:
echo    copy "%CONFIG_FILE%" "%APPDATA%\Claude\claude_desktop_config.json"
echo.
echo 3. Restart Claude Desktop to activate the MCP server
echo.
echo Available MCP Tools (5 total):
echo   - knowledge_lake_query (search conversations)
echo   - knowledge_lake_stats (get statistics)
echo   - knowledge_lake_ingest (add conversations)
echo   - knowledge_lake_extract_learning (extract 7-dimension learnings)
echo   - knowledge_lake_archive (archive processed conversations)
echo.
echo ========================================
echo.

REM Ask if user wants to copy automatically
set /p COPY_NOW="Copy to Claude Desktop config now? (y/n): "
if /i "%COPY_NOW%"=="y" (
    if not exist "%APPDATA%\Claude" (
        echo Creating Claude config directory...
        mkdir "%APPDATA%\Claude"
    )

    if exist "%APPDATA%\Claude\claude_desktop_config.json" (
        echo.
        echo WARNING: Existing config file found!
        set /p BACKUP="Create backup before overwriting? (y/n): "
        if /i "!BACKUP!"=="y" (
            set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
            set TIMESTAMP=!TIMESTAMP: =0!
            copy "%APPDATA%\Claude\claude_desktop_config.json" "%APPDATA%\Claude\claude_desktop_config.json.backup_!TIMESTAMP!"
            echo Backup created: claude_desktop_config.json.backup_!TIMESTAMP!
        )
    )

    copy "%CONFIG_FILE%" "%APPDATA%\Claude\claude_desktop_config.json"
    echo.
    echo ✅ Config file copied successfully!
    echo Please restart Claude Desktop to activate the MCP server.
) else (
    echo.
    echo Config file ready at:
    echo %CONFIG_FILE%
    echo Copy it manually when ready.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
pause

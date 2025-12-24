@echo off
REM Quick migration script for Railway PostgreSQL
REM Usage: Paste your DATABASE_URL when prompted

echo ========================================
echo Railway PostgreSQL Migration
echo ========================================
echo.
echo Please paste your DATABASE_URL from Railway Connect button:
echo (Example: postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway)
echo.

set /p DATABASE_URL="DATABASE_URL: "

echo.
echo Running migration...
echo.

psql "%DATABASE_URL%" -f scripts/migrations/001_add_classification_columns.sql

echo.
echo ========================================
echo Migration complete!
echo ========================================
echo.
echo Columns added:
echo - complexity_classification
echo - requires_multipass
echo - multipass_status
echo - multipass_assignee
echo - word_count
echo - topic_shift_count
echo - complexity_score
echo.
echo Indexes created for efficient querying.
echo.
pause

# CC Slack Integration - Setup Validator
# Checks that all components are properly configured

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "CC SLACK INTEGRATION - SETUP VALIDATOR" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check 1: Notion Database ID in check-inbox.py
Write-Host "[1/8] Checking Notion database configuration..." -ForegroundColor Yellow
$checkInboxPath = ".\check-inbox.py"
if (Test-Path $checkInboxPath) {
    $content = Get-Content $checkInboxPath -Raw
    if ($content -match 'CC_INBOX_DB_ID = "YOUR_CC_INBOX_DATABASE_ID"') {
        Write-Host "  ❌ ERROR: Notion database ID not configured in check-inbox.py" -ForegroundColor Red
        Write-Host "     Update CC_INBOX_DB_ID with your actual database ID" -ForegroundColor Gray
        $errors++
    } else {
        Write-Host "  ✅ Notion database ID configured" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ ERROR: check-inbox.py not found" -ForegroundColor Red
    $errors++
}

# Check 2: Notion API Key environment variable
Write-Host "[2/8] Checking Notion API key..." -ForegroundColor Yellow
$notionKey = $env:NOTION_API_KEY
if ([string]::IsNullOrEmpty($notionKey)) {
    Write-Host "  ⚠️  WARNING: NOTION_API_KEY environment variable not set" -ForegroundColor Yellow
    Write-Host "     Set it or update check-inbox.py with your key" -ForegroundColor Gray
    $warnings++
} else {
    Write-Host "  ✅ NOTION_API_KEY environment variable set" -ForegroundColor Green
}

# Check 3: Python availability
Write-Host "[3/8] Checking Python installation..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ Python available: $pythonVersion" -ForegroundColor Green

    # Check for requests library
    $requestsCheck = python -c "import requests" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Python 'requests' library installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  WARNING: Python 'requests' library not installed" -ForegroundColor Yellow
        Write-Host "     Run: pip install requests" -ForegroundColor Gray
        $warnings++
    }
} else {
    Write-Host "  ❌ ERROR: Python not found in PATH" -ForegroundColor Red
    $errors++
}

# Check 4: Claude Code CLI availability
Write-Host "[4/8] Checking Claude Code CLI..." -ForegroundColor Yellow
if (Get-Command claude -ErrorAction SilentlyContinue) {
    Write-Host "  ✅ Claude Code CLI available" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Claude Code CLI not found" -ForegroundColor Red
    Write-Host "     Make sure 'claude' command is in your PATH" -ForegroundColor Gray
    $errors++
}

# Check 5: Task Scheduler setup
Write-Host "[5/8] Checking Task Scheduler..." -ForegroundColor Yellow
$task = Get-ScheduledTask -TaskName "CC Wake Check" -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "  ✅ Task Scheduler configured" -ForegroundColor Green
    Write-Host "     State: $($task.State)" -ForegroundColor Gray
    if ($task.State -ne "Ready") {
        Write-Host "  ⚠️  WARNING: Task is not in Ready state" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  ⚠️  WARNING: Task Scheduler not configured" -ForegroundColor Yellow
    Write-Host "     Run: .\setup-task-scheduler.ps1 (as Administrator)" -ForegroundColor Gray
    $warnings++
}

# Check 6: n8n workflow file
Write-Host "[6/8] Checking n8n workflow..." -ForegroundColor Yellow
$workflowPath = ".\n8n-workflow-slack-to-notion-cc-inbox.json"
if (Test-Path $workflowPath) {
    Write-Host "  ✅ n8n workflow file exists" -ForegroundColor Green
    $workflow = Get-Content $workflowPath | ConvertFrom-Json

    # Check if database ID is configured
    $hasPlaceholder = $false
    $workflow.nodes | ForEach-Object {
        if ($_.parameters.databaseId -eq "YOUR_CC_INBOX_DATABASE_ID") {
            $hasPlaceholder = $true
        }
    }

    if ($hasPlaceholder) {
        Write-Host "  ⚠️  WARNING: Workflow has placeholder database ID" -ForegroundColor Yellow
        Write-Host "     Import into n8n and configure with actual database ID" -ForegroundColor Gray
        $warnings++
    }
} else {
    Write-Host "  ❌ ERROR: n8n workflow file not found" -ForegroundColor Red
    $errors++
}

# Check 7: Required PowerShell scripts
Write-Host "[7/8] Checking PowerShell scripts..." -ForegroundColor Yellow
$requiredScripts = @(
    "cc-wake-check.ps1",
    "setup-task-scheduler.ps1"
)
$allScriptsPresent = $true
foreach ($script in $requiredScripts) {
    if (!(Test-Path ".\$script")) {
        Write-Host "  ❌ ERROR: Missing $script" -ForegroundColor Red
        $allScriptsPresent = $false
        $errors++
    }
}
if ($allScriptsPresent) {
    Write-Host "  ✅ All required PowerShell scripts present" -ForegroundColor Green
}

# Check 8: n8n availability
Write-Host "[8/8] Checking n8n server..." -ForegroundColor Yellow
try {
    $n8nResponse = Invoke-WebRequest -Uri "http://localhost:5678" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "  ✅ n8n server is running on localhost:5678" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  WARNING: n8n server not accessible on localhost:5678" -ForegroundColor Yellow
    Write-Host "     Make sure n8n is running" -ForegroundColor Gray
    $warnings++
}

# Summary
Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed! System is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create CC Inbox database in Notion" -ForegroundColor White
    Write-Host "2. Import n8n workflow and configure credentials" -ForegroundColor White
    Write-Host "3. Test with: 'CC — test message' in Slack" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Setup has $warnings warning(s) but no critical errors" -ForegroundColor Yellow
    Write-Host "   Review warnings above and address as needed" -ForegroundColor Gray
} else {
    Write-Host "❌ Setup has $errors error(s) and $warnings warning(s)" -ForegroundColor Red
    Write-Host "   Fix errors above before proceeding" -ForegroundColor Gray
}

Write-Host ""
Write-Host "For detailed setup instructions, see README.md" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

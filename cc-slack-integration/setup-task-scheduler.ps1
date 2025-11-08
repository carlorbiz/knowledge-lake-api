# Setup Windows Task Scheduler for CC Wake Checks
# Run this script as Administrator ONCE to set up the scheduled task

$taskName = "CC Wake Check"
$scriptPath = "C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration\cc-wake-check.ps1"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again."
    exit 1
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

# Create the trigger (every 5 minutes)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -MultipleInstances IgnoreNew

# Get current user
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

# Register the task
Write-Host "Creating scheduled task: $taskName" -ForegroundColor Green
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -User $currentUser `
    -RunLevel Highest `
    -Description "Checks Notion CC Inbox for wake flags every 5 minutes and launches Claude Code if needed"

Write-Host "`nTask created successfully!" -ForegroundColor Green
Write-Host "The task will run every 5 minutes starting now." -ForegroundColor Cyan
Write-Host "`nTo view the task:" -ForegroundColor Yellow
Write-Host "  taskschd.msc" -ForegroundColor White
Write-Host "`nTo manually test:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nTo view logs:" -ForegroundColor Yellow
Write-Host "  Get-Content C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration\cc-wake-log.txt -Tail 20" -ForegroundColor White
Write-Host "`nTo disable the task:" -ForegroundColor Yellow
Write-Host "  Disable-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nTo remove the task:" -ForegroundColor Yellow
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White

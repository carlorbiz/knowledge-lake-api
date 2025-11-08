# CC Wake Check Script
# Runs every 5 minutes via Task Scheduler to check if CC needs to process Slack messages

$logFile = "C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration\cc-wake-log.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Log start
Add-Content -Path $logFile -Value "[$timestamp] Checking for CC wake flag..."

# Path to Claude Code CLI
$claudePath = "claude"  # Adjust if needed based on installation

# Check if Claude Code is available
if (!(Get-Command $claudePath -ErrorAction SilentlyContinue)) {
    Add-Content -Path $logFile -Value "[$timestamp] ERROR: Claude Code CLI not found"
    exit 1
}

# Create a temporary command file for Claude Code to process
$commandFile = "C:\Users\carlo\Development\mem0-sync\mem0\cc-slack-integration\cc-inbox-command.txt"
$command = @"
Check Notion CC Inbox for items with 'Wake CC' flag set to true.
If found:
1. Process each message
2. Respond to the Slack thread
3. Update Status to 'Completed'
4. Uncheck 'Wake CC' flag
5. Log the response in 'Response' field

If no wake flags found, exit quietly.
"@

Set-Content -Path $commandFile -Value $command

try {
    # Launch Claude Code in the mem0 directory with the inbox check command
    # Using Start-Process with -NoNewWindow to run in background
    $process = Start-Process -FilePath $claudePath `
        -ArgumentList "code", "--command", "file:///$commandFile" `
        -WorkingDirectory "C:\Users\carlo\Development\mem0-sync\mem0" `
        -NoNewWindow `
        -PassThru `
        -Wait

    if ($process.ExitCode -eq 0) {
        Add-Content -Path $logFile -Value "[$timestamp] CC inbox check completed successfully"
    } else {
        Add-Content -Path $logFile -Value "[$timestamp] CC inbox check failed with exit code $($process.ExitCode)"
    }
} catch {
    Add-Content -Path $logFile -Value "[$timestamp] ERROR: $($_.Exception.Message)"
}

# Clean up command file
if (Test-Path $commandFile) {
    Remove-Item $commandFile
}

Add-Content -Path $logFile -Value "[$timestamp] Wake check complete`n"

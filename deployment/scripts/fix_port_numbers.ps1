# Fix Port Numbers in All Documentation
# Changes port 5000 → 8000 for Knowledge Lake API

Write-Host "Fixing port numbers in AAE Knowledge Lake documentation..." -ForegroundColor Cyan

$files = @(
    "AGENT_KNOWLEDGE_LAKE_ACCESS.md",
    "n8n_agent_workflow_templates.json",
    "IMPLEMENTATION_ROADMAP_AAE_KNOWLEDGE_LAKE.md",
    "AGENT_SOLUTIONS_SUMMARY.md"
)

$changes = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow

        $content = Get-Content $file -Raw
        $originalContent = $content

        # Replace port numbers
        $content = $content -replace '192\.168\.68\.61:5000', '192.168.68.61:8000'
        $content = $content -replace 'localhost:5000', 'localhost:8000'
        $content = $content -replace 'http://192\.168\.68\.61:5000', 'http://192.168.68.61:8000'
        $content = $content -replace 'http://localhost:5000', 'http://localhost:8000'

        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  Updated port numbers" -ForegroundColor Green
            $changes++
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Port fix complete!" -ForegroundColor Green
Write-Host "Files updated: $changes" -ForegroundColor Green
Write-Host "Knowledge Lake API now uses PORT 8000" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Display summary
Write-Host "Current Configuration:" -ForegroundColor Yellow
Write-Host "  - AI Brain (simple_api_server.py):     PORT 5002 ✓" -ForegroundColor White
Write-Host "  - Knowledge Lake (enhanced_*.py):      PORT 8000 ✓" -ForegroundColor White
Write-Host "  - n8n Workflows:                        PORT 5678 ✓" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Knowledge Lake:   python enhanced_knowledge_lake_api.py"
Write-Host "  2. Test health check:      curl http://192.168.68.61:8000/health"
Write-Host "  3. Import n8n workflows with corrected port 8000"

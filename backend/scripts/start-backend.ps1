# Sistema de Interacciones Avanzadas - Windows PowerShell Startup Script
# Run from PowerShell: .\backend\scripts\start-backend.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Sistema de Interacciones Avanzadas" -ForegroundColor Cyan
Write-Host "Windows Startup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location $PSScriptRoot\..\..\

Write-Host "Step 1: Starting PostgreSQL via WSL..." -ForegroundColor Yellow
wsl sudo service postgresql start
Start-Sleep -Seconds 2
Write-Host "   ✓ PostgreSQL started" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Starting Redis via WSL..." -ForegroundColor Yellow
wsl sudo service redis-server start
Start-Sleep -Seconds 2
Write-Host "   ✓ Redis started" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Checking database schema..." -ForegroundColor Yellow

# Check if object_triggers table exists
$tableExists = wsl psql -U postgres -d ecg_digital_city -c "\d object_triggers" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating missing object_triggers table..." -ForegroundColor Yellow
    wsl psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql
    Write-Host "   ✓ object_triggers table created" -ForegroundColor Green
} else {
    Write-Host "   ✓ object_triggers table exists" -ForegroundColor Green
}

# Add avatar columns
Write-Host "   Adding avatar columns if missing..." -ForegroundColor Yellow
wsl psql -U postgres -d ecg_digital_city -c "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';"
wsl psql -U postgres -d ecg_digital_city -c "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);"
wsl psql -U postgres -d ecg_digital_city -c "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;"
wsl psql -U postgres -d ecg_digital_city -c "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;"
wsl psql -U postgres -d ecg_digital_city -c "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER;"
Write-Host "   ✓ Avatar columns verified" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Starting backend server..." -ForegroundColor Yellow
Write-Host "   Backend will start on http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

Set-Location backend
npm run dev

# ============================================================================
# Script de Verificación Rápida de Base de Datos (PowerShell)
# ECG Digital City
# ============================================================================

Write-Host "🔍 Verificando Base de Datos..." -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno
$envFile = if (Test-Path "../.env") { "../.env" } elseif (Test-Path ".env") { ".env" } else { $null }

if ($envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Determinar credenciales
$DATABASE_URL = $env:DATABASE_URL
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "ecg_digital_city" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = $env:DB_PASSWORD

if ($DATABASE_URL) {
    Write-Host "📡 Usando DATABASE_URL de producción" -ForegroundColor Yellow
    $env:PGPASSWORD = ""
    $psqlCmd = "psql `"$DATABASE_URL`" -f verify-database.sql"
} else {
    Write-Host "💻 Usando credenciales locales" -ForegroundColor Yellow
    Write-Host "   Host: $DB_HOST"
    Write-Host "   Database: $DB_NAME"
    Write-Host "   User: $DB_USER"
    
    if ($DB_PASSWORD) {
        $env:PGPASSWORD = $DB_PASSWORD
    }
    
    $psqlCmd = "psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f verify-database.sql"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "EJECUTANDO VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar verificación
try {
    Invoke-Expression $psqlCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Verificación completada" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Error en verificación" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error ejecutando psql: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Asegúrate de tener PostgreSQL instalado y psql en el PATH" -ForegroundColor Yellow
    exit 1
}

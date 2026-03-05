# ============================================================================
# ECG Digital City - Setup PostgreSQL (Windows -> WSL)
# ============================================================================
# Este script ejecuta la configuración de PostgreSQL en WSL desde Windows
# Uso: .\setup-postgres.ps1
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ECG Digital City - PostgreSQL Setup                     ║" -ForegroundColor Cyan
Write-Host "║   Configurando PostgreSQL en WSL/Ubuntu                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar que WSL está instalado
Write-Host "📋 Verificando WSL..." -ForegroundColor Blue
try {
    $wslStatus = wsl --list --verbose
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ WSL no está instalado o no funciona correctamente" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ WSL encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al verificar WSL: $_" -ForegroundColor Red
    exit 1
}

# Verificar que Ubuntu está instalado
Write-Host ""
Write-Host "📋 Verificando Ubuntu..." -ForegroundColor Blue
if ($wslStatus -match "Ubuntu") {
    Write-Host "✅ Ubuntu encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Ubuntu no está instalado en WSL" -ForegroundColor Red
    Write-Host "ℹ️  Instala Ubuntu desde Microsoft Store" -ForegroundColor Yellow
    exit 1
}

# Verificar que el script existe
$scriptPath = Join-Path $PSScriptRoot "setup-postgres-wsl.sh"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ No se encontró el script setup-postgres-wsl.sh" -ForegroundColor Red
    exit 1
}

# Convertir ruta de Windows a WSL
$wslPath = wsl wslpath -a $scriptPath
Write-Host ""
Write-Host "📋 Ejecutando script de configuración en WSL..." -ForegroundColor Blue
Write-Host "ℹ️  Se te pedirá la contraseña de sudo" -ForegroundColor Yellow
Write-Host ""

# Dar permisos de ejecución y ejecutar el script
wsl chmod +x $wslPath
wsl bash $wslPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🎉 CONFIGURACIÓN EXITOSA                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ PostgreSQL está configurado y corriendo en WSL" -ForegroundColor Green
    Write-Host "✅ Base de datos 'ecg_digital_city' creada" -ForegroundColor Green
    Write-Host "✅ Archivo .env actualizado con la IP de WSL" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Siguiente paso: Ejecutar los tests" -ForegroundColor Blue
    Write-Host "   cd backend" -ForegroundColor Yellow
    Write-Host "   npm test" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error durante la configuración" -ForegroundColor Red
    Write-Host "ℹ️  Revisa los mensajes de error arriba" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

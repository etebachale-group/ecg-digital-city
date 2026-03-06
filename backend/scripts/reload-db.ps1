# ============================================================================
# Script para Recargar Base de Datos Completa (PowerShell)
# ECG Digital City
# ============================================================================

Write-Host "⚠️  ADVERTENCIA: Este script ELIMINARÁ TODOS LOS DATOS" -ForegroundColor Red
Write-Host ""
Write-Host "Base de datos: ecg_digital_city"
Write-Host "Host: dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com"
Write-Host ""

$confirm = Read-Host "¿Estás seguro de continuar? (escribe 'SI' para confirmar)"

if ($confirm -ne "SI") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Recargando base de datos..." -ForegroundColor Yellow
Write-Host ""

# Configurar password
$env:PGPASSWORD = "KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8"

# Ejecutar script SQL
$result = psql `
    -h dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com `
    -U ecg_user `
    -d ecg_digital_city `
    -f reset-and-reload-database.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Base de datos recargada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:"
    Write-Host "1. Reinicia el servidor en Render"
    Write-Host "2. Crea tu primer usuario desde el frontend"
    Write-Host "3. ¡Listo para usar!"
} else {
    Write-Host ""
    Write-Host "❌ Error al recargar la base de datos" -ForegroundColor Red
    exit 1
}

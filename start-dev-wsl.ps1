# ECG Digital City - WSL Development Launcher (PowerShell)
# Script para iniciar el entorno de desarrollo en WSL desde Windows

param(
    [switch]$NoServices = $false,  # No iniciar servicios
    [switch]$Backend = $false,      # Solo backend
    [switch]$Frontend = $false,     # Solo frontend
    [switch]$Status = $false,       # Ver estado
    [switch]$Stop = $false          # Detener servicios
)

$ErrorActionPreference = "Stop"

# Configuración de colores
$Colors = @{
    "Success" = "Green"
    "Error"   = "Red"
    "Info"    = "Cyan"
    "Warning" = "Yellow"
    "Header"  = "Blue"
}

function Write-Success { Write-Host "✅ $args" -ForegroundColor $Colors["Success"] }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor $Colors["Error"] }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor $Colors["Info"] }
function Write-Warning-Custom { Write-Host "⚠️  $args" -ForegroundColor $Colors["Warning"] }
function Write-Header { 
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors["Header"]
    Write-Host "║  ECG Digital City - WSL Development Launcher             ║" -ForegroundColor $Colors["Header"]
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors["Header"]
    Write-Host ""
}

function Write-Section { Write-Host "▶ $args" -ForegroundColor $Colors["Header"] }
function Write-Step { Write-Host "→ $args" -ForegroundColor $Colors["Warning"] }

# Verificar WSL
function Test-WSL {
    Write-Section "Verificando WSL..."
    
    try {
        $version = wsl --version
        Write-Success "WSL está instalado"
        Write-Info $version
        return $true
    }
    catch {
        Write-Error-Custom "WSL no está instalado o no es accesible"
        Write-Info "Instala WSL con: wsl --install"
        return $false
    }
}

# Ver estado de servicios
function Show-Status {
    Write-Header
    Write-Section "Estado de servicios"
    Write-Host ""
    
    Write-Host "PostgreSQL:" -NoNewline
    $pg_status = wsl -u root -e /bin/bash -c "service postgresql status 2>&1 | grep -q running && echo running || echo stopped"
    if ($pg_status -match "running") {
        Write-Success " Ejecutándose"
    } else {
        Write-Error-Custom " Detenido"
    }
    
    Write-Host "Redis:" -NoNewline
    $redis_status = wsl -u root -e /bin/bash -c "service redis-server status 2>&1 | grep -q running && echo running || echo stopped"
    if ($redis_status -match "running") {
        Write-Success " Ejecutándose"
    } else {
        Write-Error-Custom " Detenido"
    }
    
    Write-Host "Base de datos:" -NoNewline
    $db_exists = wsl -u postgres -e /bin/bash -c "psql -lqt | grep -q ecg_digital_city && echo exists || echo missing"
    if ($db_exists -match "exists") {
        Write-Success " Existe"
    } else {
        Write-Error-Custom " No existe"
    }
    
    Write-Host ""
    Write-Host "URLs locales:" -ForegroundColor $Colors["Header"]
    Write-Host "  • Frontend:   http://localhost:5173"
    Write-Host "  • Backend:    http://localhost:3000"
    Write-Host "  • API Health: http://localhost:3000/health"
    Write-Host ""
}

# Iniciar servicios
function Start-Services {
    Write-Header
    Write-Section "Iniciando servicios WSL..."
    Write-Host ""
    
    Write-Step "PostgreSQL..."
    wsl -u root -e /bin/bash -c "service postgresql start > /dev/null 2>&1"
    $pg_started = wsl -u root -e /bin/bash -c "service postgresql status 2>&1 | grep -q running && echo ok"
    if ($pg_started -eq "ok") {
        Write-Success "PostgreSQL iniciado"
    } else {
        Write-Error-Custom "Error iniciando PostgreSQL"
        return $false
    }
    
    Write-Step "Redis..."
    wsl -u root -e /bin/bash -c "service redis-server start > /dev/null 2>&1"
    $redis_started = wsl -u root -e /bin/bash -c "service redis-server status 2>&1 | grep -q running && echo ok"
    if ($redis_started -eq "ok") {
        Write-Success "Redis iniciado"
    } else {
        Write-Error-Custom "Error iniciando Redis"
        return $false
    }
    
    # Crear base de datos si no existe
    $db_exists = wsl -u postgres -e /bin/bash -c "psql -lqt | grep -q ecg_digital_city && echo exists"
    if ($db_exists -ne "exists") {
        Write-Step "Creando base de datos..."
        wsl -u postgres -e /bin/bash -c "createdb ecg_digital_city 2>/dev/null"
        Write-Success "Base de datos creada"
    } else {
        Write-Success "Base de datos ya existe"
    }
    
    Write-Host ""
    return $true
}

# Detener servicios
function Stop-Services {
    Write-Header
    Write-Section "Deteniendo servicios WSL..."
    Write-Host ""
    
    Write-Step "PostgreSQL..."
    wsl -u root -e /bin/bash -c "service postgresql stop"
    Write-Success "PostgreSQL detenido"
    
    Write-Step "Redis..."
    wsl -u root -e /bin/bash -c "service redis-server stop"
    Write-Success "Redis detenido"
    
    Write-Host ""
    Write-Success "Servicios detenidos"
}

# Iniciar backend
function Start-Backend {
    Write-Header
    Write-Section "Iniciando Backend (Node.js)"
    Write-Host ""
    Write-Step "Abriendo WSL en nueva ventana..."
    Write-Info "Ejecutando: cd /mnt/c/xampp/htdocs/ecg-digital-city && npm run dev"
    Write-Host ""
    
    # Iniciar WSL en nueva ventana
    New-Item -Path $env:TEMP -Name "wsl-backend.sh" -ItemType File -Value @"
#!/bin/bash
cd /mnt/c/xampp/htdocs/ecg-digital-city/backend
echo "🚀 Backend iniciándose..."
npm run dev
echo ""
echo "Presiona Enter para cerrar esta ventana"
read
"@ -Force | Out-Null
    
    & wsl -e bash "$env:TEMP\wsl-backend.sh"
}

# Iniciar frontend
function Start-Frontend {
    Write-Header
    Write-Section "Iniciando Frontend (React)"
    Write-Host ""
    Write-Step "Abriendo WSL en nueva ventana..."
    Write-Info "Ejecutando: cd /mnt/c/xampp/htdocs/ecg-digital-city && npm run dev"
    Write-Host ""
    
    # Iniciar WSL en nueva ventana
    New-Item -Path $env:TEMP -Name "wsl-frontend.sh" -ItemType File -Value @"
#!/bin/bash
cd /mnt/c/xampp/htdocs/ecg-digital-city/frontend
echo "🚀 Frontend iniciándose..."
npm run dev
echo ""
echo "Presiona Enter para cerrar esta ventana"
read
"@ -Force | Out-Null
    
    & wsl -e bash "$env:TEMP\wsl-frontend.sh"
}

# MAIN
function Main {
    Write-Header
    
    # Verificar WSL
    if (-not (Test-WSL)) {
        exit 1
    }
    
    # Procesamiento de argumentos
    if ($Status) {
        Show-Status
        return
    }
    
    if ($Stop) {
        Stop-Services
        return
    }
    
    # Iniciar servicios
    if (-not $NoServices) {
        if (-not (Start-Services)) {
            exit 1
        }
    }
    
    # Iniciar aplicaciones
    if ($Backend -or (-not $Frontend)) {
        Write-Step "Iniciando Backend en nueva ventana..."
        Start-Job -ScriptBlock { 
            Push-Location "C:\xampp\htdocs\ecg-digital-city"
            & wsl bash start-dev-wsl.sh
        } | Out-Null
    }
    
    if ($Frontend -or (-not $Backend)) {
        Write-Host ""
        Write-Step "Para iniciar Frontend, abre otra terminal y ejecuta:"
        Write-Host ""
        Write-Host "  cd frontend" -ForegroundColor $Colors["Warning"]
        Write-Host "  npm run dev" -ForegroundColor $Colors["Warning"]
        Write-Host ""
    }
    
    Write-Section "Entorno de desarrollo listo"
    Write-Host ""
    Write-Host "URLs accesibles:" -ForegroundColor $Colors["Header"]
    Write-Host "  • Frontend:   http://localhost:5173"
    Write-Host "  • Backend:    http://localhost:3000"
    Write-Host ""
    Write-Host "Para detener servicios:" -ForegroundColor $Colors["Header"]
    Write-Host "  .\start-dev-wsl.ps1 -Stop"
    Write-Host ""
    Write-Host "Para ver estado:" -ForegroundColor $Colors["Header"]
    Write-Host "  .\start-dev-wsl.ps1 -Status"
    Write-Host ""
}

Main

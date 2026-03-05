# ============================================================================
# ECG Digital City - PostgreSQL Setup Runner (PowerShell)
# ============================================================================
# Este script ejecuta la configuración completa de PostgreSQL en Windows
# Uso: .\run-postgres-setup.ps1 [-Action <reset|seed|migrate|all>]
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('reset', 'seed', 'migrate', 'all')]
    [string]$Action = 'all'
)

# Configuración de base de datos
$DB_NAME = "ecg_digital_city"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$PGPASSWORD = "postgres123"

# Establecer variable de entorno para password
$env:PGPASSWORD = $PGPASSWORD

# Funciones para output con colores
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Verificar que PostgreSQL está corriendo
function Test-PostgreSQL {
    Write-Info "Verificando conexión a PostgreSQL..."
    try {
        $result = & pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL está corriendo"
            return $true
        }
    } catch {
        Write-Error-Custom "PostgreSQL no está corriendo o no es accesible"
        Write-Info "Intenta iniciar PostgreSQL desde Services o pgAdmin"
        return $false
    }
}

# Crear base de datos si no existe
function New-DatabaseIfNotExists {
    Write-Info "Verificando base de datos $DB_NAME..."
    
    $query = "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'"
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c $query 2>&1
    
    if ($result -match "1") {
        Write-Success "Base de datos $DB_NAME ya existe"
    } else {
        Write-Info "Creando base de datos $DB_NAME..."
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Base de datos $DB_NAME creada"
        } else {
            Write-Error-Custom "Error al crear la base de datos"
            exit 1
        }
    }
}

# Ejecutar script de setup
function Invoke-Setup {
    Write-Info "Ejecutando script de configuración..."
    $scriptPath = Join-Path $PSScriptRoot "setup-database.sql"
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Configuración completada"
    } else {
        Write-Error-Custom "Error en la configuración"
        exit 1
    }
}

# Ejecutar script de reset
function Invoke-Reset {
    Write-Warning-Custom "⚠️  ADVERTENCIA: Esto eliminará todas las tablas del sistema de interacciones"
    $confirmation = Read-Host "¿Estás seguro? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Write-Info "Ejecutando reset de base de datos..."
        $scriptPath = Join-Path $PSScriptRoot "reset-database.sql"
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Reset completado"
        } else {
            Write-Error-Custom "Error en el reset"
            exit 1
        }
    } else {
        Write-Info "Reset cancelado"
        exit 0
    }
}

# Ejecutar script de seed
function Invoke-Seed {
    Write-Info "Insertando datos de prueba..."
    $scriptPath = Join-Path $PSScriptRoot "seed-interactions.sql"
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Datos de prueba insertados"
    } else {
        Write-Error-Custom "Error al insertar datos"
        exit 1
    }
}

# Ejecutar migraciones de Sequelize
function Invoke-Migrations {
    Write-Info "Ejecutando migraciones de Sequelize..."
    $backendPath = Split-Path $PSScriptRoot -Parent
    Push-Location $backendPath
    npm run migrate
    Pop-Location
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Migraciones completadas"
    } else {
        Write-Error-Custom "Error en las migraciones"
        exit 1
    }
}

# Main
function Main {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   ECG Digital City - PostgreSQL Setup                     ║" -ForegroundColor Cyan
    Write-Host "║   Sistema de Interacciones Avanzadas                      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-PostgreSQL)) {
        exit 1
    }

    New-DatabaseIfNotExists

    switch ($Action) {
        'reset' {
            Invoke-Reset
        }
        'seed' {
            Invoke-Seed
        }
        'migrate' {
            Invoke-Migrations
        }
        'all' {
            Invoke-Setup
            Invoke-Seed
        }
    }

    Write-Host ""
    Write-Success "🎉 Proceso completado exitosamente"
    Write-Host ""
}

# Ejecutar
Main

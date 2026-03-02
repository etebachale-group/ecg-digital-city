#!/bin/bash

################################################################################
# ECG Digital City - WSL Development Startup Script
# Script para iniciar servicios y desarrollo en WSL Ubuntu
################################################################################

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
LOG_FILE="/tmp/ecg-digital-city-$(date +%s).log"
PIDS_FILE="/tmp/ecg-digital-city-pids.txt"

################################################################################
# FUNCIONES
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ECG Digital City - WSL Development Environment         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Función para limpiar al salir
cleanup() {
    echo ""
    echo ""
    print_header
    print_section "Deteniendo servicios..."
    
    # Leer PIDs guardados
    if [ -f "$PIDS_FILE" ]; then
        while IFS= read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                print_step "Deteniendo proceso $pid..."
                kill "$pid" 2>/dev/null || true
                wait "$pid" 2>/dev/null || true
            fi
        done < "$PIDS_FILE"
        rm -f "$PIDS_FILE"
    fi
    
    print_success "Servicios detenidos"
    print_info "Para revisar logs: cat $LOG_FILE"
    echo ""
    exit 0
}

# Trap para ejecutar cleanup al salir
trap cleanup SIGINT SIGTERM EXIT

################################################################################
# VERIFICACIONES PREVIAS
################################################################################

print_header
print_section "Verificando requisitos..."

# Verificar que estamos en WSL
if ! grep -qi microsoft /proc/version; then
    print_error "Este script debe ejecutarse en WSL/Ubuntu"
    exit 1
fi
print_success "WSL detectado"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Instala Node.js con: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi
print_success "Node.js $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm --version)"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    echo "Instala con: sudo apt-get install -y postgresql-14"
    exit 1
fi
print_success "PostgreSQL instalado"

# Verificar Redis
if ! command -v redis-cli &> /dev/null; then
    print_error "Redis no está instalado"
    echo "Instala con: sudo apt-get install -y redis-server"
    exit 1
fi
print_success "Redis instalado"

echo "" >> "$LOG_FILE"
echo "=== ECG Digital City Development Session ===" >> "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

################################################################################
# INICIAR SERVICIOS
################################################################################

print_section "Iniciando servicios de base de datos..."

# PostgreSQL
if sudo service postgresql status 2>&1 | grep -q "running"; then
    print_success "PostgreSQL ya está ejecutándose"
else
    print_step "Iniciando PostgreSQL..."
    sudo service postgresql start >> "$LOG_FILE" 2>&1
    sleep 2
    if sudo service postgresql status 2>&1 | grep -q "running"; then
        print_success "PostgreSQL iniciado"
    else
        print_error "No se pudo iniciar PostgreSQL"
        exit 1
    fi
fi

# Redis
if sudo service redis-server status 2>&1 | grep -q "running"; then
    print_success "Redis ya está ejecutándose"
else
    print_step "Iniciando Redis..."
    sudo service redis-server start >> "$LOG_FILE" 2>&1
    sleep 1
    if sudo service redis-server status 2>&1 | grep -q "running"; then
        print_success "Redis iniciado"
    else
        print_error "No se pudo iniciar Redis"
        exit 1
    fi
fi

# Crear base de datos si no existe
if sudo -u postgres psql -lqt | grep -q ecg_digital_city; then
    print_success "Base de datos ecg_digital_city existe"
else
    print_step "Creando base de datos..."
    sudo -u postgres createdb ecg_digital_city >> "$LOG_FILE" 2>&1
    print_success "Base de datos creada"
fi

sleep 1

################################################################################
# INICIAR APLICACIÓN
################################################################################

print_section "Iniciando aplicación desarrollo..."

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar que tenemos node_modules
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    print_error "Backend node_modules no existe"
    print_step "Instalando dependencias backend..."
    cd "$SCRIPT_DIR/backend"
    npm install >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        print_success "Dependencias backend instaladas"
    else
        print_error "Error instalando dependencias backend"
        exit 1
    fi
    cd "$SCRIPT_DIR"
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    print_error "Frontend node_modules no existe"
    print_step "Instalando dependencias frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm install >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        print_success "Dependencias frontend instaladas"
    else
        print_error "Error instalando dependencias frontend"
        exit 1
    fi
    cd "$SCRIPT_DIR"
fi

# Iniciar Backend
print_step "Iniciando Backend (Node.js)..."
cd "$SCRIPT_DIR/backend"
npm run dev >> "$LOG_FILE" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PIDS_FILE"
print_success "Backend iniciado (PID: $BACKEND_PID)"

sleep 3

# Iniciar Frontend
print_step "Iniciando Frontend (React)..."
cd "$SCRIPT_DIR/frontend"
npm run dev >> "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PIDS_FILE"
print_success "Frontend iniciado (PID: $FRONTEND_PID)"

sleep 2

################################################################################
# RESUMEN Y ACCESO
################################################################################

print_section "Entorno de desarrollo listo"
echo ""
echo -e "${GREEN}URLs accesibles desde Windows:${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}     http://localhost:5173"
echo -e "  ${BLUE}Backend API:${NC}    http://localhost:3000"
echo -e "  ${BLUE}API Health:${NC}     http://localhost:3000/health"
echo ""

echo -e "${GREEN}Servicios WSL:${NC}"
echo ""
echo -e "  ${BLUE}PostgreSQL:${NC}    localhost:5432 (usuario: postgres)"
echo -e "  ${BLUE}Redis:${NC}         localhost:6379"
echo ""

echo -e "${GREEN}Comandos útiles en otra terminal:${NC}"
echo ""
echo "  ${BLUE}Ver logs:${NC}     tail -f $LOG_FILE"
echo "  ${BLUE}Conectar BD:${NC}    wsl psql -U postgres -d ecg_digital_city"
echo "  ${BLUE}Redis CLI:${NC}      wsl redis-cli"
echo ""

echo -e "${YELLOW}Presiona Ctrl+C para detener los servicios${NC}"
echo ""

# Guardar PIDs en archivo para poder verlos después
echo "Backend PID: $BACKEND_PID" >> "$LOG_FILE"
echo "Frontend PID: $FRONTEND_PID" >> "$LOG_FILE"

# Esperar indefinidamente (el trap cleanup se ejecutará al recibir Ctrl+C)
wait

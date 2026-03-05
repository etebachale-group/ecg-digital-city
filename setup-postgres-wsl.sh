#!/bin/bash
# ============================================================================
# ECG Digital City - Setup PostgreSQL en WSL/Ubuntu
# ============================================================================
# Este script configura PostgreSQL en Ubuntu/WSL y crea la base de datos
# Ejecutar desde WSL: bash setup-postgres-wsl.sh
# ============================================================================

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ECG Digital City - PostgreSQL Setup (WSL/Ubuntu)        ║"
echo "║   Sistema de Interacciones Avanzadas                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Paso 1: Verificar/Iniciar PostgreSQL
echo -e "${BLUE}📋 Paso 1: Verificando PostgreSQL...${NC}"
if sudo service postgresql status | grep -q "online"; then
    echo -e "${GREEN}✅ PostgreSQL ya está corriendo${NC}"
else
    echo -e "${YELLOW}⚡ Iniciando PostgreSQL...${NC}"
    sudo service postgresql start
    sleep 2
    echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
fi

# Paso 2: Verificar conexión
echo -e "\n${BLUE}📋 Paso 2: Verificando conexión...${NC}"
if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexión exitosa${NC}"
else
    echo -e "${RED}❌ Error de conexión${NC}"
    exit 1
fi

# Paso 3: Configurar contraseña del usuario postgres
echo -e "\n${BLUE}📋 Paso 3: Configurando usuario postgres...${NC}"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';" 2>/dev/null || true
echo -e "${GREEN}✅ Contraseña configurada${NC}"

# Paso 4: Crear base de datos
echo -e "\n${BLUE}📋 Paso 4: Creando base de datos...${NC}"
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw ecg_digital_city; then
    echo -e "${YELLOW}⚠️  Base de datos 'ecg_digital_city' ya existe${NC}"
    read -p "¿Deseas eliminarla y recrearla? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo -u postgres psql -c "DROP DATABASE ecg_digital_city;"
        sudo -u postgres psql -c "CREATE DATABASE ecg_digital_city;"
        echo -e "${GREEN}✅ Base de datos recreada${NC}"
    else
        echo -e "${BLUE}ℹ️  Usando base de datos existente${NC}"
    fi
else
    sudo -u postgres psql -c "CREATE DATABASE ecg_digital_city;"
    echo -e "${GREEN}✅ Base de datos creada${NC}"
fi

# Paso 5: Ejecutar script de setup
echo -e "\n${BLUE}📋 Paso 5: Creando tablas e índices...${NC}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
sudo -u postgres psql -d ecg_digital_city -f "$SCRIPT_DIR/backend/scripts/setup-database.sql"
echo -e "${GREEN}✅ Tablas creadas${NC}"

# Paso 6: Insertar datos de prueba
echo -e "\n${BLUE}📋 Paso 6: Insertando datos de prueba...${NC}"
read -p "¿Deseas insertar datos de prueba? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    sudo -u postgres psql -d ecg_digital_city -f "$SCRIPT_DIR/backend/scripts/seed-interactions.sql"
    echo -e "${GREEN}✅ Datos de prueba insertados${NC}"
else
    echo -e "${BLUE}ℹ️  Datos de prueba omitidos${NC}"
fi

# Paso 7: Configurar acceso desde Windows
echo -e "\n${BLUE}📋 Paso 7: Configurando acceso desde Windows...${NC}"

# Obtener IP de WSL
WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
echo -e "${BLUE}ℹ️  IP de WSL: $WSL_IP${NC}"

# Configurar postgresql.conf
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version;" | cut -d. -f1 | xargs)
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_CONF" ]; then
    # Backup de configuración
    sudo cp "$PG_CONF" "$PG_CONF.backup"
    sudo cp "$PG_HBA" "$PG_HBA.backup"
    
    # Configurar listen_addresses
    if sudo grep -q "^listen_addresses = '\*'" "$PG_CONF"; then
        echo -e "${BLUE}ℹ️  listen_addresses ya configurado${NC}"
    else
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
        sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
        echo -e "${GREEN}✅ listen_addresses configurado${NC}"
    fi
    
    # Configurar pg_hba.conf
    if sudo grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
        echo -e "${BLUE}ℹ️  pg_hba.conf ya configurado${NC}"
    else
        echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_HBA" > /dev/null
        echo -e "${GREEN}✅ pg_hba.conf configurado${NC}"
    fi
    
    # Reiniciar PostgreSQL
    sudo service postgresql restart
    sleep 2
    echo -e "${GREEN}✅ PostgreSQL reiniciado${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo encontrar postgresql.conf${NC}"
fi

# Paso 8: Actualizar .env
echo -e "\n${BLUE}📋 Paso 8: Actualizando archivo .env...${NC}"
ENV_FILE="$SCRIPT_DIR/backend/.env"

if [ -f "$ENV_FILE" ]; then
    # Crear backup
    cp "$ENV_FILE" "$ENV_FILE.backup"
    
    # Actualizar DB_HOST con la IP de WSL
    sed -i "s/^DB_HOST=.*/DB_HOST=$WSL_IP/" "$ENV_FILE"
    
    echo -e "${GREEN}✅ Archivo .env actualizado${NC}"
    echo -e "${BLUE}ℹ️  DB_HOST configurado a: $WSL_IP${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
fi

# Resumen
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP COMPLETADO                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ PostgreSQL configurado y corriendo${NC}"
echo -e "${GREEN}✅ Base de datos 'ecg_digital_city' creada${NC}"
echo -e "${GREEN}✅ Tablas e índices creados${NC}"
echo -e "${GREEN}✅ Acceso desde Windows configurado${NC}"
echo ""
echo -e "${BLUE}📊 Información de conexión:${NC}"
echo -e "   Host: ${YELLOW}$WSL_IP${NC} (desde Windows) o ${YELLOW}localhost${NC} (desde WSL)"
echo -e "   Port: ${YELLOW}5432${NC}"
echo -e "   Database: ${YELLOW}ecg_digital_city${NC}"
echo -e "   User: ${YELLOW}postgres${NC}"
echo -e "   Password: ${YELLOW}postgres123${NC}"
echo ""
echo -e "${BLUE}🧪 Para probar la conexión desde Windows:${NC}"
echo -e "   ${YELLOW}cd backend${NC}"
echo -e "   ${YELLOW}npm test${NC}"
echo ""
echo -e "${BLUE}🔧 Para conectarte manualmente:${NC}"
echo -e "   Desde WSL: ${YELLOW}psql -U postgres -d ecg_digital_city${NC}"
echo -e "   Desde Windows: ${YELLOW}psql -h $WSL_IP -U postgres -d ecg_digital_city${NC}"
echo ""
echo -e "${BLUE}📝 Nota: Si reinicias WSL, la IP puede cambiar. Ejecuta este script nuevamente.${NC}"
echo ""

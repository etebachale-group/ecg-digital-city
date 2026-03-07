#!/bin/bash

# Script para configurar PostgreSQL local para ECG Digital City
# Ejecutar en WSL: bash scripts/setup-local-db.sh

echo "🔧 Configurando PostgreSQL local para ECG Digital City..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
    echo "Instala con: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL está instalado${NC}"

# Verificar si PostgreSQL está corriendo
if ! sudo service postgresql status | grep -q "active (exited)"; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo. Iniciando...${NC}"
    sudo service postgresql start
fi

echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
echo ""

# Configurar base de datos
echo "📊 Configurando base de datos..."
echo ""

# Crear usuario y base de datos
sudo -u postgres psql << EOF
-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS ecg_digital_city;

-- Crear usuario si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'ecg_user') THEN
        CREATE USER ecg_user WITH PASSWORD 'ecg_password';
    END IF;
END
\$\$;

-- Crear base de datos
CREATE DATABASE ecg_digital_city OWNER ecg_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE ecg_digital_city TO ecg_user;

-- Conectar a la base de datos y dar permisos en el schema
\c ecg_digital_city
GRANT ALL ON SCHEMA public TO ecg_user;

-- Mostrar resultado
\l ecg_digital_city
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Base de datos creada exitosamente${NC}"
    echo ""
    echo "📝 Configuración:"
    echo "   Database: ecg_digital_city"
    echo "   User: ecg_user"
    echo "   Password: ecg_password"
    echo "   Host: localhost (o 172.25.8.183 desde Windows)"
    echo "   Port: 5432"
    echo ""
    echo "🔧 Actualiza tu backend/.env con:"
    echo ""
    echo "DB_HOST=172.25.8.183"
    echo "DB_PORT=5432"
    echo "DB_NAME=ecg_digital_city"
    echo "DB_USER=ecg_user"
    echo "DB_PASSWORD=ecg_password"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Actualiza backend/.env con la configuración de arriba"
    echo "2. Ejecuta: cd backend && npx sequelize-cli db:migrate"
    echo "3. Ejecuta: npm run seed:all"
    echo ""
    echo -e "${GREEN}🎉 ¡Listo para desarrollo local!${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al crear la base de datos${NC}"
    echo "Revisa los errores arriba"
    exit 1
fi

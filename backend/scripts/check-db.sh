#!/bin/bash

# ============================================================================
# Script de Verificación Rápida de Base de Datos
# ECG Digital City
# ============================================================================

echo "🔍 Verificando Base de Datos..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si estamos en producción o desarrollo
if [ -f "../.env" ]; then
    source ../.env
elif [ -f ".env" ]; then
    source .env
fi

# Determinar credenciales
if [ -n "$DATABASE_URL" ]; then
    echo "📡 Usando DATABASE_URL de producción"
    DB_CONNECTION="$DATABASE_URL"
else
    echo "💻 Usando credenciales locales"
    DB_HOST="${DB_HOST:-localhost}"
    DB_NAME="${DB_NAME:-ecg_digital_city}"
    DB_USER="${DB_USER:-postgres}"
    DB_PASSWORD="${DB_PASSWORD:-}"
    
    if [ -n "$DB_PASSWORD" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    DB_CONNECTION="postgresql://$DB_USER@$DB_HOST/$DB_NAME"
fi

echo ""
echo "========================================="
echo "EJECUTANDO VERIFICACIÓN"
echo "========================================="
echo ""

# Ejecutar script de verificación
if [ -n "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" -f verify-database.sql
else
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f verify-database.sql
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Verificación completada${NC}"
else
    echo -e "${RED}✗ Error en verificación${NC}"
fi

exit $EXIT_CODE

#!/bin/bash

# ============================================================================
# Script de Instalación: Sistema de Interacciones Avanzadas
# ECG Digital City
# ============================================================================
#
# Este script instala el esquema de base de datos para el Sistema de
# Interacciones Avanzadas.
#
# Uso:
#   ./install-sistema-interacciones.sh
#
# O con parámetros personalizados:
#   ./install-sistema-interacciones.sh <host> <port> <database> <user>
#
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración por defecto (desde .env o valores por defecto)
DB_HOST="${1:-${DB_HOST:-172.25.8.183}}"
DB_PORT="${2:-${DB_PORT:-5432}}"
DB_NAME="${3:-${DB_NAME:-ecg_digital_city}}"
DB_USER="${4:-${DB_USER:-postgres}}"

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}Sistema de Interacciones Avanzadas - Instalación de Base de Datos${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "Host:     ${YELLOW}$DB_HOST${NC}"
echo -e "Puerto:   ${YELLOW}$DB_PORT${NC}"
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "Usuario:  ${YELLOW}$DB_USER${NC}"
echo ""

# Verificar que el archivo SQL existe
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/sistema-interacciones-avanzadas-schema.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo -e "${RED}ERROR: No se encontró el archivo SQL en:${NC}"
  echo -e "${RED}$SQL_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}Archivo SQL encontrado:${NC} $SQL_FILE"
echo ""

# Confirmar antes de proceder
read -p "¿Deseas continuar con la instalación? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Instalación cancelada.${NC}"
  exit 0
fi

echo ""
echo -e "${GREEN}Ejecutando script SQL...${NC}"
echo ""

# Ejecutar el script SQL
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

# Verificar el resultado
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}============================================================================${NC}"
  echo -e "${GREEN}✓ Instalación completada exitosamente${NC}"
  echo -e "${GREEN}============================================================================${NC}"
  echo ""
  echo -e "Las siguientes tablas fueron creadas:"
  echo -e "  ${GREEN}✓${NC} interactive_objects"
  echo -e "  ${GREEN}✓${NC} interaction_nodes"
  echo -e "  ${GREEN}✓${NC} object_triggers"
  echo -e "  ${GREEN}✓${NC} interaction_queue"
  echo -e "  ${GREEN}✓${NC} interaction_logs"
  echo ""
  echo -e "Extensiones de tabla avatars:"
  echo -e "  ${GREEN}✓${NC} current_state"
  echo -e "  ${GREEN}✓${NC} previous_state"
  echo -e "  ${GREEN}✓${NC} state_changed_at"
  echo -e "  ${GREEN}✓${NC} interacting_with"
  echo -e "  ${GREEN}✓${NC} sitting_at"
  echo ""
  echo -e "${YELLOW}Próximos pasos:${NC}"
  echo -e "  1. Reiniciar el servidor backend: ${YELLOW}npm run dev${NC}"
  echo -e "  2. Verificar que las rutas API funcionan: ${YELLOW}curl http://localhost:3000/api/objects${NC}"
  echo -e "  3. Revisar logs del servidor para confirmar que no hay errores"
  echo ""
else
  echo ""
  echo -e "${RED}============================================================================${NC}"
  echo -e "${RED}✗ Error durante la instalación${NC}"
  echo -e "${RED}============================================================================${NC}"
  echo ""
  echo -e "${RED}Por favor revisa los errores arriba y corrige el problema.${NC}"
  echo ""
  echo -e "${YELLOW}Posibles causas:${NC}"
  echo -e "  - Credenciales de base de datos incorrectas"
  echo -e "  - Base de datos no accesible"
  echo -e "  - Permisos insuficientes"
  echo -e "  - Tablas ya existen (ejecutar rollback primero)"
  echo ""
  exit 1
fi

#!/bin/bash

# ============================================================================
# Script para Recargar Base de Datos Completa
# ECG Digital City
# ============================================================================

echo "⚠️  ADVERTENCIA: Este script ELIMINARÁ TODOS LOS DATOS"
echo ""
echo "Base de datos: ecg_digital_city"
echo "Host: dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirm

if [ "$confirm" != "SI" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🔄 Recargando base de datos..."
echo ""

# Ejecutar script SQL
PGPASSWORD="KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8" psql \
    -h dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com \
    -U ecg_user \
    -d ecg_digital_city \
    -f reset-and-reload-database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Base de datos recargada exitosamente"
    echo ""
    echo "Próximos pasos:"
    echo "1. Reinicia el servidor en Render"
    echo "2. Crea tu primer usuario desde el frontend"
    echo "3. ¡Listo para usar!"
else
    echo ""
    echo "❌ Error al recargar la base de datos"
    exit 1
fi

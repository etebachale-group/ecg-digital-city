#!/bin/bash

# Script para probar que el backend está funcionando correctamente
# Run from WSL: bash backend/scripts/test-backend.sh

echo "========================================="
echo "Testing Backend - Sistema de Interacciones"
echo "========================================="
echo ""

# Check if backend is running
echo "1. Verificando que el backend está corriendo..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✓ Backend está corriendo en puerto 3000"
else
    echo "   ✗ Backend NO está corriendo"
    echo "   Inicia el backend con: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2. Probando endpoints de objetos interactivos..."

# Test GET /api/objects/office/:officeId
echo "   Testing GET /api/objects/office/1"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/objects/office/1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ GET /api/objects/office/1 - OK (200)"
    echo "   Response: $BODY"
else
    echo "   ✗ GET /api/objects/office/1 - FAILED ($HTTP_CODE)"
    echo "   Response: $BODY"
fi

echo ""
echo "3. Verificando estructura de base de datos..."

# Check all tables exist
TABLES=$(psql -U postgres -d ecg_digital_city -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('interactive_objects', 'interaction_nodes', 'object_triggers', 'interaction_queue', 'interaction_logs')")

if [ "$TABLES" -eq 5 ]; then
    echo "   ✓ Todas las 5 tablas existen"
else
    echo "   ✗ Faltan tablas (encontradas: $TABLES/5)"
fi

# Check avatar columns
AVATAR_COLS=$(psql -U postgres -d ecg_digital_city -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'avatars' AND column_name IN ('current_state', 'previous_state', 'state_changed_at', 'interacting_with', 'sitting_at')")

if [ "$AVATAR_COLS" -eq 5 ]; then
    echo "   ✓ Todas las columnas de avatar existen"
else
    echo "   ✗ Faltan columnas de avatar (encontradas: $AVATAR_COLS/5)"
fi

echo ""
echo "========================================="
echo "Test Complete"
echo "========================================="
echo ""
echo "Siguiente paso: Ejecutar tests"
echo "  cd backend"
echo "  npm test"

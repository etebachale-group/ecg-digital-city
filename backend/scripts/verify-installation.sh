#!/bin/bash

# Verification script for Sistema de Interacciones Avanzadas
# Run from WSL: bash backend/scripts/verify-installation.sh

echo "========================================="
echo "Sistema de Interacciones Avanzadas"
echo "Verification Script"
echo "========================================="
echo ""

# Check PostgreSQL connection
echo "1. Checking PostgreSQL connection..."
if psql -U postgres -d ecg_digital_city -c "SELECT 1" > /dev/null 2>&1; then
    echo "   ✓ PostgreSQL connection OK"
else
    echo "   ✗ PostgreSQL connection FAILED"
    echo "   Run: sudo service postgresql start"
    exit 1
fi

echo ""
echo "2. Checking tables..."

# Check interactive_objects table
if psql -U postgres -d ecg_digital_city -c "\d interactive_objects" > /dev/null 2>&1; then
    echo "   ✓ interactive_objects table exists"
else
    echo "   ✗ interactive_objects table MISSING"
fi

# Check interaction_nodes table
if psql -U postgres -d ecg_digital_city -c "\d interaction_nodes" > /dev/null 2>&1; then
    echo "   ✓ interaction_nodes table exists"
else
    echo "   ✗ interaction_nodes table MISSING"
fi

# Check object_triggers table
if psql -U postgres -d ecg_digital_city -c "\d object_triggers" > /dev/null 2>&1; then
    echo "   ✓ object_triggers table exists"
else
    echo "   ✗ object_triggers table MISSING - NEEDS CREATION"
fi

# Check interaction_queue table
if psql -U postgres -d ecg_digital_city -c "\d interaction_queue" > /dev/null 2>&1; then
    echo "   ✓ interaction_queue table exists"
else
    echo "   ✗ interaction_queue table MISSING"
fi

# Check interaction_logs table
if psql -U postgres -d ecg_digital_city -c "\d interaction_logs" > /dev/null 2>&1; then
    echo "   ✓ interaction_logs table exists"
else
    echo "   ✗ interaction_logs table MISSING"
fi

echo ""
echo "3. Checking avatar columns..."

# Check avatar state columns
AVATAR_COLUMNS=$(psql -U postgres -d ecg_digital_city -t -c "\d avatars" | grep -E "(current_state|previous_state|state_changed_at|interacting_with|sitting_at)" | wc -l)

if [ "$AVATAR_COLUMNS" -eq 5 ]; then
    echo "   ✓ All 5 avatar state columns exist"
else
    echo "   ✗ Avatar columns incomplete (found $AVATAR_COLUMNS/5)"
    echo "   Missing columns need to be added"
fi

echo ""
echo "4. Checking Redis service..."
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✓ Redis is running"
else
    echo "   ✗ Redis is NOT running"
    echo "   Run: sudo service redis-server start"
fi

echo ""
echo "========================================="
echo "Verification Complete"
echo "========================================="

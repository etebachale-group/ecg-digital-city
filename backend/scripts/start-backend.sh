#!/bin/bash

# Sistema de Interacciones Avanzadas - Complete Startup Script
# Run from WSL: bash backend/scripts/start-backend.sh

set -e  # Exit on error

echo "========================================="
echo "Sistema de Interacciones Avanzadas"
echo "Complete Startup Script"
echo "========================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Starting PostgreSQL..."
if sudo service postgresql status > /dev/null 2>&1; then
    echo "   ✓ PostgreSQL already running"
else
    sudo service postgresql start
    sleep 2
    echo "   ✓ PostgreSQL started"
fi

echo ""
echo "Step 2: Starting Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✓ Redis already running"
else
    sudo service redis-server start
    sleep 2
    echo "   ✓ Redis started"
fi

echo ""
echo "Step 3: Checking database schema..."

# Check if object_triggers table exists
if ! psql -U postgres -d ecg_digital_city -c "\d object_triggers" > /dev/null 2>&1; then
    echo "   Creating missing object_triggers table..."
    psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql > /dev/null 2>&1
    echo "   ✓ object_triggers table created"
else
    echo "   ✓ object_triggers table exists"
fi

# Check avatar columns
AVATAR_COLUMNS=$(psql -U postgres -d ecg_digital_city -t -c "\d avatars" 2>/dev/null | grep -E "(current_state|previous_state|state_changed_at|interacting_with|sitting_at)" | wc -l)

if [ "$AVATAR_COLUMNS" -lt 5 ]; then
    echo "   Adding missing avatar columns..."
    psql -U postgres -d ecg_digital_city << 'EOF' > /dev/null 2>&1
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER;
ALTER TABLE avatars DROP CONSTRAINT IF EXISTS avatars_current_state_check;
ALTER TABLE avatars ADD CONSTRAINT avatars_current_state_check 
    CHECK (current_state IN ('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'));
EOF
    echo "   ✓ Avatar columns added"
else
    echo "   ✓ Avatar columns exist"
fi

echo ""
echo "Step 4: Verifying installation..."
bash backend/scripts/verify-installation.sh

echo ""
echo "Step 5: Starting backend server..."
echo "   Backend will start on http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

cd backend
npm run dev

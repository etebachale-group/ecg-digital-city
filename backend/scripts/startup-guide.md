# Sistema de Interacciones Avanzadas - Startup Guide

## Current Status

Based on your terminal output:
- ✅ PostgreSQL is running
- ✅ 4/5 tables created (missing `object_triggers`)
- ❓ Avatar columns not verified
- ❌ Redis not running
- ❌ Backend not running

## Step-by-Step Startup Instructions

### 1. Verify Installation Status

From WSL, run:
```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city
bash backend/scripts/verify-installation.sh
```

This will check:
- PostgreSQL connection
- All 5 tables
- Avatar columns
- Redis service

### 2. Create Missing Table (if needed)

If `object_triggers` table is missing:
```bash
psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql
```

### 3. Verify Avatar Columns

Check if avatar columns exist:
```bash
psql -U postgres -d ecg_digital_city -c "\d avatars" | grep -E "(current_state|previous_state|state_changed_at|interacting_with|sitting_at)"
```

If columns are missing, add them:
```bash
psql -U postgres -d ecg_digital_city << 'EOF'
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER;

-- Add check constraint
ALTER TABLE avatars ADD CONSTRAINT avatars_current_state_check 
    CHECK (current_state IN ('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'));

-- Verify
\d avatars
EOF
```

### 4. Start Redis

```bash
sudo service redis-server start
```

Verify Redis is running:
```bash
redis-cli ping
```

Expected output: `PONG`

### 5. Start Backend

From WSL:
```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city/backend
npm run dev
```

The backend should start on port 3000.

### 6. Test API Endpoints

Once backend is running, test from another WSL terminal:

```bash
# Test interactive objects endpoint
curl http://localhost:3000/api/objects/office/1

# Test health check (if available)
curl http://localhost:3000/api/health
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get "connection refused" errors:
```bash
# Check PostgreSQL status
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Check if listening
sudo netstat -plnt | grep 5432
```

### Redis Connection Issues

If backend shows Redis errors:
```bash
# Check Redis status
sudo service redis-server status

# Start if not running
sudo service redis-server start

# Test connection
redis-cli ping
```

### Backend Won't Start

Check error logs:
```bash
cat backend/logs/error.log | tail -20
```

Common issues:
- Redis not running → Start Redis first
- PostgreSQL not running → Start PostgreSQL first
- Port 3000 already in use → Kill existing process or change port

### Database Schema Issues

If tables are corrupted or incomplete, you can reset:
```bash
# WARNING: This will delete all data!
psql -U postgres -d ecg_digital_city -f backend/scripts/rollback-sistema-interacciones.sql
psql -U postgres -d ecg_digital_city -f backend/scripts/sistema-interacciones-avanzadas-schema.sql
```

## Quick Start Commands (All-in-One)

```bash
# From WSL
cd /mnt/c/xampp/htdocs/ecg-digital-city

# 1. Start services
sudo service postgresql start
sudo service redis-server start

# 2. Verify installation
bash backend/scripts/verify-installation.sh

# 3. Create missing table if needed
psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql

# 4. Start backend
cd backend
npm run dev
```

## Next Steps After Backend is Running

1. Test all API endpoints with Postman or curl
2. Run property tests: `npm test -- --testPathPattern=properties`
3. Run unit tests: `npm test -- --testPathPattern=unit`
4. Begin frontend implementation (Phases 5-24)

## Support

If you encounter issues:
1. Check `backend/logs/error.log` for detailed errors
2. Verify all services are running (PostgreSQL, Redis)
3. Ensure all database tables and columns exist
4. Check that port 3000 is available

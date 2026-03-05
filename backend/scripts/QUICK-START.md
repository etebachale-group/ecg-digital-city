# Quick Start Guide - Sistema de Interacciones Avanzadas

## 🎯 Estado Actual

Según tu terminal output:
- ✅ PostgreSQL corriendo
- ✅ 4/5 tablas creadas (falta `object_triggers`)
- ❓ Columnas de avatar no verificadas
- ❌ Redis NO corriendo
- ❌ Backend NO corriendo

## ⚡ Inicio Rápido (1 Comando)

### Desde WSL:
```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city
bash backend/scripts/start-backend.sh
```

Este script hace TODO automáticamente:
1. Inicia PostgreSQL y Redis
2. Crea tabla `object_triggers` si falta
3. Agrega columnas de avatar si faltan
4. Verifica instalación
5. Inicia backend en puerto 3000

### Desde PowerShell:
```powershell
cd C:\xampp\htdocs\ecg-digital-city
.\backend\scripts\start-backend.ps1
```

## 🔧 Inicio Manual (Si prefieres paso a paso)

```bash
# 1. Iniciar servicios
sudo service postgresql start
sudo service redis-server start

# 2. Crear tabla faltante
psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql

# 3. Agregar columnas de avatar
psql -U postgres -d ecg_digital_city << 'EOF'
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER;
EOF

# 4. Iniciar backend
cd backend
npm run dev
```

## ✅ Verificar que Funciona

### Test 1: Backend responde
```bash
curl http://localhost:3000/api/objects/office/1
```

### Test 2: Verificar tablas
```bash
psql -U postgres -d ecg_digital_city -c "\dt *interact*"
```
Deberías ver 5 tablas.

### Test 3: Verificar columnas de avatar
```bash
psql -U postgres -d ecg_digital_city -c "\d avatars" | grep current_state
```
Deberías ver la columna `current_state`.

### Test 4: Ejecutar tests
```bash
cd backend
npm test
```

## 🐛 Problemas Comunes

### "Redis connection refused"
```bash
sudo service redis-server start
redis-cli ping  # Debe devolver PONG
```

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

### "Table object_triggers does not exist"
```bash
psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql
```

## 📊 Backend Completado (100%)

- ✅ 5 tablas de base de datos
- ✅ 5 columnas en tabla avatars
- ✅ 3 servicios backend
- ✅ 11 endpoints REST API
- ✅ Socket.IO handlers
- ✅ 6 property test suites (20 iteraciones)
- ✅ 9 unit test suites
- ✅ Scripts de instalación

## 🚀 Próximo Paso

Una vez que el backend esté corriendo:
1. Verificar que todos los tests pasen
2. Probar endpoints con curl o Postman
3. Comenzar implementación del frontend (Fases 5-24)

## 📁 Scripts Disponibles

- `start-backend.sh` - Inicio automático completo (WSL)
- `start-backend.ps1` - Inicio automático completo (PowerShell)
- `verify-installation.sh` - Verificar estado de instalación
- `create-missing-table.sql` - Crear tabla object_triggers
- `sistema-interacciones-avanzadas-schema.sql` - Schema completo
- `rollback-sistema-interacciones.sql` - Rollback completo

## 💡 Comando Más Rápido

```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city && bash backend/scripts/start-backend.sh
```

¡Eso es todo! 🎉

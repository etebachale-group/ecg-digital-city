# ¿Qué Hacer Ahora? - Sistema de Interacciones Avanzadas

## 📊 Estado Actual

### ✅ Completado (Backend - 100%)
- 5 tablas de base de datos creadas
- 5 columnas agregadas a la tabla `avatars`
- 3 servicios backend implementados
- 11 endpoints REST API
- Manejadores Socket.IO para tiempo real
- 6 suites de property tests (20 iteraciones cada una)
- 9 suites de unit tests
- Scripts de instalación y rollback

### ❌ Pendiente (Frontend - 0%)
- Fases 5-24 del plan de implementación
- Sistema de pathfinding (A*)
- Sistema de depth sorting
- Gestión de estados de avatar
- Manejador de interacciones
- Componentes React
- Integración con sistemas existentes

## 🚀 Pasos Inmediatos

### Opción 1: Desde WSL (Recomendado)

```bash
# Navegar al proyecto
cd /mnt/c/xampp/htdocs/ecg-digital-city

# Ejecutar script de inicio completo
bash backend/scripts/start-backend.sh
```

Este script automáticamente:
1. ✅ Inicia PostgreSQL
2. ✅ Inicia Redis
3. ✅ Crea la tabla `object_triggers` si falta
4. ✅ Agrega columnas de avatar si faltan
5. ✅ Verifica la instalación
6. ✅ Inicia el backend en puerto 3000

### Opción 2: Desde PowerSll (Windows)

```powershell
# Navegar al proyecto
cd C:\xampp\htdocs\ecg-digital-city

# Ejecutar script de inicio
.\backend\scripts\start-backend.ps1
```

### Opción 3: Manual (Paso a Paso)

```bash
# 1. Iniciar servicios
sudo service postgresql start
sudo service redis-server start

# 2. Verificar instalación
bash backend/scripts/verify-installation.sh

# 3. Crear tabla faltante (si es necesario)
psql -U postgres -d ecg_digital_city -f backend/scripts/create-missing-table.sql

(si es necesario)
psql -U postgres -d ecg_digital_city << 'EOF'
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER;
EOF

# 5. Iniciar backend
cd backend
npm run dev
```

unciona

### 1. Verificar Backend

Una vez que el backend esté corriendo, desde otra terminal WSL:

```bash
# Test endpoint de objetos interactivos
curl http://localhost:3000/api/objects/office/1

# Debería devolver un array (vacío o con objetos)
```

### 2. Ejecutar Tests

```bash
cd backend

# Property tests (20 iteraciones cada uno)
npm test -- --testPathPattern=properties

# Unit tests
npm test -- --testPathPattern=unit

# Integration tests
npm test -- --testPathPattern=integration

# Todos los tests
npm test
```

### 3. Verificar Base de Datos

```bash
# Verificar todas las tablas
psql -U postgres -d ecg_digital_city -c "\dt *interact*"

# Debería mostrar:
# - interaction_logs
# - interaction_nodes
# - interaction_queue
# - interactive_objects
# - object_triggers

# Verificar columnas de avatars
psql -U postgres -d ecg_digital_city -c "\d avatars" | grep -E "(current_state|previous_state|state_changed_at|interacting_with|sitting_at)"

# Debería mostrar las 5 columnas nuevas
```

## 📁 Arceados

### Scripts de Base de Datos
- `backend/scripts/sistema-interacciones-avanzadas-schema.sql` - Schema completo (600+ líneas)
- `backend/scripts/install-sistema-interacciones.sh` - Instalador automático
- `backend/scripts/rollback-sistema-interacciones.sql` - Script de rollback
- `backend/scripts/create-missing-table.sql` - Crear tabla object_triggers
- `backend/scripts/verify-installation.sh` - Verificar instalación
- `backend/scripts/start-backend.sh` - Iniciar backend (WSL)
- `backend/scripts/start-bacd.ps1` - Iniciar backend (PowerShell)

### Documentación
- `backend/scripts/README-SISTEMA-INTERACCIONES.md` - Guía completa de instalación
- `backend/scripts/startup-guide.md` - Guía de inicio
- `.kiro/specs/sistema-interacciones-avanzadas/requirements.md` - Requisitos
- `.kiro/specs/sistema-interacciones-avanzadas/design.md` - Diseño
- `.kiro/specs/sistema-interacciones-avanzadas/tasks.md` - Plan de implementación

### Código Backend
- `backend/src/services/Interacti
- `backend/src/services/InteractionService.js` - Procesamiento de interacciones
- `backend/src/services/AvatarStateService.js` - Gestión de estados
- `backend/src/routes/interactiveObjects.js` - Endpoints REST
- `backend/src/models/InteractiveObject.js` - Modelo Sequelize
- `backend/src/models/InteractionNode.js` - Modelo Sequelize
- `backend/src/models/ObjectTrigger.js` - Modelo Sequelize
- `backend/src/models/InteractionQueue.js` - Modelo Sequelize
- `backend/src/models/InteractionLog.js` - Modelo Sequelize

### Tests
- `backend/tests/properties/InteractiveObjectService.properties.test.js`
- `backend/tests/properties/InteractionService.properties.test.js`
- `backend/tests/properties/AvatarStateService.properties.test.js`
- `backend/tests/properties/database-schema.properties.test.js`
- `backend/tests/unit/InteractiveObjectService.test.js`
- `backend/tests/unit/InteractionService.test.js`
- `backend/tests/unit/AvatarStateService.test.js`
- `backend/tests/unit/models.test.js`
- `backend/tests/integration/intebjects.routes.test.js`

## 🎯 Próximos Pasos (Frontend)

Una vez que el backend esté funcionando correctamente:

### Fase 5: Sistema de Pathfinding
- Implementar NavigationMesh (grid-based)
- Implementar PathfindingEngine (A*)
- Path simplification y smoothing
- Dynamic path recalculation

### Fase 6: Sistema de Depth Sorting
- Implementar DepthSorter
- Z-index calculation
- SpatialPartitioner para optimización

### Fase 7: Gestión de Estados de Avatar
- AvatarStateManager (state machine)
- Sincronización Socket.IO
- Transiciones de estado

### Fase 8: Manejador de Interacciones
- InteractionHandler (raycasting)
- Click detection
- Proximity detection
- Visual feedback

### Fases 9-24: Componentes e Integración
- Componentes React
- Integración con sistemas existentes
- UI/UX
- Admin panel

## 🐛 Solución de Problemas

### Backend no inicia

**Error: Redis connection refused**
```bash
sudo service redis-server start
redis-cli ping  # Debería devolver PONG
```

**Error: PostgreSQL connection refused**
```bash
sudo service postgresql start
psql -U postgres -d ecg_digital_city -c "SELECT 1"
```

**Error: Port 3000 already in use**
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### Tests fallan

**Error: Database connection**
cg_digital_city -c "\d interactive_objects"

# Contar registros
psql -U postgres -d ecg_digital_city -c "SELECT COUNT(*) FROM interactive_objects;"
```

## 🎉 ¡Listo!

Una vez que el backend esté corriendo y todos los tests pasen, estarás listo para comenzar con la implementación del frontend. El backend está 100% completo y probado.

**Comando rápido para empezar:**
```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city
bash backend/scripts/start-backend.sh
```

¡Buena suerte! 🚀
INTEGER;
EOF
```

## 📞 Comandos Útiles

```bash
# Ver logs del backend
tail -f backend/logs/error.log
tail -f backend/logs/combined.log

# Verificar servicios
sudo service postgresql status
sudo service redis-server status

# Reiniciar servicios
sudo service postgresql restart
sudo service redis-server restart

# Conectar a PostgreSQL
psql -U postgres -d ecg_digital_city

# Conectar a Redis
redis-cli

# Ver tablas
psql -U postgres -d ecg_digital_city -c "\dt"

# Ver estructura de tabla
psql -U postgres -d e ecg_digital_city -f backend/scripts/create-missing-table.sql
```

### Columnas de avatar faltan

```bash
psql -U postgres -d ecg_digital_city << 'EOF'
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at - Asegúrate de que PostgreSQL esté corriendo
- Verifica credenciales en `backend/.env`

**Error: Redis connection**
- Asegúrate de que Redis esté corriendo
- Verifica configuración en `backend/.env`

### Tabla object_triggers falta

```bash
psql -U postgres -d
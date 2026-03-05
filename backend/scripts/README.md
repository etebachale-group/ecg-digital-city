# Scripts de Base de Datos - ECG Digital City

Este directorio contiene scripts para configurar y gestionar la base de datos PostgreSQL del Sistema de Interacciones Avanzadas.

## 📋 Contenido

- `setup-database.sql` - Script SQL completo para crear todas las tablas e índices
- `reset-database.sql` - Script para eliminar todas las tablas del sistema de interacciones
- `seed-interactions.sql` - Script para insertar datos de prueba
- `run-postgres-setup.sh` - Script Bash para ejecutar la configuración (Linux/Mac/WSL)
- `run-postgres-setup.ps1` - Script PowerShell para ejecutar la configuración (Windows)
- `migrate.js` - Script Node.js para ejecutar migraciones de Sequelize

## 🚀 Inicio Rápido

### Opción 1: Usando Scripts Automatizados

#### En Windows (PowerShell):
```powershell
# Configuración completa (crear tablas + datos de prueba)
.\backend\scripts\run-postgres-setup.ps1 -Action all

# Solo insertar datos de prueba
.\backend\scripts\run-postgres-setup.ps1 -Action seed

# Solo ejecutar migraciones
.\backend\scripts\run-postgres-setup.ps1 -Action migrate

# Reset completo (eliminar todo)
.\backend\scripts\run-postgres-setup.ps1 -Action reset
```

#### En Linux/Mac/WSL (Bash):
```bash
# Dar permisos de ejecución
chmod +x backend/scripts/run-postgres-setup.sh

# Configuración completa
./backend/scripts/run-postgres-setup.sh all

# Solo insertar datos de prueba
./backend/scripts/run-postgres-setup.sh seed

# Solo ejecutar migraciones
./backend/scripts/run-postgres-setup.sh migrate

# Reset completo
./backend/scripts/run-postgres-setup.sh reset
```

### Opción 2: Usando psql Directamente

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE ecg_digital_city;"

# 2. Ejecutar script de setup
psql -U postgres -d ecg_digital_city -f backend/scripts/setup-database.sql

# 3. Insertar datos de prueba (opcional)
psql -U postgres -d ecg_digital_city -f backend/scripts/seed-interactions.sql
```

### Opción 3: Usando Migraciones de Sequelize

```bash
cd backend
npm run migrate
```

## 📊 Estructura de la Base de Datos

### Tablas Creadas

1. **interactive_objects** - Objetos interactivos en el mundo virtual
   - Tipos: chair, table, door, computer, whiteboard, coffee_machine, etc.
   - Campos: position, rotation, scale, state, config

2. **interaction_nodes** - Puntos de interacción en objetos
   - Define dónde y cómo los usuarios interactúan
   - Gestiona ocupación y cola de espera

3. **object_triggers** - Lógica de scripts asociada a objetos
   - Tipos: grant_xp, state_change, unlock_achievement, teleport
   - Soporta prioridades y condiciones

4. **interaction_queue** - Sistema de cola para objetos ocupados
   - FIFO (First In, First Out)
   - Auto-expiración después de 60 segundos

5. **interaction_logs** - Historial de interacciones
   - Registro de todas las interacciones (exitosas y fallidas)
   - Tracking de XP otorgado

6. **avatars** (extensión) - Columnas agregadas:
   - `current_state` - Estado actual del avatar
   - `previous_state` - Estado anterior
   - `state_changed_at` - Timestamp del último cambio
   - `interacting_with` - ID del objeto con el que interactúa
   - `sitting_at` - ID del nodo donde está sentado

## 🔧 Configuración

### Requisitos Previos

1. PostgreSQL 14+ instalado y corriendo
2. Usuario `postgres` con permisos de superusuario
3. Node.js 18+ (para migraciones de Sequelize)

### Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la configuración correcta:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=postgres
DB_PASSWORD=postgres123
```

### Verificar PostgreSQL

#### Windows:
```powershell
# Verificar si está corriendo
pg_isready -h localhost -p 5432 -U postgres

# Iniciar servicio (si no está corriendo)
# Opción 1: Services.msc -> PostgreSQL -> Start
# Opción 2: pgAdmin -> Start Server
```

#### Linux/WSL:
```bash
# Verificar si está corriendo
pg_isready -h localhost -p 5432 -U postgres

# Iniciar servicio
sudo service postgresql start

# Ver estado
sudo service postgresql status
```

## 📦 Datos de Prueba

El script `seed-interactions.sql` inserta:

- **11 objetos interactivos**:
  - 4 sillas (2 ejecutivas, 2 de reunión)
  - 2 mesas (reuniones, escritorio)
  - 2 puertas (principal, sala de reuniones)
  - 1 computadora
  - 1 pizarra
  - 1 máquina de café

- **15 nodos de interacción**:
  - Posiciones de sentado para sillas
  - Puntos de interacción para puertas
  - Múltiples posiciones para pizarra

- **17 triggers configurados**:
  - Otorgamiento de XP
  - Cambios de estado
  - Achievements
  - Condiciones especiales

## 🧪 Testing

Para ejecutar los tests con la base de datos configurada:

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- tests/unit/InteractionService.test.js
npm test -- tests/properties/InteractionService.properties.test.js

# Ejecutar con coverage
npm run test:coverage
```

## 🔄 Migraciones

### Crear una nueva migración:
```bash
cd backend
npx sequelize-cli migration:generate --name nombre-de-la-migracion
```

### Ejecutar migraciones pendientes:
```bash
npm run migrate
```

### Revertir última migración:
```bash
npm run migrate:undo
```

### Ver estado de migraciones:
```bash
npx sequelize-cli db:migrate:status
```

## 🗑️ Limpieza y Reset

### Reset Completo (elimina todo):
```bash
# Windows
.\backend\scripts\run-postgres-setup.ps1 -Action reset

# Linux/Mac/WSL
./backend/scripts/run-postgres-setup.sh reset
```

### Reset y Recrear:
```bash
# Windows
.\backend\scripts\run-postgres-setup.ps1 -Action reset
.\backend\scripts\run-postgres-setup.ps1 -Action all

# Linux/Mac/WSL
./backend/scripts/run-postgres-setup.sh reset
./backend/scripts/run-postgres-setup.sh all
```

## 🐛 Troubleshooting

### Error: "connection refused"
- Verifica que PostgreSQL está corriendo
- Verifica el puerto (default: 5432)
- Verifica las credenciales en `.env`

### Error: "database does not exist"
- Ejecuta primero: `psql -U postgres -c "CREATE DATABASE ecg_digital_city;"`
- O usa el script automatizado que lo crea automáticamente

### Error: "permission denied"
- Verifica que el usuario tiene permisos
- En Windows, ejecuta PowerShell como Administrador
- En Linux, usa `sudo` si es necesario

### Error: "relation already exists"
- Ejecuta el script de reset primero
- O elimina manualmente las tablas conflictivas

### Tests fallan con "connection refused"
- Asegúrate de que PostgreSQL está corriendo
- Verifica que la base de datos existe
- Ejecuta el script de setup antes de los tests

## 📚 Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

## 🤝 Contribuir

Al agregar nuevas tablas o modificar el esquema:

1. Crea una nueva migración con Sequelize
2. Actualiza `setup-database.sql` con los cambios
3. Actualiza `reset-database.sql` si es necesario
4. Actualiza `seed-interactions.sql` con datos de ejemplo
5. Actualiza este README con la documentación

## 📝 Notas

- Los scripts SQL usan `IF NOT EXISTS` para ser idempotentes
- Los triggers automáticos actualizan `updated_at` en cada cambio
- Los índices están optimizados para las consultas más comunes
- La función `cleanup_expired_queue_entries()` debe ejecutarse periódicamente (cron job o scheduler)

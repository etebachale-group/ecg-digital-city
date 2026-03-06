# Instalación del Sistema de Interacciones Avanzadas

## Opción 1: Instalación Automática en Render (Recomendado)

El sistema ya está configurado para crear las tablas automáticamente al iniciar. No necesitas hacer nada manual.

### ¿Cómo funciona?
1. Render ejecuta el servidor
2. El servidor detecta que es producción
3. Ejecuta `sequelize.sync()` que crea las tablas base
4. Las tablas del Sistema de Interacciones se crean automáticamente

### Estado Actual
✅ Servidor corriendo en Render
✅ Base de datos PostgreSQL conectada
✅ Tablas base creadas automáticamente
⏳ Sistema de Interacciones pendiente (se activará después)

---

## Opción 2: Instalación Manual (Solo si necesitas)

Si quieres instalar el Sistema de Interacciones manualmente en tu base de datos local o en Render:

### Paso 1: Conectar a la Base de Datos

**En WSL/Linux:**
```bash
psql -h dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com \
     -U ecg_user \
     -d ecg_digital_city
```

**Contraseña:** `KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8`

### Paso 2: Ejecutar el Script

```bash
psql -h dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com \
     -U ecg_user \
     -d ecg_digital_city \
     -f backend/scripts/sistema-interacciones-avanzadas-schema.sql
```

### Paso 3: Verificar Instalación

```sql
-- Ver todas las tablas
\dt

-- Verificar tablas del sistema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%interact%';
```

Deberías ver:
- `interactive_objects`
- `interaction_nodes`
- `object_triggers`
- `interaction_queue`
- `interaction_logs`

---

## Opción 3: Instalación Local (Desarrollo)

Si estás trabajando en local con PostgreSQL:

### Paso 1: Asegúrate que PostgreSQL esté corriendo
```bash
# En WSL
sudo service postgresql start
```

### Paso 2: Conectar a tu base de datos local
```bash
psql -U postgres -d ecg_digital_city
```

### Paso 3: Ejecutar el script
```bash
psql -U postgres -d ecg_digital_city -f backend/scripts/sistema-interacciones-avanzadas-schema.sql
```

---

## ¿Qué Crea el Script?

### 5 Tablas Principales:
1. **interactive_objects** - Objetos interactivos (sillas, puertas, mesas)
2. **interaction_nodes** - Puntos de interacción en objetos
3. **object_triggers** - Lógica de triggers (XP, logros, teletransporte)
4. **interaction_queue** - Cola de espera para objetos ocupados
5. **interaction_logs** - Registro de todas las interacciones

### Extensiones a Tabla Existente:
- **avatars** - 5 columnas nuevas para estado de avatar:
  - `current_state` (idle, walking, sitting, etc.)
  - `previous_state`
  - `state_changed_at`
  - `interacting_with`
  - `sitting_at`

### Funcionalidades Adicionales:
- 15+ índices para optimización
- 3 triggers automáticos
- 3 vistas útiles para consultas
- Funciones de limpieza automática

---

## Verificación Rápida

Después de instalar, ejecuta esto para verificar:

```sql
-- Contar tablas del sistema
SELECT COUNT(*) as tablas_creadas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'interactive_objects',
    'interaction_nodes',
    'object_triggers',
    'interaction_queue',
    'interaction_logs'
  );
-- Debe retornar: 5

-- Ver columnas nuevas en avatars
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'avatars' 
  AND column_name LIKE '%state%' 
     OR column_name LIKE '%interacting%' 
     OR column_name LIKE '%sitting%';
-- Debe retornar: 5 columnas
```

---

## Troubleshooting

### Error: "relation already exists"
✅ Normal - significa que la tabla ya existe. El script es seguro de re-ejecutar.

### Error: "permission denied"
❌ Verifica que el usuario tenga permisos de CREATE TABLE.

### Error: "could not connect"
❌ Verifica las credenciales y que la base de datos esté accesible.

---

## Próximos Pasos

Una vez instalado el esquema:
1. ✅ Las tablas están listas
2. ✅ Los servicios backend pueden usarlas
3. ✅ Los endpoints API funcionarán
4. ⏳ Activar migraciones en `backend/src/server.js` (línea 71)
5. ⏳ Crear objetos interactivos desde el frontend

---

## Ubicación del Script

📁 `backend/scripts/sistema-interacciones-avanzadas-schema.sql`

Este script es:
- ✅ Idempotente (seguro de ejecutar múltiples veces)
- ✅ Con comentarios detallados
- ✅ Con verificaciones de existencia
- ✅ Con datos de ejemplo (comentados)

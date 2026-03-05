# Sistema de Interacciones Avanzadas - Scripts de Base de Datos

Este directorio contiene los scripts SQL necesarios para instalar, actualizar y revertir el esquema de base de datos del Sistema de Interacciones Avanzadas.

## 📋 Contenido

- `sistema-interacciones-avanzadas-schema.sql` - Script principal de instalación
- `install-sistema-interacciones.sh` - Script bash para instalación automatizada
- `rollback-sistema-interacciones.sql` - Script para revertir cambios
- `README-SISTEMA-INTERACCIONES.md` - Este archivo

## 🚀 Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

```bash
# Desde el directorio backend/scripts
chmod +x install-sistema-interacciones.sh
./install-sistema-interacciones.sh
```

El script usará las credenciales de tu archivo `.env` automáticamente.

### Opción 2: Manual con psql

```bash
# Desde el directorio backend/scripts
psql -h 172.25.8.183 -p 5432 -U postgres -d ecg_digital_city -f sistema-interacciones-avanzadas-schema.sql
```

### Opción 3: Desde Windows PowerShell

```powershell
# Desde el directorio backend/scripts
wsl psql -h 172.25.8.183 -p 5432 -U postgres -d ecg_digital_city -f sistema-interacciones-avanzadas-schema.sql
```

## 📦 ¿Qué se Instala?

El script crea las siguientes tablas:

### 1. `interactive_objects`
Objetos interactivos en el mundo virtual (sillas, puertas, mesas, muebles).

**Columnas principales:**
- `id` - Identificador único
- `office_id` - Oficina donde está el objeto
- `object_type` - Tipo: chair, door, table, furniture
- `name` - Nombre del objeto
- `position`, `rotation`, `scale` - Transformación 3D (JSONB)
- `state` - Estado actual del objeto (JSONB)
- `config` - Configuración específica (JSONB)

### 2. `interaction_nodes`
Puntos específicos de interacción en objetos.

**Columnas principales:**
- `id` - Identificador único
- `object_id` - Objeto al que pertenece
- `position` - Posición 3D relativa (JSONB)
- `required_state` - Estado de avatar requerido
- `is_occupied` - Si está ocupado
- `occupied_by` - Usuario que lo ocupa

### 3. `object_triggers`
Lógica que se ejecuta al interactuar con objetos.

**Columnas principales:**
- `id` - Identificador único
- `object_id` - Objeto al que pertenece
- `trigger_type` - Tipo: state_change, grant_xp, unlock_achievement, teleport
- `trigger_data` - Datos del trigger (JSONB)
- `priority` - Orden de ejecución
- `condition` - Condiciones para ejecutar (JSONB)

### 4. `interaction_queue`
Cola de espera para objetos ocupados (FIFO).

**Columnas principales:**
- `id` - Identificador único
- `object_id` - Objeto en cola
- `node_id` - Nodo específico
- `user_id` - Usuario en cola
- `position` - Posición en la cola
- `expires_at` - Expiración (60 segundos)

### 5. `interaction_logs`
Registro de todas las interacciones para análisis.

**Columnas principales:**
- `id` - Identificador único
- `user_id` - Usuario que interactuó
- `object_id` - Objeto con el que interactuó
- `interaction_type` - Tipo de interacción
- `success` - Si fue exitosa
- `xp_granted` - XP otorgado

### 6. Extensiones de `avatars`
Nuevas columnas agregadas a la tabla existente:

- `current_state` - Estado actual (idle, walking, running, sitting, interacting, dancing)
- `previous_state` - Estado anterior
- `state_changed_at` - Timestamp del cambio
- `interacting_with` - ID del objeto con el que interactúa
- `sitting_at` - ID del nodo donde está sentado

## 🔧 Características Adicionales

### Triggers Automáticos
- `update_updated_at_column()` - Actualiza `updated_at` automáticamente
- `update_queue_positions()` - Actualiza posiciones en cola al salir alguien
- `cleanup_expired_queue_entries()` - Limpia entradas expiradas

### Vistas Útiles
- `interactive_objects_with_node_count` - Objetos con conteo de nodos
- `interaction_queue_with_users` - Cola con información de usuarios
- `user_interaction_stats` - Estadísticas por usuario

### Índices Optimizados
Todos los índices necesarios para consultas rápidas:
- Índices por office_id, object_type, user_id
- Índices compuestos para consultas complejas
- Índices para ordenamiento y filtrado

## 🔄 Rollback (Revertir Cambios)

Si necesitas revertir los cambios:

```bash
# ADVERTENCIA: Esto eliminará TODOS los datos del sistema de interacciones
psql -h 172.25.8.183 -p 5432 -U postgres -d ecg_digital_city -f rollback-sistema-interacciones.sql
```

El script de rollback:
- ✅ Elimina todas las tablas creadas
- ✅ Elimina las columnas agregadas a `avatars`
- ✅ Elimina triggers y funciones
- ✅ Elimina vistas
- ✅ Verifica que todo fue eliminado correctamente

## ✅ Verificación Post-Instalación

Después de instalar, verifica que todo funciona:

### 1. Verificar Tablas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%interact%'
ORDER BY table_name;
```

Deberías ver:
- interaction_logs
- interaction_nodes
- interaction_queue
- interactive_objects
- object_triggers

### 2. Verificar Columnas de Avatars

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'avatars' 
  AND column_name IN ('current_state', 'previous_state', 'state_changed_at', 'interacting_with', 'sitting_at')
ORDER BY column_name;
```

### 3. Verificar Índices

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename LIKE '%interact%'
ORDER BY tablename, indexname;
```

### 4. Probar API

```bash
# Obtener objetos de una oficina
curl http://localhost:3000/api/objects/office/1

# Crear un objeto (requiere autenticación)
curl -X POST http://localhost:3000/api/objects \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "officeId": 1,
    "objectType": "chair",
    "name": "Silla de Prueba",
    "position": {"x": 5, "y": 0, "z": 3}
  }'
```

## 📊 Datos de Ejemplo

El script incluye datos de ejemplo comentados. Para insertarlos, edita el archivo SQL y descomenta la sección "DATOS DE EJEMPLO".

Ejemplos incluidos:
- Silla de oficina con nodo de interacción y trigger de XP
- Puerta con nodo de interacción y trigger de cambio de estado

## 🐛 Troubleshooting

### Error: "relation already exists"

Las tablas ya existen. Opciones:
1. Ejecutar rollback primero: `rollback-sistema-interacciones.sql`
2. Eliminar manualmente: `DROP TABLE interactive_objects CASCADE;`

### Error: "permission denied"

El usuario no tiene permisos. Soluciones:
1. Usar usuario con permisos de superusuario (postgres)
2. Otorgar permisos: `GRANT ALL ON DATABASE ecg_digital_city TO tu_usuario;`

### Error: "could not connect to server"

PostgreSQL no está accesible. Verificar:
1. PostgreSQL está ejecutándose: `sudo service postgresql status`
2. Credenciales correctas en `.env`
3. Firewall permite conexión al puerto 5432

### Error: "column already exists"

Las columnas de avatars ya existen. El script maneja esto automáticamente con `IF NOT EXISTS`, pero si falla:
1. Verificar que las columnas no existen: `\d avatars`
2. Ejecutar rollback si es necesario

## 📝 Notas Importantes

### Backup

**SIEMPRE** haz un backup antes de ejecutar scripts de base de datos:

```bash
# Backup completo
pg_dump -h 172.25.8.183 -U postgres ecg_digital_city > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo de tablas específicas
pg_dump -h 172.25.8.183 -U postgres -t avatars ecg_digital_city > backup_avatars.sql
```

### Entorno de Producción

En producción:
1. Ejecutar en horario de bajo tráfico
2. Hacer backup completo primero
3. Probar en entorno de staging
4. Tener plan de rollback listo
5. Monitorear logs después de la instalación

### Migraciones Futuras

Para agregar cambios futuros:
1. Crear nuevo archivo de migración: `YYYYMMDD-descripcion.sql`
2. Documentar cambios en este README
3. Actualizar script de rollback si es necesario

## 🔗 Enlaces Útiles

- [Documentación del Sistema](../../docs/technical-specs/)
- [API Routes Documentation](../docs/api-routes-extended.md)
- [Spec Completo](.kiro/specs/sistema-interacciones-avanzadas/)

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor: `backend/logs/error.log`
2. Verifica la configuración: `backend/.env`
3. Consulta la documentación técnica
4. Revisa los tests: `backend/tests/`

## 📜 Licencia

Este código es parte del proyecto ECG Digital City.

---

**Última actualización:** 2026-03-04  
**Versión:** 1.0.0  
**Autor:** ECG Digital City Team

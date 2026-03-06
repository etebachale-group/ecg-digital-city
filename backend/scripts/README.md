# Scripts de Base de Datos

Scripts para gestionar la base de datos PostgreSQL de ECG Digital City.

## Scripts Disponibles

### `reload-database.js`
Recarga completa de la base de datos con confirmación interactiva.

```bash
node reload-database.js
# Escribir "SI" cuando pregunte
```

**Qué hace:**
- Elimina todas las tablas existentes
- Crea 19 tablas + 3 vistas
- Inserta datos iniciales (distritos, logros, misiones)
- Crea índices y triggers

### `reload-db-simple.js`
Recarga sin confirmación (para scripts automatizados).

```bash
node reload-db-simple.js
```

### `reset-and-reload-database.sql`
Script SQL completo que ejecutan los scripts de Node.js.

**Contiene:**
- Definiciones de todas las tablas
- Índices optimizados
- Triggers y funciones PL/pgSQL
- Datos iniciales (seed data)
- Vistas útiles

## Estructura de la Base de Datos

### Tablas Base (14)
- `users` - Usuarios del sistema
- `avatars` - Avatares con estados extendidos
- `companies` - Empresas
- `districts` - Distritos del mundo virtual
- `offices` - Oficinas de empresas
- `office_objects` - Objetos decorativos
- `permissions` - Permisos de oficinas
- `user_progress` - Progreso de gamificación
- `achievements` - Logros disponibles
- `user_achievements` - Logros desbloqueados
- `missions` - Misiones disponibles
- `user_missions` - Misiones asignadas
- `events` - Eventos programados
- `event_attendees` - Asistentes a eventos

### Sistema de Interacciones (5)
- `interactive_objects` - Objetos interactivos
- `interaction_nodes` - Puntos de interacción
- `object_triggers` - Triggers de objetos
- `interaction_queue` - Cola de espera
- `interaction_logs` - Logs de interacciones

### Vistas (3)
- `interactive_objects_with_node_count` - Objetos con conteo de nodos
- `interaction_queue_with_users` - Cola con info de usuarios
- `user_interaction_stats` - Estadísticas por usuario

## Datos Iniciales

### Distritos (4)
- Recepción
- Zona Corporativa
- Centro de Eventos
- Zona Social

### Logros (8)
- Primer Paso (10 XP)
- Explorador (25 XP)
- Social (30 XP)
- Constructor (50 XP)
- Empresario (100 XP)
- Veterano (200 XP)
- Maestro (500 XP)
- Leyenda (1000 XP)

### Misiones (7)
**Diarias:**
- Login Diario (10 XP)
- Explorador Diario (15 XP)
- Socializar (20 XP)
- Trabajador (25 XP)

**Semanales:**
- Networker (50 XP)
- Organizador (75 XP)
- Decorador (60 XP)

## Configuración

Los scripts usan las credenciales de `backend/.env`:

```env
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-user
DB_PASSWORD=your-password
```

## Troubleshooting

### Error: Connection terminated unexpectedly
- Verificar credenciales en `.env`
- Verificar que el host sea accesible
- Verificar que SSL esté configurado correctamente

### Error: syntax error at or near "$"
- Este error ya está resuelto
- Los scripts usan `$BODY$` en lugar de `$` para funciones PL/pgSQL

### Tablas no se crean
- Verificar que el usuario tenga permisos CREATE
- Revisar logs de PostgreSQL
- Ejecutar manualmente el SQL para ver errores específicos

## Mantenimiento

### Backup
```bash
pg_dump -h host -U user -d database > backup.sql
```

### Restore
```bash
psql -h host -U user -d database < backup.sql
```

### Ver tablas
```bash
psql -h host -U user -d database -c "\dt"
```

### Ver conteo de registros
```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

# Migración a Supabase

## Ventajas de Supabase

- ✅ PostgreSQL completo con permisos de superusuario
- ✅ Panel de administración visual
- ✅ Backups automáticos
- ✅ API REST automática
- ✅ Realtime subscriptions
- ✅ Storage para archivos
- ✅ Tier gratuito generoso (500MB DB, 2GB bandwidth)

---

## Pasos para Configurar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - **Name:** ecg-digital-city
   - **Database Password:** (guarda esta contraseña)
   - **Region:** Elige la más cercana (US East, US West, etc.)
4. Espera 2-3 minutos mientras se crea el proyecto

### 2. Obtener Credenciales

Una vez creado el proyecto, ve a **Settings > Database**:

Necesitarás estos datos:
- **Host:** `db.xxxxxxxxxxxxx.supabase.co`
- **Database name:** `postgres`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** (la que configuraste)

También en **Settings > API**:
- **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
- **anon public key:** (para el frontend si usas Supabase Auth)
- **service_role key:** (para operaciones de backend)

### 3. Ejecutar Script de Creación de Base de Datos

Tienes dos opciones:

#### Opción A: Desde el SQL Editor de Supabase (Recomendado)

1. Ve a **SQL Editor** en el panel de Supabase
2. Crea una nueva query
3. Copia y pega el contenido de `backend/scripts/reset-and-reload-database.sql`
4. Haz clic en **Run**
5. ¡Listo! Las tablas se crearán automáticamente

#### Opción B: Desde tu computadora

```bash
# Usando Node.js
cd backend/scripts
node reload-database.js

# O usando psql (si lo tienes instalado)
psql -h db.xxxxxxxxxxxxx.supabase.co -U postgres -d postgres -f reset-and-reload-database.sql
```

### 4. Configurar Variables de Entorno en Render

Ve a tu servicio en Render > **Environment**:

Actualiza estas variables:
```
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase
```

### 5. Actualizar .env Local (Opcional)

Si quieres usar Supabase también en desarrollo local:

```env
# backend/.env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase
```

---

## Script Automatizado

He creado un script que te ayudará con la migración:

```bash
cd backend/scripts
node migrate-to-supabase.js
```

Este script:
1. Te pedirá las credenciales de Supabase
2. Probará la conexión
3. Ejecutará el script de creación de base de datos
4. Verificará que todo esté correcto

---

## Verificación

Después de la migración, verifica en Supabase:

1. Ve a **Table Editor**
2. Deberías ver 18 tablas:
   - users
   - avatars
   - companies
   - districts
   - offices
   - office_objects
   - permissions
   - user_progress
   - achievements
   - user_achievements
   - missions
   - user_missions
   - events
   - event_attendees

3. Ve a **SQL Editor** y ejecuta:
```sql
SELECT 
  'districts' as tabla, COUNT(*) as registros FROM districts
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'missions', COUNT(*) FROM missions;
```

Deberías ver:
- districts: 4
- achievements: 8
- missions: 7

---

## Ventajas Adicionales de Supabase

### 1. Panel de Administración
- Ver y editar datos directamente
- Ejecutar queries SQL
- Ver logs en tiempo real

### 2. Backups Automáticos
- Backups diarios automáticos
- Restauración con un clic

### 3. Realtime (Opcional)
Si quieres usar Supabase Realtime en lugar de Socket.IO:
```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

supabase
  .channel('avatars')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'avatars' 
  }, (payload) => {
    console.log('Avatar actualizado:', payload)
  })
  .subscribe()
```

### 4. Storage
Para avatares, logos de empresas, etc.:
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123.png', file)
```

---

## Costos

**Tier Gratuito:**
- 500 MB de base de datos
- 2 GB de bandwidth
- 1 GB de storage
- Backups por 7 días

**Pro ($25/mes):**
- 8 GB de base de datos
- 50 GB de bandwidth
- 100 GB de storage
- Backups por 30 días

Para tu proyecto, el tier gratuito es más que suficiente para empezar.

---

## Próximos Pasos

1. ✅ Crear proyecto en Supabase
2. ✅ Ejecutar script de base de datos
3. ✅ Actualizar variables de entorno en Render
4. ✅ Hacer deploy
5. ✅ Probar registro de usuarios

---

## Rollback (Si algo sale mal)

Si necesitas volver a Render PostgreSQL:
1. Ve a Render > Environment
2. Restaura las variables anteriores:
   ```
   DB_HOST=dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
   DB_NAME=ecg_digital_city
   DB_USER=ecg_user
   DB_PASSWORD=KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
   ```
3. Redeploy

---

¿Listo para empezar? 🚀

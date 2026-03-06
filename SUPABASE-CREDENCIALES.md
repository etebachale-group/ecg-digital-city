# Credenciales de Supabase - ECG Digital City

## 🔐 Información de Conexión

```
Host: db.nqpsvrfehtmjcvovbqal.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: mm2grndBfGsVgmEf
```

## 📝 Connection String Completa

```
postgresql://postgres:mm2grndBfGsVgmEf@db.nqpsvrfehtmjcvovbqal.supabase.co:5432/postgres
```

---

## ⏳ Estado Actual

El proyecto de Supabase se está creando. Esto puede tomar 2-5 minutos.

### Para verificar si está listo:

```bash
cd backend/scripts
node test-supabase-connection.js
```

Cuando veas "✅ ¡Conexión exitosa!", el proyecto estará listo.

---

## 🚀 Pasos Siguientes (Cuando esté listo)

### 1. Crear Base de Datos

**Opción A - SQL Editor en Supabase (Recomendado):**

1. Ve a tu proyecto en Supabase
2. Clic en **SQL Editor** (icono `</>` en el menú lateral)
3. Clic en **"New query"**
4. Abre el archivo: `backend/scripts/reset-and-reload-database.sql`
5. Copia TODO el contenido (Ctrl+A, Ctrl+C)
6. Pégalo en el SQL Editor de Supabase (Ctrl+V)
7. Clic en **"Run"** (o presiona Ctrl+Enter)
8. ✅ Verás "Success. No rows returned"

**Opción B - Script Automatizado:**

```bash
cd backend/scripts
node run-migration.js
```

### 2. Verificar Tablas

En Supabase:
1. Ve a **Table Editor** (icono de tabla en el menú)
2. Deberías ver 18 tablas
3. Clic en **districts** → deberías ver 4 filas
4. Clic en **achievements** → deberías ver 8 filas

### 3. Configurar Render

1. Ve a https://dashboard.render.com
2. Clic en tu servicio **ecg-digital-city**
3. Ve a **Environment**
4. Edita estas variables:

```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
DB_DIALECT = postgres
```

5. Clic en **"Save Changes"**
6. Render hará redeploy automáticamente (2-3 min)

### 4. Probar la Aplicación

1. Espera a que termine el deploy
2. Ve a https://ecg-digital-city.onrender.com
3. Clic en **"Registrarse"**
4. Crea tu primer usuario
5. ✅ ¡Debería funcionar sin errores!

---

## 🔍 Verificación

Para verificar que todo esté correcto:

```bash
cd backend/scripts
node verify-supabase.js
```

Este script verificará:
- ✅ Conexión a Supabase
- ✅ Tablas creadas (18)
- ✅ Datos iniciales (distritos, logros, misiones)
- ✅ Índices y triggers

---

## 📊 Panel de Supabase

Tu proyecto: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal

Desde aquí puedes:
- Ver y editar datos en **Table Editor**
- Ejecutar queries en **SQL Editor**
- Ver logs en **Logs**
- Configurar backups en **Settings**

---

## 🆘 Troubleshooting

### "ENOTFOUND" al conectar
- El proyecto aún se está creando
- Espera 2-5 minutos y vuelve a intentar
- Verifica que el host sea correcto en Supabase > Settings > Database

### "Password authentication failed"
- La contraseña es incorrecta
- Ve a Supabase > Settings > Database > Reset database password

### "Relation does not exist"
- Las tablas no se crearon
- Ejecuta el script SQL en el SQL Editor de Supabase

---

## 💾 Backup de Credenciales Anteriores (Render)

Por si necesitas volver atrás:

```
DB_HOST=dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
```

---

**⏳ Espera 2-5 minutos y ejecuta el test de conexión nuevamente**

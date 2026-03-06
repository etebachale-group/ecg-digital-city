# ⚡ Pasos Rápidos: Conectar Render con Supabase

## 🎯 Problema
Render no puede conectarse a Supabase por IPv6 (`ENETUNREACH`)

## ✅ Solución
Usar el **Connection Pooler** de Supabase

---

## 📝 Pasos (5 minutos)

### 1. Obtener URL del Pooler en Supabase

Ve a: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal/settings/database

Busca **"Connection Pooling"** → **Transaction mode**

Copia la URL que se ve así:
```
postgresql://postgres.nqpsvrfehtmjcvovbqal:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Extrae estos valores:**
- Host: `aws-0-us-east-1.pooler.supabase.com` (o similar)
- Port: `6543`
- User: `postgres.nqpsvrfehtmjcvovbqal`
- Password: `mm2grndBfGsVgmEf`

---

### 2. Actualizar Variables en Render

Ve a: https://dashboard.render.com → Tu servicio → **Environment**

Actualiza estas 4 variables:

```
DB_HOST = aws-0-us-east-1.pooler.supabase.com
DB_PORT = 6543
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
```

**NO cambies:**
- `DB_NAME` (debe seguir siendo `postgres`)
- `DB_DIALECT` (debe seguir siendo `postgres`)

---

### 3. Guardar y Esperar

1. Clic en **"Save Changes"**
2. Render hará redeploy automáticamente
3. Espera 2-3 minutos

---

### 4. Verificar

Ve a: https://ecg-digital-city.onrender.com

Deberías poder:
- ✅ Ver la pantalla de login
- ✅ Registrar un usuario nuevo
- ✅ Iniciar sesión sin errores 500

---

## 🔄 Plan B: Volver a Render PostgreSQL

Si el pooler no funciona, vuelve a estas variables:

```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
```

Esta configuración ya funcionaba antes.

---

## 📊 Estado Actual

- ✅ Base de datos en Supabase creada (18 tablas)
- ✅ Datos iniciales cargados (distritos, logros, misiones)
- ✅ Frontend configurado correctamente
- ❌ Render no puede conectarse por IPv6
- 🔧 Solución: Usar Connection Pooler

---

## 💡 ¿Por qué el Pooler?

El Connection Pooler de Supabase:
- ✅ Funciona con IPv4 (compatible con Render)
- ✅ Optimizado para conexiones externas
- ✅ Maneja mejor las conexiones concurrentes
- ✅ Incluido en el plan gratuito

---

**Siguiente paso:** Obtén la URL del pooler en Supabase y actualiza las variables en Render.

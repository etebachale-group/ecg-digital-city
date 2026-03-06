# Fix: Error de Conexión Render → Supabase

## 🔴 Problema Identificado

El error `ENETUNREACH` indica dos problemas:

1. **DB_NAME incorrecto:** Está usando `ecg_digital_city` pero Supabase usa `postgres`
2. **Conexión IPv6:** Render está intentando IPv6 pero necesita forzar IPv4

## ✅ Solución

### Paso 1: Corregir Variables en Render

Ve a Render Dashboard → tu servicio → **Environment** y verifica/corrige:

```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_NAME = postgres                    ← IMPORTANTE: debe ser "postgres"
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
DB_DIALECT = postgres
```

### Paso 2: Agregar Variable para Forzar IPv4

Agrega una nueva variable de entorno:

```
NODE_OPTIONS = --dns-result-order=ipv4first
```

Esto fuerza a Node.js a usar IPv4 primero.

### Paso 3: Guardar y Redeploy

1. Haz clic en **"Save Changes"**
2. Confirma el redeploy
3. Espera 2-3 minutos

---

## 🔍 Verificar las Variables Actuales

Según los logs, actualmente tienes:
```
DB_HOST: db.nqpsvrfehtmjcvovbqal.supabase.co  ✅ Correcto
DB_NAME: ecg_digital_city                     ❌ Incorrecto (debe ser "postgres")
DB_USER: postgres                              ✅ Correcto
```

---

## 📋 Lista Completa de Variables Necesarias

```
NODE_ENV = production
PORT = 3000
HOST = 0.0.0.0

DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
DB_DIALECT = postgres

NODE_OPTIONS = --dns-result-order=ipv4first

JWT_SECRET = [ya existe, no tocar]
JWT_EXPIRES_IN = 7d

CORS_ORIGIN = [ya existe, no tocar]
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
LOG_LEVEL = info
```

---

## 🎯 Pasos Exactos

1. **Ve a:** https://dashboard.render.com
2. **Clic en:** ecg-digital-city
3. **Clic en:** Environment (pestaña superior)
4. **Busca:** DB_NAME
5. **Edita:** Cambia de `ecg_digital_city` a `postgres`
6. **Agrega nueva variable:**
   - Key: `NODE_OPTIONS`
   - Value: `--dns-result-order=ipv4first`
7. **Clic en:** Save Changes
8. **Espera:** 2-3 minutos para el redeploy

---

## ✅ Cómo Saber si Funcionó

En los logs de Render verás:

```
✅ Conexión a PostgreSQL establecida
✅ Base de datos conectada
✅ Servidor escuchando en puerto 3000
```

En lugar de:
```
❌ Error conectando a la base de datos: ENETUNREACH
```

---

## 🆘 Si Sigue Fallando

Prueba agregar también:

```
PGSSLMODE = require
```

Esto fuerza SSL en la conexión a PostgreSQL.

---

**El problema principal es DB_NAME. Debe ser "postgres", no "ecg_digital_city"**

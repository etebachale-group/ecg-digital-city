# Solución: Usar Supabase Connection Pooler

## 🔴 Problema

Render no puede conectarse a Supabase por IPv6. El error `ENETUNREACH` persiste.

## ✅ Solución: Connection Pooler

Supabase ofrece un **Connection Pooler** que funciona mejor con servicios como Render.

### Paso 1: Obtener URL del Pooler

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal
2. Ve a **Settings** → **Database**
3. Busca la sección **"Connection Pooling"**
4. Copia la **Connection string** en modo **Transaction**

Debería verse así:
```
postgresql://postgres.nqpsvrfehtmjcvovbqal:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Paso 2: Actualizar Variables en Render

Usa estas nuevas credenciales:

```
DB_HOST = aws-0-us-east-1.pooler.supabase.com
DB_PORT = 6543
DB_NAME = postgres
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
```

**Nota:** El usuario cambia a `postgres.nqpsvrfehtmjcvovbqal` y el puerto a `6543`.

---

## 🔄 Alternativa: Volver a Render PostgreSQL

Si el pooler tampoco funciona, podemos volver a usar la base de datos de Render que ya funcionaba:

```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
```

Y ejecutar el script de migración que ya tenemos:
```bash
cd backend/scripts
echo "SI" | node reload-database.js
```

---

## 🎯 Recomendación

**Opción 1 (Recomendada):** Volver a Render PostgreSQL
- ✅ Ya funcionaba antes
- ✅ No hay problemas de IPv6
- ✅ Mismo proveedor (Render)
- ✅ Script de migración listo

**Opción 2:** Probar Supabase Pooler
- ⚠️ Puede tener el mismo problema IPv6
- ✅ Mejor para conexiones concurrentes
- ✅ Supabase tiene mejor panel de administración

---

## 📝 ¿Qué prefieres?

1. **Volver a Render PostgreSQL** (más rápido, ya funcionaba)
2. **Probar Supabase Pooler** (puede funcionar, pero no garantizado)

Dime cuál prefieres y te ayudo a configurarlo.

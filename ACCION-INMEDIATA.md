# ⚡ Acción Inmediata

## 🔴 Problema
Render no puede conectarse a Supabase por IPv6.

## ✅ Solución
Usar el Connection Pooler de Supabase.

---

## 🎯 Qué Hacer AHORA (8 minutos)

### 1. Obtener Pooler URL (2 min)
Ve a: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal/settings/database

Busca "Connection Pooling" → "Transaction" → Copia la URL

### 2. Extraer Credenciales (1 min)
De la URL copiada, identifica:
- Host: `aws-0-us-east-1.pooler.supabase.com`
- Port: `6543`
- User: `postgres.nqpsvrfehtmjcvovbqal`
- Password: `mm2grndBfGsVgmEf`

### 3. Actualizar Render (2 min)
Ve a: https://dashboard.render.com → ecg-digital-city → Environment

Cambia estas 4 variables:
```
DB_HOST = aws-0-us-east-1.pooler.supabase.com
DB_PORT = 6543
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
```

### 4. Guardar y Esperar (3 min)
Clic en "Save Changes" → Espera el redeploy

### 5. Verificar
Ve a: https://ecg-digital-city.onrender.com

Registra un usuario → Si funciona, ¡LISTO! ✅

---

## 📚 Guías Detalladas

- **Paso a paso:** [SOLUCION-FINAL.md](SOLUCION-FINAL.md)
- **Checklist:** [CHECKLIST-SUPABASE.md](CHECKLIST-SUPABASE.md)
- **Índice completo:** [README-SUPABASE.md](README-SUPABASE.md)

---

## 🔄 Plan B (3 min)

Si no funciona, vuelve a Render PostgreSQL:

En Render → Environment:
```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
DB_PORT = 5432
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
DB_NAME = ecg_digital_city
```

Guardar → Esperar → Listo ✅

---

**Empieza aquí:** https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal/settings/database

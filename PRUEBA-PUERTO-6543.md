# ⚡ Prueba Rápida: Puerto 6543 de Supabase

## 🎯 Qué Vamos a Probar

Supabase tiene un **Connection Pooler** en el puerto `6543` que puede funcionar con IPv4.

**Tiempo:** 2 minutos

---

## 📋 Pasos

### 1. Ve a Render (30 seg)
```
https://dashboard.render.com
```

### 2. Busca tu servicio (10 seg)
- Busca "ecg-digital-city"
- Clic en el servicio

### 3. Ve a Environment (10 seg)
- Clic en "Environment" en el menú superior

### 4. Actualiza estas 3 variables (1 min)

**Cambia:**

**DB_PORT:**
- De: `5432`
- A: `6543`

**DB_USER:**
- De: `postgres`
- A: `postgres.nqpsvrfehtmjcvovbqal`

**DB_HOST:**
- Mantén: `db.nqpsvrfehtmjcvovbqal.supabase.co`

**Resumen de variables:**
```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 6543
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
DB_NAME = postgres
```

### 5. Guarda (10 seg)
- Clic en "Save Changes"

### 6. Espera (3 min)
- Render hará redeploy automáticamente
- Ve a la pestaña "Logs"

---

## ✅ Verificar Resultado

### Si Funciona:
Verás en los logs:
```
✅ Conexión a PostgreSQL establecida
✅ Base de datos tiene 18 tablas
🚀 Servidor escuchando en puerto 3000
```

**¡Éxito!** Supabase funciona con el puerto 6543.

### Si Falla:
Verás en los logs:
```
❌ Error: ENETUNREACH
```
O
```
❌ Error: Connection timeout
```

**No funciona.** Necesitamos otra solución.

---

## 🔄 Si No Funciona

Tienes 2 opciones:

### Opción A: Migrar a Railway.app (15 min)
- Railway tiene mejor soporte IPv6
- Funciona con Supabase sin problemas
- Plan free disponible
- Guía: [SOLUCION-SUPABASE-DEFINITIVA.md](SOLUCION-SUPABASE-DEFINITIVA.md) (Opción 3)

### Opción B: Nueva DB en Render (10 min)
- Quedarte en Render
- Crear nueva base de datos PostgreSQL en Render
- Sin problemas de IPv6
- Guía: [SOLUCION-DEFINITIVA-RENDER.md](SOLUCION-DEFINITIVA-RENDER.md)

---

## 🎯 Decisión

**Después de probar el puerto 6543:**

### Si funciona:
- ✅ Listo, usa Supabase
- No necesitas hacer nada más

### Si no funciona:
- ¿Prefieres usar Supabase? → Migra a Railway.app
- ¿Prefieres quedarte en Render? → Nueva DB en Render

---

**Siguiente paso:** Actualiza las variables en Render y prueba.

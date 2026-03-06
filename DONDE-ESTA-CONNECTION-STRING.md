# 🔍 Dónde Encontrar la Connection String en Supabase

## 📍 Ubicaciones Posibles

### Ubicación 1: En la Página Actual (Database Settings)

Estás en: **Project Settings** → **Database**

**Busca en esta página:**

1. **Baja en la página** (scroll down)
2. Busca una sección llamada:
   - "Connection string"
   - "Connection info"
   - "Database connection"
   - "Connection parameters"

3. Puede tener un **dropdown** con opciones:
   - URI
   - Postgres
   - JDBC
   - .NET
   - etc.

4. Selecciona **"URI"** o **"Postgres"**

5. Verás algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.nqpsvrfehtmjcvovbqal.supabase.co:5432/postgres
   ```

---

### Ubicación 2: Project Settings → API

1. En el menú lateral, busca **"Project Settings"** (icono de engranaje)
2. Clic en **"API"**
3. Baja hasta encontrar **"Database"** o **"Connection strings"**
4. Copia la connection string

---

### Ubicación 3: Home del Proyecto

1. Ve al home de tu proyecto: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal
2. Busca un botón o sección que diga **"Connect"** o **"Database"**
3. Puede haber un modal con las credenciales

---

### Ubicación 4: SQL Editor

1. En el menú lateral, busca **"SQL Editor"** (icono `</>`)
2. Arriba puede haber información de conexión
3. O un botón "Connect" que muestre las credenciales

---

## 🎯 Si No Encuentras la Connection String

**No te preocupes.** Ya sabemos las credenciales:

```
Host: db.nqpsvrfehtmjcvovbqal.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: mm2grndBfGsVgmEf
```

**Estas credenciales son correctas** porque:
- ✅ Ya las usaste para ejecutar el schema SQL
- ✅ Las 18 tablas se crearon exitosamente
- ✅ Los datos se cargaron correctamente

---

## ✅ Solución Rápida

**Usa las credenciales que ya sabemos:**

### Paso 1: Ve a Render
```
https://dashboard.render.com
```

### Paso 2: Busca "ecg-digital-city" → "Environment"

### Paso 3: Actualiza estas variables:
```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
DB_NAME = postgres
```

### Paso 4: Guarda y espera 3 minutos

### Paso 5: Verifica
```
https://ecg-digital-city.onrender.com
```

---

## ⚠️ Sobre el Problema IPv6

La conexión directa **puede fallar** con el mismo error IPv6 que antes:
```
ENETUNREACH
```

**Si eso pasa:**
1. El pooler es necesario (pero no lo encontramos)
2. O necesitamos crear nueva DB en Render

**Pero vale la pena intentarlo** porque:
- ✅ Es rápido (5 minutos)
- ✅ Puede funcionar
- ✅ Si no funciona, probamos otra cosa

---

## 🔄 Plan B: Crear Nueva DB en Render

Si Supabase no funciona por IPv6:

1. Ve a: https://dashboard.render.com
2. Clic en **"New +"** → **"PostgreSQL"**
3. Configuración:
   ```
   Name: ecg-digital-city-db
   Database: ecg_digital_city
   User: ecg_user
   Region: Oregon
   Plan: Free
   ```
4. Clic en **"Create Database"**
5. Espera 2-3 minutos
6. Copia las nuevas credenciales
7. Actualiza en tu Web Service
8. Ejecuta el script de migración:
   ```bash
   cd backend/scripts
   node reload-database.js
   ```

---

## 🎯 Recomendación

**Intenta primero con las credenciales directas de Supabase** (5 minutos).

**Si falla:** Crea nueva DB en Render (10 minutos).

---

## 📝 Checklist

- [ ] Intentar conexión directa a Supabase
- [ ] Actualizar variables en Render
- [ ] Esperar redeploy
- [ ] Verificar aplicación
- [ ] Si falla: Crear nueva DB en Render

---

**Siguiente paso:** Abre [SOLUCION-DIRECTA-SUPABASE.md](SOLUCION-DIRECTA-SUPABASE.md) y sigue los pasos.

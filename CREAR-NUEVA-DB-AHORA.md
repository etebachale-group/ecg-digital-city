# 🚨 CREAR NUEVA BASE DE DATOS AHORA

## ❌ Problema

Estás usando una base de datos que ya no existe:
```
DB_HOST: dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
Error: Connection terminated unexpectedly
```

Esta base de datos fue eliminada o suspendida.

---

## ✅ Solución: Crear Nueva Base de Datos (5 minutos)

### Paso 1: Ir a Render (30 segundos)

Abre esta URL:
```
https://dashboard.render.com
```

---

### Paso 2: Crear Nueva Base de Datos (1 minuto)

1. Clic en el botón azul **"New +"** (arriba a la derecha)

2. Selecciona **"PostgreSQL"**

3. Llena el formulario:
   ```
   Name: ecg-digital-city-db
   Database: ecg_digital_city
   User: ecg_user
   Region: Oregon
   PostgreSQL Version: 15 (o la más reciente)
   Plan: Free
   ```

4. Clic en **"Create Database"**

5. Verás "Creating..." - Espera 2-3 minutos

---

### Paso 3: Copiar Nuevas Credenciales (1 minuto)

Cuando la base de datos esté lista (estado "Available"):

1. Verás la página de la base de datos

2. Busca la sección **"Connections"** o **"Info"**

3. Verás algo como:
   ```
   Internal Database URL:
   postgresql://ecg_user:[PASSWORD]@dpg-NUEVO-ID-a.oregon-postgres.render.com/ecg_digital_city
   ```

4. **COPIA ESTAS CREDENCIALES:**
   - Host: `dpg-NUEVO-ID-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `ecg_digital_city`
   - User: `ecg_user`
   - Password: (se muestra en la página)

---

### Paso 4: Actualizar Web Service (1 minuto)

1. En Render Dashboard, busca tu servicio **"ecg-digital-city"**

2. Clic en **"Environment"**

3. **ACTUALIZA ESTAS 5 VARIABLES** con las credenciales del Paso 3:
   ```
   DB_HOST = dpg-NUEVO-ID-a.oregon-postgres.render.com
   DB_PORT = 5432
   DB_NAME = ecg_digital_city
   DB_USER = ecg_user
   DB_PASSWORD = [la que copiaste]
   ```

4. Clic en **"Save Changes"**

5. Render hará redeploy automáticamente

---

### Paso 5: Esperar Redeploy (2 minutos)

1. Ve a la pestaña **"Logs"** de tu Web Service

2. Espera a ver:
   ```
   ✅ Conexión a PostgreSQL establecida
   ✅ Base de datos tiene 0 tablas
   🚀 Servidor escuchando en puerto 3000
   ```

**Nota:** Dirá "0 tablas" porque la base de datos está vacía. Eso es NORMAL.

---

### Paso 6: Cargar Datos (Opcional - 2 minutos)

Si quieres cargar las 18 tablas con datos:

**Opción A: Desde tu máquina**
```bash
cd backend/scripts
node reload-database.js
```
Cuando pregunte, escribe: `SI`

**Opción B: SQL Editor en Render**
1. Ve a tu nueva base de datos en Render
2. Busca "SQL Editor" o "Query"
3. Copia el contenido de `backend/scripts/reset-and-reload-database.sql`
4. Pégalo y ejecuta

---

## 🎯 Resumen Visual

```
1. Render Dashboard
   ↓
2. New + → PostgreSQL
   ↓
3. Llenar formulario → Create
   ↓
4. Esperar 2-3 min
   ↓
5. Copiar credenciales
   ↓
6. Actualizar Web Service
   ↓
7. Save Changes
   ↓
8. Esperar redeploy
   ↓
9. ✅ Funciona
```

---

## ⏱️ Tiempo Total

- Crear DB: 3 minutos
- Actualizar variables: 1 minuto
- Redeploy: 2 minutos
- **Total: 6 minutos**

(Cargar datos es opcional y toma 2 minutos más)

---

## 🆘 Ayuda Rápida

### "¿Dónde está el botón New +?"
→ Arriba a la derecha en el dashboard de Render

### "¿Qué pongo en Name?"
→ `ecg-digital-city-db`

### "¿Qué pongo en Database?"
→ `ecg_digital_city`

### "¿Qué pongo en User?"
→ `ecg_user`

### "¿Qué región elijo?"
→ `Oregon` (misma que tu web service)

### "¿Dónde veo las credenciales?"
→ En la página de la base de datos, sección "Connections" o "Info"

### "¿Dónde actualizo las variables?"
→ En tu web service "ecg-digital-city" → Environment

---

## ✅ Checklist

- [ ] Abrir https://dashboard.render.com
- [ ] Clic en "New +" → "PostgreSQL"
- [ ] Llenar formulario (Name, Database, User, Region, Plan)
- [ ] Clic en "Create Database"
- [ ] Esperar 2-3 minutos
- [ ] Copiar credenciales (Host, Password)
- [ ] Ir a Web Service "ecg-digital-city"
- [ ] Clic en "Environment"
- [ ] Actualizar 5 variables
- [ ] Clic en "Save Changes"
- [ ] Esperar redeploy (2 min)
- [ ] Verificar en logs: "Conexión establecida"
- [ ] ✅ Listo

---

**IMPORTANTE:** La base de datos antigua (`dpg-d6kmk9dm5p6s73dut5f0-a`) ya NO existe. Debes crear una NUEVA.

**Siguiente paso:** Abre https://dashboard.render.com y crea la nueva base de datos AHORA.

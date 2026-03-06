# ⚡ Guía Rápida: Nueva Base de Datos en Render

## 🎯 Objetivo

Crear una nueva base de datos PostgreSQL en Render y cargar tus 18 tablas con datos.

**Tiempo total:** 10 minutos

---

## 📋 Paso 1: Crear Base de Datos (3 min)

### 1.1 Ir a Render
```
https://dashboard.render.com
```

### 1.2 Crear Nueva Base de Datos
1. Clic en **"New +"** (botón azul arriba a la derecha)
2. Selecciona **"PostgreSQL"**

### 1.3 Configuración
Llena el formulario:

```
Name: ecg-digital-city-db
Database: ecg_digital_city
User: ecg_user
Region: Oregon (mismo que tu web service)
PostgreSQL Version: 15 (o la más reciente)
```

**Plan:** Selecciona **"Free"**

### 1.4 Crear
1. Clic en **"Create Database"**
2. Espera 2-3 minutos (verás "Creating...")
3. Cuando esté lista, verás "Available"

---

## 📋 Paso 2: Copiar Credenciales (1 min)

Cuando la base de datos esté lista:

### 2.1 Ver Información de Conexión
1. Estás en la página de la base de datos
2. Busca la sección **"Connections"** o **"Info"**
3. Verás algo como:

```
Internal Database URL:
postgresql://ecg_user:XXXXXXXXXX@dpg-xxxxx-a.oregon-postgres.render.com:5432/ecg_digital_city
```

### 2.2 Copiar Credenciales
De esa URL, extrae:

- **Host:** `dpg-xxxxx-a.oregon-postgres.render.com`
- **Port:** `5432`
- **Database:** `ecg_digital_city`
- **User:** `ecg_user`
- **Password:** `XXXXXXXXXX` (la parte entre `:` y `@`)

**Copia estas credenciales en un bloc de notas.**

---

## 📋 Paso 3: Actualizar Web Service (2 min)

### 3.1 Ir a tu Web Service
1. En Render Dashboard, busca **"ecg-digital-city"** (tu web service)
2. Clic en el servicio

### 3.2 Ir a Environment
1. Clic en **"Environment"** en el menú superior

### 3.3 Actualizar Variables
Actualiza estas 5 variables con las credenciales del Paso 2:

```
DB_HOST = dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = XXXXXXXXXX
```

### 3.4 Guardar
1. Clic en **"Save Changes"**
2. Render hará redeploy automáticamente

---

## 📋 Paso 4: Esperar Redeploy (3 min)

### 4.1 Ver Logs
1. Ve a la pestaña **"Logs"**
2. Espera a ver:

```
✅ Conexión a PostgreSQL establecida
✅ Base de datos tiene 0 tablas
🚀 Servidor escuchando en puerto 3000
```

**Nota:** Dirá "0 tablas" porque la base de datos está vacía. Eso es normal.

---

## 📋 Paso 5: Cargar Tablas y Datos (2 min)

Ahora necesitas crear las 18 tablas y cargar los datos iniciales.

### Opción A: Desde tu Máquina (Recomendado)

**5.1 Actualizar .env Local**

Abre `backend/.env` y actualiza con las credenciales de Render:

```env
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=XXXXXXXXXX
```

**5.2 Ejecutar Script**

Abre una terminal en tu proyecto:

```bash
cd backend/scripts
node reload-database.js
```

Cuando pregunte "¿Estás seguro?", escribe: `SI`

Espera 1-2 minutos. Verás:

```
✅ Base de datos reiniciada
✅ 18 tablas creadas
✅ Datos iniciales cargados
```

### Opción B: Usar SQL Editor de Render

Si no puedes ejecutar desde tu máquina:

**5.1 Ir a SQL Editor**
1. En Render Dashboard, ve a tu base de datos
2. Busca **"Query"** o **"SQL Editor"** en el menú

**5.2 Ejecutar SQL**
1. Abre el archivo: `backend/scripts/reset-and-reload-database.sql`
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pégalo en el SQL Editor de Render (Ctrl+V)
4. Clic en **"Run"** o **"Execute"**
5. Espera 1-2 minutos

---

## 📋 Paso 6: Verificar (1 min)

### 6.1 Verificar Tablas en Render
1. En tu base de datos en Render
2. Ve a **"Query"** o **"SQL Editor"**
3. Ejecuta:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
4. Deberías ver 18 tablas

### 6.2 Verificar Aplicación
1. Ve a: https://ecg-digital-city.onrender.com
2. Deberías ver la pantalla de login/registro
3. Intenta registrar un usuario:
   - Nombre: Test
   - Email: test@test.com
   - Contraseña: test123
4. Si funciona → ✅ ¡Éxito!

---

## ✅ Checklist Completo

- [ ] Crear base de datos en Render (3 min)
- [ ] Copiar credenciales (1 min)
- [ ] Actualizar variables en Web Service (2 min)
- [ ] Esperar redeploy (3 min)
- [ ] Cargar tablas y datos (2 min)
- [ ] Verificar aplicación (1 min)
- [ ] ✅ Listo

---

## 🆘 Troubleshooting

### "No puedo ejecutar el script desde mi máquina"
→ Usa Opción B (SQL Editor de Render)

### "El script falla con error de conexión"
→ Verifica que las credenciales en `backend/.env` sean correctas

### "La aplicación sigue sin funcionar"
→ Verifica los logs de Render para ver el error exacto

### "No veo las 18 tablas"
→ El script no se ejecutó correctamente, intenta de nuevo

---

## 🎉 Resultado Final

Cuando termines:
- ✅ Base de datos PostgreSQL en Render
- ✅ 18 tablas creadas
- ✅ Datos iniciales cargados (distritos, logros, misiones)
- ✅ Aplicación funcionando
- ✅ Sin problemas de IPv6

---

**Siguiente paso:** Ve a https://dashboard.render.com y crea la base de datos.

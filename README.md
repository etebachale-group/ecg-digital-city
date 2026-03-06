# ✅ SOLUCIÓN: Nueva Base de Datos en Render

## 🎯 Plan

Crear una nueva base de datos PostgreSQL en Render (sin problemas de IPv6).

**Tiempo:** 10 minutos

---

## ⚡ Pasos Rápidos

### 1. Crear Base de Datos (3 min)
- Ve a: https://dashboard.render.com
- Clic en **"New +"** → **"PostgreSQL"**
- Configuración:
  ```
  Name: ecg-digital-city-db
  Database: ecg_digital_city
  User: ecg_user
  Region: Oregon
  Plan: Free
  ```
- Clic en **"Create Database"**
- Espera 2-3 minutos

### 2. Copiar Credenciales (1 min)
- Cuando esté lista, copia:
  - Host (ej: `dpg-xxxxx-a.oregon-postgres.render.com`)
  - Password

### 3. Actualizar Web Service (2 min)
- Busca "ecg-digital-city" → "Environment"
- Actualiza las 5 variables con las nuevas credenciales
- Guarda y espera 3 minutos

### 4. Cargar Datos (2 min)
- Desde tu máquina: `cd backend/scripts && node reload-database.js`
- O usa SQL Editor en Render con `reset-and-reload-database.sql`

### 5. Verificar
- Ve a: https://ecg-digital-city.onrender.com
- Registra un usuario de prueba
- ✅ ¡Listo!

---

## 📚 Guía Completa

**[GUIA-RAPIDA-RENDER-DB.md](GUIA-RAPIDA-RENDER-DB.md)** ⭐ Paso a paso detallado

---

## ✅ Ventajas

- Sin problemas de IPv6
- Mismo proveedor (Render)
- Gratis
- Simple y rápido

---

**Siguiente paso:** Abre https://dashboard.render.com y crea la base de datos.

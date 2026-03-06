# ✅ Solución Definitiva: Nueva Base de Datos en Render

## 🎯 Situación Confirmada

Tanto Render PostgreSQL como Supabase fallan con el mismo error IPv6:
```
ENETUNREACH 2a05:d018:135e:16c3:3047:14d3:9365:c91f:5432
```

**Causa:** Render solo puede conectarse por IPv4, pero ambas bases de datos intentan IPv6.

**Solución:** Crear una nueva base de datos PostgreSQL en Render (mismo proveedor = sin problemas IPv6).

---

## 📋 Pasos (10 minutos)

### Paso 1: Crear Nueva Base de Datos en Render (3 min)

1. Ve a: https://dashboard.render.com

2. Clic en **"New +"** (botón azul arriba a la derecha)

3. Selecciona **"PostgreSQL"**

4. Configuración:
   ```
   Name: ecg-digital-city-db
   Database: ecg_digital_city
   User: ecg_user
   Region: Oregon (mismo que tu web service)
   PostgreSQL Version: 15 (o la más reciente)
   Plan: Free
   ```

5. Clic en **"Create Database"**

6. Espera 2-3 minutos (verás "Creating...")

---

### Paso 2: Copiar Credenciales (1 min)

Cuando la base de datos esté lista:

1. Verás la página de la base de datos

2. Busca la sección **"Connections"** o **"Info"**

3. Verás algo como:
   ```
   Internal Database URL:
   postgresql://ecg_user:[PASSWORD]@dpg-xxxxx-a.oregon-postgres.render.com/ecg_digital_city
   ```

4. Copia estas credenciales:
   - **Host:** `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port:** `5432`
   - **Database:** `ecg_digital_city`
   - **User:** `ecg_user`
   - **Password:** (se muestra en la página)

---

### Paso 3: Actualizar Web Service (2 min)

1. En Render Dashboard, busca tu servicio **"ecg-digital-city"**

2. Clic en **"Environment"**

3. Actualiza estas 5 variables con las credenciales del Paso 2:
   ```
   DB_HOST = dpg-xxxxx-a.oregon-postgres.render.com
   DB_PORT = 5432
   DB_NAME = ecg_digital_city
   DB_USER = ecg_user
   DB_PASSWORD = [la que copiaste]
   ```

4. Clic en **"Save Changes"**

---

### Paso 4: Esperar Redeploy (3 min)

1. Render hará redeploy automáticamente

2. Ve a la pestaña **"Logs"**

3. Espera a ver:
   ```
   ✅ Conexión a PostgreSQL establecida
   ✅ Base de datos tiene 0 tablas
   🚀 Servidor escuchando en puerto 3000
   ```

**Nota:** Dirá "0 tablas" porque la base de datos está vacía. Eso es normal.

---

### Paso 5: Cargar Schema y Datos (2 min)

Ahora necesitas crear las tablas y cargar los datos.

**Opción A: Desde tu máquina local (Recomendado)**

1. Abre una terminal en tu proyecto

2. Ve a la carpeta de scripts:
   ```bash
   cd backend/scripts
   ```

3. Ejecuta el script de migración:
   ```bash
   node reload-database.js
   ```

4. Cuando pregunte "¿Estás seguro?", escribe: `SI`

5. Espera 1-2 minutos

6. Verás:
   ```
   ✅ Base de datos reiniciada
   ✅ 18 tablas creadas
   ✅ Datos iniciales cargados
   ```

**Opción B: Usar SQL Editor de Render**

1. En Render Dashboard, ve a tu base de datos

2. Busca **"SQL Editor"** o **"Query"**

3. Abre el archivo: `backend/scripts/reset-and-reload-database.sql`

4. Copia TODO el contenido

5. Pégalo en el SQL Editor de Render

6. Clic en **"Run"** o **"Execute"**

---

### Paso 6: Verificar (1 min)

1. Ve a: https://ecg-digital-city.onrender.com

2. Deberías ver la pantalla de login/registro

3. Intenta registrar un usuario:
   - Nombre: Test
   - Email: test@test.com
   - Contraseña: test123

4. Si funciona → ✅ ¡Éxito!

---

## 🎉 Ventajas de Esta Solución

- ✅ Sin problemas de IPv6 (mismo proveedor)
- ✅ Conexión más rápida (misma región)
- ✅ Más simple de configurar
- ✅ Gratis (plan free)
- ✅ 256 MB de almacenamiento (suficiente para empezar)

---

## 📊 Resumen de Credenciales

### Nueva Base de Datos en Render
```
DB_HOST = dpg-xxxxx-a.oregon-postgres.render.com (copiar de Render)
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = [copiar de Render]
```

---

## 🆘 Troubleshooting

### "No puedo ejecutar el script desde mi máquina"

Usa Opción B (SQL Editor de Render):
1. Ve a tu base de datos en Render
2. Busca "SQL Editor"
3. Copia y pega el contenido de `backend/scripts/reset-and-reload-database.sql`
4. Ejecuta

### "El script falla con error de conexión"

Verifica que las credenciales en tu archivo `.env` local sean correctas:
```bash
# backend/.env
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=[la que copiaste]
```

### "La aplicación sigue sin funcionar"

1. Verifica que las variables en Render estén correctas
2. Verifica que la base de datos tenga las 18 tablas
3. Revisa los logs de Render para ver el error exacto

---

## ✅ Checklist

- [ ] Crear nueva base de datos en Render
- [ ] Esperar a que esté lista (2-3 min)
- [ ] Copiar credenciales
- [ ] Actualizar variables en Web Service
- [ ] Esperar redeploy (3 min)
- [ ] Ejecutar script de migración
- [ ] Verificar que las tablas se crearon
- [ ] Probar la aplicación
- [ ] ✅ Listo

---

## 🎯 Tiempo Total

- Crear DB: 3 min
- Actualizar variables: 2 min
- Redeploy: 3 min
- Cargar datos: 2 min
- **Total: 10 minutos**

---

**Siguiente paso:** Ve a https://dashboard.render.com y crea la nueva base de datos.

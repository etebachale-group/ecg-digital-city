# 🚀 Guía Completa: Trabajar en Producción desde Render

## ✅ Cambios Ya Subidos a GitHub

Los siguientes archivos ya están en tu repositorio:
- ✅ `frontend/src/2d/App2D.jsx` - Fix build error
- ✅ `frontend/src/components/District.jsx` - Colisiones y puertas
- ✅ `frontend/src/components/ThirdPersonCamera.jsx` - Cámara mejorada
- ✅ Documentación completa

**Commit:** `bd27a4d` - "Fix: Build error, colisiones 3D, camara mejorada y sistema de puertas"

---

## 📋 Pasos para Trabajar en Render

### PASO 1: Verificar Deploy Automático

1. Ve a **Render Dashboard**: https://dashboard.render.com
2. Busca tu servicio **Frontend** (ecg-digital-city-frontend)
3. Verás que está haciendo deploy automáticamente
4. Espera a que termine (2-5 minutos)
5. Verás: **Deploy succeeded** ✅

**Estado esperado:**
```
🔄 Building...
📦 Installing dependencies...
🏗️ Building frontend...
✅ Deploy succeeded
🌐 Live at: https://ecg-digital-city.onrender.com
```

---

### PASO 2: Verificar Build del Frontend

1. En Render Dashboard → **Frontend Service**
2. Ve a la pestaña **Logs**
3. Busca estas líneas:

```
✓ built in XXXms
✓ 20 modules transformed
Build succeeded
```

**Si ves errores:**
- Revisa los logs completos
- El error de sintaxis ya está corregido
- Debería compilar sin problemas

---

### PASO 3: Seed de Base de Datos (IMPORTANTE)

Ahora necesitas llenar la base de datos:

#### 3.1 Abrir Shell del Backend

1. En Render Dashboard → **Backend Service** (ecg-digital-city-backend)
2. Click en **Shell** (arriba a la derecha)
3. Espera a que se abra la terminal

#### 3.2 Ejecutar Seed

En la Shell de Render, ejecuta:

```bash
cd backend
npm run fix:production
```

**Salida esperada:**
```
🔍 Diagnosticando base de datos...

📊 Estado actual:
- Distritos: 0
- Misiones: 0  
- Logros: 0
- Oficinas: 0

🌱 Ejecutando seeds...

✅ Distritos creados: 4
✅ Misiones creadas: 15
✅ Logros creados: 10
✅ Oficinas creadas: 8

🎉 Base de datos lista!
```

**Si algo falla:**
```bash
# Diagnóstico manual
npm run diagnose

# Seed manual
npm run seed:all
```

---

### PASO 4: Verificar APIs en Producción

Abre estas URLs en tu navegador:

#### 4.1 Verificar Distritos
```
https://ecg-digital-city-backend.onrender.com/api/districts
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "Distrito Central",
    "slug": "central",
    ...
  },
  ...
]
```

#### 4.2 Verificar Oficinas
```
https://ecg-digital-city-backend.onrender.com/api/offices/district/1
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "ETEBA CHALE GROUP",
    "tier": "enterprise",
    ...
  },
  ...
]
```

#### 4.3 Verificar Misiones
```
https://ecg-digital-city-backend.onrender.com/api/missions
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "Primera Visita",
    "type": "daily",
    ...
  },
  ...
]
```

---

### PASO 5: Probar la Aplicación

1. Abre tu app: https://ecg-digital-city.onrender.com
2. Inicia sesión o regístrate
3. Verifica:

#### En Modo 2D:
- [ ] Personaje visible y grande
- [ ] Cámara sigue al personaje
- [ ] Edificios visibles
- [ ] Oficinas cargadas
- [ ] Sin errores en consola

#### En Modo 3D:
- [ ] Personaje no atraviesa paredes
- [ ] Cámara sigue suavemente
- [ ] Puertas se pueden abrir con E
- [ ] Cambio de cámara con V funciona
- [ ] Sin errores en consola

---

## 🔧 Comandos Útiles en Render Shell

### Diagnóstico
```bash
# Ver estado de la base de datos
cd backend
npm run diagnose

# Ver logs del backend
tail -f logs/combined.log

# Ver logs de errores
tail -f logs/error.log
```

### Seed
```bash
# Seed completo (distritos + gamificación + oficinas)
npm run seed:all

# Seed individual
npm run seed:districts
npm run seed:gamification
npm run seed:offices

# Fix automático (diagnóstico + seed)
npm run fix:production
```

### Base de Datos
```bash
# Conectar a PostgreSQL (si necesitas)
psql $DATABASE_URL

# Ver tablas
\dt

# Ver datos de una tabla
SELECT * FROM "Districts";
SELECT * FROM "Offices";
SELECT * FROM "Missions";
```

---

## 📊 Monitoreo en Producción

### Ver Logs en Tiempo Real

#### Frontend Logs
1. Render Dashboard → Frontend Service
2. Pestaña **Logs**
3. Verás requests, builds, errores

#### Backend Logs
1. Render Dashboard → Backend Service
2. Pestaña **Logs**
3. Verás API calls, errores, conexiones

### Métricas
1. Render Dashboard → Service
2. Pestaña **Metrics**
3. Verás:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🐛 Troubleshooting en Producción

### Error: "Cannot connect to database"
```bash
# En Render Shell
echo $DATABASE_URL
# Debe mostrar la URL de PostgreSQL

# Verificar conexión
cd backend
node test-db-connection.js
```

### Error: "Seed failed"
```bash
# Limpiar y volver a intentar
cd backend
npm run diagnose
npm run seed:all
```

### Error: "Build failed"
```bash
# Ver logs completos
# Render Dashboard → Frontend → Logs

# Verificar que el commit está correcto
git log --oneline -5
```

### Error 500 en APIs
```bash
# Ver logs del backend
# Render Dashboard → Backend → Logs

# Verificar que el seed se ejecutó
cd backend
npm run diagnose
```

---

## 🔄 Workflow de Desarrollo en Producción

### 1. Hacer Cambios Locales
```bash
# Editar archivos
# Probar localmente (opcional)
```

### 2. Subir a GitHub
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

### 3. Deploy Automático
- Render detecta el push
- Hace build automáticamente
- Deploy en 2-5 minutos

### 4. Verificar en Producción
- Abrir app en navegador
- Revisar logs en Render
- Probar funcionalidades

### 5. Si Hay Problemas
- Ver logs en Render
- Hacer rollback si es necesario
- Corregir y volver a subir

---

## 🎯 Checklist Post-Deploy

### Inmediatamente después del deploy:

- [ ] Frontend deployed successfully
- [ ] Backend running
- [ ] Database connected
- [ ] Seed ejecutado (`npm run fix:production`)
- [ ] APIs respondiendo (200, no 500)
- [ ] App carga sin errores
- [ ] Login funciona
- [ ] Modo 2D funciona
- [ ] Modo 3D funciona
- [ ] Colisiones funcionan
- [ ] Puertas funcionan
- [ ] Misiones aparecen

---

## 📞 Comandos Rápidos de Referencia

```bash
# En Render Shell (Backend)

# Diagnóstico completo
cd backend && npm run fix:production

# Ver estado
npm run diagnose

# Seed completo
npm run seed:all

# Ver logs
tail -f logs/combined.log

# Conectar a DB
psql $DATABASE_URL

# Reiniciar servicio (desde Render Dashboard)
# Settings → Manual Deploy → Deploy Latest Commit
```

---

## 🚨 Importante

1. **No edites archivos directamente en Render** - Siempre haz cambios localmente y sube a GitHub
2. **El seed solo se ejecuta una vez** - Después de ejecutarlo, los datos persisten
3. **Los logs son temporales** - Render los guarda por tiempo limitado
4. **Free tier tiene limitaciones** - El servicio puede dormir después de 15 min de inactividad
5. **Backups** - Render hace backups automáticos de la DB

---

## ✅ Estado Actual

### Código
- ✅ Subido a GitHub (commit bd27a4d)
- ✅ Build error corregido
- ✅ Colisiones implementadas
- ✅ Cámara mejorada
- ✅ Puertas funcionales

### Producción
- ⏳ Deploy en progreso (automático)
- ⚠️ Seed pendiente (manual - TÚ)
- ⏳ Verificación pendiente

---

## 🎉 Próximos Pasos

1. **Ahora:** Espera a que termine el deploy (2-5 min)
2. **Después:** Ejecuta el seed en Render Shell
3. **Finalmente:** Prueba la app en producción
4. **Disfruta:** Todo debería funcionar perfectamente

---

**¡Listo para trabajar en producción!** 🚀

Cualquier duda, revisa los logs en Render Dashboard.

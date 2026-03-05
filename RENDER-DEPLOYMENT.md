# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar ECG Digital City completo (backend + frontend) en Render con soporte completo para Socket.IO.

## ✨ Ventajas de Render

- ✅ Backend y Frontend en el mismo servicio
- ✅ Socket.IO funciona perfectamente (WebSockets completos)
- ✅ PostgreSQL y Redis incluidos
- ✅ SSL/HTTPS automático
- ✅ Plan gratuito generoso
- ✅ Despliegue automático desde Git
- ✅ Logs en tiempo real
- ✅ Variables de entorno seguras

## 📋 Requisitos Previos

1. Cuenta en [Render](https://render.com) (gratis)
2. Código en GitHub, GitLab o Bitbucket
3. 15 minutos de tu tiempo

## 🚀 Despliegue Rápido (Opción 1: Blueprint)

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Preparar para Render"
git push origin main
```

### Paso 2: Crear Nuevo Blueprint en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" > "Blueprint"
3. Conecta tu repositorio de GitHub/GitLab
4. Render detectará automáticamente `render.yaml`
5. Click en "Apply"

### Paso 3: Configurar Variables de Entorno

Render creará los servicios automáticamente. Ahora configura las variables:

1. Ve a tu servicio web "ecg-digital-city"
2. Ve a "Environment"
3. Agrega las siguientes variables:

```env
# Database (Render las proporciona automáticamente si usas su PostgreSQL)
DB_HOST=<tu-db-host>.render.com
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=<generado-por-render>

# Redis (Render las proporciona automáticamente)
REDIS_HOST=<tu-redis-host>.render.com
REDIS_PASSWORD=<generado-por-render>

# CORS (actualizar después del primer deploy)
CORS_ORIGIN=https://ecg-digital-city.onrender.com
```

### Paso 4: Ejecutar Migraciones

Una vez desplegado, ejecuta las migraciones:

1. Ve a tu servicio en Render Dashboard
2. Click en "Shell" (terminal)
3. Ejecuta:

```bash
cd backend
npm run migrate
```

### Paso 5: ¡Listo!

Visita tu aplicación en: `https://ecg-digital-city.onrender.com`

## 🔧 Despliegue Manual (Opción 2: Sin Blueprint)

### Paso 1: Crear Servicio Web

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" > "Web Service"
3. Conecta tu repositorio
4. Configura:

```
Name: ecg-digital-city
Region: Oregon (US West)
Branch: main
Root Directory: (dejar vacío)
Runtime: Node
Build Command: 
  cd backend && npm install && cd ../frontend && npm install && npm run build
Start Command: 
  cd backend && npm start
Plan: Free
```

### Paso 2: Crear Base de Datos PostgreSQL

1. Click en "New +" > "PostgreSQL"
2. Configura:

```
Name: ecg-digital-city-db
Database: ecg_digital_city
User: ecg_user
Region: Oregon (US West)
Plan: Free
```

3. Copia las credenciales de conexión

### Paso 3: Crear Redis

1. Click en "New +" > "Redis"
2. Configura:

```
Name: ecg-digital-city-redis
Region: Oregon (US West)
Plan: Free
```

3. Copia las credenciales de conexión

### Paso 4: Configurar Variables de Entorno

En tu servicio web, ve a "Environment" y agrega:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (de Paso 2)
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=<tu-password>
DB_DIALECT=postgres

# Redis (de Paso 3)
REDIS_HOST=red-xxxxx.oregon-redis.render.com
REDIS_PORT=6379
REDIS_PASSWORD=<tu-password>

# JWT
JWT_SECRET=<genera-una-clave-segura-de-32-caracteres>
JWT_EXPIRES_IN=7d

# CORS (actualizar con tu URL de Render)
CORS_ORIGIN=https://ecg-digital-city.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Paso 5: Desplegar

1. Click en "Manual Deploy" > "Deploy latest commit"
2. Espera 5-10 minutos
3. Una vez completado, ejecuta migraciones (ver abajo)

## 🗄️ Ejecutar Migraciones

### Opción 1: Desde Render Shell

1. Ve a tu servicio en Render Dashboard
2. Click en "Shell"
3. Ejecuta:

```bash
cd backend
npm run migrate
```

### Opción 2: Desde tu Máquina Local

```bash
cd backend

# Crear .env temporal con credenciales de producción
cat > .env.production << EOF
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=tu-password
DB_DIALECT=postgres
EOF

# Ejecutar migraciones
NODE_ENV=production node scripts/migrate.js
```

## 📁 Estructura del Proyecto en Render

```
Render Service (ecg-digital-city)
├── Backend (Node.js + Express)
│   ├── API REST en /api/*
│   ├── Socket.IO en /socket.io/*
│   └── Health check en /health
│
├── Frontend (React + Vite)
│   ├── Servido como archivos estáticos
│   └── Rutas manejadas por React Router
│
├── PostgreSQL Database
│   └── ecg-digital-city-db
│
└── Redis Cache
    └── ecg-digital-city-redis
```

## 🔍 Verificar Despliegue

### 1. Health Check
```bash
curl https://ecg-digital-city.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Frontend
Visita: `https://ecg-digital-city.onrender.com`

### 3. API
```bash
curl https://ecg-digital-city.onrender.com/api/districts
```

### 4. Socket.IO
Abre la consola del navegador en tu app y verifica:
```javascript
// Deberías ver en la consola:
// Socket.IO connected
```

## 🔧 Configuración del Backend para Servir Frontend

El backend ya está configurado para servir el frontend. Verifica en `backend/src/server.js`:

```javascript
// Servir archivos estáticos del frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Manejar rutas de React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

Si no está, agrégalo antes del manejo de errores 404.

## 🌐 Dominio Personalizado

### Agregar Dominio Propio

1. Ve a tu servicio en Render
2. Click en "Settings" > "Custom Domain"
3. Agrega tu dominio (ej: `app.tudominio.com`)
4. Configura DNS según las instrucciones de Render:

```
Type: CNAME
Name: app
Value: ecg-digital-city.onrender.com
```

5. Actualiza `CORS_ORIGIN` con tu nuevo dominio
6. Redeploy

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

1. Ve a tu servicio en Render Dashboard
2. Click en "Logs"
3. Los logs se actualizan automáticamente

### Métricas

1. Ve a "Metrics" para ver:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Alertas

1. Ve a "Settings" > "Notifications"
2. Configura alertas por email para:
   - Deploy failures
   - Service crashes
   - High resource usage

## 🔄 Despliegue Continuo

Render despliega automáticamente cuando haces push a tu rama principal:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Render despliega automáticamente
```

### Desactivar Auto-Deploy

1. Ve a "Settings"
2. Desactiva "Auto-Deploy"
3. Usa "Manual Deploy" cuando quieras desplegar

## 🐛 Troubleshooting

### Error: "Build failed"

**Solución:**
1. Revisa los logs de build en Render
2. Verifica que `package.json` tenga todas las dependencias
3. Prueba el build localmente:

```bash
cd frontend && npm run build
```

### Error: "Cannot connect to database"

**Solución:**
1. Verifica las variables de entorno en Render
2. Asegúrate de que DB_HOST, DB_USER, DB_PASSWORD sean correctos
3. Verifica que la base de datos esté en la misma región

### Error: "Redis connection failed"

**Solución:**
1. Verifica REDIS_HOST y REDIS_PASSWORD
2. Asegúrate de que Redis esté activo en Render Dashboard

### Error: "CORS policy"

**Solución:**
1. Actualiza `CORS_ORIGIN` con tu URL de Render
2. Redeploy el servicio

### Socket.IO no conecta

**Solución:**
1. Verifica que el frontend use la URL correcta:
```javascript
const socket = io(window.location.origin);
```

2. Verifica configuración de Socket.IO en backend:
```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Servicio se duerme (plan gratuito)

**Problema:** El plan gratuito de Render duerme el servicio después de 15 minutos de inactividad.

**Soluciones:**
1. **Upgrade a plan pagado** ($7/mes) - Sin sleep
2. **Usar un ping service** (no recomendado):
   - [UptimeRobot](https://uptimerobot.com)
   - Ping cada 14 minutos

### Build toma mucho tiempo

**Solución:**
1. Optimiza dependencias en `package.json`
2. Usa cache de npm:
```bash
# En Build Command
npm ci --prefer-offline
```

## 💰 Costos

### Plan Gratuito
- ✅ 750 horas/mes de servicio web
- ✅ PostgreSQL 1GB
- ✅ Redis 25MB
- ⚠️ Servicio se duerme después de 15 min de inactividad
- ⚠️ Build time limitado

### Plan Starter ($7/mes)
- ✅ Servicio siempre activo
- ✅ PostgreSQL 1GB
- ✅ Redis 25MB
- ✅ Build time ilimitado
- ✅ Mejor performance

### Plan Pro ($25/mes)
- ✅ Todo lo de Starter
- ✅ PostgreSQL 10GB
- ✅ Redis 1GB
- ✅ Múltiples regiones
- ✅ Soporte prioritario

## 🔒 Seguridad

### Variables de Entorno

- ✅ Nunca commitees `.env` a Git
- ✅ Usa variables de entorno en Render Dashboard
- ✅ Genera JWT_SECRET seguro (32+ caracteres)
- ✅ Usa contraseñas fuertes para DB y Redis

### HTTPS

- ✅ Render proporciona SSL/HTTPS automático
- ✅ Certificados renovados automáticamente
- ✅ HTTP redirige a HTTPS automáticamente

### Rate Limiting

Ya configurado en el backend:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});
```

## 📈 Optimización

### Performance

1. **Habilitar compresión:**
```javascript
// backend/src/server.js
const compression = require('compression');
app.use(compression());
```

2. **Cache de assets:**
```javascript
app.use(express.static('frontend/dist', {
  maxAge: '1y',
  etag: true
}));
```

3. **Optimizar build de frontend:**
```javascript
// frontend/vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});
```

### Database

1. **Índices:** Ya configurados en migraciones
2. **Connection pooling:** Ya configurado en Sequelize
3. **Query optimization:** Usa `include` para eager loading

## 🔄 Backup

### Base de Datos

Render hace backups automáticos en planes pagados. Para plan gratuito:

```bash
# Backup manual
pg_dump -h dpg-xxxxx.oregon-postgres.render.com \
  -U ecg_user -d ecg_digital_city > backup.sql

# Restaurar
psql -h dpg-xxxxx.oregon-postgres.render.com \
  -U ecg_user -d ecg_digital_city < backup.sql
```

### Redis

Redis es cache, no necesita backup. Los datos se regeneran.

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Community](https://community.render.com)
- [Render Pricing](https://render.com/pricing)

## 🆘 Soporte

- **Render Support:** support@render.com
- **Community Forum:** https://community.render.com
- **Status Page:** https://status.render.com

## ✅ Checklist Post-Despliegue

- [ ] Servicio desplegado y activo
- [ ] Health check responde OK
- [ ] Frontend carga correctamente
- [ ] API responde correctamente
- [ ] Socket.IO conecta
- [ ] Base de datos conectada
- [ ] Redis conectado
- [ ] Migraciones ejecutadas
- [ ] CORS configurado
- [ ] SSL/HTTPS activo
- [ ] Logs accesibles
- [ ] Monitoreo configurado
- [ ] Dominio personalizado (opcional)
- [ ] Backup configurado (opcional)

## 🎉 ¡Listo!

Tu aplicación ECG Digital City está ahora en producción con:
- ✅ Backend y Frontend en un solo servicio
- ✅ Socket.IO funcionando perfectamente
- ✅ PostgreSQL y Redis incluidos
- ✅ SSL/HTTPS automático
- ✅ Despliegue continuo desde Git

**URL de tu app:** `https://ecg-digital-city.onrender.com`

¡Disfruta tu metaverso en producción! 🚀

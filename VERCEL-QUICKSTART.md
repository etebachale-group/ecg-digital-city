# Despliegue Rápido en Vercel

## 🚀 Inicio Rápido (5 minutos)

### 1. Preparar Base de Datos

Crea una base de datos PostgreSQL gratuita en [Neon](https://neon.tech):

1. Regístrate en Neon
2. Crea un nuevo proyecto
3. Copia la cadena de conexión

### 2. Preparar Redis

Crea una instancia Redis gratuita en [Upstash](https://upstash.com):

1. Regístrate en Upstash
2. Crea una nueva base de datos Redis
3. Copia las credenciales

### 3. Ejecutar Migraciones

```bash
cd backend
npm install

# Crea un archivo .env temporal con tus credenciales de producción
cat > .env << EOF
DB_HOST=tu-host-neon
DB_PORT=5432
DB_NAME=neondb
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_DIALECT=postgres
EOF

# Ejecutar migraciones
npm run migrate
```

### 4. Desplegar en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. Sube tu código a GitHub:
   ```bash
   git add .
   git commit -m "Preparar para Vercel"
   git push origin main
   ```

2. Ve a [vercel.com/new](https://vercel.com/new)

3. Importa tu repositorio

4. Configura las variables de entorno (ver abajo)

5. Click en "Deploy"

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones
```

### 5. Variables de Entorno en Vercel

En Vercel Dashboard > Settings > Environment Variables, agrega:

```
# Database
DB_HOST=tu-host-neon.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_DIALECT=postgres

# Redis
REDIS_HOST=tu-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-password

# JWT
JWT_SECRET=genera-una-clave-segura-aqui
JWT_EXPIRES_IN=7d

# CORS (actualizar después del primer deploy)
CORS_ORIGIN=https://tu-app.vercel.app

# Frontend
VITE_API_URL=https://tu-app.vercel.app
```

### 6. Actualizar CORS

Después del primer despliegue:

1. Copia tu URL de Vercel (ej: `https://tu-app.vercel.app`)
2. Ve a Settings > Environment Variables
3. Actualiza `CORS_ORIGIN` con tu URL
4. Redeploy: Deployments > ... > Redeploy

## ⚠️ Limitación Importante: Socket.IO

Vercel no soporta WebSockets completamente. Tienes 2 opciones:

### Opción 1: Backend en Railway (Recomendado)

1. Despliega el backend en [Railway](https://railway.app):
   ```bash
   npm i -g @railway/cli
   railway login
   cd backend
   railway init
   railway up
   ```

2. Despliega el frontend en Vercel:
   - Configura `VITE_API_URL` con tu URL de Railway
   - Despliega normalmente

### Opción 2: Usar Pusher/Ably

Lee `VERCEL-SOCKETIO-ALTERNATIVE.md` para más detalles.

## ✅ Verificar Despliegue

1. Visita `https://tu-app.vercel.app/health`
2. Deberías ver: `{"status":"ok",...}`

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"
- Verifica las variables de entorno
- Asegúrate de que Neon permita conexiones externas

### Error: "CORS policy"
- Actualiza `CORS_ORIGIN` con tu URL de Vercel
- Redeploy

### Socket.IO no funciona
- Es normal en Vercel
- Usa Railway para el backend o Pusher/Ably

## 📚 Documentación Completa

- [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) - Guía completa
- [VERCEL-SOCKETIO-ALTERNATIVE.md](./VERCEL-SOCKETIO-ALTERNATIVE.md) - Alternativas a Socket.IO

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Lee la documentación completa
4. Abre un issue en GitHub

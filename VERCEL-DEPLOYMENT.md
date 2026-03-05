# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar ECG Digital City en Vercel.

## Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Base de datos PostgreSQL (puedes usar [Neon](https://neon.tech), [Supabase](https://supabase.com), o [Railway](https://railway.app))
3. Instancia de Redis (puedes usar [Upstash Redis](https://upstash.com))

## Configuración de Base de Datos

### Opción 1: Neon (Recomendado)

1. Crea una cuenta en [Neon](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la cadena de conexión
4. Ejecuta las migraciones:

```bash
# Desde tu máquina local
cd backend
npm install
node scripts/migrate.js
```

### Opción 2: Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > Database
3. Copia la cadena de conexión
4. Ejecuta las migraciones como se indica arriba

## Configuración de Redis

### Upstash Redis (Recomendado)

1. Crea una cuenta en [Upstash](https://upstash.com)
2. Crea una nueva base de datos Redis
3. Copia las credenciales (host, port, password)

## Despliegue en Vercel

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket
2. Haz commit de todos los cambios:

```bash
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### Paso 2: Importar Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New..." > "Project"
3. Importa tu repositorio de Git
4. Vercel detectará automáticamente la configuración

### Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel, agrega las siguientes variables:

#### Variables del Backend

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=tu-host-postgres
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_DIALECT=postgres

# Redis
REDIS_HOST=tu-host-redis
REDIS_PORT=6379
REDIS_PASSWORD=tu-password-redis

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-cambiala
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Variables del Frontend

```
VITE_API_URL=https://tu-app.vercel.app
```

### Paso 4: Desplegar

1. Click en "Deploy"
2. Espera a que el despliegue termine (puede tomar 2-5 minutos)
3. Una vez completado, obtendrás una URL como `https://tu-app.vercel.app`

### Paso 5: Actualizar CORS_ORIGIN

1. Ve a Settings > Environment Variables
2. Actualiza `CORS_ORIGIN` con tu URL de Vercel
3. Redeploy el proyecto

## Configuración Post-Despliegue

### Ejecutar Migraciones

Si no ejecutaste las migraciones antes, puedes hacerlo desde tu máquina local:

```bash
cd backend
# Actualiza .env con las credenciales de producción
npm run migrate
```

### Verificar el Despliegue

1. Visita `https://tu-app.vercel.app/health` - deberías ver un JSON con el estado
2. Visita `https://tu-app.vercel.app` - deberías ver la aplicación frontend

## Estructura del Proyecto para Vercel

```
ecg-digital-city/
├── vercel.json              # Configuración principal de Vercel
├── frontend/
│   ├── package.json         # Incluye script "vercel-build"
│   ├── vite.config.js       # Configurado para producción
│   └── dist/                # Build output (generado)
├── backend/
│   ├── vercel.json          # Configuración del backend
│   ├── api/
│   │   └── index.js         # Entry point para Vercel
│   └── src/
│       └── server.js        # Servidor Express
└── .env.example             # Template de variables de entorno
```

## Limitaciones de Vercel

### Funciones Serverless

- Timeout máximo: 10 segundos (plan gratuito), 60 segundos (plan Pro)
- Tamaño máximo: 50MB
- Memoria: 1024MB (plan gratuito), 3008MB (plan Pro)

### Socket.IO

⚠️ **IMPORTANTE**: Socket.IO tiene limitaciones en Vercel debido a la naturaleza serverless:

- Las conexiones WebSocket pueden no funcionar correctamente
- Considera usar alternativas como:
  - [Pusher](https://pusher.com)
  - [Ably](https://ably.com)
  - [Socket.IO con servidor dedicado](https://socket.io/docs/v4/server-deployment/)

### Alternativa para Socket.IO

Si necesitas Socket.IO completo, considera:

1. **Desplegar el backend en Railway o Render**:
   - Railway: https://railway.app
   - Render: https://render.com
   
2. **Mantener el frontend en Vercel**:
   - Actualiza `VITE_API_URL` para apuntar a tu backend en Railway/Render

## Monitoreo y Logs

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Deployments"
3. Click en el deployment activo
4. Ve a la pestaña "Functions" para ver logs

### Configurar Alertas

1. Ve a Settings > Notifications
2. Configura alertas para errores y downtime

## Dominios Personalizados

### Agregar un Dominio

1. Ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel
4. Actualiza `CORS_ORIGIN` con tu nuevo dominio

## Troubleshooting

### Error: "Cannot find module"

- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que `node_modules` no esté en `.gitignore`

### Error: "Database connection failed"

- Verifica las variables de entorno de la base de datos
- Asegúrate de que la base de datos permita conexiones externas
- Verifica que las migraciones se hayan ejecutado

### Error: "CORS policy"

- Verifica que `CORS_ORIGIN` esté configurado correctamente
- Asegúrate de incluir el protocolo (https://)

### Socket.IO no funciona

- Considera las alternativas mencionadas arriba
- O despliega el backend en un servicio que soporte WebSockets

## Comandos Útiles

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar desde la línea de comandos
vercel

# Desplegar a producción
vercel --prod

# Ver logs en tiempo real
vercel logs

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add
```

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

## Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Consulta la documentación de Vercel
4. Abre un issue en el repositorio del proyecto

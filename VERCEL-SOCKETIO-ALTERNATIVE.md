# Alternativas a Socket.IO para Vercel

Vercel tiene limitaciones con WebSockets debido a su arquitectura serverless. Aquí hay alternativas para mantener la funcionalidad en tiempo real:

## Opción 1: Despliegue Híbrido (Recomendado)

### Frontend en Vercel + Backend en Railway/Render

**Ventajas:**
- Socket.IO funciona completamente
- Mejor para aplicaciones en tiempo real
- Más control sobre el servidor

**Pasos:**

1. **Desplegar Backend en Railway:**
   ```bash
   # Instalar Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Inicializar proyecto
   cd backend
   railway init
   
   # Desplegar
   railway up
   ```

2. **Configurar Variables de Entorno en Railway:**
   - Todas las variables del `.env.example`
   - `CORS_ORIGIN` debe apuntar a tu dominio de Vercel

3. **Desplegar Frontend en Vercel:**
   - Configurar `VITE_API_URL` con la URL de Railway
   - Desplegar normalmente

### Backend en Render

```bash
# Crear render.yaml en la raíz del proyecto
```

```yaml
services:
  - type: web
    name: ecg-digital-city-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

## Opción 2: Usar Pusher (Servicio Gestionado)

### Configuración de Pusher

1. **Crear cuenta en [Pusher](https://pusher.com)**

2. **Instalar dependencias:**
   ```bash
   cd backend
   npm install pusher
   
   cd ../frontend
   npm install pusher-js
   ```

3. **Backend - Reemplazar Socket.IO:**
   ```javascript
   // backend/src/config/pusher.js
   const Pusher = require('pusher');
   
   const pusher = new Pusher({
     appId: process.env.PUSHER_APP_ID,
     key: process.env.PUSHER_KEY,
     secret: process.env.PUSHER_SECRET,
     cluster: process.env.PUSHER_CLUSTER,
     useTLS: true
   });
   
   module.exports = pusher;
   ```

4. **Frontend - Cliente Pusher:**
   ```javascript
   // frontend/src/config/pusher.js
   import Pusher from 'pusher-js';
   
   const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
     cluster: import.meta.env.VITE_PUSHER_CLUSTER
   });
   
   export default pusher;
   ```

5. **Migrar eventos:**
   ```javascript
   // Antes (Socket.IO)
   io.emit('player:move', data);
   
   // Después (Pusher)
   pusher.trigger('office-channel', 'player:move', data);
   ```

## Opción 3: Usar Ably

Similar a Pusher pero con mejor plan gratuito.

1. **Crear cuenta en [Ably](https://ably.com)**

2. **Instalar:**
   ```bash
   npm install ably
   ```

3. **Configurar:**
   ```javascript
   // Backend
   const Ably = require('ably');
   const ably = new Ably.Rest(process.env.ABLY_API_KEY);
   
   // Frontend
   import Ably from 'ably';
   const ably = new Ably.Realtime(import.meta.env.VITE_ABLY_KEY);
   ```

## Opción 4: Server-Sent Events (SSE)

Para actualizaciones unidireccionales (servidor → cliente):

```javascript
// Backend
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Enviar eventos periódicamente
  const interval = setInterval(() => {
    sendEvent({ type: 'update', data: {} });
  }, 1000);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Frontend
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

## Opción 5: Polling (Última Opción)

Si no necesitas actualizaciones en tiempo real estrictas:

```javascript
// Frontend
const pollUpdates = async () => {
  try {
    const response = await fetch('/api/updates');
    const data = await response.json();
    // Actualizar estado
  } catch (error) {
    console.error(error);
  }
};

// Poll cada 2 segundos
setInterval(pollUpdates, 2000);
```

## Comparación de Opciones

| Opción | Costo | Complejidad | Latencia | Escalabilidad |
|--------|-------|-------------|----------|---------------|
| Railway/Render | $5-10/mes | Baja | Muy baja | Alta |
| Pusher | $0-49/mes | Media | Baja | Muy alta |
| Ably | $0-29/mes | Media | Baja | Muy alta |
| SSE | Gratis | Media | Media | Media |
| Polling | Gratis | Baja | Alta | Baja |

## Recomendación

Para ECG Digital City, recomiendo:

1. **Desarrollo/MVP:** Railway + Vercel (híbrido)
2. **Producción pequeña:** Pusher/Ably
3. **Producción grande:** Servidor dedicado (Railway/Render/AWS)

## Migración de Socket.IO a Pusher

Si decides usar Pusher, aquí está la guía de migración:

### 1. Instalar Pusher

```bash
cd backend && npm install pusher
cd ../frontend && npm install pusher-js
```

### 2. Crear servicio de Pusher

```javascript
// backend/src/services/PusherService.js
const Pusher = require('pusher');

class PusherService {
  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    });
  }

  trigger(channel, event, data) {
    return this.pusher.trigger(channel, event, data);
  }

  triggerBatch(batch) {
    return this.pusher.triggerBatch(batch);
  }
}

module.exports = new PusherService();
```

### 3. Actualizar handlers

```javascript
// Antes
io.on('connection', (socket) => {
  socket.on('player:move', (data) => {
    socket.broadcast.emit('player:moved', data);
  });
});

// Después
app.post('/api/player/move', async (req, res) => {
  const data = req.body;
  await pusherService.trigger('office-channel', 'player:moved', data);
  res.json({ success: true });
});
```

### 4. Actualizar frontend

```javascript
// Antes
import io from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('player:moved', (data) => {
  // Handle
});

// Después
import Pusher from 'pusher-js';
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER
});
const channel = pusher.subscribe('office-channel');
channel.bind('player:moved', (data) => {
  // Handle
});
```

## Recursos

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Pusher Docs](https://pusher.com/docs)
- [Ably Docs](https://ably.com/docs)

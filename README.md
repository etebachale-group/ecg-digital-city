# ECG Digital City

Plataforma de oficina virtual 3D con sistema de gamificación y interacciones avanzadas.

## Stack Tecnológico

- **Frontend**: React + Vite + Three.js
- **Backend**: Node.js + Express + Socket.IO
- **Base de Datos**: PostgreSQL (Render)
- **Hosting**: Render
- **Cache**: Redis (opcional)

## Estructura del Proyecto

```
ecg-digital-city/
├── frontend/          # Aplicación React
├── backend/           # API REST + WebSocket
│   ├── src/
│   │   ├── models/    # Modelos Sequelize
│   │   ├── routes/    # Endpoints API
│   │   ├── services/  # Lógica de negocio
│   │   ├── sockets/   # Handlers WebSocket
│   │   └── config/    # Configuración
│   └── scripts/       # Scripts de base de datos
└── render.yaml        # Configuración Render
```

## Características

### Sistema de Gamificación
- Sistema de XP y niveles
- Logros desbloqueables
- Misiones diarias y semanales
- Rachas de login
- Leaderboard global

### Sistema de Interacciones Avanzadas
- Objetos interactivos (sillas, puertas, mesas, muebles)
- Nodos de interacción con estados de avatar
- Sistema de triggers (XP, logros, teletransporte)
- Cola de espera para objetos ocupados
- Logs de interacciones para análisis

### Multiplayer en Tiempo Real
- Chat de proximidad
- Sincronización de posiciones
- Eventos y reuniones
- Sistema de oficinas y distritos

## Desarrollo Local

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis (opcional)

### Instalación

1. Clonar repositorio:
```bash
git clone <repo-url>
cd ecg-digital-city
```

2. Instalar dependencias:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configurar variables de entorno:
```bash
# backend/.env
cp .env.example .env
# Editar con tus credenciales de PostgreSQL
```

4. Inicializar base de datos:
```bash
cd backend/scripts
node reload-database.js
# Escribir "SI" cuando pregunte
```

5. Iniciar servidores:
```bash
# Backend (puerto 3000)
cd backend
npm run dev

# Frontend (puerto 5173)
cd frontend
npm run dev
```

## Deployment en Render

El proyecto está configurado para deployment automático en Render usando `render.yaml`.

### Servicios Configurados
- **Web Service**: Backend + Frontend
- **PostgreSQL**: Base de datos
- **Redis**: Cache (opcional)

### Variables de Entorno Requeridas
```
NODE_ENV=production
DB_HOST=<render-postgres-host>
DB_PORT=5432
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
JWT_SECRET=<secret-key>
```

## Scripts Útiles

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm test             # Tests
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build
```

### Base de Datos
```bash
# Recargar base de datos completa
cd backend/scripts
node reload-database.js

# Probar conexión
cd backend
node test-db-connection.js
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Gamificación
- `GET /api/gamification/progress/:userId` - Progreso del usuario
- `POST /api/gamification/daily-login` - Registrar login diario
- `GET /api/gamification/leaderboard` - Leaderboard global

### Interacciones
- `GET /api/interactive-objects` - Listar objetos
- `POST /api/interactive-objects` - Crear objeto
- `POST /api/interactive-objects/:id/interact` - Interactuar

### Distritos y Oficinas
- `GET /api/districts` - Listar distritos
- `GET /api/offices` - Listar oficinas
- `POST /api/offices` - Crear oficina

## WebSocket Events

### Cliente → Servidor
- `join-district` - Unirse a distrito
- `move` - Actualizar posición
- `chat-message` - Enviar mensaje
- `interact-object` - Interactuar con objeto

### Servidor → Cliente
- `user-joined` - Usuario se unió
- `user-left` - Usuario salió
- `user-moved` - Usuario se movió
- `chat-message` - Nuevo mensaje
- `interaction-result` - Resultado de interacción

## Base de Datos

### Tablas Principales
- `users` - Usuarios
- `avatars` - Avatares con estados
- `districts` - Distritos del mundo
- `offices` - Oficinas de empresas
- `interactive_objects` - Objetos interactivos
- `interaction_nodes` - Puntos de interacción
- `user_progress` - Progreso de gamificación

Total: 19 tablas + 3 vistas

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.

## Licencia

MIT

# Documentación ECG Digital City

## Índice

### 📋 Especificaciones
- [Sistema de Interacciones Avanzadas](../kiro/specs/sistema-interacciones-avanzadas/)
  - [Requerimientos](../.kiro/specs/sistema-interacciones-avanzadas/requirements.md)
  - [Diseño](../.kiro/specs/sistema-interacciones-avanzadas/design.md)
  - [Tareas](../.kiro/specs/sistema-interacciones-avanzadas/tasks.md)

### 🗄️ Base de Datos
- [Estado Actual](../DATABASE-READY.md)
- [Scripts](../backend/scripts/README.md)

### 🚀 Deployment
- [Configuración Render](../render.yaml)

### 🎮 Características

#### Sistema de Gamificación
- Sistema de XP y niveles (100 XP por nivel)
- 8 logros desbloqueables
- 7 misiones (4 diarias, 3 semanales)
- Rachas de login diario
- Leaderboard global

#### Sistema de Interacciones Avanzadas
- **Objetos Interactivos**: Sillas, puertas, mesas, muebles genéricos
- **Nodos de Interacción**: Puntos específicos con estados requeridos
- **Triggers**: Cambios de estado, otorgar XP, desbloquear logros, teletransporte
- **Cola de Espera**: Sistema FIFO para objetos ocupados
- **Logs**: Registro completo de interacciones para análisis

#### Multiplayer
- Chat de proximidad en tiempo real
- Sincronización de posiciones
- Sistema de distritos y oficinas
- Eventos y reuniones virtuales

### 🏗️ Arquitectura

```
Frontend (React + Three.js)
    ↓ HTTP/WebSocket
Backend (Node.js + Express + Socket.IO)
    ↓ Sequelize ORM
PostgreSQL (Render)
    ↓ (opcional)
Redis Cache
```

### 📊 Modelos de Datos

#### Core
- Users, Avatars, Companies
- Districts, Offices, Permissions

#### Gamificación
- UserProgress, Achievements, Missions
- UserAchievements, UserMissions

#### Interacciones
- InteractiveObjects, InteractionNodes
- ObjectTriggers, InteractionQueue, InteractionLogs

#### Eventos
- Events, EventAttendees

### 🔧 Tecnologías

**Frontend:**
- React 18
- Vite
- Three.js / React Three Fiber
- Zustand (state management)
- Socket.IO Client

**Backend:**
- Node.js 18+
- Express
- Socket.IO
- Sequelize ORM
- PostgreSQL
- Redis (opcional)
- Winston (logging)

**DevOps:**
- Render (hosting)
- GitHub Actions (CI/CD)

### 📝 Convenciones

#### Código
- ESLint + Prettier
- Commits semánticos
- Tests con Jest

#### Base de Datos
- snake_case para tablas y columnas
- Timestamps automáticos (created_at, updated_at)
- Soft deletes con is_active
- Índices en foreign keys y campos de búsqueda

#### API
- REST para operaciones CRUD
- WebSocket para tiempo real
- Respuestas JSON estándar
- Códigos HTTP apropiados

### 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### 📈 Roadmap

- [x] Sistema de gamificación básico
- [x] Sistema de interacciones avanzadas
- [x] Multiplayer en tiempo real
- [ ] Sistema de voz (WebRTC)
- [ ] Optimizaciones de red (packet system)
- [ ] Audio 3D espacial
- [ ] Sistema de física avanzado

### 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md)

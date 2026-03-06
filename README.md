# ECG Digital City 🏙️

Plataforma de oficina virtual 3D con sistema de gamificación, interacciones avanzadas, y navegación inteligente con pathfinding A*.

**🌐 Demo en Vivo:** https://ecg-digital-city.onrender.com

## 🚀 Stack Tecnológico

### Frontend
- **React 18** + Vite - UI framework y build tool
- **Three.js** + React Three Fiber - Renderizado 3D
- **Zustand** - State management
- **Socket.IO Client** - WebSocket real-time

### Backend
- **Node.js 18+** + Express - API REST
- **Socket.IO** - WebSocket server
- **Sequelize** - ORM para PostgreSQL
- **Winston** - Logging
- **Jest** - Testing framework

### Infraestructura
- **PostgreSQL 14+** (Render) - Base de datos principal
- **Redis** (opcional) - Cache y rate limiting
- **Render** - Hosting y deployment automático

## 📁 Estructura del Proyecto

```
ecg-digital-city/
├── frontend/                    # Aplicación React + Three.js
│   ├── src/
│   │   ├── components/         # Componentes React (30+)
│   │   │   ├── Player.jsx      # Avatar del jugador con pathfinding
│   │   │   ├── OtherPlayer.jsx # Avatares de otros jugadores
│   │   │   ├── InteractiveObject.jsx
│   │   │   ├── InteractionIndicators.jsx
│   │   │   ├── InteractionQueue.jsx
│   │   │   └── ...
│   │   ├── systems/            # Sistemas core (8)
│   │   │   ├── NavigationMesh.js
│   │   │   ├── PathfindingEngine.js
│   │   │   ├── DepthSorter.js
│   │   │   ├── SpatialPartitioner.js
│   │   │   ├── AvatarStateManager.js
│   │   │   ├── InteractionHandler.js
│   │   │   ├── InteractiveObjectManager.js
│   │   │   └── TriggerExecutor.js
│   │   ├── store/              # Zustand stores
│   │   ├── services/           # API y Socket.IO
│   │   └── config/             # Configuración
│   └── package.json
│
├── backend/                     # API REST + WebSocket
│   ├── src/
│   │   ├── models/             # Modelos Sequelize (19)
│   │   │   ├── InteractiveObject.js
│   │   │   ├── InteractionNode.js
│   │   │   ├── ObjectTrigger.js
│   │   │   ├── InteractionQueue.js
│   │   │   ├── InteractionLog.js
│   │   │   └── ...
│   │   ├── services/           # Servicios singleton (3)
│   │   │   ├── InteractiveObjectService.js
│   │   │   ├── InteractionService.js
│   │   │   └── AvatarStateService.js
│   │   ├── routes/             # Endpoints API (11)
│   │   ├── sockets/            # Handlers WebSocket (5)
│   │   ├── config/             # Configuración DB y Redis
│   │   └── utils/              # Utilidades y logging
│   ├── migrations/             # Migraciones DB (6)
│   ├── scripts/                # Scripts de base de datos
│   │   ├── reload-database.js
│   │   └── reset-and-reload-database.sql
│   ├── tests/                  # Tests (18 suites)
│   │   ├── unit/
│   │   ├── integration/
│   │   └── properties/
│   └── package.json
│
├── docs/                        # Documentación
│   ├── ARCHITECTURE.md
│   └── README.md
│
├── .kiro/specs/                 # Especificaciones
│   └── sistema-interacciones-avanzadas/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── render.yaml                  # Configuración Render
├── README.md                    # Este archivo
├── QUICKSTART.md               # Guía rápida
├── PROJECT-STATUS.md           # Estado del proyecto
├── IMPLEMENTATION-STATUS.md    # Estado de implementación
├── FRONTEND-COMPLETE.md        # Frontend completado
├── INTEGRATION-NOTES.md        # Notas de integración
└── DATABASE-READY.md           # Estado de la base de datos
```

## ✨ Características Principales

### 🎮 Sistema de Gamificación
- **Sistema de XP y Niveles** - Progresión del usuario
- **Logros Desbloqueables** - 8 logros predefinidos
- **Misiones Diarias y Semanales** - 7 misiones con recompensas
- **Rachas de Login** - Bonificaciones por días consecutivos
- **Leaderboard Global** - Ranking de usuarios por XP
- **Estadísticas Detalladas** - Tracking de progreso

### 🎯 Sistema de Interacciones Avanzadas
- **Objetos Interactivos** - Sillas, puertas, mesas, muebles personalizables
- **6 Estados de Avatar** - idle, walking, running, sitting, dancing, interacting
- **Nodos de Interacción** - Múltiples puntos de interacción por objeto
- **Sistema de Triggers** - 4 tipos (state_change, grant_xp, unlock_achievement, teleport)
- **Cola de Espera FIFO** - Sistema de turnos para objetos ocupados
- **Logs de Interacciones** - Análisis y auditoría completa
- **Sincronización Real-Time** - Estados sincronizados entre todos los clientes

### 🗺️ Navegación Inteligente
- **Click-to-Move** - Navegación automática con click
- **A* Pathfinding** - Algoritmo de búsqueda de caminos óptimos
- **NavigationMesh** - Grid-based con 0.5 unit cells
- **Obstacle Avoidance** - Evita colisiones automáticamente
- **Path Smoothing** - Catmull-Rom splines para movimiento fluido
- **Dynamic Recalculation** - Recalcula rutas al detectar obstáculos
- **WASD Compatible** - Mantiene control manual tradicional

### 🎨 Renderizado y Visualización
- **Depth Sorting** - Z-index automático basado en posición Y
- **Spatial Partitioning** - Optimización con sectores de 10 unidades
- **Highlight Effects** - Feedback visual para objetos interactivos
- **Smooth Animations** - Transiciones de estado con easing
- **Performance Optimized** - 60 FPS con 200+ objetos y 50+ avatares

### 👥 Multiplayer en Tiempo Real
- **Chat de Proximidad** - Mensajes visibles solo cerca (3 unidades)
- **Sincronización de Posiciones** - Interpolación suave de movimiento
- **Sincronización de Estados** - Estados de avatar en tiempo real
- **Eventos y Reuniones** - Sistema de eventos con asistentes
- **Sistema de Oficinas** - Múltiples oficinas por empresa
- **4 Distritos** - Mundo dividido en zonas temáticas

### 🏢 Sistema de Empresas
- **Gestión de Empresas** - CRUD completo
- **Oficinas Personalizables** - Múltiples oficinas por empresa
- **Objetos de Oficina** - Decoración y funcionalidad
- **Permisos y Roles** - Sistema de autorización
- **Dashboard Empresarial** - Panel de control completo

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

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login con JWT
- `POST /api/auth/logout` - Logout

### Gamificación
- `GET /api/gamification/progress/:userId` - Progreso del usuario
- `POST /api/gamification/daily-login` - Registrar login diario
- `GET /api/gamification/leaderboard` - Leaderboard global
- `GET /api/gamification/achievements` - Listar logros
- `GET /api/gamification/missions` - Listar misiones

### Objetos Interactivos
- `GET /api/objects` - Listar todos los objetos
- `GET /api/objects/:id` - Obtener objeto específico
- `GET /api/offices/:officeId/objects` - Objetos de una oficina
- `POST /api/objects` - Crear objeto (admin)
- `PUT /api/objects/:id` - Actualizar objeto (admin)
- `DELETE /api/objects/:id` - Eliminar objeto (admin)
- `GET /api/objects/:id/state` - Estado del objeto
- `PUT /api/objects/:id/state` - Actualizar estado

### Nodos y Triggers
- `POST /api/objects/:id/nodes` - Agregar nodo de interacción
- `PUT /api/nodes/:id` - Actualizar nodo
- `DELETE /api/nodes/:id` - Eliminar nodo
- `POST /api/objects/:id/triggers` - Agregar trigger
- `PUT /api/triggers/:id` - Actualizar trigger
- `DELETE /api/triggers/:id` - Eliminar trigger

### Cola de Interacciones
- `GET /api/objects/:id/queue` - Ver cola de objeto
- `POST /api/objects/:id/queue` - Unirse a cola
- `DELETE /api/queue/:queueId` - Salir de cola

### Distritos y Oficinas
- `GET /api/districts` - Listar distritos
- `GET /api/offices` - Listar oficinas
- `POST /api/offices` - Crear oficina
- `GET /api/offices/:id` - Obtener oficina

### Empresas
- `GET /api/companies` - Listar empresas
- `POST /api/companies` - Crear empresa
- `PUT /api/companies/:id` - Actualizar empresa
- `DELETE /api/companies/:id` - Eliminar empresa

## 🔄 WebSocket Events

### Cliente → Servidor
**Movimiento y Posición:**
- `join-district` - Unirse a distrito
- `move` - Actualizar posición
- `stop` - Detener movimiento
- `teleport` - Teletransporte

**Chat:**
- `chat-message` - Enviar mensaje
- `typing` - Indicador de escritura

**Interacciones:**
- `interaction:request` - Solicitar interacción
- `interaction:cancel` - Cancelar interacción
- `avatar:state-change` - Cambiar estado de avatar
- `queue:join` - Unirse a cola
- `queue:leave` - Salir de cola

**Admin (Editor de Oficinas):**
- `object:create` - Crear objeto
- `object:update` - Actualizar objeto
- `object:delete` - Eliminar objeto

### Servidor → Cliente
**Usuarios:**
- `user-joined` - Usuario se unió
- `user-left` - Usuario salió
- `user-moved` - Usuario se movió
- `users-online` - Lista de usuarios online

**Chat:**
- `chat-message` - Nuevo mensaje
- `user-typing` - Usuario escribiendo

**Objetos Interactivos:**
- `object:created` - Objeto creado
- `object:updated` - Objeto actualizado
- `object:deleted` - Objeto eliminado
- `object:state-changed` - Estado cambió

**Estados de Avatar:**
- `avatar:state-changed` - Estado de avatar cambió

**Interacciones:**
- `interaction:started` - Interacción iniciada
- `interaction:completed` - Interacción completada
- `interaction:failed` - Interacción falló

**Nodos:**
- `node:occupied` - Nodo ocupado
- `node:released` - Nodo liberado

**Colas:**
- `queue:joined` - Usuario se unió a cola
- `queue:updated` - Cola actualizada
- `queue:your-turn` - Es tu turno

## 🗄️ Base de Datos

### Tablas (19)

**Core:**
- `users` - Usuarios del sistema
- `avatars` - Avatares con estados (idle, walking, running, sitting, dancing, interacting)
- `companies` - Empresas registradas
- `districts` - 4 distritos del mundo
- `offices` - Oficinas de empresas
- `office_objects` - Objetos decorativos
- `permissions` - Sistema de permisos

**Gamificación:**
- `user_progress` - XP, nivel, rachas
- `achievements` - 8 logros predefinidos
- `user_achievements` - Logros desbloqueados
- `missions` - 7 misiones disponibles
- `user_missions` - Progreso de misiones

**Eventos:**
- `events` - Eventos y reuniones
- `event_attendees` - Asistentes a eventos

**Sistema de Interacciones:**
- `interactive_objects` - Objetos interactivos (sillas, puertas, mesas, etc.)
- `interaction_nodes` - Puntos de interacción con ocupancy tracking
- `object_triggers` - Triggers (state_change, grant_xp, unlock_achievement, teleport)
- `interaction_queue` - Cola FIFO para objetos ocupados
- `interaction_logs` - Logs de todas las interacciones

### Vistas (3)
- `interactive_objects_with_node_count` - Objetos con conteo de nodos
- `interaction_queue_with_users` - Cola con información de usuarios
- `user_interaction_stats` - Estadísticas de interacciones por usuario

### Índices Optimizados
- Índices en foreign keys para joins rápidos
- Índices en campos de búsqueda frecuente (office_id, user_id, object_type)
- Índices compuestos para queries complejas
- Índice en timestamp para logs ordenados

### Credenciales (Render PostgreSQL)
```
Host: dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com
Port: 5432
Database: ecg_digital_city_sqmj
User: ecg_digital_city_sqmj_user
```

Ver `DATABASE-READY.md` para más detalles.

## 🎯 Controles del Juego

### Movimiento
- **WASD** - Movimiento manual
- **Shift** - Correr 🏃
- **Click Izquierdo** - Click-to-move (pathfinding automático)

### Interacciones
- **E** - Interactuar con objeto cercano
- **C** - Sentarse 💺
- **Hover** - Ver información del objeto

### Cámara
- **Click Derecho + Arrastrar** - Rotar cámara
- **Rueda del Mouse** - Zoom in/out
- **V** - Cambiar vista (4 modos)
- **R** - Resetear cámara

### UI
- **T** - Abrir/cerrar chat
- **M** - Mapa de distritos
- **ESC** - Cerrar ventanas

## 📊 Métricas del Proyecto

### Código
- **Backend**: ~8,500 líneas
- **Frontend**: ~6,200 líneas
- **Tests**: ~2,800 líneas
- **Total**: ~17,500 líneas

### Archivos
- **Modelos**: 19
- **Rutas API**: 11
- **Servicios**: 3
- **Sistemas Frontend**: 8
- **Componentes React**: 30+
- **Test Suites**: 18

### Performance
- **Pathfinding**: < 100ms para distancias típicas
- **State Sync**: < 100ms latency
- **Depth Sorting**: 60 FPS con 200 objetos + 50 avatares
- **Database Queries**: < 50ms reads, < 100ms writes
- **Concurrent Users**: 100+ por oficina

## 📚 Documentación Adicional

- **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio rápido
- **[PROJECT-STATUS.md](PROJECT-STATUS.md)** - Estado general del proyecto
- **[IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md)** - Estado de implementación detallado
- **[FRONTEND-COMPLETE.md](FRONTEND-COMPLETE.md)** - Frontend completado
- **[INTEGRATION-NOTES.md](INTEGRATION-NOTES.md)** - Notas de integración
- **[DATABASE-READY.md](DATABASE-READY.md)** - Estado de la base de datos
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guía de contribución
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura del sistema

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Todos los tests
npm test -- unit           # Solo unit tests
npm test -- integration    # Solo integration tests
npm test -- properties     # Solo property-based tests
```

### Frontend Tests
```bash
cd frontend
npm test                    # Todos los tests
npm test -- --coverage     # Con coverage
```

### Test Coverage
- **Backend**: 18 test suites (unit + property + integration)
- **Frontend**: Tests para sistemas core
- **Total**: ~80% code coverage

## 🚀 Roadmap

### ✅ Completado (v1.0)
- Sistema de gamificación completo
- Sistema de interacciones avanzadas
- Pathfinding con A*
- Depth sorting y spatial partitioning
- 6 estados de avatar sincronizados
- Sistema de colas FIFO
- 15+ eventos Socket.IO
- Tests comprehensivos

### 🔄 En Progreso (v1.1)
- Integración con sistemas existentes
- Tests de integración completos
- Admin panel para crear objetos
- Performance optimization

### 📋 Planeado (v2.0)
- Sistema de voz (WebRTC)
- Audio 3D espacial
- Particle effects
- Mobile support
- VR support (opcional)

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.

### Proceso de Contribución
1. Fork el repositorio
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Desarrollado por el equipo de ECG Digital City.

## 🙏 Agradecimientos

- Three.js community
- React Three Fiber
- Socket.IO team
- Render platform

---

**🌐 Demo:** https://ecg-digital-city.onrender.com  
**📧 Contacto:** [email]  
**📱 Discord:** [server-invite]
# Force rebuild 03/06/2026 23:53:34

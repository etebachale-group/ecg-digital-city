# 📚 ECG Digital City - Metaverso Corporativo 3D

**Estado:** 🟢 Listo para Desplegar  
**Versión:** 1.0.0  
**Última actualización:** 5 de Marzo 2026

---

## 🎯 Visión General

ECG Digital City es un metaverso corporativo 3D donde empresas pueden crear oficinas virtuales, colaborar en tiempo real y gamificar la experiencia laboral. Construido con React Three Fiber, Socket.IO y PostgreSQL.

---

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Backend
cd backend
npm install
npm start

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

**Acceso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

### Desplegar en Render

```bash
# 1. Subir a GitHub
git push origin main

# 2. En Render Dashboard
# - New + → Blueprint
# - Conectar repositorio
# - Apply

# 3. Configurar variables (ver RENDER.md)

# 4. Ejecutar migraciones
cd backend && node scripts/migrate.js
```

📖 **Guías:**
- `PROYECTO.md` - Estado del proyecto
- `RENDER.md` - Guía simple de despliegue
- `RENDER-QUICKSTART.md` - Inicio rápido
- `RENDER-DEPLOYMENT.md` - Guía completa

---

## 📁 Estructura del Proyecto

```
ecg-digital-city/
├── backend/              # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/      # Database, Redis
│   │   ├── models/      # 15 modelos Sequelize
│   │   ├── routes/      # 10 endpoints API
│   │   ├── sockets/     # 4 handlers Socket.IO
│   │   ├── modules/     # Módulos futuros (Packet System, Game Engine)
│   │   └── utils/       # Logger, seeders
│   └── tests/           # Jest tests
│
├── frontend/            # React + Three.js + Vite
│   ├── src/
│   │   ├── components/  # 30+ componentes React
│   │   ├── store/       # 4 Zustand stores
│   │   ├── modules/     # Módulos futuros
│   │   └── assets/      # Imágenes, logos
│   └── tests/           # Vitest tests
│
├── docs/                # Documentación organizada
│   ├── setup/          # Guías de configuración WSL
│   ├── phases/         # Documentación de fases
│   ├── technical-specs/ # Especificaciones técnicas
│   ├── testing/        # Testing y bugs
│   └── archive/        # Documentación histórica
│
├── .github/
│   └── workflows/      # CI/CD GitHub Actions
│
├── Makefile            # Comandos útiles
├── PROYECTO-STATUS.md  # Estado actual del proyecto
├── TAREAS-PENDIENTES.md # Lista de tareas
└── AHORA-QUE.md        # Próximos pasos
```

---

## 🎮 Funcionalidades

### ✅ Backend
- Autenticación (JWT, roles)
- Sistema de Interacciones Avanzadas
- 15 modelos de base de datos
- 11 endpoints REST API
- Socket.IO para tiempo real
- Tests completos (18 suites)

### ✅ Frontend
- Mundo 3D (React Three Fiber)
- 6 sistemas core (navegación, pathfinding, interacciones)
- Movimiento WASD, cámara 3D
- Chat en tiempo real
- Editor de oficinas
- Tests completos (property-based + unit)

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Real-time:** Socket.IO
- **ORM:** Sequelize
- **Auth:** JWT + bcryptjs
- **Testing:** Jest
- **Logging:** Winston

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **3D Engine:** Three.js 160+
- **3D React:** React Three Fiber 8+
- **3D Helpers:** React Three Drei 9+
- **Real-time:** Socket.IO Client
- **State:** Zustand
- **Testing:** Vitest

### DevOps
- **OS:** WSL 2 Ubuntu (Windows)
- **CI/CD:** GitHub Actions
- **Linting:** ESLint + Prettier
- **Version Control:** Git + GitHub

---

## 📚 Documentación

### Principal
- `PROYECTO.md` - Estado completo del proyecto
- `README.md` - Este archivo

### Despliegue
- `RENDER.md` - Guía simple
- `RENDER-QUICKSTART.md` - Inicio rápido
- `RENDER-DEPLOYMENT.md` - Guía completa

### Técnica
- `docs/technical-specs/` - Especificaciones técnicas
- `.kiro/specs/` - Especificaciones y tareas
- `backend/docs/` - Documentación API

### Configuración
- `docs/setup/` - Guías de configuración WSL
- `CONTRIBUTING.md` - Guía de contribución

---

## 🎯 Roadmap

Ver `.kiro/specs/sistema-interacciones-avanzadas/tasks.md` para tareas detalladas.

**Próximas funcionalidades:**
- Sistema de paquetes binarios
- Game Engine ECS
- Voice Chat WebRTC
- Audio 3D espacial

---

## 🤝 Contribuir

Lee `CONTRIBUTING.md` para conocer estándares de código y proceso de desarrollo.

---

## 📊 Estado Actual

- Backend: 100% completo
- Frontend: 100% completo
- Tests: Todos pasando
- Documentación: Completa
- Listo para desplegar

---

**¿Listo para empezar?** Lee `PROYECTO.md` y ejecuta los comandos de inicio rápido.

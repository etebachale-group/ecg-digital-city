# 📚 ECG Digital City - Metaverso Corporativo 3D

**Estado:** 🟢 PHASE 0 Completada - Listo para PHASE 1  
**Versión:** 1.0.0  
**Última actualización:** 2 de Marzo 2026

---

## 🎯 Visión General

ECG Digital City es un metaverso corporativo 3D donde empresas pueden crear oficinas virtuales, colaborar en tiempo real y gamificar la experiencia laboral. Construido con React Three Fiber, Socket.IO y PostgreSQL.

---

## 🚀 Inicio Rápido

### Desarrollo Local

#### Opción 1: Script Automático (Recomendado)
```powershell
# Desde Windows PowerShell
.\start-dev-wsl.ps1
```

#### Opción 2: Manual
```bash
# Instalar dependencias
make install

# Iniciar servicios (PostgreSQL + Redis)
make services-start

# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### Acceso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

📖 **Guía completa:** Lee `AHORA-QUE.md` para más detalles

### Despliegue en Producción (Render)

#### Inicio Rápido (10 minutos)
```bash
# 1. Verificar configuración
node scripts/verify-deployment.js

# 2. Subir a Git
git add .
git commit -m "Configurar para Render"
git push origin main

# 3. En Render Dashboard
# - New + > Blueprint
# - Conectar repositorio
# - Apply
# - Esperar 10 minutos
```

📖 **Guías de despliegue:**
- `RENDER-QUICKSTART.md` - Inicio rápido (10 minutos)
- `RENDER-DEPLOYMENT.md` - Guía completa
- `DEPLOYMENT-RENDER-SUMMARY.md` - Resumen ejecutivo

**¿Por qué Render?**
- ✅ Backend + Frontend en un solo servicio
- ✅ Socket.IO funciona perfectamente
- ✅ PostgreSQL y Redis incluidos
- ✅ SSL/HTTPS automático
- ✅ Plan gratuito generoso

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

## 🎮 Funcionalidades Actuales

### ✅ Implementado
- **Autenticación:** Registro, login, JWT, roles
- **Mundo 3D:** Distritos, oficinas, movimiento WASD, cámara 3D
- **Gamificación:** XP, niveles, logros, misiones, leaderboard
- **Social:** Chat en tiempo real, usuarios online
- **Empresas:** Crear/editar empresas, asignar oficinas
- **Editor:** Editor de oficinas con objetos 3D

### ⏳ En Desarrollo (PHASE 1)
- Sistema de paquetes binarios
- Compresión delta
- Optimización de bandwidth

### 🔮 Futuro (PHASE 2+)
- Game Engine ECS
- Voice Chat WebRTC
- Audio 3D espacial
- Sistema de economía
- Mini juegos

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

### Inicio Rápido
- `AHORA-QUE.md` - Próximos pasos y cómo empezar
- `docs/setup/QUICKSTART-WSL.md` - Inicio en 5 minutos
- `docs/setup/SETUP-WSL-UBUNTU.md` - Configuración completa

### Estado del Proyecto
- `PROYECTO-STATUS.md` - Estado actual detallado
- `TAREAS-PENDIENTES.md` - Lista de tareas pendientes
- `docs/phases/PHASE-0-COMPLETADA.md` - Resumen Phase 0

### Técnica
- `docs/technical-specs/PACKET-SYSTEM-SPEC.md` - Sistema de paquetes (1800+ líneas)
- `docs/technical-specs/GAME-ENGINE-SPEC.md` - Motor de juego (2000+ líneas)
- `WORKFLOW-IMPLEMENTACION-COMPLETA.md` - Roadmap 12 fases

### Testing
- `docs/testing/TESTING-ERRORS.md` - Bugs y testing

### Contribución
- `CONTRIBUTING.md` - Guía de contribución
- `.github/PULL_REQUEST_TEMPLATE.md` - Template de PR

---

## 🎯 Roadmap

```
✅ PHASE 0: Infraestructura (Q1 2026) - COMPLETADA
⏳ PHASE 1: Packet System (Q1 2026) - EN PREPARACIÓN
🔮 PHASE 2: Game Engine Prototipo (Q2 2026)
🔮 PHASE 3: Engine Completo (Q3 2026)
🔮 PHASE 4: Voice Chat (Q4 2026)
🔮 PHASE 5: Audio 3D (Q1 2027)
🔮 PHASE 6: Testing & Feedback (Q2 2027)
🔮 PHASE 7: Optimización (Q3 2027)
🔮 PHASE 8: Expansión Features (Q4 2027)
🔮 PHASE 9: Beta Launch (Q1 2028)
🔮 PHASE 10: Adquisición (Q2 2028)
🔮 PHASE 11: Release v1.0 (Q3 2028)
🔮 PHASE 12: Soporte Post-Release (Q4 2028+)
```

**Duración Total:** 2-2.5 años

---

## 🤝 Contribuir

Lee `CONTRIBUTING.md` para conocer:
- Cómo configurar el entorno
- Estándares de código
- Proceso de Git Flow
- Cómo hacer Pull Requests
- Convenciones de commits

---

## 📊 Estado Actual

- **Líneas de código:** ~15,000
- **Componentes React:** 30+
- **Modelos de BD:** 15
- **Endpoints API:** 10
- **Paquetes npm:** 755
- **Documentación:** 10,000+ líneas
- **Tests:** Por implementar
- **Cobertura:** 0% (objetivo: 90%+)

---

## 🐛 Bugs Conocidos

Todos los bugs críticos han sido corregidos. Ver `docs/testing/TESTING-ERRORS.md` para detalles.

---

## 📞 Soporte

- **Documentación:** Revisa la carpeta `docs/`
- **Issues:** Reporta bugs en GitHub Issues
- **Pull Requests:** Usa el template de PR

---

## 📄 Licencia

Por definir

---

## 👥 Equipo

Por definir

---

**¿Listo para empezar?** Lee `AHORA-QUE.md` y ejecuta `.\start-dev-wsl.ps1`

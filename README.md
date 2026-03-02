# 🏢 ECG Digital City - Oficina Virtual Multijugador

Plataforma de oficina virtual 3D multijugador con gamificación, construida con React Three Fiber, Node.js, PostgreSQL y Redis.

## 🚀 Características

### ✅ Fase 1-4: Sistema Base Completo
- **Autenticación**: Sistema completo de registro/login con JWT
- **Mundo 3D**: Oficina virtual navegable con controles WASD
- **Multijugador**: Sincronización en tiempo real con Socket.IO
- **Distritos**: Múltiples zonas navegables (Central, Tecnología, Negocios, etc.)
- **Empresas y Oficinas**: Sistema completo de gestión
- **Permisos**: Control de acceso granular a oficinas
- **Editor de Oficinas**: Personalización 3D en tiempo real
- **Chat**: Sistema de mensajería por proximidad

### ✅ Fase 5: Sistema de Gamificación (95% Completo)
- **Sistema de XP y Niveles**: Progresión automática
- **Logros**: 16 achievements desbloqueables
- **Misiones Diarias**: 10 misiones con seguimiento de progreso
- **Eventos**: Sistema de eventos comunitarios
- **Leaderboard**: Ranking global de jugadores
- **Integraciones Automáticas**:
  - +5 XP por mensaje de chat (máx 50/día)
  - +20 XP por visitar distritos (máx 4 únicos)
  - +100 XP por crear empresa
  - +50 XP por crear oficina
  - +10 XP por login diario con racha

## 📋 Requisitos

- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Ubuntu/WSL (para PostgreSQL y Redis)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd animejs
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
```

### 4. Iniciar PostgreSQL y Redis (en WSL/Ubuntu)
```bash
sudo service postgresql start
sudo service redis-server start
```

### 5. Crear base de datos
```bash
# En WSL/Ubuntu
sudo -u postgres psql
CREATE DATABASE ecg_digital_city;
\q
```

## 🚀 Ejecución

### Backend (Puerto 3000)
```bash
cd backend
npm run dev
```

### Frontend (Puerto 5173)
```bash
cd frontend
npm run dev
```

Acceder a: http://localhost:5173

## 📁 Estructura del Proyecto

```
animejs/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración DB y Redis
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Endpoints API REST
│   │   ├── sockets/        # Handlers Socket.IO
│   │   ├── utils/          # Utilidades y seeds
│   │   └── server.js       # Servidor principal
│   ├── logs/               # Logs de aplicación
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── store/          # Estado Zustand
│   │   └── services/       # Socket.IO client
│   └── package.json
└── README.md
```

## 🎮 Controles

- **WASD**: Movimiento del avatar
- **Mouse**: Rotar cámara
- **E**: Interactuar con objetos/NPCs
- **T**: Abrir chat
- **M**: Abrir mapa de distritos
- **ESC**: Cerrar ventanas

## 🔧 Tecnologías

### Frontend
- React 18
- React Three Fiber (Three.js)
- Zustand (Estado global)
- Socket.IO Client
- Vite

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- Redis (Caché y leaderboards)
- Socket.IO (WebSockets)
- JWT (Autenticación)
- Winston (Logging)

## 📊 Base de Datos

### Modelos Principales
- **User**: Usuarios del sistema
- **Avatar**: Apariencia de usuarios
- **Company**: Empresas
- **Office**: Oficinas virtuales
- **District**: Zonas del mundo
- **OfficeObject**: Objetos 3D en oficinas
- **Permission**: Control de acceso
- **Achievement**: Logros
- **Mission**: Misiones
- **Event**: Eventos comunitarios
- **UserProgress**: Progreso de gamificación

## 🎯 Próximas Funcionalidades

- [ ] Desbloqueo automático de achievements
- [ ] Sistema de notificaciones push
- [ ] Integración con calendario
- [ ] Videollamadas integradas
- [ ] Marketplace de objetos 3D
- [ ] Sistema de clanes/equipos

## 📝 Documentación Adicional

- `DOCUMENTACION.md`: Documentación técnica completa
- `GUIA-USUARIO.md`: Guía de usuario
- `PROJECT-STRUCTURE.md`: Estructura detallada del proyecto
- `ROADMAP-ECG-DIGITAL-CITY.md`: Roadmap de desarrollo
- `FASE5-GAMIFICACION-EVENTOS.md`: Especificación Fase 5
- `FASE5-COMPLETADO.md`: Estado actual Fase 5

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verificar PostgreSQL
sudo service postgresql status
# Verificar Redis
sudo service redis-server status
```

### Frontend en blanco
- Verificar que el backend esté corriendo
- Revisar consola del navegador (F12)
- Limpiar localStorage y recargar

### Sesión se cierra al refrescar
- Verificar que zustand persist esté configurado
- Revisar que el token se guarde en localStorage

## 👥 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📧 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

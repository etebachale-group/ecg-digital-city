# 🌍 ECG Digital City - Backend

Backend multijugador para la oficina virtual 3D de Eteba Chale Group.

## 🚀 Quick Start

### 1. Setup PostgreSQL (Ubuntu/WSL)

```bash
# En tu terminal de Ubuntu/WSL
cd /mnt/c/xampp/htdocs/animejs/backend
bash setup-postgres-ubuntu.sh
```

### 2. Configurar Variables de Entorno

Edita `backend/.env` y actualiza la contraseña de PostgreSQL si es necesario:

```env
DB_PASSWORD=tu_password_real
```

### 3. Iniciar Servidor

```bash
# Desde PowerShell/CMD en Windows
cd backend
npm run dev
```

### 4. Verificar

Abre http://localhost:3000 en tu navegador.

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración (DB, Redis)
│   ├── models/           # Modelos Sequelize (User, Avatar)
│   ├── routes/           # Rutas API REST
│   ├── sockets/          # Handlers Socket.IO
│   ├── utils/            # Utilidades (logger)
│   └── server.js         # Servidor principal
├── logs/                 # Logs de la aplicación
├── .env                  # Variables de entorno
└── package.json          # Dependencias
```

## 🔧 Tecnologías

- **Node.js 18+** - Runtime
- **Express** - Framework web
- **Socket.IO** - WebSockets en tiempo real
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Winston** - Logging

## 📡 API Endpoints

### Autenticación

```bash
# Registro
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "fullName": "Full Name"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Usuarios

```bash
# Obtener perfil
GET /api/users/:id

# Actualizar perfil
PUT /api/users/:id
{
  "fullName": "New Name",
  "username": "newusername"
}
```

### Health Check

```bash
GET /health
```

## 🔌 Socket.IO Events

### Cliente → Servidor

```javascript
// Movimiento de avatar
socket.emit('avatar:move', {
  x: 10,
  y: 0,
  z: 5,
  rotation: 0
});

// Detener movimiento
socket.emit('avatar:stop', {
  x: 10,
  y: 0,
  z: 5
});

// Teletransporte
socket.emit('teleport:request', {
  district: 'desarrollo',
  position: { x: 0, y: 0, z: 0 }
});

// Enviar mensaje de chat
socket.emit('chat:message', {
  content: 'Hola!',
  type: 'proximity' // o 'room', 'global'
});

// Indicador de escritura
socket.emit('chat:typing', {
  isTyping: true
});
```

### Servidor → Cliente

```javascript
// Lista de usuarios online
socket.on('world:users', (data) => {
  console.log(data.users);
});

// Usuario se unió
socket.on('world:user-joined', (data) => {
  console.log(data.userId, data.username, data.position);
});

// Usuario se movió
socket.on('world:user-moved', (data) => {
  console.log(data.userId, data.position, data.rotation);
});

// Usuario salió
socket.on('world:user-left', (data) => {
  console.log(data.userId);
});

// Mensaje de chat recibido
socket.on('chat:message', (data) => {
  console.log(data.senderName, data.content);
});

// Usuario está escribiendo
socket.on('chat:typing', (data) => {
  console.log(data.username, data.isTyping);
});

// Teletransporte exitoso
socket.on('teleport:success', (data) => {
  console.log(data.district, data.position);
});
```

## 🗄️ Modelos de Base de Datos

### User

```javascript
{
  id: INTEGER,
  email: STRING (unique),
  passwordHash: STRING,
  username: STRING (unique),
  fullName: STRING,
  companyId: INTEGER,
  role: STRING (default: 'user'),
  level: INTEGER (default: 1),
  xp: INTEGER (default: 0),
  avatarId: INTEGER,
  lastLogin: DATE
}
```

### Avatar

```javascript
{
  id: INTEGER,
  userId: INTEGER,
  skinColor: STRING (default: '#fdbcb4'),
  hairStyle: STRING (default: 'short'),
  hairColor: STRING (default: '#000000'),
  shirtColor: STRING (default: '#3498db'),
  pantsColor: STRING (default: '#2c3e50'),
  accessories: JSONB (default: {})
}
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Test con coverage
npm run test:coverage
```

## 📝 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Linting
npm run lint

# Ver logs
tail -f logs/combined.log
tail -f logs/error.log
```

## 🐛 Troubleshooting

### PostgreSQL no conecta

```bash
# En Ubuntu/WSL
sudo service postgresql status
sudo service postgresql start

# Verificar puerto
sudo netstat -plunt | grep 5432
```

### Redis no conecta

```bash
# En Ubuntu/WSL
sudo service redis-server status
sudo service redis-server start

# O en Windows
# Buscar "Services" y verificar Redis
```

### Puerto 3000 ocupado

```bash
# Cambiar puerto en .env
PORT=3001
```

### Error de autenticación PostgreSQL

```bash
# En Ubuntu/WSL
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nueva_password';
\q

# Actualizar backend/.env
```

## 📚 Documentación Adicional

- [INICIO-RAPIDO.md](./INICIO-RAPIDO.md) - Guía de inicio rápido
- [SETUP-UBUNTU-POSTGRES.md](./SETUP-UBUNTU-POSTGRES.md) - Configuración PostgreSQL en Ubuntu
- [INSTRUCCIONES-SETUP.md](./INSTRUCCIONES-SETUP.md) - Instrucciones detalladas de setup

## 🔐 Seguridad

- JWT para autenticación
- Bcrypt para hash de contraseñas
- Helmet para headers de seguridad
- Rate limiting en API
- CORS configurado
- Validación de inputs

## 🚀 Próximos Pasos (Fase 1)

- [ ] Frontend React con Socket.IO client
- [ ] Sincronización de avatares en tiempo real
- [ ] Testing unitario y de integración
- [ ] Documentación API con Swagger
- [ ] CI/CD con GitHub Actions

## 📄 Licencia

Propiedad de Eteba Chale Group © 2026

## 👥 Equipo

Desarrollado por el equipo de Eteba Chale Group

---

**Versión**: 1.0.0  
**Estado**: Fase 1 - 70% Completado  
**Última actualización**: Marzo 2026

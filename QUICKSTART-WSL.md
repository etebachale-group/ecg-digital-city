# 🚀 Inicio Rápido - WSL Ubuntu

Guía rápida para desarrolladores que quieren empezar inmediatamente.

## ✅ Requisitos

- Windows 10/11 con WSL 2
- Ubuntu en WSL
- Node.js 18+ instalado en WSL
- PostgreSQL 14+ instalado en WSL  
- Redis 7+ instalado en WSL

## ⚡ Inicio en 5 minutos

### Opción A: Script Automático (Recomendado)

**Desde PowerShell en Windows:**

```powershell
# Primera vez: dar permisos al script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Iniciar todo automáticamente
.\start-dev-wsl.ps1

# Ver estado
.\start-dev-wsl.ps1 -Status

# Detener servicios
.\start-dev-wsl.ps1 -Stop
```

**Desde WSL Ubuntu:**

```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city

# Hacer script ejecutable (primera vez)
chmod +x start-dev-wsl.sh

# Iniciar
./start-dev-wsl.sh
```

### Opción B: Comandos Make

```bash
# Instalar dependencias (primera vez)
make install

# Iniciar servicios
make services-start

# En Terminal 1: Backend
cd backend && npm run dev

# En Terminal 2: Frontend
cd frontend && npm run dev

# Ver estado
make health
```

### Opción C: Manual

```bash
# Terminal 1 - PostgreSQL
wsl sudo service postgresql start
wsl sudo service postgres createdb ecg_digital_city

# Terminal 2 - Redis
wsl sudo service redis-server start

# Terminal 3 - Backend
cd backend && npm install && npm run dev

# Terminal 4 - Frontend
cd frontend && npm install && npm run dev
```

## 🌐 Acceso desde Windows

Una vez ejecutándose:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Health | http://localhost:3000/health |
| Base de Datos | localhost:5432 (usuario: postgres) |
| Redis | localhost:6379 |

## 📝 Variables de Entorno

### Backend (`backend/.env`)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 🧪 Ejecutar Tests

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Con cobertura
make test-cov

# Ver cobertura
# Abrir: backend/coverage/index.html
#        frontend/coverage/index.html
```

## 🎨 Linting y Formato

```bash
# Verificar linting
make lint

# Arreglar automáticamente
make lint-fix

# Formatear código
make format

# Verificar formato
make format-check
```

## 📊 Useful WSL Commands

```bash
# Conectar a PostgreSQL
wsl psql -U postgres -d ecg_digital_city

# Redis CLI
wsl redis-cli

# Ver procesos Node
wsl ps aux | grep node

# Ver logs de PostgreSQL
wsl sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Reiniciar PostgreSQL
wsl sudo service postgresql restart

# Reiniciar Redis
wsl sudo service redis-server restart
```

## ⚠️ Problemas Comunes

### PostgreSQL no inicia

```bash
wsl sudo service postgresql restart
wsl sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Redis no inicia

```bash
wsl redis-cli ping  # Debe responder PONG

# Si no responde:
wsl sudo service redis-server restart
```

### npm install falla

```bash
cd backend
npm cache clean --force
npm install

cd ../frontend
npm cache clean --force
npm install
```

### Los puertos 3000 o 5173 ya están en uso

```bash
# Windows: Matar procesos por puerto
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# WSL: Matar procesos
wsl sudo lsof -i :3000
wsl sudo kill -9 <PID>
```

## 🔧 Configuración Avanzada

### Aumentar memoria de WSL

Editar `C:\Users\<User>\.wslconfig`:

```ini
[wsl2]
memory=4GB
processors=4
```

Luego reiniciar: `wsl --shutdown`

### Auto-iniciar servicios en WSL

Agregar a `~/.bashrc` en WSL:

```bash
# Auto-iniciar servicios (sin contraseña con sudoers)
sudo service postgresql start 2>/dev/null
sudo service redis-server start 2>/dev/null
```

## 📖 Documentación Completa

Ver [SETUP-WSL-UBUNTU.md](SETUP-WSL-UBUNTU.md) para instalación completa y troubleshooting detallado.

## 🚀 Próximos Pasos

1. ✅ Ejecutar `make install` para instalar dependencias
2. ✅ Ejecutar `make services-start` para iniciar BD y cache
3. ✅ Abrir dos terminales y ejecutar `npm run dev` en backend y frontend
4. 📖 Revisar [IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md) para roadmap
5. 🔨 Comenzar con [WORKFLOW-IMPLEMENTACION-COMPLETA.md](WORKFLOW-IMPLEMENTACION-COMPLETA.md)

---

**Última actualización**: Marzo 2026  
**Ambiente**: WSL 2 Ubuntu, Node.js 18+, PostgreSQL 14+, Redis 7+

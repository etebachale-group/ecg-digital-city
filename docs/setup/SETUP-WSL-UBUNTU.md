# Configuración de Desarrollo en WSL Ubuntu

Guía completa para configurar el entorno de desarrollo ECG Digital City en WSL Ubuntu en lugar de Docker.

## Requisitos Previos

- Windows 10/11 con WSL 2 instalado
- Ubuntu 20.04 o superior en WSL
- ~5GB de espacio disponible en WSL
- Terminal PowerShell o CMD con acceso a `wsl`

## Paso 1: Inicializar WSL Ubuntu

```bash
# En Windows PowerShell - Verificar WSL instalado
wsl --list --verbose

# Si no está instalado, ejecutar
wsl --install -d Ubuntu

# Iniciar WSL
wsl

# Actualizar paquetes
sudo apt-get update && sudo apt-get upgrade -y
```

## Paso 2: Instalar Node.js y npm

```bash
# Agregar repositorio NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js 18.x
sudo apt-get install -y nodejs

# Verificar versiones
node --version  # debe ser v18.x.x
npm --version   # debe ser 9.x.x o superior
```

## Paso 3: Instalar PostgreSQL 14

```bash
# Agregar repositorio PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Agregar llave GPG
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Actualizar e instalar PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql-14 postgresql-contrib-14

# Iniciar servicio PostgreSQL
sudo service postgresql start

# Verificar estado
sudo service postgresql status

# Configurar usuario postgres (opcional - si necesitas cambiar contraseña)
sudo -u postgres psql
# En psql:
# ALTER USER postgres PASSWORD 'postgres';
# \q
```

## Paso 4: Instalar Redis

```bash
# Instalar Redis
sudo apt-get install -y redis-server

# Iniciar servicio Redis
sudo service redis-server start

# Verificar estado
sudo service redis-server status

# Prueba de conexión
redis-cli ping  # debe responder PONG
```

## Paso 5: Instalar Herramientas Adicionales

```bash
# Git (generalmente ya viene instalado)
sudo apt-get install -y git

# Build essentials (necesario para compilar módulos nativos de Node)
sudo apt-get install -y build-essential python3

# cURL (para testing de API)
sudo apt-get install -y curl

# Verificar instalaciones
git --version
gcc --version
curl --version
```

## Paso 6: Clonar/Configurar Repositorio

```bash
# Navegar al directorio del proyecto
cd /mnt/c/xampp/htdocs/ecg-digital-city

# Instalar dependencias backend
cd backend
npm install

# Instalar dependencias frontend
cd ../frontend
npm install

# Volver a directorio raíz
cd ..
```

## Paso 7: Configurar Variables de Entorno

### Backend (.env)

```bash
# backend/.env
cat > backend/.env << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Socket.IO
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
EOF
```

### Frontend (.env)

```bash
# frontend/.env
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_ENV=development
EOF
```

## Paso 8: Crear Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# En la consola de psql, ejecutar:
CREATE DATABASE ecg_digital_city;
\c ecg_digital_city

# Si tienes scripts de seeding, ejecutarlos aquí
# \i /path/to/schema.sql

# Salir
\q

# O hacer todo en una línea:
sudo -u postgres createdb ecg_digital_city
```

## Paso 9: Iniciar Servicios

### Opción A: Iniciar en Terminal Separadas (Desarrollo)

```bash
# Terminal 1 - PostgreSQL (si no está en systemd)
sudo service postgresql start

# Terminal 2 - Redis (si no está en systemd)
sudo service redis-server start

# Terminal 3 - Backend
cd backend
npm run dev

# Terminal 4 - Frontend
cd frontend
npm run dev
```

### Opción B: Crear Script de Inicio Automático

```bash
# Crear script de inicio
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando servicios ECG Digital City..."

# Iniciar PostgreSQL
echo "📦 PostgreSQL..."
sudo service postgresql start

# Iniciar Redis
echo "🔴 Redis..."
sudo service redis-server start

# Esperar 2 segundos
sleep 2

# Iniciar Backend
echo "⚙️  Backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Iniciar Frontend
echo "🌐 Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Servicios iniciados"
echo "📊 Backend: http://localhost:3000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Para detener: Presionar Ctrl+C o ejecutar: kill $BACKEND_PID $FRONTEND_PID"

wait
EOF

chmod +x start-dev.sh
./start-dev.sh
```

## Acceso desde Windows

Una vez que todo está ejecutándose en WSL, puedes acceder desde Windows usando:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (desde WSL) o `local\\.\\pipe\\PostgreSQL.14` (desde Windows con WSL)

## Comandos Útiles

```bash
# Ver procesos Node o redis
ps aux | grep node
ps aux | grep redis

# Estado de servicios
sudo service postgresql status
sudo service redis-server status

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Conectar a PostgreSQL desde WSL
psql -U postgres -d ecg_digital_city -h localhost

# Conectar a Redis desde WSL
redis-cli

# Limpiar (detener servicios)
sudo service postgresql stop
sudo service redis-server stop
```

## Troubleshooting

### PostgreSQL no inicia

```bash
# Ver estado y logs
sudo service postgresql status
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Reiniciar
sudo service postgresql restart

# Reconstruir cluster si está corrupto
sudo pg_dropcluster 14 main
sudo pg_createcluster 14 main
sudo service postgresql start
```

### Redis no inicia

```bash
# Ver estado
sudo service redis-server status

# Verificar puerto 6379
sudo netstat -tlnp | grep 6379

# Matar proceso si está colgado
sudo pkill redis-server
sudo service redis-server start
```

### npm install falla

```bash
# Limpiar caché de npm
npm cache clean --force

# Instalar build-essential si falta
sudo apt-get install -y build-essential python3

# Intentar de nuevo
npm install
```

### Imports de módulos fallan

```bash
# Verificar que las carpetas existan
ls -la backend/src/modules/
ls -la frontend/src/modules/

# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

## Automatizar Inicio de Servicios (Opcional)

Para que PostgreSQL y Redis inicien automáticamente al abrir WSL:

```bash
# Editar sudoers para permitir servicios sin contraseña
sudo visudo

# Agregar al final:
%sudo ALL=(ALL) NOPASSWD: /usr/sbin/service postgresql *
%sudo ALL=(ALL) NOPASSWD: /usr/sbin/service redis-server *

# Luego en ~/.bashrc o ~/.zshrc agregar:
sudo service postgresql start 2>/dev/null
sudo service redis-server start 2>/dev/null
```

## Performance Tips

1. **Ubicación del código**: Mantén el código en `/mnt/c/` para acceso desde Windows, pero considera que WSL→Windows es más lento que WSL→WSL
2. **VS Code**: Usa "Remote - WSL" extension para mejor performance
3. **Memoria**: WSL usa ~1GB por defecto, ajustar en `%UserProfile%\.wslconfig` si necesitas más:
```
[wsl2]
memory=4GB
processors=4
```

## Próximos Pasos

1. ✅ Configuración completada
2. Ejecutar `npm install` en backend y frontend
3. Ejecutar tests: `npm test`
4. Ejecutar linting: `npm run lint`
5. Iniciar desarrollo: ver "Paso 9"

---

**Última actualización**: Marzo 2026
**Versión**: 1.0
**Requisitos mínimos**: WSL 2, Ubuntu 20.04, Node.js 18+, PostgreSQL 14, Redis 7+

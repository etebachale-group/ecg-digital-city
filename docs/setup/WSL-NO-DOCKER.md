# 📝 Cambio de Docker a WSL

**Fecha**: Marzo 2, 2026  
**Razón**: Preferencia del usuario por WSL Ubuntu en lugar de Docker

## ¿Qué cambió?

### ❌ Docker (Anterior)

```
Windows
  └─ Docker Desktop
      ├─ PostgreSQL Container
      ├─ Redis Container
      ├─ Backend Container
      └─ Frontend Container
```

**Problemas:**
- Overhead de virtualización
- Configuración compleja de volúmenes
- Consumo de recursos en Windows
- Requisito de Docker Desktop

### ✅ WSL 2 Ubuntu (Actual)

```
Windows
  └─ WSL 2 Ubuntu
      ├─ PostgreSQL (nativo)
      ├─ Redis (nativo)
      ├─ Node.js Backend
      └─ Node.js Frontend (acceso desde Windows)
```

**Ventajas:**
- Mejor performance (WSL 2 es más eficiente que Docker en Windows)
- Acceso directo a servicios desde Windows
- Menos consumo de recursos
- Ejecución directa sin containers
- Más fácil debug y logs
- Compatible con VS Code Remote WSL

## Archivos Afectados

### ❌ Eliminados (relativo a Docker)

```
docker-compose.dev.yml      → No necesario
docker/Dockerfile.dev       → No necesario  
docker/Dockerfile.dev.frontend → No necesario
```

### ✅ Creados (WSL)

```
SETUP-WSL-UBUNTU.md         → Guía de instalación completa
QUICKSTART-WSL.md           → Guía rápida
start-dev-wsl.sh            → Script bash para WSL
start-dev-wsl.ps1           → Script PowerShell para Windows
WSL-NO-DOCKER.md            → Este documento
```

### 📝 Modificados

```
Makefile                    → Reescrito sin comandos Docker
README.md                   → Actualizado con instrucciones WSL
```

## Configuración De Archivos Clave

### Makefile - Nuevos Targets

```makefile
# Servicios WSL
make services-start         # Iniciar PostgreSQL y Redis en WSL
make services-stop          # Detener servicios
make services-status        # Ver estado de servicios

# Base de datos
make db-setup               # Crear BD
make db-reset               # Reconstruir BD
make db-seed                # Llenar con datos iniciales

# Desarrollo
make dev                    # Instrucciones para dev
make dev-backend            # Iniciar backend
make dev-frontend           # Iniciar frontend

# Info
make health                 # Ver estado servicios
make info                   # Ver configuración
```

### Variables de Entorno

No hay cambios - los archivos `.env` siguen siendo los mismos:

**backend/.env**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecg_digital_city
REDIS_HOST=localhost
REDIS_PORT=6379
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Flujo de Desarrollo

### Antes (Docker)

```bash
make docker-build           # Construir imágenes
make docker-up              # Iniciar containers
npm install (dentro del container)
npm run dev (dentro del container)
make docker-logs            # Ver logs
make docker-down            # Detener
```

### Ahora (WSL)

```bash
make install                # npm install en ambos
make services-start         # Iniciar PostgreSQL + Redis en WSL
make dev-backend            # Terminal 1: npm run dev backend
make dev-frontend           # Terminal 2: npm run dev frontend
make health                 # Ver estado
make services-stop          # Detener servicios cuando termines
```

## Requisitos del Sistema

### Antes (Docker)

- Windows 10/11
- Docker Desktop
- ~6 GB RAM para Docker

### Ahora (WSL)

- Windows 10 (versión 1903+) o Windows 11
- WSL 2 instalado
- Ubuntu en WSL
- Node.js 18+ en WSL
- PostgreSQL 14+ en WSL
- Redis 7+ en WSL
- ~4 GB RAM disponible

## Scripts de Automatización

### Script WSL (bash)

**Ubicación**: `start-dev-wsl.sh`

```bash
# Uso
./start-dev-wsl.sh

# Qué hace:
# 1. Verifica requisitos (Node, npm, PostgreSQL, Redis)
# 2. Inicia PostgreSQL (si no está ejecutándose)
# 3. Inicia Redis (si no está ejecutándose)
# 4. Crea BD si no existe
# 5. Instala node_modules si faltan
# 6. Inicia Backend (npm run dev)
# 7. Inicia Frontend (npm run dev)
# 8. Muestra URLs accesibles
# 9. Ctrl+C para detener todo
```

### Script PowerShell (Windows)

**Ubicación**: `start-dev-wsl.ps1`

```powershell
# Uso desde Windows
.\start-dev-wsl.ps1        # Iniciar todo
.\start-dev-wsl.ps1 -Status # Ver estado
.\start-dev-wsl.ps1 -Stop   # Detener servicios

# Ventaja: No necesitas abrir WSL manualmente
```

## Acceso desde Windows

### Conexión a Servicios en WSL

Desde una aplicación en Windows, puedes acceder a los servicios en WSL directamente:

```
PostgreSQL:  localhost:5432
Redis:       localhost:6379
Backend:     localhost:3000
Frontend:    localhost:5173
```

### Herramientas WSL desde Windows

```powershell
# Ejecutar comando en WSL
wsl command

# Conectar a PostgreSQL en WSL
wsl psql -U postgres -d ecg_digital_city

# Conectar a Redis en WSL
wsl redis-cli

# Ver procesos en WSL
wsl ps aux | grep node
```

## Migración desde Docker (Si Aplica)

Si ya estabas usando Docker y quieres migrar:

### 1. Exportar datos de Docker

```bash
# Backup de base de datos desde Docker
docker-compose exec postgres pg_dump -U postgres ecg_digital_city > backup.sql
```

### 2. Instalar en WSL

```bash
# Seguir SETUP-WSL-UBUNTU.md
```

### 3. Restaurar datos

```bash
# Restaurar en WSL
wsl psql -U postgres ecg_digital_city < backup.sql
```

### 4. Detener Docker

```bash
# Eliminar containers viejos
make docker-down docker-clean
```

## Performance Comparison

| Aspecto | Docker | WSL 2 |
|---------|--------|-------|
| Startup Time | 30-60s | 5-10s |
| Memory (VM) | 2-4 GB | 0.5-1 GB |
| Disk Usage | 5-10 GB | 1-2 GB |
| File I/O | Lento | Rápido |
| DB Performance | Medio | Rápido |
| Dev Experience | Buenos logs | Mejor debug |

## FAQ

### ¿Puedo seguir usando Docker?

No, los archivos Docker han sido eliminados del proyecto. El proyecto ahora usa WSL Ubuntu exclusivamente.

### ¿Cómo cambio entre desarrolladores?

Todos los desarrolladores deben usar WSL Ubuntu para mantener consistencia en el entorno de desarrollo.

### ¿WSL funciona en Windows 10?

Sí, WSL 2 funciona en Windows 10 v1903 o superior.

### ¿Qué pasa con VS Code Remote?

Funciona perfecto con WSL. Instala la extensión "Remote - WSL" para mejor integración.

### ¿Y si quiero volver a Docker?

Los archivos Docker han sido eliminados. Si necesitas Docker, deberás crear tu propia configuración desde cero.

## Documentación Relacionada

- [QUICKSTART-WSL.md](QUICKSTART-WSL.md) - Inicio en 5 minutos
- [SETUP-WSL-UBUNTU.md](SETUP-WSL-UBUNTU.md) - Setup completo paso a paso
- [Makefile](Makefile) - Comandos disponibles
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribuciones

---

**Conclusión**: WSL ofrece un mejor balance entre simplicidad, performance y experiencia de desarrollador en Windows.

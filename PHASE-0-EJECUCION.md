# ⚡ ACCIÓN INMEDIATA - PHASE 0: PREPARACIÓN

**Fecha:** 2026-03-02  
**Duración estimada:** 2-3 semanas  
**Team:** 2-3 devs  
**Prioridad:** 🔴 CRÍTICA

---

## 🎯 OBJETIVO FINAL DE PHASE 0

Al finalizar Phase 0, tendremos:
✅ Estructura de carpetas completamente organizada  
✅ Documentación técnica lista  
✅ CI/CD y testing framework configurado  
✅ Equipo alineado y listo para Phase 1  
✅ Git flow establecido  

---

## 📋 TAREAS SEMANA 1 (2026-03-02 a 2026-03-08)

### TASK 0.1.1: Crear estructura de carpetas
**Responsable:** Dev Lead  
**Estimación:** 2 horas  
**Dependencias:** Ninguna

**Qué hacer:**
```bash
# Backend
mkdir -p backend/src/modules/packetSystem
mkdir -p backend/src/modules/gameEngine
mkdir -p backend/src/modules/gameEngine/AI
mkdir -p backend/src/modules/voiceChat
mkdir -p backend/src/modules/audio3D
mkdir -p backend/src/modules/optimizations
mkdir -p backend/tests/unit
mkdir -p backend/tests/integration
mkdir -p backend/tests/load

# Frontend
mkdir -p frontend/src/modules/packetSystem
mkdir -p frontend/src/modules/gameEngine
mkdir -p frontend/src/modules/voiceChat
mkdir -p frontend/src/modules/audio3D
mkdir -p frontend/src/modules/optimizations
mkdir -p frontend/tests/unit
mkdir -p frontend/tests/integration
mkdir -p frontend/tests/e2e

# Documentación
mkdir -p docs/architecture
mkdir -p docs/technical-specs
mkdir -p docs/api
mkdir -p docs/deployment

# DevOps
mkdir -p .github/workflows
mkdir -p docker
mkdir -p k8s
```

**Checklist:**
- [ ] Carpetas creadas
- [ ] `.gitkeep` files agregados
- [ ] Commit al repo

### TASK 0.1.2: Actualizar .gitignore
**Responsable:** Cualquier dev  
**Estimación:** 30 min

```
# Agregar al .gitignore
node_modules/
dist/
build/
.env.local
.env.*.local
*.log
coverage/
.DS_Store
.vscode/settings.json
```

### TASK 0.1.3: Crear README.md para cada módulo
**Responsable:** Tech Lead  
**Estimación:** 4 horas

**Plantilla para cada README:**
```markdown
# [Nombre del Módulo]

## Descripción
Explicar qué hace este módulo y por qué existe.

## Status
- [ ] Fase 1: Spec Completa
- [ ] Fase 2: Prototipo
- [ ] Fase 3: Feature Complete
- [ ] Fase 4: Tested (80%+)
- [ ] Fase 5: Production Ready

## Dependencias
Listar dependencias internas y externas.

## API
Documentar la API pública del módulo.

## Ejemplos
Código de ejemplo.

## Testing
Cómo correr tests.

## Contribuyendo
Guías para PRs.
```

**Módulos que necesitan README:**
- [x] packetSystem
- [x] gameEngine
- [x] voiceChat
- [x] audio3D
- [x] optimizations

---

### TASK 0.2.1: Configurar testing framework Backend
**Responsable:** Dev con experiencia en Jest  
**Estimación:** 4 horas

**Qué hacer:**
```bash
cd backend
npm install --save-dev jest @types/jest jest-config supertest
npx jest --init
```

**Configuración jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};
```

**Archivos a crear:**
- `backend/jest.config.js`
- `backend/tests/setup.js`
- `backend/tests/helpers.js`
- `backend/package.json` actualizado con scripts

### TASK 0.2.2: Configurar testing framework Frontend
**Responsable:** Dev con experiencia en Vitest  
**Estimación:** 3 horas

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom happy-dom
```

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
})
```

### TASK 0.2.3: Configurar CI/CD GitHub Actions
**Responsable:** DevOps/Lead Dev  
**Estimación:** 5 horas

**Crear `.github/workflows/ci.yml`:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Run tests
        run: cd frontend && npm test
      
      - name: Build
        run: cd frontend && npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

### TASK 0.3.1: Escribir especificaciones técnicas - Packet System
**Responsable:** Tech Lead  
**Estimación:** 6 horas

**Archivo:** `docs/technical-specs/PACKET-SYSTEM-SPEC.md`

**Contenido:**
```markdown
# Especificación Técnica: Sistema de Paquetes

## 1. Visión General
- Protocolo binario eficiente para comunicación cliente-servidor
- Compresión delta para minimizar bandwidth
- Entrega confiable para datos críticos
- Desempaquetamiento rápido en cliente

## 2. Formato de Paquete
```
[Header: 8 bytes]
  - Type (1 byte): 0-255 tipos de paquete
  - ID (2 bytes): Identificador único del paquete
  - Flags (1 byte): Confiable, Comprimido, etc.
  - Timestamp (4 bytes): Timestamp del servidor

[Body: Variable]
  - Length (2 bytes): Tamaño de payload
  - Payload: Datos

[Checksum: 4 bytes]
  - CRC32
```

## 3. Tipos de Paquete
- 0x01-0x0F: Sistema
- 0x10-0x1F: Movimiento
- 0x20-0x2F: Gamificación
- 0x30-0x3F: Chat
- 0x40-0x4F: Voz
- 0x50-0x5F: Audio
- etc.

## 4. Compresión Delta
- Comparar estado actual con anterior
- Transmitir solo cambios
- Aplicar en cliente para reconstruir

## 5. Entrega Confiable
- ACK para paquetes críticos
- Reintentos exponenciales
- Timeout después de 3 reintentos

## 6. Performance
- Serialización <1ms
- Deserialization <1ms
- Compresión 40-60% reducción de tamaño
```

### TASK 0.3.2: Escribir especificaciones técnicas - Game Engine
**Responsable:** Tech Lead  
**Estimación:** 8 horas

**Archivo:** `docs/technical-specs/GAME-ENGINE-SPEC.md`

**Secciones principales:**
- Entity Component System (ECS)
- Game Loop (60 TPS)
- World State Management
- Event Dispatcher
- Integración con Socket.IO

### TASK 0.3.3: Escribir especificaciones técnicas - Voice Chat
**Responsable:** Tech Lead  
**Estimación:** 6 horas

**Archivo:** `docs/technical-specs/VOICE-CHAT-SPEC.md`

**Secciones:**
- WebRTC setup
- Audio processing pipeline
- Noise cancellation algorithm
- Room/channel management
- Bandwidth estimation

### TASK 0.3.4: Escribir especificaciones técnicas - Audio 3D
**Responsable:** Tech Lead  
**Estimación:** 6 horas

**Archivo:** `docs/technical-specs/AUDIO-3D-SPEC.md`

**Secciones:**
- HRTF implementation
- Spatial positioning
- Distance attenuation
- Environmental reverb
- Integration con voiceChat

---

## 📋 TAREAS SEMANA 2 (2026-03-09 a 2026-03-15)

### TASK 0.4.1: Configurar Docker para desarrollo
**Responsable:** DevOps  
**Estimación:** 4 horas

**Crear `docker-compose.dev.yml`:**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ecg_digital_city
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ecg_digital_city
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/src:/app/src

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
  redis_data:
```

**Crear `backend/Dockerfile.dev`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**Crear `frontend/Dockerfile.dev`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

### TASK 0.4.2: Configurar Makefile para comandos comunes
**Responsible:** Cualquier dev  
**Estimación:** 2 horas

**Crear `Makefile`:**
```makefile
.PHONY: help install dev test test-cov lint format clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development servers"
	@echo "  make test        - Run all tests"
	@echo "  make test-cov    - Run tests with coverage"
	@echo "  make lint        - Run linters"
	@echo "  make format      - Format code"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make docker-up   - Start Docker containers"
	@echo "  make docker-down - Stop Docker containers"

install:
	cd backend && npm install
	cd frontend && npm install

dev:
	docker-compose -f docker-compose.dev.yml up

test:
	cd backend && npm test
	cd frontend && npm test

test-cov:
	cd backend && npm test -- --coverage
	cd frontend && npm test -- --coverage

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

format:
	cd backend && npm run format
	cd frontend && npm run format

clean:
	rm -rf backend/dist backend/coverage
	rm -rf frontend/dist frontend/coverage

docker-up:
	docker-compose -f docker-compose.dev.yml up -d

docker-down:
	docker-compose -f docker-compose.dev.yml down
```

### TASK 0.5.1: Configurar linting y formatting
**Responsable:** Dev con experiencia  
**Estimación:** 3 horas

**Backend - Instalar ESLint:**
```bash
cd backend
npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import prettier
npx eslint --init
```

**Backend - Crear `.eslintrc.js`:**
```javascript
module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
    jest: true
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'func-names': 'off'
  }
};
```

**Backend - Crear `.prettierrc`:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Frontend - Similar con React rules**

**Agregar a package.json scripts:**
```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```

### TASK 0.6.1: Crear plantilla de PR
**Responsable:** Tech Lead  
**Estimación:** 1 hora

**Crear `.github/PULL_REQUEST_TEMPLATE.md`:**
```markdown
## Descripción
Describe los cambios en este PR.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Checklist antes de submit
- [ ] Tests escritos y pasando
- [ ] Documentación actualizada
- [ ] Sin console.log o debug code
- [ ] Código formateado (lint pasando)
- [ ] Commits descriptivos

## Testing realizado
Describe cómo testeaste tus cambios.

## Screenshots (si aplica)
Incluir screenshots o videos.
```

### TASK 0.6.2: Crear guía de contribución
**Responsable:** Tech Lead  
**Estimación:** 2 horas

**Crear `CONTRIBUTING.md`:**
```markdown
# Guía de Contribución

## Proceso de desarrollo

### 1. Crear una rama
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Desarrollo
- Escribir tests primero (TDD)
- Implementar feature
- Ejecutar tests localmente

### 3. Commit
Usar conventional commits:
```
feat: agregar sistema de paquetes
fix: corregir bug en compresión delta
docs: actualizar README
test: agregar tests de serialización
```

### 4. Push y PR
```bash
git push origin feature/your-feature-name
# Abrir PR en GitHub
```

### 5. Review process
- Code review obligatoria
- Tests deben pasar en CI
- Merge a develop
- Delete branch

## Estándares de código

### JavaScript
- ESLint + Prettier
- 80+ caracteres de línea máximo
- Nombres descriptivos

### Testing
- Jest/Vitest
- 80%+ coverage mínimo
- Tests descriptivos

## Preguntas?
Contacta al tech lead.
```

---

## 📋 TAREAS SEMANA 3 (2026-03-16 a 2026-03-22)

### TASK 0.7.1: Crear arquitectura diagrams
**Responsable:** Tech Lead  
**Estimación:** 4 horas

**Diagrama 1: System Architecture**
- Backend boxes, Frontend box, Database, Redis, WebSocket
- Mostrar comunicación entre componentes

**Diagrama 2: Module Dependencies**
- Mostrar cómo interactúan packetSystem, gameEngine, voiceChat, etc.

**Crear en:** `docs/architecture/ARCHITECTURE.md`

**Herramienta:** Mermaid o Lucidchart

### TASK 0.7.2: Documentar API design decisions
**Responsable:** Tech Lead  
**Estimación:** 3 horas

**Crear `docs/architecture/API-DESIGN.md`:**
- RESTful vs Real-time
- Packet-based communication
- State synchronization strategy
- Error handling approach

### TASK 0.8.1: Setup load testing framework
**Responsable:** DevOps/Perf Dev  
**Estimación:** 3 horas

```bash
npm install -g k6
npm install -g artillery
```

**Crear `backend/tests/load/basic-load.js`:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up
    { duration: '2m', target: 100 },  // Stay at 100
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('http://backend:3000/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### TASK 0.8.2: Crear documento de Git Flow
**Responsable:** Tech Lead  
**Estimación:** 2 horas

**Crear `docs/GITFLOW.md`:**
```markdown
# Git Flow Strategy

## Ramas principales
- **main**: Producción
- **develop**: Desarrollo
- **feature/**: Nuevas features
- **bugfix/**: Correcciones
- **release/**: Preparación de release
- **hotfix/**: Parches urgentes

## Proceso
1. Branch de develop
2. Hacer cambios en feature/nombre
3. Push y abrir PR
4. Code review
5. Merge a develop
6. Delete feature branch

## Screenshots por fases
[Mostrar workflow visual]
```

---

## ✅ CHECKLIST FINAL PHASE 0

### Infraestructura
- [ ] Carpetas creadas correctamente
- [ ] .gitignore actualizado
- [ ] README.md para cada módulo
- [ ] Makefile con comandos comunes
- [ ] Docker Compose configurado
- [ ] CI/CD GitHub Actions funcionando

### Testing
- [ ] Jest configurado en backend
- [ ] Vitest configurado en frontend
- [ ] Scripts de test en package.json
- [ ] Coverage reporting setup
- [ ] Load testing framework ready

### Documentación
- [ ] Especificaciones técnicas completas (4)
- [ ] Arquitectura documentada
- [ ] API design decisions
- [ ] Git flow documentado
- [ ] Contributing guide
- [ ] PR template

### Configuración
- [ ] ESLint configurado
- [ ] Prettier configurado
- [ ] CI/CD passing
- [ ] Linting en pre-commit (opcional)
- [ ] Versioning strategy definida

### Team
- [ ] Equipo capacitado
- [ ] Roles asignados
- [ ] Comunicación establecida
- [ ] Standups configurados
- [ ] Retrospectivas programadas

---

## 🎯 ENTREGA FINAL PHASE 0

**Entregables:**
1. ✅ Repositorio organizado
2. ✅ 4 especificaciones técnicas completas
3. ✅ CI/CD funcional
4. ✅ Testing framework completo
5. ✅ Documentación de arquitectura
6. ✅ Team capacitado y alineado

**Criterio de éxito:**
- Todos los files de spec completados
- CI/CD green (tests passing)
- Documentation review aprobada
- Team kickoff meeting completed
- Ready para Phase 1

---

## 📅 TIMELINE SUGGERIDO

**Semana 1 (2026-03-02):**
- Lunes-Martes: Tasks 0.1.x (2h)
- Martes-Miércoles: Tasks 0.2.x (8h)
- Jueves-Viernes: Tasks 0.3.x (16h)

**Semana 2 (2026-03-09):**
- Lunes-Martes: Tasks 0.4.x (6h)
- Martes-Miércoles: Task 0.5.x (3h)
- Jueves-Viernes: Tasks 0.6.x (3h)

**Semana 3 (2026-03-16):**
- Lunes-Martes: Tasks 0.7.x (7h)
- Martes-Miércoles: Task 0.8.x (5h)
- Jueves: Buffer + reviews
- Viernes: Final checks + team meeting

---

## 🚀 SIGUIENTE PASO: PHASE 1

Una vez Phase 0 completada:
1. Team meeting de kickoff Phase 1
2. Sprint planning detallado
3. Asignación de tasks
4. Estimación de velocidad
5. **START: Implementación de Packet System**

---

**Documento creado:** 2026-03-02  
**Estado:** 🟢 Listo para comenzar  
**Responsable:** Tech Lead

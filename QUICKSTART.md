# 🚀 Quick Start - ECG Digital City

Guía rápida para poner el proyecto en marcha en 5 minutos.

---

## Opción 1: Ver la App en Producción

**URL:** https://ecg-digital-city.onrender.com

1. Abre el navegador
2. Crea una cuenta
3. ¡Explora el mundo virtual!

---

## Opción 2: Desarrollo Local

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- Git

### Pasos

#### 1. Clonar y Setup (2 min)
```bash
# Clonar
git clone <repo-url>
cd ecg-digital-city

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

#### 2. Configurar Base de Datos (1 min)
```bash
# Copiar .env
cd backend
cp .env.example .env

# Editar backend/.env con tus credenciales PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=ecg_digital_city
# DB_USER=postgres
# DB_PASSWORD=tu_password
```

#### 3. Inicializar BD (1 min)
```bash
cd backend/scripts
node reload-database.js
# Escribir "SI" cuando pregunte
```

Esto crea:
- 19 tablas
- 3 vistas
- 4 distritos
- 8 logros
- 7 misiones

#### 4. Iniciar Servidores (1 min)
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Escucha en http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Abre http://localhost:5173
```

#### 5. ¡Listo! 🎉
- Abre http://localhost:5173
- Crea una cuenta
- Explora el mundo

---

## Verificación Rápida

### Backend funcionando?
```bash
curl http://localhost:3000/api/districts
# Debe retornar JSON con 4 distritos
```

### Base de datos OK?
```bash
cd backend
node test-db-connection.js
# Debe mostrar: ✅ Conexión exitosa
# 📊 Tablas en la base de datos: 22
```

### Tests pasando?
```bash
cd backend
npm test
# Todos los tests deben pasar
```

---

## Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar credenciales en backend/.env
cat backend/.env | grep DB_
```

### Error: Port 3000 already in use
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

### Error: Module not found
```bash
# Reinstalar dependencias
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

---

## Comandos Útiles

```bash
# Ver logs del backend
cd backend
npm run dev

# Build frontend para producción
cd frontend
npm run build

# Limpiar y recargar BD
cd backend/scripts
node reload-database.js

# Ejecutar tests
cd backend && npm test
cd frontend && npm test

# Ver estructura de BD
cd backend
node test-db-connection.js
```

---

## Próximos Pasos

1. Lee [README.md](README.md) para documentación completa
2. Revisa [docs/](docs/) para especificaciones técnicas
3. Consulta [PROJECT-STATUS.md](PROJECT-STATUS.md) para estado actual
4. Lee [CONTRIBUTING.md](CONTRIBUTING.md) si quieres contribuir

---

## Recursos

- **Documentación:** `/docs`
- **API Docs:** `backend/docs/api-routes-extended.md`
- **Scripts BD:** `backend/scripts/README.md`
- **Specs:** `.kiro/specs/sistema-interacciones-avanzadas/`

---

## Ayuda

¿Problemas? Revisa:
1. [Troubleshooting](#troubleshooting)
2. Issues en GitHub
3. Logs en `backend/logs/`

¡Feliz desarrollo! 🚀

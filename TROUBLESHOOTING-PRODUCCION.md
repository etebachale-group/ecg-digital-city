# 🔧 Troubleshooting - Errores 500 en Producción

**Fecha:** 2026-03-06  
**Problema:** Todos los endpoints del backend devuelven error 500

## 🚨 Síntomas

```
XHR GET /api/gamification/progress/2 [HTTP/3 500]
XHR GET /api/districts [HTTP/3 500]
XHR GET /api/missions/user/2 [HTTP/3 500]
XHR POST /api/gamification/daily-login [HTTP/3 500]
XHR POST /api/missions/assign-daily [HTTP/3 500]
```

## 🔍 Diagnóstico

### Paso 1: Verificar Logs en Render

1. Ir a https://dashboard.render.com
2. Seleccionar el servicio `ecg-digital-city`
3. Click en "Logs"
4. Buscar errores recientes

**Errores comunes a buscar:**
- `Error conectando a la base de datos`
- `SequelizeDatabaseError`
- `syntax error at or near`
- `relation "table_name" does not exist`

### Paso 2: Verificar Variables de Entorno

En Render Dashboard → Service → Environment:

```
✅ DB_HOST=dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com
✅ DB_PORT=5432
✅ DB_NAME=ecg_digital_city_sqmj
✅ DB_USER=ecg_digital_city_sqmj_user
✅ DB_PASSWORD=sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD
✅ NODE_ENV=production
✅ JWT_SECRET=(debe estar configurado)
```

### Paso 3: Verificar Estado de la Base de Datos

Conectarse a la base de datos desde Render Shell o localmente:

```bash
psql -h dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com \
     -p 5432 \
     -U ecg_digital_city_sqmj_user \
     -d ecg_digital_city_sqmj
```

**Verificar tablas:**
```sql
-- Listar todas las tablas
\dt

-- Verificar que existan las tablas críticas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar datos en districts
SELECT * FROM districts;

-- Verificar datos en users
SELECT id, username, email FROM users LIMIT 5;
```

## 🛠️ Soluciones

### Solución 1: Recargar Base de Datos (Si está vacía)

Si las tablas no existen o están vacías:

```bash
# Desde tu máquina local
cd backend/scripts
node reload-database.js
# Escribir "SI" cuando pregunte
```

**IMPORTANTE:** Esto borrará todos los datos existentes.

### Solución 2: Ejecutar Solo el Seed (Si las tablas existen)

Si las tablas existen pero están vacías:

```sql
-- Conectarse a la base de datos
psql -h dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com \
     -p 5432 \
     -U ecg_digital_city_sqmj_user \
     -d ecg_digital_city_sqmj

-- Ejecutar inserts manualmente
INSERT INTO districts (name, slug, description, max_capacity, is_active) VALUES
('Recepción', 'recepcion', 'Área de bienvenida y registro', 100, true),
('Zona Corporativa', 'corporativa', 'Oficinas de empresas', 50, true),
('Zona Social', 'social', 'Área de eventos y networking', 200, true),
('Zona Comercial', 'comercial', 'Tiendas y servicios', 150, true);

-- Verificar
SELECT * FROM districts;
```

### Solución 3: Forzar Redeploy en Render

Si el código está correcto pero el deploy falló:

1. Ir a Render Dashboard
2. Seleccionar el servicio
3. Click en "Manual Deploy" → "Deploy latest commit"
4. Esperar ~5 minutos
5. Verificar logs durante el deploy

### Solución 4: Verificar Sequelize Sync

El problema puede ser que Sequelize no está sincronizando correctamente. Verificar en `backend/src/config/database.js`:

```javascript
// Debe tener:
await sequelize.sync({ alter: false, force: false })
```

**NO usar `force: true` en producción** (borra todas las tablas).

### Solución 5: Ejecutar Migraciones Manualmente

Si las migraciones no se ejecutaron:

```bash
# En Render Shell (si tienes acceso) o localmente apuntando a producción
cd backend
npx sequelize-cli db:migrate
```

## 🔄 Script de Recuperación Rápida

Crear un archivo `backend/scripts/fix-production.js`:

```javascript
const { sequelize } = require('../src/config/database')
const { seedDistricts } = require('../src/utils/seedDistricts')
const { seedGamification } = require('../src/utils/seedGamification')
const logger = require('../src/utils/logger')

async function fixProduction() {
  try {
    logger.info('🔧 Iniciando fix de producción...')
    
    // 1. Verificar conexión
    await sequelize.authenticate()
    logger.info('✅ Conexión a BD exitosa')
    
    // 2. Sincronizar modelos (sin force)
    await sequelize.sync({ alter: false })
    logger.info('✅ Modelos sincronizados')
    
    // 3. Seed de distritos
    await seedDistricts()
    logger.info('✅ Distritos seeded')
    
    // 4. Seed de gamificación
    await seedGamification()
    logger.info('✅ Gamificación seeded')
    
    logger.info('🎉 Fix completado exitosamente')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Error en fix:', error)
    process.exit(1)
  }
}

fixProduction()
```

**Ejecutar:**
```bash
cd backend/scripts
node fix-production.js
```

## 📊 Checklist de Verificación

Después de aplicar cualquier solución:

- [ ] Backend responde en `/api/health` (si existe)
- [ ] `/api/districts` devuelve 4 distritos
- [ ] `/api/gamification/progress/:userId` devuelve progreso
- [ ] `/api/missions/user/:userId` devuelve misiones
- [ ] Frontend carga sin errores 500
- [ ] Login funciona correctamente
- [ ] XP Bar muestra datos correctos

## 🚀 Prevención Futura

### 1. Agregar Health Check Endpoint

En `backend/src/server.js`:

```javascript
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate()
    const districtCount = await District.count()
    
    res.json({
      status: 'ok',
      database: 'connected',
      districts: districtCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    })
  }
})
```

### 2. Mejorar Logging

Agregar más logs en endpoints críticos:

```javascript
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/districts - Iniciando')
    const districts = await District.findAll()
    logger.info(`GET /api/districts - Encontrados ${districts.length} distritos`)
    res.json(districts)
  } catch (error) {
    logger.error('GET /api/districts - Error:', error)
    res.status(500).json({ error: error.message })
  }
})
```

### 3. Agregar Retry Logic

Para conexiones a BD:

```javascript
const retry = require('async-retry')

await retry(async () => {
  await sequelize.authenticate()
}, {
  retries: 5,
  minTimeout: 1000,
  maxTimeout: 5000
})
```

## 📞 Contacto de Emergencia

Si nada funciona:

1. **Rollback:** Revertir al último commit funcional
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Recrear Base de Datos:** 
   - Eliminar base de datos en Render
   - Crear nueva base de datos
   - Actualizar variables de entorno
   - Ejecutar script de recarga

3. **Soporte Render:** https://render.com/support

## 📝 Notas

- **Backup:** Siempre hacer backup antes de cambios en producción
- **Testing:** Probar en staging antes de producción
- **Monitoring:** Configurar alertas para errores 500
- **Logs:** Revisar logs regularmente

---

**Última actualización:** 2026-03-06  
**Estado:** Documento de troubleshooting activo

# 🔍 Verificar Estado de Producción

## Paso 1: Verificar Health Check

Abre en tu navegador:
```
https://ecg-digital-city.onrender.com/health
```

### Respuestas Posibles:

#### ✅ Todo OK
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "districts": 4,
    "achievements": 8,
    "users": 10
  }
}
```
**Acción:** Si ves esto, el backend está funcionando. El problema puede ser en el frontend.

#### ⚠️ BD Conectada pero Sin Datos
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "districts": 0,
    "achievements": 0,
    "users": 0
  }
}
```
**Acción:** Necesitas ejecutar el seed. Ver Paso 2.

#### ❌ BD No Conectada
```json
{
  "status": "error",
  "error": "mensaje de error",
  "database": {
    "connected": false
  }
}
```
**Acción:** Problema de conexión a BD. Ver Paso 3.

---

## Paso 2: Ejecutar Seed en Producción

### Opción A: Desde Render Shell (Si tienes acceso)

1. Ir a https://dashboard.render.com
2. Seleccionar servicio `ecg-digital-city`
3. Click en "Shell" (requiere plan pagado)
4. Ejecutar:
```bash
cd backend/scripts
node fix-production.js
```

### Opción B: Conectarse Directamente a la BD

Desde tu máquina local:

```bash
# Instalar psql si no lo tienes
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Conectarse
psql -h dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com \
     -p 5432 \
     -U ecg_digital_city_sqmj_user \
     -d ecg_digital_city_sqmj

# Password: sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD
```

Una vez conectado, ejecutar:

```sql
-- Verificar tablas
\dt

-- Si las tablas existen pero están vacías, insertar datos:

-- Distritos
INSERT INTO districts (name, slug, description, max_capacity, is_active, created_at, updated_at) VALUES
('Recepción', 'recepcion', 'Área de bienvenida y registro', 100, true, NOW(), NOW()),
('Zona Corporativa', 'corporativa', 'Oficinas de empresas', 50, true, NOW(), NOW()),
('Zona Social', 'social', 'Área de eventos y networking', 200, true, NOW(), NOW()),
('Zona Comercial', 'comercial', 'Tiendas y servicios', 150, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar
SELECT * FROM districts;

-- Logros
INSERT INTO achievements (name, description, icon, xp_reward, condition_type, condition_value, is_active, created_at, updated_at) VALUES
('Primera Visita', 'Visitaste ECG Digital City por primera vez', '🎉', 50, 'login_count', 1, true, NOW(), NOW()),
('Explorador', 'Visitaste los 4 distritos', '🗺️', 100, 'districts_visited', 4, true, NOW(), NOW()),
('Social', 'Enviaste 10 mensajes en el chat', '💬', 75, 'messages_sent', 10, true, NOW(), NOW()),
('Asistente', 'Asististe a 5 eventos', '🎪', 150, 'events_attended', 5, true, NOW(), NOW()),
('Racha de Fuego', 'Mantén una racha de 7 días', '🔥', 200, 'streak_days', 7, true, NOW(), NOW()),
('Nivel 10', 'Alcanza el nivel 10', '⭐', 500, 'level', 10, true, NOW(), NOW()),
('Maestro', 'Alcanza el nivel 50', '👑', 2000, 'level', 50, true, NOW(), NOW()),
('Leyenda', 'Alcanza el nivel 100', '🏆', 5000, 'level', 100, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar
SELECT * FROM achievements;

-- Misiones
INSERT INTO missions (name, description, type, xp_reward, requirements, is_active, created_at, updated_at) VALUES
('Bienvenida', 'Completa tu primer login', 'daily', 10, '{"action":"login","count":1}', true, NOW(), NOW()),
('Explorador Diario', 'Visita 2 distritos diferentes', 'daily', 20, '{"action":"visit_districts","count":2}', true, NOW(), NOW()),
('Comunicador', 'Envía 5 mensajes en el chat', 'daily', 15, '{"action":"send_messages","count":5}', true, NOW(), NOW()),
('Networker', 'Conoce a 3 personas diferentes', 'weekly', 50, '{"action":"meet_users","count":3}', true, NOW(), NOW()),
('Asistente Activo', 'Asiste a 2 eventos', 'weekly', 75, '{"action":"attend_events","count":2}', true, NOW(), NOW()),
('Maratonista', 'Mantén una racha de 7 días', 'weekly', 100, '{"action":"maintain_streak","days":7}', true, NOW(), NOW()),
('Maestro del Metaverso', 'Alcanza el nivel 5', 'weekly', 200, '{"action":"reach_level","level":5}', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar
SELECT * FROM missions;

-- Salir
\q
```

### Opción C: Forzar Redeploy con Seed

1. Asegurarte que el seed se ejecuta en startup
2. Hacer un cambio mínimo en el código
3. Push a main
4. Render hará redeploy automático

```bash
# Hacer un cambio mínimo
echo "# Deploy $(date)" >> README.md

git add .
git commit -m "chore: trigger redeploy to run seeds"
git push origin main
```

---

## Paso 3: Verificar Variables de Entorno

Si el health check muestra error de conexión:

1. Ir a https://dashboard.render.com
2. Seleccionar servicio `ecg-digital-city`
3. Click en "Environment"
4. Verificar que existan:

```
DB_HOST=dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecg_digital_city_sqmj
DB_USER=ecg_digital_city_sqmj_user
DB_PASSWORD=sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD
NODE_ENV=production
JWT_SECRET=(cualquier string largo)
```

Si falta alguna, agregarla y hacer redeploy.

---

## Paso 4: Verificar Logs de Render

1. Ir a https://dashboard.render.com
2. Seleccionar servicio `ecg-digital-city`
3. Click en "Logs"
4. Buscar errores recientes

**Errores comunes:**
- `Error conectando a la base de datos`
- `relation "table_name" does not exist`
- `syntax error at or near`

---

## Paso 5: Solución Rápida - Recrear BD

Si nada funciona, recrear la base de datos:

### ⚠️ ADVERTENCIA: Esto borrará todos los datos

1. En Render Dashboard, ir a la base de datos PostgreSQL
2. Click en "Delete Database"
3. Crear nueva base de datos con el mismo nombre
4. Actualizar variables de entorno si cambiaron las credenciales
5. Hacer redeploy del servicio
6. El seed se ejecutará automáticamente

---

## 🎯 Diagnóstico Rápido

Ejecuta estos comandos en orden:

```bash
# 1. Verificar health check
curl https://ecg-digital-city.onrender.com/health

# 2. Verificar endpoint de distritos
curl https://ecg-digital-city.onrender.com/api/districts

# 3. Verificar endpoint de logros
curl https://ecg-digital-city.onrender.com/api/achievements
```

**Interpretación:**
- Si `/health` funciona pero `/api/districts` falla → Problema de seed
- Si `/health` falla → Problema de conexión a BD
- Si todos fallan → Backend no está corriendo

---

## 📞 Siguiente Paso

Después de verificar el health check, dime qué respuesta obtuviste y te diré exactamente qué hacer.


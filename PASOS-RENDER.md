# 🚀 Pasos para Subir a Render

## Paso 1: Subir a GitHub (2 minutos)

```bash
git push origin main
```

Espera a que termine de subir todos los archivos.

---

## Paso 2: Crear Servicios en Render (5 minutos)

### 2.1 Ir a Render Dashboard
1. Abre tu navegador
2. Ve a: https://dashboard.render.com
3. Inicia sesión (o crea cuenta si no tienes)

### 2.2 Crear desde Blueprint
1. Haz clic en **New +** (botón azul arriba a la derecha)
2. Selecciona **Blueprint**
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Busca y selecciona el repositorio **ecg-digital-city**
5. Haz clic en **Apply**

Render creará automáticamente:
- ✅ Web Service (ecg-digital-city)
- ✅ PostgreSQL (ecg-digital-city-db)
- ✅ Redis (ecg-digital-city-redis)

**Espera 5-10 minutos** mientras Render construye y despliega.

---

## Paso 3: Configurar Variables de Entorno (3 minutos)

### 3.1 Ir al Web Service
1. En el Dashboard, haz clic en **ecg-digital-city** (el Web Service)
2. Ve a la pestaña **Environment**

### 3.2 Agregar Variables de Base de Datos
Haz clic en **Add Environment Variable** y agrega estas:

```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
DB_DIALECT = postgres
```

### 3.3 Agregar Variables de Redis
1. Ve al Dashboard principal
2. Haz clic en **ecg-digital-city-redis**
3. Copia el **Internal Redis URL** (algo como: redis://red-xxxxx:6379)
4. Vuelve al Web Service → Environment
5. Agrega:

```
REDIS_HOST = red-xxxxx.oregon-redis.render.com
REDIS_PORT = 6379
REDIS_PASSWORD = <copia el password del Redis URL>
```

### 3.4 Agregar CORS_ORIGIN
```
CORS_ORIGIN = https://ecg-digital-city.onrender.com
```

### 3.5 Guardar
Haz clic en **Save Changes**

El servicio se reiniciará automáticamente (espera 2-3 minutos).

---

## Paso 4: Ejecutar Migraciones de Base de Datos (2 minutos)

### 4.1 Abrir Shell
1. En el Web Service **ecg-digital-city**
2. Ve a la pestaña **Shell** (arriba)
3. Haz clic en **Launch Shell**

### 4.2 Ejecutar Migraciones
En la terminal que se abre, escribe:

```bash
cd backend
node scripts/migrate.js
```

Deberías ver:
```
✅ Migraciones ejecutadas correctamente
```

---

## Paso 5: Verificar que Funciona (1 minuto)

### 5.1 Health Check
Abre en tu navegador:
```
https://ecg-digital-city.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T..."
}
```

### 5.2 Ver la Aplicación
Abre:
```
https://ecg-digital-city.onrender.com
```

Deberías ver tu aplicación funcionando.

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en:
**https://ecg-digital-city.onrender.com**

---

## 🔧 Comandos Útiles

### Ver Logs
En el Web Service → **Logs**

### Reiniciar Servicio
En el Web Service → **Manual Deploy** → **Deploy latest commit**

### Ejecutar Comandos
En el Web Service → **Shell** → **Launch Shell**

---

## ⚠️ Notas Importantes

1. **Primera carga lenta**: La primera vez que alguien accede, puede tardar 30-60 segundos (plan gratuito)
2. **Inactividad**: Después de 15 minutos sin uso, el servicio se duerme. La próxima visita lo despierta.
3. **Base de datos**: Los datos persisten, no se pierden cuando el servicio se duerme.

---

## 🆘 ¿Problemas?

### Error de conexión a base de datos
- Verifica que las variables DB_* estén correctas
- Asegúrate de que ejecutaste las migraciones

### Error 502 Bad Gateway
- Espera 2-3 minutos, el servicio está iniciando
- Revisa los logs en la pestaña **Logs**

### Frontend no carga
- Verifica que el build se completó correctamente en los logs
- Busca errores en la sección de build

---

## 📖 Más Información

- **RENDER.md** - Guía simple
- **RENDER-DEPLOYMENT.md** - Guía completa
- **PROYECTO.md** - Estado del proyecto

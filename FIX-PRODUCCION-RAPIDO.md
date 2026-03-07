# 🚨 Fix Rápido para Producción

## Problema
Errores 500 en:
- `/api/missions/user/:id`
- `/api/missions/assign-daily`
- `/api/offices/district/:id`

## Causa
Base de datos vacía en producción.

## Solución (5 minutos)

### 1. Abrir Shell en Render

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. Click en pestaña "Shell"

### 2. Ejecutar Fix Automático

```bash
cd backend
npm run fix:production
```

**Esto hará:**
- ✅ Diagnosticar qué falta
- ✅ Crear distritos
- ✅ Crear misiones
- ✅ Crear oficinas (incluyendo ETEBA CHALE GROUP)
- ✅ Verificar que todo esté correcto

### 3. Verificar

Recarga https://ecg-digital-city.onrender.com

Los errores 500 deberían desaparecer.

---

## Alternativa: Seeds Manuales

Si el script automático falla:

```bash
cd backend

# Paso 1: Distritos
npm run seed:districts

# Paso 2: Gamificación
npm run seed:gamification

# Paso 3: Oficinas
npm run seed:offices
```

---

## Verificar que Funcionó

En la Shell de Render:

```bash
npm run diagnose
```

Deberías ver:
```
📊 Estado actual:
   - Distritos: 5
   - Misiones: 10
   - Empresas: 8
   - Oficinas: 10
   - Usuarios: 1
```

---

## Si Aún Hay Errores

1. Copia los logs completos de la Shell
2. Verifica las variables de entorno (DATABASE_URL)
3. Reinicia el servicio backend en Render

---

## Contacto

Si necesitas ayuda, proporciona:
- Screenshot de los errores en Shell
- Output de `npm run diagnose`
- Logs del backend en Render

# Fix de URLs Hardcodeadas - Render Deployment

## Problema
El frontend estaba intentando conectarse a `http://localhost:3000` en producción, causando errores de CSP (Content Security Policy).

## Solución Implementada

### 1. Configuración Centralizada
Creado `frontend/src/config/api.js`:
```javascript
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin
export const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin
```

### 2. Variables de Entorno

**Desarrollo** (`frontend/.env.development`):
```
VITE_API_URL=http://localhost:3000
```

**Producción** (`frontend/.env.production`):
```
VITE_API_URL=
```
(Vacío = usa el mismo origen que el frontend)

### 3. Archivos Actualizados
- ✅ `frontend/src/App.jsx`
- ✅ `frontend/src/components/AuthScreen.jsx`
- ✅ `frontend/src/services/socket.js`
- ✅ `frontend/src/store/companyStore.js`
- ✅ `frontend/src/store/gamificationStore.js`
- ✅ `frontend/src/components/OfficeEditor.jsx`

## Resultado
- En desarrollo: conecta a `http://localhost:3000`
- En producción: conecta al mismo dominio de Render
- Sin errores de CSP
- Socket.IO funciona correctamente

## Próximos Pasos
Render detectará el push y hará un nuevo deploy automáticamente.

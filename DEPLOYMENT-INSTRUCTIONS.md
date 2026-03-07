# Instrucciones de Deployment - Sistema 2D

**Fecha:** 7 de marzo de 2026  
**Estado:** Listo para deployment

## Cambios Implementados

### Fixes Críticos
1. ✅ WebGL context loss handling completo
2. ✅ Safety checks en todos los sistemas
3. ✅ Try-catch en inicialización y game loop
4. ✅ Error recovery automático
5. ✅ Validación de datos y sanitización
6. ✅ Indicador de conexión
7. ✅ High-DPI support

### Archivos Modificados
```
frontend/src/2d/
├── App2D.jsx ⭐ (try-catch completo, error handling)
├── entities/Avatar2D.js ⭐ (safety checks, validation)
├── core/SceneManager.js ⭐ (try-catch, safety checks)
├── systems/
│   ├── CameraSystem2D.js ⭐ (safety checks)
│   └── NetworkSync.js ⭐ (connection indicator)
├── ui/
│   ├── ConnectionIndicator.js (NUEVO)
│   ├── ChatBubble2D.js
│   └── InteractionHint2D.js
└── utils/
    ├── DataValidator.js (NUEVO)
    └── ErrorHandler.js (NUEVO)
```

## Pasos para Deployment

### 1. Verificar que el Backend esté Corriendo

```bash
cd backend
npm start
```

Verificar que esté escuchando en el puerto correcto (3001 o el configurado).

### 2. Build del Frontend

```bash
cd frontend
npm run build
```

Esto generará los archivos optimizados en `frontend/dist/`.

### 3. Verificar Build

Antes de deployar, verificar que el build sea exitoso:

```bash
# Verificar tamaño del bundle
ls -lh dist/assets/

# Debería ver algo como:
# index-[hash].js (~475KB)
# pixi-vendor-[hash].js (~465KB)
# index-[hash].css (~50KB)
```

### 4. Deploy a Render

Si estás usando Render.com:

1. **Commit los cambios:**
```bash
git add .
git commit -m "Fix: WebGL context loss handling + Phase 5 optimizations"
git push origin main
```

2. **Render detectará automáticamente** el push y comenzará el deployment.

3. **Monitorear el deployment** en el dashboard de Render.

### 5. Verificar Deployment

Una vez deployado, verificar:

1. **Abrir la aplicación** en el navegador
2. **Verificar que cargue** sin errores
3. **Probar movimiento** (WASD)
4. **Probar zoom** (rueda del mouse)
5. **Probar portales** (tecla E cerca de portales)
6. **Verificar console** - no debería haber errores críticos

### 6. Testing Post-Deployment

```bash
# Abrir DevTools (F12)
# Ir a Console
# Verificar que no haya errores rojos

# Probar WebGL context loss (opcional):
# 1. Abrir DevTools
# 2. Ir a Rendering tab
# 3. Simular context loss
# 4. Verificar que el juego se recupere
```

## Variables de Entorno

Asegurarse de que estas variables estén configuradas en Render:

### Backend (.env)
```env
PORT=3001
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=...
REDIS_URL=...
```

### Frontend (.env.production)
```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_SOCKET_URL=https://tu-backend.onrender.com
```

## Configuración de Render

### Frontend Service
```yaml
Build Command: npm run build
Publish Directory: dist
Node Version: 18
```

### Backend Service
```yaml
Build Command: npm install
Start Command: npm start
Node Version: 18
```

## Rollback Plan

Si algo sale mal después del deployment:

### Opción 1: Rollback en Render
1. Ir al dashboard de Render
2. Seleccionar el servicio
3. Ir a "Deploys"
4. Click en "Rollback" al deployment anterior

### Opción 2: Rollback con Git
```bash
# Revertir el último commit
git revert HEAD
git push origin main

# O volver a un commit específico
git reset --hard <commit-hash>
git push origin main --force
```

### Opción 3: Feature Flag
Si implementaste feature flags, simplemente cambiar:
```javascript
// En features.js
export const USE_2D_RENDERER = false // Volver a 3D
```

## Monitoreo Post-Deployment

### Métricas a Monitorear

1. **Errores en Console**
   - Abrir DevTools en producción
   - Verificar que no haya errores críticos
   - Los warnings son aceptables

2. **Performance**
   - FPS debería estar en 58-60
   - Memoria debería estar < 200MB
   - Load time < 3s

3. **Funcionalidad**
   - ✅ Login funciona
   - ✅ Movimiento funciona
   - ✅ Chat funciona
   - ✅ Portales funcionan
   - ✅ Zoom funciona
   - ✅ Multiplayer funciona

### Logs a Revisar

```bash
# En Render dashboard:
# 1. Ir a Logs
# 2. Buscar errores:
#    - "WebGL context was lost" (debería recuperarse)
#    - "Error in game loop" (no debería haber)
#    - "Failed to load" (no debería haber)
```

## Troubleshooting

### Problema: WebGL context loss persiste
**Solución:**
1. Verificar que los cambios se deployaron correctamente
2. Hacer hard refresh (Ctrl+Shift+R)
3. Limpiar cache del navegador
4. Verificar que el build incluye los nuevos archivos

### Problema: Juego no carga
**Solución:**
1. Verificar console para errores
2. Verificar que backend esté corriendo
3. Verificar variables de entorno
4. Verificar CORS settings

### Problema: Performance baja
**Solución:**
1. Verificar que antialias esté off
2. Verificar que resolution esté capped a 2x
3. Verificar que no haya memory leaks
4. Considerar reducir número de avatares visibles

### Problema: Multiplayer no funciona
**Solución:**
1. Verificar que Socket.IO esté conectado
2. Verificar logs del backend
3. Verificar que CORS permita WebSocket
4. Verificar que NetworkSync esté inicializado

## Checklist Final

Antes de considerar el deployment exitoso:

- [ ] Build completa sin errores
- [ ] Deployment exitoso en Render
- [ ] Aplicación carga correctamente
- [ ] No hay errores críticos en console
- [ ] Movimiento funciona (WASD)
- [ ] Zoom funciona (rueda del mouse)
- [ ] Portales funcionan (tecla E)
- [ ] Chat funciona
- [ ] Multiplayer funciona
- [ ] Performance es aceptable (>55 FPS)
- [ ] Memoria es aceptable (<200MB)
- [ ] WebGL context loss se recupera
- [ ] Indicador de conexión funciona
- [ ] No hay memory leaks visibles

## Contacto y Soporte

Si encuentras problemas después del deployment:

1. **Revisar logs** en Render dashboard
2. **Revisar console** en DevTools
3. **Crear issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Screenshots de errores
   - Información del navegador

## Próximos Pasos

Después de un deployment exitoso:

1. **Monitorear por 24 horas** para detectar problemas
2. **Recopilar feedback** de usuarios
3. **Analizar métricas** de performance
4. **Planear Fase 6** (documentación final, cleanup)

## Notas Importantes

⚠️ **IMPORTANTE:** Los cambios implementados son críticos para la estabilidad. No hacer rollback a menos que sea absolutamente necesario.

✅ **RECOMENDACIÓN:** Hacer el deployment en horario de bajo tráfico para minimizar impacto en usuarios.

🔍 **MONITOREO:** Mantener DevTools abierto durante las primeras horas post-deployment para detectar problemas rápidamente.

---

**Estado:** ✅ LISTO PARA DEPLOYMENT
**Riesgo:** BAJO (todos los cambios tienen fallbacks y error handling)
**Tiempo estimado:** 10-15 minutos

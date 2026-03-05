# ✅ Checklist de Despliegue en Vercel

## 📋 Pre-Despliegue

### Configuración Local
- [ ] Código funciona correctamente en local
- [ ] Tests pasan (`npm test` en backend y frontend)
- [ ] Build funciona (`npm run build` en frontend)
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Archivos sensibles en `.gitignore`
- [ ] Código subido a Git (GitHub/GitLab/Bitbucket)

### Verificación Automática
- [ ] Ejecutar `node scripts/verify-deployment.js`
- [ ] Resolver errores si los hay
- [ ] Revisar advertencias

## 🗄️ Servicios Externos

### Base de Datos PostgreSQL
- [ ] Cuenta creada en Neon/Supabase/Railway
- [ ] Base de datos creada
- [ ] Cadena de conexión copiada
- [ ] Migraciones ejecutadas (`npm run migrate`)
- [ ] Datos de prueba cargados (opcional)

### Redis
- [ ] Cuenta creada en Upstash/Redis Cloud
- [ ] Instancia Redis creada
- [ ] Credenciales copiadas (host, port, password)
- [ ] Conexión probada

## 🚀 Despliegue en Vercel

### Configuración Inicial
- [ ] Cuenta de Vercel creada
- [ ] Repositorio importado en Vercel
- [ ] Proyecto configurado

### Variables de Entorno
- [ ] `NODE_ENV=production`
- [ ] `DB_HOST` configurado
- [ ] `DB_PORT` configurado
- [ ] `DB_NAME` configurado
- [ ] `DB_USER` configurado
- [ ] `DB_PASSWORD` configurado
- [ ] `DB_DIALECT=postgres`
- [ ] `REDIS_HOST` configurado
- [ ] `REDIS_PORT` configurado
- [ ] `REDIS_PASSWORD` configurado
- [ ] `JWT_SECRET` generado (seguro)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN` configurado (temporal)
- [ ] `VITE_API_URL` configurado (temporal)

### Primer Despliegue
- [ ] Click en "Deploy"
- [ ] Esperar a que termine (2-5 minutos)
- [ ] Copiar URL de Vercel
- [ ] Actualizar `CORS_ORIGIN` con URL real
- [ ] Actualizar `VITE_API_URL` con URL real
- [ ] Redeploy

## ✅ Verificación Post-Despliegue

### Backend
- [ ] `/health` responde correctamente
- [ ] `/api/auth/login` funciona
- [ ] Logs no muestran errores críticos
- [ ] Base de datos conectada

### Frontend
- [ ] Página principal carga
- [ ] Assets (imágenes, CSS) cargan
- [ ] No hay errores en consola del navegador
- [ ] Navegación funciona

### Funcionalidad
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Navegación entre páginas funciona
- [ ] API responde correctamente

## ⚠️ Socket.IO (Importante)

### Decisión de Arquitectura
- [ ] Opción elegida:
  - [ ] Opción 1: Backend en Railway/Render
  - [ ] Opción 2: Usar Pusher/Ably
  - [ ] Opción 3: Polling/SSE

### Si elegiste Railway/Render
- [ ] Backend desplegado en Railway/Render
- [ ] `VITE_API_URL` apunta a Railway/Render
- [ ] `CORS_ORIGIN` incluye dominio de Vercel
- [ ] WebSockets funcionan

### Si elegiste Pusher/Ably
- [ ] Cuenta creada
- [ ] Credenciales configuradas
- [ ] Socket.IO reemplazado
- [ ] Código actualizado
- [ ] Tests actualizados

## 🔒 Seguridad

### Configuración
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Helmet configurado
- [ ] JWT secret seguro (mínimo 32 caracteres)
- [ ] Variables sensibles en variables de entorno

### Permisos
- [ ] Roles de usuario configurados
- [ ] Permisos de admin configurados
- [ ] Endpoints protegidos

## 📊 Monitoreo

### Vercel Dashboard
- [ ] Analytics habilitado
- [ ] Alertas configuradas
- [ ] Notificaciones de errores activas

### Logs
- [ ] Logs accesibles en Dashboard
- [ ] Nivel de log configurado (`LOG_LEVEL=info`)
- [ ] Errores se registran correctamente

## 🌐 Dominio (Opcional)

### Dominio Personalizado
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Dominio agregado en Vercel
- [ ] SSL configurado (automático)
- [ ] `CORS_ORIGIN` actualizado con dominio
- [ ] Redirección de www configurada

## 📱 Testing en Producción

### Navegadores
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS Safari)
- [ ] Mobile (Chrome Android)

### Funcionalidad Crítica
- [ ] Login/Logout
- [ ] Registro de usuario
- [ ] Navegación 3D
- [ ] Chat (si aplica)
- [ ] Movimiento de avatar
- [ ] Interacciones con objetos

### Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] FPS estable (>30)
- [ ] Sin memory leaks
- [ ] API responde < 500ms

## 📚 Documentación

### Interna
- [ ] README actualizado con URL de producción
- [ ] Variables de entorno documentadas
- [ ] Proceso de despliegue documentado
- [ ] Troubleshooting documentado

### Externa (si aplica)
- [ ] Documentación de API publicada
- [ ] Guía de usuario disponible
- [ ] Changelog actualizado

## 🔄 CI/CD (Opcional pero Recomendado)

### GitHub Actions
- [ ] Workflow de tests configurado
- [ ] Workflow de deploy configurado
- [ ] Branch protection habilitado
- [ ] Auto-deploy en merge a main

### Vercel Git Integration
- [ ] Preview deployments habilitados
- [ ] Auto-deploy en push habilitado
- [ ] Comentarios en PR habilitados

## 🆘 Plan de Contingencia

### Rollback
- [ ] Proceso de rollback documentado
- [ ] Deployment anterior identificado
- [ ] Comando de rollback probado

### Backup
- [ ] Backup de base de datos configurado
- [ ] Backup de Redis configurado (si aplica)
- [ ] Proceso de restauración documentado

### Contactos
- [ ] Equipo de soporte identificado
- [ ] Escalación definida
- [ ] Documentación de incidentes preparada

## 🎉 Lanzamiento

### Pre-Lanzamiento
- [ ] Todos los items anteriores completados
- [ ] Testing completo realizado
- [ ] Equipo notificado
- [ ] Usuarios beta notificados (si aplica)

### Lanzamiento
- [ ] Anuncio publicado
- [ ] Monitoreo activo
- [ ] Equipo disponible para soporte
- [ ] Métricas siendo monitoreadas

### Post-Lanzamiento
- [ ] Primeras 24h monitoreadas
- [ ] Feedback recolectado
- [ ] Issues documentados
- [ ] Mejoras planificadas

## 📈 Optimización Continua

### Performance
- [ ] Lighthouse score > 80
- [ ] Core Web Vitals optimizados
- [ ] Bundle size optimizado
- [ ] Imágenes optimizadas

### SEO (si aplica)
- [ ] Meta tags configurados
- [ ] Sitemap generado
- [ ] robots.txt configurado
- [ ] Open Graph tags configurados

### Analytics
- [ ] Google Analytics configurado (opcional)
- [ ] Eventos personalizados configurados
- [ ] Conversiones rastreadas

## ✨ Extras

### Nice to Have
- [ ] PWA configurado
- [ ] Service Worker configurado
- [ ] Offline mode
- [ ] Push notifications
- [ ] Dark mode
- [ ] Internacionalización (i18n)

---

## 🎯 Estado Actual

**Fecha:** ___________

**Completado:** ___ / ___ items

**Bloqueadores:**
- 
- 

**Próximos Pasos:**
1. 
2. 
3. 

**Notas:**


---

## 📞 Contactos de Emergencia

**Vercel Support:** support@vercel.com
**Neon Support:** support@neon.tech
**Upstash Support:** support@upstash.com

**Equipo:**
- Desarrollador Principal: ___________
- DevOps: ___________
- Product Owner: ___________

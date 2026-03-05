# 🚀 Guía de Despliegue - ECG Digital City

## 📋 Resumen

ECG Digital City está configurado para desplegarse en **Render**, una plataforma que soporta completamente Socket.IO y WebSockets, ideal para aplicaciones en tiempo real.

## ✅ Archivos de Configuración

- ✅ `render.yaml` - Blueprint completo
- ✅ `.renderignore` - Exclusiones
- ✅ `scripts/render-build.sh` - Script de build
- ✅ `scripts/verify-render.js` - Verificación

## 📚 Documentación Disponible

1. **RENDER-QUICKSTART.md** - Inicio rápido (10 minutos) ⭐
2. **RENDER-DEPLOYMENT.md** - Guía completa con troubleshooting
3. **DEPLOYMENT-RENDER-SUMMARY.md** - Resumen ejecutivo
4. **DEPLOYMENT-COMPLETE.md** - Checklist completo

## 🎯 Por qué Render

- ✅ Backend + Frontend en el mismo servicio
- ✅ Socket.IO funciona perfectamente
- ✅ PostgreSQL y Redis incluidos
- ✅ SSL/HTTPS automático
- ✅ Plan gratuito generoso (750 horas/mes)
- ✅ Despliegue continuo desde Git

## 🚀 Despliegue Rápido (3 Pasos)

### 1. Verificar y Subir a Git
```bash
# Verificar configuración
node scripts/verify-render.js

# Subir a Git
git add .
git commit -m "Configurar para Render"
git push origin main
```

### 2. Crear Blueprint en Render
1. Ve a [render.com/dashboard](https://dashboard.render.com)
2. Click "New +" > "Blueprint"
3. Conecta tu repositorio
4. Click "Apply"

### 3. Configurar y Migrar
1. Actualiza `CORS_ORIGIN` en Environment
2. Ejecuta migraciones en Shell: `cd backend && npm run migrate`

## 🌐 URLs de tu Aplicación

- **Frontend:** `https://ecg-digital-city.onrender.com`
- **API:** `https://ecg-digital-city.onrender.com/api`
- **Health:** `https://ecg-digital-city.onrender.com/health`

## 💰 Costos

### Plan Gratuito
- 750 horas/mes
- PostgreSQL 1GB
- Redis 25MB
- ⚠️ Se duerme después de 15 min de inactividad
- **Costo:** $0/mes

### Plan Starter (Recomendado)
- Servicio siempre activo
- Mejor performance
- **Costo:** $7/mes

## 📞 Soporte

- **Render:** support@render.com
- **Docs:** https://render.com/docs
- **Community:** https://community.render.com

## 🎉 Siguiente Paso

Lee **RENDER-QUICKSTART.md** y despliega en 10 minutos!

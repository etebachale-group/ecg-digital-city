# 🚀 Despliegue Rápido en Render (10 minutos)

## Paso 1: Preparar Repositorio (2 min)

```bash
# Verificar que todo esté listo
node scripts/verify-deployment.js

# Subir a Git
git add .
git commit -m "Configurar para Render"
git push origin main
```

## Paso 2: Crear Cuenta en Render (1 min)

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub (recomendado)

## Paso 3: Desplegar con Blueprint (3 min)

1. En Render Dashboard, click "New +" > "Blueprint"
2. Conecta tu repositorio
3. Render detectará `render.yaml`
4. Click "Apply"
5. Espera 5-10 minutos mientras se despliega

## Paso 4: Configurar Variables de Entorno (2 min)

Render creará automáticamente PostgreSQL y Redis. Solo necesitas:

1. Ve a tu servicio "ecg-digital-city"
2. Click "Environment"
3. Actualiza `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://ecg-digital-city.onrender.com
   ```
4. Guarda cambios

## Paso 5: Ejecutar Migraciones (2 min)

1. En tu servicio, click "Shell"
2. Ejecuta:
   ```bash
   cd backend
   npm run migrate
   ```

## ✅ ¡Listo!

Tu app está en: `https://ecg-digital-city.onrender.com`

### Verificar:
- Health: `https://ecg-digital-city.onrender.com/health`
- Frontend: `https://ecg-digital-city.onrender.com`
- API: `https://ecg-digital-city.onrender.com/api`

## 🐛 Problemas?

Lee `RENDER-DEPLOYMENT.md` para la guía completa.

## 💡 Tips

- **Plan Gratuito:** El servicio se duerme después de 15 min de inactividad
- **Upgrade:** $7/mes para servicio siempre activo
- **Logs:** Click en "Logs" para ver errores
- **Redeploy:** Click "Manual Deploy" > "Deploy latest commit"

## 📚 Próximos Pasos

1. Configura dominio personalizado (opcional)
2. Configura alertas de monitoreo
3. Haz backup de la base de datos
4. ¡Disfruta tu app en producción! 🎉

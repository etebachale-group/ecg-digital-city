# 🚀 Desplegar en Render

## Paso 1: Subir a GitHub

```bash
git add .
git commit -m "Listo para Render"
git push origin main
```

## Paso 2: Crear en Render

1. Ve a https://dashboard.render.com
2. New + → Blueprint
3. Conecta tu repositorio
4. Apply

Render creará automáticamente:
- Web Service (ecg-digital-city)
- PostgreSQL (ecg-digital-city-db)
- Redis (ecg-digital-city-redis)

## Paso 3: Configurar Variables

En el Web Service → Environment, configura:

```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
DB_DIALECT = postgres

REDIS_HOST = <desde redis service>
REDIS_PORT = 6379
REDIS_PASSWORD = <desde redis service>

CORS_ORIGIN = https://ecg-digital-city.onrender.com
```

## Paso 4: Ejecutar Migraciones

En Shell:
```bash
cd backend
node scripts/migrate.js
```

## Paso 5: Verificar

Abre: https://ecg-digital-city.onrender.com/health

## ✅ Listo

Tu app está en: https://ecg-digital-city.onrender.com

# Configuración de Supabase Connection Pooler para Render

## 🎯 Solución al Problema IPv6

Render no puede conectarse directamente a Supabase por IPv6. La solución es usar el **Connection Pooler** de Supabase.

---

## 📋 Paso 1: Obtener Credenciales del Pooler

1. Ve a tu proyecto en Supabase:
   ```
   https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal
   ```

2. Ve a **Settings** → **Database**

3. Busca la sección **"Connection Pooling"**

4. Verás dos modos:
   - **Transaction mode** (recomendado para Sequelize)
   - **Session mode**

5. Copia la **Connection string** en modo **Transaction**

Debería verse así:
```
postgresql://postgres.nqpsvrfehtmjcvovbqal:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🔧 Paso 2: Actualizar Variables en Render

Ve a tu servicio en Render:
```
https://dashboard.render.com/web/srv-XXXXX
```

Clic en **Environment** y actualiza estas variables:

```
DB_HOST = aws-0-us-east-1.pooler.supabase.com
DB_PORT = 6543
DB_NAME = postgres
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
```

**IMPORTANTE:** 
- El host cambia a `*.pooler.supabase.com`
- El puerto cambia a `6543` (no 5432)
- El usuario cambia a `postgres.nqpsvrfehtmjcvovbqal` (con el ID del proyecto)

---

## 💾 Paso 3: Guardar y Redeploy

1. Clic en **"Save Changes"** en Render
2. Render hará redeploy automáticamente (2-3 minutos)
3. Monitorea los logs para verificar la conexión

---

## ✅ Verificación

Cuando el deploy termine, deberías ver en los logs:

```
✅ Conexión a PostgreSQL establecida
✅ Base de datos tiene 18 tablas
✅ Distritos iniciales verificados
🚀 Servidor escuchando en puerto 3000
```

---

## 🔄 Alternativa: Volver a Render PostgreSQL

Si el pooler tampoco funciona, puedes volver a la base de datos de Render:

```
DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
DB_PORT = 5432
DB_NAME = ecg_digital_city
DB_USER = ecg_user
DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
```

Esta configuración ya funcionaba antes.

---

## 📝 Notas Importantes

1. **Connection Pooler vs Conexión Directa:**
   - Pooler: Mejor para servicios externos, maneja IPv4/IPv6
   - Directa: Solo para desarrollo local o servicios con IPv6

2. **Transaction Mode vs Session Mode:**
   - Transaction: Recomendado para Sequelize (cada query es una transacción)
   - Session: Para conexiones persistentes (no compatible con pooling)

3. **Límites del Plan Free:**
   - 60 conexiones simultáneas
   - 500 MB de almacenamiento
   - 2 GB de transferencia

---

## 🆘 Troubleshooting

### Error: "remaining connection slots reserved"
- Demasiadas conexiones abiertas
- Reduce `pool.max` en `backend/src/config/database.js` a 5

### Error: "prepared statement already exists"
- Usa Transaction mode en lugar de Session mode

### Error: "ENETUNREACH" persiste
- Verifica que el host sea `*.pooler.supabase.com`
- Verifica que el puerto sea `6543`
- Verifica que el usuario incluya el ID del proyecto

---

## 🎯 Próximos Pasos

1. Obtén las credenciales del pooler en Supabase
2. Actualiza las variables en Render
3. Espera el redeploy
4. Prueba la aplicación en https://ecg-digital-city.onrender.com

# ✅ Checklist: Conectar Render con Supabase

## 📋 Antes de Empezar

- [ ] Tienes acceso a Supabase: https://supabase.com/dashboard
- [ ] Tienes acceso a Render: https://dashboard.render.com
- [ ] Tienes 10 minutos disponibles

---

## 🔧 Paso 1: Obtener Credenciales del Pooler

- [ ] Abrir: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal/settings/database
- [ ] Bajar hasta "Connection Pooling"
- [ ] Clic en pestaña "Transaction"
- [ ] Copiar la connection string
- [ ] Pegar en un bloc de notas

**Connection string se ve así:**
```
postgresql://postgres.nqpsvrfehtmjcvovbqal:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 📝 Paso 2: Extraer Valores

De la connection string, identifica:

- [ ] **Host:** `aws-0-us-east-1.pooler.supabase.com` (entre `@` y `:6543`)
- [ ] **Port:** `6543`
- [ ] **User:** `postgres.nqpsvrfehtmjcvovbqal` (entre `://` y `:`)
- [ ] **Password:** `mm2grndBfGsVgmEf` (entre `:` y `@`)

**Verifica:**
- [ ] El host termina en `.pooler.supabase.com`
- [ ] El puerto es `6543` (no 5432)
- [ ] El usuario incluye el ID del proyecto después del punto

---

## 🔄 Paso 3: Actualizar Render

- [ ] Abrir: https://dashboard.render.com
- [ ] Buscar servicio "ecg-digital-city"
- [ ] Clic en "Environment"

**Actualizar estas 4 variables:**

- [ ] **DB_HOST**
  - Cambiar de: `db.nqpsvrfehtmjcvovbqal.supabase.co`
  - Cambiar a: `aws-0-us-east-1.pooler.supabase.com`

- [ ] **DB_PORT**
  - Cambiar de: `5432`
  - Cambiar a: `6543`

- [ ] **DB_USER**
  - Cambiar de: `postgres`
  - Cambiar a: `postgres.nqpsvrfehtmjcvovbqal`

- [ ] **DB_PASSWORD**
  - Verificar: `mm2grndBfGsVgmEf`

**NO cambiar:**
- [ ] `DB_NAME` debe seguir siendo `postgres`
- [ ] `DB_DIALECT` debe seguir siendo `postgres`

---

## 💾 Paso 4: Guardar y Esperar

- [ ] Clic en "Save Changes"
- [ ] Esperar mensaje "Environment updated. Deploying..."
- [ ] Ir a pestaña "Logs"
- [ ] Esperar 2-3 minutos

**Buscar en los logs:**
- [ ] "✅ Conexión a PostgreSQL establecida"
- [ ] "✅ Base de datos tiene 18 tablas"
- [ ] "🚀 Servidor escuchando en puerto 3000"

---

## ✅ Paso 5: Verificar

- [ ] Abrir: https://ecg-digital-city.onrender.com
- [ ] Ver pantalla de login/registro
- [ ] Intentar registrar usuario:
  - Nombre: Test
  - Email: test@test.com
  - Contraseña: test123
- [ ] Registro exitoso (sin error 500)
- [ ] Poder iniciar sesión

---

## 🎉 ¡Éxito!

Si todos los checkboxes están marcados, ¡la migración fue exitosa!

Tu aplicación ahora está usando:
- ✅ Supabase como base de datos
- ✅ Connection Pooler para la conexión
- ✅ 18 tablas con datos iniciales
- ✅ 500 MB de almacenamiento
- ✅ Panel de administración de Supabase

---

## ❌ Si Algo Falló

### Opción 1: Revisar Credenciales

- [ ] Verificar que el host termine en `.pooler.supabase.com`
- [ ] Verificar que el puerto sea `6543`
- [ ] Verificar que el usuario incluya el ID del proyecto
- [ ] Intentar de nuevo

### Opción 2: Volver a Render PostgreSQL

Si después de 2 intentos no funciona:

- [ ] Ir a Render → Environment
- [ ] Cambiar variables a:
  ```
  DB_HOST = dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com
  DB_PORT = 5432
  DB_USER = ecg_user
  DB_PASSWORD = KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8
  DB_NAME = ecg_digital_city
  ```
- [ ] Guardar y esperar redeploy
- [ ] Verificar que funcione

---

## 📊 Progreso

**Completado:**
- ✅ Base de datos en Supabase creada
- ✅ 18 tablas con datos iniciales
- ✅ Scripts de migración listos
- ✅ Documentación completa

**Pendiente:**
- [ ] Conectar Render con Supabase
- [ ] Verificar aplicación en producción

---

## 🆘 Ayuda

Si necesitas ayuda, lee:
- **Guía paso a paso:** [SOLUCION-FINAL.md](SOLUCION-FINAL.md)
- **Dónde encontrar pooler:** [DONDE-ENCONTRAR-POOLER.md](DONDE-ENCONTRAR-POOLER.md)
- **Troubleshooting:** [SUPABASE-POOLER-SETUP.md](SUPABASE-POOLER-SETUP.md)

---

**Tiempo estimado:** 8-10 minutos

**¡Buena suerte!** 🚀

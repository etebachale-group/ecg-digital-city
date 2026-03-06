# ✅ Ejecutar Script en Supabase

## Paso a Paso

### 1. Abre el SQL Editor en Supabase

1. Ve a tu proyecto: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal
2. En el menú lateral, haz clic en **SQL Editor** (icono `</>`)
3. Haz clic en **"New query"**

### 2. Copia el Script

1. Abre el archivo: `backend/scripts/supabase-schema.sql`
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### 3. Pega y Ejecuta

1. Pega en el SQL Editor de Supabase (Ctrl+V)
2. Haz clic en **"Run"** (botón verde) o presiona **Ctrl+Enter**
3. ⏳ Espera 5-10 segundos...
4. ✅ Verás "Success. No rows returned"

### 4. Verifica las Tablas

1. En el menú lateral, haz clic en **Table Editor** (icono de tabla)
2. Deberías ver 18 tablas:
   - achievements
   - avatars
   - companies
   - districts
   - event_attendees
   - events
   - missions
   - office_objects
   - offices
   - permissions
   - user_achievements
   - user_missions
   - user_progress
   - users

3. Haz clic en **districts** → deberías ver 4 filas
4. Haz clic en **achievements** → deberías ver 8 filas
5. Haz clic en **missions** → deberías ver 7 filas

---

## ✅ Si todo salió bien

Verás:
- ✅ 18 tablas creadas
- ✅ 4 distritos
- ✅ 8 logros
- ✅ 7 misiones

---

## 🚀 Siguiente Paso: Configurar Render

Una vez que las tablas estén creadas:

1. Ve a https://dashboard.render.com
2. Clic en tu servicio **ecg-digital-city**
3. Ve a **Environment**
4. Edita estas variables:

```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
```

5. Clic en **"Save Changes"**
6. ⏳ Render hará redeploy (2-3 min)
7. ✅ ¡Listo!

---

## 🎉 Probar la Aplicación

1. Ve a https://ecg-digital-city.onrender.com
2. Clic en **"Registrarse"**
3. Completa el formulario
4. ✅ ¡Debería funcionar!

---

## ❌ Si hay errores

### "syntax error at or near"
- Asegúrate de copiar TODO el archivo `supabase-schema.sql`
- No uses el archivo `reset-and-reload-database.sql` (ese tiene comandos \echo)

### "relation already exists"
- Las tablas ya existen
- Puedes ignorar este error o eliminar las tablas primero

### "permission denied"
- Verifica que estés usando el usuario correcto (postgres)
- Verifica la contraseña

---

**Archivo correcto:** `backend/scripts/supabase-schema.sql`  
**NO uses:** `backend/scripts/reset-and-reload-database.sql`

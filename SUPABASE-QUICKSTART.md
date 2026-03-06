# Supabase Quickstart - 5 Minutos ⚡

## Paso 1: Crear Proyecto (2 min)

1. Ve a https://supabase.com
2. Clic en **Start your project**
3. Sign up con GitHub o email
4. Clic en **New Project**
5. Completa:
   ```
   Name: ecg-digital-city
   Database Password: [genera una segura o usa la sugerida]
   Region: [elige la más cercana]
   ```
6. Clic en **Create new project**
7. ⏳ Espera 2-3 minutos...

---

## Paso 2: Obtener Credenciales (30 seg)

1. En el panel de Supabase, ve a **Settings** (⚙️ abajo a la izquierda)
2. Clic en **Database**
3. Scroll hasta **Connection string**
4. Copia estos datos:

```
Host: db.xxxxxxxxxxxxx.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [la que configuraste]
```

---

## Paso 3: Crear Base de Datos (1 min)

### Opción A: SQL Editor (Más fácil)

1. En Supabase, ve a **SQL Editor** (icono </> en el menú)
2. Clic en **New query**
3. Abre el archivo `backend/scripts/reset-and-reload-database.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor de Supabase
6. Clic en **Run** (o Ctrl+Enter)
7. ✅ Verás "Success. No rows returned"

### Opción B: Script Automatizado

```bash
cd backend/scripts
node migrate-to-supabase.js
```

Sigue las instrucciones en pantalla.

---

## Paso 4: Verificar (30 seg)

1. En Supabase, ve a **Table Editor**
2. Deberías ver estas tablas:
   - users
   - avatars
   - companies
   - districts
   - offices
   - achievements
   - missions
   - ... (18 en total)

3. Clic en **districts** → deberías ver 4 filas
4. Clic en **achievements** → deberías ver 8 filas
5. Clic en **missions** → deberías ver 7 filas

✅ Si ves los datos, ¡todo está listo!

---

## Paso 5: Configurar Render (1 min)

1. Ve a https://dashboard.render.com
2. Clic en tu servicio **ecg-digital-city**
3. Ve a **Environment**
4. Edita estas variables:

```
DB_HOST = db.xxxxxxxxxxxxx.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = [tu password de supabase]
```

5. Clic en **Save Changes**
6. ⏳ Render hará redeploy automáticamente (2-3 min)

---

## Paso 6: Probar (30 seg)

1. Ve a https://ecg-digital-city.onrender.com
2. Clic en **Registrarse**
3. Completa el formulario
4. ✅ Si el registro funciona, ¡éxito!

---

## 🎉 ¡Listo!

Tu aplicación ahora usa Supabase. Ventajas:

- ✅ Panel visual para ver/editar datos
- ✅ Backups automáticos
- ✅ Mejor rendimiento
- ✅ Más espacio (500MB vs 256MB)
- ✅ SQL Editor integrado

---

## Comandos Útiles

### Ver todas las tablas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Ver datos iniciales:
```sql
SELECT * FROM districts;
SELECT * FROM achievements;
SELECT * FROM missions;
```

### Contar usuarios:
```sql
SELECT COUNT(*) FROM users;
```

---

## Troubleshooting

### "Error connecting to database"
- Verifica que el host sea correcto
- Debe terminar en `.supabase.co`

### "Password authentication failed"
- Ve a Supabase > Settings > Database
- Resetea la contraseña si es necesario

### "Relation does not exist"
- Las tablas no se crearon
- Ejecuta el script SQL nuevamente

---

## Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica las credenciales en Supabase
3. Ejecuta el script de verificación:
   ```bash
   cd backend/scripts
   node verify-supabase.js
   ```

---

**Tiempo total: ~5 minutos** ⚡

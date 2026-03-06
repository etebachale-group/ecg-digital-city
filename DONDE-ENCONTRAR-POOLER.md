# 🔍 Dónde Encontrar el Connection Pooler en Supabase

## 📍 Ubicación Exacta

### Paso 1: Ir a Settings
1. Abre tu proyecto: https://supabase.com/dashboard/project/nqpsvrfehtmjcvovbqal
2. En el menú lateral izquierdo, clic en el ícono de **engranaje** (⚙️)
3. Clic en **"Database"**

### Paso 2: Buscar Connection Pooling
1. Baja en la página hasta encontrar la sección **"Connection Pooling"**
2. Verás dos pestañas:
   - **Transaction** ← Usa esta
   - **Session**

### Paso 3: Copiar la Connection String
1. Asegúrate de estar en la pestaña **"Transaction"**
2. Verás una caja con texto que dice:
   ```
   Connection string
   ```
3. Debajo verás algo como:
   ```
   postgresql://postgres.nqpsvrfehtmjcvovbqal:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Clic en el botón **"Copy"** o selecciona todo el texto

---

## 🔑 Extraer las Credenciales

De esta URL:
```
postgresql://postgres.nqpsvrfehtmjcvovbqal:mm2grndBfGsVgmEf@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Extrae:

| Variable | Valor | Dónde está |
|----------|-------|------------|
| `DB_USER` | `postgres.nqpsvrfehtmjcvovbqal` | Entre `://` y `:` |
| `DB_PASSWORD` | `mm2grndBfGsVgmEf` | Entre `:` y `@` |
| `DB_HOST` | `aws-0-us-east-1.pooler.supabase.com` | Entre `@` y `:6543` |
| `DB_PORT` | `6543` | Después del host |
| `DB_NAME` | `postgres` | Al final después de `/` |

---

## 📋 Formato para Render

Copia y pega estos valores en Render:

```
DB_HOST = aws-0-us-east-1.pooler.supabase.com
DB_PORT = 6543
DB_NAME = postgres
DB_USER = postgres.nqpsvrfehtmjcvovbqal
DB_PASSWORD = mm2grndBfGsVgmEf
```

**IMPORTANTE:** 
- El host debe terminar en `.pooler.supabase.com`
- El puerto debe ser `6543` (no 5432)
- El usuario debe incluir el ID del proyecto después del punto

---

## ⚠️ Si No Ves "Connection Pooling"

Si no encuentras la sección "Connection Pooling":

1. Verifica que estés en **Settings** → **Database**
2. Baja hasta el final de la página
3. Si aún no aparece, tu proyecto puede estar en una región que no soporta pooling

En ese caso, usa la **conexión directa** (aunque puede tener problemas IPv6):

```
DB_HOST = db.nqpsvrfehtmjcvovbqal.supabase.co
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = mm2grndBfGsVgmEf
```

---

## 🎯 Siguiente Paso

Una vez que tengas las credenciales del pooler:

1. Ve a Render: https://dashboard.render.com
2. Clic en tu servicio **ecg-digital-city**
3. Clic en **Environment**
4. Actualiza las 5 variables
5. Clic en **"Save Changes"**
6. Espera el redeploy (2-3 min)

---

## ✅ Verificación

Después del deploy, verifica en los logs de Render:

```
✅ Conexión a PostgreSQL establecida
✅ Base de datos tiene 18 tablas
```

Si ves estos mensajes, ¡la conexión funcionó!

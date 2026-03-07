# ⚡ Setup Local Rápido

## 🎯 Opción 1: Script Automático (RECOMENDADO)

### En tu terminal (CMD o PowerShell):

```bash
wsl
cd /mnt/c/xampp/htdocs/ecg-digital-city/backend
bash scripts/setup-local-db.sh
```

Esto hará:
- ✅ Crear base de datos `ecg_digital_city`
- ✅ Crear usuario `ecg_user` con contraseña `ecg_password`
- ✅ Configurar permisos
- ✅ Mostrarte la configuración para `.env`

---

## 🎯 Opción 2: Manual (Si el script falla)

### Paso 1: Entrar a PostgreSQL

```bash
wsl
sudo -u postgres psql
```

### Paso 2: Ejecutar estos comandos

```sql
-- Crear usuario
CREATE USER ecg_user WITH PASSWORD 'ecg_password';

-- Crear base de datos
CREATE DATABASE ecg_digital_city OWNER ecg_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE ecg_digital_city TO ecg_user;

-- Conectar a la base de datos
\c ecg_digital_city

-- Dar permisos en el schema
GRANT ALL ON SCHEMA public TO ecg_user;

-- Verificar
\l

-- Salir
\q
```

### Paso 3: Actualizar .env

Edita `backend/.env`:

```env
DB_HOST=172.25.8.183
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=ecg_user
DB_PASSWORD=ecg_password
```

### Paso 4: Ejecutar migraciones

```bash
cd backend
npx sequelize-cli db:migrate
```

### Paso 5: Ejecutar seed

```bash
npm run seed:all
```

---

## ✅ Verificar que Funciona

```bash
cd backend
npm run diagnose
```

Deberías ver:
```
✅ Distritos: 4
✅ Misiones: 15
✅ Logros: 10
✅ Oficinas: 8
```

---

## 🚨 Si Algo Falla

### Error: "password authentication failed"

```bash
wsl
sudo -u postgres psql
```

```sql
ALTER USER ecg_user WITH PASSWORD 'ecg_password';
\q
```

### Error: "database does not exist"

```bash
wsl
sudo -u postgres psql
```

```sql
CREATE DATABASE ecg_digital_city OWNER ecg_user;
\q
```

### Error: "permission denied"

```bash
wsl
sudo -u postgres psql
```

```sql
\c ecg_digital_city
GRANT ALL ON SCHEMA public TO ecg_user;
\q
```

---

## ⏱️ Tiempo Total

- Script automático: **2 minutos**
- Manual: **5 minutos**

---

## 🎉 Después de Configurar

Ya puedes trabajar localmente:

```bash
# Backend
cd backend
npm run dev

# Frontend (otra terminal)
cd frontend
npm run dev
```

Abre: http://localhost:5173

---

## 💡 Recuerda

- **Local:** Para desarrollo y pruebas
- **Render:** Para producción

Puedes trabajar en ambos sin problemas.

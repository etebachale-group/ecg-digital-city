# 🚀 Pasos para Ejecutar PostgreSQL (WSL/Ubuntu)

## ✅ Opción 1: Automático (Recomendado)

### Ejecuta este comando en PowerShell:

```powershell
.\setup-postgres.ps1
```

Este script hará TODO automáticamente:
- ✅ Iniciará PostgreSQL en WSL
- ✅ Creará la base de datos
- ✅ Creará todas las tablas
- ✅ Insertará datos de prueba
- ✅ Configurará el acceso desde Windows
- ✅ Actualizará el archivo .env con la IP correcta

---

## 📋 Opción 2: Manual (Paso a Paso)

Si prefieres hacerlo manualmente o el script automático falla:

### Paso 1: Abrir WSL/Ubuntu

```powershell
wsl
```

### Paso 2: Iniciar PostgreSQL

```bash
sudo service postgresql start
```

### Paso 3: Verificar que está corriendo

```bash
sudo service postgresql status
```

Deberías ver: `online`

### Paso 4: Configurar contraseña del usuario postgres

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';"
```

### Paso 5: Crear la base de datos

```bash
sudo -u postgres psql -c "CREATE DATABASE ecg_digital_city;"
```

### Paso 6: Navegar al proyecto

```bash
cd /mnt/c/xampp/htdocs/ecg-digital-city
```

### Paso 7: Ejecutar el script de setup

```bash
sudo -u postgres psql -d ecg_digital_city -f backend/scripts/setup-database.sql
```

### Paso 8: Insertar datos de prueba (opcional)

```bash
sudo -u postgres psql -d ecg_digital_city -f backend/scripts/seed-interactions.sql
```

### Paso 9: Obtener la IP de WSL

```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```

Copia esta IP (ejemplo: `172.18.240.1`)

### Paso 10: Configurar acceso desde Windows

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Buscar y cambiar (Ctrl+W para buscar):
listen_addresses = '*'

# Guardar: Ctrl+O, Enter, Ctrl+X

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Agregar al final:
host    all             all             0.0.0.0/0               md5

# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar PostgreSQL
sudo service postgresql restart
```

### Paso 11: Actualizar .env

Sal de WSL:
```bash
exit
```

Edita `backend/.env` y cambia:
```env
DB_HOST=172.18.240.1  # Usa la IP que obtuviste en el Paso 9
```

---

## 🧪 Verificar que Funciona

### Desde WSL:

```bash
wsl
psql -U postgres -d ecg_digital_city -c "SELECT COUNT(*) FROM interactive_objects;"
```

Debería mostrar: `11` (si insertaste datos de prueba)

### Desde Windows (PowerShell):

```powershell
cd backend
npm test
```

---

## 🔧 Comandos Útiles

### Iniciar PostgreSQL en WSL:
```bash
wsl sudo service postgresql start
```

### Ver estado:
```bash
wsl sudo service postgresql status
```

### Detener PostgreSQL:
```bash
wsl sudo service postgresql stop
```

### Conectarse a la base de datos desde WSL:
```bash
wsl psql -U postgres -d ecg_digital_city
```

### Ver tablas:
```sql
\dt
```

### Salir de psql:
```sql
\q
```

---

## ❓ Problemas Comunes

### "service postgresql: unrecognized service"

PostgreSQL no está instalado. Instálalo:
```bash
wsl sudo apt update
wsl sudo apt install postgresql postgresql-contrib -y
```

### "connection refused" al ejecutar tests

1. Verifica que PostgreSQL está corriendo:
   ```bash
   wsl sudo service postgresql status
   ```

2. Verifica la IP en `.env`:
   ```bash
   wsl ip addr show eth0 | grep "inet\b"
   ```

3. Actualiza `DB_HOST` en `backend/.env` con la IP correcta

### "password authentication failed"

La contraseña en `.env` no coincide. Cámbiala:
```bash
wsl sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';"
```

### "database does not exist"

Créala:
```bash
wsl sudo -u postgres psql -c "CREATE DATABASE ecg_digital_city;"
```

---

## 🎯 Resumen Rápido

```powershell
# 1. Ejecutar el script automático
.\setup-postgres.ps1

# 2. Ejecutar tests
cd backend
npm test

# ¡Listo! 🎉
```

---

## 📝 Notas Importantes

- ⚠️ La IP de WSL puede cambiar al reiniciar. Si los tests fallan después de reiniciar, ejecuta `.\setup-postgres.ps1` nuevamente.
- 💡 PostgreSQL en WSL debe estar corriendo antes de ejecutar el backend o los tests.
- 🔄 Para iniciar PostgreSQL automáticamente, puedes agregar `sudo service postgresql start` a tu `.bashrc` en WSL.

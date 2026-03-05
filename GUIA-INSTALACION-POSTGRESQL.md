# 🐘 Guía de Instalación de PostgreSQL para ECG Digital City

Esta guía te llevará paso a paso para instalar y configurar PostgreSQL en tu sistema Windows.

## 📋 Opción 1: Instalación en Windows (Recomendado para desarrollo)

### Paso 1: Descargar PostgreSQL

1. Ve a: https://www.postgresql.org/download/windows/
2. Haz clic en "Download the installer"
3. Descarga la versión **PostgreSQL 14 o superior** (64-bit)
4. Ejecuta el instalador descargado

### Paso 2: Instalar PostgreSQL

Durante la instalación:

1. **Installation Directory**: Deja el default `C:\Program Files\PostgreSQL\14`
2. **Select Components**: Marca todos (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
3. **Data Directory**: Deja el default `C:\Program Files\PostgreSQL\14\data`
4. **Password**: Establece la contraseña para el usuario `postgres`
   - **IMPORTANTE**: Usa `postgres123` (como está en tu .env) o actualiza tu .env
5. **Port**: Deja el default `5432`
6. **Locale**: Deja el default
7. Haz clic en "Next" y luego "Install"

### Paso 3: Agregar PostgreSQL al PATH

1. Abre "Variables de entorno del sistema":
   - Presiona `Win + R`
   - Escribe `sysdm.cpl` y presiona Enter
   - Ve a la pestaña "Opciones avanzadas"
   - Haz clic en "Variables de entorno"

2. En "Variables del sistema", busca `Path` y haz clic en "Editar"

3. Haz clic en "Nuevo" y agrega:
   ```
   C:\Program Files\PostgreSQL\14\bin
   ```

4. Haz clic en "Aceptar" en todas las ventanas

5. **Reinicia PowerShell** para que tome los cambios

### Paso 4: Verificar la Instalación

Abre una nueva ventana de PowerShell y ejecuta:

```powershell
psql --version
```

Deberías ver algo como: `psql (PostgreSQL) 14.x`

### Paso 5: Verificar que el Servicio está Corriendo

```powershell
Get-Service -Name "postgresql*"
```

Si no está corriendo, inícialo:

```powershell
Start-Service -Name "postgresql-x64-14"
```

---

## 📋 Opción 2: Instalación en WSL/Ubuntu (Si prefieres Linux)

### Paso 1: Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Paso 2: Instalar PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
```

### Paso 3: Iniciar el Servicio

```bash
sudo service postgresql start
```

### Paso 4: Configurar el Usuario postgres

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Dentro de psql, establecer contraseña
ALTER USER postgres PASSWORD 'postgres123';

# Salir
\q
```

### Paso 5: Configurar Acceso Remoto (Opcional)

Si quieres acceder desde Windows a PostgreSQL en WSL:

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Buscar y cambiar:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Agregar al final:
host    all             all             0.0.0.0/0               md5

# Reiniciar servicio
sudo service postgresql restart
```

---

## 🚀 Configurar la Base de Datos de ECG Digital City

Una vez que PostgreSQL esté instalado y corriendo:

### Método 1: Usando el Script Automatizado (Recomendado)

#### En Windows PowerShell:

```powershell
# Navegar al proyecto
cd C:\xampp\htdocs\ecg-digital-city

# Ejecutar el script de setup
.\backend\scripts\run-postgres-setup.ps1 -Action all
```

#### En WSL/Linux:

```bash
# Navegar al proyecto
cd /mnt/c/xampp/htdocs/ecg-digital-city

# Dar permisos de ejecución
chmod +x backend/scripts/run-postgres-setup.sh

# Ejecutar el script
./backend/scripts/run-postgres-setup.sh all
```

### Método 2: Manualmente con psql

#### Paso 1: Crear la Base de Datos

```powershell
# Windows
psql -U postgres -c "CREATE DATABASE ecg_digital_city;"

# WSL/Linux
sudo -u postgres psql -c "CREATE DATABASE ecg_digital_city;"
```

#### Paso 2: Ejecutar el Script de Setup

```powershell
# Windows
psql -U postgres -d ecg_digital_city -f backend\scripts\setup-database.sql

# WSL/Linux
sudo -u postgres psql -d ecg_digital_city -f backend/scripts/setup-database.sql
```

#### Paso 3: Insertar Datos de Prueba

```powershell
# Windows
psql -U postgres -d ecg_digital_city -f backend\scripts\seed-interactions.sql

# WSL/Linux
sudo -u postgres psql -d ecg_digital_city -f backend/scripts/seed-interactions.sql
```

### Método 3: Usando Migraciones de Sequelize

```bash
cd backend
npm run migrate
```

---

## ✅ Verificar que Todo Funciona

### 1. Conectarse a la Base de Datos

```powershell
# Windows
psql -U postgres -d ecg_digital_city

# WSL/Linux
sudo -u postgres psql -d ecg_digital_city
```

### 2. Verificar las Tablas

Dentro de psql:

```sql
-- Listar todas las tablas
\dt

-- Deberías ver:
-- interactive_objects
-- interaction_nodes
-- object_triggers
-- interaction_queue
-- interaction_logs
-- avatars (y otras tablas existentes)

-- Contar objetos de prueba
SELECT COUNT(*) FROM interactive_objects;
-- Debería mostrar: 11

-- Ver objetos insertados
SELECT id, object_type, name FROM interactive_objects;

-- Salir
\q
```

### 3. Ejecutar los Tests

```bash
cd backend
npm test
```

---

## 🔧 Configuración del Archivo .env

Asegúrate de que tu archivo `backend/.env` tenga la configuración correcta:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecg_digital_city
DB_USER=postgres
DB_PASSWORD=postgres123
```

**IMPORTANTE**: Si usaste una contraseña diferente durante la instalación, actualiza `DB_PASSWORD`.

---

## 🐛 Solución de Problemas

### Error: "psql: command not found"

**Solución**: PostgreSQL no está en el PATH.

- **Windows**: Sigue el Paso 3 de la instalación para agregar al PATH
- **WSL/Linux**: Reinstala con `sudo apt install postgresql-client`

### Error: "connection refused"

**Solución**: El servicio no está corriendo.

```powershell
# Windows - Verificar servicio
Get-Service -Name "postgresql*"

# Si no está corriendo, iniciarlo
Start-Service -Name "postgresql-x64-14"

# WSL/Linux
sudo service postgresql start
```

### Error: "password authentication failed"

**Solución**: La contraseña en `.env` no coincide.

1. Opción 1: Cambiar la contraseña de PostgreSQL:
   ```sql
   psql -U postgres
   ALTER USER postgres PASSWORD 'postgres123';
   \q
   ```

2. Opción 2: Actualizar el archivo `.env` con la contraseña correcta

### Error: "database does not exist"

**Solución**: Crear la base de datos primero:

```powershell
psql -U postgres -c "CREATE DATABASE ecg_digital_city;"
```

### Error: "permission denied"

**Solución**: 

- **Windows**: Ejecuta PowerShell como Administrador
- **WSL/Linux**: Usa `sudo` antes de los comandos

---

## 🎯 Comandos Útiles

### Gestión del Servicio PostgreSQL

```powershell
# Windows
Get-Service -Name "postgresql*"                    # Ver estado
Start-Service -Name "postgresql-x64-14"            # Iniciar
Stop-Service -Name "postgresql-x64-14"             # Detener
Restart-Service -Name "postgresql-x64-14"          # Reiniciar

# WSL/Linux
sudo service postgresql status                      # Ver estado
sudo service postgresql start                       # Iniciar
sudo service postgresql stop                        # Detener
sudo service postgresql restart                     # Reiniciar
```

### Comandos psql Útiles

```sql
\l                          -- Listar bases de datos
\c ecg_digital_city         -- Conectar a base de datos
\dt                         -- Listar tablas
\d table_name               -- Describir tabla
\du                         -- Listar usuarios
\q                          -- Salir
```

### Backup y Restore

```powershell
# Backup
pg_dump -U postgres ecg_digital_city > backup.sql

# Restore
psql -U postgres ecg_digital_city < backup.sql
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial de PostgreSQL](https://www.postgresql.org/docs/)
- [Tutorial de PostgreSQL](https://www.postgresqltutorial.com/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu base de datos estará lista para:

- ✅ Ejecutar el backend de ECG Digital City
- ✅ Correr todos los tests
- ✅ Desarrollar nuevas funcionalidades
- ✅ Probar el sistema de interacciones avanzadas

Si tienes algún problema, revisa la sección de "Solución de Problemas" o consulta los logs en `backend/logs/`.

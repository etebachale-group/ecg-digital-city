# Setup Simple de PostgreSQL
Write-Host "🚀 Configurando PostgreSQL en WSL..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Iniciar PostgreSQL
Write-Host "1️⃣ Iniciando PostgreSQL..." -ForegroundColor Yellow
wsl bash -c "sudo service postgresql start"
Start-Sleep -Seconds 2

# Paso 2: Verificar estado
Write-Host "2️⃣ Verificando estado..." -ForegroundColor Yellow
wsl bash -c "sudo service postgresql status"

# Paso 3: Configurar contraseña
Write-Host "3️⃣ Configurando contraseña..." -ForegroundColor Yellow
wsl bash -c "sudo -u postgres psql -c `"ALTER USER postgres PASSWORD 'postgres123';`""

# Paso 4: Crear base de datos
Write-Host "4️⃣ Creando base de datos..." -ForegroundColor Yellow
wsl bash -c "sudo -u postgres psql -c `"DROP DATABASE IF EXISTS ecg_digital_city;`""
wsl bash -c "sudo -u postgres psql -c `"CREATE DATABASE ecg_digital_city;`""

# Paso 5: Crear tablas
Write-Host "5️⃣ Creando tablas..." -ForegroundColor Yellow
wsl bash -c "cd /mnt/c/xampp/htdocs/ecg-digital-city && sudo -u postgres psql -d ecg_digital_city -f backend/scripts/setup-database.sql"

# Paso 6: Insertar datos de prueba
Write-Host "6️⃣ Insertando datos de prueba..." -ForegroundColor Yellow
wsl bash -c "cd /mnt/c/xampp/htdocs/ecg-digital-city && sudo -u postgres psql -d ecg_digital_city -f backend/scripts/seed-interactions.sql"

# Paso 7: Obtener IP de WSL
Write-Host "7️⃣ Obteniendo IP de WSL..." -ForegroundColor Yellow
$wslIp = wsl bash -c "ip addr show eth0 | grep 'inet\b' | awk '{print `$2}' | cut -d/ -f1"
Write-Host "   IP de WSL: $wslIp" -ForegroundColor Cyan

# Paso 8: Actualizar .env
Write-Host "8️⃣ Actualizando .env..." -ForegroundColor Yellow
$envContent = Get-Content "backend\.env" -Raw
$envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=$wslIp"
Set-Content "backend\.env" -Value $envContent
Write-Host "   DB_HOST actualizado a: $wslIp" -ForegroundColor Cyan

# Paso 9: Configurar acceso remoto
Write-Host "9️⃣ Configurando acceso desde Windows..." -ForegroundColor Yellow
wsl bash -c @"
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo 'host    all             all             0.0.0.0/0               md5' | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo service postgresql restart
"@

Write-Host ""
Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Información de conexión:" -ForegroundColor Cyan
Write-Host "   Host: $wslIp" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   Database: ecg_digital_city" -ForegroundColor White
Write-Host "   User: postgres" -ForegroundColor White
Write-Host "   Password: postgres123" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para probar:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   npm test" -ForegroundColor Yellow
Write-Host ""

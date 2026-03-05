#!/bin/bash

# Script de build para Render
# Este script se ejecuta durante el despliegue

set -e  # Salir si hay error

echo "🚀 Iniciando build para Render..."

# 1. Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm ci --production=false

# 2. Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm ci --production=false

# 3. Build del frontend
echo "🔨 Construyendo frontend..."
npm run build

# 4. Verificar que el build existe
if [ ! -d "dist" ]; then
  echo "❌ Error: El directorio dist no fue creado"
  exit 1
fi

echo "✅ Build completado exitosamente"
echo "📊 Tamaño del build:"
du -sh dist

# 5. Limpiar archivos innecesarios para reducir tamaño
echo "🧹 Limpiando archivos innecesarios..."
cd ..
find . -name "*.test.js" -type f -delete
find . -name "*.spec.js" -type f -delete
find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true

echo "✅ Build de Render completado"

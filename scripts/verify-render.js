#!/usr/bin/env node

/**
 * Script de verificación para despliegue en Render
 * Verifica que todo esté listo para desplegar
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];
const success = [];

console.log('🔍 Verificando configuración para Render...\n');

// 1. Verificar render.yaml
console.log('📋 Verificando render.yaml...');
if (!fs.existsSync(path.join(__dirname, '..', 'render.yaml'))) {
  errors.push('❌ Archivo render.yaml no encontrado');
} else {
  success.push('✅ render.yaml encontrado');
  
  // Verificar contenido
  const renderYaml = fs.readFileSync(path.join(__dirname, '..', 'render.yaml'), 'utf8');
  if (!renderYaml.includes('services:')) {
    errors.push('❌ render.yaml no tiene configuración de servicios');
  } else {
    success.push('✅ render.yaml configurado correctamente');
  }
}

// 2. Verificar backend/src/server.js
console.log('\n🔧 Verificando backend/src/server.js...');
try {
  const serverJs = fs.readFileSync(
    path.join(__dirname, '..', 'backend', 'src', 'server.js'),
    'utf8'
  );
  
  if (!serverJs.includes('express.static')) {
    warnings.push('⚠️  server.js podría no estar sirviendo archivos estáticos del frontend');
  } else {
    success.push('✅ server.js configurado para servir frontend');
  }
  
  if (!serverJs.includes('NODE_ENV')) {
    warnings.push('⚠️  server.js no verifica NODE_ENV para producción');
  } else {
    success.push('✅ server.js verifica NODE_ENV');
  }
} catch (error) {
  errors.push(`❌ Error leyendo server.js: ${error.message}`);
}

// 3. Verificar package.json del backend
console.log('\n📦 Verificando backend/package.json...');
try {
  const backendPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'backend', 'package.json'), 'utf8')
  );
  
  if (!backendPkg.scripts.start) {
    errors.push('❌ backend/package.json debe tener script "start"');
  } else {
    success.push('✅ Script start encontrado');
  }
  
  // Verificar dependencias críticas
  const criticalDeps = ['express', 'dotenv', 'cors', 'sequelize', 'pg', 'socket.io'];
  const missingDeps = criticalDeps.filter(dep => !backendPkg.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    errors.push(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`);
  } else {
    success.push('✅ Todas las dependencias críticas presentes');
  }
} catch (error) {
  errors.push(`❌ Error leyendo backend/package.json: ${error.message}`);
}

// 4. Verificar package.json del frontend
console.log('\n📦 Verificando frontend/package.json...');
try {
  const frontendPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'frontend', 'package.json'), 'utf8')
  );
  
  if (!frontendPkg.scripts.build) {
    errors.push('❌ frontend/package.json debe tener script "build"');
  } else {
    success.push('✅ Script build encontrado');
  }
  
  // Verificar dependencias críticas
  const criticalDeps = ['react', 'react-dom', 'three', 'vite'];
  const missingDeps = criticalDeps.filter(dep => 
    !frontendPkg.dependencies[dep] && !frontendPkg.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    errors.push(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`);
  } else {
    success.push('✅ Todas las dependencias críticas presentes');
  }
} catch (error) {
  errors.push(`❌ Error leyendo frontend/package.json: ${error.message}`);
}

// 5. Verificar vite.config.js
console.log('\n⚙️  Verificando vite.config.js...');
if (!fs.existsSync(path.join(__dirname, '..', 'frontend', 'vite.config.js'))) {
  errors.push('❌ vite.config.js no encontrado');
} else {
  success.push('✅ vite.config.js encontrado');
}

// 6. Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');
try {
  const gitignore = fs.readFileSync(
    path.join(__dirname, '..', '.gitignore'),
    'utf8'
  );
  
  const requiredIgnores = ['node_modules', '.env', 'dist'];
  const missingIgnores = requiredIgnores.filter(pattern => !gitignore.includes(pattern));
  
  if (missingIgnores.length > 0) {
    warnings.push(`⚠️  .gitignore debería incluir: ${missingIgnores.join(', ')}`);
  } else {
    success.push('✅ .gitignore configurado correctamente');
  }
} catch (error) {
  warnings.push('⚠️  No se pudo leer .gitignore');
}

// 7. Verificar archivos sensibles
console.log('\n🔐 Verificando archivos sensibles...');
const sensitiveFiles = ['.env', 'backend/.env', 'frontend/.env'];
const foundSensitive = sensitiveFiles.filter(file => 
  fs.existsSync(path.join(__dirname, '..', file))
);

if (foundSensitive.length > 0) {
  warnings.push(`⚠️  Archivos sensibles encontrados: ${foundSensitive.join(', ')}`);
  warnings.push('   Asegúrate de que estén en .gitignore');
} else {
  success.push('✅ No se encontraron archivos sensibles en el repositorio');
}

// 8. Verificar estructura de directorios
console.log('\n📁 Verificando estructura de directorios...');
const requiredDirs = [
  'frontend/src',
  'backend/src',
  'backend/src/routes',
  'backend/src/models',
  'backend/src/services',
  'backend/src/sockets'
];

const missingDirs = requiredDirs.filter(dir => 
  !fs.existsSync(path.join(__dirname, '..', dir))
);

if (missingDirs.length > 0) {
  errors.push(`❌ Directorios faltantes: ${missingDirs.join(', ')}`);
} else {
  success.push('✅ Estructura de directorios correcta');
}

// 9. Verificar que dist/ no esté en el repositorio
console.log('\n🗑️  Verificando archivos de build...');
if (fs.existsSync(path.join(__dirname, '..', 'frontend', 'dist'))) {
  warnings.push('⚠️  frontend/dist/ existe (debería estar en .gitignore)');
} else {
  success.push('✅ No hay archivos de build en el repositorio');
}

// 10. Verificar Git
console.log('\n🔀 Verificando Git...');
if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
  errors.push('❌ No es un repositorio Git');
  errors.push('   Ejecuta: git init && git add . && git commit -m "Initial commit"');
} else {
  success.push('✅ Repositorio Git inicializado');
}

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN PARA RENDER');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ ÉXITOS:');
  success.forEach(msg => console.log(msg));
}

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:');
  warnings.forEach(msg => console.log(msg));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORES:');
  errors.forEach(msg => console.log(msg));
}

// Conclusión
if (errors.length === 0 && warnings.length === 0) {
  console.log('\n🎉 ¡Perfecto! Todo listo para desplegar en Render');
  console.log('\n📋 Próximos pasos:');
  console.log('1. git add .');
  console.log('2. git commit -m "Configurar para Render"');
  console.log('3. git push origin main');
  console.log('4. Ve a render.com/dashboard');
  console.log('5. New + > Blueprint');
  console.log('6. Conecta tu repositorio');
  console.log('7. Apply');
  console.log('\n📖 Lee RENDER-QUICKSTART.md para instrucciones detalladas');
  process.exit(0);
}

if (errors.length > 0) {
  console.log('\n❌ Hay errores que deben corregirse antes de desplegar');
  console.log('📖 Revisa los errores arriba y corrígelos');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Hay advertencias, pero puedes continuar');
  console.log('📖 Lee RENDER-DEPLOYMENT.md para más información');
  console.log('\n¿Continuar con el despliegue? (Recomendado: revisar advertencias primero)');
  process.exit(0);
}

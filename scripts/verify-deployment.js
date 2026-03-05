#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue
 * Verifica que todo esté listo para desplegar en Vercel
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];

console.log('🔍 Verificando configuración para despliegue en Vercel...\n');

// 1. Verificar archivos de configuración
console.log('📋 Verificando archivos de configuración...');

const requiredFiles = [
  'vercel.json',
  'frontend/package.json',
  'backend/package.json',
  '.env.example'
];

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, '..', file))) {
    errors.push(`❌ Archivo faltante: ${file}`);
  } else {
    console.log(`  ✅ ${file}`);
  }
});

// 2. Verificar package.json del frontend
console.log('\n📦 Verificando frontend/package.json...');

try {
  const frontendPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'frontend', 'package.json'), 'utf8')
  );
  
  if (!frontendPkg.scripts['vercel-build']) {
    errors.push('❌ frontend/package.json debe tener script "vercel-build"');
  } else {
    console.log('  ✅ Script vercel-build encontrado');
  }
  
  if (!frontendPkg.scripts.build) {
    errors.push('❌ frontend/package.json debe tener script "build"');
  } else {
    console.log('  ✅ Script build encontrado');
  }
} catch (error) {
  errors.push(`❌ Error leyendo frontend/package.json: ${error.message}`);
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
    console.log('  ✅ Script start encontrado');
  }
  
  // Verificar dependencias críticas
  const criticalDeps = ['express', 'dotenv', 'cors', 'sequelize', 'pg'];
  criticalDeps.forEach(dep => {
    if (!backendPkg.dependencies[dep]) {
      errors.push(`❌ Dependencia faltante en backend: ${dep}`);
    }
  });
  
  console.log('  ✅ Dependencias críticas presentes');
} catch (error) {
  errors.push(`❌ Error leyendo backend/package.json: ${error.message}`);
}

// 4. Verificar vite.config.js
console.log('\n⚙️  Verificando vite.config.js...');

try {
  const viteConfig = fs.readFileSync(
    path.join(__dirname, '..', 'frontend', 'vite.config.js'),
    'utf8'
  );
  
  if (!viteConfig.includes('build:')) {
    warnings.push('⚠️  vite.config.js podría no tener configuración de build');
  } else {
    console.log('  ✅ Configuración de build encontrada');
  }
} catch (error) {
  errors.push(`❌ Error leyendo vite.config.js: ${error.message}`);
}

// 5. Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');

try {
  const gitignore = fs.readFileSync(
    path.join(__dirname, '..', '.gitignore'),
    'utf8'
  );
  
  const requiredIgnores = ['node_modules', '.env', 'dist'];
  requiredIgnores.forEach(pattern => {
    if (!gitignore.includes(pattern)) {
      warnings.push(`⚠️  .gitignore debería incluir: ${pattern}`);
    }
  });
  
  console.log('  ✅ .gitignore configurado');
} catch (error) {
  warnings.push('⚠️  No se pudo leer .gitignore');
}

// 6. Verificar que .env no esté en el repositorio
console.log('\n🔐 Verificando archivos sensibles...');

const sensitiveFiles = ['.env', 'backend/.env', 'frontend/.env'];
sensitiveFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    warnings.push(`⚠️  Archivo sensible encontrado: ${file} (asegúrate de que esté en .gitignore)`);
  }
});

console.log('  ✅ Verificación de archivos sensibles completa');

// 7. Verificar estructura de directorios
console.log('\n📁 Verificando estructura de directorios...');

const requiredDirs = [
  'frontend/src',
  'backend/src',
  'backend/src/routes',
  'backend/src/models',
  'backend/src/services'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, '..', dir))) {
    errors.push(`❌ Directorio faltante: ${dir}`);
  }
});

console.log('  ✅ Estructura de directorios correcta');

// 8. Verificar que dist/ no esté en el repositorio
console.log('\n🗑️  Verificando archivos de build...');

if (fs.existsSync(path.join(__dirname, '..', 'frontend', 'dist'))) {
  warnings.push('⚠️  frontend/dist/ existe (debería estar en .gitignore)');
}

console.log('  ✅ Verificación de archivos de build completa');

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ ¡Todo listo para desplegar en Vercel!');
  console.log('\nPróximos pasos:');
  console.log('1. git add .');
  console.log('2. git commit -m "Preparar para despliegue en Vercel"');
  console.log('3. git push origin main');
  console.log('4. Importar proyecto en Vercel Dashboard');
  console.log('5. Configurar variables de entorno');
  console.log('6. Desplegar');
  console.log('\n📖 Lee VERCEL-DEPLOYMENT.md para instrucciones detalladas');
  process.exit(0);
}

if (errors.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:');
  errors.forEach(error => console.log(error));
}

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:');
  warnings.forEach(warning => console.log(warning));
}

if (errors.length > 0) {
  console.log('\n❌ Corrige los errores antes de desplegar');
  process.exit(1);
} else {
  console.log('\n⚠️  Hay advertencias, pero puedes continuar con el despliegue');
  console.log('📖 Lee VERCEL-DEPLOYMENT.md para más información');
  process.exit(0);
}

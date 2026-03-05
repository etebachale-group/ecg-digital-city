#!/usr/bin/env node

// Script de inicio con mejor manejo de errores
console.log('=== INICIANDO SERVIDOR ===');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

// Verificar variables de entorno críticas
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Faltan variables de entorno:', missingVars.join(', '));
  console.error('Variables disponibles:', Object.keys(process.env).filter(k => k.startsWith('DB_')).join(', '));
  process.exit(1);
}

console.log('✅ Variables de entorno verificadas');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('PORT:', process.env.PORT);
console.log('HOST:', process.env.HOST);

// Intentar cargar el servidor
try {
  console.log('Cargando servidor...');
  require('./src/server.js');
  console.log('✅ Servidor cargado exitosamente');
} catch (error) {
  console.error('❌ ERROR AL CARGAR SERVIDOR:');
  console.error('Mensaje:', error.message);
  console.error('Stack:', error.stack);
  console.error('Código:', error.code);
  console.error('Detalles completos:', JSON.stringify(error, null, 2));
  process.exit(1);
}

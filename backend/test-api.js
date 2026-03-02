/**
 * Script de prueba de API - ECG Digital City
 * Ejecutar: node test-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = null;
let userId = null;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n🧪 ${name}`, 'blue');
    await fn();
    log(`✅ ${name} - PASÓ`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} - FALLÓ`, 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// Tests
async function testRegister() {
  const randomEmail = `test${Date.now()}@test.com`;
  const response = await axios.post(`${API_URL}/auth/register`, {
    email: randomEmail,
    password: 'test123',
    username: `testuser${Date.now()}`,
    fullName: 'Test User'
  });
  
  authToken = response.data.token;
  userId = response.data.user.id;
  log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
  log(`   User ID: ${userId}`, 'yellow');
}

async function testLogin() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'test@test.com',
    password: 'test123'
  });
  
  if (!response.data.token) {
    throw new Error('No se recibió token');
  }
}

async function testGetDistricts() {
  const response = await axios.get(`${API_URL}/districts`);
  
  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('No se recibieron distritos');
  }
  
  log(`   Distritos encontrados: ${response.data.length}`, 'yellow');
}

async function testGetAchievements() {
  const response = await axios.get(`${API_URL}/achievements`);
  
  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('No se recibieron logros');
  }
  
  log(`   Logros encontrados: ${response.data.length}`, 'yellow');
}

async function testGetMissions() {
  const response = await axios.get(`${API_URL}/missions?isActive=true`);
  
  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('No se recibieron misiones');
  }
  
  log(`   Misiones activas: ${response.data.length}`, 'yellow');
}

async function testGetProgress() {
  if (!userId) {
    throw new Error('No hay userId disponible');
  }
  
  const response = await axios.get(`${API_URL}/gamification/progress/${userId}`);
  
  if (!response.data) {
    throw new Error('No se recibió progreso');
  }
  
  log(`   Nivel: ${response.data.level}`, 'yellow');
  log(`   XP: ${response.data.currentXP}/${response.data.xpToNextLevel}`, 'yellow');
}

async function testDailyLogin() {
  if (!userId) {
    throw new Error('No hay userId disponible');
  }
  
  const response = await axios.post(`${API_URL}/gamification/daily-login`, {
    userId
  });
  
  if (!response.data.progress) {
    throw new Error('No se recibió progreso actualizado');
  }
  
  log(`   XP ganado: 10`, 'yellow');
  log(`   Racha: ${response.data.progress.streakDays} días`, 'yellow');
}

async function testAddXP() {
  if (!userId) {
    throw new Error('No hay userId disponible');
  }
  
  const response = await axios.post(`${API_URL}/gamification/add-xp`, {
    userId,
    xp: 50,
    action: 'test_action'
  });
  
  if (!response.data.progress) {
    throw new Error('No se agregó XP');
  }
  
  log(`   XP agregado: 50`, 'yellow');
  log(`   XP total: ${response.data.progress.currentXP}`, 'yellow');
}

async function testAssignDailyMissions() {
  if (!userId) {
    throw new Error('No hay userId disponible');
  }
  
  try {
    const response = await axios.post(`${API_URL}/missions/assign-daily`, {
      userId
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('No se asignaron misiones');
    }
    
    log(`   Misiones asignadas: ${response.data.length}`, 'yellow');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('Ya tienes misiones')) {
      log(`   Ya tiene misiones asignadas hoy`, 'yellow');
    } else {
      throw error;
    }
  }
}

async function testGetUserMissions() {
  if (!userId) {
    throw new Error('No hay userId disponible');
  }
  
  const response = await axios.get(`${API_URL}/missions/user/${userId}`);
  
  if (!Array.isArray(response.data)) {
    throw new Error('No se recibieron misiones del usuario');
  }
  
  log(`   Misiones del usuario: ${response.data.length}`, 'yellow');
}

async function testLeaderboard() {
  const response = await axios.get(`${API_URL}/gamification/leaderboard?limit=10`);
  
  if (!Array.isArray(response.data)) {
    throw new Error('No se recibió leaderboard');
  }
  
  log(`   Usuarios en leaderboard: ${response.data.length}`, 'yellow');
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n🚀 Iniciando pruebas de API - ECG Digital City\n', 'blue');
  
  const results = [];
  
  // Tests de autenticación
  log('\n📋 TESTS DE AUTENTICACIÓN', 'blue');
  results.push(await test('Registro de usuario', testRegister));
  results.push(await test('Login de usuario', testLogin));
  
  // Tests de datos básicos
  log('\n📋 TESTS DE DATOS BÁSICOS', 'blue');
  results.push(await test('Obtener distritos', testGetDistricts));
  results.push(await test('Obtener logros', testGetAchievements));
  results.push(await test('Obtener misiones', testGetMissions));
  
  // Tests de gamificación
  log('\n📋 TESTS DE GAMIFICACIÓN', 'blue');
  results.push(await test('Obtener progreso', testGetProgress));
  results.push(await test('Login diario', testDailyLogin));
  results.push(await test('Agregar XP', testAddXP));
  results.push(await test('Leaderboard', testLeaderboard));
  
  // Tests de misiones
  log('\n📋 TESTS DE MISIONES', 'blue');
  results.push(await test('Asignar misiones diarias', testAssignDailyMissions));
  results.push(await test('Obtener misiones del usuario', testGetUserMissions));
  
  // Resumen
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;
  
  log('\n' + '='.repeat(50), 'blue');
  log(`📊 RESUMEN DE PRUEBAS`, 'blue');
  log(`   Total: ${total}`, 'yellow');
  log(`   Pasaron: ${passed}`, 'green');
  log(`   Fallaron: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   Porcentaje: ${Math.round((passed / total) * 100)}%`, failed > 0 ? 'yellow' : 'green');
  log('='.repeat(50) + '\n', 'blue');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});

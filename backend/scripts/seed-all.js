/**
 * Seed Completo - Ejecuta todos los seeds en orden
 * 1. Distritos
 * 2. Gamificación (Achievements, Missions)
 * 3. Oficinas y Edificios
 */

// Cargar variables de entorno PRIMERO
require('dotenv').config();

const { seedDistricts } = require('../src/utils/seedDistricts')
const { seedGamification } = require('../src/utils/seedGamification')
const { seedOffices } = require('./seed-offices')

async function seedAll() {
  console.log('🚀 Iniciando seed completo de ECG Digital City...\n')
  
  try {
    // 1. Seed de Distritos
    console.log('📍 PASO 1/3: Creando distritos...')
    await seedDistricts()
    console.log('✅ Distritos creados\n')
    
    // 2. Seed de Gamificación
    console.log('🎮 PASO 2/3: Creando sistema de gamificación...')
    await seedGamification()
    console.log('✅ Gamificación creada\n')
    
    // 3. Seed de Oficinas
    console.log('🏢 PASO 3/3: Creando oficinas y edificios...')
    await seedOffices()
    console.log('✅ Oficinas creadas\n')
    
    console.log('=' .repeat(60))
    console.log('🎉 SEED COMPLETO EXITOSO!')
    console.log('=' .repeat(60))
    console.log('\n📊 Resumen:')
    console.log('   ✅ Distritos creados')
    console.log('   ✅ Sistema de gamificación configurado')
    console.log('   ✅ Oficinas y edificios generados')
    console.log('   ⭐ ETEBA CHALE GROUP - Oficina Central lista')
    console.log('\n🚀 ECG Digital City está listo para usar!')
    console.log('\nPróximos pasos:')
    console.log('   1. Inicia el backend: npm start')
    console.log('   2. Inicia el frontend: cd ../frontend && npm run dev')
    console.log('   3. Abre http://localhost:5173')
    console.log('   4. Regístrate y explora la ciudad\n')
    
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error)
    console.error('\nPara más detalles, revisa:')
    console.error('   - backend/logs/error.log')
    console.error('   - Variables de entorno en .env')
    console.error('   - Estado de PostgreSQL\n')
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('✅ Proceso completado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error.message)
      process.exit(1)
    })
}

module.exports = { seedAll }

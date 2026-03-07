/**
 * Script de Diagnóstico y Fix para Producción
 * Verifica el estado de la BD y ejecuta seeds si es necesario
 */

const { sequelize } = require('../src/config/database')
const { District, Mission, Company, Office, User } = require('../src/models')
const { seedDistricts } = require('../src/utils/seedDistricts')
const { seedGamification } = require('../src/utils/seedGamification')
const { seedOffices } = require('./seed-offices')

async function diagnose() {
  console.log('🔍 Diagnosticando estado de la base de datos...\n')
  
  const results = {
    districts: 0,
    missions: 0,
    companies: 0,
    offices: 0,
    users: 0
  }
  
  try {
    // Verificar conexión
    await sequelize.authenticate()
    console.log('✅ Conexión a BD exitosa\n')
    
    // Contar registros
    results.districts = await District.count()
    results.missions = await Mission.count()
    results.companies = await Company.count()
    results.offices = await Office.count()
    results.users = await User.count()
    
    console.log('📊 Estado actual:')
    console.log(`   - Distritos: ${results.districts}`)
    console.log(`   - Misiones: ${results.missions}`)
    console.log(`   - Empresas: ${results.companies}`)
    console.log(`   - Oficinas: ${results.offices}`)
    console.log(`   - Usuarios: ${results.users}`)
    console.log()
    
    return results
  } catch (error) {
    console.error('❌ Error al diagnosticar:', error.message)
    throw error
  }
}

async function fix() {
  console.log('🔧 Iniciando proceso de fix...\n')
  
  try {
    const state = await diagnose()
    
    let needsFix = false
    
    // Verificar qué necesita fix
    if (state.districts === 0) {
      console.log('⚠️  No hay distritos - ejecutando seed...')
      await seedDistricts()
      console.log('✅ Distritos creados\n')
      needsFix = true
    }
    
    if (state.missions === 0) {
      console.log('⚠️  No hay misiones - ejecutando seed...')
      await seedGamification()
      console.log('✅ Gamificación creada\n')
      needsFix = true
    }
    
    if (state.companies === 0 || state.offices === 0) {
      console.log('⚠️  No hay oficinas - ejecutando seed...')
      
      // Verificar que hay distritos primero
      const districtCount = await District.count()
      if (districtCount === 0) {
        console.log('⚠️  Creando distritos primero...')
        await seedDistricts()
      }
      
      await seedOffices()
      console.log('✅ Oficinas creadas\n')
      needsFix = true
    }
    
    if (!needsFix) {
      console.log('✅ La base de datos está completa, no se necesitan fixes\n')
    }
    
    // Diagnóstico final
    console.log('📊 Estado final:')
    const finalState = await diagnose()
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ FIX COMPLETADO')
    console.log('='.repeat(60))
    
    if (finalState.districts > 0 && finalState.missions > 0 && finalState.offices > 0) {
      console.log('\n🎉 La base de datos está lista!')
      console.log('\nPróximos pasos:')
      console.log('   1. Reinicia el servidor backend')
      console.log('   2. Recarga la aplicación frontend')
      console.log('   3. Los errores 500 deberían desaparecer\n')
    } else {
      console.log('\n⚠️  Algunos datos aún faltan. Revisa los logs arriba.\n')
    }
    
  } catch (error) {
    console.error('\n❌ Error durante el fix:', error)
    console.error('\nDetalles del error:')
    console.error(error.stack)
    throw error
  }
}

// Ejecutar
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'diagnose') {
    // Solo diagnóstico
    diagnose()
      .then(() => {
        console.log('✅ Diagnóstico completado')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ Error:', error.message)
        process.exit(1)
      })
  } else {
    // Fix completo (default)
    fix()
      .then(() => {
        console.log('✅ Proceso completado')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ Error:', error.message)
        process.exit(1)
      })
  }
}

module.exports = { diagnose, fix }

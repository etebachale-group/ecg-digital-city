const { sequelize } = require('../src/config/database')
const logger = require('../src/utils/logger')

async function fixProduction() {
  try {
    logger.info('🔧 Iniciando fix de producción...')
    
    // 1. Verificar conexión
    logger.info('📡 Verificando conexión a base de datos...')
    await sequelize.authenticate()
    logger.info('✅ Conexión a BD exitosa')
    
    // 2. Verificar tablas existentes
    logger.info('📋 Verificando tablas...')
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    logger.info(`✅ Encontradas ${tables.length} tablas`)
    
    if (tables.length === 0) {
      logger.warn('⚠️  No hay tablas. Ejecutando sincronización...')
      await sequelize.sync({ alter: false, force: false })
      logger.info('✅ Tablas creadas')
    }
    
    // 3. Verificar y seed distritos
    logger.info('🗺️  Verificando distritos...')
    const District = require('../src/models/District')
    const districtCount = await District.count()
    
    if (districtCount === 0) {
      logger.info('📝 Seeding distritos...')
      const { seedDistricts } = require('../src/utils/seedDistricts')
      await seedDistricts()
      logger.info('✅ Distritos seeded')
    } else {
      logger.info(`✅ Ya existen ${districtCount} distritos`)
    }
    
    // 4. Verificar y seed gamificación
    logger.info('🎮 Verificando gamificación...')
    const Achievement = require('../src/models/Achievement')
    const achievementCount = await Achievement.count()
    
    if (achievementCount === 0) {
      logger.info('📝 Seeding gamificación...')
      const { seedGamification } = require('../src/utils/seedGamification')
      await seedGamification()
      logger.info('✅ Gamificación seeded')
    } else {
      logger.info(`✅ Ya existen ${achievementCount} logros`)
    }
    
    // 5. Verificar datos críticos
    logger.info('🔍 Verificando datos críticos...')
    
    const User = require('../src/models/User')
    const userCount = await User.count()
    logger.info(`👥 Usuarios: ${userCount}`)
    
    const Mission = require('../src/models/Mission')
    const missionCount = await Mission.count()
    logger.info(`🎯 Misiones: ${missionCount}`)
    
    const Company = require('../src/models/Company')
    const companyCount = await Company.count()
    logger.info(`🏢 Empresas: ${companyCount}`)
    
    // 6. Resumen final
    logger.info('\n' + '='.repeat(50))
    logger.info('🎉 Fix completado exitosamente')
    logger.info('='.repeat(50))
    logger.info(`📊 Resumen:`)
    logger.info(`   - Tablas: ${tables.length}`)
    logger.info(`   - Distritos: ${districtCount || 4}`)
    logger.info(`   - Logros: ${achievementCount || 8}`)
    logger.info(`   - Misiones: ${missionCount}`)
    logger.info(`   - Usuarios: ${userCount}`)
    logger.info(`   - Empresas: ${companyCount}`)
    logger.info('='.repeat(50))
    
    await sequelize.close()
    process.exit(0)
  } catch (error) {
    logger.error('❌ Error en fix:', error)
    logger.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar
fixProduction()

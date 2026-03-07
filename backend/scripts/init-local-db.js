require('dotenv').config();
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

// Importar todos los modelos
require('../src/models');

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos local...\n');
    
    // Verificar conexión
    console.log('📡 Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');
    
    // Crear todas las tablas
    console.log('📊 Creando tablas desde modelos...');
    await sequelize.sync({ force: false });
    console.log('✅ Tablas creadas\n');
    
    // Verificar tablas creadas
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    
    console.log('📋 Tablas en la base de datos:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    console.log('');
    
    console.log('🎉 Base de datos inicializada correctamente!\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. npm run seed:all');
    console.log('   2. npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

initDatabase();

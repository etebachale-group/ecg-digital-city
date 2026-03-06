const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a PostgreSQL establecida');
    
    // En producción, crear tablas base si no existen
    if (process.env.NODE_ENV === 'production') {
      try {
        // Verificar si ya existen tablas
        const [tables] = await sequelize.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        
        if (tables.length === 0) {
          logger.info('🔄 Base de datos vacía, creando tablas base...');
          await sequelize.sync({ force: false });
          logger.info('✅ Tablas base creadas');
        } else {
          logger.info(`✅ Base de datos tiene ${tables.length} tablas`);
        }
      } catch (syncError) {
        logger.warn('⚠️  Error verificando/creando tablas:', syncError.message);
      }
    }
    
    logger.info('Base de datos lista (schema gestionado por migraciones)');
    
    // Seed de distritos iniciales (solo si las tablas existen)
    try {
      const { seedDistricts } = require('../utils/seedDistricts');
      await seedDistricts();
    } catch (seedError) {
      logger.warn('⚠️  Error en seed de distritos (probablemente tablas no creadas aún):', seedError.message);
    }
    
    return sequelize;
  } catch (error) {
    logger.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

module.exports = { sequelize, initializeDatabase };

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
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Conexión a PostgreSQL establecida');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Modelos sincronizados con la base de datos');
    
    // Seed de distritos iniciales
    const { seedDistricts } = require('../utils/seedDistricts');
    await seedDistricts();
    
    return sequelize;
  } catch (error) {
    logger.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

module.exports = { sequelize, initializeDatabase };

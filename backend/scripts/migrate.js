const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

async function runMigrations() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✓ Conexión establecida');

    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sequelize_meta (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      )
    `);

    // Get list of executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM sequelize_meta ORDER BY name'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`\nEncontradas ${migrationFiles.length} migraciones`);
    console.log(`Ejecutadas ${executedNames.length} migraciones\n`);

    // Run pending migrations
    let executed = 0;
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`Ejecutando migración: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        
        try {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          await sequelize.query(
            'INSERT INTO sequelize_meta (name) VALUES (?)',
            { replacements: [file] }
          );
          console.log(`✓ ${file} completada`);
          executed++;
        } catch (error) {
          console.error(`✗ Error en ${file}:`, error.message);
          throw error;
        }
      } else {
        console.log(`⊘ ${file} ya ejecutada`);
      }
    }

    console.log(`\n✓ Migraciones completadas: ${executed} nuevas`);
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();

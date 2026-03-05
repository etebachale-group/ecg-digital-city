#!/usr/bin/env node

/**
 * Script completo de configuración de base de datos
 * 1. Ejecuta migraciones de Sequelize
 * 2. Ejecuta SQL del sistema de interacciones avanzadas
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

console.log('=== CONFIGURACIÓN DE BASE DE DATOS ===\n');

// Verificar variables de entorno
const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Faltan variables de entorno:', missingVars.join(', '));
  process.exit(1);
}

console.log('Configuración:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PORT:', process.env.DB_PORT || 5432);
console.log('');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Silenciar logs de SQL
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

async function runMigrations() {
  console.log('📋 PASO 1: Ejecutando migraciones de Sequelize\n');
  
  try {
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

    console.log(`Encontradas ${migrationFiles.length} migraciones`);
    console.log(`Ejecutadas ${executedNames.length} previamente\n`);

    // Run pending migrations
    let executed = 0;
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`  Ejecutando: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        
        try {
          await migration.up(sequelize.getQueryInterface(), Sequelize);
          await sequelize.query(
            'INSERT INTO sequelize_meta (name) VALUES (?)',
            { replacements: [file] }
          );
          console.log(`  ✅ Completada\n`);
          executed++;
        } catch (error) {
          console.error(`  ❌ Error:`, error.message);
          throw error;
        }
      } else {
        console.log(`  ⊘ ${file} (ya ejecutada)`);
      }
    }

    console.log(`\n✅ Migraciones completadas: ${executed} nuevas\n`);
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
    throw error;
  }
}

async function runInteractionsSQL() {
  console.log('📋 PASO 2: Ejecutando SQL del Sistema de Interacciones\n');
  
  try {
    const sqlPath = path.join(__dirname, 'sistema-interacciones-avanzadas-schema.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.log('⚠️  Archivo SQL no encontrado, saltando...\n');
      return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir por statements (separados por ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Ejecutando ${statements.length} statements SQL...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await sequelize.query(statement);
          console.log(`  ✅ Statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Ignorar errores de "ya existe"
          if (error.message.includes('already exists')) {
            console.log(`  ⊘ Statement ${i + 1}/${statements.length} (ya existe)`);
          } else {
            console.error(`  ❌ Error en statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('\n✅ SQL del Sistema de Interacciones completado\n');
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);
    throw error;
  }
}

async function verifyTables() {
  console.log('📋 PASO 3: Verificando tablas creadas\n');
  
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`✅ ${tables.length} tablas encontradas:\n`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log('');
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
  }
}

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    await runMigrations();
    await runInteractionsSQL();
    await verifyTables();

    console.log('=== ✅ CONFIGURACIÓN COMPLETADA ===\n');
    process.exit(0);
  } catch (error) {
    console.error('\n=== ❌ ERROR EN CONFIGURACIÓN ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

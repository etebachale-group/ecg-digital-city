#!/usr/bin/env node

/**
 * Script de Migración Directa a Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'db.nqpsvrfehtmjcvovbqal.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'mm2grndBfGsVgmEf',
  ssl: {
    rejectUnauthorized: false
  }
};

async function migrate() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     MIGRACIÓN A SUPABASE - ECG Digital City            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('🔄 Conectando a Supabase...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conexión exitosa a Supabase\n');

    // Verificar versión
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    console.log('🔄 Ejecutando script de base de datos...\n');

    // Leer el script SQL
    const sqlPath = path.join(__dirname, 'reset-and-reload-database.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remover comandos \echo
    sql = sql.replace(/\\echo[^\n]*/g, '');

    // Ejecutar el script
    await client.query(sql);

    console.log('✅ Script ejecutado exitosamente\n');

    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`✅ ${tablesResult.rows.length} tablas creadas:\n`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Verificar datos iniciales
    console.log('\n🔍 Verificando datos iniciales...\n');
    
    const districtsResult = await client.query('SELECT COUNT(*) FROM districts');
    const achievementsResult = await client.query('SELECT COUNT(*) FROM achievements');
    const missionsResult = await client.query('SELECT COUNT(*) FROM missions');

    console.log(`   Distritos: ${districtsResult.rows[0].count}`);
    console.log(`   Logros: ${achievementsResult.rows[0].count}`);
    console.log(`   Misiones: ${missionsResult.rows[0].count}`);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              ✅ MIGRACIÓN COMPLETADA                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📋 Próximos pasos:\n');
    console.log('1. Ve a Render Dashboard > tu servicio > Environment');
    console.log('2. Actualiza estas variables:\n');
    console.log(`   DB_HOST=${config.host}`);
    console.log(`   DB_PORT=5432`);
    console.log(`   DB_NAME=postgres`);
    console.log(`   DB_USER=postgres`);
    console.log(`   DB_PASSWORD=${config.password}`);
    console.log('\n3. Guarda los cambios y Render hará redeploy automáticamente');
    console.log('4. ¡Listo! Tu aplicación ahora usa Supabase\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:\n');
    console.error(error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();

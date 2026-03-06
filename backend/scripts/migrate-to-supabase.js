#!/usr/bin/env node

/**
 * Script de Migración a Supabase
 * ECG Digital City
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     MIGRACIÓN A SUPABASE - ECG Digital City            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('Este script te ayudará a migrar tu base de datos a Supabase.\n');
  console.log('Necesitarás las credenciales de tu proyecto Supabase.');
  console.log('Las puedes encontrar en: Settings > Database\n');

  // Obtener credenciales
  const host = await question('Host de Supabase (ej: db.xxxxx.supabase.co): ');
  const password = await question('Password de la base de datos: ');
  
  const config = {
    host: host.trim(),
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password.trim(),
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('\n🔄 Probando conexión a Supabase...\n');

  const client = new Client(config);

  try {
    // Probar conexión
    await client.connect();
    console.log('✅ Conexión exitosa a Supabase\n');

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    // Preguntar si continuar
    const continuar = await question('¿Deseas ejecutar el script de creación de base de datos? (SI/NO): ');
    
    if (continuar.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada\n');
      rl.close();
      await client.end();
      process.exit(0);
    }

    console.log('\n🔄 Ejecutando script de base de datos...\n');

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

    console.log('💡 Tip: Guarda estas credenciales en un lugar seguro\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:\n');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Verifica que el host sea correcto.');
      console.error('   Debe ser algo como: db.xxxxxxxxxxxxx.supabase.co\n');
    } else if (error.code === '28P01') {
      console.error('\n💡 La contraseña es incorrecta.');
      console.error('   Verifica en Supabase > Settings > Database\n');
    } else {
      console.error('\nDetalles:', error);
    }
    
    process.exit(1);
  } finally {
    rl.close();
    await client.end();
  }
}

// Ejecutar
main().catch(console.error);

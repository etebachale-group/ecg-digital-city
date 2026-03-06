#!/usr/bin/env node

/**
 * Script de Verificación de Supabase
 * ECG Digital City
 */

const { Client } = require('pg');
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
  console.log('║     VERIFICACIÓN DE SUPABASE - ECG Digital City        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Obtener credenciales
  const host = await question('Host de Supabase: ');
  const password = await question('Password: ');
  
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

  console.log('\n🔄 Conectando a Supabase...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // 1. Verificar versión
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. INFORMACIÓN DEL SERVIDOR');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    // 2. Contar tablas
    console.log('═══════════════════════════════════════════════════════');
    console.log('2. TABLAS EN LA BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`Total de tablas: ${tablesResult.rows.length}\n`);
    
    const expectedTables = [
      'users', 'avatars', 'companies', 'districts', 'offices',
      'office_objects', 'permissions', 'user_progress', 'achievements',
      'user_achievements', 'missions', 'user_missions', 'events', 'event_attendees'
    ];

    expectedTables.forEach(table => {
      const exists = tablesResult.rows.some(row => row.table_name === table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });

    // 3. Verificar datos iniciales
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('3. DATOS INICIALES');
    console.log('═══════════════════════════════════════════════════════\n');

    const queries = [
      { name: 'Distritos', query: 'SELECT COUNT(*) FROM districts', expected: 4 },
      { name: 'Logros', query: 'SELECT COUNT(*) FROM achievements', expected: 8 },
      { name: 'Misiones', query: 'SELECT COUNT(*) FROM missions', expected: 7 },
      { name: 'Usuarios', query: 'SELECT COUNT(*) FROM users', expected: 0 },
      { name: 'Avatares', query: 'SELECT COUNT(*) FROM avatars', expected: 0 }
    ];

    for (const { name, query, expected } of queries) {
      try {
        const result = await client.query(query);
        const count = parseInt(result.rows[0].count);
        const status = (expected === 0 || count === expected) ? '✅' : '⚠️';
        console.log(`   ${status} ${name}: ${count} ${expected > 0 ? `(esperado: ${expected})` : ''}`);
      } catch (error) {
        console.log(`   ❌ ${name}: Error - ${error.message}`);
      }
    }

    // 4. Verificar índices
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('4. ÍNDICES');
    console.log('═══════════════════════════════════════════════════════\n');

    const indexResult = await client.query(`
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);

    console.log(`   Total de índices: ${indexResult.rows[0].count}`);

    // 5. Verificar triggers
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('5. TRIGGERS');
    console.log('═══════════════════════════════════════════════════════\n');

    const triggerResult = await client.query(`
      SELECT COUNT(*) 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
    `);

    console.log(`   Total de triggers: ${triggerResult.rows[0].count}`);

    // 6. Verificar funciones
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('6. FUNCIONES');
    console.log('═══════════════════════════════════════════════════════\n');

    const functionResult = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `);

    console.log(`   Total de funciones: ${functionResult.rows.length}\n`);
    functionResult.rows.forEach(row => {
      console.log(`   ✅ ${row.routine_name}`);
    });

    // 7. Tamaño de la base de datos
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('7. TAMAÑO DE LA BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════\n');

    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size('postgres')) as size
    `);

    console.log(`   Tamaño total: ${sizeResult.rows[0].size}`);

    // Resumen final
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  RESUMEN FINAL                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const allTablesExist = expectedTables.every(table => 
      tablesResult.rows.some(row => row.table_name === table)
    );

    if (allTablesExist) {
      console.log('✅ Todas las tablas necesarias existen');
    } else {
      console.log('⚠️  Faltan algunas tablas');
    }

    const districtsResult = await client.query('SELECT COUNT(*) FROM districts');
    if (parseInt(districtsResult.rows[0].count) === 4) {
      console.log('✅ Datos iniciales correctos');
    } else {
      console.log('⚠️  Faltan datos iniciales');
    }

    console.log('✅ Conexión a Supabase funcional');
    console.log('\n💡 Tu base de datos está lista para usar\n');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:\n');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 El host no es válido o no existe');
    } else if (error.code === '28P01') {
      console.error('\n💡 La contraseña es incorrecta');
    }
    
    process.exit(1);
  } finally {
    rl.close();
    await client.end();
  }
}

main().catch(console.error);

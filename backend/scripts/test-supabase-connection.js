#!/usr/bin/env node

const { Client } = require('pg');

const config = {
  host: 'db.nqpsvrfehtmjcvovbqal.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'mm2grndBfGsVgmEf',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
};

async function test() {
  console.log('\n🔍 Probando conexión a Supabase...\n');
  console.log('Host:', config.host);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('\n⏳ Conectando...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ ¡Conexión exitosa!\n');

    const result = await client.query('SELECT NOW()');
    console.log('Timestamp del servidor:', result.rows[0].now);
    console.log('\n✅ Supabase está listo para usar\n');

  } catch (error) {
    console.error('❌ Error de conexión:\n');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('\n💡 Posibles causas:\n');
    
    if (error.code === 'ENOTFOUND') {
      console.error('1. El proyecto de Supabase aún se está creando (espera 2-3 min)');
      console.error('2. El host es incorrecto');
      console.error('3. Problemas de DNS/red\n');
      console.error('Verifica en Supabase > Settings > Database que el host sea correcto.\n');
    } else if (error.code === '28P01') {
      console.error('La contraseña es incorrecta.\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Timeout de conexión. El servidor no responde.\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

test();

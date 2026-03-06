require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    const result = await client.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('📊 Tablas en la base de datos:', result.rows[0].count);
    
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    
    console.log('\n📋 Lista de tablas:');
    tables.rows.forEach(t => console.log('  -', t.table_name));
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

testConnection();

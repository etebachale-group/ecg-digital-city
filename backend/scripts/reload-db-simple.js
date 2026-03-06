#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'ecg_digital_city_sqmj',
  user: 'ecg_digital_city_sqmj_user',
  password: 'sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD',
  ssl: { rejectUnauthorized: false }
};

async function reload() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado');

    const sql = fs.readFileSync(path.join(__dirname, 'reset-and-reload-database.sql'), 'utf8')
      .replace(/\\echo[^\n]*/g, '');

    // Ejecutar todo el script de una vez
    await client.query(sql);

    console.log('✅ Base de datos recargada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

reload();

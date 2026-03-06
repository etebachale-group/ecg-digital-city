#!/usr/bin/env node

/**
 * Script para recargar la base de datos completa
 * ECG Digital City
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración de la base de datos
const config = {
  host: 'dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'ecg_digital_city',
  user: 'ecg_user',
  password: 'KeIeMc0m9GFiTIcDXc9xOIjvGO4z1Gt8',
  ssl: {
    rejectUnauthorized: false
  }
};

// Función para preguntar confirmación
function askConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  ADVERTENCIA: Este script ELIMINARÁ TODOS LOS DATOS\n');
    console.log('Base de datos:', config.database);
    console.log('Host:', config.host);
    console.log('');
    
    rl.question('¿Estás seguro de continuar? (escribe "SI" para confirmar): ', (answer) => {
      rl.close();
      resolve(answer === 'SI');
    });
  });
}

// Función principal
async function reloadDatabase() {
  const confirmed = await askConfirmation();
  
  if (!confirmed) {
    console.log('\n❌ Operación cancelada\n');
    process.exit(0);
  }

  console.log('\n🔄 Conectando a la base de datos...\n');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conectado\n');

    // Leer el script SQL
    const sqlPath = path.join(__dirname, 'reset-and-reload-database.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remover comandos \echo que no son compatibles con pg
    sql = sql.replace(/\\echo[^\n]*/g, '');

    console.log('🔄 Ejecutando script de recarga...\n');

    // Ejecutar el script
    await client.query(sql);

    console.log('\n✅ Base de datos recargada exitosamente\n');
    console.log('Próximos pasos:');
    console.log('1. Reinicia el servidor en Render (o espera el auto-deploy)');
    console.log('2. Crea tu primer usuario desde el frontend');
    console.log('3. ¡Listo para usar!\n');

  } catch (error) {
    console.error('\n❌ Error al recargar la base de datos:\n');
    console.error(error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
reloadDatabase();

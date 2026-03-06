#!/usr/bin/env node

/**
 * Script para recargar la base de datos completa (sin confirmación)
 * ECG Digital City
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const config = {
  host: 'dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'ecg_digital_city_sqmj',
  user: 'ecg_digital_city_sqmj_user',
  password: 'sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD',
  ssl: {
    rejectUnauthorized: false
  }
};

// Función principal
async function reloadDatabase() {
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

    // Dividir el script en statements individuales
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let dollarCount = 0;

    const lines = sql.split('\n');
    for (const line of lines) {
      // Detectar inicio/fin de función PL/pgSQL
      if (line.includes('$$') || line.includes('$ LANGUAGE')) {
        dollarCount++;
        if (dollarCount % 2 === 1) {
          inFunction = true;
        } else {
          inFunction = false;
        }
      }

      currentStatement += line + '\n';

      // Si no estamos en una función y la línea termina con ;, es el fin del statement
      if (!inFunction && line.trim().endsWith(';') && !line.trim().startsWith('--')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // Agregar el último statement si existe
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    // Ejecutar cada statement
    let executed = 0;
    for (const statement of statements) {
      if (statement && !statement.startsWith('--')) {
        try {
          await client.query(statement);
          executed++;
          if (executed % 10 === 0) {
            process.stdout.write('.');
          }
        } catch (err) {
          // Ignorar errores de "ya existe" o "no existe"
          if (!err.message.includes('already exists') && 
              !err.message.includes('does not exist') &&
              !err.message.includes('IF NOT EXISTS')) {
            console.error('\n❌ Error en statement:', statement.substring(0, 100));
            throw err;
          }
        }
      }
    }

    console.log('\n\n✅ Base de datos recargada exitosamente\n');
    console.log('Statements ejecutados:', executed);
    console.log('\nPróximos pasos:');
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

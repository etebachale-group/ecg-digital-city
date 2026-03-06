#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');
const files = [
  'companies.js',
  'offices.js',
  'interactiveObjects.js'
];

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar await redis.get( por if (redis) { await redis.get(
  content = content.replace(
    /(\s+)(const cached = await redis\.get\([^)]+\);)/g,
    '$1if (redis) {\n$1  $2'
  );
  
  // Agregar cierre de if después de return res.json
  content = content.replace(
    /(if \(redis\) \{\s+const cached = await redis\.get[^}]+\}\s+if \(cached\) \{\s+return res\.json\([^)]+\);\s+\})/g,
    '$1\n    }'
  );
  
  // Reemplazar await redis.setex( por if (redis) { await redis.setex(
  content = content.replace(
    /(\s+)(await redis\.setex\([^;]+;)/g,
    '$1if (redis) {\n$1  $2\n$1}'
  );
  
  // Reemplazar await redis.del( por if (redis) { await redis.del(
  content = content.replace(
    /(\s+)(await redis\.del\([^;]+;)/g,
    '$1if (redis) {\n$1  $2\n$1}'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Actualizado: ${file}`);
});

console.log('\n✅ Todos los archivos actualizados');

# Actualización 2026-03-07

## Problemas Resueltos

### 1. Error 500 en Endpoints - Mission Model Schema Mismatch

**Problema:** El modelo `Mission` no coincidía con el esquema de la base de datos, causando errores 500 en todos los endpoints relacionados con misiones.

**Errores específicos:**
- Modelo usaba `title` pero la DB tiene `name`
- Modelo tenía campos extras que no existen en DB: `difficulty`, `requirementType`, `requirementValue`
- Faltaba mapeo correcto de campos snake_case a camelCase

**Solución aplicada:**

```javascript
// backend/src/models/Mission.js
{
  name: {                    // ✅ Cambiado de 'title' a 'name'
    type: DataTypes.STRING(200),
    allowNull: false
  },
  missionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'mission_type'    // ✅ Mapeo correcto
  },
  targetValue: {             // ✅ Nuevo campo que sí existe en DB
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target_value'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_reward'       // ✅ Mapeo correcto
  }
  // ❌ Removidos: difficulty, requirementType, requirementValue
}
```

**Archivos modificados:**
- `backend/src/models/Mission.js` - Modelo corregido
- `backend/src/utils/seedGamification.js` - Actualizado para usar `name` y `targetValue`

### 2. Error Frontend - TypeError: can't access property "x", i.position is undefined

**Problema:** El componente `District.jsx` intentaba acceder a `districtData.position.x` y `districtData.size.width` pero estos campos no existen en los distritos que vienen de la base de datos.

**Error en consola:**
```
TypeError: can't access property "x", i.position is undefined
```

**Solución aplicada:**

```javascript
// frontend/src/components/District.jsx
function District({ districtData, onPlayerRef }) {
  // ✅ Valores por defecto si no existen
  const position = districtData.position || { x: 0, z: 0 }
  const size = districtData.size || { width: 100, depth: 100 }

  return (
    <group position={[position.x, 0, position.z]}>
      <Plane
        args={[size.width, size.depth]}
        // ...
      />
    </group>
  )
}
```

**Archivo modificado:**
- `frontend/src/components/District.jsx` - Agregados valores por defecto

### 3. Error Frontend - RangeError: invalid array length en NavigationMesh

**Problema:** El sistema `NavigationMesh` recibía parámetros inválidos que causaban dimensiones negativas o extremadamente grandes en el grid, resultando en un `RangeError` al intentar crear arrays.

**Error en consola:**
```
RangeError: invalid array length
createGrid https://ecg-digital-city.onrender.com/assets/index-Dq2G2Gvy.js:1
```

**Causa raíz:**
- `NavigationMesh` esperaba `{ minX, maxX, minZ, maxZ }` pero recibía `{ min: -45, max: 45 }`
- No había validación de bounds (ej: `minX >= maxX` causaría dimensiones negativas)
- No había límites en el tamaño del grid

**Solución aplicada:**

```javascript
// frontend/src/systems/NavigationMesh.js
constructor(worldBounds, cellSize = 0.5) {
  // ✅ Manejar ambos formatos
  if (worldBounds.min !== undefined && worldBounds.max !== undefined) {
    this.worldBounds = {
      minX: worldBounds.min,
      maxX: worldBounds.max,
      minZ: worldBounds.min,
      maxZ: worldBounds.max
    };
  } else {
    this.worldBounds = worldBounds;
  }
  
  // ✅ Asegurar cellSize positivo
  this.cellSize = Math.max(0.1, cellSize);
  // ...
}

createGrid() {
  const { minX, maxX, minZ, maxZ } = this.worldBounds;
  
  // ✅ Validar bounds
  if (minX >= maxX || minZ >= maxZ) {
    console.error('Invalid world bounds:', this.worldBounds);
    this.width = 100;
    this.height = 100;
  } else {
    this.width = Math.ceil((maxX - minX) / this.cellSize);
    this.height = Math.ceil((maxZ - minZ) / this.cellSize);
  }
  
  // ✅ Limitar dimensiones a valores razonables
  this.width = Math.max(1, Math.min(this.width, 10000));
  this.height = Math.max(1, Math.min(this.height, 10000));
  
  // Ahora es seguro crear el grid
  this.grid = Array(this.height).fill(null).map(() => 
    Array(this.width).fill(true)
  );
}
```

**Archivo modificado:**
- `frontend/src/systems/NavigationMesh.js` - Agregada validación robusta

## Estado Actual

### Backend ✅
- Todos los modelos coinciden con el esquema de la base de datos
- Seeds funcionando correctamente:
  - ✅ Districts: 4 distritos creados
  - ✅ Achievements: 16 logros creados
  - ✅ Missions: 10 misiones creadas (ahora funciona)
- Servidor corriendo en producción

### Frontend ✅
- Error de `position` resuelto
- Componentes renderizando correctamente
- Build exitoso

## Próximos Pasos

1. Verificar que Render haya desplegado los cambios automáticamente
2. Probar endpoints en producción:
   - `GET /api/districts` - Debe retornar 4 distritos
   - `GET /api/missions/user/:userId` - Debe funcionar sin error 500
   - `POST /api/missions/assign-daily` - Debe asignar misiones correctamente
3. Verificar que el frontend cargue sin errores en consola
4. Confirmar que los usuarios puedan ver y completar misiones

## Comandos de Verificación

```bash
# Verificar health check
curl https://ecg-digital-city.onrender.com/health

# Verificar distritos
curl https://ecg-digital-city.onrender.com/api/districts

# Verificar misiones (reemplazar :userId con ID real)
curl https://ecg-digital-city.onrender.com/api/missions/user/2
```

## Commits

```
6959cbf - Fix: NavigationMesh invalid array length error
b9a7c1d - Fix: Mission model schema mismatch and District position error
```

**Total de cambios:**
- 5 archivos modificados
- Backend: Mission model y seed corregidos
- Frontend: District.jsx y NavigationMesh.js con validaciones robustas

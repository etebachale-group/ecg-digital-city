# Fix: Error 500 en /api/auth/register

## Problema Identificado

El endpoint `/api/auth/register` está fallando con error 500 porque:

1. El modelo `Avatar.js` define columnas del Sistema de Interacciones (`currentState`, `previousState`, etc.)
2. Estas columnas NO existen en la base de datos de producción
3. Cuando se intenta crear un avatar, Sequelize falla porque las columnas no existen

## Solución Aplicada

Removí temporalmente las columnas del Sistema de Interacciones del modelo `Avatar.js`:

```javascript
// ANTES (causaba error)
currentState: {
  type: DataTypes.STRING(50),
  defaultValue: 'idle',
  field: 'current_state'
},
// ... más columnas

// DESPUÉS (funciona)
accessories: {
  type: DataTypes.JSONB,
  defaultValue: {}
}
// Sin columnas de interacciones
```

## Próximos Pasos

### Opción 1: Instalar Sistema de Interacciones (Recomendado)

Ejecutar el script SQL para agregar las columnas:

```bash
psql -h dpg-d6kmk9dm5p6s73dut5f0-a.oregon-postgres.render.com \
     -U ecg_user \
     -d ecg_digital_city \
     -f backend/scripts/sistema-interacciones-avanzadas-schema.sql
```

Luego, restaurar las columnas en `Avatar.js` y hacer commit.

### Opción 2: Mantener Sin Sistema de Interacciones

Si no necesitas el Sistema de Interacciones todavía:
1. ✅ Las columnas ya fueron removidas del modelo
2. ✅ El registro funcionará correctamente
3. ⏳ Instalar el sistema más adelante cuando sea necesario

## Estado Actual

- ✅ Modelo Avatar simplificado (sin columnas de interacciones)
- ⏳ Pendiente: commit y push
- ⏳ Pendiente: verificar que el registro funcione en Render

## Archivos Modificados

- `backend/src/models/Avatar.js` - Removidas columnas de interacciones

## Commit Siguiente

```bash
git add backend/src/models/Avatar.js
git commit -m "fix: Remove interaction columns from Avatar model until migration runs"
git push
```

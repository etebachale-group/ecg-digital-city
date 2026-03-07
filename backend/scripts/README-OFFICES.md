# Seed de Oficinas y Edificios

## Descripción

Este script crea empresas de ejemplo con sus oficinas en diferentes distritos de ECG Digital City.

**ETEBA CHALE GROUP** es la oficina central principal, ubicada en el centro del distrito Downtown.

## Empresas Creadas

### 1. ETEBA CHALE GROUP (Oficina Central) ⭐
- **Tier**: Enterprise
- **Oficinas**: 2
  - Sede Central (Downtown) - 30x30m
  - Innovation Lab (Tech District) - 20x20m
- **Color**: Azul corporativo (#3498db)
- **Características**: Edificio más grande, marcado con estrella dorada

### 2. TechStart Solutions
- **Tier**: Pro
- **Oficina**: Tech District
- **Color**: Rojo (#e74c3c)

### 3. Creative Studio
- **Tier**: Pro
- **Oficina**: Arts District
- **Color**: Naranja (#f39c12)

### 4. Green Energy Corp
- **Tier**: Enterprise
- **Oficina**: Downtown
- **Color**: Verde (#27ae60)

### 5. FinTech Innovations
- **Tier**: Pro
- **Oficina**: Business District (privada)
- **Color**: Turquesa (#16a085)

### 6. GameDev Studio
- **Tier**: Basic
- **Oficina**: Tech District
- **Color**: Púrpura (#8e44ad)

### 7. HealthTech Solutions
- **Tier**: Pro
- **Oficina**: Downtown
- **Color**: Rosa (#e91e63)

### 8. EduTech Academy
- **Tier**: Pro
- **Oficina**: Education District
- **Color**: Naranja (#ff9800)

## Cómo Ejecutar

### Desarrollo Local

```bash
cd backend
node scripts/seed-offices.js
```

### Producción (Render)

1. Ve a tu servicio backend en Render Dashboard
2. Abre la Shell (pestaña "Shell")
3. Ejecuta:

```bash
cd backend
node scripts/seed-offices.js
```

## Requisitos Previos

Antes de ejecutar este seed, asegúrate de:

1. ✅ La base de datos está corriendo
2. ✅ Los distritos están creados (ejecuta `node src/utils/seedDistricts.js`)
3. ✅ Existe un usuario admin (se crea automáticamente si no existe)

## Verificar Resultados

### En la API

```bash
# Ver todas las empresas
curl http://localhost:5000/api/companies

# Ver todas las oficinas
curl http://localhost:5000/api/offices

# Ver oficinas de un distrito específico
curl http://localhost:5000/api/offices/district/1
```

### En el Juego

1. Inicia sesión en ECG Digital City
2. Navega por los distritos
3. Verás los edificios de oficinas renderizados en 2D
4. La oficina de ETEBA CHALE GROUP tendrá una estrella dorada en el techo
5. Cada edificio muestra el nombre de la empresa arriba

## Características de las Oficinas

### Visuales
- **Edificios procedurales**: Generados con Pixi.js Graphics
- **Ventanas iluminadas**: Amarillas para oficinas públicas, naranjas para privadas
- **Puertas interactivas**: Presiona E para abrir/cerrar
- **Etiquetas**: Nombre de la empresa visible arriba del edificio
- **Colores personalizados**: Cada empresa tiene su paleta de colores

### Interacción
- **Colisión**: No puedes atravesar los edificios
- **Puertas**: Interactúa con las puertas (tecla E)
- **Información**: Click en el edificio para ver detalles (próximamente)

### Datos
- **Posición**: Coordenadas X, Y en el mundo 2D
- **Tamaño**: Ancho y alto del edificio
- **Capacidad**: Máximo de usuarios simultáneos
- **Público/Privado**: Acceso restringido o abierto
- **Tema**: Estilo visual del edificio

## Personalización

Para agregar más oficinas, edita `seed-offices.js`:

```javascript
const miEmpresa = await Company.create({
  name: 'Mi Empresa',
  description: 'Descripción de mi empresa',
  logo: 'URL del logo',
  ownerId: adminUser.id,
  subscriptionTier: 'pro', // basic, pro, enterprise
  maxOffices: 3,
  maxEmployees: 20,
  isActive: true
})

await Office.create({
  companyId: miEmpresa.id,
  districtId: distrito.id,
  name: 'Mi Oficina',
  description: 'Descripción de la oficina',
  position: { x: 10, y: 20, z: 0 },
  size: { width: 20, height: 20, depth: 20 },
  isPublic: true,
  maxCapacity: 25,
  theme: 'modern',
  primaryColor: '#3498db',
  secondaryColor: '#2c3e50'
})
```

## Troubleshooting

### Error: "No hay distritos"
**Solución**: Ejecuta primero el seed de distritos
```bash
node src/utils/seedDistricts.js
```

### Error: "Connection refused"
**Solución**: Verifica que PostgreSQL esté corriendo y las variables de entorno estén configuradas

### Las oficinas no aparecen en el juego
**Solución**: 
1. Verifica que el backend esté corriendo
2. Abre DevTools → Network → Verifica que `/api/offices/district/:id` devuelva datos
3. Recarga la página con Ctrl+Shift+R

### Los edificios se ven mal
**Solución**: Los colores se generan proceduralmente. Si quieres cambiarlos, edita los valores `primaryColor` y `secondaryColor` en el seed.

## Próximas Mejoras

- [ ] Sistema de entrada a oficinas (teleport interno)
- [ ] Panel de información al hacer click en edificio
- [ ] Oficinas con múltiples pisos
- [ ] Personalización de interiores
- [ ] Sistema de permisos de acceso
- [ ] Eventos dentro de oficinas
- [ ] Estadísticas de visitas

## Soporte

Si tienes problemas, verifica:
1. Logs del backend: `backend/logs/error.log`
2. Consola del navegador (F12)
3. Estado de la base de datos: `SELECT * FROM offices;`

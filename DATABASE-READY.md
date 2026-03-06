# ✅ Base de Datos Lista

## Estado Actual

La base de datos PostgreSQL en Render ha sido configurada y poblada exitosamente.

### Credenciales Activas
```
Host: dpg-d6lhlvrh46gs73d173o0-a.oregon-postgres.render.com
Port: 5432
Database: ecg_digital_city_sqmj
User: ecg_digital_city_sqmj_user
Password: sTmJY1TU4KGbN0gE3ofeI25vtMOGqSUD
```

### Tablas Creadas (19 tablas + 3 vistas = 22 total)

**Tablas Base:**
- users
- companies
- districts
- offices
- office_objects
- avatars (con 5 columnas de estado extendidas)
- events
- event_attendees
- missions
- user_missions
- achievements
- user_achievements
- user_progress
- permissions

**Sistema de Interacciones Avanzadas:**
- interactive_objects
- interaction_nodes
- object_triggers
- interaction_queue
- interaction_logs

**Vistas:**
- interactive_objects_with_node_count
- interaction_queue_with_users
- user_interaction_stats

### Datos Iniciales
- 3 distritos (Centro, Norte, Sur)
- 5 misiones
- 8 logros
- Objetos interactivos de ejemplo

## Próximos Pasos

1. **Verificar en Render Dashboard**
   - El Web Service debería estar ejecutándose
   - Los logs deberían mostrar "✅ Conectado a PostgreSQL"

2. **Probar Registro**
   - Ir a: https://ecg-digital-city.onrender.com
   - Crear una nueva cuenta
   - Debería funcionar sin errores 500

3. **Si hay problemas**
   - Revisar logs en Render Dashboard
   - Verificar que las variables de entorno estén actualizadas
   - El backend puede tardar ~1 minuto en reiniciarse

## Comandos Útiles

### Recargar base de datos nuevamente
```bash
cd backend/scripts
node reload-database.js
# Escribir "SI" cuando pregunte
```

### Verificar conexión desde local
```bash
cd backend
node -e "require('./src/config/database.js').sequelize.authenticate().then(() => console.log('OK')).catch(e => console.error(e))"
```

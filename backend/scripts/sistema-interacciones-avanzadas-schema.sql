-- ============================================================================
-- Sistema de Interacciones Avanzadas - Database Schema
-- ECG Digital City
-- ============================================================================
-- 
-- Este script contiene todas las migraciones de base de datos para el
-- Sistema de Interacciones Avanzadas, incluyendo:
-- - Interactive Objects (objetos interactivos)
-- - Interaction Nodes (nodos de interacción)
-- - Object Triggers (triggers de objetos)
-- - Interaction Queue (cola de interacciones)
-- - Interaction Logs (logs de interacciones)
-- - Avatar State Extensions (extensiones de estado de avatar)
--
-- Ejecutar este script creará todas las tablas, índices y constraints
-- necesarios para el sistema.
--
-- Fecha: 2026-03-04
-- Versión: 1.0.0
-- ============================================================================

-- ============================================================================
-- 1. INTERACTIVE OBJECTS TABLE
-- ============================================================================
-- Almacena definiciones de objetos interactivos en el mundo virtual
-- (sillas, puertas, mesas, muebles genéricos)

CREATE TABLE IF NOT EXISTS interactive_objects (
  id SERIAL PRIMARY KEY,
  office_id INTEGER NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  object_type VARCHAR(50) NOT NULL CHECK (object_type IN ('chair', 'door', 'table', 'furniture')),
  name VARCHAR(200) NOT NULL,
  model_path VARCHAR(500),
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  rotation JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  scale JSONB NOT NULL DEFAULT '{"x": 1, "y": 1, "z": 1}',
  state JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_interactive_objects_office ON interactive_objects(office_id);
CREATE INDEX IF NOT EXISTS idx_interactive_objects_type ON interactive_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_interactive_objects_active ON interactive_objects(is_active);
CREATE INDEX IF NOT EXISTS idx_interactive_objects_created_by ON interactive_objects(created_by);

-- Comentarios
COMMENT ON TABLE interactive_objects IS 'Objetos interactivos en el mundo virtual (sillas, puertas, mesas, muebles)';
COMMENT ON COLUMN interactive_objects.object_type IS 'Tipo de objeto: chair, door, table, furniture';
COMMENT ON COLUMN interactive_objects.position IS 'Posición 3D del objeto en formato {x, y, z}';
COMMENT ON COLUMN interactive_objects.rotation IS 'Rotación 3D del objeto en formato {x, y, z}';
COMMENT ON COLUMN interactive_objects.scale IS 'Escala 3D del objeto en formato {x, y, z}';
COMMENT ON COLUMN interactive_objects.state IS 'Estado actual del objeto (abierto/cerrado, ocupado/libre, etc.)';
COMMENT ON COLUMN interactive_objects.config IS 'Configuración específica del tipo de objeto';

-- ============================================================================
-- 2. INTERACTION NODES TABLE
-- ============================================================================
-- Puntos específicos de interacción en objetos (ej: posición de sentado en silla)

CREATE TABLE IF NOT EXISTS interaction_nodes (
  id SERIAL PRIMARY KEY,
  object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
  position JSONB NOT NULL,
  required_state VARCHAR(50) NOT NULL CHECK (required_state IN ('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing')),
  is_occupied BOOLEAN DEFAULT false,
  occupied_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  occupied_at TIMESTAMP,
  max_occupancy INTEGER DEFAULT 1 CHECK (max_occupancy > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_interaction_nodes_object ON interaction_nodes(object_id);
CREATE INDEX IF NOT EXISTS idx_interaction_nodes_occupied ON interaction_nodes(is_occupied);
CREATE INDEX IF NOT EXISTS idx_interaction_nodes_occupied_by ON interaction_nodes(occupied_by);

-- Comentarios
COMMENT ON TABLE interaction_nodes IS 'Puntos de interacción específicos en objetos interactivos';
COMMENT ON COLUMN interaction_nodes.position IS 'Posición 3D relativa al objeto en formato {x, y, z}';
COMMENT ON COLUMN interaction_nodes.required_state IS 'Estado de avatar requerido para usar este nodo';
COMMENT ON COLUMN interaction_nodes.is_occupied IS 'Indica si el nodo está actualmente ocupado';
COMMENT ON COLUMN interaction_nodes.occupied_by IS 'ID del usuario que ocupa el nodo';
COMMENT ON COLUMN interaction_nodes.max_occupancy IS 'Número máximo de usuarios que pueden ocupar este nodo simultáneamente';

-- ============================================================================
-- 3. OBJECT TRIGGERS TABLE
-- ============================================================================
-- Lógica de script asociada a objetos que se ejecuta al interactuar

CREATE TABLE IF NOT EXISTS object_triggers (
  id SERIAL PRIMARY KEY,
  object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('state_change', 'grant_xp', 'unlock_achievement', 'teleport')),
  trigger_data JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  condition JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_object_triggers_object ON object_triggers(object_id);
CREATE INDEX IF NOT EXISTS idx_object_triggers_priority ON object_triggers(priority DESC);
CREATE INDEX IF NOT EXISTS idx_object_triggers_active ON object_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_object_triggers_type ON object_triggers(trigger_type);

-- Comentarios
COMMENT ON TABLE object_triggers IS 'Triggers que se ejecutan cuando un usuario interactúa con un objeto';
COMMENT ON COLUMN object_triggers.trigger_type IS 'Tipo de trigger: state_change, grant_xp, unlock_achievement, teleport';
COMMENT ON COLUMN object_triggers.trigger_data IS 'Datos específicos del trigger (ej: cantidad de XP, ID de logro)';
COMMENT ON COLUMN object_triggers.priority IS 'Orden de ejecución (mayor prioridad = ejecuta primero)';
COMMENT ON COLUMN object_triggers.condition IS 'Condiciones para ejecutar el trigger (nivel mínimo, permisos, etc.)';

-- ============================================================================
-- 4. INTERACTION QUEUE TABLE
-- ============================================================================
-- Sistema de cola para objetos ocupados

CREATE TABLE IF NOT EXISTS interaction_queue (
  id SERIAL PRIMARY KEY,
  object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
  node_id INTEGER NOT NULL REFERENCES interaction_nodes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_interaction_queue_object ON interaction_queue(object_id);
CREATE INDEX IF NOT EXISTS idx_interaction_queue_node ON interaction_queue(node_id);
CREATE INDEX IF NOT EXISTS idx_interaction_queue_user ON interaction_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_queue_expires ON interaction_queue(expires_at);
CREATE INDEX IF NOT EXISTS idx_interaction_queue_position ON interaction_queue(object_id, position);

-- Constraint único: un usuario solo puede estar en la cola de un objeto una vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_interaction_queue_unique_user_object 
  ON interaction_queue(object_id, user_id);

-- Comentarios
COMMENT ON TABLE interaction_queue IS 'Cola de espera para objetos ocupados (FIFO)';
COMMENT ON COLUMN interaction_queue.position IS 'Posición en la cola (1 = primero)';
COMMENT ON COLUMN interaction_queue.expires_at IS 'Timestamp de expiración (auto-remove después de 60s)';

-- ============================================================================
-- 5. INTERACTION LOGS TABLE
-- ============================================================================
-- Registro de todas las interacciones para análisis y logros

CREATE TABLE IF NOT EXISTS interaction_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  xp_granted INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user ON interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_object ON interaction_logs(object_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_timestamp ON interaction_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_success ON interaction_logs(success);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_type ON interaction_logs(interaction_type);

-- Índice compuesto para consultas de estadísticas por usuario
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_timestamp 
  ON interaction_logs(user_id, timestamp DESC);

-- Comentarios
COMMENT ON TABLE interaction_logs IS 'Registro de todas las interacciones usuario-objeto';
COMMENT ON COLUMN interaction_logs.interaction_type IS 'Tipo de interacción (sit, open_door, dance, etc.)';
COMMENT ON COLUMN interaction_logs.success IS 'Indica si la interacción fue exitosa';
COMMENT ON COLUMN interaction_logs.error_message IS 'Mensaje de error si la interacción falló';
COMMENT ON COLUMN interaction_logs.xp_granted IS 'Cantidad de XP otorgado por esta interacción';

-- ============================================================================
-- 6. AVATAR STATE EXTENSIONS
-- ============================================================================
-- Extensión de la tabla avatars con campos de estado

-- Verificar si las columnas ya existen antes de agregarlas
DO $$ 
BEGIN
  -- current_state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'current_state'
  ) THEN
    ALTER TABLE avatars ADD COLUMN current_state VARCHAR(50) DEFAULT 'idle';
    ALTER TABLE avatars ADD CONSTRAINT chk_avatar_current_state 
      CHECK (current_state IN ('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'));
  END IF;

  -- previous_state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'previous_state'
  ) THEN
    ALTER TABLE avatars ADD COLUMN previous_state VARCHAR(50);
    ALTER TABLE avatars ADD CONSTRAINT chk_avatar_previous_state 
      CHECK (previous_state IS NULL OR previous_state IN ('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'));
  END IF;

  -- state_changed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'state_changed_at'
  ) THEN
    ALTER TABLE avatars ADD COLUMN state_changed_at TIMESTAMP;
  END IF;

  -- interacting_with
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'interacting_with'
  ) THEN
    ALTER TABLE avatars ADD COLUMN interacting_with INTEGER REFERENCES interactive_objects(id) ON DELETE SET NULL;
  END IF;

  -- sitting_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'sitting_at'
  ) THEN
    ALTER TABLE avatars ADD COLUMN sitting_at INTEGER REFERENCES interaction_nodes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para optimizar consultas de estado
CREATE INDEX IF NOT EXISTS idx_avatars_state ON avatars(current_state);
CREATE INDEX IF NOT EXISTS idx_avatars_interacting_with ON avatars(interacting_with);
CREATE INDEX IF NOT EXISTS idx_avatars_sitting_at ON avatars(sitting_at);

-- Comentarios
COMMENT ON COLUMN avatars.current_state IS 'Estado actual del avatar: idle, walking, running, sitting, interacting, dancing';
COMMENT ON COLUMN avatars.previous_state IS 'Estado anterior del avatar (para historial)';
COMMENT ON COLUMN avatars.state_changed_at IS 'Timestamp del último cambio de estado';
COMMENT ON COLUMN avatars.interacting_with IS 'ID del objeto con el que está interactuando';
COMMENT ON COLUMN avatars.sitting_at IS 'ID del nodo donde está sentado';

-- ============================================================================
-- 7. TRIGGERS Y FUNCIONES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_interactive_objects_updated_at ON interactive_objects;
CREATE TRIGGER update_interactive_objects_updated_at
  BEFORE UPDATE ON interactive_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interaction_nodes_updated_at ON interaction_nodes;
CREATE TRIGGER update_interaction_nodes_updated_at
  BEFORE UPDATE ON interaction_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_object_triggers_updated_at ON object_triggers;
CREATE TRIGGER update_object_triggers_updated_at
  BEFORE UPDATE ON object_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar colas expiradas automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM interaction_queue WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar posiciones en la cola cuando alguien sale
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se elimina una entrada, actualizar posiciones de los que quedan
  UPDATE interaction_queue
  SET position = position - 1
  WHERE object_id = OLD.object_id 
    AND position > OLD.position;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_queue_positions_on_delete ON interaction_queue;
CREATE TRIGGER update_queue_positions_on_delete
  AFTER DELETE ON interaction_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_positions();

-- ============================================================================
-- 8. VISTAS ÚTILES
-- ============================================================================

-- Vista de objetos con conteo de nodos
CREATE OR REPLACE VIEW interactive_objects_with_node_count AS
SELECT 
  io.*,
  COUNT(in2.id) as node_count,
  COUNT(CASE WHEN in2.is_occupied THEN 1 END) as occupied_nodes
FROM interactive_objects io
LEFT JOIN interaction_nodes in2 ON io.id = in2.object_id
GROUP BY io.id;

COMMENT ON VIEW interactive_objects_with_node_count IS 'Objetos interactivos con conteo de nodos totales y ocupados';

-- Vista de cola con información de usuario
CREATE OR REPLACE VIEW interaction_queue_with_users AS
SELECT 
  iq.*,
  u.username,
  u.email,
  io.name as object_name,
  io.object_type
FROM interaction_queue iq
JOIN users u ON iq.user_id = u.id
JOIN interactive_objects io ON iq.object_id = io.id
ORDER BY iq.object_id, iq.position;

COMMENT ON VIEW interaction_queue_with_users IS 'Cola de interacciones con información de usuarios y objetos';

-- Vista de estadísticas de interacción por usuario
CREATE OR REPLACE VIEW user_interaction_stats AS
SELECT 
  user_id,
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN success THEN 1 END) as successful_interactions,
  COUNT(CASE WHEN NOT success THEN 1 END) as failed_interactions,
  SUM(xp_granted) as total_xp_from_interactions,
  COUNT(DISTINCT object_id) as unique_objects_interacted,
  MAX(timestamp) as last_interaction
FROM interaction_logs
GROUP BY user_id;

COMMENT ON VIEW user_interaction_stats IS 'Estadísticas de interacciones por usuario';

-- ============================================================================
-- 9. DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================================================

-- Descomentar para insertar datos de ejemplo

/*
-- Ejemplo: Silla en oficina 1
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, created_by)
VALUES (1, 'chair', 'Silla de Oficina', '/models/office_chair.glb', '{"x": 5, "y": 0, "z": 3}', 1);

-- Ejemplo: Nodo de interacción para la silla
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy)
VALUES (1, '{"x": 0, "y": 0.5, "z": 0}', 'sitting', 1);

-- Ejemplo: Trigger de XP para la silla
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority)
VALUES (1, 'grant_xp', '{"amount": 10}', 1);

-- Ejemplo: Puerta en oficina 1
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, state, created_by)
VALUES (1, 'door', 'Puerta Principal', '/models/door.glb', '{"x": 10, "y": 0, "z": 5}', '{"isOpen": false}', 1);

-- Ejemplo: Nodo de interacción para la puerta
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy)
VALUES (2, '{"x": 0, "y": 0, "z": 1}', 'idle', 1);

-- Ejemplo: Trigger de cambio de estado para la puerta
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority)
VALUES (2, 'state_change', '{"property": "isOpen", "value": true}', 1);
*/

-- ============================================================================
-- 10. PERMISOS (OPCIONAL)
-- ============================================================================

-- Descomentar y ajustar según tus necesidades de permisos

/*
-- Permisos para usuario de aplicación
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ecg_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ecg_app_user;

-- Permisos de solo lectura para usuario de reportes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecg_readonly_user;
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'interactive_objects',
      'interaction_nodes',
      'object_triggers',
      'interaction_queue',
      'interaction_logs'
    );
  
  IF table_count = 5 THEN
    RAISE NOTICE 'SUCCESS: Todas las tablas del Sistema de Interacciones Avanzadas fueron creadas correctamente';
  ELSE
    RAISE WARNING 'ADVERTENCIA: Solo % de 5 tablas fueron creadas', table_count;
  END IF;
END $$;

-- Mostrar resumen de tablas creadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'interactive_objects',
    'interaction_nodes',
    'object_triggers',
    'interaction_queue',
    'interaction_logs'
  )
ORDER BY table_name;

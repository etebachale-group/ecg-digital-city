-- ============================================================================
-- ECG Digital City - PostgreSQL Database Setup Script
-- Sistema de Interacciones Avanzadas
-- ============================================================================
-- Este script crea la base de datos completa desde cero
-- Ejecutar como usuario postgres o con privilegios de superusuario
-- ============================================================================

-- Crear la base de datos si no existe
-- Nota: Ejecutar esta parte conectado a la base de datos 'postgres'
-- psql -U postgres -c "CREATE DATABASE ecg_digital_city;"

-- Conectarse a la base de datos
\c ecg_digital_city;

-- ============================================================================
-- TABLAS BASE (Asumiendo que ya existen de FASE 0)
-- ============================================================================
-- Si las tablas base no existen, descomenta y ejecuta estas secciones

/*
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de compañías
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de distritos
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    max_capacity INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de oficinas
CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de avatares
CREATE TABLE IF NOT EXISTS avatars (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    appearance JSONB DEFAULT '{}',
    position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
    rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
    current_office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

-- ============================================================================
-- TABLAS DEL SISTEMA DE INTERACCIONES AVANZADAS
-- ============================================================================

-- Tabla: interactive_objects
-- Almacena objetos interactivos en el mundo virtual
DROP TABLE IF EXISTS interaction_logs CASCADE;
DROP TABLE IF EXISTS interaction_queue CASCADE;
DROP TABLE IF EXISTS object_triggers CASCADE;
DROP TABLE IF EXISTS interaction_nodes CASCADE;
DROP TABLE IF EXISTS interactive_objects CASCADE;

CREATE TABLE interactive_objects (
    id SERIAL PRIMARY KEY,
    office_id INTEGER NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    object_type VARCHAR(50) NOT NULL,
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

-- Índices para interactive_objects
CREATE INDEX idx_interactive_objects_office ON interactive_objects(office_id);
CREATE INDEX idx_interactive_objects_type ON interactive_objects(object_type);
CREATE INDEX idx_interactive_objects_active ON interactive_objects(is_active);

-- Tabla: interaction_nodes
-- Define puntos de interacción en objetos
CREATE TABLE interaction_nodes (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
    position JSONB NOT NULL,
    required_state VARCHAR(50) NOT NULL,
    is_occupied BOOLEAN DEFAULT false,
    occupied_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    occupied_at TIMESTAMP,
    max_occupancy INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para interaction_nodes
CREATE INDEX idx_interaction_nodes_object ON interaction_nodes(object_id);
CREATE INDEX idx_interaction_nodes_occupied ON interaction_nodes(is_occupied);
CREATE INDEX idx_interaction_nodes_occupied_by ON interaction_nodes(occupied_by);

-- Tabla: object_triggers
-- Define triggers/scripts asociados a objetos
CREATE TABLE object_triggers (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_data JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    condition JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para object_triggers
CREATE INDEX idx_object_triggers_object ON object_triggers(object_id);
CREATE INDEX idx_object_triggers_priority ON object_triggers(priority DESC);
CREATE INDEX idx_object_triggers_active ON object_triggers(is_active);

-- Tabla: interaction_queue
-- Gestiona colas de espera para objetos ocupados
CREATE TABLE interaction_queue (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
    node_id INTEGER NOT NULL REFERENCES interaction_nodes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Índices para interaction_queue
CREATE INDEX idx_interaction_queue_object ON interaction_queue(object_id);
CREATE INDEX idx_interaction_queue_node ON interaction_queue(node_id);
CREATE INDEX idx_interaction_queue_user ON interaction_queue(user_id);
CREATE INDEX idx_interaction_queue_expires ON interaction_queue(expires_at);

-- Tabla: interaction_logs
-- Registra historial de interacciones
CREATE TABLE interaction_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    xp_granted INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para interaction_logs
CREATE INDEX idx_interaction_logs_user ON interaction_logs(user_id);
CREATE INDEX idx_interaction_logs_object ON interaction_logs(object_id);
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp DESC);
CREATE INDEX idx_interaction_logs_success ON interaction_logs(success);

-- ============================================================================
-- EXTENSIONES A TABLA AVATARS
-- ============================================================================

-- Agregar columnas de estado a la tabla avatars
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle' NOT NULL;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER REFERENCES interactive_objects(id) ON DELETE SET NULL;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER REFERENCES interaction_nodes(id) ON DELETE SET NULL;

-- Índices para columnas de estado en avatars
CREATE INDEX IF NOT EXISTS idx_avatars_state ON avatars(current_state);
CREATE INDEX IF NOT EXISTS idx_avatars_interacting_with ON avatars(interacting_with);
CREATE INDEX IF NOT EXISTS idx_avatars_sitting_at ON avatars(sitting_at);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
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

-- Función para limpiar colas expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $$
BEGIN
    DELETE FROM interaction_queue WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar objetos interactivos de ejemplo
-- Descomenta si quieres datos de prueba

/*
-- Asumiendo que existe office_id = 1 y user_id = 1
INSERT INTO interactive_objects (office_id, object_type, name, position, created_by) VALUES
(1, 'chair', 'Silla de Oficina 1', '{"x": 5, "y": 0, "z": 5}', 1),
(1, 'chair', 'Silla de Oficina 2', '{"x": 7, "y": 0, "z": 5}', 1),
(1, 'table', 'Mesa de Reuniones', '{"x": 10, "y": 0, "z": 10}', 1),
(1, 'door', 'Puerta Principal', '{"x": 0, "y": 0, "z": 0}', 1);

-- Insertar nodos de interacción para las sillas
INSERT INTO interaction_nodes (object_id, position, required_state) VALUES
(1, '{"x": 0, "y": 0.5, "z": 0}', 'sitting'),
(2, '{"x": 0, "y": 0.5, "z": 0}', 'sitting');

-- Insertar triggers de ejemplo
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority) VALUES
(1, 'grant_xp', '{"amount": 10, "reason": "Sentarse en silla"}', 1),
(1, 'state_change', '{"state": "sitting"}', 2);
*/

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Mostrar resumen de tablas creadas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'interactive_objects',
        'interaction_nodes',
        'object_triggers',
        'interaction_queue',
        'interaction_logs',
        'avatars'
    )
ORDER BY tablename;

-- Mostrar índices creados
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'interactive_objects',
        'interaction_nodes',
        'object_triggers',
        'interaction_queue',
        'interaction_logs',
        'avatars'
    )
ORDER BY tablename, indexname;

-- ============================================================================
-- PERMISOS (OPCIONAL)
-- ============================================================================

-- Otorgar permisos al usuario de la aplicación
-- Descomenta y ajusta según tu configuración

/*
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

\echo '✅ Base de datos configurada correctamente'
\echo '📊 Tablas creadas: interactive_objects, interaction_nodes, object_triggers, interaction_queue, interaction_logs'
\echo '🔧 Columnas agregadas a avatars: current_state, previous_state, state_changed_at, interacting_with, sitting_at'
\echo '📈 Índices creados para optimización de consultas'
\echo '⚡ Triggers configurados para updated_at automático'

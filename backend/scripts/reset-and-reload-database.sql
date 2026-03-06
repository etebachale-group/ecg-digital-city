-- ============================================================================
-- RESET Y RECARGA COMPLETA DE BASE DE DATOS
-- ECG Digital City
-- ============================================================================
-- ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS y recrea el esquema completo
-- ============================================================================

\echo '========================================='
\echo 'INICIANDO RESET DE BASE DE DATOS'
\echo '========================================='
\echo ''

-- ============================================================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- ============================================================================

\echo '1. ELIMINANDO TABLAS EXISTENTES...'

-- Eliminar tablas en orden inverso de dependencias (sin deshabilitar FK checks)
DROP TABLE IF EXISTS interaction_logs CASCADE;
DROP TABLE IF EXISTS interaction_queue CASCADE;
DROP TABLE IF EXISTS object_triggers CASCADE;
DROP TABLE IF EXISTS interaction_nodes CASCADE;
DROP TABLE IF EXISTS interactive_objects CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS user_missions CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS office_objects CASCADE;
DROP TABLE IF EXISTS offices CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS avatars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar vistas
DROP VIEW IF EXISTS interactive_objects_with_node_count CASCADE;
DROP VIEW IF EXISTS interaction_queue_with_users CASCADE;
DROP VIEW IF EXISTS user_interaction_stats CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_queue_entries() CASCADE;
DROP FUNCTION IF EXISTS update_queue_positions() CASCADE;

\echo '✓ Tablas eliminadas'
\echo ''

-- ============================================================================
-- PASO 2: CREAR TABLAS BASE
-- ============================================================================

\echo '2. CREANDO TABLAS BASE...'

-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_id INTEGER,
  role VARCHAR(50) DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  avatar_id INTEGER,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AVATARS TABLE
CREATE TABLE avatars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skin_color VARCHAR(20) DEFAULT '#fdbcb4',
  hair_style VARCHAR(50) DEFAULT 'short',
  hair_color VARCHAR(20) DEFAULT '#000000',
  shirt_color VARCHAR(20) DEFAULT '#3498db',
  pants_color VARCHAR(20) DEFAULT '#2c3e50',
  accessories JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMPANIES TABLE
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DISTRICTS TABLE
CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  map_data JSONB,
  max_capacity INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OFFICES TABLE
CREATE TABLE offices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  floor_plan JSONB,
  max_capacity INTEGER DEFAULT 20,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OFFICE_OBJECTS TABLE
CREATE TABLE office_objects (
  id SERIAL PRIMARY KEY,
  office_id INTEGER NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  object_type VARCHAR(50) NOT NULL,
  position JSONB NOT NULL,
  rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
  scale JSONB DEFAULT '{"x": 1, "y": 1, "z": 1}',
  color VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  office_id INTEGER NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, office_id)
);

-- USER_PROGRESS TABLE
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_daily_login DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACHIEVEMENTS TABLE
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  xp_reward INTEGER DEFAULT 0,
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER_ACHIEVEMENTS TABLE
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- MISSIONS TABLE
CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  mission_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  is_daily BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER_MISSIONS TABLE
CREATE TABLE user_missions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(user_id, mission_id, assigned_at)
);

-- EVENTS TABLE
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  organizer_id INTEGER NOT NULL REFERENCES users(id),
  office_id INTEGER REFERENCES offices(id),
  district_id INTEGER REFERENCES districts(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENT_ATTENDEES TABLE
CREATE TABLE event_attendees (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'confirmed',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

\echo '✓ Tablas base creadas'
\echo ''

-- ============================================================================
-- PASO 3: CREAR ÍNDICES
-- ============================================================================

\echo '3. CREANDO ÍNDICES...'

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_company ON users(company_id);

-- Avatars
CREATE INDEX idx_avatars_user ON avatars(user_id);

-- Companies
CREATE INDEX idx_companies_owner ON companies(owner_id);

-- Districts
CREATE INDEX idx_districts_slug ON districts(slug);
CREATE INDEX idx_districts_active ON districts(is_active);

-- Offices
CREATE INDEX idx_offices_company ON offices(company_id);
CREATE INDEX idx_offices_district ON offices(district_id);

-- Office Objects
CREATE INDEX idx_office_objects_office ON office_objects(office_id);
CREATE INDEX idx_office_objects_created_by ON office_objects(created_by);

-- Permissions
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_office ON permissions(office_id);

-- User Progress
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_level ON user_progress(level);

-- Achievements
CREATE INDEX idx_achievements_active ON achievements(is_active);

-- User Achievements
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- Missions
CREATE INDEX idx_missions_active ON missions(is_active);
CREATE INDEX idx_missions_daily ON missions(is_daily);

-- User Missions
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_mission ON user_missions(mission_id);
CREATE INDEX idx_user_missions_status ON user_missions(status);

-- Events
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_office ON events(office_id);
CREATE INDEX idx_events_district ON events(district_id);
CREATE INDEX idx_events_start_time ON events(start_time);

-- Event Attendees
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);

\echo '✓ Índices creados'
\echo ''

-- ============================================================================
-- PASO 4: SEED DE DATOS INICIALES
-- ============================================================================

\echo '4. INSERTANDO DATOS INICIALES...'

-- Distritos
INSERT INTO districts (name, slug, description, max_capacity, is_active) VALUES
('Recepción', 'recepcion', 'Área de bienvenida y registro', 100, true),
('Zona Corporativa', 'corporativa', 'Oficinas de empresas', 50, true),
('Centro de Eventos', 'eventos', 'Espacio para conferencias y eventos', 200, true),
('Zona Social', 'social', 'Área de descanso y networking', 75, true);

-- Logros
INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value, is_active) VALUES
('Primer Paso', 'Completa tu primer login', '🎯', 10, 'login', 1, true),
('Explorador', 'Visita 3 distritos diferentes', '🗺️', 25, 'districts_visited', 3, true),
('Social', 'Chatea con 5 usuarios diferentes', '💬', 30, 'chats_sent', 5, true),
('Constructor', 'Crea tu primera oficina', '🏢', 50, 'offices_created', 1, true),
('Empresario', 'Crea una empresa', '💼', 100, 'companies_created', 1, true),
('Veterano', 'Alcanza nivel 10', '⭐', 200, 'level', 10, true),
('Maestro', 'Alcanza nivel 25', '🏆', 500, 'level', 25, true),
('Leyenda', 'Alcanza nivel 50', '👑', 1000, 'level', 50, true);

-- Misiones Diarias
INSERT INTO missions (name, description, mission_type, target_value, xp_reward, is_daily, is_active) VALUES
('Login Diario', 'Inicia sesión hoy', 'daily_login', 1, 10, true, true),
('Explorador Diario', 'Visita 2 distritos', 'visit_districts', 2, 15, true, true),
('Socializar', 'Envía 5 mensajes de chat', 'send_messages', 5, 20, true, true),
('Trabajador', 'Pasa 30 minutos en una oficina', 'time_in_office', 30, 25, true, true);

-- Misiones Semanales
INSERT INTO missions (name, description, mission_type, target_value, xp_reward, is_daily, is_active) VALUES
('Networker', 'Conoce a 10 usuarios nuevos', 'meet_users', 10, 50, false, true),
('Organizador', 'Crea un evento', 'create_event', 1, 75, false, true),
('Decorador', 'Agrega 10 objetos a una oficina', 'add_objects', 10, 60, false, true);

\echo '✓ Datos iniciales insertados'
\echo ''

-- ============================================================================
-- PASO 5: CREAR TRIGGERS Y FUNCIONES
-- ============================================================================

\echo '5. CREANDO TRIGGERS Y FUNCIONES...'

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $BODY$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatars_updated_at BEFORE UPDATE ON avatars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON offices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_office_objects_updated_at BEFORE UPDATE ON office_objects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '✓ Triggers y funciones creados'
\echo ''

-- ============================================================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================================================

\echo '6. VERIFICACIÓN FINAL'
\echo '-----------------------------------------'

-- Contar tablas
SELECT COUNT(*) as total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Listar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '========================================='
\echo '✓ BASE DE DATOS RECARGADA EXITOSAMENTE'
\echo '========================================='
\echo ''
\echo 'Tablas creadas: 18'
\echo 'Distritos: 4'
\echo 'Logros: 8'
\echo 'Misiones: 7'
\echo ''
\echo 'La base de datos está lista para usar.'
\echo ''

-- ============================================================================
-- SISTEMA DE INTERACCIONES AVANZADAS
-- ============================================================================

\echo '2b. CREANDO TABLAS DEL SISTEMA DE INTERACCIONES...'

-- INTERACTIVE OBJECTS TABLE
CREATE TABLE interactive_objects (
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

-- INTERACTION NODES TABLE
CREATE TABLE interaction_nodes (
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

-- OBJECT TRIGGERS TABLE
CREATE TABLE object_triggers (
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

-- INTERACTION QUEUE TABLE
CREATE TABLE interaction_queue (
  id SERIAL PRIMARY KEY,
  object_id INTEGER NOT NULL REFERENCES interactive_objects(id) ON DELETE CASCADE,
  node_id INTEGER NOT NULL REFERENCES interaction_nodes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- INTERACTION LOGS TABLE
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

-- AVATAR STATE EXTENSIONS
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) DEFAULT 'idle';
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS previous_state VARCHAR(50);
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMP;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS interacting_with INTEGER REFERENCES interactive_objects(id) ON DELETE SET NULL;
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS sitting_at INTEGER REFERENCES interaction_nodes(id) ON DELETE SET NULL;

\echo '✓ Tablas del sistema de interacciones creadas'
\echo ''

-- Índices para Sistema de Interacciones
CREATE INDEX idx_interactive_objects_office ON interactive_objects(office_id);
CREATE INDEX idx_interactive_objects_type ON interactive_objects(object_type);
CREATE INDEX idx_interactive_objects_active ON interactive_objects(is_active);
CREATE INDEX idx_interactive_objects_created_by ON interactive_objects(created_by);

CREATE INDEX idx_interaction_nodes_object ON interaction_nodes(object_id);
CREATE INDEX idx_interaction_nodes_occupied ON interaction_nodes(is_occupied);
CREATE INDEX idx_interaction_nodes_occupied_by ON interaction_nodes(occupied_by);

CREATE INDEX idx_object_triggers_object ON object_triggers(object_id);
CREATE INDEX idx_object_triggers_priority ON object_triggers(priority DESC);
CREATE INDEX idx_object_triggers_active ON object_triggers(is_active);
CREATE INDEX idx_object_triggers_type ON object_triggers(trigger_type);

CREATE INDEX idx_interaction_queue_object ON interaction_queue(object_id);
CREATE INDEX idx_interaction_queue_node ON interaction_queue(node_id);
CREATE INDEX idx_interaction_queue_user ON interaction_queue(user_id);
CREATE INDEX idx_interaction_queue_expires ON interaction_queue(expires_at);
CREATE INDEX idx_interaction_queue_position ON interaction_queue(object_id, position);
CREATE UNIQUE INDEX idx_interaction_queue_unique_user_object ON interaction_queue(object_id, user_id);

CREATE INDEX idx_interaction_logs_user ON interaction_logs(user_id);
CREATE INDEX idx_interaction_logs_object ON interaction_logs(object_id);
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp DESC);
CREATE INDEX idx_interaction_logs_success ON interaction_logs(success);
CREATE INDEX idx_interaction_logs_type ON interaction_logs(interaction_type);
CREATE INDEX idx_interaction_logs_user_timestamp ON interaction_logs(user_id, timestamp DESC);

CREATE INDEX idx_avatars_state ON avatars(current_state);
CREATE INDEX idx_avatars_interacting_with ON avatars(interacting_with);
CREATE INDEX idx_avatars_sitting_at ON avatars(sitting_at);


-- Triggers para Sistema de Interacciones
CREATE TRIGGER update_interactive_objects_updated_at
  BEFORE UPDATE ON interactive_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interaction_nodes_updated_at
  BEFORE UPDATE ON interaction_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_object_triggers_updated_at
  BEFORE UPDATE ON object_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar posiciones en la cola
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $BODY$ BEGIN
  UPDATE interaction_queue
  SET position = position - 1
  WHERE object_id = OLD.object_id 
    AND position > OLD.position;
  RETURN OLD;
END; $BODY$ LANGUAGE plpgsql;

CREATE TRIGGER update_queue_positions_on_delete
  AFTER DELETE ON interaction_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_positions();

-- Función para limpiar colas expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $BODY$ BEGIN
  DELETE FROM interaction_queue WHERE expires_at < CURRENT_TIMESTAMP;
END; $BODY$ LANGUAGE plpgsql;


-- Vistas para Sistema de Interacciones
CREATE OR REPLACE VIEW interactive_objects_with_node_count AS
SELECT 
  io.*,
  COUNT(in2.id) as node_count,
  COUNT(CASE WHEN in2.is_occupied THEN 1 END) as occupied_nodes
FROM interactive_objects io
LEFT JOIN interaction_nodes in2 ON io.id = in2.object_id
GROUP BY io.id;

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

\echo '✓ Vistas del sistema de interacciones creadas'
\echo ''

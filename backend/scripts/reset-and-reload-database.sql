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
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

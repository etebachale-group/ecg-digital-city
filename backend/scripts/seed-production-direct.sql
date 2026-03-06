-- Script para insertar datos de seed directamente en producción
-- Ejecutar con: psql -h HOST -p PORT -U USER -d DATABASE -f seed-production-direct.sql

-- Distritos
INSERT INTO districts (name, slug, description, max_capacity, is_active, created_at, updated_at) VALUES
('Recepción', 'recepcion', 'Área de bienvenida y registro', 100, true, NOW(), NOW()),
('Zona Corporativa', 'corporativa', 'Oficinas de empresas', 50, true, NOW(), NOW()),
('Zona Social', 'social', 'Área de eventos y networking', 200, true, NOW(), NOW()),
('Zona Comercial', 'comercial', 'Tiendas y servicios', 150, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Logros
INSERT INTO achievements (name, description, icon, xp_reward, condition_type, condition_value, is_active, created_at, updated_at) VALUES
('Primera Visita', 'Visitaste ECG Digital City por primera vez', '🎉', 50, 'login_count', 1, true, NOW(), NOW()),
('Explorador', 'Visitaste los 4 distritos', '🗺️', 100, 'districts_visited', 4, true, NOW(), NOW()),
('Social', 'Enviaste 10 mensajes en el chat', '💬', 75, 'messages_sent', 10, true, NOW(), NOW()),
('Asistente', 'Asististe a 5 eventos', '🎪', 150, 'events_attended', 5, true, NOW(), NOW()),
('Racha de Fuego', 'Mantén una racha de 7 días', '🔥', 200, 'streak_days', 7, true, NOW(), NOW()),
('Nivel 10', 'Alcanza el nivel 10', '⭐', 500, 'level', 10, true, NOW(), NOW()),
('Maestro', 'Alcanza el nivel 50', '👑', 2000, 'level', 50, true, NOW(), NOW()),
('Leyenda', 'Alcanza el nivel 100', '🏆', 5000, 'level', 100, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Misiones
INSERT INTO missions (name, description, type, xp_reward, requirements, is_active, created_at, updated_at) VALUES
('Bienvenida', 'Completa tu primer login', 'daily', 10, '{"action":"login","count":1}', true, NOW(), NOW()),
('Explorador Diario', 'Visita 2 distritos diferentes', 'daily', 20, '{"action":"visit_districts","count":2}', true, NOW(), NOW()),
('Comunicador', 'Envía 5 mensajes en el chat', 'daily', 15, '{"action":"send_messages","count":5}', true, NOW(), NOW()),
('Networker', 'Conoce a 3 personas diferentes', 'weekly', 50, '{"action":"meet_users","count":3}', true, NOW(), NOW()),
('Asistente Activo', 'Asiste a 2 eventos', 'weekly', 75, '{"action":"attend_events","count":2}', true, NOW(), NOW()),
('Maratonista', 'Mantén una racha de 7 días', 'weekly', 100, '{"action":"maintain_streak","days":7}', true, NOW(), NOW()),
('Maestro del Metaverso', 'Alcanza el nivel 5', 'weekly', 200, '{"action":"reach_level","level":5}', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verificar resultados
SELECT 'Distritos insertados:' as info, COUNT(*) as count FROM districts;
SELECT 'Logros insertados:' as info, COUNT(*) as count FROM achievements;
SELECT 'Misiones insertadas:' as info, COUNT(*) as count FROM missions;

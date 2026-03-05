-- ============================================================================
-- ECG Digital City - Reset Database Script
-- ============================================================================
-- Este script elimina y recrea todas las tablas del sistema de interacciones
-- ADVERTENCIA: Esto eliminará TODOS los datos
-- ============================================================================

\c ecg_digital_city;

-- Eliminar tablas en orden inverso (respetando foreign keys)
DROP TABLE IF EXISTS interaction_logs CASCADE;
DROP TABLE IF EXISTS interaction_queue CASCADE;
DROP TABLE IF EXISTS object_triggers CASCADE;
DROP TABLE IF EXISTS interaction_nodes CASCADE;
DROP TABLE IF EXISTS interactive_objects CASCADE;

-- Eliminar columnas agregadas a avatars
ALTER TABLE avatars DROP COLUMN IF EXISTS sitting_at;
ALTER TABLE avatars DROP COLUMN IF EXISTS interacting_with;
ALTER TABLE avatars DROP COLUMN IF EXISTS state_changed_at;
ALTER TABLE avatars DROP COLUMN IF EXISTS previous_state;
ALTER TABLE avatars DROP COLUMN IF EXISTS current_state;

-- Eliminar índices de avatars
DROP INDEX IF EXISTS idx_avatars_sitting_at;
DROP INDEX IF EXISTS idx_avatars_interacting_with;
DROP INDEX IF EXISTS idx_avatars_state;

\echo '🗑️  Tablas del sistema de interacciones eliminadas'
\echo '📝 Ahora puedes ejecutar setup-database.sql para recrear las tablas'

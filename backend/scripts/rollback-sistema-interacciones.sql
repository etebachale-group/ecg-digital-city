-- ============================================================================
-- Sistema de Interacciones Avanzadas - Rollback Script
-- ECG Digital City
-- ============================================================================
-- 
-- Este script elimina todas las tablas y modificaciones del Sistema de
-- Interacciones Avanzadas, revirtiendo la base de datos al estado anterior.
--
-- ADVERTENCIA: Este script eliminará TODOS los datos del sistema de
-- interacciones. Asegúrate de hacer un backup antes de ejecutar.
--
-- Uso:
--   psql -h <host> -U <user> -d <database> -f rollback-sistema-interacciones.sql
--
-- Fecha: 2026-03-04
-- Versión: 1.0.0
-- ============================================================================

-- Confirmar antes de proceder
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'ADVERTENCIA: Este script eliminará todas las tablas y datos del';
  RAISE NOTICE 'Sistema de Interacciones Avanzadas.';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...';
  RAISE NOTICE '';
  
  PERFORM pg_sleep(5);
  
  RAISE NOTICE 'Iniciando rollback...';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. ELIMINAR VISTAS
-- ============================================================================

DROP VIEW IF EXISTS user_interaction_stats CASCADE;
DROP VIEW IF EXISTS interaction_queue_with_users CASCADE;
DROP VIEW IF EXISTS interactive_objects_with_node_count CASCADE;

RAISE NOTICE '✓ Vistas eliminadas';

-- ============================================================================
-- 2. ELIMINAR TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_queue_positions_on_delete ON interaction_queue;
DROP TRIGGER IF EXISTS update_object_triggers_updated_at ON object_triggers;
DROP TRIGGER IF EXISTS update_interaction_nodes_updated_at ON interaction_nodes;
DROP TRIGGER IF EXISTS update_interactive_objects_updated_at ON interactive_objects;

RAISE NOTICE '✓ Triggers eliminados';

-- ============================================================================
-- 3. ELIMINAR FUNCIONES
-- ============================================================================

DROP FUNCTION IF EXISTS update_queue_positions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_queue_entries() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

RAISE NOTICE '✓ Funciones eliminadas';

-- ============================================================================
-- 4. ELIMINAR TABLAS (en orden inverso de dependencias)
-- ============================================================================

-- Eliminar logs primero (no tiene dependencias)
DROP TABLE IF EXISTS interaction_logs CASCADE;
RAISE NOTICE '✓ Tabla interaction_logs eliminada';

-- Eliminar cola
DROP TABLE IF EXISTS interaction_queue CASCADE;
RAISE NOTICE '✓ Tabla interaction_queue eliminada';

-- Eliminar triggers de objetos
DROP TABLE IF EXISTS object_triggers CASCADE;
RAISE NOTICE '✓ Tabla object_triggers eliminada';

-- Eliminar nodos de interacción
DROP TABLE IF EXISTS interaction_nodes CASCADE;
RAISE NOTICE '✓ Tabla interaction_nodes eliminada';

-- Eliminar objetos interactivos
DROP TABLE IF EXISTS interactive_objects CASCADE;
RAISE NOTICE '✓ Tabla interactive_objects eliminada';

-- ============================================================================
-- 5. ELIMINAR COLUMNAS DE AVATARS
-- ============================================================================

-- Eliminar columnas agregadas a la tabla avatars
DO $$ 
BEGIN
  -- sitting_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'sitting_at'
  ) THEN
    ALTER TABLE avatars DROP COLUMN sitting_at;
    RAISE NOTICE '✓ Columna avatars.sitting_at eliminada';
  END IF;

  -- interacting_with
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'interacting_with'
  ) THEN
    ALTER TABLE avatars DROP COLUMN interacting_with;
    RAISE NOTICE '✓ Columna avatars.interacting_with eliminada';
  END IF;

  -- state_changed_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'state_changed_at'
  ) THEN
    ALTER TABLE avatars DROP COLUMN state_changed_at;
    RAISE NOTICE '✓ Columna avatars.state_changed_at eliminada';
  END IF;

  -- previous_state
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'previous_state'
  ) THEN
    ALTER TABLE avatars DROP COLUMN previous_state;
    RAISE NOTICE '✓ Columna avatars.previous_state eliminada';
  END IF;

  -- current_state
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'avatars' AND column_name = 'current_state'
  ) THEN
    ALTER TABLE avatars DROP COLUMN current_state;
    RAISE NOTICE '✓ Columna avatars.current_state eliminada';
  END IF;
END $$;

-- ============================================================================
-- 6. ELIMINAR ÍNDICES HUÉRFANOS (si existen)
-- ============================================================================

DROP INDEX IF EXISTS idx_avatars_sitting_at;
DROP INDEX IF EXISTS idx_avatars_interacting_with;
DROP INDEX IF EXISTS idx_avatars_state;

RAISE NOTICE '✓ Índices de avatars eliminados';

-- ============================================================================
-- 7. VERIFICACIÓN FINAL
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  column_count INTEGER;
BEGIN
  -- Verificar que las tablas fueron eliminadas
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
  
  -- Verificar que las columnas de avatars fueron eliminadas
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'avatars'
    AND column_name IN (
      'current_state',
      'previous_state',
      'state_changed_at',
      'interacting_with',
      'sitting_at'
    );
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  
  IF table_count = 0 AND column_count = 0 THEN
    RAISE NOTICE 'SUCCESS: Rollback completado exitosamente';
    RAISE NOTICE 'Todas las tablas y columnas del Sistema de Interacciones Avanzadas';
    RAISE NOTICE 'fueron eliminadas correctamente.';
  ELSE
    RAISE WARNING 'ADVERTENCIA: Rollback incompleto';
    IF table_count > 0 THEN
      RAISE WARNING '  - % tablas aún existen', table_count;
    END IF;
    IF column_count > 0 THEN
      RAISE WARNING '  - % columnas de avatars aún existen', column_count;
    END IF;
  END IF;
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIN DEL ROLLBACK
-- ============================================================================

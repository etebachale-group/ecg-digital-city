-- ============================================================================
-- Script de Verificación de Base de Datos
-- ECG Digital City
-- ============================================================================
-- Este script verifica que todas las tablas necesarias existan y estén
-- correctamente configuradas.
-- ============================================================================

\echo '========================================='
\echo 'VERIFICACIÓN DE BASE DE DATOS'
\echo '========================================='
\echo ''

-- 1. Verificar tablas base del sistema
\echo '1. TABLAS BASE DEL SISTEMA'
\echo '-----------------------------------------'
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✓ users' 
    ELSE '✗ users (FALTA)' 
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'avatars') 
    THEN '✓ avatars' 
    ELSE '✗ avatars (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
    THEN '✓ companies' 
    ELSE '✗ companies (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offices') 
    THEN '✓ offices' 
    ELSE '✗ offices (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'districts') 
    THEN '✓ districts' 
    ELSE '✗ districts (FALTA)' 
  END;

\echo ''

-- 2. Verificar tablas del Sistema de Interacciones
\echo '2. SISTEMA DE INTERACCIONES AVANZADAS'
\echo '-----------------------------------------'
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interactive_objects') 
    THEN '✓ interactive_objects' 
    ELSE '✗ interactive_objects (FALTA)' 
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interaction_nodes') 
    THEN '✓ interaction_nodes' 
    ELSE '✗ interaction_nodes (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'object_triggers') 
    THEN '✓ object_triggers' 
    ELSE '✗ object_triggers (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interaction_queue') 
    THEN '✓ interaction_queue' 
    ELSE '✗ interaction_queue (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interaction_logs') 
    THEN '✓ interaction_logs' 
    ELSE '✗ interaction_logs (FALTA)' 
  END;

\echo ''

-- 3. Verificar columnas de estado en avatars
\echo '3. EXTENSIONES DE AVATAR'
\echo '-----------------------------------------'
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'avatars' AND column_name = 'current_state'
    ) 
    THEN '✓ avatars.current_state' 
    ELSE '✗ avatars.current_state (FALTA)' 
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'avatars' AND column_name = 'previous_state'
    ) 
    THEN '✓ avatars.previous_state' 
    ELSE '✗ avatars.previous_state (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'avatars' AND column_name = 'state_changed_at'
    ) 
    THEN '✓ avatars.state_changed_at' 
    ELSE '✗ avatars.state_changed_at (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'avatars' AND column_name = 'interacting_with'
    ) 
    THEN '✓ avatars.interacting_with' 
    ELSE '✗ avatars.interacting_with (FALTA)' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'avatars' AND column_name = 'sitting_at'
    ) 
    THEN '✓ avatars.sitting_at' 
    ELSE '✗ avatars.sitting_at (FALTA)' 
  END;

\echo ''

-- 4. Contar registros en tablas principales
\echo '4. CONTEO DE REGISTROS'
\echo '-----------------------------------------'
SELECT 
  'users' as tabla,
  COUNT(*) as registros
FROM users
UNION ALL
SELECT 'avatars', COUNT(*) FROM avatars
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'offices', COUNT(*) FROM offices
UNION ALL
SELECT 'districts', COUNT(*) FROM districts
UNION ALL
SELECT 'interactive_objects', COUNT(*) FROM interactive_objects
UNION ALL
SELECT 'interaction_nodes', COUNT(*) FROM interaction_nodes
UNION ALL
SELECT 'object_triggers', COUNT(*) FROM object_triggers
UNION ALL
SELECT 'interaction_queue', COUNT(*) FROM interaction_queue
UNION ALL
SELECT 'interaction_logs', COUNT(*) FROM interaction_logs
ORDER BY tabla;

\echo ''

-- 5. Verificar índices importantes
\echo '5. ÍNDICES PRINCIPALES'
\echo '-----------------------------------------'
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%interact%'
    OR tablename = 'avatars'
  )
ORDER BY tablename, indexname;

\echo ''

-- 6. Verificar triggers
\echo '6. TRIGGERS ACTIVOS'
\echo '-----------------------------------------'
SELECT 
  trigger_name,
  event_object_table as tabla,
  action_timing as timing,
  event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'interactive_objects',
    'interaction_nodes',
    'object_triggers',
    'interaction_queue'
  )
ORDER BY event_object_table, trigger_name;

\echo ''

-- 7. Verificar vistas
\echo '7. VISTAS CREADAS'
\echo '-----------------------------------------'
SELECT 
  table_name as vista
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%interact%'
ORDER BY table_name;

\echo ''

-- 8. Resumen final
\echo '8. RESUMEN FINAL'
\echo '-----------------------------------------'
DO $
DECLARE
  base_tables INTEGER;
  interaction_tables INTEGER;
  avatar_columns INTEGER;
  total_records INTEGER;
BEGIN
  -- Contar tablas base
  SELECT COUNT(*) INTO base_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users', 'avatars', 'companies', 'offices', 'districts');
  
  -- Contar tablas de interacciones
  SELECT COUNT(*) INTO interaction_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'interactive_objects',
      'interaction_nodes',
      'object_triggers',
      'interaction_queue',
      'interaction_logs'
    );
  
  -- Contar columnas de avatar
  SELECT COUNT(*) INTO avatar_columns
  FROM information_schema.columns
  WHERE table_name = 'avatars'
    AND column_name IN (
      'current_state',
      'previous_state',
      'state_changed_at',
      'interacting_with',
      'sitting_at'
    );
  
  -- Contar registros totales
  SELECT 
    (SELECT COUNT(*) FROM users) +
    (SELECT COUNT(*) FROM avatars) +
    (SELECT COUNT(*) FROM companies) +
    (SELECT COUNT(*) FROM offices) +
    (SELECT COUNT(*) FROM districts)
  INTO total_records;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE VERIFICACIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tablas base: % de 5', base_tables;
  RAISE NOTICE 'Tablas de interacciones: % de 5', interaction_tables;
  RAISE NOTICE 'Columnas de avatar: % de 5', avatar_columns;
  RAISE NOTICE 'Registros totales: %', total_records;
  RAISE NOTICE '';
  
  IF base_tables = 5 AND interaction_tables = 5 AND avatar_columns = 5 THEN
    RAISE NOTICE '✓ BASE DE DATOS COMPLETAMENTE CONFIGURADA';
  ELSIF base_tables = 5 AND interaction_tables = 0 THEN
    RAISE NOTICE '⚠ TABLAS BASE OK - FALTA SISTEMA DE INTERACCIONES';
    RAISE NOTICE '  Ejecuta: backend/scripts/sistema-interacciones-avanzadas-schema.sql';
  ELSIF base_tables < 5 THEN
    RAISE NOTICE '✗ FALTAN TABLAS BASE - EJECUTA MIGRACIONES PRINCIPALES';
  ELSE
    RAISE NOTICE '⚠ CONFIGURACIÓN PARCIAL - REVISA DETALLES ARRIBA';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $;

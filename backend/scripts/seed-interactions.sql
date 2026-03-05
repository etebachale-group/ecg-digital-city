-- ============================================================================
-- ECG Digital City - Seed Data for Interactions System
-- ============================================================================
-- Este script inserta datos de prueba para el sistema de interacciones
-- Asume que existen: office_id=1, user_id=1
-- ============================================================================

\c ecg_digital_city;

-- Limpiar datos existentes
TRUNCATE interaction_logs, interaction_queue, object_triggers, interaction_nodes, interactive_objects RESTART IDENTITY CASCADE;

-- ============================================================================
-- OBJETOS INTERACTIVOS
-- ============================================================================

-- Sillas de oficina
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, rotation, scale, config, created_by) VALUES
(1, 'chair', 'Silla Ejecutiva 1', '/models/chair-executive.glb', '{"x": 5, "y": 0, "z": 5}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"comfort": "high", "color": "black"}', 1),
(1, 'chair', 'Silla Ejecutiva 2', '/models/chair-executive.glb', '{"x": 7, "y": 0, "z": 5}', '{"x": 0, "y": 90, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"comfort": "high", "color": "black"}', 1),
(1, 'chair', 'Silla de Reunión 1', '/models/chair-meeting.glb', '{"x": 10, "y": 0, "z": 8}', '{"x": 0, "y": 180, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"comfort": "medium", "color": "blue"}', 1),
(1, 'chair', 'Silla de Reunión 2', '/models/chair-meeting.glb', '{"x": 12, "y": 0, "z": 8}', '{"x": 0, "y": 180, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"comfort": "medium", "color": "blue"}', 1);

-- Mesas
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, rotation, scale, config, created_by) VALUES
(1, 'table', 'Mesa de Reuniones', '/models/table-meeting.glb', '{"x": 11, "y": 0, "z": 10}', '{"x": 0, "y": 0, "z": 0}', '{"x": 2, "y": 1, "z": 1}', '{"seats": 4, "material": "wood"}', 1),
(1, 'table', 'Escritorio Principal', '/models/desk.glb', '{"x": 5, "y": 0, "z": 3}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1.5, "y": 1, "z": 1}', '{"drawers": 3, "material": "wood"}', 1);

-- Puertas
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, rotation, scale, state, config, created_by) VALUES
(1, 'door', 'Puerta Principal', '/models/door.glb', '{"x": 0, "y": 0, "z": 0}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"open": false}', '{"lockable": true, "autoClose": true}', 1),
(1, 'door', 'Puerta Sala de Reuniones', '/models/door.glb', '{"x": 15, "y": 0, "z": 10}', '{"x": 0, "y": 90, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"open": false}', '{"lockable": false, "autoClose": true}', 1);

-- Objetos especiales
INSERT INTO interactive_objects (office_id, object_type, name, model_path, position, rotation, scale, config, created_by) VALUES
(1, 'computer', 'Computadora de Trabajo', '/models/computer.glb', '{"x": 5.5, "y": 0.75, "z": 3}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"type": "desktop", "screen": "on"}', 1),
(1, 'whiteboard', 'Pizarra de Reuniones', '/models/whiteboard.glb', '{"x": 11, "y": 1, "z": 12}', '{"x": 0, "y": 180, "z": 0}', '{"x": 2, "y": 1.5, "z": 0.1}', '{"erasable": true}', 1),
(1, 'coffee_machine', 'Máquina de Café', '/models/coffee-machine.glb', '{"x": 2, "y": 0, "z": 15}', '{"x": 0, "y": 270, "z": 0}', '{"x": 1, "y": 1, "z": 1}', '{"type": "espresso", "cups": 20}', 1);

-- ============================================================================
-- NODOS DE INTERACCIÓN
-- ============================================================================

-- Nodos para sillas (posición de sentado)
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy) VALUES
(1, '{"x": 0, "y": 0.5, "z": 0}', 'sitting', 1),
(2, '{"x": 0, "y": 0.5, "z": 0}', 'sitting', 1),
(3, '{"x": 0, "y": 0.5, "z": 0}', 'sitting', 1),
(4, '{"x": 0, "y": 0.5, "z": 0}', 'sitting', 1);

-- Nodos para puertas (posición de interacción)
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy) VALUES
(7, '{"x": 0, "y": 0, "z": 1}', 'standing', 1),
(8, '{"x": 0, "y": 0, "z": 1}', 'standing', 1);

-- Nodos para computadora
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy) VALUES
(9, '{"x": 0, "y": 0, "z": -0.5}', 'standing', 1);

-- Nodos para pizarra (múltiples posiciones)
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy) VALUES
(10, '{"x": -0.5, "y": 0, "z": -0.5}', 'standing', 1),
(10, '{"x": 0, "y": 0, "z": -0.5}', 'standing', 1),
(10, '{"x": 0.5, "y": 0, "z": -0.5}', 'standing', 1);

-- Nodo para máquina de café
INSERT INTO interaction_nodes (object_id, position, required_state, max_occupancy) VALUES
(11, '{"x": 0, "y": 0, "z": -0.8}', 'standing', 1);

-- ============================================================================
-- TRIGGERS DE OBJETOS
-- ============================================================================

-- Triggers para sillas (otorgar XP al sentarse)
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, is_active) VALUES
(1, 'grant_xp', '{"amount": 10, "reason": "Sentarse en silla ejecutiva"}', 1, true),
(1, 'state_change', '{"state": "sitting"}', 2, true),
(2, 'grant_xp', '{"amount": 10, "reason": "Sentarse en silla ejecutiva"}', 1, true),
(2, 'state_change', '{"state": "sitting"}', 2, true),
(3, 'grant_xp', '{"amount": 5, "reason": "Sentarse en silla de reunión"}', 1, true),
(3, 'state_change', '{"state": "sitting"}', 2, true),
(4, 'grant_xp', '{"amount": 5, "reason": "Sentarse en silla de reunión"}', 1, true),
(4, 'state_change', '{"state": "sitting"}', 2, true);

-- Triggers para puertas (cambiar estado)
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, is_active) VALUES
(7, 'state_change', '{"state": "open", "toggle": true}', 1, true),
(8, 'state_change', '{"state": "open", "toggle": true}', 1, true);

-- Triggers para computadora
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, is_active) VALUES
(9, 'grant_xp', '{"amount": 15, "reason": "Usar computadora"}', 1, true),
(9, 'state_change', '{"state": "interacting"}', 2, true);

-- Triggers para pizarra
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, is_active) VALUES
(10, 'grant_xp', '{"amount": 20, "reason": "Usar pizarra"}', 1, true),
(10, 'state_change', '{"state": "interacting"}', 2, true);

-- Triggers para máquina de café (con condición de tiempo)
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, condition, is_active) VALUES
(11, 'grant_xp', '{"amount": 5, "reason": "Preparar café"}', 1, '{"cooldown": 300}', true),
(11, 'state_change', '{"state": "interacting"}', 2, null, true);

-- Trigger especial: Achievement por primera interacción
INSERT INTO object_triggers (object_id, trigger_type, trigger_data, priority, condition, is_active) VALUES
(1, 'unlock_achievement', '{"achievement": "first_sit", "name": "Primera Sentada", "description": "Te sentaste por primera vez"}', 3, '{"first_time": true}', true);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar objetos creados
SELECT 
    object_type,
    COUNT(*) as count
FROM interactive_objects
GROUP BY object_type
ORDER BY object_type;

-- Contar nodos creados
SELECT 
    io.object_type,
    io.name,
    COUNT(in2.id) as node_count
FROM interactive_objects io
LEFT JOIN interaction_nodes in2 ON io.id = in2.object_id
GROUP BY io.id, io.object_type, io.name
ORDER BY io.object_type, io.name;

-- Contar triggers creados
SELECT 
    trigger_type,
    COUNT(*) as count
FROM object_triggers
GROUP BY trigger_type
ORDER BY trigger_type;

\echo '✅ Datos de prueba insertados correctamente'
\echo '📦 Objetos interactivos: 11'
\echo '📍 Nodos de interacción: 15'
\echo '⚡ Triggers configurados: 17'

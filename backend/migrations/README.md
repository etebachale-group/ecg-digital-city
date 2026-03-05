# Database Migrations - Sistema de Interacciones Avanzadas

This directory contains Sequelize migrations for the Advanced Interactions System (Sistema de Interacciones Avanzadas).

## Migration Files

### 20240101000001-create-interactive-objects.js
Creates the `interactive_objects` table for storing interactive objects in the virtual world.

**Columns:**
- `id` - Primary key
- `office_id` - Foreign key to offices table
- `object_type` - Type of object (chair, door, table, furniture)
- `name` - Display name of the object
- `model_path` - Path to 3D model file
- `position` - JSONB with {x, y, z} coordinates
- `rotation` - JSONB with {x, y, z} rotation
- `scale` - JSONB with {x, y, z} scale
- `state` - JSONB for object state data
- `config` - JSONB for object configuration
- `is_active` - Boolean flag for active objects
- `created_by` - Foreign key to users table
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_interactive_objects_office` on `office_id`
- `idx_interactive_objects_type` on `object_type`
- `idx_interactive_objects_active` on `is_active`

### 20240101000002-create-interaction-nodes.js
Creates the `interaction_nodes` table for defining interaction points on objects.

**Columns:**
- `id` - Primary key
- `object_id` - Foreign key to interactive_objects table
- `position` - JSONB with {x, y, z} coordinates relative to object
- `required_state` - Avatar state required for interaction (sitting, standing, etc.)
- `is_occupied` - Boolean flag for occupancy
- `occupied_by` - Foreign key to users table (nullable)
- `occupied_at` - Timestamp of occupation
- `max_occupancy` - Maximum number of users (default 1)
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_interaction_nodes_object` on `object_id`
- `idx_interaction_nodes_occupied` on `is_occupied`
- `idx_interaction_nodes_occupied_by` on `occupied_by`

### 20240101000003-create-object-triggers.js
Creates the `object_triggers` table for defining object interaction triggers.

**Columns:**
- `id` - Primary key
- `object_id` - Foreign key to interactive_objects table
- `trigger_type` - Type of trigger (state_change, grant_xp, unlock_achievement, teleport)
- `trigger_data` - JSONB with trigger-specific data
- `priority` - Execution priority (higher = first)
- `condition` - JSONB with execution conditions (nullable)
- `is_active` - Boolean flag for active triggers
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_object_triggers_object` on `object_id`
- `idx_object_triggers_priority` on `priority` (DESC)
- `idx_object_triggers_active` on `is_active`

### 20240101000004-create-interaction-queue.js
Creates the `interaction_queue` table for managing queues for occupied objects.

**Columns:**
- `id` - Primary key
- `object_id` - Foreign key to interactive_objects table
- `node_id` - Foreign key to interaction_nodes table
- `user_id` - Foreign key to users table
- `position` - Position in queue
- `joined_at` - Timestamp when user joined queue
- `expires_at` - Timestamp when queue entry expires

**Indexes:**
- `idx_interaction_queue_object` on `object_id`
- `idx_interaction_queue_node` on `node_id`
- `idx_interaction_queue_user` on `user_id`
- `idx_interaction_queue_expires` on `expires_at`

### 20240101000005-create-interaction-logs.js
Creates the `interaction_logs` table for logging all interactions.

**Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `object_id` - Foreign key to interactive_objects table
- `interaction_type` - Type of interaction
- `success` - Boolean flag for success/failure
- `error_message` - Error message if failed (nullable)
- `xp_granted` - XP granted for interaction
- `timestamp` - Timestamp of interaction

**Indexes:**
- `idx_interaction_logs_user` on `user_id`
- `idx_interaction_logs_object` on `object_id`
- `idx_interaction_logs_timestamp` on `timestamp` (DESC)
- `idx_interaction_logs_success` on `success`

### 20240101000006-add-avatar-state-columns.js
Adds new columns to the existing `avatars` table for avatar state management.

**New Columns:**
- `current_state` - Current avatar state (idle, walking, sitting, etc.)
- `previous_state` - Previous avatar state (nullable)
- `state_changed_at` - Timestamp of last state change
- `interacting_with` - Foreign key to interactive_objects table (nullable)
- `sitting_at` - Foreign key to interaction_nodes table (nullable)

**Indexes:**
- `idx_avatars_state` on `current_state`
- `idx_avatars_interacting_with` on `interacting_with`
- `idx_avatars_sitting_at` on `sitting_at`

## Running Migrations

To run all pending migrations:

```bash
npm run migrate
```

This will:
1. Connect to the PostgreSQL database
2. Create the `sequelize_meta` table if it doesn't exist
3. Check which migrations have been executed
4. Run any pending migrations in order
5. Record executed migrations in `sequelize_meta`

## Database Schema Relationships

```
offices (existing)
  ↓ (1:N)
interactive_objects
  ↓ (1:N)
  ├─ interaction_nodes
  │    ↓ (1:N)
  │    └─ interaction_queue
  ├─ object_triggers
  └─ interaction_logs

users (existing)
  ↓ (1:1)
avatars (extended)
  ↓ (references)
  ├─ interaction_nodes (sitting_at)
  └─ interactive_objects (interacting_with)
```

## Performance Considerations

All tables include appropriate indexes for:
- Foreign key lookups
- Common query patterns (office_id, object_type, is_occupied)
- Sorting operations (priority DESC, timestamp DESC)
- Queue expiration cleanup (expires_at)

## Rollback

To rollback migrations, you would need to implement a rollback script or manually run the `down` methods in reverse order.

## Notes

- All JSONB fields have default values to prevent null issues
- Foreign keys use appropriate CASCADE/SET NULL behavior
- Timestamps are automatically managed by Sequelize
- Indexes are optimized for the expected query patterns in the interaction system

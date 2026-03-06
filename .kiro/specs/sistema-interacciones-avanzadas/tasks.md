# Implementation Plan: Sistema de Interacciones Avanzadas

## Overview

This implementation plan transforms ECG Digital City into a complete metaverse platform with interactive objects, avatar states, A* pathfinding navigation, depth sorting, and a comprehensive interaction system. The implementation follows a phased approach starting with backend foundation, then core systems, and finally frontend integration.

**Technology Stack:**
- Backend: Node.js + Express + PostgreSQL + Socket.IO
- Frontend: React 18 + Three.js + React Three Fiber + Zustand
- Language: JavaScript/TypeScript

**Implementation Priority:**
1. High Priority: Database schema, Interactive Objects System, Avatar States System, Interaction System
2. Medium Priority: Pathfinding System, Depth Sorting System
3. Low Priority: Queue System, Admin Configuration

## Tasks

- [ ] 1. Database Schema and Models Setup
  - [x] 1.1 Create database migration for interactive objects tables
    - Create migration file for `interactive_objects` table with columns: id, office_id, object_type, name, model_path, position (JSONB), rotation (JSONB), scale (JSONB), state (JSONB), config (JSONB), is_active, created_by, created_at, updated_at
    - Create migration file for `interaction_nodes` table with columns: id, object_id, position (JSONB), required_state, is_occupied, occupied_by, occupied_at, max_occupancy, created_at, updated_at
    - Create migration file for `object_triggers` table with columns: id, object_id, trigger_type, trigger_data (JSONB), priority, condition (JSONB), is_active, created_at, updated_at
    - Create migration file for `interaction_queue` table with columns: id, object_id, node_id, user_id, position, joined_at, expires_at
    - Create migration file for `interaction_logs` table with columns: id, user_id, object_id, interaction_type, success, error_message, xp_granted, timestamp
    - Create migration to add columns to `avatars` table: current_state, previous_state, state_changed_at, interacting_with, sitting_at
    - Add all necessary indexes for performance optimization
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 5.1, 16.1, 18.5, 19.1_

  - [x] 1.2 Write property test for database schema
    - **Property 2: Object Persistence Round-Trip**
    - **Validates: Requirements 1.3**

  - [x] 1.3 Create Sequelize models for all new tables
    - Create `InteractiveObject` model with associations to Office, User, InteractionNode, ObjectTrigger
    - Create `InteractionNode` model with associations to InteractiveObject, User
    - Create `ObjectTrigger` model with association to InteractiveObject
    - Create `InteractionQueue` model with associations to InteractiveObject, InteractionNode, User
    - Create `InteractionLog` model with associations to User, InteractiveObject
    - Extend `Avatar` model with new state-related fields
    - Define all model validations and default values
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1_

  - [x] 1.4 Write unit tests for model validations
    - Test required field validations
    - Test JSONB field structure validation
    - Test foreign key constraints
    - Test default values
    - _Requirements: 1.1, 1.2_


- [ ] 2. Backend Services - Interactive Objects System
  - [x] 2.1 Implement InteractiveObjectService
    - Create `backend/src/services/InteractiveObjectService.js`
    - Implement CRUD operations: createObject, getObject, getObjectsByOffice, updateObject, deleteObject
    - Implement state management: updateObjectState, getObjectState
    - Implement node management: addInteractionNode, occupyNode, releaseNode, getAvailableNodes
    - Implement trigger management: addTrigger, executeTriggers
    - Implement persistence: saveWorldState, loadWorldState
    - Add validation for all operations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4, 2.5, 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.4, 4.5, 19.1, 19.2, 19.3, 19.4_

  - [x] 2.2 Write property tests for InteractiveObjectService
    - **Property 1: Object Creation Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.6**
    - **Property 4: Multiple Interaction Nodes**
    - **Validates: Requirements 2.1, 2.3**
    - **Property 6: Concurrent Node Occupancy**
    - **Validates: Requirements 2.4**
    - **Property 7: Node Occupancy State**
    - **Validates: Requirements 2.5, 3.4, 3.5**

  - [x] 2.3 Write unit tests for InteractiveObjectService
    - Test object creation with valid and invalid data
    - Test node occupancy and release
    - Test trigger execution order
    - Test error handling for invalid operations
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 2.4 Implement InteractionService
    - Create `backend/src/services/InteractionService.js`
    - Implement interaction processing: processInteraction, validateInteraction, executeInteraction
    - Implement queue management: joinQueue, leaveQueue, processQueue, getQueuePosition
    - Implement proximity validation: checkProximity
    - Implement interaction logging: logInteraction
    - Add permission checks and rate limiting
    - _Requirements: 13.2, 13.3, 13.4, 14.1, 14.2, 14.4, 16.1, 16.2, 16.3, 16.4, 16.5, 18.4, 21.1, 21.2, 21.3, 21.5_

  - [x] 2.5 Write property tests for InteractionService
    - **Property 43: Queue Addition for Occupied Objects**
    - **Validates: Requirements 16.1**
    - **Property 45: FIFO Queue Processing**
    - **Validates: Requirements 16.3**
    - **Property 51: XP Rate Limiting**
    - **Validates: Requirements 18.4**

  - [x] 2.6 Write unit tests for InteractionService
    - Test interaction validation logic
    - Test queue FIFO behavior
    - Test XP rate limiting
    - Test error scenarios (out of range, no permission, occupied)
    - _Requirements: 13.2, 16.1, 18.4, 21.1_

  - [x] 2.7 Implement AvatarStateService
    - Create `backend/src/services/AvatarStateService.js`
    - Implement state management: changeState, validateTransition, getCurrentState
    - Implement synchronization: broadcastStateChange, syncStates
    - Implement persistence: saveState, loadState
    - Define state machine transitions (idle ↔ walking ↔ running, idle → sitting/interacting/dancing → idle)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.3, 7.4_

  - [x] 2.8 Write property tests for AvatarStateService
    - **Property 13: Avatar State Maintenance**
    - **Validates: Requirements 5.1**
    - **Property 15: State Transition Validation**
    - **Validates: Requirements 5.5**
    - **Property 17: State Change Queuing**
    - **Validates: Requirements 6.4**

  - [x] 2.9 Write unit tests for AvatarStateService
    - Test valid state transitions
    - Test invalid transition rejection
    - Test state persistence
    - Test state synchronization
    - _Requirements: 5.1, 5.5, 7.1_


- [ ] 3. Backend API Endpoints
  - [x] 3.1 Create REST API routes for interactive objects
    - Create `backend/src/routes/interactiveObjects.js`
    - Implement POST /api/objects - Create interactive object
    - Implement GET /api/objects/:id - Get object details
    - Implement GET /api/offices/:officeId/objects - Get all objects in office
    - Implement PUT /api/objects/:id - Update object
    - Implement DELETE /api/objects/:id - Delete object
    - Add authentication and authorization middleware
    - Add request validation middleware
    - _Requirements: 1.1, 1.2, 20.1, 20.2, 20.3_

  - [x] 3.2 Create REST API routes for interaction nodes and triggers
    - Create routes for node management: POST /api/objects/:id/nodes, PUT /api/nodes/:id, DELETE /api/nodes/:id
    - Create routes for trigger management: POST /api/objects/:id/triggers, PUT /api/triggers/:id, DELETE /api/triggers/:id
    - Create routes for state management: GET /api/objects/:id/state, PUT /api/objects/:id/state
    - Create routes for queue management: GET /api/objects/:id/queue, POST /api/objects/:id/queue, DELETE /api/queue/:queueId
    - Add validation and error handling
    - _Requirements: 2.1, 3.1, 4.1, 16.1, 16.4_

  - [x] 3.3 Write integration tests for REST API endpoints
    - Test object CRUD operations
    - Test node and trigger management
    - Test authentication and authorization
    - Test error responses
    - _Requirements: 1.1, 2.1, 4.1, 20.2_

  - [x] 3.4 Implement Socket.IO event handlers for interactions
    - Create `backend/src/sockets/interactionHandlers.js`
    - Implement handler for 'interaction:request' event
    - Implement handler for 'interaction:cancel' event
    - Implement handler for 'avatar:state-change' event
    - Implement handler for 'queue:join' and 'queue:leave' events
    - Implement admin handlers for 'object:create', 'object:update', 'object:delete'
    - Add event validation and error handling
    - _Requirements: 1.4, 5.2, 7.1, 13.1, 13.4, 16.1, 16.4_

  - [x] 3.5 Write property tests for Socket.IO synchronization
    - **Property 3: Object State Synchronization**
    - **Validates: Requirements 1.4**
    - **Property 18: State Change Broadcasting**
    - **Validates: Requirements 7.1**
    - **Property 47: Interaction Synchronization**
    - **Validates: Requirements 17.4**

  - [x] 3.6 Write integration tests for Socket.IO events
    - Test interaction request flow
    - Test state change broadcasting
    - Test queue management events
    - Test multi-client synchronization
    - _Requirements: 1.4, 7.1, 16.1_


- [x] 4. Checkpoint - Backend Foundation Complete
  - Ensure all tests pass, verify database migrations work correctly, test API endpoints with Postman or similar tool, ask the user if questions arise.

- [ ] 5. Frontend Core Systems - Pathfinding
  - [x] 5.1 Implement NavigationMesh class
    - Create `frontend/src/systems/NavigationMesh.js`
    - Implement grid-based navigation mesh with 0.5 unit cell size
    - Implement createGrid method to initialize 2D grid
    - Implement markObstacle method to mark cells as non-walkable
    - Implement isWalkable method to check cell walkability
    - Implement getNeighbors method for 8-directional movement
    - Add support for dynamic obstacle updates
    - _Requirements: 8.6, 9.1, 9.2_

  - [x] 5.2 Write property tests for NavigationMesh
    - **Property 23: Navigation Mesh Walkability**
    - **Validates: Requirements 8.6**
    - **Property 24: Obstacle Identification**
    - **Validates: Requirements 9.1**

  - [x] 5.3 Write unit tests for NavigationMesh
    - Test grid creation with various world bounds
    - Test obstacle marking and walkability checks
    - Test neighbor retrieval for edge cells
    - _Requirements: 8.6, 9.1_

  - [x] 5.4 Implement PathfindingEngine class with A* algorithm
    - Create `frontend/src/systems/PathfindingEngine.js`
    - Implement A* algorithm with priority queue (min-heap)
    - Implement heuristic function using Euclidean distance
    - Implement findPath method that returns array of waypoints
    - Add iteration limit (1000) to prevent infinite loops
    - Implement path validation to ensure all waypoints are walkable
    - Add early exit optimization when goal is reached
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 5.5 Write property tests for PathfindingEngine
    - **Property 21: A* Path Validity**
    - **Validates: Requirements 8.1, 8.4**
    - **Property 22: Path Calculation for Valid Destinations**
    - **Validates: Requirements 8.2**
    - **Property 25: Obstacle Avoidance with Minimum Distance**
    - **Validates: Requirements 9.2, 9.4**

  - [x] 5.6 Write unit tests for PathfindingEngine
    - Test path calculation for simple scenarios
    - Test path calculation with obstacles
    - Test unreachable destination handling
    - Test iteration limit enforcement
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 5.7 Implement path simplification and smoothing
    - Implement simplifyPath method to remove redundant waypoints
    - Implement isLineOfSight method using Bresenham's line algorithm
    - Implement smoothPath method using Catmull-Rom spline interpolation
    - Implement catmullRom helper function for curve calculation
    - Add tolerance parameter for simplification (default 0.5)
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 5.8 Write property tests for path smoothing
    - **Property 28: Path Smoothing Validity**
    - **Validates: Requirements 10.1**
    - **Property 29: Path Simplification**
    - **Validates: Requirements 10.2**
    - **Property 30: Smooth Path Continuity**
    - **Validates: Requirements 10.3**

  - [ ] 5.9 Write unit tests for path smoothing
    - Test path simplification with redundant waypoints
    - Test Catmull-Rom spline smoothing
    - Test that smoothed paths remain walkable
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 5.10 Implement dynamic path recalculation
    - Add obstacle change detection in NavigationMesh
    - Implement automatic path recalculation when obstacles appear
    - Add collision detection and path recalculation on collision
    - Implement path following with speed adjustment on curves
    - _Requirements: 9.3, 9.5, 10.4_

  - [ ] 5.11 Write property tests for dynamic pathfinding
    - **Property 26: Dynamic Path Recalculation**
    - **Validates: Requirements 9.3**
    - **Property 27: Collision Response**
    - **Validates: Requirements 9.5**


- [ ] 6. Frontend Core Systems - Depth Sorting
  - [x] 6.1 Implement DepthSorter class
    - Create `frontend/src/systems/DepthSorter.js`
    - Implement calculateZIndex method using formula: zIndex = 1000 - (yPosition * 10)
    - Implement markDirty method to track objects that changed position
    - Implement update method that recalculates z-index only for dirty objects
    - Add z-index caching for static objects
    - Integrate with Three.js renderOrder property
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.4_

  - [x] 6.2 Write property tests for DepthSorter
    - **Property 32: Z-Index Calculation Formula**
    - **Validates: Requirements 11.1, 11.3**
    - **Property 33: Z-Index Recalculation on Position Change**
    - **Validates: Requirements 11.2**
    - **Property 34: Depth-Based Rendering Order**
    - **Validates: Requirements 11.5**
    - **Property 35: Selective Z-Index Recalculation**
    - **Validates: Requirements 12.1**

  - [ ] 6.3 Write unit tests for DepthSorter
    - Test z-index calculation for various Y positions
    - Test dirty flag tracking
    - Test static object caching
    - Test renderOrder updates
    - _Requirements: 11.1, 11.2, 12.1, 12.4_

  - [x] 6.4 Implement SpatialPartitioner class
    - Create `frontend/src/systems/SpatialPartitioner.js`
    - Implement sector-based spatial partitioning with 10-unit sectors
    - Implement getSectorKey method for position-to-sector mapping
    - Implement addObject and updateObject methods
    - Implement getNearbyObjects method for efficient proximity queries
    - Add sector cleanup for empty sectors
    - _Requirements: 12.2, 12.3_

  - [ ] 6.5 Write property tests for SpatialPartitioner
    - **Property 36: Static Object Z-Index Caching**
    - **Validates: Requirements 12.4**

  - [ ] 6.6 Write unit tests for SpatialPartitioner
    - Test sector assignment for various positions
    - Test object updates across sectors
    - Test nearby object queries
    - Test performance with many objects
    - _Requirements: 12.2, 12.3_


- [ ] 7. Frontend Core Systems - Avatar State Management
  - [x] 7.1 Implement AvatarStateManager class
    - Create `frontend/src/systems/AvatarStateManager.js`
    - Define state machine with states: idle, walking, running, sitting, interacting, dancing
    - Implement defineTransitions method with valid transition rules
    - Implement canTransition method to validate state changes
    - Implement transition method with animation interpolation
    - Implement animateTransition method with easing functions (200-500ms duration)
    - Add state history tracking
    - Emit state changes to server via Socket.IO
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 7.2 Write property tests for AvatarStateManager
    - **Property 14: Sitting Position Alignment**
    - **Validates: Requirements 5.4**
    - **Property 16: Transition Cancellation**
    - **Validates: Requirements 6.3**

  - [ ] 7.3 Write unit tests for AvatarStateManager
    - Test all valid state transitions
    - Test invalid transition rejection
    - Test transition animation timing
    - Test transition cancellation
    - Test state history tracking
    - _Requirements: 5.1, 5.5, 6.1, 6.3_

  - [ ] 7.4 Implement state synchronization with Socket.IO
    - Add Socket.IO event listeners for 'avatar:state-changed'
    - Implement state update handler that applies changes within 50ms
    - Implement initial state sync for newly connected clients
    - Add state desync detection and recovery
    - Implement state message validation (avatar ID, state, timestamp, coordinates)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.5 Write property tests for state synchronization
    - **Property 19: State Update Message Completeness**
    - **Validates: Requirements 7.3**
    - **Property 20: Initial State Synchronization**
    - **Validates: Requirements 7.4**

  - [ ] 7.6 Write integration tests for state synchronization
    - Test state change broadcasting to multiple clients
    - Test initial state sync for new clients
    - Test state recovery after network interruption
    - _Requirements: 7.1, 7.2, 7.4, 7.5_


- [ ] 8. Frontend Core Systems - Interaction Handler
  - [x] 8.1 Implement InteractionHandler class
    - Create `frontend/src/systems/InteractionHandler.js`
    - Initialize Three.js Raycaster for click detection
    - Implement handleClick method with raycasting from camera
    - Implement getNormalizedMousePosition helper
    - Implement findInteractiveObject method to identify clicked objects
    - Implement handleKeyPress method for E key interaction
    - Implement findNearbyObject method with 2-unit proximity search
    - Implement initiateInteraction method with range checking
    - Implement executeInteraction method that emits to server
    - Add visual feedback for highlighted objects
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 8.2 Write property tests for InteractionHandler
    - **Property 37: Click Detection**
    - **Validates: Requirements 13.1**
    - **Property 38: Range-Based Interaction Behavior**
    - **Validates: Requirements 13.2, 13.3**
    - **Property 39: Automatic Interaction on Arrival**
    - **Validates: Requirements 13.4**
    - **Property 40: Proximity Search for Key Interaction**
    - **Validates: Requirements 14.1, 14.2**
    - **Property 41: Immediate Key Interaction Execution**
    - **Validates: Requirements 14.4**

  - [ ] 8.3 Write unit tests for InteractionHandler
    - Test raycasting for click detection
    - Test proximity detection for E key
    - Test range validation (within/outside 2 units)
    - Test pathfinding trigger for distant objects
    - Test visual feedback display
    - _Requirements: 13.1, 13.2, 14.1, 15.1_

  - [x] 8.4 Implement interaction feedback and UI indicators
    - Create highlight shader/material for interactive objects
    - Implement proximity indicator UI component
    - Implement object information tooltip (name + action)
    - Implement interaction prompt UI ("Press E to interact")
    - Add cursor change on hover over interactive objects
    - _Requirements: 13.5, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 8.5 Write unit tests for interaction UI
    - Test highlight effect application
    - Test tooltip display with correct information
    - Test proximity indicator updates
    - _Requirements: 13.5, 15.5_

  - [ ] 8.6 Implement interaction error handling
    - Add Socket.IO listener for 'interaction:failed' event
    - Implement error message display for different failure reasons
    - Add automatic retry logic for network errors (up to 3 attempts)
    - Implement queue join prompt for occupied objects
    - Add error logging to console
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [ ] 8.7 Write property tests for error handling
    - **Property 60: Network Error Retry**
    - **Validates: Requirements 21.3**

  - [ ] 8.8 Write unit tests for error handling
    - Test error message display for each error type
    - Test retry logic for network failures
    - Test queue join prompt display
    - _Requirements: 21.1, 21.2, 21.3_


- [ ] 9. Checkpoint - Core Systems Complete
  - Ensure all tests pass, verify pathfinding works correctly, test depth sorting visually, test avatar state transitions, test interaction detection, ask the user if questions arise.

- [ ] 10. Frontend Components - Interactive Objects
  - [ ] 10.1 Create InteractiveObject component
    - Create `frontend/src/components/InteractiveObject.jsx`
    - Implement 3D model loading based on object.modelPath
    - Add hover state management (isHighlighted)
    - Add occupied state management (isOccupied)
    - Implement click handler that calls onInteract callback
    - Implement pointer over/out handlers for highlighting
    - Add highlight effect using emissive material or outline
    - Add occupied indicator (visual badge or color change)
    - Integrate with DepthSorter for proper z-index
    - _Requirements: 1.5, 3.2, 13.1, 13.5, 15.1, 15.2_

  - [ ] 10.2 Write unit tests for InteractiveObject component
    - Test component rendering with various object types
    - Test highlight effect on hover
    - Test occupied indicator display
    - Test click handler invocation
    - _Requirements: 1.5, 13.1, 15.1_

  - [ ] 10.3 Create InteractiveObjectManager
    - Create `frontend/src/systems/InteractiveObjectManager.js`
    - Implement local cache (Map) for interactive objects
    - Implement addObject, updateObject, removeObject methods
    - Add Socket.IO listeners for object events (created, updated, deleted, state-changed)
    - Implement synchronization with server state
    - Add object loading from API on office entry
    - _Requirements: 1.4, 3.2, 20.4_

  - [ ] 10.4 Write property tests for InteractiveObjectManager
    - **Property 58: Hot Configuration Reload**
    - **Validates: Requirements 20.4**

  - [ ] 10.5 Write unit tests for InteractiveObjectManager
    - Test object cache operations
    - Test Socket.IO event handling
    - Test object synchronization
    - _Requirements: 1.4, 3.2_

  - [x] 10.6 Implement trigger execution system
    - Create `frontend/src/systems/TriggerExecutor.js`
    - Implement trigger handlers for: state_change, grant_xp, unlock_achievement, teleport
    - Add trigger priority sorting
    - Implement conditional trigger evaluation
    - Add error handling for failed triggers
    - Integrate with gamification system for XP and achievements
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 18.1, 18.2_

  - [x] 10.7 Write property tests for trigger system
    - **Property 9: Trigger Association**
    - **Validates: Requirements 4.1**
    - **Property 10: Trigger Execution Order**
    - **Validates: Requirements 4.2**
    - **Property 11: Trigger Error Resilience**
    - **Validates: Requirements 4.4**
    - **Property 12: Conditional Trigger Execution**
    - **Validates: Requirements 4.5**

  - [x] 10.8 Write unit tests for trigger execution
    - Test each trigger type (state_change, grant_xp, etc.)
    - Test priority-based execution order
    - Test conditional trigger evaluation
    - Test error handling and continuation
    - _Requirements: 4.1, 4.2, 4.4, 4.5_


- [ ] 11. Frontend Components - Player Updates
  - [x] 11.1 Update Player component for new avatar states
    - Modify `frontend/src/components/Player.jsx`
    - Integrate AvatarStateManager for state management
    - Add animations for new states: sitting, interacting, dancing
    - Implement sitting pose with position alignment to interaction node
    - Add pathfinding support (click-to-move)
    - Implement path following with smooth movement
    - Add collision detection during pathfinding
    - Maintain compatibility with existing WASD movement
    - Cancel pathfinding when manual WASD movement starts
    - Integrate with DepthSorter for proper rendering order
    - _Requirements: 5.1, 5.4, 5.6, 8.2, 10.5, 17.1, 17.2, 17.3, 23.1, 23.4_

  - [ ] 11.2 Write property tests for Player component
    - **Property 31: Movement Speed Consistency**
    - **Validates: Requirements 10.5**
    - **Property 48: Interaction Completion State Reset**
    - **Validates: Requirements 17.5**

  - [ ] 11.3 Write unit tests for Player component
    - Test state transitions with animations
    - Test pathfinding integration
    - Test WASD and pathfinding coexistence
    - Test sitting position alignment
    - _Requirements: 5.1, 8.2, 23.1_

  - [x] 11.2 Update OtherPlayer component for state rendering
    - Modify `frontend/src/components/OtherPlayer.jsx`
    - Add rendering for all avatar states (sitting, interacting, dancing)
    - Implement state-specific animations
    - Add interaction indicators (visual badges for current action)
    - Maintain position interpolation for smooth movement
    - Integrate with DepthSorter
    - _Requirements: 5.1, 7.2, 17.4_

  - [ ] 11.5 Write unit tests for OtherPlayer component
    - Test state rendering for each state type
    - Test animation playback
    - Test interaction indicator display
    - _Requirements: 5.1, 7.2_


- [ ] 12. Frontend Store Extensions
  - [x] 12.1 Extend gameStore with interaction state
    - Modify `frontend/src/store/gameStore.js`
    - Add interactiveObjects Map to store
    - Add avatarStates Map (userId -> state)
    - Add currentPath and isFollowingPath for pathfinding
    - Add highlightedObject and nearbyObjects for interaction
    - Add interactionQueue Map (objectId -> queue)
    - Implement actions: addInteractiveObject, updateObjectState, setAvatarState, setCurrentPath, highlightObject, updateNearbyObjects, joinInteractionQueue
    - Maintain backward compatibility with existing store structure
    - _Requirements: 1.4, 5.1, 8.2, 13.5, 15.1, 16.1, 23.3_

  - [ ] 12.2 Write unit tests for gameStore extensions
    - Test new state properties initialization
    - Test all new actions
    - Test backward compatibility
    - _Requirements: 1.4, 5.1, 23.3_

  - [x] 12.3 Integrate Socket.IO events with store
    - Modify `frontend/src/socket.js` or create new socket handler
    - Add listeners for all interaction-related events
    - Update store on 'object:created', 'object:updated', 'object:deleted', 'object:state-changed'
    - Update store on 'avatar:state-changed'
    - Update store on 'interaction:started', 'interaction:completed', 'interaction:failed'
    - Update store on 'queue:joined', 'queue:updated', 'queue:your-turn'
    - Update store on 'node:occupied', 'node:released'
    - Maintain existing socket event handlers
    - _Requirements: 1.4, 3.2, 5.2, 7.1, 16.1, 16.2, 16.3, 23.4_

  - [ ] 12.4 Write integration tests for Socket.IO store updates
    - Test store updates on each event type
    - Test multi-event scenarios
    - Test event ordering and consistency
    - _Requirements: 1.4, 7.1, 16.1_


- [ ] 13. Integration with Existing Systems
  - [ ] 13.1 Integrate with collision system
    - Modify `frontend/src/systems/CollisionSystem.js` (or equivalent)
    - Add interactive objects as obstacles in collision detection
    - Integrate NavigationMesh with collision system
    - Mark interactive objects in NavigationMesh based on collision data
    - Support dynamic obstacle updates when objects are added/removed
    - Maintain existing collision behavior for WASD movement
    - _Requirements: 8.6, 9.1, 23.5_

  - [ ] 13.2 Write integration tests for collision system
    - Test interactive objects as obstacles
    - Test NavigationMesh updates on object changes
    - Test WASD collision detection still works
    - _Requirements: 9.1, 23.5_

  - [ ] 13.3 Integrate with chat system
    - Modify chat system to support interaction commands
    - Add commands: /sit, /stand, /dance, /interact
    - Display interaction messages in chat (e.g., "User sat on chair")
    - Maintain existing chat functionality
    - _Requirements: 23.2_

  - [ ] 13.4 Write unit tests for chat integration
    - Test each interaction command
    - Test interaction message display
    - Test existing chat features still work
    - _Requirements: 23.2_

  - [ ] 13.5 Integrate with gamification system
    - Connect interaction XP grants to existing gamification system
    - Implement achievement triggers for interactions
    - Add interaction statistics tracking
    - Create achievements: "First Interaction", "Social Butterfly (100 interactions)", "Furniture Tester (sit on 10 different chairs)"
    - Implement XP rate limiting (once per object per 5 minutes)
    - Add first-time interaction bonus XP
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ] 13.6 Write property tests for gamification integration
    - **Property 49: XP Grant on Interaction**
    - **Validates: Requirements 18.1**
    - **Property 50: Gamification Integration**
    - **Validates: Requirements 18.2**
    - **Property 52: Interaction Logging**
    - **Validates: Requirements 18.5**

  - [ ] 13.7 Write unit tests for gamification integration
    - Test XP grant on interaction
    - Test achievement unlocking
    - Test XP rate limiting
    - Test first-time bonus
    - Test interaction statistics
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_


- [ ] 14. Checkpoint - Integration Complete
  - Ensure all tests pass, verify collision system integration, test chat commands, verify gamification XP and achievements work, ask the user if questions arise.

- [ ] 15. Queue System and Advanced Features
  - [x] 15.1 Implement interaction queue UI
    - Create `frontend/src/components/InteractionQueue.jsx`
    - Display queue position when user joins queue
    - Show estimated wait time
    - Add "Leave Queue" button
    - Show queue length for occupied objects
    - Add notification when it's user's turn
    - _Requirements: 16.1, 16.2, 16.4, 16.5_

  - [ ] 15.2 Write unit tests for queue UI
    - Test queue position display
    - Test leave queue functionality
    - Test turn notification
    - _Requirements: 16.1, 16.2, 16.4_

  - [ ] 15.3 Implement queue timeout and cleanup
    - Add 60-second timeout for queue entries
    - Implement automatic removal on timeout
    - Send notification to user on timeout removal
    - Update queue positions after removal
    - Add server-side cleanup job for expired queue entries
    - _Requirements: 16.1, 16.4, 16.5_

  - [ ] 15.4 Write property tests for queue management
    - **Property 44: Queue Position Display**
    - **Validates: Requirements 16.2**
    - **Property 46: Queue Exit**
    - **Validates: Requirements 16.4, 16.5**

  - [ ] 15.5 Write unit tests for queue timeout
    - Test timeout removal after 60 seconds
    - Test position updates after removal
    - Test notification on timeout
    - _Requirements: 16.1, 16.4_

  - [ ] 15.6 Implement animation triggers for interactions
    - Add sitting animation trigger for chair interactions
    - Add door opening animation for door interactions
    - Add dancing animation trigger for dance objects
    - Implement animation synchronization across clients
    - Add exit animations when interaction ends
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 15.7 Write property tests for animation triggers
    - **Property 42: Object Information Display**
    - **Validates: Requirements 15.5**

  - [ ] 15.8 Write unit tests for animation triggers
    - Test sitting animation on chair interaction
    - Test door animation on door interaction
    - Test dancing animation on dance object
    - Test exit animations
    - Test animation synchronization
    - _Requirements: 17.1, 17.2, 17.3, 17.5_


- [ ] 16. Admin Configuration Interface
  - [ ] 16.1 Create admin object editor UI
    - Create `frontend/src/components/admin/ObjectEditor.jsx`
    - Add form for creating new interactive objects
    - Add fields: object type, name, model path, position, rotation, scale
    - Add interface for configuring interaction nodes
    - Add interface for configuring triggers
    - Add permission configuration
    - Implement real-time preview of object placement
    - _Requirements: 20.1, 20.2_

  - [ ] 16.2 Write unit tests for admin UI
    - Test form validation
    - Test object creation
    - Test node configuration
    - Test trigger configuration
    - _Requirements: 20.1, 20.2_

  - [ ] 16.3 Implement object configuration validation
    - Add validation for all object properties
    - Validate node coordinates are within bounds
    - Validate trigger data structure
    - Validate permissions
    - Show validation errors in UI
    - Prevent invalid configurations from being saved
    - _Requirements: 20.3_

  - [ ] 16.4 Write property tests for configuration validation
    - **Property 5: Node Coordinate Validation**
    - **Validates: Requirements 2.2**
    - **Property 56: Object Configuration**
    - **Validates: Requirements 20.2**
    - **Property 57: Configuration Validation**
    - **Validates: Requirements 20.3**

  - [ ] 16.5 Write unit tests for configuration validation
    - Test validation for each property type
    - Test error message display
    - Test invalid configuration rejection
    - _Requirements: 20.3_

  - [ ] 16.6 Implement configuration import/export
    - Add JSON export functionality for object configurations
    - Add JSON import functionality with validation
    - Implement pretty printing for exported JSON
    - Add bulk import for multiple objects
    - Validate imported configurations before applying
    - _Requirements: 20.5_

  - [ ] 16.7 Write property tests for import/export
    - **Property 59: Configuration Serialization Round-Trip**
    - **Validates: Requirements 20.5**

  - [ ] 16.8 Write unit tests for import/export
    - Test JSON export format
    - Test JSON import with valid data
    - Test import validation with invalid data
    - Test bulk import
    - _Requirements: 20.5_

  - [ ] 16.9 Implement hot reload for configuration changes
    - Emit Socket.IO events when admin saves changes
    - Update all connected clients immediately
    - Apply changes without page refresh
    - Show notification to users when objects change
    - _Requirements: 20.4_

  - [ ] 16.10 Write integration tests for hot reload
    - Test configuration changes propagate to all clients
    - Test changes apply without refresh
    - Test notification display
    - _Requirements: 20.4_


- [ ] 17. World State Persistence
  - [ ] 17.1 Implement periodic world state saving
    - Create background job that saves world state every 30 seconds
    - Save all object states to database
    - Save all node occupancy states
    - Add error handling and retry logic
    - Log save operations for monitoring
    - _Requirements: 19.1_

  - [ ] 17.2 Write property tests for world state persistence
    - **Property 53: World State Persistence Round-Trip**
    - **Validates: Requirements 19.2**
    - **Property 54: Audit Log for State Changes**
    - **Validates: Requirements 19.3**
    - **Property 55: Immediate Admin Save**
    - **Validates: Requirements 19.4**

  - [ ] 17.3 Write unit tests for world state saving
    - Test periodic save execution
    - Test save error handling
    - Test retry logic
    - _Requirements: 19.1_

  - [ ] 17.4 Implement world state loading on server start
    - Load all object states from database on server startup
    - Restore node occupancy states
    - Validate loaded state before applying
    - Handle missing or corrupted state data
    - Log loading operations
    - _Requirements: 19.2_

  - [ ] 17.5 Write unit tests for world state loading
    - Test state loading on startup
    - Test state validation
    - Test corrupted data handling
    - _Requirements: 19.2_

  - [ ] 17.6 Implement audit logging for state changes
    - Create audit log entry for every object state change
    - Include: timestamp, object ID, old state, new state, user ID
    - Store audit logs in database
    - Add API endpoint to query audit logs
    - Implement 30-day retention policy
    - _Requirements: 19.3, 19.5_

  - [ ] 17.7 Write property tests for audit logging
    - **Property 61: Error Logging**
    - **Validates: Requirements 21.5**

  - [ ] 17.8 Write unit tests for audit logging
    - Test audit log creation on state change
    - Test audit log query API
    - Test retention policy enforcement
    - _Requirements: 19.3, 19.5_

  - [ ] 17.9 Implement immediate save for admin changes
    - Override periodic save for admin-initiated changes
    - Save immediately when admin modifies object
    - Add confirmation message after save
    - Log admin changes separately
    - _Requirements: 19.4_

  - [ ] 17.10 Write unit tests for immediate admin save
    - Test immediate save on admin change
    - Test confirmation message
    - Test admin change logging
    - _Requirements: 19.4_


- [ ] 18. Checkpoint - Advanced Features Complete
  - Ensure all tests pass, verify queue system works correctly, test admin configuration interface, verify world state persistence, ask the user if questions arise.

- [ ] 19. Performance Optimization
  - [ ] 19.1 Optimize pathfinding performance
    - Implement path caching for common routes
    - Add object pooling for path arrays
    - Optimize A* with better heuristics
    - Add lazy recalculation (only when obstacles change)
    - Profile and optimize hot paths
    - _Requirements: 8.3, 22.2_

  - [ ] 19.2 Write performance tests for pathfinding
    - Test path calculation completes in < 100ms for 50-unit distances
    - Test memory usage stays under 1MB for 100x100 grid
    - Test CPU usage stays under 5%
    - _Requirements: 8.3, 22.2_

  - [ ] 19.3 Optimize depth sorting performance
    - Implement frustum culling (only sort visible objects)
    - Add LOD (Level of Detail) for distant objects
    - Optimize spatial partitioning queries
    - Profile and optimize update loop
    - _Requirements: 11.4, 12.3, 22.4_

  - [ ] 19.4 Write performance tests for depth sorting
    - Test maintains 60 FPS with 200 objects and 50 avatars
    - Test depth sorting takes < 2ms per frame
    - Test memory usage stays under 100KB for spatial grid
    - _Requirements: 12.3, 22.4_

  - [ ] 19.5 Optimize Socket.IO communication
    - Implement event batching for multiple state changes
    - Add delta compression (only send changed properties)
    - Implement rate limiting (20 updates/second per user)
    - Use binary protocol for position data
    - Add room isolation (only broadcast to same office)
    - _Requirements: 7.1, 22.5_

  - [ ] 19.6 Write performance tests for Socket.IO
    - Test state synchronization latency < 100ms
    - Test bandwidth usage ~5KB/s per user
    - Test system supports 100+ concurrent users per office
    - _Requirements: 7.1, 22.5_

  - [ ] 19.7 Optimize database queries
    - Add missing indexes if any
    - Implement connection pooling
    - Add Redis caching for object definitions
    - Use read replicas for queries
    - Optimize batch writes
    - _Requirements: 1.3, 22.5_

  - [ ] 19.8 Write performance tests for database
    - Test object retrieval < 50ms
    - Test state updates < 100ms
    - Test system supports 1000+ objects per office
    - _Requirements: 1.3, 22.5_


- [ ] 20. Testing and Quality Assurance
  - [ ] 20.1 Run all unit tests and fix failures
    - Execute all unit test suites
    - Fix any failing tests
    - Ensure code coverage > 80%
    - _Requirements: 24.1, 24.2, 24.3_

  - [ ] 20.2 Run all property-based tests and fix failures
    - Execute all property test suites with 100+ iterations
    - Fix any failing properties
    - Document any edge cases discovered
    - _Requirements: 24.2, 24.5_

  - [ ] 20.3 Run integration tests
    - Test full interaction flow end-to-end
    - Test multi-user scenarios (2+ users interacting)
    - Test queue management with multiple users
    - Test state synchronization across clients
    - Test admin configuration changes
    - _Requirements: 24.4_

  - [ ] 20.4 Perform load testing
    - Test with 100+ concurrent users in same office
    - Test pathfinding under load
    - Test Socket.IO performance under load
    - Test database performance under load
    - Monitor memory leaks
    - Monitor frame rate stability
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 20.5 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile browsers (iOS Safari, Chrome Mobile)
    - Fix any browser-specific issues
    - Verify Three.js rendering works on all platforms
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ] 20.6 Accessibility testing
    - Test keyboard navigation (Tab, Enter, E key)
    - Test screen reader compatibility for UI elements
    - Ensure proper ARIA labels
    - Test color contrast for visual feedback
    - _Requirements: 13.5, 14.5, 15.5_


- [ ] 21. Documentation
  - [ ] 21.1 Write API documentation
    - Document all REST API endpoints with request/response examples
    - Document all Socket.IO events with payload schemas
    - Document authentication and authorization requirements
    - Document rate limits and error codes
    - _Requirements: 25.1_

  - [ ] 21.2 Write system architecture documentation
    - Document overall system architecture with diagrams
    - Document data flow between components
    - Document state machine for avatar states
    - Document A* pathfinding algorithm and customization
    - Document depth sorting algorithm
    - _Requirements: 25.1, 25.2, 25.3, 25.5_

  - [ ] 21.3 Write developer guides
    - Write guide for adding new object types
    - Write guide for adding new interaction types
    - Write guide for adding new triggers
    - Write guide for extending the pathfinding system
    - Write guide for debugging interaction issues
    - _Requirements: 25.4_

  - [ ] 21.4 Write user documentation
    - Write user guide for interacting with objects
    - Write guide for using click-to-move navigation
    - Write guide for using keyboard shortcuts (E key)
    - Write guide for queue system
    - _Requirements: 25.1_

  - [ ] 21.5 Write admin documentation
    - Write guide for creating interactive objects
    - Write guide for configuring interaction nodes
    - Write guide for setting up triggers
    - Write guide for managing permissions
    - Write guide for importing/exporting configurations
    - _Requirements: 20.1, 20.2, 20.5, 25.1_

  - [ ] 21.6 Add inline code documentation
    - Add JSDoc comments to all public functions and classes
    - Document function parameters and return types
    - Document complex algorithms with inline comments
    - Document edge cases and assumptions
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_


- [ ] 22. Data Seeding and Initial Setup
  - [ ] 22.1 Create seed data for common interactive objects
    - Create seed script for basic furniture (chairs, tables, doors)
    - Add default interaction nodes for each object type
    - Add default triggers (sitting gives XP, first interaction achievement)
    - Seed navigation meshes for existing offices
    - _Requirements: 1.1, 1.5, 4.3_

  - [ ] 22.2 Create example office with interactive objects
    - Set up demo office with variety of interactive objects
    - Place objects strategically for testing
    - Configure navigation mesh for demo office
    - Add obstacles and test pathfinding
    - _Requirements: 1.1, 8.1, 9.1_

  - [ ] 22.3 Create admin user and permissions
    - Create admin role with object management permissions
    - Seed admin user account
    - Configure permission checks in API
    - _Requirements: 20.1, 20.2_

- [ ] 23. Final Integration and Polish
  - [ ] 23.1 Visual polish for interactions
    - Refine highlight effects for interactive objects
    - Improve animation transitions between states
    - Add particle effects for special interactions
    - Polish UI elements (tooltips, prompts, queue display)
    - _Requirements: 13.5, 15.1, 15.5, 17.1_

  - [ ] 23.2 Audio integration (optional)
    - Add sound effects for interactions (sitting, door opening, etc.)
    - Add ambient sounds for different object types
    - Implement audio synchronization across clients
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ] 23.3 Error message improvements
    - Review all error messages for clarity
    - Add helpful suggestions to error messages
    - Implement toast notifications for errors
    - Add error recovery suggestions
    - _Requirements: 21.1, 21.2, 21.4_

  - [ ] 23.4 Performance monitoring setup
    - Add performance metrics collection
    - Set up monitoring dashboard
    - Add alerts for performance degradation
    - Implement client-side performance tracking
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 23.5 Final compatibility verification
    - Verify WASD movement still works correctly
    - Verify chat system integration
    - Verify gamification system integration
    - Verify collision system integration
    - Test all existing features for regressions
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 24. Final Checkpoint - System Complete
  - Run full test suite (unit, property, integration, performance), verify all features work end-to-end, test with multiple concurrent users, verify documentation is complete, ask the user if ready for deployment.


## Notes

### Task Execution Guidelines

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions

### Testing Strategy

This implementation uses a dual testing approach:

**Property-Based Tests** (marked with `*`):
- Use fast-check library with minimum 100 iterations
- Test universal properties that must hold for all valid inputs
- Tagged with property number and validated requirements
- Focus on: round-trip properties, invariants, state machine correctness, algorithm correctness

**Unit Tests** (marked with `*`):
- Test specific examples and scenarios
- Test edge cases and error conditions
- Test integration points between subsystems
- Focus on: specific interactions, error handling, UI behavior

### Implementation Priority

1. **Phase 1 (High Priority)**: Tasks 1-4 - Backend foundation, database, services, API
2. **Phase 2 (High Priority)**: Tasks 5-9 - Core frontend systems (pathfinding, depth, states, interaction)
3. **Phase 3 (Medium Priority)**: Tasks 10-14 - Frontend components and integration
4. **Phase 4 (Low Priority)**: Tasks 15-18 - Advanced features (queue, admin, persistence)
5. **Phase 5 (Polish)**: Tasks 19-24 - Optimization, testing, documentation, polish

### Technology Notes

- **Backend**: Node.js 18+, Express, PostgreSQL 14+, Sequelize ORM, Socket.IO 4.x
- **Frontend**: React 18, Three.js, React Three Fiber, Zustand, Socket.IO Client
- **Testing**: Jest for unit tests, fast-check for property tests
- **Language**: JavaScript/TypeScript throughout

### Performance Targets

- Pathfinding: < 100ms for typical distances
- State synchronization: < 100ms latency
- Depth sorting: 60 FPS with 200 objects + 50 avatars
- Database queries: < 50ms for reads, < 100ms for writes
- Supports 100+ concurrent users per office

### Compatibility Requirements

All new features must maintain backward compatibility with:
- Existing WASD movement system
- Existing chat system
- Existing gamification system (XP, achievements)
- Existing collision detection
- Existing Socket.IO events

### Next Steps After Task Completion

This workflow creates planning artifacts only. To begin implementation:

1. Open `.kiro/specs/sistema-interacciones-avanzadas/tasks.md`
2. Click "Start task" next to any task item
3. Kiro will guide you through implementation
4. Complete tasks in order for best results


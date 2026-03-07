# Implementation Plan: Migración 3D a 2D

## Overview

This implementation plan converts the ECG Digital City metaverse from 3D (Three.js/React Three Fiber) to 2D (Pixi.js) using an incremental migration strategy. The migration is organized into 6 phases over 6 weeks, maintaining all existing functionality while improving performance, accessibility, and code organization.

The backend (Node.js + Express + PostgreSQL + Socket.IO) remains unchanged. All tasks focus on frontend implementation using TypeScript and Pixi.js.

## Tasks

### Phase 1: Core 2D Engine (Week 1-2)

- [ ] 1. Set up project structure and dependencies
  - Create `/src/2d` directory structure (core, entities, systems, ui, store, services, utils, config, assets)
  - Install Pixi.js dependencies: `pixi.js@^7.3.0`, `@pixi/sprite-animated@^7.3.0`
  - Create TypeScript configuration for 2D module
  - Set up feature flag system to toggle between 3D and 2D rendering
  - _Requirements: 1.1, 15.1, 15.2, 16.1-16.8_

- [ ] 2. Implement core Pixi.js application wrapper
  - [ ] 2.1 Create PixiApp component with React integration
    - Implement `PixiRenderer` class that wraps Pixi.js Application
    - Initialize Pixi application with WebGL rendering and Canvas2D fallback
    - Handle canvas lifecycle (mount, unmount, resize)
    - Provide app instance to child systems via callback
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_
  
  - [ ]* 2.2 Write unit tests for PixiApp initialization
    - Test WebGL initialization
    - Test Canvas2D fallback when WebGL unavailable
    - Test resize handling
    - Test resource cleanup on unmount
    - _Requirements: 1.1, 1.4, 14.1_

- [ ] 3. Implement Vector2D utility class
  - [ ] 3.1 Create Vector2D class with math operations
    - Implement add, subtract, multiply, distance, normalize, dot operations
    - Add validation for finite numbers and NaN prevention
    - Implement clone and length methods
    - _Requirements: 14.2_
  
  - [ ]* 3.2 Write property-based tests for Vector2D
    - **Property: Vector addition is commutative**
    - **Validates: Requirements 14.7**
  
  - [ ]* 3.3 Write unit tests for Vector2D edge cases
    - Test zero vectors
    - Test normalization of zero-length vectors
    - Test very large values
    - _Requirements: 14.2_


- [ ] 4. Implement basic SceneManager
  - [ ] 4.1 Create SceneManager class with scene hierarchy
    - Initialize world container and UI container layers
    - Set up stage management with proper z-index separation
    - Implement update loop coordination
    - Add player avatar reference management
    - _Requirements: 6.1, 6.2, 6.6_
  
  - [ ] 4.2 Implement depth sorting system
    - Create sortByDepth function that sorts sprites by Y position
    - Update z-index for proper rendering order
    - Integrate sorting into game loop
    - _Requirements: 6.5_
  
  - [ ]* 4.3 Write unit tests for depth sorting
    - Test sorting with various Y positions
    - Test z-index assignment
    - Test with mixed sprite types
    - _Requirements: 14.4_

- [ ] 5. Implement basic Avatar2D entity
  - [ ] 5.1 Create Avatar2D class with sprite rendering
    - Extend PIXI.Container for avatar representation
    - Add colored rectangle sprite as placeholder
    - Implement position and velocity properties
    - Add username label using PIXI.Text
    - _Requirements: 2.1, 2.6_
  
  - [ ] 5.2 Implement basic movement and interpolation
    - Add moveTo method for position updates
    - Implement smooth position interpolation
    - Add velocity-based movement
    - _Requirements: 2.9_
  
  - [ ]* 5.3 Write unit tests for Avatar2D
    - Test avatar creation with valid config
    - Test position updates
    - Test interpolation smoothness
    - _Requirements: 14.1_

- [ ] 6. Implement InputManager system
  - [ ] 6.1 Create InputManager class for keyboard and mouse input
    - Track keyboard state for WASD keys
    - Detect Shift key for running
    - Calculate normalized movement vector from key state
    - Handle mouse click events with coordinate conversion
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 6.2 Add event listener cleanup
    - Implement destroy method to remove all listeners
    - Prevent memory leaks from event handlers
    - _Requirements: 4.6_
  
  - [ ]* 6.3 Write unit tests for InputManager
    - Test movement vector calculation
    - Test key state tracking
    - Test cleanup on destroy
    - _Requirements: 14.1_

- [ ] 7. Implement basic CameraSystem2D
  - [ ] 7.1 Create CameraSystem2D class with smooth following
    - Implement camera position with interpolation
    - Add setTarget method for player avatar
    - Implement smooth camera movement with configurable smoothing factor
    - Apply camera transform to world container
    - _Requirements: 3.1, 3.2, 3.4, 3.7_
  
  - [ ] 7.2 Implement coordinate transformation functions
    - Create screenToWorld function accounting for camera position and zoom
    - Create worldToScreen function for inverse transformation
    - _Requirements: 3.5, 3.6_
  
  - [ ]* 7.3 Write property-based tests for camera transforms
    - **Property: screenToWorld and worldToScreen are inverses**
    - **Validates: Requirements 14.8**
  
  - [ ]* 7.4 Write unit tests for camera system
    - Test smooth following behavior
    - Test coordinate transformations
    - Test camera bounds (to be implemented in Phase 3)
    - _Requirements: 14.5_

- [ ] 8. Implement basic game loop integration
  - [ ] 8.1 Create GameLoop that coordinates all systems
    - Set up Pixi ticker at 60 FPS
    - Integrate InputManager for movement input
    - Update player avatar position based on input
    - Update camera to follow player
    - Call SceneManager update method
    - _Requirements: 6.2, 6.3_
  
  - [ ] 8.2 Add basic collision with world bounds
    - Clamp player position to world bounds
    - Prevent movement outside defined area
    - _Requirements: 5.5_

- [ ] 9. Create proof-of-concept demo
  - [ ] 9.1 Build minimal playable demo
    - Initialize Pixi application in React component
    - Create simple test district with colored ground
    - Spawn player avatar at center
    - Enable WASD movement with camera following
    - Display FPS counter
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [ ] 9.2 Test performance and validate targets
    - Verify 60 FPS rendering
    - Check memory usage < 200MB
    - Validate smooth movement
    - _Requirements: 9.1, 9.9_

- [ ] 10. Checkpoint - Phase 1 Complete
  - Ensure all tests pass, verify proof-of-concept works, ask the user if questions arise.


### Phase 2: Avatar System (Week 2-3)

- [ ] 11. Create animation configuration system
  - [ ] 11.1 Define animation state types and configurations
    - Create AnimationState type (idle, walking, running, sitting, dancing, interacting, emoting)
    - Define ANIMATION_CONFIGS with frame indices, frame rates, and loop settings
    - Validate animation configurations
    - _Requirements: 2.3, 8.2_
  
  - [ ]* 11.2 Write unit tests for animation configs
    - Test all animation states are defined
    - Test frame rate validation
    - Test loop settings
    - _Requirements: 14.4_

- [ ] 12. Implement sprite-based avatar rendering
  - [ ] 12.1 Create AssetLoader utility for spritesheets
    - Implement async spritesheet loading with Pixi.js loader
    - Add texture caching for reuse
    - Implement retry logic for failed loads (5 second delay)
    - Add fallback to colored rectangles on failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 12.2 Update Avatar2D to use animated sprites
    - Replace placeholder rectangle with PIXI.AnimatedSprite
    - Load spritesheet based on avatar customization
    - Initialize with idle animation
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 12.3 Write unit tests for AssetLoader
    - Test successful loading
    - Test caching behavior
    - Test retry logic
    - Test fallback on failure
    - _Requirements: 14.1_

- [ ] 13. Implement avatar animation system
  - [ ] 13.1 Create AnimationSystem for state management
    - Implement updateAvatarAnimation function
    - Add animation state transitions based on velocity
    - Handle sprite direction flipping based on movement
    - Set animation speed and looping
    - _Requirements: 2.3, 2.4, 2.5, 8.3_
  
  - [ ]* 13.2 Write unit tests for animation transitions
    - Test state changes (idle to walking, walking to running)
    - Test sprite direction flipping
    - Test animation looping
    - _Requirements: 14.4_

- [ ] 14. Implement avatar customization system
  - [ ] 14.1 Create AvatarCustomization data model
    - Define interface with skin color, hair style, hair color, shirt color, pants color, accessories
    - Add validation for hex color formats
    - Add validation for hair style options
    - Implement default values for invalid data
    - _Requirements: 2.7, 2.8_
  
  - [ ] 14.2 Apply customization to sprites
    - Implement color tinting for sprite layers
    - Load accessory sprites (hats, glasses, badges)
    - Composite customization layers
    - _Requirements: 2.7, 8.6_
  
  - [ ]* 14.3 Write unit tests for customization
    - Test color validation
    - Test default value fallback
    - Test accessory loading
    - _Requirements: 14.1_

- [ ] 15. Implement multiplayer avatar rendering
  - [ ] 15.1 Extend SceneManager for multiple avatars
    - Add addAvatar method to create remote avatars
    - Add removeAvatar method for cleanup
    - Maintain avatar registry by ID
    - _Requirements: 6.3, 6.4_
  
  - [ ] 15.2 Integrate with Socket.IO for avatar sync
    - Listen for avatar join/leave events
    - Create Avatar2D instances for remote players
    - Update positions from network events
    - Apply position interpolation for smooth movement
    - _Requirements: 2.9, 10.1, 10.3_
  
  - [ ]* 15.3 Write integration tests for multiplayer
    - Test avatar creation from network events
    - Test avatar removal
    - Test position synchronization
    - _Requirements: 14.10_

- [ ] 16. Add avatar status indicators
  - [ ] 16.1 Implement username labels and status icons
    - Position username text above avatar
    - Add status icon sprite (online, away, busy)
    - Update label positions in avatar update loop
    - _Requirements: 2.6_
  
  - [ ]* 16.2 Write unit tests for status indicators
    - Test label positioning
    - Test status icon changes
    - _Requirements: 14.1_

- [ ] 17. Performance optimization for multiple avatars
  - [ ] 17.1 Implement sprite batching
    - Group avatars by texture for batch rendering
    - Use sprite sheets to minimize texture switches
    - Target < 100 draw calls per frame
    - _Requirements: 9.2_
  
  - [ ] 17.2 Implement viewport culling
    - Only render avatars within camera viewport
    - Disable updates for culled avatars
    - _Requirements: 9.3_
  
  - [ ]* 17.3 Write performance tests with 50+ avatars
    - Spawn 50 avatars with random positions
    - Measure FPS over 5 minutes
    - Verify no memory leaks
    - Validate < 100 draw calls
    - _Requirements: 2.10, 9.1, 9.2, 14.12_

- [ ] 18. Checkpoint - Phase 2 Complete
  - Ensure all tests pass, verify avatar animations work smoothly, test with multiple avatars, ask the user if questions arise.


### Phase 3: World & Collision (Week 3-4)

- [ ] 19. Implement District2D data model
  - [ ] 19.1 Create District2D interface and validation
    - Define district structure with id, name, bounds, groundTexture, objects, spawnPoints
    - Create DistrictObject interface for buildings, trees, doors, decorations
    - Add validation for bounds and positions
    - _Requirements: 7.1_
  
  - [ ]* 19.2 Write unit tests for district data model
    - Test bounds validation
    - Test position validation within bounds
    - Test object type validation
    - _Requirements: 14.1_

- [ ] 20. Implement DistrictRenderer2D
  - [ ] 20.1 Create DistrictRenderer2D class for environment rendering
    - Implement ground rendering using PIXI.TilingSprite
    - Load and cache district textures
    - Render buildings and structures as sprites
    - Place interactive objects at specified positions
    - Assign z-index for depth sorting
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 20.2 Integrate district loading into SceneManager
    - Add loadDistrict method to SceneManager
    - Cleanup old district on transition
    - Load new district assets asynchronously
    - Display loading indicator during transition
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 20.3 Write unit tests for DistrictRenderer2D
    - Test ground rendering
    - Test object placement
    - Test z-index assignment
    - _Requirements: 14.1_

- [ ] 21. Implement CollisionSystem2D
  - [ ] 21.1 Create CollisionSystem2D class with AABB detection
    - Implement checkCollision for circle-rectangle collision
    - Add circleRectCollision helper function
    - Check world bounds constraints
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 21.2 Implement collision resolution with sliding
    - Create resolveCollision function for smooth wall sliding
    - Calculate collision normal and adjust velocity
    - Prevent avatar from getting stuck in corners
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 21.3 Write property-based tests for collision detection
    - **Property: Collision detection is symmetric and deterministic**
    - **Validates: Requirements 14.6**
  
  - [ ]* 21.4 Write unit tests for collision system
    - Test AABB collision detection
    - Test circle-rectangle collision
    - Test collision resolution
    - Test world bounds clamping
    - _Requirements: 14.3_

- [ ] 22. Implement spatial partitioning for optimization
  - [ ] 22.1 Create SpatialGrid utility class
    - Implement grid-based spatial partitioning
    - Add insert and query methods
    - Optimize collision queries to O(k) where k = nearby obstacles
    - _Requirements: 5.6_
  
  - [ ] 22.2 Integrate SpatialGrid into CollisionSystem2D
    - Build spatial grid from district obstacles
    - Use grid for efficient collision queries
    - Update grid on district change
    - _Requirements: 5.6_
  
  - [ ]* 22.3 Write unit tests for SpatialGrid
    - Test insertion and querying
    - Test with various grid sizes
    - Verify performance improvement
    - _Requirements: 14.1_

- [ ] 23. Implement interactive objects system
  - [ ] 23.1 Add door interaction support
    - Implement getNearbyDoor method in CollisionSystem2D
    - Add toggleDoor method for open/closed states
    - Update collision detection based on door state
    - _Requirements: 5.7, 5.8_
  
  - [ ] 23.2 Add interaction UI indicators
    - Display "Press E to interact" when near door
    - Handle E key press for interaction
    - Emit interaction events to server
    - _Requirements: 4.7_
  
  - [ ]* 23.3 Write unit tests for interactive objects
    - Test door proximity detection
    - Test door state toggling
    - Test collision changes with door state
    - _Requirements: 14.1_

- [ ] 24. Integrate collision system into game loop
  - [ ] 24.1 Update game loop with collision checking
    - Check collision before applying movement
    - Use resolveCollision for smooth sliding
    - Validate all movement on client side
    - _Requirements: 5.1, 5.2, 5.3, 18.1, 18.2_
  
  - [ ] 24.2 Add server-side movement validation
    - Send position updates to server
    - Server validates movements and rejects impossible ones
    - Client reconciles with server position if mismatch
    - _Requirements: 10.7, 18.3, 18.4_

- [ ] 25. Implement camera bounds constraints
  - [ ] 25.1 Add bounds checking to CameraSystem2D
    - Constrain camera position to world bounds
    - Account for viewport size in bounds calculation
    - Prevent camera from showing outside world
    - _Requirements: 3.2_
  
  - [ ]* 25.2 Write unit tests for camera bounds
    - Test bounds constraints with various viewport sizes
    - Test with different zoom levels
    - _Requirements: 14.5_

- [ ] 26. Add zoom functionality
  - [ ] 26.1 Implement zoom controls in CameraSystem2D
    - Add setZoom method with min/max constraints (0.5x - 2.0x)
    - Handle mouse wheel events for zoom
    - Update coordinate transformations for zoom
    - _Requirements: 3.3, 3.6_
  
  - [ ]* 26.2 Write unit tests for zoom
    - Test zoom constraints
    - Test coordinate transformations with zoom
    - _Requirements: 14.5_

- [ ] 27. Checkpoint - Phase 3 Complete
  - Ensure all tests pass, verify collision detection works correctly, test district rendering, ask the user if questions arise.


### Phase 4: Features Integration (Week 4-5)

- [ ] 28. Integrate chat system with 2D renderer
  - [ ] 28.1 Adapt existing chat UI for 2D view
    - Ensure chat overlay renders above game canvas
    - Maintain existing chat functionality (send, receive, history)
    - Prevent click-through from chat to game world
    - _Requirements: 12.2, 12.7_
  
  - [ ] 28.2 Add chat bubbles above avatars
    - Display recent messages as speech bubbles above avatars
    - Auto-hide bubbles after 5 seconds
    - Position bubbles relative to avatar position
    - _Requirements: 12.2_
  
  - [ ]* 28.3 Write integration tests for chat
    - Test chat message display
    - Test chat bubble positioning
    - Test click-through prevention
    - _Requirements: 14.1_

- [ ] 29. Integrate gamification system
  - [ ] 29.1 Adapt gamification UI for 2D view
    - Display XP bar in HUD overlay
    - Show level and progress
    - Display achievement notifications
    - Maintain existing gamification store (Zustand)
    - _Requirements: 12.3_
  
  - [ ] 29.2 Add mission system UI
    - Display active missions in HUD
    - Show mission progress indicators
    - Handle mission completion notifications
    - _Requirements: 12.3_
  
  - [ ]* 29.3 Write integration tests for gamification
    - Test XP updates
    - Test level progression
    - Test achievement display
    - _Requirements: 14.1_

- [ ] 30. Integrate company and office system
  - [ ] 30.1 Implement Office2D entity
    - Create Office2D class extending PIXI.Container
    - Render office buildings in districts
    - Add office entrance markers
    - Handle office entry/exit interactions
    - _Requirements: 12.4_
  
  - [ ] 30.2 Adapt company management UI
    - Maintain existing company creation/management UI
    - Integrate office placement in 2D districts
    - Handle office interior views (separate scenes)
    - _Requirements: 12.4_
  
  - [ ]* 30.3 Write integration tests for offices
    - Test office rendering
    - Test entry/exit interactions
    - Test office interior transitions
    - _Requirements: 14.1_

- [ ] 31. Integrate events system
  - [ ] 31.1 Adapt events UI for 2D view
    - Display event notifications in HUD
    - Show event markers in districts
    - Handle event participation UI
    - Maintain existing events store
    - _Requirements: 12.5_
  
  - [ ] 31.2 Add event visual indicators
    - Display event zones with colored overlays
    - Show participant count near event locations
    - Add event countdown timers
    - _Requirements: 12.5_
  
  - [ ]* 31.3 Write integration tests for events
    - Test event notifications
    - Test event zone rendering
    - Test event participation
    - _Requirements: 14.1_

- [ ] 32. Implement district transitions
  - [ ] 32.1 Create district transition system
    - Add district portals/doors as interactive objects
    - Handle district change requests
    - Show loading screen during transition
    - Cleanup old district and load new one
    - _Requirements: 6.4_
  
  - [ ] 32.2 Implement spawn point system
    - Spawn player at designated spawn point in new district
    - Handle spawn point selection based on entry portal
    - Validate spawn points are collision-free
    - _Requirements: 6.4_
  
  - [ ]* 32.3 Write integration tests for district transitions
    - Test district loading and cleanup
    - Test spawn point placement
    - Test avatar persistence across transitions
    - _Requirements: 14.11_

- [ ] 33. Implement responsive UI system
  - [ ] 33.1 Create responsive HUD layout
    - Adapt HUD to different screen sizes
    - Support desktop and mobile layouts
    - Handle orientation changes on mobile
    - _Requirements: 12.6_
  
  - [ ] 33.2 Add touch controls for mobile
    - Implement virtual joystick for movement
    - Add touch buttons for interactions
    - Support pinch-to-zoom gesture
    - _Requirements: 4.5_
  
  - [ ]* 33.3 Write tests for responsive UI
    - Test layout at various screen sizes
    - Test touch controls on mobile
    - _Requirements: 14.1_

- [ ] 34. Implement network synchronization improvements
  - [ ] 34.1 Add position update throttling
    - Limit position updates to 10 per second
    - Only send updates when position changes significantly
    - Implement delta compression for updates
    - _Requirements: 10.1, 10.2, 10.6_
  
  - [ ] 34.2 Implement client-side prediction
    - Predict player movement locally
    - Reconcile with server updates
    - Handle rollback on mismatch
    - _Requirements: 10.3_
  
  - [ ] 34.3 Add connection status handling
    - Display connection indicator when disconnected
    - Queue updates locally during disconnection
    - Sync queued updates on reconnection
    - Freeze remote players during disconnection
    - _Requirements: 10.4, 10.5, 13.3_
  
  - [ ]* 34.4 Write integration tests for network sync
    - Test position update throttling
    - Test client-side prediction
    - Test reconnection handling
    - _Requirements: 14.10_

- [ ] 35. Checkpoint - Phase 4 Complete
  - Ensure all tests pass, verify all features work in 2D, test district transitions, ask the user if questions arise.


### Phase 5: Polish & Optimization (Week 5-6)

- [ ] 36. Implement error handling and recovery
  - [ ] 36.1 Add asset loading error handling
    - Display fallback graphics on asset load failure
    - Show toast notifications for errors
    - Implement retry logic with exponential backoff
    - Log errors to console for debugging
    - _Requirements: 7.7, 11.4, 13.1_
  
  - [ ] 36.2 Add WebGL context loss handling
    - Detect WebGL context loss events
    - Pause game loop and display reconnecting overlay
    - Reload textures and rebuild scene on context restore
    - Resume game loop after restoration
    - _Requirements: 13.2, 13.3_
  
  - [ ] 36.3 Add network error handling
    - Handle Socket.IO disconnection gracefully
    - Display connection status indicator
    - Queue updates during disconnection
    - Sync on reconnection
    - _Requirements: 13.4_
  
  - [ ] 36.4 Add data validation and sanitization
    - Validate avatar customization data
    - Use default values for invalid data
    - Sanitize chat messages to prevent XSS
    - Validate asset URLs before loading
    - _Requirements: 13.5, 18.5, 18.6_
  
  - [ ]* 36.5 Write unit tests for error handling
    - Test asset loading failures
    - Test WebGL context loss recovery
    - Test network disconnection handling
    - Test data validation
    - _Requirements: 14.1_

- [ ] 37. Implement performance optimizations
  - [ ] 37.1 Optimize texture management
    - Use texture atlases to reduce texture switches
    - Implement texture caching with LRU eviction
    - Lazy load district assets on demand
    - Unload unused textures on district change
    - _Requirements: 9.4, 9.6, 9.7_
  
  - [ ] 37.2 Implement object pooling
    - Pool avatar sprites for reuse
    - Pool particle effects (if implemented)
    - Pool UI elements
    - Reduce garbage collection pressure
    - _Requirements: 9.5_
  
  - [ ] 37.3 Optimize rendering pipeline
    - Enable sprite batching for static objects
    - Implement frustum culling for off-screen objects
    - Disable updates for culled objects
    - Target < 100 draw calls per frame
    - _Requirements: 9.2, 9.3_
  
  - [ ]* 37.4 Write performance tests
    - Measure FPS with 50+ avatars
    - Measure memory usage over time
    - Measure load time for districts
    - Verify draw call count < 100
    - Validate targets: 60 FPS, < 200MB memory, < 3s load time
    - _Requirements: 9.1, 9.8, 9.9, 14.12_

- [ ] 38. Implement accessibility features
  - [ ] 38.1 Add keyboard navigation support
    - Enable tab navigation for UI elements
    - Add keyboard shortcuts for common actions
    - Display keyboard shortcut hints
    - _Requirements: 17.5_
  
  - [ ] 38.2 Add screen reader support
    - Provide alternative text for visual elements
    - Add ARIA labels to interactive elements
    - Announce important game events
    - _Requirements: 17.6_
  
  - [ ] 38.3 Add high-DPI display support
    - Use device pixel ratio for canvas resolution
    - Scale UI elements appropriately
    - Test on retina displays
    - _Requirements: 1.7, 17.7_
  
  - [ ]* 38.4 Validate accessibility compliance
    - Run accessibility audit tools
    - Test with keyboard-only navigation
    - Test with screen readers
    - _Requirements: 17.4_

- [ ] 39. Implement monitoring and analytics
  - [ ] 39.1 Add performance metrics tracking
    - Track average FPS and report to analytics
    - Track load time and report to analytics
    - Track memory usage and report to analytics
    - Track draw calls per frame
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [ ] 39.2 Add user behavior tracking
    - Track user retention metrics
    - Track feature usage (chat, gamification, events)
    - Track district visit frequency
    - _Requirements: 20.5_
  
  - [ ] 39.3 Add error tracking
    - Track and categorize bug reports by severity
    - Send error reports to monitoring service
    - Track error frequency and patterns
    - _Requirements: 20.6_

- [ ] 40. Add visual polish and effects
  - [ ] 40.1 Implement particle effects (optional)
    - Add footstep dust particles
    - Add interaction sparkles
    - Add ambient particles (leaves, snow)
    - Optimize particle rendering
    - _Requirements: 9.1_
  
  - [ ] 40.2 Add lighting effects (optional)
    - Implement simple 2D lighting with overlays
    - Add day/night cycle
    - Add ambient occlusion for depth
    - _Requirements: 9.1_
  
  - [ ] 40.3 Add UI animations and transitions
    - Smooth transitions for menus
    - Fade in/out for notifications
    - Animated buttons and interactions
    - _Requirements: 12.6_

- [ ] 41. Browser compatibility testing
  - [ ] 41.1 Test on all major browsers
    - Test on Chrome (latest)
    - Test on Firefox (latest)
    - Test on Safari (latest)
    - Test on Edge (latest)
    - _Requirements: 17.1_
  
  - [ ] 41.2 Test Canvas2D fallback
    - Disable WebGL and test Canvas2D rendering
    - Verify performance is acceptable
    - Test on older browsers
    - _Requirements: 1.4, 17.3_
  
  - [ ] 41.3 Test on mobile devices
    - Test on iOS Safari
    - Test on Android Chrome
    - Test touch controls
    - Test performance on mobile
    - _Requirements: 17.2_

- [ ] 42. Security hardening
  - [ ] 42.1 Implement Content Security Policy
    - Add CSP headers to prevent XSS
    - Whitelist allowed asset sources
    - Test CSP configuration
    - _Requirements: 18.8_
  
  - [ ] 42.2 Implement rate limiting
    - Rate limit position updates on server
    - Rate limit chat messages
    - Rate limit API requests
    - _Requirements: 18.4_
  
  - [ ] 42.3 Add input validation
    - Validate all client inputs on server
    - Reject impossible movements
    - Clamp values to valid ranges
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [ ]* 42.4 Write security tests
    - Test XSS prevention
    - Test rate limiting
    - Test input validation
    - _Requirements: 14.1_

- [ ] 43. Checkpoint - Phase 5 Complete
  - Ensure all tests pass, verify performance targets met, test on all browsers, ask the user if questions arise.


### Phase 6: Deployment & Cleanup (Week 6)

- [ ] 44. Create comprehensive documentation
  - [ ] 44.1 Write inline code documentation
    - Add JSDoc comments to all public functions and classes
    - Document complex algorithms with inline comments
    - Add type annotations for all parameters and return values
    - _Requirements: 19.1, 19.2_
  
  - [ ] 44.2 Create architecture documentation
    - Document system architecture with diagrams
    - Create API documentation for public interfaces
    - Document data models and their relationships
    - _Requirements: 19.4, 19.5_
  
  - [ ] 44.3 Write setup and migration guide
    - Create README with setup instructions
    - Document migration process from 3D to 2D
    - Add troubleshooting guide
    - Document feature flag usage
    - _Requirements: 19.3, 19.6_

- [ ] 45. Prepare for production deployment
  - [ ] 45.1 Set 2D as default renderer
    - Update feature flag to default to 2D
    - Keep 3D as fallback option temporarily
    - Add UI toggle for users to switch renderers
    - _Requirements: 15.3, 15.7_
  
  - [ ] 45.2 Optimize production build
    - Enable production mode optimizations
    - Minify and compress assets
    - Implement code splitting for lazy loading
    - Optimize bundle size
    - _Requirements: 9.8_
  
  - [ ] 45.3 Set up monitoring and logging
    - Configure error tracking service
    - Set up performance monitoring
    - Configure analytics tracking
    - Set up alerting for critical errors
    - _Requirements: 20.1, 20.2, 20.3, 20.6_

- [ ] 46. Conduct final testing
  - [ ] 46.1 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Execute all integration tests
    - Verify 80%+ code coverage
    - _Requirements: 14.1-14.12_
  
  - [ ] 46.2 Perform end-to-end testing
    - Test complete user flows (login, navigation, chat, gamification)
    - Test district transitions
    - Test multiplayer interactions
    - Test on all supported browsers and devices
    - _Requirements: 17.1, 17.2_
  
  - [ ] 46.3 Conduct performance testing
    - Load test with 50+ concurrent users
    - Measure server performance
    - Verify client performance targets
    - Test for memory leaks over extended sessions
    - _Requirements: 9.1, 9.9, 14.12_
  
  - [ ] 46.4 Conduct user acceptance testing
    - Gather feedback from beta testers
    - Identify and fix critical issues
    - Validate user satisfaction
    - _Requirements: 20.5, 20.7_

- [ ] 47. Deploy to production
  - [ ] 47.1 Deploy 2D version to production
    - Deploy frontend with 2D as default
    - Monitor for errors and performance issues
    - Keep 3D version available as fallback
    - _Requirements: 15.7_
  
  - [ ] 47.2 Monitor production metrics
    - Track FPS, load time, memory usage
    - Monitor error rates
    - Track user retention and satisfaction
    - Respond to critical issues immediately
    - _Requirements: 20.1, 20.2, 20.3, 20.5, 20.6_
  
  - [ ] 47.3 Gather post-deployment feedback
    - Monitor user feedback channels
    - Track bug reports
    - Conduct user satisfaction survey
    - Analyze usage patterns
    - _Requirements: 20.7_

- [ ] 48. Remove 3D dependencies and code
  - [ ] 48.1 Verify 2D version stability
    - Confirm no critical bugs for 1 week
    - Verify performance targets consistently met
    - Confirm positive user feedback
    - _Requirements: 15.8_
  
  - [ ] 48.2 Remove 3D code and dependencies
    - Remove Three.js, @react-three/fiber, @react-three/drei from package.json
    - Delete 3D-related code from /src
    - Remove 3D assets
    - Update imports and references
    - _Requirements: 15.8_
  
  - [ ] 48.3 Clean up project structure
    - Move 2D code from /src/2d to /src
    - Reorganize according to new structure
    - Update all import paths
    - Remove feature flag system
    - _Requirements: 16.1-16.8_
  
  - [ ] 48.4 Update build configuration
    - Remove 3D-related build configurations
    - Optimize build for 2D-only
    - Update CI/CD pipelines
    - _Requirements: 15.8_

- [ ] 49. Final documentation and handoff
  - [ ] 49.1 Update all documentation
    - Update README to reflect 2D-only implementation
    - Remove 3D references from documentation
    - Update architecture diagrams
    - Document lessons learned
    - _Requirements: 19.1-19.6_
  
  - [ ] 49.2 Create maintenance guide
    - Document common maintenance tasks
    - Create troubleshooting guide
    - Document performance optimization techniques
    - Document how to add new features
    - _Requirements: 19.1_
  
  - [ ] 49.3 Conduct team knowledge transfer
    - Present architecture to team
    - Walk through key systems
    - Answer questions and clarify design decisions
    - _Requirements: 19.1_

- [ ] 50. Final checkpoint - Migration Complete
  - Verify all tests pass, confirm production stability, validate success metrics, celebrate the successful migration!

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements from the requirements document for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property-based tests validate universal correctness properties using fast-check
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate system interactions and end-to-end flows
- The migration maintains backward compatibility with the existing backend (no API changes)
- Feature flag system allows safe rollback if issues arise during deployment
- Performance targets: 60 FPS, < 200MB memory, < 3s load time, < 100 draw calls
- Security is enforced through client validation + server authority model

## Success Criteria

The migration is considered successful when:

1. All 20 requirements are fully implemented and tested
2. Performance targets are consistently met (60 FPS, < 200MB memory, < 3s load time)
3. All existing features work in 2D (chat, gamification, districts, avatars, companies, events)
4. Test coverage is ≥ 80% with all tests passing
5. Application works on all major browsers (Chrome, Firefox, Safari, Edge)
6. Mobile support is functional with touch controls
7. No critical bugs in production for 1 week
8. User satisfaction ≥ 4/5 in post-migration survey
9. 3D dependencies successfully removed
10. Documentation is complete and up-to-date

# Requirements Document: Migración 3D a 2D

## Introduction

ECG Digital City es un metaverso que actualmente utiliza tecnología 3D (Three.js/React Three Fiber). Este documento especifica los requisitos para migrar completamente la aplicación a una implementación 2D usando Pixi.js, manteniendo toda la funcionalidad existente mientras se mejora el rendimiento, la accesibilidad y la mantenibilidad del código.

La migración afecta únicamente al frontend; el backend (Node.js + Express + PostgreSQL + Socket.IO) permanece sin cambios.

## Glossary

- **System**: El sistema completo de ECG Digital City (frontend + backend)
- **Pixi_Renderer**: El motor de renderizado 2D basado en Pixi.js
- **Avatar_System**: Sistema que gestiona la representación y animación de avatares en 2D
- **Scene_Manager**: Componente que gestiona la escena del juego, distritos y elementos visuales
- **Camera_System**: Sistema de cámara 2D con seguimiento suave del jugador
- **Collision_System**: Sistema de detección y resolución de colisiones en 2D
- **Input_Manager**: Sistema que gestiona entrada de teclado, mouse y touch
- **District**: Área del metaverso con límites definidos, texturas y objetos interactivos
- **Sprite**: Imagen 2D que representa un avatar, objeto o elemento del juego
- **Spritesheet**: Colección de frames de animación en una sola imagen
- **World_Coordinates**: Sistema de coordenadas del mundo del juego
- **Screen_Coordinates**: Sistema de coordenadas de la pantalla del usuario
- **Frame_Rate**: Velocidad de actualización de la pantalla (target: 60 FPS)
- **Draw_Call**: Operación de renderizado enviada a la GPU
- **Viewport**: Área visible de la cámara en el mundo del juego
- **Depth_Sorting**: Ordenamiento de sprites por profundidad visual (eje Y)
- **Spatial_Partitioning**: Técnica de optimización para consultas espaciales eficientes
- **Network_Sync**: Sincronización de estado entre cliente y servidor
- **Asset**: Recurso gráfico o de audio (sprites, texturas, sonidos)
- **Game_Loop**: Ciclo principal de actualización y renderizado del juego

## Requirements

### Requirement 1: Rendering Engine Migration

**User Story:** As a developer, I want to migrate from Three.js to Pixi.js, so that the application has better 2D rendering performance and simpler maintenance.

#### Acceptance Criteria

1. THE Pixi_Renderer SHALL initialize a Pixi.js Application with WebGL rendering
2. WHEN the application starts, THE Pixi_Renderer SHALL create a canvas element and append it to the DOM
3. THE Pixi_Renderer SHALL maintain a target frame rate of 60 FPS
4. WHEN WebGL is not available, THE Pixi_Renderer SHALL fallback to Canvas2D rendering
5. WHEN the component unmounts, THE Pixi_Renderer SHALL destroy all Pixi resources and remove event listeners
6. THE Pixi_Renderer SHALL support window resize events and adjust canvas dimensions accordingly
7. THE Pixi_Renderer SHALL use the device pixel ratio for high-DPI displays

### Requirement 2: Avatar System Implementation

**User Story:** As a user, I want to see my avatar and other users' avatars rendered in 2D with smooth animations, so that I can interact in the virtual world.

#### Acceptance Criteria

1. THE Avatar_System SHALL render avatars using sprite-based graphics
2. WHEN an avatar is created, THE Avatar_System SHALL load the appropriate spritesheet based on customization data
3. THE Avatar_System SHALL support animation states: idle, walking, running, sitting, dancing, interacting, and emoting
4. WHEN an avatar moves, THE Avatar_System SHALL play the appropriate animation based on velocity
5. WHEN an avatar changes direction, THE Avatar_System SHALL flip the sprite horizontally to face the movement direction
6. THE Avatar_System SHALL display the username above each avatar
7. THE Avatar_System SHALL apply avatar customization including skin color, hair style, hair color, shirt color, pants color, and accessories
8. WHEN avatar customization data is invalid, THE Avatar_System SHALL use default values and log a warning
9. THE Avatar_System SHALL interpolate avatar positions for smooth movement between network updates
10. THE Avatar_System SHALL support at least 50 concurrent avatars without performance degradation

### Requirement 3: Camera System Implementation

**User Story:** As a player, I want the camera to smoothly follow my avatar, so that I can navigate the world comfortably.

#### Acceptance Criteria

1. THE Camera_System SHALL follow the player avatar with smooth interpolation
2. THE Camera_System SHALL constrain camera position to world bounds
3. THE Camera_System SHALL support zoom levels between 0.5x and 2.0x
4. WHEN the player moves, THE Camera_System SHALL update camera position with configurable smoothing factor
5. THE Camera_System SHALL provide coordinate transformation functions between screen and world coordinates
6. WHEN coordinate transformation is applied, THE Camera_System SHALL account for camera position and zoom level
7. THE Camera_System SHALL apply camera transform to the world container for rendering

### Requirement 4: Input Handling System

**User Story:** As a player, I want to control my avatar using keyboard (WASD), mouse clicks, and touch input, so that I can move around the world.

#### Acceptance Criteria

1. THE Input_Manager SHALL track keyboard state for movement keys (W, A, S, D)
2. THE Input_Manager SHALL detect Shift key for running
3. WHEN movement keys are pressed, THE Input_Manager SHALL calculate a normalized movement vector
4. THE Input_Manager SHALL handle mouse click events and convert screen coordinates to world coordinates
5. THE Input_Manager SHALL support touch input for mobile devices
6. WHEN the Input_Manager is destroyed, THE Input_Manager SHALL remove all event listeners
7. THE Input_Manager SHALL emit input events for other systems to consume

### Requirement 5: Collision Detection System

**User Story:** As a player, I want my avatar to collide with walls and obstacles realistically, so that I cannot walk through solid objects.

#### Acceptance Criteria

1. THE Collision_System SHALL detect collisions between avatars and rectangular obstacles
2. THE Collision_System SHALL use AABB (Axis-Aligned Bounding Box) collision detection
3. WHEN a collision is detected, THE Collision_System SHALL resolve the collision by adjusting the avatar position
4. THE Collision_System SHALL support sliding along walls when collision occurs
5. THE Collision_System SHALL constrain avatar positions to world bounds
6. THE Collision_System SHALL use spatial partitioning for efficient collision queries
7. THE Collision_System SHALL detect proximity to interactive objects (doors) within a specified range
8. THE Collision_System SHALL support toggling door states (open/closed)

### Requirement 6: Scene Management

**User Story:** As a developer, I want a scene manager that coordinates all game systems, so that the game loop runs efficiently.

#### Acceptance Criteria

1. THE Scene_Manager SHALL manage the scene hierarchy with separate world and UI layers
2. THE Scene_Manager SHALL coordinate updates for Avatar_System, Camera_System, and Collision_System
3. WHEN a district is loaded, THE Scene_Manager SHALL load district assets and create the scene
4. WHEN a district transition occurs, THE Scene_Manager SHALL cleanup the old district and load the new one
5. THE Scene_Manager SHALL perform depth sorting of sprites based on Y position each frame
6. THE Scene_Manager SHALL maintain a reference to the player avatar
7. WHEN the Scene_Manager is destroyed, THE Scene_Manager SHALL cleanup all resources

### Requirement 7: District Rendering

**User Story:** As a user, I want to see districts rendered with ground textures, buildings, and interactive objects, so that the world feels immersive.

#### Acceptance Criteria

1. THE District_Renderer SHALL load district data including bounds, textures, and objects
2. THE District_Renderer SHALL render ground using tiling sprites or tilemaps
3. THE District_Renderer SHALL render buildings and structures as sprites
4. THE District_Renderer SHALL place interactive objects (doors, furniture, decorations) at specified positions
5. THE District_Renderer SHALL assign z-index values to objects for proper depth sorting
6. THE District_Renderer SHALL mark collidable objects for the Collision_System
7. WHEN district assets fail to load, THE District_Renderer SHALL display fallback graphics and log errors

### Requirement 8: Animation System

**User Story:** As a user, I want to see smooth sprite-based animations for avatars, so that movement feels natural.

#### Acceptance Criteria

1. THE Animation_System SHALL load spritesheets with multiple animation frames
2. THE Animation_System SHALL support configurable frame rates for each animation state
3. WHEN an animation state changes, THE Animation_System SHALL transition to the new animation
4. THE Animation_System SHALL support looping and non-looping animations
5. THE Animation_System SHALL cache loaded spritesheets for reuse
6. THE Animation_System SHALL apply avatar customization colors to sprite layers

### Requirement 9: Performance Optimization

**User Story:** As a user, I want the application to run smoothly at 60 FPS, so that my experience is fluid and responsive.

#### Acceptance Criteria

1. THE System SHALL maintain 60 FPS with up to 50 concurrent avatars
2. THE System SHALL use sprite batching to minimize draw calls to less than 100 per frame
3. THE System SHALL implement viewport culling to avoid rendering off-screen objects
4. THE System SHALL use texture atlases to reduce texture switches
5. THE System SHALL implement object pooling for frequently created/destroyed objects
6. THE System SHALL lazy load district assets on demand
7. WHEN a district is unloaded, THE System SHALL free unused textures from memory
8. THE System SHALL complete initial load in less than 3 seconds
9. THE System SHALL use less than 200MB of memory during normal operation

### Requirement 10: Network Synchronization

**User Story:** As a player, I want my position and actions synchronized with other players, so that multiplayer interactions work correctly.

#### Acceptance Criteria

1. WHEN the player moves, THE Network_Sync SHALL emit position updates to the server at a maximum rate of 10 updates per second
2. THE Network_Sync SHALL only send position updates when position changes significantly
3. WHEN position updates are received from the server, THE Network_Sync SHALL interpolate other players' positions smoothly
4. WHEN the network connection is lost, THE Network_Sync SHALL display a connection indicator and queue updates locally
5. WHEN the connection is restored, THE Network_Sync SHALL synchronize queued updates with the server
6. THE Network_Sync SHALL use delta compression for position updates to reduce bandwidth
7. THE Server SHALL validate all position updates and reject impossible movements

### Requirement 11: Asset Management

**User Story:** As a developer, I want an asset loading system that efficiently manages sprites and textures, so that memory usage is optimized.

#### Acceptance Criteria

1. THE Asset_Loader SHALL load spritesheets asynchronously
2. THE Asset_Loader SHALL cache loaded assets for reuse
3. WHEN an asset fails to load, THE Asset_Loader SHALL retry after 5 seconds
4. WHEN an asset fails after retries, THE Asset_Loader SHALL use fallback graphics
5. THE Asset_Loader SHALL support loading texture atlases
6. THE Asset_Loader SHALL validate asset URLs before loading
7. THE Asset_Loader SHALL implement CORS for external assets

### Requirement 12: User Interface Integration

**User Story:** As a user, I want the UI (chat, menus, HUD) to work seamlessly with the 2D game view, so that I can access all features.

#### Acceptance Criteria

1. THE System SHALL render UI components in a separate layer above the game world
2. THE System SHALL maintain existing chat functionality with the 2D renderer
3. THE System SHALL maintain existing gamification UI (XP, levels, achievements, missions)
4. THE System SHALL maintain existing company and office management UI
5. THE System SHALL maintain existing event system UI
6. THE System SHALL support responsive UI that adapts to different screen sizes
7. WHEN UI elements are clicked, THE System SHALL prevent click-through to the game world

### Requirement 13: Error Handling and Recovery

**User Story:** As a user, I want the application to handle errors gracefully, so that temporary issues don't break my experience.

#### Acceptance Criteria

1. WHEN asset loading fails, THE System SHALL display fallback graphics and continue operation
2. WHEN WebGL context is lost, THE System SHALL pause the game loop and display a reconnecting overlay
3. WHEN WebGL context is restored, THE System SHALL reload textures and resume the game loop
4. WHEN network connection is lost, THE System SHALL freeze other players and allow local movement
5. WHEN invalid avatar data is received, THE System SHALL validate and correct the data using defaults
6. THE System SHALL log all errors to the console for debugging
7. THE System SHALL display user-friendly error messages via toast notifications

### Requirement 14: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive test coverage, so that the migration maintains quality and correctness.

#### Acceptance Criteria

1. THE System SHALL have at least 80% code coverage for unit tests
2. THE System SHALL include unit tests for Vector2D math operations
3. THE System SHALL include unit tests for collision detection algorithms
4. THE System SHALL include unit tests for animation state transitions
5. THE System SHALL include unit tests for camera coordinate transformations
6. THE System SHALL include property-based tests for collision detection symmetry
7. THE System SHALL include property-based tests for vector math commutativity
8. THE System SHALL include property-based tests for camera transform inverses
9. THE System SHALL include integration tests for the full game loop
10. THE System SHALL include integration tests for multiplayer synchronization
11. THE System SHALL include integration tests for district transitions
12. THE System SHALL include performance tests with 50+ avatars running for 5+ minutes

### Requirement 15: Migration Strategy

**User Story:** As a project manager, I want an incremental migration approach, so that we minimize risk and can rollback if needed.

#### Acceptance Criteria

1. THE migration SHALL be implemented in a new `/src/2d` directory alongside existing 3D code
2. THE System SHALL support a feature flag to toggle between 3D and 2D rendering
3. WHEN the feature flag is enabled, THE System SHALL use the 2D renderer
4. WHEN the feature flag is disabled, THE System SHALL use the existing 3D renderer
5. THE migration SHALL maintain the existing backend API without changes
6. THE migration SHALL be completed in 6 phases over 6 weeks
7. WHEN the 2D version is stable, THE System SHALL set 2D as the default
8. WHEN the 2D version is proven stable, THE System SHALL remove 3D dependencies and code

### Requirement 16: Project Structure Reorganization

**User Story:** As a developer, I want a well-organized project structure, so that code is easy to find and maintain.

#### Acceptance Criteria

1. THE project SHALL organize code into core, entities, systems, ui, store, services, utils, config, and assets directories
2. THE core directory SHALL contain PixiApp, SceneManager, and GameLoop
3. THE entities directory SHALL contain Avatar2D, District2D, and InteractiveObject classes
4. THE systems directory SHALL contain CameraSystem2D, InputManager, CollisionSystem2D, AnimationSystem, and NetworkSync
5. THE ui directory SHALL contain React components organized by feature (HUD, Menus, Chat, Gamification)
6. THE store directory SHALL contain Zustand stores for state management
7. THE services directory SHALL contain Socket.IO client and REST API client
8. THE utils directory SHALL contain Vector2D, SpatialGrid, and AssetLoader utilities

### Requirement 17: Accessibility and Browser Compatibility

**User Story:** As a user, I want the application to work on my browser and device, so that I can access the platform.

#### Acceptance Criteria

1. THE System SHALL support Chrome, Firefox, Safari, and Edge browsers
2. THE System SHALL support desktop and mobile devices
3. WHEN WebGL is not available, THE System SHALL fallback to Canvas2D rendering
4. THE System SHALL implement WCAG AA accessibility standards where applicable
5. THE System SHALL support keyboard navigation for UI elements
6. THE System SHALL provide alternative text for visual elements
7. THE System SHALL support high-DPI displays with appropriate scaling

### Requirement 18: Security

**User Story:** As a system administrator, I want client-side validation and server authority, so that the application is secure against cheating.

#### Acceptance Criteria

1. THE System SHALL validate all movement inputs on the client
2. THE System SHALL clamp position values to world bounds on the client
3. THE Server SHALL validate all position updates and reject impossible movements
4. THE Server SHALL rate limit position updates to prevent spam
5. THE System SHALL sanitize chat messages to prevent XSS attacks
6. THE System SHALL validate asset URLs before loading
7. THE System SHALL use WSS (WebSocket Secure) for encrypted communication
8. THE System SHALL implement Content Security Policy headers

### Requirement 19: Documentation

**User Story:** As a developer, I want comprehensive documentation, so that I can understand and maintain the codebase.

#### Acceptance Criteria

1. THE System SHALL include inline code comments for complex algorithms
2. THE System SHALL include JSDoc comments for all public functions and classes
3. THE System SHALL include a README with setup instructions
4. THE System SHALL include architecture diagrams in the design document
5. THE System SHALL include API documentation for all public interfaces
6. THE System SHALL include migration guide from 3D to 2D

### Requirement 20: Monitoring and Metrics

**User Story:** As a product manager, I want to track performance and user metrics, so that I can measure migration success.

#### Acceptance Criteria

1. THE System SHALL track average FPS and report to analytics
2. THE System SHALL track load time and report to analytics
3. THE System SHALL track memory usage and report to analytics
4. THE System SHALL track draw calls per frame for performance monitoring
5. THE System SHALL track user retention before and after migration
6. THE System SHALL track bug reports and categorize by severity
7. THE System SHALL track user satisfaction through post-migration surveys

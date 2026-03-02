# ⚙️ Especificación Técnica: Game Engine

**Versión:** 1.0  
**Fecha:** 2026-03-02  
**Autor:** Tech Lead  
**Status:** 📝 Primera Versión

---

## 1. VISIÓN GENERAL

El **Game Engine** es un motor de juego robusto basado en **Entity Component System (ECS)** con:
- Game loop de 60 TPS (16.67ms por frame)
- World management con spatial indexing
- Event dispatcher centralizado
- Integración física con Cannon.js
- AI system con pathfinding y behavior trees

### Objetivos
✅ Soportar 1000+ entidades simultáneamente  
✅ Mantener 60 FPS constante (<16.67ms por frame)  
✅ Predecir movimiento en cliente  
✅ Interpolación suave de movimientos remotos  
✅ Colisiones y physics realistas  

### Por qué ECS
- **Flexible:** Fácil agregar/quitar componentes
- **Escalable:** Soporta miles de entidades
- **Performante:** Cache-friendly data layout
- **Mantenible:** Separación clara de concerns

---

## 2. ARCHITECTURE - ENTITY COMPONENT SYSTEM

### Concepto
En lugar de jerarquía de clases, usar composición:

```
Entity (ID única)
├── Transform Component
│   └── x, y, z, rotX, rotY, rotZ, scaleX, scaleY, scaleZ
├── Physics Component
│   └── velocity, mass, isKinematic, rigidbody
├── Render Component
│   └── mesh, material, isVisible, LOD
├── AI Component
│   └── state, behavior tree, navmesh
└── Custom Components (Health, Inventory, etc.)
```

### Ventajas vs Herencia
```
// ❌ Herencia (inflexible)
class Player extends Entity {
  constructor() {
    this.transform = new Transform();
    this.physics = new Physics();
    this.render = new Render();
    this.ai = null; // ¿Qué si el player es AI?
    this.health = new Health();
  }
}

// ✅ ECS (flexible)
const player = entityManager.createEntity();
player.addComponent(new TransformComponent(...));
player.addComponent(new PhysicsComponent(...));
player.addComponent(new RenderComponent(...));
player.addComponent(new HealthComponent(...));
// Agregar AI dinámicamente si es necesario
if (isAIPlayer) player.addComponent(new AIComponent(...));
```

### Clases Principales

#### 1. Entity
```javascript
class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
    this.active = true;
  }

  addComponent(component) {
    this.components.set(component.constructor, component);
    component.entity = this;
  }

  removeComponent(ComponentClass) {
    this.components.delete(ComponentClass);
  }

  getComponent(ComponentClass) {
    return this.components.get(ComponentClass);
  }

  hasComponent(ComponentClass) {
    return this.components.has(ComponentClass);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }
}
```

#### 2. Component (Base)
```javascript
class Component {
  constructor() {
    this.entity = null;
  }

  onAttach() {
    // Llamado cuando se agrega a entity
  }

  onDetach() {
    // Llamado cuando se remueve de entity
  }

  serialize() {
    // Para guardar estado
  }

  deserialize(data) {
    // Para cargar estado
  }
}
```

#### 3. TransformComponent
```javascript
class TransformComponent extends Component {
  constructor(x = 0, y = 0, z = 0) {
    super();
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.isDirty = true;
  }

  setPosition(x, y, z) {
    this.position = { x, y, z };
    this.isDirty = true;
  }

  translate(dx, dy, dz) {
    this.position.x += dx;
    this.position.y += dy;
    this.position.z += dz;
    this.isDirty = true;
  }

  getMatrix() {
    // Retornar matrix de transformación (4x4)
  }
}
```

#### 4. PhysicsComponent
```javascript
class PhysicsComponent extends Component {
  constructor(mass = 1, isKinematic = false) {
    super();
    this.mass = mass;
    this.isKinematic = isKinematic;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.rigidbody = null; // Cannon.js body
    this.collider = null;
  }

  applyForce(fx, fy, fz) {
    if (this.rigidbody && !this.isKinematic) {
      this.rigidbody.applyForce(
        new CANNON.Vec3(fx, fy, fz),
        this.rigidbody.position
      );
    }
  }

  setVelocity(vx, vy, vz) {
    this.velocity = { x: vx, y: vy, z: vz };
    if (this.rigidbody) {
      this.rigidbody.velocity = new CANNON.Vec3(vx, vy, vz);
    }
  }
}
```

#### 5. RenderComponent
```javascript
class RenderComponent extends Component {
  constructor(mesh, material) {
    super();
    this.mesh = mesh;
    this.material = material;
    this.isVisible = true;
    this.castShadow = true;
    this.receiveShadow = true;
    this.LOD = 0; // Level of detail
  }

  setLOD(distance) {
    // LOD lejano = menos detalles = más performance
    if (distance < 20) this.LOD = 0; // Full quality
    else if (distance < 50) this.LOD = 1; // 75% detalles
    else if (distance < 100) this.LOD = 2; // 50% detalles
    else this.LOD = 3; // Billboard/simple
  }

  show() { this.isVisible = true; }
  hide() { this.isVisible = false; }
}
```

#### 6. AIComponent
```javascript
class AIComponent extends Component {
  constructor(type = 'npc') {
    super();
    this.type = type;
    this.state = 'idle';
    this.behaviorTree = null;
    this.currentTask = null;
    this.pathfinder = null;
  }

  setState(newState) {
    this.state = newState;
  }

  executeTask(task) {
    this.currentTask = task;
  }

  update(deltaTime) {
    if (this.behaviorTree) {
      this.behaviorTree.execute(deltaTime);
    }
  }
}
```

#### 7. EntityManager
```javascript
class EntityManager {
  constructor() {
    this.entities = new Map();
    this.entityCounter = 0;
  }

  createEntity() {
    const entity = new Entity(this.entityCounter++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  destroyEntity(entity) {
    this.entities.delete(entity.id);
  }

  getEntity(id) {
    return this.entities.get(id);
  }

  queryEntitiesWith(...ComponentClasses) {
    // Retornar todos los entities que tienen TODOS estos components
    return Array.from(this.entities.values())
      .filter(entity =>
        ComponentClasses.every(Component =>
          entity.hasComponent(Component)
        )
      );
  }

  getAllEntities() {
    return Array.from(this.entities.values());
  }

  getEntityCount() {
    return this.entities.size;
  }
}
```

---

## 3. GAME LOOP (60 TPS)

### Concepto
60 TPS = 16.67ms por frame (fixed timestep)

### Estructura
```
Timer: 0ms – 16.67ms
├─ Input Processing (1ms)
├─ Physics Update (4ms)
├─ AI Update (3ms)
├─ Game Logic Systems (3ms)
├─ Render Preparation (2ms)
├─ Network Sync (2ms)
└─ Cleanup (1ms)
```

### Implementación
```javascript
class GameLoop {
  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.deltaTime = 1000 / targetFPS; // 16.67ms
    this.systems = [];
    this.running = false;
    this.frameCount = 0;
    this.accumulator = 0;
  }

  addSystem(system) {
    this.systems.push(system);
    system.onInitialize();
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop() {
    this.running = false;
  }

  tick() {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    // Fixed timestep
    this.accumulator += deltaTime;

    while (this.accumulator >= this.deltaTime) {
      // Ejecutar todos los systems
      for (const system of this.systems) {
        system.update(this.deltaTime / 1000); // Convertir a segundos
      }

      this.accumulator -= this.deltaTime;
      this.frameCount++;
    }

    // Interpolar para smooth rendering
    const interpolation = this.accumulator / this.deltaTime;

    // Schedule siguiente tick
    requestAnimationFrame(() => this.tick());
  }

  getFrameCount() {
    return this.frameCount;
  }

  getFPS() {
    // Calcular FPS promedio
  }
}
```

### Systems
Los systems operan sobre conjuntos de componentes:

```javascript
class System {
  constructor(entityManager) {
    this.entityManager = entityManager;
  }

  onInitialize() {
    // Llamado una vez al iniciar
  }

  update(deltaTime) {
    // Llamado cada frame
  }

  getEntityCache() {
    // Cache los entities que procesa para performance
  }
}

// Ejemplo: PhysicsSystem
class PhysicsSystem extends System {
  update(deltaTime) {
    // Obtener todos los entities con Physics
    const entities = this.entityManager.queryEntitiesWith(
      PhysicsComponent,
      TransformComponent
    );

    for (const entity of entities) {
      const physics = entity.getComponent(PhysicsComponent);
      const transform = entity.getComponent(TransformComponent);

      // Actualizar velocidad y posición
      if (!physics.isKinematic) {
        physics.velocity.y -= 9.81 * deltaTime; // Gravity
        transform.translate(
          physics.velocity.x * deltaTime,
          physics.velocity.y * deltaTime,
          physics.velocity.z * deltaTime
        );
      }
    }

    // Update Cannon.js world
    this.world.step(deltaTime);
  }
}

// Ejemplo: AISystem
class AISystem extends System {
  update(deltaTime) {
    const entities = this.entityManager.queryEntitiesWith(
      AIComponent,
      TransformComponent
    );

    for (const entity of entities) {
      const ai = entity.getComponent(AIComponent);
      ai.update(deltaTime);
    }
  }
}
```

---

## 4. WORLD MANAGEMENT

### Spatial Indexing (Quadtree)
Para queries rápidas de "qué está cerca":

```javascript
class World {
  constructor(width = 1000, height = 1000, depth = 1000) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.quadtree = new Quadtree({
      x: -width / 2,
      y: -height / 2,
      w: width,
      h: height
    });
  }

  addEntity(entity) {
    const transform = entity.getComponent(TransformComponent);
    if (transform) {
      this.quadtree.insert({
        entity,
        x: transform.position.x,
        y: transform.position.z,
        w: 10, // Hitbox size
        h: 10
      });
    }
  }

  getNearbyEntities(position, radius) {
    // Retornar entities dentro del radius
    const range = {
      x: position.x - radius,
      y: position.z - radius,
      w: radius * 2,
      h: radius * 2
    };
    return this.quadtree.retrieve(range)
      .map(item => item.entity);
  }

  updateEntity(entity) {
    // Rebuild quadtree o actualizar posición
  }

  removeEntity(entity) {
    // Remover del quadtree
  }
}
```

### Area of Interest (AoI)
Para sincronizar solo entities relevantes a cada jugador:

```javascript
class AoIManager {
  constructor(world, areaOfInterestRadius = 50) {
    this.world = world;
    this.areaRadius = areaOfInterestRadius;
    this.playerVisibility = new Map(); // playerID -> Set<entityID>
  }

  updateAoI(player) {
    const playerId = player.id;
    const transform = player.getComponent(TransformComponent);
    const position = transform.position;

    // Obtener entities cercanas
    const nearbyEntities = this.world.getNearbyEntities(position, this.areaRadius);

    // Actualizar visibility set
    this.playerVisibility.set(playerId, new Set(nearbyEntities.map(e => e.id)));
  }

  getVisibleEntitiesFor(playerId) {
    return this.playerVisibility.get(playerId) || new Set();
  }

  shouldSend(playerId, targetEntityId) {
    const visible = this.playerVisibility.get(playerId);
    return visible && visible.has(targetEntityId);
  }
}
```

---

## 5. EVENT DISPATCHER

### Publish-Subscribe Pattern
```javascript
class EventDispatcher {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
  }

  on(eventName, callback, priority = 0) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push({ callback, priority });
    // Sortear por priority descendente
    this.listeners.get(eventName).sort((a, b) => b.priority - a.priority);
  }

  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  off(eventName, callback) {
    if (!this.listeners.has(eventName)) return;
    const listeners = this.listeners.get(eventName);
    const index = listeners.findIndex(l => l.callback === callback);
    if (index > -1) listeners.splice(index, 1);
  }

  emit(eventName, data) {
    if (!this.listeners.has(eventName)) return;
    const listeners = this.listeners.get(eventName);
    for (const { callback } of listeners) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventName} listener:`, error);
      }
    }
  }

  queueEvent(eventName, data) {
    this.eventQueue.push({ eventName, data });
  }

  flushQueue() {
    while (this.eventQueue.length > 0) {
      const { eventName, data } = this.eventQueue.shift();
      this.emit(eventName, data);
    }
  }
}
```

### Eventos Comunes
```javascript
dispatcher.on('entity:created', ({ entity }) => {
  logger.info(`Entity created: ${entity.id}`);
});

dispatcher.on('entity:destroyed', ({ entity }) => {
  logger.info(`Entity destroyed: ${entity.id}`);
});

dispatcher.on('entity:moved', ({ entity, oldPos, newPos }) => {
  // Sincronizar posición con clientes cercanos
});

dispatcher.on('collision:start', ({ entity1, entity2 }) => {
  // Manejar colisión
});

dispatcher.on('player:entered-aoi', ({ player, other }) => {
  // Enviar paquete al player informando sobre 'other'
});

dispatcher.on('player:left-aoi', ({ player, other }) => {
  // Remover 'other' de vista del player
});
```

---

## 6. AI SYSTEM

### PathFinder (A* Algorithm)
```javascript
class PathFinder {
  constructor(navmesh) {
    this.navmesh = navmesh;
  }

  findPath(startPos, endPos) {
    // Implementar A*
    // Retornar array de waypoints
    return [startPos, ...intermediatePoints, endPos];
  }

  simplifyPath(path) {
    // Remover waypoints innecesarios
  }
}
```

### BehaviorTree
```javascript
class BehaviorNode {
  constructor(name) {
    this.name = name;
    this.status = 'idle'; // idle, running, success, failure
  }

  execute(deltaTime) {
    throw new Error('Subclasses must implement execute');
  }
}

class Selector extends BehaviorNode {
  constructor(name, children) {
    super(name);
    this.children = children;
  }

  execute(deltaTime) {
    // Ejecutar children hasta que uno sea success
    for (const child of this.children) {
      const status = child.execute(deltaTime);
      if (status === 'success') return 'success';
    }
    return 'failure';
  }
}

class Sequence extends BehaviorNode {
  constructor(name, children) {
    super(name);
    this.children = children;
  }

  execute(deltaTime) {
    // Ejecutar todos los children
    for (const child of this.children) {
      const status = child.execute(deltaTime);
      if (status === 'failure') return 'failure';
    }
    return 'success';
  }
}

class Task extends BehaviorNode {
  constructor(name, action) {
    super(name);
    this.action = action;
  }

  execute(deltaTime) {
    return this.action(deltaTime);
  }
}

// Ejemplo: NPC patrullando
const patrolBehavior = new Sequence('patrol', [
  new Task('move-to-point-1', moveToPoint1),
  new Task('wait-2-seconds', wait2Seconds),
  new Task('move-to-point-2', moveToPoint2),
  new Task('wait-2-seconds', wait2Seconds),
]);
```

---

## 7. TESTING

### Unit Tests
```javascript
describe('ECS System', () => {
  describe('Entity', () => {
    test('should add component', () => {
      const entity = new Entity(1);
      const transform = new TransformComponent();
      entity.addComponent(transform);
      
      expect(entity.hasComponent(TransformComponent)).toBe(true);
      expect(entity.getComponent(TransformComponent)).toBe(transform);
    });

    test('should remove component', () => {
      const entity = new Entity(1);
      entity.addComponent(new TransformComponent());
      entity.removeComponent(TransformComponent);
      
      expect(entity.hasComponent(TransformComponent)).toBe(false);
    });
  });

  describe('EntityManager', () => {
    test('should query entities with specific components', () => {
      const manager = new EntityManager();
      const entity1 = manager.createEntity();
      entity1.addComponent(new TransformComponent());
      entity1.addComponent(new PhysicsComponent());

      const entity2 = manager.createEntity();
      entity2.addComponent(new TransformComponent());

      const results = manager.queryEntitiesWith(
        TransformComponent,
        PhysicsComponent
      );
      
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(entity1);
    });
  });

  describe('GameLoop', () => {
    test('should run at 60 FPS', (done) => {
      const loop = new GameLoop(60);
      let tickCount = 0;
      
      const system = {
        onInitialize: () => {},
        update: () => {
          tickCount++;
          if (tickCount >= 60) {
            loop.stop();
            expect(tickCount).toBe(60);
            done();
          }
        }
      };
      
      loop.addSystem(system);
      loop.start();
    });

    test('frame time should be < 16.67ms', (done) => {
      const loop = new GameLoop(60);
      let frameTime = 0;
      
      const system = {
        onInitialize: () => {},
        update: () => {
          // Simulate work
          for (let i = 0; i < 1000000; i++) Math.sqrt(i);
        }
      };
      
      loop.addSystem(system);
      
      // Medir frame time
      const startTime = performance.now();
      setTimeout(() => {
        frameTime = performance.now() - startTime;
        loop.stop();
        
        expect(frameTime / 60).toBeLessThan(16.67 * 1.2); // 20% tolerance
        done();
      }, 1000);
      
      loop.start();
    });
  });
});
```

---

## 8. INTEGRATION CON SISTEMA ACTUAL

### Reemplazar CollisionSystem.js
```javascript
// En game-loop durante PhysicsSystem
physics.rigidbody.addEventListener('collide', (e) => {
  const entity1 = e.body.userData;
  const entity2 = e.target.userData;
  
  dispatcher.emit('collision:start', {
    entity1,
    entity2,
    contact: e.contact
  });
});
```

### Actualizar movementHandler
```javascript
// En sockets/movementHandler.js
socket.on('player:move', (data) => {
  const player = entityManager.getEntity(socket.userId);
  if (!player) return;

  const transform = player.getComponent(TransformComponent);
  const physics = player.getComponent(PhysicsComponent);

  // Aplicar input
  const direction = data.direction;
  const speed = 10; // units/second

  physics.setVelocity(
    direction.x * speed,
    physics.velocity.y,
    direction.z * speed
  );
});
```

---

## 9. ROADMAP DE IMPLEMENTACIÓN

### Phase 2 (Semanas 1-4)
- [ ] ECS + ComponentRegistry
- [ ] GameLoop 60 TPS
- [ ] Basic Systems (Transform, Physics, Render)
- [ ] Unit tests

### Phase 3 (Semanas 5-8)
- [ ] World + Spatial Indexing
- [ ] AoI Manager
- [ ] AI System (PathFinder, BehaviorTree)
- [ ] Integration tests

### Phase 3 Continued (Semanas 9-10)
- [ ] Performance optimization
- [ ] Load testing (1000+ entities)
- [ ] Production ready

---

## 10. CRITERIOS DE ÉXITO

```
✅ Frame time: <16.67ms (60 FPS)
✅ Entity query: <1ms
✅ 1000+ entidades simultáneamente
✅ Network sync <50ms
✅ Tests: 80%+ coverage
✅ Load test: 5000+ usuarios
```

---

**Documento creado:** 2026-03-02  
**Versión:** 1.0-ALPHA  
**Status:** 📝 Especificación Completa

# ⚙️ Game Engine Module

## Descripción
Motor de juego robusto basado en Entity Component System (ECS) con game loop de 60 TPS, world management, y event dispatcher para sincronización en tiempo real.

## Estado del Módulo
- [ ] ⏳ Fase 1: Especificación (Próxima)
- [ ] ⏳ Fase 2: Prototipo (6-8 sem)
- [ ] ⏳ Fase 3: Feature Complete (8-10 sem)
- [ ] ⏳ Fase 4: Tested (80%+)
- [ ] ⏳ Fase 5: Production Ready

**Fase Actual:** 0 - Planeación  
**Estimación:** 14-18 semanas  
**Team Size:** 3-4 devs

## Arquitectura

### Entity Component System (ECS)
```
Entity (ID única)
  ├── Transform Component (posición, rotación, escala)
  ├── Physics Component (velocidad, colisiones)
  ├── Rendering Component (mesh, material, LOD)
  ├── AI Component (state, behavior tree)
  └── Custom Components
```

### Game Loop
```
60 TPS (16.67ms por frame)
├── Input Processing
├── Physics Update
├── AI Update
├── Render Preparation
├── Network Sync
└── Cleanup
```

## Submódulos

### 1. ECS.js - Entity Component System
Gestión de entidades y componentes.

**Clases:**
- `Entity` - Identificador único + componentes
- `Component` - Clase base para componentes
- `ComponentRegistry` - Registro de tipos
- `EntityManager` - Crear/destruir/query entidades
- `System` - Clase base para sistemas

**Métodos:**
```javascript
const entity = entityManager.createEntity();
entity.addComponent(new TransformComponent({ x: 0, y: 0, z: 0 }));
entity.addComponent(new PhysicsComponent());
entity.getComponent(TransformComponent);
entityManager.destroyEntity(entity);
```

### 2. GameLoop.js - Loop de Juego
Sincronización a 60 TPS.

**Features:**
- Fixed timestep (16.67ms)
- Delta time tracking
- System execution order
- Performance profiling

**Métodos:**
```javascript
const loop = new GameLoop(1000/60); // 60 TPS
loop.addSystem(physicsSystem);
loop.addSystem(renderSystem);
loop.start();
```

### 3. World.js - World State
Gestión del mundo y objetos.

**Características:**
- Spatial indexing (Quadtree)
- Object spawning/despawning
- World bounds/dimensions
- Area of Interest (AoI) calculation

**Métodos:**
```javascript
const world = new World({ width: 1000, height: 1000, depth: 1000 });
world.addEntity(entity);
world.getNearbyEntities(position, radius);
```

### 4. EventDispatcher.js - Event System
Publish/Subscribe para eventos.

**Features:**
- Event queuing
- Listener management
- Priority-based execution
- Event bubbling

**Métodos:**
```javascript
dispatcher.on('player:moved', callback);
dispatcher.emit('player:moved', { x, y, z });
dispatcher.once('game:start', callback);
dispatcher.off('player:moved', callback);
```

### 5. AI/ - AI Subsystem
Pathfinding, behavior trees, decision making.

**Componentes:**
- PathFinder.js (A* algorithm)
- BehaviorTree.js (Decision trees)
- NPCScheduler.js (Task scheduling)

## Dependencias

### Internas
- `PacketSystem` (módulo paquetes)
- `Logger` (utils)

### Externas
```json
{
  "cannon.js": "^0.20.0",
  "uuid": "^9.0.1"
}
```

## Integración con Sistema Actual

### Reemplazar/Mejorar:
- `CollisionSystem.js` → Physics Component
- `movementHandler.js` → Input System
- Actualizar Socket.IO handlers

### Mantener compatibilidad:
- API REST existente
- Modelos Sequelize
- Estado de Redux/Zustand en frontend

## Testing

### Unit Tests
```bash
npm test -- tests/unit/gameEngine
```

**Coverage:** 80%+

**Tests principales:**
- [ ] ECS component add/remove
- [ ] Entity querying
- [ ] Game loop tick timing
- [ ] World spatial queries
- [ ] Event dispatcher accuracy
- [ ] AI pathfinding
- [ ] Behavior tree execution
- [ ] Performance <16ms per frame

### Integration Tests
```bash
npm test -- tests/integration/gameEngine-socket
```

## Performance Targets

| Métrica | Target | Status |
|---------|--------|--------|
| Frame time | <16ms | ⏳ |
| Entity query | <1ms | ⏳ |
| Spatial index | <5ms | ⏳ |
| Event dispatch | <2ms | ⏳ |
| Max entities | 10k+ | ⏳ |
| Max players | 1k+ | ⏳ |

## Próximos Pasos

1. ✅ Escribir especificación técnica
2. ⏳ Implementar ECS base (Week 1-2)
3. ⏳ Game loop synchronization (Week 2-3)
4. ⏳ Physics engine integration (Week 3-4)
5. ⏳ AI subsystem (Week 5-6)
6. ⏳ Testing 80%+ coverage (Week 7-8)
7. ⏳ Performance optimization (Week 9-10)
8. ⏳ Production ready (Week 10+)

## Referencias

- [Game Engine Specification](../../docs/technical-specs/GAME-ENGINE-SPEC.md)
- [Architecture Overview](../../docs/architecture/ARCHITECTURE.md)
- [Cannon.js Physics Documentation](https://cannon-es6.io/)

---

**Creado:** 2026-03-02  
**Última actualización:** 2026-03-02  
**Responsable:** Tech Lead

/**
 * Property-Based Tests for Database Schema
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests validate that the database schema correctly persists
 * and retrieves all object types with their JSONB fields intact.
 */

const fc = require('fast-check');
const { sequelize } = require('../../src/config/database');
const InteractiveObject = require('../../src/models/InteractiveObject');
const InteractionNode = require('../../src/models/InteractionNode');
const ObjectTrigger = require('../../src/models/ObjectTrigger');
const InteractionQueue = require('../../src/models/InteractionQueue');
const InteractionLog = require('../../src/models/InteractionLog');
const Avatar = require('../../src/models/Avatar');

// Generators for property-based testing
const positionArb = fc.record({
  x: fc.double({ min: -1000, max: 1000, noNaN: true }),
  y: fc.double({ min: -1000, max: 1000, noNaN: true }),
  z: fc.double({ min: -1000, max: 1000, noNaN: true })
});

const rotationArb = fc.record({
  x: fc.double({ min: 0, max: 360, noNaN: true }),
  y: fc.double({ min: 0, max: 360, noNaN: true }),
  z: fc.double({ min: 0, max: 360, noNaN: true })
});

const scaleArb = fc.record({
  x: fc.double({ min: 0.1, max: 10, noNaN: true }),
  y: fc.double({ min: 0.1, max: 10, noNaN: true }),
  z: fc.double({ min: 0.1, max: 10, noNaN: true })
});

const objectStateArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null)
  )
);

const objectConfigArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean()
  )
);

const interactiveObjectArb = fc.record({
  officeId: fc.integer({ min: 1, max: 1000 }),
  objectType: fc.constantFrom('chair', 'door', 'table', 'furniture'),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  modelPath: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
  position: positionArb,
  rotation: rotationArb,
  scale: scaleArb,
  state: objectStateArb,
  config: objectConfigArb,
  isActive: fc.boolean(),
  createdBy: fc.integer({ min: 1, max: 1000 })
});

const interactionNodeArb = fc.record({
  position: positionArb,
  requiredState: fc.constantFrom('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'),
  isOccupied: fc.boolean(),
  occupiedBy: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
  occupiedAt: fc.option(fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }), { nil: null }),
  maxOccupancy: fc.integer({ min: 1, max: 10 })
});

const objectTriggerArb = fc.record({
  triggerType: fc.constantFrom('state_change', 'grant_xp', 'unlock_achievement', 'teleport'),
  triggerData: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.oneof(fc.string(), fc.integer(), fc.boolean())
  ),
  priority: fc.integer({ min: 0, max: 100 }),
  condition: fc.option(
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.oneof(fc.string(), fc.integer(), fc.boolean())
    ),
    { nil: null }
  ),
  isActive: fc.boolean()
});

const interactionQueueArb = fc.record({
  position: fc.integer({ min: 1, max: 100 }),
  joinedAt: fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
  expiresAt: fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') })
});

const interactionLogArb = fc.record({
  interactionType: fc.string({ minLength: 1, maxLength: 50 }),
  success: fc.boolean(),
  errorMessage: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
  xpGranted: fc.integer({ min: 0, max: 1000 }),
  timestamp: fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') })
});

const avatarStateArb = fc.record({
  currentState: fc.constantFrom('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'),
  previousState: fc.option(
    fc.constantFrom('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'),
    { nil: null }
  ),
  stateChangedAt: fc.option(fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }), { nil: null }),
  interactingWith: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
  sittingAt: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null })
});

// Helper function to compare objects with tolerance for floating point
function deepEqualWithTolerance(obj1, obj2, tolerance = 0.0001) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 === 'number' && typeof obj2 === 'number') {
    return Math.abs(obj1 - obj2) < tolerance;
  }
  
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return Math.abs(obj1.getTime() - obj2.getTime()) < 1000; // 1 second tolerance
  }
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqualWithTolerance(item, obj2[index], tolerance));
  }
  
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => deepEqualWithTolerance(obj1[key], obj2[key], tolerance));
  }
  
  return obj1 === obj2;
}

describe('Database Schema Property Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await sequelize.authenticate();
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Clean up and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await InteractionLog.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionQueue.destroy({ where: {}, truncate: true, cascade: true });
    await ObjectTrigger.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionNode.destroy({ where: {}, truncate: true, cascade: true });
    await InteractiveObject.destroy({ where: {}, truncate: true, cascade: true });
    await Avatar.destroy({ where: {}, truncate: true, cascade: true });
  });

  /**
   * Property 2: Object Persistence Round-Trip
   * 
   * **Validates: Requirements 1.3**
   * 
   * For any interactive object, saving it to the database and then loading it back
   * should produce an equivalent object with all properties preserved, including
   * JSONB fields (position, rotation, scale, state, config).
   */
  describe('Property 2: Object Persistence Round-Trip', () => {
    test('InteractiveObject: save and load preserves all fields', async () => {
      await fc.assert(
        fc.asyncProperty(interactiveObjectArb, async (objectData) => {
          // Save object to database
          const savedObject = await InteractiveObject.create(objectData);
          
          // Load object from database
          const loadedObject = await InteractiveObject.findByPk(savedObject.id);
          
          // Verify all fields are preserved
          expect(loadedObject).not.toBeNull();
          expect(loadedObject.officeId).toBe(objectData.officeId);
          expect(loadedObject.objectType).toBe(objectData.objectType);
          expect(loadedObject.name).toBe(objectData.name);
          expect(loadedObject.modelPath).toBe(objectData.modelPath);
          expect(loadedObject.isActive).toBe(objectData.isActive);
          expect(loadedObject.createdBy).toBe(objectData.createdBy);
          
          // Verify JSONB fields with tolerance for floating point
          expect(deepEqualWithTolerance(loadedObject.position, objectData.position)).toBe(true);
          expect(deepEqualWithTolerance(loadedObject.rotation, objectData.rotation)).toBe(true);
          expect(deepEqualWithTolerance(loadedObject.scale, objectData.scale)).toBe(true);
          expect(deepEqualWithTolerance(loadedObject.state, objectData.state)).toBe(true);
          expect(deepEqualWithTolerance(loadedObject.config, objectData.config)).toBe(true);
        }),
        { numRuns: 20 }
      );
    });

    test('InteractionNode: save and load preserves all fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          interactiveObjectArb,
          interactionNodeArb,
          async (objectData, nodeData) => {
            // Create parent object first
            const savedObject = await InteractiveObject.create(objectData);
            
            // Save node to database
            const savedNode = await InteractionNode.create({
              ...nodeData,
              objectId: savedObject.id
            });
            
            // Load node from database
            const loadedNode = await InteractionNode.findByPk(savedNode.id);
            
            // Verify all fields are preserved
            expect(loadedNode).not.toBeNull();
            expect(loadedNode.objectId).toBe(savedObject.id);
            expect(loadedNode.requiredState).toBe(nodeData.requiredState);
            expect(loadedNode.isOccupied).toBe(nodeData.isOccupied);
            expect(loadedNode.occupiedBy).toBe(nodeData.occupiedBy);
            expect(loadedNode.maxOccupancy).toBe(nodeData.maxOccupancy);
            
            // Verify JSONB position field
            expect(deepEqualWithTolerance(loadedNode.position, nodeData.position)).toBe(true);
            
            // Verify date fields with tolerance
            if (nodeData.occupiedAt) {
              expect(Math.abs(loadedNode.occupiedAt.getTime() - nodeData.occupiedAt.getTime())).toBeLessThan(1000);
            } else {
              expect(loadedNode.occupiedAt).toBeNull();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    test('ObjectTrigger: save and load preserves all fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          interactiveObjectArb,
          objectTriggerArb,
          async (objectData, triggerData) => {
            // Create parent object first
            const savedObject = await InteractiveObject.create(objectData);
            
            // Save trigger to database
            const savedTrigger = await ObjectTrigger.create({
              ...triggerData,
              objectId: savedObject.id
            });
            
            // Load trigger from database
            const loadedTrigger = await ObjectTrigger.findByPk(savedTrigger.id);
            
            // Verify all fields are preserved
            expect(loadedTrigger).not.toBeNull();
            expect(loadedTrigger.objectId).toBe(savedObject.id);
            expect(loadedTrigger.triggerType).toBe(triggerData.triggerType);
            expect(loadedTrigger.priority).toBe(triggerData.priority);
            expect(loadedTrigger.isActive).toBe(triggerData.isActive);
            
            // Verify JSONB fields
            expect(deepEqualWithTolerance(loadedTrigger.triggerData, triggerData.triggerData)).toBe(true);
            expect(deepEqualWithTolerance(loadedTrigger.condition, triggerData.condition)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('InteractionQueue: save and load preserves all fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          interactiveObjectArb,
          interactionNodeArb,
          interactionQueueArb,
          async (objectData, nodeData, queueData) => {
            // Create parent object and node first
            const savedObject = await InteractiveObject.create(objectData);
            const savedNode = await InteractionNode.create({
              ...nodeData,
              objectId: savedObject.id
            });
            
            // Save queue entry to database
            const savedQueue = await InteractionQueue.create({
              ...queueData,
              objectId: savedObject.id,
              nodeId: savedNode.id,
              userId: 1 // Fixed user ID for testing
            });
            
            // Load queue entry from database
            const loadedQueue = await InteractionQueue.findByPk(savedQueue.id);
            
            // Verify all fields are preserved
            expect(loadedQueue).not.toBeNull();
            expect(loadedQueue.objectId).toBe(savedObject.id);
            expect(loadedQueue.nodeId).toBe(savedNode.id);
            expect(loadedQueue.userId).toBe(1);
            expect(loadedQueue.position).toBe(queueData.position);
            
            // Verify date fields with tolerance
            expect(Math.abs(loadedQueue.joinedAt.getTime() - queueData.joinedAt.getTime())).toBeLessThan(1000);
            expect(Math.abs(loadedQueue.expiresAt.getTime() - queueData.expiresAt.getTime())).toBeLessThan(1000);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('InteractionLog: save and load preserves all fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          interactiveObjectArb,
          interactionLogArb,
          async (objectData, logData) => {
            // Create parent object first
            const savedObject = await InteractiveObject.create(objectData);
            
            // Save log entry to database
            const savedLog = await InteractionLog.create({
              ...logData,
              objectId: savedObject.id,
              userId: 1 // Fixed user ID for testing
            });
            
            // Load log entry from database
            const loadedLog = await InteractionLog.findByPk(savedLog.id);
            
            // Verify all fields are preserved
            expect(loadedLog).not.toBeNull();
            expect(loadedLog.objectId).toBe(savedObject.id);
            expect(loadedLog.userId).toBe(1);
            expect(loadedLog.interactionType).toBe(logData.interactionType);
            expect(loadedLog.success).toBe(logData.success);
            expect(loadedLog.errorMessage).toBe(logData.errorMessage);
            expect(loadedLog.xpGranted).toBe(logData.xpGranted);
            
            // Verify date field with tolerance
            expect(Math.abs(loadedLog.timestamp.getTime() - logData.timestamp.getTime())).toBeLessThan(1000);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Avatar: save and load preserves state fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          avatarStateArb,
          async (stateData) => {
            // Save avatar to database with state fields
            const savedAvatar = await Avatar.create({
              userId: 1, // Fixed user ID for testing
              ...stateData
            });
            
            // Load avatar from database
            const loadedAvatar = await Avatar.findByPk(savedAvatar.id);
            
            // Verify all state fields are preserved
            expect(loadedAvatar).not.toBeNull();
            expect(loadedAvatar.userId).toBe(1);
            expect(loadedAvatar.currentState).toBe(stateData.currentState);
            expect(loadedAvatar.previousState).toBe(stateData.previousState);
            expect(loadedAvatar.interactingWith).toBe(stateData.interactingWith);
            expect(loadedAvatar.sittingAt).toBe(stateData.sittingAt);
            
            // Verify date field with tolerance
            if (stateData.stateChangedAt) {
              expect(Math.abs(loadedAvatar.stateChangedAt.getTime() - stateData.stateChangedAt.getTime())).toBeLessThan(1000);
            } else {
              expect(loadedAvatar.stateChangedAt).toBeNull();
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

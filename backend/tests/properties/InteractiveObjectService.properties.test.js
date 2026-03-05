/**
 * Property-Based Tests for InteractiveObjectService
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests validate the InteractiveObjectService behavior across
 * a wide range of inputs using property-based testing with fast-check.
 */

const fc = require('fast-check');
const { sequelize } = require('../../src/config/database');
const InteractiveObjectService = require('../../src/services/InteractiveObjectService');
const InteractiveObject = require('../../src/models/InteractiveObject');
const InteractionNode = require('../../src/models/InteractionNode');
const ObjectTrigger = require('../../src/models/ObjectTrigger');

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
    fc.boolean()
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

const objectDataArb = fc.record({
  objectType: fc.constantFrom('chair', 'door', 'table', 'furniture'),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  modelPath: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
  position: positionArb,
  rotation: rotationArb,
  scale: scaleArb,
  state: objectStateArb,
  config: objectConfigArb,
  isActive: fc.boolean()
});

const nodeDataArb = fc.record({
  position: positionArb,
  requiredState: fc.constantFrom('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'),
  maxOccupancy: fc.integer({ min: 1, max: 10 })
});

// Helper function to compare objects with tolerance for floating point
function deepEqualWithTolerance(obj1, obj2, tolerance = 0.0001) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 === 'number' && typeof obj2 === 'number') {
    return Math.abs(obj1 - obj2) < tolerance;
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

describe('InteractiveObjectService Property Tests', () => {
  // Use the singleton service instance
  const service = InteractiveObjectService;

  beforeAll(async () => {
    // Ensure database connection is established
    await sequelize.authenticate();
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: true });
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Clean up and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await ObjectTrigger.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionNode.destroy({ where: {}, truncate: true, cascade: true });
    await InteractiveObject.destroy({ where: {}, truncate: true, cascade: true });
  });

  /**
   * Property 1: Object Creation Completeness
   * 
   * **Validates: Requirements 1.1, 1.2, 1.6**
   * 
   * For any valid object data, creating an object through the service should:
   * 1. Assign a unique identifier
   * 2. Store all provided properties correctly
   * 3. Ensure at least one interaction node exists (if nodes are provided)
   */
  describe('Property 1: Object Creation Completeness', () => {
    test('created objects have unique IDs and preserve all properties', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId
          async (officeId, objectData, userId) => {
            // Create object through service
            const createdObject = await service.createObject(officeId, objectData, userId);
            
            // Verify unique ID is assigned (Requirement 1.2)
            expect(createdObject.id).toBeDefined();
            expect(typeof createdObject.id).toBe('number');
            expect(createdObject.id).toBeGreaterThan(0);
            
            // Verify all properties are stored correctly (Requirement 1.1)
            expect(createdObject.officeId).toBe(officeId);
            expect(createdObject.objectType).toBe(objectData.objectType);
            expect(createdObject.name).toBe(objectData.name);
            expect(createdObject.modelPath).toBe(objectData.modelPath);
            expect(createdObject.isActive).toBe(objectData.isActive);
            expect(createdObject.createdBy).toBe(userId);
            
            // Verify JSONB fields with tolerance for floating point
            expect(deepEqualWithTolerance(createdObject.position, objectData.position)).toBe(true);
            expect(deepEqualWithTolerance(createdObject.rotation, objectData.rotation)).toBe(true);
            expect(deepEqualWithTolerance(createdObject.scale, objectData.scale)).toBe(true);
            expect(deepEqualWithTolerance(createdObject.state, objectData.state)).toBe(true);
            expect(deepEqualWithTolerance(createdObject.config, objectData.config)).toBe(true);
            
            // Verify object can be retrieved
            const retrievedObject = await service.getObject(createdObject.id);
            expect(retrievedObject).not.toBeNull();
            expect(retrievedObject.id).toBe(createdObject.id);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('objects with nodes maintain invariant of at least one valid node', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId
          fc.array(nodeDataArb, { minLength: 1, maxLength: 5 }), // nodes
          async (officeId, objectData, userId, nodesData) => {
            // Create object through service
            const createdObject = await service.createObject(officeId, objectData, userId);
            
            // Add interaction nodes
            const createdNodes = [];
            for (const nodeData of nodesData) {
              const node = await service.addInteractionNode(createdObject.id, nodeData);
              createdNodes.push(node);
            }
            
            // Verify invariant: at least one valid node exists (Requirement 1.6)
            const availableNodes = await service.getAvailableNodes(createdObject.id);
            expect(availableNodes.length).toBeGreaterThanOrEqual(1);
            expect(availableNodes.length).toBe(nodesData.length);
            
            // Verify all nodes are valid
            for (const node of availableNodes) {
              expect(node.objectId).toBe(createdObject.id);
              expect(node.position).toBeDefined();
              expect(node.position.x).toBeDefined();
              expect(node.position.y).toBeDefined();
              expect(node.position.z).toBeDefined();
              expect(node.requiredState).toBeDefined();
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 4: Multiple Interaction Nodes
   * 
   * **Validates: Requirements 2.1, 2.3**
   * 
   * An object can have multiple interaction nodes, and each node should:
   * 1. Have valid 3D coordinates relative to the object
   * 2. Be associated with a required avatar state
   */
  describe('Property 4: Multiple Interaction Nodes', () => {
    test('objects support multiple nodes with valid coordinates and states', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId
          fc.array(nodeDataArb, { minLength: 1, maxLength: 10 }), // multiple nodes
          async (officeId, objectData, userId, nodesData) => {
            // Create object
            const createdObject = await service.createObject(officeId, objectData, userId);
            
            // Add multiple interaction nodes (Requirement 2.1)
            const createdNodes = [];
            for (const nodeData of nodesData) {
              const node = await service.addInteractionNode(createdObject.id, nodeData);
              createdNodes.push(node);
            }
            
            // Verify all nodes were created
            expect(createdNodes.length).toBe(nodesData.length);
            
            // Verify each node has valid coordinates and state (Requirement 2.3)
            for (let i = 0; i < createdNodes.length; i++) {
              const node = createdNodes[i];
              const nodeData = nodesData[i];
              
              // Verify 3D coordinates
              expect(node.position).toBeDefined();
              expect(deepEqualWithTolerance(node.position, nodeData.position)).toBe(true);
              
              // Verify required state association
              expect(node.requiredState).toBe(nodeData.requiredState);
              expect(['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'])
                .toContain(node.requiredState);
              
              // Verify node is associated with the object
              expect(node.objectId).toBe(createdObject.id);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 6: Concurrent Node Occupancy
   * 
   * **Validates: Requirements 2.4**
   * 
   * When multiple interaction nodes exist on an object, different users
   * should be able to occupy different nodes simultaneously.
   */
  describe('Property 6: Concurrent Node Occupancy', () => {
    test('multiple users can occupy different nodes on the same object', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId (object creator)
          fc.array(nodeDataArb, { minLength: 2, maxLength: 5 }), // multiple nodes
          fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 5 }), // user IDs
          async (officeId, objectData, userId, nodesData, userIds) => {
            // Ensure we have at least as many nodes as users
            const numUsers = Math.min(userIds.length, nodesData.length);
            const uniqueUserIds = [...new Set(userIds)].slice(0, numUsers);
            
            if (uniqueUserIds.length < 2) {
              // Skip if we don't have at least 2 unique users
              return;
            }
            
            // Create object with multiple nodes
            const createdObject = await service.createObject(officeId, objectData, userId);
            
            const createdNodes = [];
            for (const nodeData of nodesData.slice(0, numUsers)) {
              const node = await service.addInteractionNode(createdObject.id, nodeData);
              createdNodes.push(node);
            }
            
            // Occupy different nodes with different users (Requirement 2.4)
            const occupiedNodes = [];
            for (let i = 0; i < uniqueUserIds.length; i++) {
              const node = createdNodes[i];
              const occupyingUserId = uniqueUserIds[i];
              
              const occupiedNode = await service.occupyNode(node.id, occupyingUserId);
              occupiedNodes.push(occupiedNode);
            }
            
            // Verify all nodes are occupied by different users
            for (let i = 0; i < occupiedNodes.length; i++) {
              const node = occupiedNodes[i];
              const expectedUserId = uniqueUserIds[i];
              
              expect(node.isOccupied).toBe(true);
              expect(node.occupiedBy).toBe(expectedUserId);
              expect(node.occupiedAt).toBeDefined();
            }
            
            // Verify nodes are occupied by different users
            const occupyingUsers = occupiedNodes.map(n => n.occupiedBy);
            const uniqueOccupyingUsers = new Set(occupyingUsers);
            expect(uniqueOccupyingUsers.size).toBe(occupiedNodes.length);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 7: Node Occupancy State
   * 
   * **Validates: Requirements 2.5, 3.4, 3.5**
   * 
   * When a node is occupied or released, the system should:
   * 1. Mark the node as occupied when a user occupies it
   * 2. Update the object state to reflect node occupancy
   * 3. Mark the node as free when the user releases it
   */
  describe('Property 7: Node Occupancy State', () => {
    test('occupying a node marks it as occupied and updates state', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId (object creator)
          nodeDataArb,
          fc.integer({ min: 1, max: 1000 }), // occupying user ID
          async (officeId, objectData, userId, nodeData, occupyingUserId) => {
            // Create object with a node
            const createdObject = await service.createObject(officeId, objectData, userId);
            const createdNode = await service.addInteractionNode(createdObject.id, nodeData);
            
            // Verify node is initially not occupied
            expect(createdNode.isOccupied).toBe(false);
            expect(createdNode.occupiedBy).toBeNull();
            
            // Occupy the node (Requirement 2.5)
            const occupiedNode = await service.occupyNode(createdNode.id, occupyingUserId);
            
            // Verify node is marked as occupied (Requirement 3.4)
            expect(occupiedNode.isOccupied).toBe(true);
            expect(occupiedNode.occupiedBy).toBe(occupyingUserId);
            expect(occupiedNode.occupiedAt).toBeDefined();
            expect(occupiedNode.occupiedAt).toBeInstanceOf(Date);
            
            // Release the node
            const releasedNode = await service.releaseNode(createdNode.id, occupyingUserId);
            
            // Verify node is marked as free (Requirement 3.5)
            expect(releasedNode.isOccupied).toBe(false);
            expect(releasedNode.occupiedBy).toBeNull();
            expect(releasedNode.occupiedAt).toBeNull();
          }
        ),
        { numRuns: 20 }
      );
    });

    test('occupancy state persists across service calls', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }), // officeId
          objectDataArb,
          fc.integer({ min: 1, max: 1000 }), // userId (object creator)
          nodeDataArb,
          fc.integer({ min: 1, max: 1000 }), // occupying user ID
          async (officeId, objectData, userId, nodeData, occupyingUserId) => {
            // Create object with a node
            const createdObject = await service.createObject(officeId, objectData, userId);
            const createdNode = await service.addInteractionNode(createdObject.id, nodeData);
            
            // Occupy the node
            await service.occupyNode(createdNode.id, occupyingUserId);
            
            // Retrieve the node directly to check occupancy state
            const occupiedNodeCheck = await InteractionNode.findByPk(createdNode.id);
            
            expect(occupiedNodeCheck.isOccupied).toBe(true);
            expect(occupiedNodeCheck.occupiedBy).toBe(occupyingUserId);
            
            // Retrieve available nodes - should not include occupied node
            const availableNodes = await service.getAvailableNodes(createdObject.id);
            expect(availableNodes.length).toBe(0); // No available nodes since the only one is occupied
            
            // Release the node
            await service.releaseNode(createdNode.id, occupyingUserId);
            
            // Retrieve available nodes - should now include the released node
            const availableNodesAfter = await service.getAvailableNodes(createdObject.id);
            
            expect(availableNodesAfter.length).toBe(1);
            expect(availableNodesAfter[0].id).toBe(createdNode.id);
            expect(availableNodesAfter[0].occupiedBy).toBeNull();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

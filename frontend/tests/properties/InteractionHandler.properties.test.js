/**
 * Property-Based Tests for InteractionHandler
 */

const fc = require('fast-check');

// Mock Three.js dependencies
const mockThree = {
  Raycaster: class {
    setFromCamera() {}
    intersectObjects() { return []; }
  },
  Vector2: class {
    set() {}
  }
};

// Mock InteractionHandler with Three.js mocked
jest.mock('three', () => mockThree);

const InteractionHandler = require('../../src/systems/InteractionHandler');

describe('InteractionHandler - Property Tests', () => {
  /**
   * Property 37: Click Detection
   * Validates: Requirements 13.1
   */
  test('Property 37: Registered objects can be found', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            x: fc.float({ min: -50, max: 50 }),
            z: fc.float({ min: -50, max: 50 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (objects) => {
          const mockCamera = {};
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          // Register all objects
          objects.forEach(obj => {
            const mockMesh = { userData: {} };
            handler.registerObject(obj.id, mockMesh, {
              position: { x: obj.x, z: obj.z }
            });
          });
          
          // All objects should be registered
          expect(handler.interactiveObjects.size).toBe(objects.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 38: Range-Based Interaction Behavior
   * Validates: Requirements 13.2, 13.3
   */
  test('Property 38: Proximity detection works within radius', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 0, max: 1.5 }), // Within proximity radius
        (centerX, centerZ, offset) => {
          const mockCamera = { position: { x: centerX, z: centerZ } };
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          // Register object within proximity
          const mockMesh = { userData: {} };
          handler.registerObject('nearObj', mockMesh, {
            position: { x: centerX + offset, z: centerZ }
          });
          
          const nearbyObj = handler.findNearbyObject({ x: centerX, z: centerZ });
          
          expect(nearbyObj).not.toBeNull();
          expect(nearbyObj.id).toBe('nearObj');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 40: Proximity Search for Key Interaction
   * Validates: Requirements 14.1, 14.2
   */
  test('Property 40: Objects outside radius are not found', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: 3, max: 10 }), // Outside proximity radius
        (centerX, centerZ, offset) => {
          const mockCamera = { position: { x: centerX, z: centerZ } };
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          // Register object outside proximity
          const mockMesh = { userData: {} };
          handler.registerObject('farObj', mockMesh, {
            position: { x: centerX + offset, z: centerZ }
          });
          
          const nearbyObj = handler.findNearbyObject({ x: centerX, z: centerZ });
          
          expect(nearbyObj).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Unregistered objects are removed
   */
  test('Property: Unregistered objects cannot be found', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (objId, x, z) => {
          const mockCamera = {};
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          const mockMesh = { userData: {} };
          handler.registerObject(objId, mockMesh, { position: { x, z } });
          
          expect(handler.interactiveObjects.has(objId)).toBe(true);
          
          handler.unregisterObject(objId);
          
          expect(handler.interactiveObjects.has(objId)).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Nearby objects are sorted by distance
   */
  test('Property: Nearby objects list is sorted by distance', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50 }),
        fc.float({ min: -50, max: 50 }),
        (centerX, centerZ) => {
          const mockCamera = {};
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          // Register multiple objects at different distances
          handler.registerObject('obj1', { userData: {} }, {
            position: { x: centerX + 0.5, z: centerZ }
          });
          handler.registerObject('obj2', { userData: {} }, {
            position: { x: centerX + 1.5, z: centerZ }
          });
          handler.registerObject('obj3', { userData: {} }, {
            position: { x: centerX + 1.0, z: centerZ }
          });
          
          handler.updateNearbyObjects({ x: centerX, z: centerZ });
          const nearby = handler.getNearbyObjects();
          
          // Should be sorted by distance
          for (let i = 0; i < nearby.length - 1; i++) {
            expect(nearby[i].distance).toBeLessThanOrEqual(nearby[i + 1].distance);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Callbacks are notified on interaction
   */
  test('Property: Interaction callbacks receive correct data', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          type: fc.constantFrom('chair', 'door', 'computer')
        }),
        (objId, objData) => {
          const mockCamera = {};
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          let callbackCalled = false;
          let receivedId = null;
          let receivedData = null;
          
          handler.onInteraction((action, id, data) => {
            callbackCalled = true;
            receivedId = id;
            receivedData = data;
          });
          
          handler.registerObject(objId, { userData: {} }, objData);
          handler.executeInteraction(objId, objData);
          
          expect(callbackCalled).toBe(true);
          expect(receivedId).toBe(objId);
          expect(receivedData).toEqual(objData);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Highlight callbacks are notified
   */
  test('Property: Highlight callbacks receive correct state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (objId) => {
          const mockCamera = {};
          const mockScene = {};
          const mockSocket = { emit: jest.fn() };
          
          const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
          
          let highlightCalled = false;
          let receivedId = null;
          let receivedState = null;
          
          handler.onHighlight((id, isHighlighted) => {
            highlightCalled = true;
            receivedId = id;
            receivedState = isHighlighted;
          });
          
          const mockMesh = { userData: {}, material: { emissive: { setHex: jest.fn() } } };
          handler.registerObject(objId, mockMesh, {});
          
          handler.highlightObject(objId);
          
          expect(highlightCalled).toBe(true);
          expect(receivedId).toBe(objId);
          expect(receivedState).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});

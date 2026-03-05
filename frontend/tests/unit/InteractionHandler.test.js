/**
 * Unit Tests for InteractionHandler
 */

// Mock Three.js
const mockThree = {
  Raycaster: class {
    constructor() {
      this.intersects = [];
    }
    setFromCamera() {}
    intersectObjects() { return this.intersects; }
  },
  Vector2: class {
    constructor() {
      this.x = 0;
      this.y = 0;
    }
    set(x, y) {
      this.x = x;
      this.y = y;
    }
  }
};

jest.mock('three', () => mockThree);

const InteractionHandler = require('../../src/systems/InteractionHandler');

describe('InteractionHandler - Unit Tests', () => {
  let mockCamera, mockScene, mockSocket;

  beforeEach(() => {
    mockCamera = { position: { x: 0, z: 0 } };
    mockScene = {};
    mockSocket = { emit: jest.fn() };
    
    // Reset DOM mocks
    document.body.style.cursor = 'default';
  });

  describe('Object Registration', () => {
    test('registers interactive object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = { userData: {} };
      
      handler.registerObject('obj1', mockMesh, { name: 'Chair' });
      
      expect(handler.interactiveObjects.has('obj1')).toBe(true);
      expect(mockMesh.userData.interactiveId).toBe('obj1');
      expect(mockMesh.userData.isInteractive).toBe(true);
    });

    test('unregisters interactive object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = { userData: {} };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.unregisterObject('obj1');
      
      expect(handler.interactiveObjects.has('obj1')).toBe(false);
    });

    test('unhighlights object on unregister', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = {
        userData: {},
        material: { emissive: { setHex: jest.fn() } }
      };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.highlightObject('obj1');
      handler.unregisterObject('obj1');
      
      expect(handler.interactiveObjects.has('obj1')).toBe(false);
    });
  });

  describe('Proximity Detection', () => {
    test('finds nearby object within radius', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 1, z: 1 }
      });
      
      const nearby = handler.findNearbyObject({ x: 0, z: 0 });
      
      expect(nearby).not.toBeNull();
      expect(nearby.id).toBe('obj1');
    });

    test('does not find object outside radius', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 10, z: 10 }
      });
      
      const nearby = handler.findNearbyObject({ x: 0, z: 0 });
      
      expect(nearby).toBeNull();
    });

    test('finds closest object when multiple nearby', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 1.5, z: 0 }
      });
      handler.registerObject('obj2', { userData: {} }, {
        position: { x: 0.5, z: 0 }
      });
      
      const nearby = handler.findNearbyObject({ x: 0, z: 0 });
      
      expect(nearby.id).toBe('obj2'); // Closer object
    });

    test('returns null when no objects registered', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      const nearby = handler.findNearbyObject({ x: 0, z: 0 });
      
      expect(nearby).toBeNull();
    });
  });

  describe('Nearby Objects Update', () => {
    test('updates nearby objects list', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 1, z: 1 }
      });
      handler.registerObject('obj2', { userData: {} }, {
        position: { x: 10, z: 10 }
      });
      
      handler.updateNearbyObjects({ x: 0, z: 0 });
      const nearby = handler.getNearbyObjects();
      
      expect(nearby.length).toBe(1);
      expect(nearby[0].id).toBe('obj1');
    });

    test('sorts nearby objects by distance', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 1.5, z: 0 }
      });
      handler.registerObject('obj2', { userData: {} }, {
        position: { x: 0.5, z: 0 }
      });
      handler.registerObject('obj3', { userData: {} }, {
        position: { x: 1.0, z: 0 }
      });
      
      handler.updateNearbyObjects({ x: 0, z: 0 });
      const nearby = handler.getNearbyObjects();
      
      expect(nearby[0].id).toBe('obj2');
      expect(nearby[1].id).toBe('obj3');
      expect(nearby[2].id).toBe('obj1');
    });

    test('includes distance in nearby objects', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 3, z: 4 }
      });
      
      handler.updateNearbyObjects({ x: 0, z: 0 });
      const nearby = handler.getNearbyObjects();
      
      expect(nearby[0].distance).toBeCloseTo(5, 1); // 3-4-5 triangle
    });
  });

  describe('Interaction Execution', () => {
    test('executes interaction within range', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 1, z: 1 }
      });
      
      handler.initiateInteraction('obj1', { position: { x: 1, z: 1 } });
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'interaction:request',
        expect.objectContaining({ objectId: 'obj1' })
      );
    });

    test('triggers pathfinding for distant object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {
        position: { x: 10, z: 10 }
      });
      
      handler.initiateInteraction('obj1', { position: { x: 10, z: 10 } });
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'interaction:pathfind',
        expect.objectContaining({ objectId: 'obj1' })
      );
    });

    test('emits interaction request to server', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.executeInteraction('obj1', { name: 'Chair' });
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'interaction:request',
        expect.objectContaining({
          objectId: 'obj1',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Object Highlighting', () => {
    test('highlights object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = {
        userData: {},
        material: {
          emissive: { setHex: jest.fn() }
        }
      };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.highlightObject('obj1');
      
      expect(mockMesh.material.emissive.setHex).toHaveBeenCalledWith(0x444444);
      expect(handler.highlightedObject).toBe('obj1');
    });

    test('unhighlights object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = {
        userData: {},
        material: {
          emissive: { setHex: jest.fn() }
        }
      };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.highlightObject('obj1');
      handler.unhighlightObject('obj1');
      
      expect(mockMesh.material.emissive.setHex).toHaveBeenCalledWith(0x000000);
    });

    test('does not highlight already highlighted object', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = {
        userData: {},
        material: {
          emissive: { setHex: jest.fn() }
        }
      };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.highlightObject('obj1');
      
      mockMesh.material.emissive.setHex.mockClear();
      
      handler.highlightObject('obj1');
      
      expect(mockMesh.material.emissive.setHex).not.toHaveBeenCalled();
    });

    test('handles object without material', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      const mockMesh = { userData: {} };
      
      handler.registerObject('obj1', mockMesh, {});
      
      expect(() => handler.highlightObject('obj1')).not.toThrow();
    });
  });

  describe('Normalized Mouse Position', () => {
    test('converts screen coordinates to normalized coordinates', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      // Mock window dimensions
      global.innerWidth = 800;
      global.innerHeight = 600;
      
      const normalized = handler.getNormalizedMousePosition({
        clientX: 400,
        clientY: 300
      });
      
      expect(normalized.x).toBe(0); // Center X
      expect(normalized.y).toBe(0); // Center Y
    });

    test('handles top-left corner', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      global.innerWidth = 800;
      global.innerHeight = 600;
      
      const normalized = handler.getNormalizedMousePosition({
        clientX: 0,
        clientY: 0
      });
      
      expect(normalized.x).toBe(-1);
      expect(normalized.y).toBe(1);
    });

    test('handles bottom-right corner', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      global.innerWidth = 800;
      global.innerHeight = 600;
      
      const normalized = handler.getNormalizedMousePosition({
        clientX: 800,
        clientY: 600
      });
      
      expect(normalized.x).toBe(1);
      expect(normalized.y).toBe(-1);
    });
  });

  describe('Callbacks', () => {
    test('calls interaction callback', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      let callbackCalled = false;
      
      handler.onInteraction(() => {
        callbackCalled = true;
      });
      
      handler.executeInteraction('obj1', {});
      
      expect(callbackCalled).toBe(true);
    });

    test('passes correct parameters to interaction callback', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      let receivedAction = null;
      let receivedId = null;
      let receivedData = null;
      
      handler.onInteraction((action, id, data) => {
        receivedAction = action;
        receivedId = id;
        receivedData = data;
      });
      
      handler.executeInteraction('obj1', { name: 'Chair' });
      
      expect(receivedAction).toBe('execute');
      expect(receivedId).toBe('obj1');
      expect(receivedData).toEqual({ name: 'Chair' });
    });

    test('calls highlight callback', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      let callbackCalled = false;
      
      handler.onHighlight(() => {
        callbackCalled = true;
      });
      
      const mockMesh = {
        userData: {},
        material: { emissive: { setHex: jest.fn() } }
      };
      
      handler.registerObject('obj1', mockMesh, {});
      handler.highlightObject('obj1');
      
      expect(callbackCalled).toBe(true);
    });

    test('handles callback errors gracefully', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.onInteraction(() => {
        throw new Error('Callback error');
      });
      
      expect(() => handler.executeInteraction('obj1', {})).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    test('removes event listeners on dispose', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      handler.dispose();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    test('clears all objects on dispose', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.registerObject('obj1', { userData: {} }, {});
      handler.registerObject('obj2', { userData: {} }, {});
      
      handler.dispose();
      
      expect(handler.interactiveObjects.size).toBe(0);
    });

    test('clears callbacks on dispose', () => {
      const handler = new InteractionHandler(mockCamera, mockScene, mockSocket);
      
      handler.onInteraction(() => {});
      handler.onHighlight(() => {});
      
      handler.dispose();
      
      expect(handler.onInteractionCallbacks.length).toBe(0);
      expect(handler.onHighlightCallbacks.length).toBe(0);
    });
  });
});

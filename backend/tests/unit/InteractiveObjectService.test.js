/**
 * Unit Tests for InteractiveObjectService
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests verify specific scenarios and edge cases for InteractiveObjectService:
 * - Object creation with valid and invalid data
 * - Node occupancy and release
 * - Trigger execution order
 * - Error handling for invalid operations
 * 
 * Requirements: 1.1, 2.1, 4.2
 */

const { sequelize } = require('../../src/config/database');
const InteractiveObjectService = require('../../src/services/InteractiveObjectService');
const {
  InteractiveObject,
  InteractionNode,
  ObjectTrigger,
  InteractionLog
} = require('../../src/models');

describe('InteractiveObjectService Unit Tests', () => {
  const service = InteractiveObjectService;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  }, 30000);

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await ObjectTrigger.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionNode.destroy({ where: {}, truncate: true, cascade: true });
    await InteractiveObject.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionLog.destroy({ where: {}, truncate: true, cascade: true });
  });

  // ==================== Object Creation Tests ====================

  describe('Object Creation with Valid Data', () => {
    test('should create object with all valid fields', async () => {
      const objectData = {
        objectType: 'chair',
        name: 'Office Chair',
        modelPath: '/models/chair.glb',
        position: { x: 10, y: 0, z: 5 },
        rotation: { x: 0, y: 90, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        state: { color: 'blue' },
        config: { comfort: 'high' },
        isActive: true
      };

      const object = await service.createObject(1, objectData, 1);

      expect(object.id).toBeDefined();
      expect(object.officeId).toBe(1);
      expect(object.objectType).toBe('chair');
      expect(object.name).toBe('Office Chair');
      expect(object.modelPath).toBe('/models/chair.glb');
      expect(object.position).toEqual({ x: 10, y: 0, z: 5 });
      expect(object.rotation).toEqual({ x: 0, y: 90, z: 0 });
      expect(object.scale).toEqual({ x: 1, y: 1, z: 1 });
      expect(object.state).toEqual({ color: 'blue' });
      expect(object.config).toEqual({ comfort: 'high' });
      expect(object.isActive).toBe(true);
      expect(object.createdBy).toBe(1);
    });

    test('should create object with minimal required fields', async () => {
      const objectData = {
        objectType: 'table',
        name: 'Conference Table'
      };

      const object = await service.createObject(1, objectData, 1);

      expect(object.id).toBeDefined();
      expect(object.objectType).toBe('table');
      expect(object.name).toBe('Conference Table');
      expect(object.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(object.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(object.scale).toEqual({ x: 1, y: 1, z: 1 });
      expect(object.state).toEqual({});
      expect(object.config).toEqual({});
      expect(object.isActive).toBe(true);
    });

    test('should create objects of all valid types', async () => {
      const validTypes = ['chair', 'door', 'table', 'furniture'];

      for (const type of validTypes) {
        const object = await service.createObject(1, {
          objectType: type,
          name: `Test ${type}`
        }, 1);

        expect(object.objectType).toBe(type);
      }
    });
  });

  describe('Object Creation with Invalid Data', () => {
    test('should reject creation without objectType', async () => {
      await expect(
        service.createObject(1, { name: 'Test Object' }, 1)
      ).rejects.toThrow('objectType and name are required');
    });

    test('should reject creation without name', async () => {
      await expect(
        service.createObject(1, { objectType: 'chair' }, 1)
      ).rejects.toThrow('objectType and name are required');
    });

    test('should reject invalid objectType', async () => {
      await expect(
        service.createObject(1, {
          objectType: 'invalid_type',
          name: 'Test Object'
        }, 1)
      ).rejects.toThrow('Invalid objectType');
    });

    test('should reject invalid position (non-numeric coordinates)', async () => {
      await expect(
        service.createObject(1, {
          objectType: 'chair',
          name: 'Test Chair',
          position: { x: 'invalid', y: 0, z: 0 }
        }, 1)
      ).rejects.toThrow('Position must have numeric x, y, z coordinates');
    });

    test('should reject position with missing coordinates', async () => {
      await expect(
        service.createObject(1, {
          objectType: 'chair',
          name: 'Test Chair',
          position: { x: 10, y: 0 } // missing z
        }, 1)
      ).rejects.toThrow('Position must have numeric x, y, z coordinates');
    });

    test('should reject position with coordinates out of bounds', async () => {
      await expect(
        service.createObject(1, {
          objectType: 'chair',
          name: 'Test Chair',
          position: { x: 20000, y: 0, z: 0 } // exceeds MAX_COORD
        }, 1)
      ).rejects.toThrow('Position coordinates must be within');
    });
  });

  // ==================== Node Occupancy Tests ====================

  describe('Node Occupancy and Release', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      // Create a test object
      testObject = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      // Add an interaction node
      testNode = await service.addInteractionNode(testObject.id, {
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
        maxOccupancy: 1
      });
    });

    test('should occupy an available node', async () => {
      const occupiedNode = await service.occupyNode(testNode.id, 100);

      expect(occupiedNode.isOccupied).toBe(true);
      expect(occupiedNode.occupiedBy).toBe(100);
      expect(occupiedNode.occupiedAt).toBeDefined();
    });

    test('should reject occupying already occupied node', async () => {
      // First user occupies the node
      await service.occupyNode(testNode.id, 100);

      // Second user tries to occupy the same node
      await expect(
        service.occupyNode(testNode.id, 200)
      ).rejects.toThrow('Node is already occupied');
    });

    test('should release an occupied node', async () => {
      // Occupy the node
      await service.occupyNode(testNode.id, 100);

      // Release the node
      const releasedNode = await service.releaseNode(testNode.id, 100);

      expect(releasedNode.isOccupied).toBe(false);
      expect(releasedNode.occupiedBy).toBeNull();
      expect(releasedNode.occupiedAt).toBeNull();
    });

    test('should reject releasing node by wrong user', async () => {
      // User 100 occupies the node
      await service.occupyNode(testNode.id, 100);

      // User 200 tries to release it
      await expect(
        service.releaseNode(testNode.id, 200)
      ).rejects.toThrow('User is not occupying this node');
    });

    test('should reject occupying non-existent node', async () => {
      await expect(
        service.occupyNode(99999, 100)
      ).rejects.toThrow('Node not found');
    });

    test('should reject releasing non-existent node', async () => {
      await expect(
        service.releaseNode(99999, 100)
      ).rejects.toThrow('Node not found');
    });

    test('should allow re-occupying a released node', async () => {
      // Occupy, release, then occupy again
      await service.occupyNode(testNode.id, 100);
      await service.releaseNode(testNode.id, 100);
      const reoccupiedNode = await service.occupyNode(testNode.id, 200);

      expect(reoccupiedNode.isOccupied).toBe(true);
      expect(reoccupiedNode.occupiedBy).toBe(200);
    });

    test('should get available nodes correctly', async () => {
      // Create multiple nodes
      const node2 = await service.addInteractionNode(testObject.id, {
        position: { x: 1, y: 0, z: 0 },
        requiredState: 'sitting',
        maxOccupancy: 1
      });

      // Occupy one node
      await service.occupyNode(testNode.id, 100);

      // Get available nodes
      const availableNodes = await service.getAvailableNodes(testObject.id);

      expect(availableNodes).toHaveLength(1);
      expect(availableNodes[0].id).toBe(node2.id);
    });
  });

  // ==================== Trigger Execution Tests ====================

  describe('Trigger Execution Order', () => {
    let testObject;

    beforeEach(async () => {
      testObject = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);
    });

    test('should execute triggers in priority order (highest first)', async () => {
      // Create triggers with different priorities
      await service.addTrigger(testObject.id, {
        triggerType: 'grant_xp',
        triggerData: { amount: 10 },
        priority: 1
      });

      await service.addTrigger(testObject.id, {
        triggerType: 'state_change',
        triggerData: { state: 'sitting' },
        priority: 5
      });

      await service.addTrigger(testObject.id, {
        triggerType: 'unlock_achievement',
        triggerData: { achievementId: 'first_sit' },
        priority: 3
      });

      // Execute triggers
      const results = await service.executeTriggers(testObject.id, 100);

      // Verify execution order by priority (5, 3, 1)
      expect(results).toHaveLength(3);
      expect(results[0].triggerType).toBe('state_change');
      expect(results[0].executed).toBe(true);
      expect(results[1].triggerType).toBe('unlock_achievement');
      expect(results[1].executed).toBe(true);
      expect(results[2].triggerType).toBe('grant_xp');
      expect(results[2].executed).toBe(true);
    });

    test('should execute all trigger types correctly', async () => {
      // Add different trigger types
      await service.addTrigger(testObject.id, {
        triggerType: 'state_change',
        triggerData: { state: 'sitting' },
        priority: 0
      });

      await service.addTrigger(testObject.id, {
        triggerType: 'grant_xp',
        triggerData: { amount: 50 },
        priority: 0
      });

      await service.addTrigger(testObject.id, {
        triggerType: 'unlock_achievement',
        triggerData: { achievementId: 'chair_master' },
        priority: 0
      });

      await service.addTrigger(testObject.id, {
        triggerType: 'teleport',
        triggerData: { destination: { x: 100, y: 0, z: 100 }, officeId: 2 },
        priority: 0
      });

      const results = await service.executeTriggers(testObject.id, 100);

      expect(results).toHaveLength(4);
      
      const stateChange = results.find(r => r.triggerType === 'state_change');
      expect(stateChange.result.newState).toBe('sitting');

      const grantXp = results.find(r => r.triggerType === 'grant_xp');
      expect(grantXp.result.xpGranted).toBe(50);

      const achievement = results.find(r => r.triggerType === 'unlock_achievement');
      expect(achievement.result.achievementId).toBe('chair_master');

      const teleport = results.find(r => r.triggerType === 'teleport');
      expect(teleport.result.destination).toEqual({ x: 100, y: 0, z: 100 });
      expect(teleport.result.officeId).toBe(2);
    });

    test('should skip triggers with unmet conditions', async () => {
      // Add trigger with condition
      await service.addTrigger(testObject.id, {
        triggerType: 'grant_xp',
        triggerData: { amount: 100 },
        priority: 0,
        condition: { minLevel: 10 }
      });

      // Execute with context that doesn't meet condition
      const results = await service.executeTriggers(testObject.id, 100, {
        userLevel: 5
      });

      expect(results).toHaveLength(1);
      expect(results[0].executed).toBe(false);
      expect(results[0].reason).toBe('Condition not met');
    });

    test('should execute triggers with met conditions', async () => {
      // Add trigger with condition
      await service.addTrigger(testObject.id, {
        triggerType: 'grant_xp',
        triggerData: { amount: 100 },
        priority: 0,
        condition: { minLevel: 10 }
      });

      // Execute with context that meets condition
      const results = await service.executeTriggers(testObject.id, 100, {
        userLevel: 15
      });

      expect(results).toHaveLength(1);
      expect(results[0].executed).toBe(true);
      expect(results[0].result.xpGranted).toBe(100);
    });

    test('should continue executing triggers after one fails', async () => {
      // Add valid trigger
      await service.addTrigger(testObject.id, {
        triggerType: 'grant_xp',
        triggerData: { amount: 10 },
        priority: 2
      });

      // Add trigger with invalid type (will fail)
      const invalidTrigger = await ObjectTrigger.create({
        objectId: testObject.id,
        triggerType: 'invalid_type',
        triggerData: {},
        priority: 1,
        isActive: true
      });

      // Add another valid trigger
      await service.addTrigger(testObject.id, {
        triggerType: 'state_change',
        triggerData: { state: 'sitting' },
        priority: 0
      });

      const results = await service.executeTriggers(testObject.id, 100);

      expect(results).toHaveLength(3);
      
      // First trigger should succeed
      expect(results[0].executed).toBe(true);
      expect(results[0].triggerType).toBe('grant_xp');
      
      // Second trigger should fail
      expect(results[1].executed).toBe(false);
      expect(results[1].error).toBeDefined();
      
      // Third trigger should still execute
      expect(results[2].executed).toBe(true);
      expect(results[2].triggerType).toBe('state_change');
    });
  });

  // ==================== Error Handling Tests ====================

  describe('Error Handling for Invalid Operations', () => {
    test('should handle getting non-existent object', async () => {
      const object = await service.getObject(99999);
      expect(object).toBeNull();
    });

    test('should reject updating non-existent object', async () => {
      await expect(
        service.updateObject(99999, { name: 'Updated' }, 1)
      ).rejects.toThrow('Object not found');
    });

    test('should reject deleting non-existent object', async () => {
      await expect(
        service.deleteObject(99999, 1)
      ).rejects.toThrow('Object not found');
    });

    test('should reject updating object state for non-existent object', async () => {
      await expect(
        service.updateObjectState(99999, { color: 'red' })
      ).rejects.toThrow('Object not found');
    });

    test('should reject getting state for non-existent object', async () => {
      await expect(
        service.getObjectState(99999)
      ).rejects.toThrow('Object not found');
    });

    test('should reject adding node to non-existent object', async () => {
      await expect(
        service.addInteractionNode(99999, {
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        })
      ).rejects.toThrow('Object not found');
    });

    test('should reject adding node without required fields', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.addInteractionNode(object.id, {
          position: { x: 0, y: 0, z: 0 }
          // missing requiredState
        })
      ).rejects.toThrow('position and requiredState are required');
    });

    test('should reject adding node with invalid requiredState', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.addInteractionNode(object.id, {
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'invalid_state'
        })
      ).rejects.toThrow('Invalid requiredState');
    });

    test('should reject adding trigger to non-existent object', async () => {
      await expect(
        service.addTrigger(99999, {
          triggerType: 'grant_xp',
          triggerData: { amount: 10 }
        })
      ).rejects.toThrow('Object not found');
    });

    test('should reject adding trigger without required fields', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.addTrigger(object.id, {
          triggerType: 'grant_xp'
          // missing triggerData
        })
      ).rejects.toThrow('triggerType and triggerData are required');
    });

    test('should reject adding trigger with invalid type', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.addTrigger(object.id, {
          triggerType: 'invalid_trigger',
          triggerData: {}
        })
      ).rejects.toThrow('Invalid triggerType');
    });

    test('should handle updating object with invalid objectType', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.updateObject(object.id, { objectType: 'invalid_type' }, 1)
      ).rejects.toThrow('Invalid objectType');
    });

    test('should handle updating object with invalid position', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await expect(
        service.updateObject(object.id, {
          position: { x: 'invalid', y: 0, z: 0 }
        }, 1)
      ).rejects.toThrow('Position must have numeric x, y, z coordinates');
    });
  });

  // ==================== Additional Edge Cases ====================

  describe('Additional Edge Cases', () => {
    test('should soft delete object (set isActive to false)', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await service.deleteObject(object.id, 1);

      const deletedObject = await InteractiveObject.findByPk(object.id);
      expect(deletedObject.isActive).toBe(false);
    });

    test('should not return inactive objects in getObjectsByOffice', async () => {
      // Create two objects
      const object1 = await service.createObject(1, {
        objectType: 'chair',
        name: 'Chair 1'
      }, 1);

      const object2 = await service.createObject(1, {
        objectType: 'table',
        name: 'Table 1'
      }, 1);

      // Delete one object
      await service.deleteObject(object1.id, 1);

      // Get objects for office
      const objects = await service.getObjectsByOffice(1);

      expect(objects).toHaveLength(1);
      expect(objects[0].id).toBe(object2.id);
    });

    test('should merge state when updating object state', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair',
        state: { color: 'blue', material: 'leather' }
      }, 1);

      // Update state with new property
      await service.updateObjectState(object.id, { comfort: 'high' });

      const updatedObject = await service.getObject(object.id);
      expect(updatedObject.state).toEqual({
        color: 'blue',
        material: 'leather',
        comfort: 'high'
      });
    });

    test('should handle multiple nodes on same object', async () => {
      const object = await service.createObject(1, {
        objectType: 'table',
        name: 'Conference Table'
      }, 1);

      // Add multiple nodes
      await service.addInteractionNode(object.id, {
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting'
      });

      await service.addInteractionNode(object.id, {
        position: { x: 1, y: 0, z: 0 },
        requiredState: 'sitting'
      });

      await service.addInteractionNode(object.id, {
        position: { x: 2, y: 0, z: 0 },
        requiredState: 'sitting'
      });

      const objectWithNodes = await service.getObject(object.id);
      expect(objectWithNodes.nodes).toHaveLength(3);
    });

    test('should log deletion in InteractionLog', async () => {
      const object = await service.createObject(1, {
        objectType: 'chair',
        name: 'Test Chair'
      }, 1);

      await service.deleteObject(object.id, 1);

      const logs = await InteractionLog.findAll({
        where: { objectId: object.id, interactionType: 'delete' }
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(1);
      expect(logs[0].success).toBe(true);
    });
  });
});

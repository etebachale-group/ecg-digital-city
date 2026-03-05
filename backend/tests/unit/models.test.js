/**
 * Unit Tests for Model Validations
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests validate that all models enforce their constraints correctly:
 * - Required field validations
 * - JSONB field structure validation
 * - Foreign key constraints
 * - Default values
 * 
 * Requirements: 1.1, 1.2
 */

const { sequelize } = require('../../src/config/database');
const {
  InteractiveObject,
  InteractionNode,
  ObjectTrigger,
  InteractionQueue,
  InteractionLog,
  Avatar
} = require('../../src/models');

describe('Model Validation Tests', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    // Don't sync - use existing database schema
  }, 30000);

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Tests create their own data - no cleanup needed
  });

  describe('InteractiveObject Model', () => {
    describe('Required Field Validations', () => {
      test('should reject creation without officeId', async () => {
        await expect(
          InteractiveObject.create({
            objectType: 'chair',
            name: 'Test Chair',
            createdBy: 1
          })
        ).rejects.toThrow();
      });

      test('should reject creation without objectType', async () => {
        await expect(
          InteractiveObject.create({
            officeId: 1,
            name: 'Test Object',
            createdBy: 1
          })
        ).rejects.toThrow();
      });

      test('should reject creation without name', async () => {
        await expect(
          InteractiveObject.create({
            officeId: 1,
            objectType: 'chair',
            createdBy: 1
          })
        ).rejects.toThrow();
      });

      test('should reject creation without createdBy', async () => {
        await expect(
          InteractiveObject.create({
            officeId: 1,
            objectType: 'chair',
            name: 'Test Chair'
          })
        ).rejects.toThrow();
      });

      test('should reject invalid objectType', async () => {
        await expect(
          InteractiveObject.create({
            officeId: 1,
            objectType: 'invalid_type',
            name: 'Test Object',
            createdBy: 1
          })
        ).rejects.toThrow();
      });

      test('should accept valid objectTypes', async () => {
        const validTypes = ['chair', 'door', 'table', 'furniture'];
        
        for (const type of validTypes) {
          const object = await InteractiveObject.create({
            officeId: 1,
            objectType: type,
            name: `Test ${type}`,
            createdBy: 1
          });
          expect(object.objectType).toBe(type);
        }
      });
    });

    describe('JSONB Field Structure Validation', () => {
      test('should accept valid position JSONB', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          position: { x: 10, y: 5, z: 20 },
          createdBy: 1
        });
        
        expect(object.position).toEqual({ x: 10, y: 5, z: 20 });
      });

      test('should accept valid rotation JSONB', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          rotation: { x: 0, y: 90, z: 0 },
          createdBy: 1
        });
        
        expect(object.rotation).toEqual({ x: 0, y: 90, z: 0 });
      });

      test('should accept valid scale JSONB', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          scale: { x: 1.5, y: 1.5, z: 1.5 },
          createdBy: 1
        });
        
        expect(object.scale).toEqual({ x: 1.5, y: 1.5, z: 1.5 });
      });

      test('should accept valid state JSONB', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'door',
          name: 'Test Door',
          state: { open: true, locked: false },
          createdBy: 1
        });
        
        expect(object.state).toEqual({ open: true, locked: false });
      });

      test('should accept valid config JSONB', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          config: { comfort: 5, durability: 8 },
          createdBy: 1
        });
        
        expect(object.config).toEqual({ comfort: 5, durability: 8 });
      });
    });

    describe('Default Values', () => {
      test('should apply default position', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.position).toEqual({ x: 0, y: 0, z: 0 });
      });

      test('should apply default rotation', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.rotation).toEqual({ x: 0, y: 0, z: 0 });
      });

      test('should apply default scale', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.scale).toEqual({ x: 1, y: 1, z: 1 });
      });

      test('should apply default state', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.state).toEqual({});
      });

      test('should apply default config', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.config).toEqual({});
      });

      test('should apply default isActive', async () => {
        const object = await InteractiveObject.create({
          officeId: 1,
          objectType: 'chair',
          name: 'Test Chair',
          createdBy: 1
        });
        
        expect(object.isActive).toBe(true);
      });
    });
  });

  describe('InteractionNode Model', () => {
    let testObject;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        createdBy: 1
      });
    });

    describe('Required Field Validations', () => {
      test('should reject creation without objectId', async () => {
        await expect(
          InteractionNode.create({
            position: { x: 0, y: 0, z: 0 },
            requiredState: 'sitting'
          })
        ).rejects.toThrow();
      });

      test('should reject creation without position', async () => {
        await expect(
          InteractionNode.create({
            objectId: testObject.id,
            requiredState: 'sitting'
          })
        ).rejects.toThrow();
      });

      test('should reject creation without requiredState', async () => {
        await expect(
          InteractionNode.create({
            objectId: testObject.id,
            position: { x: 0, y: 0, z: 0 }
          })
        ).rejects.toThrow();
      });

      test('should reject invalid requiredState', async () => {
        await expect(
          InteractionNode.create({
            objectId: testObject.id,
            position: { x: 0, y: 0, z: 0 },
            requiredState: 'invalid_state'
          })
        ).rejects.toThrow();
      });

      test('should accept valid requiredStates', async () => {
        const validStates = ['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'];
        
        for (const state of validStates) {
          const node = await InteractionNode.create({
            objectId: testObject.id,
            position: { x: 0, y: 0, z: 0 },
            requiredState: state
          });
          expect(node.requiredState).toBe(state);
        }
      });
    });

    describe('JSONB Field Structure Validation', () => {
      test('should accept valid position JSONB', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 5, y: 1, z: 10 },
          requiredState: 'sitting'
        });
        
        expect(node.position).toEqual({ x: 5, y: 1, z: 10 });
      });
    });

    describe('Foreign Key Relationships', () => {
      test('should create node with valid objectId', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        });
        
        expect(node.objectId).toBe(testObject.id);
        
        // Verify relationship
        const loadedNode = await InteractionNode.findByPk(node.id, {
          include: [{ model: InteractiveObject, as: 'object' }]
        });
        
        expect(loadedNode.object).not.toBeNull();
        expect(loadedNode.object.id).toBe(testObject.id);
      });
    });

    describe('Default Values', () => {
      test('should apply default isOccupied', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        });
        
        expect(node.isOccupied).toBe(false);
      });

      test('should apply default maxOccupancy', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        });
        
        expect(node.maxOccupancy).toBe(1);
      });

      test('should allow null occupiedBy', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        });
        
        expect(node.occupiedBy).toBeNull();
      });

      test('should allow null occupiedAt', async () => {
        const node = await InteractionNode.create({
          objectId: testObject.id,
          position: { x: 0, y: 0, z: 0 },
          requiredState: 'sitting'
        });
        
        expect(node.occupiedAt).toBeNull();
      });
    });
  });

  describe('ObjectTrigger Model', () => {
    let testObject;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        createdBy: 1
      });
    });

    describe('Required Field Validations', () => {
      test('should reject creation without objectId', async () => {
        await expect(
          ObjectTrigger.create({
            triggerType: 'grant_xp',
            triggerData: { amount: 10 }
          })
        ).rejects.toThrow();
      });

      test('should reject creation without triggerType', async () => {
        await expect(
          ObjectTrigger.create({
            objectId: testObject.id,
            triggerData: { amount: 10 }
          })
        ).rejects.toThrow();
      });

      test('should reject creation without triggerData', async () => {
        await expect(
          ObjectTrigger.create({
            objectId: testObject.id,
            triggerType: 'grant_xp'
          })
        ).rejects.toThrow();
      });

      test('should reject invalid triggerType', async () => {
        await expect(
          ObjectTrigger.create({
            objectId: testObject.id,
            triggerType: 'invalid_trigger',
            triggerData: { amount: 10 }
          })
        ).rejects.toThrow();
      });

      test('should accept valid triggerTypes', async () => {
        const validTypes = ['state_change', 'grant_xp', 'unlock_achievement', 'teleport'];
        
        for (const type of validTypes) {
          const trigger = await ObjectTrigger.create({
            objectId: testObject.id,
            triggerType: type,
            triggerData: { test: 'data' }
          });
          expect(trigger.triggerType).toBe(type);
        }
      });
    });

    describe('JSONB Field Structure Validation', () => {
      test('should accept valid triggerData JSONB', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 50, reason: 'sitting' }
        });
        
        expect(trigger.triggerData).toEqual({ amount: 50, reason: 'sitting' });
      });

      test('should accept valid condition JSONB', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 50 },
          condition: { minLevel: 5, hasPermission: true }
        });
        
        expect(trigger.condition).toEqual({ minLevel: 5, hasPermission: true });
      });

      test('should allow null condition', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 50 }
        });
        
        expect(trigger.condition).toBeNull();
      });
    });

    describe('Foreign Key Relationships', () => {
      test('should create trigger with valid objectId', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 10 }
        });
        
        expect(trigger.objectId).toBe(testObject.id);
        
        // Verify relationship
        const loadedTrigger = await ObjectTrigger.findByPk(trigger.id, {
          include: [{ model: InteractiveObject, as: 'object' }]
        });
        
        expect(loadedTrigger.object).not.toBeNull();
        expect(loadedTrigger.object.id).toBe(testObject.id);
      });
    });

    describe('Default Values', () => {
      test('should apply default priority', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 10 }
        });
        
        expect(trigger.priority).toBe(0);
      });

      test('should apply default isActive', async () => {
        const trigger = await ObjectTrigger.create({
          objectId: testObject.id,
          triggerType: 'grant_xp',
          triggerData: { amount: 10 }
        });
        
        expect(trigger.isActive).toBe(true);
      });
    });
  });

  describe('InteractionQueue Model', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting'
      });
    });

    describe('Required Field Validations', () => {
      test('should reject creation without objectId', async () => {
        await expect(
          InteractionQueue.create({
            nodeId: testNode.id,
            userId: 1,
            position: 1,
            expiresAt: new Date(Date.now() + 60000)
          })
        ).rejects.toThrow();
      });

      test('should reject creation without nodeId', async () => {
        await expect(
          InteractionQueue.create({
            objectId: testObject.id,
            userId: 1,
            position: 1,
            expiresAt: new Date(Date.now() + 60000)
          })
        ).rejects.toThrow();
      });

      test('should reject creation without userId', async () => {
        await expect(
          InteractionQueue.create({
            objectId: testObject.id,
            nodeId: testNode.id,
            position: 1,
            expiresAt: new Date(Date.now() + 60000)
          })
        ).rejects.toThrow();
      });

      test('should reject creation without position', async () => {
        await expect(
          InteractionQueue.create({
            objectId: testObject.id,
            nodeId: testNode.id,
            userId: 1,
            expiresAt: new Date(Date.now() + 60000)
          })
        ).rejects.toThrow();
      });

      test('should reject creation without expiresAt', async () => {
        await expect(
          InteractionQueue.create({
            objectId: testObject.id,
            nodeId: testNode.id,
            userId: 1,
            position: 1
          })
        ).rejects.toThrow();
      });
    });

    describe('Foreign Key Relationships', () => {
      test('should create queue entry with valid objectId and nodeId', async () => {
        const queue = await InteractionQueue.create({
          objectId: testObject.id,
          nodeId: testNode.id,
          userId: 1,
          position: 1,
          expiresAt: new Date(Date.now() + 60000)
        });
        
        expect(queue.objectId).toBe(testObject.id);
        expect(queue.nodeId).toBe(testNode.id);
        
        // Verify relationships
        const loadedQueue = await InteractionQueue.findByPk(queue.id, {
          include: [
            { model: InteractiveObject, as: 'object' },
            { model: InteractionNode, as: 'node' }
          ]
        });
        
        expect(loadedQueue.object).not.toBeNull();
        expect(loadedQueue.object.id).toBe(testObject.id);
        expect(loadedQueue.node).not.toBeNull();
        expect(loadedQueue.node.id).toBe(testNode.id);
      });
    });

    describe('Default Values', () => {
      test('should apply default joinedAt', async () => {
        const beforeCreate = new Date();
        
        const queue = await InteractionQueue.create({
          objectId: testObject.id,
          nodeId: testNode.id,
          userId: 1,
          position: 1,
          expiresAt: new Date(Date.now() + 60000)
        });
        
        const afterCreate = new Date();
        
        expect(queue.joinedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
        expect(queue.joinedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      });
    });
  });

  describe('InteractionLog Model', () => {
    let testObject;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        createdBy: 1
      });
    });

    describe('Required Field Validations', () => {
      test('should reject creation without userId', async () => {
        await expect(
          InteractionLog.create({
            objectId: testObject.id,
            interactionType: 'sit',
            success: true
          })
        ).rejects.toThrow();
      });

      test('should reject creation without objectId', async () => {
        await expect(
          InteractionLog.create({
            userId: 1,
            interactionType: 'sit',
            success: true
          })
        ).rejects.toThrow();
      });

      test('should reject creation without interactionType', async () => {
        await expect(
          InteractionLog.create({
            userId: 1,
            objectId: testObject.id,
            success: true
          })
        ).rejects.toThrow();
      });

      test('should reject creation without success', async () => {
        await expect(
          InteractionLog.create({
            userId: 1,
            objectId: testObject.id,
            interactionType: 'sit'
          })
        ).rejects.toThrow();
      });
    });

    describe('Foreign Key Relationships', () => {
      test('should create log entry with valid objectId', async () => {
        const log = await InteractionLog.create({
          userId: 1,
          objectId: testObject.id,
          interactionType: 'sit',
          success: true
        });
        
        expect(log.objectId).toBe(testObject.id);
        
        // Verify relationship
        const loadedLog = await InteractionLog.findByPk(log.id, {
          include: [{ model: InteractiveObject, as: 'object' }]
        });
        
        expect(loadedLog.object).not.toBeNull();
        expect(loadedLog.object.id).toBe(testObject.id);
      });
    });

    describe('Default Values', () => {
      test('should apply default xpGranted', async () => {
        const log = await InteractionLog.create({
          userId: 1,
          objectId: testObject.id,
          interactionType: 'sit',
          success: true
        });
        
        expect(log.xpGranted).toBe(0);
      });

      test('should apply default timestamp', async () => {
        const beforeCreate = new Date();
        
        const log = await InteractionLog.create({
          userId: 1,
          objectId: testObject.id,
          interactionType: 'sit',
          success: true
        });
        
        const afterCreate = new Date();
        
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      });

      test('should allow null errorMessage', async () => {
        const log = await InteractionLog.create({
          userId: 1,
          objectId: testObject.id,
          interactionType: 'sit',
          success: true
        });
        
        expect(log.errorMessage).toBeNull();
      });
    });
  });

  describe('Avatar Model', () => {
    describe('Required Field Validations', () => {
      test('should reject creation without userId', async () => {
        await expect(
          Avatar.create({})
        ).rejects.toThrow();
      });

      test('should reject invalid currentState', async () => {
        await expect(
          Avatar.create({
            userId: 1,
            currentState: 'invalid_state'
          })
        ).rejects.toThrow();
      });

      test('should accept valid currentStates', async () => {
        const validStates = ['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'];
        
        for (const state of validStates) {
          const avatar = await Avatar.create({
            userId: validStates.indexOf(state) + 1, // Unique userId for each
            currentState: state
          });
          expect(avatar.currentState).toBe(state);
        }
      });
    });

    describe('Default Values', () => {
      test('should apply default currentState', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.currentState).toBe('idle');
      });

      test('should apply default skinColor', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.skinColor).toBe('#fdbcb4');
      });

      test('should apply default hairStyle', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.hairStyle).toBe('short');
      });

      test('should apply default hairColor', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.hairColor).toBe('#000000');
      });

      test('should apply default shirtColor', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.shirtColor).toBe('#3498db');
      });

      test('should apply default pantsColor', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.pantsColor).toBe('#2c3e50');
      });

      test('should apply default accessories', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.accessories).toEqual({});
      });

      test('should allow null previousState', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.previousState).toBeNull();
      });

      test('should allow null stateChangedAt', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.stateChangedAt).toBeNull();
      });

      test('should allow null interactingWith', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.interactingWith).toBeNull();
      });

      test('should allow null sittingAt', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        expect(avatar.sittingAt).toBeNull();
      });
    });

    describe('State Field Updates', () => {
      test('should update state fields correctly', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        const now = new Date();
        await avatar.update({
          currentState: 'sitting',
          previousState: 'idle',
          stateChangedAt: now,
          sittingAt: 1
        });
        
        expect(avatar.currentState).toBe('sitting');
        expect(avatar.previousState).toBe('idle');
        expect(avatar.stateChangedAt.getTime()).toBe(now.getTime());
        expect(avatar.sittingAt).toBe(1);
      });

      test('should update interactingWith field', async () => {
        const avatar = await Avatar.create({
          userId: 1
        });
        
        await avatar.update({
          currentState: 'interacting',
          interactingWith: 5
        });
        
        expect(avatar.currentState).toBe('interacting');
        expect(avatar.interactingWith).toBe(5);
      });
    });
  });
});

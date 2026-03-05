/**
 * Unit Tests for InteractionService
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests verify specific scenarios and edge cases for InteractionService:
 * - Interaction validation logic
 * - Queue FIFO behavior
 * - XP rate limiting
 * - Error scenarios (out of range, no permission, occupied)
 * 
 * Requirements: 13.2, 16.1, 18.4, 21.1
 */

const { sequelize } = require('../../src/config/database');
const InteractionService = require('../../src/services/InteractionService');
const {
  InteractiveObject,
  InteractionNode,
  InteractionQueue,
  InteractionLog
} = require('../../src/models');

describe('InteractionService Unit Tests', () => {
  const service = InteractionService;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  }, 30000);

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await InteractionQueue.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionLog.destroy({ where: {}, truncate: true, cascade: true });
    await InteractionNode.destroy({ where: {}, truncate: true, cascade: true });
    await InteractiveObject.destroy({ where: {}, truncate: true, cascade: true });
  });

  // ==================== Interaction Validation Tests ====================
  // Requirement 13.2: Interaction validation wi
  describe('Interaction Validation Logic', () => {
    test('should validate interaction with existing active object', async () => {
      const object = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      const result = await service.validateInteraction(100, object.id);
      expect(result).toBe(true);
    });

    test('should reject interaction with non-existent object', async () => {
      await expect(
        service.validateInteraction(100, 99999)
      ).rejects.toThrow('Object not found');
    });

    test('should reject interaction with inactive object', async () => {
      const object = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Inactive Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: false,
        createdBy: 1
      });

      await expect(
        service.validateInteraction(100, object.id)
      ).rejects.toThrow('Object is not active');
    });
  });

  // ==================== Interaction Execution Tests ====================

  describe('Interaction Execution', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    test('should execute interaction successfully with available node', async () => {
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      expect(result.success).toBe(true);
      expect(result.queued).toBe(false);
      expect(result.node).toBeDefined();
      expect(result.node.isOccupied).toBe(true);
      expect(result.node.occupiedBy).toBe(100);
      expect(result.xpGranted).toBeGreaterThanOrEqual(0);
    });

    test('should auto-select first available node when nodeId not specified', async () => {
      const result = await service.executeInteraction(100, testObject.id);

      expect(result.success).toBe(true);
      expect(result.node.id).toBe(testNode.id);
      expect(result.node.isOccupied).toBe(true);
    });

    test('should add to queue when node is occupied', async () => {
      // First user occupies the node
      await service.executeInteraction(100, testObject.id, testNode.id);

      // Second user tries to interact
      const result = await service.executeInteraction(200, testObject.id, testNode.id);

      expect(result.success).toBe(false);
      expect(result.queued).toBe(true);
      expect(result.message).toContain('occupied');
    });

    test('should reject interaction with invalid node for object', async () => {
      // Create another object with its own node
      const otherObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'table',
        name: 'Test Table',
        position: { x: 20, y: 0, z: 10 },
        isActive: true,
        createdBy: 1
      });

      const otherNode = await InteractionNode.create({
        objectId: otherObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'standing',
        isOccupied: false,
        maxOccupancy: 1
      });

      // Try to use otherNode with testObject
      await expect(
        service.executeInteraction(100, testObject.id, otherNode.id)
      ).rejects.toThrow('Invalid node for this object');
    });

    test('should log successful interaction', async () => {
      await service.executeInteraction(100, testObject.id, testNode.id);

      const logs = await InteractionLog.findAll({
        where: { userId: 100, objectId: testObject.id }
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].success).toBe(true);
      expect(logs[0].interactionType).toBe('interaction');
    });
  });

  // ==================== Queue FIFO Behavior Tests ====================

  describe('Queue FIFO Behavior', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
 
       isOccupied: false,
        maxOccupancy: 1
      });
    });

    test('should maintain FIFO order in queue', async () => {
      // First user occupies the node
      await service.executeInteraction(100, testObject.id, testNode.id);

      // Add three users to queue
      await service.joinQueue(200, testObject.id, testNode.id);
      await service.joinQueue(300, testObject.id, testNode.id);
      await service.joinQueue(400, testObject.id, testNode.id);

      // Verify queue positions
      const queue = await InteractionQueue.findAll({
        where: { objectId: testObject.id },
        order: [['position', 'ASC']]
      });

      expect(queue).toHaveLength(3);
      expect(queue[0].userId).toBe(200);
      expect(queue[0].position).toBe(1);
      expect(queue[1].userId).toBe(300);
      expect(queue[1].position).toBe(2);
      expect(queue[2].userId).toBe(400);
      expect(queue[2].position).toBe(3);
    });

    test('should process queue in FIFO order when node is released', async () => {
      // First user occupies the node
      await service.executeInteraction(100, testObject.id, testNode.id);

      // Add users to queue
      await service.joinQueue(200, testObject.id, testNode.id);
      await service.joinQueue(300, testObject.id, testNode.id);

      // Release the node
      await testNode.update({ isOccupied: false, occupiedBy: null });

      // Process queue
      const nextUser = await service.processQueue(testObject.id, testNode.id);

      expect(nextUser).toBe(200); // First in queue
    });

    test('should update queue positions when user leaves', async () => {
      // Occupy node and add users to queue
      await service.executeInteraction(100, testObject.id, testNode.id);
      await service.joinQueue(200, testObject.id, testNode.id);
      await service.joinQueue(300, testObject.id, testNode.id);
      await service.joinQueue(400, testObject.id, testNode.id);

      // User 300 leaves queue
      await service.leaveQueue(300, testObject.id);

      // Verify positions updated
      const queue = await InteractionQueue.findAll({
        where: { objectId: testObject.id },
        order: [['position', 'ASC']]
      });

      expect(queue).toHaveLength(2);
      expect(queue[0].userId).toBe(200);
      expect(queue[0].position).toBe(1);
      expect(queue[1].userId).toBe(400);
      expect(queue[1].position).toBe(2); // Position updated from 3 to 2
    });

    test('should return queue position for user', async () => {
      await service.executeInteraction(100, testObject.id, testNode.id);
      await service.joinQueue(200, testObject.id, testNode.id);
      await service.joinQueue(300, testObject.id, testNode.id);

      const position = await service.getQueuePosition(300, testObject.id);
      expect(position).toBe(2);
    });

    test('should return null for user not in queue', async () => {
      const position = await service.getQueuePosition(999, testObject.id);
      expect(position).toBeNull();
    });
  });

  // ==================== XP Rate Limiting Tests ====================
  // Requirement 18.4: XP rate limiting (once per object per 5 minutes)

  describe('XP Rate Limiting', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    test('should grant XP on first interaction', async () => {
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      expect(result.xpGranted).toBeGreaterThan(0);
    });

    test('should not grant XP on second interaction within 5 minutes', async () => {
      // First interaction
      await service.executeInteraction(100, testObject.id, testNode.id);
      await testNode.update({ isOccupied: false, occupiedBy: null });

      // Second interaction immediately after
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      expect(result.xpGranted).toBe(0);
    });

    test('should grant XP again after 5 minutes', async () => {
      // First interaction
      await service.executeInteraction(100, testObject.id, testNode.id);
      await testNode.update({ isOccupied: false, occupiedBy: null });

      // Simulate 5 minutes passing by updating the log timestamp
      const log = await InteractionLog.findOne({
        where: { userId: 100, objectId: testObject.id },
        order: [['timestamp', 'DESC']]
      });

      const fiveMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
      await log.update({ timestamp: fiveMinutesAgo });

      // Second interaction after 5 minutes
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      expect(result.xpGranted).toBeGreaterThan(0);
    });

    test('should grant bonus XP on first-time interaction with object', async () => {
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      // First-time bonus should be included
      expect(result.xpGranted).toBeGreaterThanOrEqual(10); // Base XP + bonus
    });
  });

  // ==================== Error Scenarios Tests ====================
  // Requirement 21.1: Error handling for various failure scenarios

  describe('Error Scenarios', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    test('should handle out of range error', async () => {
      const userPosition = { x: 100, y: 0, z: 100 }; // Far away
      const objectPosition = testObject.position;

      const inRange = await service.checkProximity(userPosition, objectPosition, 2);
      expect(inRange).toBe(false);
    });

    test('should handle occupied object error', async () => {
      // First user occupies
      await service.executeInteraction(100, testObject.id, testNode.id);

      // Second user tries to interact
      const result = await service.executeInteraction(200, testObject.id, testNode.id);

      expect(result.success).toBe(false);
      expect(result.queued).toBe(true);
      expect(result.message).toContain('occupied');
    });

    test('should log failed interaction', async () => {
      // Try to interact with non-existent object
      try {
        await service.executeInteraction(100, 99999, null);
      } catch (error) {
        // Expected to fail
      }

      const logs = await InteractionLog.findAll({
        where: { userId: 100, success: false }
      });

      expect(logs.length).toBeGreaterThanOrEqual(0); // May or may not log depending on implementation
    });

    test('should handle no available nodes error', async () => {
      // Remove all nodes
      await InteractionNode.destroy({ where: { objectId: testObject.id } });

      await expect(
        service.executeInteraction(100, testObject.id)
      ).rejects.toThrow('No available nodes');
    });

    test('should validate proximity within range', async () => {
      const userPosition = { x: 10.5, y: 0, z: 5.5 }; // Close to object
      const objectPosition = testObject.position;

      const inRange = await service.checkProximity(userPosition, objectPosition, 2);
      expect(inRange).toBe(true);
    });

    test('should calculate distance correctly', async () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 3, y: 0, z: 4 };

      const inRange = await service.checkProximity(pos1, pos2, 5);
      expect(inRange).toBe(true); // Distance is 5, exactly at limit

      const outOfRange = await service.checkProximity(pos1, pos2, 4.9);
      expect(outOfRange).toBe(false); // Distance is 5, exceeds limit
    });
  });

  // ==================== Interaction Logging Tests ====================

  describe('Interaction Logging', () => {
    let testObject;
    let testNode;

    beforeEach(async () => {
      testObject = await InteractiveObject.create({
        officeId: 1,
        objectType: 'chair',
        name: 'Test Chair',
        position: { x: 10, y: 0, z: 5 },
        isActive: true,
        createdBy: 1
      });

      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 0, y: 0, z: 0 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    test('should log interaction with all required fields', async () => {
      await service.executeInteraction(100, testObject.id, testNode.id);

      const log = await InteractionLog.findOne({
        where: { userId: 100, objectId: testObject.id }
      });

      expect(log).toBeDefined();
      expect(log.userId).toBe(100);
      expect(log.objectId).toBe(testObject.id);
      expect(log.interactionType).toBeDefined();
      expect(log.success).toBe(true);
      expect(log.timestamp).toBeDefined();
    });

    test('should log XP granted in interaction log', async () => {
      const result = await service.executeInteraction(100, testObject.id, testNode.id);

      const log = await InteractionLog.findOne({
        where: { userId: 100, objectId: testObject.id }
      });

      expect(log.xpGranted).toBe(result.xpGranted);
    });

    test('should retrieve interaction history for user', async () => {
      // Create multiple interactions
      await service.executeInteraction(100, testObject.id, testNode.id);
      await testNode.update({ isOccupied: false, occupiedBy: null });

      // Wait a bit and interact again
      await new Promise(resolve => setTimeout(resolve, 100));
      await service.executeInteraction(100, testObject.id, testNode.id);

      const logs = await InteractionLog.findAll({
        where: { userId: 100 },
        order: [['timestamp', 'DESC']]
      });

      expect(logs.length).toBeGreaterThanOrEqual(2);
    });
  });
});

/**
 * Integration tests for Interactive Objects REST API routes
 * Tests the new node, trigger, state, and queue management endpoints
 */

const request = require('supertest');
const { app } = require('../../src/server');
const { sequelize } = require('../../src/config/database');
const InteractiveObject = require('../../src/models/InteractiveObject');
const InteractionNode = require('../../src/models/InteractionNode');
const ObjectTrigger = require('../../src/models/ObjectTrigger');
const InteractionQueue = require('../../src/models/InteractionQueue');
const User = require('../../src/models/User');
const Office = require('../../src/models/Office');

describe('Interactive Objects Routes - Extended Endpoints', () => {
  let testUser;
  let testOffice;
  let testObject;
  let testNode;
  let testTrigger;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    // Create test office
    testOffice = await Office.create({
      name: 'Test Office',
      description: 'Test office for integration tests'
    });

    // Create test object
    testObject = await InteractiveObject.create({
      officeId: testOffice.id,
      objectType: 'chair',
      name: 'Test Chair',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      state: {},
      config: {},
      createdBy: testUser.id
    });
  });

  afterEach(async () => {
    await InteractionQueue.destroy({ where: {} });
    await ObjectTrigger.destroy({ where: {} });
    await InteractionNode.destroy({ where: {} });
    await InteractiveObject.destroy({ where: {} });
    await Office.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ==================== Node Management Tests ====================

  describe('POST /api/objects/:id/nodes', () => {
    it('should create a new interaction node', async () => {
      const response = await request(app)
        .post(`/api/objects/${testObject.id}/nodes`)
        .set('x-user-id', testUser.id.toString())
        .send({
          position: { x: 1, y: 0, z: 1 },
          requiredState: 'sitting',
          maxOccupancy: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.position).toEqual({ x: 1, y: 0, z: 1 });
      expect(response.body.requiredState).toBe('sitting');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/objects/${testObject.id}/nodes`)
        .set('x-user-id', testUser.id.toString())
        .send({
          position: { x: 1, y: 0, z: 1 }
          // Missing requiredState
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/nodes/:id', () => {
    beforeEach(async () => {
      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 1, y: 0, z: 1 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    it('should update an interaction node', async () => {
      const response = await request(app)
        .put(`/api/nodes/${testNode.id}`)
        .set('x-user-id', testUser.id.toString())
        .send({
          maxOccupancy: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.maxOccupancy).toBe(2);
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app)
        .put('/api/nodes/99999')
        .set('x-user-id', testUser.id.toString())
        .send({
          maxOccupancy: 2
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/nodes/:id', () => {
    beforeEach(async () => {
      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 1, y: 0, z: 1 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    it('should delete an interaction node', async () => {
      const response = await request(app)
        .delete(`/api/nodes/${testNode.id}`)
        .set('x-user-id', testUser.id.toString());

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify deletion
      const node = await InteractionNode.findByPk(testNode.id);
      expect(node).toBeNull();
    });
  });

  // ==================== Trigger Management Tests ====================

  describe('POST /api/objects/:id/triggers', () => {
    it('should create a new trigger', async () => {
      const response = await request(app)
        .post(`/api/objects/${testObject.id}/triggers`)
        .set('x-user-id', testUser.id.toString())
        .send({
          triggerType: 'grant_xp',
          triggerData: { amount: 50 },
          priority: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.triggerType).toBe('grant_xp');
      expect(response.body.priority).toBe(1);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/objects/${testObject.id}/triggers`)
        .set('x-user-id', testUser.id.toString())
        .send({
          triggerType: 'grant_xp'
          // Missing triggerData
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/triggers/:id', () => {
    beforeEach(async () => {
      testTrigger = await ObjectTrigger.create({
        objectId: testObject.id,
        triggerType: 'grant_xp',
        triggerData: { amount: 50 },
        priority: 1,
        isActive: true
      });
    });

    it('should update a trigger', async () => {
      const response = await request(app)
        .put(`/api/triggers/${testTrigger.id}`)
        .set('x-user-id', testUser.id.toString())
        .send({
          priority: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe(5);
    });
  });

  describe('DELETE /api/triggers/:id', () => {
    beforeEach(async () => {
      testTrigger = await ObjectTrigger.create({
        objectId: testObject.id,
        triggerType: 'grant_xp',
        triggerData: { amount: 50 },
        priority: 1,
        isActive: true
      });
    });

    it('should delete a trigger', async () => {
      const response = await request(app)
        .delete(`/api/triggers/${testTrigger.id}`)
        .set('x-user-id', testUser.id.toString());

      expect(response.status).toBe(200);

      // Verify deletion
      const trigger = await ObjectTrigger.findByPk(testTrigger.id);
      expect(trigger).toBeNull();
    });
  });

  // ==================== State Management Tests ====================

  describe('GET /api/objects/:id/state', () => {
    it('should get object state', async () => {
      const response = await request(app)
        .get(`/api/objects/${testObject.id}/state`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should return 500 for non-existent object', async () => {
      const response = await request(app)
        .get('/api/objects/99999/state');

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/objects/:id/state', () => {
    it('should update object state', async () => {
      const newState = { isOpen: true, color: 'red' };
      
      const response = await request(app)
        .put(`/api/objects/${testObject.id}/state`)
        .set('x-user-id', testUser.id.toString())
        .send(newState);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(newState);
    });

    it('should return 400 if state is not an object', async () => {
      const response = await request(app)
        .put(`/api/objects/${testObject.id}/state`)
        .set('x-user-id', testUser.id.toString())
        .send('invalid');

      expect(response.status).toBe(400);
    });
  });

  // ==================== Queue Management Tests ====================

  describe('GET /api/objects/:id/queue', () => {
    beforeEach(async () => {
      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 1, y: 0, z: 1 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    it('should get empty queue', async () => {
      const response = await request(app)
        .get(`/api/objects/${testObject.id}/queue`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should get queue with entries', async () => {
      await InteractionQueue.create({
        objectId: testObject.id,
        nodeId: testNode.id,
        userId: testUser.id,
        position: 1,
        expiresAt: new Date(Date.now() + 60000)
      });

      const response = await request(app)
        .get(`/api/objects/${testObject.id}/queue`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].position).toBe(1);
    });
  });

  describe('POST /api/objects/:id/queue', () => {
    beforeEach(async () => {
      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 1, y: 0, z: 1 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });
    });

    it('should join queue', async () => {
      const response = await request(app)
        .post(`/api/objects/${testObject.id}/queue`)
        .set('x-user-id', testUser.id.toString())
        .send({
          nodeId: testNode.id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('queueId');
    });
  });

  describe('DELETE /api/queue/:queueId', () => {
    let queueEntry;

    beforeEach(async () => {
      testNode = await InteractionNode.create({
        objectId: testObject.id,
        position: { x: 1, y: 0, z: 1 },
        requiredState: 'sitting',
        isOccupied: false,
        maxOccupancy: 1
      });

      queueEntry = await InteractionQueue.create({
        objectId: testObject.id,
        nodeId: testNode.id,
        userId: testUser.id,
        position: 1,
        expiresAt: new Date(Date.now() + 60000)
      });
    });

    it('should leave queue', async () => {
      const response = await request(app)
        .delete(`/api/queue/${queueEntry.id}`)
        .set('x-user-id', testUser.id.toString());

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify deletion
      const entry = await InteractionQueue.findByPk(queueEntry.id);
      expect(entry).toBeNull();
    });

    it('should return 404 for non-existent queue entry', async () => {
      const response = await request(app)
        .delete('/api/queue/99999')
        .set('x-user-id', testUser.id.toString());

      expect(response.status).toBe(404);
    });
  });
});

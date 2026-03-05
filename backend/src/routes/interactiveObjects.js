const express = require('express');
const router = express.Router();
const service = require('../services/InteractiveObjectService');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');

// Validation middleware for request body
const validateObjectData = (req, res, next) => {
  const { objectType, name } = req.body;
  
  if (!objectType || !name) {
    return res.status(400).json({ 
      error: 'objectType y name son requeridos' 
    });
  }
  
  const validTypes = ['chair', 'door', 'table', 'furniture'];
  if (!validTypes.includes(objectType)) {
    return res.status(400).json({ 
      error: `objectType debe ser uno de: ${validTypes.join(', ')}` 
    });
  }
  
  next();
};

// Authorization middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  // TODO: Implement proper authentication and role checking
  // For now, we'll accept a userId from headers or body
  const userId = req.headers['x-user-id'] || req.body.userId || req.body.createdBy;
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'Autenticación requerida' 
    });
  }
  
  // Store userId in request for later use
  req.userId = parseInt(userId);
  
  // TODO: Check if user has admin role
  // For now, allow all authenticated users
  next();
};

/**
 * POST /api/objects
 * Create a new interactive object
 * Requires: admin authentication
 */
router.post('/', requireAdmin, validateObjectData, async (req, res) => {
  try {
    const { 
      officeId, 
      objectType, 
      name, 
      modelPath, 
      position, 
      rotation, 
      scale, 
      config 
    } = req.body;
    
    if (!officeId) {
      return res.status(400).json({ error: 'officeId es requerido' });
    }
    
    const objectData = {
      objectType,
      name,
      modelPath,
      position,
      rotation,
      scale,
      config
    };
    
    const object = await service.createObject(officeId, objectData, req.userId);
    
    // Invalidate cache for office objects
    await redis.del(`office:${officeId}:interactive-objects`);
    
    logger.info(`Interactive object created: ${name} (ID: ${object.id}) by user ${req.userId}`);
    res.status(201).json(object);
  } catch (error) {
    logger.error('Error creating interactive object:', error);
    res.status(500).json({ 
      error: 'Error al crear objeto interactivo',
      details: error.message 
    });
  }
});

/**
 * GET /api/objects/:id
 * Get details of a specific interactive object
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try cache first
    const cacheKey = `interactive-object:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const object = await service.getObject(id);
    
    if (!object) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(object));
    
    res.json(object);
  } catch (error) {
    logger.error('Error getting interactive object:', error);
    res.status(500).json({ 
      error: 'Error al obtener objeto interactivo',
      details: error.message 
    });
  }
});

/**
 * GET /api/objects/office/:officeId
 * Get all interactive objects in an office
 */
router.get('/office/:officeId', async (req, res) => {
  try {
    const { officeId } = req.params;
    
    // Try cache first
    const cacheKey = `office:${officeId}:interactive-objects`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const objects = await service.getObjectsByOffice(officeId);
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(objects));
    
    res.json(objects);
  } catch (error) {
    logger.error('Error getting office objects:', error);
    res.status(500).json({ 
      error: 'Error al obtener objetos de la oficina',
      details: error.message 
    });
  }
});

/**
 * PUT /api/objects/:id
 * Update an interactive object
 * Requires: admin authentication
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove userId from updates if present
    delete updates.userId;
    delete updates.createdBy;
    
    const object = await service.updateObject(id, updates, req.userId);
    
    if (!object) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    
    // Invalidate caches
    await redis.del(`interactive-object:${id}`);
    await redis.del(`office:${object.officeId}:interactive-objects`);
    
    logger.info(`Interactive object updated: ${id} by user ${req.userId}`);
    res.json(object);
  } catch (error) {
    logger.error('Error updating interactive object:', error);
    res.status(500).json({ 
      error: 'Error al actualizar objeto interactivo',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/objects/:id
 * Delete an interactive object
 * Requires: admin authentication
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get object first to know which office cache to invalidate
    const object = await service.getObject(id);
    
    if (!object) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    
    const officeId = object.officeId;
    
    await service.deleteObject(id, req.userId);
    
    // Invalidate caches
    await redis.del(`interactive-object:${id}`);
    await redis.del(`office:${officeId}:interactive-objects`);
    
    logger.info(`Interactive object deleted: ${id} by user ${req.userId}`);
    res.json({ message: 'Objeto eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting interactive object:', error);
    res.status(500).json({ 
      error: 'Error al eliminar objeto interactivo',
      details: error.message 
    });
  }
});

// ==================== Node Management Routes ====================

/**
 * POST /api/objects/:id/nodes
 * Add an interaction node to an object
 * Requires: admin authentication
 */
router.post('/:id/nodes', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { position, requiredState, maxOccupancy } = req.body;
    
    if (!position || !requiredState) {
      return res.status(400).json({ 
        error: 'position y requiredState son requeridos' 
      });
    }
    
    const nodeData = {
      position,
      requiredState,
      maxOccupancy
    };
    
    const node = await service.addInteractionNode(id, nodeData);
    
    // Invalidate caches
    await redis.del(`interactive-object:${id}`);
    const object = await service.getObject(id);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Interaction node created for object ${id} by user ${req.userId}`);
    res.status(201).json(node);
  } catch (error) {
    logger.error('Error creating interaction node:', error);
    res.status(500).json({ 
      error: 'Error al crear nodo de interacción',
      details: error.message 
    });
  }
});

/**
 * PUT /api/nodes/:id
 * Update an interaction node
 * Requires: admin authentication
 */
router.put('/nodes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const InteractionNode = require('../models/InteractionNode');
    
    const node = await InteractionNode.findByPk(id);
    if (!node) {
      return res.status(404).json({ error: 'Nodo no encontrado' });
    }
    
    const updates = req.body;
    await node.update(updates);
    
    // Invalidate caches
    await redis.del(`interactive-object:${node.objectId}`);
    const object = await service.getObject(node.objectId);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Interaction node ${id} updated by user ${req.userId}`);
    res.json(node);
  } catch (error) {
    logger.error('Error updating interaction node:', error);
    res.status(500).json({ 
      error: 'Error al actualizar nodo de interacción',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/nodes/:id
 * Delete an interaction node
 * Requires: admin authentication
 */
router.delete('/nodes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const InteractionNode = require('../models/InteractionNode');
    
    const node = await InteractionNode.findByPk(id);
    if (!node) {
      return res.status(404).json({ error: 'Nodo no encontrado' });
    }
    
    const objectId = node.objectId;
    await node.destroy();
    
    // Invalidate caches
    await redis.del(`interactive-object:${objectId}`);
    const object = await service.getObject(objectId);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Interaction node ${id} deleted by user ${req.userId}`);
    res.json({ message: 'Nodo eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting interaction node:', error);
    res.status(500).json({ 
      error: 'Error al eliminar nodo de interacción',
      details: error.message 
    });
  }
});

// ==================== Trigger Management Routes ====================

/**
 * POST /api/objects/:id/triggers
 * Add a trigger to an object
 * Requires: admin authentication
 */
router.post('/:id/triggers', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerType, triggerData, priority, condition } = req.body;
    
    if (!triggerType || !triggerData) {
      return res.status(400).json({ 
        error: 'triggerType y triggerData son requeridos' 
      });
    }
    
    const triggerPayload = {
      triggerType,
      triggerData,
      priority,
      condition
    };
    
    const trigger = await service.addTrigger(id, triggerPayload);
    
    // Invalidate caches
    await redis.del(`interactive-object:${id}`);
    const object = await service.getObject(id);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Trigger created for object ${id} by user ${req.userId}`);
    res.status(201).json(trigger);
  } catch (error) {
    logger.error('Error creating trigger:', error);
    res.status(500).json({ 
      error: 'Error al crear trigger',
      details: error.message 
    });
  }
});

/**
 * PUT /api/triggers/:id
 * Update a trigger
 * Requires: admin authentication
 */
router.put('/triggers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const ObjectTrigger = require('../models/ObjectTrigger');
    
    const trigger = await ObjectTrigger.findByPk(id);
    if (!trigger) {
      return res.status(404).json({ error: 'Trigger no encontrado' });
    }
    
    const updates = req.body;
    await trigger.update(updates);
    
    // Invalidate caches
    await redis.del(`interactive-object:${trigger.objectId}`);
    const object = await service.getObject(trigger.objectId);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Trigger ${id} updated by user ${req.userId}`);
    res.json(trigger);
  } catch (error) {
    logger.error('Error updating trigger:', error);
    res.status(500).json({ 
      error: 'Error al actualizar trigger',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/triggers/:id
 * Delete a trigger
 * Requires: admin authentication
 */
router.delete('/triggers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const ObjectTrigger = require('../models/ObjectTrigger');
    
    const trigger = await ObjectTrigger.findByPk(id);
    if (!trigger) {
      return res.status(404).json({ error: 'Trigger no encontrado' });
    }
    
    const objectId = trigger.objectId;
    await trigger.destroy();
    
    // Invalidate caches
    await redis.del(`interactive-object:${objectId}`);
    const object = await service.getObject(objectId);
    if (object) {
      await redis.del(`office:${object.officeId}:interactive-objects`);
    }
    
    logger.info(`Trigger ${id} deleted by user ${req.userId}`);
    res.json({ message: 'Trigger eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting trigger:', error);
    res.status(500).json({ 
      error: 'Error al eliminar trigger',
      details: error.message 
    });
  }
});

// ==================== State Management Routes ====================

/**
 * GET /api/objects/:id/state
 * Get the current state of an object
 */
router.get('/:id/state', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try cache first
    const cacheKey = `interactive-object:${id}:state`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const state = await service.getObjectState(id);
    
    // Cache for 1 minute (state changes frequently)
    await redis.setex(cacheKey, 60, JSON.stringify(state));
    
    res.json(state);
  } catch (error) {
    logger.error('Error getting object state:', error);
    res.status(500).json({ 
      error: 'Error al obtener estado del objeto',
      details: error.message 
    });
  }
});

/**
 * PUT /api/objects/:id/state
 * Update the state of an object
 * Requires: admin authentication
 */
router.put('/:id/state', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const newState = req.body;
    
    if (!newState || typeof newState !== 'object') {
      return res.status(400).json({ 
        error: 'Estado debe ser un objeto válido' 
      });
    }
    
    const object = await service.updateObjectState(id, newState);
    
    // Invalidate caches
    await redis.del(`interactive-object:${id}`);
    await redis.del(`interactive-object:${id}:state`);
    await redis.del(`office:${object.officeId}:interactive-objects`);
    
    logger.info(`Object ${id} state updated by user ${req.userId}`);
    res.json(object.state);
  } catch (error) {
    logger.error('Error updating object state:', error);
    res.status(500).json({ 
      error: 'Error al actualizar estado del objeto',
      details: error.message 
    });
  }
});

// ==================== Queue Management Routes ====================

/**
 * GET /api/objects/:id/queue
 * Get the interaction queue for an object
 */
router.get('/:id/queue', async (req, res) => {
  try {
    const { id } = req.params;
    const InteractionQueue = require('../models/InteractionQueue');
    
    // Try cache first
    const cacheKey = `interactive-object:${id}:queue`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const queue = await InteractionQueue.findAll({
      where: { objectId: id },
      order: [['position', 'ASC']],
      include: [
        { 
          model: require('../models/User'), 
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    // Cache for 10 seconds (queue changes frequently)
    await redis.setex(cacheKey, 10, JSON.stringify(queue));
    
    res.json(queue);
  } catch (error) {
    logger.error('Error getting interaction queue:', error);
    res.status(500).json({ 
      error: 'Error al obtener cola de interacción',
      details: error.message 
    });
  }
});

/**
 * POST /api/objects/:id/queue
 * Join the interaction queue for an object
 */
router.post('/:id/queue', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nodeId } = req.body;
    
    const InteractionService = require('../services/InteractionService');
    const result = await InteractionService.joinQueue(req.userId, parseInt(id), nodeId);
    
    // Invalidate queue cache
    await redis.del(`interactive-object:${id}:queue`);
    
    logger.info(`User ${req.userId} joined queue for object ${id}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error joining queue:', error);
    res.status(500).json({ 
      error: 'Error al unirse a la cola',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/queue/:queueId
 * Leave the interaction queue
 */
router.delete('/queue/:queueId', requireAdmin, async (req, res) => {
  try {
    const { queueId } = req.params;
    const InteractionQueue = require('../models/InteractionQueue');
    
    // Get queue entry to find object ID for cache invalidation
    const queueEntry = await InteractionQueue.findByPk(queueId);
    if (!queueEntry) {
      return res.status(404).json({ error: 'Entrada de cola no encontrada' });
    }
    
    const objectId = queueEntry.objectId;
    
    const InteractionService = require('../services/InteractionService');
    await InteractionService.leaveQueue(req.userId, parseInt(queueId));
    
    // Invalidate queue cache
    await redis.del(`interactive-object:${objectId}:queue`);
    
    logger.info(`User ${req.userId} left queue ${queueId}`);
    res.json({ message: 'Saliste de la cola exitosamente' });
  } catch (error) {
    logger.error('Error leaving queue:', error);
    res.status(500).json({ 
      error: 'Error al salir de la cola',
      details: error.message 
    });
  }
});

module.exports = router;

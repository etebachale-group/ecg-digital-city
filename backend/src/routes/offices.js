const express = require('express');
const router = express.Router();
const Office = require('../models/Office');
const OfficeObject = require('../models/OfficeObject');
const Permission = require('../models/Permission');
const Company = require('../models/Company');
const { UserProgress } = require('../models');
const { redis, invalidateUserProgressCache } = require('../config/redis');
const logger = require('../utils/logger');

// Obtener todas las oficinas
router.get('/', async (req, res) => {
  try {
    const { districtId, companyId } = req.query;
    
    const where = {};
    if (districtId) where.districtId = districtId;
    if (companyId) where.companyId = companyId;

    const cacheKey = `offices:${JSON.stringify(where)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const offices = await Office.findAll({
      where,
      include: [{ model: Company, as: 'company' }],
      order: [['createdAt', 'DESC']]
    });

    await redis.setex(cacheKey, 300, JSON.stringify(offices));
    res.json(offices);
  } catch (error) {
    logger.error('Error obteniendo oficinas:', error);
    res.status(500).json({ error: 'Error al obtener oficinas' });
  }
});

// Obtener oficina por ID con objetos
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cached = await redis.get(`office:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const office = await Office.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: OfficeObject, as: 'objects' }
      ]
    });

    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    await redis.setex(`office:${id}`, 300, JSON.stringify(office));
    res.json(office);
  } catch (error) {
    logger.error('Error obteniendo oficina:', error);
    res.status(500).json({ error: 'Error al obtener oficina' });
  }
});

// Crear oficina
router.post('/', async (req, res) => {
  try {
    const { companyId, districtId, name, description, position, size, isPublic, maxCapacity, theme } = req.body;

    if (!companyId || !districtId || !name) {
      return res.status(400).json({ error: 'companyId, districtId y name son requeridos' });
    }

    // Verificar límites de la empresa
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const officeCount = await Office.count({ where: { companyId } });
    if (officeCount >= company.maxOffices) {
      return res.status(400).json({ error: 'Límite de oficinas alcanzado para esta empresa' });
    }

    const office = await Office.create({
      companyId,
      districtId,
      name,
      description,
      position,
      size,
      isPublic,
      maxCapacity,
      theme
    });

    // Dar XP por crear oficina (50 XP)
    try {
      const ownerId = company.ownerId;
      let progress = await UserProgress.findOne({ where: { userId: ownerId } });
      if (!progress) {
        progress = await UserProgress.create({ userId: ownerId });
      }

      progress.xp += 50;
      const newLevel = Math.floor(progress.xp / 100) + 1;
      const leveledUp = newLevel > progress.level;
      
      if (leveledUp) {
        progress.level = newLevel;
      }
      
      await progress.save();
      await invalidateUserProgressCache(ownerId);
      
      logger.info(`Usuario ${ownerId} ganó 50 XP por crear oficina`);
    } catch (xpError) {
      logger.error('Error al dar XP por crear oficina:', xpError);
    }

    // Invalidar cache
    await redis.del(`offices:${JSON.stringify({ districtId, companyId })}`);

    logger.info(`Nueva oficina creada: ${name}`);
    res.status(201).json(office);
  } catch (error) {
    logger.error('Error creando oficina:', error);
    res.status(500).json({ error: 'Error al crear oficina' });
  }
});

// Actualizar oficina
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const office = await Office.findByPk(id);
    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    await office.update(updates);

    // Invalidar cache
    await redis.del(`office:${id}`);

    res.json(office);
  } catch (error) {
    logger.error('Error actualizando oficina:', error);
    res.status(500).json({ error: 'Error al actualizar oficina' });
  }
});

// Eliminar oficina
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const office = await Office.findByPk(id);
    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    await office.destroy();

    // Invalidar cache
    await redis.del(`office:${id}`);

    res.json({ message: 'Oficina eliminada exitosamente' });
  } catch (error) {
    logger.error('Error eliminando oficina:', error);
    res.status(500).json({ error: 'Error al eliminar oficina' });
  }
});

// Obtener objetos de una oficina
router.get('/:id/objects', async (req, res) => {
  try {
    const { id } = req.params;

    const cached = await redis.hgetall(`office:${id}:objects`);
    if (cached && Object.keys(cached).length > 0) {
      const objects = Object.values(cached).map(obj => JSON.parse(obj));
      return res.json(objects);
    }

    const objects = await OfficeObject.findAll({ where: { officeId: id } });

    // Guardar en Redis
    for (const obj of objects) {
      await redis.hset(`office:${id}:objects`, obj.id, JSON.stringify(obj));
    }
    await redis.expire(`office:${id}:objects`, 300);

    res.json(objects);
  } catch (error) {
    logger.error('Error obteniendo objetos:', error);
    res.status(500).json({ error: 'Error al obtener objetos' });
  }
});

// Agregar objeto a oficina
router.post('/:id/objects', async (req, res) => {
  try {
    const { id } = req.params;
    const { objectType, position, rotation, scale, color, metadata, createdBy } = req.body;

    if (!objectType || !createdBy) {
      return res.status(400).json({ error: 'objectType y createdBy son requeridos' });
    }

    const object = await OfficeObject.create({
      officeId: id,
      objectType,
      position,
      rotation,
      scale,
      color,
      metadata,
      createdBy
    });

    // Actualizar cache
    await redis.hset(`office:${id}:objects`, object.id, JSON.stringify(object));

    res.status(201).json(object);
  } catch (error) {
    logger.error('Error agregando objeto:', error);
    res.status(500).json({ error: 'Error al agregar objeto' });
  }
});

// Actualizar objeto
router.put('/:officeId/objects/:objectId', async (req, res) => {
  try {
    const { officeId, objectId } = req.params;
    const updates = req.body;

    const object = await OfficeObject.findOne({ where: { id: objectId, officeId } });
    if (!object) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }

    await object.update(updates);

    // Actualizar cache
    await redis.hset(`office:${officeId}:objects`, objectId, JSON.stringify(object));

    res.json(object);
  } catch (error) {
    logger.error('Error actualizando objeto:', error);
    res.status(500).json({ error: 'Error al actualizar objeto' });
  }
});

// Eliminar objeto
router.delete('/:officeId/objects/:objectId', async (req, res) => {
  try {
    const { officeId, objectId } = req.params;

    const object = await OfficeObject.findOne({ where: { id: objectId, officeId } });
    if (!object) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }

    await object.destroy();

    // Eliminar de cache
    await redis.hdel(`office:${officeId}:objects`, objectId);

    res.json({ message: 'Objeto eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando objeto:', error);
    res.status(500).json({ error: 'Error al eliminar objeto' });
  }
});

module.exports = router;

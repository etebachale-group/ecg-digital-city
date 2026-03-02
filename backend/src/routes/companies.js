const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Office = require('../models/Office');
const Permission = require('../models/Permission');
const { UserProgress } = require('../models');
const { redis, invalidateUserProgressCache } = require('../config/redis');
const logger = require('../utils/logger');

// Obtener todas las empresas
router.get('/', async (req, res) => {
  try {
    const cached = await redis.get('companies:all');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const companies = await Company.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    await redis.setex('companies:all', 300, JSON.stringify(companies));
    res.json(companies);
  } catch (error) {
    logger.error('Error obteniendo empresas:', error);
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
});

// Obtener empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cached = await redis.get(`company:${id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const company = await Company.findByPk(id, {
      include: [{ model: Office, as: 'offices' }]
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await redis.setex(`company:${id}`, 300, JSON.stringify(company));
    res.json(company);
  } catch (error) {
    logger.error('Error obteniendo empresa:', error);
    res.status(500).json({ error: 'Error al obtener empresa' });
  }
});

// Crear empresa
router.post('/', async (req, res) => {
  try {
    const { name, description, logo, ownerId, subscriptionTier } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Nombre y ownerId son requeridos' });
    }

    const limits = {
      basic: { maxOffices: 1, maxEmployees: 5 },
      pro: { maxOffices: 3, maxEmployees: 20 },
      enterprise: { maxOffices: 999, maxEmployees: 999 }
    };

    const tier = subscriptionTier || 'basic';
    const company = await Company.create({
      name,
      description,
      logo,
      ownerId,
      subscriptionTier: tier,
      ...limits[tier]
    });

    // Dar XP por crear empresa (100 XP)
    try {
      let progress = await UserProgress.findOne({ where: { userId: ownerId } });
      if (!progress) {
        progress = await UserProgress.create({ userId: ownerId });
      }

      progress.xp += 100;
      const newLevel = Math.floor(progress.xp / 100) + 1;
      const leveledUp = newLevel > progress.level;
      
      if (leveledUp) {
        progress.level = newLevel;
      }
      
      await progress.save();
      await invalidateUserProgressCache(ownerId);
      
      logger.info(`Usuario ${ownerId} ganó 100 XP por crear empresa`);
    } catch (xpError) {
      logger.error('Error al dar XP por crear empresa:', xpError);
    }

    // Invalidar cache
    await redis.del('companies:all');

    logger.info(`Nueva empresa creada: ${name}`);
    res.status(201).json(company);
  } catch (error) {
    logger.error('Error creando empresa:', error);
    res.status(500).json({ error: 'Error al crear empresa' });
  }
});

// Actualizar empresa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo, subscriptionTier } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await company.update({ name, description, logo, subscriptionTier });

    // Invalidar cache
    await redis.del(`company:${id}`);
    await redis.del('companies:all');

    res.json(company);
  } catch (error) {
    logger.error('Error actualizando empresa:', error);
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
});

// Eliminar empresa (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    await company.update({ isActive: false });

    // Invalidar cache
    await redis.del(`company:${id}`);
    await redis.del('companies:all');

    res.json({ message: 'Empresa eliminada exitosamente' });
  } catch (error) {
    logger.error('Error eliminando empresa:', error);
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
});

module.exports = router;

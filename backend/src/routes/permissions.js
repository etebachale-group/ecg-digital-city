const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');
const Office = require('../models/Office');
const User = require('../models/User');
const { redis, cachePermission } = require('../config/redis');
const logger = require('../utils/logger');

// Obtener permisos de una oficina
router.get('/office/:officeId', async (req, res) => {
  try {
    const { officeId } = req.params;

    const permissions = await Permission.findAll({
      where: { officeId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    res.json(permissions);
  } catch (error) {
    logger.error('Error obteniendo permisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
});

// Obtener permisos de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const permissions = await Permission.findAll({
      where: { userId },
      include: [{ model: Office, as: 'office' }]
    });

    res.json(permissions);
  } catch (error) {
    logger.error('Error obteniendo permisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
});

// Verificar permiso específico
router.get('/check/:userId/:officeId', async (req, res) => {
  try {
    const { userId, officeId } = req.params;

    const permission = await Permission.findOne({ where: { userId, officeId } });

    if (!permission) {
      return res.json({ hasAccess: false });
    }

    res.json({
      hasAccess: true,
      role: permission.role,
      canEdit: permission.canEdit,
      canInvite: permission.canInvite
    });
  } catch (error) {
    logger.error('Error verificando permiso:', error);
    res.status(500).json({ error: 'Error al verificar permiso' });
  }
});

// Crear o actualizar permiso
router.post('/', async (req, res) => {
  try {
    const { userId, officeId, role, canEdit, canInvite, expiresAt } = req.body;

    if (!userId || !officeId || !role) {
      return res.status(400).json({ error: 'userId, officeId y role son requeridos' });
    }

    const [permission, created] = await Permission.findOrCreate({
      where: { userId, officeId },
      defaults: { role, canEdit, canInvite, expiresAt }
    });

    if (!created) {
      await permission.update({ role, canEdit, canInvite, expiresAt });
    }

    // Cachear permiso
    await cachePermission(userId, officeId, permission);

    res.status(created ? 201 : 200).json(permission);
  } catch (error) {
    logger.error('Error creando permiso:', error);
    res.status(500).json({ error: 'Error al crear permiso' });
  }
});

// Eliminar permiso
router.delete('/:userId/:officeId', async (req, res) => {
  try {
    const { userId, officeId } = req.params;

    const permission = await Permission.findOne({ where: { userId, officeId } });
    if (!permission) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }

    await permission.destroy();

    // Eliminar de cache
    await redis.del(`permission:${userId}:${officeId}`);

    res.json({ message: 'Permiso eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando permiso:', error);
    res.status(500).json({ error: 'Error al eliminar permiso' });
  }
});

module.exports = router;

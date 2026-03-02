const express = require('express');
const router = express.Router();
const District = require('../models/District');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');

// Obtener todos los distritos
router.get('/', async (req, res) => {
  try {
    // Intentar obtener de Redis
    const cached = await redis.get('districts:all');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const districts = await District.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    // Guardar en Redis por 5 minutos
    await redis.setex('districts:all', 300, JSON.stringify(districts));

    res.json(districts);
  } catch (error) {
    logger.error('Error obteniendo distritos:', error);
    res.status(500).json({ error: 'Error al obtener distritos' });
  }
});

// Obtener distrito por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Intentar obtener de Redis
    const cached = await redis.get(`district:${slug}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const district = await District.findOne({ where: { slug, isActive: true } });

    if (!district) {
      return res.status(404).json({ error: 'Distrito no encontrado' });
    }

    // Guardar en Redis por 5 minutos
    await redis.setex(`district:${slug}`, 300, JSON.stringify(district));

    res.json(district);
  } catch (error) {
    logger.error('Error obteniendo distrito:', error);
    res.status(500).json({ error: 'Error al obtener distrito' });
  }
});

module.exports = router;

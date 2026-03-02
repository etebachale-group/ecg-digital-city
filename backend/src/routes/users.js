const express = require('express');
const router = express.Router();
const User = require('../models/User');
const logger = require('../utils/logger');

// TODO: Implementar middleware de autenticación

// Obtener perfil de usuario
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    logger.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Actualizar perfil
router.put('/:id', async (req, res) => {
  try {
    const { fullName, username } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({ fullName, username });

    res.json({ message: 'Usuario actualizado', user: user.toJSON() });
  } catch (error) {
    logger.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

module.exports = router;

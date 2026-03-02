const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Avatar = require('../models/Avatar');
const logger = require('../utils/logger');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const user = await User.create({
      email,
      passwordHash: password,
      username,
      fullName
    });

    const avatar = await Avatar.create({
      userId: user.id
    });

    await user.update({ avatarId: avatar.id });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`Nuevo usuario registrado: ${username}`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: user.toJSON(),
      avatar
    });

  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await user.update({ lastLogin: new Date() });

    const avatar = await Avatar.findOne({ where: { userId: user.id } });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`Usuario autenticado: ${user.username}`);

    res.json({
      message: 'Login exitoso',
      token,
      user: user.toJSON(),
      avatar
    });

  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;

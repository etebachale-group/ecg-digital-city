const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { setUserOnline, setUserOffline, getUsersOnline, updateUserPosition, setUserDistrict, removeUserFromDistrict } = require('../config/redis');
const movementHandler = require('./movementHandler');
const chatHandler = require('./chatHandler');
const { setupTeleportHandlers } = require('./teleportHandler');
const { setupOfficeEditorHandlers } = require('./officeEditorHandler');

const connectedUsers = new Map();

function setupSocketHandlers(io) {
  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      next();
    } catch (error) {
      logger.error('Error de autenticación Socket.IO:', error);
      next(new Error('Autenticación fallida'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const username = socket.username;

    logger.info(`Usuario conectado: ${username} (${userId})`);

    connectedUsers.set(userId, {
      socketId: socket.id,
      username,
      position: { x: 0, y: 0, z: 0 },
      district: 'central'
    });

    await setUserOnline(userId, socket.id, { x: 0, y: 0, z: 0 });
    await setUserDistrict(userId, 'central');
    socket.currentDistrict = 'central';
    socket.currentOffice = null;
    socket.join('district:central');

    const onlineUsers = await getUsersOnline();
    socket.emit('world:users', { users: onlineUsers });

    socket.broadcast.to('district:central').emit('world:user-joined', {
      userId,
      username,
      position: { x: 0, y: 0, z: 0 },
      district: 'central'
    });

    movementHandler(io, socket, connectedUsers);
    chatHandler(io, socket, connectedUsers);
    setupTeleportHandlers(io, socket);
    setupOfficeEditorHandlers(io, socket);

    socket.on('disconnect', async () => {
      logger.info(`Usuario desconectado: ${username} (${userId})`);
      
      // Limpiar distrito y oficina
      if (socket.currentDistrict) {
        await removeUserFromDistrict(userId, socket.currentDistrict);
      }
      
      connectedUsers.delete(userId);
      await setUserOffline(userId);
      
      io.emit('world:user-left', { userId });
    });

    socket.on('error', (error) => {
      logger.error(`Error en socket ${socket.id}:`, error);
    });
  });

  logger.info('Socket.IO handlers configurados');
}

module.exports = { setupSocketHandlers };

const { updateUserPosition } = require('../config/redis');
const logger = require('../utils/logger');

const throttleMap = new Map();
const THROTTLE_MS = parseInt(process.env.POSITION_UPDATE_THROTTLE) || 50;

function movementHandler(io, socket, connectedUsers) {
  
  socket.on('avatar:move', async (data) => {
    const userId = socket.userId;
    const now = Date.now();
    
    const lastUpdate = throttleMap.get(userId) || 0;
    if (now - lastUpdate < THROTTLE_MS) {
      return;
    }
    throttleMap.set(userId, now);

    try {
      const { x, y, z, rotation } = data;

      const user = connectedUsers.get(userId);
      if (user) {
        user.position = { x, y, z };
        user.rotation = rotation;
      }

      await updateUserPosition(userId, { x, y, z });

      socket.broadcast.emit('world:user-moved', {
        userId,
        position: { x, y, z },
        rotation
      });

    } catch (error) {
      logger.error('Error en avatar:move:', error);
    }
  });

  socket.on('avatar:stop', async (data) => {
    const userId = socket.userId;
    
    try {
      const { x, y, z } = data;

      const user = connectedUsers.get(userId);
      if (user) {
        user.position = { x, y, z };
      }

      await updateUserPosition(userId, { x, y, z });

      socket.broadcast.emit('world:user-moved', {
        userId,
        position: { x, y, z },
        rotation: user?.rotation || 0
      });

    } catch (error) {
      logger.error('Error en avatar:stop:', error);
    }
  });

  socket.on('teleport:request', async (data) => {
    const userId = socket.userId;
    
    try {
      const { district, position } = data;

      const user = connectedUsers.get(userId);
      if (user) {
        user.position = position;
        user.district = district;
      }

      await updateUserPosition(userId, position);

      socket.emit('teleport:success', { district, position });

      socket.broadcast.emit('world:user-moved', {
        userId,
        position,
        district
      });

      logger.info(`Usuario ${userId} teletransportado a ${district}`);

    } catch (error) {
      logger.error('Error en teleport:request:', error);
      socket.emit('error', { code: 'TELEPORT_FAILED', message: 'Error al teletransportar' });
    }
  });
}

module.exports = movementHandler;

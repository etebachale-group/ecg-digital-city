const OfficeObject = require('../models/OfficeObject');
const Permission = require('../models/Permission');
const logger = require('../utils/logger');
const { redis, getPermissionFromCache, cachePermission } = require('../config/redis');

function setupOfficeEditorHandlers(io, socket) {
  
  // Verificar permisos de edición
  async function checkEditPermission(userId, officeId) {
    let permission = await getPermissionFromCache(userId, officeId);
    
    if (!permission) {
      permission = await Permission.findOne({ where: { userId, officeId } });
      if (permission) {
        await cachePermission(userId, officeId, permission);
      }
    }

    return permission && permission.canEdit;
  }

  // Iniciar modo edición
  socket.on('office:edit-mode', async (data) => {
    try {
      const { officeId } = data;
      const userId = socket.userId;

      const canEdit = await checkEditPermission(userId, officeId);
      if (!canEdit) {
        return socket.emit('office:edit-error', { message: 'No tienes permisos para editar esta oficina' });
      }

      // Marcar usuario como editando
      await redis.hset(`office:${officeId}:editors`, userId, socket.username);
      
      // Notificar a otros usuarios
      socket.to(`office:${officeId}`).emit('office:editor-joined', {
        userId,
        username: socket.username
      });

      socket.emit('office:edit-mode-enabled', { officeId });
      logger.info(`Usuario ${socket.username} inició edición en oficina ${officeId}`);

    } catch (error) {
      logger.error('Error al iniciar modo edición:', error);
      socket.emit('office:edit-error', { message: 'Error al iniciar modo edición' });
    }
  });

  // Salir de modo edición
  socket.on('office:exit-edit-mode', async (data) => {
    try {
      const { officeId } = data;
      const userId = socket.userId;

      await redis.hdel(`office:${officeId}:editors`, userId);
      
      socket.to(`office:${officeId}`).emit('office:editor-left', {
        userId,
        username: socket.username
      });

      socket.emit('office:edit-mode-disabled', { officeId });

    } catch (error) {
      logger.error('Error al salir de modo edición:', error);
    }
  });

  // Agregar objeto
  socket.on('office:add-object', async (data) => {
    try {
      const { officeId, objectType, position, rotation, scale, color, metadata } = data;
      const userId = socket.userId;

      const canEdit = await checkEditPermission(userId, officeId);
      if (!canEdit) {
        return socket.emit('office:edit-error', { message: 'No tienes permisos para editar' });
      }

      const object = await OfficeObject.create({
        officeId,
        objectType,
        position,
        rotation,
        scale,
        color,
        metadata,
        createdBy: userId
      });

      // Actualizar cache
      await redis.hset(`office:${officeId}:objects`, object.id, JSON.stringify(object));

      // Notificar a todos en la oficina
      io.to(`office:${officeId}`).emit('office:object-added', {
        object: object.toJSON(),
        addedBy: socket.username
      });

      logger.info(`Objeto ${objectType} agregado a oficina ${officeId}`);

    } catch (error) {
      logger.error('Error al agregar objeto:', error);
      socket.emit('office:edit-error', { message: 'Error al agregar objeto' });
    }
  });

  // Actualizar objeto
  socket.on('office:update-object', async (data) => {
    try {
      const { officeId, objectId, updates } = data;
      const userId = socket.userId;

      const canEdit = await checkEditPermission(userId, officeId);
      if (!canEdit) {
        return socket.emit('office:edit-error', { message: 'No tienes permisos para editar' });
      }

      const object = await OfficeObject.findOne({ where: { id: objectId, officeId } });
      if (!object) {
        return socket.emit('office:edit-error', { message: 'Objeto no encontrado' });
      }

      await object.update(updates);

      // Actualizar cache
      await redis.hset(`office:${officeId}:objects`, objectId, JSON.stringify(object));

      // Notificar a todos en la oficina
      io.to(`office:${officeId}`).emit('office:object-updated', {
        objectId,
        updates,
        updatedBy: socket.username
      });

    } catch (error) {
      logger.error('Error al actualizar objeto:', error);
      socket.emit('office:edit-error', { message: 'Error al actualizar objeto' });
    }
  });

  // Eliminar objeto
  socket.on('office:delete-object', async (data) => {
    try {
      const { officeId, objectId } = data;
      const userId = socket.userId;

      const canEdit = await checkEditPermission(userId, officeId);
      if (!canEdit) {
        return socket.emit('office:edit-error', { message: 'No tienes permisos para editar' });
      }

      const object = await OfficeObject.findOne({ where: { id: objectId, officeId } });
      if (!object) {
        return socket.emit('office:edit-error', { message: 'Objeto no encontrado' });
      }

      await object.destroy();

      // Eliminar de cache
      await redis.hdel(`office:${officeId}:objects`, objectId);

      // Notificar a todos en la oficina
      io.to(`office:${officeId}`).emit('office:object-deleted', {
        objectId,
        deletedBy: socket.username
      });

    } catch (error) {
      logger.error('Error al eliminar objeto:', error);
      socket.emit('office:edit-error', { message: 'Error al eliminar objeto' });
    }
  });

  // Mover objeto en tiempo real (sin guardar en DB aún)
  socket.on('office:object-moving', (data) => {
    const { officeId, objectId, position } = data;
    socket.to(`office:${officeId}`).emit('office:object-moving', {
      objectId,
      position,
      movedBy: socket.username
    });
  });
}

module.exports = { setupOfficeEditorHandlers };

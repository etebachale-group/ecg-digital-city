const logger = require('../utils/logger');
const { UserProgress } = require('../models');
const { invalidateUserProgressCache } = require('../config/redis');

function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function chatHandler(io, socket, connectedUsers) {
  
  socket.on('chat:message', async (data) => {
    const userId = socket.userId;
    const username = socket.username;
    
    try {
      const { content, type, roomId } = data;
      const sender = connectedUsers.get(userId);

      if (!sender) return;

      const message = {
        senderId: userId,
        senderName: username,
        content,
        type: type || 'text',
        timestamp: new Date().toISOString()
      };

      // Dar XP por enviar mensaje (max 50 mensajes por día = 250 XP)
      try {
        let progress = await UserProgress.findOne({ where: { userId } });
        if (!progress) {
          progress = await UserProgress.create({ userId });
        }

        // Verificar si es un nuevo día
        const today = new Date().toISOString().split('T')[0];
        const lastMessageDate = progress.lastLogin;
        
        // Resetear contador si es un nuevo día
        if (lastMessageDate !== today) {
          progress.totalMessages = 0;
        }

        // Incrementar contador de mensajes
        progress.totalMessages += 1;
        
        // Dar XP solo si no ha superado el límite diario (50 mensajes = 250 XP)
        if (progress.totalMessages <= 50) {
          progress.xp += 5;
          const newLevel = Math.floor(progress.xp / 100) + 1;
          const leveledUp = newLevel > progress.level;
          
          if (leveledUp) {
            progress.level = newLevel;
            // Notificar level up
            socket.emit('gamification:levelup', {
              level: newLevel,
              xp: progress.xp
            });
          }
          
          await progress.save();
          await invalidateUserProgressCache(userId);
          
          // Notificar XP ganado
          socket.emit('gamification:xp', {
            xp: 5,
            action: 'send_message',
            total: progress.xp,
            level: progress.level,
            leveledUp,
            messagesLeft: 50 - progress.totalMessages
          });
          
          logger.info(`Usuario ${userId} ganó 5 XP por mensaje (${progress.totalMessages}/50 hoy)`);
        } else {
          // Notificar que alcanzó el límite
          socket.emit('gamification:limit', {
            message: 'Has alcanzado el límite diario de XP por mensajes (50 mensajes)',
            type: 'messages'
          });
        }
      } catch (xpError) {
        logger.error('Error al dar XP por mensaje:', xpError);
      }

      // Chat por proximidad
      if (type === 'proximity' || !type) {
        const PROXIMITY_DISTANCE = parseFloat(process.env.PROXIMITY_CHAT_DISTANCE) || 3;

        connectedUsers.forEach((user, targetUserId) => {
          if (targetUserId === userId) return;

          const distance = calculateDistance(sender.position, user.position);
          
          if (distance <= PROXIMITY_DISTANCE) {
            io.to(user.socketId).emit('chat:message', message);
          }
        });

        socket.emit('chat:message', message);
      }
      
      // Chat de sala privada
      else if (type === 'room' && roomId) {
        io.to(roomId).emit('chat:message', message);
      }
      
      // Chat global (solo para admins)
      else if (type === 'global') {
        io.emit('chat:message', message);
      }

    } catch (error) {
      logger.error('Error en chat:message:', error);
    }
  });

  socket.on('chat:typing', (data) => {
    const userId = socket.userId;
    const { isTyping } = data;

    socket.broadcast.emit('chat:typing', {
      userId,
      username: socket.username,
      isTyping
    });
  });
}

module.exports = chatHandler;

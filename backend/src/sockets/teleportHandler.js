const District = require('../models/District');
const Office = require('../models/Office');
const Permission = require('../models/Permission');
const { UserProgress } = require('../models');
const logger = require('../utils/logger');
const { 
  setUserDistrict, 
  removeUserFromDistrict,
  setUserInOffice,
  removeUserFromOffice,
  getUsersInDistrict,
  getPermissionFromCache,
  cachePermission,
  invalidateUserProgressCache
} = require('../config/redis');

function setupTeleportHandlers(io, socket) {
  
  // Teletransporte a distrito
  socket.on('teleport:district', async (data) => {
    try {
      const { districtSlug, position } = data;
      const userId = socket.userId;

      // Validar distrito
      const district = await District.findOne({ where: { slug: districtSlug, isActive: true } });
      if (!district) {
        return socket.emit('teleport:error', { message: 'Distrito no encontrado' });
      }

      // Remover de distrito anterior si existe
      if (socket.currentDistrict) {
        await removeUserFromDistrict(userId, socket.currentDistrict);
        socket.leave(`district:${socket.currentDistrict}`);
      }

      // Remover de oficina anterior si existe
      if (socket.currentOffice) {
        await removeUserFromOffice(userId, socket.currentOffice);
        socket.leave(`office:${socket.currentOffice}`);
        socket.currentOffice = null;
      }

      // Agregar a nuevo distrito
      await setUserDistrict(userId, districtSlug);
      socket.join(`district:${districtSlug}`);
      socket.currentDistrict = districtSlug;

      // Notificar a otros usuarios en el distrito
      socket.to(`district:${districtSlug}`).emit('user:entered-district', {
        userId,
        username: socket.username,
        position: position || district.position
      });

      // Obtener usuarios en el distrito
      const usersInDistrict = await getUsersInDistrict(districtSlug);

      // Dar XP por visitar distrito único (20 XP, máximo 4 distritos únicos = 80 XP)
      try {
        let progress = await UserProgress.findOne({ where: { userId } });
        if (!progress) {
          progress = await UserProgress.create({ userId });
        }

        // Obtener lista de distritos visitados (guardada en Redis o crear nueva)
        const visitedDistrictsKey = `visited_districts:${userId}`;
        let visitedDistricts = [];
        
        try {
          const cached = await require('../config/redis').redis.get(visitedDistrictsKey);
          if (cached) {
            visitedDistricts = JSON.parse(cached);
          }
        } catch (e) {
          // Si falla Redis, continuar sin cache
        }

        // Verificar si es un distrito nuevo
        if (!visitedDistricts.includes(districtSlug) && visitedDistricts.length < 4) {
          visitedDistricts.push(districtSlug);
          
          // Guardar en Redis
          try {
            await require('../config/redis').redis.set(
              visitedDistrictsKey, 
              JSON.stringify(visitedDistricts),
              'EX',
              86400 // 24 horas
            );
          } catch (e) {
            // Si falla Redis, continuar
          }

          // Dar XP
          progress.totalDistrictsVisited = visitedDistricts.length;
          progress.xp += 20;
          
          const newLevel = Math.floor(progress.xp / 100) + 1;
          const leveledUp = newLevel > progress.level;
          
          if (leveledUp) {
            progress.level = newLevel;
            socket.emit('gamification:levelup', {
              level: newLevel,
              xp: progress.xp
            });
          }
          
          await progress.save();
          await invalidateUserProgressCache(userId);
          
          socket.emit('gamification:xp', {
            xp: 20,
            action: 'visit_district',
            total: progress.xp,
            level: progress.level,
            leveledUp,
            districtName: district.name,
            uniqueDistricts: visitedDistricts.length
          });
          
          logger.info(`Usuario ${userId} ganó 20 XP por visitar distrito ${districtSlug} (${visitedDistricts.length}/4 únicos)`);
        }
      } catch (xpError) {
        logger.error('Error al dar XP por visitar distrito:', xpError);
      }

      // Confirmar teletransporte
      socket.emit('teleport:success', {
        district: district.toJSON(),
        position: position || district.position,
        usersInDistrict: usersInDistrict.length
      });

      logger.info(`Usuario ${socket.username} teletransportado a distrito ${districtSlug}`);

    } catch (error) {
      logger.error('Error en teletransporte a distrito:', error);
      socket.emit('teleport:error', { message: 'Error al teletransportar' });
    }
  });

  // Teletransporte a oficina
  socket.on('teleport:office', async (data) => {
    try {
      const { officeId } = data;
      const userId = socket.userId;

      // Validar oficina
      const office = await Office.findByPk(officeId);
      if (!office) {
        return socket.emit('teleport:error', { message: 'Oficina no encontrada' });
      }

      // Verificar permisos si la oficina no es pública
      if (!office.isPublic) {
        let permission = await getPermissionFromCache(userId, officeId);
        
        if (!permission) {
          permission = await Permission.findOne({ where: { userId, officeId } });
          if (permission) {
            await cachePermission(userId, officeId, permission);
          }
        }

        if (!permission) {
          return socket.emit('teleport:error', { message: 'No tienes acceso a esta oficina' });
        }
      }

      // Remover de distrito anterior
      if (socket.currentDistrict) {
        await removeUserFromDistrict(userId, socket.currentDistrict);
        socket.leave(`district:${socket.currentDistrict}`);
      }

      // Remover de oficina anterior
      if (socket.currentOffice) {
        await removeUserFromOffice(userId, socket.currentOffice);
        socket.leave(`office:${socket.currentOffice}`);
      }

      // Agregar a nueva oficina
      await setUserInOffice(userId, officeId);
      socket.join(`office:${officeId}`);
      socket.currentOffice = officeId;
      socket.currentDistrict = null;

      // Notificar a otros usuarios en la oficina
      socket.to(`office:${officeId}`).emit('user:entered-office', {
        userId,
        username: socket.username
      });

      // Confirmar teletransporte
      socket.emit('teleport:success', {
        office: office.toJSON(),
        position: office.position
      });

      logger.info(`Usuario ${socket.username} entró a oficina ${officeId}`);

    } catch (error) {
      logger.error('Error en teletransporte a oficina:', error);
      socket.emit('teleport:error', { message: 'Error al entrar a la oficina' });
    }
  });

  // Salir de oficina (volver al distrito)
  socket.on('office:exit', async (data) => {
    try {
      const userId = socket.userId;
      const { officeId } = data;

      if (socket.currentOffice) {
        await removeUserFromOffice(userId, socket.currentOffice);
        socket.leave(`office:${socket.currentOffice}`);
        
        // Notificar a otros usuarios
        socket.to(`office:${socket.currentOffice}`).emit('user:left-office', {
          userId,
          username: socket.username
        });

        socket.currentOffice = null;
      }

      // Obtener oficina para saber a qué distrito volver
      const office = await Office.findByPk(officeId, {
        include: [{ model: District, as: 'district' }]
      });

      if (office && office.district) {
        // Volver al distrito
        await setUserDistrict(userId, office.district.slug);
        socket.join(`district:${office.district.slug}`);
        socket.currentDistrict = office.district.slug;

        socket.emit('teleport:success', {
          district: office.district.toJSON(),
          position: office.position
        });
      }

    } catch (error) {
      logger.error('Error al salir de oficina:', error);
      socket.emit('error', { message: 'Error al salir de la oficina' });
    }
  });
}

module.exports = { setupTeleportHandlers };

const { Achievement, Mission } = require('../models')
const logger = require('./logger')

const achievements = [
  // Categoría: Social
  {
    name: 'Primera Conexión',
    description: 'Inicia sesión por primera vez',
    
    icon: '👋',
    xpReward: 50,
    requirementType: 'login_count',
    requirementValue: 1
  },
  {
    name: 'Conversador',
    description: 'Envía 100 mensajes',
    
    icon: '💬',
    xpReward: 100,
    requirementType: 'message_count',
    requirementValue: 100
  },
  {
    name: 'Influencer',
    description: 'Conecta con 50 personas',
    
    icon: '⭐',
    xpReward: 200,
    requirementType: 'connection_count',
    requirementValue: 50
  },
  {
    name: 'Anfitrión',
    description: 'Organiza 5 eventos',
    
    icon: '🎉',
    xpReward: 150,
    requirementType: 'event_organized',
    requirementValue: 5
  },
  
  // Categoría: Explorador
  {
    name: 'Turista',
    description: 'Visita los 4 distritos',
    
    icon: '🗺️',
    xpReward: 100,
    requirementType: 'districts_visited',
    requirementValue: 4
  },
  {
    name: 'Conocedor',
    description: 'Visita 20 oficinas diferentes',
    
    icon: '🏢',
    xpReward: 150,
    requirementType: 'offices_visited',
    requirementValue: 20
  },
  {
    name: 'Trotamundos',
    description: 'Teletransportate 50 veces',
    
    icon: '✨',
    xpReward: 100,
    requirementType: 'teleport_count',
    requirementValue: 50
  },
  
  // Categoría: Empresarial
  {
    name: 'Emprendedor',
    description: 'Crea tu primera empresa',
    
    icon: '🚀',
    xpReward: 200,
    requirementType: 'company_created',
    requirementValue: 1
  },
  {
    name: 'Magnate',
    description: 'Posee 3 o más empresas',
    
    icon: '💼',
    xpReward: 300,
    requirementType: 'company_count',
    requirementValue: 3
  },
  {
    name: 'Constructor',
    description: 'Crea 10 oficinas',
    
    icon: '🏗️',
    xpReward: 250,
    requirementType: 'office_created',
    requirementValue: 10
  },
  {
    name: 'Decorador',
    description: 'Coloca 100 objetos en oficinas',
    
    icon: '🎨',
    xpReward: 150,
    requirementType: 'objects_placed',
    requirementValue: 100
  },
  
  // Categoría: Eventos
  {
    name: 'Asistente',
    description: 'Asiste a 5 eventos',
    
    icon: '🎫',
    xpReward: 100,
    requirementType: 'events_attended',
    requirementValue: 5
  },
  {
    name: 'Organizador',
    description: 'Crea 3 eventos',
    
    icon: '📅',
    xpReward: 150,
    requirementType: 'events_created',
    requirementValue: 3
  },
  {
    name: 'Networker',
    description: 'Conoce 20 personas en eventos',
    
    icon: '🤝',
    xpReward: 200,
    requirementType: 'event_connections',
    requirementValue: 20
  },
  
  // Categoría: Especial
  {
    name: 'Madrugador',
    description: 'Mantén una racha de 7 días',
    
    icon: '🌅',
    xpReward: 250,
    requirementType: 'streak_days',
    requirementValue: 7
  },
  {
    name: 'Dedicado',
    description: 'Mantén una racha de 30 días',
    
    icon: '🔥',
    xpReward: 500,
    requirementType: 'streak_days',
    requirementValue: 30
  }
]

const missions = [
  // Misiones diarias fáciles
  {
    name: 'Saluda a 3 personas',
    description: 'Envía mensajes a 3 usuarios diferentes',
    missionType: 'social',
    targetValue: 3,
    xpReward: 50,
    isDaily: true,
    isActive: true
  },
  {
    name: 'Explora un distrito',
    description: 'Visita cualquier distrito de la ciudad',
    missionType: 'exploration',
    targetValue: 1,
    xpReward: 30,
    isDaily: true,
    isActive: true
  },
  {
    name: 'Visita 2 oficinas',
    description: 'Entra a 2 oficinas diferentes',
    missionType: 'exploration',
    targetValue: 2,
    xpReward: 40,
    isDaily: true,
    isActive: true
  },
  
  // Misiones diarias medias
  {
    name: 'Conversación activa',
    description: 'Envía 10 mensajes en el chat',
    missionType: 'social',
    targetValue: 10,
    xpReward: 100,
    isDaily: true,
    isActive: true
  },
  {
    name: 'Teletransportate 5 veces',
    description: 'Usa el sistema de teletransporte 5 veces',
    missionType: 'exploration',
    targetValue: 5,
    xpReward: 80,
    isDaily: true,
    isActive: true
  },
  {
    name: 'Edita tu oficina',
    description: 'Coloca 5 objetos en una oficina',
    missionType: 'business',
    targetValue: 5,
    xpReward: 120,
    isDaily: true,
    isActive: true
  },
  
  // Misiones semanales
  {
    name: 'Explorador de la semana',
    description: 'Visita los 4 distritos',
    missionType: 'exploration',
    targetValue: 4,
    xpReward: 200,
    isDaily: false,
    isActive: true
  },
  {
    name: 'Socializar',
    description: 'Habla con 10 usuarios diferentes',
    missionType: 'social',
    targetValue: 10,
    xpReward: 250,
    isDaily: false,
    isActive: true
  },
  {
    name: 'Asiste a un evento',
    description: 'Participa en cualquier evento de la semana',
    missionType: 'events',
    targetValue: 1,
    xpReward: 150,
    isDaily: false,
    isActive: true
  },
  {
    name: 'Empresario activo',
    description: 'Crea o edita una oficina',
    missionType: 'business',
    targetValue: 1,
    xpReward: 180,
    isDaily: false,
    isActive: true
  }
]

async function seedGamification() {
  try {
    // Seed achievements
    for (const achievementData of achievements) {
      const [achievement, created] = await Achievement.findOrCreate({
        where: { name: achievementData.name },
        defaults: achievementData
      })
      
      if (created) {
        logger.info(`✅ Logro creado: ${achievement.name}`)
      } else {
        logger.info(`ℹ️  Logro ya existe: ${achievement.name}`)
      }
    }
    
    // Seed missions
    for (const missionData of missions) {
      const [mission, created] = await Mission.findOrCreate({
        where: { name: missionData.name },
        defaults: missionData
      })
      
      if (created) {
        logger.info(`✅ Misión creada: ${mission.name}`)
      } else {
        logger.info(`ℹ️  Misión ya existe: ${mission.name}`)
      }
    }
    
    logger.info('🎉 Seed de gamificación completado')
  } catch (error) {
    logger.error('Error en seed de gamificación:', error)
    throw error
  }
}

module.exports = { seedGamification }

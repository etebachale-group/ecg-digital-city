const { Achievement, Mission } = require('../models')
const logger = require('./logger')

const achievements = [
  // Categoría: Social
  {
    name: 'Primera Conexión',
    description: 'Inicia sesión por primera vez',
    category: 'social',
    icon: '👋',
    xpReward: 50,
    requirementType: 'login_count',
    requirementValue: 1
  },
  {
    name: 'Conversador',
    description: 'Envía 100 mensajes',
    category: 'social',
    icon: '💬',
    xpReward: 100,
    requirementType: 'message_count',
    requirementValue: 100
  },
  {
    name: 'Influencer',
    description: 'Conecta con 50 personas',
    category: 'social',
    icon: '⭐',
    xpReward: 200,
    requirementType: 'connection_count',
    requirementValue: 50
  },
  {
    name: 'Anfitrión',
    description: 'Organiza 5 eventos',
    category: 'social',
    icon: '🎉',
    xpReward: 150,
    requirementType: 'event_organized',
    requirementValue: 5
  },
  
  // Categoría: Explorador
  {
    name: 'Turista',
    description: 'Visita los 4 distritos',
    category: 'explorador',
    icon: '🗺️',
    xpReward: 100,
    requirementType: 'districts_visited',
    requirementValue: 4
  },
  {
    name: 'Conocedor',
    description: 'Visita 20 oficinas diferentes',
    category: 'explorador',
    icon: '🏢',
    xpReward: 150,
    requirementType: 'offices_visited',
    requirementValue: 20
  },
  {
    name: 'Trotamundos',
    description: 'Teletransportate 50 veces',
    category: 'explorador',
    icon: '✨',
    xpReward: 100,
    requirementType: 'teleport_count',
    requirementValue: 50
  },
  
  // Categoría: Empresarial
  {
    name: 'Emprendedor',
    description: 'Crea tu primera empresa',
    category: 'empresarial',
    icon: '🚀',
    xpReward: 200,
    requirementType: 'company_created',
    requirementValue: 1
  },
  {
    name: 'Magnate',
    description: 'Posee 3 o más empresas',
    category: 'empresarial',
    icon: '💼',
    xpReward: 300,
    requirementType: 'company_count',
    requirementValue: 3
  },
  {
    name: 'Constructor',
    description: 'Crea 10 oficinas',
    category: 'empresarial',
    icon: '🏗️',
    xpReward: 250,
    requirementType: 'office_created',
    requirementValue: 10
  },
  {
    name: 'Decorador',
    description: 'Coloca 100 objetos en oficinas',
    category: 'empresarial',
    icon: '🎨',
    xpReward: 150,
    requirementType: 'objects_placed',
    requirementValue: 100
  },
  
  // Categoría: Eventos
  {
    name: 'Asistente',
    description: 'Asiste a 5 eventos',
    category: 'eventos',
    icon: '🎫',
    xpReward: 100,
    requirementType: 'events_attended',
    requirementValue: 5
  },
  {
    name: 'Organizador',
    description: 'Crea 3 eventos',
    category: 'eventos',
    icon: '📅',
    xpReward: 150,
    requirementType: 'events_created',
    requirementValue: 3
  },
  {
    name: 'Networker',
    description: 'Conoce 20 personas en eventos',
    category: 'eventos',
    icon: '🤝',
    xpReward: 200,
    requirementType: 'event_connections',
    requirementValue: 20
  },
  
  // Categoría: Especial
  {
    name: 'Madrugador',
    description: 'Mantén una racha de 7 días',
    category: 'especial',
    icon: '🌅',
    xpReward: 250,
    requirementType: 'streak_days',
    requirementValue: 7
  },
  {
    name: 'Dedicado',
    description: 'Mantén una racha de 30 días',
    category: 'especial',
    icon: '🔥',
    xpReward: 500,
    requirementType: 'streak_days',
    requirementValue: 30
  }
]

const missions = [
  // Misiones diarias fáciles
  {
    title: 'Saluda a 3 personas',
    description: 'Envía mensajes a 3 usuarios diferentes',
    missionType: 'social',
    difficulty: 'easy',
    xpReward: 50,
    requirementType: 'send_messages',
    requirementValue: 3,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Explora un distrito',
    description: 'Visita cualquier distrito de la ciudad',
    missionType: 'exploration',
    difficulty: 'easy',
    xpReward: 30,
    requirementType: 'visit_district',
    requirementValue: 1,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Visita 2 oficinas',
    description: 'Entra a 2 oficinas diferentes',
    missionType: 'exploration',
    difficulty: 'easy',
    xpReward: 40,
    requirementType: 'visit_offices',
    requirementValue: 2,
    isDaily: true,
    isActive: true
  },
  
  // Misiones diarias medias
  {
    title: 'Conversación activa',
    description: 'Envía 10 mensajes en el chat',
    missionType: 'social',
    difficulty: 'medium',
    xpReward: 100,
    requirementType: 'send_messages',
    requirementValue: 10,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Teletransportate 5 veces',
    description: 'Usa el sistema de teletransporte 5 veces',
    missionType: 'exploration',
    difficulty: 'medium',
    xpReward: 80,
    requirementType: 'teleport',
    requirementValue: 5,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Edita tu oficina',
    description: 'Coloca 5 objetos en una oficina',
    missionType: 'business',
    difficulty: 'medium',
    xpReward: 120,
    requirementType: 'place_objects',
    requirementValue: 5,
    isDaily: true,
    isActive: true
  },
  
  // Misiones semanales
  {
    title: 'Explorador de la semana',
    description: 'Visita los 4 distritos',
    missionType: 'exploration',
    difficulty: 'hard',
    xpReward: 200,
    requirementType: 'visit_all_districts',
    requirementValue: 4,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Socializar',
    description: 'Habla con 10 usuarios diferentes',
    missionType: 'social',
    difficulty: 'hard',
    xpReward: 250,
    requirementType: 'unique_conversations',
    requirementValue: 10,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Asiste a un evento',
    description: 'Participa en cualquier evento de la semana',
    missionType: 'events',
    difficulty: 'medium',
    xpReward: 150,
    requirementType: 'attend_event',
    requirementValue: 1,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Empresario activo',
    description: 'Crea o edita una oficina',
    missionType: 'business',
    difficulty: 'medium',
    xpReward: 180,
    requirementType: 'office_activity',
    requirementValue: 1,
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
        where: { title: missionData.title },
        defaults: missionData
      })
      
      if (created) {
        logger.info(`✅ Misión creada: ${mission.title}`)
      } else {
        logger.info(`ℹ️  Misión ya existe: ${mission.title}`)
      }
    }
    
    logger.info('🎉 Seed de gamificación completado')
  } catch (error) {
    logger.error('Error en seed de gamificación:', error)
    throw error
  }
}

module.exports = { seedGamification }

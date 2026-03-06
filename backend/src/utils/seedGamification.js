const { Achievement, Mission } = require('../models')
const logger = require('./logger')

const achievements = [
  // Categoría: Social
  {
    name: 'Primera Conexión',
    description: 'Inicia sesión por primera vez',
    
    icon: '👋',
    xpReward: 50,
    conditionType: 'login_count',
    conditionValue: 1
  },
  {
    name: 'Conversador',
    description: 'Envía 100 mensajes',
    
    icon: '💬',
    xpReward: 100,
    conditionType: 'message_count',
    conditionValue: 100
  },
  {
    name: 'Influencer',
    description: 'Conecta con 50 personas',
    
    icon: '⭐',
    xpReward: 200,
    conditionType: 'connection_count',
    conditionValue: 50
  },
  {
    name: 'Anfitrión',
    description: 'Organiza 5 eventos',
    
    icon: '🎉',
    xpReward: 150,
    conditionType: 'event_organized',
    conditionValue: 5
  },
  
  // Categoría: Explorador
  {
    name: 'Turista',
    description: 'Visita los 4 distritos',
    
    icon: '🗺️',
    xpReward: 100,
    conditionType: 'districts_visited',
    conditionValue: 4
  },
  {
    name: 'Conocedor',
    description: 'Visita 20 oficinas diferentes',
    
    icon: '🏢',
    xpReward: 150,
    conditionType: 'offices_visited',
    conditionValue: 20
  },
  {
    name: 'Trotamundos',
    description: 'Teletransportate 50 veces',
    
    icon: '✨',
    xpReward: 100,
    conditionType: 'teleport_count',
    conditionValue: 50
  },
  
  // Categoría: Empresarial
  {
    name: 'Emprendedor',
    description: 'Crea tu primera empresa',
    
    icon: '🚀',
    xpReward: 200,
    conditionType: 'company_created',
    conditionValue: 1
  },
  {
    name: 'Magnate',
    description: 'Posee 3 o más empresas',
    
    icon: '💼',
    xpReward: 300,
    conditionType: 'company_count',
    conditionValue: 3
  },
  {
    name: 'Constructor',
    description: 'Crea 10 oficinas',
    
    icon: '🏗️',
    xpReward: 250,
    conditionType: 'office_created',
    conditionValue: 10
  },
  {
    name: 'Decorador',
    description: 'Coloca 100 objetos en oficinas',
    
    icon: '🎨',
    xpReward: 150,
    conditionType: 'objects_placed',
    conditionValue: 100
  },
  
  // Categoría: Eventos
  {
    name: 'Asistente',
    description: 'Asiste a 5 eventos',
    
    icon: '🎫',
    xpReward: 100,
    conditionType: 'events_attended',
    conditionValue: 5
  },
  {
    name: 'Organizador',
    description: 'Crea 3 eventos',
    
    icon: '📅',
    xpReward: 150,
    conditionType: 'events_created',
    conditionValue: 3
  },
  {
    name: 'Networker',
    description: 'Conoce 20 personas en eventos',
    
    icon: '🤝',
    xpReward: 200,
    conditionType: 'event_connections',
    conditionValue: 20
  },
  
  // Categoría: Especial
  {
    name: 'Madrugador',
    description: 'Mantén una racha de 7 días',
    
    icon: '🌅',
    xpReward: 250,
    conditionType: 'streak_days',
    conditionValue: 7
  },
  {
    name: 'Dedicado',
    description: 'Mantén una racha de 30 días',
    
    icon: '🔥',
    xpReward: 500,
    conditionType: 'streak_days',
    conditionValue: 30
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
    conditionType: 'send_messages',
    conditionValue: 3,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Explora un distrito',
    description: 'Visita cualquier distrito de la ciudad',
    missionType: 'exploration',
    difficulty: 'easy',
    xpReward: 30,
    conditionType: 'visit_district',
    conditionValue: 1,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Visita 2 oficinas',
    description: 'Entra a 2 oficinas diferentes',
    missionType: 'exploration',
    difficulty: 'easy',
    xpReward: 40,
    conditionType: 'visit_offices',
    conditionValue: 2,
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
    conditionType: 'send_messages',
    conditionValue: 10,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Teletransportate 5 veces',
    description: 'Usa el sistema de teletransporte 5 veces',
    missionType: 'exploration',
    difficulty: 'medium',
    xpReward: 80,
    conditionType: 'teleport',
    conditionValue: 5,
    isDaily: true,
    isActive: true
  },
  {
    title: 'Edita tu oficina',
    description: 'Coloca 5 objetos en una oficina',
    missionType: 'business',
    difficulty: 'medium',
    xpReward: 120,
    conditionType: 'place_objects',
    conditionValue: 5,
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
    conditionType: 'visit_all_districts',
    conditionValue: 4,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Socializar',
    description: 'Habla con 10 usuarios diferentes',
    missionType: 'social',
    difficulty: 'hard',
    xpReward: 250,
    conditionType: 'unique_conversations',
    conditionValue: 10,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Asiste a un evento',
    description: 'Participa en cualquier evento de la semana',
    missionType: 'events',
    difficulty: 'medium',
    xpReward: 150,
    conditionType: 'attend_event',
    conditionValue: 1,
    isDaily: false,
    isActive: true
  },
  {
    title: 'Empresario activo',
    description: 'Crea o edita una oficina',
    missionType: 'business',
    difficulty: 'medium',
    xpReward: 180,
    conditionType: 'office_activity',
    conditionValue: 1,
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

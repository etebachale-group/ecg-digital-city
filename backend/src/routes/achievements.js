const express = require('express')
const router = express.Router()
const { Achievement, UserAchievement, User } = require('../models')
const logger = require('../utils/logger')

// Obtener todos los logros
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      order: [['category', 'ASC'], ['xpReward', 'ASC']]
    })
    res.json(achievements)
  } catch (error) {
    logger.error('Error al obtener logros:', error)
    res.status(500).json({ error: 'Error al obtener logros' })
  }
})

// Obtener logros de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [{ model: Achievement, as: 'achievement' }]
    })

    res.json(userAchievements)
  } catch (error) {
    logger.error('Error al obtener logros del usuario:', error)
    res.status(500).json({ error: 'Error al obtener logros del usuario' })
  }
})

// Desbloquear logro
router.post('/unlock', async (req, res) => {
  try {
    const { userId, achievementId } = req.body

    // Verificar si ya está desbloqueado
    const existing = await UserAchievement.findOne({
      where: { userId, achievementId }
    })

    if (existing) {
      return res.status(400).json({ error: 'Logro ya desbloqueado' })
    }

    const userAchievement = await UserAchievement.create({
      userId,
      achievementId
    })

    const achievement = await Achievement.findByPk(achievementId)

    logger.info(`Usuario ${userId} desbloqueó logro: ${achievement.name}`)

    res.json({
      userAchievement,
      achievement
    })
  } catch (error) {
    logger.error('Error al desbloquear logro:', error)
    res.status(500).json({ error: 'Error al desbloquear logro' })
  }
})

// Crear logro (admin)
router.post('/', async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body)
    res.status(201).json(achievement)
  } catch (error) {
    logger.error('Error al crear logro:', error)
    res.status(500).json({ error: 'Error al crear logro' })
  }
})

module.exports = router

const express = require('express')
const router = express.Router()
const { UserProgress, User, Achievement, UserAchievement } = require('../models')
const { cacheUserProgress, getUserProgressCache, invalidateUserProgressCache } = require('../config/redis')
const logger = require('../utils/logger')

// Obtener progreso del usuario
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Intentar obtener del cache
    const cached = await getUserProgressCache(userId)
    if (cached) {
      return res.json(cached)
    }

    let progress = await UserProgress.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    })

    if (!progress) {
      progress = await UserProgress.create({ userId })
    }

    // Cachear resultado
    await cacheUserProgress(userId, progress)

    res.json(progress)
  } catch (error) {
    logger.error('Error al obtener progreso:', error)
    res.status(500).json({ error: 'Error al obtener progreso' })
  }
})

// Agregar XP al usuario
router.post('/add-xp', async (req, res) => {
  try {
    const { userId, xp, action } = req.body

    let progress = await UserProgress.findOne({ where: { userId } })
    if (!progress) {
      progress = await UserProgress.create({ userId })
    }

    const oldXp = progress.xp
    const oldLevel = progress.level
    progress.xp += xp

    // Calcular nuevo nivel (100 XP por nivel)
    const newLevel = Math.floor(progress.xp / 100) + 1
    const leveledUp = newLevel > oldLevel

    if (leveledUp) {
      progress.level = newLevel
    }

    await progress.save()

    // Invalidar cache
    await invalidateUserProgressCache(userId)

    logger.info(`Usuario ${userId} ganó ${xp} XP por ${action}`)

    res.json({
      progress,
      leveledUp,
      oldLevel,
      newLevel: progress.level,
      xpGained: xp
    })
  } catch (error) {
    logger.error('Error al agregar XP:', error)
    res.status(500).json({ error: 'Error al agregar XP' })
  }
})

// Actualizar estadísticas
router.post('/update-stats', async (req, res) => {
  try {
    const { userId, stat, increment = 1 } = req.body

    let progress = await UserProgress.findOne({ where: { userId } })
    if (!progress) {
      progress = await UserProgress.create({ userId })
    }

    if (progress[stat] !== undefined) {
      progress[stat] += increment
      await progress.save()
      await invalidateUserProgressCache(userId)
    }

    res.json(progress)
  } catch (error) {
    logger.error('Error al actualizar estadísticas:', error)
    res.status(500).json({ error: 'Error al actualizar estadísticas' })
  }
})

// Registrar login diario
router.post('/daily-login', async (req, res) => {
  try {
    const { userId } = req.body

    let progress = await UserProgress.findOne({ where: { userId } })
    if (!progress) {
      progress = await UserProgress.create({ userId })
    }

    const today = new Date().toISOString().split('T')[0]
    const lastLogin = progress.lastLogin

    // Incrementar total de logins
    progress.totalLogins += 1

    // Calcular racha
    if (lastLogin) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastLogin === yesterdayStr) {
        progress.streakDays += 1
      } else if (lastLogin !== today) {
        progress.streakDays = 1
      }
    } else {
      progress.streakDays = 1
    }

    progress.lastLogin = today
    await progress.save()

    // Dar XP por login
    progress.xp += 10
    const newLevel = Math.floor(progress.xp / 100) + 1
    if (newLevel > progress.level) {
      progress.level = newLevel
    }
    await progress.save()

    await invalidateUserProgressCache(userId)

    res.json({
      progress,
      xpGained: 10,
      streakBonus: progress.streakDays >= 7
    })
  } catch (error) {
    logger.error('Error al registrar login diario:', error)
    res.status(500).json({ error: 'Error al registrar login diario' })
  }
})

// Obtener leaderboard global
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query

    const leaderboard = await UserProgress.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      order: [['xp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json(leaderboard)
  } catch (error) {
    logger.error('Error al obtener leaderboard:', error)
    res.status(500).json({ error: 'Error al obtener leaderboard' })
  }
})

module.exports = router

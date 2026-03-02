const express = require('express')
const router = express.Router()
const { Mission, UserMission, User } = require('../models')
const { Op } = require('sequelize')
const logger = require('../utils/logger')

// Obtener todas las misiones
router.get('/', async (req, res) => {
  try {
    const { isDaily, isActive } = req.query

    const where = {}
    if (isDaily !== undefined) where.isDaily = isDaily === 'true'
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const missions = await Mission.findAll({
      where,
      order: [['difficulty', 'ASC'], ['xpReward', 'ASC']]
    })

    res.json(missions)
  } catch (error) {
    logger.error('Error al obtener misiones:', error)
    res.status(500).json({ error: 'Error al obtener misiones' })
  }
})

// Obtener misiones de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const today = new Date().toISOString().split('T')[0]

    const userMissions = await UserMission.findAll({
      where: {
        userId,
        assignedDate: today
      },
      include: [{ model: Mission, as: 'mission' }]
    })

    res.json(userMissions)
  } catch (error) {
    logger.error('Error al obtener misiones del usuario:', error)
    res.status(500).json({ error: 'Error al obtener misiones del usuario' })
  }
})

// Asignar misiones diarias a un usuario
router.post('/assign-daily', async (req, res) => {
  try {
    const { userId } = req.body
    const today = new Date().toISOString().split('T')[0]

    // Verificar si ya tiene misiones hoy
    const existing = await UserMission.findAll({
      where: { userId, assignedDate: today },
      include: [{ model: Mission, as: 'mission' }]
    })

    if (existing.length > 0) {
      logger.info(`Usuario ${userId} ya tiene misiones asignadas hoy`)
      return res.json(existing)
    }

    // Obtener 3 misiones diarias aleatorias
    const missions = await Mission.findAll({
      where: { isDaily: true, isActive: true },
      order: [['id', 'ASC']],
      limit: 3
    })

    const userMissions = await Promise.all(
      missions.map(mission =>
        UserMission.create({
          userId,
          missionId: mission.id,
          assignedDate: today
        })
      )
    )

    // Cargar las misiones con sus datos completos
    const userMissionsWithData = await UserMission.findAll({
      where: { userId, assignedDate: today },
      include: [{ model: Mission, as: 'mission' }]
    })

    logger.info(`Misiones diarias asignadas a usuario ${userId}`)
    res.json(userMissionsWithData)
  } catch (error) {
    logger.error('Error al asignar misiones:', error)
    res.status(500).json({ error: 'Error al asignar misiones' })
  }
})

// Actualizar progreso de misión
router.post('/progress', async (req, res) => {
  try {
    const { userId, missionId, progress } = req.body

    const userMission = await UserMission.findOne({
      where: { userId, missionId },
      include: [{ model: Mission, as: 'mission' }]
    })

    if (!userMission) {
      return res.status(404).json({ error: 'Misión no encontrada' })
    }

    userMission.progress = progress

    // Verificar si se completó
    if (progress >= userMission.mission.requirementValue && !userMission.isCompleted) {
      userMission.isCompleted = true
      userMission.completedAt = new Date()
      logger.info(`Usuario ${userId} completó misión ${missionId}`)
    }

    await userMission.save()

    res.json(userMission)
  } catch (error) {
    logger.error('Error al actualizar progreso:', error)
    res.status(500).json({ error: 'Error al actualizar progreso' })
  }
})

// Crear misión (admin)
router.post('/', async (req, res) => {
  try {
    const mission = await Mission.create(req.body)
    res.status(201).json(mission)
  } catch (error) {
    logger.error('Error al crear misión:', error)
    res.status(500).json({ error: 'Error al crear misión' })
  }
})

module.exports = router

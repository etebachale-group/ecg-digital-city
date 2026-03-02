const express = require('express')
const router = express.Router()
const { Event, EventAttendee, User } = require('../models')
const { Op } = require('sequelize')
const logger = require('../utils/logger')

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const { status, districtSlug, upcoming } = req.query

    const where = {}
    if (status) where.status = status
    if (districtSlug) where.districtSlug = districtSlug
    if (upcoming === 'true') {
      where.startTime = { [Op.gte]: new Date() }
    }

    const events = await Event.findAll({
      where,
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'username'] }
      ],
      order: [['startTime', 'ASC']]
    })

    res.json(events)
  } catch (error) {
    logger.error('Error al obtener eventos:', error)
    res.status(500).json({ error: 'Error al obtener eventos' })
  }
})

// Obtener evento por ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'username'] },
        { model: User, as: 'attendees', attributes: ['id', 'username'], through: { attributes: ['status'] } }
      ]
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    res.json(event)
  } catch (error) {
    logger.error('Error al obtener evento:', error)
    res.status(500).json({ error: 'Error al obtener evento' })
  }
})

// Crear evento
router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body)
    logger.info(`Evento creado: ${event.title}`)
    res.status(201).json(event)
  } catch (error) {
    logger.error('Error al crear evento:', error)
    res.status(500).json({ error: 'Error al crear evento' })
  }
})

// Actualizar evento
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    await event.update(req.body)
    res.json(event)
  } catch (error) {
    logger.error('Error al actualizar evento:', error)
    res.status(500).json({ error: 'Error al actualizar evento' })
  }
})

// Eliminar evento
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    await event.destroy()
    res.json({ message: 'Evento eliminado' })
  } catch (error) {
    logger.error('Error al eliminar evento:', error)
    res.status(500).json({ error: 'Error al eliminar evento' })
  }
})

// Registrarse a evento
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const event = await Event.findByPk(id)
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    // Verificar capacidad
    const attendeeCount = await EventAttendee.count({ where: { eventId: id } })
    if (attendeeCount >= event.maxAttendees) {
      return res.status(400).json({ error: 'Evento lleno' })
    }

    // Verificar si ya está registrado
    const existing = await EventAttendee.findOne({
      where: { eventId: id, userId }
    })

    if (existing) {
      return res.status(400).json({ error: 'Ya estás registrado' })
    }

    const attendee = await EventAttendee.create({
      eventId: id,
      userId,
      status: 'registered'
    })

    logger.info(`Usuario ${userId} registrado en evento ${id}`)
    res.json(attendee)
  } catch (error) {
    logger.error('Error al registrarse en evento:', error)
    res.status(500).json({ error: 'Error al registrarse en evento' })
  }
})

// Check-in a evento
router.post('/:id/checkin', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const attendee = await EventAttendee.findOne({
      where: { eventId: id, userId }
    })

    if (!attendee) {
      return res.status(404).json({ error: 'No estás registrado en este evento' })
    }

    attendee.status = 'attended'
    attendee.checkedInAt = new Date()
    await attendee.save()

    logger.info(`Usuario ${userId} hizo check-in en evento ${id}`)
    res.json(attendee)
  } catch (error) {
    logger.error('Error al hacer check-in:', error)
    res.status(500).json({ error: 'Error al hacer check-in' })
  }
})

// Obtener asistentes de un evento
router.get('/:id/attendees', async (req, res) => {
  try {
    const attendees = await EventAttendee.findAll({
      where: { eventId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    })

    res.json(attendees)
  } catch (error) {
    logger.error('Error al obtener asistentes:', error)
    res.status(500).json({ error: 'Error al obtener asistentes' })
  }
})

module.exports = router

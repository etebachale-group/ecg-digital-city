const express = require('express')
const router = express.Router()
const { Office, Company, District } = require('../models')
const logger = require('../utils/logger')

// Obtener todas las oficinas
router.get('/', async (req, res) => {
  try {
    const { districtId, companyId, isPublic } = req.query

    const where = {}
    if (districtId) where.districtId = districtId
    if (companyId) where.companyId = companyId
    if (isPublic !== undefined) where.isPublic = isPublic === 'true'

    const offices = await Office.findAll({
      where,
      include: [
        { model: Company, as: 'company' },
        { model: District, as: 'district' }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(offices)
  } catch (error) {
    logger.error('Error al obtener oficinas:', error)
    res.status(500).json({ error: 'Error al obtener oficinas' })
  }
})

// Obtener oficina por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const office = await Office.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: District, as: 'district' }
      ]
    })

    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' })
    }

    res.json(office)
  } catch (error) {
    logger.error('Error al obtener oficina:', error)
    res.status(500).json({ error: 'Error al obtener oficina' })
  }
})

// Obtener oficinas por distrito
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params

    const offices = await Office.findAll({
      where: { districtId },
      include: [{ model: Company, as: 'company' }],
      order: [['name', 'ASC']]
    })

    res.json(offices)
  } catch (error) {
    logger.error('Error al obtener oficinas del distrito:', error)
    res.status(500).json({ error: 'Error al obtener oficinas del distrito' })
  }
})

// Crear oficina (requiere autenticación)
router.post('/', async (req, res) => {
  try {
    const office = await Office.create(req.body)
    
    const officeWithRelations = await Office.findByPk(office.id, {
      include: [
        { model: Company, as: 'company' },
        { model: District, as: 'district' }
      ]
    })

    logger.info(`Oficina creada: ${office.name}`)
    res.status(201).json(officeWithRelations)
  } catch (error) {
    logger.error('Error al crear oficina:', error)
    res.status(500).json({ error: 'Error al crear oficina' })
  }
})

// Actualizar oficina
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const office = await Office.findByPk(id)

    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' })
    }

    await office.update(req.body)

    const updatedOffice = await Office.findByPk(id, {
      include: [
        { model: Company, as: 'company' },
        { model: District, as: 'district' }
      ]
    })

    logger.info(`Oficina actualizada: ${office.name}`)
    res.json(updatedOffice)
  } catch (error) {
    logger.error('Error al actualizar oficina:', error)
    res.status(500).json({ error: 'Error al actualizar oficina' })
  }
})

// Eliminar oficina
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const office = await Office.findByPk(id)

    if (!office) {
      return res.status(404).json({ error: 'Oficina no encontrada' })
    }

    await office.destroy()
    logger.info(`Oficina eliminada: ${office.name}`)
    res.json({ message: 'Oficina eliminada exitosamente' })
  } catch (error) {
    logger.error('Error al eliminar oficina:', error)
    res.status(500).json({ error: 'Error al eliminar oficina' })
  }
})

module.exports = router

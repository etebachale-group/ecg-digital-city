const District = require('../models/District');
const logger = require('./logger');

const initialDistricts = [
  {
    name: 'Distrito Central',
    slug: 'central',
    description: 'Centro de la ciudad con ECG Headquarters, Academy e Incubadora de startups',
    position: { x: 0, y: 0, z: 0 },
    size: { width: 100, height: 100, depth: 100 },
    maxOffices: 10,
    theme: 'modern',
    isActive: true,
    isPublic: true
  },
  {
    name: 'Distrito Empresarial',
    slug: 'empresarial',
    description: 'Zona de oficinas privadas para empresas y organizaciones',
    position: { x: 150, y: 0, z: 0 },
    size: { width: 200, height: 100, depth: 200 },
    maxOffices: 50,
    theme: 'corporate',
    isActive: true,
    isPublic: true
  },
  {
    name: 'Distrito Cultural',
    slug: 'cultural',
    description: 'Galería de arte, museo, teatro y espacios culturales',
    position: { x: 0, y: 0, z: 150 },
    size: { width: 150, height: 100, depth: 150 },
    maxOffices: 15,
    theme: 'artistic',
    isActive: true,
    isPublic: true
  },
  {
    name: 'Plaza Social',
    slug: 'social',
    description: 'Zona de networking, cafetería virtual y espacios de coworking',
    position: { x: -150, y: 0, z: 0 },
    size: { width: 150, height: 100, depth: 150 },
    maxOffices: 20,
    theme: 'casual',
    isActive: true,
    isPublic: true
  }
];

async function seedDistricts() {
  try {
    for (const districtData of initialDistricts) {
      const [district, created] = await District.findOrCreate({
        where: { slug: districtData.slug },
        defaults: districtData
      });

      if (created) {
        logger.info(`✅ Distrito creado: ${district.name}`);
      } else {
        logger.info(`ℹ️  Distrito ya existe: ${district.name}`);
      }
    }

    logger.info('🎉 Seed de distritos completado');
  } catch (error) {
    logger.error('❌ Error en seed de distritos:', error);
    throw error;
  }
}

module.exports = { seedDistricts };

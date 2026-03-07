const District = require('../models/District');
const logger = require('./logger');

const initialDistricts = [
  {
    name: 'Distrito Central',
    slug: 'central',
    description: 'Centro de la ciudad con ECG Headquarters, Academy e Incubadora de startups',
    maxCapacity: 100,
    isActive: true
  },
  {
    name: 'Distrito Empresarial',
    slug: 'empresarial',
    description: 'Zona de oficinas privadas para empresas y organizaciones',
    maxCapacity: 200,
    isActive: true
  },
  {
    name: 'Distrito Cultural',
    slug: 'cultural',
    description: 'Galería de arte, museo, teatro y espacios culturales',
    maxCapacity: 150,
    isActive: true
  },
  {
    name: 'Zona Social',
    slug: 'social',
    description: 'Zona de networking, cafetería virtual y espacios de coworking',
    maxCapacity: 150,
    isActive: true
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

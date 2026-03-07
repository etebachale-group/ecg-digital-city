/**
 * Seed de Oficinas y Edificios
 * Crea empresas de ejemplo con sus oficinas en diferentes distritos
 * ETEBA CHALE GROUP es la oficina central principal
 */

const { sequelize } = require('../src/config/database')
const { Company, Office, District, User } = require('../src/models')

async function seedOffices() {
  try {
    console.log('🏢 Iniciando seed de oficinas y edificios...')

    // Verificar que existan distritos
    const districts = await District.findAll()
    if (districts.length === 0) {
      console.error('❌ No hay distritos. Ejecuta primero: node src/utils/seedDistricts.js')
      process.exit(1)
    }

    // Obtener o crear usuario admin para ser owner
    let adminUser = await User.findOne({ where: { email: 'admin@ecg.com' } })
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@ecg.com',
        password: 'admin123', // En producción usar hash
        role: 'admin'
      })
      console.log('✅ Usuario admin creado')
    }

    // Limpiar datos existentes
    await Office.destroy({ where: {} })
    await Company.destroy({ where: {} })
    console.log('🗑️  Datos anteriores eliminados')

    // ========================================
    // ETEBA CHALE GROUP - Oficina Central
    // ========================================
    const etebaChaleGroup = await Company.create({
      name: 'ETEBA CHALE GROUP',
      description: 'Grupo empresarial líder en tecnología, innovación y desarrollo digital. Oficina central de ECG Digital City.',
      logo: 'https://via.placeholder.com/200x200/3498db/ffffff?text=ETEBA',
      ownerId: adminUser.id,
      subscriptionTier: 'enterprise',
      maxOffices: 10,
      maxEmployees: 100,
      isActive: true
    })

    // Oficina Central en Downtown
    const downtownDistrict = districts.find(d => d.slug === 'downtown') || districts[0]
    await Office.create({
      companyId: etebaChaleGroup.id,
      districtId: downtownDistrict.id,
      name: 'ETEBA CHALE GROUP - Sede Central',
      description: 'Oficina principal del grupo. Centro de operaciones, innovación y desarrollo tecnológico.',
      position: { x: 0, y: 0, z: 0 }, // Centro del distrito
      size: { width: 60, height: 10, depth: 60 }, // Edificio MUY grande
      isPublic: true,
      maxCapacity: 50,
      theme: 'corporate',
      primaryColor: '#3498db', // Azul corporativo
      secondaryColor: '#2c3e50' // Gris oscuro
    })

    // Oficina de Innovación en Tech District
    const techDistrict = districts.find(d => d.slug === 'tech-district')
    if (techDistrict) {
      await Office.create({
        companyId: etebaChaleGroup.id,
        districtId: techDistrict.id,
        name: 'ETEBA Innovation Lab',
        description: 'Laboratorio de innovación y desarrollo de nuevas tecnologías.',
        position: { x: 40, y: 0, z: 30 },
        size: { width: 40, height: 8, depth: 40 }, // Más grande
        isPublic: true,
        maxCapacity: 30,
        theme: 'tech',
        primaryColor: '#9b59b6', // Púrpura tech
        secondaryColor: '#34495e'
      })
    }

    console.log('✅ ETEBA CHALE GROUP creado con oficinas')

    // ========================================
    // Empresas Adicionales
    // ========================================

    // 1. TechStart Solutions
    const techStart = await Company.create({
      name: 'TechStart Solutions',
      description: 'Startup de desarrollo de software y aplicaciones móviles.',
      logo: 'https://via.placeholder.com/200x200/e74c3c/ffffff?text=TS',
      ownerId: adminUser.id,
      subscriptionTier: 'pro',
      maxOffices: 3,
      maxEmployees: 20,
      isActive: true
    })

    if (techDistrict) {
      await Office.create({
        companyId: techStart.id,
        districtId: techDistrict.id,
        name: 'TechStart HQ',
        description: 'Oficina principal de TechStart Solutions.',
        position: { x: -50, y: 0, z: 40 },
        size: { width: 30, height: 6, depth: 30 }, // Más grande
        isPublic: true,
        maxCapacity: 20,
        theme: 'modern',
        primaryColor: '#e74c3c', // Rojo
        secondaryColor: '#c0392b'
      })
    }

    // 2. Creative Studio
    const creativeStudio = await Company.create({
      name: 'Creative Studio',
      description: 'Agencia de diseño gráfico, branding y marketing digital.',
      logo: 'https://via.placeholder.com/200x200/f39c12/ffffff?text=CS',
      ownerId: adminUser.id,
      subscriptionTier: 'pro',
      maxOffices: 2,
      maxEmployees: 15,
      isActive: true
    })

    const artsDistrict = districts.find(d => d.slug === 'arts-district')
    if (artsDistrict) {
      await Office.create({
        companyId: creativeStudio.id,
        districtId: artsDistrict.id,
        name: 'Creative Studio Loft',
        description: 'Espacio creativo para diseño y producción audiovisual.',
        position: { x: 10, y: 0, z: -20 },
        size: { width: 18, height: 4, depth: 18 },
        isPublic: true,
        maxCapacity: 15,
        theme: 'creative',
        primaryColor: '#f39c12', // Naranja
        secondaryColor: '#e67e22'
      })
    }

    // 3. Green Energy Corp
    const greenEnergy = await Company.create({
      name: 'Green Energy Corp',
      description: 'Empresa de energías renovables y sostenibilidad.',
      logo: 'https://via.placeholder.com/200x200/27ae60/ffffff?text=GE',
      ownerId: adminUser.id,
      subscriptionTier: 'enterprise',
      maxOffices: 5,
      maxEmployees: 50,
      isActive: true
    })

    await Office.create({
      companyId: greenEnergy.id,
      districtId: downtownDistrict.id,
      name: 'Green Energy HQ',
      description: 'Sede de Green Energy Corp. Edificio sustentable con paneles solares.',
      position: { x: -30, y: 0, z: -25 },
      size: { width: 25, height: 4, depth: 25 },
      isPublic: true,
      maxCapacity: 40,
      theme: 'eco',
      primaryColor: '#27ae60', // Verde
      secondaryColor: '#229954'
    })

    // 4. FinTech Innovations
    const fintech = await Company.create({
      name: 'FinTech Innovations',
      description: 'Soluciones financieras y tecnología blockchain.',
      logo: 'https://via.placeholder.com/200x200/16a085/ffffff?text=FT',
      ownerId: adminUser.id,
      subscriptionTier: 'pro',
      maxOffices: 3,
      maxEmployees: 25,
      isActive: true
    })

    const businessDistrict = districts.find(d => d.slug === 'business-district')
    if (businessDistrict) {
      await Office.create({
        companyId: fintech.id,
        districtId: businessDistrict.id,
        name: 'FinTech Tower',
        description: 'Torre de oficinas con tecnología de punta.',
        position: { x: 25, y: 0, z: -15 },
        size: { width: 20, height: 6, depth: 20 },
        isPublic: false, // Privada
        maxCapacity: 25,
        theme: 'corporate',
        primaryColor: '#16a085', // Turquesa
        secondaryColor: '#138d75'
      })
    }

    // 5. GameDev Studio
    const gameDev = await Company.create({
      name: 'GameDev Studio',
      description: 'Desarrollo de videojuegos indie y experiencias interactivas.',
      logo: 'https://via.placeholder.com/200x200/8e44ad/ffffff?text=GD',
      ownerId: adminUser.id,
      subscriptionTier: 'basic',
      maxOffices: 1,
      maxEmployees: 10,
      isActive: true
    })

    if (techDistrict) {
      await Office.create({
        companyId: gameDev.id,
        districtId: techDistrict.id,
        name: 'GameDev Garage',
        description: 'Espacio colaborativo para desarrollo de juegos.',
        position: { x: -15, y: 0, z: -30 },
        size: { width: 12, height: 3, depth: 12 },
        isPublic: true,
        maxCapacity: 10,
        theme: 'gaming',
        primaryColor: '#8e44ad', // Púrpura
        secondaryColor: '#71368a'
      })
    }

    // 6. HealthTech Solutions
    const healthTech = await Company.create({
      name: 'HealthTech Solutions',
      description: 'Tecnología para el sector salud y telemedicina.',
      logo: 'https://via.placeholder.com/200x200/e91e63/ffffff?text=HT',
      ownerId: adminUser.id,
      subscriptionTier: 'pro',
      maxOffices: 2,
      maxEmployees: 20,
      isActive: true
    })

    await Office.create({
      companyId: healthTech.id,
      districtId: downtownDistrict.id,
      name: 'HealthTech Clinic',
      description: 'Centro de innovación en salud digital.',
      position: { x: 30, y: 0, z: 25 },
      size: { width: 18, height: 3, depth: 18 },
      isPublic: true,
      maxCapacity: 20,
      theme: 'medical',
      primaryColor: '#e91e63', // Rosa
      secondaryColor: '#c2185b'
    })

    // 7. EduTech Academy
    const eduTech = await Company.create({
      name: 'EduTech Academy',
      description: 'Plataforma de educación online y capacitación profesional.',
      logo: 'https://via.placeholder.com/200x200/ff9800/ffffff?text=EA',
      ownerId: adminUser.id,
      subscriptionTier: 'pro',
      maxOffices: 3,
      maxEmployees: 30,
      isActive: true
    })

    const educationDistrict = districts.find(d => d.slug === 'education-district')
    if (educationDistrict) {
      await Office.create({
        companyId: eduTech.id,
        districtId: educationDistrict.id,
        name: 'EduTech Campus',
        description: 'Campus virtual para cursos y talleres.',
        position: { x: 0, y: 0, z: 30 },
        size: { width: 22, height: 4, depth: 22 },
        isPublic: true,
        maxCapacity: 30,
        theme: 'education',
        primaryColor: '#ff9800', // Naranja
        secondaryColor: '#f57c00'
      })
    }

    // Resumen
    const totalCompanies = await Company.count()
    const totalOffices = await Office.count()

    console.log('\n✅ Seed de oficinas completado!')
    console.log(`📊 Estadísticas:`)
    console.log(`   - Empresas creadas: ${totalCompanies}`)
    console.log(`   - Oficinas creadas: ${totalOffices}`)
    console.log(`   - Oficina Central: ETEBA CHALE GROUP`)
    console.log('\n🏢 Empresas creadas:')
    console.log('   1. ETEBA CHALE GROUP (Oficina Central) - Enterprise')
    console.log('   2. TechStart Solutions - Pro')
    console.log('   3. Creative Studio - Pro')
    console.log('   4. Green Energy Corp - Enterprise')
    console.log('   5. FinTech Innovations - Pro')
    console.log('   6. GameDev Studio - Basic')
    console.log('   7. HealthTech Solutions - Pro')
    console.log('   8. EduTech Academy - Pro')

  } catch (error) {
    console.error('❌ Error en seed de oficinas:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedOffices()
    .then(() => {
      console.log('✅ Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}

module.exports = { seedOffices }

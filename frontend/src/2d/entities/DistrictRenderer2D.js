import * as PIXI from 'pixi.js'
import { Portal2D } from './Portal2D'
import { API_URL } from '../../config/api'

/**
 * DistrictRenderer2D - Renders 2D district environments
 * Uses procedural textures for Render Free optimization
 * Now loads real offices from API!
 */
export class DistrictRenderer2D {
  constructor(config) {
    this.districtData = config.districtData
    this.container = config.container
    this.collisionSystem = config.collisionSystem
    
    // Rendered objects
    this.groundSprite = null
    this.buildings = []
    this.offices = [] // Real offices from API
    this.decorations = []
    this.doors = []
    this.portals = []
  }

  /**
   * Load and render district
   */
  async load() {
    console.log('🏙️ Loading district:', this.districtData?.name)
    
    // Render ground
    this._renderGround()
    
    // Load and render real offices from API
    await this._loadOffices()
    
    // Render decorations
    this._renderDecorations()
    
    // Render portals
    this._renderPortals()
    
    console.log('✅ District loaded')
  }

  /**
   * Load offices from API
   * @private
   */
  async _loadOffices() {
    if (!this.districtData?.id) {
      console.warn('No district ID, skipping office load')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/offices/district/${this.districtData.id}`)
      if (!response.ok) {
        throw new Error('Failed to load offices')
      }

      const offices = await response.json()
      console.log(`📍 Loaded ${offices.length} offices for district ${this.districtData.name}`)

      // Render each office as a building
      offices.forEach(office => {
        this._renderOfficeBuilding(office)
      })
    } catch (error) {
      console.error('Error loading offices:', error)
      // Fallback to procedural buildings
      this._renderBuildings()
    }
  }

  /**
   * Render an office as a building
   * @private
   */
  _renderOfficeBuilding(office) {
    const position = office.position || { x: 0, y: 0 }
    const size = office.size || { width: 20, height: 20 }
    
    // Convert hex color to number
    const primaryColor = parseInt(office.primaryColor?.replace('#', '0x') || '0x3498db')
    const secondaryColor = parseInt(office.secondaryColor?.replace('#', '0x') || '0x2c3e50')
    
    const buildingSprite = this._createOfficeBuildingSprite({
      office,
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.depth || size.height,
      primaryColor,
      secondaryColor
    })
    
    buildingSprite.position.set(position.x, position.y)
    buildingSprite.zIndex = position.y // Depth sorting
    
    // Add company name label
    const label = this._createOfficeLabel(office)
    label.position.set(size.width / 2, -15)
    buildingSprite.addChild(label)
    
    this.container.addChild(buildingSprite)
    this.offices.push({ sprite: buildingSprite, data: office })
    
    // Add to collision system
    if (this.collisionSystem) {
      this.collisionSystem.addObstacle({
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.depth || size.height
      })
      
      // Add door
      this.collisionSystem.addDoor({
        id: `door-office-${office.id}`,
        x: position.x + size.width / 2 - 6,
        y: position.y + (size.depth || size.height) - 12,
        width: 12,
        height: 12,
        isOpen: false,
        officeId: office.id
      })
    }
  }

  /**
   * Create office building sprite
   * @private
   */
  _createOfficeBuildingSprite(config) {
    const { office, x, y, width, height, primaryColor, secondaryColor } = config
    const graphics = new PIXI.Graphics()
    
    // Building body
    graphics.beginFill(primaryColor)
    graphics.drawRect(0, 0, width, height)
    graphics.endFill()
    
    // Roof
    graphics.beginFill(secondaryColor)
    graphics.moveTo(0, 0)
    graphics.lineTo(width / 2, -10)
    graphics.lineTo(width, 0)
    graphics.lineTo(0, 0)
    graphics.endFill()
    
    // Windows
    const windowSize = 3
    const windowSpacing = 6
    const windowColor = office.isPublic ? 0xFFEB3B : 0xFFA726
    
    for (let wx = windowSpacing; wx < width - windowSpacing; wx += windowSpacing) {
      for (let wy = windowSpacing; wy < height - windowSpacing; wy += windowSpacing) {
        graphics.beginFill(windowColor, 0.8)
        graphics.drawRect(wx, wy, windowSize, windowSize)
        graphics.endFill()
      }
    }
    
    // Door
    graphics.beginFill(secondaryColor)
    graphics.drawRect(width / 2 - 6, height - 12, 12, 12)
    graphics.endFill()
    
    // Door handle
    graphics.beginFill(0xFFD700)
    graphics.drawCircle(width / 2 + 3, height - 6, 1)
    graphics.endFill()
    
    // Outline
    graphics.lineStyle(2, 0x000000, 0.3)
    graphics.drawRect(0, 0, width, height)
    
    // Special marker for ETEBA CHALE GROUP (central office)
    if (office.company?.name === 'ETEBA CHALE GROUP') {
      // Add crown/star on top
      graphics.lineStyle(0)
      graphics.beginFill(0xFFD700)
      graphics.drawStar(width / 2, -15, 5, 8, 4)
      graphics.endFill()
      
      // Add glow effect
      graphics.lineStyle(3, 0xFFD700, 0.3)
      graphics.drawRect(0, 0, width, height)
    }
    
    const container = new PIXI.Container()
    container.addChild(graphics)
    
    return container
  }

  /**
   * Create office label
   * @private
   */
  _createOfficeLabel(office) {
    const companyName = office.company?.name || 'Office'
    
    const label = new PIXI.Text(companyName, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 3,
      align: 'center'
    })
    
    label.anchor.set(0.5, 1)
    
    return label
  }

  /**
   * Render ground using procedural texture
   * @private
   */
  _renderGround() {
    const bounds = this.districtData?.bounds || {
      minX: -90,
      maxX: 90,
      minY: -90,
      maxY: 90
    }
    
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY
    
    // Create procedural ground texture
    const groundTexture = this._createGroundTexture()
    
    // Create tiling sprite for ground
    this.groundSprite = new PIXI.TilingSprite(
      groundTexture,
      width,
      height
    )
    
    this.groundSprite.position.set(bounds.minX, bounds.minY)
    this.groundSprite.zIndex = -1000 // Behind everything
    
    this.container.addChild(this.groundSprite)
  }

  /**
   * Create procedural ground texture
   * @private
   */
  _createGroundTexture() {
    const size = 64
    const graphics = new PIXI.Graphics()
    
    // Grass-like pattern
    graphics.beginFill(0x7CB342) // Base grass color
    graphics.drawRect(0, 0, size, size)
    graphics.endFill()
    
    // Add some variation (darker grass patches)
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = 2 + Math.random() * 3
      
      graphics.beginFill(0x689F38, 0.3)
      graphics.drawCircle(x, y, radius)
      graphics.endFill()
    }
    
    // Add grid lines for visual reference
    graphics.lineStyle(1, 0x558B2F, 0.1)
    graphics.moveTo(0, 0)
    graphics.lineTo(size, 0)
    graphics.moveTo(0, 0)
    graphics.lineTo(0, size)
    
    return this._graphicsToTexture(graphics, size, size)
  }

  /**
   * Render buildings
   * @private
   */
  _renderBuildings() {
    // Create some procedural buildings
    const buildings = this._generateBuildings()
    
    buildings.forEach(building => {
      const buildingSprite = this._createBuildingSprite(building)
      buildingSprite.position.set(building.x, building.y)
      buildingSprite.zIndex = building.y // Depth sorting
      
      this.container.addChild(buildingSprite)
      this.buildings.push(buildingSprite)
      
      // Add to collision system
      if (this.collisionSystem && building.collidable) {
        this.collisionSystem.addObstacle({
          x: building.x,
          y: building.y,
          width: building.width,
          height: building.height
        })
      }
    })
  }

  /**
   * Generate procedural buildings
   * @private
   */
  _generateBuildings() {
    const buildings = []
    
    // Central building
    buildings.push({
      x: -30,
      y: -40,
      width: 60,
      height: 40,
      color: 0x5D4037,
      type: 'main',
      collidable: true
    })
    
    // Side buildings
    buildings.push({
      x: -70,
      y: -20,
      width: 30,
      height: 30,
      color: 0x6D4C41,
      type: 'side',
      collidable: true
    })
    
    buildings.push({
      x: 40,
      y: -20,
      width: 30,
      height: 30,
      color: 0x6D4C41,
      type: 'side',
      collidable: true
    })
    
    // Bottom buildings
    buildings.push({
      x: -50,
      y: 30,
      width: 40,
      height: 25,
      color: 0x795548,
      type: 'bottom',
      collidable: true
    })
    
    buildings.push({
      x: 10,
      y: 30,
      width: 40,
      height: 25,
      color: 0x795548,
      type: 'bottom',
      collidable: true
    })
    
    return buildings
  }

  /**
   * Create building sprite
   * @private
   */
  _createBuildingSprite(building) {
    const graphics = new PIXI.Graphics()
    
    // Building body
    graphics.beginFill(building.color)
    graphics.drawRect(0, 0, building.width, building.height)
    graphics.endFill()
    
    // Roof
    graphics.beginFill(0x3E2723)
    graphics.moveTo(0, 0)
    graphics.lineTo(building.width / 2, -10)
    graphics.lineTo(building.width, 0)
    graphics.lineTo(0, 0)
    graphics.endFill()
    
    // Windows
    const windowSize = 4
    const windowSpacing = 8
    const windowColor = 0xFFEB3B
    
    for (let x = windowSpacing; x < building.width - windowSpacing; x += windowSpacing) {
      for (let y = windowSpacing; y < building.height - windowSpacing; y += windowSpacing) {
        graphics.beginFill(windowColor, 0.8)
        graphics.drawRect(x, y, windowSize, windowSize)
        graphics.endFill()
      }
    }
    
    // Door (if main building)
    if (building.type === 'main') {
      graphics.beginFill(0x4E342E)
      graphics.drawRect(building.width / 2 - 6, building.height - 12, 12, 12)
      graphics.endFill()
      
      // Add door to collision system as interactive
      if (this.collisionSystem) {
        this.collisionSystem.addDoor({
          id: `door-${building.type}`,
          x: building.x + building.width / 2 - 6,
          y: building.y + building.height - 12,
          width: 12,
          height: 12,
          isOpen: false
        })
      }
    }
    
    // Outline
    graphics.lineStyle(2, 0x000000, 0.3)
    graphics.drawRect(0, 0, building.width, building.height)
    
    const container = new PIXI.Container()
    container.addChild(graphics)
    
    return container
  }

  /**
   * Render decorations (trees, benches, etc.)
   * @private
   */
  _renderDecorations() {
    const decorations = this._generateDecorations()
    
    decorations.forEach(deco => {
      const decoSprite = this._createDecorationSprite(deco)
      decoSprite.position.set(deco.x, deco.y)
      decoSprite.zIndex = deco.y // Depth sorting
      
      this.container.addChild(decoSprite)
      this.decorations.push(decoSprite)
      
      // Add to collision if needed
      if (this.collisionSystem && deco.collidable) {
        this.collisionSystem.addObstacle({
          x: deco.x - deco.radius,
          y: deco.y - deco.radius,
          width: deco.radius * 2,
          height: deco.radius * 2
        })
      }
    })
  }

  /**
   * Generate decorations
   * @private
   */
  _generateDecorations() {
    const decorations = []
    
    // Trees
    const treePositions = [
      { x: -80, y: 40 },
      { x: -60, y: 60 },
      { x: 60, y: 40 },
      { x: 80, y: 60 },
      { x: -40, y: -60 },
      { x: 40, y: -60 }
    ]
    
    treePositions.forEach(pos => {
      decorations.push({
        ...pos,
        type: 'tree',
        radius: 5,
        collidable: true
      })
    })
    
    // Benches
    decorations.push({
      x: 0,
      y: 60,
      type: 'bench',
      radius: 3,
      collidable: true
    })
    
    return decorations
  }

  /**
   * Create decoration sprite
   * @private
   */
  _createDecorationSprite(deco) {
    const graphics = new PIXI.Graphics()
    
    if (deco.type === 'tree') {
      // Tree trunk
      graphics.beginFill(0x5D4037)
      graphics.drawRect(-2, 0, 4, 10)
      graphics.endFill()
      
      // Tree foliage
      graphics.beginFill(0x2E7D32)
      graphics.drawCircle(0, -5, 8)
      graphics.endFill()
      
      graphics.beginFill(0x388E3C, 0.8)
      graphics.drawCircle(-3, -3, 6)
      graphics.drawCircle(3, -3, 6)
      graphics.endFill()
    } else if (deco.type === 'bench') {
      // Bench
      graphics.beginFill(0x8D6E63)
      graphics.drawRect(-8, 0, 16, 4)
      graphics.drawRect(-8, -6, 2, 6)
      graphics.drawRect(6, -6, 2, 6)
      graphics.endFill()
    }
    
    const container = new PIXI.Container()
    container.addChild(graphics)
    
    return container
  }

  /**
   * Convert Graphics to Texture
   * @private
   */
  _graphicsToTexture(graphics, width, height) {
    const renderTexture = PIXI.RenderTexture.create({
      width,
      height
    })
    
    const renderer = PIXI.autoDetectRenderer()
    renderer.render(graphics, { renderTexture })
    
    return renderTexture
  }

  /**
   * Render portals for district transitions
   * @private
   */
  _renderPortals() {
    // Get portals from district data or create default ones
    const portals = this.districtData?.portals || this._generateDefaultPortals()
    
    portals.forEach(portalData => {
      const portal = new Portal2D({
        id: portalData.id,
        x: portalData.x,
        y: portalData.y,
        width: portalData.width || 40,
        height: portalData.height || 60,
        targetDistrict: portalData.targetDistrict,
        spawnPoint: portalData.spawnPoint
      })
      
      portal.zIndex = portalData.y // Depth sorting
      
      this.container.addChild(portal)
      this.portals.push(portal)
    })
  }

  /**
   * Generate default portals if none provided
   * @private
   */
  _generateDefaultPortals() {
    return [
      {
        id: 'portal-north',
        x: 0,
        y: -80,
        targetDistrict: 'centro',
        spawnPoint: { x: 0, y: 70 }
      },
      {
        id: 'portal-south',
        x: 0,
        y: 80,
        targetDistrict: 'parque',
        spawnPoint: { x: 0, y: -70 }
      }
    ]
  }

  /**
   * Update portals animation
   * @param {number} delta 
   */
  update(delta) {
    this.portals.forEach(portal => portal.update(delta))
  }

  /**
   * Get nearby portal
   * @param {Object} position 
   * @param {number} range 
   * @returns {Portal2D|null}
   */
  getNearbyPortal(position, range) {
    for (const portal of this.portals) {
      if (portal.isNear(position, range)) {
        return portal
      }
    }
    return null
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.groundSprite) {
      this.groundSprite.destroy({ children: true, texture: true })
    }
    
    this.buildings.forEach(b => b.destroy({ children: true }))
    this.offices.forEach(o => o.sprite.destroy({ children: true }))
    this.decorations.forEach(d => d.destroy({ children: true }))
    this.portals.forEach(p => p.destroy())
    
    this.buildings = []
    this.offices = []
    this.decorations = []
    this.doors = []
    this.portals = []
  }
}

import * as THREE from 'three'

// Sistema de colisiones tipo GTA
export class CollisionSystem {
  constructor() {
    this.walls = []
    this.doors = []
    this.objects = []
  }

  // Agregar pared
  addWall(position, size) {
    this.walls.push({
      min: new THREE.Vector3(
        position.x - size.width / 2,
        position.y,
        position.z - size.depth / 2
      ),
      max: new THREE.Vector3(
        position.x + size.width / 2,
        position.y + size.height,
        position.z + size.depth / 2
      )
    })
  }

  // Agregar puerta
  addDoor(id, position, size, rotation = 0) {
    this.doors.push({
      id,
      position: new THREE.Vector3(position.x, position.y, position.z),
      size,
      rotation,
      isOpen: false,
      min: new THREE.Vector3(
        position.x - size.width / 2,
        position.y,
        position.z - size.depth / 2
      ),
      max: new THREE.Vector3(
        position.x + size.width / 2,
        position.y + size.height,
        position.z + size.depth / 2
      )
    })
  }

  // Agregar objeto con colisión
  addObject(position, radius) {
    this.objects.push({
      position: new THREE.Vector3(position.x, position.y, position.z),
      radius
    })
  }

  // Verificar colisión con paredes
  checkWallCollision(position, radius = 0.5) {
    for (const wall of this.walls) {
      if (
        position.x + radius > wall.min.x &&
        position.x - radius < wall.max.x &&
        position.z + radius > wall.min.z &&
        position.z - radius < wall.max.z
      ) {
        return true
      }
    }
    return false
  }

  // Verificar colisión con puertas cerradas
  checkDoorCollision(position, radius = 0.5) {
    for (const door of this.doors) {
      if (!door.isOpen) {
        if (
          position.x + radius > door.min.x &&
          position.x - radius < door.max.x &&
          position.z + radius > door.min.z &&
          position.z - radius < door.max.z
        ) {
          return door
        }
      }
    }
    return null
  }

  // Verificar colisión con objetos
  checkObjectCollision(position, radius = 0.5) {
    for (const obj of this.objects) {
      const distance = position.distanceTo(obj.position)
      if (distance < radius + obj.radius) {
        return true
      }
    }
    return false
  }

  // Verificar todas las colisiones
  checkCollision(newPosition, radius = 0.5) {
    const pos = new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z)
    
    if (this.checkWallCollision(pos, radius)) return true
    if (this.checkDoorCollision(pos, radius)) return true
    if (this.checkObjectCollision(pos, radius)) return true
    
    return false
  }

  // Obtener puerta cercana
  getNearbyDoor(position, maxDistance = 2) {
    for (const door of this.doors) {
      const distance = position.distanceTo(door.position)
      if (distance < maxDistance) {
        return door
      }
    }
    return null
  }

  // Abrir/cerrar puerta
  toggleDoor(doorId) {
    const door = this.doors.find(d => d.id === doorId)
    if (door) {
      door.isOpen = !door.isOpen
      return door.isOpen
    }
    return false
  }

  // Limpiar sistema
  clear() {
    this.walls = []
    this.doors = []
    this.objects = []
  }
  
  // Obtener todos los obstáculos para pathfinding
  getObstacles() {
    const obstacles = []
    
    // Agregar paredes
    this.walls.forEach((wall, index) => {
      obstacles.push({
        id: `wall-${index}`,
        position: {
          x: (wall.min.x + wall.max.x) / 2,
          y: (wall.min.y + wall.max.y) / 2,
          z: (wall.min.z + wall.max.z) / 2
        },
        size: {
          width: wall.max.x - wall.min.x,
          height: wall.max.y - wall.min.y,
          depth: wall.max.z - wall.min.z
        }
      })
    })
    
    // Agregar puertas cerradas
    this.doors.forEach(door => {
      if (!door.isOpen) {
        obstacles.push({
          id: `door-${door.id}`,
          position: {
            x: door.position.x,
            y: door.position.y,
            z: door.position.z
          },
          size: door.size
        })
      }
    })
    
    // Agregar objetos
    this.objects.forEach((obj, index) => {
      obstacles.push({
        id: `object-${index}`,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z
        },
        size: {
          width: obj.radius * 2,
          height: obj.radius * 2,
          depth: obj.radius * 2
        }
      })
    })
    
    return obstacles
  }
}

// Instancia global del sistema de colisiones
export const collisionSystem = new CollisionSystem()

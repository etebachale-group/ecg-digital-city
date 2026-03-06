import { io } from 'socket.io-client'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { SOCKET_URL } from '../config/api'

let socket = null

export const initSocket = () => {
  const token = useAuthStore.getState().token
  
  if (!token) {
    console.error('No token found')
    return null
  }

  // Si ya existe un socket conectado, no crear uno nuevo
  if (socket && socket.connected) {
    console.log('Socket ya está conectado')
    return socket
  }

  try {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    // Conexión establecida
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor')
    })

  // Lista de usuarios online
  socket.on('world:users', (data) => {
    console.log('Usuarios online:', data.users)
    data.users.forEach(user => {
      if (user.userId !== socket.id) {
        useGameStore.getState().addPlayer(user.userId, {
          username: user.username || 'Usuario',
          position: {
            x: user.positionX || 0,
            y: user.positionY || 0,
            z: user.positionZ || 0
          },
          district: user.district || 'recepcion'
        })
      }
    })
  })

  // Usuario se unió
  socket.on('world:user-joined', (data) => {
    console.log('Usuario se unió:', data.username)
    useGameStore.getState().addPlayer(data.userId, {
      username: data.username,
      position: data.position,
      district: data.district
    })
  })

  // Usuario se movió
  socket.on('world:user-moved', (data) => {
    useGameStore.getState().updatePlayer(data.userId, {
      position: data.position,
      rotation: data.rotation
    })
  })

  // Usuario salió
  socket.on('world:user-left', (data) => {
    console.log('Usuario salió:', data.userId)
    useGameStore.getState().removePlayer(data.userId)
  })

  // Mensaje de chat
  socket.on('chat:message', (data) => {
    useGameStore.getState().addMessage({
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      timestamp: data.timestamp
    })
  })

  // Usuario escribiendo
  socket.on('chat:typing', (data) => {
    // TODO: Mostrar indicador de escritura
    console.log(`${data.username} está escribiendo...`)
  })

  // Teletransporte exitoso
  socket.on('teleport:success', (data) => {
    console.log('Teletransporte exitoso a:', data.district || data.office)
    if (data.district) {
      useGameStore.getState().setPlayerDistrict(data.district.slug)
      useGameStore.getState().setCurrentDistrict(data.district)
      useGameStore.getState().showToast(
        `Bienvenido a ${data.district.name}`,
        'success',
        'Teletransporte'
      )
    } else if (data.office) {
      useGameStore.getState().setPlayerOffice(data.office.id)
      useGameStore.getState().setCurrentOffice(data.office)
      useGameStore.getState().showToast(
        `Entraste a ${data.office.name}`,
        'success',
        'Oficina'
      )
    }
  })

  // Error de teletransporte
  socket.on('teleport:error', (data) => {
    console.error('Error de teletransporte:', data.message)
    useGameStore.getState().showToast(data.message, 'error', 'Error')
  })

  // Usuario entró a distrito
  socket.on('user:entered-district', (data) => {
    console.log(`${data.username} entró al distrito`)
    useGameStore.getState().addPlayer(data.userId, {
      username: data.username,
      position: data.position,
      district: data.district
    })
    useGameStore.getState().showToast(
      `${data.username} entró al distrito`,
      'info'
    )
  })

  // Usuario entró a oficina
  socket.on('user:entered-office', (data) => {
    console.log(`${data.username} entró a la oficina`)
  })

  // Usuario salió de oficina
  socket.on('user:left-office', (data) => {
    console.log(`${data.username} salió de la oficina`)
  })

  // Objeto agregado a oficina
  socket.on('office:object-added', (data) => {
    console.log('Objeto agregado:', data.object)
    useGameStore.getState().addOfficeObject(data.object)
  })

  // Objeto actualizado
  socket.on('office:object-updated', (data) => {
    console.log('Objeto actualizado:', data.objectId)
    useGameStore.getState().updateOfficeObject(data.objectId, data.updates)
  })

  // Objeto eliminado
  socket.on('office:object-deleted', (data) => {
    console.log('Objeto eliminado:', data.objectId)
    useGameStore.getState().removeOfficeObject(data.objectId)
  })

  // Editor se unió
  socket.on('office:editor-joined', (data) => {
    console.log(`${data.username} está editando`)
  })

  // Editor salió
  socket.on('office:editor-left', (data) => {
    console.log(`${data.username} dejó de editar`)
  })

  // Error de edición
  socket.on('office:edit-error', (data) => {
    console.error('Error de edición:', data.message)
    useGameStore.getState().showToast(data.message, 'error', 'Error de Edición')
  })

  // XP ganado
  socket.on('gamification:xp', (data) => {
    console.log(`+${data.xp} XP por ${data.action}`)
    useGameStore.getState().showToast(
      `+${data.xp} XP 🎉`,
      'success'
    )
    
    // Actualizar progreso en el store
    import('../store/gamificationStore.js').then(({ useGamificationStore }) => {
      const user = useAuthStore.getState().user
      if (user?.id) {
        useGamificationStore.getState().loadProgress(user.id)
      }
    }).catch(err => console.error('Error loading gamificationStore:', err))
  })

  // Level up
  socket.on('gamification:levelup', (data) => {
    console.log(`¡Subiste al nivel ${data.level}!`)
    import('../store/gamificationStore.js').then(({ useGamificationStore }) => {
      useGamificationStore.getState().showLevelUpModal(data.level)
    }).catch(err => console.error('Error loading gamificationStore:', err))
  })

  // Límite diario alcanzado
  socket.on('gamification:limit', (data) => {
    console.log(`Límite alcanzado: ${data.message}`)
    useGameStore.getState().showToast(
      data.message,
      'warning',
      'Límite Diario'
    )
  })

  // Errores
  socket.on('error', (error) => {
    console.error('Error de Socket.IO:', error)
    useGameStore.getState().showToast(
      error.message || 'Error de conexión',
      'error',
      'Error'
    )
  })

  socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor')
  })

  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error)
  })

  return socket
  } catch (error) {
    console.error('Error al inicializar socket:', error)
    return null
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const emitMove = (position, rotation) => {
  if (socket) {
    socket.emit('avatar:move', {
      x: position.x,
      y: position.y,
      z: position.z,
      rotation
    })
  }
}

export const emitStop = (position) => {
  if (socket) {
    socket.emit('avatar:stop', {
      x: position.x,
      y: position.y,
      z: position.z
    })
  }
}

export const emitTeleport = (district, position) => {
  if (socket) {
    socket.emit('teleport:request', {
      district,
      position
    })
  }
}

export const emitTeleportDistrict = (districtSlug, position) => {
  if (socket) {
    socket.emit('teleport:district', {
      districtSlug,
      position
    })
  }
}

export const emitTeleportOffice = (officeId) => {
  if (socket) {
    socket.emit('teleport:office', {
      officeId
    })
  }
}

export const emitExitOffice = (officeId) => {
  if (socket) {
    socket.emit('office:exit', {
      officeId
    })
  }
}

export const emitChatMessage = (content, type = 'proximity') => {
  if (socket) {
    socket.emit('chat:message', {
      content,
      type
    })
  }
}

export const emitTyping = (isTyping) => {
  if (socket) {
    socket.emit('chat:typing', { isTyping })
  }
}

export const getSocket = () => socket

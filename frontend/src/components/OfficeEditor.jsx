import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSocket } from '../services/socket'
import { API_URL } from '../config/api'
import './OfficeEditor.css'

function OfficeEditor({ officeId, onClose }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [objects, setObjects] = useState([])
  const [selectedObject, setSelectedObject] = useState(null)
  const [objectLibrary, setObjectLibrary] = useState([
    { type: 'desk', name: 'Escritorio', color: '#8B4513', icon: '🪑' },
    { type: 'chair', name: 'Silla', color: '#654321', icon: '💺' },
    { type: 'plant', name: 'Planta', color: '#2ecc71', icon: '🌿' },
    { type: 'lamp', name: 'Lámpara', color: '#f39c12', icon: '💡' },
    { type: 'table', name: 'Mesa', color: '#95a5a6', icon: '🪑' },
    { type: 'computer', name: 'Computadora', color: '#34495e', icon: '💻' },
    { type: 'whiteboard', name: 'Pizarra', color: '#ecf0f1', icon: '📋' },
    { type: 'bookshelf', name: 'Estantería', color: '#7f8c8d', icon: '📚' }
  ])

  useEffect(() => {
    // Cargar objetos de la oficina
    loadOfficeObjects()

    // Escuchar eventos de Socket.IO
    const socket = getSocket()
    if (socket) {
      socket.on('office:object-added', handleObjectAdded)
      socket.on('office:object-updated', handleObjectUpdated)
      socket.on('office:object-deleted', handleObjectDeleted)
      socket.on('office:editor-joined', handleEditorJoined)
      socket.on('office:editor-left', handleEditorLeft)
    }

    return () => {
      if (socket) {
        socket.off('office:object-added', handleObjectAdded)
        socket.off('office:object-updated', handleObjectUpdated)
        socket.off('office:object-deleted', handleObjectDeleted)
        socket.off('office:editor-joined', handleEditorJoined)
        socket.off('office:editor-left', handleEditorLeft)
      }
    }
  }, [officeId])

  const loadOfficeObjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/offices/${officeId}/objects`)
      const data = await response.json()
      setObjects(data)
    } catch (error) {
      console.error('Error cargando objetos:', error)
    }
  }

  const handleObjectAdded = (data) => {
    setObjects(prev => [...prev, data.object])
  }

  const handleObjectUpdated = (data) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === data.objectId ? { ...obj, ...data.updates } : obj))
    )
  }

  const handleObjectDeleted = (data) => {
    setObjects(prev => prev.filter(obj => obj.id !== data.objectId))
  }

  const handleEditorJoined = (data) => {
    console.log(`${data.username} está editando`)
  }

  const handleEditorLeft = (data) => {
    console.log(`${data.username} dejó de editar`)
  }

  const toggleEditMode = () => {
    const socket = getSocket()
    if (!socket) return

    if (!isEditMode) {
      socket.emit('office:edit-mode', { officeId })
      setIsEditMode(true)
    } else {
      socket.emit('office:exit-edit-mode', { officeId })
      setIsEditMode(false)
      setSelectedObject(null)
    }
  }

  const addObject = (objectType) => {
    const socket = getSocket()
    if (!socket || !isEditMode) return

    const newObject = {
      officeId,
      objectType: objectType.type,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: objectType.color,
      metadata: { name: objectType.name },
      createdBy: 1 // TODO: usar userId real
    }

    socket.emit('office:add-object', newObject)
  }

  const updateObject = (objectId, updates) => {
    const socket = getSocket()
    if (!socket || !isEditMode) return

    socket.emit('office:update-object', {
      officeId,
      objectId,
      updates
    })
  }

  const deleteObject = (objectId) => {
    const socket = getSocket()
    if (!socket || !isEditMode) return

    socket.emit('office:delete-object', {
      officeId,
      objectId
    })
  }

  return (
    <div className="office-editor-overlay">
      <div className="office-editor-container">
        {/* Header */}
        <div className="office-editor-header">
          <h2>🏢 Editor de Oficina</h2>
          <div className="office-editor-actions">
            <button
              className={`edit-mode-btn ${isEditMode ? 'active' : ''}`}
              onClick={toggleEditMode}
            >
              {isEditMode ? '✓ Modo Edición' : '✏️ Activar Edición'}
            </button>
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="office-editor-content">
          {/* Biblioteca de objetos */}
          <div className="object-library">
            <h3>📦 Biblioteca de Objetos</h3>
            <div className="object-library-grid">
              {objectLibrary.map((obj) => (
                <div
                  key={obj.type}
                  className={`object-library-item ${!isEditMode ? 'disabled' : ''}`}
                  onClick={() => isEditMode && addObject(obj)}
                  title={obj.name}
                >
                  <div className="object-icon">{obj.icon}</div>
                  <div className="object-name">{obj.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de objetos en la oficina */}
          <div className="office-objects-list">
            <h3>🪑 Objetos en Oficina ({objects.length})</h3>
            <div className="objects-list-container">
              {objects.length === 0 ? (
                <div className="empty-state">
                  <p>No hay objetos en esta oficina</p>
                  <p>👈 Agrega objetos desde la biblioteca</p>
                </div>
              ) : (
                objects.map((obj) => (
                  <div
                    key={obj.id}
                    className={`object-item ${
                      selectedObject?.id === obj.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedObject(obj)}
                  >
                    <div className="object-item-info">
                      <span className="object-item-type">
                        {objectLibrary.find(o => o.type === obj.objectType)?.icon || '📦'}
                      </span>
                      <div>
                        <div className="object-item-name">
                          {obj.metadata?.name || obj.objectType}
                        </div>
                        <div className="object-item-position">
                          x: {obj.position.x.toFixed(1)}, z: {obj.position.z.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    {isEditMode && (
                      <button
                        className="delete-object-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteObject(obj.id)
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de propiedades */}
          {selectedObject && isEditMode && (
            <div className="object-properties">
              <h3>⚙️ Propiedades</h3>
              <div className="property-group">
                <label>Posición X</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={selectedObject.position.x}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      position: { ...selectedObject.position, x: parseFloat(e.target.value) }
                    })
                  }
                />
                <span>{selectedObject.position.x.toFixed(1)}</span>
              </div>

              <div className="property-group">
                <label>Posición Z</label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={selectedObject.position.z}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      position: { ...selectedObject.position, z: parseFloat(e.target.value) }
                    })
                  }
                />
                <span>{selectedObject.position.z.toFixed(1)}</span>
              </div>

              <div className="property-group">
                <label>Rotación Y</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={(selectedObject.rotation.y * 180) / Math.PI}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      rotation: {
                        ...selectedObject.rotation,
                        y: (parseFloat(e.target.value) * Math.PI) / 180
                      }
                    })
                  }
                />
                <span>{((selectedObject.rotation.y * 180) / Math.PI).toFixed(0)}°</span>
              </div>

              <div className="property-group">
                <label>Color</label>
                <input
                  type="color"
                  value={selectedObject.color}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      color: e.target.value
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="office-editor-footer">
          <p>💡 Activa el modo edición para agregar y modificar objetos</p>
          <p>🎨 Los cambios se sincronizan en tiempo real con otros editores</p>
        </div>
      </div>
    </div>
  )
}

export default OfficeEditor

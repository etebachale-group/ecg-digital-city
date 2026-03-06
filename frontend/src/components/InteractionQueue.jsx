import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { emitQueueLeave } from '../services/socket'
import './InteractionQueue.css'

function InteractionQueue() {
  const interactionQueue = useGameStore((state) => state.interactionQueue)
  const player = useGameStore((state) => state.player)
  const leaveInteractionQueue = useGameStore((state) => state.leaveInteractionQueue)
  
  const [currentQueue, setCurrentQueue] = useState(null)
  const [queuePosition, setQueuePosition] = useState(null)
  const [queueLength, setQueueLength] = useState(0)
  const [objectName, setObjectName] = useState('')
  const [estimatedWait, setEstimatedWait] = useState(0)
  
  useEffect(() => {
    // Find if player is in any queue
    let foundQueue = null
    let foundPosition = null
    let foundObjectId = null
    
    for (const [objectId, queue] of interactionQueue.entries()) {
      const position = queue.findIndex(item => item.userId === player.id)
      if (position >= 0) {
        foundQueue = queue
        foundPosition = position + 1 // 1-indexed for display
        foundObjectId = objectId
        break
      }
    }
    
    if (foundQueue && foundPosition) {
      setCurrentQueue(foundQueue)
      setQueuePosition(foundPosition)
      setQueueLength(foundQueue.length)
      
      // Estimate wait time (30 seconds per person ahead)
      const waitTime = (foundPosition - 1) * 30
      setEstimatedWait(waitTime)
      
      // Get object name from interactive objects
      const interactiveObjects = useGameStore.getState().interactiveObjects
      const object = interactiveObjects.get(foundObjectId)
      setObjectName(object?.name || 'Objeto')
    } else {
      setCurrentQueue(null)
      setQueuePosition(null)
      setQueueLength(0)
      setEstimatedWait(0)
      setObjectName('')
    }
  }, [interactionQueue, player.id])
  
  const handleLeaveQueue = () => {
    // Find which queue the player is in
    for (const [objectId, queue] of interactionQueue.entries()) {
      const position = queue.findIndex(item => item.userId === player.id)
      if (position >= 0) {
        leaveInteractionQueue(objectId)
        emitQueueLeave(objectId)
        break
      }
    }
  }
  
  const formatWaitTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
  
  if (!currentQueue || !queuePosition) {
    return null
  }
  
  const isNextInLine = queuePosition === 1
  
  return (
    <div className={`interaction-queue ${isNextInLine ? 'next-in-line' : ''}`}>
      <div className="queue-header">
        <div className="queue-icon">⏳</div>
        <div className="queue-title">
          <div className="queue-object-name">{objectName}</div>
          <div className="queue-subtitle">Cola de Interacción</div>
        </div>
      </div>
      
      <div className="queue-body">
        <div className="queue-stats">
          <div className="queue-stat">
            <div className="stat-label">Tu Posición</div>
            <div className="stat-value position">{queuePosition}</div>
          </div>
          
          <div className="queue-stat">
            <div className="stat-label">En Cola</div>
            <div className="stat-value">{queueLength}</div>
          </div>
          
          {!isNextInLine && (
            <div className="queue-stat">
              <div className="stat-label">Tiempo Estimado</div>
              <div className="stat-value time">{formatWaitTime(estimatedWait)}</div>
            </div>
          )}
        </div>
        
        {isNextInLine && (
          <div className="next-turn-notification">
            <div className="notification-icon">🎉</div>
            <div className="notification-text">¡Es tu turno!</div>
          </div>
        )}
        
        <div className="queue-progress">
          <div 
            className="queue-progress-bar"
            style={{ 
              width: `${((queueLength - queuePosition + 1) / queueLength) * 100}%` 
            }}
          />
        </div>
      </div>
      
      <div className="queue-footer">
        <button 
          className="leave-queue-button"
          onClick={handleLeaveQueue}
        >
          Salir de la Cola
        </button>
      </div>
    </div>
  )
}

export default InteractionQueue

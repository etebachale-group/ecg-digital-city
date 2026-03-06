import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import './InteractionIndicators.css'

function InteractionIndicators() {
  const nearbyObjects = useGameStore((state) => state.nearbyObjects)
  const highlightedObject = useGameStore((state) => state.highlightedObject)
  const interactionQueue = useGameStore((state) => state.interactionQueue)
  const player = useGameStore((state) => state.player)
  
  const [currentObject, setCurrentObject] = useState(null)
  const [queuePosition, setQueuePosition] = useState(null)
  
  useEffect(() => {
    if (nearbyObjects.length > 0) {
      setCurrentObject(nearbyObjects[0])
    } else {
      setCurrentObject(null)
    }
  }, [nearbyObjects])
  
  useEffect(() => {
    if (currentObject && interactionQueue.has(currentObject.id)) {
      const queue = interactionQueue.get(currentObject.id)
      const position = queue.findIndex(item => item.userId === player.id)
      setQueuePosition(position >= 0 ? position + 1 : null)
    } else {
      setQueuePosition(null)
    }
  }, [currentObject, interactionQueue, player.id])
  
  if (!currentObject) return null
  
  return (
    <div className="interaction-indicators">
      {/* Proximity Indicator */}
      <div className="proximity-indicator">
        <div className="indicator-icon">👆</div>
        <div className="indicator-text">
          <div className="object-name">{currentObject.name}</div>
          <div className="object-action">
            {queuePosition ? (
              <span className="queue-info">En cola - Posición {queuePosition}</span>
            ) : (
              <span className="action-prompt">Presiona E para interactuar</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Object Tooltip */}
      {highlightedObject === currentObject.id && (
        <div className="object-tooltip">
          <div className="tooltip-header">{currentObject.name}</div>
          <div className="tooltip-body">
            <div className="tooltip-type">{currentObject.objectType}</div>
            {currentObject.description && (
              <div className="tooltip-description">{currentObject.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractionIndicators

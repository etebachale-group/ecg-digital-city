import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { emitChatMessage, emitTyping } from '../services/socket'
import CompanyDashboard from './CompanyDashboard'
import Leaderboard from './Leaderboard'
import CameraIndicator from './CameraIndicator'
import InteractionIndicators from './InteractionIndicators'
import InteractionQueue from './InteractionQueue'
import { getRenderMode, toggleRenderMode } from '../config/features'
import './UI.css'

function UI() {
  const [chatInput, setChatInput] = useState('')
  const [showOfficeEditor, setShowOfficeEditor] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const player = useGameStore((state) => state.player)
  const players = useGameStore((state) => state.players)
  const messages = useGameStore((state) => state.messages)
  const showChat = useGameStore((state) => state.showChat)
  const toggleChat = useGameStore((state) => state.toggleChat)
  const districts = useGameStore((state) => state.districts)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const currentDistrictData = districts.find(d => d.slug === player.district)

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      emitChatMessage(chatInput.trim())
      setChatInput('')
      emitTyping(false)
    }
  }

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    } else {
      emitTyping(true)
      setTimeout(() => emitTyping(false), 1000)
    }
  }

  // Atajo de teclado para abrir chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 't' && !showChat && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault()
        toggleChat()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showChat, toggleChat])

  return (
    <div className="ui-overlay">
      {/* Indicador de modo de cámara */}
      <CameraIndicator />
      
      {/* Header */}
      <div className="ui-header">
        <div className="user-info">
          <span className="username">{user?.username || 'Usuario'}</span>
          <span className="district">
            📍 {currentDistrictData?.name || player.district}
          </span>
        </div>
        <div className="online-count">
          👥 {players.size + 1} online
        </div>
        <button 
          className="render-mode-btn" 
          onClick={toggleRenderMode}
          title="Cambiar entre 2D y 3D"
        >
          {getRenderMode() === '2d' ? '🎮 2D' : '🎲 3D'}
        </button>
        <button className="dashboard-btn" onClick={() => setShowLeaderboard(true)}>
          🏆 Ranking
        </button>
        <button className="dashboard-btn" onClick={() => setShowDashboard(true)}>
          🏢 Empresas
        </button>
        <button className="logout-btn" onClick={logout}>
          Salir
        </button>
      </div>

      {/* Mapa mini - Fase 2 */}
      <div className="minimap">
        <div className="minimap-title">Distrito Actual</div>
        <div className="minimap-content">
          <div className="district-info">
            <div className="district-name">
              {currentDistrictData?.name || 'Cargando...'}
            </div>
            <div className="district-description">
              {currentDistrictData?.description || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="controls-hint">
        <div>WASD - Mover</div>
        <div>Shift - Correr 🏃</div>
        <div>C - Sentarse 💺</div>
        <div>M - Mapa de Distritos</div>
        <div>E - Interactuar</div>
        <div>T - Chat</div>
        <div className="camera-controls">
          <strong>🎥 Cámara:</strong>
          <div>Click Derecho + Arrastrar - Rotar</div>
          <div>Rueda del Mouse - Zoom</div>
          <div>V - Cambiar Vista (4 modos)</div>
          <div>R - Resetear Cámara</div>
        </div>
      </div>

      {/* Chat */}
      {showChat && (
        <div className="chat-container">
          <div className="chat-header">
            <span>💬 Chat por Proximidad</span>
            <button onClick={toggleChat}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                Los mensajes solo se ven si estás cerca de otros jugadores (3 unidades)
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="chat-message">
                  <span className="chat-sender">{msg.senderName}:</span>
                  <span className="chat-content">{msg.content}</span>
                </div>
              ))
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              autoFocus
            />
          </div>
        </div>
      )}
      
      {/* Dashboard de Empresas */}
      {showDashboard && (
        <CompanyDashboard onClose={() => setShowDashboard(false)} />
      )}
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      
      {/* Interaction System UI */}
      <InteractionIndicators />
      <InteractionQueue />
    </div>
  )
}

export default UI

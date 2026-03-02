import { useEffect, useState } from 'react'
import './LevelUpModal.css'

function LevelUpModal({ level, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`levelup-overlay ${show ? 'show' : ''}`}>
      <div className={`levelup-modal ${show ? 'show' : ''}`}>
        <div className="levelup-stars">
          <div className="star">⭐</div>
          <div className="star">⭐</div>
          <div className="star">⭐</div>
        </div>
        <div className="levelup-content">
          <h2 className="levelup-title">¡Subiste de Nivel!</h2>
          <div className="levelup-level">
            <span className="levelup-number">{level}</span>
          </div>
          <p className="levelup-message">
            ¡Felicidades! Sigue así para desbloquear más logros
          </p>
        </div>
        <div className="levelup-confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'][Math.floor(Math.random() * 4)]
            }}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LevelUpModal

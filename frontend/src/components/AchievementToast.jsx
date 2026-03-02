import { useEffect, useState } from 'react'
import './AchievementToast.css'

function AchievementToast({ achievement, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!achievement) return null

  return (
    <div className={`achievement-toast ${show ? 'show' : ''}`}>
      <div className="achievement-sparkle">✨</div>
      <div className="achievement-toast-header">
        <div className="achievement-icon">{achievement.icon || '🏆'}</div>
        <div className="achievement-title">
          <p className="achievement-label">Logro Desbloqueado</p>
          <h4 className="achievement-name">{achievement.name}</h4>
        </div>
      </div>
      <p className="achievement-description">{achievement.description}</p>
      <div className="achievement-reward">
        <span className="achievement-xp">
          +{achievement.xpReward} XP ⭐
        </span>
      </div>
    </div>
  )
}

export default AchievementToast

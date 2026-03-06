import { useEffect } from 'react'
import { useGamificationStore } from '../store/gamificationStore'
import { useAuthStore } from '../store/authStore'
import './XPBar.css'

function XPBar() {
  const user = useAuthStore((state) => state.user)
  const progress = useGamificationStore((state) => state.progress)
  const loadProgress = useGamificationStore((state) => state.loadProgress)

  useEffect(() => {
    if (user?.id) {
      loadProgress(user.id)
    }
  }, [user?.id])

  if (!progress) return null

  const xpForCurrentLevel = ((progress.level || 1) - 1) * 100
  const xpForNextLevel = (progress.level || 1) * 100
  const xpInCurrentLevel = (progress.xp || 0) - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const percentage = (xpInCurrentLevel / xpNeededForLevel) * 100

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="level-badge">Nivel {progress.level || 1}</span>
        <span className="xp-text">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${percentage}%` }}
        >
          <div className="xp-bar-shine"></div>
        </div>
      </div>
      <div className="xp-bar-stats">
        <span>🔥 {progress.streakDays || 0} días</span>
        <span>⭐ {progress.xp || 0} XP total</span>
      </div>
    </div>
  )
}

export default XPBar

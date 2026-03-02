import { useEffect } from 'react'
import { useGamificationStore } from '../store/gamificationStore'
import './Leaderboard.css'

function Leaderboard({ onClose }) {
  const leaderboard = useGamificationStore((state) => state.leaderboard) || []
  const loading = useGamificationStore((state) => state.loading)
  const loadLeaderboard = useGamificationStore((state) => state.loadLeaderboard)

  useEffect(() => {
    loadLeaderboard(10)
  }, [])

  const getRankClass = (index) => {
    if (index === 0) return 'top-1'
    if (index === 1) return 'top-2'
    if (index === 2) return 'top-3'
    return ''
  }

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h3>🏆 Clasificación Global</h3>
          <button className="leaderboard-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="leaderboard-loading">
            <p>Cargando clasificación...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="leaderboard-empty">
            <div className="leaderboard-empty-icon">📊</div>
            <p>No hay datos de clasificación aún</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`leaderboard-item ${getRankClass(index)}`}
              >
                <div className="leaderboard-rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="leaderboard-avatar">
                  👤
                </div>
                <div className="leaderboard-info">
                  <h4 className="leaderboard-username">
                    {entry.user?.username || 'Usuario'}
                  </h4>
                  <p className="leaderboard-level">
                    Nivel {entry.level}
                  </p>
                </div>
                <div className="leaderboard-xp">
                  <p className="leaderboard-xp-value">
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="leaderboard-xp-label">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard

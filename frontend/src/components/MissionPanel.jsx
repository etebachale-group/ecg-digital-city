import { useState, useEffect } from 'react'
import { useGamificationStore } from '../store/gamificationStore'
import { useAuthStore } from '../store/authStore'
import './MissionPanel.css'

function MissionPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const userMissions = useGamificationStore((state) => state.userMissions)
  const loadUserMissions = useGamificationStore((state) => state.loadUserMissions)
  const assignDailyMissions = useGamificationStore((state) => state.assignDailyMissions)

  useEffect(() => {
    if (user?.id) {
      loadUserMissions(user.id).then((missions) => {
        // Si no hay misiones, asignar misiones diarias
        if (!missions || missions.length === 0) {
          assignDailyMissions(user.id).catch(error => {
            console.error('Error al asignar misiones:', error)
          })
        }
      }).catch(error => {
        console.error('Error al cargar misiones:', error)
      })
    }
  }, [user?.id])

  const calculateProgress = (mission) => {
    if (!mission.mission) return 0
    return Math.min((mission.progress / mission.mission.requirementValue) * 100, 100)
  }

  return (
    <div className="mission-panel-container">
      <div className="mission-panel-header">
        <h3 className="mission-panel-title">
          📋 Misiones Diarias
        </h3>
        <button
          className="mission-panel-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      
      <div className={`mission-panel-content ${collapsed ? 'collapsed' : ''}`}>
        {!userMissions || userMissions.length === 0 ? (
          <div className="mission-empty">
            <div className="mission-empty-icon">📭</div>
            <p>No hay misiones disponibles</p>
          </div>
        ) : (
          <div className="mission-list">
            {Array.isArray(userMissions) && userMissions.map((userMission) => {
              const mission = userMission.mission
              if (!mission) return null
              
              const progress = calculateProgress(userMission)
              const isCompleted = userMission.isCompleted

              return (
                <div
                  key={userMission.id}
                  className={`mission-item ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="mission-item-header">
                    <div className="mission-info">
                      <h4 className="mission-title">{mission.title}</h4>
                      <p className="mission-description">{mission.description}</p>
                    </div>
                    {isCompleted ? (
                      <div className="mission-completed-icon">✓</div>
                    ) : (
                      <span className={`mission-difficulty ${mission.difficulty}`}>
                        {mission.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <div className="mission-progress-bar">
                    <div
                      className={`mission-progress-fill ${isCompleted ? 'completed' : ''}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mission-footer">
                    <span className="mission-progress-text">
                      {userMission.progress} / {mission.requirementValue}
                    </span>
                    <span className="mission-reward">
                      +{mission.xpReward} XP ⭐
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MissionPanel

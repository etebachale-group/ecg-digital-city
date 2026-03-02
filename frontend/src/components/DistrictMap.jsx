import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSocket } from '../services/socket'
import './DistrictMap.css'

function DistrictMap() {
  const [showMap, setShowMap] = useState(false)
  const currentDistrict = useGameStore((state) => state.player.district)

  const districts = [
    {
      slug: 'central',
      name: 'Distrito Central',
      description: 'ECG Headquarters, Academy e Incubadora',
      color: '#3498db',
      position: { top: '50%', left: '50%' }
    },
    {
      slug: 'empresarial',
      name: 'Distrito Empresarial',
      description: 'Oficinas privadas para empresas',
      color: '#2ecc71',
      position: { top: '50%', left: '75%' }
    },
    {
      slug: 'cultural',
      name: 'Distrito Cultural',
      description: 'Galería, Museo y Teatro',
      color: '#9b59b6',
      position: { top: '75%', left: '50%' }
    },
    {
      slug: 'social',
      name: 'Plaza Social',
      description: 'Networking y Coworking',
      color: '#e74c3c',
      position: { top: '50%', left: '25%' }
    }
  ]

  const handleTeleport = (districtSlug) => {
    if (districtSlug === currentDistrict) {
      return
    }

    const socket = getSocket()
    if (socket) {
      socket.emit('teleport:district', {
        districtSlug,
        position: { x: 0, y: 0, z: 0 }
      })
    }
  }

  return (
    <>
      {/* Botón para abrir mapa */}
      <button
        className="district-map-toggle"
        onClick={() => setShowMap(!showMap)}
        title="Mapa de Distritos (M)"
      >
        🗺️
      </button>

      {/* Mapa de distritos */}
      {showMap && (
        <div className="district-map-overlay">
          <div className="district-map-container">
            <div className="district-map-header">
              <h2>🏙️ Mapa de ECG Digital City</h2>
              <button onClick={() => setShowMap(false)}>✕</button>
            </div>

            <div className="district-map-content">
              {/* Mapa visual */}
              <div className="district-map-visual">
                {districts.map((district) => (
                  <div
                    key={district.slug}
                    className={`district-marker ${
                      currentDistrict === district.slug ? 'current' : ''
                    }`}
                    style={{
                      top: district.position.top,
                      left: district.position.left,
                      backgroundColor: district.color
                    }}
                    onClick={() => handleTeleport(district.slug)}
                  >
                    <div className="district-marker-dot"></div>
                    {currentDistrict === district.slug && (
                      <div className="district-marker-pulse"></div>
                    )}
                  </div>
                ))}

                {/* Líneas conectoras */}
                <svg className="district-connections">
                  <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="#ccc" strokeWidth="2" />
                  <line x1="50%" y1="50%" x2="25%" y2="50%" stroke="#ccc" strokeWidth="2" />
                  <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="#ccc" strokeWidth="2" />
                </svg>
              </div>

              {/* Lista de distritos */}
              <div className="district-list">
                {districts.map((district) => (
                  <div
                    key={district.slug}
                    className={`district-card ${
                      currentDistrict === district.slug ? 'current' : ''
                    }`}
                    onClick={() => handleTeleport(district.slug)}
                  >
                    <div
                      className="district-card-color"
                      style={{ backgroundColor: district.color }}
                    ></div>
                    <div className="district-card-info">
                      <h3>
                        {district.name}
                        {currentDistrict === district.slug && ' 📍'}
                      </h3>
                      <p>{district.description}</p>
                      {currentDistrict !== district.slug && (
                        <button className="teleport-btn">
                          Teletransportar →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="district-map-footer">
              <p>💡 Presiona <kbd>M</kbd> para abrir/cerrar el mapa</p>
              <p>🚀 Haz clic en un distrito para teletransportarte</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DistrictMap

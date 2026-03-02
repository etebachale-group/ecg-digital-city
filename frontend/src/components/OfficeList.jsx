import './OfficeList.css'
import './CompanyComponents.css'

function OfficeList({ offices, onManagePermissions }) {
  if (offices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏠</div>
        <h3>No hay oficinas</h3>
        <p>Crea tu primera oficina para esta empresa</p>
      </div>
    )
  }

  const getDistrictName = (districtId) => {
    const districts = {
      1: 'Distrito Central',
      2: 'Distrito Empresarial',
      3: 'Distrito Cultural',
      4: 'Plaza Social'
    }
    return districts[districtId] || 'Desconocido'
  }

  return (
    <div className="office-list">
      {offices.map((office) => (
        <div key={office.id} className="office-card">
          <div className="office-card-header">
            <h4>{office.name}</h4>
            <span className={`office-status ${office.isPublic ? 'public' : 'private'}`}>
              {office.isPublic ? '🌐 Pública' : '🔒 Privada'}
            </span>
          </div>
          
          <div className="office-card-body">
            <p className="office-description">
              {office.description || 'Sin descripción'}
            </p>
            
            <div className="office-details">
              <div className="office-detail">
                <span className="detail-icon">📍</span>
                <span>{getDistrictName(office.districtId)}</span>
              </div>
              <div className="office-detail">
                <span className="detail-icon">📏</span>
                <span>
                  {office.size?.width || 10}x{office.size?.depth || 10}
                </span>
              </div>
              <div className="office-detail">
                <span className="detail-icon">👥</span>
                <span>Capacidad: {office.maxCapacity}</span>
              </div>
            </div>
          </div>
          
          <div className="office-card-footer">
            <button
              className="btn-secondary"
              onClick={() => onManagePermissions(office)}
            >
              🔐 Permisos
            </button>
            <button className="btn-primary">
              ✏️ Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OfficeList

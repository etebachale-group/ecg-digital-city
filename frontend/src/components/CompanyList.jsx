import './CompanyList.css'
import './CompanyComponents.css'

function CompanyList({ companies, onSelect, selectedCompany }) {
  if (companies.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏢</div>
        <h3>No tienes empresas</h3>
        <p>Crea tu primera empresa para comenzar</p>
      </div>
    )
  }

  return (
    <div className="company-list">
      {companies.map((company) => (
        <div
          key={company.id}
          className={`company-card ${
            selectedCompany?.id === company.id ? 'selected' : ''
          }`}
          onClick={() => onSelect(company)}
        >
          <div className="company-card-header">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="company-logo" />
            ) : (
              <div className="company-logo-placeholder">🏢</div>
            )}
            <div className="company-info">
              <h4>{company.name}</h4>
              <p className="company-description">{company.description || 'Sin descripción'}</p>
            </div>
          </div>
          <div className="company-card-footer">
            <span className={`plan-badge plan-${company.subscriptionTier}`}>
              {company.subscriptionTier}
            </span>
            <span className="company-stats">
              {company.maxOffices} oficinas • {company.maxEmployees} empleados
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CompanyList

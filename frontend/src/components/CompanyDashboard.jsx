import { useState, useEffect } from 'react'
import { useCompanyStore } from '../store/companyStore'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import CompanyList from './CompanyList'
import OfficeList from './OfficeList'
import CompanyForm from './CompanyForm'
import OfficeForm from './OfficeForm'
import PermissionManager from './PermissionManager'
import './CompanyDashboard.css'

function CompanyDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('companies')
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showOfficeForm, setShowOfficeForm] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [selectedOffice, setSelectedOffice] = useState(null)

  const user = useAuthStore((state) => state.user)
  const companies = useCompanyStore((state) => state.companies)
  const currentCompany = useCompanyStore((state) => state.currentCompany)
  const offices = useCompanyStore((state) => state.offices)
  const loadCompanies = useCompanyStore((state) => state.loadCompanies)
  const loadOffices = useCompanyStore((state) => state.loadOffices)
  const setCurrentCompany = useCompanyStore((state) => state.setCurrentCompany)

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (currentCompany) {
      loadOffices(currentCompany.id)
    }
  }, [currentCompany])

  const handleCompanySelect = (company) => {
    setCurrentCompany(company)
    setActiveTab('offices')
  }

  const handleOfficeCreated = () => {
    setShowOfficeForm(false)
    if (currentCompany) {
      loadOffices(currentCompany.id)
    }
    useGameStore.getState().showToast('Oficina creada exitosamente', 'success')
  }

  const handleCompanyCreated = () => {
    setShowCompanyForm(false)
    loadCompanies()
    useGameStore.getState().showToast('Empresa creada exitosamente', 'success')
  }

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h2>🏢 Panel de Gestión</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <div className="user-info-sidebar">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>

            <nav className="dashboard-nav">
              <button
                className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
                onClick={() => setActiveTab('companies')}
              >
                🏢 Mis Empresas
              </button>
              <button
                className={`nav-item ${activeTab === 'offices' ? 'active' : ''}`}
                onClick={() => setActiveTab('offices')}
                disabled={!currentCompany}
              >
                🏠 Oficinas
              </button>
              <button
                className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
                disabled={!currentCompany}
              >
                📊 Estadísticas
              </button>
            </nav>

            {currentCompany && (
              <div className="current-company-info">
                <div className="company-badge">
                  <div className="company-name">{currentCompany.name}</div>
                  <div className="company-plan">{currentCompany.subscriptionTier}</div>
                </div>
                <div className="company-stats-mini">
                  <div>📍 {offices.length} oficinas</div>
                  <div>👥 {currentCompany.maxEmployees} empleados</div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="dashboard-main">
            {activeTab === 'companies' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h3>Mis Empresas</h3>
                  <button
                    className="btn-primary"
                    onClick={() => setShowCompanyForm(true)}
                  >
                    + Nueva Empresa
                  </button>
                </div>
                <CompanyList
                  companies={companies}
                  onSelect={handleCompanySelect}
                  selectedCompany={currentCompany}
                />
              </div>
            )}

            {activeTab === 'offices' && currentCompany && (
              <div className="tab-content">
                <div className="tab-header">
                  <h3>Oficinas de {currentCompany.name}</h3>
                  <button
                    className="btn-primary"
                    onClick={() => setShowOfficeForm(true)}
                  >
                    + Nueva Oficina
                  </button>
                </div>
                <OfficeList
                  offices={offices}
                  onManagePermissions={(office) => {
                    setSelectedOffice(office)
                    setShowPermissions(true)
                  }}
                />
              </div>
            )}

            {activeTab === 'stats' && currentCompany && (
              <div className="tab-content">
                <div className="tab-header">
                  <h3>Estadísticas</h3>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{offices.length}</div>
                    <div className="stat-label">Oficinas Totales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{currentCompany.maxEmployees}</div>
                    <div className="stat-label">Empleados Máx</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">{currentCompany.subscriptionTier}</div>
                    <div className="stat-label">Plan Actual</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-value">Activa</div>
                    <div className="stat-label">Estado</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showCompanyForm && (
          <CompanyForm
            onClose={() => setShowCompanyForm(false)}
            onSuccess={handleCompanyCreated}
          />
        )}

        {showOfficeForm && currentCompany && (
          <OfficeForm
            companyId={currentCompany.id}
            onClose={() => setShowOfficeForm(false)}
            onSuccess={handleOfficeCreated}
          />
        )}

        {showPermissions && selectedOffice && (
          <PermissionManager
            office={selectedOffice}
            onClose={() => {
              setShowPermissions(false)
              setSelectedOffice(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CompanyDashboard

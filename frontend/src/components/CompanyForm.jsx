import { useState, useEffect } from 'react'
import { useCompanyStore } from '../store/companyStore'
import { useAuthStore } from '../store/authStore'
import './CompanyForm.css'
import './CompanyComponents.css'

function CompanyForm({ onClose, onSuccess, company = null }) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    description: company?.description || '',
    logo: company?.logo || '',
    subscriptionTier: company?.subscriptionTier || 'basic'
  })
  const [errors, setErrors] = useState({})

  const user = useAuthStore((state) => state.user)
  const createCompany = useCompanyStore((state) => state.createCompany)
  const updateCompany = useCompanyStore((state) => state.updateCompany)
  const loading = useCompanyStore((state) => state.loading)

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      const companyData = {
        ...formData,
        ownerId: user.id
      }

      if (company) {
        await updateCompany(company.id, companyData)
      } else {
        await createCompany(companyData)
      }
      
      onSuccess()
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  const plans = [
    {
      tier: 'basic',
      name: 'Basic',
      price: '$99/mes',
      features: ['1 oficina', '5 empleados', '20 objetos 3D']
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$299/mes',
      features: ['3 oficinas', '20 empleados', '100 objetos 3D', 'Colores personalizados']
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      price: '$999/mes',
      features: ['Oficinas ilimitadas', 'Empleados ilimitados', 'Objetos ilimitados', 'Branding personalizado']
    }
  ]

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{company ? 'Editar Empresa' : 'Crear Nueva Empresa'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-group">
            <label>Nombre de la Empresa *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mi Empresa"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu empresa..."
              rows="3"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          <div className="form-group">
            <label>Plan de Suscripción *</label>
            <div className="plans-grid">
              {plans.map((plan) => (
                <div
                  key={plan.tier}
                  className={`plan-card ${formData.subscriptionTier === plan.tier ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, subscriptionTier: plan.tier })}
                >
                  <div className="plan-header">
                    <h4>{plan.name}</h4>
                    <div className="plan-price">{plan.price}</div>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="error-message-box">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : company ? 'Actualizar' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyForm

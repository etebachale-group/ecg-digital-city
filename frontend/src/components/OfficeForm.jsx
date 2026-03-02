import { useState, useEffect } from 'react'
import { useCompanyStore } from '../store/companyStore'
import { useGameStore } from '../store/gameStore'
import './OfficeForm.css'
import './CompanyComponents.css'

function OfficeForm({ companyId, onClose, onSuccess, office = null }) {
  const [formData, setFormData] = useState({
    name: office?.name || '',
    description: office?.description || '',
    districtId: office?.districtId || 2,
    position: office?.position || { x: 0, y: 0, z: 0 },
    size: office?.size || { width: 20, height: 3, depth: 20 },
    isPublic: office?.isPublic || false,
    maxCapacity: office?.maxCapacity || 10,
    theme: office?.theme || 'default',
    primaryColor: office?.primaryColor || '#3498db',
    secondaryColor: office?.secondaryColor || '#2c3e50'
  })
  const [errors, setErrors] = useState({})

  const districts = useGameStore((state) => state.districts)
  const createOffice = useCompanyStore((state) => state.createOffice)
  const updateOffice = useCompanyStore((state) => state.updateOffice)
  const loading = useCompanyStore((state) => state.loading)

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }
    
    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = 'La capacidad debe ser al menos 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      const officeData = {
        ...formData,
        companyId
      }

      if (office) {
        await updateOffice(office.id, officeData)
      } else {
        await createOffice(officeData)
      }
      
      onSuccess()
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h3>{office ? 'Editar Oficina' : 'Crear Nueva Oficina'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="office-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre de la Oficina *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Oficina Principal"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Distrito *</label>
              <select
                value={formData.districtId}
                onChange={(e) => setFormData({ ...formData, districtId: parseInt(e.target.value) })}
              >
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la oficina..."
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ancho (m)</label>
              <input
                type="number"
                value={formData.size.width}
                onChange={(e) => setFormData({
                  ...formData,
                  size: { ...formData.size, width: parseInt(e.target.value) }
                })}
                min="5"
                max="50"
              />
            </div>

            <div className="form-group">
              <label>Profundidad (m)</label>
              <input
                type="number"
                value={formData.size.depth}
                onChange={(e) => setFormData({
                  ...formData,
                  size: { ...formData.size, depth: parseInt(e.target.value) }
                })}
                min="5"
                max="50"
              />
            </div>

            <div className="form-group">
              <label>Capacidad Máxima</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                min="1"
                max="100"
                className={errors.maxCapacity ? 'error' : ''}
              />
              {errors.maxCapacity && <span className="error-message">{errors.maxCapacity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color Primario</label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Color Secundario</label>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              <span>Oficina Pública (cualquiera puede entrar)</span>
            </label>
          </div>

          {errors.submit && (
            <div className="error-message-box">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : office ? 'Actualizar' : 'Crear Oficina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OfficeForm

import { useState, useEffect } from 'react'
import { useCompanyStore } from '../store/companyStore'
import { useGameStore } from '../store/gameStore'
import './PermissionManager.css'
import './CompanyComponents.css'

function PermissionManager({ office, onClose }) {
  const [permissions, setPermissions] = useState([])
  const [newPermission, setNewPermission] = useState({
    userId: '',
    role: 'visitor',
    canEdit: false,
    canInvite: false
  })

  const loadPermissions = useCompanyStore((state) => state.loadPermissions)
  const createPermission = useCompanyStore((state) => state.createPermission)
  const deletePermission = useCompanyStore((state) => state.deletePermission)
  const loading = useCompanyStore((state) => state.loading)

  useEffect(() => {
    loadPermissionsData()
  }, [office.id])

  const loadPermissionsData = async () => {
    await loadPermissions(office.id)
    const perms = useCompanyStore.getState().permissions
    setPermissions(perms)
  }

  const handleAddPermission = async (e) => {
    e.preventDefault()
    
    if (!newPermission.userId) {
      useGameStore.getState().showToast('Ingresa un ID de usuario', 'error')
      return
    }

    try {
      await createPermission({
        ...newPermission,
        officeId: office.id
      })
      
      useGameStore.getState().showToast('Permiso agregado', 'success')
      loadPermissionsData()
      setNewPermission({
        userId: '',
        role: 'visitor',
        canEdit: false,
        canInvite: false
      })
    } catch (error) {
      useGameStore.getState().showToast(error.message, 'error')
    }
  }

  const handleDeletePermission = async (userId) => {
    if (!confirm('¿Eliminar este permiso?')) return

    try {
      await deletePermission(userId, office.id)
      useGameStore.getState().showToast('Permiso eliminado', 'success')
      loadPermissionsData()
    } catch (error) {
      useGameStore.getState().showToast(error.message, 'error')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      owner: '#e74c3c',
      admin: '#3498db',
      employee: '#2ecc71',
      visitor: '#95a5a6'
    }
    return colors[role] || '#95a5a6'
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h3>🔐 Gestión de Permisos - {office.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="permissions-content">
          {/* Formulario para agregar permiso */}
          <div className="add-permission-section">
            <h4>Agregar Nuevo Permiso</h4>
            <form onSubmit={handleAddPermission} className="add-permission-form">
              <input
                type="number"
                placeholder="ID de Usuario"
                value={newPermission.userId}
                onChange={(e) => setNewPermission({ ...newPermission, userId: e.target.value })}
              />
              
              <select
                value={newPermission.role}
                onChange={(e) => setNewPermission({ ...newPermission, role: e.target.value })}
              >
                <option value="visitor">Visitante</option>
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
                <option value="owner">Propietario</option>
              </select>

              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={newPermission.canEdit}
                  onChange={(e) => setNewPermission({ ...newPermission, canEdit: e.target.checked })}
                />
                <span>Puede Editar</span>
              </label>

              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={newPermission.canInvite}
                  onChange={(e) => setNewPermission({ ...newPermission, canInvite: e.target.checked })}
                />
                <span>Puede Invitar</span>
              </label>

              <button type="submit" className="btn-primary" disabled={loading}>
                + Agregar
              </button>
            </form>
          </div>

          {/* Lista de permisos */}
          <div className="permissions-list-section">
            <h4>Permisos Actuales ({permissions.length})</h4>
            
            {permissions.length === 0 ? (
              <div className="empty-state-small">
                <p>No hay permisos configurados</p>
              </div>
            ) : (
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Editar</th>
                    <th>Invitar</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm) => (
                    <tr key={`${perm.userId}-${perm.officeId}`}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">👤</div>
                          <div>
                            <div className="user-name-small">
                              {perm.user?.username || `Usuario ${perm.userId}`}
                            </div>
                            <div className="user-id-small">ID: {perm.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(perm.role) }}
                        >
                          {perm.role}
                        </span>
                      </td>
                      <td>
                        <span className={`permission-icon ${perm.canEdit ? 'yes' : 'no'}`}>
                          {perm.canEdit ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        <span className={`permission-icon ${perm.canInvite ? 'yes' : 'no'}`}>
                          {perm.canInvite ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-danger-small"
                          onClick={() => handleDeletePermission(perm.userId)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PermissionManager

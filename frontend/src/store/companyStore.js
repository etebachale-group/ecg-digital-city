import { create } from 'zustand'

const API_URL = 'http://localhost:3000/api'

export const useCompanyStore = create((set, get) => ({
  // Estado
  companies: [],
  currentCompany: null,
  offices: [],
  employees: [],
  permissions: [],
  loading: false,
  error: null,

  // Acciones de Empresas
  loadCompanies: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/companies`)
      const data = await response.json()
      set({ companies: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createCompany: async (companyData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      })
      const company = await response.json()
      set((state) => ({
        companies: [...state.companies, company],
        loading: false
      }))
      
      // Recargar progreso para actualizar XP
      const { useGamificationStore } = await import('./gamificationStore')
      const { useAuthStore } = await import('./authStore')
      const user = useAuthStore.getState().user
      if (user?.id) {
        useGamificationStore.getState().loadProgress(user.id)
      }
      
      return company
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateCompany: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const company = await response.json()
      set((state) => ({
        companies: state.companies.map((c) => (c.id === id ? company : c)),
        loading: false
      }))
      return company
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deleteCompany: async (id) => {
    set({ loading: true, error: null })
    try {
      await fetch(`${API_URL}/companies/${id}`, { method: 'DELETE' })
      set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  setCurrentCompany: (company) => {
    set({ currentCompany: company })
  },

  // Acciones de Oficinas
  loadOffices: async (companyId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/offices?companyId=${companyId}`)
      const data = await response.json()
      set({ offices: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createOffice: async (officeData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/offices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeData)
      })
      const office = await response.json()
      set((state) => ({
        offices: [...state.offices, office],
        loading: false
      }))
      
      // Recargar progreso para actualizar XP
      const { useGamificationStore } = await import('./gamificationStore')
      const { useAuthStore } = await import('./authStore')
      const user = useAuthStore.getState().user
      if (user?.id) {
        useGamificationStore.getState().loadProgress(user.id)
      }
      
      return office
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateOffice: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/offices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const office = await response.json()
      set((state) => ({
        offices: state.offices.map((o) => (o.id === id ? office : o)),
        loading: false
      }))
      return office
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deleteOffice: async (id) => {
    set({ loading: true, error: null })
    try {
      await fetch(`${API_URL}/offices/${id}`, { method: 'DELETE' })
      set((state) => ({
        offices: state.offices.filter((o) => o.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Acciones de Permisos
  loadPermissions: async (officeId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/permissions/office/${officeId}`)
      const data = await response.json()
      set({ permissions: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createPermission: async (permissionData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData)
      })
      const permission = await response.json()
      set((state) => ({
        permissions: [...state.permissions, permission],
        loading: false
      }))
      return permission
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deletePermission: async (userId, officeId) => {
    set({ loading: true, error: null })
    try {
      await fetch(`${API_URL}/permissions/${userId}/${officeId}`, { method: 'DELETE' })
      set((state) => ({
        permissions: state.permissions.filter(
          (p) => !(p.userId === userId && p.officeId === officeId)
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))

import { create } from 'zustand'

const API_URL = 'http://localhost:3000/api'

export const useGamificationStore = create((set, get) => ({
  // Estado
  progress: null,
  achievements: [],
  userAchievements: [],
  missions: [],
  userMissions: [],
  leaderboard: [],
  loading: false,
  error: null,
  levelUpData: null,
  achievementUnlocked: null,

  // Cargar progreso del usuario
  loadProgress: async (userId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/gamification/progress/${userId}`)
      const data = await response.json()
      set({ progress: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Agregar XP
  addXP: async (userId, xp, action) => {
    try {
      const response = await fetch(`${API_URL}/gamification/add-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, xp, action })
      })
      const data = await response.json()
      set({ progress: data.progress })
      
      // Si subió de nivel, mostrar modal
      if (data.leveledUp) {
        set({ levelUpData: { level: data.newLevel } })
      }
      
      return data
    } catch (error) {
      console.error('Error al agregar XP:', error)
    }
  },

  // Cerrar modal de subida de nivel
  closeLevelUpModal: () => {
    set({ levelUpData: null })
  },

  // Registrar login diario
  dailyLogin: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/gamification/daily-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      set({ progress: data.progress })
      return data
    } catch (error) {
      console.error('Error al registrar login:', error)
    }
  },

  // Cargar logros
  loadAchievements: async () => {
    try {
      const response = await fetch(`${API_URL}/achievements`)
      const data = await response.json()
      set({ achievements: data })
    } catch (error) {
      console.error('Error al cargar logros:', error)
    }
  },

  // Cargar logros del usuario
  loadUserAchievements: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/achievements/user/${userId}`)
      const data = await response.json()
      set({ userAchievements: data })
    } catch (error) {
      console.error('Error al cargar logros del usuario:', error)
    }
  },

  // Desbloquear logro
  unlockAchievement: async (userId, achievementId) => {
    try {
      const response = await fetch(`${API_URL}/achievements/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, achievementId })
      })
      const data = await response.json()
      
      // Actualizar lista de logros desbloqueados
      set((state) => ({
        userAchievements: [...state.userAchievements, data.userAchievement]
      }))
      
      return data
    } catch (error) {
      console.error('Error al desbloquear logro:', error)
    }
  },

  // Cargar misiones
  loadMissions: async () => {
    try {
      const response = await fetch(`${API_URL}/missions?isActive=true`)
      const data = await response.json()
      set({ missions: data })
    } catch (error) {
      console.error('Error al cargar misiones:', error)
    }
  },

  // Cargar misiones del usuario
  loadUserMissions: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/missions/user/${userId}`)
      const data = await response.json()
      set({ userMissions: data })
    } catch (error) {
      console.error('Error al cargar misiones del usuario:', error)
    }
  },

  // Asignar misiones diarias
  assignDailyMissions: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/missions/assign-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      set({ userMissions: data })
      return data
    } catch (error) {
      console.error('Error al asignar misiones:', error)
    }
  },

  // Actualizar progreso de misión
  updateMissionProgress: async (userId, missionId, progress) => {
    try {
      const response = await fetch(`${API_URL}/missions/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, missionId, progress })
      })
      const data = await response.json()
      
      // Actualizar en el estado
      set((state) => ({
        userMissions: state.userMissions.map((m) =>
          m.id === data.id ? data : m
        )
      }))
      
      return data
    } catch (error) {
      console.error('Error al actualizar progreso:', error)
    }
  },

  // Cargar leaderboard
  loadLeaderboard: async (limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/gamification/leaderboard?limit=${limit}`)
      const data = await response.json()
      set({ leaderboard: data })
    } catch (error) {
      console.error('Error al cargar leaderboard:', error)
    }
  },

  // Mostrar modal de level up
  showLevelUpModal: (level) => {
    set({ levelUpData: { level } })
  },

  // Cerrar modal de level up
  closeLevelUpModal: () => {
    set({ levelUpData: null })
  },

  // Mostrar achievement desbloqueado
  showAchievementUnlocked: (achievement) => {
    set({ achievementUnlocked: achievement })
  },

  // Cerrar achievement toast
  closeAchievementToast: () => {
    set({ achievementUnlocked: null })
  }
}))

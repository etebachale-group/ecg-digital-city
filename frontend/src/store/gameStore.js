import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Jugador local
  player: {
    id: null,
    username: null,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    district: 'central', // Fase 2: distrito actual
    officeId: null // Fase 2: oficina actual
  },
  
  // Otros jugadores online
  players: new Map(),
  
  // Chat
  messages: [],
  
  // UI
  showChat: false,
  selectedNPC: null,
  
  // Fase 2: Distritos
  districts: [],
  currentDistrict: null,
  
  // Fase 2: Oficinas
  currentOffice: null,
  officeObjects: [],
  
  // Fase 3: Toasts/Notificaciones
  toasts: [],
  
  // Acciones del jugador
  updatePlayerPosition: (position, rotation) => {
    set((state) => ({
      player: { ...state.player, position, rotation }
    }))
  },
  
  setPlayerDistrict: (district) => {
    set((state) => ({
      player: { ...state.player, district, officeId: null }
    }))
  },
  
  setPlayerOffice: (officeId) => {
    set((state) => ({
      player: { ...state.player, officeId }
    }))
  },
  
  // Acciones de otros jugadores
  addPlayer: (id, playerData) => {
    set((state) => {
      const newPlayers = new Map(state.players)
      newPlayers.set(id, playerData)
      return { players: newPlayers }
    })
  },
  
  removePlayer: (id) => {
    set((state) => {
      const newPlayers = new Map(state.players)
      newPlayers.delete(id)
      return { players: newPlayers }
    })
  },
  
  updatePlayer: (id, data) => {
    set((state) => {
      const newPlayers = new Map(state.players)
      const player = newPlayers.get(id)
      if (player) {
        newPlayers.set(id, { ...player, ...data })
      }
      return { players: newPlayers }
    })
  },
  
  // Chat
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },
  
  toggleChat: () => {
    set((state) => ({ showChat: !state.showChat }))
  },
  
  // NPCs
  selectNPC: (npc) => {
    set({ selectedNPC: npc })
  },
  
  closeNPCDialog: () => {
    set({ selectedNPC: null })
  },
  
  // Fase 2: Distritos
  setDistricts: (districts) => {
    set({ districts })
  },
  
  setCurrentDistrict: (district) => {
    set({ currentDistrict: district })
  },
  
  // Fase 2: Oficinas
  setCurrentOffice: (office) => {
    set({ currentOffice: office })
  },
  
  setOfficeObjects: (objects) => {
    set({ officeObjects: objects })
  },
  
  addOfficeObject: (object) => {
    set((state) => ({
      officeObjects: [...state.officeObjects, object]
    }))
  },
  
  updateOfficeObject: (objectId, updates) => {
    set((state) => ({
      officeObjects: state.officeObjects.map(obj =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      )
    }))
  },
  
  removeOfficeObject: (objectId) => {
    set((state) => ({
      officeObjects: state.officeObjects.filter(obj => obj.id !== objectId)
    }))
  },
  
  // Fase 3: Sistema de Toasts
  addToast: (toast) => {
    const id = Date.now() + Math.random()
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }))
  },
  
  showToast: (message, type = 'info', title = null) => {
    get().addToast({ message, type, title })
  }
}))

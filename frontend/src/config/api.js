// API configuration
// In production, use same origin (empty string)
// In development, use localhost:3000
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin
export const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin

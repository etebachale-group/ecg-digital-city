import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import './Toast.css'

function Toast() {
  const toasts = useGameStore((state) => state.toasts)
  const removeToast = useGameStore((state) => state.removeToast)

  useEffect(() => {
    // Auto-remover toasts después de 3 segundos
    toasts.forEach((toast) => {
      if (!toast.timeout) {
        toast.timeout = setTimeout(() => {
          removeToast(toast.id)
        }, 3000)
      }
    })
  }, [toasts, removeToast])

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast

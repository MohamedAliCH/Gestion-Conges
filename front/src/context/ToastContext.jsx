import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast])
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast])
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast])
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast])

  const toast = { success, error, warning, info }

  const getIconClass = (type) => {
    switch (type) {
      case 'success': return 'ti ti-circle-check-filled text-success'
      case 'error': return 'ti ti-circle-x-filled text-danger'
      case 'warning': return 'ti ti-alert-triangle-filled text-warning'
      case 'info': return 'ti ti-info-circle-filled text-info'
      default: return 'ti ti-info-circle'
    }
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`custom-toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
          >
            <div className="toast-icon">
              <i className={getIconClass(t.type)} />
            </div>
            <div className="toast-content">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              <i className="ti ti-x" />
            </button>
            <div
              className="toast-progress"
              style={{ animationDuration: `${t.duration}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

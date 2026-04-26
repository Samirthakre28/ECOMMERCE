import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrapper">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}
               style={{ color: toast.type === 'success' ? 'var(--accent-red)' : toast.type === 'error' ? '#ef4444' : 'var(--text-primary)', fontSize: '18px' }}
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

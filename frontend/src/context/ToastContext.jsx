import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Item Component
const ToastItem = ({ toast, onClose }) => {
  const { message, type } = toast;

  const styles = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-500/10 dark:bg-red-500/20 border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400',
      icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400',
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
    },
  };

  const activeStyle = styles[type] || styles.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 animate-slide-in ${activeStyle.bg}`}
      role="alert"
    >
      {activeStyle.icon}
      <div className="flex-1 text-sm font-medium leading-5">{message}</div>
      <button
        onClick={onClose}
        className="text-textMuted hover:text-text hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

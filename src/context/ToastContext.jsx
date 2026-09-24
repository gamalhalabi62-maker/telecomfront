import { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none px-4 w-full max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const config = {
    success: {
      icon: <FaCheckCircle />,
      bg: 'bg-gradient-to-l from-green-500 to-green-600',
      iconBg: 'bg-white/20',
    },
    error: {
      icon: <FaExclamationCircle />,
      bg: 'bg-gradient-to-l from-red-500 to-red-600',
      iconBg: 'bg-white/20',
    },
    info: {
      icon: <FaInfoCircle />,
      bg: 'bg-gradient-to-l from-primary to-primary-dark',
      iconBg: 'bg-white/20',
    },
    warning: {
      icon: <FaExclamationTriangle />,
      bg: 'bg-gradient-to-l from-yellow-500 to-orange-500',
      iconBg: 'bg-white/20',
    },
  };

  const { icon, bg, iconBg } = config[toast.type] || config.info;

  return (
    <div
      className={`${bg} text-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-in-top`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        <p className="flex-1 font-bold text-sm leading-relaxed">{toast.message}</p>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10"
        >
          <FaTimes />
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="h-1 bg-white/30">
          <div
            className="h-full bg-white"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ToastProvider;
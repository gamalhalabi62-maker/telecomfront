import { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary',
  };

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] ${colors[type]} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-top`}>
      <FaCheckCircle className="text-xl" />
      <span className="font-bold">{message}</span>
    </div>
  );
};

export default Toast;
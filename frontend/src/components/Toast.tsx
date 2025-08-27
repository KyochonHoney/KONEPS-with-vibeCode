import React, { useEffect, useState } from 'react';
import { ToastType } from './ToastProvider';

export type ToastProps = {
  message: string;
  type: ToastType;
  onDismiss: () => void;
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Animation duration
  };

  const bgColor = toastStyles[type] ?? toastStyles.info;

  return (
    <div
      role="alert"
      className={`transform transition-all duration-300 ease-in-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between max-w-sm w-full`}
    >
      <span>{message}</span>
      <button onClick={handleDismiss} className="ml-4 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
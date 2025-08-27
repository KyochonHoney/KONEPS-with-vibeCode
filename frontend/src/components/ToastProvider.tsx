import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import Toast, { ToastProps } from './Toast';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type ToastInput = Omit<ToastMessage, 'id'>;

interface ToastContextType {
  push: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  }, []);

  useEffect(() => {
    // Expose push function to window for easy testing from console
    (window as any).__toast = { push };
    return () => {
      delete (window as any).__toast;
    };
  }, [push]);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="assertive" className="fixed inset-0 flex flex-col items-end px-4 py-6 space-y-2 pointer-events-none sm:p-6 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
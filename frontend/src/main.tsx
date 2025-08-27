alert(1);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { ToastProvider } from './components/ToastProvider.tsx';
import ConfirmProvider from './components/ConfirmDialog.tsx';
import { AuthProvider } from './store/auth.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <ConfirmProvider>
                <App />
              </ConfirmProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
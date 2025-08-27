import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UserManagementPage from '../UserManagementPage';
import { ThemeProvider } from '../../../components/ThemeProvider';
import { ToastProvider } from '../../../components/ToastProvider';
import ConfirmProvider from '../../../components/ConfirmDialog';

// React Query 및 라우터를 위한 mock
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ThemeProvider>
            <ToastProvider>
              <ConfirmProvider>
                {children}
              </ConfirmProvider>
            </ToastProvider>
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
};

// API 모킹 - 빈 사용자 목록 반환
vi.mock('../../../services/api', () => ({
  fetchUsers: vi.fn().mockResolvedValue({
    data: [],
    meta: { page: 1, size: 10, total: 0, totalPages: 1 }
  }),
  updateUser: vi.fn().mockResolvedValue({})
}));

describe('UserManagementPage', () => {
  it('renders without crashing and shows loading state', async () => {
    const TestWrapper = createTestWrapper();
    
    render(
      <TestWrapper>
        <UserManagementPage />
      </TestWrapper>
    );

    // 초기 로딩 상태 확인 (API 호출 중)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    
    // Toast 컨테이너가 존재하는지 확인 (aria-live 속성으로)
    const toastContainers = document.querySelectorAll('[aria-live="assertive"]');
    expect(toastContainers.length).toBeGreaterThan(0);
  });
});
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastProvider';

function TestComponent() {
  const toast = useToast();
  
  return (
    <div>
      <div>ok</div>
      <button onClick={() => toast.push({ type: 'success', message: 'hello' })}>
        Add Toast
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('renders children and provides toast context', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // 컴포넌트가 렌더되는지 확인
    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(screen.getByText('Add Toast')).toBeInTheDocument();
    
    // Toast 컨테이너가 존재하는지 확인
    const toastContainer = document.querySelector('[aria-live="assertive"]');
    expect(toastContainer).toBeInTheDocument();
  });
});
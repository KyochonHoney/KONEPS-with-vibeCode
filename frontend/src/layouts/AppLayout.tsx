import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface AppLayoutProps {
  children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Placeholder for Phoenix Admin Header/Topbar */}
      <header style={{ background: '#333', color: '#fff', padding: '1rem', textAlign: 'center' }}>
        <h1>App Header (Phoenix Admin)</h1>
      </header>

      <div style={{ display: 'flex', flexGrow: 1 }}>
        {/* Placeholder for Phoenix Admin Sidebar */}
        <aside style={{ background: '#555', color: '#fff', width: '200px', padding: '1rem' }}>
          <nav>
            <ul>
              <li><a href="/bids" style={{ color: '#fff' }}>Bids</a></li>
              <li><a href="/favorites" style={{ color: '#fff' }}>Favorites</a></li>
              <li><a href="/admin/users" style={{ color: '#fff' }}>Users (Admin)</a></li>
            </ul>
          </nav>
        </aside>

        <main style={{ flexGrow: 1, padding: '1rem' }}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Placeholder for Phoenix Admin Footer */}
      <footer style={{ background: '#333', color: '#fff', padding: '1rem', textAlign: 'center' }}>
        <p>&copy; 2023 Your Company</p>
      </footer>
    </div>
  );
};

export default AppLayout;
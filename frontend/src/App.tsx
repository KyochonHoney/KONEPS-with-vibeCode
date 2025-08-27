import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import BidListPage from './pages/Bids/BidListPage';
import BidDetailPage from './pages/Bids/BidDetailPage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import UserManagementPage from './pages/Admin/UserManagementPage'; // Import UserManagementPage
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

function App() {
  return (
    <Routes>
      {/* Public routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes with AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/bids" element={<BidListPage />} />
        <Route path="/bids/:id" element={<BidDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        {/* Superadmin only route */}
        <Route element={<RoleGuard allowedRoles={['superadmin']} />}>
          <Route path="/admin/users" element={<UserManagementPage />} /> {/* Use UserManagementPage */}
        </Route>
      </Route>

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
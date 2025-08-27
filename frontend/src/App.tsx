import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import BidListPage from './pages/Bids/BidListPage'; // Import BidListPage
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

// Placeholder pages - will be implemented in later steps
const FavoritesPage = () => <div>Favorites Page (Protected)</div>;
const UserManagementPage = () => <div>User Management Page (Superadmin Only)</div>;

function App() {
  return (
    <Routes>
      {/* Public routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes with AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/bids" element={<BidListPage />} /> {/* Use BidListPage */}
        <Route path="/favorites" element={<FavoritesPage />} />
        {/* Superadmin only route */}
        <Route element={<RoleGuard allowedRoles={['superadmin']} />}>
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
      </Route>

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
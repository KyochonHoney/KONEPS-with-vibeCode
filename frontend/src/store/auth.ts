import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'user' | 'superadmin';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const { accessToken, refreshToken, role } = JSON.parse(storedAuth);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setRole(role);
      setIsAuthenticated(!!accessToken);
    }
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string, newRole: UserRole) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setRole(newRole);
    setIsAuthenticated(true);
    localStorage.setItem('auth', JSON.stringify({ accessToken: newAccessToken, refreshToken: newRefreshToken, role: newRole }));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
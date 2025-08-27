import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const accessToken = authData.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 Unauthorized and it's not the login or refresh endpoint
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const refreshToken = authData.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = response.data.accessToken;

          // Update tokens in localStorage
          localStorage.setItem('auth', JSON.stringify({ ...authData, accessToken: newAccessToken }));

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, clear auth data and redirect to login
          localStorage.removeItem('auth');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('auth');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// User management API functions
export const fetchUsers = async (params: {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateUser = async (id: string, data: {
  role?: 'user' | 'superadmin';
  status?: 'active' | 'locked';
}) => {
  const response = await api.patch(`/admin/users/${id}`, data);
  return response.data;
};

export default api;
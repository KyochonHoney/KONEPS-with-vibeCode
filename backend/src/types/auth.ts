export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role_id: number;
  status: 'active' | 'inactive' | 'locked';
  last_login_at?: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithRole extends User {
  role_name: string;
}

export interface RefreshTokenRecord {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}
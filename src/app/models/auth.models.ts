export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  expiresInSeconds: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export type AuthMode = 'login' | 'register';

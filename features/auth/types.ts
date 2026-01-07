export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lastLoggedInAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

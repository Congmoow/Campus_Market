export interface User {
  id: number;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  coverImage?: string;
  role: 'STUDENT' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  campus?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}


// src/interfaces/auth.ts
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient';
  token: string;
  profileImage?: string;
}

export interface Pending2FA {
  userId?: string;
  email: string;
  role: 'doctor' | 'patient';
}
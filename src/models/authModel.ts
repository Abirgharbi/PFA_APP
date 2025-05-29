export interface User {
  fullName: string;
  email: string;
  password: string;
  role?: 'patient' | 'doctor'; // Optional role
}

export interface LoginData {
  email: string;
  password: string;
}
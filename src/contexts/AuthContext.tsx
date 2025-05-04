// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { verifyTwoFactorCodeAPI, generateTwoFactorCodeAPI } from '@/services/authService';

type Pending2FA = {
  userId?: string; // Make optional
  email: string;
  role: 'doctor' | 'patient';
};

type AuthContextType = {
  pendingTwoFactorAuth: Pending2FA | null;
  setPendingTwoFactorAuth: (data: Pending2FA | null) => void;
  verifyTwoFactorCode: (userId: string, code: string) => Promise<boolean>;
  generateTwoFactorCode: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingTwoFactorAuth, setPendingTwoFactorAuth] = useState<Pending2FA | null>(null);

  const verifyTwoFactorCode = async (userId: string, code: string): Promise<boolean> => {
    return await verifyTwoFactorCodeAPI(userId, code);
  };

  const generateTwoFactorCode = async (userId: string): Promise<void> => {
    await generateTwoFactorCodeAPI(userId);
  };

  return (
    <AuthContext.Provider value={{ pendingTwoFactorAuth, setPendingTwoFactorAuth, verifyTwoFactorCode, generateTwoFactorCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

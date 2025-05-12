import React, { createContext, useContext, useEffect, useState } from 'react';
import { verifyTwoFactorCodeAPI, generateTwoFactorCodeAPI } from '@/services/authService';
import { Preferences } from '@capacitor/preferences'; // For React Native or web fallback

type Pending2FA = {
  userId?: string;
  email: string;
  role: 'doctor' | 'patient';
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient';
  token: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isDoctor: boolean;
  loginUser: (user: AuthUser) => void;
  logoutUser: () => void;
  pendingTwoFactorAuth: Pending2FA | null;
  setPendingTwoFactorAuth: (data: Pending2FA | null) => void;
  verifyTwoFactorCode: (email: string, code: string) => Promise<boolean>;
  generateTwoFactorCode: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingTwoFactorAuth, setPendingTwoFactorAuth] = useState<Pending2FA | null>(null);
  const [loading, setLoading] = useState(true); // To handle the loading state when fetching from storage

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await Preferences.get({ key: 'authUser' }); // React Native or web fallback
        if (storedUser.value) {
          setUser(JSON.parse(storedUser.value)); // Parse and set user
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const loginUser = async (userData: AuthUser) => {
    try {
      await Preferences.set({ key: 'authUser', value: JSON.stringify(userData) }); // Save user in Preferences
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await Preferences.remove({ key: 'authUser' }); // Remove user from Preferences
      setUser(null);
      setPendingTwoFactorAuth(null);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  };

  const verifyTwoFactorCode = async (email: string, code: string): Promise<boolean> => {
    try {
      return await verifyTwoFactorCodeAPI(email, code);
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
  };

  const generateTwoFactorCode = async (email: string): Promise<void> => {
    try {
      await generateTwoFactorCodeAPI(email);
    } catch (error) {
      console.error('Error generating 2FA code:', error);
    }
  };

  const isAuthenticated = !!user;
  const isDoctor = user?.role === 'doctor';

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner or other UI
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isDoctor,
        loginUser,
        logoutUser,
        pendingTwoFactorAuth,
        setPendingTwoFactorAuth,
        verifyTwoFactorCode,
        generateTwoFactorCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

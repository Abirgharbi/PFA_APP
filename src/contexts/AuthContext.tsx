import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  verifyTwoFactorCodeAPI,
  generateTwoFactorCodeAPI,
} from '@/services/authService';
import { Preferences } from '@capacitor/preferences';

type Pending2FA = {
  userId?: string;
  email: string;
  role: 'doctor' | 'patient';
};

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient';
  token: string;
  profileImage?: string;
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
  const [loading, setLoading] = useState(true);

  // Move this function OUTSIDE of useEffect
  const loadUserData = async () => {
    try {
      const [emailRes, nameRes, tokenRes, roleRes, idRes] = await Promise.all([
        Preferences.get({ key: 'userEmail' }),
        Preferences.get({ key: 'userName' }),
        Preferences.get({ key: 'userToken' }),
        Preferences.get({ key: 'userRole' }),
        Preferences.get({ key: 'userId' }),
      ]);
      const email = emailRes.value;
      const name = nameRes.value;
      const token = tokenRes.value;
      const role = roleRes.value as 'doctor' | 'patient';
      const _id = idRes.value || '';
      if (token) {
        const loadedUser: AuthUser = {
          _id,
          email,
          name,
          token,
          role,
        };
        setUser(loadedUser);
      }
    } catch (error) {
      console.error('Error loading user data from Preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loginUser = async (userData: AuthUser) => {
    try {
      await Promise.all([
        Preferences.set({ key: 'userEmail', value: userData.email }),
        Preferences.set({ key: 'userName', value: userData.name }),
        Preferences.set({ key: 'userToken', value: userData.token }),
        Preferences.set({ key: 'userRole', value: userData.role }),
        Preferences.set({ key: 'userId', value: userData._id }),
        console.log(userData)
      ]);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await Promise.all([
        Preferences.remove({ key: 'userEmail' }),
        Preferences.remove({ key: 'userName' }),
        Preferences.remove({ key: 'userToken' }),
        Preferences.remove({ key: 'userRole' }),
        Preferences.remove({ key: 'userId' }),
      ]);
      setUser(null);
      setPendingTwoFactorAuth(null);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  };

  const verifyTwoFactorCode = async (email: string, code: string): Promise<boolean> => {
    try {
      const verified = await verifyTwoFactorCodeAPI(email, code);
      if (verified) {
        await loadUserData();
        console.log("loadit") // Now accessible
      }
      return verified;
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

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isDoctor = useMemo(() => user?.role === 'doctor', [user]);

  if (loading) {
    return <div>Loading authentication...</div>;
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define user types
export type UserRole = "doctor" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  twoFactorEnabled?: boolean;
}

// Mock users for demo
const mockUsers = [
  {
    id: "d1",
    email: "doctor@example.com",
    password: "doctor123",
    name: "Dr. Sarah Johnson",
    role: "doctor" as UserRole,
    profileImage: "https://i.pravatar.cc/300?img=1",
    twoFactorEnabled: true
  },
  {
    id: "d2",
    email: "doctor2@example.com",
    password: "doctor123",
    name: "Dr. Michael Chen",
    role: "doctor" as UserRole,
    profileImage: "https://i.pravatar.cc/300?img=3",
    twoFactorEnabled: true
  },
  {
    id: "p1",
    email: "patient@example.com",
    password: "patient123",
    name: "Alex Rodriguez",
    role: "patient" as UserRole,
    profileImage: "https://i.pravatar.cc/300?img=2",
    twoFactorEnabled: true
  }
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean; requireTwoFactor?: boolean; tempUserId?: string}>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  verifyTwoFactorCode: (userId: string, code: string) => Promise<boolean>;
  generateTwoFactorCode: (userId: string) => Promise<string>;
  pendingTwoFactorAuth: {userId: string, email: string} | null;
  setPendingTwoFactorAuth: (data: {userId: string, email: string} | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingTwoFactorAuth, setPendingTwoFactorAuth] = useState<{userId: string, email: string} | null>(null);
  const [twoFactorCodes, setTwoFactorCodes] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const generateTwoFactorCode = async (userId: string): Promise<string> => {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code in our state (in a real app, this would be done on the server)
    setTwoFactorCodes(prev => ({
      ...prev,
      [userId]: code
    }));
    
    // In a real application, this would send an email
    console.log(`Two-factor code for user ${userId}: ${code}`);
    
    return code;
  };

  const verifyTwoFactorCode = async (userId: string, code: string): Promise<boolean> => {
    // Check if the code matches
    const storedCode = twoFactorCodes[userId];
    
    if (storedCode && storedCode === code) {
      // Find the user
      const foundUser = mockUsers.find(u => u.id === userId);
      
      if (foundUser) {
        // Remove the password and complete authentication
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        
        // Clear the pending 2FA
        setPendingTwoFactorAuth(null);
        
        // Remove the used code
        const { [userId]: _, ...restCodes } = twoFactorCodes;
        setTwoFactorCodes(restCodes);
        
        toast.success(`Welcome back, ${userWithoutPassword.name}!`);
        return true;
      }
    }
    
    toast.error("Invalid verification code");
    return false;
  };

  const login = async (email: string, password: string): Promise<{success: boolean; requireTwoFactor?: boolean; tempUserId?: string}> => {
    // Mock authentication logic
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      if (foundUser.twoFactorEnabled) {
        // If 2FA is enabled, we need to verify
        setPendingTwoFactorAuth({ userId: foundUser.id, email: foundUser.email });
        
        // Generate and "send" a code
        await generateTwoFactorCode(foundUser.id);
        
        // In a real app, we would send an email here
        toast.success(`Verification code sent to ${foundUser.email}`);
        
        return { 
          success: true, 
          requireTwoFactor: true,
          tempUserId: foundUser.id
        };
      }
      
      // If no 2FA, proceed with normal login
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
      return { success: true };
    }

    toast.error("Invalid email or password");
    return { success: false };
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    // Check if email is already in use
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error("Email already in use");
      return false;
    }

    // In a real app, you'd send this to your backend and get a response
    const newUser = {
      id: `${role[0]}${mockUsers.length + 1}`,
      email,
      name,
      role,
      profileImage: `https://i.pravatar.cc/300?img=${mockUsers.length + 10}`,
      twoFactorEnabled: true
    };

    // Add to mock users (in a real app, this would be handled by the backend)
    mockUsers.push({ ...newUser, password });

    // Log the user in
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    toast.success("Registration successful!");
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast.info("You've been logged out");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isDoctor: user?.role === "doctor",
        isPatient: user?.role === "patient",
        verifyTwoFactorCode,
        generateTwoFactorCode,
        pendingTwoFactorAuth,
        setPendingTwoFactorAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

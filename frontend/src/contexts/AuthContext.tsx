import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/AuthService';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && AuthService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
    
    // Set up token refresh timer
    const refreshInterval = setInterval(async () => {
      if (AuthService.isAuthenticated()) {
        try {
          await AuthService.refreshAccessToken();
        } catch (error) {
          // Token refresh failed, user will be logged out on next API call
        }
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  const signIn = async (username: string, password: string) => {
    const result = await AuthService.login({ username, password });
    setUser(result.user);
  };

  const signOut = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

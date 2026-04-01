import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { setAccessToken, isTokenExpired, getTokenTimeRemaining } from '../services/authTokenManager';
import { setAuthFailureHandler } from '../services/api';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();
        
        // Check if token is expired
        if (storedToken && isTokenExpired(storedToken)) {
          console.warn('Stored token is expired');
          // Redirect to OTP verification
          if (storedUser?.email) {
            window.location.href = `/login?tokenExpired=true&email=${encodeURIComponent(storedUser.email)}`;
          } else {
            window.location.href = '/login';
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setToken(storedToken);
          setUser(storedUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Monitor token expiration
  useEffect(() => {
    if (!token || !user) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        console.warn('Token has expired');
        logout();
        // Redirect to OTP verification
        window.location.href = `/login?tokenExpired=true&email=${encodeURIComponent(user.email)}`;
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Normalize user ID - ensure we have _id for consistency
    const normalizedUser = {
      ...newUser,
      _id: newUser._id || newUser.id,
      role: newUser.role || 'user',
      isVerified: newUser.isVerified !== undefined ? newUser.isVerified : true
    };
    
    setToken(newToken);
    setUser(normalizedUser);
    setAccessToken(newToken);
    authService.setAuthData(newToken, normalizedUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAccessToken(null);
    authService.logout();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

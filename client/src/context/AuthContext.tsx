import React, { useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { AuthContext } from './authContextDef';
import type { User, AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore user session on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User }>('/auth/me');
        setUser(data.user);
        setToken(storedToken);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user?: User; role?: string }>('/auth/login', { email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);

    if (res.user) {
      setUser(res.user);
    } else {
      setUser({ id: 0, email, role: res.role || 'student' });
    }
  };

  const register = async (email: string, password: string, role?: string) => {
    const res = await api.post<{ token: string; user?: User; role?: string }>('/auth/register', { email, password, role });
    localStorage.setItem('token', res.token);
    setToken(res.token);

    if (res.user) {
      setUser(res.user);
    } else {
      setUser({ id: 0, email, role: res.role || 'student' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

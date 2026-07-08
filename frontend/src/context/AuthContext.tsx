import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/utils/api';

type UserProfile = {
  id: number;
  email: string;
  full_name?: string | null;
  role: string;
  is_active?: boolean;
  created_at?: string;
};

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = 'medical-dashboard-token';
const AUTH_USER_KEY = 'medical-dashboard-user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const [loading, setLoading] = useState(true);

  const persistAuth = (tokenValue: string, userValue: UserProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, tokenValue);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userValue));
    }
    setToken(tokenValue);
    setUser(userValue);
    apiClient.setToken(tokenValue);
  };

  const clearAuth = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    setToken(null);
    setUser(null);
    apiClient.clearToken();
  };

  useEffect(() => {
    apiClient.setToken(token);
    const initialize = async () => {
      if (token && !user) {
        try {
          const profile = await apiClient.getProfile();
          setUser(profile);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
        } catch (_error) {
          clearAuth();
        }
      }
      setLoading(false);
    };
    initialize();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    persistAuth(response.access_token, response.user);
    router.push('/patients');
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    await apiClient.register(email, password, fullName, role);
    await login(email, password);
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const refreshProfile = async () => {
    if (!token) return;
    const profile = await apiClient.getProfile();
    setUser(profile);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

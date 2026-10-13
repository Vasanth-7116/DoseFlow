import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('doseflow_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('doseflow_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount if token exists
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const storedToken = localStorage.getItem('doseflow_token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        if (isMounted && res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('doseflow_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        if (isMounted) {
          localStorage.removeItem('doseflow_token');
          localStorage.removeItem('doseflow_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success && res.token) {
      localStorage.setItem('doseflow_token', res.token);
      localStorage.setItem('doseflow_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await registerUser(userData);
    if (res.success && res.token) {
      localStorage.setItem('doseflow_token', res.token);
      localStorage.setItem('doseflow_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('doseflow_token');
    localStorage.removeItem('doseflow_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      logout
    }),
    [user, token, isAuthenticated, isAdmin, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

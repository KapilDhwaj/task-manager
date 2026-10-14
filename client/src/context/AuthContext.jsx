import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read stored user immediately from localStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Read stored token immediately from localStorage
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });

  // If both token and user are already present in localStorage, we can render immediately without blocking
  const [loading, setLoading] = useState(() => {
    try {
      const hasToken = !!localStorage.getItem('token');
      const hasUser = !!localStorage.getItem('user');
      return !hasToken || !hasUser;
    } catch {
      return true;
    }
  });

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
  }, []);

  const login = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    try {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Failed writing to localStorage:', e);
    }
    setLoading(false);
  }, []);

  // Background token verification on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    api.get('/auth/me')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // ONLY log out if the backend explicitly rejected the token as invalid or expired (401 or 403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        } else {
          // If network error, 500, or Render is waking up from sleep, DO NOT log out!
          // Retain the cached user session from localStorage so the user is not kicked out.
          console.warn('Could not re-verify with server (network/server status), retaining cached session:', err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

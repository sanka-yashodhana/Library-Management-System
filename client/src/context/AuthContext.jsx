import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/auth.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rehydrate from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (token, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const login = async (email, password, role, rememberMe) => {
    try {
      const response = await authApi.login(email, password, role);
      if (response.success) {
        persistSession(response.token, response.user, rememberMe);
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        persistSession(response.token, response.user, true); // always remember on register
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'student':   return '/student/dashboard';
      case 'librarian': return '/librarian/dashboard';
      case 'admin':     return '/admin/dashboard';
      default:          return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, register, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

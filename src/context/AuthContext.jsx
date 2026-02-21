import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // Immediately restore user from localStorage so app feels instant
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      // Background verify — use AbortController so unmount doesn't throw
      const controller = new AbortController();
      try {
        const response = await axios.get('https://webale-api.onrender.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.data.success) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
          // Request aborted on unmount — not an error, ignore silently
          return;
        }
        if (error.response?.status === 401) {
          logout();
        }
        // Any other network error: stay logged in from localStorage
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await axios.post('https://webale-api.onrender.com/api/auth/login', {
      email,
      password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.data.message };
  };

  const register = async (userData) => {
    const response = await axios.post('https://webale-api.onrender.com/api/auth/register', userData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.data.message };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;

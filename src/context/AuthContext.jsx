import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Normalize user fields to snake_case regardless of what backend returns
function normalizeUser(u) {
  if (!u) return u;
  const first = u.first_name || u.firstName || u.first || "";
  const last  = u.last_name  || u.lastName  || u.last  || "";
  return {
    ...u,
    first_name:  first,
    last_name:   last,
    // Keep camelCase copies too so any component can read either
    firstName:   first,
    lastName:    last,
    avatar_url:  u.avatar_url  || u.avatarUrl  || "",
    avatar_type: u.avatar_type || u.avatarType || "",
    created_at:  u.created_at  || u.createdAt  || "",
    last_active: u.last_active || u.lastActive || "",
  };
}


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
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
        setIsAuthenticated(true);
        
        // Optionally verify token with backend
        const response = await axios.get('https://webale-api.onrender.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // Merge /me response with existing stored user — keeps fields even if /me omits them
          const existing = normalizeUser(JSON.parse(storedUser));
          const fresh    = response.data.data?.user || response.data.data || {};
          const merged   = normalizeUser({ ...existing, ...fresh });
          // Only update if we actually got meaningful data back
          if (merged.first_name || merged.email) {
            setUser(merged);
            localStorage.setItem('user', JSON.stringify(merged));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be invalid, clear storage
        if (error.response?.status === 401) {
          logout();
        }
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
      const normalized = normalizeUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalized));
      setUser(normalized);
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
      // OTP flow — no token yet, verification required
      if (response.data.data?.requiresVerification) {
        return { success: true, requiresVerification: true, email: response.data.data.email };
      }
      // Legacy direct-login flow (fallback)
      const { token, user } = response.data.data;
      if (token && user) {
        const normalized = normalizeUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
        setIsAuthenticated(true);
      }
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

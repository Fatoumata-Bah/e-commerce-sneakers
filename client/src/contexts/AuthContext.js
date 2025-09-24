import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getProfile()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      const anonymousCart = localStorage.getItem('anonymousCart');
      const hasAnonymousItems = anonymousCart && JSON.parse(anonymousCart).items.length > 0;
      
      return { success: true, hasAnonymousCart: hasAnonymousItems };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      const anonymousCart = localStorage.getItem('anonymousCart');
      const hasAnonymousItems = anonymousCart && JSON.parse(anonymousCart).items.length > 0;
      
      return { success: true, hasAnonymousCart: hasAnonymousItems };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = (onLogoutComplete) => {
    localStorage.removeItem('token');
    setUser(null);
    // Callback pour redirection après déconnexion
    if (onLogoutComplete) {
      onLogoutComplete();
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isSeller = () => user?.role === 'seller' || user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isSeller,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

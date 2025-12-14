import React, { createContext, useContext, useState, useEffect } from 'react';
import { initSocket, disconnectSocket } from '../socket/socket';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize socket when token is set
  useEffect(() => {
    if (token) {
      initSocket(token);
    }
  }, [token]);

  /**
   * Login user
   */
  const login = async (mail, password) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(mail, password);
      console.log('Login response:', response.data);
      
      // Handle different response structures
      const newToken = response.data.token || response.data.data?.token;
      const userData = response.data.user || response.data.data?.user || { mail };

      if (!newToken) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

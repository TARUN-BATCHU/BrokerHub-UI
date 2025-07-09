import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const brokerId = localStorage.getItem('brokerId');
      const brokerName = localStorage.getItem('brokerName');
      const userName = localStorage.getItem('userName');

      if (token && brokerId) {
        setIsAuthenticated(true);
        setUser({
          brokerId: parseInt(brokerId),
          brokerName,
          userName,
          token
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setError(null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.loginBroker(credentials);
      
      // Verify we have the required data
      const token = localStorage.getItem('authToken');
      const brokerId = localStorage.getItem('brokerId');
      const brokerName = localStorage.getItem('brokerName');
      const userName = localStorage.getItem('userName');
      
      if (!token || !brokerId) {
        throw new Error('Login failed - missing authentication data');
      }

      setIsAuthenticated(true);
      setUser({
        brokerId: parseInt(brokerId),
        brokerName,
        userName,
        token
      });
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    try {
      authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update local user data
      const updatedProfile = { ...user, ...profileData };
      setUser(updatedProfile);
      
      // Update localStorage if needed
      if (profileData.brokerName) {
        localStorage.setItem('brokerName', profileData.brokerName);
      }
      if (profileData.userName) {
        localStorage.setItem('userName', profileData.userName);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
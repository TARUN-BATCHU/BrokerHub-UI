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
  const [brokerData, setBrokerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedBrokerData = localStorage.getItem('brokerData');

      if (storedBrokerData) {
        // Parse and set stored broker data (session-based auth)
        const parsedBrokerData = JSON.parse(storedBrokerData);
        setIsAuthenticated(true);
        setBrokerData(parsedBrokerData);
      } else {
        setIsAuthenticated(false);
        setBrokerData(null);
      }
      setError(null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear auth state on error
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
      const storedBrokerData = localStorage.getItem('brokerData');
      
      if (!storedBrokerData) {
        throw new Error('Login failed - missing broker data');
      }

      const parsedBrokerData = JSON.parse(storedBrokerData);
      setIsAuthenticated(true);
      setBrokerData(parsedBrokerData);
      
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
      setBrokerData(null);
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
      
      // Update local broker data
      const updatedProfile = { ...brokerData, ...profileData };
      setBrokerData(updatedProfile);
      localStorage.setItem('brokerData', JSON.stringify(updatedProfile));
      
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
    brokerData,
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
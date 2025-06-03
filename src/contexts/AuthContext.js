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

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const brokerId = localStorage.getItem('brokerId');
      const storedBrokerData = localStorage.getItem('brokerData');

      if (token && brokerId) {
        setIsAuthenticated(true);
        
        if (storedBrokerData) {
          setBrokerData(JSON.parse(storedBrokerData));
        } else {
          // Fetch broker data if not in localStorage
          const fetchedBrokerData = await authAPI.getBrokerProfile(brokerId);
          setBrokerData(fetchedBrokerData);
          localStorage.setItem('brokerData', JSON.stringify(fetchedBrokerData));
        }
      } else {
        setIsAuthenticated(false);
        setBrokerData(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // If there's an error fetching broker data, clear auth state
      logout();
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
      const response = await authAPI.loginBroker(credentials);
      
      // The API service already handles storing tokens and broker data
      const brokerId = localStorage.getItem('brokerId');
      const storedBrokerData = localStorage.getItem('brokerData');
      
      if (brokerId && storedBrokerData) {
        setIsAuthenticated(true);
        setBrokerData(JSON.parse(storedBrokerData));
        return response;
      } else {
        throw new Error('Authentication failed - missing broker data');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setBrokerData(null);
  };

  const updateBrokerData = (newBrokerData) => {
    setBrokerData(newBrokerData);
    localStorage.setItem('brokerData', JSON.stringify(newBrokerData));
  };

  const value = {
    isAuthenticated,
    brokerData,
    loading,
    login,
    logout,
    updateBrokerData,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

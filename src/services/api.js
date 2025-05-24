import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/BrokerHub';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('brokerData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Create new broker account
  createBroker: async (brokerData) => {
    try {
      const response = await api.post('/Broker/createBroker', brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login broker
  loginBroker: async (credentials) => {
    try {
      const response = await api.post('/Broker/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('brokerData', JSON.stringify(response.data.broker));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },



  // Create password
  createPassword: async (passwordData) => {
    try {
      const response = await api.put('/Broker/createPassword', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/Broker/changePassword', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate OTP
  generateOTP: async (email) => {
    try {
      const response = await api.put(`/Broker/regenerate-otp?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify account
  verifyAccount: async (userName, otp) => {
    try {
      const response = await api.post(`/Broker/verify-account?userName=${encodeURIComponent(userName)}&otp=${encodeURIComponent(otp)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Forgot password
  forgotPassword: async (userName) => {
    try {
      const response = await api.get(`/Broker/forgotPassword?userName=${encodeURIComponent(userName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update broker profile
  updateBroker: async (brokerData) => {
    try {
      const response = await api.put('/Broker/update', brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get broker profile
  getBrokerProfile: async () => {
    try {
      const response = await api.get('/Broker/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('brokerData');
  }
};

// Merchant API functions
export const merchantAPI = {
  // Create merchant/user
  createUser: async (userData) => {
    try {
      const response = await api.post('/user/createUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all merchants
  getAllMerchants: async () => {
    try {
      const response = await api.get('/user/merchants');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchant by ID
  getMerchantById: async (id) => {
    try {
      const response = await api.get(`/user/merchant/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update merchant
  updateMerchant: async (id, userData) => {
    try {
      const response = await api.put(`/user/merchant/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete merchant
  deleteMerchant: async (id) => {
    try {
      const response = await api.delete(`/user/merchant/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Analytics API functions
export const analyticsAPI = {
  // Get sales analytics
  getSalesAnalytics: async () => {
    try {
      const response = await api.get('/analytics/sales');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top buyers
  getTopBuyers: async () => {
    try {
      const response = await api.get('/analytics/top-buyers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top sellers
  getTopSellers: async () => {
    try {
      const response = await api.get('/analytics/top-sellers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get city-wise analytics
  getCityAnalytics: async () => {
    try {
      const response = await api.get('/analytics/cities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product analytics
  getProductAnalytics: async () => {
    try {
      const response = await api.get('/analytics/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;

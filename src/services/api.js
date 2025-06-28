import axios from 'axios';

// Base API configuration - Updated for BrokerHub
const API_BASE_URL = 'http://localhost:8080/BrokerHub';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Session-based authentication - no need for Authorization headers
    // Credentials are handled via withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling - Updated for session-based auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear broker data and redirect to login
      localStorage.removeItem('brokerData');
      window.location.href = '/login';
    }

    // Handle multi-tenant specific errors
    if (error.response?.data?.code === 'UNAUTHORIZED') {
      console.error('Authentication required:', error.response.data.message);
      localStorage.removeItem('brokerData');
      window.location.href = '/login';
    }

    if (error.response?.data?.code === 'ACCESS_DENIED') {
      console.error('Access denied:', error.response.data.message);
      // Show user-friendly error message
      alert('Access denied: You can only access your own data');
    }

    return Promise.reject(error);
  }
);

// Auth API functions - Updated for multi-tenant
export const authAPI = {
  // Register new broker
  registerBroker: async (brokerData) => {
    try {
      const response = await api.post('/auth/register', brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login broker
  loginBroker: async (credentials) => {
    try {
      const response = await api.post('/Broker/login', credentials);
      
      if (response.status === 200 && response.data) {
        // Store broker data (session cookie handles authentication)
        const brokerData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          firmName: response.data.firmName,
          name: response.data.name
        };
        localStorage.setItem('brokerData', JSON.stringify(brokerData));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },



  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/password-reset/request', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/password-reset/confirm', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check username availability
  checkUsernameExists: async (username) => {
    try {
      const response = await api.get(`/Broker/UserNameExists/${encodeURIComponent(username)}`);
      return response.data || false;
    } catch (error) {
      console.error('Username check error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Check broker firm name availability
  checkBrokerFirmNameExists: async (firmName) => {
    try {
      const response = await api.get(`/Broker/BrokerFirmNameExists/${encodeURIComponent(firmName)}`);
      return response.data || false;
    } catch (error) {
      console.error('Firm name check error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create broker (for signup)
  createBroker: async (brokerData) => {
    try {
      const response = await api.post('/Broker/createBroker', brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('brokerData');
  }
};

// User/Merchant API functions - Updated for multi-tenant
export const userAPI = {
  // Create user
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get users by city
  getUsersByCity: async (cityName) => {
    try {
      const response = await api.get(`/users/city/${encodeURIComponent(cityName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (userData) => {
    try {
      const response = await api.put('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Product API functions - Updated for multi-tenant
export const productAPI = {
  // Create product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all products
  getAllProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/products?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get products by name
  getProductsByName: async (productName) => {
    try {
      const response = await api.get(`/products/name/${encodeURIComponent(productName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update product
  updateProduct: async (productData) => {
    try {
      const response = await api.put('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Analytics API functions - Updated for multi-tenant
export const analyticsAPI = {
  // Get financial year analytics
  getFinancialYearAnalytics: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/analytics/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top performers
  getTopPerformers: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-performers/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top buyers
  getTopBuyers: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-buyers/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top merchants
  getTopMerchants: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-merchants/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Financial Year API functions - Updated for multi-tenant
export const financialYearAPI = {
  // Create financial year
  createFinancialYear: async (financialYearData) => {
    try {
      const response = await api.post('/financial-years', financialYearData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all financial years
  getAllFinancialYears: async () => {
    try {
      const response = await api.get('/financial-years');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Daily Ledger API functions - Updated for multi-tenant
export const dailyLedgerAPI = {
  // Create daily ledger
  createDailyLedger: async (dailyLedgerData) => {
    try {
      const response = await api.post('/daily-ledger', dailyLedgerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get daily ledger by date
  getDailyLedger: async (date) => {
    try {
      const response = await api.get(`/daily-ledger/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get daily ledger with pagination
  getDailyLedgerWithPagination: async (date, page = 0, size = 20) => {
    try {
      const response = await api.get(`/daily-ledger/${date}/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Bank Details API functions - New for multi-tenant
export const bankDetailsAPI = {
  // Create bank details
  createBankDetails: async (bankDetailsData) => {
    try {
      const response = await api.post('/bank-details', bankDetailsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get bank details by account number
  getBankDetailsByAccountNumber: async (accountNumber) => {
    try {
      const response = await api.get(`/bank-details/account/${encodeURIComponent(accountNumber)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Payment System API functions - New for multi-tenant
export const paymentAPI = {
  // Get brokerage payments
  getBrokeragePayments: async () => {
    try {
      const response = await api.get('/payments/brokerage');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending payments
  getPendingPayments: async () => {
    try {
      const response = await api.get('/payments/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get receivable payments
  getReceivablePayments: async () => {
    try {
      const response = await api.get('/payments/receivable');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Cache API functions - New for multi-tenant
export const cacheAPI = {
  // Get product names cache
  getProductNames: async () => {
    try {
      const response = await api.get('/cache/products/names');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user names cache
  getUserNames: async () => {
    try {
      const response = await api.get('/cache/users/names');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Address API functions
export const addressAPI = {
  // Get all addresses
  getAllAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create address
  createAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update address
  updateAddress: async (addressData) => {
    try {
      const response = await api.put('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cities along route
  getCitiesAlongRoute: async (source, destination) => {
    try {
      const response = await api.get(`/addresses/route?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchants in city
  getMerchantsInCity: async (city) => {
    try {
      const response = await api.get(`/addresses/merchants/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Merchant API functions
export const merchantAPI = {
  // Get all merchants
  getAllMerchants: async () => {
    try {
      const response = await api.get('/merchants');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create merchant
  createMerchant: async (merchantData) => {
    try {
      const response = await api.post('/merchants', merchantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update merchant
  updateMerchant: async (merchantData) => {
    try {
      const response = await api.put('/merchants', merchantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete merchant
  deleteMerchant: async (merchantId) => {
    try {
      const response = await api.delete(`/merchants/${merchantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchant by ID
  getMerchantById: async (merchantId) => {
    try {
      const response = await api.get(`/merchants/${merchantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload merchants
  bulkUploadMerchants: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/merchants/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download merchant template
  downloadTemplate: async () => {
    try {
      const response = await api.get('/merchants/template', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
import axios from 'axios';

// Base API configuration - Updated for multi-tenant
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // All API calls now require Basic Authentication for multi-tenant support
    // Update these credentials to match your backend configuration
    const username = 'tarun';
    const password = 'securePassword123';
    const basicAuth = btoa(`${username}:${password}`);
    config.headers.Authorization = `Basic ${basicAuth}`;
    console.log('Using Basic Auth for multi-tenant API:', config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling - Updated for multi-tenant
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('brokerData');
      localStorage.removeItem('brokerId');
      window.location.href = '/login';
    }

    // Handle multi-tenant specific errors
    if (error.response?.data?.code === 'UNAUTHORIZED') {
      console.error('Authentication required:', error.response.data.message);
      localStorage.removeItem('authToken');
      localStorage.removeItem('brokerData');
      localStorage.removeItem('brokerId');
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

      console.log('Login API Response:', response);
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      // If response is successful (200)
      if (response.status === 200) {
        console.log('Login successful, processing response...');

        // Extract broker ID from response message
        let brokerId = null;

        // Check if response has a message like "Login successful 8"
        if (response.data && typeof response.data === 'string') {
          const match = response.data.match(/Login successful\s+(\d+)/i);
          if (match) {
            brokerId = match[1];
            console.log('Extracted broker ID from message:', brokerId);
          }
        }

        // Check if response has message property
        if (!brokerId && response.data && response.data.message) {
          const match = response.data.message.match(/Login successful\s+(\d+)/i);
          if (match) {
            brokerId = match[1];
            console.log('Extracted broker ID from message property:', brokerId);
          }
        }

        // Check if broker ID is directly in response
        if (!brokerId && response.data && response.data.brokerId) {
          brokerId = response.data.brokerId.toString();
          console.log('Found broker ID in response data:', brokerId);
        }

        // Handle different token scenarios
        if (response.data.token) {
          // If token is directly in response.data
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('brokerData', JSON.stringify(response.data.broker || response.data));
        } else if (response.data.data && response.data.data.token) {
          // If token is nested in response.data.data
          localStorage.setItem('authToken', response.data.data.token);
          localStorage.setItem('brokerData', JSON.stringify(response.data.data.broker || response.data.data));
        } else {
          // If no token but successful response, create a temporary token
          const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('authToken', tempToken);
          console.log('Created temporary token for session');
        }

        // Store broker ID if found
        if (brokerId) {
          localStorage.setItem('brokerId', brokerId);
          console.log('Stored broker ID:', brokerId);
        } else {
          console.warn('No broker ID found in response, using default for testing');
          localStorage.setItem('brokerId', '8'); // Default for testing
        }

        console.log('Token stored:', localStorage.getItem('authToken'));
        console.log('Broker ID stored:', localStorage.getItem('brokerId'));
      }

      return response.data;
    } catch (error) {
      console.error('Login API Error:', error);
      console.error('Error Response:', error.response);

      // Add status code to the error object for better error handling
      const errorToThrow = error.response?.data || { message: error.message };
      errorToThrow.status = error.response?.status;
      throw errorToThrow;
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

  // Get broker profile by ID
  getBrokerProfile: async (brokerId) => {
    try {
      console.log('Fetching broker profile for ID:', brokerId);
      const response = await api.get(`/Broker/getBroker/${brokerId}`);
      console.log('Broker profile response:', response);
      console.log('Broker profile data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      console.error('Error response:', error.response);
      throw error.response?.data || error.message;
    }
  },

  // Update broker profile
  updateBrokerProfile: async (brokerData) => {
    try {
      const response = await api.put('/Broker/updateBroker', brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('brokerData');
    localStorage.removeItem('brokerId');
  }
};

// Merchant API functions - Updated for multi-tenant
export const merchantAPI = {
  // Create merchant/user - Updated endpoint
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user API Error:', error);
      console.error('Error Response:', error.response);

      // Add status code to the error object for better error handling
      const errorToThrow = error.response?.data || { message: error.message };
      errorToThrow.status = error.response?.status;
      throw errorToThrow;
    }
  },

  // Get all merchants/users - Updated endpoint
  getAllMerchants: async () => {
    try {
      console.log('Fetching all merchants/users...');
      const response = await api.get('/users');
      console.log('All merchants response:', response);
      console.log('All merchants data:', response.data);
      console.log('Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching all merchants:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Get users by city - New endpoint
  getUsersByCity: async (cityName) => {
    try {
      const response = await api.get(`/users/city/${encodeURIComponent(cityName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search user by property - New endpoint
  searchUserByProperty: async (property, value) => {
    try {
      const response = await api.get(`/users/search?property=${encodeURIComponent(property)}&value=${encodeURIComponent(value)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchant by ID - Keep for backward compatibility
  getMerchantById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update merchant/user - Updated endpoint
  updateMerchant: async (userData) => {
    try {
      const response = await api.put('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download Excel template for bulk upload - Keep existing for now
  downloadTemplate: async () => {
    try {
      console.log('Downloading Excel template...');
      const response = await api.get('/users/template', {
        responseType: 'blob',
      });

      console.log('Template download response:', response);
      return response.data;
    } catch (error) {
      console.error('Error downloading template:', error);
      console.error('Error response:', error.response);
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload merchants via Excel - Keep existing for now
  bulkUploadMerchants: async (file) => {
    try {
      console.log('Uploading bulk merchants file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/users/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Bulk upload response:', response);
      console.log('Upload result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading bulk merchants:', error);
      console.error('Error response:', error.response);
      throw error.response?.data || error.message;
    }
  },

  // Delete merchant - Keep for backward compatibility
  deleteMerchant: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Analytics API functions - Updated for multi-tenant (brokerId removed)
export const analyticsAPI = {
  // Get financial year analytics - Updated endpoint, no brokerId needed
  getFinancialYearAnalytics: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/analytics/${financialYearId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top performers (comprehensive data) - Updated endpoint, no brokerId needed
  getTopPerformers: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-performers/${financialYearId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 buyers by quantity - Updated endpoint, no brokerId needed
  getTop5BuyersByQuantity: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-buyers/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 merchants by brokerage - Updated endpoint, no brokerId needed
  getTop5MerchantsByBrokerage: async (financialYearId) => {
    try {
      const response = await api.get(`/dashboard/top-merchants/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sales analytics (legacy) - Keep for backward compatibility
  getSalesAnalytics: async () => {
    try {
      const response = await api.get('/analytics/sales');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top buyers (legacy) - Keep for backward compatibility
  getTopBuyers: async () => {
    try {
      const response = await api.get('/analytics/top-buyers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top sellers (legacy) - Keep for backward compatibility
  getTopSellers: async () => {
    try {
      const response = await api.get('/analytics/top-sellers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get city-wise analytics (legacy) - Keep for backward compatibility
  getCityAnalytics: async () => {
    try {
      const response = await api.get('/analytics/cities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product analytics (legacy) - Keep for backward compatibility
  getProductAnalytics: async () => {
    try {
      const response = await api.get('/analytics/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Financial Year API functions - Updated for multi-tenant
export const financialYearAPI = {
  // Create financial year - Updated endpoint
  createFinancialYear: async (financialYearData) => {
    try {
      const response = await api.post('/financial-years', financialYearData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all financial years - Updated endpoint
  getAllFinancialYears: async () => {
    try {
      const response = await api.get('/financial-years');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Product API functions - Updated for multi-tenant
export const productAPI = {
  // Create product - Updated endpoint
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all products - Updated endpoint with pagination
  getAllProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/products?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get products by name - New endpoint
  getProductsByName: async (productName) => {
    try {
      const response = await api.get(`/products/name/${encodeURIComponent(productName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update product - Updated endpoint
  updateProduct: async (productData) => {
    try {
      const response = await api.put('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete product - Updated endpoint
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Address API functions - Updated for multi-tenant
export const addressAPI = {
  // Get all addresses - Updated endpoint
  getAllAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create address - Updated endpoint
  createAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update address - Updated endpoint
  updateAddress: async (addressData) => {
    try {
      const response = await api.put('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if city exists - New endpoint
  checkCityExists: async (cityName) => {
    try {
      const response = await api.get(`/addresses/city/${encodeURIComponent(cityName)}/exists`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Daily Ledger API functions - Updated for multi-tenant
export const dailyLedgerAPI = {
  // Create daily ledger - Updated endpoint
  createDailyLedger: async (dailyLedgerData) => {
    try {
      const response = await api.post('/daily-ledger', dailyLedgerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get daily ledger by date - Updated endpoint
  getDailyLedger: async (date) => {
    try {
      const response = await api.get(`/daily-ledger/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get daily ledger with pagination - Updated endpoint
  getDailyLedgerWithPagination: async (date, page = 0, size = 20) => {
    try {
      const response = await api.get(`/daily-ledger/${date}/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create ledger detail - Updated endpoint
  createLedgerDetail: async (ledgerDetailData) => {
    try {
      const response = await api.post('/ledger-details', ledgerDetailData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all ledger details - New endpoint
  getAllLedgerDetails: async () => {
    try {
      const response = await api.get('/ledger-details');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by ID - New endpoint
  getLedgerDetailsById: async (ledgerDetailId) => {
    try {
      const response = await api.get(`/ledger-details/${ledgerDetailId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by date - New endpoint
  getLedgerDetailsByDate: async (date) => {
    try {
      const response = await api.get(`/ledger-details/date/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update ledger detail - Updated endpoint
  updateLedgerDetail: async (ledgerDetailData) => {
    try {
      const response = await api.put('/ledger-details', ledgerDetailData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete ledger detail - Updated endpoint
  deleteLedgerDetail: async (id) => {
    try {
      const response = await api.delete(`/ledger-details/${id}`);
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

export default api;




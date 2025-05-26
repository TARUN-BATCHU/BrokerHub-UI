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

    // For specific endpoints that require Basic Auth, use hardcoded credentials
    const basicAuthEndpoints = [
      '/Broker/getBroker/',
      '/user/allUsers',
      '/user/updateUser',
      '/user/bulkUpload',
      '/user/downloadTemplate',
      '/FinancialYear/create',
      '/FinancialYear/getAllFinancialYears',
      '/Product/createProduct',
      '/Product/allProducts',
      '/Product/updateProduct',
      '/Product/deleteProduct',
      '/Address/getAllAddresses',
      '/Address/createAddress',
      '/Address/updateAddress',
      '/Dashboard/'
    ];

    const needsBasicAuth = basicAuthEndpoints.some(endpoint =>
      config.url.includes(endpoint)
    );

    if (needsBasicAuth) {
      // Use Basic Authentication with hardcoded credentials
      const username = 'tarun';
      const password = 'securePassword123';
      const basicAuth = btoa(`${username}:${password}`);
      config.headers.Authorization = `Basic ${basicAuth}`;
      console.log('Using Basic Auth for:', config.url);
    } else if (token) {
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

// Merchant API functions
export const merchantAPI = {
  // Create merchant/user
  createUser: async (userData) => {
    try {
      const response = await api.post('/user/createUser', userData);
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

  // Get all merchants/users
  getAllMerchants: async () => {
    try {
      console.log('Fetching all merchants/users...');
      const response = await api.get('/user/allUsers');
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

  // Get merchant by ID
  getMerchantById: async (id) => {
    try {
      const response = await api.get(`/user/merchant/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update merchant/user
  updateMerchant: async (userData) => {
    try {
      const response = await api.put('/user/updateUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download Excel template for bulk upload
  downloadTemplate: async () => {
    try {
      console.log('Downloading Excel template...');
      const response = await api.get('/user/downloadTemplate', {
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

  // Bulk upload merchants via Excel
  bulkUploadMerchants: async (file) => {
    try {
      console.log('Uploading bulk merchants file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/user/bulkUpload', formData, {
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
  // Get financial year analytics
  getFinancialYearAnalytics: async (brokerId, financialYearId) => {
    try {
      const response = await api.get(`/Dashboard/${brokerId}/getFinancialYearAnalytics/${financialYearId}`, {
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

  // Get top performers (comprehensive data)
  getTopPerformers: async (brokerId, financialYearId) => {
    try {
      const response = await api.get(`/Dashboard/${brokerId}/getTopPerformers/${financialYearId}`, {
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

  // Get top 5 buyers by quantity
  getTop5BuyersByQuantity: async (brokerId, financialYearId) => {
    try {
      const response = await api.get(`/Dashboard/${brokerId}/getTop5BuyersByQuantity/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 merchants by brokerage
  getTop5MerchantsByBrokerage: async (brokerId, financialYearId) => {
    try {
      const response = await api.get(`/Dashboard/${brokerId}/getTop5MerchantsByBrokerage/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sales analytics (legacy)
  getSalesAnalytics: async () => {
    try {
      const response = await api.get('/analytics/sales');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top buyers (legacy)
  getTopBuyers: async () => {
    try {
      const response = await api.get('/analytics/top-buyers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top sellers (legacy)
  getTopSellers: async () => {
    try {
      const response = await api.get('/analytics/top-sellers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get city-wise analytics (legacy)
  getCityAnalytics: async () => {
    try {
      const response = await api.get('/analytics/cities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product analytics (legacy)
  getProductAnalytics: async () => {
    try {
      const response = await api.get('/analytics/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Financial Year API functions
export const financialYearAPI = {
  // Create financial year
  createFinancialYear: async (financialYearData) => {
    try {
      const response = await api.post('/FinancialYear/create', financialYearData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all financial years
  getAllFinancialYears: async () => {
    try {
      const response = await api.get('/FinancialYear/getAllFinancialYears');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Product API functions
export const productAPI = {
  // Create product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/Product/createProduct', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all products
  getAllProducts: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/Product/allProducts?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update product
  updateProduct: async (productData) => {
    try {
      const response = await api.put('/Product/updateProduct', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/Product/deleteProduct?productId=${productId}`);
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
      const response = await api.get('/Address/getAllAddresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create address
  createAddress: async (addressData) => {
    try {
      const response = await api.post('/Address/createAddress', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update address
  updateAddress: async (addressData) => {
    try {
      const response = await api.put('/Address/updateAddress', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;




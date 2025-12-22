import axios from 'axios';

// Base API configuration - Updated for BrokerHub
const API_BASE_URL = window.APP_CONFIG?.API_URL || process.env.REACT_APP_API_URL || '/BrokerHub';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-flight request dedupe and cancellation
const inflightRequests = new Map();
const buildRequestKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  const data = config.data ? (typeof config.data === 'string' ? config.data : JSON.stringify(config.data)) : '';
  return `${method}|${url}|${params}|${data}`;
};

// Request interceptor for authentication and dedupe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const key = buildRequestKey(config);
    if (inflightRequests.has(key)) {
      // Cancel this duplicate request immediately by throwing a promise that resolves with the original
      return new Promise((resolve, reject) => {
        // Wait for the original to settle, then resolve with a cloned config to avoid sending again
        inflightRequests.get(key).promise.then(() => resolve(config)).catch(reject);
      });
    }

    // Attach AbortController to allow cancellation on unmount/switch (axios v1 supports signal)
    const controller = new AbortController();
    config.signal = controller.signal;
    // Track the promise for this request; replaced on response interceptors
    const entry = { controller, promise: Promise.resolve() };
    inflightRequests.set(key, entry);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Clear inflight on success
    const key = buildRequestKey(response.config || {});
    if (inflightRequests.has(key)) {
      inflightRequests.delete(key);
    }
    return response;
  },
  (error) => {
    // Clear inflight on error
    try {
      const key = buildRequestKey(error.config || {});
      inflightRequests.delete(key);
    } catch {}
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Do NOT redirect for public/unauthed endpoints (forgot password, login, register, verify)
      const isPublicAuthEndpoint = [
        '/auth/password-reset/request',
        '/auth/password-reset/confirm',
        '/auth/register',
        '/Broker/login',
        '/auth/verify-email'
      ].some((path) => requestUrl.includes(path));

      if (!isPublicAuthEndpoint) {
        // Token expired or invalid → clear and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('brokerId');
        localStorage.removeItem('brokerName');
        localStorage.removeItem('userName');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions - Updated for multi-tenant
export const authAPI = {
  // Register new broker (if used elsewhere; path may differ in BrokerController)
  registerBroker: async (brokerData) => {
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
      
      if (response.status === 200 && response.data) {
        // Store JWT token and user info
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('brokerId', response.data.brokerId);
        localStorage.setItem('brokerName', response.data.brokerName);
        localStorage.setItem('userName', response.data.username);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },



  // Change password (authenticated)
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/Broker/changePassword', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Forgot password (send OTP) - public, text/plain response
  forgotPassword: async (userName) => {
    try {
      const response = await api.get(`/Broker/forgotPassword`, { params: { userName } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create password (first-time or after verification) - public
  createPassword: async ({ email, password }) => {
    try {
      const response = await api.put('/Broker/createPassword', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify account (submit OTP) - public, text/plain
  verifyAccount: async (userName, otp) => {
    try {
      const response = await api.post(`/Broker/verify-account`, null, { params: { userName, otp } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Regenerate OTP (may require JWT depending on backend security)
  regenerateOtp: async (email) => {
    try {
      const response = await api.put(`/Broker/regenerate-otp`, null, { params: { email } });
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('brokerId');
    localStorage.removeItem('brokerName');
    localStorage.removeItem('userName');
  }
};

// User/Merchant API functions
export const userAPI = {
  // Create user
  createUser: async (userData) => {
    try {
      const response = await api.post('/user/createUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user summary with pagination
  getUserSummary: async (page = 0, size = 10, sort = 'firmName,asc', financialYearId = null) => {
    try {
      const url = financialYearId 
        ? `/user/getUserSummary?financialYearId=${financialYearId}&page=${page}&size=${size}&sort=${sort}`
        : `/user/getUserSummary?page=${page}&size=${size}&sort=${sort}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get firm names, IDs and cities
  getFirmNamesIdsAndCities: async () => {
    try {
      const response = await api.get('/user/getFirmNamesIdsAndCities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get users by city
  getUsersByCity: async (cityName) => {
    try {
      const response = await api.get(`/user/getUsersByCity/${encodeURIComponent(cityName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all cities
  getAllCities: async () => {
    try {
      const response = await api.get('/user/cities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Alias for getCities
  getCities: async () => {
    try {
      const response = await api.get('/user/cities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchants by city
  getMerchantsByCity: async (city) => {
    try {
      const response = await api.get('/user/merchants', {
        params: { city }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (userData) => {
    try {
      const response = await api.put('/user/updateUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload users
  bulkUpload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/user/bulkUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download user template
  downloadTemplate: async () => {
    try {
      const response = await api.get('/user/downloadTemplate', {
        responseType: 'blob'
      });
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
  getAllProducts: async (page = 0, size = 30) => {
    try {
      const response = await api.get(`/Product/allProducts?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get products by name
  getProductsByName: async (productName) => {
    try {
      const response = await api.get(`/Product/getProductsByName/${encodeURIComponent(productName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product names
  getProductNames: async () => {
    try {
      const response = await api.get('/Product/getProductNames');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product names, qualities and quantities with ID
  getProductNamesAndQualitiesAndQuantitesWithId: async () => {
    try {
      const response = await api.get('/Product/getProductNamesAndQualitiesAndQuantitesWithId');
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
      const response = await api.delete(`/Product/deleteProduct/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload products
  bulkUpload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/Product/bulkUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download product template
  downloadTemplate: async () => {
    try {
      const response = await api.get('/Product/downloadTemplate', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Analytics API functions
export const analyticsAPI = {
  // Get financial year analytics
  getFinancialYearAnalytics: async (financialYearId) => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        throw new Error('Broker ID not found. Please login again.');
      }
      const response = await api.get(`/Dashboard/${brokerId}/getFinancialYearAnalytics/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top performers
  getTopPerformers: async (financialYearId) => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        throw new Error('Broker ID not found. Please login again.');
      }
      const response = await api.get(`/Dashboard/${brokerId}/getTopPerformers/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 buyers by quantity
  getTop5BuyersByQuantity: async (financialYearId) => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        throw new Error('Broker ID not found. Please login again.');
      }
      const response = await api.get(`/Dashboard/${brokerId}/getTop5BuyersByQuantity/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 sellers by quantity
  getTop5SellersByQuantity: async (financialYearId) => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        throw new Error('Broker ID not found. Please login again.');
      }
      const response = await api.get(`/Dashboard/${brokerId}/getTop5SellersByQuantity/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get top 5 merchants by brokerage
  getTop5MerchantsByBrokerage: async (financialYearId) => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        throw new Error('Broker ID not found. Please login again.');
      }
      const response = await api.get(`/Dashboard/${brokerId}/getTop5MerchantsByBrokerage/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh analytics cache
  refreshCache: async (financialYearId) => {
    try {
      const response = await api.post(`/Dashboard/refreshCache/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh all analytics cache
  refreshAllCache: async () => {
    try {
      const response = await api.post('/Dashboard/refreshAllCache');
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
  },

  // Set current financial year
  setCurrentFinancialYear: async (financialYearId) => {
    try {
      const response = await api.post(`/FinancialYear/setCurrentFinancialYear?financialYearId=${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current financial year
  getCurrentFinancialYear: async () => {
    try {
      const response = await api.get('/FinancialYear/getCurrentFinancialYear');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Daily Ledger API functions
export const dailyLedgerAPI = {
  // Get optimized daily ledger by date
  getOptimizedDailyLedger: async (date) => {
    try {
      const response = await api.get(`/DailyLedger/getOptimizedDailyLedger?date=${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get optimized daily ledger with pagination
  getOptimizedDailyLedgerWithPagination: async (date, page = 0, size = 10, sortBy = 'ledgerDetailsId', sortDir = 'asc') => {
    try {
      const response = await api.get(`/DailyLedger/getOptimizedDailyLedgerWithPagination?date=${date}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Ledger Details API functions
export const ledgerDetailsAPI = {
  // Create ledger details
  createLedgerDetails: async (ledgerData) => {
    try {
      const response = await api.post('/LedgerDetails/createLedgerDetails', ledgerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all ledger details
  getAllLedgerDetails: async (brokerId) => {
    try {
      const response = await api.post('/LedgerDetails/getAllLedgerDetails', brokerId);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by ID
  getLedgerDetailsById: async (ledgerDetailId, brokerId) => {
    try {
      const response = await api.get(`/LedgerDetails/getLedgerDetailsById?ledgerDetailId=${ledgerDetailId}&brokerId=${brokerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by transaction number
  getLedgerDetailsByTransactionNumber: async (transactionNumber, brokerId, financialYearId) => {
    try {
      const response = await api.get(`/LedgerDetails/getLedgerDetailsByTransactionNumber?transactionNumber=${transactionNumber}&brokerId=${brokerId}&financialYearId=${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get optimized ledger details by ID
  getOptimizedLedgerDetailsById: async (ledgerDetailId, brokerId) => {
    try {
      const response = await api.get(`/LedgerDetails/getOptimizedLedgerDetailsById?ledgerDetailId=${ledgerDetailId}&brokerId=${brokerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get optimized ledger details by transaction number
  getOptimizedLedgerDetailsByTransactionNumber: async (transactionNumber, brokerId, financialYearId) => {
    try {
      const response = await api.get(`/LedgerDetails/getOptimizedLedgerDetailsByTransactionNumber?transactionNumber=${transactionNumber}&brokerId=${brokerId}&financialYearId=${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by date
  getLedgerDetailsByDate: async (date, brokerId) => {
    try {
      const response = await api.get(`/LedgerDetails/getLedgerDetailsByDate?date=${date}&brokerId=${brokerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ledger details by seller
  getLedgerDetailsBySeller: async (sellerId, brokerId) => {
    try {
      const response = await api.get(`/LedgerDetails/getLedgerDetailsBySeller?sellerId=${sellerId}&brokerId=${brokerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update ledger detail by transaction number
  updateLedgerDetailByTransactionNumber: async (transactionNumber, brokerId, financialYearId, ledgerData) => {
    try {
      const response = await api.put(`/LedgerDetails/updateLedgerDetailByTransactionNumber?transactionNumber=${transactionNumber}&brokerId=${brokerId}&financialYearId=${financialYearId}`, ledgerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create ledger details with Excel JSON
  createLedgerDetailsWithExcelJson: async (jsonData) => {
    try {
      const response = await api.post('/LedgerDetails/createLedgerDetailsWithExcelJson', jsonData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete ledger detail by transaction number
  deleteLedgerDetailByTransactionNumber: async (transactionNumber, brokerId, financialYearId) => {
    try {
      const response = await api.delete(`/LedgerDetails/deleteLedgerDetailByTransactionNumber?transactionNumber=${transactionNumber}&brokerId=${brokerId}&financialYearId=${financialYearId}`);
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
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/Address/deleteAddress/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cities along route
  getCitiesAlongRoute: async (source, destination) => {
    try {
      const response = await api.get(`/Address/getCitiesAlongRoute?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchants in city
  getMerchantsInCity: async (city) => {
    try {
      const response = await api.get(`/Address/getMerchantsInCity/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Merchant API functions
export const merchantAPI = {
  // Get merchant summary
  getMerchantSummary: async (page = 0, size = 10, sort = 'firmName,asc') => {
    try {
      const response = await api.get(`/user/getUserSummary?page=${page}&size=${size}&sort=${sort}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create merchant
  createMerchant: async (merchantData) => {
    try {
      const response = await api.post('/user/createUser', merchantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update merchant
  updateMerchant: async (merchantData) => {
    try {
      const response = await api.put('/user/updateUser', merchantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete merchant
  deleteMerchant: async (merchantId) => {
    try {
      const response = await api.delete(`/user/deleteUser/${merchantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get merchant by ID
  getMerchantById: async (merchantId) => {
    try {
      const response = await api.get(`/user/getUserById/${merchantId}`);
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
      const response = await api.post('/user/bulkUpload', formData, {
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
      const response = await api.get('/user/downloadTemplate', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Grain Costs API functions
export const grainCostsAPI = {
  // Add grain cost entry
  addGrainCost: async (brokerId, grainCostData) => {
    try {
      const response = await api.post(`/grain-costs/${brokerId}`, grainCostData, {
        headers: {
          'Authorization': 'Basic dGFydW46c2VjdXJlUGFzc3dvcmQxMjM='
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all grain costs for a broker
  getAllGrainCosts: async (brokerId) => {
    try {
      const response = await api.get(`/grain-costs/${brokerId}`, {
        headers: {
          'Authorization': 'Basic dGFydW46c2VjdXJlUGFzc3dvcmQxMjM='
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete grain cost entry
  deleteGrainCost: async (brokerId, grainCostId) => {
    try {
      const response = await api.delete(`/grain-costs/${brokerId}/${grainCostId}`, {
        headers: {
          'Authorization': 'Basic dGFydW46c2VjdXJlUGFzc3dvcmQxMjM='
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Brokerage API functions
export const brokerageAPI = {
  // Get city-wise print bill
  getCityWisePrintBill: async (userId, financialYearId, customBrokerage = null, paperSize = 'a4', orientation = 'portrait') => {
    try {
      let url = `/Brokerage/city-wise-print-bill/${userId}/${financialYearId}?paperSize=${paperSize}&orientation=${orientation}`;
      if (customBrokerage !== null) {
        url += `&customBrokerage=${customBrokerage}`;
      }
      const response = await api.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/html'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Contacts Management API functions
export const contactsAPI = {
  // Sections
  createSection: async (sectionData) => {
    try {
      const response = await api.post('/api/contacts/sections', sectionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getAllSections: async () => {
    try {
      const response = await api.get('/api/contacts/sections');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getSectionById: async (sectionId) => {
    try {
      const response = await api.get(`/api/contacts/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/api/contacts/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteSection: async (sectionId) => {
    try {
      const response = await api.delete(`/api/contacts/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getRootSections: async () => {
    try {
      const response = await api.get('/api/contacts/sections/root');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getChildSections: async (parentId) => {
    try {
      const response = await api.get(`/api/contacts/sections/${parentId}/children`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Contacts
  createContact: async (contactData) => {
    try {
      const response = await api.post('/api/contacts', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getAllContacts: async () => {
    try {
      const response = await api.get('/api/contacts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getContactsBySection: async (sectionId) => {
    try {
      const response = await api.get(`/api/contacts/section/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getContactById: async (contactId) => {
    try {
      const response = await api.get(`/api/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateContact: async (contactId, contactData) => {
    try {
      const response = await api.put(`/api/contacts/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteContact: async (contactId) => {
    try {
      const response = await api.delete(`/api/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  addContactToSection: async (contactId, sectionId) => {
    try {
      const response = await api.post(`/api/contacts/${contactId}/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  removeContactFromSection: async (contactId, sectionId) => {
    try {
      const response = await api.delete(`/api/contacts/${contactId}/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search & Pagination
  searchContacts: async (query, page = 0, size = 10) => {
    try {
      const response = await api.get(`/api/contacts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getPaginatedContacts: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/api/contacts/paginated?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
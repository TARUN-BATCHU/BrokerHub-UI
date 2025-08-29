import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/BrokerHub';

const paymentApi = axios.create({
  baseURL: `${API_BASE_URL}/payments`,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Add JWT token to requests
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const paymentAPI = {
  // Firm Names API
  getAllFirms: async () => {
    try {
      const response = await paymentApi.get('/firms');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Brokerage Payments APIs
  getBrokeragePayments: async (brokerId) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/brokerage`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchBrokeragePayments: async (brokerId, firmName) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/brokerage/search?firmName=${encodeURIComponent(firmName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addPartPayment: async (brokerId, paymentId, partPaymentData) => {
    try {
      const response = await paymentApi.post(`/${brokerId}/brokerage/${paymentId}/part-payment`, partPaymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Pending Payments APIs
  getPendingPayments: async (brokerId) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/pending`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchPendingPayments: async (brokerId, buyerFirm) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/pending/search?buyerFirm=${encodeURIComponent(buyerFirm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Receivable Payments APIs
  getReceivablePayments: async (brokerId) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/receivable`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchReceivablePayments: async (brokerId, sellerFirm) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/receivable/search?sellerFirm=${encodeURIComponent(sellerFirm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Utility Endpoints
  refreshCache: async (brokerId) => {
    try {
      const response = await paymentApi.post(`/${brokerId}/refresh-cache`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateOverdueStatus: async (brokerId) => {
    try {
      const response = await paymentApi.post(`/${brokerId}/update-overdue-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDashboardStats: async (brokerId) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPaymentSummary: async (brokerId) => {
    try {
      const response = await paymentApi.get(`/${brokerId}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateFromLedger: async (brokerId, financialYearId) => {
    try {
      const response = await paymentApi.post(`/${brokerId}/generate-from-ledger/${financialYearId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentAPI;
import axios from 'axios';

const API_BASE_URL = window.APP_CONFIG?.API_URL || process.env.REACT_APP_API_URL || '/BrokerHub';
const BROKERAGE_API = `${API_BASE_URL}/api/brokerage-dashboard`;

const getAuthToken = () => localStorage.getItem('authToken');

const api = axios.create({
  baseURL: BROKERAGE_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const brokerageAPI = {
  getDashboard: (brokerId) => api.get(`/${brokerId}`),
  
  getMerchants: (brokerId) => api.get(`/${brokerId}/merchants`),
  
  updatePaymentStatus: (brokerId, data) => api.put(`/${brokerId}/payment-status`, data),
  
  updateBrokerageAmount: (brokerId, data) => api.put(`/${brokerId}/brokerage-amount`, data),
  
  getPaymentHistory: (brokerId, merchantId) => api.get(`/${brokerId}/merchant/${merchantId}/history`),
  
  getPaymentMethods: () => api.get('/payment-methods'),
  
  calculateBrokerage: (brokerId) => api.post(`/${brokerId}/calculate-brokerage`),
  
  getCityAnalytics: (brokerId, city) => api.get(`/${brokerId}/city/${encodeURIComponent(city)}/analytics`),
};

import api from './api';

// Market API functions for Today's Market feature
export const marketAPI = {
  // Get all market products
  getMarketProducts: async () => {
    try {
      const response = await api.get('/market/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add product to market
  addMarketProduct: async (productData) => {
    try {
      const response = await api.post('/market/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get seller requests
  getSellerRequests: async () => {
    try {
      const response = await api.get('/market/seller-requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit seller request
  submitSellerRequest: async (requestData) => {
    try {
      const response = await api.post('/market/seller-requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get buyer requests
  getBuyerRequests: async () => {
    try {
      const response = await api.get('/market/buyer-requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit buyer request
  submitBuyerRequest: async (requestData) => {
    try {
      const response = await api.post('/market/buyer-requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Accept seller request
  acceptSellerRequest: async (requestId) => {
    try {
      const response = await api.put(`/market/seller-requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Accept buyer request
  acceptBuyerRequest: async (requestId) => {
    try {
      const response = await api.put(`/market/buyer-requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default marketAPI;
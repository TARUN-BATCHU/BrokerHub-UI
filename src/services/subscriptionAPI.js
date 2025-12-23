import api from './api';

export const subscriptionAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      const response = await api.get('/api/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request subscription
  requestSubscription: async (planId) => {
    try {
      const response = await api.post('/api/subscriptions/request', { planId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/api/subscriptions/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Get all subscriptions
  getAllSubscriptions: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`/admin/subscriptions?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Search user subscription
  searchUserSubscription: async (email) => {
    try {
      const response = await api.get(`/admin/subscriptions/search?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Activate subscription
  activateSubscription: async (subscriptionId, chargeBreakup) => {
    try {
      const response = await api.post(`/admin/subscriptions/${subscriptionId}/activate`, { chargeBreakup });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Expire subscription
  expireSubscription: async (subscriptionId) => {
    try {
      const response = await api.post(`/admin/subscriptions/${subscriptionId}/expire`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

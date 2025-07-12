import api from './api';

export const brokerageAPI = {
  // Core Brokerage APIs
  getTotalBrokerage: async (financialYear) => {
    const response = await api.get(`/Brokerage/total/${financialYear}`);
    return response.data;
  },

  getSummary: async (financialYear) => {
    const response = await api.get(`/Brokerage/summary/${financialYear}`);
    return response.data;
  },

  getUserTotalBrokerage: async (userId, financialYear) => {
    const response = await api.get(`/Brokerage/user/${userId}/${financialYear}`);
    return response.data;
  },

  getCityTotalBrokerage: async (city, financialYear) => {
    const response = await api.get(`/Brokerage/city/${city}/${financialYear}`);
    return response.data;
  },

  getUserDetailedBrokerage: async (userId, financialYear) => {
    const response = await api.get(`/Brokerage/user-detail/${userId}/${financialYear}`);
    return response.data;
  },

  // Document Generation APIs
  downloadUserBill: async (userId, financialYear) => {
    const response = await api.get(`/Brokerage/bill/${userId}/${financialYear}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill_${userId}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  downloadUserExcel: async (userId, financialYear) => {
    const response = await api.get(`/Brokerage/excel/user/${userId}/${financialYear}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill_${userId}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  downloadSummaryExcel: async (financialYear) => {
    const response = await api.get(`/Brokerage/excel/summary/${financialYear}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary_${financialYear}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  downloadCityExcel: async (city, financialYear) => {
    const response = await api.get(`/Brokerage/excel/city/${city}/${financialYear}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `city_${city}_${financialYear}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Bulk Processing APIs
  bulkBillsByCity: async (city, financialYear) => {
    const response = await api.post(`/Brokerage/bulk-bills/city/${city}/${financialYear}`);
    return response.data;
  },

  bulkBillsByUsers: async (userIds, financialYear) => {
    const response = await api.post(`/Brokerage/bulk-bills/users/${financialYear}`, userIds);
    return response.data;
  },

  bulkExcelByCity: async (city, financialYear) => {
    const response = await api.post(`/Brokerage/bulk-excel/city/${city}/${financialYear}`);
    return response.data;
  },

  bulkExcelByUsers: async (userIds, financialYear) => {
    const response = await api.post(`/Brokerage/bulk-excel/users/${financialYear}`, userIds);
    return response.data;
  },

  // Document Status APIs
  getDocumentStatus: async () => {
    const response = await api.get('/Documents/status');
    return response.data;
  },

  getDocumentStatusByType: async (documentType) => {
    const response = await api.get(`/Documents/status/${documentType}`);
    return response.data;
  },

  // Cache Management
  clearBrokerageCache: async () => {
    const response = await api.delete('/Cache/brokerage');
    return response.data;
  }
};
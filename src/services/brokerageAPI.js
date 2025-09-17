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
  downloadUserBill: async (userId, financialYear, customBrokerage = null, firmName = null) => {
    const url = `/Brokerage/bill/${userId}/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    const safeFirmName = firmName ? firmName.replace(/[^a-zA-Z0-9]/g, '_') : userId;
    const filename = customBrokerage ? `${safeFirmName}_bill_custom_${customBrokerage}.html` : `${safeFirmName}_bill.html`;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  },

  downloadUserExcel: async (userId, financialYear, customBrokerage = null, firmName = null) => {
    const url = `/Brokerage/excel/user/${userId}/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    const safeFirmName = firmName ? firmName.replace(/[^a-zA-Z0-9]/g, '_') : userId;
    const filename = customBrokerage ? `${safeFirmName}_bill_custom_${customBrokerage}.xlsx` : `${safeFirmName}_bill.xlsx`;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  },

  downloadUserPdf: async (userId, financialYear, customBrokerage = null, firmName = null) => {
    const url = `/Brokerage/bill/pdf/${userId}/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    const safeFirmName = firmName ? firmName.replace(/[^a-zA-Z0-9]/g, '_') : userId;
    const filename = customBrokerage ? `${safeFirmName}_bill_custom_${customBrokerage}.pdf` : `${safeFirmName}_bill.pdf`;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  },

  downloadPrintBill: async (userId, financialYear, options = {}) => {
    const { customBrokerage = null } = options;
    const url = `/Brokerage/print-bill/${userId}/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `print-bill-${userId}.html`;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
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
    return { status: 'success', data: response.data };
  },

  bulkBillsByUsers: async (userIds, financialYear, customBrokerage = null) => {
    const url = `/Brokerage/bulk-bills/html/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.post(url, userIds);
    return { status: 'success', data: response.data };
  },

  bulkExcelByCity: async (city, financialYear) => {
    const response = await api.post(`/Brokerage/bulk-excel/city/${city}/${financialYear}`);
    return { status: 'success', data: response.data };
  },

  bulkExcelByUsers: async (userIds, financialYear, customBrokerage = null) => {
    const url = `/Brokerage/bulk-excel/users/${financialYear}${customBrokerage ? `?customBrokerage=${customBrokerage}` : ''}`;
    const response = await api.post(url, userIds);
    return { status: 'success', data: response.data };
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

  // Document Download API
  downloadDocument: async (documentId) => {
    const response = await api.get(`/Documents/download/${documentId}`, {
      responseType: 'blob'
    });
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `document-${documentId}.zip`;

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  },

  // Cache Management
  clearBrokerageCache: async () => {
    const response = await api.delete('/Cache/brokerage');
    return response.data;
  }
};
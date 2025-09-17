import api from './api';

export const bulkBillService = {
  /**
   * Download bulk bills in HTML format
   * @param {number[]} userIds - Array of user IDs
   * @param {number} financialYearId - Financial year ID
   * @returns {Promise<Blob>} ZIP file blob
   */
  async downloadHtmlBills(userIds, financialYearId) {
    const response = await api.post(
      `/Brokerage/bulk-bills/html/${financialYearId}`,
      userIds,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Download bulk bills in Excel format
   * @param {number[]} userIds - Array of user IDs
   * @param {number} financialYearId - Financial year ID
   * @returns {Promise<Blob>} ZIP file blob
   */
  async downloadExcelBills(userIds, financialYearId) {
    const response = await api.post(
      `/Brokerage/bulk-bills/excel/${financialYearId}`,
      userIds,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Trigger file download in browser
   * @param {Blob} blob - File blob
   * @param {string} filename - Download filename
   */
  triggerDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
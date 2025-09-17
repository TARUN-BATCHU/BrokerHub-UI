import { useState } from 'react';
import { bulkBillService } from '../services/bulkBillService';

export const useBulkBills = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadBulkBills = async (userIds, financialYearId, format = 'excel') => {
    if (!userIds || userIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let blob;
      let filename;

      if (format === 'html') {
        blob = await bulkBillService.downloadHtmlBills(userIds, financialYearId);
        filename = `bulk-bills-html-FY${financialYearId}.zip`;
      } else {
        blob = await bulkBillService.downloadExcelBills(userIds, financialYearId);
        filename = `bulk-bills-excel-FY${financialYearId}.zip`;
      }

      bulkBillService.triggerDownload(blob, filename);
      
      return {
        success: true,
        message: `Successfully downloaded ${userIds.length} ${format.toUpperCase()} bills!`
      };

    } catch (err) {
      const errorMessage = err.message || 'Failed to download bulk bills';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    downloadBulkBills,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
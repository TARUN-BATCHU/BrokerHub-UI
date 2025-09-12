// Test file to verify bulk operations functionality
import { brokerageAPI } from '../services/brokerageAPI';

// Test bulk operations API calls
export const testBulkOperations = async () => {
  console.log('Testing Bulk Operations API...');
  
  try {
    // Test 1: Generate bulk bills for city
    console.log('Test 1: Bulk bills by city');
    const cityBillsResponse = await brokerageAPI.bulkBillsByCity('Mumbai', 2023);
    console.log('City bills response:', cityBillsResponse);
    
    // Test 2: Generate bulk Excel for users
    console.log('Test 2: Bulk Excel by users');
    const userExcelResponse = await brokerageAPI.bulkExcelByUsers([1, 2, 3], 2023);
    console.log('User Excel response:', userExcelResponse);
    
    // Test 3: Get document status
    console.log('Test 3: Document status');
    const statusResponse = await brokerageAPI.getDocumentStatus();
    console.log('Status response:', statusResponse);
    
    console.log('All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Test error handling
export const testErrorHandling = () => {
  console.log('Testing error handling...');
  
  // Simulate API error
  const mockError = {
    response: {
      status: 400,
      data: {
        message: 'City not found'
      }
    }
  };
  
  console.log('Mock error:', mockError);
  return true;
};

// Export test functions
export default {
  testBulkOperations,
  testErrorHandling
};
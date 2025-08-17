// Test file to verify new API integrations
// This file can be used to test the API endpoints manually

import { productAPI, ledgerDetailsAPI } from '../services/api';

// Test function for product API
export const testProductAPI = async () => {
  try {
    console.log('Testing Product API...');
    const products = await productAPI.getProductNamesAndQualitiesAndQuantitesWithId();
    console.log('Products with details:', products);
    return products;
  } catch (error) {
    console.error('Product API test failed:', error);
    throw error;
  }
};

// Test function for ledger details by date
export const testLedgerDetailsByDate = async (date, brokerId) => {
  try {
    console.log(`Testing Ledger Details by Date API for ${date}...`);
    const ledgerDetails = await ledgerDetailsAPI.getLedgerDetailsByDate(date, brokerId);
    console.log('Ledger details by date:', ledgerDetails);
    return ledgerDetails;
  } catch (error) {
    console.error('Ledger Details by Date API test failed:', error);
    throw error;
  }
};

// Test function for ledger details by transaction number
export const testLedgerDetailsByTransactionNumber = async (transactionNumber, brokerId) => {
  try {
    console.log(`Testing Ledger Details by Transaction Number API for transaction ${transactionNumber}...`);
    const ledgerDetails = await ledgerDetailsAPI.getOptimizedLedgerDetailsByTransactionNumber(transactionNumber, brokerId);
    console.log('Ledger details by transaction number:', ledgerDetails);
    return ledgerDetails;
  } catch (error) {
    console.error('Ledger Details by Transaction Number API test failed:', error);
    throw error;
  }
};

// Test function for creating ledger details
export const testCreateLedgerDetails = async (ledgerData) => {
  try {
    console.log('Testing Create Ledger Details API...');
    const result = await ledgerDetailsAPI.createLedgerDetails(ledgerData);
    console.log('Create ledger details result:', result);
    return result;
  } catch (error) {
    console.error('Create Ledger Details API test failed:', error);
    throw error;
  }
};

// Sample test data for creating ledger details
export const sampleLedgerData = {
  brokerId: 1,
  brokerage: 500,
  fromSeller: 10,
  date: "2024-01-15",
  ledgerRecordDTOList: [
    {
      buyerName: "ABC Traders",
      productId: 1,
      quantity: 10,
      brokerage: 50,
      productCost: 25000
    },
    {
      buyerName: "PQR Trading",
      productId: 1,
      quantity: 15,
      brokerage: 75,
      productCost: 37500
    }
  ]
};

// Run all tests
export const runAllTests = async () => {
  const brokerId = localStorage.getItem('brokerId');
  const testDate = '2024-01-15';
  const testTransactionNumber = 1;

  try {
    console.log('=== Running API Integration Tests ===');
    
    // Test 1: Product API
    await testProductAPI();
    
    // Test 2: Ledger Details by Date
    await testLedgerDetailsByDate(testDate, brokerId);
    
    // Test 3: Ledger Details by Transaction Number
    await testLedgerDetailsByTransactionNumber(testTransactionNumber, brokerId);
    
    console.log('=== All tests completed successfully ===');
  } catch (error) {
    console.error('=== Test suite failed ===', error);
  }
};
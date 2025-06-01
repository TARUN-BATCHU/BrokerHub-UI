// Utility functions to transform API analytics data to chart-compatible format

/**
 * Transform financial year analytics API response to dashboard analytics format
 * @param {Object} apiData - The API response data
 * @returns {Object} Transformed data for dashboard charts
 */
export const transformFinancialYearAnalytics = (apiData) => {
  if (!apiData) return null;

  // Transform monthly sales data
  const monthlySales = apiData.monthlyAnalytics?.map(month => ({
    month: formatMonthName(month.month),
    sales: month.totalTransactionValue || 0,
    quantity: month.totalQuantity || 0,
    brokerage: month.totalBrokerage || 0,
    transactions: month.totalTransactions || 0
  })) || [];

  // Transform product analytics
  const productAnalytics = apiData.overallProductTotals?.map(product => ({
    product: product.productName,
    quantity: product.totalQuantity || 0,
    value: product.totalTransactionValue || 0,
    percentage: calculatePercentage(product.totalTransactionValue, apiData.totalTransactionValue),
    avgPrice: product.averagePrice || 0,
    brokerage: product.totalBrokerage || 0,
    transactions: product.totalTransactions || 0
  })) || [];

  // Transform city analytics
  const cityAnalytics = apiData.overallCityTotals?.map(city => ({
    city: city.cityName,
    buyers: city.totalBuyers || 0,
    sellers: city.totalSellers || 0,
    totalVolume: city.totalQuantity || 0,
    totalValue: city.totalTransactionValue || 0,
    avgPrice: city.totalQuantity > 0 ? (city.totalTransactionValue / city.totalQuantity) : 0,
    brokerage: city.totalBrokerage || 0,
    transactions: city.totalTransactions || 0
  })) || [];

  // Transform merchant type analytics
  const merchantTypeAnalytics = apiData.overallMerchantTypeTotals?.map(merchant => ({
    type: merchant.merchantType,
    totalSold: merchant.totalQuantitySold || 0,
    totalBought: merchant.totalQuantityBought || 0,
    totalBrokerage: merchant.totalBrokeragePaid || 0,
    totalValue: merchant.totalTransactionValue || 0,
    totalTransactions: merchant.totalTransactions || 0,
    totalMerchants: merchant.totalMerchants || 0
  })) || [];

  // Create top buyers and sellers from city data (simplified)
  const topBuyers = cityAnalytics
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
    .map((city, index) => ({
      id: index + 1,
      name: `Top Buyer in ${city.city}`,
      city: city.city,
      totalPurchases: city.totalValue,
      quantity: city.totalVolume,
      transactions: city.transactions,
      type: 'BUYER'
    }));

  const topSellers = cityAnalytics
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
    .map((city, index) => ({
      id: index + 1,
      name: `Top Seller in ${city.city}`,
      city: city.city,
      totalSales: city.totalValue,
      quantity: city.totalVolume,
      transactions: city.transactions,
      type: 'SELLER'
    }));

  return {
    sales: {
      totalSales: apiData.totalTransactionValue || 0,
      totalQuantity: apiData.totalQuantity || 0,
      totalTransactions: apiData.totalTransactions || 0,
      totalBrokerage: apiData.totalBrokerage || 0,
      monthlyGrowth: calculateMonthlyGrowth(monthlySales),
      monthlySales
    },
    topBuyers,
    topSellers,
    cityAnalytics,
    productAnalytics,
    merchantTypeAnalytics,
    financialYearInfo: {
      id: apiData.financialYearId,
      name: apiData.financialYearName,
      startDate: apiData.startDate,
      endDate: apiData.endDate
    }
  };
};

/**
 * Format month string to display format
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {string} Formatted month name
 */
const formatMonthName = (monthStr) => {
  if (!monthStr) return '';
  
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return monthNames[monthIndex] || monthStr;
};

/**
 * Calculate percentage of a value relative to total
 * @param {number} value - The value
 * @param {number} total - The total value
 * @returns {number} Percentage
 */
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate monthly growth percentage
 * @param {Array} monthlySales - Array of monthly sales data
 * @returns {number} Growth percentage
 */
const calculateMonthlyGrowth = (monthlySales) => {
  if (!monthlySales || monthlySales.length < 2) return 0;
  
  const lastMonth = monthlySales[monthlySales.length - 1];
  const previousMonth = monthlySales[monthlySales.length - 2];
  
  if (!previousMonth.sales || previousMonth.sales === 0) return 0;
  
  return Math.round(((lastMonth.sales - previousMonth.sales) / previousMonth.sales) * 100 * 10) / 10;
};

/**
 * Compare two financial year analytics data
 * @param {Object} currentData - Current financial year data
 * @param {Object} compareData - Comparison financial year data
 * @returns {Object} Comparison metrics
 */
export const compareFinancialYears = (currentData, compareData) => {
  if (!currentData || !compareData) return null;

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  return {
    salesChange: calculateChange(currentData.sales.totalSales, compareData.sales.totalSales),
    quantityChange: calculateChange(currentData.sales.totalQuantity, compareData.sales.totalQuantity),
    transactionsChange: calculateChange(currentData.sales.totalTransactions, compareData.sales.totalTransactions),
    brokerageChange: calculateChange(currentData.sales.totalBrokerage, compareData.sales.totalBrokerage),
    productComparison: compareProductData(currentData.productAnalytics, compareData.productAnalytics),
    cityComparison: compareCityData(currentData.cityAnalytics, compareData.cityAnalytics)
  };
};

/**
 * Compare product analytics between two periods
 * @param {Array} currentProducts - Current period product data
 * @param {Array} compareProducts - Comparison period product data
 * @returns {Array} Product comparison data
 */
const compareProductData = (currentProducts, compareProducts) => {
  if (!currentProducts || !compareProducts) return [];

  return currentProducts.map(current => {
    const previous = compareProducts.find(p => p.product === current.product);
    const previousValue = previous ? previous.value : 0;
    const previousQuantity = previous ? previous.quantity : 0;

    return {
      ...current,
      valueChange: calculateChange(current.value, previousValue),
      quantityChange: calculateChange(current.quantity, previousQuantity)
    };
  });
};

/**
 * Compare city analytics between two periods
 * @param {Array} currentCities - Current period city data
 * @param {Array} compareCities - Comparison period city data
 * @returns {Array} City comparison data
 */
const compareCityData = (currentCities, compareCities) => {
  if (!currentCities || !compareCities) return [];

  return currentCities.map(current => {
    const previous = compareCities.find(c => c.city === current.city);
    const previousValue = previous ? previous.totalValue : 0;
    const previousVolume = previous ? previous.totalVolume : 0;

    return {
      ...current,
      valueChange: calculateChange(current.totalValue, previousValue),
      volumeChange: calculateChange(current.totalVolume, previousVolume)
    };
  });
};

const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

// Update the analytics transformer to handle transaction summary data
const transformLedgerDetails = (ledgerDetails) => {
  return ledgerDetails.map(detail => {
    // Extract transaction summary data if available
    const transactionSummary = detail.transactionSummary || {
      totalBagsSoldInTransaction: calculateTotalBags(detail.records || []),
      totalBrokerageInTransaction: calculateTotalBrokerage(detail.records || []),
      totalReceivableAmountInTransaction: calculateTotalAmount(detail.records || []),
      averageBrokeragePerBag: detail.records?.length > 0 
        ? calculateTotalBrokerage(detail.records) / calculateTotalBags(detail.records) 
        : 0,
      numberOfProducts: [...new Set(detail.records?.map(r => r.product?.productId) || [])].length,
      numberOfBuyers: [...new Set(detail.records?.map(r => r.toBuyer?.userId) || [])].length
    };
    
    return {
      ...detail,
      transactionSummary
    };
  });
};

// Helper functions
const calculateTotalBags = (records) => {
  return records.reduce((total, record) => total + (record.quantity || 0), 0);
};

const calculateTotalBrokerage = (records) => {
  return records.reduce((total, record) => total + (record.totalBrokerage || 0), 0);
};

const calculateTotalAmount = (records) => {
  return records.reduce((total, record) => total + (record.totalProductsCost || 0), 0);
};

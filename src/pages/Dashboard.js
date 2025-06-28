import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI, merchantAPI, productAPI, addressAPI, analyticsAPI, financialYearAPI, dailyLedgerAPI } from '../services/api';
import {
  SalesChart,
  QuantityChart,
  ProductPieChart,
  CityChart,
  TopPerformersChart,
  MerchantTypeChart,
  BrokerageChart,
  TopBuyersByQuantityChart,
  TopSellersByQuantityChart,
  TopMerchantsByBrokerageChart,
  BrokerageDistributionPieChart
} from '../components/Charts';
import AddressModal from '../components/AddressModal';
import ProductEditModal from '../components/ProductEditModal';
import AnimatedChartWrapper from '../components/AnimatedChartWrapper';
import AnalyticsControls from '../components/AnalyticsControls';
import TodayMarket from '../components/TodayMarket';
import useResponsive from '../hooks/useResponsive';
import { useTheme } from '../contexts/ThemeContext';
import { transformFinancialYearAnalytics, compareFinancialYears } from '../utils/analyticsTransformer';
import {
  mockSalesData,
  mockTopBuyers,
  mockTopSellers,
  mockCityAnalytics,
  mockProductAnalytics
} from '../utils/mockData';
import {
  mockBrokeragePayments,
  mockPendingPayments,
  mockReceivablePayments
} from '../utils/mockPaymentData';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const { theme } = useTheme();
  const [brokerData, setBrokerData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    sales: mockSalesData,
    topBuyers: mockTopBuyers,
    topSellers: mockTopSellers,
    cityAnalytics: mockCityAnalytics,
    productAnalytics: mockProductAnalytics
  });

  // New analytics state
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);
  const [compareFinancialYear, setCompareFinancialYear] = useState(null);
  const [useRealData, setUseRealData] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [realAnalyticsData, setRealAnalyticsData] = useState(null);
  const [compareAnalyticsData, setCompareAnalyticsData] = useState(null);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Top performers data state
  const [topPerformersData, setTopPerformersData] = useState(null);
  const [topBuyersByQuantity, setTopBuyersByQuantity] = useState([]);
  const [topMerchantsByBrokerage, setTopMerchantsByBrokerage] = useState([]);
  const [topPerformersLoading, setTopPerformersLoading] = useState(false);

  // Payments state
  const [activePaymentTab, setActivePaymentTab] = useState('brokerage');
  const [brokeragePayments, setBrokeragePayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [receivablePayments, setReceivablePayments] = useState([]);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showPartPaymentModal, setShowPartPaymentModal] = useState(false);
  const [partPaymentAmount, setPartPaymentAmount] = useState('');
  const [partPaymentMethod, setPartPaymentMethod] = useState('CASH');

  // Search state for payments
  const [brokerageSearchTerm, setBrokerageSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [receivableSearchTerm, setReceivableSearchTerm] = useState('');
  const [showBrokerageDropdown, setShowBrokerageDropdown] = useState(false);
  const [showPendingDropdown, setShowPendingDropdown] = useState(false);
  const [showReceivableDropdown, setShowReceivableDropdown] = useState(false);

  // Mock firm names for search dropdown (in real app, this would come from API)
  const [firmNames] = useState([
    'Tarun Traders',
    'Siri Traders',
    'Krishna Mills',
    'Rama Traders',
    'Lakshmi Mills',
    'Venkat Traders',
    'Sai Mills',
    'Ganga Traders',
    'Surya Mills',
    'Priya Traders'
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [expandedCities, setExpandedCities] = useState({});
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const savedBrokerData = localStorage.getItem('brokerData');

    console.log('Dashboard - Saved broker data:', savedBrokerData);

    if (!savedBrokerData) {
      console.log('No broker data found, redirecting to login');
      navigate('/login');
      return;
    }

    if (savedBrokerData) {
      try {
        const parsedData = JSON.parse(savedBrokerData);
        console.log('Dashboard - Parsed broker data:', parsedData);
        setBrokerData(parsedData);
      } catch (error) {
        console.error('Error parsing broker data:', error);
        // If parsing fails, create a default broker data structure
        setBrokerData({
          brokerName: 'Broker User',
          userName: 'user',
          brokerageFirmName: 'BrokerHub',
          email: 'user@brokerhub.com',
          phoneNumber: 'N/A',
          pincode: 'N/A',
          BankName: 'N/A',
          Branch: 'N/A',
          AccountNumber: 'N/A',
          IfscCode: 'N/A'
        });
      }
    } else {
      // If no broker data, create a default structure
      console.log('No broker data found, using default');
      setBrokerData({
        brokerName: 'Broker User',
        userName: 'user',
        brokerageFirmName: 'BrokerHub',
        email: 'user@brokerhub.com',
        phoneNumber: 'N/A',
        pincode: 'N/A',
        BankName: 'N/A',
        Branch: 'N/A',
        AccountNumber: 'N/A',
        IfscCode: 'N/A'
      });
    }

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }

    // Load analytics data (using mock data for now)
    loadAnalyticsData();

    // Load real broker data (only if not already loaded during login)
    if (!savedBrokerData || savedBrokerData === 'null') {
      console.log('No broker data found, attempting to load...');
      loadBrokerData();
    } else {
      console.log('Broker data already available from login');
    }

    // Load merchants data
    loadMerchantsData();

    // Load products data
    loadProductsData();

    // Load addresses data
    loadAddressesData();

    // Load payment data
    loadPaymentData();
  }, [navigate, location]);

  const loadAnalyticsData = async () => {
    try {
      if (useRealData && selectedFinancialYear) {
        await loadRealAnalyticsData();
      } else {
        // Using mock data
        setAnalyticsData({
          sales: mockSalesData,
          topBuyers: mockTopBuyers,
          topSellers: mockTopSellers,
          cityAnalytics: mockCityAnalytics,
          productAnalytics: mockProductAnalytics
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadRealAnalyticsData = async () => {
    if (!selectedFinancialYear) return;

    setAnalyticsLoading(true);
    try {
      console.log('Loading analytics for financial year:', selectedFinancialYear.yearId);

      const apiData = await analyticsAPI.getFinancialYearAnalytics(selectedFinancialYear.yearId);
      console.log('Raw analytics API response:', apiData);

      const transformedData = transformFinancialYearAnalytics(apiData);
      console.log('Transformed analytics data:', transformedData);

      if (transformedData) {
        setRealAnalyticsData(transformedData);
        setAnalyticsData(transformedData);
      }

      // Load top performers data
      await loadTopPerformersData();

      // Load comparison data if needed
      if (showComparison && compareFinancialYear) {
        await loadComparisonData();
      }
    } catch (error) {
      console.error('Error loading real analytics data:', error);
      // Don't fall back to mock data when real data is selected
      // Show error state instead
      setRealAnalyticsData(null);
      setAnalyticsData(null);
      alert(`Failed to fetch real analytics data: ${error.message || 'Server error occurred'}`);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadComparisonData = async () => {
    if (!compareFinancialYear || !selectedFinancialYear) return;

    try {
      const compareApiData = await analyticsAPI.getFinancialYearAnalytics(compareFinancialYear.yearId);
      const compareTransformedData = transformFinancialYearAnalytics(compareApiData);

      if (compareTransformedData && realAnalyticsData) {
        setCompareAnalyticsData(compareTransformedData);
        const comparison = compareFinancialYears(realAnalyticsData, compareTransformedData);
        setComparisonMetrics(comparison);
      }
    } catch (error) {
      console.error('Error loading comparison data:', error);
      alert(`Failed to fetch comparison data: ${error.message || 'Server error occurred'}`);
      setCompareAnalyticsData(null);
      setComparisonMetrics(null);
    }
  };

  // Handler functions for analytics controls
  const handleFinancialYearChange = (financialYear) => {
    setSelectedFinancialYear(financialYear);
    if (useRealData && financialYear) {
      loadRealAnalyticsData();
      loadTopPerformersData();
    }
  };

  const handleCompareFinancialYearChange = (financialYear) => {
    setCompareFinancialYear(financialYear);
    if (useRealData && financialYear && selectedFinancialYear) {
      loadComparisonData();
    }
  };

  const handleDataSourceToggle = (useReal) => {
    setUseRealData(useReal);
    if (useReal && selectedFinancialYear) {
      loadRealAnalyticsData();
      loadTopPerformersData();
    } else {
      // Switch back to mock data
      setAnalyticsData({
        sales: mockSalesData,
        topBuyers: mockTopBuyers,
        topSellers: mockTopSellers,
        cityAnalytics: mockCityAnalytics,
        productAnalytics: mockProductAnalytics
      });
      setRealAnalyticsData(null);
      setCompareAnalyticsData(null);
      setComparisonMetrics(null);
      // Reset top performers data
      setTopPerformersData(null);
      setTopBuyersByQuantity([]);
      setTopMerchantsByBrokerage([]);
    }
  };

  const handleToggleComparison = (show) => {
    setShowComparison(show);
    if (!show) {
      setCompareFinancialYear(null);
      setCompareAnalyticsData(null);
      setComparisonMetrics(null);
    }
  };

  const loadBrokerData = async () => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (brokerId) {
        console.log('Loading broker data for ID:', brokerId);
        const brokerData = await authAPI.getBrokerProfile(brokerId);
        console.log('Loaded broker data:', brokerData);
        setBrokerData(brokerData);
        // Update localStorage with fresh data
        localStorage.setItem('brokerData', JSON.stringify(brokerData));
      }
    } catch (error) {
      console.error('Error loading broker data:', error);
      alert(`Failed to fetch broker profile: ${error.message || 'Server error occurred'}`);
    }
  };

  const loadMerchantsData = async () => {
    setLoading(true);
    try {
      console.log('Loading merchants data...');
      const merchantsData = await merchantAPI.getAllMerchants();
      console.log('Loaded merchants data:', merchantsData);
      console.log('Type of merchants data:', typeof merchantsData);
      console.log('Is array:', Array.isArray(merchantsData));

      // Ensure we always set an array
      if (Array.isArray(merchantsData)) {
        setMerchants(merchantsData);
      } else if (merchantsData && typeof merchantsData === 'object') {
        // If it's an object, try to extract array from common properties
        if (Array.isArray(merchantsData.data)) {
          setMerchants(merchantsData.data);
        } else if (Array.isArray(merchantsData.users)) {
          setMerchants(merchantsData.users);
        } else if (Array.isArray(merchantsData.merchants)) {
          setMerchants(merchantsData.merchants);
        } else {
          console.warn('Merchants data is not an array and no array found in object:', merchantsData);
          setMerchants([]);
        }
      } else {
        console.warn('Merchants data is not an array or object:', merchantsData);
        setMerchants([]);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
      alert(`Failed to fetch merchants data: ${error.message || 'Server error occurred'}`);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsData = async () => {
    try {
      console.log('Loading products data...');
      const productsData = await productAPI.getAllProducts(0, 100); // Load first 100 products
      console.log('Loaded products data:', productsData);

      // Ensure we always set an array
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else {
        console.warn('Products data is not an array:', productsData);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert(`Failed to fetch products data: ${error.message || 'Server error occurred'}`);
      setProducts([]);
    }
  };

  const loadAddressesData = async () => {
    try {
      console.log('Loading addresses data...');
      const addressesData = await addressAPI.getAllAddresses();
      console.log('Loaded addresses data:', addressesData);

      // Ensure we always set an array
      if (Array.isArray(addressesData)) {
        setAddresses(addressesData);
      } else {
        console.warn('Addresses data is not an array:', addressesData);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      alert(`Failed to fetch addresses data: ${error.message || 'Server error occurred'}`);
      setAddresses([]);
    }
  };

  // Load top performers data
  const loadTopPerformersData = async () => {
    if (!useRealData || !selectedFinancialYear) return;

    setTopPerformersLoading(true);
    try {
      console.log('Loading top performers data for financial year:', selectedFinancialYear.yearId);

      // Load all top performers data in parallel
      const [topPerformersResponse, topBuyersResponse, topMerchantsResponse] = await Promise.all([
        analyticsAPI.getTopPerformers(selectedFinancialYear.yearId),
        analyticsAPI.getTop5BuyersByQuantity(selectedFinancialYear.yearId),
        analyticsAPI.getTop5MerchantsByBrokerage(selectedFinancialYear.yearId)
      ]);

      console.log('Top performers response:', topPerformersResponse);
      console.log('Top buyers response:', topBuyersResponse);
      console.log('Top merchants response:', topMerchantsResponse);

      setTopPerformersData(topPerformersResponse);
      setTopBuyersByQuantity(topBuyersResponse);
      setTopMerchantsByBrokerage(topMerchantsResponse);

    } catch (error) {
      console.error('Error loading top performers data:', error);
      alert(`Failed to fetch top performers data: ${error.message || 'Server error occurred'}`);
      // Reset to empty arrays on error
      setTopPerformersData(null);
      setTopBuyersByQuantity([]);
      setTopMerchantsByBrokerage([]);
    } finally {
      setTopPerformersLoading(false);
    }
  };

  // Load payment data
  const loadPaymentData = () => {
    try {
      console.log('Loading payment data...');
      setBrokeragePayments(mockBrokeragePayments);
      setPendingPayments(mockPendingPayments);
      setReceivablePayments(mockReceivablePayments);
      console.log('Payment data loaded successfully');
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowBrokerageDropdown(false);
        setShowPendingDropdown(false);
        setShowReceivableDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search and filter functions for payments
  const getFilteredBrokeragePayments = () => {
    if (!brokerageSearchTerm) return brokeragePayments;
    return brokeragePayments.filter(payment =>
      payment.firmName.toLowerCase().includes(brokerageSearchTerm.toLowerCase())
    );
  };

  const getFilteredPendingPayments = () => {
    if (!pendingSearchTerm) return pendingPayments;
    return pendingPayments.filter(payment =>
      payment.buyerFirm.toLowerCase().includes(pendingSearchTerm.toLowerCase())
    );
  };

  const getFilteredReceivablePayments = () => {
    if (!receivableSearchTerm) return receivablePayments;
    return receivablePayments.filter(payment =>
      payment.sellerFirm.toLowerCase().includes(receivableSearchTerm.toLowerCase())
    );
  };

  const getFilteredFirmNames = (searchTerm) => {
    if (!searchTerm) return firmNames;
    return firmNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleFirmSelect = (firmName, section) => {
    switch(section) {
      case 'brokerage':
        setBrokerageSearchTerm(firmName);
        setShowBrokerageDropdown(false);
        break;
      case 'pending':
        setPendingSearchTerm(firmName);
        setShowPendingDropdown(false);
        break;
      case 'receivable':
        setReceivableSearchTerm(firmName);
        setShowReceivableDropdown(false);
        break;
    }

    // In real app, make API call here to get merchant details
    console.log(`Selected firm: ${firmName} in section: ${section}`);
    // TODO: Implement API call to backend
  };

  const clearSearch = (section) => {
    switch(section) {
      case 'brokerage':
        setBrokerageSearchTerm('');
        setShowBrokerageDropdown(false);
        break;
      case 'pending':
        setPendingSearchTerm('');
        setShowPendingDropdown(false);
        break;
      case 'receivable':
        setReceivableSearchTerm('');
        setShowReceivableDropdown(false);
        break;
    }
  };

  // Payment handler functions
  const handleViewPaymentDetail = (payment, type) => {
    setSelectedPaymentDetail({ ...payment, type });
    setShowPaymentDetailModal(true);
  };

  const handleAddPartPayment = (payment) => {
    setSelectedPaymentDetail(payment);
    setShowPartPaymentModal(true);
    setPartPaymentAmount('');
  };

  const handlePartPaymentSubmit = async () => {
    if (!partPaymentAmount || !selectedPaymentDetail) return;

    try {
      const amount = parseFloat(partPaymentAmount);
      if (amount <= 0 || amount > selectedPaymentDetail.pendingAmount) {
        alert('Invalid payment amount');
        return;
      }

      // Simulate API call to update payment
      console.log('Adding part payment:', {
        merchantId: selectedPaymentDetail.merchantId,
        amount: amount,
        method: partPaymentMethod,
        date: new Date().toISOString().split('T')[0]
      });

      // Update local state
      setBrokeragePayments(prev => prev.map(payment => {
        if (payment.id === selectedPaymentDetail.id) {
          const newPaidAmount = payment.paidAmount + amount;
          const newPendingAmount = payment.pendingAmount - amount;
          const newStatus = newPendingAmount === 0 ? 'PAID' : 'PARTIAL_PAID';

          return {
            ...payment,
            paidAmount: newPaidAmount,
            pendingAmount: newPendingAmount,
            status: newStatus,
            lastPaymentDate: new Date().toISOString().split('T')[0],
            partPayments: [
              ...payment.partPayments,
              {
                id: `PP${Date.now()}`,
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                method: partPaymentMethod,
                notes: 'Part payment added'
              }
            ]
          };
        }
        return payment;
      }));

      setShowPartPaymentModal(false);
      setPartPaymentAmount('');
      setPartPaymentMethod('CASH');
      setSelectedPaymentDetail(null);
      alert('Part payment added successfully!');
    } catch (error) {
      console.error('Error adding part payment:', error);
      alert('Failed to add part payment');
    }
  };

  const closePaymentDetailModal = () => {
    setShowPaymentDetailModal(false);
    setSelectedPaymentDetail(null);
  };

  const closePartPaymentModal = () => {
    setShowPartPaymentModal(false);
    setSelectedPaymentDetail(null);
    setPartPaymentAmount('');
    setPartPaymentMethod('CASH');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return theme.success;
      case 'PARTIAL_PAID': return theme.warning;
      case 'PENDING': return theme.info;
      case 'OVERDUE': return theme.error;
      case 'DUE_SOON': return theme.warning;
      default: return theme.textSecondary;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'PAID': return theme.successBg;
      case 'PARTIAL_PAID': return theme.warningBg;
      case 'PENDING': return theme.infoBg;
      case 'OVERDUE': return theme.errorBg;
      case 'DUE_SOON': return theme.warningBg;
      default: return theme.background;
    }
  };

  const handleViewMerchant = (merchant) => {
    setSelectedMerchant(merchant);
    setShowMerchantModal(true);
  };

  const handleEditMerchant = (merchant) => {
    // Navigate to edit page or open edit modal
    console.log('Edit merchant:', merchant);
    // For now, just show the merchant data in console
    // You can implement a proper edit modal or navigate to edit page
    alert(`Edit functionality for ${merchant.firmName} - Coming soon!`);
  };

  const closeMerchantModal = () => {
    setShowMerchantModal(false);
    setSelectedMerchant(null);
  };



  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductEditModal(true);
  };

  const closeProductEditModal = () => {
    setShowProductEditModal(false);
    setEditingProduct(null);
  };

  const handleViewAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setSelectedAddress(null);
  };

  const toggleCityExpansion = (cityName) => {
    setExpandedCities(prev => ({
      ...prev,
      [cityName]: !prev[cityName]
    }));
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadMessage('');
    setUploadFile(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadMessage('');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - only .xlsx files are accepted according to the API spec
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.name.toLowerCase().endsWith('.xlsx');

      if (!isValidType) {
        setUploadMessage('❌ Please select a valid Excel file (.xlsx format only)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadMessage('❌ File size should be less than 10MB');
        return;
      }

      setUploadFile(file);
      setUploadMessage('');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setUploadMessage('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadMessage('⏳ Uploading and processing file...');

    try {
      const result = await merchantAPI.bulkUploadMerchants(uploadFile);
      console.log('Upload result:', result);

      // Handle the detailed response from backend
      if (result.totalRecords) {
        let message = `📊 Upload Complete!\n`;
        message += `Total Records: ${result.totalRecords}\n`;
        message += `✅ Successful: ${result.successfulRecords}\n`;

        if (result.failedRecords > 0) {
          message += `❌ Failed: ${result.failedRecords}\n`;

          if (result.errorMessages && result.errorMessages.length > 0) {
            message += `\nErrors:\n`;
            result.errorMessages.slice(0, 5).forEach(error => {
              message += `• ${error}\n`;
            });

            if (result.errorMessages.length > 5) {
              message += `... and ${result.errorMessages.length - 5} more errors`;
            }
          }
        }

        setUploadMessage(message);

        // If there were successful uploads, refresh the merchant list
        if (result.successfulRecords > 0) {
          setTimeout(() => {
            loadMerchantsData();
          }, 2000);
        }

      } else {
        // Fallback for simple success response
        setUploadMessage('✅ File uploaded successfully! Merchant data will be reflected soon.');
      }

      setUploadFile(null);

      // Auto-close modal after 8 seconds (more time to read detailed results)
      setTimeout(() => {
        closeUploadModal();
      }, 8000);

    } catch (error) {
      console.error('Upload error:', error);

      // Handle different types of errors
      if (error.message) {
        setUploadMessage(`❌ Upload failed: ${error.message}`);
      } else if (typeof error === 'string') {
        setUploadMessage(`❌ Upload failed: ${error}`);
      } else {
        setUploadMessage('❌ Upload failed. Please check the file format and try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      console.log('Downloading Excel template from backend...');
      setUploadMessage('📥 Downloading template...');

      const blob = await merchantAPI.downloadTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user_bulk_upload_template.xlsx';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      setUploadMessage('✅ Template downloaded successfully!');

      // Clear message after 3 seconds
      setTimeout(() => {
        setUploadMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error downloading template:', error);
      setUploadMessage('❌ Failed to download template. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => {
        setUploadMessage('');
      }, 5000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const toggleProductExpansion = (productName) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('rice') || name.includes('chawal')) return '🍚';
    if (name.includes('dal') || name.includes('lentil')) return '🫘';
    if (name.includes('wheat') || name.includes('gehun')) return '🌾';
    if (name.includes('channa') || name.includes('chickpea')) return '🫛';
    if (name.includes('moong') || name.includes('mung')) return '🫛';
    if (name.includes('corn') || name.includes('maize')) return '🌽';
    if (name.includes('bajra') || name.includes('millet')) return '🌾';
    return '🌾'; // Default grain icon
  };



  // Group products by name for card display
  const groupProductsForCards = (products) => {
    const grouped = {};

    products.forEach(product => {
      const productName = product.productName || 'Unknown Product';

      if (!grouped[productName]) {
        grouped[productName] = {
          name: productName,
          products: [],
          totalQuantity: 0,
          avgPrice: 0,
          qualityCount: 0,
          imgLink: product.imgLink || null
        };
      }

      grouped[productName].products.push(product);
      grouped[productName].totalQuantity += product.quantity || 0;
    });

    // Calculate averages and counts
    Object.values(grouped).forEach(group => {
      const totalPrice = group.products.reduce((sum, p) => sum + (p.price || 0), 0);
      group.avgPrice = group.products.length > 0 ? totalPrice / group.products.length : 0;

      const uniqueQualities = [...new Set(group.products.map(p => p.quality || 'Standard'))];
      group.qualityCount = uniqueQualities.length;
    });

    return grouped;
  };

  // Show loading only briefly, then show dashboard with default data
  if (!brokerData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      backgroundColor: theme.background,
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Header */}
      <header className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: isMobile ? '16px' : '20px',
        backgroundColor: theme.headerBackground,
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        <div>
          <h1 className="responsive-text-2xl" style={{
            margin: 0,
            color: theme.textPrimary,
            fontSize: '28px',
            fontWeight: '700'
          }}>
            BrokerHub Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: theme.textSecondary,
            fontSize: isMobile ? '14px' : '16px'
          }}>
            Welcome back, {brokerData?.brokerName || 'Broker User'}!
          </p>
        </div>
        {/* Settings dropdown will be positioned here by App.js */}
      </header>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: theme.successBg,
          border: `1px solid ${theme.successBorder}`,
          color: theme.success,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}>
          {successMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        padding: '0',
        marginBottom: '20px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        <div className="dashboard-tabs" style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.borderLight}`,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'todaymarket', label: 'Today Market' },
            { id: 'payments', label: 'Payments' },
            { id: 'merchants', label: 'Merchants' },
            { id: 'products', label: 'Products' },
            { id: 'addresses', label: 'Addresses' },
            { id: 'profile', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="dashboard-tab"
              style={{
                padding: isMobile ? '12px 16px' : '16px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? theme.buttonPrimary : theme.textSecondary,
                fontWeight: activeTab === tab.id ? '600' : '400',
                borderBottom: activeTab === tab.id ? `2px solid ${theme.buttonPrimary}` : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = theme.textPrimary;
                  e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = theme.textSecondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Controls - Show only for overview and analytics tabs */}
      {(activeTab === 'overview' || activeTab === 'analytics') && (
        <AnalyticsControls
          selectedFinancialYear={selectedFinancialYear}
          onFinancialYearChange={handleFinancialYearChange}
          compareFinancialYear={compareFinancialYear}
          onCompareFinancialYearChange={handleCompareFinancialYearChange}
          useRealData={useRealData}
          onDataSourceToggle={handleDataSourceToggle}
          showComparison={showComparison}
          onToggleComparison={handleToggleComparison}
          loading={analyticsLoading}
        />
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Audit Ledger - Main Feature Highlight */}
          <div style={{
            background: `linear-gradient(135deg, ${theme.buttonPrimary} 0%, #8b5cf6 100%)`,
            padding: '32px',
            borderRadius: '16px',
            marginBottom: '30px',
            boxShadow: theme.shadowHover,
            border: `1px solid ${theme.border}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)'
            }}></div>

            <div style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '20px' : '0'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📊</span>
                  <h2 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: '700'
                  }}>
                    Audit Ledger Management
                  </h2>
                </div>
                <p style={{
                  margin: '0 0 16px 0',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '16px',
                  maxWidth: '500px'
                }}>
                  Manage financial years, track transactions, and audit your business records with our comprehensive ledger system.
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✅ Financial Year Management
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✅ Transaction Tracking
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✅ Audit Reports
                  </span>
                </div>
              </div>

              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <Link
                  to="/daily-ledger"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 24px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🚀</span>
                  Open Daily Ledger
                </Link>
                <p style={{
                  margin: '8px 0 0 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px'
                }}>
                  Start managing your financial records
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          {analyticsData ? (
          <>
          <div className="dashboard-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: isMobile ? '16px' : '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>Total Sales</p>
                  <h3 style={{ margin: '4px 0 0 0', color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {formatCurrency(analyticsData.sales.totalSales)}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: theme.infoBg,
                  padding: '12px',
                  borderRadius: '8px',
                  color: theme.info,
                  fontSize: '24px'
                }}>
                  💰
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', color: theme.success, fontSize: '12px' }}>
                +{analyticsData.sales.monthlyGrowth}% from last month
              </p>
            </div>

            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>Total Quantity</p>
                  <h3 style={{ margin: '4px 0 0 0', color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {formatNumber(analyticsData.sales.totalQuantity)} Tons
                  </h3>
                </div>
                <div style={{
                  backgroundColor: theme.successBg,
                  padding: '12px',
                  borderRadius: '8px',
                  color: theme.success,
                  fontSize: '24px'
                }}>
                  📦
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>Total Transactions</p>
                  <h3 style={{ margin: '4px 0 0 0', color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {formatNumber(analyticsData.sales.totalTransactions)}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: theme.warningBg,
                  padding: '12px',
                  borderRadius: '8px',
                  color: theme.warning,
                  fontSize: '24px'
                }}>
                  📊
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: theme.textSecondary, fontSize: '14px' }}>
                    {useRealData && analyticsData.sales.totalBrokerage ? 'Total Brokerage' : 'Active Merchants'}
                  </p>
                  <h3 style={{ margin: '4px 0 0 0', color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {useRealData && analyticsData.sales.totalBrokerage
                      ? formatCurrency(analyticsData.sales.totalBrokerage)
                      : merchants.length
                    }
                  </h3>
                </div>
                <div style={{
                  backgroundColor: useRealData && analyticsData.sales.totalBrokerage ? '#fef3c7' : '#ede9fe',
                  padding: '12px',
                  borderRadius: '8px',
                  color: useRealData && analyticsData.sales.totalBrokerage ? '#f59e0b' : '#8b5cf6',
                  fontSize: '24px'
                }}>
                  {useRealData && analyticsData.sales.totalBrokerage ? '💸' : '👥'}
                </div>
              </div>
              {useRealData && analyticsData.sales.totalBrokerage && (
                <p style={{ margin: '8px 0 0 0', color: theme.textSecondary, fontSize: '12px' }}>
                  Earned from {analyticsData.sales.totalTransactions} transactions
                </p>
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-charts-grid" style={{
            display: 'grid',
            gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '2fr 1fr',
            gap: isMobile ? '16px' : '20px',
            marginBottom: '30px'
          }}>
            <AnimatedChartWrapper
              title="Monthly Sales Performance"
              height={isMobile ? '300px' : '400px'}
            >
              <SalesChart data={analyticsData.sales.monthlySales} animated={true} />
            </AnimatedChartWrapper>

            <AnimatedChartWrapper
              title="Product Distribution"
              height={isMobile ? '300px' : '400px'}
            >
              <ProductPieChart data={analyticsData.productAnalytics} animated={true} />
            </AnimatedChartWrapper>
          </div>

          {/* Top Performers */}
          <div className="dashboard-analytics-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '16px' : '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Top Buyers</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {analyticsData.topBuyers.slice(0, 5).map((buyer, index) => (
                  <div key={buyer.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < 4 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>{buyer.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{buyer.city} • {buyer.type}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                        {formatCurrency(buyer.totalPurchases)}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {buyer.quantity} tons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Top Sellers</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {analyticsData.topSellers.slice(0, 5).map((seller, index) => (
                  <div key={seller.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < 4 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>{seller.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{seller.city} • {seller.type}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                        {formatCurrency(seller.totalSales)}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {seller.quantity} tons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>
        ) : useRealData ? (
            /* Error State for Real Data */
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '40px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', color: theme.error }}>Failed to Load Analytics Data</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>
                Unable to fetch real analytics data from the server. Please check your connection and try again.
              </p>
              <button
                onClick={() => selectedFinancialYear && loadRealAnalyticsData()}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.primary}`,
                  borderRadius: '6px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {analyticsData ? (
          <div>
          <div className="dashboard-analytics-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '16px' : '20px',
            marginBottom: '30px'
          }}>
            <AnimatedChartWrapper
              title="Monthly Quantity Sold"
              height={isMobile ? '300px' : '400px'}
            >
              <QuantityChart data={analyticsData.sales.monthlySales} animated={true} />
            </AnimatedChartWrapper>

            <AnimatedChartWrapper
              title="City-wise Buyers vs Sellers"
              height={isMobile ? '300px' : '400px'}
            >
              <CityChart data={analyticsData.cityAnalytics} animated={true} />
            </AnimatedChartWrapper>
          </div>

          <AnimatedChartWrapper
            title="Top 5 Buyers by Purchase Amount"
            height="400px"
            style={{ marginBottom: '20px' }}
          >
            <TopPerformersChart buyers={analyticsData.topBuyers} sellers={analyticsData.topSellers} animated={true} />
          </AnimatedChartWrapper>

          {/* New Analytics Charts - Show only with real data */}
          {useRealData && analyticsData.merchantTypeAnalytics && analyticsData.merchantTypeAnalytics.length > 0 && (
            <div className="dashboard-analytics-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '16px' : '20px',
              marginBottom: '30px'
            }}>
              <AnimatedChartWrapper
                title="Merchant Type Analytics"
                height={isMobile ? '300px' : '400px'}
              >
                <MerchantTypeChart data={analyticsData.merchantTypeAnalytics} animated={true} />
              </AnimatedChartWrapper>

              <AnimatedChartWrapper
                title="Monthly Brokerage Earnings"
                height={isMobile ? '300px' : '400px'}
              >
                <BrokerageChart data={analyticsData.sales.monthlySales} animated={true} />
              </AnimatedChartWrapper>
            </div>
          )}

          {/* Top Performers Charts - Show only with real data */}
          {useRealData && (topBuyersByQuantity.length > 0 || topMerchantsByBrokerage.length > 0 || (topPerformersData && topPerformersData.topSellersByQuantity && topPerformersData.topSellersByQuantity.length > 0)) && (
            <div>
              <h3 style={{
                margin: '30px 0 20px 0',
                color: theme.textPrimary,
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏆 Top Performers Analysis
              </h3>

              {/* Top Buyers and Sellers by Quantity */}
              {(topBuyersByQuantity.length > 0 || (topPerformersData && topPerformersData.topSellersByQuantity && topPerformersData.topSellersByQuantity.length > 0)) && (
                <div className="dashboard-analytics-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? '16px' : '20px',
                  marginBottom: '30px'
                }}>
                  {topBuyersByQuantity.length > 0 && (
                    <AnimatedChartWrapper
                      title="Top 5 Buyers by Quantity"
                      height={isMobile ? '300px' : '400px'}
                    >
                      <TopBuyersByQuantityChart data={topBuyersByQuantity} animated={true} />
                    </AnimatedChartWrapper>
                  )}

                  {topPerformersData && topPerformersData.topSellersByQuantity && topPerformersData.topSellersByQuantity.length > 0 && (
                    <AnimatedChartWrapper
                      title="Top Sellers by Quantity"
                      height={isMobile ? '300px' : '400px'}
                    >
                      <TopSellersByQuantityChart data={topPerformersData.topSellersByQuantity} animated={true} />
                    </AnimatedChartWrapper>
                  )}
                </div>
              )}

              {/* Top Merchants by Brokerage and Distribution */}
              {topMerchantsByBrokerage.length > 0 && (
                <div className="dashboard-analytics-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                  gap: isMobile ? '16px' : '20px',
                  marginBottom: '30px'
                }}>
                  <AnimatedChartWrapper
                    title="Top 5 Merchants by Brokerage"
                    height={isMobile ? '300px' : '400px'}
                  >
                    <TopMerchantsByBrokerageChart data={topMerchantsByBrokerage} animated={true} />
                  </AnimatedChartWrapper>

                  <AnimatedChartWrapper
                    title="Brokerage Distribution"
                    height={isMobile ? '300px' : '400px'}
                  >
                    <BrokerageDistributionPieChart data={topMerchantsByBrokerage} animated={true} />
                  </AnimatedChartWrapper>
                </div>
              )}
            </div>
          )}

          {/* Comparison Metrics - Show only when comparison is enabled */}
          {showComparison && comparisonMetrics && (
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              marginBottom: '30px',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Financial Year Comparison
                {selectedFinancialYear && compareFinancialYear && (
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: theme.textSecondary }}>
                    ({selectedFinancialYear.financialYearName} vs {compareFinancialYear.financialYearName})
                  </span>
                )}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Sales Change</p>
                  <p style={{
                    margin: 0,
                    color: comparisonMetrics.salesChange >= 0 ? theme.success : theme.error,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {comparisonMetrics.salesChange >= 0 ? '+' : ''}{comparisonMetrics.salesChange}%
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: theme.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Quantity Change</p>
                  <p style={{
                    margin: 0,
                    color: comparisonMetrics.quantityChange >= 0 ? theme.success : theme.error,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {comparisonMetrics.quantityChange >= 0 ? '+' : ''}{comparisonMetrics.quantityChange}%
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: theme.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Transactions Change</p>
                  <p style={{
                    margin: 0,
                    color: comparisonMetrics.transactionsChange >= 0 ? theme.success : theme.error,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {comparisonMetrics.transactionsChange >= 0 ? '+' : ''}{comparisonMetrics.transactionsChange}%
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: theme.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Brokerage Change</p>
                  <p style={{
                    margin: 0,
                    color: comparisonMetrics.brokerageChange >= 0 ? theme.success : theme.error,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {comparisonMetrics.brokerageChange >= 0 ? '+' : ''}{comparisonMetrics.brokerageChange}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* City Analytics Table */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>City-wise Performance</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Buyers</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Sellers</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Volume (Tons)</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.cityAnalytics.map((city, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{city.city}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{city.buyers}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{city.sellers}</td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{formatNumber(city.totalVolume)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{formatCurrency(city.totalValue)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>₹{city.avgPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          ) : useRealData ? (
            /* Error State for Real Data */
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '40px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', color: theme.error }}>Failed to Load Analytics Data</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>
                Unable to fetch real analytics data from the server. Please check your connection and try again.
              </p>
              <button
                onClick={() => selectedFinancialYear && loadRealAnalyticsData()}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.primary}`,
                  borderRadius: '6px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div>
          {/* Payment Tab Navigation */}
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            padding: '0',
            marginBottom: '20px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div className="payment-tabs" style={{
              display: 'flex',
              borderBottom: `1px solid ${theme.borderLight}`,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              {[
                { id: 'brokerage', label: 'Brokerage Payments', icon: '💰' },
                { id: 'pending', label: 'Pending Payments', icon: '⏳' },
                { id: 'receivable', label: 'Receivable Payments', icon: '💸' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePaymentTab(tab.id)}
                  className="payment-tab"
                  style={{
                    padding: isMobile ? '12px 16px' : '16px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activePaymentTab === tab.id ? theme.buttonPrimary : theme.textSecondary,
                    fontWeight: activePaymentTab === tab.id ? '600' : '400',
                    borderBottom: activePaymentTab === tab.id ? `2px solid ${theme.buttonPrimary}` : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (activePaymentTab !== tab.id) {
                      e.currentTarget.style.color = theme.textPrimary;
                      e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePaymentTab !== tab.id) {
                      e.currentTarget.style.color = theme.textSecondary;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brokerage Payments Tab */}
          {activePaymentTab === 'brokerage' && (
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '0'
              }}>
                <h3 style={{ margin: 0, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 Brokerage Payments ({getFilteredBrokeragePayments().length})
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Total Pending: ₹{getFilteredBrokeragePayments().reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Search Bar for Brokerage */}
              <div className="search-container" style={{
                marginBottom: '20px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  transition: 'all 0.2s ease'
                }}>
                  <span style={{ color: theme.textSecondary, fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by firm name..."
                    value={brokerageSearchTerm}
                    onChange={(e) => {
                      setBrokerageSearchTerm(e.target.value);
                      setShowBrokerageDropdown(true);
                    }}
                    onFocus={() => setShowBrokerageDropdown(true)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: theme.textPrimary,
                      fontSize: '14px',
                      flex: 1,
                      fontFamily: 'inherit'
                    }}
                  />
                  {brokerageSearchTerm && (
                    <button
                      onClick={() => clearSearch('brokerage')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textSecondary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown for firm suggestions */}
                {showBrokerageDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: theme.shadow,
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredFirmNames(brokerageSearchTerm).map((firmName, index) => (
                      <div
                        key={index}
                        onClick={() => handleFirmSelect(firmName, 'brokerage')}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: index < getFilteredFirmNames(brokerageSearchTerm).length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                          color: theme.textPrimary,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBackground}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {firmName}
                      </div>
                    ))}
                    {getFilteredFirmNames(brokerageSearchTerm).length === 0 && (
                      <div style={{
                        padding: '12px',
                        color: theme.textSecondary,
                        fontStyle: 'italic'
                      }}>
                        No firms found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isMobile ? '800px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.background }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Firm Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Sold Bags</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Bought Bags</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Rate (₹/bag)</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Net Brokerage</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Paid Amount</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Pending Amount</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBrokeragePayments().map((payment) => (
                      <tr key={payment.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '500', color: theme.textPrimary }}>{payment.firmName}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>{payment.ownerName} • {payment.city}</p>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          {payment.soldBags}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          {payment.boughtBags}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          ₹{payment.brokerageRate}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          ₹{payment.netBrokerage.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.success }}>
                          ₹{payment.paidAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: payment.pendingAmount > 0 ? theme.error : theme.success }}>
                          ₹{payment.pendingAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: getStatusBgColor(payment.status),
                            color: getStatusColor(payment.status)
                          }}>
                            {payment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewPaymentDetail(payment, 'brokerage')}
                              style={{
                                padding: '4px 8px',
                                border: `1px solid ${theme.info}`,
                                borderRadius: '4px',
                                backgroundColor: theme.infoBg,
                                color: theme.info,
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              View Details
                            </button>
                            {payment.pendingAmount > 0 && (
                              <button
                                onClick={() => handleAddPartPayment(payment)}
                                style={{
                                  padding: '4px 8px',
                                  border: `1px solid ${theme.success}`,
                                  borderRadius: '4px',
                                  backgroundColor: theme.successBg,
                                  color: theme.success,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Add Payment
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Payments Tab */}
          {activePaymentTab === 'pending' && (
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '0'
              }}>
                <h3 style={{ margin: 0, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⏳ Pending Payments ({getFilteredPendingPayments().length})
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Total Pending: ₹{getFilteredPendingPayments().reduce((sum, p) => sum + p.totalPendingAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Search Bar for Pending Payments */}
              <div className="search-container" style={{
                marginBottom: '20px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  transition: 'all 0.2s ease'
                }}>
                  <span style={{ color: theme.textSecondary, fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by buyer firm name..."
                    value={pendingSearchTerm}
                    onChange={(e) => {
                      setPendingSearchTerm(e.target.value);
                      setShowPendingDropdown(true);
                    }}
                    onFocus={() => setShowPendingDropdown(true)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: theme.textPrimary,
                      fontSize: '14px',
                      flex: 1,
                      fontFamily: 'inherit'
                    }}
                  />
                  {pendingSearchTerm && (
                    <button
                      onClick={() => clearSearch('pending')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textSecondary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown for firm suggestions */}
                {showPendingDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: theme.shadow,
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredFirmNames(pendingSearchTerm).map((firmName, index) => (
                      <div
                        key={index}
                        onClick={() => handleFirmSelect(firmName, 'pending')}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: index < getFilteredFirmNames(pendingSearchTerm).length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                          color: theme.textPrimary,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBackground}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {firmName}
                      </div>
                    ))}
                    {getFilteredFirmNames(pendingSearchTerm).length === 0 && (
                      <div style={{
                        padding: '12px',
                        color: theme.textSecondary,
                        fontStyle: 'italic'
                      }}>
                        No firms found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isMobile ? '800px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.background }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Buyer Firm</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Transactions</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Total Amount</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Oldest Due</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPendingPayments().map((payment) => (
                      <tr key={payment.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '500', color: theme.textPrimary }}>{payment.buyerFirm}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>{payment.buyerOwner} • {payment.buyerCity}</p>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          {payment.transactionCount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.error }}>
                          ₹{payment.totalPendingAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textSecondary }}>
                          {new Date(payment.oldestTransactionDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: getStatusBgColor(payment.status),
                            color: getStatusColor(payment.status)
                          }}>
                            {payment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <button
                            onClick={() => handleViewPaymentDetail(payment, 'pending')}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${theme.info}`,
                              borderRadius: '4px',
                              backgroundColor: theme.infoBg,
                              color: theme.info,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Receivable Payments Tab */}
          {activePaymentTab === 'receivable' && (
            <div style={{
              backgroundColor: theme.cardBackground,
              padding: '24px',
              borderRadius: '12px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '0'
              }}>
                <h3 style={{ margin: 0, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💸 Receivable Payments ({getFilteredReceivablePayments().length})
                </h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Total Receivable: ₹{getFilteredReceivablePayments().reduce((sum, p) => sum + p.totalReceivableAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Search Bar for Receivable Payments */}
              <div className="search-container" style={{
                marginBottom: '20px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  transition: 'all 0.2s ease'
                }}>
                  <span style={{ color: theme.textSecondary, fontSize: '16px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by seller firm name..."
                    value={receivableSearchTerm}
                    onChange={(e) => {
                      setReceivableSearchTerm(e.target.value);
                      setShowReceivableDropdown(true);
                    }}
                    onFocus={() => setShowReceivableDropdown(true)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: theme.textPrimary,
                      fontSize: '14px',
                      flex: 1,
                      fontFamily: 'inherit'
                    }}
                  />
                  {receivableSearchTerm && (
                    <button
                      onClick={() => clearSearch('receivable')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textSecondary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown for firm suggestions */}
                {showReceivableDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: theme.shadow,
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredFirmNames(receivableSearchTerm).map((firmName, index) => (
                      <div
                        key={index}
                        onClick={() => handleFirmSelect(firmName, 'receivable')}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: index < getFilteredFirmNames(receivableSearchTerm).length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                          color: theme.textPrimary,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBackground}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {firmName}
                      </div>
                    ))}
                    {getFilteredFirmNames(receivableSearchTerm).length === 0 && (
                      <div style={{
                        padding: '12px',
                        color: theme.textSecondary,
                        fontStyle: 'italic'
                      }}>
                        No firms found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isMobile ? '800px' : 'auto'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.background }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Seller Firm</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Transactions</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Total Amount</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Oldest Due</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredReceivablePayments().map((payment) => (
                      <tr key={payment.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '500', color: theme.textPrimary }}>{payment.sellerFirm}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>{payment.sellerOwner} • {payment.sellerCity}</p>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                          {payment.transactionCount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.success }}>
                          ₹{payment.totalReceivableAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textSecondary }}>
                          {new Date(payment.oldestTransactionDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: getStatusBgColor(payment.status),
                            color: getStatusColor(payment.status)
                          }}>
                            {payment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                          <button
                            onClick={() => handleViewPaymentDetail(payment, 'receivable')}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${theme.info}`,
                              borderRadius: '4px',
                              backgroundColor: theme.infoBg,
                              color: theme.info,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Merchants Tab */}
      {activeTab === 'merchants' && (
        <div>
          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div className="merchant-search-container" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: '20px',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '0'
            }}>
              <h3 style={{ margin: 0, color: theme.textPrimary }}>Merchant Directory ({Array.isArray(merchants) ? merchants.length : 0})</h3>
              <div className="merchant-actions" style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={loadMerchantsData}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = theme.hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground;
                  }}
                >
                  {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={handleUploadClick}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${theme.success}`,
                    borderRadius: '6px',
                    backgroundColor: theme.successBg,
                    color: theme.success,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.success;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.successBg;
                    e.currentTarget.style.color = theme.success;
                  }}
                >
                  📊 Bulk Upload
                </button>
                <Link
                  to="/create-merchant"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  + Add New Merchant
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search merchants by name, firm, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="merchant-search-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px', // Prevents zoom on iOS
                  outline: 'none',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>



            <div className="merchant-table-container" style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              <table className="merchant-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: isMobile ? '800px' : 'auto'
              }}>
                <thead>
                  <tr style={{ backgroundColor: theme.background }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Firm Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Owner</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Rate (₹/bag)</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Bags Sold</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Bags Bought</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(merchants) ? merchants : [])
                    .filter(merchant => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        merchant.firmName?.toLowerCase().includes(search) ||
                        merchant.ownerName?.toLowerCase().includes(search) ||
                        merchant.email?.toLowerCase().includes(search) ||
                        merchant.address?.city?.toLowerCase().includes(search) ||
                        merchant.userType?.toLowerCase().includes(search)
                      );
                    })
                    .map((merchant) => (
                    <tr key={merchant.userId}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500', color: theme.textPrimary }}>{merchant.firmName || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>{merchant.gstNumber || 'N/A'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                        <div>
                          <p style={{ margin: 0, color: theme.textPrimary }}>{merchant.ownerName || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>{merchant.email || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
                            {merchant.phoneNumbers && merchant.phoneNumbers.length > 0 ? merchant.phoneNumbers[0] : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: merchant.userType === 'Miller' ? theme.infoBg : theme.successBg,
                          color: merchant.userType === 'Miller' ? theme.info : theme.success
                        }}>
                          {merchant.userType || 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                        <div>
                          <p style={{ margin: 0, color: theme.textPrimary }}>{merchant.address?.city || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
                            {merchant.address?.area || ''} {merchant.address?.pincode || ''}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                        ₹{merchant.brokerageRate || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                        {formatNumber(merchant.totalBagsSold || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                        {formatNumber(merchant.totalBagsBought || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewMerchant(merchant)}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${theme.info}`,
                              borderRadius: '4px',
                              backgroundColor: theme.infoBg,
                              color: theme.info,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.info;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.infoBg;
                              e.currentTarget.style.color = theme.info;
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditMerchant(merchant)}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${theme.warning}`,
                              borderRadius: '4px',
                              backgroundColor: theme.warningBg,
                              color: theme.warning,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.warning;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.warningBg;
                              e.currentTarget.style.color = theme.warning;
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {!loading && (!Array.isArray(merchants) || merchants.length === 0) && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: theme.textSecondary
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.textPrimary }}>No Merchants Found</h4>
                  <p style={{ margin: 0, color: theme.textSecondary }}>
                    {searchTerm ? 'No merchants match your search criteria.' : 'Start by adding your first merchant.'}
                  </p>
                  {!searchTerm && (
                    <Link
                      to="/create-merchant"
                      className="btn btn-primary"
                      style={{
                        textDecoration: 'none',
                        marginTop: '16px',
                        display: 'inline-block'
                      }}
                    >
                      + Add First Merchant
                    </Link>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: theme.textSecondary
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
                  <p style={{ color: theme.textPrimary }}>Loading merchants...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today Market Tab */}
      {activeTab === 'todaymarket' && (
        <div>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.textPrimary,
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📈 Today's Market
              </h2>
            </div>
            
            {/* Import and use TodayMarket component */}
            <div style={{
              backgroundColor: theme.background,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.borderLight}`
            }}>
              <TodayMarket />
            </div>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="address-search-container" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: '20px',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '0'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Address Management ({Array.isArray(addresses) ? addresses.length : 0})</h3>
              <div className="address-actions" style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={loadAddressesData}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  🔄 Refresh
                </button>
                <Link
                  to="/route-explorer"
                  style={{
                    textDecoration: 'none',
                    padding: '8px 16px',
                    border: `1px solid ${theme.info}`,
                    borderRadius: '6px',
                    backgroundColor: theme.infoBg,
                    color: theme.info,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.info;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.infoBg;
                    e.currentTarget.style.color = theme.info;
                  }}
                >
                  🗺️ Route Explorer
                </Link>
                <button
                  onClick={() => setShowAddressModal(true)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }}
                >
                  ➕ Add Address
                </button>
              </div>
            </div>

            {/* Addresses Display */}
            <div className="addresses-grid" style={{ marginBottom: '20px' }}>
              {(() => {
                // Group addresses by city
                const groupedAddresses = {};
                (Array.isArray(addresses) ? addresses : []).forEach(address => {
                  const city = address.city || 'Unknown City';
                  if (!groupedAddresses[city]) {
                    groupedAddresses[city] = [];
                  }
                  groupedAddresses[city].push(address);
                });

                return Object.keys(groupedAddresses).length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {Object.entries(groupedAddresses).map(([cityName, cityAddresses]) => (
                      <div
                        key={cityName}
                        style={{
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleCityExpansion(cityName)}
                      >
                        {/* City Header */}
                        <div style={{
                          padding: '16px',
                          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                              🏙️ {cityName}
                            </h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                              {cityAddresses.length} address{cityAddresses.length !== 1 ? 'es' : ''}
                            </p>
                          </div>
                          <span style={{ fontSize: '20px', transition: 'transform 0.3s ease', transform: expandedCities[cityName] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </div>

                        {/* City Areas - Expandable */}
                        {expandedCities[cityName] && (
                          <div style={{ padding: '16px' }}>
                            <div style={{
                              display: 'grid',
                              gap: '8px',
                              maxHeight: '300px',
                              overflowY: 'auto'
                            }}>
                              {cityAddresses.map((address, index) => (
                                <div
                                  key={address.addressId || index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAddress(address);
                                  }}
                                  style={{
                                    backgroundColor: theme.background,
                                    border: `1px solid ${theme.borderLight}`,
                                    borderRadius: '8px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.background;
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  <div>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: theme.textPrimary }}>
                                      📍 {address.area || 'Unknown Area'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
                                      PIN: {address.pincode || 'N/A'}
                                    </p>
                                  </div>
                                  <span style={{ fontSize: '16px', color: theme.textSecondary }}>→</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: theme.textSecondary
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
                    <h3 style={{ margin: '0 0 8px 0', color: theme.textPrimary }}>No Addresses Found</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      Start by adding your first address to manage locations.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          {/* Profile Header */}
          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '32px',
            borderRadius: '16px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            marginBottom: '24px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {/* Profile Avatar */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: theme.shadowHover,
                flexShrink: 0
              }}>
                {(brokerData?.brokerName || 'B').charAt(0).toUpperCase()}
              </div>

              {/* Profile Info */}
              <div style={{ flex: 1 }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  color: theme.textPrimary,
                  fontSize: '32px',
                  fontWeight: '700'
                }}>
                  {brokerData?.brokerName || 'Broker User'}
                </h2>
                <p style={{
                  margin: '0 0 12px 0',
                  color: theme.textSecondary,
                  fontSize: '18px'
                }}>
                  {brokerData?.brokerageFirmName || 'BrokerHub'}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  <span style={{
                    backgroundColor: theme.successBg,
                    color: theme.success,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ✅ Active Broker
                  </span>
                  <span style={{
                    backgroundColor: theme.infoBg,
                    color: theme.info,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    📧 {brokerData?.email || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: '140px'
              }}>
                <button
                  onClick={loadBrokerData}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.hoverBg;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🔄 Refresh Profile
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '16px' : '20px'
          }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>📊 Broker Information</h3>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Broker ID:</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{brokerData?.brokerId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Name:</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{brokerData?.brokerName || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Username:</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{brokerData?.userName || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Firm Name:</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{brokerData?.brokerageFirmName || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Phone:</span>
                  <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{brokerData?.phoneNumber || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Total Brokerage:</span>
                  <span style={{ color: theme.success, fontWeight: '700', fontSize: '16px' }}>{formatCurrency(brokerData?.totalBrokerage || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>🏠 Address & Banking</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: theme.background,
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <span style={{ fontWeight: '600', color: theme.textPrimary }}>Address Information</span>
                </div>
                {brokerData?.address ? (
                  <div style={{ marginLeft: '12px', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>City:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.address.city || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>Area:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.address.area || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>Pincode:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.address.pincode || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 0 12px', color: theme.textMuted, fontStyle: 'italic' }}>No address information available</p>
                )}
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: theme.background,
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🏦</span>
                  <span style={{ fontWeight: '600', color: theme.textPrimary }}>Banking Details</span>
                </div>
                {brokerData?.bankDetails ? (
                  <div style={{ marginLeft: '12px', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>Bank:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.bankDetails.bankName || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>Branch:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.bankDetails.branch || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>Account:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.bankDetails.accountNumber || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: theme.textSecondary }}>IFSC:</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{brokerData.bankDetails.ifscCode || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 0 12px', color: theme.textMuted, fontStyle: 'italic' }}>No banking details available</p>
                )}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => alert('Update Profile functionality coming soon!')}
                style={{
                  padding: '12px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>✏️</span>
                Update Profile
              </button>
              <Link
                to="/change-password"
                style={{
                  textDecoration: 'none',
                  padding: '12px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>🔐</span>
                Change Password
              </Link>
              <Link
                to="/verify-account"
                style={{
                  textDecoration: 'none',
                  padding: '12px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>✅</span>
                Verify Account
              </Link>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="product-search-container" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: '20px',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '0'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Product Catalog ({Array.isArray(products) ? products.length : 0})</h3>
              <div className="product-actions" style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={loadProductsData}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => alert('Add Product functionality coming soon!')}
                  className="btn btn-primary"
                >
                  + Add New Product
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search products by name, quality, or price..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="product-search-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Products Grid Display */}
            <div className="products-grid" style={{ marginBottom: '20px' }}>
              {(() => {
                const filteredProducts = (Array.isArray(products) ? products : [])
                  .filter(product => {
                    if (!productSearchTerm) return true;
                    const search = productSearchTerm.toLowerCase();
                    return (
                      product.productName?.toLowerCase().includes(search) ||
                      product.quality?.toLowerCase().includes(search) ||
                      product.price?.toString().includes(search)
                    );
                  });

                const groupedProducts = groupProductsForCards(filteredProducts);

                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                  }}>
                    {Object.entries(groupedProducts).map(([productName, productGroup]) => {
                      const isExpanded = expandedProducts[productName];
                      const hasImage = productGroup.imgLink && productGroup.imgLink.trim() !== '';

                      return (
                        <div key={productName} style={{
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: theme.shadow,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = theme.shadowHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = theme.shadow;
                        }}
                        onClick={() => toggleProductExpansion(productName)}
                        >
                          {/* Product Image/Icon */}
                          <div style={{
                            height: '180px',
                            background: hasImage
                              ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${productGroup.imgLink})`
                              : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            {!hasImage && (
                              <div style={{
                                fontSize: '64px',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                              }}>
                                {getProductIcon(productName)}
                              </div>
                            )}

                            {/* Expand indicator */}
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              color: '#374151',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease'
                            }}>
                              ▼
                            </div>
                          </div>

                          {/* Product Info */}
                          <div style={{ padding: '20px' }}>
                            <h3 style={{
                              margin: '0 0 8px 0',
                              color: theme.textPrimary,
                              fontSize: '18px',
                              fontWeight: '600',
                              lineHeight: '1.3'
                            }}>
                              {productName}
                            </h3>

                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12px'
                            }}>
                              <span style={{
                                fontSize: '14px',
                                color: theme.textSecondary,
                                backgroundColor: theme.background,
                                padding: '4px 8px',
                                borderRadius: '6px'
                              }}>
                                {productGroup.qualityCount} {productGroup.qualityCount === 1 ? 'Quality' : 'Qualities'}
                              </span>
                              <span style={{
                                fontSize: '14px',
                                color: theme.textSecondary,
                                backgroundColor: theme.background,
                                padding: '4px 8px',
                                borderRadius: '6px'
                              }}>
                                {productGroup.products.length} {productGroup.products.length === 1 ? 'Variant' : 'Variants'}
                              </span>
                            </div>

                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{
                                  fontSize: '12px',
                                  color: theme.textMuted,
                                  marginBottom: '2px'
                                }}>
                                  Total Quantity
                                </div>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: theme.textPrimary
                                }}>
                                  {formatNumber(productGroup.totalQuantity)} kg
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{
                                  fontSize: '12px',
                                  color: theme.textMuted,
                                  marginBottom: '2px'
                                }}>
                                  Avg Price
                                </div>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#059669'
                                }}>
                                  ₹{Math.round(productGroup.avgPrice)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div style={{
                              borderTop: `1px solid ${theme.border}`,
                              backgroundColor: theme.background,
                              padding: '16px 20px'
                            }}>
                              <h4 style={{
                                margin: '0 0 12px 0',
                                color: theme.textPrimary,
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                Available Variants
                              </h4>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}>
                                {productGroup.products.map((variant, index) => (
                                  <div
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProduct(variant);
                                      setShowProductModal(true);
                                    }}
                                    style={{
                                      backgroundColor: theme.cardBackground,
                                      border: `1px solid ${theme.borderLight}`,
                                      borderRadius: '6px',
                                      padding: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      textAlign: 'center',
                                      minHeight: '60px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                                      e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = theme.cardBackground;
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    <div style={{
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      color: theme.textPrimary,
                                      marginBottom: '2px'
                                    }}>
                                      {variant.quality}
                                    </div>
                                    <div style={{
                                      fontSize: '10px',
                                      color: theme.textSecondary
                                    }}>
                                      {variant.quantity} kg
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Empty State */}
            {!loading && (!Array.isArray(products) || products.length === 0) && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Products Found</h4>
                <p style={{ margin: 0 }}>
                  {productSearchTerm ? 'No products match your search criteria.' : 'Start by adding your first product.'}
                </p>
                {!productSearchTerm && (
                  <button
                    onClick={() => alert('Add Product functionality coming soon!')}
                    className="btn btn-primary"
                    style={{
                      marginTop: '16px'
                    }}
                  >
                    + Add First Product
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Bulk Upload Merchants</h3>
              <button
                onClick={closeUploadModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                      Upload Excel File (.xlsx format only)
                    </p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                      Upload an Excel file containing merchant data. Download the template first to see the required format and sample data.
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#3b82f6',
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                  >
                    📥 Download Template
                  </button>
                </div>

                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                  color: '#475569'
                }}>
                  <strong>Required columns:</strong> userType, gstNumber, firmName, ownerName, city, area, pincode, email, bankName, accountNumber, ifscCode, branch, phoneNumbers, brokerageRate, shopNumber, byProduct
                </div>
              </div>

              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ marginBottom: '12px', fontSize: '48px' }}>📊</div>
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    border: 'none'
                  }}
                >
                  Choose Excel File
                </label>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Supported format: .xlsx only (Max size: 10MB)
                </p>
              </div>

              {uploadFile && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                    <strong>Selected file:</strong> {uploadFile.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {uploadMessage && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: uploadMessage.includes('✅') || uploadMessage.includes('📊') ? '#f0fdf4' :
                                   uploadMessage.includes('📥') ? '#eff6ff' : '#fef2f2',
                  border: `1px solid ${uploadMessage.includes('✅') || uploadMessage.includes('📊') ? '#bbf7d0' :
                                      uploadMessage.includes('📥') ? '#bfdbfe' : '#fecaca'}`,
                  color: uploadMessage.includes('✅') || uploadMessage.includes('📊') ? '#166534' :
                         uploadMessage.includes('📥') ? '#1e40af' : '#dc2626',
                  fontSize: '14px',
                  whiteSpace: 'pre-line',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {uploadMessage}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeUploadModal}
                disabled={uploading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={!uploadFile || uploading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: (!uploadFile || uploading) ? '#d1d5db' : '#10b981',
                  color: 'white',
                  fontSize: '14px',
                  cursor: (!uploadFile || uploading) ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant View Modal */}
      {showMerchantModal && selectedMerchant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: theme.shadowModal,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {(selectedMerchant.firmName || 'M').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {selectedMerchant.firmName || 'Merchant Details'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                    {selectedMerchant.userType || 'Merchant'} • {selectedMerchant.address?.city || 'Unknown Location'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMerchantModal}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.errorBg;
                  e.currentTarget.style.color = theme.error;
                  e.currentTarget.style.borderColor = theme.error;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.textSecondary;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                ×
              </button>
            </div>

            {/* Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '24px'
            }}>
              {/* Basic Information Card */}
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderLight}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '18px' }}>📋</span>
                  <h4 style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                    Basic Information
                  </h4>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.8', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Firm Name:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.firmName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Owner Name:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.ownerName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>User Type:</span>
                    <span style={{
                      color: selectedMerchant.userType === 'Miller' ? theme.info : theme.success,
                      fontWeight: '600',
                      backgroundColor: selectedMerchant.userType === 'Miller' ? theme.infoBg : theme.successBg,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {selectedMerchant.userType || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>GST Number:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.gstNumber || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Email:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.email || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Shop Number:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.shopNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Address Card */}
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderLight}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '18px' }}>📞</span>
                  <h4 style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                    Contact & Address
                  </h4>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 8px 0', color: theme.textSecondary, fontWeight: '500' }}>Phone Numbers:</p>
                    {selectedMerchant.phoneNumbers && selectedMerchant.phoneNumbers.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {selectedMerchant.phoneNumbers.map((phone, index) => (
                          <span key={index} style={{
                            color: theme.textPrimary,
                            backgroundColor: theme.cardBackground,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}>
                            📱 {phone}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: theme.textMuted, fontStyle: 'italic' }}>No phone numbers</p>
                    )}
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px 0', color: theme.textSecondary, fontWeight: '500' }}>Address:</p>
                    {selectedMerchant.address ? (
                      <div style={{
                        backgroundColor: theme.cardBackground,
                        padding: '12px',
                        borderRadius: '8px',
                        display: 'grid',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.textSecondary }}>City:</span>
                          <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.address.city || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.textSecondary }}>Area:</span>
                          <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.address.area || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: theme.textSecondary }}>Pincode:</span>
                          <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.address.pincode || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: theme.textMuted, fontStyle: 'italic' }}>No address information</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Banking Details Card */}
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderLight}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '18px' }}>🏦</span>
                  <h4 style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                    Banking Details
                  </h4>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  {selectedMerchant.bankDetails ? (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: theme.textSecondary }}>Bank Name:</span>
                        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.bankDetails.bankName || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: theme.textSecondary }}>Account Number:</span>
                        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.bankDetails.accountNumber || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: theme.textSecondary }}>IFSC Code:</span>
                        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.bankDetails.ifscCode || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: theme.textSecondary }}>Branch:</span>
                        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{selectedMerchant.bankDetails.branch || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: theme.textMuted, fontStyle: 'italic' }}>No banking details available</p>
                  )}
                </div>
              </div>

              {/* Business Details Card */}
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderLight}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '18px' }}>💼</span>
                  <h4 style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                    Business Details
                  </h4>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.8', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Brokerage Rate:</span>
                    <span style={{ color: theme.warning, fontWeight: '600' }}>{selectedMerchant.brokerageRate || 0}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Total Bags Sold:</span>
                    <span style={{ color: theme.success, fontWeight: '600' }}>{formatNumber(selectedMerchant.totalBagsSold || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Total Bags Bought:</span>
                    <span style={{ color: theme.info, fontWeight: '600' }}>{formatNumber(selectedMerchant.totalBagsBought || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Payable Amount:</span>
                    <span style={{ color: theme.error, fontWeight: '600' }}>{formatCurrency(selectedMerchant.payableAmount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Receivable Amount:</span>
                    <span style={{ color: theme.success, fontWeight: '600' }}>{formatCurrency(selectedMerchant.receivableAmount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary }}>Total Payable Brokerage:</span>
                    <span style={{ color: theme.primary, fontWeight: '700', fontSize: '15px' }}>{formatCurrency(selectedMerchant.totalPayableBrokerage || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: `1px solid ${theme.border}`,
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleEditMerchant(selectedMerchant)}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.warning}`,
                  borderRadius: '8px',
                  backgroundColor: theme.warningBg,
                  color: theme.warning,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warning;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warningBg;
                  e.currentTarget.style.color = theme.warning;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>✏️</span>
                Edit Merchant
              </button>
              <button
                onClick={closeMerchantModal}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>✖️</span>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      {showProductModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: theme.shadowModal,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🌾
                </div>
                <div>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {selectedProduct.productName || 'Product Details'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                    Quality: {selectedProduct.quality || 'N/A'} • Quantity: {selectedProduct.quantity || 0} kg
                  </p>
                </div>
              </div>
              <button
                onClick={closeProductModal}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.errorBg;
                  e.currentTarget.style.color = theme.error;
                  e.currentTarget.style.borderColor = theme.error;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.textSecondary;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                ×
              </button>
            </div>

            {/* Product Image */}
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: theme.background,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '64px',
              backgroundImage: selectedProduct.imgLink ? `url(${selectedProduct.imgLink})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}>
              {!selectedProduct.imgLink && getProductIcon(selectedProduct.productName)}
            </div>

            {/* Product Information */}
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
                  {selectedProduct.productName}
                </h4>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: '#dbeafe',
                  color: '#3b82f6'
                }}>
                  {selectedProduct.quality}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Product ID:</strong> {selectedProduct.productId}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Quantity:</strong> {selectedProduct.quantity} kg
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Price:</strong> ₹{selectedProduct.price}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Brokerage:</strong> {selectedProduct.productBrokerage}%
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Quality Grade:</strong> {selectedProduct.quality}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleEditProduct(selectedProduct)}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.warning}`,
                  borderRadius: '6px',
                  backgroundColor: theme.warningBg,
                  color: theme.warning,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warning;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warningBg;
                  e.currentTarget.style.color = theme.warning;
                }}
              >
                Edit Product
              </button>
              <button
                onClick={closeProductModal}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={closeAddressModal}
        address={selectedAddress}
        onSuccess={loadAddressesData}
      />

      {/* Address Detail Modal */}
      {selectedAddress && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: theme.shadowModal,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🏠
                </div>
                <div>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    Address Details
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                    View address information
                  </p>
                </div>
              </div>
              <button
                onClick={closeAddressModal}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.errorBg;
                  e.currentTarget.style.color = theme.error;
                  e.currentTarget.style.borderColor = theme.error;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.textSecondary;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                ×
              </button>
            </div>

            {/* Address Information */}
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderLight}`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Address ID:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedAddress.addressId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary, fontWeight: '500' }}>City:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedAddress.city}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Area:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedAddress.area}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Pincode:</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedAddress.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddressModal(true);
                }}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.warning}`,
                  borderRadius: '8px',
                  backgroundColor: theme.warningBg,
                  color: theme.warning,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warning;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warningBg;
                  e.currentTarget.style.color = theme.warning;
                }}
              >
                Edit Address
              </button>
              <button
                onClick={closeAddressModal}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={showProductEditModal}
        onClose={closeProductEditModal}
        product={editingProduct}
        onSuccess={loadProductsData}
      />

      {/* Payment Detail Modal */}
      {showPaymentDetailModal && selectedPaymentDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: theme.shadowModal,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: selectedPaymentDetail.type === 'brokerage' ?
                    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
                    selectedPaymentDetail.type === 'pending' ?
                    'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' :
                    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {selectedPaymentDetail.type === 'brokerage' ? '💰' :
                   selectedPaymentDetail.type === 'pending' ? '⏳' : '💸'}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    {selectedPaymentDetail.type === 'brokerage' ? 'Brokerage Payment Details' :
                     selectedPaymentDetail.type === 'pending' ? 'Pending Payment Details' :
                     'Receivable Payment Details'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                    {selectedPaymentDetail.firmName || selectedPaymentDetail.buyerFirm || selectedPaymentDetail.sellerFirm}
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentDetailModal}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ×
              </button>
            </div>

            {/* Payment Summary */}
            <div style={{
              backgroundColor: theme.background,
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${theme.borderLight}`,
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 20px 0', color: theme.textPrimary }}>Payment Summary</h4>

              {selectedPaymentDetail.type === 'brokerage' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Bags Section */}
                  <div>
                    <h5 style={{ margin: '0 0 12px 0', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>📦 BAGS SUMMARY</h5>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      backgroundColor: theme.cardBackground,
                      padding: '20px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`,
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Sold</p>
                        <p style={{ margin: 0, color: theme.success, fontSize: '20px', fontWeight: '700' }}>
                          {selectedPaymentDetail.soldBags}
                        </p>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px'
                      }}>
                        +
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Bought</p>
                        <p style={{ margin: 0, color: theme.info, fontSize: '20px', fontWeight: '700' }}>
                          {selectedPaymentDetail.boughtBags}
                        </p>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px'
                      }}>
                        =
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Total</p>
                        <p style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '700' }}>
                          {selectedPaymentDetail.totalBags}
                        </p>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px'
                      }}>
                        ×
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Rate/bag</p>
                        <p style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '700' }}>
                          ₹{selectedPaymentDetail.brokerageRate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Section */}
                  <div>
                    <h5 style={{ margin: '0 0 12px 0', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>💰 BROKERAGE CALCULATION</h5>
                    <div style={{
                      backgroundColor: theme.cardBackground,
                      padding: '20px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`
                    }}>
                      {/* Total Brokerage */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: `1px solid ${theme.borderLight}`
                      }}>
                        <span style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: '500' }}>
                          Total Brokerage ({selectedPaymentDetail.totalBags} bags × ₹{selectedPaymentDetail.brokerageRate}/bag)
                        </span>
                        <span style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: '700' }}>
                          ₹{selectedPaymentDetail.grossBrokerage?.toLocaleString()}
                        </span>
                      </div>

                      {/* Deductions - Detailed */}
                      <div style={{
                        padding: '8px 0',
                        borderBottom: `1px solid ${theme.borderLight}`
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 0'
                        }}>
                          <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                            Less: Offer (10%)
                          </span>
                          <span style={{ color: theme.warning, fontSize: '16px', fontWeight: '600' }}>
                            -₹{(selectedPaymentDetail.discount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 0'
                        }}>
                          <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                            Less: TDS (5%)
                          </span>
                          <span style={{ color: theme.warning, fontSize: '16px', fontWeight: '600' }}>
                            -₹{(selectedPaymentDetail.tds || 0).toLocaleString()}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          marginTop: '4px',
                          borderTop: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.background,
                          marginLeft: '-20px',
                          marginRight: '-20px',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}>
                          <span style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>
                            Total Deductions
                          </span>
                          <span style={{ color: theme.warning, fontSize: '16px', fontWeight: '700' }}>
                            -₹{((selectedPaymentDetail.discount || 0) + (selectedPaymentDetail.tds || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Net Amount */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderTop: `2px solid ${theme.border}`,
                        marginTop: '8px'
                      }}>
                        <span style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                          Net Brokerage
                        </span>
                        <span style={{ color: theme.info, fontSize: '20px', fontWeight: '700' }}>
                          ₹{selectedPaymentDetail.netBrokerage?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Section */}
                  <div>
                    <h5 style={{ margin: '0 0 12px 0', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>💳 PAYMENT STATUS</h5>
                    <div style={{
                      backgroundColor: theme.cardBackground,
                      padding: '20px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`
                    }}>
                      {/* Net Amount */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: `1px solid ${theme.borderLight}`
                      }}>
                        <span style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: '500' }}>
                          Net Brokerage
                        </span>
                        <span style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>
                          ₹{selectedPaymentDetail.netBrokerage?.toLocaleString()}
                        </span>
                      </div>

                      {/* Paid Amount */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0'
                      }}>
                        <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                          Less: Payments Received
                        </span>
                        <span style={{ color: theme.success, fontSize: '16px', fontWeight: '600' }}>
                          -₹{selectedPaymentDetail.paidAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* Final Amount */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderTop: `2px solid ${theme.border}`,
                        marginTop: '8px',
                        backgroundColor: selectedPaymentDetail.pendingAmount > 0 ? theme.errorBg : theme.successBg,
                        marginLeft: '-20px',
                        marginRight: '-20px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        borderRadius: '0 0 8px 8px'
                      }}>
                        <span style={{
                          color: selectedPaymentDetail.pendingAmount > 0 ? theme.error : theme.success,
                          fontSize: '18px',
                          fontWeight: '700'
                        }}>
                          {selectedPaymentDetail.pendingAmount > 0 ? 'PENDING AMOUNT' : 'FULLY PAID'}
                        </span>
                        <span style={{
                          color: selectedPaymentDetail.pendingAmount > 0 ? theme.error : theme.success,
                          fontSize: '24px',
                          fontWeight: '700'
                        }}>
                          ₹{selectedPaymentDetail.pendingAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedPaymentDetail.type === 'pending' || selectedPaymentDetail.type === 'receivable') && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Total Transactions</p>
                      <p style={{ margin: 0, color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>
                        {selectedPaymentDetail.transactionCount}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
                        {selectedPaymentDetail.type === 'pending' ? 'Total Pending' : 'Total Receivable'}
                      </p>
                      <p style={{ margin: 0, color: selectedPaymentDetail.type === 'pending' ? theme.error : theme.success, fontSize: '18px', fontWeight: '600' }}>
                        ₹{(selectedPaymentDetail.totalPendingAmount || selectedPaymentDetail.totalReceivableAmount)?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Oldest Transaction</p>
                      <p style={{ margin: 0, color: theme.textPrimary, fontSize: '18px', fontWeight: '600' }}>
                        {new Date(selectedPaymentDetail.oldestTransactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                </div>
              )}
            </div>

            {/* Transactions List - Only for pending and receivable payments */}
            {selectedPaymentDetail.type !== 'brokerage' && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: theme.textPrimary }}>Transaction Details</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.background }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Product</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Bags</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedPaymentDetail.transactions || []).map((transaction, index) => (
                        <tr key={transaction.id || index}>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: transaction.type === 'SOLD' ? theme.successBg : theme.infoBg,
                              color: transaction.type === 'SOLD' ? theme.success : theme.info
                            }}>
                              {transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {transaction.product} - {transaction.quality}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {transaction.bags}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            ₹{(transaction.totalAmount || transaction.amount)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Part Payments History (for brokerage payments) */}
            {selectedPaymentDetail.type === 'brokerage' && selectedPaymentDetail.partPayments && selectedPaymentDetail.partPayments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: theme.textPrimary }}>Payment History</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.background }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Amount</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Method</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary, fontWeight: '600' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPaymentDetail.partPayments.map((payment, index) => (
                        <tr key={payment.id || index}>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.success }}>
                            ₹{payment.amount?.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: theme.infoBg,
                              color: theme.info
                            }}>
                              {payment.method}
                            </span>
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textSecondary }}>
                            {payment.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {selectedPaymentDetail.type === 'brokerage' && selectedPaymentDetail.pendingAmount > 0 && (
                <button
                  onClick={() => {
                    setShowPaymentDetailModal(false);
                    handleAddPartPayment(selectedPaymentDetail);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${theme.success}`,
                    borderRadius: '8px',
                    backgroundColor: theme.successBg,
                    color: theme.success,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Payment
                </button>
              )}
              <button
                onClick={closePaymentDetailModal}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Part Payment Modal */}
      {showPartPaymentModal && selectedPaymentDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: theme.shadowModal,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  💳
                </div>
                <div>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                    Add Part Payment
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                    {selectedPaymentDetail.firmName}
                  </p>
                </div>
              </div>
              <button
                onClick={closePartPaymentModal}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ×
              </button>
            </div>

            {/* Payment Info */}
            <div style={{
              backgroundColor: theme.background,
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${theme.borderLight}`,
              marginBottom: '24px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Pending Amount</p>
                  <p style={{ margin: 0, color: theme.error, fontSize: '18px', fontWeight: '600' }}>
                    ₹{selectedPaymentDetail.pendingAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Already Paid</p>
                  <p style={{ margin: 0, color: theme.success, fontSize: '18px', fontWeight: '600' }}>
                    ₹{selectedPaymentDetail.paidAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={partPaymentAmount}
                  onChange={(e) => setPartPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  max={selectedPaymentDetail.pendingAmount}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
                <p style={{ margin: '8px 0 0 0', color: theme.textSecondary, fontSize: '12px' }}>
                  Maximum amount: ₹{selectedPaymentDetail.pendingAmount?.toLocaleString()}
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Payment Method *
                </label>
                <select
                  value={partPaymentMethod}
                  onChange={(e) => setPartPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    transition: 'border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="IMPS">IMPS</option>
                  <option value="CARD">Card Payment</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closePartPaymentModal}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePartPaymentSubmit}
                disabled={!partPaymentAmount || parseFloat(partPaymentAmount) <= 0 || parseFloat(partPaymentAmount) > selectedPaymentDetail.pendingAmount}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: (!partPaymentAmount || parseFloat(partPaymentAmount) <= 0 || parseFloat(partPaymentAmount) > selectedPaymentDetail.pendingAmount) ? theme.borderLight : theme.success,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: (!partPaymentAmount || parseFloat(partPaymentAmount) <= 0 || parseFloat(partPaymentAmount) > selectedPaymentDetail.pendingAmount) ? 'not-allowed' : 'pointer',
                  opacity: (!partPaymentAmount || parseFloat(partPaymentAmount) <= 0 || parseFloat(partPaymentAmount) > selectedPaymentDetail.pendingAmount) ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;




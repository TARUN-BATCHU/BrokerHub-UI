import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI, merchantAPI } from '../services/api';
import { SalesChart, QuantityChart, ProductPieChart, CityChart, TopPerformersChart } from '../components/Charts';
import {
  mockSalesData,
  mockTopBuyers,
  mockTopSellers,
  mockCityAnalytics,
  mockProductAnalytics
} from '../utils/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const savedBrokerData = localStorage.getItem('brokerData');

    console.log('Dashboard - Token:', token);
    console.log('Dashboard - Saved broker data:', savedBrokerData);

    if (!token) {
      console.log('No token found, redirecting to login');
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
  }, [navigate, location]);

  const loadAnalyticsData = async () => {
    try {
      // For now, using mock data
      setAnalyticsData({
        sales: mockSalesData,
        topBuyers: mockTopBuyers,
        topSellers: mockTopSellers,
        cityAnalytics: mockCityAnalytics,
        productAnalytics: mockProductAnalytics
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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
      // Keep using the existing broker data or default
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
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
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
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '28px', fontWeight: '700' }}>
            BrokerHub Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '16px' }}>
            Welcome back, {brokerData?.brokerName || 'Broker User'}!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to="/create-merchant"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            + Add Merchant
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {successMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'merchants', label: 'Merchants' },
            { id: 'profile', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                fontWeight: activeTab === tab.id ? '600' : '400',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Sales</p>
                  <h3 style={{ margin: '4px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                    {formatCurrency(analyticsData.sales.totalSales)}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: '#dbeafe',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  fontSize: '24px'
                }}>
                  💰
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#10b981', fontSize: '12px' }}>
                +{analyticsData.sales.monthlyGrowth}% from last month
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Quantity</p>
                  <h3 style={{ margin: '4px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                    {formatNumber(analyticsData.sales.totalQuantity)} Tons
                  </h3>
                </div>
                <div style={{
                  backgroundColor: '#dcfce7',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#22c55e',
                  fontSize: '24px'
                }}>
                  📦
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Transactions</p>
                  <h3 style={{ margin: '4px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                    {formatNumber(analyticsData.sales.totalTransactions)}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#f59e0b',
                  fontSize: '24px'
                }}>
                  📊
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Active Merchants</p>
                  <h3 style={{ margin: '4px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                    {merchants.length}
                  </h3>
                </div>
                <div style={{
                  backgroundColor: '#ede9fe',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#8b5cf6',
                  fontSize: '24px'
                }}>
                  👥
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <SalesChart data={analyticsData.sales.monthlySales} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <ProductPieChart data={analyticsData.productAnalytics} />
            </div>
          </div>

          {/* Top Performers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
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
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <QuantityChart data={analyticsData.sales.monthlySales} />
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <CityChart data={analyticsData.cityAnalytics} />
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <TopPerformersChart buyers={analyticsData.topBuyers} sellers={analyticsData.topSellers} />
          </div>

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
      )}

      {/* Merchants Tab */}
      {activeTab === 'merchants' && (
        <div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Merchant Directory ({Array.isArray(merchants) ? merchants.length : 0})</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={loadMerchantsData}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={handleUploadClick}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    fontSize: '14px',
                    cursor: 'pointer'
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Debug Info - Remove this after testing */}
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <strong>Debug Info:</strong>
              Merchants type: {typeof merchants},
              Is Array: {Array.isArray(merchants) ? 'Yes' : 'No'},
              Length: {Array.isArray(merchants) ? merchants.length : 'N/A'},
              Loading: {loading ? 'Yes' : 'No'}
              <br />
              <button
                onClick={() => {
                  console.log('=== Manual API Test ===');
                  loadMerchantsData();
                }}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  cursor: 'pointer'
                }}
              >
                Test API Call
              </button>
              <button
                onClick={() => {
                  console.log('=== Manual Broker API Test ===');
                  loadBrokerData();
                }}
                style={{
                  marginTop: '8px',
                  marginLeft: '8px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  cursor: 'pointer'
                }}
              >
                Test Broker API
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Firm Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Owner</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Brokerage</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Bags Sold</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Bags Bought</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
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
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>{merchant.firmName || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{merchant.gstNumber || 'N/A'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ margin: 0 }}>{merchant.ownerName || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{merchant.email || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                            {merchant.phoneNumbers && merchant.phoneNumbers.length > 0 ? merchant.phoneNumbers[0] : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: merchant.userType === 'Miller' ? '#dbeafe' : '#dcfce7',
                          color: merchant.userType === 'Miller' ? '#3b82f6' : '#22c55e'
                        }}>
                          {merchant.userType || 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ margin: 0 }}>{merchant.address?.city || 'N/A'}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                            {merchant.address?.area || ''} {merchant.address?.pincode || ''}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {merchant.brokerageRate || 0}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                        {formatNumber(merchant.totalBagsSold || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                        {formatNumber(merchant.totalBagsBought || 0)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewMerchant(merchant)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              backgroundColor: '#eff6ff',
                              color: '#3b82f6',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditMerchant(merchant)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #f59e0b',
                              borderRadius: '4px',
                              backgroundColor: '#fffbeb',
                              color: '#f59e0b',
                              fontSize: '12px',
                              cursor: 'pointer'
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
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Merchants Found</h4>
                  <p style={{ margin: 0 }}>
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
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
                  <p>Loading merchants...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          {/* Debug Info - Remove this after testing */}
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#475569',
            border: '1px solid #e2e8f0'
          }}>
            <strong>Debug - Login & Broker Data:</strong>
            <div style={{ marginTop: '8px' }}>
              <p style={{ margin: '2px 0' }}><strong>Stored Broker ID:</strong> {localStorage.getItem('brokerId') || 'Not found'}</p>
              <p style={{ margin: '2px 0' }}><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
              <p style={{ margin: '2px 0' }}><strong>Broker Data:</strong> {brokerData ? 'Loaded' : 'Missing'}</p>
            </div>
            <pre style={{ margin: '8px 0 0 0', fontSize: '11px', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(brokerData, null, 2)}
            </pre>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  console.log('=== Manual Broker Data Load ===');
                  loadBrokerData();
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  cursor: 'pointer'
                }}
              >
                Test Load Broker Data
              </button>
              <button
                onClick={() => {
                  console.log('=== Clear All Data ===');
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('brokerData');
                  localStorage.removeItem('brokerId');
                  setBrokerData(null);
                  console.log('All data cleared');
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Broker Information</h3>
              <button
                onClick={loadBrokerData}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Broker ID:</strong> {brokerData?.brokerId || 'N/A'}</p>
              <p><strong>Name:</strong> {brokerData?.brokerName || 'N/A'}</p>
              <p><strong>Username:</strong> {brokerData?.userName || 'N/A'}</p>
              <p><strong>Firm Name:</strong> {brokerData?.brokerageFirmName || 'N/A'}</p>
              <p><strong>Email:</strong> {brokerData?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {brokerData?.phoneNumber || 'N/A'}</p>
              <p><strong>Total Brokerage:</strong> {formatCurrency(brokerData?.totalBrokerage || 0)}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Address & Banking</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#374151' }}>Address:</p>
                {brokerData?.address ? (
                  <div style={{ marginLeft: '12px', color: '#64748b' }}>
                    <p style={{ margin: '2px 0' }}>City: {brokerData.address.city || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}>Area: {brokerData.address.area || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}>Pincode: {brokerData.address.pincode || 'N/A'}</p>
                  </div>
                ) : (
                  <p style={{ margin: '2px 0 0 12px', color: '#64748b', fontStyle: 'italic' }}>No address information</p>
                )}
              </div>

              <div>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#374151' }}>Banking Details:</p>
                {brokerData?.bankDetails ? (
                  <div style={{ marginLeft: '12px', color: '#64748b' }}>
                    <p style={{ margin: '2px 0' }}>Bank: {brokerData.bankDetails.bankName || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}>Branch: {brokerData.bankDetails.branch || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}>Account: {brokerData.bankDetails.accountNumber || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}>IFSC: {brokerData.bankDetails.ifscCode || 'N/A'}</p>
                  </div>
                ) : (
                  <p style={{ margin: '2px 0 0 12px', color: '#64748b', fontStyle: 'italic' }}>No banking details</p>
                )}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => alert('Update Profile functionality coming soon!')}
              >
                Update Profile
              </button>
              <Link to="/change-password" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Change Password
              </Link>
              <Link to="/verify-account" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Verify Account
              </Link>
            </div>
          </div>
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Merchant Details</h3>
              <button
                onClick={closeMerchantModal}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Basic Information</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p><strong>Firm Name:</strong> {selectedMerchant.firmName || 'N/A'}</p>
                  <p><strong>Owner Name:</strong> {selectedMerchant.ownerName || 'N/A'}</p>
                  <p><strong>User Type:</strong> {selectedMerchant.userType || 'N/A'}</p>
                  <p><strong>GST Number:</strong> {selectedMerchant.gstNumber || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedMerchant.email || 'N/A'}</p>
                  <p><strong>Shop Number:</strong> {selectedMerchant.shopNumber || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Contact & Address</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p><strong>Phone Numbers:</strong></p>
                  {selectedMerchant.phoneNumbers && selectedMerchant.phoneNumbers.length > 0 ? (
                    <ul style={{ margin: '4px 0 12px 20px', padding: 0 }}>
                      {selectedMerchant.phoneNumbers.map((phone, index) => (
                        <li key={index}>{phone}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '4px 0 12px 0', color: '#64748b' }}>No phone numbers</p>
                  )}
                  <p><strong>Address:</strong></p>
                  {selectedMerchant.address ? (
                    <div style={{ marginLeft: '16px' }}>
                      <p>City: {selectedMerchant.address.city || 'N/A'}</p>
                      <p>Area: {selectedMerchant.address.area || 'N/A'}</p>
                      <p>Pincode: {selectedMerchant.address.pincode || 'N/A'}</p>
                    </div>
                  ) : (
                    <p style={{ color: '#64748b' }}>No address information</p>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Banking Details</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {selectedMerchant.bankDetails ? (
                    <>
                      <p><strong>Bank Name:</strong> {selectedMerchant.bankDetails.bankName || 'N/A'}</p>
                      <p><strong>Account Number:</strong> {selectedMerchant.bankDetails.accountNumber || 'N/A'}</p>
                      <p><strong>IFSC Code:</strong> {selectedMerchant.bankDetails.ifscCode || 'N/A'}</p>
                      <p><strong>Branch:</strong> {selectedMerchant.bankDetails.branch || 'N/A'}</p>
                    </>
                  ) : (
                    <p style={{ color: '#64748b' }}>No banking details</p>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Business Details</h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p><strong>Brokerage Rate:</strong> {selectedMerchant.brokerageRate || 0}%</p>
                  <p><strong>Total Bags Sold:</strong> {formatNumber(selectedMerchant.totalBagsSold || 0)}</p>
                  <p><strong>Total Bags Bought:</strong> {formatNumber(selectedMerchant.totalBagsBought || 0)}</p>
                  <p><strong>Payable Amount:</strong> {formatCurrency(selectedMerchant.payableAmount || 0)}</p>
                  <p><strong>Receivable Amount:</strong> {formatCurrency(selectedMerchant.receivableAmount || 0)}</p>
                  <p><strong>Total Payable Brokerage:</strong> {formatCurrency(selectedMerchant.totalPayableBrokerage || 0)}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleEditMerchant(selectedMerchant)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  backgroundColor: '#fffbeb',
                  color: '#f59e0b',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Edit Merchant
              </button>
              <button
                onClick={closeMerchantModal}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
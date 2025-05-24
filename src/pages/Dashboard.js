import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI, analyticsAPI, merchantAPI } from '../services/api';
import { SalesChart, QuantityChart, ProductPieChart, CityChart, TopPerformersChart } from '../components/Charts';
import {
  mockSalesData,
  mockTopBuyers,
  mockTopSellers,
  mockCityAnalytics,
  mockProductAnalytics,
  mockMerchants
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
  const [merchants, setMerchants] = useState(mockMerchants);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const savedBrokerData = localStorage.getItem('brokerData');

    if (!token) {
      navigate('/login');
      return;
    }

    if (savedBrokerData) {
      setBrokerData(JSON.parse(savedBrokerData));
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
  }, [navigate, location]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In production, these would be real API calls
      // const [sales, buyers, sellers, cities, products] = await Promise.all([
      //   analyticsAPI.getSalesAnalytics(),
      //   analyticsAPI.getTopBuyers(),
      //   analyticsAPI.getTopSellers(),
      //   analyticsAPI.getCityAnalytics(),
      //   analyticsAPI.getProductAnalytics()
      // ]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
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
            Welcome back, {brokerData.brokerName}!
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
              <h3 style={{ margin: 0, color: '#1e293b' }}>Merchant Directory</h3>
              <Link
                to="/create-merchant"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                + Add New Merchant
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Firm Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Owner</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Brokerage</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((merchant) => (
                    <tr key={merchant.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>{merchant.firmName}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{merchant.gstNumber}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ margin: 0 }}>{merchant.ownerName}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{merchant.email}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: merchant.userType === 'MILLER' ? '#dbeafe' : '#dcfce7',
                          color: merchant.userType === 'MILLER' ? '#3b82f6' : '#22c55e'
                        }}>
                          {merchant.userType}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{merchant.city}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{merchant.byProduct}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{merchant.brokerageRate}%</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#dcfce7',
                          color: '#22c55e'
                        }}>
                          {merchant.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <button
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#64748b',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
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
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Broker Information</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Name:</strong> {brokerData.brokerName}</p>
              <p><strong>Username:</strong> {brokerData.userName}</p>
              <p><strong>Firm:</strong> {brokerData.brokerageFirmName}</p>
              <p><strong>Email:</strong> {brokerData.email}</p>
              <p><strong>Phone:</strong> {brokerData.phoneNumber}</p>
              <p><strong>Pincode:</strong> {brokerData.pincode}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Banking Details</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Bank:</strong> {brokerData.BankName}</p>
              <p><strong>Branch:</strong> {brokerData.Branch}</p>
              <p><strong>Account:</strong> {brokerData.AccountNumber}</p>
              <p><strong>IFSC:</strong> {brokerData.IfscCode}</p>
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
              <button className="btn btn-secondary">Update Profile</button>
              <Link to="/change-password" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Change Password
              </Link>
              <Link to="/verify-account" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Verify Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
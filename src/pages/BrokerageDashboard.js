import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { brokerageAPI } from '../services/brokerageAPI';
import { financialYearAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/modern-ui.css';

const BrokerageDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFinancialYears();
  }, []);

  useEffect(() => {
    if (selectedYear && financialYears.length > 0) {
      console.log('useEffect triggered - calling loadBrokerageSummary');
      loadBrokerageSummary();
    }
  }, [selectedYear, financialYears]);

  const loadFinancialYears = async () => {
    try {
      console.log('Loading financial years...');
      const response = await financialYearAPI.getAllFinancialYears();
      const years = response || [];
      console.log('Financial years loaded:', years);
      setFinancialYears(years);
      if (years.length > 0) {
        const defaultYear = years[0].yearId.toString();
        console.log('Setting default year:', defaultYear);
        setSelectedYear(defaultYear);
      }
    } catch (error) {
      console.error('Failed to load financial years:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load financial years');
    }
  };

  const loadBrokerageSummary = async (yearToUse = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentYear = yearToUse || selectedYear;
      console.log('loadBrokerageSummary called with year:', currentYear);
      console.log('Available financial years:', financialYears);
      
      if (!currentYear) {
        console.log('No selected year, skipping API call');
        setLoading(false);
        return;
      }
      
      const selectedYearObj = financialYears.find(fy => fy.yearId.toString() === currentYear);
      let yearId = currentYear;
      if (selectedYearObj) {
        yearId = selectedYearObj.yearId;
      }
      
      console.log('Selected year object:', selectedYearObj);
      console.log('Using yearId for API call:', yearId);
      
      const response = await brokerageAPI.getSummary(yearId);
      console.log('Brokerage summary response:', response);
      // Extract data from nested response structure
      const summaryData = response.data || response;
      console.log('Extracted summary data:', summaryData);
      setSummary(summaryData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load brokerage summary';
      setError(errorMessage);
      console.error('Failed to load summary:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refresh button clicked');
    try {
      await loadBrokerageSummary();
    } catch (error) {
      console.error('Error during refresh:', error);
    }
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    console.log('Financial year changed to:', newYear);
    setSelectedYear(newYear);
  };

  const handleExportSummary = async () => {
    try {
      const selectedYearObj = financialYears.find(fy => fy.yearId.toString() === selectedYear);
      let yearId = selectedYear;
      if (selectedYearObj) {
        yearId = selectedYearObj.yearId;
      }
      console.log('Exporting summary for year:', yearId);
      await brokerageAPI.downloadSummaryExcel(yearId);
    } catch (error) {
      console.error('Failed to export summary:', error);
      setError('Failed to export summary');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading && !financialYears.length) return (
    <div style={{ background: theme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div style={{ background: theme.background, minHeight: '100vh', margin: 0, padding: 0 }}>
      <div className="modern-container" style={{ color: theme.textPrimary }}>
        {/* Header */}
        <div className="modern-header animate-fade-in" style={{ background: theme.background, borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2.25rem', 
              fontWeight: '600', 
              marginBottom: 'var(--space-2)',
              color: theme.textPrimary,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.025em'
            }}>Brokerage Dashboard</h1>
            <p style={{ 
              margin: 0, 
              color: theme.textSecondary, 
              fontSize: '0.95rem',
              fontWeight: '400',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>Manage your brokerage earnings and comprehensive reports</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              disabled={loading}
              className="modern-select"
              style={{ minWidth: '160px', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}`, opacity: loading ? 0.6 : 1 }}
            >
              {financialYears.map(year => (
                <option key={year.yearId} value={year.yearId} style={{ background: theme.cardBackground, color: theme.textPrimary }}>
                  {year.financialYearName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`modern-button modern-button-outline ${loading ? 'opacity-50' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={() => loadBrokerageSummary()}
            className="modern-button modern-button-primary"
          >
            Load Summary
          </button>
        </div>

        {error && (
          <div style={{ 
            background: theme.error, 
            color: 'white', 
            padding: 'var(--space-4) var(--space-6)', 
            borderRadius: 'var(--radius-xl)', 
            marginBottom: 'var(--space-8)',
            boxShadow: theme.shadow,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-4)', 
          marginBottom: 'var(--space-12)'
        }} className="animate-slide-in">
          <button 
            onClick={handleExportSummary} 
            className="modern-button modern-button-accent"
            style={{ padding: 'var(--space-5) var(--space-8)', fontSize: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Summary
          </button>
          <button 
            onClick={() => navigate('/brokerage/users')} 
            className="modern-button modern-button-secondary"
            style={{ padding: 'var(--space-5) var(--space-8)', fontSize: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            User Management
          </button>
          <button 
            onClick={() => navigate('/brokerage/bulk')} 
            className="modern-button modern-button-primary"
            style={{ padding: 'var(--space-5) var(--space-8)', fontSize: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="10" height="10" rx="1" ry="1"/>
            </svg>
            Bulk Operations
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="modern-button modern-button-outline"
            style={{ padding: 'var(--space-5) var(--space-8)', fontSize: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Main Dashboard
          </button>
        </div>

        {summary && (
          <>
            {/* Stats Cards */}
            <div className="modern-stats-grid animate-fade-in">
              <div className="modern-stat-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: theme.textSecondary, 
                    fontSize: '0.875rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    fontWeight: '600' 
                  }}>Total Earned</h3>
                  <div style={{ 
                    background: 'var(--color-accent)', 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-lg)',
                    color: 'white'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: theme.textPrimary, 
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {formatCurrency(summary.totalBrokerageEarned)}
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Total commission earned</div>
              </div>

              <div className="modern-stat-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: theme.textSecondary, 
                    fontSize: '0.875rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    fontWeight: '600' 
                  }}>From Sellers</h3>
                  <div style={{ 
                    background: 'var(--color-secondary)', 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-lg)',
                    color: 'white'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 16l2-2 2 2"/>
                      <path d="M21 14v4a2 2 0 0 1-2 2h-4"/>
                      <path d="M8 8l-2 2-2-2"/>
                      <path d="M3 10V6a2 2 0 0 1 2-2h4"/>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: theme.textPrimary, 
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {formatCurrency(summary.totalBrokerageFromSellers)}
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Commission from sellers</div>
              </div>

              <div className="modern-stat-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: theme.textSecondary, 
                    fontSize: '0.875rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    fontWeight: '600' 
                  }}>From Buyers</h3>
                  <div style={{ 
                    background: 'var(--color-warning)', 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-lg)',
                    color: 'white'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 8l-2-2-2 2"/>
                      <path d="M3 10v4a2 2 0 0 0 2 2h4"/>
                      <path d="M16 16l2 2 2-2"/>
                      <path d="M21 14V10a2 2 0 0 0-2-2h-4"/>
                    </svg>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  color: theme.textPrimary, 
                  marginBottom: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {formatCurrency(summary.totalBrokerageFromBuyers)}
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Commission from buyers</div>
              </div>
            </div>

            {/* Breakdown Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }} className="animate-slide-in">
              <div className="modern-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                <div style={{ padding: 'var(--space-6)', borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: theme.textPrimary, 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-3)' 
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    City-wise Breakdown
                  </h3>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: 'var(--space-4)' }}>
                  {summary.cityWiseBrokerage?.map((city, index) => (
                    <div key={city.city} className="modern-table-row" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      margin: '0 -var(--space-4)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: 'var(--radius-lg)', 
                          background: `var(--color-${['secondary', 'warning', 'accent', 'primary'][index % 4]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.125rem'
                        }}>
                          {city.city.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '1rem' }}>{city.city}</span>
                      </div>
                      <span style={{ 
                        fontWeight: '700', 
                        color: 'var(--color-accent)', 
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)'
                      }}>{formatCurrency(city.totalBrokerage)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modern-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
                <div style={{ padding: 'var(--space-6)', borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: theme.textPrimary, 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-3)' 
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <rect x="7" y="7" width="10" height="10" rx="1" ry="1"/>
                    </svg>
                    Product-wise Breakdown
                  </h3>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: 'var(--space-4)' }}>
                  {summary.productWiseBrokerage?.map((product, index) => (
                    <div key={product.productName} className="modern-table-row" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      margin: '0 -var(--space-4)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: 'var(--radius-lg)', 
                          background: `var(--color-${['warning', 'accent', 'secondary', 'primary'][index % 4]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.125rem'
                        }}>
                          {product.productName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '1rem' }}>{product.productName}</span>
                      </div>
                      <span style={{ 
                        fontWeight: '700', 
                        color: 'var(--color-accent)', 
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)'
                      }}>{formatCurrency(product.totalBrokerage)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
};

export default BrokerageDashboard;
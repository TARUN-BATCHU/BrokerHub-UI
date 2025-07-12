import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { brokerageAPI } from '../services/brokerageAPI';
import { financialYearAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BrokerageDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('1');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFinancialYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadBrokerageSummary();
    }
  }, [selectedYear]);

  const loadFinancialYears = async () => {
    try {
      const response = await financialYearAPI.getAllFinancialYears();
      const years = response || [];
      setFinancialYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0].financialYearId.toString());
      }
    } catch (error) {
      console.error('Failed to load financial years:', error);
    }
  };

  const loadBrokerageSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectedYearObj = financialYears.find(fy => fy.financialYearId.toString() === selectedYear);
      const yearId = selectedYearObj ? selectedYearObj.yearId : selectedYear;
      const response = await brokerageAPI.getSummary(yearId);
      setSummary(response.data);
    } catch (error) {
      setError('Failed to load brokerage summary');
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = async () => {
    try {
      const selectedYearObj = financialYears.find(fy => fy.financialYearId.toString() === selectedYear);
      const yearId = selectedYearObj ? selectedYearObj.yearId : selectedYear;
      await brokerageAPI.downloadSummaryExcel(yearId);
    } catch (error) {
      console.error('Failed to export summary:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) return (
    <div style={{ background: theme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div style={{ background: theme.background, minHeight: '100vh', padding: '1rem' }}>
        {/* Header */}
        <div style={{ 
          background: `linear-gradient(135deg, ${theme.buttonPrimary}, ${theme.buttonPrimaryHover})`,
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: theme.shadowModal
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>💰 Brokerage Dashboard</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>Manage your brokerage earnings and reports</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ 
                  padding: '0.75rem 1rem', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
              >
                {financialYears.map(year => (
                  <option key={year.financialYearId} value={year.financialYearId} style={{ color: theme.textPrimary, background: theme.cardBackground }}>
                    {year.financialYearName}
                  </option>
                ))}
              </select>
              <button 
                onClick={loadBrokerageSummary} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: `linear-gradient(135deg, ${theme.error}, #c0392b)`, 
            color: 'white', 
            padding: '1rem 1.5rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            boxShadow: theme.shadow
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation Buttons - Always Visible */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem'
        }}>
          <button 
            onClick={handleExportSummary} 
            style={{ 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            📊 Export Summary
          </button>
          <button 
            onClick={() => navigate('/brokerage/users')} 
            style={{ 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #3498db, #5dade2)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            👥 User Management
          </button>
          <button 
            onClick={() => navigate('/brokerage/bulk')} 
            style={{ 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #e67e22, #f39c12)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🚀 Bulk Operations
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              padding: '1rem 2rem', 
              border: `2px solid ${theme.border}`, 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: theme.cardBackground, 
              color: theme.textPrimary,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🏠 Main Dashboard
          </button>
        </div>

        {summary && (
          <>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '3rem' 
            }}>
              <div style={{ 
                background: theme.cardBackground, 
                padding: '2rem', 
                borderRadius: '20px', 
                boxShadow: theme.shadowHover,
                border: `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #27ae60, #2ecc71)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: theme.textSecondary, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Earned</h3>
                  <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>💰</div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: theme.textPrimary, marginBottom: '0.5rem' }}>
                  {formatCurrency(summary.totalBrokerageEarned)}
                </div>
                <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Total commission earned</div>
              </div>

              <div style={{ 
                background: theme.cardBackground, 
                padding: '2rem', 
                borderRadius: '20px', 
                boxShadow: theme.shadowHover,
                border: `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #3498db, #5dade2)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: theme.textSecondary, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>From Sellers</h3>
                  <div style={{ background: 'rgba(52, 152, 219, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>📤</div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: theme.textPrimary, marginBottom: '0.5rem' }}>
                  {formatCurrency(summary.totalBrokerageFromSellers)}
                </div>
                <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Commission from sellers</div>
              </div>

              <div style={{ 
                background: theme.cardBackground, 
                padding: '2rem', 
                borderRadius: '20px', 
                boxShadow: theme.shadowHover,
                border: `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #e67e22, #f39c12)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: theme.textSecondary, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>From Buyers</h3>
                  <div style={{ background: 'rgba(230, 126, 34, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>📥</div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: theme.textPrimary, marginBottom: '0.5rem' }}>
                  {formatCurrency(summary.totalBrokerageFromBuyers)}
                </div>
                <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Commission from buyers</div>
              </div>
            </div>

            {/* Breakdown Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ 
                background: theme.cardBackground, 
                borderRadius: '20px', 
                boxShadow: theme.shadowHover,
                border: `1px solid ${theme.border}`,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏙️ City-wise Breakdown
                  </h3>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '1rem' }}>
                  {summary.cityWiseBrokerage?.map((city, index) => (
                    <div key={city.city} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem', 
                      marginBottom: '0.5rem',
                      background: theme.hoverBg,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: `linear-gradient(135deg, ${['#3498db', '#e67e22', '#27ae60', '#9b59b6'][index % 4]}, ${['#5dade2', '#f39c12', '#2ecc71', '#bb8fce'][index % 4]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {city.city.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '1.1rem' }}>{city.city}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#27ae60', fontSize: '1.1rem' }}>{formatCurrency(city.totalBrokerage)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ 
                background: theme.cardBackground, 
                borderRadius: '20px', 
                boxShadow: theme.shadowHover,
                border: `1px solid ${theme.border}`,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📦 Product-wise Breakdown
                  </h3>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '1rem' }}>
                  {summary.productWiseBrokerage?.map((product, index) => (
                    <div key={product.productName} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem', 
                      marginBottom: '0.5rem',
                      background: theme.hoverBg,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: `linear-gradient(135deg, ${['#e67e22', '#27ae60', '#3498db', '#9b59b6'][index % 4]}, ${['#f39c12', '#2ecc71', '#5dade2', '#bb8fce'][index % 4]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {product.productName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '1.1rem' }}>{product.productName}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#27ae60', fontSize: '1.1rem' }}>{formatCurrency(product.totalBrokerage)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </>
        )}
    </div>
  );
};

export default BrokerageDashboard;
import { useState, useEffect } from 'react';
import { financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';

const AnalyticsControls = ({
  selectedFinancialYear,
  onFinancialYearChange,
  compareFinancialYear,
  onCompareFinancialYearChange,
  useRealData,
  onDataSourceToggle,
  showComparison,
  onToggleComparison,
  loading = false,
  onRefreshCache,
  onRefreshAllCache,
  refreshingCache = false
}) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [financialYears, setFinancialYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  useEffect(() => {
    loadFinancialYears();
  }, []);

  const loadFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const data = await financialYearAPI.getAllFinancialYears();
      setFinancialYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading financial years:', error);
      setFinancialYears([]);
    } finally {
      setLoadingYears(false);
    }
  };

  const formatFinancialYearDisplay = (fy) => {
    if (!fy) return '';
    return `${fy.financialYearName || 'FY'} (${formatDate(fy.start)} - ${formatDate(fy.end)})`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      backgroundColor: theme.cardBackground,
      padding: isMobile ? '16px' : '20px',
      borderRadius: '12px',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      marginBottom: '20px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left side controls */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
          alignItems: isMobile ? 'stretch' : 'center',
          flex: 1
        }}>
          {/* Financial Year Selector */}
          <div style={{ minWidth: isMobile ? 'auto' : '250px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: theme.textSecondary,
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Financial Year
            </label>
            <select
              value={selectedFinancialYear?.yearId || ''}
              onChange={(e) => {
                const selectedFY = financialYears.find(fy => fy.yearId === parseInt(e.target.value));
                onFinancialYearChange(selectedFY);
              }}
              disabled={loadingYears || loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.inputBackground,
                color: theme.textPrimary,
                fontSize: '14px',
                outline: 'none',
                cursor: loadingYears || loading ? 'not-allowed' : 'pointer',
                opacity: loadingYears || loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            >
              <option value="">
                {loadingYears ? 'Loading...' : 'Select Financial Year'}
              </option>
              {financialYears.map(fy => (
                <option key={fy.yearId} value={fy.yearId}>
                  {formatFinancialYearDisplay(fy)}
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: theme.textPrimary,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => onToggleComparison(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6'
                }}
              />
              Compare Years
            </label>
          </div>

          {/* Compare Financial Year Selector */}
          {showComparison && (
            <div style={{ minWidth: isMobile ? 'auto' : '250px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.textSecondary,
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Compare With
              </label>
              <select
                value={compareFinancialYear?.yearId || ''}
                onChange={(e) => {
                  const selectedFY = financialYears.find(fy => fy.yearId === parseInt(e.target.value));
                  onCompareFinancialYearChange(selectedFY);
                }}
                disabled={loadingYears || loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.inputBackground,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: loadingYears || loading ? 'not-allowed' : 'pointer',
                  opacity: loadingYears || loading ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              >
                <option value="">Select Year to Compare</option>
                {financialYears
                  .filter(fy => fy.yearId !== selectedFinancialYear?.yearId)
                  .map(fy => (
                    <option key={fy.yearId} value={fy.yearId}>
                      {formatFinancialYearDisplay(fy)}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Right side - Data Source Toggle and Cache Controls */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          {/* Data Source Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            backgroundColor: theme.background,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <span style={{
              color: theme.textSecondary,
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Data Source
            </span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={useRealData}
                onChange={(e) => onDataSourceToggle(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: useRealData ? '#3b82f6' : '#cbd5e1',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: useRealData ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
            <span style={{
              color: theme.textPrimary,
              fontSize: '14px',
              fontWeight: '500',
              minWidth: '60px'
            }}>
              {useRealData ? 'Real Data' : 'Demo Data'}
            </span>
          </div>

          {/* Cache Refresh Controls - Only show when using real data */}
          {useRealData && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button
                onClick={onRefreshCache}
                disabled={!selectedFinancialYear || refreshingCache || loading}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  fontSize: '12px',
                  cursor: (!selectedFinancialYear || refreshingCache || loading) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedFinancialYear || refreshingCache || loading) ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!refreshingCache && !loading && selectedFinancialYear) {
                    e.currentTarget.style.backgroundColor = theme.hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cardBackground;
                }}
              >
                {refreshingCache ? '🔄' : '🔄'}
                Refresh Cache
              </button>
              <button
                onClick={onRefreshAllCache}
                disabled={refreshingCache || loading}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.warning}`,
                  borderRadius: '6px',
                  backgroundColor: theme.warningBg,
                  color: theme.warning,
                  fontSize: '12px',
                  cursor: (refreshingCache || loading) ? 'not-allowed' : 'pointer',
                  opacity: (refreshingCache || loading) ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!refreshingCache && !loading) {
                    e.currentTarget.style.backgroundColor = theme.warning;
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.warningBg;
                  e.currentTarget.style.color = theme.warning;
                }}
              >
                {refreshingCache ? '🔄' : '🗑️'}
                Refresh All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: theme.background,
          borderRadius: '6px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Loading analytics data...
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AnalyticsControls;

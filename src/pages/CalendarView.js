import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyticsAPI, dailyLedgerAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { formatDateForDisplay, formatDateWithOrdinal } from '../utils/dateUtils';

const CalendarView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { financialYear } = location.state || {};

  const [analyticsData, setAnalyticsData] = useState(null);
  const [topPerformers, setTopPerformers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyLedgerData, setDailyLedgerData] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    if (!financialYear) {
      navigate('/financial-years');
      return;
    }
    loadAnalyticsData();
  }, [financialYear, navigate]);

  const loadAnalyticsData = async () => {
    try {
      const brokerId = localStorage.getItem('brokerId');
      if (!brokerId) {
        navigate('/login');
        return;
      }

      const analytics = await analyticsAPI.getFinancialYearAnalytics(brokerId, financialYear.yearId);

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    navigate('/daily-ledger', { state: { date: dateStr } });
  };

  const generateCalendar = () => {
    if (!financialYear) return [];

    const startDate = new Date(financialYear.start);
    const endDate = new Date(financialYear.end);
    const months = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const monthData = {
        year,
        month,
        monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
        days: []
      };

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        monthData.days.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        // Use date comparison without time to avoid timezone issues
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        if (dateOnly >= startOnly && dateOnly <= endOnly) {
          monthData.days.push(date);
        }
      }

      months.push(monthData);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
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

  if (!financialYear) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.background
      }}>
        <div style={{ fontSize: '24px', color: theme.textPrimary }}>Loading...</div>
      </div>
    );
  }

  const months = generateCalendar();
  const monthsPerRow = isMobile ? 1 : 4;

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      backgroundColor: theme.background,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: theme.cardBackground,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              color: theme.textPrimary,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              📅 {financialYear.financialYearName}
            </h1>
            <p style={{
              margin: 0,
              color: theme.textSecondary,
              fontSize: '16px'
            }}>
              {formatDateWithOrdinal(financialYear.start)} to {formatDateWithOrdinal(financialYear.end)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowAnalyticsModal(true)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${theme.primary}`,
                backgroundColor: theme.primaryBg,
                color: theme.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primaryBg;
                e.currentTarget.style.color = theme.primary;
              }}
            >
              📊
            </button>

            <button
              onClick={() => navigate('/financial-years')}
              style={{
                padding: '8px 16px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {analyticsData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              backgroundColor: theme.background,
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.primary }}>
                {formatCurrency(analyticsData.totalBrokerage)}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total Brokerage</div>
            </div>
            <div style={{
              backgroundColor: theme.background,
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.success }}>
                {formatNumber(analyticsData.totalTransactions)}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total Transactions</div>
            </div>
            <div style={{
              backgroundColor: theme.background,
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.info }}>
                {formatNumber(analyticsData.totalQuantity)}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total Quantity</div>
            </div>
            <div style={{
              backgroundColor: theme.background,
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.warning }}>
                {formatCurrency(analyticsData.totalTransactionValue)}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary }}>Transaction Value</div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${monthsPerRow}, 1fr)`,
        gap: '20px'
      }}>
        {months.map((monthData, index) => (
          <div key={index} style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: theme.textPrimary,
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {monthData.monthName} {monthData.year}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px'
            }}>
              {/* Week day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.textSecondary
                }}>
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {monthData.days.map((date, dayIndex) => (
                <div
                  key={dayIndex}
                  onClick={() => date && handleDateClick(date)}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '14px',
                    cursor: date ? 'pointer' : 'default',
                    backgroundColor: date && selectedDate && date.toDateString() === selectedDate.toDateString()
                      ? theme.primary
                      : 'transparent',
                    color: date && selectedDate && date.toDateString() === selectedDate.toDateString()
                      ? 'white'
                      : date ? theme.textPrimary : 'transparent',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    minHeight: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (date && !(selectedDate && date.toDateString() === selectedDate.toDateString())) {
                      e.currentTarget.style.backgroundColor = theme.hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (date && !(selectedDate && date.toDateString() === selectedDate.toDateString())) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {date ? date.getDate() : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
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
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: theme.shadowModal
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: theme.textPrimary }}>Analytics Overview</h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                ×
              </button>
            </div>

            {analyticsData ? (
              <div>
                <p style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Detailed analytics graphs will be implemented here
                </p>

                {/* Top Performers */}
                {topPerformers && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ color: theme.textPrimary }}>Top Performers</h4>

                    {topPerformers.topBuyers && topPerformers.topBuyers.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ color: theme.textSecondary, fontSize: '14px' }}>Top Buyers</h5>
                        {topPerformers.topBuyers.map((buyer, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: `1px solid ${theme.borderLight}`
                          }}>
                            <span style={{ color: theme.textPrimary }}>{buyer.firmName}</span>
                            <span style={{ color: theme.success }}>{formatCurrency(buyer.totalBrokerage)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {topPerformers.topSellers && topPerformers.topSellers.length > 0 && (
                      <div>
                        <h5 style={{ color: theme.textSecondary, fontSize: '14px' }}>Top Sellers</h5>
                        {topPerformers.topSellers.map((seller, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: `1px solid ${theme.borderLight}`
                          }}>
                            <span style={{ color: theme.textPrimary }}>{seller.firmName}</span>
                            <span style={{ color: theme.info }}>{formatCurrency(seller.totalBrokerage)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Insert data to view graphs
              </p>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default CalendarView;
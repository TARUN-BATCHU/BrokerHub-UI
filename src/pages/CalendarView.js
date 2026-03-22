import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { formatDateWithOrdinal } from '../utils/dateUtils';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const CalendarView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { financialYear } = location.state || {};

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    if (!financialYear) {
      navigate('/financial-years');
    }
  }, [financialYear, navigate]);

  const handleOpenAnalytics = async () => {
    setShowAnalyticsModal(true);
    if (analyticsData) return; // already loaded
    setAnalyticsLoading(true);
    try {
      const data = await analyticsAPI.getFinancialYearAnalytics(financialYear.yearId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
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

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/ledger-management')}
              style={{
                padding: '8px 16px',
                border: `1px solid ${theme.primary}`,
                borderRadius: '6px',
                backgroundColor: theme.primaryBg,
                color: theme.primary,
                fontSize: '14px',
                cursor: 'pointer',
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
              📋 Ledger Management
            </button>

            <button
              onClick={handleOpenAnalytics}
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
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '16px'
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAnalyticsModal(false)}
        >
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px',
              borderBottom: `1px solid ${theme.border}`,
              position: 'sticky', top: 0,
              backgroundColor: theme.cardBackground,
              borderRadius: '16px 16px 0 0',
              zIndex: 1
            }}>
              <div>
                <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '700' }}>
                  📊 Financial Year Analytics
                </h3>
                <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '13px' }}>
                  {financialYear?.financialYearName}
                </p>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '24px',
                  cursor: 'pointer', color: theme.textSecondary, lineHeight: 1
                }}
              >×</button>
            </div>

            <div style={{ padding: '24px' }}>
              {analyticsLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
                  <p style={{ fontSize: '16px' }}>Loading analytics...</p>
                </div>
              ) : analyticsData ? (
                <AnalyticsContent data={analyticsData} theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} formatCurrency={formatCurrency} formatNumber={formatNumber} />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                  <p>No analytics data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

const CHART_COLORS = [
  '#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#a855f7','#e11d48','#0ea5e9','#22c55e'
];

const AnalyticsContent = ({ data, theme, activeTab, setActiveTab, formatCurrency, formatNumber }) => {
  const monthly = data.monthlyAnalytics || [];

  // Summary KPIs
  const totalBrokerage = monthly.reduce((s, m) => s + m.totalBrokerage, 0);
  const totalTransactions = monthly.reduce((s, m) => s + m.totalTransactions, 0);
  const totalQuantity = monthly.reduce((s, m) => s + m.totalQuantity, 0);
  const totalValue = monthly.reduce((s, m) => s + m.totalTransactionValue, 0);

  // Monthly brokerage bar chart
  const monthlyBarData = {
    labels: monthly.map(m => m.monthName.split(' ')[0]),
    datasets: [{
      label: 'Brokerage (₹)',
      data: monthly.map(m => m.totalBrokerage),
      backgroundColor: CHART_COLORS[0] + 'cc',
      borderColor: CHART_COLORS[0],
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // Monthly transactions line chart
  const monthlyLineData = {
    labels: monthly.map(m => m.monthName.split(' ')[0]),
    datasets: [
      {
        label: 'Transactions',
        data: monthly.map(m => m.totalTransactions),
        borderColor: CHART_COLORS[2],
        backgroundColor: CHART_COLORS[2] + '33',
        tension: 0.4,
        fill: true,
        pointRadius: 4
      },
      {
        label: 'Quantity (bags)',
        data: monthly.map(m => m.totalQuantity),
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '33',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  // Top products pie
  const topProducts = (data.overallProductTotals || [])
    .sort((a, b) => b.totalBrokerage - a.totalBrokerage)
    .slice(0, 8);
  const productPieData = {
    labels: topProducts.map(p => p.productName),
    datasets: [{
      data: topProducts.map(p => p.totalBrokerage),
      backgroundColor: CHART_COLORS.slice(0, topProducts.length),
      borderWidth: 2,
      borderColor: theme.cardBackground
    }]
  };

  // Top cities
  const topCities = (data.overallCityTotals || [])
    .sort((a, b) => b.totalBrokerage - a.totalBrokerage)
    .slice(0, 10);

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: theme.textPrimary, font: { size: 11 } } },
      title: { display: !!title, text: title, color: theme.textPrimary, font: { size: 13, weight: '600' } },
      tooltip: { callbacks: { label: (ctx) => ` ₹${ctx.parsed.y?.toLocaleString('en-IN') ?? ctx.parsed.toLocaleString('en-IN')}` } }
    },
    scales: {
      x: { ticks: { color: theme.textSecondary, font: { size: 10 } }, grid: { color: theme.border + '44' } },
      y: { ticks: { color: theme.textSecondary, font: { size: 10 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'K' : v) }, grid: { color: theme.border + '44' } }
    }
  });

  const lineOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: theme.textPrimary, font: { size: 11 } } },
      tooltip: {}
    },
    scales: {
      x: { ticks: { color: theme.textSecondary, font: { size: 10 } }, grid: { color: theme.border + '44' } },
      y: { ticks: { color: theme.textSecondary, font: { size: 10 } }, grid: { color: theme.border + '44' } },
      y1: { position: 'right', ticks: { color: theme.textSecondary, font: { size: 10 } }, grid: { drawOnChartArea: false } }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: theme.textPrimary, font: { size: 11 }, boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}` } }
    }
  };

  const kpiStyle = (color) => ({
    backgroundColor: color + '18',
    border: `1px solid ${color}44`,
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    flex: 1,
    minWidth: '120px'
  });

  const tabs = ['monthly', 'products', 'cities'];
  const tabLabels = { monthly: '📅 Monthly', products: '🌾 Products', cities: '🏙️ Cities' };

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={kpiStyle(CHART_COLORS[0])}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: CHART_COLORS[0] }}>{formatCurrency(totalBrokerage)}</div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>Total Brokerage</div>
        </div>
        <div style={kpiStyle(CHART_COLORS[2])}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: CHART_COLORS[2] }}>{formatNumber(totalTransactions)}</div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>Transactions</div>
        </div>
        <div style={kpiStyle(CHART_COLORS[1])}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: CHART_COLORS[1] }}>{formatNumber(totalQuantity)}</div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>Total Quantity</div>
        </div>
        <div style={kpiStyle(CHART_COLORS[3])}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: CHART_COLORS[3] }}>{formatCurrency(totalValue)}</div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>Transaction Value</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab ? '700' : '400',
              color: activeTab === tab ? CHART_COLORS[0] : theme.textSecondary,
              borderBottom: activeTab === tab ? `2px solid ${CHART_COLORS[0]}` : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.2s'
            }}
          >{tabLabels[tab]}</button>
        ))}
      </div>

      {/* Tab: Monthly */}
      {activeTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>Monthly Brokerage</h4>
            <Bar data={monthlyBarData} options={chartOptions()} />
          </div>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>Transactions & Quantity Trend</h4>
            <Line data={monthlyLineData} options={lineOptions} />
          </div>
          {/* Monthly table */}
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>Month-wise Summary</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  {['Month','Brokerage','Transactions','Quantity','Value'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Month' ? 'left' : 'right', color: theme.textSecondary, fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? 'transparent' : theme.border + '22' }}>
                    <td style={{ padding: '8px 12px', color: theme.textPrimary, fontWeight: '500' }}>{m.monthName}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: CHART_COLORS[0], fontWeight: '600' }}>{formatCurrency(m.totalBrokerage)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(m.totalTransactions)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(m.totalQuantity)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary }}>{formatCurrency(m.totalTransactionValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>Top Products by Brokerage</h4>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Pie data={productPieData} options={pieOptions} />
            </div>
          </div>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>All Products</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  {['Product','Brokerage','Qty','Transactions','Avg Price','Avg Brokerage/Unit'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Product' ? 'left' : 'right', color: theme.textSecondary, fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.overallProductTotals || []).sort((a,b) => b.totalBrokerage - a.totalBrokerage).map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? 'transparent' : theme.border + '22' }}>
                    <td style={{ padding: '8px 12px', color: theme.textPrimary, fontWeight: '500' }}>{p.productName}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: CHART_COLORS[0], fontWeight: '600' }}>{formatCurrency(p.totalBrokerage)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(p.totalQuantity)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(p.totalTransactions)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary }}>₹{p.averagePrice?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary }}>₹{p.averageBrokeragePerUnit?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Cities */}
      {activeTab === 'cities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>Top 10 Cities by Brokerage</h4>
            <Bar
              data={{
                labels: topCities.map(c => c.cityName),
                datasets: [{
                  label: 'Brokerage (₹)',
                  data: topCities.map(c => c.totalBrokerage),
                  backgroundColor: CHART_COLORS.slice(0, topCities.length).map(c => c + 'cc'),
                  borderColor: CHART_COLORS.slice(0, topCities.length),
                  borderWidth: 1,
                  borderRadius: 6
                }]
              }}
              options={{ ...chartOptions(), indexAxis: 'y', plugins: { ...chartOptions().plugins, legend: { display: false } }, scales: { x: { ticks: { color: theme.textSecondary, font: { size: 10 }, callback: v => '₹'+(v>=1000?(v/1000).toFixed(0)+'K':v) }, grid: { color: theme.border+'44' } }, y: { ticks: { color: theme.textSecondary, font: { size: 10 } }, grid: { color: theme.border+'44' } } } }}
            />
          </div>
          <div style={{ backgroundColor: theme.background, borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
            <h4 style={{ margin: '0 0 12px', color: theme.textPrimary, fontSize: '14px' }}>All Cities</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  {['City','Brokerage','Transactions','Quantity','Value'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'City' ? 'left' : 'right', color: theme.textSecondary, fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.overallCityTotals || []).sort((a,b) => b.totalBrokerage - a.totalBrokerage).map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: i % 2 === 0 ? 'transparent' : theme.border + '22' }}>
                    <td style={{ padding: '8px 12px', color: theme.textPrimary, fontWeight: '500' }}>{c.cityName}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: CHART_COLORS[0], fontWeight: '600' }}>{formatCurrency(c.totalBrokerage)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(c.totalTransactions)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textPrimary }}>{formatNumber(c.totalQuantity)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary }}>{formatCurrency(c.totalTransactionValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
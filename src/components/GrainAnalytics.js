import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { grainCostsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GrainAnalytics = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [grainCosts, setGrainCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    productName: '',
    cost: '',
    dateTime: new Date().toISOString().slice(0, 16)
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(null);
  const [editEntry, setEditEntry] = useState({
    productName: '',
    cost: '',
    dateTime: ''
  });

  useEffect(() => {
    loadGrainCosts();
  }, []);

  const loadGrainCosts = async () => {
    if (!user?.brokerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await grainCostsAPI.getAllGrainCosts(user.brokerId);
      if (response.success && response.data) {
        setGrainCosts(response.data);
      } else {
        setGrainCosts([]);
      }
    } catch (err) {
      console.error('Error loading grain costs:', err);
      setError('Failed to load grain costs data');
      setGrainCosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForBackend = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!user?.brokerId || !newEntry.productName || !newEntry.cost) return;

    try {
      const response = await grainCostsAPI.addGrainCost(user.brokerId, {
        productName: newEntry.productName,
        cost: parseFloat(newEntry.cost),
        date: formatDateForBackend(newEntry.dateTime)
      });

      if (response.success) {
        setNewEntry({
          productName: '',
          cost: '',
          dateTime: new Date().toISOString().slice(0, 16)
        });
        setShowAddForm(false);
        loadGrainCosts();
      }
    } catch (err) {
      console.error('Error adding grain cost:', err);
      alert('Failed to add grain cost entry');
    }
  };

  const handleDeleteEntry = async (grainCostId) => {
    if (!user?.brokerId) return;
    
    setDeletingId(grainCostId);
    try {
      const response = await grainCostsAPI.deleteGrainCost(user.brokerId, grainCostId);
      if (response.success) {
        loadGrainCosts();
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting grain cost:', err);
      alert('Failed to delete grain cost entry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditEntry = (item) => {
    const [day, month, year] = item.date.split('-');
    const dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00`;
    
    setEditEntry({
      productName: item.productName,
      cost: item.cost.toString(),
      dateTime: dateTime
    });
    setShowEditForm(item);
  };

  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    if (!user?.brokerId || !editEntry.productName || !editEntry.cost || !showEditForm) return;

    setDeletingId(showEditForm.id);
    try {
      // Delete existing entry
      await grainCostsAPI.deleteGrainCost(user.brokerId, showEditForm.id);
      
      // Add new entry with updated data
      const response = await grainCostsAPI.addGrainCost(user.brokerId, {
        productName: editEntry.productName,
        cost: parseFloat(editEntry.cost),
        date: formatDateForBackend(editEntry.dateTime)
      });

      if (response.success) {
        setEditEntry({ productName: '', cost: '', dateTime: '' });
        setShowEditForm(null);
        loadGrainCosts();
      }
    } catch (err) {
      console.error('Error updating grain cost:', err);
      alert('Failed to update grain cost entry');
    } finally {
      setDeletingId(null);
    }
  };

  const getUniqueProducts = () => {
    const products = [...new Set(grainCosts.map(item => item.productName))];
    return products.sort();
  };

  const getFilteredData = () => {
    let filtered = grainCosts;
    
    // Filter by product
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(item => item.productName === selectedProduct);
    }
    
    // Filter by date range
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date);
        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate + 'T23:59:59') : null;
        
        if (start && end) {
          return itemDate >= start && itemDate <= end;
        } else if (start) {
          return itemDate >= start;
        } else if (end) {
          return itemDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  };

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  const parseDate = (dateStr) => {
    // Convert dd-MM-yyyy to Date object
    const [day, month, year] = dateStr.split('-');
    return new Date(year, month - 1, day);
  };

  const prepareChartData = () => {
    const filteredData = getFilteredData();
    
    if (selectedProduct === 'all') {
      // Group data by product and sort by date
      const productGroups = {};
      filteredData.forEach(item => {
        if (!productGroups[item.productName]) {
          productGroups[item.productName] = [];
        }
        const dateObj = parseDate(item.date);
        productGroups[item.productName].push({
          date: dateObj,
          cost: item.cost,
          monthYear: dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
        });
      });

      // Sort each product's data by date
      Object.keys(productGroups).forEach(product => {
        productGroups[product].sort((a, b) => a.date - b.date);
      });

      // Get all unique month-year combinations and sort them
      const allMonthYears = [...new Set(filteredData.map(item => {
        const dateObj = parseDate(item.date);
        return dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      }))].sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
      ];

      // Create unified labels from all products
      const allLabels = [];
      allMonthYears.forEach(monthYear => {
        const monthEntries = [];
        Object.keys(productGroups).forEach(product => {
          const monthData = productGroups[product].filter(item => item.monthYear === monthYear);
          monthEntries.push(...monthData);
        });
        
        if (monthEntries.length > 0) {
          // Sort entries within the month by date
          monthEntries.sort((a, b) => a.date - b.date);
          const uniqueDates = [...new Set(monthEntries.map(item => item.date.getTime()))];
          
          if (uniqueDates.length === 1) {
            allLabels.push(monthYear);
          } else {
            uniqueDates.forEach((_, idx) => {
              allLabels.push(`${monthYear} (${idx + 1})`);
            });
          }
        }
      });

      // Build datasets with unified labels
      const finalDatasets = Object.keys(productGroups).map((product, index) => {
        const productData = productGroups[product];
        const dataPoints = allLabels.map(label => {
          const monthYear = label.includes('(') ? label.split(' (')[0] : label;
          const entryIndex = label.includes('(') ? parseInt(label.split('(')[1].split(')')[0]) - 1 : 0;
          const monthData = productData.filter(item => item.monthYear === monthYear);
          
          if (monthData.length > 0) {
            monthData.sort((a, b) => a.date - b.date);
            return monthData[entryIndex] ? monthData[entryIndex].cost : null;
          }
          return null;
        });

        return {
          label: product,
          data: dataPoints,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '15',
          tension: 0.4,
          fill: false,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors[index % colors.length],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: colors[index % colors.length],
          pointHoverBorderWidth: 3,
          borderWidth: 3,
          spanGaps: true
        };
      });

      return {
        labels: allLabels,
        datasets: finalDatasets
      };
    } else {
      // Show single product data with month-year labels
      const sortedData = filteredData.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      
      // Group by month-year and handle multiple entries per month
      const monthGroups = {};
      sortedData.forEach(item => {
        const dateObj = parseDate(item.date);
        const monthYear = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        if (!monthGroups[monthYear]) {
          monthGroups[monthYear] = [];
        }
        monthGroups[monthYear].push(item);
      });

      const labels = [];
      const dataPoints = [];
      
      Object.keys(monthGroups).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
      }).forEach(monthYear => {
        const monthData = monthGroups[monthYear].sort((a, b) => parseDate(a.date) - parseDate(b.date));
        if (monthData.length === 1) {
          labels.push(monthYear);
          dataPoints.push(monthData[0].cost);
        } else {
          // Multiple entries in same month - add each with index
          monthData.forEach((item, idx) => {
            labels.push(`${monthYear} (${idx + 1})`);
            dataPoints.push(item.cost);
          });
        }
      });
      
      return {
        labels: labels,
        datasets: [{
          label: selectedProduct,
          data: dataPoints,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#36A2EB',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#36A2EB',
          pointHoverBorderWidth: 3,
          borderWidth: 3
        }]
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.textPrimary,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: selectedProduct === 'all' ? 'All Products Price Analytics' : `${selectedProduct} Price Analytics`,
        color: theme.textPrimary,
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme.cardBackground,
        titleColor: theme.textPrimary,
        bodyColor: theme.textPrimary,
        borderColor: theme.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          color: theme.textPrimary,
          font: {
            size: 14,
            weight: '600'
          }
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 11
          }
        },
        grid: {
          color: theme.borderLight,
          drawBorder: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (₹)',
          color: theme.textPrimary,
          font: {
            size: 14,
            weight: '600'
          }
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 11
          },
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: theme.borderLight,
          drawBorder: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            color: theme.textPrimary,
            fontSize: '28px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px'
            }}>📊</span>
            Grain Price Analytics
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            color: theme.textSecondary,
            fontSize: '16px'
          }}>
            Track and analyze grain price trends with interactive visualizations
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <span style={{ fontSize: '16px' }}>➕</span>
          Add Price Entry
        </button>
      </div>

      {/* Enhanced Controls */}
      <div style={{
        backgroundColor: theme.cardBackground,
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Chart Type */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: theme.textPrimary, 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              📈 Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            >
              <option value="line">📈 Line Chart</option>
              <option value="bar">📊 Bar Chart</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: theme.textPrimary, 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              🌾 Product Filter
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            >
              <option value="all">🌐 All Products</option>
              {getUniqueProducts().map(product => (
                <option key={product} value={product}>🌾 {product}</option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: theme.textPrimary, 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              📅 Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          {/* Date Range End */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: theme.textPrimary, 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              📅 End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={clearDateRange}
                style={{
                  padding: '12px 16px',
                  border: `1px solid ${theme.warning}`,
                  borderRadius: '8px',
                  backgroundColor: theme.warningBg,
                  color: theme.warning,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
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
                🗑️ Clear
              </button>
            )}
            <button
              onClick={loadGrainCosts}
              disabled={loading}
              style={{
                padding: '12px 16px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '12px',
                fontWeight: '600',
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
              🔄 {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {(selectedProduct !== 'all' || dateRange.startDate || dateRange.endDate) && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: theme.infoBg,
            borderRadius: '8px',
            border: `1px solid ${theme.info}`,
            fontSize: '14px',
            color: theme.info
          }}>
            <strong>Active Filters:</strong>
            {selectedProduct !== 'all' && <span> Product: {selectedProduct}</span>}
            {dateRange.startDate && <span> From: {new Date(dateRange.startDate).toLocaleDateString('en-GB')}</span>}
            {dateRange.endDate && <span> To: {new Date(dateRange.endDate).toLocaleDateString('en-GB')}</span>}
            <span> | Showing {getFilteredData().length} entries</span>
          </div>
        )}
      </div>

      {/* Enhanced Chart */}
      <div style={{
        backgroundColor: theme.cardBackground,
        padding: '24px',
        borderRadius: '16px',
        border: `1px solid ${theme.border}`,
        marginBottom: '24px',
        boxShadow: theme.shadow
      }}>
        {loading ? (
          <div style={{
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textSecondary
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                animation: 'pulse 2s infinite'
              }}>⏳</div>
              <p style={{ fontSize: '16px', margin: 0 }}>Loading grain price data...</p>
            </div>
          </div>
        ) : error ? (
          <div style={{
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.error,
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Error Loading Data</h3>
              <p style={{ margin: '0 0 16px 0', color: theme.textSecondary }}>{error}</p>
              <button
                onClick={loadGrainCosts}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.primary || '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        ) : getFilteredData().length === 0 ? (
          <div style={{
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textSecondary,
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '80px', marginBottom: '24px' }}>📈</div>
              <h3 style={{ margin: '0 0 12px 0', color: theme.textPrimary, fontSize: '24px' }}>
                {grainCosts.length === 0 ? 'No Data Available' : 'No Data in Selected Range'}
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {grainCosts.length === 0 
                  ? 'Start by adding your first grain price entry' 
                  : 'Try adjusting your filters to see more data'
                }
              </p>
            </div>
          </div>
        ) : (
          <div style={{ height: '500px' }}>
            <ChartComponent data={prepareChartData()} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Enhanced Data Table */}
      {getFilteredData().length > 0 && (
        <div style={{
          backgroundColor: theme.cardBackground,
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              color: theme.textPrimary,
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Recent Price Entries ({getFilteredData().length})
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: theme.background }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    borderBottom: `2px solid ${theme.border}`, 
                    color: theme.textPrimary,
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Product
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    borderBottom: `2px solid ${theme.border}`, 
                    color: theme.textPrimary,
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Price (₹)
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    borderBottom: `2px solid ${theme.border}`, 
                    color: theme.textPrimary,
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Date
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    borderBottom: `2px solid ${theme.border}`, 
                    color: theme.textPrimary,
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredData()
                  .sort((a, b) => parseDate(b.date) - parseDate(a.date))
                  .slice(0, 20)
                  .map((item, index) => (
                    <tr key={item.id || index} style={{
                      borderBottom: `1px solid ${theme.borderLight}`,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <td style={{ 
                        padding: '16px', 
                        color: theme.textPrimary, 
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🌾</span>
                          {item.productName}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'right', 
                        color: theme.success, 
                        fontWeight: '600',
                        fontSize: '15px'
                      }}>
                        ₹{item.cost.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        color: theme.textSecondary,
                        fontSize: '14px'
                      }}>
                        {item.date}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditEntry(item)}
                            disabled={deletingId === item.id}
                            style={{
                              padding: '8px 12px',
                              border: `1px solid ${theme.info}`,
                              borderRadius: '6px',
                              backgroundColor: theme.infoBg,
                              color: theme.info,
                              cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: deletingId === item.id ? 0.6 : 1,
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              if (deletingId !== item.id) {
                                e.currentTarget.style.backgroundColor = theme.info;
                                e.currentTarget.style.color = 'white';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingId !== item.id) {
                                e.currentTarget.style.backgroundColor = theme.infoBg;
                                e.currentTarget.style.color = theme.info;
                              }
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(item)}
                            disabled={deletingId === item.id}
                            style={{
                              padding: '8px 12px',
                              border: `1px solid ${theme.error}`,
                              borderRadius: '6px',
                              backgroundColor: theme.errorBg,
                              color: theme.error,
                              cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              opacity: deletingId === item.id ? 0.6 : 1,
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              if (deletingId !== item.id) {
                                e.currentTarget.style.backgroundColor = theme.error;
                                e.currentTarget.style.color = 'white';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingId !== item.id) {
                                e.currentTarget.style.backgroundColor = theme.errorBg;
                                e.currentTarget.style.color = theme.error;
                              }
                            }}
                          >
                            {deletingId === item.id ? '⏳' : '🗑️'}
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Add Entry Modal */}
      {showAddForm && (
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
            border: `1px solid ${theme.border}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: theme.textPrimary,
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '28px' }}>➕</span>
                Add Price Entry
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
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

            <form onSubmit={handleAddEntry}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  🌾 Product Name
                </label>
                <input
                  type="text"
                  value={newEntry.productName}
                  onChange={(e) => setNewEntry({ ...newEntry, productName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="e.g., Wheat, Rice, Dal, Corn"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  💰 Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.cost}
                  onChange={(e) => setNewEntry({ ...newEntry, cost: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Enter price per unit"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  📅 Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newEntry.dateTime}
                  onChange={(e) => setNewEntry({ ...newEntry, dateTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '12px 24px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  ✅ Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditForm && (
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
            border: `1px solid ${theme.border}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: theme.textPrimary,
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '28px' }}>✏️</span>
                Edit Price Entry
              </h3>
              <button
                onClick={() => setShowEditForm(null)}
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

            <form onSubmit={handleUpdateEntry}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  🌾 Product Name
                </label>
                <input
                  type="text"
                  value={editEntry.productName}
                  onChange={(e) => setEditEntry({ ...editEntry, productName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="e.g., Wheat, Rice, Dal, Corn"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  💰 Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editEntry.cost}
                  onChange={(e) => setEditEntry({ ...editEntry, cost: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Enter price per unit"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  📅 Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editEntry.dateTime}
                  onChange={(e) => setEditEntry({ ...editEntry, dateTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditForm(null)}
                  style={{
                    padding: '12px 24px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingId === showEditForm.id}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: deletingId === showEditForm.id ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    opacity: deletingId === showEditForm.id ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (deletingId !== showEditForm.id) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deletingId !== showEditForm.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  {deletingId === showEditForm.id ? '⏳ Updating...' : '✅ Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: theme.textPrimary,
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Delete Price Entry
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              Are you sure you want to delete the price entry for <strong>{showDeleteConfirm.productName}</strong> 
              (₹{showDeleteConfirm.cost.toLocaleString()}) from {showDeleteConfirm.date}?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '12px 24px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(showDeleteConfirm.id)}
                disabled={deletingId === showDeleteConfirm.id}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: deletingId === showDeleteConfirm.id ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: deletingId === showDeleteConfirm.id ? 0.6 : 1
                }}
              >
                {deletingId === showDeleteConfirm.id ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrainAnalytics;
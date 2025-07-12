import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import { brokerageAPI } from '../services/brokerageAPI';
import { financialYearAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import UserDetailModal from '../components/UserDetailModal';

const BrokerageUsers = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedCity]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [fyResponse, usersResponse] = await Promise.all([
        financialYearAPI.getAllFinancialYears(),
        userAPI.getUserSummary(0, 1000)
      ]);
      
      console.log('FY Response:', fyResponse);
      console.log('Users Response:', usersResponse);
      
      const years = fyResponse || [];
      console.log('First FY object:', years[0]);
      setFinancialYears(years);
      if (years.length > 0) {
        const firstYear = years[0];
        const yearId = firstYear.financialYearId || firstYear.yearId || firstYear.id;
        setSelectedYear(yearId ? yearId.toString() : '1');
      }
      
      const userData = usersResponse.content || [];
      console.log('User Data:', userData);
      setUsers(userData);
      
      // Extract unique cities
      const uniqueCities = [...new Set(userData.map(user => user.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    console.log('Filtering users:', users.length, 'users');
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCity) {
      filtered = filtered.filter(user => user.city === selectedCity);
    }
    
    console.log('Filtered users:', filtered.length);
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.userId));
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const response = await brokerageAPI.getUserDetailedBrokerage(user.userId, selectedYear);
      setSelectedUser({ ...user, details: response.data });
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const handleDownloadBill = async (userId, format = 'html') => {
    try {
      if (format === 'excel') {
        await brokerageAPI.downloadUserExcel(userId, selectedYear);
      } else {
        await brokerageAPI.downloadUserBill(userId, selectedYear);
      }
    } catch (error) {
      console.error('Failed to download bill:', error);
    }
  };

  const handleBulkBills = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await brokerageAPI.bulkBillsByUsers(selectedUsers, selectedYear);
      alert('Bulk bill generation started. Check document status for progress.');
    } catch (error) {
      console.error('Failed to start bulk generation:', error);
    }
  };

  const handleBulkExcel = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await brokerageAPI.bulkExcelByUsers(selectedUsers, selectedYear);
      alert('Bulk Excel generation started. Check document status for progress.');
    } catch (error) {
      console.error('Failed to start bulk generation:', error);
    }
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
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: theme.shadowModal
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>👥 User Brokerage</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Manage individual user brokerage and generate reports</p>
            </div>
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
              {financialYears.map(year => {
                const yearId = year.financialYearId || year.yearId || year.id;
                return (
                  <option key={yearId} value={yearId} style={{ color: theme.textPrimary, background: theme.cardBackground }}>
                    {year.financialYearName || year.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          background: theme.cardBackground, 
          borderRadius: '16px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                placeholder="🔍 Search by firm name or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  border: `2px solid ${theme.border}`, 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  background: theme.background, 
                  color: theme.textPrimary,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ 
                minWidth: '180px', 
                padding: '1rem 1.5rem', 
                border: `2px solid ${theme.border}`, 
                borderRadius: '12px', 
                fontSize: '1rem', 
                background: theme.background, 
                color: theme.textPrimary,
                cursor: 'pointer'
              }}
            >
              <option value="">🏙️ All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ 
          background: theme.cardBackground, 
          borderRadius: '20px', 
          boxShadow: theme.shadowHover,
          border: `1px solid ${theme.border}`,
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 1fr 120px 140px 160px', 
            alignItems: 'center', 
            padding: '1.5rem', 
            background: theme.hoverBg, 
            fontWeight: '700', 
            color: theme.textPrimary,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            <div>Firm Details</div>
            <div>City</div>
            <div>Brokerage</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredUsers.map((user, index) => (
              <UserRow
                key={user.userId}
                user={user}
                selectedYear={selectedYear}
                isSelected={selectedUsers.includes(user.userId)}
                onSelect={() => handleUserSelect(user.userId)}
                onViewDetails={() => handleViewDetails(user)}
                onDownloadBill={(format) => handleDownloadBill(user.userId, format)}
                theme={theme}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: theme.cardBackground, 
            padding: '1.5rem 2rem', 
            borderRadius: '20px', 
            boxShadow: theme.shadowModal, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem', 
            zIndex: 1000,
            border: `1px solid ${theme.border}`,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ fontWeight: '700', color: theme.textPrimary, fontSize: '1.1rem' }}>
              ✓ {selectedUsers.length} users selected
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleBulkBills} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #e67e22, #f39c12)', 
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                📄 Bulk Bills
              </button>
              <button 
                onClick={handleBulkExcel} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)', 
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                📊 Bulk Excel
              </button>
              <button 
                onClick={() => setSelectedUsers([])} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginTop: '2rem',
          marginBottom: '2rem'
        }}>
          <button 
            onClick={() => window.location.href = '/brokerage'} 
            style={{ 
              padding: '1rem 1.5rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            💰 Brokerage Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/brokerage/bulk'} 
            style={{ 
              padding: '1rem 1.5rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #e67e22, #f39c12)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🚀 Bulk Operations
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            style={{ 
              padding: '1rem 1.5rem', 
              border: `2px solid ${theme.border}`, 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: theme.cardBackground, 
              color: theme.textPrimary,
              transition: 'all 0.3s ease'
            }}
          >
            🏠 Main Dashboard
          </button>
        </div>

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
    </div>
  );
};

const UserRow = ({ user, selectedYear, isSelected, onSelect, onViewDetails, onDownloadBill, theme, index }) => {
  const [brokerage, setBrokerage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokerage();
  }, [user.userId, selectedYear]);

  const loadBrokerage = async () => {
    try {
      const response = await brokerageAPI.getUserTotalBrokerage(user.userId, selectedYear);
      setBrokerage(response.data);
    } catch (error) {
      console.error('Failed to load brokerage:', error);
      setBrokerage(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '60px 1fr 120px 140px 160px', 
      alignItems: 'center', 
      padding: '1.5rem', 
      borderBottom: `1px solid ${theme.border}`,
      background: isSelected ? theme.hoverBg : 'transparent',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          style={{ transform: 'scale(1.2)' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          background: `linear-gradient(135deg, ${['#3498db', '#e67e22', '#27ae60', '#9b59b6', '#e74c3c'][index % 5]}, ${['#5dade2', '#f39c12', '#2ecc71', '#bb8fce', '#ec7063'][index % 5]})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          {user.firmName?.charAt(0) || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: '700', color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{user.firmName}</div>
          <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>Bags: {user.totalBagsSold + user.totalBagsBought} | Rate: ₹{user.brokeragePerBag}</div>
        </div>
      </div>
      <div style={{ 
        color: theme.textPrimary, 
        fontWeight: '600',
        padding: '0.5rem 1rem',
        background: theme.hoverBg,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        {user.city}
      </div>
      <div style={{ 
        fontWeight: '800', 
        color: '#27ae60', 
        fontSize: '1.1rem',
        textAlign: 'center'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={require('../utils/Animation - 1752033337485.gif')} alt="Loading..." style={{ width: '24px', height: '24px' }} />
          </div>
        ) : (
          formatCurrency(user.totalPayableBrokerage || brokerage)
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button 
          onClick={onViewDetails} 
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            background: 'linear-gradient(135deg, #3498db, #5dade2)', 
            color: 'white',
            boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
            transition: 'all 0.3s ease'
          }} 
          title="View Details"
        >
          👁️
        </button>
        <button 
          onClick={() => onDownloadBill('html')} 
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            background: 'linear-gradient(135deg, #e67e22, #f39c12)', 
            color: 'white',
            boxShadow: '0 2px 8px rgba(230, 126, 34, 0.3)',
            transition: 'all 0.3s ease'
          }} 
          title="Download Bill"
        >
          📄
        </button>
        <button 
          onClick={() => onDownloadBill('excel')} 
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)', 
            color: 'white',
            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
            transition: 'all 0.3s ease'
          }} 
          title="Download Excel"
        >
          📊
        </button>
      </div>
    </div>
  );
};

export default BrokerageUsers;
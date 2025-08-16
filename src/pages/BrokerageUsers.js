import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import { brokerageAPI } from '../services/brokerageAPI';
import { financialYearAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import UserDetailModal from '../components/UserDetailModal';
import CustomBrokerageModal from '../components/CustomBrokerageModal';
import '../styles/modern-ui.css';

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
  const [customBrokerageModal, setCustomBrokerageModal] = useState({ isOpen: false, userId: null, format: null });

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

  const handleDownloadBill = (userId, format = 'html') => {
    setCustomBrokerageModal({ isOpen: true, userId, format });
  };

  const handleCustomBrokerageConfirm = async (customBrokerage) => {
    const { userId, format } = customBrokerageModal;
    try {
      if (format === 'bulk-bills') {
        await brokerageAPI.bulkBillsByUsers(selectedUsers, selectedYear, customBrokerage);
        alert('Bulk bill generation started. Check document status for progress.');
      } else if (format === 'bulk-excel') {
        await brokerageAPI.bulkExcelByUsers(selectedUsers, selectedYear, customBrokerage);
        alert('Bulk Excel generation started. Check document status for progress.');
      } else if (format === 'excel') {
        await brokerageAPI.downloadUserExcel(userId, selectedYear, customBrokerage);
      } else {
        await brokerageAPI.downloadUserBill(userId, selectedYear, customBrokerage);
      }
    } catch (error) {
      console.error('Failed to download/generate:', error);
    }
  };

  const handleCustomBrokerageClose = () => {
    setCustomBrokerageModal({ isOpen: false, userId: null, format: null });
  };

  const handleBulkBills = () => {
    if (selectedUsers.length === 0) return;
    setCustomBrokerageModal({ isOpen: true, userId: 'bulk-bills', format: 'bulk-bills' });
  };

  const handleBulkExcel = () => {
    if (selectedUsers.length === 0) return;
    setCustomBrokerageModal({ isOpen: true, userId: 'bulk-excel', format: 'bulk-excel' });
  };



  if (loading) return (
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
            }}>User Management</h1>
            <p style={{ 
              margin: 0, 
              color: theme.textSecondary, 
              fontSize: '0.95rem',
              fontWeight: '400',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>Manage individual user brokerage and generate comprehensive reports</p>
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
              onChange={(e) => setSelectedYear(e.target.value)}
              className="modern-select"
              style={{ minWidth: '160px', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
            >
              {financialYears.map(year => {
                const yearId = year.financialYearId || year.yearId || year.id;
                return (
                  <option key={yearId} value={yearId} style={{ background: theme.cardBackground, color: theme.textPrimary }}>
                    {year.financialYearName || year.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="modern-card animate-slide-in" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-12)', background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
              <div style={{ position: 'relative' }}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ 
                    position: 'absolute', 
                    left: 'var(--space-4)', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: theme.textMuted 
                  }}
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by firm name or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input"
                  style={{ paddingLeft: 'var(--space-12)', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                />
              </div>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="modern-select"
              style={{ minWidth: '200px', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
            >
              <option value="" style={{ background: theme.cardBackground, color: theme.textPrimary }}>All Cities</option>
              {cities.map(city => (
                <option key={city} value={city} style={{ background: theme.cardBackground, color: theme.textPrimary }}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="modern-table animate-fade-in" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          {/* Table Header */}
          <div className="modern-table-header" style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 1fr 140px 160px 180px', 
            alignItems: 'center',
            background: theme.hoverBg,
            borderBottom: `1px solid ${theme.border}`,
            color: theme.textSecondary
          }}>
            <div style={{ textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                style={{ 
                  transform: 'scale(1.2)',
                  accentColor: 'var(--color-secondary)'
                }}
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
                onDownloadBill={handleDownloadBill}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div style={{ 
            position: 'fixed', 
            bottom: 'var(--space-8)', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: theme.cardBackground, 
            padding: 'var(--space-6) var(--space-8)', 
            borderRadius: 'var(--radius-2xl)', 
            boxShadow: theme.shadowModal, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-8)', 
            zIndex: 1000,
            border: `1px solid ${theme.border}`,
            flexWrap: 'wrap',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)'
          }}
          className="animate-fade-in"
        >
            <div style={{ 
              fontWeight: '700', 
              color: theme.textPrimary, 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              {selectedUsers.length} users selected
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button 
                onClick={handleBulkBills} 
                className="modern-button modern-button-primary"
                title="Generate bulk bills with custom brokerage option"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Bulk Bills
              </button>
              <button 
                onClick={handleBulkExcel} 
                className="modern-button modern-button-accent"
                title="Generate bulk Excel reports with custom brokerage option"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Bulk Excel
              </button>
              <button 
                onClick={() => setSelectedUsers([])} 
                className="modern-button modern-button-outline"
                style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-4)', 
          marginTop: 'var(--space-12)',
          marginBottom: 'var(--space-8)'
        }}>
          <button 
            onClick={() => window.location.href = '/brokerage'} 
            className="modern-button modern-button-accent"
            style={{ padding: 'var(--space-5) var(--space-8)', fontSize: '1rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Brokerage Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/brokerage/bulk'} 
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
            onClick={() => window.location.href = '/dashboard'} 
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

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        <CustomBrokerageModal
          isOpen={customBrokerageModal.isOpen}
          onClose={handleCustomBrokerageClose}
          onConfirm={handleCustomBrokerageConfirm}
          title={
            customBrokerageModal.format === 'bulk-bills' ? 'Bulk Bills Generation' :
            customBrokerageModal.format === 'bulk-excel' ? 'Bulk Excel Generation' :
            `Download ${customBrokerageModal.format === 'excel' ? 'Excel' : 'Bill'}`
          }
        />
      </div>
    </div>
  );
};

const UserRow = ({ user, selectedYear, isSelected, onSelect, onViewDetails, onDownloadBill, index }) => {
  const { theme } = useTheme();
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
    <div className="modern-table-row" style={{ 
      display: 'grid', 
      gridTemplateColumns: '60px 1fr 140px 160px 180px', 
      alignItems: 'center',
      background: isSelected ? theme.hoverBg : 'transparent',
      borderBottom: `1px solid ${theme.borderLight}`
    }}>
      <div style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          style={{ 
            transform: 'scale(1.2)',
            accentColor: 'var(--color-secondary)'
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: 'var(--radius-xl)', 
          background: `var(--color-${['secondary', 'warning', 'accent', 'primary', 'error'][index % 5]})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '1.25rem'
        }}>
          {user.firmName?.charAt(0) || 'U'}
        </div>
        <div>
          <div style={{ 
            fontWeight: '700', 
            color: theme.textPrimary, 
            fontSize: '1rem', 
            marginBottom: 'var(--space-1)' 
          }}>{user.firmName}</div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: theme.textSecondary,
            fontFamily: 'var(--font-mono)'
          }}>Bags: {user.totalBagsSold + user.totalBagsBought} | Rate: ₹{user.brokeragePerBag}</div>
        </div>
      </div>
      <div style={{ 
        color: theme.textPrimary, 
        fontWeight: '600',
        padding: 'var(--space-2) var(--space-4)',
        background: theme.hoverBg,
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        fontSize: '0.875rem'
      }}>
        {user.city}
      </div>
      <div style={{ 
        fontWeight: '800', 
        color: 'var(--color-accent)', 
        fontSize: '1rem',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: `2px solid ${theme.border}`, 
              borderTop: '2px solid var(--color-secondary)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
          </div>
        ) : (
          formatCurrency(user.totalPayableBrokerage || brokerage)
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
        <button 
          onClick={onViewDetails} 
          className="modern-button modern-button-secondary"
          style={{ padding: 'var(--space-2)', minWidth: 'auto' }}
          title="View Details"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button 
          onClick={() => onDownloadBill(user.userId, 'html')} 
          className="modern-button modern-button-primary"
          style={{ padding: 'var(--space-2)', minWidth: 'auto' }}
          title="Download Bill with Custom Brokerage Option"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </button>
        <button 
          onClick={() => onDownloadBill(user.userId, 'excel')} 
          className="modern-button modern-button-accent"
          style={{ padding: 'var(--space-2)', minWidth: 'auto' }}
          title="Download Excel with Custom Brokerage Option"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BrokerageUsers;
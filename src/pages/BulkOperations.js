import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { brokerageAPI } from '../services/brokerageAPI';
import { userAPI, financialYearAPI } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import DocumentStatusDashboard from '../components/DocumentStatusDashboard';
import '../styles/modern-ui.css';

const BulkOperations = () => {
  const { theme } = useTheme();
  const { error, handleError, clearError } = useErrorHandler();
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('1');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [fyResponse, usersResponse] = await Promise.all([
        financialYearAPI.getAllFinancialYears(),
        userAPI.getUserSummary(0, 1000)
      ]);
      
      const years = fyResponse || [];
      setFinancialYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0].financialYearId?.toString() || '1');
      }
      
      const userData = usersResponse.content || [];
      setUsers(userData);
      
      // Extract unique cities
      const uniqueCities = [...new Set(userData.map(user => user.city))];
      setCities(uniqueCities);
      
      if (uniqueCities.length > 0) {
        setSelectedCity(uniqueCities[0]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.userId));
    }
  };

  const startBulkOperation = async (operation, target) => {
    try {
      setIsGenerating(true);
      setGenerationStatus('Starting bulk operation...');

      // Convert selectedYear to numeric ID
      const yearId = parseInt(selectedYear);

      let response;
      switch (operation) {
        case 'city-bills':
          response = await brokerageAPI.bulkBillsByCity(target, yearId);
          break;
        case 'user-bills':
          response = await brokerageAPI.bulkBillsByUsers(target, yearId);
          break;
        case 'city-excel':
          response = await brokerageAPI.bulkExcelByCity(target, yearId);
          break;
        case 'user-excel':
          response = await brokerageAPI.bulkExcelByUsers(target, yearId);
          break;
        default:
          throw new Error('Invalid operation');
      }

      if (response.status === 'success') {
        setGenerationStatus('Operation started successfully! Check document status for progress.');
        clearError(); // Clear any previous errors
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStatus('');
        }, 3000);
      }
    } catch (error) {
      setGenerationStatus('Failed to start operation. Please try again.');
      setIsGenerating(false);
      handleError(error);
    }
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
            }}>Bulk Operations</h1>
            <p style={{ 
              margin: 0, 
              color: theme.textSecondary, 
              fontSize: '0.95rem',
              fontWeight: '400',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>Generate documents in bulk for multiple users or cities efficiently</p>
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
              {financialYears.map(year => (
                <option key={year.financialYearId} value={year.financialYearId?.toString()} style={{ background: theme.cardBackground, color: theme.textPrimary }}>{year.financialYearName}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="modern-card animate-fade-in" style={{ 
            background: 'var(--color-error)', 
            color: 'white', 
            padding: 'var(--space-6)', 
            marginBottom: 'var(--space-8)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-4)',
            border: `1px solid ${theme.border}`
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div style={{ fontWeight: '600', fontSize: '1.125rem', flex: 1 }}>{error}</div>
            <button 
              onClick={clearError}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="modern-card animate-fade-in" style={{ 
            background: 'var(--color-secondary)', 
            color: 'white', 
            padding: 'var(--space-6)', 
            marginBottom: 'var(--space-8)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-4)',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid rgba(255,255,255,0.3)', 
              borderTop: '3px solid white', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{generationStatus}</div>
          </div>
        )}

        {/* Operations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }} className="animate-slide-in">
          {/* HTML Bills Section */}
          <div className="modern-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
            <div style={{ 
              background: 'var(--color-primary)', 
              color: 'white', 
              padding: 'var(--space-8)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-4)' 
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-xl)' 
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>HTML Bills</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Generate HTML brokerage bills</p>
              </div>
            </div>
            <div style={{ padding: 'var(--space-8)' }}>
              {/* City Bills */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: theme.hoverBg, borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ 
                  margin: '0 0 var(--space-4) 0', 
                  color: theme.textPrimary, 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)' 
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  By City
                </h3>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)} 
                  disabled={isGenerating} 
                  className="modern-select"
                  style={{ marginBottom: 'var(--space-4)', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                  {cities.map((city, index) => (
                    <option key={`city-bills-${index}`} value={city} style={{ background: theme.cardBackground, color: theme.textPrimary }}>{city}</option>
                  ))}
                </select>
                <button 
                  onClick={() => startBulkOperation('city-bills', selectedCity)} 
                  disabled={!selectedCity || isGenerating} 
                  className={`modern-button modern-button-primary ${(!selectedCity || isGenerating) ? 'opacity-50' : ''}`}
                  style={{ width: '100%', padding: 'var(--space-4) var(--space-6)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Generate City Bills
                </button>
              </div>
              
              {/* User Bills */}
              <div style={{ padding: 'var(--space-6)', background: theme.hoverBg, borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ 
                  margin: '0 0 var(--space-4) 0', 
                  color: theme.textPrimary, 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)' 
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  By Users
                </h3>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-2)', 
                    fontWeight: '600', 
                    color: theme.textPrimary, 
                    cursor: 'pointer', 
                    marginBottom: 'var(--space-4)' 
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.length === users.length && users.length > 0} 
                      onChange={handleSelectAll} 
                      style={{ 
                        transform: 'scale(1.2)',
                        accentColor: 'var(--color-secondary)'
                      }} 
                    />
                    Select All ({users.length} users)
                  </label>
                  <div style={{ 
                    maxHeight: '180px', 
                    overflowY: 'auto', 
                    border: `1px solid ${theme.border}`, 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--space-2)' 
                  }}>
                    {users.slice(0, 10).map(user => (
                      <label key={user.userId} className="modern-table-row" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-2)', 
                        cursor: 'pointer', 
                        margin: '0 -var(--space-2)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.userId)} 
                          onChange={() => handleUserSelect(user.userId)} 
                          style={{ accentColor: 'var(--color-secondary)' }}
                        />
                        <span style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>{user.firmName} - {user.city}</span>
                      </label>
                    ))}
                    {users.length > 10 && (
                      <div style={{ 
                        padding: 'var(--space-2)', 
                        color: theme.textMuted, 
                        fontStyle: 'italic', 
                        textAlign: 'center',
                        fontSize: '0.875rem'
                      }}>... and {users.length - 10} more users</div>
                    )}
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    color: theme.textPrimary, 
                    marginTop: 'var(--space-4)', 
                    textAlign: 'center',
                    padding: 'var(--space-3)',
                    background: theme.cardBackground,
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem'
                  }}>Selected: {selectedUsers.length} users</div>
                </div>
                <button 
                  onClick={() => startBulkOperation('user-bills', selectedUsers)} 
                  disabled={selectedUsers.length === 0 || isGenerating} 
                  className={`modern-button modern-button-primary ${(selectedUsers.length === 0 || isGenerating) ? 'opacity-50' : ''}`}
                  style={{ width: '100%', padding: 'var(--space-4) var(--space-6)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Generate User Bills
                </button>
              </div>
            </div>
          </div>

          {/* Excel Reports Section */}
          <div className="modern-card" style={{ background: theme.cardBackground, border: `1px solid ${theme.border}` }}>
            <div style={{ 
              background: 'var(--color-accent)', 
              color: 'white', 
              padding: 'var(--space-8)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-4)' 
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-xl)' 
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Excel Reports</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Generate Excel brokerage reports</p>
              </div>
            </div>
            <div style={{ padding: 'var(--space-8)' }}>
              {/* City Excel */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: theme.hoverBg, borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ 
                  margin: '0 0 var(--space-4) 0', 
                  color: theme.textPrimary, 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)' 
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  By City
                </h3>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)} 
                  disabled={isGenerating} 
                  className="modern-select"
                  style={{ marginBottom: 'var(--space-4)', background: theme.cardBackground, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                  {cities.map((city, index) => (
                    <option key={`city-excel-${index}`} value={city} style={{ background: theme.cardBackground, color: theme.textPrimary }}>{city}</option>
                  ))}
                </select>
                <button 
                  onClick={() => startBulkOperation('city-excel', selectedCity)} 
                  disabled={!selectedCity || isGenerating} 
                  className={`modern-button modern-button-accent ${(!selectedCity || isGenerating) ? 'opacity-50' : ''}`}
                  style={{ width: '100%', padding: 'var(--space-4) var(--space-6)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Generate City Excel
                </button>
              </div>
              
              {/* User Excel */}
              <div style={{ padding: 'var(--space-6)', background: theme.hoverBg, borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ 
                  margin: '0 0 var(--space-4) 0', 
                  color: theme.textPrimary, 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-3)' 
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  By Users
                </h3>
                <div style={{ 
                  fontWeight: '700', 
                  color: theme.textPrimary, 
                  marginBottom: 'var(--space-4)', 
                  textAlign: 'center', 
                  padding: 'var(--space-4)', 
                  background: theme.cardBackground, 
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem'
                }}>Selected: {selectedUsers.length} users</div>
                <button 
                  onClick={() => startBulkOperation('user-excel', selectedUsers)} 
                  disabled={selectedUsers.length === 0 || isGenerating} 
                  className={`modern-button modern-button-accent ${(selectedUsers.length === 0 || isGenerating) ? 'opacity-50' : ''}`}
                  style={{ width: '100%', padding: 'var(--space-4) var(--space-6)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Generate User Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <DocumentStatusDashboard />

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-4)', 
          marginTop: 'var(--space-8)'
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
            onClick={() => window.location.href = '/brokerage/users'} 
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
      </div>
    </div>
  );
};

export default BulkOperations;
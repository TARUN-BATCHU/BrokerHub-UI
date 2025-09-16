import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, financialYearAPI } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import BulkBillDownload from '../components/BulkBillDownload';
import '../styles/modern-ui.css';

const BulkOperations = () => {
  const { theme } = useTheme();
  const { error, handleError, clearError } = useErrorHandler();
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [fyResponse, usersResponse] = await Promise.all([
        financialYearAPI.getAllFinancialYears(),
        userAPI.getUserSummary(0, 1000)
      ]);
      
      const years = fyResponse || [];
      setFinancialYears(years);
      if (years.length > 0 && years[0].yearId) {
        setSelectedYear(years[0].yearId);
      }
      
      const userData = usersResponse.content || [];
      setUsers(userData);
      
      // Extract unique cities and add "All" option
      const uniqueCities = [...new Set(userData.map(user => user?.city).filter(Boolean))];
      const citiesWithAll = ['All', ...uniqueCities];
      setCities(citiesWithAll);
      
      if (citiesWithAll.length > 0) {
        setSelectedCity(citiesWithAll[0]);
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
    const cityUsers = getCityUsers();
    if (selectedUsers.length === cityUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(cityUsers.map(user => user.userId));
    }
  };

  const getCityUsers = () => {
    let filteredUsers = selectedCity === 'All' ? users : users.filter(user => user?.city === selectedCity);
    
    if (searchTerm.trim()) {
      filteredUsers = filteredUsers.filter(user => 
        user?.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.userId?.toString().includes(searchTerm)
      );
    }
    
    return filteredUsers;
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedUsers([]); // Clear selected users when city changes
    setSearchTerm(''); // Clear search when city changes
  };



  if (loading) return (
    <div style={{ background: theme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Modern Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '1rem', 
              borderRadius: '50%',
              backdropFilter: 'blur(10px)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="7" width="10" height="10" rx="1" ry="1"/>
              </svg>
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '3rem', 
              fontWeight: '800',
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Bulk Operations</h1>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '1.2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>Generate brokerage documents efficiently for multiple merchants</p>
          
          {/* Financial Year Selector */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '1rem',
            background: 'rgba(255,255,255,0.15)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select 
              value={selectedYear || ''} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              style={{ 
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {financialYears.map(year => (
                <option key={year.yearId} value={year.yearId} style={{ background: theme.name === 'dark' ? '#1a1a2e' : '#667eea', color: 'white' }}>{year.financialYearName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={{ 
            background: theme.name === 'dark' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(239, 68, 68, 0.9)', 
            color: 'white', 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            borderRadius: '20px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            backdropFilter: 'blur(10px)',
            border: theme.name === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '0.5rem', 
              borderRadius: '50%' 
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem', flex: 1 }}>{error}</div>
            <button 
              onClick={clearError}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                padding: '0.5rem', 
                borderRadius: '50%', 
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        )}



        {/* Main Content Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: '30px',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          marginBottom: '3rem'
        }}>
          {/* Step 1: City Selection */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>1</div>
              <h3 style={{ 
                margin: 0, 
                color: '#2d3748', 
                fontSize: '1.5rem', 
                fontWeight: '700'
              }}>Select City</h3>
            </div>
            <select 
              value={selectedCity} 
              onChange={(e) => handleCityChange(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1.1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '15px',
                background: 'white',
                color: '#2d3748',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              {cities.map((city, index) => (
                <option key={`city-${index}`} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Merchant Selection */}
          {selectedCity && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>2</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#2d3748', 
                    fontSize: '1.5rem', 
                    fontWeight: '700'
                  }}>Select Merchants {selectedCity === 'All' ? 'from All Cities' : `in ${selectedCity}`}</h3>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#718096', fontSize: '1rem' }}>{getCityUsers().length} merchants available</p>
                </div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}>
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.length === getCityUsers().length && getCityUsers().length > 0} 
                    onChange={handleSelectAll} 
                    style={{ 
                      transform: 'scale(1.2)',
                      accentColor: 'white'
                    }} 
                  />
                  Select All
                </label>
              </div>
              
              {/* Search Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={`Search merchants ${selectedCity === 'All' ? 'from all cities' : `in ${selectedCity}`}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '15px',
                    background: 'white',
                    color: '#2d3748',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                border: '2px solid #e2e8f0', 
                borderRadius: '20px', 
                padding: '1rem',
                background: '#f7fafc'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {getCityUsers().map(user => (
                    <label key={user.userId} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      cursor: 'pointer', 
                      padding: '1rem',
                      background: selectedUsers.includes(user.userId) ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.cardBackground,
                      color: selectedUsers.includes(user.userId) ? 'white' : theme.textPrimary,
                      borderRadius: '15px',
                      border: '2px solid',
                      borderColor: selectedUsers.includes(user.userId) ? 'transparent' : theme.border,
                      transition: 'all 0.3s ease',
                      boxShadow: selectedUsers.includes(user.userId) ? '0 4px 15px rgba(102, 126, 234, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.userId)} 
                        onChange={() => handleUserSelect(user.userId)} 
                        style={{ 
                          transform: 'scale(1.3)',
                          accentColor: selectedUsers.includes(user.userId) ? 'white' : '#667eea'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user.firmName}</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>ID: {user.userId} {selectedCity === 'All' ? `• ${user.city}` : ''}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                marginTop: '1.5rem',
                textAlign: 'center',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>Selected: {selectedUsers.length} merchants</div>
            </div>
          )}

          {/* Step 3: Download Bulk Bills */}
          {selectedUsers.length > 0 && (
            <BulkBillDownload 
              selectedUsers={users.filter(user => selectedUsers.includes(user.userId))}
              financialYearId={selectedYear}
            />
          )}
        </div>




      </div>
    </div>
  );
};

export default BulkOperations;
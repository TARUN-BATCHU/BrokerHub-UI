import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { brokerageAPI } from '../services/brokerageAPI';
import { userAPI, financialYearAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DocumentStatusDashboard from '../components/DocumentStatusDashboard';
import '../styles/animations.css';

const BulkOperations = () => {
  const { theme } = useTheme();
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
        setSelectedYear(years[0].financialYearId.toString());
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
      console.error('Failed to load data:', error);
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

      let response;
      switch (operation) {
        case 'city-bills':
          response = await brokerageAPI.bulkBillsByCity(target, selectedYear);
          break;
        case 'user-bills':
          response = await brokerageAPI.bulkBillsByUsers(target, selectedYear);
          break;
        case 'city-excel':
          response = await brokerageAPI.bulkExcelByCity(target, selectedYear);
          break;
        case 'user-excel':
          response = await brokerageAPI.bulkExcelByUsers(target, selectedYear);
          break;
        default:
          throw new Error('Invalid operation');
      }

      if (response.status === 'success') {
        setGenerationStatus('Operation started successfully! Check document status for progress.');
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationStatus('');
        }, 3000);
      }
    } catch (error) {
      setGenerationStatus('Failed to start operation. Please try again.');
      setIsGenerating(false);
      console.error('Bulk operation failed:', error);
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
        <div style={{ background: `linear-gradient(135deg, ${theme.buttonPrimary}, ${theme.buttonPrimaryHover})`, borderRadius: '20px', padding: '2rem', marginBottom: '2rem', color: 'white', boxShadow: theme.shadowModal }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>🚀 Bulk Operations</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>Generate documents in bulk for multiple users or cities</p>
            </div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '0.75rem 1rem', border: 'none', borderRadius: '12px', fontSize: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
              {financialYears.map(year => (
                <option key={year.financialYearId} value={year.financialYearId} style={{ color: theme.textPrimary, background: theme.cardBackground }}>{year.financialYearName}</option>
              ))}
            </select>
          </div>
        </div>

        {isGenerating && (
          <div style={{ background: `linear-gradient(135deg, #3498db, #5dade2)`, color: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)' }}>
            <img src={require('../utils/Animation - 1752033337485.gif')} alt="Loading..." style={{ width: '32px', height: '32px' }} />
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{generationStatus}</div>
          </div>
        )}

        {/* Operations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* HTML Bills Section */}
          <div style={{ background: theme.cardBackground, borderRadius: '20px', boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, #e67e22, #f39c12)`, color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>📄</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>HTML Bills</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Generate HTML brokerage bills</p>
              </div>
            </div>
            <div style={{ padding: '2rem' }}>
              {/* City Bills */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: theme.hoverBg, borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏙️ By City</h3>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={isGenerating} style={{ width: '100%', padding: '1rem', border: `2px solid ${theme.border}`, borderRadius: '12px', fontSize: '1rem', background: theme.cardBackground, color: theme.textPrimary, marginBottom: '1rem' }}>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <button onClick={() => startBulkOperation('city-bills', selectedCity)} disabled={!selectedCity || isGenerating} style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', background: isGenerating ? '#bdc3c7' : 'linear-gradient(135deg, #e67e22, #f39c12)', color: 'white', boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(230, 126, 34, 0.3)', transition: 'all 0.3s ease' }}>
                  🚀 Generate City Bills
                </button>
              </div>
              
              {/* User Bills */}
              <div style={{ padding: '1.5rem', background: theme.hoverBg, borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👥 By Users</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: theme.textPrimary, cursor: 'pointer', marginBottom: '1rem' }}>
                    <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} style={{ transform: 'scale(1.2)' }} />
                    Select All ({users.length} users)
                  </label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '0.5rem' }}>
                    {users.slice(0, 10).map(user => (
                      <label key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', transition: 'background-color 0.2s' }}>
                        <input type="checkbox" checked={selectedUsers.includes(user.userId)} onChange={() => handleUserSelect(user.userId)} />
                        <span style={{ color: theme.textPrimary }}>{user.firmName} - {user.city}</span>
                      </label>
                    ))}
                    {users.length > 10 && (
                      <div style={{ padding: '0.5rem', color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center' }}>... and {users.length - 10} more users</div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', color: theme.textPrimary, marginTop: '1rem', textAlign: 'center' }}>Selected: {selectedUsers.length} users</div>
                </div>
                <button onClick={() => startBulkOperation('user-bills', selectedUsers)} disabled={selectedUsers.length === 0 || isGenerating} style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: (selectedUsers.length === 0 || isGenerating) ? 'not-allowed' : 'pointer', background: (selectedUsers.length === 0 || isGenerating) ? '#bdc3c7' : 'linear-gradient(135deg, #e67e22, #f39c12)', color: 'white', boxShadow: (selectedUsers.length === 0 || isGenerating) ? 'none' : '0 4px 15px rgba(230, 126, 34, 0.3)', transition: 'all 0.3s ease' }}>
                  🚀 Generate User Bills
                </button>
              </div>
            </div>
          </div>

          {/* Excel Reports Section */}
          <div style={{ background: theme.cardBackground, borderRadius: '20px', boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, #27ae60, #2ecc71)`, color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Excel Reports</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Generate Excel brokerage reports</p>
              </div>
            </div>
            <div style={{ padding: '2rem' }}>
              {/* City Excel */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: theme.hoverBg, borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏙️ By City</h3>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={isGenerating} style={{ width: '100%', padding: '1rem', border: `2px solid ${theme.border}`, borderRadius: '12px', fontSize: '1rem', background: theme.cardBackground, color: theme.textPrimary, marginBottom: '1rem' }}>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <button onClick={() => startBulkOperation('city-excel', selectedCity)} disabled={!selectedCity || isGenerating} style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', background: isGenerating ? '#bdc3c7' : 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(39, 174, 96, 0.3)', transition: 'all 0.3s ease' }}>
                  🚀 Generate City Excel
                </button>
              </div>
              
              {/* User Excel */}
              <div style={{ padding: '1.5rem', background: theme.hoverBg, borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👥 By Users</h3>
                <div style={{ fontWeight: '700', color: theme.textPrimary, marginBottom: '1rem', textAlign: 'center', padding: '1rem', background: theme.cardBackground, borderRadius: '8px' }}>Selected: {selectedUsers.length} users</div>
                <button onClick={() => startBulkOperation('user-excel', selectedUsers)} disabled={selectedUsers.length === 0 || isGenerating} style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: (selectedUsers.length === 0 || isGenerating) ? 'not-allowed' : 'pointer', background: (selectedUsers.length === 0 || isGenerating) ? '#bdc3c7' : 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', boxShadow: (selectedUsers.length === 0 || isGenerating) ? 'none' : '0 4px 15px rgba(39, 174, 96, 0.3)', transition: 'all 0.3s ease' }}>
                  🚀 Generate User Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <DocumentStatusDashboard />

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginTop: '2rem'
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
            onClick={() => window.location.href = '/brokerage/users'} 
            style={{ 
              padding: '1rem 1.5rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600',
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #3498db, #5dade2)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            👥 User Management
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
    </div>
  );
};

export default BulkOperations;
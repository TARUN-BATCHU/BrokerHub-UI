import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { financialYearAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';
import { useTheme } from '../contexts/ThemeContext';


const FinancialYears = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    start: '',
    end: '',
    financialYearName: '',
    forBills: false
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    loadFinancialYears();
  }, [navigate]);

  const loadFinancialYears = async () => {
    setLoading(true);
    try {
      const data = await financialYearAPI.getAllFinancialYears();
      setFinancialYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading financial years:', error);
      setFinancialYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFinancialYear = async () => {
    if (!formData.start || !formData.end || !formData.financialYearName) {
      setMessage('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      await financialYearAPI.createFinancialYear(formData);
      setMessage('Financial year created successfully!');
      setFormData({
        start: '',
        end: '',
        financialYearName: '',
        forBills: false
      });
      setShowCreateModal(false);
      loadFinancialYears();
    } catch (error) {
      console.error('Error creating financial year:', error);
      setMessage('Failed to create financial year. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      backgroundColor: theme.background,
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: isMobile ? '16px' : '20px',
        backgroundColor: theme.headerBackground,
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            color: theme.textPrimary,
            fontSize: '28px',
            fontWeight: '700'
          }}>
            📊 Financial Year Management
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: theme.textSecondary,
            fontSize: isMobile ? '14px' : '16px'
          }}>
            Manage financial years for transaction ledger auditing
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              padding: '8px 16px',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.hoverBg;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.cardBackground;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Success/Error Message */}
      {message && (
        <div style={{
          backgroundColor: message.includes('successfully') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${message.includes('successfully') ? '#bbf7d0' : '#fecaca'}`,
          color: message.includes('successfully') ? '#166534' : '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: '20px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>
            Financial Years ({financialYears.length})
          </h3>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <button
              onClick={loadFinancialYears}
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + Create Financial Year
            </button>
          </div>
        </div>

        {/* Financial Years Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {financialYears.map((fy, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  margin: 0,
                  color: '#1e293b',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {fy.financialYearName}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: fy.forBills ? '#dcfce7' : '#dbeafe',
                  color: fy.forBills ? '#22c55e' : '#3b82f6'
                }}>
                  {fy.forBills ? 'For Bills' : 'Regular'}
                </span>
              </div>

              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Start Date:</strong> {formatDate(fy.start)}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>End Date:</strong> {formatDate(fy.end)}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Duration:</strong> {Math.ceil((new Date(fy.end) - new Date(fy.start)) / (1000 * 60 * 60 * 24 * 30))} months
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => navigate('/calendar-view', { state: { financialYear: fy } })}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  View Transactions
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && financialYears.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Financial Years Found</h4>
            <p style={{ margin: 0 }}>
              Create your first financial year to start managing transaction ledgers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{
                marginTop: '16px'
              }}
            >
              + Create First Financial Year
            </button>
          </div>
        )}
      </div>

      {/* Create Financial Year Modal */}
      {showCreateModal && (
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Create Financial Year</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                  Financial Year Name *
                </label>
                <input
                  type="text"
                  value={formData.financialYearName}
                  onChange={(e) => setFormData({ ...formData, financialYearName: e.target.value })}
                  placeholder="e.g., FY 2024-25"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.forBills}
                    onChange={(e) => setFormData({ ...formData, forBills: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: '#374151', fontSize: '14px' }}>
                    For Bills (Special transaction entry)
                  </span>
                </label>
                <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#64748b' }}>
                  Enable this for specific transaction types that require bill management
                </p>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#475569'
              }}>
                <strong>Note:</strong> Financial years typically run from April to March (12 months).
                Make sure the dates don't overlap with existing financial years.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFinancialYear}
                disabled={creating || !formData.start || !formData.end || !formData.financialYearName}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: (creating || !formData.start || !formData.end || !formData.financialYearName) ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  cursor: (creating || !formData.start || !formData.end || !formData.financialYearName) ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? '⏳ Creating...' : '✅ Create Financial Year'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialYears;
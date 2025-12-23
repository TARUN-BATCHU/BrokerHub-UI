import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { subscriptionAPI } from '../services/subscriptionAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminSubscriptions = () => {
  const { theme } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [chargeBreakup, setChargeBreakup] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const data = await subscriptionAPI.searchUserSubscription(searchEmail);
      setSubscriptions(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'User not found' });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (subscriptionId) => {
    if (!chargeBreakup.trim()) {
      setMessage({ type: 'error', text: 'Please enter charge breakup' });
      return;
    }

    try {
      setLoading(true);
      await subscriptionAPI.activateSubscription(subscriptionId, chargeBreakup);
      setMessage({ type: 'success', text: 'Subscription activated successfully' });
      setChargeBreakup('');
      setSelectedSub(null);
      handleSearch();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to activate' });
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to expire this subscription?')) return;

    try {
      setLoading(true);
      await subscriptionAPI.expireSubscription(subscriptionId);
      setMessage({ type: 'success', text: 'Subscription expired successfully' });
      handleSearch();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to expire' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background, 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: theme.textPrimary, 
          marginBottom: '32px',
          fontSize: '32px'
        }}>
          Admin - Subscription Management
        </h1>

        {/* Search Section */}
        <div style={{
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: theme.shadow
        }}>
          <h3 style={{ 
            color: theme.textPrimary, 
            marginBottom: '16px',
            fontSize: '18px'
          }}>
            Search User
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="email"
              placeholder="Enter user email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.textPrimary,
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.buttonPrimary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div style={{
            backgroundColor: message.type === 'error' ? theme.errorBg : theme.successBg,
            color: message.type === 'error' ? theme.error : theme.success,
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${message.type === 'error' ? theme.errorBorder : theme.successBorder}`
          }}>
            {message.text}
          </div>
        )}

        {/* Subscriptions List */}
        {subscriptions.length > 0 && (
          <div style={{
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: theme.shadow
          }}>
            <h3 style={{ 
              color: theme.textPrimary, 
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              Subscription Details
            </h3>

            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  backgroundColor: theme.background,
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: '12px' }}>User Email</div>
                    <div style={{ color: theme.textPrimary, fontWeight: '600' }}>{sub.userEmail}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: '12px' }}>Plan</div>
                    <div style={{ color: theme.textPrimary, fontWeight: '600' }}>{sub.planName}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: '12px' }}>Status</div>
                    <div style={{ 
                      color: sub.status === 'ACTIVE' ? theme.success : 
                             sub.status === 'PENDING' ? theme.warning : theme.error,
                      fontWeight: '600'
                    }}>
                      {sub.status}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: theme.textSecondary, fontSize: '12px' }}>End Date</div>
                    <div style={{ color: theme.textPrimary, fontWeight: '600' }}>
                      {new Date(sub.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {sub.status === 'PENDING' && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
                    <input
                      type="text"
                      placeholder="Enter charge breakup (e.g., Base: 500, Tax: 90)"
                      value={selectedSub === sub.id ? chargeBreakup : ''}
                      onChange={(e) => {
                        setSelectedSub(sub.id);
                        setChargeBreakup(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: theme.cardBackground,
                        color: theme.textPrimary,
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleActivate(sub.id)}
                        disabled={loading}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: theme.success,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                )}

                {sub.status === 'ACTIVE' && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
                    <button
                      onClick={() => handleExpire(sub.id)}
                      disabled={loading}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: theme.error,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Expire Subscription
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;

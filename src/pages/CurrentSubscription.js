import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { subscriptionAPI } from '../services/subscriptionAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const CurrentSubscription = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionAPI.getCurrentSubscription();
      setSubscription(data);
      setError('');
    } catch (err) {
      if (err.errorCode === 'NO_SUBSCRIPTION') {
        navigate('/subscriptions/plans');
      } else {
        setError('Unable to load subscription details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return theme.success;
      case 'PENDING':
        return theme.warning;
      case 'EXPIRED':
      case 'SUSPENDED':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return theme.successBg;
      case 'PENDING':
        return theme.warningBg;
      case 'EXPIRED':
      case 'SUSPENDED':
        return theme.errorBg;
      default:
        return theme.background;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background, 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          color: theme.textPrimary, 
          marginBottom: '32px',
          fontSize: '32px'
        }}>
          Current Subscription
        </h1>

        {error && (
          <div style={{
            backgroundColor: theme.errorBg,
            color: theme.error,
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${theme.errorBorder}`
          }}>
            {error}
          </div>
        )}

        {subscription && (
          <div style={{
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: theme.shadow
          }}>
            {/* Plan Name & Status */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <div>
                <h2 style={{ 
                  color: theme.textPrimary, 
                  fontSize: '28px',
                  marginBottom: '8px'
                }}>
                  {subscription.planName}
                </h2>
                <p style={{ color: theme.textSecondary, margin: 0 }}>
                  Subscription ID: {subscription.id}
                </p>
              </div>
              <div style={{
                backgroundColor: getStatusBg(subscription.status),
                color: getStatusColor(subscription.status),
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {subscription.status}
              </div>
            </div>

            {/* Subscription Details */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px'
              }}>
                <div>
                  <div style={{ 
                    color: theme.textSecondary, 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Start Date
                  </div>
                  <div style={{ 
                    color: theme.textPrimary, 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    color: theme.textSecondary, 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    End Date
                  </div>
                  <div style={{ 
                    color: theme.textPrimary, 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Limits */}
            {subscription.featureLimits && (
              <div style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  color: theme.textPrimary, 
                  fontSize: '18px',
                  marginBottom: '16px'
                }}>
                  Feature Limits
                </h3>
                <div style={{ 
                  display: 'grid',
                  gap: '12px'
                }}>
                  {Object.entries(subscription.featureLimits).map(([key, value]) => (
                    <div 
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: `1px solid ${theme.borderLight}`
                      }}
                    >
                      <span style={{ color: theme.textSecondary }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{ 
                        color: theme.textPrimary,
                        fontWeight: '600'
                      }}>
                        {value === -1 ? 'Unlimited' : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: theme.buttonPrimary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.buttonPrimary;
                }}
              >
                Back to Dashboard
              </button>
              
              {subscription.status === 'EXPIRED' && (
                <button
                  onClick={() => navigate('/subscriptions/plans')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: theme.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Renew Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentSubscription;

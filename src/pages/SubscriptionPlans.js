import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { subscriptionAPI } from '../services/subscriptionAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionAPI.getPlans();
      setPlans(data);
      setError('');
    } catch (err) {
      setError('Unable to load plans. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId) => {
    navigate(`/subscriptions/subscribe/${planId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background, 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: theme.textPrimary, 
          textAlign: 'center', 
          marginBottom: '40px',
          fontSize: '32px'
        }}>
          Choose Your Plan
        </h1>

        {error && (
          <div style={{
            backgroundColor: theme.errorBg,
            color: theme.error,
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            border: `1px solid ${theme.errorBorder}`
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: theme.cardBackground,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '32px 24px',
                boxShadow: theme.shadow,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadowHover;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h2 style={{ 
                color: theme.textPrimary, 
                fontSize: '24px', 
                marginBottom: '8px' 
              }}>
                {plan.name}
              </h2>
              
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: theme.buttonPrimary,
                marginBottom: '24px'
              }}>
                {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                {plan.price > 0 && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    fontWeight: 'normal'
                  }}>
                    /{plan.duration}
                  </span>
                )}
              </div>

              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                marginBottom: '24px' 
              }}>
                {plan.features?.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: theme.textSecondary,
                      padding: '8px 0',
                      borderBottom: `1px solid ${theme.borderLight}`,
                      fontSize: '14px'
                    }}
                  >
                    ✓ {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: theme.buttonPrimary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.buttonPrimary;
                }}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

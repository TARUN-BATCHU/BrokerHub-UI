import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { subscriptionAPI } from '../services/subscriptionAPI';
import LoadingSpinner from '../components/LoadingSpinner';

const Subscribe = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const plans = await subscriptionAPI.getPlans();
      const selectedPlan = plans.find(p => p.id === parseInt(planId));
      if (!selectedPlan) {
        setError('Plan not found');
        return;
      }
      setPlan(selectedPlan);
    } catch (err) {
      setError('Unable to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      setSubmitting(true);
      setError('');
      await subscriptionAPI.requestSubscription(planId);
      setSuccess('Payment received. Subscription will be activated after verification.');
      setTimeout(() => navigate('/subscriptions/current'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit payment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!plan) return <div style={{ color: theme.error, textAlign: 'center', padding: '40px' }}>{error}</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.background, 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '32px',
          boxShadow: theme.shadow
        }}>
          <h1 style={{ 
            color: theme.textPrimary, 
            marginBottom: '24px',
            fontSize: '28px'
          }}>
            Subscribe to {plan.name}
          </h1>

          {/* Plan Summary */}
          <div style={{
            backgroundColor: theme.background,
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ color: theme.textSecondary }}>Plan:</span>
              <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{plan.name}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ color: theme.textSecondary }}>Duration:</span>
              <span style={{ color: theme.textPrimary }}>{plan.duration}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <span style={{ color: theme.textSecondary, fontSize: '18px' }}>Total:</span>
              <span style={{ 
                color: theme.buttonPrimary, 
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                ₹{plan.price}
              </span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div style={{
            backgroundColor: theme.infoBg,
            border: `1px solid ${theme.infoBorder}`,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              color: theme.textPrimary, 
              marginBottom: '16px',
              fontSize: '18px'
            }}>
              Payment Instructions
            </h3>
            
            {/* Static UPI QR Code Placeholder */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#666', fontSize: '14px' }}>UPI QR Code</span>
              </div>
            </div>

            <ol style={{ 
              color: theme.textSecondary, 
              paddingLeft: '20px',
              margin: 0
            }}>
              <li style={{ marginBottom: '8px' }}>Scan the QR code with any UPI app</li>
              <li style={{ marginBottom: '8px' }}>Pay to UPI ID: <strong>brokerhub@upi</strong></li>
              <li style={{ marginBottom: '8px' }}>Mention your registered email in payment note</li>
              <li>Click "I have paid" button below after payment</li>
            </ol>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              backgroundColor: theme.errorBg,
              color: theme.error,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: `1px solid ${theme.errorBorder}`
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: theme.successBg,
              color: theme.success,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: `1px solid ${theme.successBorder}`
            }}>
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/subscriptions/plans')}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentConfirm}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: submitting ? theme.buttonSecondary : theme.success,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Processing...' : 'I have paid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;

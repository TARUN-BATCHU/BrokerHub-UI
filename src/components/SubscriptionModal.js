import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SubscriptionModal = ({ isOpen, onClose, errorCode }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getMessage = () => {
    switch (errorCode) {
      case 'SUBSCRIPTION_INACTIVE':
        return 'Your subscription is inactive. Please subscribe to continue.';
      case 'SUBSCRIPTION_EXPIRED':
        return 'Your subscription has expired. Please renew to continue.';
      case 'SUBSCRIPTION_SUSPENDED':
        return 'Your subscription is suspended. Please contact support.';
      default:
        return 'Subscription issue detected. Please check your subscription status.';
    }
  };

  const handleSubscribe = () => {
    navigate('/subscriptions/plans');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: theme.modalBackground,
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: theme.errorBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: `2px solid ${theme.error}`
          }}>
            <span style={{ fontSize: '32px', color: theme.error }}>⚠</span>
          </div>
          <h2 style={{ 
            color: theme.textPrimary, 
            fontSize: '24px',
            marginBottom: '12px'
          }}>
            Subscription Required
          </h2>
          <p style={{ 
            color: theme.textSecondary,
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {getMessage()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubscribe}
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
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

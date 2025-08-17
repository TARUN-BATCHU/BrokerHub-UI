import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  loading = false
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          confirmBg: theme.error,
          confirmHover: '#dc2626',
          icon: '⚠️'
        };
      case 'warning':
        return {
          confirmBg: theme.warning,
          confirmHover: '#d97706',
          icon: '⚠️'
        };
      case 'info':
        return {
          confirmBg: theme.info,
          confirmHover: '#2563eb',
          icon: 'ℹ️'
        };
      default:
        return {
          confirmBg: theme.error,
          confirmHover: '#dc2626',
          icon: '⚠️'
        };
    }
  };

  const typeColors = getTypeColors();

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: theme.modalBackground,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`,
        animation: 'modalSlideIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '24px' }}>{typeColors.icon}</span>
          <h3 style={{
            margin: 0,
            color: theme.textPrimary,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {title}
          </h3>
        </div>

        {/* Message */}
        <p style={{
          margin: '0 0 24px 0',
          color: theme.textSecondary,
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              backgroundColor: theme.cardBackground,
              color: theme.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.cardBackground;
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: typeColors.confirmBg,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = typeColors.confirmHover;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = typeColors.confirmBg;
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;

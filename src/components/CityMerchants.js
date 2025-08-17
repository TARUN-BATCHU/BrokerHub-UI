import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CityMerchants = ({
  city,
  merchants,
  onClose
}) => {
  const { theme } = useTheme();

  if (!city || !merchants) return null;

  return (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: theme.shadowCard,
      marginTop: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: 0,
          color: theme.textPrimary,
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Merchants in {city}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '8px 16px',
            color: theme.textSecondary,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.errorBg;
            e.currentTarget.style.color = theme.error;
            e.currentTarget.style.borderColor = theme.error;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.textSecondary;
            e.currentTarget.style.borderColor = theme.border;
          }}
        >
          Close
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {merchants.merchants.map(merchant => (
          <div
            key={merchant.id}
            style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${theme.border}`
            }}
          >
            <h4 style={{
              margin: '0 0 8px 0',
              color: theme.textPrimary,
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {merchant.name}
            </h4>
            <div style={{
              color: theme.textSecondary,
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              {merchant.streetAddress}
            </div>
            <div style={{
              color: theme.textSecondary,
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              {merchant.landmark}
            </div>
            <div style={{
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              PIN: {merchant.pincode}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityMerchants;
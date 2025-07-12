import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MobileMerchantList = ({ merchants, onView, onEdit }) => {
  const [expandedMerchant, setExpandedMerchant] = useState(null);
  const { theme } = useTheme();

  const toggleMerchant = (merchantId) => {
    setExpandedMerchant(expandedMerchant === merchantId ? null : merchantId);
  };

  return (
    <div className="merchant-list" style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {merchants.map((merchant) => (
        <div
          key={merchant.id}
          className={`merchant-item ${expandedMerchant === merchant.id ? 'expanded' : ''}`}
          style={{
            borderBottom: `1px solid ${theme.border}`,
            padding: '12px 16px',
            backgroundColor: theme.cardBackground
          }}
        >
          <div className="merchant-item-header" onClick={() => toggleMerchant(merchant.id)}>
            <div className="merchant-name" style={{ color: theme.textPrimary }}>
              {merchant.firmName}
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                padding: '4px',
                cursor: 'pointer'
              }}
            >
              {expandedMerchant === merchant.id ? '▼' : '▶'}
            </button>
          </div>

          {expandedMerchant === merchant.id && (
            <div className="merchant-details" style={{
              marginTop: '12px',
              fontSize: '14px',
              color: theme.textSecondary
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Contact:</strong> {merchant.contactPerson}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Phone:</strong> {merchant.phoneNumber}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>City:</strong> {merchant.city}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Type:</strong> {merchant.merchantType}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => onView(merchant)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.buttonSecondary,
                    color: theme.textPrimary,
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                <button
                  onClick={() => onEdit(merchant)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.buttonPrimary,
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileMerchantList;
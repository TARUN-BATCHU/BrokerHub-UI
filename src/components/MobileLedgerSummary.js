import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MobileLedgerSummary = ({ data }) => {
  const { theme } = useTheme();

  const summaryItems = [
    { label: 'Transactions', value: data.transactions || 0, icon: '📝' },
    { label: 'Total Bags', value: data.totalBags || 0, icon: '🛍️' },
    { label: 'Total Tons', value: data.totalTons || 0, icon: '⚖️' },
    { label: 'Total Amount', value: `₹${data.totalAmount || 0}`, icon: '💰' }
  ];

  return (
    <div className="ledger-summary-card" style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        color: theme.textPrimary,
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: 600
      }}>
        Ledger Summary
      </h3>

      <div className="summary-grid">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className="summary-item"
            style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
              {item.icon}
            </div>
            <div style={{
              color: theme.textSecondary,
              fontSize: '12px',
              marginBottom: '4px'
            }}>
              {item.label}
            </div>
            <div style={{
              color: theme.textPrimary,
              fontSize: '16px',
              fontWeight: 600
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: theme.buttonSecondary,
          color: theme.textPrimary,
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default MobileLedgerSummary;
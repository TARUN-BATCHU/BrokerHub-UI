import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CustomBrokerageModal = ({ isOpen, onClose, onConfirm, title = "Custom Brokerage" }) => {
  const { theme } = useTheme();
  const [customBrokerage, setCustomBrokerage] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleConfirm = () => {
    const brokerageValue = useCustom && customBrokerage ? parseFloat(customBrokerage) : null;
    onConfirm(brokerageValue);
    handleClose();
  };

  const handleClose = () => {
    setCustomBrokerage('');
    setUseCustom(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: theme.cardBackground,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        width: '90%',
        maxWidth: '480px',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: theme.textPrimary
          }}>{title}</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p style={{
            color: theme.textSecondary,
            fontSize: '0.95rem',
            lineHeight: '1.5',
            margin: '0 0 var(--space-4) 0'
          }}>
            Choose whether to use the original brokerage rates or specify a custom rate per bag.
          </p>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              cursor: 'pointer',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${!useCustom ? 'var(--color-primary)' : theme.border}`,
              background: !useCustom ? 'rgba(var(--color-primary-rgb), 0.1)' : theme.hoverBg,
              marginBottom: 'var(--space-3)'
            }}>
              <input
                type="radio"
                checked={!useCustom}
                onChange={() => setUseCustom(false)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <div style={{ fontWeight: '600', color: theme.textPrimary }}>
                  Use Original Brokerage
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                  Use the existing brokerage rates from the database
                </div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              cursor: 'pointer',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${useCustom ? 'var(--color-accent)' : theme.border}`,
              background: useCustom ? 'rgba(var(--color-accent-rgb), 0.1)' : theme.hoverBg
            }}>
              <input
                type="radio"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: theme.textPrimary }}>
                  Use Custom Brokerage
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                  Specify a custom rate per bag
                </div>
              </div>
            </label>
          </div>

          {useCustom && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: theme.textPrimary,
                marginBottom: 'var(--space-2)'
              }}>
                Custom Brokerage Rate (₹ per bag)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter rate per bag (e.g., 2.50)"
                value={customBrokerage}
                onChange={(e) => setCustomBrokerage(e.target.value)}
                className="modern-input"
                style={{
                  width: '100%',
                  background: theme.cardBackground,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`
                }}
                autoFocus
              />
              <div style={{
                fontSize: '0.75rem',
                color: theme.textSecondary,
                marginTop: 'var(--space-2)'
              }}>
                This rate will be applied to all transactions in the bill
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            className="modern-button modern-button-outline"
            style={{ padding: 'var(--space-3) var(--space-6)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={useCustom && (!customBrokerage || parseFloat(customBrokerage) < 0)}
            className={`modern-button modern-button-primary ${
              useCustom && (!customBrokerage || parseFloat(customBrokerage) < 0) ? 'opacity-50' : ''
            }`}
            style={{ padding: 'var(--space-3) var(--space-6)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomBrokerageModal;
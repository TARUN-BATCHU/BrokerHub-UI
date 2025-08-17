import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

const MerchantDetailModal = ({ isOpen, onClose, merchantId }) => {
  const { theme } = useTheme();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && merchantId) {
      loadMerchantDetails();
    }
  }, [isOpen, merchantId]);

  const loadMerchantDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8080/BrokerHub/user/${merchantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch merchant details');
      
      const data = await response.json();
      setMerchant(data);
    } catch (error) {
      setError(error.message || 'Failed to load merchant details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${theme.border}`
        }}>
          <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
            Merchant Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              color: theme.textSecondary
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: theme.errorBg,
            color: theme.error,
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : merchant ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic Info */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Basic Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Firm Name</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.firmName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Owner Name</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.ownerName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>User Type</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.userType}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>GST Number</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.gstNumber}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Contact Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Email</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.email}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Phone</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>
                    {merchant.phoneNumbers?.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            {merchant.address && (
              <div style={{
                backgroundColor: theme.backgroundSecondary,
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Address</h4>
                <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>
                  {merchant.address.area}, {merchant.address.city} - {merchant.address.pincode}
                </p>
              </div>
            )}

            {/* Trading Summary */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Trading Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Bags Sold</p>
                  <p style={{ margin: 0, color: theme.success, fontSize: '18px', fontWeight: '600' }}>
                    {merchant.totalBagsSold}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Bags Bought</p>
                  <p style={{ margin: 0, color: theme.buttonPrimary, fontSize: '18px', fontWeight: '600' }}>
                    {merchant.totalBagsBought}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Brokerage Rate</p>
                  <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>{merchant.brokerageRate}%</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Total Brokerage</p>
                  <p style={{ margin: 0, color: theme.warning, fontSize: '18px', fontWeight: '600' }}>
                    ₹{merchant.totalPayableBrokerage?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Financial Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Payable Amount</p>
                  <p style={{ margin: 0, color: theme.error, fontSize: '18px', fontWeight: '600' }}>
                    ₹{merchant.payableAmount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>Receivable Amount</p>
                  <p style={{ margin: 0, color: theme.success, fontSize: '18px', fontWeight: '600' }}>
                    ₹{merchant.receivableAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Broker Info */}
            {merchant.broker && (
              <div style={{
                backgroundColor: theme.backgroundSecondary,
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: theme.textPrimary }}>Broker Information</h4>
                <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '500' }}>
                  {merchant.broker.brokerName} (ID: {merchant.broker.brokerId})
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MerchantDetailModal;
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MobileCreateTransaction = ({ onSubmit, merchants, products }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    buyerFirm: '',
    sellerFirm: '',
    product: '',
    quantity: '',
    rate: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      padding: '16px'
    }}>
      <form onSubmit={handleSubmit} className="create-transaction-form">
        {/* Date Selection */}
        <div className="form-group">
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Transaction Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary
            }}
          />
        </div>

        {/* Buyer Selection */}
        <div className="form-group">
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Buyer Firm
          </label>
          <select
            value={formData.buyerFirm}
            onChange={(e) => handleChange('buyerFirm', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary
            }}
          >
            <option value="">Select Buyer</option>
            {merchants.map(m => (
              <option key={m.id} value={m.firmName}>
                {m.firmName}
              </option>
            ))}
          </select>
        </div>

        {/* Seller Selection */}
        <div className="form-group">
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Seller Firm
          </label>
          <select
            value={formData.sellerFirm}
            onChange={(e) => handleChange('sellerFirm', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary
            }}
          >
            <option value="">Select Seller</option>
            {merchants.map(m => (
              <option key={m.id} value={m.firmName}>
                {m.firmName}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div className="form-group">
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Product
          </label>
          <select
            value={formData.product}
            onChange={(e) => handleChange('product', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary
            }}
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.productName}>
                {p.productName}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity and Rate */}
        <div className="form-row">
          <div className="form-group">
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              Quantity (Bags)
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.inputBackground,
                color: theme.textPrimary
              }}
            />
          </div>

          <div className="form-group">
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              Rate per Bag
            </label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => handleChange('rate', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.inputBackground,
                color: theme.textPrimary
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: theme.buttonPrimary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Create Transaction
        </button>
      </form>
    </div>
  );
};

export default MobileCreateTransaction;
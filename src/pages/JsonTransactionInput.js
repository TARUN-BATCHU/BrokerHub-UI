import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ledgerDetailsAPI } from '../services/api';
import '../styles/ledger.css';

const JsonTransactionInput = () => {
  const { theme } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Parse JSON to validate
      const parsedData = JSON.parse(jsonInput);
      
      // Call the API
      const response = await ledgerDetailsAPI.createLedgerDetailsWithExcelJson(parsedData);
      
      setSuccess('Transaction created successfully!');
      setJsonInput(''); // Clear the input after successful submission
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError(err.message || 'Failed to create transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setError('');
    setSuccess('');
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: theme.background,
    color: theme.textPrimary,
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const cardStyle = {
    backgroundColor: theme.cardBackground,
    borderRadius: '12px',
    padding: '30px',
    boxShadow: theme.shadow,
    maxWidth: '1000px',
    margin: '0 auto',
    border: `1px solid ${theme.border}`
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '400px',
    padding: '16px',
    border: `2px solid ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.cardBackground,
    color: theme.textPrimary,
    fontSize: '14px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    lineHeight: '1.5'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '12px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.buttonPrimary,
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.buttonSecondary,
    color: 'white'
  };

  const alertStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const successAlertStyle = {
    ...alertStyle,
    backgroundColor: theme.successBg,
    color: theme.success,
    border: `1px solid ${theme.successBorder}`
  };

  const errorAlertStyle = {
    ...alertStyle,
    backgroundColor: theme.errorBg,
    color: theme.error,
    border: `1px solid ${theme.errorBorder}`
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          marginBottom: '8px',
          color: theme.textPrimary 
        }}>
          JSON Transaction Input
        </h1>
        
        <p style={{ 
          color: theme.textSecondary, 
          marginBottom: '30px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          Paste your transaction JSON data below and click save to create the transaction.
        </p>

        {success && (
          <div style={successAlertStyle}>
            {success}
          </div>
        )}

        {error && (
          <div style={errorAlertStyle}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: theme.textPrimary 
          }}>
            Transaction JSON Data
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{
  "brokerId": 1,
  "financialYearId": 2024,
  "sellerBrokerage": 50,
  "seller_name": "ABC Traders",
  "order_date": "2024-01-15",
  "product_list": [
    {
      "product_name": "Rice",
      "total_quantity": 100,
      "price": 2500
    }
  ],
  "buyers": [
    {
      "buyer_name": "XYZ Stores",
      "buyerBrokerage": 30,
      "products": [
        {
          "product_name": "Rice",
          "quantity": 60,
          "price": 2500
        }
      ]
    }
  ]
}`}
            style={{
              ...textareaStyle,
              borderColor: error ? theme.error : theme.border
            }}
            onFocus={(e) => e.target.style.borderColor = theme.buttonPrimary}
            onBlur={(e) => e.target.style.borderColor = error ? theme.error : theme.border}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.buttonPrimaryHover;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = theme.shadowHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.buttonPrimary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            style={{
              ...secondaryButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.buttonSecondaryHover;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = theme.shadowHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.buttonSecondary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px',
          backgroundColor: theme.infoBg,
          border: `1px solid ${theme.infoBorder}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            color: theme.info, 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            JSON Format Example:
          </h3>
          <pre style={{ 
            color: theme.textSecondary,
            fontSize: '12px',
            lineHeight: '1.4',
            margin: 0,
            overflow: 'auto'
          }}>
{`{
  "brokerId": 1,
  "financialYearId": 2024,
  "sellerBrokerage": 50,
  "seller_name": "ABC Traders",
  "order_date": "2024-01-15",
  "product_list": [
    {
      "product_name": "Rice",
      "total_quantity": 100,
      "price": 2500
    }
  ],
  "buyers": [
    {
      "buyer_name": "XYZ Stores",
      "buyerBrokerage": 30,
      "products": [
        {
          "product_name": "Rice",
          "quantity": 60,
          "price": 2500
        }
      ]
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonTransactionInput;
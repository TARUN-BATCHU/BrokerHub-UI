import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ledgerDetailsAPI } from '../services/api';
import '../styles/ledger.css';

const JsonTransactionInput = () => {
  const { theme } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleJsonChange = (value) => {
    setJsonInput(value);
    setError('');
    
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        setParsedData(parsed);
      } catch (err) {
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  };

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
      const parsedJson = JSON.parse(jsonInput);
      
      // Call the API
      const response = await ledgerDetailsAPI.createLedgerDetailsWithExcelJson(parsedJson);
      
      setSuccess('Transaction created successfully!');
      setJsonInput('');
      setParsedData(null);
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
    setParsedData(null);
    setError('');
    setSuccess('');
  };

  const renderTransactionTable = () => {
    if (!parsedData) return null;

    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      backgroundColor: theme.cardBackground,
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      overflow: 'hidden'
    };

    const thStyle = {
      backgroundColor: theme.buttonPrimary,
      color: 'white',
      padding: '12px',
      textAlign: 'left',
      fontWeight: '600',
      borderBottom: `1px solid ${theme.border}`
    };

    const tdStyle = {
      padding: '12px',
      borderBottom: `1px solid ${theme.border}`,
      color: theme.textPrimary
    };

    const summaryLabelStyle = {
      ...tdStyle,
      fontWeight: '600',
      backgroundColor: theme.infoBg,
      color: theme.info,
      width: '200px'
    };

    const summaryValueStyle = {
      ...tdStyle,
      backgroundColor: theme.cardBackground
    };

    const evenRowStyle = {
      ...tdStyle,
      backgroundColor: theme.hoverBg
    };

    const oddRowStyle = {
      ...tdStyle,
      backgroundColor: theme.cardBackground
    };

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Transaction Preview</h3>
        
        {/* Transaction Summary */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: theme.textSecondary, marginBottom: '12px' }}>Transaction Details</h4>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={summaryLabelStyle}>Broker ID</td>
                <td style={summaryValueStyle}>{parsedData.brokerId}</td>
              </tr>
              <tr>
                <td style={summaryLabelStyle}>Financial Year</td>
                <td style={summaryValueStyle}>{parsedData.financialYearId}</td>
              </tr>
              <tr>
                <td style={summaryLabelStyle}>Seller Name</td>
                <td style={summaryValueStyle}>{parsedData.seller_name}</td>
              </tr>
              <tr>
                <td style={summaryLabelStyle}>Order Date</td>
                <td style={summaryValueStyle}>{parsedData.order_date}</td>
              </tr>
              <tr>
                <td style={summaryLabelStyle}>Seller Brokerage</td>
                <td style={summaryValueStyle}>{parsedData.sellerBrokerage}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Products */}
        {parsedData.product_list && parsedData.product_list.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: theme.textSecondary, marginBottom: '12px' }}>Products</h4>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Product Name</th>
                  <th style={thStyle}>Total Quantity</th>
                  <th style={thStyle}>Price</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.product_list.map((product, index) => (
                  <tr key={index}>
                    <td style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.product_name}</td>
                    <td style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.total_quantity}</td>
                    <td style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Buyers */}
        {parsedData.buyers && parsedData.buyers.length > 0 && (
          <div>
            <h4 style={{ color: theme.textSecondary, marginBottom: '12px' }}>Buyers</h4>
            {parsedData.buyers.map((buyer, buyerIndex) => (
              <div key={buyerIndex} style={{ marginBottom: '20px' }}>
                <h5 style={{ 
                  color: 'white', 
                  marginBottom: '8px',
                  backgroundColor: theme.success,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {buyer.buyer_name} (Brokerage: {buyer.buyerBrokerage})
                </h5>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Product Name</th>
                      <th style={thStyle}>Quantity</th>
                      <th style={thStyle}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyer.products && buyer.products.map((product, productIndex) => (
                      <tr key={productIndex}>
                        <td style={productIndex % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.product_name}</td>
                        <td style={productIndex % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.quantity}</td>
                        <td style={productIndex % 2 === 0 ? evenRowStyle : oddRowStyle}>{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder="Paste your transaction JSON data here..."
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

        {renderTransactionTable()}
      </div>
    </div>
  );
};

export default JsonTransactionInput;
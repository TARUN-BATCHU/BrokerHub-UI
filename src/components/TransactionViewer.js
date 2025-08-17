import React, { useState, useEffect } from 'react';
import { ledgerDetailsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import FinancialYearSelector from './FinancialYearSelector';

const TransactionViewer = ({ onEdit }) => {
  const { theme } = useTheme();
  const [transactionNumber, setTransactionNumber] = useState('');
  const [financialYearId, setFinancialYearId] = useState(new Date().getFullYear());
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brokerId = localStorage.getItem('brokerId');

  const fetchTransaction = async () => {
    if (!transactionNumber || !financialYearId) {
      setError('Please enter transaction number and select financial year');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getOptimizedLedgerDetailsByTransactionNumber(
        parseInt(transactionNumber),
        brokerId,
        financialYearId
      );
      setTransactionData(data);
    } catch (err) {
      setError(err.message || 'Transaction not found');
      setTransactionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchTransaction();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div style={{ 
      backgroundColor: theme.cardBackground, 
      padding: '20px', 
      borderRadius: '8px', 
      border: `1px solid ${theme.border}`,
      marginBottom: '20px'
    }}>
      <h3 style={{ color: theme.textPrimary, marginBottom: '20px' }}>
        View Transaction Details
      </h3>

      {/* Search Controls */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr auto', 
        gap: '15px', 
        marginBottom: '20px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontWeight: 'bold', 
            color: theme.textPrimary 
          }}>
            Transaction Number:
          </label>
          <input
            type="number"
            value={transactionNumber}
            onChange={(e) => setTransactionNumber(e.target.value)}
            onKeyPress={handleSearch}
            placeholder="Enter transaction number"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: theme.inputBackground || theme.cardBackground,
              color: theme.textPrimary
            }}
          />
        </div>

        <FinancialYearSelector
          selectedYear={financialYearId}
          onYearChange={setFinancialYearId}
        />

        <button
          onClick={fetchTransaction}
          disabled={loading}
          style={{
            backgroundColor: theme.primary || '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: theme.errorBg || '#f8d7da', 
          color: theme.errorText || '#721c24', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: `1px solid ${theme.errorBorder || '#f5c6cb'}`
        }}>
          {error}
        </div>
      )}

      {transactionData && (
        <div style={{ 
          backgroundColor: theme.background, 
          padding: '20px', 
          borderRadius: '8px',
          border: `1px solid ${theme.border}`
        }}>
          {/* Transaction Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: theme.cardBackground,
            borderRadius: '8px'
          }}>
            <div>
              <strong style={{ color: theme.textPrimary }}>Transaction #:</strong>
              <div style={{ color: theme.primary, fontSize: '18px', fontWeight: 'bold' }}>
                {transactionData.brokerTransactionNumber}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Date:</strong>
              <div style={{ color: theme.textSecondary }}>
                {transactionData.transactionDate}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Seller:</strong>
              <div style={{ color: theme.textSecondary }}>
                {transactionData.fromSeller.firmName}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Total Bags:</strong>
              <div style={{ color: theme.success, fontWeight: 'bold' }}>
                {transactionData.transactionSummary.totalBagsSoldInTransaction}
              </div>
            </div>
          </div>

          {/* Transaction Records */}
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: theme.cardBackground }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>S.No</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Buyer</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Rate</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Brokerage</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Cost</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Brokerage</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.records.map((record, index) => (
                  <tr key={record.ledgerRecordId}>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {record.toBuyer.firmName}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {record.product.productName}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {record.quantity}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {formatCurrency(record.productCost)}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {record.brokerage}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {formatCurrency(record.totalProductsCost)}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {formatCurrency(record.totalBrokerage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transaction Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            padding: '15px',
            backgroundColor: theme.cardBackground,
            borderRadius: '8px'
          }}>
            <div>
              <strong style={{ color: theme.textPrimary }}>Total Bags:</strong>
              <div style={{ color: theme.success, fontSize: '16px', fontWeight: 'bold' }}>
                {transactionData.transactionSummary.totalBagsSoldInTransaction}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Total Brokerage:</strong>
              <div style={{ color: theme.primary, fontSize: '16px', fontWeight: 'bold' }}>
                {formatCurrency(transactionData.transactionSummary.totalBrokerageInTransaction)}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Total Amount:</strong>
              <div style={{ color: theme.warning, fontSize: '16px', fontWeight: 'bold' }}>
                {formatCurrency(transactionData.transactionSummary.totalReceivableAmountInTransaction)}
              </div>
            </div>
            <div>
              <strong style={{ color: theme.textPrimary }}>Avg Brokerage/Bag:</strong>
              <div style={{ color: theme.info, fontSize: '16px', fontWeight: 'bold' }}>
                {formatCurrency(transactionData.transactionSummary.averageBrokeragePerBag)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              onClick={() => onEdit && onEdit(transactionData)}
              style={{
                backgroundColor: theme.warning || '#ffc107',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Edit Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionViewer;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI, financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateForDisplay } from '../utils/dateUtils';
import '../styles/ledger.css';

const DailyLedger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(location.state?.date || new Date().toISOString().split('T')[0]);
  const [dateInputValue, setDateInputValue] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentFinancialYearId, setCurrentFinancialYearId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    fetchCurrentFinancialYear();
    setDateInputValue(formatDateForDisplay(selectedDate));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchLedgerData();
      setDateInputValue(formatDateForDisplay(selectedDate));
    }
  }, [selectedDate, currentFinancialYearId]);

  const fetchCurrentFinancialYear = async () => {
    try {
      const financialYearId = await financialYearAPI.getCurrentFinancialYear();
      setCurrentFinancialYearId(financialYearId);
    } catch (err) {
      console.error('Error fetching current financial year:', err);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [theme.background]);

  const fetchLedgerData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getLedgerDetailsByDate(selectedDate, brokerId, currentFinancialYearId);
      setLedgerData(data || []);
    } catch (err) {
      setError('Failed to fetch ledger data');
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDateSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedDate) {
        fetchLedgerData();
      }
    }
  };

  const handleAddNewTransaction = () => {
    navigate('/transaction-detail', {
      state: {
        mode: 'create',
        date: selectedDate
      }
    });
  };

  const handleTransactionClick = (transaction) => {
    navigate('/transaction-detail-edit', {
      state: {
        transactionNumber: transaction.transactionNumber,
        financialYearId: transaction.financialYearId,
        brokerId: transaction.brokerId,
        date: selectedDate
      }
    });
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      setLoading(true);
      await ledgerDetailsAPI.deleteLedgerDetailByTransactionNumber(
        transactionToDelete.transactionNumber,
        transactionToDelete.brokerId,
        transactionToDelete.financialYearId
      );
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      fetchLedgerData();
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div key={theme.name} className="daily-ledger-container" style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: theme.background,
      minHeight: '100vh',
      color: theme.textPrimary
    }}>
      <div className="header-section" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: theme.textPrimary, marginBottom: '20px' }}>Daily Ledger - {formatDateForDisplay(selectedDate)}</h1>

        <div className="controls" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold', color: theme.textPrimary }}>
              Date:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={dateInputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setDateInputValue(value);
                  // Update selectedDate when complete dd-MM-yyyy format
                  if (value.match(/^\d{2}-\d{2}-\d{4}$/)) {
                    const [day, month, year] = value.split('-');
                    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    setSelectedDate(isoDate);
                  }
                }}
                onBlur={(e) => {
                  // Try to parse partial dates on blur
                  const value = e.target.value;
                  if (value.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                    const [day, month, year] = value.split('-');
                    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    setSelectedDate(isoDate);
                    setDateInputValue(formatDateForDisplay(isoDate));
                  }
                }}
                onKeyPress={handleDateSubmit}
                placeholder="DD-MM-YYYY"
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  width: '120px'
                }}
              />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '0',
                  height: '0',
                  pointerEvents: 'none'
                }}
                id="hidden-date-picker"
              />
              <button
                type="button"
                onClick={() => document.getElementById('hidden-date-picker').showPicker?.() || document.getElementById('hidden-date-picker').click()}
                style={{
                  padding: '8px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Select date"
              >
                📅
              </button>
            </div>
          </div>

          <button
            onClick={handleAddNewTransaction}
            style={{
              backgroundColor: theme.primary || '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Add New Transaction
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div className="simple-spinner" style={{ width: '20px', height: '20px' }}></div>
          <span style={{ color: theme.textPrimary }}>Loading...</span>
        </div>
      )}

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

      {!loading && !error && ledgerData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: theme.cardBackground,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`
        }}>
          <p style={{ fontSize: '18px', color: theme.textSecondary, marginBottom: '20px' }}>
            No transactions found for {formatDateForDisplay(selectedDate)}
          </p>
          <button
            onClick={handleAddNewTransaction}
            style={{
              backgroundColor: theme.success || '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Add New Transaction
          </button>
        </div>
      )}

      {!loading && !error && ledgerData.length > 0 && (
        <div className="ledger-content">
          {ledgerData.map((brokerData, index) => (
            <div key={index} className="broker-section" style={{ marginBottom: '30px' }}>
              <div className="broker-header" style={{
                backgroundColor: theme.cardBackground,
                padding: '15px',
                borderRadius: '8px 8px 0 0',
                borderBottom: `2px solid ${theme.primary || '#007bff'}`,
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: '0', fontWeight: 'bold', display: 'flex', gap: '20px' }}>
                    <span style={{ color: theme.textPrimary }}>{brokerData.transactionNumber}</span>
                    <span style={{ color: theme.primary || '#007bff' }}>Seller : {brokerData.sellerName}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleTransactionClick({
                        transactionNumber: brokerData.transactionNumber,
                        financialYearId: brokerData.financialYearId,
                        brokerId: brokerData.brokerId
                      })}
                      style={{
                        backgroundColor: theme.info || '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDeleteClick({
                        transactionNumber: brokerData.transactionNumber,
                        financialYearId: brokerData.financialYearId,
                        brokerId: brokerData.brokerId
                      })}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Transaction"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div className="transactions-table" style={{
                backgroundColor: theme.cardBackground,
                border: `1px solid ${theme.border}`,
                borderRadius: '0 0 8px 8px'
              }}>
                <h4 style={{
                  padding: '15px',
                  margin: '0',
                  backgroundColor: theme.background,
                  borderBottom: `1px solid ${theme.border}`,
                  color: theme.textPrimary
                }}>
                  Transaction Ledger Details List
                </h4>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.background }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Buyer Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Location</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Product Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Total Bags</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Product Cost</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Brokerage</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: `${theme.textPrimary} !important`, backgroundColor: `${theme.background} !important` }}>Total Brokerage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokerData.displayLedgerRecordDTOList.map((record, recordIndex) => (
                        <tr
                          key={recordIndex}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: theme.cardBackground
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.hoverBg || (theme.name === 'dark' ? '#374151' : '#f8f9fa');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.cardBackground;
                          }}
                        >
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.brokerTransactionNumber || record.ledgerDetailsId || recordIndex + 1}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.buyerName}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.buyerLocation || record.location || ''}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.productName}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.quantity}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {formatCurrency(record.productCost)}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {formatCurrency(record.brokerage)}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {formatCurrency(record.quantity * record.brokerage)}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: theme.background, fontWeight: 'bold' }}>
                        <td colSpan="4" style={{ padding: '12px', borderTop: `2px solid ${theme.border}`, color: theme.textPrimary, textAlign: 'right' }}>Total:</td>
                        <td style={{ padding: '12px', borderTop: `2px solid ${theme.border}`, color: theme.textPrimary }}>
                          {brokerData.displayLedgerRecordDTOList.reduce((sum, record) => sum + record.quantity, 0)}
                        </td>
                        <td style={{ padding: '12px', borderTop: `2px solid ${theme.border}`, color: theme.textPrimary }}></td>
                        <td style={{ padding: '12px', borderTop: `2px solid ${theme.border}`, color: theme.textPrimary }}></td>
                        <td style={{ padding: '12px', borderTop: `2px solid ${theme.border}`, color: theme.textPrimary }}>
                          {formatCurrency(brokerData.displayLedgerRecordDTOList.reduce((sum, record) => sum + (record.quantity * record.brokerage), 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.textPrimary }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', color: theme.textSecondary }}>
              Are you sure you want to delete this transaction?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                style={{
                  backgroundColor: theme.primary || '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLedger;
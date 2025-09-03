import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI } from '../services/api';
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

  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    if (selectedDate) {
      fetchLedgerData();
      setDateInputValue(formatDateForDisplay(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    setDateInputValue(formatDateForDisplay(selectedDate));
  }, []);

  const fetchLedgerData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getLedgerDetailsByDate(selectedDate, brokerId);
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
    navigate('/transaction-detail', {
      state: {
        mode: 'edit',
        transactionNumber: transaction.brokerTransactionNumber || transaction.ledgerDetailsId,
        financialYearId: transaction.financialYearId || new Date().getFullYear(),
        date: selectedDate
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="daily-ledger-container" style={{
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
                  backgroundColor: theme.inputBackground || theme.cardBackground,
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
        <div style={{ textAlign: 'center', padding: '20px', color: theme.textPrimary }}>
          <div>Loading...</div>
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
                <h3 style={{ margin: '0', color: theme.textPrimary }}>
                  Broker: {brokerData.brokerName}
                </h3>
                <p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>
                  Total Brokerage: {formatCurrency(brokerData.brokerage)}
                </p>
                <p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>
                  Seller: {brokerData.sellerName}
                </p>
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
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary }}>From</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Bags</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Buyers</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}`, color: theme.textPrimary }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokerData.displayLedgerRecordDTOList.map((record, recordIndex) => (
                        <tr
                          key={recordIndex}
                          style={{
                            cursor: 'pointer',
                            ':hover': { backgroundColor: '#f8f9fa' }
                          }}
                          onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = theme.hoverBg || '#f8f9fa'}
                          onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = theme.cardBackground}
                        >
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            #{record.brokerTransactionNumber || record.ledgerDetailsId || recordIndex + 1}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {brokerData.sellerName}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            {record.quantity}
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textPrimary }}>
                            1
                          </td>
                          <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>
                            <button
                              onClick={() => handleTransactionClick({
                                brokerTransactionNumber: record.brokerTransactionNumber || record.ledgerDetailsId || recordIndex + 1,
                                financialYearId: record.financialYearId
                              })}
                              style={{
                                backgroundColor: theme.info || '#17a2b8',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyLedger;
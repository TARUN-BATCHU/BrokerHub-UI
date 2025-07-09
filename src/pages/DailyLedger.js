import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/ledger.css';

const DailyLedger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(location.state?.date || new Date().toISOString().split('T')[0]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    if (selectedDate) {
      fetchLedgerData();
    }
  }, [selectedDate]);

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
        transactionNumber: transaction.brokerTransactionNumber,
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
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Daily Ledger - {selectedDate}</h1>
        
        <div className="controls" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label htmlFor="date-picker" style={{ marginRight: '10px', fontWeight: 'bold' }}>
              Change Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button
            onClick={handleAddNewTransaction}
            style={{
              backgroundColor: '#007bff',
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading...</div>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {!loading && !error && ledgerData.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            No transactions found for {selectedDate}
          </p>
          <button
            onClick={handleAddNewTransaction}
            style={{
              backgroundColor: '#28a745',
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
                backgroundColor: '#e9ecef', 
                padding: '15px', 
                borderRadius: '8px 8px 0 0',
                borderBottom: '2px solid #007bff'
              }}>
                <h3 style={{ margin: '0', color: '#333' }}>
                  Broker: {brokerData.brokerName}
                </h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                  Total Brokerage: {formatCurrency(brokerData.brokerage)}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                  Seller: {brokerData.sellerName}
                </p>
              </div>

              <div className="transactions-table" style={{ 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '0 0 8px 8px'
              }}>
                <h4 style={{ 
                  padding: '15px', 
                  margin: '0', 
                  backgroundColor: '#f8f9fa', 
                  borderBottom: '1px solid #ddd' 
                }}>
                  Transaction Ledger Details List
                </h4>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>From</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Bags</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Buyers</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
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
                          onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'white'}
                        >
                          <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                            {record.ledgerDetailsId || recordIndex + 1}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                            {brokerData.sellerName}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                            {record.quantity}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                            1
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                            <button
                              onClick={() => handleTransactionClick({
                                brokerTransactionNumber: record.ledgerDetailsId || recordIndex + 1
                              })}
                              style={{
                                backgroundColor: '#17a2b8',
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
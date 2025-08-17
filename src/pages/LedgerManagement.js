import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import TransactionViewer from '../components/TransactionViewer';
import FinancialYearSelector from '../components/FinancialYearSelector';

const LedgerManagement = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('view');
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateTransactions, setDateTransactions] = useState([]);

  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllTransactions();
    } else if (activeTab === 'date') {
      fetchTransactionsByDate();
    }
  }, [activeTab, selectedDate]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getAllLedgerDetails(brokerId);
      setAllTransactions(data || []);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching all transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsByDate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getLedgerDetailsByDate(selectedDate, brokerId);
      setDateTransactions(data || []);
    } catch (err) {
      setError('Failed to fetch transactions for selected date');
      console.error('Error fetching date transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    navigate('/transaction-detail', { 
      state: { 
        mode: 'create',
        date: selectedDate
      } 
    });
  };

  const handleEditTransaction = (transaction) => {
    navigate('/transaction-detail', { 
      state: { 
        mode: 'edit',
        transactionNumber: transaction.brokerTransactionNumber,
        financialYearId: transaction.financialYearId,
        date: transaction.transactionDate || selectedDate
      } 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? theme.primary || '#007bff' : theme.cardBackground,
    color: isActive ? 'white' : theme.textPrimary,
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    fontSize: '14px',
    fontWeight: 'bold',
    marginRight: '2px'
  });

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: theme.background,
      minHeight: '100vh',
      color: theme.textPrimary
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: theme.textPrimary, marginBottom: '10px' }}>
          Ledger Management
        </h1>
        <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
          Manage your transaction ledger with transaction number system
        </p>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('view')}
            style={tabStyle(activeTab === 'view')}
          >
            View Transaction
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={tabStyle(activeTab === 'create')}
          >
            Create Transaction
          </button>
          <button
            onClick={() => setActiveTab('date')}
            style={tabStyle(activeTab === 'date')}
          >
            By Date
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={tabStyle(activeTab === 'all')}
          >
            All Transactions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ 
        backgroundColor: theme.cardBackground, 
        borderRadius: '0 8px 8px 8px',
        border: `1px solid ${theme.border}`,
        minHeight: '400px'
      }}>
        {/* View Transaction Tab */}
        {activeTab === 'view' && (
          <div style={{ padding: '20px' }}>
            <TransactionViewer onEdit={handleEditTransaction} />
          </div>
        )}

        {/* Create Transaction Tab */}
        {activeTab === 'create' && (
          <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '20px' }}>
                Create New Transaction
              </h3>
              <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>
                Click the button below to create a new transaction. The system will automatically assign the next transaction number.
              </p>
              <button
                onClick={handleCreateTransaction}
                style={{
                  backgroundColor: theme.success || '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Create New Transaction
              </button>
            </div>
          </div>
        )}

        {/* By Date Tab */}
        {activeTab === 'date' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 'bold', 
                color: theme.textPrimary 
              }}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground || theme.cardBackground,
                  color: theme.textPrimary
                }}
              />
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '20px', color: theme.textPrimary }}>
                Loading transactions...
              </div>
            )}

            {error && (
              <div style={{ 
                backgroundColor: theme.errorBg || '#f8d7da', 
                color: theme.errorText || '#721c24', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {!loading && !error && dateTransactions.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: theme.background,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
                  No transactions found for {selectedDate}
                </p>
                <button
                  onClick={handleCreateTransaction}
                  style={{
                    backgroundColor: theme.success || '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Create Transaction for This Date
                </button>
              </div>
            )}

            {!loading && !error && dateTransactions.length > 0 && (
              <div>
                {dateTransactions.map((dayData, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      color: theme.textPrimary, 
                      marginBottom: '15px',
                      padding: '10px',
                      backgroundColor: theme.background,
                      borderRadius: '4px'
                    }}>
                      {dayData.date} - Seller: {dayData.sellerName}
                    </h4>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: theme.background }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Buyer</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Product</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Quantity</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Rate</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Brokerage</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayData.displayLedgerRecordDTOList.map((record, recordIndex) => (
                            <tr key={recordIndex}>
                              <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                                {record.buyerName}
                              </td>
                              <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                                {record.productName}
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
                                {formatCurrency(record.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Transactions Tab */}
        {activeTab === 'all' && (
          <div style={{ padding: '20px' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px', color: theme.textPrimary }}>
                Loading all transactions...
              </div>
            )}

            {error && (
              <div style={{ 
                backgroundColor: theme.errorBg || '#f8d7da', 
                color: theme.errorText || '#721c24', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {!loading && !error && allTransactions.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: theme.background,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
                  No transactions found
                </p>
                <button
                  onClick={handleCreateTransaction}
                  style={{
                    backgroundColor: theme.success || '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Create Your First Transaction
                </button>
              </div>
            )}

            {!loading && !error && allTransactions.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.background }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Transaction #</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Seller</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Bags</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total Brokerage</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Financial Year</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((transaction, index) => (
                      <tr key={transaction.ledgerDetailsId || index}>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.primary, fontWeight: 'bold' }}>
                          #{transaction.brokerTransactionNumber}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                          {transaction.dailyLedger?.date}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                          {transaction.fromSeller?.firmName}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                          {transaction.records?.reduce((sum, record) => sum + (record.quantity || 0), 0)}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                          {formatCurrency(transaction.records?.reduce((sum, record) => sum + (record.totalBrokerage || 0), 0) || 0)}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                          FY {transaction.financialYearId}
                        </td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            style={{
                              backgroundColor: theme.info || '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerManagement;
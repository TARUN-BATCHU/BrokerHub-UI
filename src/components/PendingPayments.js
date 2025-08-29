import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import './PendingPayments.css';

const PendingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPendingPayments(brokerId);
      setPayments(response.data || []);
    } catch (error) {
      setError('Failed to load pending payments');
      console.error('Pending payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPendingPayments();
      return;
    }

    try {
      setLoading(true);
      const response = await paymentAPI.searchPendingPayments(brokerId, searchTerm);
      setPayments(response.data || []);
    } catch (error) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'OVERDUE': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      case 'CRITICAL': return '#8e44ad';
      default: return '#95a5a6';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pending payments...</p>
      </div>
    );
  }

  return (
    <div className="pending-payments">
      <div className="payments-header">
        <h2>Pending Payments</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by buyer firm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={loadPendingPayments}>Clear</button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="payments-grid">
        {payments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <h3>{payment.buyerFirm}</h3>
              <div className="badges">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(payment.status) }}
                >
                  {payment.status}
                </span>
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(payment.priorityLevel) }}
                >
                  {payment.priorityLevel}
                </span>
              </div>
            </div>
            
            <div className="payment-details">
              <div className="detail-row">
                <span>Buyer Owner:</span>
                <span>{payment.buyerOwner}</span>
              </div>
              <div className="detail-row">
                <span>City:</span>
                <span>{payment.buyerCity}</span>
              </div>
              <div className="detail-row">
                <span>User Type:</span>
                <span>{payment.buyerUserType}</span>
              </div>
              <div className="detail-row">
                <span>Total Pending:</span>
                <span className="highlight">{formatCurrency(payment.totalPendingAmount)}</span>
              </div>
              <div className="detail-row">
                <span>Transactions:</span>
                <span>{payment.transactionCount}</span>
              </div>
              <div className="detail-row">
                <span>Oldest Transaction:</span>
                <span>{formatDate(payment.oldestTransactionDate)}</span>
              </div>
              <div className="detail-row">
                <span>Due Date:</span>
                <span className={payment.daysOverdue > 0 ? 'overdue' : ''}>
                  {formatDate(payment.dueDate)}
                </span>
              </div>
              {payment.daysOverdue > 0 && (
                <div className="detail-row">
                  <span>Days Overdue:</span>
                  <span className="overdue">{payment.daysOverdue} days</span>
                </div>
              )}
              {payment.daysUntilDue > 0 && (
                <div className="detail-row">
                  <span>Days Until Due:</span>
                  <span>{payment.daysUntilDue} days</span>
                </div>
              )}
            </div>

            {payment.buyerPhone && (
              <div className="contact-info">
                <div className="contact-item">
                  <span>📞 {payment.buyerPhone}</span>
                </div>
                {payment.buyerEmail && (
                  <div className="contact-item">
                    <span>✉️ {payment.buyerEmail}</span>
                  </div>
                )}
              </div>
            )}

            {payment.transactions && payment.transactions.length > 0 && (
              <div className="transactions">
                <h4>Recent Transactions</h4>
                {payment.transactions.slice(0, 3).map(transaction => (
                  <div key={transaction.transactionId} className="transaction">
                    <div className="transaction-info">
                      <span className="transaction-id">{transaction.transactionId}</span>
                      <span className="transaction-amount">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="transaction-details">
                      <span>{transaction.productName} - {transaction.quantity} units</span>
                      <span>{formatDate(transaction.transactionDate)}</span>
                    </div>
                  </div>
                ))}
                {payment.transactions.length > 3 && (
                  <div className="more-transactions">
                    +{payment.transactions.length - 3} more transactions
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {payments.length === 0 && !loading && (
        <div className="no-data">
          <p>No pending payments found</p>
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
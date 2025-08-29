import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import './ReceivablePayments.css';

const ReceivablePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    loadReceivablePayments();
  }, []);

  const loadReceivablePayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getReceivablePayments(brokerId);
      setPayments(response.data || []);
    } catch (error) {
      setError('Failed to load receivable payments');
      console.error('Receivable payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadReceivablePayments();
      return;
    }

    try {
      setLoading(true);
      const response = await paymentAPI.searchReceivablePayments(brokerId, searchTerm);
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
        <p>Loading receivable payments...</p>
      </div>
    );
  }

  return (
    <div className="receivable-payments">
      <div className="payments-header">
        <h2>Receivable Payments</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by seller firm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={loadReceivablePayments}>Clear</button>
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
              <h3>{payment.sellerFirm}</h3>
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
                <span>Seller Owner:</span>
                <span>{payment.sellerOwner}</span>
              </div>
              <div className="detail-row">
                <span>City:</span>
                <span>{payment.sellerCity}</span>
              </div>
              <div className="detail-row">
                <span>User Type:</span>
                <span>{payment.sellerUserType}</span>
              </div>
              <div className="detail-row">
                <span>Total Receivable:</span>
                <span className="highlight">{formatCurrency(payment.totalReceivableAmount)}</span>
              </div>
              <div className="detail-row">
                <span>Transactions:</span>
                <span>{payment.transactionCount}</span>
              </div>
              <div className="detail-row">
                <span>Unique Buyers:</span>
                <span>{payment.uniqueBuyersCount}</span>
              </div>
              <div className="detail-row">
                <span>Largest Debt:</span>
                <span>{formatCurrency(payment.largestSingleDebt)}</span>
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

            {payment.sellerPhone && (
              <div className="contact-info">
                <div className="contact-item">
                  <span>📞 {payment.sellerPhone}</span>
                </div>
                {payment.sellerEmail && (
                  <div className="contact-item">
                    <span>✉️ {payment.sellerEmail}</span>
                  </div>
                )}
                {payment.sellerGstNumber && (
                  <div className="contact-item">
                    <span>🏢 GST: {payment.sellerGstNumber}</span>
                  </div>
                )}
              </div>
            )}

            {payment.owedBy && payment.owedBy.length > 0 && (
              <div className="owed-by">
                <h4>Owed By ({payment.owedBy.length} buyers)</h4>
                {payment.owedBy.slice(0, 3).map(buyer => (
                  <div key={buyer.buyerId} className="buyer-debt">
                    <div className="buyer-info">
                      <span className="buyer-firm">{buyer.buyerFirm}</span>
                      <span className="debt-amount">{formatCurrency(buyer.totalOwed)}</span>
                    </div>
                    <div className="buyer-details">
                      <span>{buyer.transactionCount} transactions</span>
                      <span>Since: {formatDate(buyer.oldestTransactionDate)}</span>
                    </div>
                  </div>
                ))}
                {payment.owedBy.length > 3 && (
                  <div className="more-buyers">
                    +{payment.owedBy.length - 3} more buyers
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {payments.length === 0 && !loading && (
        <div className="no-data">
          <p>No receivable payments found</p>
        </div>
      )}
    </div>
  );
};

export default ReceivablePayments;
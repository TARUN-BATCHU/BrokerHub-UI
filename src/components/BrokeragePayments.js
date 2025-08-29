import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import PartPaymentModal from './PartPaymentModal';
import './BrokeragePayments.css';

const BrokeragePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPartPaymentModal, setShowPartPaymentModal] = useState(false);
  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    loadBrokeragePayments();
  }, []);

  const loadBrokeragePayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getBrokeragePayments(brokerId);
      setPayments(response.data || []);
    } catch (error) {
      setError('Failed to load brokerage payments');
      console.error('Brokerage payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBrokeragePayments();
      return;
    }

    try {
      setLoading(true);
      const response = await paymentAPI.searchBrokeragePayments(brokerId, searchTerm);
      setPayments(response.data || []);
    } catch (error) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPartPaymentModal(true);
  };

  const handlePartPaymentSuccess = () => {
    setShowPartPaymentModal(false);
    setSelectedPayment(null);
    loadBrokeragePayments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return '#27ae60';
      case 'PARTIALLY_PAID': return '#f39c12';
      case 'OVERDUE': return '#e74c3c';
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
        <p>Loading brokerage payments...</p>
      </div>
    );
  }

  return (
    <div className="brokerage-payments">
      <div className="payments-header">
        <h2>Brokerage Payments</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by firm name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={loadBrokeragePayments}>Clear</button>
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
              <h3>{payment.firmName}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(payment.status) }}
              >
                {payment.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="payment-details">
              <div className="detail-row">
                <span>Owner:</span>
                <span>{payment.ownerName}</span>
              </div>
              <div className="detail-row">
                <span>City:</span>
                <span>{payment.city}</span>
              </div>
              <div className="detail-row">
                <span>Total Bags:</span>
                <span>{payment.totalBags}</span>
              </div>
              <div className="detail-row">
                <span>Gross Brokerage:</span>
                <span>{formatCurrency(payment.grossBrokerage)}</span>
              </div>
              <div className="detail-row">
                <span>Net Brokerage:</span>
                <span className="highlight">{formatCurrency(payment.netBrokerage)}</span>
              </div>
              <div className="detail-row">
                <span>Paid Amount:</span>
                <span className="paid">{formatCurrency(payment.paidAmount)}</span>
              </div>
              <div className="detail-row">
                <span>Pending Amount:</span>
                <span className="pending">{formatCurrency(payment.pendingAmount)}</span>
              </div>
              {payment.lastPaymentDate && (
                <div className="detail-row">
                  <span>Last Payment:</span>
                  <span>{formatDate(payment.lastPaymentDate)}</span>
                </div>
              )}
              <div className="detail-row">
                <span>Due Date:</span>
                <span className={payment.daysOverdue > 0 ? 'overdue' : ''}>
                  {formatDate(payment.dueDate)}
                </span>
              </div>
            </div>

            <div className="payment-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${payment.paymentCompletionPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {payment.paymentCompletionPercentage.toFixed(1)}% Complete
              </span>
            </div>

            {payment.status !== 'PAID' && (
              <div className="payment-actions">
                <button 
                  className="add-payment-btn"
                  onClick={() => handleAddPartPayment(payment)}
                >
                  Add Payment
                </button>
              </div>
            )}

            {payment.partPayments && payment.partPayments.length > 0 && (
              <div className="part-payments">
                <h4>Payment History</h4>
                {payment.partPayments.map(partPayment => (
                  <div key={partPayment.id} className="part-payment">
                    <span>{formatCurrency(partPayment.amount)}</span>
                    <span>{formatDate(partPayment.paymentDate)}</span>
                    <span>{partPayment.method}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {payments.length === 0 && !loading && (
        <div className="no-data">
          <p>No brokerage payments found</p>
        </div>
      )}

      {showPartPaymentModal && (
        <PartPaymentModal
          payment={selectedPayment}
          onClose={() => setShowPartPaymentModal(false)}
          onSuccess={handlePartPaymentSuccess}
        />
      )}
    </div>
  );
};

export default BrokeragePayments;
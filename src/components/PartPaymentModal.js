import React, { useState } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import './PartPaymentModal.css';

const PartPaymentModal = ({ payment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'UPI',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionReference: '',
    bankDetails: '',
    recordedBy: localStorage.getItem('userName') || 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const brokerId = localStorage.getItem('brokerId');

  const paymentMethods = [
    'CASH', 'CHEQUE', 'UPI', 'BANK_TRANSFER', 'NEFT', 'RTGS', 'CARD'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) > payment.pendingAmount) {
      setError('Amount cannot exceed pending amount');
      return;
    }

    if (['CHEQUE', 'UPI', 'BANK_TRANSFER', 'NEFT', 'RTGS'].includes(formData.method) && !formData.transactionReference) {
      setError('Transaction reference is required for this payment method');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await paymentAPI.addPartPayment(brokerId, payment.id, paymentData);
      onSuccess();
    } catch (error) {
      setError(error.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Part Payment</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-info">
          <h4>{payment.firmName}</h4>
          <div className="info-row">
            <span>Net Brokerage: {formatCurrency(payment.netBrokerage)}</span>
            <span>Pending: {formatCurrency(payment.pendingAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter payment amount"
              step="0.01"
              max={payment.pendingAmount}
              required
            />
            <small>Maximum: {formatCurrency(payment.pendingAmount)}</small>
          </div>

          <div className="form-group">
            <label>Payment Method *</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              required
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Date *</label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {['CHEQUE', 'UPI', 'BANK_TRANSFER', 'NEFT', 'RTGS'].includes(formData.method) && (
            <div className="form-group">
              <label>Transaction Reference *</label>
              <input
                type="text"
                name="transactionReference"
                value={formData.transactionReference}
                onChange={handleInputChange}
                placeholder="Enter transaction reference"
                required
              />
            </div>
          )}

          {['BANK_TRANSFER', 'NEFT', 'RTGS', 'CHEQUE'].includes(formData.method) && (
            <div className="form-group">
              <label>Bank Details</label>
              <input
                type="text"
                name="bankDetails"
                value={formData.bankDetails}
                onChange={handleInputChange}
                placeholder="Enter bank details"
              />
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any notes about this payment"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Payment...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartPaymentModal;
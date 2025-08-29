import React from 'react';
import './PaymentDashboard.css';

const PaymentDashboard = ({ stats, loading, onRefresh }) => {
  if (loading || !stats) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.0';
    return value.toFixed(1);
  };

  const getStatusColor = (value, threshold = 0) => {
    if (value > threshold) return '#e74c3c';
    return '#27ae60';
  };

  return (
    <div className="payment-dashboard">
      <div className="dashboard-grid">
        {/* Brokerage Section */}
        <div className="dashboard-section">
          <h3>Brokerage Payments</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.totalBrokerageAmount)}</div>
              <div className="stat-label">Total Brokerage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.totalBrokeragePaid)}</div>
              <div className="stat-label">Paid Amount</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{color: getStatusColor(stats.totalBrokeragePending)}}>
                {formatCurrency(stats.totalBrokeragePending)}
              </div>
              <div className="stat-label">Pending Amount</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatPercentage(stats.brokerageCompletionPercentage)}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
          <div className="additional-stats">
            <span>Merchants with Pending: {stats.merchantsWithPendingBrokerage}</span>
            <span style={{color: getStatusColor(stats.overdueBrokeragePayments)}}>
              Overdue: {stats.overdueBrokeragePayments}
            </span>
          </div>
        </div>

        {/* Pending Payments Section */}
        <div className="dashboard-section">
          <h3>Pending Payments</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" style={{color: getStatusColor(stats.totalPendingPaymentAmount)}}>
                {formatCurrency(stats.totalPendingPaymentAmount)}
              </div>
              <div className="stat-label">Total Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.buyersWithPendingPayments}</div>
              <div className="stat-label">Buyers with Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{color: getStatusColor(stats.overduePendingPayments)}}>
                {stats.overduePendingPayments}
              </div>
              <div className="stat-label">Overdue Payments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.averagePendingPaymentAmount)}</div>
              <div className="stat-label">Average Amount</div>
            </div>
          </div>
        </div>

        {/* Receivable Payments Section */}
        <div className="dashboard-section">
          <h3>Receivable Payments</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.totalReceivablePaymentAmount)}</div>
              <div className="stat-label">Total Receivable</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.sellersWithReceivablePayments}</div>
              <div className="stat-label">Sellers with Receivable</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{color: getStatusColor(stats.overdueReceivablePayments)}}>
                {stats.overdueReceivablePayments}
              </div>
              <div className="stat-label">Overdue Receivables</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.averageReceivablePaymentAmount)}</div>
              <div className="stat-label">Average Amount</div>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="dashboard-section full-width">
          <h3>Overall Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(stats.totalAmountInCirculation)}</div>
              <div className="summary-label">Total Amount in Circulation</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{stats.totalActivePayments}</div>
              <div className="summary-label">Active Payments</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{color: getStatusColor(stats.criticalPaymentsCount)}}>
                {stats.criticalPaymentsCount}
              </div>
              <div className="summary-label">Critical Payments</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{stats.paymentsDueSoonCount}</div>
              <div className="summary-label">Due Soon</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(stats.recentPaymentsAmount)}</div>
              <div className="summary-label">Recent Payments ({stats.recentPaymentsCount})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
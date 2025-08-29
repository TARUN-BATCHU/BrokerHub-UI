import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import BrokeragePayments from '../components/BrokeragePayments';
import PendingPayments from '../components/PendingPayments';
import ReceivablePayments from '../components/ReceivablePayments';
import PaymentDashboard from '../components/PaymentDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import './PaymentManagement.css';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const brokerId = localStorage.getItem('brokerId');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getDashboardStats(brokerId);
      setDashboardStats(response.data);
    } catch (error) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    try {
      setLoading(true);
      await paymentAPI.refreshCache(brokerId);
      if (activeTab === 'dashboard') {
        await loadDashboardStats();
      }
    } catch (error) {
      setError('Failed to refresh cache');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'brokerage', label: 'Brokerage Payments', icon: '💰' },
    { id: 'pending', label: 'Pending Payments', icon: '⏳' },
    { id: 'receivable', label: 'Receivable Payments', icon: '📥' }
  ];

  if (loading && !dashboardStats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="payment-management">
      <div className="payment-header">
        <h1>Payment Management</h1>
        <button 
          className="refresh-btn"
          onClick={handleRefreshCache}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="payment-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="payment-content">
        {activeTab === 'dashboard' && (
          <PaymentDashboard 
            stats={dashboardStats} 
            loading={loading}
            onRefresh={loadDashboardStats}
          />
        )}
        {activeTab === 'brokerage' && <BrokeragePayments />}
        {activeTab === 'pending' && <PendingPayments />}
        {activeTab === 'receivable' && <ReceivablePayments />}
      </div>
    </div>
  );
};

export default PaymentManagement;
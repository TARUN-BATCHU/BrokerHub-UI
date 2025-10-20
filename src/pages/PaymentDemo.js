import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';

const PaymentDemo = () => {
  const [firms, setFirms] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [brokeragePayments, setBrokeragePayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const brokerId = localStorage.getItem('brokerId') || '1'; // Default to 1 for demo

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test all API endpoints
      console.log('Testing Payment API endpoints...');

      // Test firms endpoint
      try {
        const firmsResponse = await paymentAPI.getAllFirms();
        setFirms(firmsResponse.data || []);
        console.log('Firms loaded:', firmsResponse);
      } catch (err) {
        console.error('Firms API error:', err);
      }

      // Test dashboard stats
      try {
        const statsResponse = await paymentAPI.getDashboardStats(brokerId);
        setDashboardStats(statsResponse.data);
        console.log('Dashboard stats loaded:', statsResponse);
      } catch (err) {
        console.error('Dashboard stats API error:', err);
      }

      // Test brokerage payments
      try {
        const brokerageResponse = await paymentAPI.getBrokeragePayments(brokerId);
        setBrokeragePayments(brokerageResponse.data || []);
        console.log('Brokerage payments loaded:', brokerageResponse);
      } catch (err) {
        console.error('Brokerage payments API error:', err);
      }

    } catch (error) {
      setError('Failed to load demo data: ' + error.message);
      console.error('Demo data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPartPayment = async () => {
    if (brokeragePayments.length === 0) {
      alert('No brokerage payments available for testing');
      return;
    }

    const payment = brokeragePayments[0];
    const partPaymentData = {
      amount: 1000.00,
      method: 'UPI',
      notes: 'Test payment from demo',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionReference: 'DEMO' + Date.now(),
      recordedBy: 'demo-user'
    };

    try {
      const response = await paymentAPI.addPartPayment(brokerId, payment.id, partPaymentData);
      console.log('Part payment added:', response);
      alert('Part payment added successfully!');
      loadDemoData(); // Reload data
    } catch (error) {
      console.error('Part payment error:', error);
      alert('Part payment failed: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Payment API Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={loadDemoData} disabled={loading}>
          {loading ? 'Loading...' : 'Reload Data'}
        </button>
        <button onClick={testPartPayment} style={{ marginLeft: '10px' }}>
          Test Part Payment
        </button>
      </div>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Firms */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Firms ({firms.length})</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {firms.map((firm, index) => (
              <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                {firm}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Dashboard Stats</h3>
          {dashboardStats ? (
            <div>
              <p>Total Brokerage: ₹{dashboardStats.totalBrokerageAmount?.toLocaleString()}</p>
              <p>Total Pending: ₹{dashboardStats.totalPendingPaymentAmount?.toLocaleString()}</p>
              <p>Total Receivable: ₹{dashboardStats.totalReceivablePaymentAmount?.toLocaleString()}</p>
              <p>Active Payments: {dashboardStats.totalActivePayments}</p>
              <p>Critical Payments: {dashboardStats.criticalPaymentsCount}</p>
            </div>
          ) : (
            <p>No dashboard stats available</p>
          )}
        </div>

        {/* Brokerage Payments */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Brokerage Payments ({brokeragePayments.length})</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {brokeragePayments.map((payment) => (
              <div key={payment.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div><strong>{payment.firmName}</strong></div>
                <div>Net: ₹{payment.netBrokerage?.toLocaleString()}</div>
                <div>Pending: ₹{payment.pendingAmount?.toLocaleString()}</div>
                <div>Status: {payment.status}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>API Test Results</h3>
        <p>Check the browser console for detailed API responses and any errors.</p>
        <p>Broker ID: {brokerId}</p>
        <p>API Base URL: {process.env.REACT_APP_API_URL || '/BrokerHub'}/payments</p>
      </div>
    </div>
  );
};

export default PaymentDemo;
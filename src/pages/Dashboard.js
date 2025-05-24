import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [brokerData, setBrokerData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const savedBrokerData = localStorage.getItem('brokerData');

    if (!token) {
      navigate('/login');
      return;
    }

    if (savedBrokerData) {
      setBrokerData(JSON.parse(savedBrokerData));
    }

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [navigate, location]);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  if (!brokerData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b' }}>BrokerHub Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
            Welcome back, {brokerData.brokerName}!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
        >
          Logout
        </button>
      </header>

      {successMessage && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Broker Information</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Name:</strong> {brokerData.brokerName}</p>
            <p><strong>Username:</strong> {brokerData.userName}</p>
            <p><strong>Firm:</strong> {brokerData.brokerageFirmName}</p>
            <p><strong>Email:</strong> {brokerData.email}</p>
            <p><strong>Phone:</strong> {brokerData.phoneNumber}</p>
            <p><strong>Pincode:</strong> {brokerData.pincode}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Banking Details</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Bank:</strong> {brokerData.BankName}</p>
            <p><strong>Branch:</strong> {brokerData.Branch}</p>
            <p><strong>Account:</strong> {brokerData.AccountNumber}</p>
            <p><strong>IFSC:</strong> {brokerData.IfscCode}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary">View Transactions</button>
            <button className="btn btn-secondary">Update Profile</button>
            <Link to="/change-password" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Change Password
            </Link>
            <Link to="/verify-account" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Verify Account
            </Link>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '24px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>
          Welcome to BrokerHub Trading Platform
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          Your platform for rice, dals, and grains trading.
          Connect with buyers and sellers efficiently.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

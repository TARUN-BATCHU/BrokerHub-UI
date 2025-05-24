import React from 'react';
import { Link } from 'react-router-dom';

const TestNavigation = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Test Navigation</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Login
        </Link>
        <Link to="/signup" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Signup
        </Link>
        <Link to="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Forgot Password
        </Link>
        <Link to="/create-password" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Create Password
        </Link>
        <Link to="/verify-account" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Verify Account
        </Link>
        <Link to="/change-password" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Change Password
        </Link>
        <Link to="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default TestNavigation;

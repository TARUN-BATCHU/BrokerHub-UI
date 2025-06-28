import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setUserName(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (!userName.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate OTP and send to email
      await authAPI.forgotPassword(userName);
      
      // Navigate to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          userName,
          email: userName, // Using username as email since we don't have email yet
          fromForgotPassword: true
        }
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Enter your username and we'll send an OTP to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <FormInput
            label="Username"
            name="userName"
            value={userName}
            onChange={handleChange}
            error=""
            placeholder="Enter your username"
            required
          />

          <div className="auth-actions">
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary auth-submit-btn"
            >
              Send OTP
            </LoadingButton>
          </div>

          <div className="auth-links">
            <Link to="/login" className="auth-link">
              Remember your password? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
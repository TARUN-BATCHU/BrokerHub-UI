import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      await authAPI.forgotPassword(userName);
      setSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>We've sent a password reset link to your email address</p>
          </div>

          <div className="success-message">
            Password reset instructions have been sent for username <strong>{userName}</strong>.
            Please check your email and follow the instructions to reset your password.
          </div>

          <div className="auth-actions">
            <Link to="/login" className="btn btn-primary auth-submit-btn">
              Back to Sign In
            </Link>
          </div>

          <div className="auth-links">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setUserName('');
              }}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try a different username
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Enter your username and we'll send password reset instructions to your email</p>
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
              Send Reset Link
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

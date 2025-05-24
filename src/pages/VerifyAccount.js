import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import './Auth.css';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    userName: location.state?.userName || '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear messages
    if (apiError) setApiError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }

    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await authAPI.verifyAccount(formData.userName, formData.otp);
      
      // Success - redirect to login
      navigate('/login', { 
        state: { 
          message: 'Account verified successfully! You can now sign in.' 
        }
      });
    } catch (error) {
      console.error('Verify account error:', error);
      setApiError(error.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.userName.trim()) {
      setErrors({ userName: 'Username is required to resend OTP' });
      return;
    }

    setResendLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      // Get broker data to find email
      const brokerData = JSON.parse(localStorage.getItem('brokerData') || '{}');
      const email = brokerData.email || location.state?.email;
      
      if (!email) {
        setApiError('Email not found. Please try signing up again.');
        return;
      }

      await authAPI.generateOTP(email);
      setSuccessMessage('OTP sent successfully! Please check your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setApiError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify Your Account</h1>
          <p>Enter the 6-digit OTP sent to your email address</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <FormInput
            label="Username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            error={errors.userName}
            placeholder="Enter your username"
            required
          />

          <FormInput
            label="OTP"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            error={errors.otp}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            required
          />

          <div className="auth-actions">
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary auth-submit-btn"
            >
              Verify Account
            </LoadingButton>
          </div>

          <div className="auth-links">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="auth-link"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: resendLoading ? 'not-allowed' : 'pointer',
                opacity: resendLoading ? 0.6 : 1
              }}
            >
              {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
            </button>
          </div>

          <div className="auth-divider">
            <span>Need help?</span>
          </div>

          <div className="auth-links">
            <Link to="/signup" className="auth-link">
              Back to Sign Up
            </Link>
            {' | '}
            <Link to="/login" className="auth-link">
              Sign In Instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;

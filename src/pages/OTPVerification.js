import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import './Auth.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, email, fromForgotPassword } = location.state || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      if (fromForgotPassword) {
        await authAPI.forgotPassword(userName);
      } else {
        await authAPI.generateOTP(email);
      }
      alert('A new OTP has been sent to your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.verifyAccount(userName, parseInt(otp, 10));
      
      // If from forgot password flow, redirect to create new password
      if (fromForgotPassword) {
        navigate('/create-password', { 
          state: { 
            userName,
            email,
            verified: true 
          }
        });
      } else {
        // For other flows (e.g., account verification)
        navigate('/dashboard', { 
          state: { 
            message: 'Account verified successfully!' 
          }
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userName || !email) {
    navigate('/login');
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify OTP</h1>
          <p>Enter the 6-digit code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <FormInput
            label="OTP Code"
            type="text"
            name="otp"
            value={otp}
            onChange={handleChange}
            error=""
            placeholder="Enter 6-digit OTP"
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={6}
            required
          />

          <div className="auth-actions">
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary auth-submit-btn"
            >
              Verify OTP
            </LoadingButton>
          </div>

          <div className="auth-links">
            <button
              type="button"
              onClick={handleResendOTP}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              disabled={loading}
            >
              Didn't receive the code? Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
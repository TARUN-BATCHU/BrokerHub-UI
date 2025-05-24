import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import { validateLoginForm } from '../utils/validation';
import { useTheme } from '../contexts/ThemeContext';

import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
    if (apiError) {
      setApiError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      console.log('Attempting login with:', formData);
      const response = await authAPI.loginBroker(formData);

      console.log('Login successful, response:', response);

      // Check if token and broker ID were stored
      const storedToken = localStorage.getItem('authToken');
      const storedBrokerId = localStorage.getItem('brokerId');

      console.log('Stored token:', storedToken);
      console.log('Stored broker ID:', storedBrokerId);

      // Fetch broker details using the extracted broker ID
      if (storedBrokerId) {
        try {
          console.log('Fetching broker details for ID:', storedBrokerId);
          const brokerDetails = await authAPI.getBrokerProfile(storedBrokerId);
          console.log('Broker details fetched:', brokerDetails);

          // Store the detailed broker data
          localStorage.setItem('brokerData', JSON.stringify(brokerDetails));
          console.log('Broker details stored in localStorage');

          // Success - redirect to dashboard with success message including broker name
          navigate('/dashboard', {
            state: {
              message: `Login successful! Welcome ${brokerDetails.brokerName || 'to BrokerHub Dashboard'}.`
            }
          });
        } catch (brokerError) {
          console.error('Error fetching broker details:', brokerError);
          // Still redirect to dashboard even if broker details fetch fails
          navigate('/dashboard', {
            state: {
              message: 'Login successful! Welcome to BrokerHub Dashboard.'
            }
          });
        }
      } else {
        // No broker ID found, redirect anyway
        navigate('/dashboard', {
          state: {
            message: 'Login successful! Welcome to BrokerHub Dashboard.'
          }
        });
      }

      console.log('Navigation to dashboard initiated');
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error scenarios
      if (error.status === 401) {
        setApiError('Invalid username or password. Please try again.');
      } else if (error.status === 403) {
        setApiError('Account access denied. Please contact support.');
      } else if (error.status === 404) {
        setApiError('User not found. Please check your username.');
      } else {
        setApiError(error.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundColor: theme.background,
        transition: 'background-color 0.3s ease'
      }}
      data-theme={theme.isDarkMode ? 'dark' : 'light'}
    >


      <div className="auth-card" style={{
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadowModal,
        transition: 'all 0.3s ease'
      }}>
        <div className="auth-header">
          <h1 style={{ color: theme.textPrimary }}>Welcome to BrokerHub</h1>
          <p style={{ color: theme.textSecondary }}>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {apiError && (
            <div className="error-message">
              {apiError}
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
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          <div className="auth-actions">
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary auth-submit-btn"
            >
              Sign In
            </LoadingButton>
          </div>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
            {' | '}
            <Link to="/create-password" className="auth-link">
              Create Password
            </Link>
          </div>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <div className="auth-actions">
            <Link to="/signup" className="btn btn-outline auth-submit-btn">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;



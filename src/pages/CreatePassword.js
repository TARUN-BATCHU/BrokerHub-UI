import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import { validatePassword } from '../utils/validation';
import './Auth.css';

const CreatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, email, verified } = location.state || {};

  const [formData, setFormData] = useState({
    email: email || '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Redirect if not coming from OTP verification
    if (!verified || !userName) {
      navigate('/login');
    }
  }, [navigate, verified, userName]);

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
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Use the retry API call pattern
      let retries = 0;
      const maxRetries = 5;
      
      while (retries < maxRetries) {
        try {
          await authAPI.createPassword({
            email: formData.email, // Use email from form
            password: formData.password
          });
          break; // Success - exit loop
        } catch (error) {
          retries++;
          if (retries === maxRetries) {
            throw error;
          }
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Success - redirect to login with success message
      navigate('/login', { 
        state: { 
          message: 'Password created successfully! Please sign in with your new password.' 
        }
      });
    } catch (error) {
      console.error('Create password error:', error);
      setApiError(error.message || 'Failed to create password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/verify-account', { 
      state: { 
        userName,
        email: formData.email,
        message: 'Please verify your account to continue.'
      }
    });
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (!verified || !userName) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create New Password</h1>
          <p>Please enter your email and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email address"
            required
          />

          <div className="password-input-container">
            <FormInput
              label="New Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('password')}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="password-input-container">
            <FormInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="auth-actions" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back
            </button>
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              Create Password
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePassword;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import { validatePassword } from '../utils/validation';
import './Auth.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const savedBrokerData = localStorage.getItem('brokerData');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (savedBrokerData) {
      const brokerData = JSON.parse(savedBrokerData);
      setFormData(prev => ({
        ...prev,
        email: brokerData.email || ''
      }));
    }
  }, [navigate]);

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

    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.password) {
      newErrors.password = 'New password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    } else if (formData.password === formData.oldPassword) {
      newErrors.password = 'New password must be different from current password';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
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
      await authAPI.changePassword({
        email: formData.email,
        oldPassword: formData.oldPassword,
        password: formData.password
      });
      
      // Success - redirect to dashboard with success message
      navigate('/dashboard', { 
        state: { 
          message: 'Password changed successfully!' 
        }
      });
    } catch (error) {
      console.error('Change password error:', error);
      setApiError(error.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Change Password</h1>
          <p>Update your account password</p>
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
            disabled={true}
            placeholder="Your email address"
          />

          <FormInput
            label="Current Password"
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            error={errors.oldPassword}
            placeholder="Enter your current password"
            required
          />

          <FormInput
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your new password"
            required
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            required
          />

          <div className="auth-actions step-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary"
            >
              Change Password
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
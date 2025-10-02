import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import FormInputWithAvailability from '../components/FormInputWithAvailability';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import { validateBrokerForm } from '../utils/validation';
import { useTheme } from '../contexts/ThemeContext';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    brokerName: '',
    brokerageFirmName: '',
    pincode: '',
    email: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [availabilityErrors, setAvailabilityErrors] = useState({});

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

    // Clear availability errors
    if (availabilityErrors[name]) {
      setAvailabilityErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };



  // Track checked values to prevent duplicate calls
  const [checkedUsernames, setCheckedUsernames] = useState(new Set());
  const [checkedFirmNames, setCheckedFirmNames] = useState(new Set());
  const [checkingStates, setCheckingStates] = useState({ username: false, firmName: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      const username = formData.userName?.trim();
      if (username && username.length >= 3 && !checkedUsernames.has(username) && !checkingStates.username) {
        checkUsernameAvailability(username);
      } else if (!username || username.length < 3) {
        setAvailabilityErrors(prev => ({ ...prev, userName: '' }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.userName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const firmName = formData.brokerageFirmName?.trim();
      if (firmName && firmName.length >= 3 && !checkedFirmNames.has(firmName) && !checkingStates.firmName) {
        checkFirmNameAvailability(firmName);
      } else if (!firmName || firmName.length < 3) {
        setAvailabilityErrors(prev => ({ ...prev, brokerageFirmName: '' }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.brokerageFirmName]);

  const checkUsernameAvailability = async (userName) => {
    if (!userName || userName.length < 3 || checkedUsernames.has(userName)) return;
    
    setCheckingStates(prev => ({ ...prev, username: true }));
    setCheckedUsernames(prev => new Set([...prev, userName]));
    
    try {
      const exists = await authAPI.checkUsernameExists(userName);
      
      if (exists) {
        setAvailabilityErrors(prev => ({
          ...prev,
          userName: 'Username is already taken. Please choose another one.'
        }));
      } else {
        setAvailabilityErrors(prev => ({
          ...prev,
          userName: ''
        }));
      }
    } catch (error) {
      console.error('Username availability check failed:', error);
      setAvailabilityErrors(prev => ({
        ...prev,
        userName: 'Unable to verify username availability. Please try again later.'
      }));
    } finally {
      setCheckingStates(prev => ({ ...prev, username: false }));
    }
  };

  const checkFirmNameAvailability = async (firmName) => {
    if (!firmName || firmName.length < 3 || checkedFirmNames.has(firmName)) return;
    
    setCheckingStates(prev => ({ ...prev, firmName: true }));
    setCheckedFirmNames(prev => new Set([...prev, firmName]));
    
    try {
      const exists = await authAPI.checkBrokerFirmNameExists(firmName);
      
      if (exists) {
        setAvailabilityErrors(prev => ({
          ...prev,
          brokerageFirmName: 'Firm name is already taken. Please choose another one.'
        }));
      } else {
        setAvailabilityErrors(prev => ({
          ...prev,
          brokerageFirmName: ''
        }));
      }
    } catch (error) {
      console.error('Firm name availability check failed:', error);
      setAvailabilityErrors(prev => ({
        ...prev,
        brokerageFirmName: 'Unable to verify firm name availability. Please try again later.'
      }));
    } finally {
      setCheckingStates(prev => ({ ...prev, firmName: false }));
    }
  };

  const handleNextStep = () => {
    // Validate current step
    const validation = validateBrokerForm(formData);
    const stepErrors = {};
    const stepAvailabilityErrors = {};

    if (currentStep === 1) {
      // Step 1: Account details
      ['userName', 'password', 'confirmPassword', 'brokerName', 'brokerageFirmName'].forEach(field => {
        if (validation.errors[field]) {
          stepErrors[field] = validation.errors[field];
        }
      });
      
      // Check availability errors
      if (availabilityErrors.userName) {
        stepAvailabilityErrors.userName = availabilityErrors.userName;
      }
      if (availabilityErrors.brokerageFirmName) {
        stepAvailabilityErrors.brokerageFirmName = availabilityErrors.brokerageFirmName;
      }
    } else if (currentStep === 2) {
      // Step 2: Contact details
      ['email', 'phoneNumber', 'pincode'].forEach(field => {
        if (validation.errors[field]) {
          stepErrors[field] = validation.errors[field];
        }
      });
    }

    const allErrors = { ...stepErrors, ...stepAvailabilityErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate entire form
    const validation = validateBrokerForm(formData);
    const allErrors = { ...validation.errors };
    
    // Add availability errors
    if (availabilityErrors.userName) {
      allErrors.userName = availabilityErrors.userName;
    }
    if (availabilityErrors.brokerageFirmName) {
      allErrors.brokerageFirmName = availabilityErrors.brokerageFirmName;
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Send only required fields to API
      const brokerData = {
        userName: formData.userName,
        password: formData.password,
        brokerName: formData.brokerName,
        brokerageFirmName: formData.brokerageFirmName,
        pincode: formData.pincode,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode
      };

      const response = await authAPI.createBroker(brokerData);

      // Success - redirect to verification
      navigate('/verify-account', {
        state: {
          userName: brokerData.userName,
          email: brokerData.email,
          message: 'Account created successfully! Please verify your account with the OTP sent to your email.'
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      setApiError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div style={{
        padding: '16px',
        border: '2px solid #4f46e5',
        borderRadius: '8px',
        backgroundColor: '#f5f3ff',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#4f46e5',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Brokerage Firm Name *
        </h3>
        <FormInputWithAvailability
          name="brokerageFirmName"
          value={formData.brokerageFirmName}
          onChange={handleChange}
          error={errors.brokerageFirmName || availabilityErrors.brokerageFirmName}
          placeholder="Enter your unique firm/company name"
          checkAvailability={checkFirmNameAvailability}
          required
          style={{
            marginBottom: '8px',
            borderBottom: '2px solid #4f46e5'
          }}
        />
      </div>
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '12px',
        color: '#4b5563',
        fontStyle: 'italic'
      }}>
        This name will be used for all business transactions and documents
      </p>

      <div>
        <FormInputWithAvailability
          label="Username"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          error={errors.userName || availabilityErrors.userName}
          placeholder="Choose a unique username"
          checkAvailability={checkUsernameAvailability}
          required
        />
        <p style={{
          margin: '4px 0 16px 0',
          fontSize: '12px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Username will be used for login and must be unique across the platform
        </p>
      </div>

      <FormInput
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Create a strong password"
        required
      />

      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
      />

      <FormInput
        label="Broker Name"
        name="brokerName"
        value={formData.brokerName}
        onChange={handleChange}
        error={errors.brokerName}
        placeholder="Your full name"
        required
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <FormInput
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="your.email@example.com"
        required
      />

      <FormInput
        label="Phone Number"
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
        placeholder="10-digit mobile number"
        required
      />

      <FormInput
        label="Pincode"
        name="pincode"
        value={formData.pincode}
        onChange={handleChange}
        error={errors.pincode}
        placeholder="6-digit area pincode"
        required
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <FormInput
        label="Bank Name"
        name="bankName"
        value={formData.bankName}
        onChange={handleChange}
        error={errors.bankName}
        placeholder="Your bank name"
        required
      />

      <FormInput
        label="Account Number"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        error={errors.accountNumber}
        placeholder="Bank account number"
        required
      />

      <FormInput
        label="IFSC Code"
        name="ifscCode"
        value={formData.ifscCode}
        onChange={handleChange}
        error={errors.ifscCode}
        placeholder="Bank IFSC code"
        required
      />

      <FormInput
        label="Branch"
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        error={errors.branch}
        placeholder="Bank branch name"
        required
      />
    </>
  );

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1>Create Your BrokerHub Account</h1>
          <p>Join the platform for rice, dals, and grains trading</p>

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          </div>

          <div className="step-labels">
            <span className={currentStep === 1 ? 'active' : ''}>Account</span>
            <span className={currentStep === 2 ? 'active' : ''}>Contact</span>
            <span className={currentStep === 3 ? 'active' : ''}>Banking</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="auth-actions step-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <LoadingButton
                type="submit"
                loading={loading}
                className="btn btn-primary"
              >
                Create Account
              </LoadingButton>
            )}
          </div>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <div className="auth-actions">
            <Link to="/login" className="btn btn-outline auth-submit-btn">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { authAPI } from '../services/api';
import { validateBrokerForm } from '../utils/validation';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
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
    BankName: '',
    AccountNumber: '',
    IfscCode: '',
    Branch: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const handleNextStep = () => {
    // Validate current step
    const validation = validateBrokerForm(formData);
    const stepErrors = {};

    if (currentStep === 1) {
      // Step 1: Account details
      ['userName', 'password', 'confirmPassword', 'brokerName', 'brokerageFirmName'].forEach(field => {
        if (validation.errors[field]) {
          stepErrors[field] = validation.errors[field];
        }
      });
    } else if (currentStep === 2) {
      // Step 2: Contact details
      ['email', 'phoneNumber', 'pincode'].forEach(field => {
        if (validation.errors[field]) {
          stepErrors[field] = validation.errors[field];
        }
      });
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
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
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...brokerData } = formData;

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
      <FormInput
        label="Username"
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        error={errors.userName}
        placeholder="Choose a username"
        required
      />

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

      <FormInput
        label="Brokerage Firm Name"
        name="brokerageFirmName"
        value={formData.brokerageFirmName}
        onChange={handleChange}
        error={errors.brokerageFirmName}
        placeholder="Your firm/company name"
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
        name="BankName"
        value={formData.BankName}
        onChange={handleChange}
        error={errors.BankName}
        placeholder="Your bank name"
        required
      />

      <FormInput
        label="Account Number"
        name="AccountNumber"
        value={formData.AccountNumber}
        onChange={handleChange}
        error={errors.AccountNumber}
        placeholder="Bank account number"
        required
      />

      <FormInput
        label="IFSC Code"
        name="IfscCode"
        value={formData.IfscCode}
        onChange={handleChange}
        error={errors.IfscCode}
        placeholder="Bank IFSC code"
        required
      />

      <FormInput
        label="Branch"
        name="Branch"
        value={formData.Branch}
        onChange={handleChange}
        error={errors.Branch}
        placeholder="Bank branch name"
        required
      />
    </>
  );

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

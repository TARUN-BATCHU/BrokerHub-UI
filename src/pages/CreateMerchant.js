import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { merchantAPI } from '../services/api';
import './Auth.css';

const CreateMerchant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: 'TRADER',
    gstNumber: '',
    firmName: '',
    ownerName: '',
    city: '',
    area: '',
    pincode: '',
    email: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    phoneNumbers: ['', ''],
    brokerageRate: '',
    shopNumber: '',
    byProduct: ''
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
    
    if (apiError) {
      setApiError('');
    }
  };

  const handlePhoneChange = (index, value) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = value;
    setFormData(prev => ({
      ...prev,
      phoneNumbers: newPhoneNumbers
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.gstNumber.trim()) {
      newErrors.gstNumber = 'GST Number is required';
    }

    if (!formData.firmName.trim()) {
      newErrors.firmName = 'Firm Name is required';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner Name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank Name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account Number is required';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.phoneNumbers[0].trim()) {
      newErrors.phoneNumber1 = 'Primary phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumbers[0])) {
      newErrors.phoneNumber1 = 'Phone number must be 10 digits';
    }

    if (!formData.brokerageRate) {
      newErrors.brokerageRate = 'Brokerage Rate is required';
    } else if (isNaN(formData.brokerageRate) || formData.brokerageRate <= 0) {
      newErrors.brokerageRate = 'Brokerage Rate must be a positive number';
    }

    if (!formData.byProduct.trim()) {
      newErrors.byProduct = 'Product is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Filter out empty phone numbers
      const phoneNumbers = formData.phoneNumbers.filter(phone => phone.trim() !== '');
      
      const merchantData = {
        ...formData,
        phoneNumbers,
        brokerageRate: parseFloat(formData.brokerageRate)
      };

      await merchantAPI.createUser(merchantData);
      
      navigate('/dashboard', { 
        state: { 
          message: 'Merchant created successfully!' 
        }
      });
    } catch (error) {
      console.error('Create merchant error:', error);
      if (error.status === 409) { // ALREADY_REPORTED
        setApiError('Merchant with this GST number or email already exists.');
      } else {
        setApiError(error.message || 'Failed to create merchant. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1>Create New Merchant</h1>
          <p>Add a new miller or trader to your network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">User Type *</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="TRADER">Trader</option>
              <option value="MILLER">Miller</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              error={errors.gstNumber}
              placeholder="GST123456789"
              required
            />

            <FormInput
              label="Firm Name"
              name="firmName"
              value={formData.firmName}
              onChange={handleChange}
              error={errors.firmName}
              placeholder="Company Name"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Owner Name"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              error={errors.ownerName}
              placeholder="Owner Full Name"
              required
            />

            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="email@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="City"
              required
            />

            <FormInput
              label="Area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              error={errors.area}
              placeholder="Area/Locality"
              required
            />

            <FormInput
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="123456"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Primary Phone"
              name="phoneNumber1"
              value={formData.phoneNumbers[0]}
              onChange={(e) => handlePhoneChange(0, e.target.value)}
              error={errors.phoneNumber1}
              placeholder="9876543210"
              required
            />

            <FormInput
              label="Secondary Phone"
              name="phoneNumber2"
              value={formData.phoneNumbers[1]}
              onChange={(e) => handlePhoneChange(1, e.target.value)}
              placeholder="9876543211 (Optional)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Shop Number"
              name="shopNumber"
              value={formData.shopNumber}
              onChange={handleChange}
              placeholder="Shop/Unit Number"
            />

            <FormInput
              label="Brokerage Rate (%)"
              type="number"
              name="brokerageRate"
              value={formData.brokerageRate}
              onChange={handleChange}
              error={errors.brokerageRate}
              placeholder="10"
              required
            />
          </div>

          <FormInput
            label="Primary Product"
            name="byProduct"
            value={formData.byProduct}
            onChange={handleChange}
            error={errors.byProduct}
            placeholder="e.g., Basmati Rice, Channa Dal"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              error={errors.bankName}
              placeholder="Bank Name"
              required
            />

            <FormInput
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              error={errors.branch}
              placeholder="Branch Name"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
              placeholder="Account Number"
              required
            />

            <FormInput
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              error={errors.ifscCode}
              placeholder="IFSC Code"
              required
            />
          </div>

          <div className="auth-actions step-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            
            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary"
            >
              Create Merchant
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMerchant;

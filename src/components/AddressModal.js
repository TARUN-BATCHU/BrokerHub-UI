import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { addressAPI } from '../services/api';
import FormInput from './FormInput';
import LoadingButton from './LoadingButton';

const AddressModal = ({ 
  isOpen, 
  onClose, 
  address = null, 
  onSuccess 
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    city: '',
    area: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (address) {
      // Edit mode
      setFormData({
        city: address.city || '',
        area: address.area || '',
        pincode: address.pincode || ''
      });
    } else {
      // Create mode
      setFormData({
        city: '',
        area: '',
        pincode: ''
      });
    }
    setErrors({});
    setApiError('');
  }, [address, isOpen]);

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

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const addressData = {
        city: formData.city.trim(),
        area: formData.area.trim(),
        pincode: formData.pincode.trim()
      };

      if (address) {
        // Update existing address
        addressData.addressId = address.addressId;
        await addressAPI.updateAddress(addressData);
      } else {
        // Create new address
        await addressAPI.createAddress(addressData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Address operation error:', error);
      
      if (error.status === 409) {
        setApiError('Address already exists with this city, area, and pincode combination.');
      } else if (error.status === 400) {
        setApiError('City and area are mandatory fields.');
      } else {
        setApiError(error.message || `Failed to ${address ? 'update' : 'create'} address. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏠
            </div>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                {address ? 'Edit Address' : 'Add New Address'}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                {address ? 'Update address information' : 'Create a new address entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.errorBg;
              e.currentTarget.style.color = theme.error;
              e.currentTarget.style.borderColor = theme.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.textSecondary;
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div style={{
              backgroundColor: theme.errorBg,
              border: `1px solid ${theme.errorBorder}`,
              color: theme.error,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {apiError}
            </div>
          )}

          <FormInput
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Enter city name"
            required
          />

          <FormInput
            label="Area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            error={errors.area}
            placeholder="Enter area/locality name"
            required
          />

          <FormInput
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            error={errors.pincode}
            placeholder="Enter 6-digit pincode"
            required
          />

          <div style={{ 
            marginTop: '24px', 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.cardBackground,
                color: theme.textPrimary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: theme.buttonPrimary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {address ? 'Update Address' : 'Create Address'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { productAPI } from '../services/api';
import FormInput from './FormInput';
import LoadingButton from './LoadingButton';

const ProductAddModal = ({ isOpen, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    productName: '',
    quality: '',
    quantity: '',
    price: '',
    productBrokerage: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.quality.trim()) newErrors.quality = 'Quality is required';
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be positive';
    }
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be positive';
    }
    if (!formData.productBrokerage) {
      newErrors.productBrokerage = 'Product brokerage is required';
    } else if (isNaN(formData.productBrokerage) || parseFloat(formData.productBrokerage) < 0) {
      newErrors.productBrokerage = 'Product brokerage must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const productData = {
        productName: formData.productName.trim(),
        quality: formData.quality.trim(),
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        productBrokerage: parseFloat(formData.productBrokerage)
      };

      const response = await productAPI.createProduct(productData);
      
      if (response.status === 'success') {
        onSuccess && onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Product creation error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        setApiError(error.errors.join(', '));
      } else if (error.message) {
        setApiError(error.message);
      } else {
        setApiError('Failed to create product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ productName: '', quality: '', quantity: '', price: '', productBrokerage: '' });
    setErrors({});
    setApiError('');
    onClose();
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
        maxWidth: '600px',
        width: '90%',
        boxShadow: theme.shadowModal,
        border: `1px solid ${theme.border}`
      }}>
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ➕
            </div>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                Add New Product
              </h3>
              <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                Create a new product entry
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            error={errors.productName}
            placeholder="e.g., Rice"
            required
          />

          <FormInput
            label="Quality"
            name="quality"
            value={formData.quality}
            onChange={handleChange}
            error={errors.quality}
            placeholder="e.g., Premium"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Quantity (kg)"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              placeholder="1000"
              required
            />

            <FormInput
              label="Price (₹)"
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="5000"
              required
            />
          </div>

          <FormInput
            label="Product Brokerage (₹)"
            type="number"
            step="0.01"
            name="productBrokerage"
            value={formData.productBrokerage}
            onChange={handleChange}
            error={errors.productBrokerage}
            placeholder="100"
            required
          />

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
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
                opacity: loading ? 0.6 : 1
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
                backgroundColor: theme.success,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Create Product
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAddModal;

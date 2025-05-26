import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { productAPI } from '../services/api';
import FormInput from './FormInput';
import LoadingButton from './LoadingButton';

const ProductEditModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onSuccess 
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    productName: '',
    productBrokerage: '',
    quantity: '',
    price: '',
    quality: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        productName: product.productName || '',
        productBrokerage: product.productBrokerage || '',
        quantity: product.quantity || '',
        price: product.price || '',
        quality: product.quality || ''
      });
    }
    setErrors({});
    setApiError('');
  }, [product, isOpen]);

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

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.productBrokerage) {
      newErrors.productBrokerage = 'Product brokerage is required';
    } else if (isNaN(formData.productBrokerage) || parseFloat(formData.productBrokerage) < 0) {
      newErrors.productBrokerage = 'Product brokerage must be a valid positive number';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a valid positive number';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.quality.trim()) {
      newErrors.quality = 'Quality is required';
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
      const productData = {
        productId: product.productId,
        productName: formData.productName.trim(),
        productBrokerage: parseFloat(formData.productBrokerage),
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        quality: formData.quality.trim()
      };

      await productAPI.updateProduct(productData);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Product update error:', error);
      
      if (error.status === 404) {
        setApiError('Product not found. It may have been deleted.');
      } else if (error.status === 500) {
        setApiError('Server error occurred. Please try again later.');
      } else {
        setApiError(error.message || 'Failed to update product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

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
              🌾
            </div>
            <div>
              <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
                Edit Product
              </h3>
              <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: '14px' }}>
                Update product information
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
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            error={errors.productName}
            placeholder="Enter product name"
            required
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <FormInput
              label="Product Brokerage (%)"
              type="number"
              name="productBrokerage"
              value={formData.productBrokerage}
              onChange={handleChange}
              error={errors.productBrokerage}
              placeholder="10"
              required
            />

            <FormInput
              label="Quantity (kg)"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              placeholder="100"
              required
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <FormInput
              label="Price (₹)"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="1500"
              required
            />

            <FormInput
              label="Quality"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              error={errors.quality}
              placeholder="first quality"
              required
            />
          </div>

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
                backgroundColor: theme.warning,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Update Product
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;

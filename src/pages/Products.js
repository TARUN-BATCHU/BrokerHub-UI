import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { productAPI } from '../services/api';
import ProductAddModal from '../components/ProductAddModal';
import ProductEditModal from '../components/ProductEditModal';
import ProductBulkUpload from '../components/ProductBulkUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

const Products = () => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productAPI.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      await productAPI.deleteProduct(productToDelete.productId);
      await loadProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.quality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProductCard = ({ product }) => (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: theme.shadowCard,
      border: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            color: theme.textPrimary, 
            fontSize: '18px', 
            fontWeight: '600' 
          }}>
            {product.productName}
          </h3>
          <p style={{ 
            margin: 0, 
            color: theme.textSecondary, 
            fontSize: '14px' 
          }}>
            Quality: {product.quality}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(product)}
            style={{
              padding: '6px 12px',
              border: `1px solid ${theme.warning}`,
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: theme.warning,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.warning;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.warning;
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(product)}
            style={{
              padding: '6px 12px',
              border: `1px solid ${theme.error}`,
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: theme.error,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.error;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.error;
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '12px 0',
        borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div>
          <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
            Quantity
          </p>
          <p style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
            {product.quantity} kg
          </p>
        </div>
        <div>
          <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
            Price
          </p>
          <p style={{ margin: 0, color: theme.textPrimary, fontSize: '16px', fontWeight: '600' }}>
            ₹{product.price}
          </p>
        </div>
      </div>

      <div>
        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
          Brokerage
        </p>
        <p style={{ margin: 0, color: theme.success, fontSize: '14px', fontWeight: '500' }}>
          {product.productBrokerage}%
        </p>
      </div>

      {product.broker && (
        <div style={{
          backgroundColor: theme.backgroundSecondary,
          borderRadius: '6px',
          padding: '8px',
          fontSize: '12px',
          color: theme.textSecondary
        }}>
          Broker: {product.broker.brokerName} ({product.broker.brokerageFirmName})
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: theme.shadowCard,
        marginBottom: '24px',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 8px 0',
              color: theme.textPrimary,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              Products Management
            </h2>
            <p style={{
              margin: 0,
              color: theme.textSecondary,
              fontSize: '16px'
            }}>
              Manage your product inventory and bulk upload
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: theme.success,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ➕ Add Product
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: theme.buttonPrimary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📊 Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: theme.shadowCard,
        marginBottom: '24px',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary,
              color: theme.textPrimary,
              fontSize: '14px'
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
              Total Products
            </p>
            <p style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '600' }}>
              {products.length}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
              Filtered
            </p>
            <p style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '600' }}>
              {filteredProducts.length}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
              Categories
            </p>
            <p style={{ margin: 0, color: theme.textPrimary, fontSize: '20px', fontWeight: '600' }}>
              {new Set(products.map(p => p.productName)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: theme.errorBg,
          border: `1px solid ${theme.errorBorder}`,
          color: theme.error,
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: theme.shadowCard,
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ margin: '0 0 8px 0', color: theme.textPrimary }}>
            {searchTerm ? 'No products found' : 'No products available'}
          </h3>
          <p style={{ margin: 0, color: theme.textSecondary }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Start by uploading products using the bulk upload feature'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadProducts}
      />

      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={loadProducts}
      />

      <ProductBulkUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={loadProducts}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        type="danger"
      />
    </div>
  );
};

export default Products;
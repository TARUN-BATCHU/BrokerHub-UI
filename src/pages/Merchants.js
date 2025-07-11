import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MerchantDetailModal from '../components/MerchantDetailModal';

const Merchants = () => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('firmName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, [currentPage, sortBy, sortOrder]);

  const loadMerchants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userAPI.getUserSummary(currentPage, pageSize, `${sortBy},${sortOrder}`);
      setMerchants(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error loading merchants:', error);
      setError(error.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(0);
  };

  const filteredMerchants = merchants.filter(merchant =>
    merchant.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      style={{
        background: 'none',
        border: 'none',
        color: theme.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
        fontWeight: '600',
        padding: '4px 0'
      }}
    >
      {children}
      {sortBy === field && (
        <span style={{ fontSize: '12px' }}>
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  const handleMerchantClick = (merchantId) => {
    setSelectedMerchantId(merchantId);
    setShowDetailModal(true);
  };

  const MerchantCard = ({ merchant }) => (
    <div 
      onClick={() => handleMerchantClick(merchant.userId)}
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: theme.shadowCard,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = theme.shadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.shadowCard;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            color: theme.textPrimary, 
            fontSize: '18px', 
            fontWeight: '600' 
          }}>
            {merchant.firmName}
          </h3>
          <p style={{ 
            margin: 0, 
            color: theme.textSecondary, 
            fontSize: '14px' 
          }}>
            📍 {merchant.city}
          </p>
        </div>
        <div style={{
          backgroundColor: merchant.totalPayableBrokerage > 0 ? theme.successBg : theme.warningBg,
          color: merchant.totalPayableBrokerage > 0 ? theme.success : theme.warning,
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          ₹{merchant.totalPayableBrokerage.toFixed(2)}
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
            Bags Sold
          </p>
          <p style={{ margin: 0, color: theme.success, fontSize: '16px', fontWeight: '600' }}>
            {merchant.totalBagsSold}
          </p>
        </div>
        <div>
          <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
            Bags Bought
          </p>
          <p style={{ margin: 0, color: theme.buttonPrimary, fontSize: '16px', fontWeight: '600' }}>
            {merchant.totalBagsBought}
          </p>
        </div>
      </div>

      <div>
        <p style={{ margin: '0 0 4px 0', color: theme.textSecondary, fontSize: '12px' }}>
          Brokerage per Bag
        </p>
        <p style={{ margin: 0, color: theme.textPrimary, fontSize: '14px', fontWeight: '500' }}>
          ₹{merchant.brokeragePerBag.toFixed(2)}
        </p>
      </div>
    </div>
  );

  const Pagination = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} merchants
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          style={{
            padding: '8px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            backgroundColor: theme.cardBackground,
            color: theme.textPrimary,
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 0 ? 0.5 : 1,
            fontSize: '14px'
          }}
        >
          Previous
        </button>
        <span style={{
          padding: '8px 12px',
          color: theme.textPrimary,
          fontSize: '14px'
        }}>
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          style={{
            padding: '8px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            backgroundColor: theme.cardBackground,
            color: theme.textPrimary,
            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
            fontSize: '14px'
          }}
        >
          Next
        </button>
      </div>
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
        <div>
          <h2 style={{
            margin: '0 0 8px 0',
            color: theme.textPrimary,
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Merchants Summary
          </h2>
          <p style={{
            margin: 0,
            color: theme.textSecondary,
            fontSize: '16px'
          }}>
            Overview of merchant trading activity and brokerage
          </p>
        </div>
      </div>

      {/* Search and Controls */}
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
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search merchants or cities..."
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <SortButton field="firmName">Firm Name</SortButton>
            <SortButton field="city">City</SortButton>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <SortButton field="totalPayableBrokerage">Brokerage</SortButton>
            <SortButton field="totalBagsSold">Bags Sold</SortButton>
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

      {/* Merchants Grid */}
      {filteredMerchants.length === 0 ? (
        <div style={{
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: theme.shadowCard,
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
          <h3 style={{ margin: '0 0 8px 0', color: theme.textPrimary }}>
            {searchTerm ? 'No merchants found' : 'No merchants available'}
          </h3>
          <p style={{ margin: 0, color: theme.textSecondary }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Merchant data will appear here once available'
            }
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredMerchants.map((merchant, index) => (
              <MerchantCard key={merchant.userId || `${merchant.firmName}-${index}`} merchant={merchant} />
            ))}
          </div>
          <Pagination />
        </>
      )}

      {/* Merchant Detail Modal */}
      <MerchantDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMerchantId(null);
        }}
        merchantId={selectedMerchantId}
      />
    </div>
  );
};

export default Merchants;
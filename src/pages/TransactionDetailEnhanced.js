import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI, userAPI, productAPI, financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/ledger.css';

const TransactionDetailEnhanced = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mode, transactionNumber, date } = location.state || {};
  
  // Refs for keyboard navigation
  const sellerInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const brokerageInputRef = useRef(null);
  const buyerInputRefs = useRef([]);
  const productInputRefs = useRef([]);
  const quantityInputRefs = useRef([]);
  const rateInputRefs = useRef([]);
  const costInputRefs = useRef([]);

  const initialDate = date || new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    brokerId: parseInt(localStorage.getItem('brokerId')),
    financialYearId: null,
    sellerBrokerage: '',
    brokerage: 0,
    fromSeller: '',
    date: initialDate,
    sellerProducts: [{ productId: '', productCost: '' }],
    ledgerRecordDTOList: [
      {
        buyerName: '',
        buyerCity: '',
        productId: '',
        quantity: '',
        brokerage: '',
        productCost: ''
      }
    ]
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Search states
  const [sellerSearch, setSellerSearch] = useState('');
  const [buyerSearches, setBuyerSearches] = useState({});
  const [productSearches, setProductSearches] = useState({});
  
  // Dropdown visibility
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showBuyerDropdowns, setShowBuyerDropdowns] = useState({});
  const [showProductDropdowns, setShowProductDropdowns] = useState({});
  const [nextTransactionNumber, setNextTransactionNumber] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

  useEffect(() => {
    loadAllData();
    loadCurrentFinancialYear();
    loadNextTransactionNumber();
    if (mode === 'edit' && transactionNumber) {
      fetchTransactionData(transactionNumber);
    }
  }, [mode, transactionNumber]);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Mark as changed when form data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        // Let default tab behavior work
        return;
      }
      
      // Arrow keys for dropdown navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Handle dropdown navigation
        return;
      }
      
      // Enter key to add new record
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        addNewRecord();
        return;
      }
      
      // Ctrl+S to save
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        handleSave();
        return;
      }
      
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setShowSellerDropdown(false);
        setShowBuyerDropdowns({});
        setShowProductDropdowns({});
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadCurrentFinancialYear = async () => {
    try {
      const currentFY = await financialYearAPI.getCurrentFinancialYear();
      if (currentFY && currentFY.yearId) {
        setFormData(prev => ({ ...prev, financialYearId: currentFY.yearId }));
      }
    } catch (error) {
      console.log('No current financial year set or error loading:', error);
    }
  };

  const loadNextTransactionNumber = async () => {
    try {
      const nextTxnNum = await ledgerDetailsAPI.getNextTransactionNumber();
      setNextTransactionNumber(nextTxnNum);
    } catch (error) {
      console.log('Error loading next transaction number:', error);
      setNextTransactionNumber('Auto-Generated');
    }
  };

  const fetchSellers = async () => {
    try {
      const data = await userAPI.getFirmNamesIdsAndCities();
      setSellers(data || []);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const fetchBuyers = async () => {
    try {
      const data = await userAPI.getFirmNamesIdsAndCities();
      setBuyers(data || []);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getProductNamesAndQualitiesAndQuantitesWithId();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const loadAllData = async () => {
    setLoadingData(true);
    await Promise.all([fetchSellers(), fetchBuyers(), fetchProducts()]);
    setLoadingData(false);
  };

  const fetchTransactionData = async (txnNumber) => {
    // Implementation for edit mode
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecordChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ledgerRecordDTOList: prev.ledgerRecordDTOList.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    }));
  };

  const addNewRecord = () => {
    setFormData(prev => ({
      ...prev,
      ledgerRecordDTOList: [
        ...prev.ledgerRecordDTOList,
        {
          buyerName: '',
          buyerCity: '',
          productId: '',
          quantity: '',
          brokerage: '',
          productCost: ''
        }
      ]
    }));
    
    // Focus on new record's first input after state update
    setTimeout(() => {
      const newIndex = formData.ledgerRecordDTOList.length;
      buyerInputRefs.current[newIndex]?.focus();
    }, 100);
  };

  const removeRecord = (index) => {
    if (formData.ledgerRecordDTOList.length > 1) {
      setFormData(prev => ({
        ...prev,
        ledgerRecordDTOList: prev.ledgerRecordDTOList.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateRowTotal = (record) => {
    const quantity = parseFloat(record.quantity) || 0;
    const brokerage = parseFloat(record.brokerage) || 0;
    return quantity * brokerage;
  };

  const calculateTotalBuyerBrokerage = () => {
    return formData.ledgerRecordDTOList.reduce((sum, record) => sum + calculateRowTotal(record), 0);
  };

  const calculateTotalBags = () => {
    return formData.ledgerRecordDTOList.reduce((sum, record) => sum + (parseFloat(record.quantity) || 0), 0);
  };

  const calculateTotalSellerBrokerage = () => {
    const sellerBrokeragePerBag = parseFloat(formData.sellerBrokerage) || 0;
    const totalBags = calculateTotalBags();
    return sellerBrokeragePerBag * totalBags;
  };

  const calculateTotalBrokerage = () => {
    const totalSellerBrokerage = calculateTotalSellerBrokerage();
    const buyerBrokerage = calculateTotalBuyerBrokerage();
    return totalSellerBrokerage + buyerBrokerage;
  };

  const handleSave = async () => {
    if (!formData.fromSeller) {
      setError('Please select a seller');
      return;
    }
    
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    
    if (formData.ledgerRecordDTOList.some(record => 
      !record.buyerName || !record.productId || !record.quantity || !record.productCost
    )) {
      setError('Please fill all required fields in transaction records');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const saveData = {
        ...formData,
        brokerage: calculateTotalBrokerage(),
        ledgerRecordDTOList: formData.ledgerRecordDTOList.map(record => {
          const { buyerCity, ...recordWithoutCity } = record;
          return recordWithoutCity;
        })
      };
      
      if (mode === 'create') {
        const response = await ledgerDetailsAPI.createLedgerDetails(saveData);
        const createdTransactionNumber = response; // Assuming API returns the transaction number
        setNextTransactionNumber(createdTransactionNumber);
        setSuccess(`Transaction #${createdTransactionNumber} created successfully!`);
        setHasUnsavedChanges(false);
        // Reset form for next entry
        setTimeout(() => {
          handleNext();
        }, 1000);
      } else {
        await ledgerDetailsAPI.updateLedgerDetailByTransactionNumber(
          transactionNumber,
          localStorage.getItem('brokerId'),
          formData.financialYearId,
          saveData
        );
        setSuccess('Transaction updated successfully!');
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save transaction');
      console.error('Error saving transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const newDate = date || new Date().toISOString().split('T')[0];
    
    setFormData({
      brokerId: parseInt(localStorage.getItem('brokerId')),
      financialYearId: formData.financialYearId,
      sellerBrokerage: formData.sellerBrokerage, // Keep previous brokerage
      brokerage: 0,
      fromSeller: formData.fromSeller, // Keep previous seller
      date: newDate,
      sellerProducts: [{ productId: '', productCost: '' }],
      ledgerRecordDTOList: [
        {
          buyerName: '',
          buyerCity: '',
          productId: '',
          quantity: '',
          brokerage: '',
          productCost: ''
        }
      ]
    });
    setSuccess('');
    setError('');
    setHasUnsavedChanges(false);
    
    // Set next transaction number
    if (nextTransactionNumber && typeof nextTransactionNumber === 'number') {
      setNextTransactionNumber(nextTransactionNumber + 1);
    }
    
    // Focus on first buyer input for next entry
    setTimeout(() => {
      buyerInputRefs.current[0]?.focus();
    }, 100);
  };

  const getFilteredSellers = () => {
    if (!sellerSearch) return sellers;
    return sellers.filter(seller => 
      seller.firmName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      seller.city.toLowerCase().includes(sellerSearch.toLowerCase())
    );
  };

  const getFilteredBuyers = (searchTerm) => {
    if (!searchTerm) return buyers;
    return buyers.filter(buyer => 
      buyer.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredProducts = (searchTerm) => {
    if (!searchTerm) return products;
    return products.filter(product => {
      const [description] = Object.entries(product)[0];
      return description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  if (loadingData) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme.background,
        color: theme.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '14px', color: theme.textSecondary }}>
            Preparing transaction form
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      padding: '0'
    }}>
      {/* Back Button */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 1001
      }}>
        <button
          onClick={() => navigate('/daily-ledger', { state: { date } })}
          style={{
            backgroundColor: theme.cardBackground,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Header */}
      <div style={{ 
        backgroundColor: theme.cardBackground,
        borderBottom: `1px solid ${theme.border}`,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '600',
            color: theme.textPrimary 
          }}>
            {mode === 'create' ? '📝 New Transaction' : '✏️ Edit Transaction'}
          </h1>
          <div style={{ 
            fontSize: '13px', 
            color: theme.textSecondary,
            marginTop: '4px'
          }}>
            Ctrl+Enter: Add Record | Ctrl+S: Save | Tab: Navigate
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ 
          backgroundColor: theme.errorBg || '#fee',
          color: theme.errorText || '#c33',
          padding: '12px 20px',
          borderBottom: `1px solid ${theme.errorBorder || '#fcc'}`
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ 
          backgroundColor: theme.successBg || '#efe',
          color: theme.successText || '#363',
          padding: '12px 20px',
          borderBottom: `1px solid ${theme.successBorder || '#cfc'}`
        }}>
          ✅ {success}
        </div>
      )}

      {/* Main Form */}
      <div style={{ 
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Seller Section - 3 Rows */}
        <div style={{ 
          backgroundColor: theme.cardBackground,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          marginBottom: '24px'
        }}>
          {/* Row 1: Transaction Number, Seller Details, Date */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '15px',
                fontWeight: '500',
                color: theme.textPrimary
              }}>
                Transaction #:
              </span>
              <span style={{
                fontSize: '16px',
                color: theme.primary,
                fontWeight: '600'
              }}>
                {nextTransactionNumber || 'Auto'}
              </span>
            </div>
            
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme.textPrimary
            }}>
              Seller Details
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ 
                fontSize: '15px',
                fontWeight: '500',
                color: theme.textPrimary
              }}>
                Date *:
              </label>
              <input
                ref={dateInputRef}
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: theme.inputBackground || theme.cardBackground,
                  color: theme.textPrimary
                }}
              />
            </div>
          </div>

          {/* Row 2: Seller Name, City, Brokerage */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ position: 'relative' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '15px',
                fontWeight: '500',
                color: theme.textPrimary 
              }}>
                Seller Name *
              </label>
              <input
                ref={sellerInputRef}
                type="text"
                placeholder="Type to search seller..."
                value={sellerSearch}
                onChange={(e) => {
                  setSellerSearch(e.target.value);
                  setShowSellerDropdown(true);
                }}
                onFocus={() => setShowSellerDropdown(true)}
                onBlur={() => setTimeout(() => setShowSellerDropdown(false), 200)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: theme.inputBackground || theme.cardBackground,
                  color: theme.textPrimary
                }}
              />
              {showSellerDropdown && getFilteredSellers().length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: theme.cardBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {getFilteredSellers().map(seller => (
                    <div
                      key={seller.id}
                      onClick={() => {
                        handleInputChange('fromSeller', seller.id);
                        setSellerSearch(seller.firmName);
                        setShowSellerDropdown(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${theme.borderLight}`,
                        color: theme.textPrimary,
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBg}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '500' }}>{seller.firmName}</div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>{seller.city}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '15px',
                fontWeight: '500',
                color: theme.textPrimary 
              }}>
                City
              </label>
              <div style={{
                padding: '10px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                fontSize: '15px',
                backgroundColor: theme.background,
                color: theme.textSecondary
              }}>
                {sellers.find(s => s.id === parseInt(formData.fromSeller))?.city || '-'}
              </div>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '15px',
                fontWeight: '500',
                color: theme.textPrimary 
              }}>
                Seller Brokerage (₹/bag)
              </label>
              <input
                ref={brokerageInputRef}
                type="number"
                value={formData.sellerBrokerage}
                onChange={(e) => handleInputChange('sellerBrokerage', e.target.value)}
                placeholder="e.g., 2"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: theme.inputBackground || theme.cardBackground,
                  color: theme.textPrimary
                }}
              />
            </div>
          </div>

          {/* Row 3: Products */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ 
              fontSize: '15px',
              fontWeight: '500',
              color: theme.textPrimary,
              minWidth: '80px'
            }}>
              Products:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
              {formData.sellerProducts.map((product, index) => (
                <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center', minWidth: '300px' }}>
                  <select
                    value={product.productId}
                    onChange={(e) => {
                      const newProducts = [...formData.sellerProducts];
                      newProducts[index].productId = e.target.value;
                      setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
                    }}
                    style={{
                      flex: 2,
                      padding: '6px 8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: theme.inputBackground || theme.cardBackground,
                      color: theme.textPrimary
                    }}
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => {
                      const [description, id] = Object.entries(product)[0];
                      return (
                        <option key={id} value={id}>
                          {description}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="number"
                    placeholder="Cost"
                    value={product.productCost}
                    onChange={(e) => {
                      const newProducts = [...formData.sellerProducts];
                      newProducts[index].productCost = e.target.value;
                      setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: theme.inputBackground || theme.cardBackground,
                      color: theme.textPrimary,
                      width: '80px'
                    }}
                  />
                  {formData.sellerProducts.length > 1 && (
                    <button
                      onClick={() => {
                        const newProducts = formData.sellerProducts.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    sellerProducts: [...prev.sellerProducts, { productId: '', productCost: '' }]
                  }));
                }}
                style={{
                  backgroundColor: theme.success || '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Buyers Table */}
        <div style={{ 
          backgroundColor: theme.cardBackground,
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.textPrimary }}>
              🛒 Transaction Records
            </h3>
            <button
              onClick={addNewRecord}
              style={{
                backgroundColor: theme.success || '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              + Add Record (Ctrl+Enter)
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: theme.background }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600' }}>S.No</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', minWidth: '200px' }}>Buyer Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '120px' }}>City</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', minWidth: '180px' }}>Product *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '80px' }}>Qty *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '80px' }}>Brokerage</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '100px' }}>Rate *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.ledgerRecordDTOList.map((record, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary, textAlign: 'center' }}>
                      {index + 1}
                    </td>
                    
                    {/* Buyer Name */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'relative', minWidth: '200px' }}>
                      <input
                        ref={el => buyerInputRefs.current[index] = el}
                        type="text"
                        placeholder="Search buyer..."
                        value={buyerSearches[index] || ''}
                        onChange={(e) => {
                          setBuyerSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }));
                        }}
                        onFocus={() => setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }))}
                        onBlur={() => setTimeout(() => setShowBuyerDropdowns(prev => ({ ...prev, [index]: false })), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            // Handle dropdown navigation
                          } else if (e.key === 'Enter' && showBuyerDropdowns[index]) {
                            e.preventDefault();
                            const filtered = getFilteredBuyers(buyerSearches[index]);
                            if (filtered.length > 0) {
                              const buyer = filtered[0];
                              handleRecordChange(index, 'buyerName', buyer.firmName);
                              handleRecordChange(index, 'buyerCity', buyer.city);
                              setBuyerSearches(prev => ({ ...prev, [index]: buyer.firmName }));
                              setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
                              setTimeout(() => productInputRefs.current[index]?.focus(), 100);
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                      {showBuyerDropdowns[index] && getFilteredBuyers(buyerSearches[index]).length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {getFilteredBuyers(buyerSearches[index]).map(buyer => (
                            <div
                              key={buyer.id}
                              onClick={() => {
                                handleRecordChange(index, 'buyerName', buyer.firmName);
                                handleRecordChange(index, 'buyerCity', buyer.city);
                                setBuyerSearches(prev => ({ ...prev, [index]: buyer.firmName }));
                                setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
                                // Focus next input
                                setTimeout(() => productInputRefs.current[index]?.focus(), 100);
                              }}
                              style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${theme.borderLight}`,
                                color: theme.textPrimary,
                                fontSize: '12px'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBg}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <div style={{ fontWeight: '500' }}>{buyer.firmName}</div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>{buyer.city}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    
                    {/* City */}
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textSecondary, fontSize: '14px' }}>
                      {record.buyerCity || '-'}
                    </td>
                    
                    {/* Product */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'relative', minWidth: '200px' }}>
                      <input
                        ref={el => productInputRefs.current[index] = el}
                        type="text"
                        placeholder="Search product..."
                        value={productSearches[index] || ''}
                        onChange={(e) => {
                          setProductSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                        }}
                        onFocus={() => setShowProductDropdowns(prev => ({ ...prev, [index]: true }))}
                        onBlur={() => setTimeout(() => setShowProductDropdowns(prev => ({ ...prev, [index]: false })), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            // Handle dropdown navigation
                          } else if (e.key === 'Enter' && showProductDropdowns[index]) {
                            e.preventDefault();
                            const filtered = getFilteredProducts(productSearches[index]);
                            if (filtered.length > 0) {
                              const product = filtered[0];
                              const [description, id] = Object.entries(product)[0];
                              handleRecordChange(index, 'productId', id);
                              setProductSearches(prev => ({ ...prev, [index]: description }));
                              setShowProductDropdowns(prev => ({ ...prev, [index]: false }));
                              setTimeout(() => quantityInputRefs.current[index]?.focus(), 100);
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                      {showProductDropdowns[index] && getFilteredProducts(productSearches[index]).length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {getFilteredProducts(productSearches[index]).map((product, productIndex) => {
                            const [description, id] = Object.entries(product)[0];
                            return (
                              <div
                                key={id}
                                onClick={() => {
                                  handleRecordChange(index, 'productId', id);
                                  setProductSearches(prev => ({ ...prev, [index]: description }));
                                  setShowProductDropdowns(prev => ({ ...prev, [index]: false }));
                                  // Focus next input
                                  setTimeout(() => quantityInputRefs.current[index]?.focus(), 100);
                                }}
                                style={{
                                  padding: '8px',
                                  cursor: 'pointer',
                                  borderBottom: `1px solid ${theme.borderLight}`,
                                  color: theme.textPrimary,
                                  fontSize: '12px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBg}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              >
                                {description}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    
                    {/* Quantity */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}` }}>
                      <input
                        ref={el => quantityInputRefs.current[index] = el}
                        type="number"
                        value={record.quantity}
                        onChange={(e) => handleRecordChange(index, 'quantity', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            rateInputRefs.current[index]?.focus();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                    </td>
                    
                    {/* Brokerage */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}` }}>
                      <input
                        type="number"
                        value={record.brokerage}
                        onChange={(e) => handleRecordChange(index, 'brokerage', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                    </td>
                    
                    {/* Rate */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}` }}>
                      <input
                        ref={el => rateInputRefs.current[index] = el}
                        type="number"
                        value={record.productCost}
                        onChange={(e) => handleRecordChange(index, 'productCost', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (index === formData.ledgerRecordDTOList.length - 1) {
                              addNewRecord();
                            } else {
                              buyerInputRefs.current[index + 1]?.focus();
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                    </td>
                    
                    {/* Total */}
                    <td style={{ 
                      padding: '8px', 
                      border: `1px solid ${theme.border}`, 
                      color: theme.primary,
                      fontWeight: '600',
                      fontSize: '14px',
                      textAlign: 'right'
                    }}>
                      ₹{calculateRowTotal(record).toFixed(2)}
                    </td>
                    
                    {/* Action */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                      {formData.ledgerRecordDTOList.length > 1 && (
                        <button
                          onClick={() => removeRecord(index)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div style={{ 
          marginTop: '20px',
          backgroundColor: theme.cardBackground,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '4px' }}>Total Bags</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: theme.success }}>{calculateTotalBags()}</div>
            </div>
            
            <div style={{ fontSize: '24px', color: theme.textSecondary, fontWeight: 'bold' }}>|</div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '4px' }}>Seller Brokerage</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: theme.info }}>₹{calculateTotalSellerBrokerage().toFixed(2)}</div>
            </div>
            
            <div style={{ fontSize: '28px', color: theme.primary, fontWeight: 'bold' }}>+</div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '4px' }}>Buyer Brokerage</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: theme.primary }}>₹{calculateTotalBuyerBrokerage().toFixed(2)}</div>
            </div>
            
            <div style={{ fontSize: '28px', color: theme.warning, fontWeight: 'bold' }}>=</div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '4px' }}>Total Brokerage</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.warning }}>₹{calculateTotalBrokerage().toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: theme.primary || '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: saving ? 0.6 : 1,
              minWidth: '120px'
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save (Ctrl+S)'}
          </button>

          {mode === 'create' && (
            <button
              onClick={handleNext}
              style={{
                backgroundColor: theme.success || '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '120px'
              }}
            >
              ➡️ Save & Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailEnhanced;
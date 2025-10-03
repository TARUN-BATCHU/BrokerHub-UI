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

  // Add missing ref for brokerage column
  const brokerageColumnRefs = useRef([]);
  const sellerProductRefs = useRef([]);
  const sellerProductCostRefs = useRef([]);

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
  const [sellerProductSearches, setSellerProductSearches] = useState({});

  // Dropdown visibility
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showBuyerDropdowns, setShowBuyerDropdowns] = useState({});
  const [showProductDropdowns, setShowProductDropdowns] = useState({});
  const [showSellerProductDropdowns, setShowSellerProductDropdowns] = useState({});
  const [nextTransactionNumber, setNextTransactionNumber] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const [activeDropdownType, setActiveDropdownType] = useState(null); // 'seller', 'buyer', 'product', 'sellerProduct'
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  useEffect(() => {
    loadAllData();
    loadCurrentFinancialYear();
    loadNextTransactionNumber();
    if (mode === 'edit' && transactionNumber) {
      fetchTransactionData(transactionNumber);
    }
    // Auto-focus on date input after data loads
    setTimeout(() => {
      dateInputRef.current?.focus();
    }, 500);
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

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Arrow keys for dropdown navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (showSellerDropdown || Object.values(showBuyerDropdowns).some(Boolean) || Object.values(showProductDropdowns).some(Boolean) || Object.values(showSellerProductDropdowns).some(Boolean)) {
          e.preventDefault();
          const direction = e.key === 'ArrowDown' ? 1 : -1;
          
          if (showSellerDropdown) {
            const filtered = getFilteredSellers();
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
            // Auto-scroll to selected item
            setTimeout(() => {
              const dropdown = document.querySelector('[data-dropdown="seller"]');
              const selectedItem = dropdown?.children[newIndex];
              if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 0);
          } else if (activeDropdownType === 'buyer' && activeRowIndex !== null) {
            const filtered = getFilteredBuyers(buyerSearches[activeRowIndex]);
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
            // Auto-scroll to selected item
            setTimeout(() => {
              const dropdown = document.querySelector(`[data-dropdown="buyer-${activeRowIndex}"]`);
              const selectedItem = dropdown?.children[newIndex];
              if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 0);
          } else if (activeDropdownType === 'product' && activeRowIndex !== null) {
            const filtered = getFilteredProducts(productSearches[activeRowIndex]);
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
            // Auto-scroll to selected item
            setTimeout(() => {
              const dropdown = document.querySelector(`[data-dropdown="product-${activeRowIndex}"]`);
              const selectedItem = dropdown?.children[newIndex];
              if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 0);
          } else if (activeDropdownType === 'sellerProduct' && activeRowIndex !== null) {
            const filtered = getFilteredProducts(sellerProductSearches[activeRowIndex]);
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
          }
          return;
        }
      }

      // Enter key handling
      if (e.key === 'Enter') {
        if (e.ctrlKey) {
          e.preventDefault();
          addNewRecord();
          return;
        }
        
        // Handle dropdown selection
        if (showSellerDropdown) {
          e.preventDefault();
          const filtered = getFilteredSellers();
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const seller = filtered[selectedDropdownIndex];
            handleInputChange('fromSeller', seller.id);
            // Auto-populate seller brokerage rate if available
            if (seller.brokerageRate) {
              handleInputChange('sellerBrokerage', seller.brokerageRate);
            }
            setSellerSearch(seller.firmName);
            setShowSellerDropdown(false);
            setSelectedDropdownIndex(-1);
            setTimeout(() => sellerProductRefs.current[0]?.focus(), 100);
          }
          return;
        }
        
        if (activeDropdownType === 'buyer' && activeRowIndex !== null && showBuyerDropdowns[activeRowIndex]) {
          e.preventDefault();
          const filtered = getFilteredBuyers(buyerSearches[activeRowIndex]);
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const buyer = filtered[selectedDropdownIndex];
            handleRecordChange(activeRowIndex, 'buyerName', buyer.firmName);
            handleRecordChange(activeRowIndex, 'buyerCity', buyer.city);
            // Auto-populate buyer brokerage rate if available
            if (buyer.brokerageRate) {
              handleRecordChange(activeRowIndex, 'brokerage', buyer.brokerageRate);
            }
            setBuyerSearches(prev => ({ ...prev, [activeRowIndex]: buyer.firmName }));
            setShowBuyerDropdowns(prev => ({ ...prev, [activeRowIndex]: false }));
            setSelectedDropdownIndex(-1);
            
            // Auto-populate product from seller products if available
            if (formData.sellerProducts[0]?.productId) {
              handleRecordChange(activeRowIndex, 'productId', formData.sellerProducts[0].productId);
              // Auto-populate product cost from seller products
              if (formData.sellerProducts[0]?.productCost) {
                handleRecordChange(activeRowIndex, 'productCost', formData.sellerProducts[0].productCost);
              }
              const selectedProduct = products.find(p => Object.values(p)[0] === formData.sellerProducts[0].productId);
              if (selectedProduct) {
                const [description] = Object.entries(selectedProduct)[0];
                setProductSearches(prev => ({ ...prev, [activeRowIndex]: description }));
              }
              setTimeout(() => quantityInputRefs.current[activeRowIndex]?.focus(), 100);
            } else {
              setTimeout(() => productInputRefs.current[activeRowIndex]?.focus(), 100);
            }
          }
          return;
        }
        
        if (activeDropdownType === 'product' && activeRowIndex !== null && showProductDropdowns[activeRowIndex]) {
          e.preventDefault();
          const filtered = getFilteredProducts(productSearches[activeRowIndex]);
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const product = filtered[selectedDropdownIndex];
            const [description, id] = Object.entries(product)[0];
            handleRecordChange(activeRowIndex, 'productId', id);
            setProductSearches(prev => ({ ...prev, [activeRowIndex]: description }));
            setShowProductDropdowns(prev => ({ ...prev, [activeRowIndex]: false }));
            setSelectedDropdownIndex(-1);
            setTimeout(() => quantityInputRefs.current[activeRowIndex]?.focus(), 100);
          }
          return;
        }
        
        if (activeDropdownType === 'sellerProduct' && activeRowIndex !== null && showSellerProductDropdowns[activeRowIndex]) {
          e.preventDefault();
          const filtered = getFilteredProducts(sellerProductSearches[activeRowIndex]);
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const product = filtered[selectedDropdownIndex];
            const [description, id] = Object.entries(product)[0];
            const newProducts = [...formData.sellerProducts];
            newProducts[activeRowIndex].productId = id;
            setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
            setSellerProductSearches(prev => ({ ...prev, [activeRowIndex]: description }));
            setShowSellerProductDropdowns(prev => ({ ...prev, [activeRowIndex]: false }));
            setSelectedDropdownIndex(-1);
            setTimeout(() => sellerProductCostRefs.current[activeRowIndex]?.focus(), 100);
          }
          return;
        }
      }

      // Ctrl+S to save and next
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        handleSave(true);
        return;
      }

      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setShowSellerDropdown(false);
        setShowBuyerDropdowns({});
        setShowProductDropdowns({});
        setShowSellerProductDropdowns({});
        setSelectedDropdownIndex(-1);
        setActiveDropdownType(null);
        setActiveRowIndex(null);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSellerDropdown, showBuyerDropdowns, showProductDropdowns, showSellerProductDropdowns, selectedDropdownIndex, activeDropdownType, activeRowIndex, buyerSearches, productSearches, sellerProductSearches]);

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

  const handleSave = async (saveAndNext = false) => {
    if (!formData.fromSeller) {
      setError('Please select a seller');
      return false;
    }

    if (!formData.date) {
      setError('Please select a date');
      return false;
    }

    if (formData.ledgerRecordDTOList.some(record => 
      !record.buyerName || !record.productId || !record.quantity || !record.productCost
    )) {
      setError('Please fill all required fields in transaction records');
      return false;
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
        const createdTransactionNumber = response;
        setNextTransactionNumber(createdTransactionNumber);
        setSuccess(`Transaction #${createdTransactionNumber} created successfully!`);
        setHasUnsavedChanges(false);
        
        if (saveAndNext) {
          setTimeout(() => {
            handleNext();
          }, 500);
        }
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
      return true;
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save transaction');
      console.error('Error saving transaction:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const newDate = date || new Date().toISOString().split('T')[0];

    setFormData({
      brokerId: parseInt(localStorage.getItem('brokerId')),
      financialYearId: formData.financialYearId,
      sellerBrokerage: '',
      brokerage: 0,
      fromSeller: '',
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
    
    // Clear search states
    setSellerSearch('');
    setBuyerSearches({});
    setProductSearches({});
    setSellerProductSearches({});
    
    setSuccess('');
    setError('');
    setHasUnsavedChanges(false);

    // Set next transaction number
    if (nextTransactionNumber && typeof nextTransactionNumber === 'number') {
      setNextTransactionNumber(nextTransactionNumber + 1);
    }

    // Focus on seller input for next entry
    setTimeout(() => {
      sellerInputRef.current?.focus();
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sellerInputRef.current?.focus();
                  }
                }}
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
                  setSelectedDropdownIndex(0);
                  setActiveDropdownType('seller');
                }}
                onFocus={() => {
                  if (sellerSearch) {
                    setShowSellerDropdown(true);
                    setSelectedDropdownIndex(0);
                    setActiveDropdownType('seller');
                  }
                }}
                onBlur={() => setTimeout(() => {
                  setShowSellerDropdown(false);
                  setSelectedDropdownIndex(-1);
                  setActiveDropdownType(null);
                }, 200)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' && !showSellerDropdown) {
                    e.preventDefault();
                    brokerageInputRef.current?.focus();
                  }
                }}
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
                <div 
                  data-dropdown="seller"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                  {getFilteredSellers().map((seller, index) => (
                    <div
                      key={seller.id}
                      onClick={() => {
                        handleInputChange('fromSeller', seller.id);
                        // Auto-populate seller brokerage rate if available
                        if (seller.brokerageRate) {
                          handleInputChange('sellerBrokerage', seller.brokerageRate);
                        }
                        setSellerSearch(seller.firmName);
                        setShowSellerDropdown(false);
                        setSelectedDropdownIndex(-1);
                        setTimeout(() => sellerProductRefs.current[0]?.focus(), 100);
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${theme.borderLight}`,
                        color: theme.textPrimary,
                        fontSize: '14px',
                        backgroundColor: index === selectedDropdownIndex ? theme.hoverBg : 'transparent'
                      }}
                      onMouseEnter={() => setSelectedDropdownIndex(index)}
                    >
                      <div style={{ fontWeight: '500' }}>{seller.firmName}</div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {seller.city} {seller.brokerageRate && `• Brokerage: ${seller.brokerageRate}/-`}
                      </div>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    sellerProductRefs.current[0]?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    sellerInputRef.current?.focus();
                  }
                }}
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
                  <div style={{ flex: 2, position: 'relative' }}>
                    <input
                      ref={el => sellerProductRefs.current[index] = el}
                      type="text"
                      placeholder="Type to search product..."
                      value={sellerProductSearches[index] || ''}
                      onChange={(e) => {
                        setSellerProductSearches(prev => ({ ...prev, [index]: e.target.value }));
                        setShowSellerProductDropdowns(prev => ({ ...prev, [index]: true }));
                        setSelectedDropdownIndex(0);
                        setActiveDropdownType('sellerProduct');
                        setActiveRowIndex(index);
                      }}
                      onFocus={() => {
                        if (sellerProductSearches[index]) {
                          setShowSellerProductDropdowns(prev => ({ ...prev, [index]: true }));
                          setSelectedDropdownIndex(0);
                          setActiveDropdownType('sellerProduct');
                          setActiveRowIndex(index);
                        }
                      }}
                      onBlur={() => setTimeout(() => {
                        setShowSellerProductDropdowns(prev => ({ ...prev, [index]: false }));
                        setSelectedDropdownIndex(-1);
                        if (activeRowIndex === index) {
                          setActiveDropdownType(null);
                          setActiveRowIndex(null);
                        }
                      }, 200)}
                      onKeyDown={(e) => {
                        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && showSellerProductDropdowns[index]) {
                          // Let the global handler manage dropdown navigation
                          return;
                        }
                        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                          e.preventDefault();
                          brokerageInputRef.current?.focus();
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          sellerProductCostRefs.current[index]?.focus();
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          sellerProductCostRefs.current[index]?.focus();
                        } else if (e.key === 'ArrowDown' && !showSellerProductDropdowns[index]) {
                          e.preventDefault();
                          buyerInputRefs.current[0]?.focus();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: theme.inputBackground || theme.cardBackground,
                        color: theme.textPrimary
                      }}
                    />
                    {showSellerProductDropdowns[index] && getFilteredProducts(sellerProductSearches[index]).length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: theme.cardBackground,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1100,
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {getFilteredProducts(sellerProductSearches[index]).map((product, productIndex) => {
                          const [description, id] = Object.entries(product)[0];
                          return (
                            <div
                              key={id}
                              onClick={() => {
                                const newProducts = [...formData.sellerProducts];
                                newProducts[index].productId = id;
                                setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
                                setSellerProductSearches(prev => ({ ...prev, [index]: description }));
                                setShowSellerProductDropdowns(prev => ({ ...prev, [index]: false }));
                                setSelectedDropdownIndex(-1);
                                setTimeout(() => sellerProductCostRefs.current[index]?.focus(), 100);
                              }}
                              style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${theme.borderLight}`,
                                color: theme.textPrimary,
                                fontSize: '12px',
                                backgroundColor: productIndex === selectedDropdownIndex ? theme.hoverBg : 'transparent'
                              }}
                              onMouseEnter={() => setSelectedDropdownIndex(productIndex)}
                            >
                              {description}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <input
                    ref={el => sellerProductCostRefs.current[index] = el}
                    type="number"
                    placeholder="Cost"
                    value={product.productCost}
                    onChange={(e) => {
                      const newProducts = [...formData.sellerProducts];
                      newProducts[index].productCost = e.target.value;
                      setFormData(prev => ({ ...prev, sellerProducts: newProducts }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        sellerProductRefs.current[index]?.focus();
                      } else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        buyerInputRefs.current[0]?.focus();
                      }
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
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600',width: '10px'}}>S.No</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', minWidth: '200px' }}>Buyer Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '120px' }}>City</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', minWidth: '100px' }}>Product *</th>
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
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'absolute', minWidth: '419px' }}>
                      <input
                        ref={el => buyerInputRefs.current[index] = el}
                        type="text"
                        placeholder="Search buyer..."
                        value={buyerSearches[index] || ''}
                        onChange={(e) => {
                          setBuyerSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }));
                          setSelectedDropdownIndex(0);
                          setActiveDropdownType('buyer');
                          setActiveRowIndex(index);
                        }}
                        onFocus={() => {
                          if (buyerSearches[index]) {
                            setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }));
                            setSelectedDropdownIndex(0);
                            setActiveDropdownType('buyer');
                            setActiveRowIndex(index);
                          }
                        }}
                        onBlur={() => setTimeout(() => {
                          setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
                          setSelectedDropdownIndex(-1);
                          if (activeRowIndex === index) {
                            setActiveDropdownType(null);
                            setActiveRowIndex(null);
                          }
                        }, 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowRight' && !showBuyerDropdowns[index]) {
                            e.preventDefault();
                            // Check if product is auto-populated, if yes go to quantity, else go to product
                            if (formData.ledgerRecordDTOList[index].productId) {
                              quantityInputRefs.current[index]?.focus();
                            } else {
                              productInputRefs.current[index]?.focus();
                            }
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            if (index === 0) {
                              brokerageInputRef.current?.focus();
                            } else {
                              rateInputRefs.current[index - 1]?.focus();
                            }
                          } else if (e.key === 'ArrowUp' && index > 0) {
                            e.preventDefault();
                            buyerInputRefs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowDown' && index < formData.ledgerRecordDTOList.length - 1) {
                            e.preventDefault();
                            buyerInputRefs.current[index + 1]?.focus();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '16px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                      {showBuyerDropdowns[index] && getFilteredBuyers(buyerSearches[index]).length > 0 && (
                        <div 
                          data-dropdown={`buyer-${index}`}
                          style={{
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
                          {getFilteredBuyers(buyerSearches[index]).map((buyer, buyerIndex) => (
                            <div
                              key={buyer.id}
                              onClick={() => {
                                handleRecordChange(index, 'buyerName', buyer.firmName);
                                handleRecordChange(index, 'buyerCity', buyer.city);
                                // Auto-populate buyer brokerage rate if available
                                if (buyer.brokerageRate) {
                                  handleRecordChange(index, 'brokerage', buyer.brokerageRate);
                                }
                                setBuyerSearches(prev => ({ ...prev, [index]: buyer.firmName }));
                                setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
                                setSelectedDropdownIndex(-1);
                                
                                // Auto-populate product from seller products if available
                                if (formData.sellerProducts[0]?.productId) {
                                  handleRecordChange(index, 'productId', formData.sellerProducts[0].productId);
                                  // Auto-populate product cost from seller products
                                  if (formData.sellerProducts[0]?.productCost) {
                                    handleRecordChange(index, 'productCost', formData.sellerProducts[0].productCost);
                                  }
                                  const selectedProduct = products.find(p => Object.values(p)[0] === formData.sellerProducts[0].productId);
                                  if (selectedProduct) {
                                    const [description] = Object.entries(selectedProduct)[0];
                                    setProductSearches(prev => ({ ...prev, [index]: description }));
                                  }
                                  setTimeout(() => quantityInputRefs.current[index]?.focus(), 100);
                                } else {
                                  setTimeout(() => productInputRefs.current[index]?.focus(), 100);
                                }
                              }}
                              style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${theme.borderLight}`,
                                color: theme.textPrimary,
                                fontSize: '12px',
                                backgroundColor: buyerIndex === selectedDropdownIndex ? theme.hoverBg : 'transparent'
                              }}
                              onMouseEnter={() => setSelectedDropdownIndex(buyerIndex)}
                            >
                              <div style={{ fontWeight: '500' }}>{buyer.firmName}</div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                {buyer.city} {buyer.brokerageRate && `• Brokerage: ${buyer.brokerageRate}/-`}
                              </div>
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
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'absolute', minWidth: '210px' }}>
                      <input
                        ref={el => productInputRefs.current[index] = el}
                        type="text"
                        placeholder="Search product..."
                        value={productSearches[index] || ''}
                        onChange={(e) => {
                          setProductSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                          setSelectedDropdownIndex(0);
                          setActiveDropdownType('product');
                          setActiveRowIndex(index);
                        }}
                        onFocus={() => {
                          setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                          setSelectedDropdownIndex(0);
                          setActiveDropdownType('product');
                          setActiveRowIndex(index);
                        }}
                        onBlur={() => setTimeout(() => {
                          setShowProductDropdowns(prev => ({ ...prev, [index]: false }));
                          setSelectedDropdownIndex(-1);
                          if (activeRowIndex === index) {
                            setActiveDropdownType(null);
                            setActiveRowIndex(null);
                          }
                        }, 200)}
                        onKeyDown={(e) => {
                          if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && showProductDropdowns[index]) {
                            // Let the global handler manage dropdown navigation
                            return;
                          }
                          if (e.key === 'ArrowRight' && !showProductDropdowns[index]) {
                            e.preventDefault();
                            quantityInputRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            buyerInputRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowUp' && index > 0 && !showProductDropdowns[index]) {
                            e.preventDefault();
                            productInputRefs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowDown' && index < formData.ledgerRecordDTOList.length - 1 && !showProductDropdowns[index]) {
                            e.preventDefault();
                            productInputRefs.current[index + 1]?.focus();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '14px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                      {showProductDropdowns[index] && getFilteredProducts(productSearches[index]).length > 0 && (
                        <div 
                          data-dropdown={`product-${index}`}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: theme.cardBackground,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1100,
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
                                  setSelectedDropdownIndex(-1);
                                  setTimeout(() => quantityInputRefs.current[index]?.focus(), 100);
                                }}
                                style={{
                                  padding: '8px',
                                  cursor: 'pointer',
                                  borderBottom: `1px solid ${theme.borderLight}`,
                                  color: theme.textPrimary,
                                  fontSize: '12px',
                                  backgroundColor: productIndex === selectedDropdownIndex ? theme.hoverBg : 'transparent'
                                }}
                                onMouseEnter={() => setSelectedDropdownIndex(productIndex)}
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
                            e.preventDefault();
                            // If brokerage and rate are filled, add new record
                            if (record.brokerage && record.productCost) {
                              addNewRecord();
                            } else {
                              brokerageColumnRefs.current[index]?.focus();
                            }
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            brokerageColumnRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            productInputRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowUp' && index > 0) {
                            e.preventDefault();
                            quantityInputRefs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowDown' && index < formData.ledgerRecordDTOList.length - 1) {
                            e.preventDefault();
                            quantityInputRefs.current[index + 1]?.focus();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '14px',
                          backgroundColor: 'transparent',
                          color: theme.textPrimary,
                          outline: 'none'
                        }}
                      />
                    </td>

                    {/* Brokerage */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}` }}>
                      <input
                        ref={el => brokerageColumnRefs.current[index] = el}
                        type="number"
                        value={record.brokerage}
                        onChange={(e) => handleRecordChange(index, 'brokerage', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'ArrowRight') {
                            e.preventDefault();
                            rateInputRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            quantityInputRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowUp' && index > 0) {
                            e.preventDefault();
                            brokerageColumnRefs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowDown' && index < formData.ledgerRecordDTOList.length - 1) {
                            e.preventDefault();
                            brokerageColumnRefs.current[index + 1]?.focus();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '14px',
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
                            e.preventDefault();
                            if (index === formData.ledgerRecordDTOList.length - 1) {
                              addNewRecord();
                            } else {
                              buyerInputRefs.current[index + 1]?.focus();
                            }
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            brokerageColumnRefs.current[index]?.focus();
                          } else if (e.key === 'ArrowUp' && index > 0) {
                            e.preventDefault();
                            rateInputRefs.current[index - 1]?.focus();
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (index < formData.ledgerRecordDTOList.length - 1) {
                              rateInputRefs.current[index + 1]?.focus();
                            } else {
                              addNewRecord();
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: 'none',
                          fontSize: '14px',
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
            onClick={() => handleSave(false)}
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
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                backgroundColor: theme.success || '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '120px',
                opacity: saving ? 0.6 : 1
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
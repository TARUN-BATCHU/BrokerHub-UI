import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI, userAPI, productAPI, financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import FinancialYearSelector from '../components/FinancialYearSelector';
import '../styles/ledger.css';

const TransactionDetailEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { transactionNumber, financialYearId, brokerId, date } = location.state || {};
  
  console.log('TransactionDetailEdit props:', { transactionNumber, financialYearId, brokerId, date });
  
  const initialDate = date || new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    brokerId: parseInt(localStorage.getItem('brokerId')),
    financialYearId: financialYearId || null,
    sellerBrokerage: '',
    brokerage: 0,
    fromSeller: '',
    date: initialDate,
    sellerProducts: [{ productId: '', productCost: '' }],
    ledgerRecordDTOList: [
      {
        buyerName: '',
        productId: '',
        quantity: '',
        brokerage: '',
        productCost: ''
      }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sellerSearch, setSellerSearch] = useState('');
  const [buyerSearches, setBuyerSearches] = useState({});
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showBuyerDropdowns, setShowBuyerDropdowns] = useState({});
  const [productSearches, setProductSearches] = useState({});
  const [showProductDropdowns, setShowProductDropdowns] = useState({});
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const [activeDropdownType, setActiveDropdownType] = useState(null);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  useEffect(() => {
    console.log('TransactionDetailEdit component mounted, loading sellers/buyers/products...');
    loadAllData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Arrow keys for dropdown navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (showSellerDropdown || Object.values(showBuyerDropdowns).some(Boolean) || Object.values(showProductDropdowns).some(Boolean)) {
          e.preventDefault();
          const direction = e.key === 'ArrowDown' ? 1 : -1;
          
          if (showSellerDropdown) {
            const filtered = getFilteredSellers();
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
          } else if (activeDropdownType === 'buyer' && activeRowIndex !== null) {
            const filtered = getFilteredBuyers(buyerSearches[activeRowIndex]);
            const newIndex = Math.max(0, Math.min(filtered.length - 1, selectedDropdownIndex + direction));
            setSelectedDropdownIndex(newIndex);
          } else if (activeDropdownType === 'product' && activeRowIndex !== null) {
            const filtered = getFilteredProducts(productSearches[activeRowIndex]);
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
        
        if (showSellerDropdown) {
          e.preventDefault();
          const filtered = getFilteredSellers();
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const seller = filtered[selectedDropdownIndex];
            handleInputChange('fromSeller', seller.id);
            if (seller.brokerageRate) {
              handleInputChange('sellerBrokerage', seller.brokerageRate);
            }
            setSellerSearch(seller.firmName);
            setShowSellerDropdown(false);
            setSelectedDropdownIndex(-1);
          }
          return;
        }
        
        if (activeDropdownType === 'buyer' && activeRowIndex !== null && showBuyerDropdowns[activeRowIndex]) {
          e.preventDefault();
          const filtered = getFilteredBuyers(buyerSearches[activeRowIndex]);
          if (filtered.length > 0 && selectedDropdownIndex >= 0) {
            const buyer = filtered[selectedDropdownIndex];
            handleRecordChange(activeRowIndex, 'buyerName', buyer.firmName);
            if (buyer.brokerageRate) {
              handleRecordChange(activeRowIndex, 'brokerage', buyer.brokerageRate);
            }
            setBuyerSearches(prev => ({ ...prev, [activeRowIndex]: buyer.firmName }));
            setShowBuyerDropdowns(prev => ({ ...prev, [activeRowIndex]: false }));
            setSelectedDropdownIndex(-1);
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
          }
          return;
        }
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
        setSelectedDropdownIndex(-1);
        setActiveDropdownType(null);
        setActiveRowIndex(null);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSellerDropdown, showBuyerDropdowns, showProductDropdowns, selectedDropdownIndex, activeDropdownType, activeRowIndex, buyerSearches, productSearches, formData]);

  useEffect(() => {
    console.log('useEffect triggered with:', { transactionNumber, financialYearId });
    
    const loadCurrentFinancialYearAndFetchData = async () => {
      try {
        console.log('Loading current financial year...');
        const currentFY = await financialYearAPI.getCurrentFinancialYear();
        console.log('Current FY response:', currentFY);
        
        const fyId = financialYearId || currentFY;
        console.log('Final fyId:', fyId, 'financialYearId:', financialYearId, 'currentFY:', currentFY);
        
        if (fyId && transactionNumber) {
          console.log('Both fyId and transactionNumber available, fetching data...');
          setFormData(prev => ({ ...prev, financialYearId: fyId }));
          await fetchTransactionDataWithFY(transactionNumber, fyId);
        } else {
          console.log('Missing required data:', { fyId, transactionNumber });
        }
      } catch (error) {
        console.error('Error in loadCurrentFinancialYearAndFetchData:', error);
      }
    };
    
    if (transactionNumber) {
      loadCurrentFinancialYearAndFetchData();
    } else {
      console.log('No transactionNumber provided, skipping data fetch');
    }
  }, []);

  const fetchSellers = async () => {
    try {
      console.log('Fetching sellers from /BrokerHub/user/getFirmNamesIdsAndCities');
      const data = await userAPI.getFirmNamesIdsAndCities();
      console.log('Sellers data:', data);
      setSellers(data || []);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const fetchBuyers = async () => {
    try {
      console.log('Fetching buyers from /BrokerHub/user/getFirmNamesIdsAndCities');
      const data = await userAPI.getFirmNamesIdsAndCities();
      console.log('Buyers data:', data);
      setBuyers(data || []);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from /BrokerHub/Product/getProductNamesAndQualitiesAndQuantitesWithId');
      const data = await productAPI.getProductNamesAndQualitiesAndQuantitesWithId();
      console.log('Products data:', data);
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const loadAllData = async () => {
    setLoadingData(true);
    await Promise.all([
      fetchSellers(),
      fetchBuyers(), 
      fetchProducts()
    ]);
    setLoadingData(false);
  };

  const fetchTransactionDataWithFY = async (txnNumber, fyId) => {
    console.log('fetchTransactionDataWithFY called with:', { txnNumber, fyId });
    setLoading(true);
    setError('');
    try {
      const brokerIdToUse = brokerId || localStorage.getItem('brokerId');
      console.log('Calling getOptimizedLedgerDetailsByTransactionNumber API with:', {
        transactionNumber: txnNumber,
        brokerId: brokerIdToUse,
        financialYearId: fyId
      });
      
      const data = await ledgerDetailsAPI.getOptimizedLedgerDetailsByTransactionNumber(
        txnNumber, 
        brokerIdToUse,
        fyId
      );
      
      console.log('getOptimizedLedgerDetailsByTransactionNumber API Response:', data);
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          brokerId: parseInt(localStorage.getItem('brokerId')),
          financialYearId: prev.financialYearId,
          sellerBrokerage: data.fromSeller?.sellerBrokerage || 0,
          brokerage: data.transactionSummary?.totalBrokerageInTransaction || 0,
          fromSeller: data.fromSeller.userId,
          date: formatDateForDisplay(data.transactionDate),
          sellerProducts: data.records.reduce((unique, record) => {
            const exists = unique.find(p => p.productId === record.product.productId);
            if (!exists) {
              unique.push({
                productId: record.product.productId,
                productCost: record.productCost
              });
            }
            return unique;
          }, []),
          ledgerRecordDTOList: data.records.map(record => ({
            buyerName: record.toBuyer.firmName,
            productId: record.product.productId,
            quantity: record.quantity,
            brokerage: record.brokerage,
            productCost: record.productCost
          }))
        }));
        
        // Update search fields for display
        const seller = sellers.find(s => s.id === data.fromSeller.userId);
        if (seller) {
          setSellerSearch(seller.firmName);
        }
        
        // Update buyer and product search fields
        const newBuyerSearches = {};
        const newProductSearches = {};
        data.records.forEach((record, index) => {
          newBuyerSearches[index] = record.toBuyer.firmName;
          newProductSearches[index] = record.product.productName;
        });
        setBuyerSearches(newBuyerSearches);
        setProductSearches(newProductSearches);
      }
    } catch (err) {
      setError('Failed to fetch transaction data');
      console.error('Error fetching transaction data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSellerProductChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sellerProducts: prev.sellerProducts.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const addSellerProduct = () => {
    setFormData(prev => ({
      ...prev,
      sellerProducts: [...prev.sellerProducts, { productId: '', productCost: '' }]
    }));
  };

  const removeSellerProduct = (index) => {
    if (formData.sellerProducts.length > 1) {
      setFormData(prev => ({
        ...prev,
        sellerProducts: prev.sellerProducts.filter((_, i) => i !== index)
      }));
    }
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
          productId: '',
          quantity: '',
          brokerage: '',
          productCost: ''
        }
      ]
    }));
  };

  const removeRecord = (indexToRemove) => {
    console.log('Removing index:', indexToRemove, 'Total records:', formData.ledgerRecordDTOList.length);
    if (formData.ledgerRecordDTOList.length > 1) {
      setFormData(prev => ({
        ...prev,
        ledgerRecordDTOList: prev.ledgerRecordDTOList.filter((_, i) => i !== indexToRemove)
      }));
      
      // Reindex search states after removal
      setBuyerSearches(prev => {
        const newSearches = {};
        Object.keys(prev).forEach(key => {
          const idx = parseInt(key);
          if (idx < indexToRemove) {
            newSearches[idx] = prev[key];
          } else if (idx > indexToRemove) {
            newSearches[idx - 1] = prev[key];
          }
        });
        return newSearches;
      });
      
      setProductSearches(prev => {
        const newSearches = {};
        Object.keys(prev).forEach(key => {
          const idx = parseInt(key);
          if (idx < indexToRemove) {
            newSearches[idx] = prev[key];
          } else if (idx > indexToRemove) {
            newSearches[idx - 1] = prev[key];
          }
        });
        return newSearches;
      });
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
    console.log('FormData financialYearId:', formData.financialYearId, typeof formData.financialYearId);
    
    if (!formData.financialYearId) {
      console.log('No financial year set, proceeding without it (backend will handle)');
    }
    
    if (!formData.fromSeller) {
      setError('Please select a seller');
      return;
    }
    
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    
    const hasEmptyFields = formData.ledgerRecordDTOList.some(record => 
      !record.buyerName?.trim() || !record.productId || !record.quantity || !record.productCost
    );
    
    if (hasEmptyFields) {
      setError('Please fill all required fields in transaction records');
      console.log('Validation failed. Records:', formData.ledgerRecordDTOList);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData = {
        date: formatDateForAPI(formData.date),
        fromSeller: formData.fromSeller,
        brokerage: calculateTotalBrokerage(),
        ledgerRecordDTOList: formData.ledgerRecordDTOList
      };
      
      console.log('Updating transaction with updateLedgerDetailByTransactionNumber API:', {
        transactionNumber,
        brokerId: brokerId || localStorage.getItem('brokerId'),
        financialYearId: formData.financialYearId,
        data: updateData
      });
      
      await ledgerDetailsAPI.updateLedgerDetailByTransactionNumber(
        transactionNumber,
        brokerId || localStorage.getItem('brokerId'),
        formData.financialYearId,
        updateData
      );
      setSuccess('Transaction updated successfully!');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update transaction');
      console.error('Error updating transaction:', err);
    } finally {
      setSaving(false);
    }
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

  const getSelectedSellerInfo = () => {
    const selectedSeller = sellers.find(s => s.id === parseInt(formData.fromSeller));
    return selectedSeller ? `${selectedSeller.firmName} - ${selectedSeller.city}` : '';
  };

  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Convert DD-MM-YYYY to YYYY-MM-DD for API
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  if (loading || loadingData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        backgroundColor: theme.background,
        minHeight: '100vh',
        color: theme.textPrimary
      }}>
        <div>{loading ? 'Loading transaction data...' : 'Loading sellers, buyers, and products...'}</div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: theme.textSecondary }}>
          {loadingData && (
            <div>
              <div>Sellers: {sellers.length} loaded</div>
              <div>Buyers: {buyers.length} loaded</div>
              <div>Products: {products.length} loaded</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-detail-container" style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: theme.background,
      minHeight: '100vh',
      color: theme.textPrimary
    }}>
      <div className="header" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: theme.textPrimary, marginBottom: '10px' }}>
          Edit Transaction #{transactionNumber}
        </h1>
        <button
          onClick={() => navigate('/daily-ledger', { state: { date } })}
          style={{
            backgroundColor: theme.secondary || '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Daily Ledger
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="form-container" style={{ 
        backgroundColor: theme.cardBackground, 
        padding: '20px', 
        borderRadius: '8px', 
        border: `1px solid ${theme.border}` 
      }}>
        {/* Transaction Header */}
        <div className="transaction-header" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.textPrimary }}>
              Transaction Number:
            </label>
            <input
              type="text"
              value={transactionNumber}
              disabled
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: theme.inputBackground || theme.cardBackground,
                color: theme.textPrimary,
                opacity: 0.7
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.textPrimary }}>
              Date:
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              placeholder="DD-MM-YYYY"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: theme.inputBackground || theme.cardBackground,
                color: theme.textPrimary
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.textPrimary }}>
              Seller Brokerage (%):
            </label>
            <input
              type="text"
              value={formData.sellerBrokerage}
              onChange={(e) => handleInputChange('sellerBrokerage', e.target.value)}
              placeholder="e.g., 2%"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: theme.inputBackground || theme.cardBackground,
                color: theme.textPrimary
              }}
            />
          </div>
        </div>

        {/* Seller Section */}
        <div className="seller-section" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.textPrimary }}>
                From Seller - {getSelectedSellerInfo()}: <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search and select seller..."
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
                    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && showSellerDropdown) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground || theme.cardBackground,
                    color: theme.textPrimary
                  }}
                />
                {showSellerDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    boxShadow: theme.shadow,
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredSellers().map((seller, index) => (
                      <div
                        key={seller.id}
                        onClick={() => {
                          handleInputChange('fromSeller', seller.id);
                          if (seller.brokerageRate) {
                            handleInputChange('sellerBrokerage', seller.brokerageRate);
                          }
                          setSellerSearch(seller.firmName);
                          setShowSellerDropdown(false);
                          setSelectedDropdownIndex(-1);
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: `1px solid ${theme.borderLight}`,
                          color: theme.textPrimary,
                          backgroundColor: index === selectedDropdownIndex ? theme.hoverBg : 'transparent'
                        }}
                        onMouseEnter={() => setSelectedDropdownIndex(index)}
                      >
                        <div style={{ fontWeight: '500' }}>{seller.firmName}</div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {seller.city} {seller.brokerageRate && `• Brokerage: ${seller.brokerageRate}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.textPrimary }}>
                Seller Products:
              </label>
              {(formData.sellerProducts || []).map((product, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={product.productId}
                    onChange={(e) => handleSellerProductChange(index, 'productId', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: theme.inputBackground || theme.cardBackground,
                      color: theme.textPrimary
                    }}
                  >
                    <option value="">Select Product</option>
                    {(products || []).map((product) => {
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
                    onChange={(e) => handleSellerProductChange(index, 'productCost', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: theme.inputBackground || theme.cardBackground,
                      color: theme.textPrimary
                    }}
                  />
                  {formData.sellerProducts.length > 1 && (
                    <button
                      onClick={() => removeSellerProduct(index)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSellerProduct}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '8px'
                }}
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Buyers Section */}
        <div className="buyers-section">
          <h3 style={{ marginBottom: '20px', color: theme.textPrimary }}>Buyers</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: theme.background }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', fontWeight: '600', width: '10px' }}>S.No</th>
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
                  <tr key={`record-${index}-${record.buyerName || ''}-${record.productId || ''}`}>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary, textAlign: 'center' }}>
                      {index + 1}
                    </td>

                    {/* Buyer Name */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'absolute', minWidth: '315px' }}>
                      <input
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
                          if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && showBuyerDropdowns[index]) {
                            e.preventDefault();
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
                      {showBuyerDropdowns[index] && (
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
                          {getFilteredBuyers(buyerSearches[index]).map((buyer, buyerIndex) => (
                            <div
                              key={buyer.id}
                              onClick={() => {
                                handleRecordChange(index, 'buyerName', buyer.firmName);
                                if (buyer.brokerageRate) {
                                  handleRecordChange(index, 'brokerage', buyer.brokerageRate);
                                }
                                setBuyerSearches(prev => ({ ...prev, [index]: buyer.firmName }));
                                setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
                                setSelectedDropdownIndex(-1);
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
                                {buyer.city} {buyer.brokerageRate && `• Brokerage: ${buyer.brokerageRate}%`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* City */}
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textSecondary, fontSize: '14px' }}>
                      {buyers.find(b => b.firmName === record.buyerName)?.city || '-'}
                    </td>

                    {/* Product */}
                    <td style={{ padding: '4px', border: `1px solid ${theme.border}`, position: 'absolute', minWidth: '315px' }}>
                      <input
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
                          if (productSearches[index]) {
                            setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                            setSelectedDropdownIndex(0);
                            setActiveDropdownType('product');
                            setActiveRowIndex(index);
                          }
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
                          if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && showProductDropdowns[index]) {
                            e.preventDefault();
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
                      {showProductDropdowns[index] && (
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
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                      <input
                        type="number"
                        value={record.quantity}
                        onChange={(e) => handleRecordChange(index, 'quantity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: theme.inputBackground || theme.cardBackground,
                          color: theme.textPrimary
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                      <input
                        type="number"
                        value={record.brokerage}
                        onChange={(e) => handleRecordChange(index, 'brokerage', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: theme.inputBackground || theme.cardBackground,
                          color: theme.textPrimary
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                      <input
                        type="number"
                        value={record.productCost}
                        onChange={(e) => handleRecordChange(index, 'productCost', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: theme.inputBackground || theme.cardBackground,
                          color: theme.textPrimary
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {calculateRowTotal(record).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                      {formData.ledgerRecordDTOList.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeRecord(index);
                          }}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addNewRecord}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '15px'
            }}
          >
            + Add Record
          </button>

          {/* Summary */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: theme.background, 
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong style={{ color: theme.textPrimary }}>Total Buyer Brokerage: </strong>
                <span style={{ color: theme.primary }}>{calculateTotalBuyerBrokerage().toFixed(2)}</span>
              </div>
              <div>
                <strong style={{ color: theme.textPrimary }}>Total Bags: </strong>
                <span style={{ color: theme.success }}>{calculateTotalBags()}</span>
              </div>
              <div>
                <strong style={{ color: theme.textPrimary }}>Total Seller Brokerage: </strong>
                <span style={{ color: theme.info }}>{calculateTotalSellerBrokerage().toFixed(2)}</span>
              </div>
              <div>
                <strong style={{ color: theme.textPrimary }}>Total Brokerage: </strong>
                <span style={{ color: theme.warning }}>{calculateTotalBrokerage().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Updating...' : 'Update Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailEdit;
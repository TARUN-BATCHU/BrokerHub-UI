import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ledgerDetailsAPI, userAPI, productAPI, financialYearAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import FinancialYearSelector from '../components/FinancialYearSelector';
import '../styles/ledger.css';

const TransactionDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mode, transactionNumber, date } = location.state || {};
  
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
        productId: '',
        quantity: '',
        brokerage: '',
        productCost: ''
      }
    ]
  });
  
  const [transactionId, setTransactionId] = useState(transactionNumber || '');
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

  useEffect(() => {
    console.log('TransactionDetail component mounted, fetching data...');
    loadAllData();
    if (mode === 'edit' && transactionNumber) {
      fetchTransactionData(transactionNumber);
    }
  }, [mode, transactionNumber]);

  useEffect(() => {
    const loadCurrentFinancialYear = async () => {
      try {
        const currentFY = await financialYearAPI.getCurrentFinancialYear();
        if (currentFY && currentFY.financialYearId) {
          console.log('Setting financialYearId to:', currentFY.financialYearId);
          setFormData(prev => ({ ...prev, financialYearId: currentFY.financialYearId }));
        }
      } catch (error) {
        console.log('No current financial year set or error loading:', error);
      }
    };
    
    loadCurrentFinancialYear();
  }, []);

  useEffect(() => {
    console.log('Sellers state updated:', sellers);
  }, [sellers]);

  useEffect(() => {
    console.log('Buyers state updated:', buyers);
  }, [buyers]);

  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);

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

  const fetchTransactionData = async (txnNumber) => {
    setLoading(true);
    setError('');
    try {
      const data = await ledgerDetailsAPI.getOptimizedLedgerDetailsByTransactionNumber(
        txnNumber, 
        localStorage.getItem('brokerId'),
        formData.financialYearId
      );
      
      if (data) {
        setFormData({
          brokerId: parseInt(localStorage.getItem('brokerId')),
          sellerBrokerage: data.transactionSummary?.averageBrokeragePerBag || 0,
          fromSeller: data.fromSeller.userId,
          date: data.transactionDate,
          sellerProducts: [{ productId: data.records[0]?.product.productId || '', productCost: data.records[0]?.productCost || '' }],
          ledgerRecordDTOList: data.records.map(record => ({
            buyerName: record.toBuyer.firmName,
            productId: record.product.productId,
            quantity: record.quantity,
            brokerage: record.brokerage,
            productCost: record.productCost
          }))
        });
        // Update search fields for display
        const seller = sellers.find(s => s.id === data.fromSeller.userId);
        if (seller) {
          setSellerSearch(seller.firmName);
        }
        // Update buyer search fields
        const newBuyerSearches = {};
        data.records.forEach((record, index) => {
          newBuyerSearches[index] = record.toBuyer.firmName;
        });
        setBuyerSearches(newBuyerSearches);
      }
    } catch (err) {
      setError('Failed to fetch transaction data');
      console.error('Error fetching transaction data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionIdSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (transactionId) {
        fetchTransactionData(transactionId);
        setTransactionId(transactionId);
      }
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
        brokerage: calculateTotalBrokerage()
      };
      
      console.log('Saving transaction with data:', saveData);
      
      if (mode === 'create') {
        await ledgerDetailsAPI.createLedgerDetails(saveData);
        setSuccess('Transaction created successfully!');
      } else {
        await ledgerDetailsAPI.updateLedgerDetailByTransactionNumber(
          transactionNumber,
          localStorage.getItem('brokerId'),
          formData.financialYearId,
          saveData
        );
        setSuccess('Transaction updated successfully!');
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
      financialYearId: null,
      sellerBrokerage: '',
      brokerage: 0,
      fromSeller: '',
      date: newDate,
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
    setSuccess('');
    setError('');
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

  const getSelectedSellerCity = () => {
    const selectedSeller = sellers.find(s => s.id === parseInt(formData.fromSeller));
    return selectedSeller ? selectedSeller.city : '';
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
          {mode === 'create' ? 'Create New Transaction' : 'Transaction Details'}
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
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              onKeyPress={handleTransactionIdSubmit}
              placeholder="Enter transaction number and press Enter"
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
              Date:
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
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
                From Seller - {getSelectedSellerCity()}: <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search and select seller..."
                  value={sellerSearch}
                  onChange={(e) => {
                    setSellerSearch(e.target.value);
                    setShowSellerDropdown(true);
                  }}
                  onFocus={() => setShowSellerDropdown(true)}
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
                          ':hover': { backgroundColor: theme.hoverBg }
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
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>S.No</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Buyer Name *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Product *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Quantity *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Brokerage</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Product Cost *</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.ledgerRecordDTOList.map((record, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: theme.textPrimary }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search buyer..."
                        value={buyerSearches[index] || ''}
                        onChange={(e) => {
                          setBuyerSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }));
                        }}
                        onFocus={() => setShowBuyerDropdowns(prev => ({ ...prev, [index]: true }))}
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
                      {showBuyerDropdowns[index] && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '8px',
                          right: '8px',
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          boxShadow: theme.shadow,
                          zIndex: 10,
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}>
                          {getFilteredBuyers(buyerSearches[index]).map(buyer => (
                            <div
                              key={buyer.id}
                              onClick={() => {
                                handleRecordChange(index, 'buyerName', buyer.firmName);
                                setBuyerSearches(prev => ({ ...prev, [index]: buyer.firmName }));
                                setShowBuyerDropdowns(prev => ({ ...prev, [index]: false }));
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
                    <td style={{ padding: '8px', border: `1px solid ${theme.border}`, position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search product..."
                        value={productSearches[index] || ''}
                        onChange={(e) => {
                          setProductSearches(prev => ({ ...prev, [index]: e.target.value }));
                          setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                        }}
                        onFocus={() => setShowProductDropdowns(prev => ({ ...prev, [index]: true }))}
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
                      {showProductDropdowns[index] && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '8px',
                          right: '8px',
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          boxShadow: theme.shadow,
                          zIndex: 10,
                          maxHeight: '150px',
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
                          onClick={() => removeRecord(index)}
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
            {saving ? 'Saving...' : (mode === 'create' ? 'Save' : 'Update')}
          </button>

          {mode === 'create' && (
            <button
              onClick={handleNext}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
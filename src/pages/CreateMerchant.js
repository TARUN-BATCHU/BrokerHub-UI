import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import AddressModal from '../components/AddressModal';
import ThemeToggle from '../components/ThemeToggle';
import { userAPI, addressAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';
import { useTheme } from '../contexts/ThemeContext';
import './Auth.css';

const CreateMerchant = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
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
    byProduct: '',
    addressHint: '',
    collectionRote: '',
    selectedAddressId: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressesData = await addressAPI.getAllAddresses();
      if (Array.isArray(addressesData)) {
        setAddresses(addressesData);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
      setApiError('Failed to load addresses. Please try again.');
    }
  };

  const handleAddressSelect = (addressId) => {
    if (!addressId) {
      // Clear address fields when no address is selected
      setFormData(prev => ({
        ...prev,
        selectedAddressId: '',
        city: '',
        area: '',
        pincode: ''
      }));
      return;
    }

    const selectedAddress = addresses.find(addr => addr.addressId?.toString() === addressId.toString());
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        selectedAddressId: addressId,
        city: selectedAddress.city || '',
        area: selectedAddress.area || '',
        pincode: selectedAddress.pincode || ''
      }));
    }
  };

  const getFilteredAddresses = () => {
    if (!addressSearchTerm.trim()) {
      return addresses;
    }

    const searchTerm = addressSearchTerm.toLowerCase();
    return addresses.filter(address => {
      const city = address.city?.toLowerCase() || '';
      const area = address.area?.toLowerCase() || '';
      const pincode = address.pincode || '';
      return city.includes(searchTerm) || area.includes(searchTerm) || pincode.includes(searchTerm);
    });
  };

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

    if (!formData.gstNumber?.trim()) {
      newErrors.gstNumber = 'GST Number is required';
    }

    if (!formData.firmName?.trim()) {
      newErrors.firmName = 'Firm Name is required';
    }

    if (!formData.ownerName?.trim()) {
      newErrors.ownerName = 'Owner Name is required';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.brokerageRate) {
      newErrors.brokerageRate = 'Brokerage Rate is required';
    } else if (isNaN(formData.brokerageRate) || formData.brokerageRate <= 0) {
      newErrors.brokerageRate = 'Brokerage Rate must be a positive number';
    }

    if (!formData.selectedAddressId) {
      newErrors.address = 'Please select an address or create a new one';
    }

    // Optional field validations
    if (formData.pincode?.trim() && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phoneNumbers[0]?.trim() && !/^\d{10}$/.test(formData.phoneNumbers[0])) {
      newErrors.phoneNumber1 = 'Phone number must be 10 digits';
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

      // Remove selectedAddressId from the data sent to API
      const { selectedAddressId, ...merchantFormData } = formData;

      const merchantData = {
        ...merchantFormData,
        userType: formData.userType, // Ensure userType is included
        phoneNumbers,
        brokerageRate: parseFloat(formData.brokerageRate),
        addressHint: formData.addressHint?.trim() || '',
        collectionRote: formData.collectionRote?.trim() || ''
      };

      await userAPI.createUser(merchantData);

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

  const tabs = [
    { id: 0, name: 'Basic', icon: '👤' },
    { id: 1, name: 'Address', icon: '📍' },
    { id: 2, name: 'Contact', icon: '📞' },
    { id: 3, name: 'Business', icon: '💼' },
    { id: 4, name: 'Banking', icon: '🏦' }
  ];

  return (
    <div className="auth-container" data-theme={isDarkMode ? 'dark' : 'light'} style={{ padding: isMobile ? '5px' : '10px' }}>
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>

      <div className="auth-card enhanced-merchant-card" style={{ 
        maxWidth: isMobile ? '100%' : '900px',
        height: isMobile ? '95vh' : '85vh',
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
        boxShadow: theme.shadowModal,
        display: 'flex',
        flexDirection: 'column',
        margin: isMobile ? '0' : 'auto'
      }}>
        <div className="auth-header" style={{ marginBottom: '16px' }}>
          <div className="merchant-icon" style={{ width: '60px', height: '60px', marginBottom: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={theme.buttonPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke={theme.buttonPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke={theme.buttonPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: theme.textPrimary, fontSize: '24px', marginBottom: '4px' }}>Create New Merchant</h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Add a new miller or trader to your network</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation" style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          marginBottom: '16px',
          gap: '4px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${theme.buttonPrimary}` : '2px solid transparent',
                backgroundColor: activeTab === tab.id ? theme.background : 'transparent',
                color: activeTab === tab.id ? theme.buttonPrimary : theme.textSecondary,
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '4px 4px 0 0'
              }}
            >
              <div>{tab.icon}</div>
              <div>{tab.name}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form enhanced-form" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {apiError && (
            <div className="error-message" style={{
              backgroundColor: theme.errorBg,
              borderColor: theme.errorBorder,
              color: theme.error,
              marginBottom: '12px',
              padding: '8px 12px',
              fontSize: '13px'
            }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* Tab Content */}
          <div className="tab-content" style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>

            {/* Basic Information Tab */}
            {activeTab === 0 && (
              <div className="tab-panel">
                <div className="form-group">
                  <label className="form-label" style={{ color: theme.textPrimary }}>User Type *</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="form-input"
                    style={{
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                  >
                    <option value="TRADER">🏪 Trader</option>
                    <option value="MILLER">🏭 Miller</option>
                  </select>
                </div>

                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
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

                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
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
                    placeholder="email@example.com (Optional)"
                  />
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 1 && (
              <div className="tab-panel">
                <div className="form-group">
                  <label className="form-label" style={{ color: theme.textPrimary }}>Address Selection *</label>
                  <div className="address-selection-container" style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: theme.background
                  }}>
                    {/* Search Input */}
                    <div style={{ marginBottom: '16px' }}>
                      <div className="search-input-container" style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="🔍 Search addresses by city, area, or pincode..."
                          value={addressSearchTerm}
                          onChange={(e) => setAddressSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: theme.cardBackground,
                            color: theme.textPrimary
                          }}
                        />
                      </div>
                    </div>

                    {/* Address Dropdown */}
                    <div style={{ marginBottom: '16px' }}>
                      <select
                        value={formData.selectedAddressId}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: theme.cardBackground,
                          color: theme.textPrimary,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">📍 Select an existing address</option>
                        {getFilteredAddresses().map(address => (
                          <option key={address.addressId} value={address.addressId}>
                            📍 {address.city || 'N/A'} - {address.area || 'N/A'} ({address.pincode || 'N/A'})
                          </option>
                        ))}
                      </select>
                      {addressSearchTerm && getFilteredAddresses().length === 0 && (
                        <div style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: theme.textMuted,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          backgroundColor: theme.background,
                          borderRadius: '6px',
                          marginTop: '8px'
                        }}>
                          🔍 No addresses found matching "{addressSearchTerm}"
                        </div>
                      )}
                    </div>

                    <div className="divider" style={{ 
                      textAlign: 'center', 
                      margin: '16px 0',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: theme.border
                      }}></div>
                      <span style={{ 
                        backgroundColor: theme.background,
                        color: theme.textMuted, 
                        fontSize: '14px',
                        padding: '0 16px',
                        position: 'relative',
                        zIndex: 1
                      }}>OR</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: `1px solid ${theme.success}`,
                        borderRadius: '6px',
                        backgroundColor: theme.success,
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Create New Address
                    </button>

                    {formData.selectedAddressId && (
                      <div className="selected-address-display" style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: theme.successBg,
                        border: `1px solid ${theme.successBorder}`,
                        borderRadius: '6px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px'
                        }}>
                          ✓ <span style={{ color: theme.success, fontWeight: '500', fontSize: '13px' }}>Selected Address</span>
                        </div>
                        <div className="form-grid-2" style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                          gap: '12px'
                        }}>
                          <FormInput
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            disabled
                          />
                          <FormInput
                            label="Area"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            placeholder="Area/Locality"
                            disabled
                          />
                          <FormInput
                            label="Pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="123456"
                            disabled
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.address && (
                    <div style={{
                      color: theme.error,
                      fontSize: '13px',
                      marginTop: '6px'
                    }}>
                      ⚠️ {errors.address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 2 && (
              <div className="tab-panel">
                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
                  <FormInput
                    label="Primary Phone"
                    name="phoneNumber1"
                    value={formData.phoneNumbers[0]}
                    onChange={(e) => handlePhoneChange(0, e.target.value)}
                    error={errors.phoneNumber1}
                    placeholder="9876543210 (Optional)"
                  />
                  <FormInput
                    label="Secondary Phone"
                    name="phoneNumber2"
                    value={formData.phoneNumbers[1]}
                    onChange={(e) => handlePhoneChange(1, e.target.value)}
                    placeholder="9876543211 (Optional)"
                  />
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === 3 && (
              <div className="tab-panel">
                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
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
                  placeholder="e.g., Basmati Rice, Channa Dal (Optional)"
                />

                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
                  <FormInput
                    label="Address Hint"
                    name="addressHint"
                    value={formData.addressHint}
                    onChange={handleChange}
                    placeholder="e.g., Near Main Market, Behind Temple"
                  />
                  <FormInput
                    label="Collection Route"
                    name="collectionRote"
                    value={formData.collectionRote}
                    onChange={handleChange}
                    placeholder="e.g., Route A, Main Highway"
                  />
                </div>
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 4 && (
              <div className="tab-panel">
                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
                  <FormInput
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    error={errors.bankName}
                    placeholder="Bank Name (Optional)"
                  />
                  <FormInput
                    label="Branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    error={errors.branch}
                    placeholder="Branch Name (Optional)"
                  />
                </div>

                <div className="form-grid-2" style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
                  <FormInput
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    error={errors.accountNumber}
                    placeholder="Account Number (Optional)"
                  />
                  <FormInput
                    label="IFSC Code"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    error={errors.ifscCode}
                    placeholder="IFSC Code (Optional)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation and Submit */}
          <div className="form-navigation" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            padding: isMobile ? '12px 0' : '16px 0',
            borderTop: `1px solid ${theme.border}`,
            marginTop: isMobile ? '12px' : '16px',
            gap: isMobile ? '12px' : '0'
          }}>
            <div className="nav-buttons" style={{ 
              display: 'flex', 
              gap: isMobile ? '6px' : '8px',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              {activeTab > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  style={{
                    padding: isMobile ? '10px 12px' : '8px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: isMobile ? '12px' : '13px',
                    cursor: 'pointer',
                    flex: isMobile ? '1' : 'none'
                  }}
                >
                  ← Previous
                </button>
              )}
              {activeTab < tabs.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  style={{
                    padding: isMobile ? '10px 12px' : '8px 16px',
                    border: `1px solid ${theme.buttonPrimary}`,
                    borderRadius: '6px',
                    backgroundColor: theme.buttonPrimary,
                    color: 'white',
                    fontSize: isMobile ? '12px' : '13px',
                    cursor: 'pointer',
                    flex: isMobile ? '1' : 'none'
                  }}
                >
                  Next →
                </button>
              )}
            </div>

            <div className="action-buttons" style={{ 
              display: 'flex', 
              gap: isMobile ? '6px' : '8px',
              justifyContent: isMobile ? 'center' : 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: isMobile ? '10px 12px' : '8px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.buttonSecondary,
                  color: theme.textPrimary,
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                Cancel
              </button>

              <LoadingButton
                type="submit"
                loading={loading}
                style={{
                  padding: isMobile ? '10px 12px' : '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.buttonPrimary,
                  color: 'white',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: 'pointer',
                  minWidth: isMobile ? 'auto' : '120px',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                Create Merchant
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={() => {
          loadAddresses();
          setShowAddressModal(false);
        }}
      />
    </div>
  );
};

export default CreateMerchant;

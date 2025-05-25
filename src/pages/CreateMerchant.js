import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import AddressModal from '../components/AddressModal';
import { merchantAPI, addressAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';
import './Auth.css';

const CreateMerchant = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
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
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
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

    const selectedAddress = addresses.find(addr => addr.addressId.toString() === addressId.toString());
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        selectedAddressId: addressId,
        city: selectedAddress.city,
        area: selectedAddress.area,
        pincode: selectedAddress.pincode
      }));
    }
  };

  const getFilteredAddresses = () => {
    if (!addressSearchTerm.trim()) {
      return addresses;
    }

    const searchTerm = addressSearchTerm.toLowerCase();
    return addresses.filter(address =>
      address.city.toLowerCase().includes(searchTerm) ||
      address.area.toLowerCase().includes(searchTerm) ||
      address.pincode.includes(searchTerm)
    );
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

    if (!formData.gstNumber.trim()) {
      newErrors.gstNumber = 'GST Number is required';
    }

    if (!formData.firmName.trim()) {
      newErrors.firmName = 'Firm Name is required';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner Name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank Name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account Number is required';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }

    if (!formData.phoneNumbers[0].trim()) {
      newErrors.phoneNumber1 = 'Primary phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumbers[0])) {
      newErrors.phoneNumber1 = 'Phone number must be 10 digits';
    }

    if (!formData.brokerageRate) {
      newErrors.brokerageRate = 'Brokerage Rate is required';
    } else if (isNaN(formData.brokerageRate) || formData.brokerageRate <= 0) {
      newErrors.brokerageRate = 'Brokerage Rate must be a positive number';
    }

    if (!formData.byProduct.trim()) {
      newErrors.byProduct = 'Product is required';
    }

    if (!formData.selectedAddressId) {
      newErrors.address = 'Please select an address or create a new one';
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
        addressHint: formData.addressHint.trim(),
        collectionRote: formData.collectionRote.trim()
      };

      await merchantAPI.createUser(merchantData);

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

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1>Create New Merchant</h1>
          <p>Add a new miller or trader to your network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">User Type *</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-input"
            >
              <option value="TRADER">Trader</option>
              <option value="MILLER">Miller</option>
            </select>
          </div>

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
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
            gap: '16px'
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
              placeholder="email@example.com"
              required
            />
          </div>

          {/* Address Selection */}
          <div className="form-group">
            <label className="form-label">
              Address Selection *
            </label>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb'
            }}>
              {/* Search Input */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Search addresses by city, area, or pincode..."
                  value={addressSearchTerm}
                  onChange={(e) => setAddressSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
              </div>

              {/* Address Dropdown */}
              <div style={{ marginBottom: '12px' }}>
                <select
                  value={formData.selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select an existing address</option>
                  {getFilteredAddresses().map(address => (
                    <option key={address.addressId} value={address.addressId}>
                      {address.city} - {address.area} ({address.pincode})
                    </option>
                  ))}
                </select>
                {addressSearchTerm && getFilteredAddresses().length === 0 && (
                  <div style={{
                    padding: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    No addresses found matching "{addressSearchTerm}"
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>OR</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                ➕ Create New Address
              </button>
            </div>
            {errors.address && (
              <div style={{
                color: '#ef4444',
                fontSize: '14px',
                marginTop: '8px'
              }}>
                {errors.address}
              </div>
            )}
          </div>

          {/* Address Display (Read-only) */}
          {formData.selectedAddressId && (
            <div className="form-grid-2" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: '16px'
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
          )}

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            <FormInput
              label="Primary Phone"
              name="phoneNumber1"
              value={formData.phoneNumbers[0]}
              onChange={(e) => handlePhoneChange(0, e.target.value)}
              error={errors.phoneNumber1}
              placeholder="9876543210"
              required
            />

            <FormInput
              label="Secondary Phone"
              name="phoneNumber2"
              value={formData.phoneNumbers[1]}
              onChange={(e) => handlePhoneChange(1, e.target.value)}
              placeholder="9876543211 (Optional)"
            />
          </div>

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
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
            placeholder="e.g., Basmati Rice, Channa Dal"
            required
          />

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
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

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            <FormInput
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              error={errors.bankName}
              placeholder="Bank Name"
              required
            />

            <FormInput
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              error={errors.branch}
              placeholder="Branch Name"
              required
            />
          </div>

          <div className="form-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            <FormInput
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={errors.accountNumber}
              placeholder="Account Number"
              required
            />

            <FormInput
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              error={errors.ifscCode}
              placeholder="IFSC Code"
              required
            />
          </div>

          <div className="auth-actions step-actions form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>

            <LoadingButton
              type="submit"
              loading={loading}
              className="btn btn-primary"
            >
              Create Merchant
            </LoadingButton>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';

const CityMerchantsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [merchantsByCity, setMerchantsByCity] = useState({});
  const [loadingCities, setLoadingCities] = useState({});
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [expandedMerchants, setExpandedMerchants] = useState({});

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await userAPI.getAllCities();
      setCities(response || []);
    } catch (error) {
      console.error('Error loading cities:', error);
      alert('Failed to load cities: ' + (error.message || 'Server error'));
    }
  };

  const loadMerchantsByCity = async (city) => {
    setLoadingCities(prev => ({ ...prev, [city]: true }));
    try {
      const response = await userAPI.getMerchantsByCity(city);
      setMerchantsByCity(prev => ({ ...prev, [city]: response || [] }));
    } catch (error) {
      console.error('Error loading merchants:', error);
      alert('Failed to load merchants: ' + (error.message || 'Server error'));
      setMerchantsByCity(prev => ({ ...prev, [city]: [] }));
    } finally {
      setLoadingCities(prev => ({ ...prev, [city]: false }));
    }
  };

  const toggleCitySelection = (city) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(prev => prev.filter(c => c !== city));
      setMerchantsByCity(prev => {
        const updated = { ...prev };
        delete updated[city];
        return updated;
      });
    } else {
      setSelectedCities(prev => [...prev, city]);
      loadMerchantsByCity(city);
    }
  };

  const toggleMerchantExpand = (merchantId) => {
    setExpandedMerchants(prev => ({
      ...prev,
      [merchantId]: !prev[merchantId]
    }));
  };

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const getFilteredMerchantsForCity = (cityMerchants) => {
    return cityMerchants.filter(merchant =>
      merchant.firmName?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
      merchant.ownerName?.toLowerCase().includes(merchantSearchTerm.toLowerCase())
    );
  };

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      backgroundColor: theme.background,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: isMobile ? '16px' : '20px',
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`
      }}>
        <div>
          <h1 style={{
            margin: 0,
            color: theme.textPrimary,
            fontSize: '24px',
            fontWeight: '700'
          }}>
            🏙️ Merchants by City
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: theme.textSecondary,
            fontSize: '14px'
          }}>
            Browse merchants by their city location
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard?tab=allservices')}
          style={{
            padding: '8px 16px',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            backgroundColor: theme.cardBackground,
            color: theme.textPrimary,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Cities Section */}
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: theme.textPrimary,
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Available Cities ({filteredCities.length})
        </h3>

        <input
          type="text"
          placeholder="Search cities..."
          value={citySearchTerm}
          onChange={(e) => setCitySearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            backgroundColor: theme.inputBackground,
            color: theme.textPrimary,
            outline: 'none'
          }}
        />

        {/* Cities as Bubbles */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {filteredCities.length === 0 ? (
            <div style={{ padding: '20px', color: theme.textSecondary }}>
              No cities found
            </div>
          ) : (
            filteredCities.map((city, index) => (
              <button
                key={index}
                onClick={() => toggleCitySelection(city)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${selectedCities.includes(city) ? theme.primary : theme.border}`,
                  borderRadius: '20px',
                  backgroundColor: selectedCities.includes(city) ? theme.primary : theme.background,
                  color: selectedCities.includes(city) ? 'white' : theme.textPrimary,
                  fontSize: '14px',
                  fontWeight: selectedCities.includes(city) ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!selectedCities.includes(city)) {
                    e.currentTarget.style.backgroundColor = theme.hoverBgLight;
                    e.currentTarget.style.borderColor = theme.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedCities.includes(city)) {
                    e.currentTarget.style.backgroundColor = theme.background;
                    e.currentTarget.style.borderColor = theme.border;
                  }
                }}
              >
                📍 {city}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Merchants Section */}
      {selectedCities.length > 0 && (
        <div style={{
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            color: theme.textPrimary,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Merchants from {selectedCities.length} {selectedCities.length === 1 ? 'City' : 'Cities'}
          </h3>

          <input
            type="text"
            placeholder="Search merchants..."
            value={merchantSearchTerm}
            onChange={(e) => setMerchantSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              backgroundColor: theme.inputBackground,
              color: theme.textPrimary,
              outline: 'none'
            }}
          />

          {selectedCities.map(city => {
            const cityMerchants = merchantsByCity[city] || [];
            const filteredMerchants = getFilteredMerchantsForCity(cityMerchants);
            const isLoading = loadingCities[city];

            return (
              <div key={city} style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${theme.border}`
                }}>
                  <h4 style={{
                    margin: 0,
                    color: theme.textPrimary,
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    📍 {city}
                  </h4>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: theme.infoBg,
                    color: theme.info,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {filteredMerchants.length} {filteredMerchants.length === 1 ? 'Merchant' : 'Merchants'}
                  </span>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
                  gap: '12px' 
                }}>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
                      Loading merchants...
                    </div>
                  ) : filteredMerchants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
                      <h4 style={{ margin: '0 0 8px 0', color: theme.textPrimary }}>No Merchants Found</h4>
                      <p style={{ margin: 0 }}>
                        {merchantSearchTerm ? 'No merchants match your search.' : `No merchants available in ${city}.`}
                      </p>
                    </div>
                  ) : (
                    filteredMerchants.map((merchant) => (
                <div
                  key={merchant.userId}
                  style={{
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Compact View */}
                  <div
                    style={{
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleMerchantExpand(merchant.userId)}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        color: theme.textPrimary,
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {merchant.firmName}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: theme.infoBg,
                          color: theme.info,
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          ₹{merchant.totalPayableBrokerage?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '6px 12px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: theme.cardBackground,
                        color: theme.textPrimary,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {expandedMerchants[merchant.userId] ? '▲ Less' : '▼ More'}
                    </button>
                  </div>

                  {/* Expanded View */}
                  {expandedMerchants[merchant.userId] && (
                    <div style={{
                      padding: '0 16px 16px 16px',
                      borderTop: `1px solid ${theme.borderLight}`
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '12px',
                        marginTop: '12px'
                      }}>
                        {merchant.ownerName && (
                          <div>
                            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Owner Name</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>{merchant.ownerName}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>User Type</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>{merchant.userType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>GST Number</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>{merchant.gstNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Brokerage Rate</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>₹{merchant.brokerageRate}/bag</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Bags Sold</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.success }}>{merchant.totalBagsSold || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Bags Bought</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.primary }}>{merchant.totalBagsBought || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Payable Amount</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.error }}>₹{merchant.payableAmount?.toLocaleString() || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Receivable Amount</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.success }}>₹{merchant.receivableAmount?.toLocaleString() || 0}</div>
                        </div>
                        {merchant.email && (
                          <div>
                            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Email</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>{merchant.email}</div>
                          </div>
                        )}
                        {merchant.shopNumber && (
                          <div>
                            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '2px' }}>Shop Number</div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>{merchant.shopNumber}</div>
                          </div>
                        )}
                      </div>

                      {merchant.phoneNumbers && merchant.phoneNumbers.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px' }}>
                            Contact Numbers
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {merchant.phoneNumbers.map((phone, idx) => (
                              <a
                                key={idx}
                                href={`tel:${phone}`}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: theme.successBg,
                                  border: `1px solid ${theme.success}`,
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  color: theme.success,
                                  textDecoration: 'none'
                                }}
                              >
                                📞 {phone}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {merchant.address && (
                        <div style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          backgroundColor: theme.cardBackground,
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: theme.textSecondary
                        }}>
                          📍 {[
                            merchant.shopNumber,
                            merchant.addressHint,
                            merchant.address.area,
                            merchant.address.city,
                            merchant.address.pincode
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {merchant.collectionRote && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: theme.infoBg,
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: theme.info
                        }}>
                          🚚 Collection Route: {merchant.collectionRote}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CityMerchantsPage;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { brokerageAPI } from '../services/brokerageAPI';

const CityMerchantsBrokerage = () => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const { city } = location.state || {};
  
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cityAnalytics, setCityAnalytics] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    status: 'PARTIAL_PAID',
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    transactionReference: '',
    notes: ''
  });

  const brokerId = localStorage.getItem('brokerId') || '1';

  useEffect(() => {
    if (!city) {
      navigate('/brokerage-tracker');
      return;
    }
    fetchMerchants();
    fetchCityAnalytics();
  }, [city]);

  const fetchCityAnalytics = async () => {
    try {
      const response = await brokerageAPI.getCityAnalytics(brokerId, city.toUpperCase());
      setCityAnalytics(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching city analytics:', error);
    }
  };

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await brokerageAPI.getMerchants(brokerId);
      const data = response.data?.data || response.data || [];
      const merchantsArray = Array.isArray(data) ? data : [];
      const cityMerchants = merchantsArray.filter(m => {
        const merchantCity = (m.city || m.address?.city || '').toUpperCase();
        return merchantCity === city.toUpperCase();
      });
      setMerchants(cityMerchants);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      alert('Failed to fetch merchants: ' + (error.response?.data?.message || error.message));
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = (merchant) => {
    setSelectedMerchant(merchant);
    setPaymentForm({
      status: 'PARTIAL_PAID',
      paidAmount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      transactionReference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await brokerageAPI.updatePaymentStatus(brokerId, {
        merchantId: selectedMerchant.merchantId,
        ...paymentForm,
        paidAmount: parseFloat(paymentForm.paidAmount)
      });
      setShowPaymentModal(false);
      fetchMerchants();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return theme.success;
      case 'PARTIAL_PAID': return theme.warning;
      case 'PENDING': return theme.error;
      default: return theme.textSecondary;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '12px' : '20px', backgroundColor: theme.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/brokerage-tracker')} style={{
          padding: '8px 16px',
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          backgroundColor: theme.cardBackground,
          color: theme.textPrimary,
          cursor: 'pointer'
        }}>
          ← Back to Cities
        </button>
      </div>

      <div style={{
        backgroundColor: theme.cardBackground,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`
      }}>
        <h1 style={{ margin: '0 0 16px 0', color: theme.textPrimary, fontSize: '24px', fontWeight: '700' }}>
          🏙️ {city} - Merchants Brokerage
        </h1>
        
        {cityAnalytics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '16px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>Total Merchants</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.textPrimary }}>{cityAnalytics.totalMerchants}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>Total Bags</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.textPrimary }}>{cityAnalytics.totalBags}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>Total Brokerage</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.success }}>₹{cityAnalytics.totalActualBrokerage?.toFixed(2)}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>Pending</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.error }}>₹{cityAnalytics.totalBrokeragePending?.toFixed(2)}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>Business Growth</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: cityAnalytics.merchantsBusinessIncreased > cityAnalytics.merchantsBusinessDecreased ? theme.success : theme.error }}>
                {cityAnalytics.merchantsBusinessIncreased > cityAnalytics.merchantsBusinessDecreased ? '↑' : '↓'} {cityAnalytics.merchantsBusinessIncreased}/{cityAnalytics.merchantsBusinessDecreased}
              </div>
            </div>
          </div>
        )}
        
        <p style={{ margin: '0 0 24px 0', color: theme.textSecondary }}>
          Showing {merchants.length} merchants
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: theme.background }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Firm Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Owner</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Total Bags</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>Brokerage</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>Paid</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>Pending</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.merchantId}>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>{merchant.firmName}</td>
                  <td style={{ padding: '12px', borderBottom: `1px solid ${theme.borderLight}` }}>{merchant.ownerName}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>{merchant.totalBags}</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}` }}>₹{merchant.actualBrokerage?.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.success }}>₹{merchant.paidAmount?.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: `1px solid ${theme.borderLight}`, color: theme.error }}>₹{merchant.pendingAmount?.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: `${getStatusColor(merchant.status)}20`,
                      color: getStatusColor(merchant.status)
                    }}>
                      {merchant.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${theme.borderLight}` }}>
                    <button onClick={() => handleUpdatePayment(merchant)} style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: theme.buttonPrimary,
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Update Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.textPrimary }}>Update Payment - {selectedMerchant?.firmName}</h3>
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Status</label>
                <select value={paymentForm.status} onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})} style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary
                }}>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL_PAID">Partial Paid</option>
                  <option value="PAID">Fully Paid</option>
                </select>
              </div>

              {paymentForm.status !== 'PENDING' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Paid Amount</label>
                    <input type="number" step="0.01" value={paymentForm.paidAmount} onChange={(e) => setPaymentForm({...paymentForm, paidAmount: e.target.value})} required style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.cardBackground,
                      color: theme.textPrimary
                    }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Payment Date</label>
                    <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})} required style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.cardBackground,
                      color: theme.textPrimary
                    }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Payment Method</label>
                    <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.cardBackground,
                      color: theme.textPrimary
                    }}>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                      <option value="ONLINE">Online</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Transaction Reference</label>
                    <input type="text" value={paymentForm.transactionReference} onChange={(e) => setPaymentForm({...paymentForm, transactionReference: e.target.value})} style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.cardBackground,
                      color: theme.textPrimary
                    }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: theme.textPrimary }}>Notes</label>
                    <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} rows="3" style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.cardBackground,
                      color: theme.textPrimary,
                      resize: 'vertical'
                    }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} style={{
                  padding: '8px 16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.buttonPrimary,
                  color: 'white',
                  cursor: 'pointer'
                }}>
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityMerchantsBrokerage;

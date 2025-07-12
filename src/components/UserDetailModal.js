import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { brokerageAPI } from '../services/brokerageAPI';

const UserDetailModal = ({ user, onClose }) => {
  const { theme } = useTheme();
  const { details } = user;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const handleDownloadBill = async () => {
    try {
      await brokerageAPI.downloadUserBill(user.userId, '1');
    } catch (error) {
      console.error('Failed to download bill:', error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await brokerageAPI.downloadUserExcel(user.userId, '1');
    } catch (error) {
      console.error('Failed to download excel:', error);
    }
  };

  if (!details) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div style={{ background: theme.modalBackground, borderRadius: '24px', maxWidth: '1000px', width: '100%', maxHeight: '95vh', overflowY: 'auto', boxShadow: theme.shadowModal, border: `1px solid ${theme.border}` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${theme.buttonPrimary}, ${theme.buttonPrimaryHover})`, padding: '2rem', borderRadius: '24px 24px 0 0', color: 'white', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>✕</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', backdropFilter: 'blur(10px)' }}>{details.userBasicInfo?.firmName?.charAt(0) || 'U'}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{details.userBasicInfo?.firmName}</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.2rem' }}>{details.userBasicInfo?.ownerName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '1rem', opacity: 0.9 }}>📍 {details.userBasicInfo?.city}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Brokerage Summary Card */}
          <div style={{ background: `linear-gradient(135deg, #27ae60, #2ecc71)`, borderRadius: '20px', padding: '2rem', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', opacity: 0.9 }}>Total Brokerage Payable</h3>
            <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem' }}>{formatCurrency(details.brokerageSummary?.totalBrokeragePayable)}</div>
            <div style={{ opacity: 0.9 }}>Amount to be collected</div>
          </div>

          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: theme.cardBackground, padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: theme.textPrimary, marginBottom: '0.5rem' }}>{details.brokerageSummary?.totalBagsSold || 0}</div>
              <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Bags Sold</div>
            </div>
            <div style={{ background: theme.cardBackground, padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📥</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: theme.textPrimary, marginBottom: '0.5rem' }}>{details.brokerageSummary?.totalBagsBought || 0}</div>
              <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Bags Bought</div>
            </div>
            <div style={{ background: theme.cardBackground, padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#27ae60', marginBottom: '0.5rem' }}>{formatCurrency(details.brokerageSummary?.totalAmountEarned)}</div>
              <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Amount Earned</div>
            </div>
            <div style={{ background: theme.cardBackground, padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#e67e22', marginBottom: '0.5rem' }}>{formatCurrency(details.brokerageSummary?.totalAmountPaid)}</div>
              <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Amount Paid</div>
            </div>
          </div>

          {/* Products Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: theme.cardBackground, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Products Bought</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {details.brokerageSummary?.productsBought?.map((product, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: theme.hoverBg, borderRadius: '8px' }}>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{product.productName}</span>
                    <span style={{ background: '#3498db', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{product.totalBags} bags</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: theme.cardBackground, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📤 Products Sold</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {details.brokerageSummary?.productsSold?.map((product, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: theme.hoverBg, borderRadius: '8px' }}>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{product.productName}</span>
                    <span style={{ background: '#27ae60', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{product.totalBags} bags</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cities Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: theme.cardBackground, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📤 Sold To Cities</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {details.brokerageSummary?.citiesSoldTo?.map((city, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: theme.hoverBg, borderRadius: '8px' }}>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{city.city}</span>
                    <span style={{ background: '#e67e22', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{city.totalBags} bags</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: theme.cardBackground, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Bought From Cities</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {details.brokerageSummary?.citiesBoughtFrom?.map((city, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: theme.hoverBg, borderRadius: '8px' }}>
                    <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{city.city}</span>
                    <span style={{ background: '#9b59b6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{city.totalBags} bags</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div style={{ background: theme.cardBackground, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${theme.border}`, marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📋 Recent Transactions</h4>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '800px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 120px 100px 120px', gap: '1rem', padding: '1rem', background: theme.hoverBg, borderRadius: '8px', fontWeight: '700', color: theme.textPrimary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <div>Transaction #</div>
                  <div>Date</div>
                  <div>Counter Party</div>
                  <div>Product</div>
                  <div>Quantity</div>
                  <div>Brokerage</div>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {details.transactionDetails?.slice(0, 10).map((transaction, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 120px 100px 120px', gap: '1rem', padding: '1rem', borderBottom: `1px solid ${theme.border}`, fontSize: '0.9rem', color: theme.textPrimary }}>
                      <div style={{ fontWeight: '600' }}>{transaction.transactionNumber}</div>
                      <div>{new Date(transaction.transactionDate).toLocaleDateString()}</div>
                      <div style={{ fontWeight: '600' }}>{transaction.counterPartyFirmName}</div>
                      <div>{transaction.productName}</div>
                      <div>{transaction.quantity}</div>
                      <div style={{ fontWeight: '700', color: '#27ae60' }}>{formatCurrency(transaction.brokerage)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '2rem', borderTop: `1px solid ${theme.border}`, background: theme.hoverBg, borderRadius: '0 0 24px 24px' }}>
          <button onClick={handleDownloadBill} style={{ padding: '1rem 2rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', background: 'linear-gradient(135deg, #e67e22, #f39c12)', color: 'white', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)', transition: 'all 0.3s ease' }}>
            📄 Generate Bill
          </button>
          <button onClick={handleDownloadExcel} style={{ padding: '1rem 2rem', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)', transition: 'all 0.3s ease' }}>
            📊 Export Excel
          </button>
          <button onClick={onClose} style={{ padding: '1rem 2rem', border: `2px solid ${theme.border}`, borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', background: theme.cardBackground, color: theme.textPrimary, transition: 'all 0.3s ease' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
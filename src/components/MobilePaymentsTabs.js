import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MobilePaymentsTabs = ({
  activeTab,
  onTabChange,
  brokeragePayments,
  pendingPayments,
  receivablePayments,
  onViewDetails
}) => {
  const { theme } = useTheme();

  const renderBrokeragePayments = () => (
    <div className="payments-list">
      {brokeragePayments.map((payment) => (
        <div
          key={payment.id}
          className="payment-item"
          style={{
            padding: '12px',
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: theme.cardBackground
          }}
          onClick={() => onViewDetails(payment, 'brokerage')}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px' 
          }}>
            <div style={{ fontWeight: 600, color: theme.textPrimary }}>
              {payment.firmName}
            </div>
            <div style={{ 
              color: theme.textSecondary, 
              fontSize: '14px' 
            }}>
              {payment.totalBags} bags
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            <div>Rate: ₹{payment.rate}</div>
            <div>Brokerage: ₹{payment.brokerage}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPendingPayments = () => (
    <div className="payments-list">
      {pendingPayments.map((payment) => (
        <div
          key={payment.id}
          className="payment-item"
          style={{
            padding: '12px',
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: theme.cardBackground
          }}
          onClick={() => onViewDetails(payment, 'pending')}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '4px' 
          }}>
            <div style={{ fontWeight: 600, color: theme.textPrimary }}>
              {payment.buyerFirm}
            </div>
            <div style={{ 
              color: theme.error,
              fontWeight: 500
            }}>
              ₹{payment.pendingAmount}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReceivablePayments = () => (
    <div className="payments-list">
      {receivablePayments.map((payment) => (
        <div
          key={payment.id}
          className="payment-item"
          style={{
            padding: '12px',
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: theme.cardBackground
          }}
          onClick={() => onViewDetails(payment, 'receivable')}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '4px' 
          }}>
            <div style={{ fontWeight: 600, color: theme.textPrimary }}>
              {payment.sellerFirm}
            </div>
            <div style={{ 
              color: theme.success,
              fontWeight: 500
            }}>
              ₹{payment.receivableAmount}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="payment-tabs" style={{
        display: 'flex',
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <button
          className={`payment-tab ${activeTab === 'brokerage' ? 'active' : ''}`}
          onClick={() => onTabChange('brokerage')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'brokerage' ? theme.buttonPrimary : 'transparent',
            color: activeTab === 'brokerage' ? 'white' : theme.textPrimary,
            cursor: 'pointer'
          }}
        >
          Brokerage
        </button>
        <button
          className={`payment-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => onTabChange('pending')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'pending' ? theme.buttonPrimary : 'transparent',
            color: activeTab === 'pending' ? 'white' : theme.textPrimary,
            cursor: 'pointer'
          }}
        >
          Pending
        </button>
        <button
          className={`payment-tab ${activeTab === 'receivable' ? 'active' : ''}`}
          onClick={() => onTabChange('receivable')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'receivable' ? theme.buttonPrimary : 'transparent',
            color: activeTab === 'receivable' ? 'white' : theme.textPrimary,
            cursor: 'pointer'
          }}
        >
          Receivable
        </button>
      </div>

      <div style={{ marginTop: '16px' }}>
        {activeTab === 'brokerage' && renderBrokeragePayments()}
        {activeTab === 'pending' && renderPendingPayments()}
        {activeTab === 'receivable' && renderReceivablePayments()}
      </div>
    </div>
  );
};

export default MobilePaymentsTabs;
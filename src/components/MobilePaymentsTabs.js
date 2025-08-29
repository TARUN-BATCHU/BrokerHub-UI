import React from 'react';

const MobilePaymentsTabs = ({ 
  activeTab, 
  setActiveTab, 
  brokerageCount, 
  pendingCount, 
  receivableCount 
}) => {
  const tabs = [
    { id: 'brokerage', label: 'Brokerage', icon: '💰', count: brokerageCount },
    { id: 'pending', label: 'Pending', icon: '⏳', count: pendingCount },
    { id: 'receivable', label: 'Receivable', icon: '💸', count: receivableCount }
  ];

  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '16px',
      overflowX: 'auto'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            padding: '12px 8px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeTab === tab.id ? '#3498db' : 'transparent',
            color: activeTab === tab.id ? 'white' : '#6c757d',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '80px'
          }}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.count > 0 && (
            <span style={{
              fontSize: '10px',
              backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#dc3545',
              color: activeTab === tab.id ? 'white' : 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MobilePaymentsTabs;
import React, { useState } from 'react';
import { useBulkBills } from '../hooks/useBulkBills';
import SuccessToast from './SuccessToast';
import '../styles/BulkBillDownload.css';

const BulkBillDownload = ({ selectedUsers, financialYearId }) => {
  const { downloadBulkBills, isLoading, error, clearError } = useBulkBills();
  const [format, setFormat] = useState('excel');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDownload = async () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return;
    }

    const userIds = selectedUsers.map(user => user.userId);
    const result = await downloadBulkBills(userIds, financialYearId, format);
    
    if (result?.success) {
      setSuccessMessage(result.message);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '1.5rem'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>3</div>
        <h3 style={{ 
          margin: 0, 
          color: '#2d3748', 
          fontSize: '1.5rem', 
          fontWeight: '700'
        }}>Download Bulk Bills</h3>
      </div>
      
      {/* Format Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              value="excel"
              checked={format === 'excel'}
              onChange={(e) => setFormat(e.target.value)}
              disabled={isLoading}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Excel Format (.xlsx)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              value="html"
              checked={format === 'html'}
              onChange={(e) => setFormat(e.target.value)}
              disabled={isLoading}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>HTML Format (.html)</span>
          </label>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isLoading || !selectedUsers || selectedUsers.length === 0}
        title={!selectedUsers || selectedUsers.length === 0 ? 'Please select at least one user' : ''}
        style={{
          width: '100%',
          padding: '1.5rem',
          background: isLoading ? '#cbd5e0' : 'linear-gradient(135deg, #48bb78, #38a169)',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '1.2rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease',
          boxShadow: isLoading ? 'none' : '0 8px 25px rgba(72, 187, 120, 0.4)',
        }}
      >
        {isLoading ? (
          <>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '3px solid rgba(255,255,255,0.3)', 
              borderTop: '3px solid white', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            Generating {format.toUpperCase()} bills for {selectedUsers?.length || 0} users...
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download {selectedUsers?.length || 0} Bills ({format.toUpperCase()})
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#fed7d7', 
          color: '#c53030', 
          padding: '1rem', 
          borderRadius: '8px', 
          margin: '1rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#c53030'
            }}
          >×</button>
        </div>
      )}

      {/* Selected Users Info */}
      {selectedUsers && selectedUsers.length > 0 && (
        <div style={{ 
          background: '#f7fafc', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem' 
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
            Selected {selectedUsers.length} users for FY {financialYearId}
          </p>
          <div style={{ fontSize: '0.9rem', color: '#718096' }}>
            {selectedUsers.slice(0, 3).map(user => user.firmName).join(', ')}
            {selectedUsers.length > 3 && ` and ${selectedUsers.length - 3} more`}
          </div>
        </div>
      )}
      
      <SuccessToast 
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </div>
  );
};

export default BulkBillDownload;
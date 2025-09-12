import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useDocuments } from '../contexts/DocumentContext';
import { brokerageAPI } from '../services/brokerageAPI';

const DocumentStatusDashboard = () => {
  const { theme } = useTheme();
  const { documents, loading, fetchDocuments } = useDocuments();
  // Remove polling state

  useEffect(() => {
    // Fetch documents when component mounts
    fetchDocuments();
  }, []);

  // Remove polling useEffect

  const handleRefresh = () => {
    fetchDocuments();
    // No auto-polling - only single refresh
  };

  const handleDownload = async (documentId) => {
    try {
      await brokerageAPI.downloadDocument(documentId);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': { color: '#27ae60', icon: '✅' },
      'GENERATING': { color: '#f39c12', icon: '⏳' },
      'FAILED': { color: '#e74c3c', icon: '❌' },
      'PENDING': { color: '#95a5a6', icon: '⏸' }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.icon} {status}
      </span>
    );
  };

  const getDocumentTypeDisplay = (type) => {
    const typeMap = {
      'BULK_CITY_BILLS': 'City Bills',
      'BULK_USER_BILLS': 'User Bills',
      'BULK_CITY_EXCEL': 'City Excel',
      'BULK_USER_EXCEL': 'User Excel'
    };
    return typeMap[type] || type;
  };

  const getTargetDisplay = (doc) => {
    if (doc.city) {
      return `City: ${doc.city}`;
    }
    if (doc.userIds) {
      const userCount = doc.userIds.split(',').length;
      return `${userCount} users`;
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div style={{ background: theme.cardBackground, borderRadius: '20px', boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${theme.buttonPrimary}, ${theme.buttonPrimaryHover})`, color: 'white', padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>📋 Document Status</h3>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: theme.textSecondary }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading status...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.cardBackground, borderRadius: '20px', boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg, ${theme.buttonPrimary}, ${theme.buttonPrimaryHover})`, color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>📋</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Document Status</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Track bulk operation progress</p>
          </div>
        </div>
        <button onClick={handleRefresh} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', backdropFilter: 'blur(10px)' }}>
          🔄 Refresh
        </button>
      </div>
      
      {documents.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: theme.textSecondary }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <div style={{ fontSize: '1.1rem' }}>No document generation requests found.</div>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '1rem' }}>
          {documents.map(doc => (
            <div key={doc.documentId} style={{ background: theme.hoverBg, borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${theme.border}`, transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{doc.documentType.includes('BILLS') ? '📄' : '📊'}</div>
                    <div>
                      <div style={{ fontWeight: '700', color: theme.textPrimary, fontSize: '1.1rem' }}>
                        {getDocumentTypeDisplay(doc.documentType)}
                      </div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                        {getTargetDisplay(doc)}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                    Started: {formatTime(doc.createdAt)}
                    {doc.completedAt && (
                      <div>Completed: {formatTime(doc.completedAt)}</div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(doc.status)}
                  {doc.status === 'COMPLETED' && (
                    <button 
                      onClick={() => handleDownload(doc.documentId)}
                      style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)' }}
                      title="Download ZIP File"
                    >
                      📥 Download ZIP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentStatusDashboard;
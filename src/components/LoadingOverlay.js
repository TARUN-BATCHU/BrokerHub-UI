import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <LoadingSpinner size="30px" />
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>{message}</div>
    </div>
  );
};

export default LoadingOverlay;
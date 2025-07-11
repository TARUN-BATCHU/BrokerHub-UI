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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <LoadingSpinner size="80px" />
      <p style={{ color: 'white', marginTop: '20px' }}>{message}</p>
    </div>
  );
};

export default LoadingOverlay;
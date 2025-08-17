import React from 'react';
import loadingGif from '../utils/Animation - 1752033337485.gif';

const LoadingSpinner = ({ size = '80px', className = '' }) => {
  return (
    <div className={`loading-spinner ${className}`} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <img 
        src={loadingGif} 
        alt="Loading..." 
        style={{ width: size, height: size }}
      />
      <div style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.8 }}>Loading...</div>
    </div>
  );
};

export default LoadingSpinner;
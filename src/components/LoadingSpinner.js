import React from 'react';
import loadingGif from '../utils/Animation - 1752033337485.gif';

const LoadingSpinner = ({ size = '50px', className = '' }) => {
  return (
    <div className={`loading-spinner ${className}`} style={{ textAlign: 'center' }}>
      <img 
        src={loadingGif} 
        alt="Loading..." 
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default LoadingSpinner;
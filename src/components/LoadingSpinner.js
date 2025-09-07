import React from 'react';
import '../styles/animations.css';

const LoadingSpinner = ({ size = '20px', className = '' }) => {
  return (
    <div className={`simple-spinner ${className}`} style={{ width: size, height: size }}></div>
  );
};

export default LoadingSpinner;
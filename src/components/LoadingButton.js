import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  className = 'btn btn-primary',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="20px" />
          <span style={{ marginLeft: '8px' }}>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;

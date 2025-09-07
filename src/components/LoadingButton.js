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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LoadingSpinner size="16px" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;

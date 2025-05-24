import React from 'react';

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
          <span className="loading" style={{ marginRight: '8px' }}></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;

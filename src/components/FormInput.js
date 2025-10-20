import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="form-group">
      {label && (
        <label
          htmlFor={name}
          className="form-label"
          style={{ color: theme.textPrimary }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error ? 'error' : ''}`}
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: error ? '#ef4444' : theme.border,
            color: theme.textPrimary,
            paddingRight: isPassword ? '40px' : undefined
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textSecondary,
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormInput;

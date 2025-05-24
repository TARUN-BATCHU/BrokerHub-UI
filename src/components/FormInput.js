import React from 'react';
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
      <input
        type={type}
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
          color: theme.textPrimary
        }}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormInput;

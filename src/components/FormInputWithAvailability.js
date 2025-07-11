import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const FormInputWithAvailability = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  checkAvailability,
  availabilityDelay = 800,
  highlight = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [checking, setChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // null, 'available', 'taken'
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Debounced availability check
  const checkAvailabilityDebounced = useCallback(
    debounce(async (inputValue) => {
      if (!inputValue || !inputValue.trim() || !checkAvailability) {
        setAvailabilityStatus(null);
        setAvailabilityMessage('');
        setChecking(false);
        return;
      }
      
      // Don't check very short inputs
      if (inputValue.trim().length < 3) {
        setAvailabilityStatus(null);
        setAvailabilityMessage('');
        setChecking(false);
        return;
      }

      setChecking(true);
      setAvailabilityStatus(null);
      setAvailabilityMessage('');

      try {
        console.log(`Checking availability for ${label}:`, inputValue.trim());
        const exists = await checkAvailability(inputValue.trim());
        console.log(`Availability result for ${label}:`, exists);
        
        if (exists) {
          setAvailabilityStatus('taken');
          setAvailabilityMessage(`${label || 'This'} is already taken`);
        } else {
          setAvailabilityStatus('available');
          setAvailabilityMessage(`${label || 'This'} is available`);
        }
      } catch (error) {
        console.error('Availability check error:', error);
        setAvailabilityStatus('error');
        setAvailabilityMessage('Unable to check availability. Please try again.');
      } finally {
        setChecking(false);
      }
    }, availabilityDelay),
    [checkAvailability, label, availabilityDelay]
  );

  useEffect(() => {
    if (value && value.trim() && checkAvailability) {
      console.log(`Triggering availability check for ${label}:`, value);
      checkAvailabilityDebounced(value);
    } else {
      setAvailabilityStatus(null);
      setAvailabilityMessage('');
      setChecking(false);
    }
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      if (checkAvailabilityDebounced.cancel) {
        checkAvailabilityDebounced.cancel();
      }
    };
  }, [value, checkAvailabilityDebounced, checkAvailability, label]);

  const getInputBorderColor = () => {
    if (error) return '#ef4444';
    if (availabilityStatus === 'taken') return '#ef4444';
    if (availabilityStatus === 'available') return '#22c55e';
    if (highlight) return '#f59e0b';
    return theme.border;
  };

  const getInputBoxShadow = () => {
    if (error) return '0 0 0 3px rgba(239, 68, 68, 0.1)';
    if (availabilityStatus === 'taken') return '0 0 0 3px rgba(239, 68, 68, 0.1)';
    if (availabilityStatus === 'available') return '0 0 0 3px rgba(34, 197, 94, 0.1)';
    if (highlight) return '0 0 0 3px rgba(245, 158, 11, 0.1)';
    return '0 0 0 3px rgba(59, 130, 246, 0.1)';
  };

  const getStatusIcon = () => {
    if (checking) return '⏳';
    if (availabilityStatus === 'available') return '✅';
    if (availabilityStatus === 'taken') return '❌';
    return null;
  };

  const getStatusColor = () => {
    if (availabilityStatus === 'available') return '#22c55e';
    if (availabilityStatus === 'taken') return '#ef4444';
    return theme.textSecondary;
  };

  return (
    <div className={`form-group ${highlight ? 'highlighted-field' : ''}`}>
      {label && (
        <label
          htmlFor={name}
          className="form-label"
          style={{ 
            color: theme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
          {highlight && (
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Important
            </span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error || availabilityStatus === 'taken' ? 'error' : ''}`}
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: getInputBorderColor(),
            color: theme.textPrimary,
            paddingRight: checkAvailability ? '40px' : '16px',
            borderWidth: highlight ? '2px' : '2px',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = getInputBorderColor();
            e.target.style.boxShadow = getInputBoxShadow();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = getInputBorderColor();
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        
        {/* Status Icon */}
        {checkAvailability && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            pointerEvents: 'none'
          }}>
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Error Message (from parent component or validation) */}
      {error && <div className="form-error">{error}</div>}
      
      {/* Availability Message (only show if no error from parent) */}
      {!error && availabilityMessage && (
        <div 
          className={availabilityStatus === 'available' ? 'availability-available' : availabilityStatus === 'taken' ? 'availability-taken' : ''}
          style={{
            color: getStatusColor(),
            fontSize: '12px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {getStatusIcon()} {availabilityMessage}
        </div>
      )}
      
      {/* Checking Message (only show if no error from parent) */}
      {!error && checking && (
        <div 
          className="availability-checking"
          style={{
            color: theme.textSecondary,
            fontSize: '12px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⏳ Checking availability...
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  const executedFunction = function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  executedFunction.cancel = function() {
    clearTimeout(timeout);
  };
  
  return executedFunction;
}

export default FormInputWithAvailability;
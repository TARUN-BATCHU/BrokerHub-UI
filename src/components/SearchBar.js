import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  const { theme } = useTheme();

  return (
    <div className="search-bar" style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Search Icon */}
      <svg
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          color: theme.textSecondary
        }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Search Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 36px',
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          backgroundColor: theme.inputBackground,
          color: theme.textPrimary,
          fontSize: '14px'
        }}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: theme.textSecondary
          }}
        >
          <svg
            style={{
              width: '16px',
              height: '16px'
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        backgroundColor: theme.cardBackground,
        color: theme.textPrimary,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: theme.shadow,
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.hoverBg;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = theme.shadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.cardBackground;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.shadow;
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span style={{ fontSize: '16px' }}>
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span style={{ fontWeight: '500' }}>
        {isDarkMode ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default ThemeToggle;

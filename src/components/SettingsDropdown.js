import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';

const SettingsDropdown = ({ isDashboard = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: isMobile ? '12px' : '16px',
        right: isMobile ? '12px' : '16px',
        zIndex: 1001,
        display: 'flex',
        gap: isMobile ? '6px' : '8px',
        alignItems: 'center'
      }}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          background: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: theme.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '36px' : '40px',
          height: isMobile ? '36px' : '40px',
          fontSize: '16px',
          color: theme.textPrimary,
          transition: 'all 0.2s ease'
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
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* Settings Button */}
      <button
        onClick={toggleDropdown}
        style={{
          background: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: theme.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '36px' : '40px',
          height: isMobile ? '36px' : '40px',
          fontSize: '16px',
          color: theme.textPrimary,
          transition: 'all 0.2s ease'
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
        title="Settings"
      >
        ⚙️
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            background: theme.modalBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            boxShadow: theme.shadowModal,
            minWidth: '220px',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Settings Content */}
          <div style={{ padding: '8px 0' }}>

            {/* Conditional Navigation Links */}
            {!isDashboard && (
              <>
                <Link
                  to="/login"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🔑 Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📝 Signup
                </Link>

                <Link
                  to="/forgot-password"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🔒 Forgot Password
                </Link>

                <Link
                  to="/create-password"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🆕 Create Password
                </Link>

                <Link
                  to="/verify-account"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✅ Verify Account
                </Link>

                <Link
                  to="/change-password"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🔐 Change Password
                </Link>

                <Link
                  to="/dashboard"
                  onClick={closeDropdown}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: theme.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBgLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  📊 Dashboard
                </Link>
              </>
            )}

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: theme.borderLight,
              margin: '8px 0'
            }} />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                color: theme.error,
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.errorBg}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;

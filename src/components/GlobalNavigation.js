import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { authAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';

const GlobalNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/daily-ledger', label: 'Daily Ledger', icon: '📊' },
    { path: '/calendar-view', label: 'Calendar View', icon: '📅' },
    { path: '/financial-years', label: 'Financial Years', icon: '📈' },
    { path: '/create-merchant', label: 'Create Merchant', icon: '👥' },
  ];

  const isCurrentPage = (path) => location.pathname === path;

  return (
    <div ref={dropdownRef} style={{
      position: 'fixed',
      top: isMobile ? '12px' : '16px',
      right: isMobile ? '12px' : '16px',
      zIndex: 1001,
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
      <button onClick={toggleTheme} style={{
        background: theme.cardBackground,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        boxShadow: theme.shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        fontSize: '14px',
        color: theme.textPrimary,
        transition: 'all 0.2s ease'
      }} title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <button onClick={() => setIsOpen(!isOpen)} style={{
        background: theme.cardBackground,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        boxShadow: theme.shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        fontSize: '14px',
        color: theme.textPrimary,
        transition: 'all 0.2s ease'
      }} title="Navigation & Settings">
        ⚙️
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          background: theme.modalBackground,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          boxShadow: theme.shadowModal,
          minWidth: '240px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px 0' }}>
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: theme.textSecondary,
              borderBottom: `1px solid ${theme.border}`,
              marginBottom: '4px'
            }}>NAVIGATION</div>
            
            {navigationItems.map(item => (
              <button key={item.path} onClick={() => navigateTo(item.path)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: isCurrentPage(item.path) ? theme.hoverBg : 'transparent',
                color: isCurrentPage(item.path) ? theme.buttonPrimary : theme.textPrimary,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${theme.border}`, padding: '8px 0' }}>
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: theme.textSecondary,
              marginBottom: '4px'
            }}>SETTINGS</div>
            
            <button onClick={() => navigateTo('/change-password')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              color: theme.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              <span>🔑</span>
              <span>Change Password</span>
            </button>

            <button onClick={handleLogout} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              color: theme.error,
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalNavigation;

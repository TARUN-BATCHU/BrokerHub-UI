import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import useResponsive from '../hooks/useResponsive';

const GlobalNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { isMobile } = useResponsive();

  // Hide navigation on auth pages
  const authPages = ['/login', '/signup', '/forgot-password', '/verify-otp', '/create-password', '/verify-account'];
  const shouldHideNavigation = authPages.includes(location.pathname);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setExpandedSection(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
    setExpandedSection(null);
  };

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const navigationSections = [
    {
      label: 'Dashboard',
      icon: '🏠',
      items: [
        { path: '/dashboard', label: 'Main Dashboard', icon: '🏠' },
        { path: '/brokerage', label: 'Brokerage Dashboard', icon: '💰' }
      ]
    },
    {
      label: 'Profile Settings',
      icon: '👤',
      items: [
        { path: '/change-password', label: 'Change Password', icon: '🔑' },
        { path: '/update-profile', label: 'Update Profile', icon: '✏️' }
      ]
    },
    {
      label: 'Brokerage',
      icon: '💰',
      items: [
        { path: '/brokerage/users', label: 'User Brokerage', icon: '👥' },
        { path: '/brokerage/bulk', label: 'Bulk Operations', icon: '🚀' }
      ]
    },
    {
      label: 'Ledger',
      icon: '📋',
      items: [
        { path: '/ledger-management', label: 'Ledger Management', icon: '📋' },
        { path: '/daily-ledger', label: 'Daily Ledger', icon: '📊' },
        { path: '/calendar-view', label: 'Calendar View', icon: '📅' }
      ]
    },
    {
      label: 'Payments',
      icon: '💳',
      items: [
        { path: '/payments', label: 'Payment Management', icon: '💳' }
      ]
    },
    {
      label: 'Entities',
      icon: '🏢',
      items: [
        { path: '/products', label: 'Products', icon: '🌾' },
        { path: '/merchants', label: 'Merchants', icon: '🏢' },
        { path: '/financial-years', label: 'Financial Years', icon: '📈' },
        { path: '/create-merchant', label: 'Create Merchant', icon: '👤' },
        { path: '/contacts', label: 'Phone Directory', icon: '📇' }
      ]
    },
    {
      label: 'About',
      icon: 'ℹ️',
      items: [
        { path: '/about', label: 'About BrokerHub', icon: 'ℹ️' }
      ]
    }
  ];

  const isCurrentPage = (path) => location.pathname === path;
  const isCurrentSection = (section) => section.items.some(item => location.pathname === item.path);

  if (shouldHideNavigation) {
    return null;
  }

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
          minWidth: '280px',
          overflow: 'visible'
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
            
            {navigationSections.map((section, index) => (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: isCurrentSection(section) || expandedSection === index ? theme.hoverBg : 'transparent',
                    color: isCurrentSection(section) ? theme.buttonPrimary : theme.textPrimary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (expandedSection !== index && !isCurrentSection(section)) {
                      e.target.style.backgroundColor = theme.hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (expandedSection !== index && !isCurrentSection(section)) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                  <span style={{ 
                    fontSize: '10px', 
                    opacity: 0.6,
                    transform: expandedSection === index ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>▶</span>
                </button>
                
                {expandedSection === index && (
                  <div style={{
                    background: theme.hoverBg,
                    borderRadius: '4px',
                    margin: '4px 8px',
                    overflow: 'hidden'
                  }}>
                    {section.items.map(item => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '10px 16px',
                          border: 'none',
                          backgroundColor: isCurrentPage(item.path) ? theme.buttonPrimary : 'transparent',
                          color: isCurrentPage(item.path) ? 'white' : theme.textPrimary,
                          fontSize: '13px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentPage(item.path)) {
                            e.target.style.backgroundColor = theme.border;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentPage(item.path)) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${theme.border}`, padding: '8px 0' }}>
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
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.hoverBg}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
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
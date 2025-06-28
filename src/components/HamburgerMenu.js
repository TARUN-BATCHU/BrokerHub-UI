import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const HamburgerMenu = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Merchants', path: '/merchants' },
    { label: 'Payments', path: '/payments' },
    { label: 'Daily Ledger', path: '/daily-ledger' },
    { label: 'Calendar View', path: '/calendar-view' },
    { label: 'Ledger Summary', path: '/ledger-summary' },
    { label: 'Create Transaction', path: '/create-transaction' },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (path) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <div className="mobile-only" style={{ position: 'relative', zIndex: 1000 }}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        style={{
          background: 'none',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'flex-start'
        }}
      >
        <span style={{
          width: '24px',
          height: '2px',
          backgroundColor: theme.textPrimary,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
        }} />
        <span style={{
          width: '24px',
          height: '2px',
          backgroundColor: theme.textPrimary,
          opacity: isOpen ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }} />
        <span style={{
          width: '24px',
          height: '2px',
          backgroundColor: theme.textPrimary,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
        }} />
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
          onClick={toggleMenu}
        />
      )}

      {/* Menu Content */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        backgroundColor: theme.cardBackground,
        boxShadow: theme.shadow,
        transition: 'left 0.3s ease',
        zIndex: 999,
        overflowY: 'auto'
      }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{
            color: theme.textPrimary,
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: 600
          }}>
            Menu
          </h3>
          <nav>
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.path)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: theme.textPrimary,
                  textAlign: 'left',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  ':hover': {
                    backgroundColor: theme.backgroundHover
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
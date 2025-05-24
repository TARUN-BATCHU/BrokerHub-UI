import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {/* Settings Button */}
      <button
        onClick={toggleDropdown}
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f9fafb';
          e.target.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.borderColor = '#e5e7eb';
        }}
      >
        <span style={{ fontSize: '16px' }}>⚙️</span>
        Settings
        <span style={{ 
          fontSize: '12px', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            minWidth: '200px',
            overflow: 'hidden'
          }}
        >
          {/* Navigation Links */}
          <div style={{ padding: '8px 0' }}>
            <Link
              to="/login"
              onClick={closeDropdown}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
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
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📊 Dashboard
            </Link>

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              margin: '8px 0'
            }} />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;

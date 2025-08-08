import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const UpdateProfile = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    console.log('Profile update:', formData);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      padding: 'var(--space-8)',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div className="modern-card" style={{
          background: theme.cardBackground,
          border: `1px solid ${theme.border}`,
          padding: 'var(--space-8)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: theme.textPrimary
              }}>Update Profile</h1>
              <p style={{
                margin: 0,
                color: theme.textSecondary,
                fontSize: '1rem'
              }}>Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gap: 'var(--space-6)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="modern-input"
                  style={{
                    width: '100%',
                    background: theme.inputBackground,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modern-input"
                  style={{
                    width: '100%',
                    background: theme.inputBackground,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary
                  }}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="modern-input"
                  style={{
                    width: '100%',
                    background: theme.inputBackground,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary
                  }}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="modern-input"
                  style={{
                    width: '100%',
                    background: theme.inputBackground,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary
                  }}
                  placeholder="Enter your city"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }}>
                <button
                  type="submit"
                  className="modern-button modern-button-primary"
                  style={{
                    flex: 1,
                    padding: 'var(--space-4) var(--space-6)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="modern-button modern-button-outline"
                  style={{
                    padding: 'var(--space-4) var(--space-6)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import { userAPI } from '../services/api';

const BrokerageTracker = () => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCities();
      setCities(response.data || response);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (city) => {
    navigate('/city-merchants-brokerage', { state: { city } });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading cities...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '12px' : '20px',
      backgroundColor: theme.background,
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          color: theme.textPrimary,
          fontSize: '24px',
          fontWeight: '700'
        }}>
          📊 Brokerage Tracker
        </h1>
        <p style={{
          margin: '0 0 24px 0',
          color: theme.textSecondary,
          fontSize: '14px'
        }}>
          Select a city to view merchant brokerage details
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {cities.map((city, index) => (
            <div
              key={index}
              onClick={() => handleCityClick(city)}
              style={{
                backgroundColor: theme.background,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.shadowHover;
                e.currentTarget.style.borderColor = theme.buttonPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <div style={{ fontSize: '32px' }}>🏙️</div>
              <div>
                <h3 style={{
                  margin: 0,
                  color: theme.textPrimary,
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {city}
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  color: theme.textSecondary,
                  fontSize: '12px'
                }}>
                  Click to view merchants
                </p>
              </div>
            </div>
          ))}
        </div>

        {cities.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: theme.textSecondary
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏙️</div>
            <p>No cities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerageTracker;

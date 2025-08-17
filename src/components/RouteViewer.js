import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { addressAPI } from '../services/api';
import LoadingButton from './LoadingButton';

const RouteViewer = ({
  source,
  destination,
  onCitySelect
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeCities, setRouteCities] = useState([]);

  useEffect(() => {
    if (source && destination) {
      loadRouteCities();
    }
  }, [source, destination]);

  const loadRouteCities = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await addressAPI.getCitiesAlongRoute(source, destination);
      setRouteCities(response.route);
    } catch (err) {
      setError(err.message || 'Failed to load route cities');
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = async (city) => {
    setLoading(true);
    setError('');
    try {
      const merchants = await addressAPI.getMerchantsInCity(city);
      onCitySelect && onCitySelect(city, merchants);
    } catch (err) {
      setError(err.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: theme.textSecondary
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        color: theme.error,
        backgroundColor: theme.errorBg,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.cardBackground,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: theme.shadowCard
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        color: theme.textPrimary,
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Route Cities
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {routeCities.map((cityInfo, index) => (
          <div
            key={cityInfo.city}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleCityClick(cityInfo.city)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.backgroundHover;
              e.currentTarget.style.borderColor = theme.borderHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            <div>
              <div style={{
                color: theme.textPrimary,
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                {cityInfo.city}
                {cityInfo.isSourceCity && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: theme.success,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Source
                  </span>
                )}
                {cityInfo.isDestinationCity && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: theme.error,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Destination
                  </span>
                )}
              </div>
              <div style={{
                color: theme.textSecondary,
                fontSize: '14px'
              }}>
                {cityInfo.merchantCount} merchants
              </div>
            </div>

            {index < routeCities.length - 1 && (
              <div style={{
                color: theme.textSecondary,
                fontSize: '20px'
              }}>
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteViewer;
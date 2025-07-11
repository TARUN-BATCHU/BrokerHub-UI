import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import RouteViewer from '../components/RouteViewer';
import CityMerchants from '../components/CityMerchants';
import FormInput from '../components/FormInput';

const RouteExplorer = () => {
  const { theme } = useTheme();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityMerchants, setSelectedCityMerchants] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!source || !destination) {
      setError('Please enter both source and destination cities');
      return;
    }

    if (source === destination) {
      setError('Source and destination cities must be different');
      return;
    }

    // Reset selected city when changing route
    setSelectedCity(null);
    setSelectedCityMerchants(null);
  };

  const handleCitySelect = (city, merchants) => {
    setSelectedCity(city);
    setSelectedCityMerchants(merchants);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: theme.shadowCard,
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 24px 0',
          color: theme.textPrimary,
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Route Explorer
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <FormInput
              label="Source City"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source city"
              required
            />
            <FormInput
              label="Destination City"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination city"
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: theme.errorBg,
              color: theme.error,
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: theme.buttonPrimary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Explore Route
          </button>
        </form>
      </div>

      {source && destination && (
        <RouteViewer
          source={source}
          destination={destination}
          onCitySelect={handleCitySelect}
        />
      )}

      {selectedCity && selectedCityMerchants && (
        <CityMerchants
          city={selectedCity}
          merchants={selectedCityMerchants}
          onClose={() => {
            setSelectedCity(null);
            setSelectedCityMerchants(null);
          }}
        />
      )}
    </div>
  );
};

export default RouteExplorer;